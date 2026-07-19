// src/intelligence/change/detectChanges.js

import { compareRankedValue } from "./compareValues";
import { compareQueen } from "./compareQueen";
import { compareQueenCells } from "./compareQueenCells";

const fieldsToCompare = [
  {
    field: "brood_pattern",
    label: "Brood pattern",
  },
  {
    field: "food_stores",
    label: "Food stores",
  },
  {
    field: "hive_population",
    label: "Population",
  },
];

export function detectChanges(previousInspection = {}, currentInspection = {}) {
  const changes = fieldsToCompare.map(({ field, label }) => ({
    field,
    label,
    previousValue: previousInspection?.[field] || null,
    currentValue: currentInspection?.[field] || null,
    direction: compareRankedValue(
      field,
      previousInspection?.[field],
      currentInspection?.[field]
    ),
  }));

  changes.unshift(compareQueenCells(previousInspection, currentInspection));
  changes.unshift(compareQueen(previousInspection, currentInspection));

  return changes;
}