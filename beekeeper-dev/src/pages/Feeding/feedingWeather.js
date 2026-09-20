import { formatDerivedWeather, getTempUnit } from "../../utils/formatDerivedWeather.js";

const weatherCodeMap = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export async function fetchFeedingWeather(apiary, dateStr) {
  const lat = Number(apiary?.latitude);
  const lon = Number(apiary?.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !dateStr) {
    return { weather: "", weatherCode: "", display: "" };
  }

  const qs = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    start_date: dateStr,
    end_date: dateStr,
    timezone: "auto",
  }).toString();

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs}`);
    if (!res.ok) return { weather: "", weatherCode: "", display: "" };

    const data = await res.json();
    const times = data?.daily?.time || [];
    const idx = times.indexOf(dateStr);
    if (idx < 0) return { weather: "", weatherCode: "", display: "" };

    const codes = data?.daily?.weather_code || data?.daily?.weathercode || [];
    const code = codes[idx];
    const tMax = Number((data?.daily?.temperature_2m_max || [])[idx]);
    const tMin = Number((data?.daily?.temperature_2m_min || [])[idx]);

    const temp_c =
      Number.isFinite(tMax) && Number.isFinite(tMin)
        ? Math.round((tMax + tMin) / 2)
        : null;

    const desc = weatherCodeMap[code] || "Unknown";
    const weather = JSON.stringify({ desc, temp_c });
    const display = formatDerivedWeather({ desc, temp_c }, getTempUnit());

    return {
      weather,
      weatherCode: String(code ?? ""),
      display,
    };
  } catch {
    return { weather: "", weatherCode: "", display: "" };
  }
}
