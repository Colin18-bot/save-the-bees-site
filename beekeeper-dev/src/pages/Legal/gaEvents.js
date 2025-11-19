// Lightweight wrapper so we only send GA events if analytics is allowed.
import { canUse } from "./CookieConsent";

/**
 * Fire a GA4 event safely (only if consented and gtag is available).
 * @param {string} name - event name, e.g. "hive_create"
 * @param {object} params - optional event params (must be flat key/value pairs)
 */
export function trackEvent(name, params = {}) {
  try {
    if (!canUse("analytics")) return;          // respect consent
    if (typeof window === "undefined") return; // SSR safety
    if (typeof window.gtag !== "function") return; // GA not loaded yet
    window.gtag("event", name, params);
  } catch (_) {
    // swallow (never break UX for analytics)
  }
}
