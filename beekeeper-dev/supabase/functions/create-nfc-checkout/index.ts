// supabase/functions/create-nfc-checkout/index.ts
// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const shippingRateId = Deno.env.get("STRIPE_NFC_SHIPPING_RATE_ID");
const nfcPriceId = Deno.env.get("STRIPE_NFC_PRICE_ID");

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const stripe = new Stripe(stripeSecretKey ?? "", {
  apiVersion: "2023-10-16",
});

function jsonResponse(body: unknown, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      ...extraHeaders,
    },
  });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!stripeSecretKey) {
    return jsonResponse({ error: "Stripe is not configured on the server." }, 500);
  }

  if (!nfcPriceId) {
    return jsonResponse({ error: "NFC price is not configured on the server." }, 500);
  }

  if (!supabaseUrl || !serviceRole) {
    return jsonResponse({ error: "Supabase is not configured on the server." }, 500);
  }

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (!token) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRole);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const user_id = data.user.id;

  let payload;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const {
    quantity,
    success_path = "/nfc?tags_purchased=1",
    cancel_path = "/nfc/tags?canceled=1",
  } = payload ?? {};

  const qty = Number(quantity);

  if (!Number.isFinite(qty) || qty < 1 || qty > 200) {
    return jsonResponse(
      { error: "Quantity must be a number between 1 and 200" },
      400,
    );
  }

  const originHeader = req.headers.get("origin") ?? "";
  const frontendEnv = Deno.env.get("FRONTEND_URL") ?? "";
  const base = originHeader || frontendEnv;

  const normalise = (path: string) => {
    if (!base) return path;
    if (path.startsWith("http")) return path;
    if (!path.startsWith("/")) return `${base}/${path}`;
    return `${base}${path}`;
  };

  const successUrl = normalise(success_path);
  const cancelUrl = normalise(cancel_path);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: nfcPriceId,
          quantity: qty,
        },
      ],

      shipping_address_collection: {
        allowed_countries: ["GB"],
      },

      ...(shippingRateId
        ? {
            shipping_options: [
              {
                shipping_rate: shippingRateId,
              },
            ],
          }
        : {}),

      success_url: successUrl,
      cancel_url: cancelUrl,

      metadata: {
        beezknees_type: "nfc_tags",
        beezknees_user_id: user_id,
        quantity: String(qty),
      },
    });

    return jsonResponse({ url: session.url }, 200);
  } catch (err) {
    console.error("Stripe NFC checkout error:", err);
    return jsonResponse(
      { error: "Failed to create NFC checkout session. Please try again." },
      500,
    );
  }
});