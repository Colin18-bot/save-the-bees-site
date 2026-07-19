// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/webhook-final/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import Stripe from "npm:stripe@12.18.0";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const stripeSignature = req.headers.get("stripe-signature");

  if (!stripeSignature) {
    console.error("❌ Missing Stripe signature header");
    return new Response("Bad Request", { status: 400 });
  }

  // The raw request body is required for Stripe signature verification.
  const rawBody = await req.text();

  const STRIPE_SECRET_KEY =
    Deno.env.get("STRIPE_SECRET_KEY") ??
    Deno.env.get("STRIPE_API_KEY");

  const STRIPE_WEBHOOK_SECRET =
    Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const SUPABASE_URL =
    Deno.env.get("SUPABASE_URL") ??
    Deno.env.get("PUBLIC_SUPABASE_URL");

  const SERVICE_ROLE_KEY =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SERVICE_ROLE_KEY");

  if (
    !STRIPE_SECRET_KEY ||
    !STRIPE_WEBHOOK_SECRET ||
    !SUPABASE_URL ||
    !SERVICE_ROLE_KEY
  ) {
    console.error("❌ Missing environment variables", {
      hasStripeSecret: !!STRIPE_SECRET_KEY,
      hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SERVICE_ROLE_KEY,
    });

    return new Response("Missing environment variables", {
      status: 500,
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

  const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY
  );

  const toIso = (timestamp?: number | null) =>
    timestamp
      ? new Date(timestamp * 1000).toISOString()
      : null;

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      stripeSignature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : String(err);

    console.error(
      "⚠️ Webhook signature verification failed:",
      message
    );

    return new Response(
      "Webhook signature verification failed",
      { status: 400 }
    );
  }

  console.log(`🔔 Received event: ${event.type}`);

  try {
    switch (event.type) {
      /*
       * Checkout has completed.
       *
       * This links the Stripe customer and subscription to the
       * correct Supabase user. The subscription status handlers
       * below then keep the membership status synchronised.
       */
      case "checkout.session.completed": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        const userId =
          session.metadata?.user_id ??
          session.client_reference_id ??
          null;

        const plan =
          session.metadata?.plan ?? "premium";

        console.log("checkout.session.completed", {
          userId,
          customerId,
          subscriptionId,
          plan,
        });

        if (!userId && !customerId) {
          console.warn(
            "⚠️ Checkout session has no user ID or customer ID"
          );
          break;
        }

        let subscriptionStatus = "active";
        let subscriptionLevel = plan;
        let currentPeriodEnd: string | null = null;

        /*
         * Retrieve the actual subscription rather than assuming
         * that the status is active.
         */
        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(
              subscriptionId
            );

          subscriptionStatus =
            subscription.cancel_at_period_end
              ? "cancels_at_period_end"
              : subscription.status;

          subscriptionLevel =
            subscription.status === "active" ||
            subscription.status === "trialing"
              ? "premium"
              : "free";

          currentPeriodEnd = toIso(
            subscription.current_period_end
          );
        }

        const updateData = {
          subscription_level: subscriptionLevel,
          subscription_status: subscriptionStatus,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        };

        if (userId) {
          const {
            data: updatedProfiles,
            error: updateError,
          } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("user_id", userId)
            .select("user_id");

          if (updateError) {
            throw updateError;
          }

          if (
            !updatedProfiles ||
            updatedProfiles.length === 0
          ) {
            const { error: insertError } =
              await supabase
                .from("profiles")
                .insert({
                  user_id: userId,
                  email:
                    session.customer_details?.email ??
                    null,
                  ...updateData,
                });

            if (insertError) {
              throw insertError;
            }

            console.log(
              `✅ Inserted profile for user_id=${userId}`
            );
          } else {
            console.log(
              `✅ Updated profile for user_id=${userId}`
            );
          }
        } else if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("stripe_customer_id", customerId);

          if (error) {
            throw error;
          }

          console.log(
            `✅ Updated profile for Stripe customer ${customerId}`
          );
        }

        break;
      }

      /*
       * Subscription created or changed.
       *
       * Always retrieve the current subscription from Stripe.
       */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const eventSubscription =
          event.data.object as Stripe.Subscription;

        const subscription =
          await stripe.subscriptions.retrieve(
            eventSubscription.id
          );

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const status =
          subscription.cancel_at_period_end
            ? "cancels_at_period_end"
            : subscription.status;

        const level =
          subscription.status === "active" ||
          subscription.status === "trialing"
            ? "premium"
            : "free";

        console.log(
          "customer.subscription.* latest Stripe state",
          {
            eventType: event.type,
            subscriptionId: subscription.id,
            customerId,
            status,
            level,
          }
        );

        /*
         * A subscription can briefly be incomplete while its
         * first payment is being processed.
         *
         * Do not let the initial created event overwrite a
         * successful active update.
         */
        if (
          event.type ===
            "customer.subscription.created" &&
          subscription.status === "incomplete"
        ) {
          console.log(
            `ℹ️ Ignoring initial incomplete created event for ${subscription.id}`
          );
          break;
        }

        const {
          data: existingProfile,
          error: existingProfileError,
        } = await supabase
          .from("profiles")
          .select(
            "user_id, subscription_status, stripe_subscription_id"
          )
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (existingProfileError) {
          throw existingProfileError;
        }

        /*
         * Extra protection against an older incomplete status
         * overwriting a currently active profile.
         */
        if (
          subscription.status === "incomplete" &&
          existingProfile?.subscription_status ===
            "active" &&
          existingProfile?.stripe_subscription_id ===
            subscription.id
        ) {
          console.log(
            `ℹ️ Ignoring stale incomplete status for active subscription ${subscription.id}`
          );
          break;
        }

        const {
          data: updatedProfiles,
          error: updateError,
        } = await supabase
          .from("profiles")
          .update({
            subscription_level: level,
            subscription_status: status,
            stripe_subscription_id:
              subscription.id,
            current_period_end: toIso(
              subscription.current_period_end
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)
          .select("user_id");

        if (updateError) {
          throw updateError;
        }

        if (
          !updatedProfiles ||
          updatedProfiles.length === 0
        ) {
          console.warn(
            `⚠️ No Supabase profile found for Stripe customer ${customerId}`
          );
        } else {
          console.log(
            `✅ Subscription ${subscription.id} synchronised as ${status}`
          );
        }

        break;
      }

      /*
       * Subscription permanently cancelled/deleted.
       */
      case "customer.subscription.deleted": {
        const eventSubscription =
          event.data.object as Stripe.Subscription;

        const customerId =
          typeof eventSubscription.customer === "string"
            ? eventSubscription.customer
            : eventSubscription.customer.id;

        console.log(
          "customer.subscription.deleted",
          {
            subscriptionId:
              eventSubscription.id,
            customerId,
          }
        );

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_level: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          throw error;
        }

        console.log(
          `✅ Subscription ${eventSubscription.id} cancelled`
        );

        break;
      }

      /*
       * A subscription invoice has been paid.
       *
       * This gives the webhook another opportunity to correct
       * the account to Premium after a successful payment.
       */
      case "invoice.paid": {
        const invoice =
          event.data.object as Stripe.Invoice;

        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null;

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;

        console.log("💰 invoice.paid", {
          customerId,
          subscriptionId,
        });

        if (!customerId || !subscriptionId) {
          console.log(
            "ℹ️ Invoice is not linked to a subscription"
          );
          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(
            subscriptionId
          );

        const status =
          subscription.cancel_at_period_end
            ? "cancels_at_period_end"
            : subscription.status;

        const level =
          subscription.status === "active" ||
          subscription.status === "trialing"
            ? "premium"
            : "free";

        const {
          data: updatedProfiles,
          error: updateError,
        } = await supabase
          .from("profiles")
          .update({
            subscription_level: level,
            subscription_status: status,
            stripe_subscription_id:
              subscription.id,
            current_period_end: toIso(
              subscription.current_period_end
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)
          .select("user_id");

        if (updateError) {
          throw updateError;
        }

        if (
          !updatedProfiles ||
          updatedProfiles.length === 0
        ) {
          console.warn(
            `⚠️ No Supabase profile found for Stripe customer ${customerId}`
          );
        } else {
          console.log(
            `✅ Paid invoice synchronised subscription ${subscription.id} as ${status}`
          );
        }

        break;
      }

      default: {
        console.log(
          `ℹ️ No handler for event type: ${event.type}`
        );

        return new Response(null, {
          status: 204,
        });
      }
    }

    return new Response("ok", {
      status: 200,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error("❌ Handler error:", message);

    return new Response(message, {
      status: 500,
    });
  }
});