// src/utils/formatDerivedWeather.js

const TEMP_UNIT_KEY = "prefs.temp_unit"; // "C" | "F"

export function getTempUnit() {
  const u = (localStorage.getItem(TEMP_UNIT_KEY) || "C").toUpperCase();
  return u === "F" ? "F" : "C";
}

export function setTempUnit(unit) {
  const u = (unit || "C").toUpperCase() === "F" ? "F" : "C";
  localStorage.setItem(TEMP_UNIT_KEY, u);
  return u;
}

export function cToF(c) {
  if (!Number.isFinite(c)) return null;
  return Math.round((c * 9) / 5 + 32);
}

/**
 * Accepts:
 * - legacy string: "Light drizzle"
 * - JSON string: {"desc":"Light drizzle","temp_c":12}
 * - object: { desc, temp_c }
 *
 * Returns display string: "12°C – Light drizzle" (or °F depending on preference)
 */
export function formatDerivedWeather(value, unitOverride) {
  if (value == null) return "";

  const unit = unitOverride ? unitOverride : getTempUnit();

  let obj = null;

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return "";

    // Try JSON
    if (s.startsWith("{") && s.endsWith("}")) {
      try {
        obj = JSON.parse(s);
      } catch {
        // not JSON, fall through
      }
    }

    // Legacy plain text
    if (!obj) return s;
  } else if (typeof value === "object") {
    obj = value;
  }

  const desc = (obj?.desc || obj?.description || "").toString().trim();
  const tempC = Number(obj?.temp_c);

  if (!Number.isFinite(tempC)) {
    // If no temp, still show description (or blank)
    return desc || "";
  }

  const temp = unit === "F" ? cToF(tempC) : Math.round(tempC);
  const suffix = unit === "F" ? "°F" : "°C";

  if (desc) return `${temp}${suffix} – ${desc}`;
  return `${temp}${suffix}`;
}