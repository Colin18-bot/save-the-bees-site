// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/webhook-final/index.ts
//
// Stripe webhook orchestrator for:
// - Premium subscription synchronisation
// - Premium customer emails
// - Internal subscription notifications
// - NFC order confirmations and fulfilment notifications
// - Duplicate Stripe event protection
//
// IMPORTANT:
// Deploy this webhook with --no-verify-jwt because Stripe calls it directly.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";
import Stripe from "npm:stripe@12.18.0";

import { sendBrevoTemplateEmail } from "../_shared/brevo.ts";
import { EMAIL_TEMPLATES } from "../_shared/emailTemplates.ts";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const INTERNAL_EMAIL = "support@beezknees.co.uk";

const REPLY_TO = {
  email: "support@beezknees.co.uk",
  name: "HiveTag",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? Deno.env.get("STRIPE_API_KEY") ?? "";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PUBLIC_SUPABASE_URL") ?? "";

const SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? "";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";

// -----------------------------------------------------------------------------
// Shared clients
// -----------------------------------------------------------------------------

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function textResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function toIso(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function formatEventDate(timestamp?: number | null) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(date);
}

function formatMoney(amountMinor?: number | null, currency?: string | null) {
  const amount = typeof amountMinor === "number" ? amountMinor / 100 : 0;

  const normalisedCurrency = (currency || "gbp").toUpperCase();

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: normalisedCurrency,
    }).format(amount);
  } catch {
    return `${normalisedCurrency} ${amount.toFixed(2)}`;
  }
}

function normaliseName(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "Beekeeper";
}

function normaliseEmail(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim().toLowerCase();
    }
  }

  return "";
}

function stripeId(
  value:
    | string
    | {
        id: string;
      }
    | null
    | undefined
) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function invoiceSubscriptionId(invoice: any) {
  /*
   * Older Stripe API versions exposed the subscription directly
   * as invoice.subscription.
   */
  const legacySubscription = stripeId(invoice?.subscription);

  if (legacySubscription) {
    return legacySubscription;
  }

  /*
   * Stripe Basil exposes the subscription through
   * invoice.parent.subscription_details.subscription.
   */
  if (invoice?.parent?.type !== "subscription_details") {
    return null;
  }

  return stripeId(
    invoice?.parent?.subscription_details?.subscription
  );
}

async function safeSendTemplate(
  label: string,
  options: {
    templateId: number;
    to:
      | {
          email: string;
          name?: string;
        }
      | Array<{
          email: string;
          name?: string;
        }>;
    params?: Record<string, unknown>;
  }
) {
  if (!BREVO_API_KEY) {
    console.error(`📧 ${label} not sent: BREVO_API_KEY is missing.`);

    return {
      sent: false,
      error: "BREVO_API_KEY is missing.",
    };
  }

  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  const validRecipients = recipients.filter(
    (recipient) => typeof recipient.email === "string" && recipient.email.trim()
  );

  if (validRecipients.length === 0) {
    console.error(`📧 ${label} not sent: no valid recipient email.`);

    return {
      sent: false,
      error: "No valid recipient email.",
    };
  }

  try {
    const result = await sendBrevoTemplateEmail(
      {
        templateId: options.templateId,
        to: validRecipients,
        params: options.params ?? {},
        replyTo: REPLY_TO,
      },
      BREVO_API_KEY
    );

    console.log(`📧 ${label} sent.`);

    return {
      sent: true,
      result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`📧 ${label} failed:`, message);

    return {
      sent: false,
      error: message,
    };
  }
}

async function getProfileByUserId(userId: string | null) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "user_id, email, stripe_customer_id, stripe_subscription_id, subscription_level, subscription_status"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function getProfileByCustomerId(customerId: string | null) {
  if (!customerId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "user_id, email, stripe_customer_id, stripe_subscription_id, subscription_level, subscription_status"
    )
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function getStripeCustomer(customerId: string | null) {
  if (!customerId) return null;

  try {
    const customer = await stripe.customers.retrieve(customerId);

    if ("deleted" in customer && customer.deleted) {
      return null;
    }

    return customer as Stripe.Customer;
  } catch (error) {
    console.error(`Unable to retrieve Stripe customer ${customerId}:`, error);

    return null;
  }
}

async function claimStripeEvent(event: Stripe.Event) {
  const eventObject = event.data.object as Record<string, any>;

  let customerId = stripeId(eventObject.customer) ?? stripeId(eventObject.customer_id) ?? null;

  let subscriptionId =
  stripeId(eventObject.subscription) ??
  (eventObject.object === "subscription" ? stripeId(eventObject.id) : null) ??
  (eventObject.object === "invoice" ? invoiceSubscriptionId(eventObject) : null);

  let customerEmail = normaliseEmail(
    eventObject.customer_email,
    eventObject.customer_details?.email,
    eventObject.receipt_email
  );

  /*
   * Subscription events normally contain the Stripe customer ID but not
   * the customer email address. Use the matching profile first, then
   * Stripe itself as a fallback.
   */
  if (customerId && !customerEmail) {
    const profile = await getProfileByCustomerId(customerId);

    customerEmail = normaliseEmail(profile?.email);

    if (!subscriptionId) {
      subscriptionId = stripeId(profile?.stripe_subscription_id) ?? null;
    }
  }

  if (customerId && !customerEmail) {
    const customer = await getStripeCustomer(customerId);

    customerEmail = normaliseEmail(customer?.email);
  }

  const { error } = await supabase.from("stripe_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    customer_email: customerEmail || null,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  });

  if (!error) {
    return {
      claimed: true,
      duplicate: false,
    };
  }

  if (error.code === "23505") {
    console.log(`ℹ️ Stripe event ${event.id} has already been processed.`);

    return {
      claimed: false,
      duplicate: true,
    };
  }

  throw error;
}

async function releaseStripeEvent(eventId: string) {
  const { error } = await supabase
    .from("stripe_webhook_events")
    .delete()
    .eq("stripe_event_id", eventId);

  if (error) {
    console.error(`Unable to release Stripe event ${eventId}:`, error.message);
  }
}

async function upsertProfileFromCheckout(
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription | null
) {
  const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;

  const customerId = stripeId(session.customer);

  const subscriptionId = stripeId(session.subscription);

  const plan = session.metadata?.plan ?? "premium";

  let subscriptionStatus = subscription?.cancel_at_period_end
    ? "cancels_at_period_end"
    : (subscription?.status ?? "active");

  let subscriptionLevel =
    subscription && (subscription.status === "active" || subscription.status === "trialing")
      ? "premium"
      : plan;

  if (subscription && !["active", "trialing"].includes(subscription.status)) {
    subscriptionLevel = "free";
  }

  const updateData = {
    subscription_level: subscriptionLevel,
    subscription_status: subscriptionStatus,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    current_period_end: toIso(subscription?.current_period_end),
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    const { data: updatedProfiles, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", userId)
      .select("user_id");

    if (updateError) {
      throw updateError;
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: userId,
        email: session.customer_details?.email ?? session.customer_email ?? null,
        ...updateData,
      });

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Inserted profile for user_id=${userId}`);
    } else {
      console.log(`✅ Updated profile for user_id=${userId}`);
    }

    return;
  }

  if (customerId) {
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("stripe_customer_id", customerId);

    if (error) throw error;

    console.log(`✅ Updated profile for Stripe customer ${customerId}`);
  }
}

async function handlePremiumCheckout(sessionEvent: Stripe.Checkout.Session) {
  const session = await stripe.checkout.sessions.retrieve(sessionEvent.id, {
    expand: ["customer", "subscription"],
  });

  const customerId = stripeId(session.customer);

  const subscriptionId = stripeId(session.subscription);

  const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;

  let subscription: Stripe.Subscription | null = null;

  if (subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  }

  await upsertProfileFromCheckout(session, subscription);

  const profile = (await getProfileByUserId(userId)) ?? (await getProfileByCustomerId(customerId));

  const customer = await getStripeCustomer(customerId);

  const customerEmail = normaliseEmail(
    session.customer_details?.email,
    session.customer_email,
    customer?.email,
    profile?.email
  );

  const customerName = normaliseName(
    session.customer_details?.name,
    customer?.name,
    customerEmail ? customerEmail.split("@")[0] : null
  );

  const eventDate = formatEventDate(session.created);

  const params = {
    customer_name: customerName,
    customer_email: customerEmail,
    stripe_customer_id: customerId ?? "",
    subscription_id: subscriptionId ?? "",
    subscription_date: eventDate,
    event_date: eventDate,
    amount_paid: formatMoney(session.amount_total, session.currency),
  };

  await safeSendTemplate("Premium Welcome", {
    templateId: EMAIL_TEMPLATES.PREMIUM_WELCOME,
    to: {
      email: customerEmail,
      name: customerName,
    },
    params,
  });

  await safeSendTemplate("Internal New Premium Subscriber", {
    templateId: EMAIL_TEMPLATES.INTERNAL_NEW_PREMIUM_SUBSCRIBER,
    to: {
      email: INTERNAL_EMAIL,
      name: "BeezKnees Support",
    },
    params,
  });
}

async function handleNfcCheckout(sessionEvent: Stripe.Checkout.Session) {
  const session = await stripe.checkout.sessions.retrieve(sessionEvent.id, {
    expand: ["line_items", "payment_intent"],
  });

  const customerId = stripeId(session.customer);

  const userId =
    session.metadata?.beezknees_user_id ??
    session.metadata?.user_id ??
    session.client_reference_id ??
    null;

  const profile = (await getProfileByUserId(userId)) ?? (await getProfileByCustomerId(customerId));

  const customerEmail = normaliseEmail(
    session.customer_details?.email,
    session.customer_email,
    profile?.email
  );

  const shippingDetails = session.shipping_details ?? null;

  const address = shippingDetails?.address ?? session.customer_details?.address ?? null;

  const customerName = normaliseName(
    shippingDetails?.name,
    session.customer_details?.name,
    customerEmail ? customerEmail.split("@")[0] : null
  );

  const quantityFromMetadata = Number(session.metadata?.quantity ?? "0");

  const quantityFromLineItems =
    session.line_items?.data?.reduce((total, lineItem) => total + (lineItem.quantity ?? 0), 0) ?? 0;

  const quantity = quantityFromMetadata > 0 ? quantityFromMetadata : quantityFromLineItems;

  const paymentReference = stripeId(session.payment_intent) ?? "";

  const orderDate = formatEventDate(session.created);

  const postageAmount = formatMoney(session.total_details?.amount_shipping ?? 0, session.currency);

  const orderTotal = formatMoney(session.amount_total, session.currency);

  const orderParams = {
    customer_name: customerName,
    customer_email: customerEmail,
    order_number: session.id,
    order_date: orderDate,
    quantity,
    postage_amount: postageAmount,
    order_total: orderTotal,
    stripe_session_id: session.id,
    payment_reference: paymentReference,
    shipping_name: shippingDetails?.name ?? customerName,
    shipping_address_line_1: address?.line1 ?? "",
    shipping_address_line_2: address?.line2 ?? "",
    shipping_city: address?.city ?? "",
    shipping_postcode: address?.postal_code ?? "",
    shipping_country: address?.country ?? "",
  };

  await safeSendTemplate("NFC Order Confirmation", {
    templateId: EMAIL_TEMPLATES.NFC_ORDER_CONFIRMATION,
    to: {
      email: customerEmail,
      name: customerName,
    },
    params: orderParams,
  });

  await safeSendTemplate("Internal NFC Order Notification", {
    templateId: EMAIL_TEMPLATES.NFC_INTERNAL_ORDER_NOTIFICATION,
    to: {
      email: INTERNAL_EMAIL,
      name: "BeezKnees Support",
    },
    params: orderParams,
  });
}

async function handleSubscriptionSync(
  eventType: string,
  eventSubscription: Stripe.Subscription,
  previousAttributes?: Partial<Stripe.Subscription>
) {
  const subscription = await stripe.subscriptions.retrieve(eventSubscription.id);

  const customerId = stripeId(subscription.customer);

  if (!customerId) {
    console.warn(`⚠️ Subscription ${subscription.id} has no customer ID.`);
    return;
  }

  const status = subscription.cancel_at_period_end ? "cancels_at_period_end" : subscription.status;

  const level =
    subscription.status === "active" || subscription.status === "trialing" ? "premium" : "free";

  if (eventType === "customer.subscription.created" && subscription.status === "incomplete") {
    console.log(`ℹ️ Ignoring initial incomplete created event for ${subscription.id}`);
    return;
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("user_id, email, subscription_status, stripe_subscription_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (existingProfileError) {
    throw existingProfileError;
  }

  if (
    subscription.status === "incomplete" &&
    existingProfile?.subscription_status === "active" &&
    existingProfile?.stripe_subscription_id === subscription.id
  ) {
    console.log(`ℹ️ Ignoring stale incomplete status for active subscription ${subscription.id}`);
    return;
  }

  const { data: updatedProfiles, error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_level: level,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      current_period_end: toIso(subscription.current_period_end),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId)
    .select("user_id");

  if (updateError) {
    throw updateError;
  }

  if (!updatedProfiles || updatedProfiles.length === 0) {
    console.warn(`⚠️ No Supabase profile found for Stripe customer ${customerId}`);
  } else {
    console.log(`✅ Subscription ${subscription.id} synchronised as ${status}`);
  }

  /*
   * Send the cancellation confirmation when cancellation is first
   * scheduled, rather than waiting until Premium access actually ends.
   *
   * previousAttributes.cancel_at_period_end will normally be false
   * when the customer has just requested cancellation.
   */
  const cancellationJustScheduled =
    eventType === "customer.subscription.updated" &&
    subscription.cancel_at_period_end === true &&
    previousAttributes?.cancel_at_period_end === false;

  if (!cancellationJustScheduled) {
    return;
  }

  const customer = await getStripeCustomer(customerId);

  const customerEmail = normaliseEmail(customer?.email, existingProfile?.email);

  const customerName = normaliseName(
    customer?.name,
    customerEmail ? customerEmail.split("@")[0] : null
  );

  const cancellationRequestedDate = formatEventDate(Math.floor(Date.now() / 1000));

  const accessEndDate = formatEventDate(subscription.current_period_end);

  const cancellationParams = {
    customer_name: customerName,
    customer_email: customerEmail,
    stripe_customer_id: customerId,
    subscription_id: subscription.id,

    cancellation_date: cancellationRequestedDate,
    cancellation_requested_date: cancellationRequestedDate,

    access_end_date: accessEndDate,
    premium_access_end_date: accessEndDate,
    current_period_end: accessEndDate,

    event_date: cancellationRequestedDate,
  };

  await safeSendTemplate("Subscription Cancellation Scheduled", {
    templateId: EMAIL_TEMPLATES.SUBSCRIPTION_CANCELLED,
    to: {
      email: customerEmail,
      name: customerName,
    },
    params: cancellationParams,
  });

  await safeSendTemplate("Internal Subscription Cancellation Scheduled", {
    templateId: EMAIL_TEMPLATES.INTERNAL_SUBSCRIPTION_CANCELLED,
    to: {
      email: INTERNAL_EMAIL,
      name: "BeezKnees Support",
    },
    params: cancellationParams,
  });

  console.log(
    `📧 Cancellation confirmation sent for subscription ${subscription.id}; Premium access ends ${accessEndDate}.`
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = stripeId(subscription.customer);

  if (!customerId) {
    console.warn(`⚠️ Deleted subscription ${subscription.id} has no customer ID.`);
    return;
  }

  /*
   * The cancellation confirmation was already sent when the customer
   * scheduled cancellation at the end of the billing period.
   *
   * This event means Premium access has now actually ended, so only
   * downgrade the account. Do not send the cancellation emails again.
   */
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

  console.log(`✅ Subscription ${subscription.id} ended; profile downgraded to Free.`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = stripeId(invoice.customer);

  const subscriptionId = invoiceSubscriptionId(invoice);

  if (!customerId || !subscriptionId) {
    console.log("ℹ️ Paid invoice is not linked to a subscription.");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const status = subscription.cancel_at_period_end ? "cancels_at_period_end" : subscription.status;

  const level =
    subscription.status === "active" || subscription.status === "trialing" ? "premium" : "free";

  const { data: updatedProfiles, error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_level: level,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      current_period_end: toIso(subscription.current_period_end),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId)
    .select("user_id, email");

  if (updateError) {
    throw updateError;
  }

  if (!updatedProfiles || updatedProfiles.length === 0) {
    console.warn(`⚠️ No Supabase profile found for Stripe customer ${customerId}`);
  } else {
    console.log(`✅ Paid invoice synchronised subscription ${subscription.id} as ${status}`);
  }

  /*
   * Stripe sends invoice.paid for the first subscription invoice as well.
   * The Premium Welcome email is already sent by checkout.session.completed,
   * so only genuine subscription-cycle invoices receive the renewal email.
   */
  if (invoice.billing_reason !== "subscription_cycle") {
    console.log(`ℹ️ Renewal email skipped for billing_reason=${invoice.billing_reason}.`);
    return;
  }

  const profile = updatedProfiles?.[0] ?? (await getProfileByCustomerId(customerId));

  const customer = await getStripeCustomer(customerId);

  const customerEmail = normaliseEmail(customer?.email, profile?.email);

  const customerName = normaliseName(
    customer?.name,
    customerEmail ? customerEmail.split("@")[0] : null
  );

  const renewalDate = formatEventDate(invoice.status_transitions?.paid_at ?? invoice.created);

  await safeSendTemplate("Subscription Renewed", {
    templateId: EMAIL_TEMPLATES.SUBSCRIPTION_RENEWED,
    to: {
      email: customerEmail,
      name: customerName,
    },
    params: {
      customer_name: customerName,
      customer_email: customerEmail,
      stripe_customer_id: customerId,
      subscription_id: subscriptionId,
      invoice_id: invoice.id,
      amount_paid: formatMoney(invoice.amount_paid, invoice.currency),
      renewal_date: renewalDate,
      event_date: renewalDate,
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = stripeId(invoice.customer);

  const subscriptionId = invoiceSubscriptionId(invoice);

  if ((invoice.attempt_count ?? 1) > 1) {
  console.log(
    `ℹ️ Payment failure email skipped for retry attempt ${invoice.attempt_count} on invoice ${invoice.id}.`
  );
  return;
  }

  if (!customerId) {
    console.warn(`⚠️ Failed invoice ${invoice.id} has no customer ID.`);
    return;
  }

  const profile = await getProfileByCustomerId(customerId);

  const customer = await getStripeCustomer(customerId);

  const customerEmail = normaliseEmail(invoice.customer_email, customer?.email, profile?.email);

  const customerName = normaliseName(
    invoice.customer_name,
    customer?.name,
    customerEmail ? customerEmail.split("@")[0] : null
  );

  const failureDate = formatEventDate(invoice.created);

  const params = {
    customer_name: customerName,
    customer_email: customerEmail,
    stripe_customer_id: customerId,
    subscription_id: subscriptionId ?? "",
    invoice_id: invoice.id,
    amount_due: formatMoney(invoice.amount_due, invoice.currency),
    failure_date: failureDate,
    event_date: failureDate,
  };

  await safeSendTemplate("Payment Failed", {
    templateId: EMAIL_TEMPLATES.PAYMENT_FAILED,
    to: {
      email: customerEmail,
      name: customerName,
    },
    params,
  });

  await safeSendTemplate("Internal Payment Failed", {
    templateId: EMAIL_TEMPLATES.INTERNAL_PAYMENT_FAILED,
    to: {
      email: INTERNAL_EMAIL,
      name: "BeezKnees Support",
    },
    params,
  });
}

// -----------------------------------------------------------------------------
// Webhook
// -----------------------------------------------------------------------------

serve(async (request: Request) => {
  if (request.method !== "POST") {
    return textResponse("Method Not Allowed", 405);
  }

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing required environment variables.", {
      hasStripeSecret: Boolean(STRIPE_SECRET_KEY),
      hasWebhookSecret: Boolean(STRIPE_WEBHOOK_SECRET),
      hasSupabaseUrl: Boolean(SUPABASE_URL),
      hasServiceRoleKey: Boolean(SERVICE_ROLE_KEY),
      hasBrevoApiKey: Boolean(BREVO_API_KEY),
    });

    return textResponse("Missing environment variables", 500);
  }

  const stripeSignature = request.headers.get("stripe-signature");

  if (!stripeSignature) {
    console.error("❌ Missing Stripe signature header.");

    return textResponse("Bad Request", 400);
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      stripeSignature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error("⚠️ Webhook signature verification failed:", message);

    return textResponse("Webhook signature verification failed", 400);
  }

  console.log(`🔔 Received Stripe event ${event.type} (${event.id}).`);

  let eventClaimed = false;

  try {
    const claim = await claimStripeEvent(event);

    if (claim.duplicate) {
      return textResponse("Already processed", 200);
    }

    eventClaimed = claim.claimed;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const isNfcOrder = session.metadata?.beezknees_type === "nfc_tags";

        if (isNfcOrder) {
          await handleNfcCheckout(session);
        } else if (session.mode === "subscription" || session.metadata?.plan) {
          await handlePremiumCheckout(session);
        } else {
          console.log(
            `ℹ️ Checkout session ${session.id} is not a recognised HiveTag Premium or NFC checkout.`
          );
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionSync(
          event.type,
          event.data.object as Stripe.Subscription,
          event.data.previous_attributes as Partial<Stripe.Subscription> | undefined
        );

        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

        break;
      }

      case "invoice.paid": {
        await handleInvoicePaid(event.data.object as Stripe.Invoice);

        break;
      }

      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

        break;
      }

      default: {
        console.log(`ℹ️ No HiveTag handler is required for ${event.type}.`);
      }
    }

    return textResponse("ok", 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`❌ Handler error for ${event.type} (${event.id}):`, message);

    /*
     * Critical processing failed. Remove the event claim so Stripe can retry.
     * Brevo failures do not throw because safeSendTemplate handles them
     * separately, so completed billing/database work is not repeated.
     */
    if (eventClaimed) {
      await releaseStripeEvent(event.id);
    }

    return textResponse(message, 500);
  }
});
