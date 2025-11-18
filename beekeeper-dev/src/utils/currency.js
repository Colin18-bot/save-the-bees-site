// src/utils/currency.js

export const symbolFor = (ccy) => ({ GBP: "£", EUR: "€", USD: "$" }[ccy] || ccy);

/**
 * Convert amount from -> to using an FX table where all rates are quoted to a single base.
 * fx = { base: "GBP", rates: { GBP:1, EUR:1.16, USD:1.30 } }
 */
export function convertAmount(amount, from, to, fx) {
  if (!amount || from === to) return Number(amount) || 0;

  const _base = fx?.base || "GBP"; // renamed to _base to mark intentionally unused
  const rates = fx?.rates || { GBP: 1, EUR: 1.16, USD: 1.30 };

  // If either 'from' or 'to' missing in table, return original
  if (!rates[from] || !rates[to]) return Number(amount) || 0;

  // Convert via base: amount[from] -> base -> to
  // amountInBase = amount / rate[from]
  // amountInTo   = amountInBase * rate[to]
  const amountInBase = (Number(amount) || 0) / rates[from];
  return amountInBase * rates[to];
}

export function formatMoney(amount) {
  const n = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return n.toFixed(2);
}
