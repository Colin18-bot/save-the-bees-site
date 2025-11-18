// src/hooks/useCurrencyPreference.js
import { useEffect, useState } from "react";

export default function useCurrencyPreference() {
  const [currency, setCurrency] = useState(
    () => (localStorage.getItem("prefs.currency") || "GBP").toUpperCase()
  );

  useEffect(() => {
    const onCurrency = (e) => {
      const next =
        (e?.detail?.currency || localStorage.getItem("prefs.currency") || "GBP").toUpperCase();
      setCurrency(next);
    };
    window.addEventListener("prefs:currency", onCurrency);
    return () => window.removeEventListener("prefs:currency", onCurrency);
  }, []);

  return currency;
}
