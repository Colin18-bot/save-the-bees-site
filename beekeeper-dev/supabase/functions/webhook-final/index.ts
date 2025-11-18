// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/webhook-final/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
// Use a pinned npm build; faster & reliable in Deno functions
import Stripe from "npm:stripe@12.18.0";

serve(async (req: Request) => {
  // 1) Webhooks must be POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const stripeSignature = req.headers.get("stripe-signature");
  if (!stripeSignature) {
    console.error("❌ Missing Stripe signature header");
    return new Response("Bad Request", { status: 400 });
  }

  // Read raw body exactly once (required for signature verification)
  const rawBody = await req.text();

  // --- Env vars (support both naming styles you've used) ---
  const STRIPE_SECRET_KEY =
    Deno.env.get("STRIPE_SECRET_KEY") ?? Deno.env.get("STRIPE_API_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const SUPABASE_URL =
    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PUBLIC_SUPABASE_URL");
  const SERVICE_ROLE_KEY =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing env vars", {
      hasStripeSecret: !!STRIPE_SECRET_KEY,
      hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SERVICE_ROLE_KEY,
    });
    return new Response("Missing environment variables", { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const toIso = (ts?: number | null) => (ts ? new Date(ts * 1000).toISOString() : null);

  // 2) Verify webhook signature
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      stripeSignature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("⚠️  Webhook signature verification failed:", msg);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  console.log(`🔔 Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId = (session.customer as string) || null;
        const subscriptionId = (session.subscription as string) || null;

        // We set these in create-checkout; fall back if missing.
        const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
        const plan = session.metadata?.plan ?? "premium";

        console.log("checkout.session.completed", {
          userId,
          customerId,
          subscriptionId,
          plan,
        });

        const updateData = {
          subscription_level: plan,
          subscription_status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        };

        if (userId) {
          // 1) Try update by user_id
          const { data: updated, error: updErr } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("user_id", userId)
            .select("user_id");

          if (updErr) throw updErr;

          if (!updated || updated.length === 0) {
            // 2) No row matched -> insert a fresh profile
            const { error: insErr } = await supabase.from("profiles").insert({
              user_id: userId,
              email: session.customer_details?.email ?? null,
              ...updateData,
            });
            if (insErr) throw insErr;
            console.log(`✅ Inserted profile for user_id=${userId}`);
          } else {
            console.log(`✅ Updated profile by user_id=${userId}`);
          }
        } else if (customerId) {
          // Fallback: update by Stripe customer id
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("stripe_customer_id", customerId);
          if (error) throw error;
          console.log(`✅ Updated profile by stripe_customer_id=${customerId}`);
        } else {
          console.log("ℹ️ No user/customer id found; skipping profile update.");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.cancel_at_period_end ? "cancels_at_period_end" : sub.status;
        const level =
          sub.status === "active" || sub.status === "trialing" ? "premium" : "free";

        console.log("customer.subscription.*", {
          subscriptionId: sub.id,
          customer: sub.customer,
          status,
          level,
        });

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_level: level,
            subscription_status: status,
            stripe_subscription_id: sub.id,
            current_period_end: toIso(sub.current_period_end),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", (sub.customer as string) || "");
        if (error) throw error;

        console.log(`✅ Subscription ${sub.id} status -> ${status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log("customer.subscription.deleted", {
          subscriptionId: sub.id,
          customer: sub.customer,
        });

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_level: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", (sub.customer as string) || "");
        if (error) throw error;

        console.log(`✅ Subscription ${sub.id} canceled`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`💰 Invoice paid for customer ${invoice.customer}`);
        break;
      }

      default: {
        // Not relevant for your profile sync; acknowledge cleanly
        console.log(`ℹ️ No handler for event type: ${event.type}`);
        return new Response(null, { status: 204 });
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ Handler error:", msg);
    return new Response(msg, { status: 500 });
  }
});
