// src/intelligence/change/compareValues.js

import { normaliseValue } from "../helpers/normalise";

const valueRanks = {
  brood_pattern: {
    patchy: 1,
    average: 2,
    good: 3,
    excellent: 4,
  },

  food_stores: {
    low: 1,
    moderate: 2,
    good: 3,
    excellent: 4,
  },

  hive_population: {
    weak: 1,
    average: 2,
    strong: 3,
  },
};

export function compareRankedValue(field, previousValue, currentValue) {
  const ranks = valueRanks[field];

  if (!ranks) {
    return "unknown";
  }

  const previousRank = ranks[normaliseValue(previousValue)];
  const currentRank = ranks[normaliseValue(currentValue)];

  if (!previousRank || !currentRank) {
    return "unknown";
  }

  if (currentRank > previousRank) return "improved";
  if (currentRank < previousRank) return "declined";

  return "unchanged";
}