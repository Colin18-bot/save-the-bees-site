// src/intelligence/food/foodInterpreter.js

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
    engine: INTELLIGENCE_ENGINES.FOOD,
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

export function analyseFood(inspection = {}) {
  const insights = [];
  const foodStores = normaliseValue(inspection.food_stores);

  if (["excellent", "full", "heavy"].includes(foodStores)) {
    insights.push(
      makeInsight({
        id: "FD-001",
        title: "Excellent Food Stores",
        summary: "Food stores were recorded as excellent or full.",
        level: INSIGHT_LEVELS.GOOD,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.HIGH,
        evidence: [`Food stores: ${inspection.food_stores}`],
        recommendation: "Continue routine inspections.",
        inspection,
      })
    );
  } else if (["good", "adequate"].includes(foodStores)) {
    insights.push(
      makeInsight({
        id: "FD-002",
        title: "Good Food Stores",
        summary: "Food stores appear adequate.",
        level: INSIGHT_LEVELS.GOOD,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.HIGH,
        evidence: [`Food stores: ${inspection.food_stores}`],
        recommendation: "Continue monitoring stores during routine inspections.",
        inspection,
      })
    );
  } else if (["medium", "moderate"].includes(foodStores)) {
    insights.push(
      makeInsight({
        id: "FD-003",
        title: "Moderate Food Stores",
        summary: "Food stores were recorded as moderate.",
        level: INSIGHT_LEVELS.INFO,
        priority: PRIORITIES.MONITOR,
        confidence: CONFIDENCE.MEDIUM,
        evidence: [`Food stores: ${inspection.food_stores}`],
        recommendation: "Monitor food stores at the next inspection.",
        inspection,
      })
    );
  } else if (["low", "very low", "poor"].includes(foodStores)) {
    insights.push(
      makeInsight({
        id: "FD-004",
        title: "Low Food Stores",
        summary: "Food stores were recorded as low.",
        level: INSIGHT_LEVELS.WARNING,
        priority: PRIORITIES.IMPORTANT,
        confidence: CONFIDENCE.HIGH,
        evidence: [`Food stores: ${inspection.food_stores}`],
        recommendation:
          "Consider feeding if weather, forage and colony condition require it.",
        inspection,
      })
    );
  } else {
    insights.push(
      makeInsight({
        id: "FD-000",
        title: "Food Stores Not Recorded",
        summary: "Food stores were not recorded for this inspection.",
        level: INSIGHT_LEVELS.INFO,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.UNKNOWN,
        evidence: [],
        recommendation: "Record food stores during future inspections.",
        inspection,
      })
    );
  }

  return {
    engine: INTELLIGENCE_ENGINES.FOOD,
    insights,
  };
}