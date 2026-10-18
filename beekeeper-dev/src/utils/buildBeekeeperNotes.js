// HiveTag Seasonal Beekeeper Notes — Stage 1 candidate
// A pure advisory engine. No UI, database access, navigation or subscription checks.
// NOT deployed: integrate and test on staging before replacing the existing module.
//
// buildBeekeeperNotesStructured(input) -> four categories of notes.
// buildBeekeeperNotes(input) -> backward-compatible flat [{ icon, text }] for existing pages.
// Advice is general, not hive-specific, and never directs a treatment or dose.

const TROPIC_LAT = 23.5;
const STRONG_WIND_KMH = 40;
const HEAVY_RAIN_MM = 10;
const HOT_C = 28;
const INSPECTION_MIN_C = 15;
const INSPECTION_MAX_WIND_KMH = 20;
const INSPECTION_MAX_RAIN_PROBABILITY = 20;

const CATEGORIES = ["weather", "priorities", "jobs", "knowledge"];
const CATEGORY_TITLES = {
  weather: "Important Weather Information",
  priorities: "This Month's Priorities",
  jobs: "Practical Jobs Around the Apiary",
  knowledge: "Seasonal Knowledge",
};

// Calendar guidance is primarily written for cool-temperate beekeeping (UK-style).
// The southern temperate profile shifts the seasonal month, not the displayed month.
// Latitude alone cannot establish local forage, rainfall season or pest pressure.
const TEMPERATE = [
  { // January
    priorities: ["Heft colonies periodically to assess stores without disturbing the cluster.", "Avoid unnecessary brood-nest inspections in winter.", "Check roofs, straps and entrances externally following severe weather."],
    jobs: ["Clean and repair spare hive equipment.", "Prepare frames and foundation for spring.", "Check stored supers and equipment for damage."],
    knowledge: ["Winter colonies rely largely on stores; brood rearing and consumption vary with conditions."]
  },
  { // February
    priorities: ["Continue checking hive weight and consider food reserves as brood rearing may increase.", "Avoid routine full inspections during unreliable winter weather.", "Observe entrances for signs of activity without disturbing the cluster."],
    jobs: ["Finish repairs to spare brood boxes and supers.", "Prepare clean frames for spring.", "Review suitable early-flowering forage planting."],
    knowledge: ["Food consumption can rise in late winter as colonies increase brood rearing, even before reliable forage appears."]
  },
  { // March
    priorities: ["Monitor stores closely during spring build-up.", "Plan first inspections around genuinely suitable local conditions.", "Watch for setbacks after extended cold or wet weather."],
    jobs: ["Review whether mouseguards are still required; avoid restricting bee traffic.", "Clear obstructive vegetation and check water access.", "Prepare swarm-management equipment."],
    knowledge: ["Willow and other early flowers may offer forage where present, but flight conditions still limit collection."]
  },
  { // April
    priorities: ["Assess brood development when inspections are justified and conditions allow.", "Check space as colonies expand.", "Prepare for swarm-control decisions as the season progresses."],
    jobs: ["Prepare supers and nucleus equipment.", "Remove seasonal entrance protection when appropriate to local conditions.", "Replace or repair damaged spare equipment."],
    knowledge: ["Flowering does not guarantee nectar collection: temperature, wind and rain affect foraging opportunities."]
  },
  { // May
    priorities: ["Maintain appropriate swarm awareness and colony checks.", "Monitor congestion and available space.", "Consider whether colonies need additional super space."],
    jobs: ["Keep spare equipment available for swarm management.", "Maintain clear access to the apiary.", "Provide reliable water where needed."],
    knowledge: ["Warm weather can accelerate colony expansion, but swarm risk cannot be determined from weather alone."]
  },
  { // June
    priorities: ["Continue swarm awareness where seasonally relevant.", "Monitor super space during nectar flows.", "Be alert to possible forage interruptions, including a local June gap."],
    jobs: ["Prepare honey-handling equipment.", "Maintain water sources.", "Cut back vegetation blocking entrances or access."],
    knowledge: ["The timing and severity of a June forage gap vary considerably by region and year."]
  },
  { // July
    priorities: ["Assess honey supers and plan safe harvesting where appropriate.", "Continue observing colony health.", "Plan timely late-season Varroa assessment and control in line with approved guidance."],
    jobs: ["Prepare extraction equipment and clean food-contact surfaces.", "Check safe storage for harvested honey.", "Maintain hive stands and water sources."],
    knowledge: ["Late-summer planning matters because bees raised later in the season support overwintering."]
  },
  { // August
    priorities: ["Assess colony health and winter preparation needs.", "Review Varroa management timing and follow the current product instructions if treating.", "Evaluate stores and remaining forage without assuming every colony needs feeding."],
    jobs: ["Clean extracting equipment after use.", "Prepare feeders and winter entrance protection.", "Repair spare equipment before autumn."],
    knowledge: ["Varroa products can have important restrictions on timing, temperature and honey supers; weather does not determine which product to use."]
  },
  { // September
    priorities: ["Assess winter stores and colony readiness.", "Complete any appropriate autumn feeding while conditions still allow processing.", "Keep disturbance proportionate to colony needs."],
    jobs: ["Fit mouseguards where needed and safe for bee access.", "Check roof security, straps, stands and drainage.", "Tidy vegetation and prepare winter equipment."],
    knowledge: ["Ivy may provide valuable late-season forage where available, but nectar availability varies with weather."]
  },
  { // October
    priorities: ["Heft hives to assess stores without routine brood-nest disturbance.", "Review whether late-season supplementary food is needed for light colonies.", "Check winter security and keep entrances clear."],
    jobs: ["Check mouseguards and entrances where appropriate.", "Plant suitable spring-flowering bulbs in appropriate conditions.", "Tidy access paths and vegetation around hives.", "Clean and repair unused equipment."],
    knowledge: ["Warm, moist hive air may condense on cold surfaces; preventing drips onto the winter cluster matters more than simply adding ventilation."]
  },
  { // November
    priorities: ["Continue external checks and hefting where useful.", "Minimise unnecessary hive disturbance.", "Check entrances, roofs and hive stability after bad weather."],
    jobs: ["Repair and store spare equipment in dry conditions.", "Review local needs for woodpecker and mouse protection.", "Finish suitable late-season planting where ground conditions permit."],
    knowledge: ["Strong colonies can tolerate cold; adequate stores, protection from water ingress and sound equipment remain important."]
  },
  { // December
    priorities: ["Assess food reserves externally by hefting where practical.", "Check hive security and entrances after severe weather.", "Avoid unnecessary disturbance of the winter cluster."],
    jobs: ["Repair spare boxes, frames and equipment.", "Clean and safely store tools.", "Plan spring equipment needs and future forage planting."],
    knowledge: ["An established winter cluster responds to cold by regulating its activity and drawing on stored food."]
  },
];

const finite = (v) => typeof v === "number" && Number.isFinite(v);
const arr = (v) => Array.isArray(v) ? v : [];
const tempText = (c, unit) => unit === "F" ? `${Math.round(c * 9 / 5 + 32)}°F` : `${Math.round(c)}°C`;
const windText = (k, windUnit) => windUnit === "mph" ? `${Math.round(k * 0.621371)} mph` : `${Math.round(k)} km/h`;
const toDate = (value) => {
  if (finite(value)) return new Date(value * 1000);
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    const date = Number.isFinite(numeric) ? new Date(numeric * 1000) : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};
const zonedPart = (date, zone, options) => {
  try { return new Intl.DateTimeFormat("en-GB", { timeZone: zone, ...options }).format(date); }
  catch { return new Intl.DateTimeFormat("en-GB", options).format(date); }
};
const monthIndex = (date, zone) => {
  try { return Number(zonedPart(date, zone, { month: "numeric" })) - 1; }
  catch { return date.getUTCMonth(); }
};
const dateKey = (date, zone) => {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
    const get = (key) => parts.find(p => p.type === key)?.value || "00";
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch { return date.toISOString().slice(0, 10); }
};
const weekday = (date, zone) => zonedPart(date, zone, { weekday: "long", day: "numeric", month: "short" });
const hourText = (date, zone) => zonedPart(date, zone, { hour: "2-digit", minute: "2-digit" });
const monthText = (date, zone) => zonedPart(date, zone, { month: "long" });

function profileFor(latitude) {
  // Null/undefined do NOT become equatorial latitude 0.
  if (latitude === null || latitude === undefined || latitude === "") return "northern_temperate";
  const lat = Number(latitude);
  if (!Number.isFinite(lat) || Math.abs(lat) > 90) return "northern_temperate";
  if (lat > TROPIC_LAT) return "northern_temperate";
  if (lat < -TROPIC_LAT) return "southern_temperate";
  return "tropical";
}

function makeNote(category, id, icon, text, priority = 30, extra = {}) {
  return { id, category, icon, text, priority, ...extra };
}

function describeWarnings(warnings) {
  return arr(warnings).filter(w => w && typeof w === "object").map((w) => {
    const sev = String(w.severity_text || w.severity || w.level || "").toLowerCase();
    const level = sev.includes("red") || sev === "3" ? 3 :
      sev.includes("orange") || sev.includes("amber") || sev === "2" ? 2 :
      sev.includes("yellow") || sev === "1" ? 1 : 0;
    return { ...w, level };
  });
}

/** Four sections with priority-ordered notes; UI controls their expansion state. */
export function buildBeekeeperNotesStructured({
  daily = null, hourly = null, weather = null, unit = "C", windUnit = "kmh",
  warnings = [], pollen = null, timezone = "UTC", now = null, latitude = null,
} = {}) {
  const sections = Object.fromEntries(CATEGORIES.map(k => [k, { id: k, title: CATEGORY_TITLES[k], notes: [] }]));
  const add = (...args) => { const note = makeNote(...args); sections[note.category].notes.push(note); };
  const reference = now instanceof Date && !Number.isNaN(now.getTime()) ? now :
    (toDate(weather?.current?.time) || new Date());
  const month = monthIndex(reference, timezone);
  const profile = profileFor(latitude ?? weather?.latitude);
  const seasonalMonth = profile === "southern_temperate" ? (month + 6) % 12 : month;

  if (profile === "tropical") {
    add("priorities", "tropical-local", "🌍", `${monthText(reference, timezone)}: local rainfall, flowering and colony management vary substantially. Consult locally appropriate seasonal guidance rather than assuming a UK wet/dry calendar.`, 60);
    add("jobs", "tropical-water", "🛠️", "Keep water available, entrances clear and equipment sound; adapt pest protection and apiary maintenance to local conditions.");
    add("knowledge", "tropical-forage", "🌼", "Tropical forage and swarming seasons cannot be inferred reliably from latitude and month alone.");
  } else {
    const guide = TEMPERATE[seasonalMonth];
    guide.priorities.forEach((text, i) => add("priorities", `month-${seasonalMonth}-priority-${i}`, "📆", text, 50 - i));
    guide.jobs.forEach((text, i) => add("jobs", `month-${seasonalMonth}-job-${i}`, "🛠️", text, 30 - i));
    guide.knowledge.forEach((text, i) => add("knowledge", `month-${seasonalMonth}-knowledge-${i}`, "💡", text, 20 - i));
    if (profile === "southern_temperate") {
      add("knowledge", "hemisphere-caution", "🌍", "Seasonal timing has been shifted by six months for the Southern Hemisphere; check local forage, climate and pest-management guidance.", 10);
    }
  }

  const described = describeWarnings(warnings);
  const major = described.filter(w => w.level >= 2);
  const minor = described.filter(w => w.level === 1);
  if (major.length) {
    const w = major[0];
    const period = toDate(w.start || w.onset || w.effective);
    add("weather", "official-major-warning", "⚠️", `Significant official weather warning${period ? ` (${weekday(period, timezone)})` : ""}: ${w.event || w.headline || "severe weather"}. Follow official safety advice and check hive security when safe. Confirm that the warning covers your apiary.`, 100, { urgent: true });
  } else if (minor.length) {
    const w = minor[0];
    const period = toDate(w.start || w.onset || w.effective);
    add("weather", "official-yellow-warning", "⚠️", `Official weather warning${period ? ` (${weekday(period, timezone)})` : ""}: ${w.event || w.headline || "adverse weather"}. Consider local conditions and check whether the warning covers your apiary.`, 85, { urgent: true });
  }

  const days = arr(daily?.time).map((raw, i) => ({
    date: toDate(raw), i,
    wind: arr(daily?.wind_speed_10m_max)[i],
    rain: arr(daily?.precipitation_sum)[i],
    min: arr(daily?.temperature_2m_min)[i],
    max: arr(daily?.temperature_2m_max)[i],
  })).filter(d => d.date && dateKey(d.date, timezone) >= dateKey(reference, timezone));
  // Convert daily entries to weather-specific advice; only one event of each kind,
  // retaining the next relevant day and avoiding a long repetitive list.
  const firstWind = days.find(d => finite(d.wind) && d.wind >= STRONG_WIND_KMH);
  if (firstWind) add("weather", "wind-upcoming", "💨", `${weekday(firstWind.date, timezone)}: winds may reach ${windText(firstWind.wind, windUnit)}. Secure roofs and loose equipment before the event; avoid opening hives in strong winds.`, 90, { forecastDate: dateKey(firstWind.date, timezone) });
  const firstRain = days.find(d => finite(d.rain) && d.rain >= HEAVY_RAIN_MM);
  if (firstRain) add("weather", "heavy-rain-upcoming", "🌧️", `${weekday(firstRain.date, timezone)}: around ${Math.round(firstRain.rain)} mm of rain forecast. Expect poor foraging conditions and avoid unnecessary hive opening; check drainage where relevant.`, 70, { forecastDate: dateKey(firstRain.date, timezone) });
  const firstHot = days.find(d => finite(d.max) && d.max >= HOT_C);
  if (firstHot) add("weather", "heat-upcoming", "🥵", `${weekday(firstHot.date, timezone)}: temperatures may reach ${tempText(firstHot.max, unit)}. Check that bees have reliable water and avoid prolonged disturbance in peak heat.`, 65, { forecastDate: dateKey(firstHot.date, timezone) });
  const firstCold = days.find(d => finite(d.max) && d.max < 10);
  if (firstCold) add("weather", "cold-upcoming", "🥶", `${weekday(firstCold.date, timezone)}: forecast high ${tempText(firstCold.max, unit)}. Foraging may be limited; avoid unnecessary brood-nest opening and monitor stores externally where practical.`, 60, { forecastDate: dateKey(firstCold.date, timezone) });

  // A suitable inspection window is suggested ONLY if hourly temperature, wind,
  // precipitation probability and weather code all describe the SAME hour.
  // If any required series is missing, do not claim a suitable window.
  const hourlyData = hourly || weather?.hourly || {};
  const times = arr(hourlyData.time);
  const temps = arr(hourlyData.temperature_2m);
  const winds = arr(hourlyData.wind_speed_10m);
  const rains = arr(hourlyData.precipitation_probability);
  const codes = arr(hourlyData.weather_code);
  const window = times.map((raw, i) => ({ date: toDate(raw), i })).find(({ date, i }) => {
    if (!date || date.getTime() < reference.getTime() || date.getTime() > reference.getTime() + 5 * 86400000) return false;
    // No routine full-inspection recommendation during core temperate winter.
    if (profile !== "tropical" && [11, 0, 1].includes(seasonalMonth)) return false;
    const code = codes[i];
    return finite(temps[i]) && finite(winds[i]) && finite(rains[i]) && finite(code) &&
      temps[i] >= INSPECTION_MIN_C && winds[i] <= INSPECTION_MAX_WIND_KMH &&
      rains[i] <= INSPECTION_MAX_RAIN_PROBABILITY &&
      ![45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99].includes(code);
  });
  if (window) {
    const i = window.i;
    add("weather", "inspection-opportunity", "✅", `${weekday(window.date, timezone)} around ${hourText(window.date, timezone)}: potentially suitable weather for an inspection (${tempText(temps[i], unit)}, wind ${windText(winds[i], windUnit)}, rain chance ${Math.round(rains[i])}%). Confirm conditions at the hive and whether inspection is seasonally necessary.`, 40, { forecastDate: dateKey(window.date, timezone) });
  }

  // Open-Meteo's airborne pollen measurements are NOT bee forage or nectar-flow
  // measurements. Keep allergy information in the separate pollen panel; do not
  // turn atmospheric pollen concentration into beekeeping advice.
  void pollen;

  for (const category of CATEGORIES) sections[category].notes.sort((a, b) => b.priority - a.priority);
  return {
    sections,
    hasSignificantWarning: major.length > 0,
    profile,
    month: monthText(reference, timezone),
    // Dashboard uses the same notes as the Weather page; no hive-record linkage.
    dashboardPreview: CATEGORIES.flatMap(k => sections[k].notes).sort((a, b) => b.priority - a.priority).slice(0, 3),
  };
}

// Existing Weather.jsx and Dashboard.jsx expect an array of { icon, text }.
// Keep their current shape working until the shared accordion is integrated.
export function buildBeekeeperNotes(input = {}) {
  const structured = buildBeekeeperNotesStructured(input);
  return CATEGORIES.flatMap(k => structured.sections[k].notes).map(({ icon, text }) => ({ icon, text }));
}
