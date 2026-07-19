// src/intelligence/queen/queenInterpreter.js

import { INSIGHT_LEVELS } from "../constants/insightLevels";
import { PRIORITIES } from "../constants/priorities";
import { CONFIDENCE } from "../constants/confidence";
import { INTELLIGENCE_ENGINES } from "../constants/engines";
import { includesAny, toArray } from "../helpers/arrays";

const queenSeen = (inspection = {}) =>
  includesAny(inspection.queen_status, ["seen", "queen seen"]);

const eggsSeen = (inspection = {}) =>
  includesAny(inspection.queen_status, ["eggs", "eggs seen"]);

const queenCellsPresent = (inspection = {}) =>
  inspection.queen_cells &&
  !includesAny(inspection.queen_cells, ["none", "no", "not seen"]);

const makeQueenInsight = ({
  id,
  title,
  summary,
  level,
  priority,
  confidence,
  evidence,
  recommendation,
  inspection,
}) => ({
  id,
  engine: INTELLIGENCE_ENGINES.QUEEN,
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
});

export const analyseQueen = (inspection = {}) => {
  const insights = [];

  const queenStatusValues = toArray(inspection.queen_status);
  const hasQueenData = queenStatusValues.length > 0;

  if (queenSeen(inspection) && eggsSeen(inspection)) {
    insights.push(
      makeQueenInsight({
        id: "QN-001",
        title: "Queen Confirmed",
        summary: "The queen was seen and eggs were recorded.",
        level: INSIGHT_LEVELS.GOOD,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.HIGH,
        evidence: ["Queen seen", "Eggs recorded"],
        recommendation: "Continue routine inspections.",
        inspection,
      })
    );
  } else if (eggsSeen(inspection)) {
    insights.push(
      makeQueenInsight({
        id: "QN-002",
        title: "Queen Likely Present",
        summary:
          "Eggs were recorded, which usually suggests recent queen activity.",
        level: INSIGHT_LEVELS.GOOD,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.MEDIUM,
        evidence: ["Eggs recorded"],
        recommendation: "Continue monitoring queen status during routine inspections.",
        inspection,
      })
    );
  } else if (hasQueenData) {
    insights.push(
      makeQueenInsight({
        id: "QN-003",
        title: "Queen Not Confirmed",
        summary:
          "Queen status was checked, but the queen or eggs were not confirmed.",
        level: INSIGHT_LEVELS.WATCH,
        priority: PRIORITIES.MONITOR,
        confidence: CONFIDENCE.MEDIUM,
        evidence: queenStatusValues,
        recommendation:
          "Check carefully for eggs, young larvae and queen status at the next inspection.",
        inspection,
      })
    );
  }

  if (queenCellsPresent(inspection)) {
    insights.push(
      makeQueenInsight({
        id: "QN-004",
        title: "Queen Cells Present",
        summary: "Queen cells were recorded during this inspection.",
        level: INSIGHT_LEVELS.WARNING,
        priority: PRIORITIES.IMPORTANT,
        confidence: CONFIDENCE.MEDIUM,
        evidence: [`Queen cells: ${inspection.queen_cells}`],
        recommendation:
          "Review swarm, supersedure or emergency queen cell context before deciding next action.",
        inspection,
      })
    );
  }

  if (!insights.length) {
    insights.push(
      makeQueenInsight({
        id: "QN-000",
        title: "Queen Evidence Not Recorded",
        summary:
          "There is not enough queen-related evidence in this inspection to generate a queen insight.",
        level: INSIGHT_LEVELS.INFO,
        priority: PRIORITIES.INFO,
        confidence: CONFIDENCE.UNKNOWN,
        evidence: ["Queen status not recorded"],
        recommendation:
          "Record queen status, eggs or queen cells during future inspections where possible.",
        inspection,
      })
    );
  }

  return {
    engine: INTELLIGENCE_ENGINES.QUEEN,
    insights,
  };
};