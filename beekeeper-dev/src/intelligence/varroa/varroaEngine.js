// src/intelligence/varroa/varroaEngine.js

import { normaliseValue } from "../helpers/normalise";

function hasTreatment(value) {
  const treatment = normaliseValue(value);
  return treatment && !["none", "not recorded", "no"].includes(treatment);
}

function normaliseMiteCount(value) {
  const miteCount = normaliseValue(value);

  if (["0", "none"].includes(miteCount)) return "none";
  if (["1-5", "1 to 5", "low"].includes(miteCount)) return "low";
  if (["6-20", "6 to 20", "moderate"].includes(miteCount)) return "moderate";
  if (["20+", "over 20", "high"].includes(miteCount)) return "high";

  return "unknown";
}

export function analyseVarroaRisk(inspection = {}) {
  const miteCount = normaliseMiteCount(inspection.varroa_mite_count);
  const varroaSeen = Boolean(inspection.varroa_seen);
  const treatmentRecorded = hasTreatment(inspection.varroa_treatment);

  if (miteCount === "high") {
    return {
      id: "VR-004",
      level: "High",
      direction: "declined",
      message:
        "A high varroa mite count has been recorded. This should be reviewed carefully.",
      evidence: [
        `Mite count: ${inspection.varroa_mite_count}`,
        varroaSeen ? "Varroa seen" : null,
        treatmentRecorded ? `Treatment recorded: ${inspection.varroa_treatment}` : null,
      ].filter(Boolean),
      recommendation:
        "Review varroa monitoring records and follow appropriate local guidance before deciding next action.",
    };
  }

  if (miteCount === "moderate") {
    return {
      id: "VR-003",
      level: "Medium",
      direction: "declined",
      message:
        "A moderate varroa mite count has been recorded.",
      evidence: [
        `Mite count: ${inspection.varroa_mite_count}`,
        varroaSeen ? "Varroa seen" : null,
        treatmentRecorded ? `Treatment recorded: ${inspection.varroa_treatment}` : null,
      ].filter(Boolean),
      recommendation:
        "Continue monitoring varroa levels and review treatment history if required.",
    };
  }

    if (miteCount === "low") {
    return {
      id: "VR-002",
      level: "Low",
      direction: "unchanged",
      message:
        "A low varroa mite count has been recorded.",
      evidence: [
        `Mite count: ${inspection.varroa_mite_count}`,
        varroaSeen ? "Varroa observed during inspection" : null,
        treatmentRecorded ? `Treatment recorded: ${inspection.varroa_treatment}` : null,
      ].filter(Boolean),
      recommendation:
        "Continue routine varroa monitoring.",
    };
  }

  if (varroaSeen) {
    return {
      id: "VR-006",
      level: "Monitor",
      direction: "unchanged",
      message:
        "Varroa was observed during this inspection. The observation alone does not indicate the infestation level.",
      evidence: [
        "Varroa observed during inspection",
        treatmentRecorded ? `Treatment recorded: ${inspection.varroa_treatment}` : null,
      ].filter(Boolean),
      recommendation:
        "Carry out an appropriate varroa monitoring method to establish the infestation level.",
    };
  }

  if (miteCount === "none") {
    return {
      id: "VR-001",
      level: "Very Low",
      direction: "improved",
      message:
        "No varroa mites were recorded in the current inspection data.",
      evidence: [`Mite count: ${inspection.varroa_mite_count}`],
      recommendation:
        "Continue routine monitoring at suitable intervals.",
    };
  }

  if (treatmentRecorded) {
    return {
      id: "VR-005",
      level: "Information",
      direction: "unchanged",
      message:
        "A varroa treatment has been recorded, but no mite count is available for this inspection.",
      evidence: [`Treatment recorded: ${inspection.varroa_treatment}`],
      recommendation:
        "Record mite counts where possible so treatment effectiveness can be reviewed over time.",
    };
  }

  return {
    id: "VR-000",
    level: "Unknown",
    direction: "unknown",
    message:
      "No varroa monitoring information was recorded for this inspection.",
    evidence: [],
    recommendation:
      "Record mite counts or varroa observations during future inspections where possible.",
  };
}
