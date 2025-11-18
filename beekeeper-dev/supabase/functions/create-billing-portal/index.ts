// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/create-billing-portal/index.ts
// Server-side redirect to Stripe Customer Portal (handles GET + POST)

import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// Env (support both naming styles you’ve used)
const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PUBLIC_SUPABASE_URL");
const SERVICE_ROLE =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error("Missing Supabase env (SUPABASE_URL or SERVICE_ROLE key)");
}

const supaSrv = createClient(SUPABASE_URL, SERVICE_ROLE);

Deno.serve(async (req: Request) => {
  try {
    // Preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Parse URL + query
    const url = new URL(req.url);
    const search = url.searchParams;

    // Accept either Authorization: Bearer <token> or ?token=<token>
    const auth = req.headers.get("Authorization") ?? "";
    const token =
      (auth.startsWith("Bearer ") ? auth.slice(7).trim() : "") ||
      (search.get("token") ?? "");

    if (!token) {
      return new Response("Unauthorized (missing token)", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Verify the user represented by the JWT
    const {
      data: { user },
      error: userErr,
    } = await supaSrv.auth.getUser(token);

    if (userErr || !user) {
      return new Response("Unauthorized (invalid token)", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Build a safe return URL:
    // - If ?return_url is absolute (starts with http), use it as-is.
    // - If it’s a path like "/settings", make it relative to this function’s origin.
    // - Otherwise default to "/settings".
    const provided = search.get("return_url")?.trim() || "";
    const isAbsolute = /^https?:\/\//i.test(provided);
    const isPath = provided.startsWith("/");
    const returnUrl = isAbsolute
      ? provided
      : isPath
      ? `${url.origin}${provided}`
      : `${url.origin}/settings`;

    // Lazy import Stripe
    if (!STRIPE_SECRET_KEY) {
      return new Response("Missing STRIPE_SECRET_KEY", {
        status: 500,
        headers: corsHeaders,
      });
    }
    const { default: Stripe } = await import("npm:stripe@12.18.0");
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

    // Fetch profile -> get or create Stripe customer id
    const { data: profile, error: pErr } = await supaSrv
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (pErr) {
      console.error("profiles select error:", pErr);
      return new Response("profiles error", { status: 500, headers: corsHeaders });
    }

    let customerId = (profile?.stripe_customer_id as string | null) ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Best-effort save
      const { error: upErr } = await supaSrv
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (upErr) console.error("profiles update error:", upErr);
    }

    // Create the portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: returnUrl,
    });

    // If the user hit this URL in the browser (GET), redirect them straight to Stripe
    if (req.method === "GET") {
      return new Response(null, {
        status: 302,
        headers: {
          Location: session.url,
          "Referrer-Policy": "no-referrer",
          ...corsHeaders,
        },
      });
    }

    // If called via fetch/XHR (POST), return JSON { url }
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("create-billing-portal error:", message);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});
