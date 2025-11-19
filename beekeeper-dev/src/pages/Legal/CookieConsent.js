// src/pages/Legal/CookieConsent.js
// Lightweight consent store using localStorage.
// No optional cookies (like Google Analytics) until user gives consent.

const STORAGE_KEY = "cookie-consent";

export const DEFAULT_CONSENT = {
  necessary: true,   // always required
  analytics: false,  // Google Analytics disabled until accepted
  marketing: false,  // marketing disabled until accepted
  date: null,        // timestamp of decision
};

export function getConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONSENT };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONSENT, ...parsed };
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

export function setConsent(partial) {
  const next = { ...getConsent(), ...partial, date: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  // Broadcast to the rest of the app
  window.dispatchEvent(
    new CustomEvent("cookie-consent:updated", { detail: next })
  );

  return next;
}

export function resetConsent() {
  localStorage.removeItem(STORAGE_KEY);

  const reset = { ...DEFAULT_CONSENT };
  window.dispatchEvent(
    new CustomEvent("cookie-consent:updated", { detail: reset })
  );

  return reset;
}

export function canUse(category) {
  const c = getConsent();
  return !!c[category];
}
