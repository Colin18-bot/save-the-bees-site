// src/intelligence/swarm/swarmEngine.js

import { normaliseValue } from "../helpers/normalise";

export function analyseSwarmRisk(inspection = {}) {
  const queenCells = normaliseValue(inspection.queen_cells);

  if (queenCells === "sealed") {
    return {
      id: "SW-003",
      level: "High",
      direction: "declined",
      message:
        "Sealed queen cells were recorded. Swarm risk may be high and should be reviewed promptly.",
      evidence: [`Queen cells: ${inspection.queen_cells}`],
      recommendation:
        "Review colony space, queen cell context and swarm control options before deciding next action.",
    };
  }

  if (queenCells === "charged") {
    return {
      id: "SW-002",
      level: "Medium",
      direction: "declined",
      message:
        "Charged queen cells were recorded. Swarm preparation may be developing.",
      evidence: [`Queen cells: ${inspection.queen_cells}`],
      recommendation:
        "Inspect carefully and consider whether swarm control may be required.",
    };
  }

  if (queenCells === "emergency") {
    return {
      id: "SW-004",
      level: "Important",
      direction: "declined",
      message:
        "Emergency queen cells were recorded. This may indicate a queen-related issue rather than normal swarm preparation.",
      evidence: [`Queen cells: ${inspection.queen_cells}`],
      recommendation:
        "Check queen status, eggs, larvae and brood pattern before taking action.",
    };
  }

  if (queenCells === "play cups") {
    return {
      id: "SW-001",
      level: "Low",
      direction: "unchanged",
      message:
        "Play cups were recorded. This is useful to monitor but does not confirm swarm preparation.",
      evidence: [`Queen cells: ${inspection.queen_cells}`],
      recommendation:
        "Continue routine inspections and monitor for charged queen cells.",
    };
  }

  return {
    id: "SW-000",
    level: "Very Low",
    direction: "improved",
    message: "No queen-cell swarm indicators were recorded.",
    evidence: ["Queen cells: None"],
    recommendation: "Continue routine inspections.",
  };
}
