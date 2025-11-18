// src/hooks/useFxRates.js
import { useEffect, useState } from "react";

/**
 * Shape in localStorage ("prefs.fxRates"), if you override:
 * {
 *   "base": "GBP",
 *   "rates": { "GBP": 1, "EUR": 1.16, "USD": 1.30 }
 * }
 *
 * Conversion uses cross rates via the "rates" dictionary where all entries are relative to "base".
 */
const DEFAULT_FX = {
  base: "GBP",
  rates: {
    GBP: 1,
    EUR: 1.16, // example only
    USD: 1.30  // example only
  }
};

export default function useFxRates() {
  const [fx, setFx] = useState(() => {
    try {
      const raw = localStorage.getItem("prefs.fxRates");
      if (!raw) return DEFAULT_FX;
      const parsed = JSON.parse(raw);
      // Basic sanity checks
      if (!parsed?.base || typeof parsed?.rates !== "object") return DEFAULT_FX;
      return parsed;
    } catch {
      return DEFAULT_FX;
    }
  });

  useEffect(() => {
    const onFx = () => {
      try {
        const raw = localStorage.getItem("prefs.fxRates");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.base && parsed?.rates) setFx(parsed);
      } catch {
        // ignore
      }
    };
    window.addEventListener("prefs:fxRates", onFx);
    return () => window.removeEventListener("prefs:fxRates", onFx);
  }, []);

  return fx; // { base, rates }
}
