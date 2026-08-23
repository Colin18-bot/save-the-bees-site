// src/components/MarketingConsentGate.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const MarketingConsentGate = ({ user, children }) => {
  const [checking, setChecking] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const checkConsent = async () => {
      if (!user?.id) {
        setChecking(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("marketing_email_consent")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Unable to check marketing email consent:", error);

        // Do not prevent use of HiveTag if the consent check fails.
        setChecking(false);
        return;
      }

      if (!profile) {
        console.warn("No profile found while checking marketing consent.");
        setChecking(false);
        return;
      }

      /*
       * NULL = existing user has never made a recorded decision.
       * TRUE/FALSE = already answered, so do not show the prompt.
       */
      setShowPrompt(profile.marketing_email_consent === null);
      setChecking(false);
    };

    checkConsent();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const savePreference = async (consent) => {
    if (saving) return;

    setSaving(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "update-marketing-consent",
        {
          body: {
            consent,
            source: "existing_user_popup",
          },
        }
      );

      if (error) {
        console.error("Marketing consent update failed:", error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(
            data?.error || "Unable to save your email preference."
        );
        }

        /*
        * Tell any open page (such as Settings) that the
        * marketing preference has just changed.
        */
        window.dispatchEvent(
        new CustomEvent("marketing-consent:updated", {
            detail: {
            consent: data.consent.marketingEmailConsent,
            updatedAt: data.consent.updatedAt || null,
            },
        })
        );

        /*
        * Once either YES or NO has been successfully recorded,
        * this one-time prompt closes.
        */
        setShowPrompt(false);
    } catch (error) {
      console.error("Unable to save marketing preference:", error);

      setErrorMessage(
        "We couldn't save your preference. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Do not interrupt HiveTag while the preference is being checked.
   * The prompt appears only after we know the stored value is NULL.
   */
  if (checking || !showPrompt) {
    return children;
  }

  return (
    <>
      {children}

      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketing-consent-title"
        aria-describedby="marketing-consent-description"
      >
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <h2
            id="marketing-consent-title"
            className="text-2xl font-bold text-[#1a3329]"
          >
            Keep up to date with HiveTag
          </h2>

          <p
            id="marketing-consent-description"
            className="mt-3 text-sm leading-6 text-gray-700"
          >
            Would you like to receive occasional emails about HiveTag news,
            new features and useful beekeeping resources?
          </p>

          <p className="mt-3 text-xs leading-5 text-gray-500">
            This is optional. Your choice will not affect your HiveTag account,
            and you can change your preference later in Settings.
          </p>

          {errorMessage && (
            <div
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => savePreference(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              No thanks
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => savePreference(true)}
              className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Yes, keep me updated"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketingConsentGate;