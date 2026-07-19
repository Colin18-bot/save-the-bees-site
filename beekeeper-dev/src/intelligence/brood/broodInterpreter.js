// src/intelligence/brood/broodInterpreter.js

import { INSIGHT_LEVELS } from "../constants/insightLevels";
import { PRIORITIES } from "../constants/priorities";
import { CONFIDENCE } from "../constants/confidence";
import { INTELLIGENCE_ENGINES } from "../constants/engines";

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
    engine: INTELLIGENCE_ENGINES.BROOD,
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

export function analyseBrood(inspection = {}) {

  const insights = [];

    switch ((inspection.brood_pattern || "").trim().toLowerCase()) {
    case "excellent":
      insights.push(
        makeInsight({
          id: "BR-001",
          title: "Excellent Brood Pattern",
          summary: "The brood pattern indicates a very healthy laying queen.",
          level: INSIGHT_LEVELS.GOOD,
          priority: PRIORITIES.INFO,
          confidence: CONFIDENCE.HIGH,
          evidence: ["Excellent brood pattern"],
          recommendation: "Continue routine inspections.",
          inspection,
        })
      );
      break;

    case "good":
    case "solid":
      insights.push(
        makeInsight({
          id: "BR-002",
          title: "Solid Brood Pattern",
          summary: "A solid brood pattern was recorded.",
          level: INSIGHT_LEVELS.GOOD,
          priority: PRIORITIES.INFO,
          confidence: CONFIDENCE.HIGH,
          evidence: [`Brood pattern: ${inspection.brood_pattern}`],
          recommendation: "Continue routine inspections.",
          inspection,
        })
      );
      break;

    case "patchy":
    case "spotty":
      insights.push(
        makeInsight({
          id: "BR-004",
          title: "Spotty Brood Pattern",
          summary: "A spotty brood pattern was recorded.",
          level: INSIGHT_LEVELS.WARNING,
          priority: PRIORITIES.IMPORTANT,
          confidence: CONFIDENCE.MEDIUM,
          evidence: [`Brood pattern: ${inspection.brood_pattern}`],
          recommendation:
            "Review brood carefully at the next inspection and consider possible queen, disease or brood-health causes.",
          inspection,
        })
      );
      break;

    default:
      insights.push(
        makeInsight({
          id: "BR-000",
          title: "No Brood Information",
          summary: "No brood pattern was recorded.",
          level: INSIGHT_LEVELS.INFO,
          priority: PRIORITIES.INFO,
          confidence: CONFIDENCE.UNKNOWN,
          evidence: [],
          recommendation:
            "Record brood observations during future inspections.",
          inspection,
        })
      );
  }

  return {
    engine: INTELLIGENCE_ENGINES.BROOD,
    insights,
  };
}