// src/pages/Legal/CookieSettings.jsx
import React, { useEffect, useState } from "react";
import { getConsent, setConsent, resetConsent } from "./CookieConsent";

export default function CookieSettings() {
  const [consent, setConsentState] = useState(getConsent());

  useEffect(() => {
    const onUpdate = (e) => setConsentState(e.detail);
    window.addEventListener("cookie-consent:updated", onUpdate);
    return () => window.removeEventListener("cookie-consent:updated", onUpdate);
  }, []);

  const update = (key, value) => {
    const next = setConsent({ [key]: value });
    setConsentState(next);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Cookie settings</h2>
        <p className="text-gray-600">Necessary cookies are always on.</p>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold">Necessary</h2>
            <p className="text-sm text-gray-600">
              Required for core functionality (security, session, preferences).
            </p>
          </div>
          <input type="checkbox" checked readOnly className="w-5 h-5" />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold">Analytics</h2>
            <p className="text-sm text-gray-600">
              Helps us understand usage to improve the product.
            </p>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5"
            checked={!!consent.analytics}
            onChange={(e) => update("analytics", e.target.checked)}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold">Marketing</h2>
            <p className="text-sm text-gray-600">
              Used for measuring campaigns or personalising content.
            </p>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5"
            checked={!!consent.marketing}
            onChange={(e) => update("marketing", e.target.checked)}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            setConsentState(setConsent({ analytics: true, marketing: true }))
          }
          className="px-4 py-2 rounded-xl bg-amber-500 text-white"
        >
          Accept all
        </button>
        <button
          onClick={() =>
            setConsentState(setConsent({ analytics: false, marketing: false }))
          }
          className="px-4 py-2 rounded-xl border"
        >
          Reject non-essential
        </button>
        <button onClick={resetConsent} className="px-4 py-2 rounded-xl border">
          Reset decision
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Last updated:{" "}
        {consent.date ? new Date(consent.date).toLocaleString() : "Not set"}
      </p>
    </div>
  );
}
