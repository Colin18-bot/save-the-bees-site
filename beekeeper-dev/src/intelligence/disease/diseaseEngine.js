// src/intelligence/disease/diseaseEngine.js

const severityRank = {
  Critical: 5,
  High: 4,
  Important: 3,
  Medium: 2,
  Monitor: 1,
  Low: 1,
  Information: 0,
  None: 0,
};

function normaliseDiseases(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function createFinding({
  id,
  disease,
  level,
  message,
  recommendation,
  evidence,
}) {
  return {
    id,
    disease,
    level,
    message,
    evidence: evidence || [`Disease type: ${disease}`],
    recommendation,
  };
}

export function analyseDiseaseRisk(inspection = {}) {
  const diseases = normaliseDiseases(inspection.disease_types);
  const findings = [];

  if (diseases.includes("AFB")) {
    findings.push(
      createFinding({
        id: "BH-003-AFB",
        disease: "AFB",
        level: "Critical",
        message:
          "American foulbrood has been recorded. This is a serious and notifiable bee health concern.",
        recommendation:
          "Follow official bee health reporting requirements immediately and avoid moving bees, combs or equipment until advised.",
      })
    );
  }

  if (diseases.includes("EFB")) {
    findings.push(
      createFinding({
        id: "BH-003-EFB",
        disease: "EFB",
        level: "High",
        message:
          "European foulbrood has been recorded. This is a notifiable bee health concern.",
        recommendation:
          "Follow official bee health reporting requirements and any instructions provided by the bee inspector.",
      })
    );
  }

  if (diseases.includes("Chalkbrood")) {
    findings.push(
      createFinding({
        id: "BH-003-CHALK",
        disease: "Chalkbrood",
        level: "Low",
        message:
          "Chalkbrood signs were recorded during this inspection.",
        recommendation:
          "Continue monitoring brood condition, colony strength and whether signs improve or worsen.",
      })
    );
  }

  if (diseases.includes("Sacbrood")) {
    findings.push(
      createFinding({
        id: "BH-003-SAC",
        disease: "Sacbrood",
        level: "Low",
        message:
          "Sacbrood signs were recorded during this inspection.",
        recommendation:
          "Monitor brood condition and record whether symptoms persist at the next inspection.",
      })
    );
  }

  if (diseases.includes("Nosema")) {
    findings.push(
      createFinding({
        id: "BH-003-NOSEMA",
        disease: "Nosema",
        level: "Monitor",
        message:
          "Signs associated with Nosema were recorded during this inspection.",
        recommendation:
          "Review colony condition and seek appropriate guidance if symptoms persist or worsen.",
      })
    );
  }

  if (diseases.includes("Dead bees")) {
    findings.push(
      createFinding({
        id: "BH-003-DEAD-BEES",
        disease: "Dead bees",
        level: "Monitor",
        message:
          "Unusual numbers of dead bees were recorded during this inspection.",
        recommendation:
          "Review the extent and location of the mortality and monitor for further losses or other symptoms.",
      })
    );
  }

  if (diseases.includes("Other")) {
    const otherDetail = String(inspection.disease_other || "").trim();

    findings.push(
      createFinding({
        id: "BH-003-OTHER",
        disease: "Other",
        level: "Monitor",
        message: otherDetail
          ? `Another disease concern was recorded: ${otherDetail}.`
          : "Another disease concern was recorded during this inspection.",
        evidence: [
          otherDetail
            ? `Other disease concern: ${otherDetail}`
            : "Other disease concern recorded",
        ],
        recommendation:
          "Review the recorded observation and seek appropriate bee health advice if the cause is uncertain.",
      })
    );
  }

  /*
   * Varroa is handled by the separate Varroa intelligence engine.
   * Do not create a second disease finding here, otherwise the same
   * observation may be reported twice.
   */

  if (findings.length === 0) {
    return {
      id: "BH-001",
      level: "None",
      message: "No disease indicators have been recorded.",
      evidence: [],
      recommendation:
        "Continue routine inspections and record any disease signs if observed.",
      findings: [],
    };
  }

  const sortedFindings = [...findings].sort(
    (a, b) =>
      (severityRank[b.level] || 0) - (severityRank[a.level] || 0)
  );

  const highestFinding = sortedFindings[0];

  return {
    id: highestFinding.id,
    level: highestFinding.level,
    message:
      findings.length === 1
        ? highestFinding.message
        : `${findings.length} disease concerns were recorded during this inspection.`,
    evidence: findings.flatMap((finding) => finding.evidence || []),
    recommendation: highestFinding.recommendation,
    findings,
  };
}