// src/intelligence/history/historyEngine.js

/**
 * Returns every inspection for a hive ordered oldest -> newest.
 */
export function buildHiveHistory(hiveId, inspections = []) {
  return inspections
    .filter((inspection) => inspection.hive_id === hiveId)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
}

/**
 * Returns the latest inspection.
 */
export function getLatestInspection(history = []) {
  if (!history.length) return null;

  return history[history.length - 1];
}

/**
 * Returns the previous inspection.
 */
export function getPreviousInspection(history = []) {
  if (history.length < 2) return null;

  return history[history.length - 2];
}