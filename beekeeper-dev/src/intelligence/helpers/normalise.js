// src/intelligence/helpers/normalise.js

export const cleanValue = (value) => String(value ?? "").trim();

export const normaliseValue = (value) =>
  cleanValue(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

export const isBlank = (value) => cleanValue(value) === "";

export const hasValue = (value) => !isBlank(value);
