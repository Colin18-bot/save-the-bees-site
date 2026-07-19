// src/intelligence/core/intelligenceEngine.js

import { intelligenceModules } from "../modules";
import { buildHiveSummary } from "./hiveSummaryBuilder";

export function analyseInspection(inspection = {}) {
  const moduleResults = intelligenceModules.map((analyse) =>
    analyse(inspection)
  );

  const insights = moduleResults.flatMap(
    (result) => result.insights || []
  );

  const summary = buildHiveSummary({ insights });

  return {
    inspectionId: inspection.id || null,
    analysedAt: new Date().toISOString(),
    modules: moduleResults,
    insights,
    summary,
  };
}