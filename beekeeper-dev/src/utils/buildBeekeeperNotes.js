// src/utils/buildBeekeeperNotes.js
// Shared logic to turn month + forecast into { icon, text } notes
// Used by Dashboard and Weather pages for "Seasonal Advice – Beekeeper Notes".

export function buildBeekeeperNotes({
  monthIndex,
  tempsMin = [],
  tempsMax = [],
  windsMax = [],
  precs = [],
  unit = "C",       // "C" or "F"
  windUnit = "kmh", // "kmh" or "mph"
} = {}) {
  const out = [];

  // --- Helpers for labels ---
  const toF = (c) => Math.round((c * 9) / 5 + 32);
  const tempLabel = (c) => (unit === "C" ? `${c}°C` : `${toF(c)}°F`);
  const windLabel = windUnit === "kmh" ? "km/h" : "mph";

  const month = Number.isInteger(monthIndex)
    ? monthIndex
    : new Date().getMonth(); // 0–11

  // Safeguard arrays (some may be empty)
  const safeTempsMin = tempsMin.filter(Number.isFinite);
  const safeTempsMax = tempsMax.filter(Number.isFinite);
  const safeWindsMax = windsMax.filter(Number.isFinite);
  const safePrecs = precs.filter(Number.isFinite);

  const minTemp = safeTempsMin.length ? Math.min(...safeTempsMin) : 99;
  const maxTemp = safeTempsMax.length ? Math.max(...safeTempsMax) : 0;
  const strongWindThresholdKmh = 40;
  const maxWind = safeWindsMax.length ? Math.max(...safeWindsMax) : 0;
  const heavyRain = safePrecs.some((mm) => mm >= 10);

  // ---------- MONTH / SEASON PROFILE ----------
  if (month === 11 || month === 0 || month === 1) {
    // Dec–Feb: winter
    if (month === 0) {
      out.push({
        icon: "📆",
        text:
          "January – deep winter. Avoid full inspections unless there is a clear emergency, such as suspected starvation or damage.",
      });
    } else if (month === 1) {
      out.push({
        icon: "📆",
        text:
          "February – colonies are building up brood but weather is still unreliable. Keep the hive closed apart from brief emergency checks.",
      });
    } else {
      out.push({
        icon: "📆",
        text:
          "December – mid-winter. Colonies should be settled with adequate stores and secure hive hardware.",
      });
    }

    out.push({
      icon: "🍬",
      text:
        "Winter feeding – many beekeepers use fondant above the crown board hole and judge food levels by hefting rather than pulling frames.",
    });
    out.push({
      icon: "❄️",
      text: `Foraging is usually very limited below about ${tempLabel(
        10
      )}. Expect little or no flight; bees mainly rely on stored food.`,
    });
    out.push({
      icon: "🛠️",
      text:
        "After storms, frost or snow, check entrances are clear, roofs are secure and stands remain stable.",
    });
  } else if (month >= 2 && month <= 4) {
    // Mar–May: spring
    if (month === 2) {
      out.push({
        icon: "📆",
        text:
          "March – early spring. Brood is expanding but cold snaps are common. Only open colonies on the best, calm days and keep inspections short.",
      });
    } else if (month === 3) {
      out.push({
        icon: "📆",
        text:
          "April – main build-up. Regular inspections become possible when it is mild and calm; avoid chilling brood.",
      });
    } else {
      out.push({
        icon: "📆",
        text:
          "May – strong build-up and early swarm season. Regular inspections in suitable weather are usually required.",
      });
    }

    out.push({
      icon: "🍯",
      text: `Below around ${tempLabel(
        10
      )} there is limited foraging: light colonies can still starve quickly after cold or wet spells.`,
    });
    out.push({
      icon: "🔍",
      text: `Many beekeepers find full inspections most comfortable once day-time highs are around ${tempLabel(
        15
      )} and conditions are calm. Between ${tempLabel(
        10
      )}–${tempLabel(14)} checks are usually brief and focused.`,
    });
    out.push({
      icon: "⚠️",
      text:
        "Spring build-up – monitor colony weight and brood pattern; emergency fondant or warm syrup on mild days may be needed if colonies feel worryingly light.",
    });
  } else if (month >= 5 && month <= 7) {
    // Jun–Aug: summer
    if (month === 5) {
      out.push({
        icon: "📆",
        text:
          "June – peak season. Strong colonies and active swarm control are common in suitable weather.",
      });
    } else if (month === 6) {
      out.push({
        icon: "📆",
        text:
          "July – main honey flow in many areas. Balance space, supers and swarm prevention.",
      });
    } else {
      out.push({
        icon: "📆",
        text:
          "August – main flow tapers in many regions. Focus on honey removal, colony strength and planning treatments.",
      });
    }

    out.push({
      icon: "🌼",
      text:
        "Warm, light-wind days with temperatures above about 15°C are generally good for inspections and foraging.",
    });
    out.push({
      icon: "🪱",
      text:
        "Late summer is a key window for Varroa treatment. Always follow product temperature, timing and safety guidance.",
    });
  } else if (month >= 8 && month <= 10) {
    // Sep–Nov: autumn
    if (month === 8) {
      out.push({
        icon: "📆",
        text:
          "September – early autumn. Assess brood, colony strength and winter stores; begin autumn feeding if needed.",
      });
    } else if (month === 9) {
      out.push({
        icon: "📆",
        text:
          "October – late autumn. Finish syrup feeding while it is still warm enough for bees to ripen and cap it.",
      });
    } else {
      out.push({
        icon: "📆",
        text:
          "November – early winter. Avoid disturbing the brood nest; use hefting and fondant if colonies feel light.",
      });
    }

    out.push({
      icon: "🍯",
      text:
        "Autumn feeding – use syrup during warmer spells; once consistently colder, switch to fondant for top-up feeding.",
    });
    out.push({
      icon: "💧",
      text:
        "Moisture kills more bees than cold. Keep roofs sound, hives off the ground, and provide modest ventilation without big draughts.",
    });
  }

  // ---------- LIVE WEATHER-DRIVEN NOTES ----------

  // Strong winds
  if (maxWind >= strongWindThresholdKmh) {
    const thresholdText =
      windUnit === "kmh"
        ? `≥${strongWindThresholdKmh} ${windLabel}`
        : `≥${Math.round(strongWindThresholdKmh * 0.621371)} ${windLabel}`;
    out.push({
      icon: "💨",
      text: `Strong winds expected (${thresholdText}). Avoid opening hives; secure roofs and add straps or weights if needed.`,
    });
  }

  // Heavy rain
  if (heavyRain) {
    out.push({
      icon: "🌧️",
      text:
        "Heavy rain in the forecast. Foraging will be poor; many beekeepers plan manipulations for drier, calmer windows.",
    });
  }

  // Temperature-based foraging & inspection notes
  if (minTemp <= 5 || maxTemp < 10) {
    out.push({
      icon: "🥶",
      text: `Forecast highs below about ${tempLabel(
        10
      )}. Expect little or no foraging – colonies mainly rely on stored food.`,
    });
  } else if (maxTemp >= 10 && maxTemp < 15) {
    out.push({
      icon: "🍃",
      text: `Day-time highs between roughly ${tempLabel(
        10
      )} and ${tempLabel(
        15
      )}. Short checks may be possible in bright, calm spells but avoid long brood exposure.`,
    });
  }

  if (maxTemp < 10) {
    out.push({
      icon: "🚫🐝",
      text: `Day-time highs below ${tempLabel(
        10
      )}. Full inspections risk chilling brood and stressing the colony – avoid unless absolutely essential.`,
    });
  } else if (maxTemp >= 10 && maxTemp < 15) {
    out.push({
      icon: "⚠️",
      text: `Day-time highs around ${tempLabel(
        10
      )}–${tempLabel(
        15
      )}. If you decide to open colonies, keep the brood nest exposed for the shortest possible time.`,
    });
  } else if (maxTemp >= 15 && maxWind < strongWindThresholdKmh) {
    out.push({
      icon: "✅",
      text: `At least one mild, calmer day near ${tempLabel(
        15
      )} or above is forecast. Conditions are generally suitable for normal inspections if needed.`,
    });
  }

  // Hot spell
  const hotThresholdC = 28;
  if (maxTemp >= hotThresholdC) {
    out.push({
      icon: "🥵",
      text: `Hot spell likely (around ${tempLabel(
        hotThresholdC
      )} or above). Ensure plenty of water and ventilation, and avoid long inspections in the middle of the day.`,
    });
  }

  return out;
}
