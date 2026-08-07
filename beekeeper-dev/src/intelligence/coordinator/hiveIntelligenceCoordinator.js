// src/intelligence/coordinator/hiveIntelligenceCoordinator.js

import { analyseInspection } from "../core";
import { analyseHiveTrends } from "../trends";
import { analyseSwarmRisk } from "../swarm";
import { analyseVarroaRisk } from "../varroa";
import { analyseSeasonalContext } from "../seasonal";
import { analyseDiseaseRisk } from "../disease";
import { analyseQueenPerformance } from "../queenPerformance";
import { getLatestInspection, getPreviousInspection } from "../history";
import { detectChanges, buildChangeMessages, buildChangeSummary } from "../change";

const riskRank = {
  Critical: 5,
  High: 4,
  Important: 3,
  Medium: 3,
  Monitor: 2,
  Low: 1,
  Information: 1,
  "Very Low": 0,
  None: 0,
  Unknown: 0,
};

function normaliseRiskLevel(level) {
  if (["Critical", "High", "Important", "Medium", "Monitor", "Low", "Very Low", "None"].includes(level)) {
    return level;
  }

  return "Unknown";
}

function getHighestRisk(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      ...item,
      level: normaliseRiskLevel(item.level),
      rank: riskRank[normaliseRiskLevel(item.level)] ?? 0,
    }))
    .sort((a, b) => b.rank - a.rank)[0] || {
      level: "Unknown",
      label: "Unknown",
      message: "No risk data available.",
      rank: 0,
    };
}

function buildPriorityItems({
  baseAnalysis,
  swarmRisk,
  varroaRisk,
  diseaseRisk,
  queenPerformance,
  seasonalContext,
  changeMessages,
  trendResult,
}) {
  const items = [];

  if (Array.isArray(diseaseRisk?.findings) && diseaseRisk.findings.length > 0) {
    diseaseRisk.findings.forEach((finding) => {
      items.push({
        source: finding.disease || "Disease",
        level: finding.level || "Monitor",
        message: finding.message,
        recommendation:
          finding.recommendation ||
          "Review the recorded disease observation carefully.",
      });
    });
  } else if (
    diseaseRisk?.level &&
    !["None", "Unknown"].includes(diseaseRisk.level)
  ) {
    items.push({
      source: "Disease",
      level: diseaseRisk.level,
      message: diseaseRisk.message,
      recommendation:
        diseaseRisk.recommendation ||
        "Review recorded disease observations carefully.",
    });
  }

  if (swarmRisk?.level && !["Very Low", "Unknown"].includes(swarmRisk.level)) {
    items.push({
      source: "Swarm",
      level: swarmRisk.level,
      message: swarmRisk.message,
      recommendation: swarmRisk.recommendation,
    });
  }

  if (varroaRisk?.level && !["Very Low", "None", "Information", "Unknown"].includes(varroaRisk.level)) {
    items.push({
      source: "Varroa",
      level: varroaRisk.level,
      message: varroaRisk.message,
      recommendation: varroaRisk.recommendation,
    });
  }

  if (queenPerformance?.score !== undefined && queenPerformance.score < 60) {
    items.push({
      source: "Queen",
      level: "Important",
      message: queenPerformance.message,
      recommendation: queenPerformance.recommendations?.[0] || "Review queen evidence at the next inspection.",
    });
  }

  changeMessages
    .filter((change) => change.direction === "declined")
    .forEach((change) => {
      items.push({
        source: "Change",
        level: "Monitor",
        message: change.message,
        recommendation: "Review this change at the next inspection.",
      });
    });

  trendResult?.trends
    ?.filter((trend) => trend.direction === "declined")
    .forEach((trend) => {
      items.push({
        source: "Trend",
        level: "Monitor",
        message: trend.message,
        recommendation: "Monitor this trend over the next inspections.",
      });
    });

  baseAnalysis?.summary?.attentionItems?.forEach((item) => {
    items.push({
      source: item.engine || "Inspection",
      level: item.level || "Monitor",
      message: item.summary || item.title,
      recommendation: item.recommendation,
    });
  });

  return items
    .map((item) => ({
      ...item,
      level: normaliseRiskLevel(item.level),
      rank: riskRank[normaliseRiskLevel(item.level)] ?? 0,
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 5);
}

function buildRecommendedActions(priorityItems = [], baseAnalysis = {}) {
  const actions = [
    ...priorityItems.map((item) => item.recommendation).filter(Boolean),
    ...(baseAnalysis?.summary?.recommendations || []),
  ];

  return [...new Set(actions)].slice(0, 6);
}

function buildCoordinatorSummary({
  baseAnalysis,
  highestRisk,
  priorityItems,
  recommendedActions,
  seasonalContext,
}) {
  if (highestRisk.rank >= 4) {
    return "This hive has high-priority items that should be reviewed before relying on routine management.";
  }

  if (priorityItems.length > 0) {
    return "This hive has some items that should be monitored alongside normal inspection checks.";
  }

  if (baseAnalysis?.summary?.healthScore >= 85) {
    return "This hive appears strong from the available inspection evidence.";
  }

  if (seasonalContext?.level === "Important") {
    return "This hive appears stable, but the current season adds management context that should be considered.";
  }

  return "No major concerns were identified from the current intelligence data.";
}

export function coordinateHiveIntelligence({ history = [], inspection = null } = {}) {
  const safeHistory = Array.isArray(history) ? history.filter(Boolean) : [];
  const latestInspection = inspection || getLatestInspection(safeHistory) || null;

  // A hive with no inspection evidence is not unhealthy; it is simply unassessed.
  // Do not pass an empty object into the intelligence engines because missing
  // fields would otherwise be interpreted as negative inspection evidence.
  if (!latestInspection) {
    return {
      inspectionId: null,
      generatedAt: new Date().toISOString(),
      hasAssessment: false,
      overall: {
        healthScore: null,
        healthBand: "Unassessed",
        riskLevel: "Unassessed",
        riskSource: "No inspection",
        status:
          "No health assessment yet. Complete the first inspection to generate Hive Health intelligence.",
        confidence: "None",
      },
      priorityItems: [],
      recommendedActions: [],
      baseAnalysis: null,
      change: {
        scoreChange: null,
        detectedChanges: [],
        changeMessages: [],
        changeSummary: null,
      },
      trends: analyseHiveTrends(safeHistory),
      swarmRisk: null,
      varroaRisk: null,
      seasonalContext: null,
      diseaseRisk: null,
      queenPerformance: null,
    };
  }

  const previousInspection = getPreviousInspection(safeHistory);

  const baseAnalysis = analyseInspection(latestInspection);
  const previousAnalysis = previousInspection ? analyseInspection(previousInspection) : null;

  const scoreChange =
    previousAnalysis && baseAnalysis
      ? baseAnalysis.summary.healthScore - previousAnalysis.summary.healthScore
      : null;

  const detectedChanges =
    previousInspection && latestInspection
      ? detectChanges(previousInspection, latestInspection)
      : [];

  const changeMessages = buildChangeMessages(detectedChanges);
  const changeSummary = buildChangeSummary(detectedChanges, scoreChange);
  const trendResult = analyseHiveTrends(safeHistory);
  const swarmRisk = analyseSwarmRisk(latestInspection);
  const varroaRisk = analyseVarroaRisk(latestInspection);
  const seasonalContext = analyseSeasonalContext(latestInspection);
  const diseaseRisk = analyseDiseaseRisk(latestInspection);
  const queenPerformance = analyseQueenPerformance(latestInspection);

  const riskItems = [
    { source: "Disease", label: "Disease", ...diseaseRisk },
    { source: "Swarm", label: "Swarm", ...swarmRisk },
    { source: "Varroa", label: "Varroa", ...varroaRisk },
    { source: "Seasonal", label: "Seasonal", level: seasonalContext.level, message: seasonalContext.message },
  ];

  const highestRisk = getHighestRisk(riskItems);

  const priorityItems = buildPriorityItems({
    baseAnalysis,
    swarmRisk,
    varroaRisk,
    diseaseRisk,
    queenPerformance,
    seasonalContext,
    changeMessages,
    trendResult,
  });

  const recommendedActions = buildRecommendedActions(priorityItems, baseAnalysis);

  return {
    inspectionId: latestInspection?.id || null,
    generatedAt: new Date().toISOString(),
    hasAssessment: true,
    overall: {
      healthScore: baseAnalysis.summary.healthScore,
      healthBand: baseAnalysis.summary.healthBand,
      riskLevel: highestRisk.level,
      riskSource: highestRisk.source || highestRisk.label,
      status: buildCoordinatorSummary({
        baseAnalysis,
        highestRisk,
        priorityItems,
        recommendedActions,
        seasonalContext,
      }),
      confidence:
        safeHistory.length >= 3
          ? "High"
          : safeHistory.length >= 2
            ? "Medium"
            : "Low",
    },
    priorityItems,
    recommendedActions,
    baseAnalysis,
    change: {
      scoreChange,
      detectedChanges,
      changeMessages,
      changeSummary,
    },
    trends: trendResult,
    swarmRisk,
    varroaRisk,
    seasonalContext,
    diseaseRisk,
    queenPerformance,
  };
}
