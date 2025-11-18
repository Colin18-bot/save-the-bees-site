// src/AnalyticsGate.jsx
// Loads GA4 only if the user has granted analytics consent.
// Uses Consent Mode v2 signals and stays no-op until consent is present.

import { useEffect } from "react";

// Optional: read GA ID from env, fallback to your current ID.
const GA_ID =
  (import.meta?.env && import.meta.env.VITE_GA_ID) || "G-T1974NZN05";

// LocalStorage key your cookie banner/settings will write to.
// Expected shape: { analytics: boolean, marketing: boolean, ... }
const CONSENT_LS_KEY = "cookie-consent";

function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_LS_KEY);
    if (!raw) return { necessary: true, analytics: false, marketing: false };
    const obj = JSON.parse(raw);
    return {
      necessary: true,
      analytics: !!obj.analytics,
      marketing: !!obj.marketing,
    };
  } catch {
    return { necessary: true, analytics: false, marketing: false };
  }
}

function ensureDataLayer() {
  // Safe to call multiple times
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
}

function setConsentDefaults() {
  // Start fully denied until user opts in
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

function applyConsentModeFromStorage() {
  const c = readConsent();
  const analytics = c.analytics ? "granted" : "denied";
  const ads = c.marketing ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: analytics,
  });
}

function consentAllowsAnalytics() {
  return readConsent().analytics === true;
}

function loadGAOnceIfAllowed() {
  if (!GA_ID) return;
  if (!consentAllowsAnalytics()) return;
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;

  // Official GA4 loader
  const s1 = document.createElement("script");
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  s1.async = true;
  document.head.appendChild(s1);

  // Bootstrap + config
  const s2 = document.createElement("script");
  s2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });

    // Enable GA debug on localhost
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      gtag('set', 'debug_mode', true);
    }
  `;
  document.head.appendChild(s2);

  // Apply current consent after GA is ready
  applyConsentModeFromStorage();
}

export default function AnalyticsGate() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    ensureDataLayer();
    setConsentDefaults();

    // Try to load immediately (covers users who already consented earlier)
    loadGAOnceIfAllowed();

    // React to your banner/settings broadcasting updates
    const onConsentUpdated = () => {
      applyConsentModeFromStorage();
      loadGAOnceIfAllowed();
    };
    window.addEventListener("cookie-consent:updated", onConsentUpdated);

    // Also react if consent changes in another tab
    const onStorage = (e) => {
      if (e.key === CONSENT_LS_KEY) onConsentUpdated();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cookie-consent:updated", onConsentUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
