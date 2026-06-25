// src/utils/hiveIntelligence.js

export const INSIGHT_LEVELS = {
  GOOD: "good",
  INFO: "info",
  WATCH: "watch",
  WARNING: "warning",
  CRITICAL: "critical",
};

const clean = (value) => String(value ?? "").trim();
const lower = (value) => clean(value).toLowerCase();

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [value].filter(Boolean);
};

const hasBoolean = (value) =>
  value === true ||
  lower(value) === "yes" ||
  lower(value) === "true" ||
  lower(value) === "1";

const includesAny = (items, matches) => {
  const loweredItems = asArray(items).map(lower);
  return matches.some((match) => loweredItems.includes(lower(match)));
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const sortByDateDesc = (rows = []) =>
  [...rows].sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));

const daysSince = (dateValue) => {
  if (!dateValue) return null;
  const then = new Date(dateValue);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  const diff = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export const getHealthBand = (score) => {
  if (score >= 85) return { label: "Excellent", level: INSIGHT_LEVELS.GOOD };
  if (score >= 70) return { label: "Good", level: INSIGHT_LEVELS.GOOD };
  if (score >= 55) return { label: "Monitor", level: INSIGHT_LEVELS.WATCH };
  if (score >= 35) return { label: "Needs attention", level: INSIGHT_LEVELS.WARNING };
  return { label: "Urgent attention", level: INSIGHT_LEVELS.CRITICAL };
};

export const calculateInspectionHealthScore = (inspection = {}) => {
  let score = 60;

  const queenStatus = asArray(inspection.queen_status);
  const queenSeen = includesAny(queenStatus, ["Seen", "Queen seen"]);
  const eggsSeen = includesAny(queenStatus, ["Eggs", "Eggs seen"]);

  if (queenSeen && eggsSeen) score += 18;
  else if (queenSeen || eggsSeen) score += 12;
  else if (queenStatus.length) score -= 12;

  if (["solid", "good", "excellent"].includes(lower(inspection.brood_pattern))) score += 10;
  if (["spotty", "poor", "patchy"].includes(lower(inspection.brood_pattern))) score -= 8;

  if (["strong", "very strong", "high"].includes(lower(inspection.hive_population))) score += 8;
  if (["low", "weak", "small"].includes(lower(inspection.hive_population))) score -= 10;

  if (["full", "good", "heavy", "adequate"].includes(lower(inspection.food_stores))) score += 6;
  if (["low", "very low", "poor"].includes(lower(inspection.food_stores))) score -= 12;

  if (["calm", "gentle"].includes(lower(inspection.colony_behavior))) score += 5;
  if (["aggressive", "defensive", "angry"].includes(lower(inspection.colony_behavior))) score -= 5;

  if (hasBoolean(inspection.varroa_seen)) score -= 8;
  if (hasBoolean(inspection.signs_pests)) score -= 8;
  if (hasBoolean(inspection.signs_disease)) score -= 18;

  const finalScore = clamp(score);

  return {
    score: finalScore,
    band: getHealthBand(finalScore),
  };
};

export const buildInspectionInsights = (inspection = {}) => {
  const insights = [];

  const queenStatus = asArray(inspection.queen_status);
  const queenSeen = includesAny(queenStatus, ["Seen", "Queen seen"]);
  const eggsSeen = includesAny(queenStatus, ["Eggs", "Eggs seen"]);

  if (queenSeen && eggsSeen) {
    insights.push({
      level: INSIGHT_LEVELS.GOOD,
      title: "Queen confirmed",
      summary: "The queen was seen and eggs were recorded.",
      confidence: "High",
      evidence: ["Queen seen", "Eggs recorded"],
    });
  } else if (queenSeen || eggsSeen) {
    insights.push({
      level: INSIGHT_LEVELS.GOOD,
      title: "Queen likely present",
      summary: queenSeen
        ? "The queen was seen during this inspection."
        : "Eggs were recorded, which usually indicates recent queen activity.",
      confidence: queenSeen ? "High" : "Medium",
      evidence: queenSeen ? ["Queen seen"] : ["Eggs recorded"],
    });
  } else if (queenStatus.length) {
    insights.push({
      level: INSIGHT_LEVELS.WARNING,
      title: "Queen not confirmed",
      summary: "Queen status was checked but queen or eggs were not confirmed.",
      confidence: "Medium",
      evidence: ["Queen not recorded", "Eggs not recorded"],
    });
  }

  if (
    ["strong", "very strong", "high"].includes(lower(inspection.hive_population)) ||
    ["7-8", "9+", "9", "10+"].includes(clean(inspection.frames_of_bees))
  ) {
    insights.push({
      level: INSIGHT_LEVELS.GOOD,
      title: "Strong colony",
      summary: "The colony appears strong based on the recorded population or frame coverage.",
      confidence: "High",
      evidence: ["Strong population or high frame coverage"],
    });
  }

  if (["solid", "good", "excellent"].includes(lower(inspection.brood_pattern))) {
    insights.push({
      level: INSIGHT_LEVELS.GOOD,
      title: "Healthy brood pattern",
      summary: "A good brood pattern was recorded.",
      confidence: "High",
      evidence: [`Brood pattern: ${inspection.brood_pattern}`],
    });
  }

  if (["spotty", "poor", "patchy"].includes(lower(inspection.brood_pattern))) {
    insights.push({
      level: INSIGHT_LEVELS.WATCH,
      title: "Brood pattern needs monitoring",
      summary: "The brood pattern may need closer monitoring.",
      confidence: "Medium",
      evidence: [`Brood pattern: ${inspection.brood_pattern}`],
    });
  }

  if (["low", "very low", "poor"].includes(lower(inspection.food_stores))) {
    insights.push({
      level: INSIGHT_LEVELS.WARNING,
      title: "Low food stores",
      summary: "Food stores were recorded as low.",
      confidence: "High",
      evidence: [`Food stores: ${inspection.food_stores}`],
    });
  }

  if (["full", "good", "heavy", "adequate"].includes(lower(inspection.food_stores))) {
    insights.push({
      level: INSIGHT_LEVELS.GOOD,
      title: "Good food stores",
      summary: "Food stores were recorded as adequate or strong.",
      confidence: "High",
      evidence: [`Food stores: ${inspection.food_stores}`],
    });
  }

  if (
    ["charged", "sealed"].includes(lower(inspection.queen_cells)) ||
    ["high", "very high"].includes(lower(inspection.brood_box_congestion))
  ) {
    insights.push({
      level: INSIGHT_LEVELS.WARNING,
      title: "Swarm risk",
      summary: "Queen cells or high brood box congestion were recorded.",
      confidence: "Medium",
      evidence: [
        inspection.queen_cells ? `Queen cells: ${inspection.queen_cells}` : null,
        inspection.brood_box_congestion ? `Brood box congestion: ${inspection.brood_box_congestion}` : null,
      ].filter(Boolean),
    });
  }

  if (hasBoolean(inspection.varroa_seen)) {
    insights.push({
      level: INSIGHT_LEVELS.WARNING,
      title: "Varroa seen",
      summary: "Varroa was recorded during this inspection.",
      confidence: "High",
      evidence: ["Varroa seen"],
    });
  }

  if (hasBoolean(inspection.signs_disease)) {
    insights.push({
      level: INSIGHT_LEVELS.CRITICAL,
      title: "Disease concern",
      summary: "Signs of disease were recorded.",
      confidence: "High",
      evidence: ["Disease signs recorded", ...asArray(inspection.disease_types)],
    });
  }

  if (hasBoolean(inspection.signs_pests)) {
    insights.push({
      level: INSIGHT_LEVELS.WATCH,
      title: "Pest concern",
      summary: "Signs of pests were recorded.",
      confidence: "Medium",
      evidence: ["Pest signs recorded", ...asArray(inspection.pest_types)],
    });
  }

  if (!insights.length) {
    insights.push({
      level: INSIGHT_LEVELS.INFO,
      title: "Inspection recorded",
      summary: "No automated alerts were generated from this inspection.",
      confidence: "Low",
      evidence: ["Inspection saved"],
    });
  }

  return insights;
};

export const buildInspectionRecommendations = (inspection = {}) => {
  const recommendations = [];

  if (["low", "very low", "poor"].includes(lower(inspection.food_stores))) {
    recommendations.push("Consider feeding if weather, nectar flow or colony condition requires it.");
  }

  if (
    ["charged", "sealed"].includes(lower(inspection.queen_cells)) ||
    ["high", "very high"].includes(lower(inspection.brood_box_congestion))
  ) {
    recommendations.push("Review swarm prevention or swarm control options.");
  }

  if (hasBoolean(inspection.varroa_seen)) {
    recommendations.push("Review varroa monitoring records and treatment thresholds.");
  }

  if (hasBoolean(inspection.signs_disease)) {
    recommendations.push("Record symptoms clearly and follow the appropriate bee health guidance.");
  }

  if (!recommendations.length) {
    recommendations.push("No immediate intervention flagged by the recorded inspection data.");
  }

  return recommendations;
};

export const getPriorityRank = (level) => {
  if (level === INSIGHT_LEVELS.CRITICAL) return 5;
  if (level === INSIGHT_LEVELS.WARNING) return 4;
  if (level === INSIGHT_LEVELS.WATCH) return 3;
  if (level === INSIGHT_LEVELS.INFO) return 2;
  return 1;
};

export const analyzeInspection = (inspection = {}) => {
  const health = calculateInspectionHealthScore(inspection);
  const insights = buildInspectionInsights(inspection);
  const recommendations = buildInspectionRecommendations(inspection);

  return {
    healthScore: health.score,
    healthBand: health.band,
    insights,
    recommendations,
  };
};

export const compareInspections = (current = {}, previous = {}) => {
  if (!previous?.id) {
    return ["This is the first inspection available for comparison."];
  }

  const changes = [];

  const compareField = (label, key) => {
    const now = clean(current[key]);
    const before = clean(previous[key]);
    if (now && before && now !== before) {
      changes.push(`${label} changed from ${before} to ${now}.`);
    }
  };

  compareField("Population", "hive_population");
  compareField("Brood pattern", "brood_pattern");
  compareField("Food stores", "food_stores");
  compareField("Colony behaviour", "colony_behavior");
  compareField("Queen cells", "queen_cells");

  const currentQueen = asArray(current.queen_status).join(", ");
  const previousQueen = asArray(previous.queen_status).join(", ");
  if (currentQueen && previousQueen && currentQueen !== previousQueen) {
    changes.push(`Queen status changed from ${previousQueen} to ${currentQueen}.`);
  }

  if (!hasBoolean(previous.varroa_seen) && hasBoolean(current.varroa_seen)) {
    changes.push("Varroa was recorded this time but not in the previous inspection.");
  }

  if (!hasBoolean(previous.signs_disease) && hasBoolean(current.signs_disease)) {
    changes.push("Disease signs were recorded this time but not in the previous inspection.");
  }

  return changes.length ? changes : ["No major changes detected compared with the previous inspection."];
};

export const buildShareableInspectionSummary = (inspection = {}) => {
  const analysis = analyzeInspection(inspection);

  return [
    "HiveTag Inspection Summary",
    "",
    `Health score: ${analysis.healthScore}/100 (${analysis.healthBand.label})`,
    "",
    "Insights:",
    ...analysis.insights.map((item) => `- ${item.title}: ${item.summary}`),
    "",
    "Recommendations:",
    ...analysis.recommendations.map((item) => `- ${item}`),
    inspection.notes ? "" : null,
    inspection.notes ? "Notes:" : null,
    inspection.notes || null,
  ]
    .filter(Boolean)
    .join("\n");
};

export const analyzeHiveIntelligence = ({ hive = {}, inspections = [], todos = [] } = {}) => {
  const hiveInspections = sortByDateDesc(
    inspections.filter((inspection) => String(inspection.hive_id) === String(hive.id))
  );

  const hiveTodos = todos.filter((todo) => String(todo.hive_id) === String(hive.id));
  const latest = hiveInspections[0] || null;
  const previous = hiveInspections[1] || null;
  const latestAnalysis = latest ? analyzeInspection(latest) : null;
  const daysSinceInspection = latest ? daysSince(latest.date || latest.created_at) : null;

  const attention = [];

  const pushAttention = (item) => {
    attention.push({
      hiveId: hive.id,
      hiveName: hive.name || "Unnamed hive",
      ...item,
    });
  };

  if (!latest) {
    pushAttention({
      level: INSIGHT_LEVELS.WARNING,
      title: "No inspection recorded",
      summary: "This hive does not have an inspection record yet.",
      confidence: "High",
      action: "Add the first inspection record.",
    });
  } else if (daysSinceInspection !== null && daysSinceInspection >= 18) {
    pushAttention({
      level: INSIGHT_LEVELS.WARNING,
      title: "Inspection overdue",
      summary: `This hive has not been inspected for ${daysSinceInspection} days.`,
      confidence: "High",
      action: "Consider inspecting this hive soon.",
    });
  } else if (daysSinceInspection !== null && daysSinceInspection >= 12) {
    pushAttention({
      level: INSIGHT_LEVELS.WATCH,
      title: "Inspection due soon",
      summary: `This hive was last inspected ${daysSinceInspection} days ago.`,
      confidence: "Medium",
      action: "Plan the next inspection.",
    });
  }

  const recentThree = hiveInspections.slice(0, 3);
  const queenMissingCount = recentThree.filter((inspection) => {
    const queenStatus = asArray(inspection.queen_status);
    return queenStatus.length > 0 && !includesAny(queenStatus, ["Seen", "Queen seen", "Eggs", "Eggs seen"]);
  }).length;

  if (recentThree.length >= 2 && queenMissingCount >= 2) {
    pushAttention({
      level: INSIGHT_LEVELS.WARNING,
      title: "Queen not confirmed recently",
      summary: "Queen or eggs have not been confirmed in recent inspections.",
      confidence: "Medium",
      action: "Check for eggs, brood pattern and queen status at the next inspection.",
    });
  }

  const lowFoodStreak = recentThree.filter((inspection) =>
    ["low", "very low", "poor"].includes(lower(inspection.food_stores))
  ).length;

  if (recentThree.length >= 2 && lowFoodStreak >= 2) {
    pushAttention({
      level: INSIGHT_LEVELS.WARNING,
      title: "Food stores repeatedly low",
      summary: "Food stores have been low in more than one recent inspection.",
      confidence: "High",
      action: "Review feeding needs and forage conditions.",
    });
  }

  const varroaStreak = recentThree.filter((inspection) => hasBoolean(inspection.varroa_seen)).length;

  if (recentThree.length >= 2 && varroaStreak >= 2) {
    pushAttention({
      level: INSIGHT_LEVELS.WARNING,
      title: "Recurring varroa records",
      summary: "Varroa has been recorded in multiple recent inspections.",
      confidence: "High",
      action: "Review monitoring results and treatment thresholds.",
    });
  }

  if (latestAnalysis) {
    latestAnalysis.insights
      .filter((insight) => [INSIGHT_LEVELS.CRITICAL, INSIGHT_LEVELS.WARNING, INSIGHT_LEVELS.WATCH].includes(insight.level))
      .forEach((insight) => {
        pushAttention({
          level: insight.level,
          title: insight.title,
          summary: insight.summary,
          confidence: insight.confidence || "Medium",
          action: buildInspectionRecommendations(latest)[0],
        });
      });
  }

  const openTasks = hiveTodos.filter((todo) => !["complete", "completed"].includes(lower(todo.status)));
  const overdueTasks = openTasks.filter((todo) => todo.due_date && new Date(todo.due_date) < new Date());

  if (overdueTasks.length > 0) {
    pushAttention({
      level: INSIGHT_LEVELS.WATCH,
      title: "Open overdue tasks",
      summary: `${overdueTasks.length} task${overdueTasks.length === 1 ? "" : "s"} may be overdue for this hive.`,
      confidence: "High",
      action: "Review the task list.",
    });
  }

  const healthScore = latestAnalysis?.healthScore ?? 0;
  const healthBand = latestAnalysis?.healthBand ?? { label: "No data", level: INSIGHT_LEVELS.INFO };

  const status = attention.some((item) => item.level === INSIGHT_LEVELS.CRITICAL)
    ? INSIGHT_LEVELS.CRITICAL
    : attention.some((item) => item.level === INSIGHT_LEVELS.WARNING)
      ? INSIGHT_LEVELS.WARNING
      : attention.some((item) => item.level === INSIGHT_LEVELS.WATCH)
        ? INSIGHT_LEVELS.WATCH
        : INSIGHT_LEVELS.GOOD;

  return {
    hive,
    latestInspection: latest,
    previousInspection: previous,
    daysSinceInspection,
    healthScore,
    healthBand,
    status,
    openTasks: openTasks.length,
    attention: attention.sort((a, b) => getPriorityRank(b.level) - getPriorityRank(a.level)),
    changes: latest ? compareInspections(latest, previous) : ["No inspection history available."],
    recommendations: latest ? buildInspectionRecommendations(latest) : ["Create the first inspection record for this hive."],
  };
};

export const buildApiaryIntelligence = ({ hives = [], inspections = [], todos = [] } = {}) => {
  const hiveReports = hives.map((hive) => analyzeHiveIntelligence({ hive, inspections, todos }));

  const totalHealth = hiveReports.reduce((sum, report) => sum + (report.healthScore || 0), 0);
  const averageHealth = hiveReports.length ? Math.round(totalHealth / hiveReports.length) : 0;

  const attentionItems = hiveReports
    .flatMap((report) => report.attention.slice(0, 3))
    .sort((a, b) => getPriorityRank(b.level) - getPriorityRank(a.level));

  return {
    averageHealth,
    healthBand: getHealthBand(averageHealth),
    hiveReports,
    attentionItems,
    counts: {
      hives: hiveReports.length,
      healthy: hiveReports.filter((report) => report.status === INSIGHT_LEVELS.GOOD).length,
      monitor: hiveReports.filter((report) => report.status === INSIGHT_LEVELS.WATCH).length,
      needsAttention: hiveReports.filter((report) =>
        [INSIGHT_LEVELS.WARNING, INSIGHT_LEVELS.CRITICAL].includes(report.status)
      ).length,
      attentionItems: attentionItems.length,
    },
  };
};
