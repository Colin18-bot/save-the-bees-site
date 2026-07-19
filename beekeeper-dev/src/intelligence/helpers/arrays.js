// src/intelligence/helpers/arrays.js

import { normaliseValue } from "./normalise";

export const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (value === null || value === undefined || value === "") return [];

  if (typeof value === "string" && value.includes(",")) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value].filter(Boolean);
};

export const normaliseArray = (value) => toArray(value).map(normaliseValue);

export const includesAny = (value, matches = []) => {
  const values = normaliseArray(value);
  const targets = matches.map(normaliseValue);
  return targets.some((target) => values.includes(target));
};

export const includesText = (value, text) =>
  normaliseArray(value).some((item) => item.includes(normaliseValue(text)));
