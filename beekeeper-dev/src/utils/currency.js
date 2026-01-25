// src/utils/currency.js

export const symbolFor = (ccy) => ({ GBP: "£", EUR: "€", USD: "$" }[ccy] || ccy);

/**
 * Convert amount from -> to using an FX table where all rates are quoted to a single base.
 * fx = { base: "GBP", rates: { GBP:1, EUR:1.16, USD:1.30 } }
 *
 * Convention assumed:
 * - rates[currency] = 1 unit of base buys "rates[currency]" units of currency
 *   (so base -> currency is multiply; currency -> base is divide)
 */
export function convertAmount(amount, from, to, fx) {
  const n = Number(amount);
  if (!Number.isFinite(n) || from === to) return Number.isFinite(n) ? n : 0;

  const base = (fx?.base || "GBP").toUpperCase();
  const rates = fx?.rates || { GBP: 1, EUR: 1.16, USD: 1.3 };

  const fromCcy = (from || base).toUpperCase();
  const toCcy = (to || base).toUpperCase();

  // Ensure base exists in the table
  const safeRates = { ...rates };
  if (!safeRates[base]) safeRates[base] = 1;

  if (!safeRates[fromCcy] || !safeRates[toCcy]) return n;

  // If 'from' is base: base -> to
  if (fromCcy === base) return n * safeRates[toCcy];

  // If 'to' is base: from -> base
  if (toCcy === base) return n / safeRates[fromCcy];

  // from -> base -> to
  const amountInBase = n / safeRates[fromCcy];
  return amountInBase * safeRates[toCcy];
}

export function formatMoney(amount) {
  const n = Number(amount);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}
