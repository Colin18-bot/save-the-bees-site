// src/intelligence/helpers/values.js

import { normaliseValue } from "./normalise";

export const valueMatches = (value, matches = []) =>
  matches.map(normaliseValue).includes(normaliseValue(value));

export const valueInGroup = (value, group = []) => valueMatches(value, group);

export const firstAvailableValue = (...values) =>
  values.find((value) => value !== null && value !== undefined && String(value).trim() !== "") ?? "";
