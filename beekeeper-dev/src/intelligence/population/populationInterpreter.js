// src/intelligence/population/populationInterpreter.js

import { INSIGHT_LEVELS } from "../constants/insightLevels";
import { PRIORITIES } from "../constants/priorities";
import { CONFIDENCE } from "../constants/confidence";
import { INTELLIGENCE_ENGINES } from "../constants/engines";
import { normaliseValue } from "../helpers/normalise";

function makeInsight({
  id,
  title,
  summary,
  level,
  priority,
  confidence,
  evidence,
  recommendation,
  inspection,
}) {
  return {
    id,
    engine: INTELLIGENCE_ENGINES.POPULATION,
    title,
    summary,
    level,
    priority,
    confidence,
    evidence,
    recommendation,
    source: {
      inspectionId: inspection?.id || null,
      hiveId: inspection?.hive_id || null,
      apiaryId: inspection?.apiary_id || null,
      date: inspection?.date || null,
    },
  };
}

export function analysePopulation(inspection = {}) {
  const insights = [];
  const population = normaliseValue(inspection.hive_population);

  if (["strong", "very strong", "high"].includes(population)) {
    insights.push(
      makeInsight({
        id: "POP-001",
        title: "Strong Colony",
        summary: "The colony population was recorded as strong.",
        level: INSIGHT_LEVELS.GOOD,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.HIGH,
        evidence: [`Population: ${inspection.hive_population}`],
        recommendation: "Continue routine inspections and monitor available space.",
        inspection,
      })
    );
  } else if (["average", "medium", "moderate"].includes(population)) {
    insights.push(
      makeInsight({
        id: "POP-002",
        title: "Average Colony",
        summary: "The colony population was recorded as average or moderate.",
        level: INSIGHT_LEVELS.INFO,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.MEDIUM,
        evidence: [`Population: ${inspection.hive_population}`],
        recommendation: "Continue routine monitoring.",
        inspection,
      })
    );
    } else if (["weak", "low", "small"].includes(population)) {
    insights.push(
      makeInsight({
        id: "POP-003",
        title: "Low Colony Population",
        summary: `The colony population was recorded as ${
          inspection.hive_population || "low"
        }.`,
        level: INSIGHT_LEVELS.WATCH,
        priority: PRIORITIES.MONITOR,
        confidence: CONFIDENCE.MEDIUM,
        evidence: [`Population: ${inspection.hive_population || "Low"}`],
        recommendation:
          "Monitor colony population and compare it with the next inspection.",
        inspection,
      })
    );
  } else {
    insights.push(
      makeInsight({
        id: "POP-000",
        title: "Population Not Recorded",
        summary: "Colony population was not recorded for this inspection.",
        level: INSIGHT_LEVELS.INFO,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.UNKNOWN,
        evidence: [],
        recommendation: "Record colony population during future inspections.",
        inspection,
      })
    );
  }

  return {
    engine: INTELLIGENCE_ENGINES.POPULATION,
    insights,
  };
}