// src/utils/buildBeekeeperNotes.js

// Build the array of advisory notes for the Weather & Seasonal Beekeeping panel.
// This is deliberately pure and UI-agnostic so you can reuse it on the Dashboard, etc.
export function buildBeekeeperNotes({
  daily,
  weather,
  unit = "C",       // "C" | "F"
  windUnit = "kmh", // "kmh" | "mph"
  warnings = [],
  pollen = null,
  timezone = "UTC", // currently unused, but passed in for future tweaks if needed
  now = null,       // optional Date override (useful for testing)
} = {}) {
  const out = [];

  const safeArr = (a) => (Array.isArray(a) ? a : []);

  // --- Time / season helpers ---
  let nowDate = now instanceof Date ? now : new Date();
  const currentTs = weather?.current?.time;
  if (currentTs) {
    if (typeof currentTs === "number") {
      nowDate = new Date(currentTs * 1000);
    } else {
      const parsed = Date.parse(currentTs);
      if (!Number.isNaN(parsed)) {
        nowDate = new Date(parsed);
      }
    }
  }
  const month = nowDate.getMonth(); // 0 = Jan … 11 = Dec

  const winds = safeArr(daily?.wind_speed_10m_max).filter(Number.isFinite);
  const precs = safeArr(daily?.precipitation_sum).filter(Number.isFinite);
  const tmins = safeArr(daily?.temperature_2m_min).filter(Number.isFinite);
  const tmaxs = safeArr(daily?.temperature_2m_max).filter(Number.isFinite);

  const windLabel = windUnit === "kmh" ? "km/h" : "mph";
  const toF = (c) => Math.round((c * 9) / 5 + 32);
  const tempLabel = (c) => {
    if (!Number.isFinite(c)) return "–";
    return unit === "C" ? `${c}°C` : `${toF(c)}°F`;
  };

  // --- Seasonal / month profile (lifted from your existing logic) ---

  if (month === 11 || month === 0 || month === 1) {
    // Dec–Feb: winter
    if (month === 0) {
      out.push({
        icon: "📆",
        text:
          "January – deep winter. Do not open colonies unless there is an emergency (for example, suspected starvation or damage).",
      });
    } else if (month === 1) {
      out.push({
        icon: "📆",
        text:
          "February – colonies are starting to brood up but weather is still unreliable. Continue to avoid full inspections.",
      });
    } else {
      out.push({
        icon: "📆",
        text: "December – mid-winter. Colonies should be settled with good stores and secure hives.",
      });
    }

    out.push({
      icon: "🍬",
      text:
        "Winter feeding – use fondant above the crown board hole. Check hive weight by hefting rather than opening boxes.",
    });
    out.push({
      icon: "❄️",
      text: `Foraging is minimal below about ${tempLabel(
        10
      )}. Expect very little flight; bees will mainly rely on stored food.`,
    });
    out.push({
      icon: "🛠️",
      text: "After storms, frost or snow, check straps, roofs and entrances and clear any blockages.",
    });
  } else if (month >= 2 && month <= 4) {
    // Mar–May: spring
    if (month === 2) {
      out.push({
        icon: "📆",
        text:
          "March – early spring. Brood is expanding, but cold snaps are still likely. Only inspect on the warmest, calmest days.",
      });
    } else if (month === 3) {
      out.push({
        icon: "📆",
        text:
          "April – main build-up. Choose mild, calm days for full inspections and keep them efficient to avoid chilling brood.",
      });
    } else {
      out.push({
        icon: "📆",
        text:
          "May – strong build-up and early swarm season. Regular inspections are usually possible in suitable weather.",
      });
    }

    out.push({
      icon: "🍯",
      text: `Below around ${tempLabel(
        10
      )} there will be little foraging; colonies depend heavily on stored food if the weather turns wet or cold.`,
    });
    out.push({
      icon: "🔍",
      text: `Full inspections are comfortable once daytime highs approach ${tempLabel(
        15
      )} and it is calm. Between ${tempLabel(10)}–${tempLabel(14)} keep any checks brief.`,
    });
    out.push({
      icon: "⚠️",
      text:
        "Spring build-up – watch for starvation in light colonies after cold or wet spells; emergency fondant or warm syrup on mild days may be needed.",
    });
  } else if (month >= 5 && month <= 7) {
    // Jun–Aug: summer
    if (month === 5) {
      out.push({
        icon: "📆",
        text: "June – peak season. Swarm control and regular inspections in suitable weather are usually required.",
      });
    } else if (month === 6) {
      out.push({
        icon: "📆",
        text: "July – main honey flow for many areas. Manage supers, ventilation and space.",
      });
    } else {
      out.push({
        icon: "📆",
        text:
          "August – end of main flow in many areas. Focus on honey removal, colony assessment and treatment planning.",
      });
    }

    out.push({
      icon: "🌼",
      text:
        "Most days with light winds and temperatures above roughly 15°C are suitable for full inspections and good foraging.",
    });
    out.push({
      icon: "🪱",
      text:
        "Late summer is a key time for Varroa treatment. Always follow product instructions, including any temperature limits.",
    });
  } else if (month >= 8 && month <= 10) {
    // Sep–Nov: autumn
    if (month === 8) {
      out.push({
        icon: "📆",
        text:
          "September – early autumn. Assess stores and start autumn feeding if colonies are underweight.",
      });
    } else if (month === 9) {
      out.push({
        icon: "📆",
        text:
          "October – late autumn. Finish syrup feeding early; switch to fondant if colonies are still light.",
      });
    } else {
      out.push({
        icon: "📆",
        text:
          "November – early winter. Avoid opening the brood nest; rely on hefting and external checks.",
      });
    }

    out.push({
      icon: "🍯",
      text:
        "Autumn feeding – syrup while it is still warm enough for bees to ripen and cap it; once colder, rely on fondant only.",
    });
    out.push({
      icon: "💧",
      text:
        "Damp kills more bees than cold. Keep hives off the ground, roofs sound and ventilation modest but not draughty.",
    });
  }

  // --- Live, temperature & wind-driven guidance (as before) ---

  const strongWindThresholdKmh = 40;
  const maxWind = winds.length ? Math.max(...winds) : 0;

  const strongWindDisplay =
    windUnit === "kmh"
      ? `≥${strongWindThresholdKmh} ${windLabel}`
      : `≥${Math.round(strongWindThresholdKmh * 0.621371)} ${windLabel}`;

  if (maxWind >= strongWindThresholdKmh) {
    out.push({
      icon: "💨",
      text: `Strong winds expected (${strongWindDisplay}). Avoid opening hives; ensure lids are strapped or weighted and stands are stable.`,
    });
  }

  // Heavy rain advisory
  const heavyRain = precs.some((mm) => mm >= 10);
  if (heavyRain) {
    out.push({
      icon: "🌧️",
      text:
        "Heavy rain in the forecast. Foraging will be poor; plan inspections and manipulations for dry, calmer windows.",
    });
  }

  // Temperature-based inspection & foraging notes
  const minTemp = tmins.length ? Math.min(...tmins) : 99;
  const maxTemp = tmaxs.length ? Math.max(...tmaxs) : 0;

  if (minTemp <= 5 || maxTemp < 10) {
    out.push({
      icon: "🥶",
      text: `Forecast highs stay below about ${tempLabel(
        10
      )}. Expect very little foraging – colonies will mainly rely on stored food.`,
    });
  } else if (maxTemp >= 10 && maxTemp < 15) {
    out.push({
      icon: "🍃",
      text: `Daytime highs between about ${tempLabel(10)} and ${tempLabel(
        15
      )}. Some foraging is possible in bright spells, but keep any hive checks very brief.`,
    });
  }

  if (maxTemp < 10) {
    out.push({
      icon: "🚫🐝",
      text: `Daytime highs below ${tempLabel(
        10
      )}. Avoid full inspections – opening the brood nest risks chilling and stressing the colony.`,
    });
  } else if (maxTemp >= 10 && maxTemp < 15) {
    out.push({
      icon: "⚠️",
      text: `Daytime highs between ${tempLabel(10)} and ${tempLabel(
        15
      )}. Only open colonies if absolutely necessary and keep brood exposure as short as possible.`,
    });
  } else if (maxTemp >= 15 && maxWind < strongWindThresholdKmh) {
    out.push({
      icon: "✅",
      text: `Forecast includes at least one mild, calmer day (around ${tempLabel(
        15
      )} or above). This is generally suitable for normal inspections if needed.`,
    });
  }

  // Hot spell advisory
  const hotThresholdC = 28;
  if (maxTemp >= hotThresholdC) {
    out.push({
      icon: "🥵",
      text: `Hot spell forecast (around ${tempLabel(
        hotThresholdC
      )} or above). Ensure bees have good ventilation and a reliable water source and avoid long inspections in peak heat.`,
    });
  }

  // --- Warnings-driven notes (new) ---

  if (Array.isArray(warnings) && warnings.length) {
    const anySevere = warnings.some((w) => {
      const sev = (
        w.severity_text ||
        w.severity ||
        w.level ||
        ""
      )
        .toString()
        .toLowerCase();
      return (
        sev.includes("red") ||
        sev.includes("orange") ||
        sev === "3" ||
        sev === "2"
      );
    });

    const anyYellow = warnings.some((w) => {
      const sev = (
        w.severity_text ||
        w.severity ||
        w.level ||
        ""
      )
        .toString()
        .toLowerCase();
      return sev.includes("yellow") || sev === "1";
    });

    if (anySevere) {
      out.push({
        icon: "⚠️",
        text:
          "Official severe weather warnings are active for this area. Many beekeepers postpone non-essential hive work during severe conditions and double-check straps, roofs and stands afterwards, while following any official safety guidance.",
      });
    } else if (anyYellow) {
      out.push({
        icon: "⚠️",
        text:
          "Official weather alerts are active for this location. Consider local conditions at your apiary and follow guidance from official forecast providers when planning inspections.",
      });
    }
  }

  // --- Pollen-driven notes (new) ---

  const pollenHourly = pollen?.hourly || null;
  if (pollenHourly && Array.isArray(pollenHourly.time) && pollenHourly.time.length) {
    const times = pollenHourly.time;
    let best = 0;
    let bestDiff = Infinity;
    const nowMs = nowDate.getTime();

    times.forEach((tStamp, i) => {
      const ms =
        typeof tStamp === "number" ? tStamp * 1000 : Date.parse(tStamp || 0);
      const diff = Math.abs(ms - nowMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    });

    const getVal = (key) => {
      const arr = pollenHourly[key];
      return Array.isArray(arr) ? arr[best] : undefined;
    };

    const getPeakNext12 = (key) => {
      const arr = Array.isArray(pollenHourly[key]) ? pollenHourly[key] : [];
      const slice = arr.slice(best, best + 12).filter(Number.isFinite);
      return slice.length ? Math.max(...slice) : undefined;
    };

    const keys = ["tree_pollen", "grass_pollen", "weed_pollen"];
    let highest = 0;

    keys.forEach((k) => {
      const vNow = getVal(k);
      const vPeak = getPeakNext12(k);
      [vNow, vPeak].forEach((v) => {
        if (Number.isFinite(v) && v > highest) highest = v;
      });
    });

    // Same thresholds as your scalePollen helper
    if (highest >= 60) {
      const levelText = highest >= 150 ? "very high" : "high";
      out.push({
        icon: "🌾",
        text:
          `Pollen levels are ${levelText} over the next few hours. This often coincides with strong forage, but if you or visitors have allergies you may want to plan apiary visits carefully and follow any medical advice you have been given.`,
      });
    }
  }

  return out;
}
