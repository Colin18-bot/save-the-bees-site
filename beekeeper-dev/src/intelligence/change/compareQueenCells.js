// src/intelligence/change/compareQueenCells.js

import { normaliseValue } from "../helpers/normalise";

function hasQueenCells(value) {
  const normalised = normaliseValue(value);

  return (
    normalised &&
    !["none", "no", "not recorded"].includes(normalised)
  );
}

export function compareQueenCells(previous = {}, current = {}) {
  const previousHasCells = hasQueenCells(previous.queen_cells);
  const currentHasCells = hasQueenCells(current.queen_cells);

  if (!previousHasCells && currentHasCells) {
    return {
      field: "queen_cells",
      direction: "declined",
      message: "Queen cells are now present.",
    };
  }

  if (previousHasCells && !currentHasCells) {
    return {
      field: "queen_cells",
      direction: "improved",
      message: "Queen cells are no longer recorded.",
    };
  }

  if (previousHasCells && currentHasCells) {
    return {
      field: "queen_cells",
      direction: "unchanged",
      message: "Queen cells remain recorded.",
    };
  }

  return {
    field: "queen_cells",
    direction: "unchanged",
    message: "Queen cells remain not recorded.",
  };
}