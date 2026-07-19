// src/intelligence/seasonal/seasonalEngine.js

function getMonthFromInspection(inspection = {}) {
  const date = inspection.date ? new Date(inspection.date) : new Date();

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getMonth() + 1;
}

export function analyseSeasonalContext(inspection = {}) {
  const month = getMonthFromInspection(inspection);

  if (!month) {
    return {
      id: "SE-000",
      season: "Unknown",
      level: "Unknown",
      message: "Seasonal context could not be assessed because the inspection date is invalid.",
      prompts: ["Check the inspection date."],
    };
  }

  if ([3, 4].includes(month)) {
    return {
      id: "SE-001",
      season: "Spring Build-up",
      level: "Monitor",
      message:
        "This inspection falls during spring build-up. Colonies may be expanding and food reserves should be monitored.",
      prompts: [
        "Check food stores during variable spring weather.",
        "Monitor brood expansion.",
        "Confirm queen activity where possible.",
      ],
    };
  }

  if ([5, 6, 7].includes(month)) {
    return {
      id: "SE-002",
      season: "Swarm Season",
      level: "Important",
      message:
        "This inspection falls during the main swarm season. Space, queen cells and colony congestion should be monitored carefully.",
      prompts: [
        "Check carefully for queen cells.",
        "Monitor brood box congestion.",
        "Ensure the colony has suitable space.",
      ],
    };
  }

  if (month === 8) {
    return {
      id: "SE-003",
      season: "Late Summer",
      level: "Monitor",
      message:
        "This inspection falls during late summer. Food stores, colony strength and varroa monitoring become increasingly important.",
      prompts: [
        "Review food stores.",
        "Monitor colony strength.",
        "Review varroa observations and treatment records.",
      ],
    };
  }

  if ([9, 10].includes(month)) {
    return {
      id: "SE-004",
      season: "Autumn Preparation",
      level: "Important",
      message:
        "This inspection falls during autumn preparation. Winter readiness, food stores and colony strength should be reviewed.",
      prompts: [
        "Check whether stores are sufficient for winter preparation.",
        "Review colony strength.",
        "Ensure any required autumn tasks are planned.",
      ],
    };
  }

  return {
    id: "SE-005",
    season: "Winter Period",
    level: "Caution",
    message:
      "This inspection falls during the winter period. Disturbance should normally be minimised and checks should focus on external observations where appropriate.",
    prompts: [
      "Avoid unnecessary disturbance.",
      "Monitor from outside where possible.",
      "Check for signs of weather damage or starvation risk.",
    ],
  };
}
