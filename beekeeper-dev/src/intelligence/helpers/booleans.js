// src/intelligence/helpers/booleans.js

import { normaliseValue } from "./normalise";

export const TRUE_VALUES = Object.freeze(["true", "yes", "y", "1", "seen", "recorded"]);
export const FALSE_VALUES = Object.freeze(["false", "no", "n", "0", "none", "not seen"]);

export const isTrue = (value) => {
  if (value === true) return true;
  if (value === false) return false;
  return TRUE_VALUES.includes(normaliseValue(value));
};

export const isFalse = (value) => {
  if (value === false) return true;
  if (value === true) return false;
  return FALSE_VALUES.includes(normaliseValue(value));
};

export const toKnownBoolean = (value) => {
  if (isTrue(value)) return true;
  if (isFalse(value)) return false;
  return null;
};
