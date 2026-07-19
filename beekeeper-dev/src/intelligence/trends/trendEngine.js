// src/intelligence/trends/trendEngine.js

import { analyseInspection } from "../core";
import { compareRankedValue } from "../change";
import { normaliseValue } from "../helpers/normalise";

function getFirstAndLast(history = []) {
  if (!history.length) {
    return {
      first: null,
      last: null,
    };
  }

  return {
    first: history[0],
    last: history[history.length - 1],
  };
}

function hasQueenEvidence(inspection = {}) {
  const status = inspection.queen_status || [];

  return (
    status.includes("Queen seen") ||
    status.includes("Eggs")
  );
}

function buildRankedTrend({
  id,
  field,
  label,
  history,
}) {
  const { first, last } = getFirstAndLast(history);

  if (!first || !last || first.id === last.id) {
    return {
      id,
      field,
      label,
      direction: "unknown",
      message: `${label} trend cannot be assessed yet.`,
    };
  }

  const direction = compareRankedValue(
    field,
    first[field],
    last[field]
  );

  if (direction === "improved") {
    return {
      id,
      field,
      label,
      direction,
      message: `${label} has improved across the recorded history.`,
    };
  }

  if (direction === "declined") {
    return {
      id,
      field,
      label,
      direction,
      message: `${label} has declined across the recorded history.`,
    };
  }

  if (direction === "unchanged") {
    return {
      id,
      field,
      label,
      direction,
      message: `${label} has remained stable across the recorded history.`,
    };
  }

  return {
    id,
    field,
    label,
    direction: "unknown",
    message: `${label} trend could not be assessed from the available records.`,
  };
}

function buildHealthTrend(history = []) {
  if (history.length < 2) {
    return {
      id: "TR-HEALTH-000",
      field: "health_score",
      label: "Health score",
      direction: "unknown",
      message: "Health score trend cannot be assessed yet.",
    };
  }

  const firstScore = analyseInspection(history[0]).summary.healthScore;
  const lastScore = analyseInspection(history[history.length - 1]).summary.healthScore;
  const difference = lastScore - firstScore;

  if (difference > 0) {
    return {
      id: "TR-HEALTH-001",
      field: "health_score",
      label: "Health score",
      direction: "improved",
      message: `Overall colony health is improving across the recorded history (${firstScore}/100 to ${lastScore}/100).`,
      change: difference,
    };
  }

  if (difference < 0) {
    return {
      id: "TR-HEALTH-002",
      field: "health_score",
      label: "Health score",
      direction: "declined",
      message: `Overall colony health has declined across the recorded history (${firstScore}/100 to ${lastScore}/100).`,
      change: difference,
    };
  }

  return {
    id: "TR-HEALTH-003",
    field: "health_score",
    label: "Health score",
    direction: "unchanged",
    message: `Overall colony health has remained stable across the recorded history (${lastScore}/100).`,
    change: 0,
  };
}

function buildQueenTrend(history = []) {
  const inspectionsWithQueenEvidence = history.filter(hasQueenEvidence).length;

  if (!history.length) {
    return {
      id: "TR-QUEEN-000",
      field: "queen_status",
      label: "Queen evidence",
      direction: "unknown",
      message: "Queen evidence trend cannot be assessed yet.",
    };
  }

  if (inspectionsWithQueenEvidence === history.length) {
    return {
      id: "TR-QUEEN-001",
      field: "queen_status",
      label: "Queen evidence",
      direction: "unchanged",
      message: "Queen evidence has been consistently recorded across the inspection history.",
    };
  }

  if (inspectionsWithQueenEvidence === 0) {
    return {
      id: "TR-QUEEN-002",
      field: "queen_status",
      label: "Queen evidence",
      direction: "declined",
      message: "Queen evidence has not been recorded in the available inspection history.",
    };
  }

  const latestHasQueenEvidence = hasQueenEvidence(history[history.length - 1]);

  if (latestHasQueenEvidence) {
    return {
      id: "TR-QUEEN-003",
      field: "queen_status",
      label: "Queen evidence",
      direction: "improved",
      message: "Queen evidence is present in the latest inspection after being inconsistent historically.",
    };
  }

  return {
    id: "TR-QUEEN-004",
    field: "queen_status",
    label: "Queen evidence",
    direction: "declined",
    message: "Queen evidence is not present in the latest inspection after being recorded previously.",
  };
}

export function analyseHiveTrends(history = []) {
  const orderedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    inspectionCount: orderedHistory.length,
    trends: [
      buildHealthTrend(orderedHistory),
      buildQueenTrend(orderedHistory),
      buildRankedTrend({
        id: "TR-BROOD-001",
        field: "brood_pattern",
        label: "Brood quality",
        history: orderedHistory,
      }),
      buildRankedTrend({
        id: "TR-FOOD-001",
        field: "food_stores",
        label: "Food stores",
        history: orderedHistory,
      }),
      buildRankedTrend({
        id: "TR-POP-001",
        field: "hive_population",
        label: "Population",
        history: orderedHistory,
      }),
    ],
  };
}
