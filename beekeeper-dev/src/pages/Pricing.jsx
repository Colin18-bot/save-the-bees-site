// src/pages/Pricing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

const PREMIUM_PRICE_TEXT = "£4.99 / month";
const SUPABASE_FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

function CheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.5 11.586l6.493-6.293a1 1 0 011.411-.003z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlanCard({
  title,
  price,
  description,
  features,
  disabled,
  onClick,
  cta,
  highlight = false,
  footnote,
  currentLabel = "Current Plan",
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-white shadow-sm p-6 flex flex-col ${
        highlight ? "ring-2 ring-amber-500" : "border-gray-200"
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow">
          Most Popular
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-green-800">{title}</h3>
        {price && <p className="mt-1 text-2xl font-semibold text-gray-900">{price}</p>}
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">
              <CheckIcon />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            disabled
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : highlight
              ? "bg-green-700 hover:bg-green-800 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {disabled ? currentLabel : cta}
        </button>
      </div>

      {footnote && <p className="mt-3 text-xs text-gray-500">{footnote}</p>}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const [message, setMessage] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();

      if (session?.user && userData?.user) {
        setUser(userData.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        setSubscriptionLevel(profile?.subscription_level || "free");
      } else {
        setUser(null);
        setSubscriptionLevel("free");
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const messageParam = params.get("message");
    if (messageParam === "login_required") {
      setMessage("Please log in to access that page.");
    } else if (messageParam === "subscription_required") {
      setMessage("This feature is only available on a paid plan.");
    }
  }, [location]);

  const params = new URLSearchParams(location.search);
  const redirectParam = params.get("redirect");
  const backTarget = redirectParam || (user ? "/dashboard" : "/login");

  const isPremium = !!user && subscriptionLevel === "premium";

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }

    try {
      setUpgrading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        navigate("/login?redirect=/pricing");
        return;
      }
      const token = session.access_token;

      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM;

      const res = await fetch(`${SUPABASE_FUNCTIONS_BASE}/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          plan: "premium",
          user_id: user.id,
          ...(priceId ? { price_id: priceId } : {}),
          success_path: "/dashboard?upgraded=1",
          cancel_path: "/pricing?canceled=1",
        }),
      });

      const txt = await res.text().catch(() => "");
      if (!res.ok) {
        console.error("create-checkout response:", txt);
        throw new Error(`Create checkout failed: ${txt || res.status}`);
      }

      const { url } = JSON.parse(txt || "{}");
      if (!url) throw new Error("No URL returned from create-checkout");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert(err?.message || "Sorry, we couldn't start checkout. Please try again.");
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate("/login?redirect=/pricing");
      return;
    }
    const token = session.access_token;
    const returnUrl = window.location.origin + "/settings";
    const portalUrl =
      `${SUPABASE_FUNCTIONS_BASE}/create-billing-portal` +
      `?token=${encodeURIComponent(token)}` +
      `&return_url=${encodeURIComponent(returnUrl)}`;

    window.location.href = portalUrl;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Escape bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          ← Back
        </button>

        {isPremium ? (
          <button
            type="button"
            onClick={handleManageBilling}
            className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            Manage billing
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(backTarget, { replace: true })}
            className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            {user ? "Go to Dashboard" : "Continue without upgrading"}
          </button>
        )}
      </div>

      {/* Hero */}
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 tracking-tight">
          Keep your bees organised, healthy, and happy
        </h1>
        <p className="mt-3 text-gray-600">
          BeezKnees helps you track inspections, plan tasks, and spot issues early — wherever you are.
        </p>
      </header>

      {message && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 text-center">
          {message}
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE PLAN */}
        <PlanCard
          title="Free"
          price="£0"
          description="A perfect starter plan with all features included — just limited to one apiary and two hives."
          features={[
            "Full inspection records",
            "To-Dos & calendar reminders",
            "Weather overview",
            "Photo uploads",
            "Printable reports",
            "Logbook & archive",
            "1 apiary • Up to 2 hives",
          ]}
          disabled={subscriptionLevel === "free" && !!user}
          onClick={() => navigate(user ? "/dashboard" : "/register?redirect=/dashboard")}
          cta={user ? "Use Free plan" : "Get started — free"}
          footnote="No credit card required."
          highlight={false}
          currentLabel="Current Plan"
        />

        {/* PREMIUM PLAN */}
        <PlanCard
          title="Premium"
          price={PREMIUM_PRICE_TEXT}
          description="Everything in Free — without limits. Grow your apiaries at your own pace and support BeezKnees development."
          features={[
            "Unlimited apiaries",
            "Unlimited hives",
            "All features included — nothing locked",
            "Advanced seasonal & per-apiary reporting",
            "Ideal for growing hobbyists & sideline/commercial setups",
            "Priority support",
            "Directly supports ongoing development of BeezKnees",
          ]}
          disabled={!isPremium && upgrading}
          onClick={() => (isPremium ? handleManageBilling() : handleUpgrade())}
          cta={isPremium ? "Manage billing" : upgrading ? "Redirecting…" : "Upgrade to Premium"}
          highlight
          currentLabel="Current Plan"
          footnote="Cancel anytime. All prices include VAT where applicable."
        />
      </div>

      {/* Benefit strip */}
      <section className="mt-12 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-xl font-bold text-green-800 mb-3">Everything you need to run your apiaries</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">
              <CheckIcon />
            </span>
            Guided inspections & notes
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">
              <CheckIcon />
            </span>
            Logbook for quick events & findings
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">
              <CheckIcon />
            </span>
            To-Dos, reminders & calendar view
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">
              <CheckIcon />
            </span>
            Local weather at your apiaries
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">
              <CheckIcon />
            </span>
            Archive & full history for compliance
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">
              <CheckIcon />
            </span>
            Works great on mobiles & tablets — ideal for use at the apiary
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-10 grid grid-cols-1 md-grid-cols-2 gap-6 text-sm">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold text-green-900">Can I switch plans anytime?</h3>
          <p className="mt-2 text-gray-600">
            Yes. Upgrade or cancel whenever you like. If you cancel Premium, you’ll keep access until the end of your billing period.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h3 className="font-semibold text-green-900">Is my data safe?</h3>
          <p className="mt-2 text-gray-600">
            We take data privacy seriously. Your apiaries, hives and inspection data are yours — export anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
