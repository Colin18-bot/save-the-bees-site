// src/intelligence/core/hiveSummaryBuilder.js

import { INSIGHT_LEVELS } from "../constants/insightLevels";
import { PRIORITIES } from "../constants/priorities";

const priorityRank = {
  [PRIORITIES.CRITICAL]: 4,
  [PRIORITIES.IMPORTANT]: 3,
  [PRIORITIES.MONITOR]: 2,
  [PRIORITIES.INFO]: 1,
};

const levelScoreImpact = {
  [INSIGHT_LEVELS.GOOD]: 12,
  [INSIGHT_LEVELS.INFO]: 0,
  [INSIGHT_LEVELS.WATCH]: -8,
  [INSIGHT_LEVELS.WARNING]: -15,
  [INSIGHT_LEVELS.CRITICAL]: -30,
};

const getHealthBand = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Monitor";
  if (score >= 35) return "Needs Attention";
  return "Urgent Attention";
};

const getImpactType = (points) => {
  if (points > 0) return "positive";
  if (points < 0) return "negative";
  return "neutral";
};

const buildScoreBreakdown = (insights = []) => {
  const items = insights.map((insight) => {
    const points = levelScoreImpact[insight.level] || 0;

    return {
      title: insight.title || "Inspection finding",
      summary: insight.summary || "",
      points,
      type: getImpactType(points),
      level: insight.level,
      priority: insight.priority,
    };
  });

  const positive = items.filter((item) => item.points > 0);
  const negative = items.filter((item) => item.points < 0);
  const neutral = items.filter((item) => item.points === 0);

  return {
    baseScore: 60,
    items,
    positive,
    negative,
    neutral,
  };
};

export function buildHiveSummary(analysis = {}) {
  const insights = analysis.insights || [];
  const scoreBreakdown = buildScoreBreakdown(insights);

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      scoreBreakdown.baseScore +
        scoreBreakdown.items.reduce((total, item) => total + item.points, 0)
    )
  );

  const positiveFindings = insights.filter(
    (insight) => insight.level === INSIGHT_LEVELS.GOOD
  );

  const attentionItems = insights
    .filter((insight) =>
      [PRIORITIES.CRITICAL, PRIORITIES.IMPORTANT, PRIORITIES.MONITOR].includes(
        insight.priority
      )
    )
    .sort(
      (a, b) =>
        (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
    );

  const recommendations = [
    ...new Set(
      insights
        .map((insight) => insight.recommendation)
        .filter(Boolean)
    ),
  ];

  const evidence = [
    ...new Set(
      insights.flatMap((insight) => insight.evidence || []).filter(Boolean)
    ),
  ];

  return {
    healthScore,
    healthBand: getHealthBand(healthScore),
    scoreBreakdown,
    overallStatus:
      attentionItems.length > 0
        ? "Some items may need attention"
        : "No immediate concerns identified",
    positiveFindings,
    attentionItems,
    recommendations,
    evidence,
  };
}