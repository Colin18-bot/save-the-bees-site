// src/pages/Legal/CookieBanner.jsx
import React, { useEffect, useState } from "react";
import { getConsent, setConsent } from "./CookieConsent";
import { Link } from "react-router-dom";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = getConsent();
    // Show banner only if user hasn’t decided yet
    const undecided = !c.date && !c.analytics && !c.marketing;
    setVisible(undecided);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    setConsent({ analytics: true, marketing: true });
    setVisible(false);
  };

  const rejectNonEssential = () => {
    setConsent({ analytics: false, marketing: false });
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-4 md:p-5">
        <div className="md:flex md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">We use cookies</h2>
            <p className="text-sm text-gray-600">
              We use necessary cookies to make our site work. With your permission, we’d also like to set analytics
              and marketing cookies. Read our{" "}
              <Link to="/legal/privacy" className="underline text-amber-700">
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex gap-2 mt-3 md:mt-0">
            <button
              onClick={rejectNonEssential}
              className="px-3 py-2 rounded-xl border border-gray-300"
            >
              Reject non-essential
            </button>
            <Link
              to="/legal/cookies"
              className="px-3 py-2 rounded-xl border border-gray-300"
            >
              Manage
            </Link>
            <button
              onClick={acceptAll}
              className="px-3 py-2 rounded-xl bg-amber-500 text-white"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
