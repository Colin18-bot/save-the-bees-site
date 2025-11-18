// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/cancel-subscription/index.ts
// Cancels the caller's Stripe subscription (immediately or at period end).
// - GET/POST supported. Use POST with JSON { immediate: true } to cancel now.
// - Optional echo mode: ?echo=1 to test CORS/auth flow without Stripe.
// - Requires Authorization: Bearer <user_jwt>

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const jsonHeaders = { "Content-Type": "application/json", ...corsHeaders };

  try {
    const url = new URL(req.url);
    const echo = url.searchParams.get("echo") === "1";

    // Body (POST) – tolerate empty/malformed JSON
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const immediate = !!body?.immediate;

    // Required envs (with fallbacks)
    const SUPABASE_URL =
      Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PUBLIC_SUPABASE_URL") ?? "";
    const SERVICE_ROLE =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY") ??
      "";
    const STRIPE_SECRET_KEY =
      Deno.env.get("STRIPE_SECRET_KEY") ??
      Deno.env.get("STRIPE_API_KEY") ??
      "";

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase service envs" }),
        { status: 500, headers: jsonHeaders },
      );
    }

    // Auth: Authorization: Bearer <token>
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const supaSrv = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userData, error: userErr } = await supaSrv.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    // Echo mode for local testing (no Stripe needed)
    if (echo) {
      return new Response(
        JSON.stringify({ ok: true, mode: "echo", immediate, user_id: user.id }),
        { headers: jsonHeaders },
      );
    }

    // If no Stripe key set, acknowledge request but do nothing
    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          ok: true,
          note: "Skipping Stripe (no STRIPE_SECRET_KEY set)",
          immediate,
        }),
        { headers: jsonHeaders },
      );
    }

    // Lazy Stripe import only when needed
    const { default: Stripe } = await import("npm:stripe@12.18.0");
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

    // Look up Stripe customer
    const { data: profile, error: pErr } = await supaSrv
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (pErr) {
      return new Response(JSON.stringify({ error: pErr.message }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    const customerId = profile?.stripe_customer_id as string | null;
    if (!customerId) {
      return new Response(
        JSON.stringify({ ok: true, note: "No Stripe customer" }),
        { headers: jsonHeaders },
      );
    }

    // Find active subscription
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const sub = subs.data[0];
    if (!sub) {
      return new Response(
        JSON.stringify({ ok: true, note: "No active subscription" }),
        { headers: jsonHeaders },
      );
    }

    // Cancel
    if (immediate) {
      await stripe.subscriptions.cancel(sub.id);
    } else {
      await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        immediate,
        subscription_id: sub.id,
        action: immediate
          ? "cancelled_immediately"
          : "set_cancel_at_period_end",
      }),
      { headers: jsonHeaders },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
