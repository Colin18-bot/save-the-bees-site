// src/utils/buildBeekeeperNotes.js
// Option B – Weather-aware notes based on the live forecast,
// plus simple seasonal context. Designed to feed both the
// Weather page (full panel) and a shorter Dashboard snapshot.

/**
 * Safe array helper – always returns an array.
 */
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Convert °C to °F.
 */
function toF(c) {
  if (!Number.isFinite(c)) return null;
  return (c * 9) / 5 + 32;
}

/**
 * Convert km/h to mph.
 */
function kmhToMph(kmh) {
  if (!Number.isFinite(kmh)) return null;
  return kmh * 0.621371;
}

/**
 * Format a temperature value using the chosen unit.
 */
function formatTemp(celsius, unit) {
  if (!Number.isFinite(celsius)) return "–";
  if (unit === "F") {
    const f = Math.round(toF(celsius));
    return `${f}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

/**
 * Format a wind value using the chosen unit.
 */
function formatWind(kmh, windUnit) {
  if (!Number.isFinite(kmh)) return "–";
  if (windUnit === "mph") {
    const mph = Math.round(kmhToMph(kmh));
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Derive a rough "local" Date from the weather data.
 * We don't need perfect timezone math here – just enough
 * to know the month and broad season.
 */
function deriveLocalDate(weather) {
  const t =
    weather?.current?.time ||
    (asArray(weather?.daily?.time)[0] ?? null);

  if (!t) return new Date();

  // Open-Meteo with timeformat=unixtime → seconds
  if (typeof t === "number") {
    return new Date(t * 1000);
  }

  // ISO string fallback
  const parsed = new Date(t);
  if (!isNaN(parsed)) return parsed;

  return new Date();
}

/**
 * Build seasonal / month-based context. This is deliberately
 * high-level and *not* prescriptive treatment advice.
 */
function buildSeasonalNotes(date) {
  const month = date.getMonth() + 1; // 1–12
  const items = [];
  const icon = "📅";

  if (month === 12 || month === 1 || month === 2) {
    items.push(
      "Mid-winter: minimal brood, colonies are conserving heat. Avoid opening hives unless absolutely necessary and only on calm, milder days.",
      "Check heft and stores from the outside; consider fondant if colonies feel light.",
      "If you plan a mid-winter varroa treatment, only use products approved in your country and follow the label and local association guidance."
    );
  } else if (month === 3 || month === 4) {
    items.push(
      "Early spring build-up: brood usually increasing but weather can still swing cold. Choose calm, dry days above inspection temperatures before opening hives.",
      "Starvation risk can be high as colonies expand – keep an eye on stores and consider top-ups if frames feel light.",
      "Make a note of varroa management plans for the season (timing, products, and any post-treatment checks you intend to do)."
    );
  } else if (month === 5 || month === 6) {
    items.push(
      "Main swarm season: be ready to check for queen cells regularly when the weather allows full inspections.",
      "Ensure plenty of space (extra supers or brood boxes) during strong flows to reduce congestion.",
      "If you normally treat for varroa after the main honey flow, note likely windows now so you can work around supers and local regulations."
    );
  } else if (month === 7 || month === 8) {
    items.push(
      "Later summer / potential dearth: forage can drop in some areas even when the weather is warm.",
      "Monitor colony strength and stores; robbing pressure can increase when nectar is scarce.",
      "Post-harvest is a common varroa treatment window – only use authorised products and follow label and local association advice."
    );
  } else if (month === 9 || month === 10) {
    items.push(
      "Autumn: focus on healthy winter bees, adequate stores and good queens.",
      "Reduce entrances if robbing or wasp pressure is high, and check hive weight before winter.",
      "Many beekeepers complete main varroa treatments in this period; keep records of what you used and how colonies responded."
    );
  } else if (month === 11) {
    items.push(
      "Early winter: brood area is usually shrinking; colonies should be settled on winter stores.",
      "Avoid unnecessary disturbance; quick external checks and hefting are normally enough.",
      "If planning any winter varroa treatment, follow approved guidance and avoid opening hives in poor weather."
    );
  }

  if (!items.length) return null;

  return {
    id: "season",
    title: "Seasonal context",
    icon,
    items
  };
}

/**
 * Core weather-aware inspection & hive notes.
 * Looks at daily max/min temp, rain and wind for the next few days.
 */
function buildWeatherDrivenNotes(weather, unit, windUnit) {
  const daily = weather?.daily || {};
  const tMax = asArray(daily.temperature_2m_max);
  const tMin = asArray(daily.temperature_2m_min);
  const rain = asArray(daily.precipitation_sum);
  const windMax = asArray(daily.wind_speed_10m_max);

  const todayMax = Number.isFinite(tMax[0]) ? tMax[0] : null;
  const todayMin = Number.isFinite(tMin[0]) ? tMin[0] : null;
  const todayRain = Number.isFinite(rain[0]) ? rain[0] : null;
  const todayWind = Number.isFinite(windMax[0]) ? windMax[0] : null;

  const sectionConditions = {
    id: "conditions",
    title: "Conditions & inspection windows",
    icon: "🌦️",
    items: []
  };

  const sectionHiveCare = {
    id: "hive",
    title: "Hive & feeding considerations",
    icon: "🐝",
    items: []
  };

  // Simple thresholds (in °C and km/h) – we only use them as
  // triggers for *guidance*, not hard rules.
  const comfortableInspectMinC = 15; // below this → marginal for full inspections
  const chillyNightC = 8;           // cold nights / brood chilling risk
  const hotDayC = 28;               // heat stress / ventilation
  const strongWindKmh = 40;         // very blustery at the hive
  const heavyRainMm = 10;           // significant daily rainfall

  // --- Conditions / inspection window notes ---

  if (todayMax != null) {
    if (todayMax >= comfortableInspectMinC && todayRain !== null && todayRain < heavyRainMm && todayWind !== null && todayWind < strongWindKmh) {
      sectionConditions.items.push(
        `Today looks broadly inspection-friendly (${formatTemp(todayMax, unit)} max, light rain and moderate winds). If colonies are otherwise healthy, this may be a reasonable window for routine checks.`
      );
    } else if (todayMax < comfortableInspectMinC) {
      sectionConditions.items.push(
        `Daytime highs stay below comfortable inspection temperatures (${formatTemp(todayMax, unit)}). Consider postponing full brood inspections unless you have an urgent reason.`
      );
    }
  }

  if (todayWind != null && todayWind >= strongWindKmh) {
    sectionConditions.items.push(
      `Strong winds forecast (around ${formatWind(todayWind, windUnit)}). Avoid opening hives on exposed stands; lids may need extra weights or straps.`
    );
  }

  if (todayRain != null && todayRain >= heavyRainMm) {
    sectionConditions.items.push(
      `Heavy rain is expected (around ${Math.round(todayRain)} mm today). Plan inspections, feeding or moves around dry spells if you can.`
    );
  }

  // --- Hive & feeding notes ---

  if (todayMin != null && todayMin <= chillyNightC) {
    sectionHiveCare.items.push(
      `Cool nights down to about ${formatTemp(todayMin, unit)}. Brood could chill quickly if frames are open for long – keep any inspections brisk and avoid splitting the cluster.`
    );
  }

  if (todayMax != null && todayMax >= hotDayC) {
    sectionHiveCare.items.push(
      `Hot spell expected (up to about ${formatTemp(todayMax, unit)}). Ensure good ventilation, provide water sources and try to avoid extended inspections in the hottest part of the day.`
    );
  }

  // Look slightly ahead across the next few days for patterns.
  if (tMax.length >= 3 && rain.length >= 3) {
    const next3WarmDays = tMax.slice(0, 3).filter((v) => Number.isFinite(v) && v >= comfortableInspectMinC);
    const next3WetDays = rain.slice(0, 3).filter((v) => Number.isFinite(v) && v >= heavyRainMm);

    if (next3WarmDays.length >= 2 && next3WetDays.length === 0) {
      sectionConditions.items.push(
        "The next few days look mostly mild and fairly dry. You may be able to spread inspections across several visits instead of doing everything at once."
      );
    } else if (next3WetDays.length >= 2) {
      sectionHiveCare.items.push(
        "Several wet days are showing in the forecast. Forage flights may be limited at times, so keep an eye on colonies with small stores or recent splits."
      );
    }
  }

  // If either section ended up empty, drop it completely.
  const sections = [];
  if (sectionConditions.items.length) sections.push(sectionConditions);
  if (sectionHiveCare.items.length) sections.push(sectionHiveCare);
  return sections;
}

/**
 * Optional varroa awareness notes. These are *not* treatment
 * instructions – just prompts to think about monitoring and
 * timing around your existing plan.
 */
function buildVarroaNotes(date) {
  const month = date.getMonth() + 1;
  const items = [];

  if (month === 7 || month === 8 || month === 9) {
    items.push(
      "Later summer into early autumn is a common time to assess varroa levels after removing supers. If mite loads are high, plan authorised treatments promptly.",
      "Use methods recommended by your local association (for example, sugar roll or alcohol wash) if you want a clearer picture of colony mite levels."
    );
  } else if (month === 12 || month === 1) {
    items.push(
      "Some beekeepers treat for varroa in the brood-light or broodless period. Only use authorised products and follow label directions and association guidance.",
      "Always consider colony condition, temperature and local advice when planning any varroa treatment."
    );
  } else {
    items.push(
      "Keep simple notes on what varroa treatments you’ve used and when. This makes it easier to spot patterns and plan future treatments around honey flows."
    );
  }

  return {
    id: "varroa",
    title: "Varroa & health prompts",
    icon: "🧪",
    items
  };
}

/**
 * Build beekeeper-facing notes for the current weather.
 *
 * @param {Object} options
 * @param {Object} options.weather - Open-Meteo style weather object (with `current`, `daily`, `timezone` etc.)
 * @param {"C"|"F"} [options.unit="C"] - Temperature unit for display.
 * @param {"kmh"|"mph"} [options.windUnit="kmh"] - Wind unit for display.
 *
 * @returns {{
 *   sections: Array<{ id: string, title: string, icon?: string, items: string[] }>,
 *   disclaimer: string
 * }}
 */
export function buildBeekeeperNotes({ weather, unit = "C", windUnit = "kmh" }) {
  if (!weather || !weather.daily) {
    return {
      sections: [],
      disclaimer:
        "These notes are general guidance only. Always base your beekeeping decisions on what you see inside each colony, local conditions and advice from trusted sources."
    };
  }

  const localDate = deriveLocalDate(weather);

  const sections = [];

  // Weather-driven sections
  sections.push(...buildWeatherDrivenNotes(weather, unit, windUnit));

  // Seasonal context
  const seasonal = buildSeasonalNotes(localDate);
  if (seasonal) sections.push(seasonal);

  // Varroa prompts
  sections.push(buildVarroaNotes(localDate));

  const disclaimer =
    "These notes are automatically generated from forecast data and simple rules. They are not professional or veterinary advice. " +
    "Always inspect colonies safely, follow product labels and local regulations, and consult your local association or a qualified advisor if you’re unsure.";

  return {
    sections,
    disclaimer
  };
}

export default buildBeekeeperNotes;
