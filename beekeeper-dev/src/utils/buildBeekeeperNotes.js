// src/utils/buildBeekeeperNotes.js

// Build the array of advisory notes for the Weather & Seasonal Beekeeping panel.
// This is deliberately pure and UI-agnostic so you can reuse it on the Dashboard, etc.

// ---- Latitude-based season profiles ----
const TROPIC_LAT = 23.5;

function getSeasonProfile(latitude) {
  const lat = Number(latitude);
  if (!Number.isFinite(lat)) return { profile: "northern_temperate", lat: null };

  if (lat > TROPIC_LAT) return { profile: "northern_temperate", lat };
  if (lat < -TROPIC_LAT) return { profile: "southern_temperate", lat };
  return { profile: "tropical", lat };
}

// 0 = Jan, 11 = Dec
function shiftMonthForHemisphere(monthIndex, profile) {
  if (profile === "southern_temperate") return (monthIndex + 6) % 12;
  return monthIndex;
}

function monthNameFromIndex(i) {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][i] || "Unknown month";
}

// Tropical wet/dry default model (broad brush)
// - Northern tropics: wet ~ May–Oct, dry ~ Nov–Apr
// - Southern tropics: wet ~ Nov–Apr, dry ~ May–Oct
function tropicalSeasonKey(monthIndex, lat) {
  const isSouthern = Number.isFinite(lat) ? lat < 0 : false;

  const wetMonthsNorthern = new Set([4, 5, 6, 7, 8, 9]); // May–Oct
  const wetMonthsSouthern = new Set([10, 11, 0, 1, 2, 3]); // Nov–Apr

  const wetSet = isSouthern ? wetMonthsSouthern : wetMonthsNorthern;
  return wetSet.has(monthIndex) ? "wet" : "dry";
}

export function buildBeekeeperNotes({
  daily,
  weather,
  unit = "C", // "C" | "F"
  windUnit = "kmh", // "kmh" | "mph"
  warnings = [],
  pollen = null,
  timezone = "UTC", // used for month/season in apiary-local time
  now = null, // optional Date override (useful for testing)
  latitude = null, // ✅ NEW: apiary latitude for season profile selection
} = {}) {
  const out = [];

  const safeArr = (a) => (Array.isArray(a) ? a : []);

  const getMonthInTz = (date, tz) => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        month: "numeric",
      }).formatToParts(date);
      const m = parts.find((p) => p.type === "month")?.value;
      const monthIndex = Number(m) - 1;
      return Number.isFinite(monthIndex) ? monthIndex : date.getMonth();
    } catch {
      // If timezone is invalid or Intl fails, fall back to local month
      return date.getMonth();
    }
  };

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

  // Month based on apiary-local time (timezone)
  const realMonth = getMonthInTz(nowDate, timezone); // 0..11 (real month name)

  // Decide season model from latitude (prefer explicit latitude, fallback to weather.latitude if you ever store it)
  const { profile, lat } = getSeasonProfile(latitude ?? weather?.latitude);

  // For southern temperate, shift month index by 6 for *seasonal logic only*
  const seasonMonth = shiftMonthForHemisphere(realMonth, profile);

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

  // --- Seasonal / month profile (latitude-aware) ---
  if (profile === "tropical") {
    const key = tropicalSeasonKey(realMonth, lat);
    const mName = monthNameFromIndex(realMonth);

    out.push({
      icon: "🌍",
      text:
        key === "wet"
          ? `${mName} — tropical wet season pattern. Expect rapid forage changes, sudden storms and higher humidity. Inspect early where possible, prioritise ventilation, keep entrances clear, and watch for swarm pressure.`
          : `${mName} — tropical dry season pattern. Forage may be patchy and colonies can be sensitive to water availability. Ensure a reliable water source, check stores if forage is scarce, and watch for robbing/wasps depending on local conditions.`,
    });
  } else {
    // Temperate model uses your existing UK-style month guidance,
    // but in the southern hemisphere we shift by 6 months.
    const displayMonthName = monthNameFromIndex(realMonth);

    if (seasonMonth === 11 || seasonMonth === 0 || seasonMonth === 1) {
      // Dec–Feb: winter (seasonal)
      if (seasonMonth === 0) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – deep winter. Do not open colonies unless there is an emergency (for example, suspected starvation or damage).`,
        });
      } else if (seasonMonth === 1) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – colonies are starting to brood up but weather is still unreliable. Continue to avoid full inspections.`,
        });
      } else {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – mid-winter. Colonies should be settled with good stores and secure hives.`,
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
        text:
          "After storms, frost or snow, check straps, roofs and entrances and clear any blockages.",
      });
    } else if (seasonMonth >= 2 && seasonMonth <= 4) {
      // Mar–May: spring (seasonal)
      if (seasonMonth === 2) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – early spring. Brood is expanding, but cold snaps are still likely. Only inspect on the warmest, calmest days.`,
        });
      } else if (seasonMonth === 3) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – main build-up. Choose mild, calm days for full inspections and keep them efficient to avoid chilling brood.`,
        });
      } else {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – strong build-up and early swarm season. Regular inspections are usually possible in suitable weather.`,
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
        )} and it is calm. Between ${tempLabel(10)}–${tempLabel(
          14
        )} keep any checks brief.`,
      });
      out.push({
        icon: "⚠️",
        text:
          "Spring build-up – watch for starvation in light colonies after cold or wet spells; emergency fondant or warm syrup on mild days may be needed.",
      });
    } else if (seasonMonth >= 5 && seasonMonth <= 7) {
      // Jun–Aug: summer (seasonal)
      if (seasonMonth === 5) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – peak season. Swarm control and regular inspections in suitable weather are usually required.`,
        });
      } else if (seasonMonth === 6) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – main honey flow for many areas. Manage supers, ventilation and space.`,
        });
      } else {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – end of main flow in many areas. Focus on honey removal, colony assessment and treatment planning.`,
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
    } else if (seasonMonth >= 8 && seasonMonth <= 10) {
      // Sep–Nov: autumn (seasonal)
      if (seasonMonth === 8) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – early autumn. Assess stores and start autumn feeding if colonies are underweight.`,
        });
      } else if (seasonMonth === 9) {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – late autumn. Finish syrup feeding early; switch to fondant if colonies are still light.`,
        });
      } else {
        out.push({
          icon: "📆",
          text: `${displayMonthName} – early winter. Avoid opening the brood nest; rely on hefting and external checks.`,
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
      const sev = (w.severity_text || w.severity || w.level || "")
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
      const sev = (w.severity_text || w.severity || w.level || "")
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
      const ms = typeof tStamp === "number" ? tStamp * 1000 : Date.parse(tStamp || 0);
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
        text: `Pollen levels are ${levelText} over the next few hours. This often coincides with strong forage, but if you or visitors have allergies you may want to plan apiary visits carefully and follow any medical advice you have been given.`,
      });
    }
  }

  return out;
}
