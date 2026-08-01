// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/create-checkout/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

/** CORS that echoes the caller's origin (so localhost works) */
function corsFor(req: Request) {
  const origin = req.headers.get("origin");
  const allowOrigin = origin && origin !== "null" ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    Vary: "Origin",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

const ok = (req: Request, msg = "ok", status = 200) =>
  new Response(msg, { status, headers: { ...corsFor(req) } });

const json = (req: Request, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsFor(req) },
  });

const bad = (req: Request, msg: string, status = 400) =>
  new Response(msg, { status, headers: { ...corsFor(req) } });

// ---- env ----
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PUBLIC_SUPABASE_URL");
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
if (!supabaseUrl || !serviceRole) throw new Error("Missing Supabase service creds");

// Use the environment-specific Premium price first.
const DEFAULT_PRICE_ID =
  Deno.env.get("STRIPE_PRICE_ID_PREMIUM") ??
  Deno.env.get("STRIPE_PRICE_ID_LIVE") ??
  Deno.env.get("PRICE_ID_PREMIUM");

// Optional override for the app base URL (e.g. https://beezknees-members.netlify.app)
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "";

const supaSrv = createClient(supabaseUrl, serviceRole);

Deno.serve(async (req: Request) => {
  // Preflight → 204 (no body)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...corsFor(req) } });
  }
  if (req.method === "GET") return ok(req, "create-checkout alive");
  if (req.method !== "POST") return bad(req, "Method not allowed", 405);

  try {
    // Auth (client must send Authorization: Bearer <access_token>)
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) return bad(req, "Unauthorized (no bearer token)", 401);

    const { data: userResp, error: userErr } = await supaSrv.auth.getUser(token);
    if (userErr || !userResp?.user?.id) {
      return bad(req, "Unauthorized (invalid token)", 401);
    }
    const userId = userResp.user.id;
    const userEmail = userResp.user.email ?? undefined;

    // Body
    const bodyUnknown = await req.json().catch(() => ({}) as unknown);
    const body =
      typeof bodyUnknown === "object" && bodyUnknown !== null
        ? (bodyUnknown as Record<string, unknown>)
        : ({} as Record<string, unknown>);

    const success_path = (body["success_path"] as string | undefined) ?? undefined;
    const cancel_path = (body["cancel_path"] as string | undefined) ?? undefined;
    const plan = ((body["plan"] as string | undefined) ?? "premium").trim();
    const user_id = (body["user_id"] as string | undefined) ?? userId;

    const chosenPrice = DEFAULT_PRICE_ID;
    if (!chosenPrice) return bad(req, "Missing price_id", 400);
    if (!user_id || !plan) return bad(req, "Missing user_id or plan", 400);

    // URLs
    const callerOrigin = req.headers.get("origin") || new URL(req.url).origin;
    // If APP_BASE_URL is set, always use that; otherwise trust the caller's origin
    const appBase = APP_BASE_URL || callerOrigin;

    const ensureSlash = (p?: string) => (p && p.trim() ? (p.startsWith("/") ? p : `/${p}`) : "");

    const successUrl = `${appBase}${ensureSlash(success_path) || "/settings?upgrade=success"}`;
    const cancelUrl = `${appBase}${ensureSlash(cancel_path) || "/pricing?upgrade=cancelled"}`;

    // Lazy import Stripe so OPTIONS/GET never fail
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") ?? Deno.env.get("STRIPE_API_KEY");
    if (!stripeSecret) return bad(req, "Missing Stripe secret key", 500);
    const { default: Stripe } = await import("npm:stripe@12.18.0");
    const stripe = new Stripe(stripeSecret, { apiVersion: "2022-11-15" });

    // Load or create customer
    const { data: profile, error: profileError } = await supaSrv
      .from("profiles")
      .select(
        "stripe_customer_id, email, subscription_level, subscription_status, stripe_subscription_id"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    let storedCustomerId = (profile?.stripe_customer_id as string | null) || null;

    const ensureCustomer = async (): Promise<string> => {
      if (storedCustomerId) {
        return storedCustomerId;
      }

      const customer = await stripe.customers.create({
        email: profile?.email || userEmail,
        metadata: {
          user_id: userId,
        },
      });

      storedCustomerId = customer.id;

      const { error: customerUpdateError } = await supaSrv
        .from("profiles")
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (customerUpdateError) {
        throw customerUpdateError;
      }

      return customer.id;
    };

    let customerId = await ensureCustomer();

    /*
     * Confirm that the stored customer exists in the current Stripe
     * environment before checking for existing subscriptions.
     */
    try {
      await stripe.customers.retrieve(customerId);
    } catch (error: unknown) {
      const code = (error as { code?: string } | null)?.code;

      const message = (error as { message?: string } | null)?.message;

      const isMissingCustomer =
        code === "resource_missing" && Boolean(message && /No such customer/i.test(message));

      if (!isMissingCustomer) {
        throw error;
      }

      const { error: clearCustomerError } = await supaSrv
        .from("profiles")
        .update({
          stripe_customer_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (clearCustomerError) {
        throw clearCustomerError;
      }

      storedCustomerId = null;
      customerId = await ensureCustomer();

      console.log(`✅ Replaced invalid Stripe customer for user ${userId} with ${customerId}.`);
    }

    /*
     * Prevent duplicate Premium subscriptions.
     *
     * Check Stripe directly rather than relying only on the profile table,
     * because Stripe is the authoritative source and the profile could be
     * temporarily stale.
     */
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });

    const blockingStatuses = new Set(["active", "trialing", "past_due", "unpaid", "incomplete"]);

    const existingPremiumSubscription = existingSubscriptions.data.find((subscription) =>
      blockingStatuses.has(subscription.status)
    );

    if (existingPremiumSubscription) {
      console.log(
        `ℹ️ Duplicate Premium checkout blocked for user ${userId}; existing subscription ${existingPremiumSubscription.id} has status ${existingPremiumSubscription.status}.`
      );

      return bad(
        req,
        existingPremiumSubscription.cancel_at_period_end
          ? "Your Premium subscription is already active and is scheduled to end at the end of the current billing period. Please use Manage Subscription instead."
          : "You already have an active Premium subscription. Please use Manage Subscription instead.",
        409
      );
    }

    const createSession = async (custId: string) => {
      return await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: custId,
        line_items: [{ price: chosenPrice, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: { user_id: userId, plan },
        allow_promotion_codes: true,
      });
    };

    // First attempt
    try {
      const s1 = await createSession(customerId);
      if (!s1.url) return bad(req, "Stripe did not return a session URL", 500);
      return json(req, { url: s1.url });
    } catch (e: unknown) {
      // If the stored customer is invalid (e.g. from live mode), recreate and retry once
      const code = (e as { code?: string } | null)?.code;
      const message = (e as { message?: string } | null)?.message;
      const param = (e as { param?: string } | null)?.param;

      const looksLikeMissingCustomer =
        code === "resource_missing" &&
        ((message && /No such customer/i.test(message)) || param === "customer");

      if (!looksLikeMissingCustomer) {
        console.error("create-checkout error (first attempt):", e);
        return bad(req, `Error: ${message || String(e)}`, 500);
      }

      // Clear & recreate
      const { error: clearCustomerError } = await supaSrv
        .from("profiles")
        .update({
          stripe_customer_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (clearCustomerError) {
        throw clearCustomerError;
      }

      storedCustomerId = null;
      customerId = await ensureCustomer();
      const s2 = await createSession(customerId);
      if (!s2.url) return bad(req, "Stripe did not return a session URL", 500);
      return json(req, { url: s2.url });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("create-checkout error:", msg);
    return bad(req, `Error: ${msg}`, 500);
  }
});
