// src/pages/Inspections/inspectionInsights.jsx

const isFullInspection = (insp) =>
  (insp?.inspection_type || "full_inspection") === "full_inspection";

const hasAnyQueenOrBroodEvidence = (insp) => {
  const queenStatus = Array.isArray(insp?.queen_status) ? insp.queen_status : [];

  return (
    queenStatus.length > 0 ||
    !!insp?.queen_cells ||
    !!insp?.brood_pattern ||
    !!insp?.brood_box_congestion ||
    !!insp?.frames_of_bees
  );
};

export const buildInspectionInsights = (insp) => {
  const insights = [];

  const fullInspection = isFullInspection(insp);
  const queenOrBroodChecked = hasAnyQueenOrBroodEvidence(insp);

  const queenStatus = Array.isArray(insp.queen_status) ? insp.queen_status : [];
  const queenSeen = queenStatus.includes("Seen");
  const eggsSeen = queenStatus.includes("Eggs");

  const queenCells = (insp.queen_cells || "").toLowerCase();
  const congestion = (insp.brood_box_congestion || "").toLowerCase();
  const frames = String(insp.frames_of_bees || "");
  const population = (insp.hive_population || "").toLowerCase();
  const brood = (insp.brood_pattern || "").toLowerCase();
  const stores = (insp.food_stores || "").toLowerCase();

  const strongFrames = frames === "7-8" || frames === "9+";
  const weakFrames = frames === "1-2";

  if (fullInspection) {
    if ((queenCells === "sealed" || queenCells === "charged") && congestion === "high") {
      insights.push({
        level: "high",
        title: "High swarm risk",
        reasons: ["Queen cells recorded", "High brood box congestion"],
      });
    } else if (queenCells === "cups" && ["medium", "high"].includes(congestion)) {
      insights.push({
        level: "medium",
        title: "Possible swarm preparation",
        reasons: ["Queen cups recorded", "Brood box congestion is increasing"],
      });
    }

    if (queenOrBroodChecked) {
      if (!queenSeen && !eggsSeen && queenStatus.length > 0) {
        insights.push({
          level: "high",
          title: "Possible queen issue",
          reasons: ["Queen not seen", "No eggs recorded"],
        });
      } else if (!queenSeen && eggsSeen) {
        insights.push({
          level: "low",
          title: "Queen likely present",
          reasons: ["Eggs were recorded"],
        });
      } else if (queenSeen && eggsSeen) {
        insights.push({
          level: "low",
          title: "Queen OK",
          reasons: ["Queen seen", "Eggs recorded"],
        });
      }
    }

    if (weakFrames || population === "low") {
      insights.push({
        level: "medium",
        title: "Weak colony",
        reasons: ["Low population or only 1–2 frames of bees"],
      });
    } else if (strongFrames && (population === "strong" || brood === "solid")) {
      insights.push({
        level: "low",
        title: "Strong colony",
        reasons: ["High bee coverage", "Strong population or solid brood"],
      });
    }
  }

  if (stores === "low") {
    insights.push({
      level: "high",
      title: "Low stores",
      reasons: ["Food stores marked as low"],
    });
  }

  if (insp.varroa_seen) {
    insights.push({
      level: "medium",
      title: "Varroa seen",
      reasons: ["Varroa was recorded during this inspection"],
    });
  }

  if (insp.signs_disease) {
    insights.push({
      level: "high",
      title: "Disease concern",
      reasons: ["Signs of disease recorded"],
    });
  }

  if (!fullInspection && insights.length === 0) {
    insights.push({
      level: "low",
      title: "External check recorded",
      reasons: ["No full brood inspection was carried out"],
    });
  }

  if (fullInspection && !queenOrBroodChecked && insights.length === 0) {
    insights.push({
      level: "low",
      title: "Observation recorded",
      reasons: ["No queen or brood checks were recorded"],
    });
  }

  return insights;
};

export const buildKitSuggestions = (insp) => {
  const kit = new Set();

  const fullInspection = isFullInspection(insp);
  const queenOrBroodChecked = hasAnyQueenOrBroodEvidence(insp);

  const queenCells = (insp.queen_cells || "").toLowerCase();
  const congestion = (insp.brood_box_congestion || "").toLowerCase();
  const frames = String(insp.frames_of_bees || "");
  const stores = (insp.food_stores || "").toLowerCase();

  const queenStatus = Array.isArray(insp.queen_status) ? insp.queen_status : [];
  const queenSeen = queenStatus.includes("Seen");
  const eggsSeen = queenStatus.includes("Eggs");

  if (fullInspection) {
    if ((queenCells === "sealed" || queenCells === "charged") && congestion === "high") {
      kit.add("spare brood box");
      kit.add("nuc box");
      kit.add("frames/foundation");
    }

    if (frames === "7-8" || frames === "9+") {
      kit.add("super");
      kit.add("queen excluder");
    }

    if (queenOrBroodChecked && queenStatus.length > 0 && !queenSeen && !eggsSeen) {
      kit.add("test frame");
    }
  }

  if (stores === "low") {
    kit.add("feed");
    kit.add("feeder");
  }

  if (insp.varroa_seen) {
    kit.add("monitoring kit");
  }

  return Array.from(kit);
};