// src/pages/NFC/NFCTagStore.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

const SUPABASE_FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// Display price text for the UI
const NFC_PRICE_TEXT = "£1.10 per tag";
// Numeric price used for estimating totals (update if you change Stripe price)
const NFC_PRICE_PER_TAG = 1.1;

export default function NFCTagStore() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const [qty, setQty] = useState(10);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Buy HiveTag NFC Labels • BeezKnees";
  }, []);

  // Load user + subscription (for messaging, not gating purchase)
  useEffect(() => {
    const loadUserAndPlan = async () => {
      try {
        const [{ data: userData }, { data: profileData }] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("profiles")
            .select("subscription_level")
            .maybeSingle(),
        ]);

        const u = userData?.user || null;
        setUser(u);

        if (profileData && profileData.subscription_level) {
          setSubscriptionLevel(profileData.subscription_level);
        } else {
          setSubscriptionLevel("free");
        }
      } catch (e) {
        console.error("Failed to load user/profile for NFC store:", e);
        setSubscriptionLevel("free");
      }
    };

    loadUserAndPlan();
  }, []);

  const increaseQty = () => {
    setQty((prev) => Math.min(prev + 1, 200));
  };

  const decreaseQty = () => {
    setQty((prev) => Math.max(prev - 1, 1));
  };

  const handleQtyChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (Number.isNaN(value)) {
      setQty(1);
      return;
    }
    setQty(Math.min(Math.max(value, 1), 200));
  };

  const estimatedTotal = (qty * NFC_PRICE_PER_TAG).toFixed(2);

  const handleCheckout = async () => {
    setError("");

    // Ensure user is logged in first
    if (!user) {
      navigate("/login?redirect=/nfc/tags");
      return;
    }

    try {
      setIsCheckingOut(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate("/login?redirect=/nfc/tags");
        return;
      }

      const token = session.access_token;
      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID_NFC_TAG;

      if (!priceId) {
        throw new Error(
          "No NFC price ID configured. Please set VITE_STRIPE_PRICE_ID_NFC_TAG in your environment."
        );
      }

      // Supabase Edge Function: create-nfc-checkout
      // expects: { quantity, price_id, user_id, success_path, cancel_path }
      const res = await fetch(
        `${SUPABASE_FUNCTIONS_BASE}/create-nfc-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            quantity: qty,
            price_id: priceId,
            user_id: user.id,
            success_path: "/nfc?tags_purchased=1",
            cancel_path: "/nfc/tags?canceled=1",
          }),
        }
      );

      const txt = await res.text().catch(() => "");
      if (!res.ok) {
        console.error("create-nfc-checkout response:", txt);
        throw new Error(`Checkout failed: ${txt || res.status}`);
      }

      const { url } = JSON.parse(txt || "{}");
      if (!url) {
        throw new Error("No URL returned from NFC checkout function.");
      }

      window.location.href = url;
    } catch (err) {
      console.error("NFC tag checkout error:", err);
      setError(
        err?.message ||
          "Sorry, we couldn’t start the checkout. Please try again."
      );
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Intro */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-green-800">
              BeezKnees HiveTag NFC Labels
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Commercial-grade NFC tags for your hives. Tap your phone on a tag
              to jump straight into that hive’s inspection flow.
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Works best with a{" "}
              <span className="font-semibold">Premium</span> BeezKnees plan
              (NFC tap-to-log), but you can buy tags on any plan.
            </p>
          </div>
          <div className="shrink-0">
            <div className="w-40 h-40 rounded-full border border-gray-200 bg-gradient-to-br from-amber-50 to-yellow-100 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="/nfctag.webp"
                alt="BeezKnees HiveTag NFC round disc tag"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Product main card: price + quantity + checkout */}
        <section className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-green-900">
                Pricing &amp; Checkout
              </h2>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">{NFC_PRICE_TEXT}</span>, on-metal
                compatible, waterproof ABS discs with strong 3M adhesive and a
                central screw hole for extra fixing if you want it.
              </p>
              <p className="mt-1 text-xs text-gray-600">
                UK postage &amp; packaging is typically{" "}
                <span className="font-semibold">£1.55 per order</span>, shown on
                the secure Stripe checkout page.
              </p>
            </div>

            {/* Quantity selector */}
            <div className="space-y-2">
              <label
                htmlFor="nfcQty"
                className="block text-sm font-medium text-gray-700"
              >
                Number of tags
              </label>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={decreaseQty}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-lg leading-none hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <input
                  id="nfcQty"
                  type="number"
                  min={1}
                  max={200}
                  value={qty}
                  onChange={handleQtyChange}
                  className="w-20 border rounded px-2 py-1 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={increaseQty}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-lg leading-none hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500">
                You can adjust the quantity on future orders. A good starting
                point is{" "}
                <span className="font-semibold">around 10 tags</span> for a
                small apiary.
              </p>
            </div>
          </div>

          {/* Summary + button */}
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4 flex flex-col justify-between">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Price per tag</span>
                <span className="font-semibold">{NFC_PRICE_TEXT}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quantity</span>
                <span className="font-semibold">{qty}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-green-800 mt-2">
                <span>Estimated total</span>
                <span>£{estimatedTotal}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Final price (including postage) will be confirmed on the secure
                Stripe checkout page.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full px-4 py-2 rounded-md text-sm font-semibold text-white shadow ${
                  isCheckingOut
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {isCheckingOut
                  ? "Redirecting to Stripe…"
                  : "Buy now with Stripe"}
              </button>
              {!user && (
                <p className="text-[11px] text-gray-600">
                  You’ll be asked to log in or create an account before
                  checkout.
                </p>
              )}
              <p className="text-[11px] text-gray-500">
                Payments are processed securely by Stripe. BeezKnees does not
                store your card details.
              </p>
              {error && (
                <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Details / specs */}
        <section className="bg-white rounded-2xl shadow p-6 space-y-4 text-sm text-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-green-900">
              Why HiveTag?
            </h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Instant access — tap your hive to open inspections.</li>
              <li>
                Designed for outdoor use — waterproof ABS, tough enough for UK
                weather.
              </li>
              <li>
                Works on metal roofs and boxes — anti-metal ferrite backing for
                reliable reads.
              </li>
              <li>
                Mount how you like — very sticky 3M backing and a{" "}
                <strong>5&nbsp;mm central hole</strong> for screws, nails or
                rivets.
              </li>
              <li>Compatible with modern iOS and Android phones.</li>
              <li>Reusable — clear a tag and reassign it to another hive.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-green-900">
              Technical specification
            </h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Chip: Original NXP NTAG213 (13.56&nbsp;MHz, ISO&nbsp;14443A).</li>
              <li>
                User memory: 144 bytes (around 130–137 characters with NDEF
                formatting).
              </li>
              <li>
                Form factor: 29&nbsp;mm round ABS disc, approx. 5&nbsp;mm high,
                with 5&nbsp;mm central hole.
              </li>
              <li>Very strong 3M adhesive backing.</li>
              <li>Anti-metal ferrite layer for mounting directly on metal.</li>
              <li>Weatherproof and waterproof; suitable for indoor or outdoor use.</li>
              <li>
                Android: NFC tap support in most modern phones (Chrome for
                Android recommended for Web NFC).
              </li>
              <li>
                iOS: NFC read support on iPhone&nbsp;7 and newer for URL-based
                tags that open BeezKnees.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-green-900">
              How it works with BeezKnees
            </h2>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>
                Attach the tag to your hive using the adhesive backing or a
                small screw through the central hole.
              </li>
              <li>
                In BeezKnees, go to <strong>Scan NFC Tag</strong> (Premium).
              </li>
              <li>Tap your phone on the tag and assign it to a hive once.</li>
              <li>
                Next time you visit that hive, tap again and jump straight into
                a new inspection.
              </li>
              <li>
                Manage, search and clear tags from the{" "}
                <strong>NFC Tag Manager</strong> in your dashboard.
              </li>
            </ol>
          </div>

          <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>
              If a tag arrives damaged or faulty, please contact us and we’ll
              arrange a replacement.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
