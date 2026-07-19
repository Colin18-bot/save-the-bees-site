// src/intelligence/change/compareQueen.js

function hasQueenEvidence(inspection = {}) {
  const status = inspection.queen_status || [];

  return (
    status.includes("Queen seen") ||
    status.includes("Eggs")
  );
}

export function compareQueen(previous = {}, current = {}) {
  const previousQueen = hasQueenEvidence(previous);
  const currentQueen = hasQueenEvidence(current);

  if (previousQueen && currentQueen) {
    return {
      field: "queen",
      direction: "unchanged",
      message: "Queen evidence remains present.",
    };
  }

  if (!previousQueen && currentQueen) {
    return {
      field: "queen",
      direction: "improved",
      message: "Queen evidence is now present.",
    };
  }

  if (previousQueen && !currentQueen) {
    return {
      field: "queen",
      direction: "declined",
      message: "Queen evidence is no longer present.",
    };
  }

  return {
    field: "queen",
    direction: "unchanged",
    message: "No queen evidence recorded in either inspection.",
  };
}