// src/pages/Weather.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase.js";
import { buildBeekeeperNotes } from "../utils/buildBeekeeperNotes";

// === Feature flags (flip to true in production if you want these) ===
const ENABLE_POLLEN = true;
const ENABLE_WARNINGS = true;

// Weather codes → label & emoji
const codeMap = {
  0: { label: "Clear", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Drizzle", icon: "🌦️" },
  56: { label: "Freezing drizzle", icon: "🌧️❄️" },
  57: { label: "Freezing drizzle", icon: "🌧️❄️" },
  61: { label: "Rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️❄️" },
  67: { label: "Freezing rain", icon: "🌧️❄️" },
  71: { label: "Snow", icon: "❄️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌦️" },
  82: { label: "Heavy showers", icon: "🌧️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Snow showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thundery rain", icon: "⛈️" },
  99: { label: "Thundery rain", icon: "⛈️" },
};

// time helpers
const toDate = (t) =>
  typeof t === "number" ? new Date(t * 1000) : new Date(t || 0);
const fmtHM = (t, tz) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(toDate(t));
const fmtDay = (t, tz) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: tz,
  }).format(toDate(t));
const fmtLong = (t, tz) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(toDate(t));

// circuit breaker (weather only)
const CB_KEY = "weather_breaker_until";
const BREAK_MINUTES = 30;

export default function Weather() {
  const [apiaries, setApiaries] = useState([]);
  const [selectedApiary, setSelectedApiary] = useState("");
  const [weather, setWeather] = useState(null);
  const [pollen, setPollen] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [unit, setUnit] = useState("C"); // C or F for temperature
  const [windUnit, setWindUnit] = useState("kmh"); // kmh or mph for wind
  const [usedFallback, setUsedFallback] = useState(false);

  // Load apiaries and pick default
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("apiaries")
        .select("id, name, latitude, longitude, is_default")
        .order("is_default", { ascending: false })
        .order("name", { ascending: true });

      if (!alive) return;

      if (error) {
        console.error("Apiaries load error:", error);
        setApiaries([]);
        setSelectedApiary("");
        setErr("Failed to load apiaries.");
        return;
      }

      const list = data || [];
      setApiaries(list);
      if (list.length) {
        const preferred = list.find((a) => a?.is_default === true) || list[0];
        setSelectedApiary(String(preferred.id));
      } else {
        setSelectedApiary("");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function fetchJsonOnce(url, signal) {
    try {
      const res = await fetch(url, {
        signal,
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        /* ignore JSON parse errors */
      }
      return { ok: res.ok, status: res.status, text, json, url };
    } catch (e) {
      return { ok: false, status: 0, text: String(e?.message || e), json: null, url };
    }
  }

  function normalizeLegacy(json) {
    if (!json?.current_weather) return null;
    const cw = json.current_weather;
    return {
      ...json,
      timezone: json.timezone || "UTC",
      current: {
        temperature_2m: cw.temperature,
        apparent_temperature: cw.temperature,
        relative_humidity_2m: undefined,
        is_day: cw.is_day,
        weather_code: cw.weathercode,
        wind_speed_10m: cw.windspeed,
        wind_direction_10m: cw.winddirection,
        time: cw.time,
      },
    };
  }

  function currentFromHourly(json) {
    const tz = json?.timezone || "UTC";
    const h = json?.hourly || {};
    const times = Array.isArray(h.time) ? h.time : [];
    if (!times.length) return null;

    const now = Date.now();
    let idx = 0,
      bestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const ms =
        typeof times[i] === "number" ? times[i] * 1000 : Date.parse(times[i] || 0);
      const diff = Math.abs(ms - now);
      if (diff < bestDiff) {
        bestDiff = diff;
        idx = i;
      }
    }
    const pick = (arr) => (Array.isArray(arr) ? arr[idx] : undefined);

    return {
      timezone: tz,
      current: {
        temperature_2m: pick(h.temperature_2m),
        apparent_temperature: pick(h.apparent_temperature) ?? pick(h.temperature_2m),
        relative_humidity_2m: pick(h.relative_humidity_2m),
        weather_code: pick(h.weather_code),
        wind_speed_10m: pick(h.wind_speed_10m),
        time: times[idx],
      },
    };
  }

  // Fetch weather (+ optional pollen & warnings) when selection changes
  useEffect(() => {
    if (!selectedApiary) return;

    const a = apiaries.find((x) => String(x.id) === String(selectedApiary));
    let lat = Number(a?.latitude);
    let lon = Number(a?.longitude);

    const good = (v) => Number.isFinite(v) && !(Math.abs(v) === Infinity);
    if (!good(lat) || !good(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      lat = 51.5074; // London fallback
      lon = -0.1278;
      setUsedFallback(true);
    } else {
      setUsedFallback(false);
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setLoading(true);
      setErr("");

      // Circuit breaker for the main weather call
      const until = Number(localStorage.getItem(CB_KEY) || 0);
      if (until > Date.now()) {
        setLoading(false);
        setErr("Weather temporarily unavailable (provider error).");
        setWeather(null);
        setPollen(null);
        setWarnings([]);
        return;
      }

      let gotWeather = false;
      let localWeather = null;

      // 1) Modern "current=" API
      const q1 = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m",
        hourly:
          "temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m",
        daily:
          "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max",
        forecast_days: "7",
        timezone: "auto",
        timeformat: "unixtime",
      }).toString();

      const r1 = await fetchJsonOnce(
        `https://api.open-meteo.com/v1/forecast?${q1}`,
        signal
      );
      if (r1.ok && r1.json?.current) {
        localWeather = r1.json;
        gotWeather = true;
      }

      // 2) Legacy fallback "current_weather=true"
      if (!gotWeather) {
        const q2 = new URLSearchParams({
          latitude: String(lat),
          longitude: String(lon),
          current_weather: "true",
          hourly:
            "temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m",
          daily:
            "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max",
          timezone: "auto",
          timeformat: "unixtime",
        }).toString();

        const r2 = await fetchJsonOnce(
          `https://api.open-meteo.com/v1/forecast?${q2}`,
          signal
        );
        const normalized = r2.ok ? normalizeLegacy(r2.json) : null;
        if (normalized?.current) {
          localWeather = {
            ...normalized,
            hourly: r2.json?.hourly,
            daily: r2.json?.daily,
          };
          gotWeather = true;
        }
      }

      // 3) Derive current from hourly as last resort
      if (!gotWeather) {
        const q3 = new URLSearchParams({
          latitude: String(lat),
          longitude: String(lon),
          hourly:
            "temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m",
          daily:
            "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max",
          timezone: "auto",
          timeformat: "unixtime",
        }).toString();
        const r3 = await fetchJsonOnce(
          `https://api.open-meteo.com/v1/forecast?${q3}`,
          signal
        );
        if (r3.ok && r3.json?.hourly) {
          const derived = currentFromHourly(r3.json);
          if (derived?.current) {
            localWeather = { ...r3.json, ...derived };
            gotWeather = true;
          }
        }
      }

      if (!gotWeather) {
        setErr("Failed to load weather.");
        setWeather(null);
        localStorage.setItem(
          CB_KEY,
          String(Date.now() + BREAK_MINUTES * 60 * 1000)
        );
      } else {
        setErr("");
        setWeather(localWeather);
        localStorage.removeItem(CB_KEY);
      }

      // Pollen (optional)
      if (ENABLE_POLLEN) {
        try {
          const pollenQs = new URLSearchParams({
            latitude: String(lat),
            longitude: String(lon),
            hourly: "tree_pollen,grass_pollen,weed_pollen",
            timezone: "auto",
            timeformat: "unixtime",
          }).toString();
          const rP = await fetchJsonOnce(
            `https://pollen.open-meteo.com/v1/forecast?${pollenQs}`,
            signal
          );
          setPollen(rP.ok && rP.json ? rP.json : null);
        } catch {
          setPollen(null);
        }
      } else {
        setPollen(null);
      }

      // Official warnings (optional)
      if (ENABLE_WARNINGS) {
        try {
          const warnQs = new URLSearchParams({
            latitude: String(lat),
            longitude: String(lon),
            timezone: "auto",
            timeformat: "unixtime",
          }).toString();
          const rW = await fetchJsonOnce(
            `https://api.open-meteo.com/v1/warnings?${warnQs}`,
            signal
          );
          const list =
            rW?.ok && Array.isArray(rW?.json?.warnings)
              ? rW.json.warnings
              : [];
          setWarnings(list.slice(0, 8));
        } catch {
          setWarnings([]);
        }
      } else {
        setWarnings([]);
      }

      setLoading(false);
    })();

    return () => controller.abort();
  }, [selectedApiary, apiaries]);

  // UI helpers
  const t = (c) =>
    unit === "C" ? Math.round(c ?? 0) : Math.round(((c ?? 0) * 9) / 5 + 32);
  const unitLabel = unit === "C" ? "°C" : "°F";
  const windDisplay = (k) => {
    if (!Number.isFinite(k)) return "–";
    const v = windUnit === "kmh" ? Math.round(k) : Math.round(k * 0.621371);
    const suffix = windUnit === "kmh" ? "km/h" : "mph";
    return `${v} ${suffix}`;
  };

  const tz = weather?.timezone || "UTC";
  const hourly = weather?.hourly || {};
  const daily = weather?.daily || {};
  const safeArr = (a, n = 0) =>
    Array.isArray(a) ? a : Array(n).fill(undefined);

  // nearest hour
  const nowIdx = useMemo(() => {
    const times = safeArr(hourly.time, 0);
    if (!times.length) return 0;
    const now = Date.now();
    let best = 0,
      bestDiff = Infinity;
    times.forEach((tStamp, i) => {
      const ms =
        typeof tStamp === "number" ? tStamp * 1000 : Date.parse(tStamp || 0);
      const diff = Math.abs(ms - now);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    });
    return best;
  }, [hourly.time]);

  // Beekeeper Notes – via shared helper (full version here)
  const advisories = useMemo(() => {
    if (!weather || !daily) return [];

    const tempsMin = safeArr(daily.temperature_2m_min, 0).filter(
      Number.isFinite
    );
    const tempsMax = safeArr(daily.temperature_2m_max, 0).filter(
      Number.isFinite
    );
    const windsMax = safeArr(daily.wind_speed_10m_max, 0).filter(
      Number.isFinite
    );
    const precs = safeArr(daily.precipitation_sum, 0).filter(Number.isFinite);

    let monthIndex = new Date().getMonth();
    const currentTs = weather?.current?.time;
    if (currentTs) {
      monthIndex = toDate(currentTs).getMonth();
    }

    return buildBeekeeperNotes({
      monthIndex,
      tempsMin,
      tempsMax,
      windsMax,
      precs,
      unit,
      windUnit,
    });
  }, [daily, weather, unit, windUnit]);

  const pollenHourly = pollen?.hourly || {};
  const scalePollen = (v) => {
    if (!Number.isFinite(v))
      return { label: "–", cls: "bg-zinc-800 text-zinc-300" };
    if (v < 20) return { label: "Low", cls: "bg-emerald-900/40 text-emerald-200" };
    if (v < 60)
      return { label: "Moderate", cls: "bg-amber-900/40 text-amber-200" };
    if (v < 150)
      return { label: "High", cls: "bg-orange-900/40 text-orange-200" };
    return { label: "Very High", cls: "bg-red-900/40 text-red-200" };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 overflow-x-hidden">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Weather</h2>
        <div className="flex w-full sm:w-auto gap-2 flex-wrap">
          <label className="sr-only">Apiary</label>
          <select
            className="flex-1 border border-zinc-300 bg-white text-black rounded px-2 py-2 text-sm"
            value={selectedApiary}
            onChange={(e) => setSelectedApiary(e.target.value)}
          >
            {apiaries.length === 0 ? (
              <option value="">No apiaries found</option>
            ) : (
              apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
            className="px-3 py-2 text-sm rounded border border-zinc-300 bg-white hover:bg-zinc-100 text-black"
          >
            {unit === "C" ? "Show °F" : "Show °C"}
          </button>
          <button
            type="button"
            onClick={() => setWindUnit((w) => (w === "kmh" ? "mph" : "kmh"))}
            className="px-3 py-2 text-sm rounded border border-zinc-300 bg-white hover:bg-zinc-100 text-black"
          >
            {windUnit === "kmh" ? "Show mph" : "Show km/h"}
          </button>
        </div>
      </div>

      {/* Fallback banner */}
      {usedFallback && (
        <div className="text-amber-800 bg-amber-100 border border-amber-200 rounded p-3 text-sm mb-4">
          This apiary has no coordinates, so weather and notes are shown for a
          default location (London). Add latitude/longitude on the apiary for
          precise local guidance.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="w-8 h-8 border-4 border-zinc-400 border-dotted rounded-full animate-spin" />
        </div>
      ) : err ? (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
          {err}
        </div>
      ) : !weather ? (
        <div className="text-zinc-700">No weather data.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 items-start pb-6">
          {/* ===== Main column ===== */}
          <div className="space-y-4">
            {/* Now */}
            <div className="bg-zinc-900 text-zinc-100 rounded shadow p-4 border border-zinc-800">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-3xl sm:text-4xl">
                    {codeMap[weather?.current?.weather_code]?.icon || "🌡️"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl font-semibold break-words">
                      {codeMap[weather?.current?.weather_code]?.label ||
                        "Current"}
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-400 break-words">
                      Updated {fmtLong(weather?.current?.time, tz)} (local)
                    </div>
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold">
                  {t(weather?.current?.temperature_2m)}
                  {unitLabel}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs sm:text-sm">
                <div className="p-3 rounded bg-zinc-800">
                  <div className="text-zinc-400">Feels like</div>
                  <div className="font-semibold">
                    {t(
                      weather?.current?.apparent_temperature ??
                        weather?.current?.temperature_2m
                    )}
                    {unitLabel}
                  </div>
                </div>
                <div className="p-3 rounded bg-zinc-800">
                  <div className="text-zinc-400">Humidity</div>
                  <div className="font-semibold">
                    {Number.isFinite(weather?.current?.relative_humidity_2m)
                      ? `${weather?.current?.relative_humidity_2m}%`
                      : "–"}
                  </div>
                </div>
                <div className="p-3 rounded bg-zinc-800">
                  <div className="text-zinc-400">Wind</div>
                  <div className="font-semibold">
                    {windDisplay(weather?.current?.wind_speed_10m)}
                  </div>
                </div>
                <div className="p-3 rounded bg-zinc-800">
                  <div className="text-zinc-400">Direction</div>
                  <div className="font-semibold">
                    {Number.isFinite(weather?.current?.wind_direction_10m)
                      ? `${weather?.current?.wind_direction_10m}°`
                      : "–"}
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly strip */}
            <div className="bg-zinc-900 text-zinc-100 rounded shadow p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Today, hour by hour</h3>
                <div className="text-xs sm:text-sm text-zinc-400">
                  Local time ({tz})
                </div>
              </div>

              <div className="-mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto snap-x snap-mandatory">
                <div className="flex gap-2 sm:gap-3 w-max">
                  {safeArr(hourly.time)
                    .slice(nowIdx, nowIdx + 18)
                    .map((tstamp, i) => {
                      const idx = nowIdx + i;
                      const code = safeArr(hourly.weather_code)[idx];
                      const temp = safeArr(hourly.temperature_2m)[idx];
                      const rainProb = safeArr(
                        hourly.precipitation_probability
                      )[idx];
                      const wind10 = safeArr(hourly.wind_speed_10m)[idx];
                      return (
                        <div
                          key={tstamp ?? idx}
                          className="w-24 sm:w-28 p-3 rounded border border-zinc-700 bg-zinc-800 shrink-0 snap-start"
                        >
                          <div className="text-xs text-zinc-400">
                            {fmtHM(tstamp, tz)}
                          </div>
                          <div className="text-2xl sm:text-3xl">
                            {codeMap[code]?.icon || "⛅"}
                          </div>
                          <div className="font-semibold text-sm sm:text-base">
                            {Number.isFinite(temp)
                              ? `${t(temp)}${unitLabel}`
                              : "–"}
                          </div>
                          <div className="text-[11px] sm:text-xs text-zinc-400">
                            Rain{" "}
                            {Number.isFinite(rainProb)
                              ? `${rainProb}%`
                              : "–"}
                          </div>
                          <div className="text-[11px] sm:text-xs text-zinc-400">
                            Wind {windDisplay(wind10)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Next 5 days */}
            <div className="bg-zinc-900 text-zinc-100 rounded shadow p-4 border border-zinc-800">
              <h3 className="text-lg font-semibold mb-3">Next 5 Days</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {safeArr(daily.time).slice(0, 5).map((d, i) => {
                  const wc = safeArr(daily.weather_code)[i];
                  const tmax = safeArr(daily.temperature_2m_max)[i];
                  const tmin = safeArr(daily.temperature_2m_min)[i];
                  const psum = safeArr(daily.precipitation_sum)[i];
                  const wmax = safeArr(daily.wind_speed_10m_max)[i];
                  return (
                    <div
                      key={d ?? i}
                      className="p-3 rounded border border-zinc-700 bg-zinc-800 text-center"
                    >
                      <div className="text-sm text-zinc-400">
                        {fmtDay(d, tz)}
                      </div>
                      <div className="text-2xl sm:text-3xl my-1">
                        {codeMap[wc]?.icon || "⛅"}
                      </div>
                      <div className="font-semibold text-sm sm:text-base">
                        {Number.isFinite(tmax)
                          ? `${t(tmax)}${unitLabel}`
                          : "–"}{" "}
                        /{" "}
                        {Number.isFinite(tmin)
                          ? `${t(tmin)}${unitLabel}`
                          : "–"}
                      </div>
                      <div className="text-xs text-zinc-400">
                        Rain {Number.isFinite(psum) ? Math.round(psum) : "–"}{" "}
                        mm
                      </div>
                      <div className="text-xs text-zinc-400">
                        Wind up to {windDisplay(wmax)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===== Sidebar column ===== */}
          <aside className="space-y-4">
            {/* Seasonal Advice – Beekeeper Notes */}
            <div className="bg-zinc-900 text-zinc-100 rounded shadow p-4 border border-zinc-800">
              <h3 className="text-lg font-semibold mb-1">
                Seasonal Advice – Beekeeper Notes
              </h3>
              <p className="text-xs text-zinc-400 mb-2">
                These notes combine the forecast for this location with typical
                seasonal patterns for hobbyist beekeepers in cool-temperate UK
                conditions. Guide only – this is general beekeeping advice based
                on average colony behaviour. Weather, forage and nectar flows
                vary by region, altitude and micro-climate, and every colony is
                different, so always use your own judgement and follow any
                guidance from your local beekeeping association or mentor. Never
                rely on this panel alone for critical decisions about
                inspections, feeding or treatments.
              </p>
              {advisories.length ? (
                <ul className="space-y-1 text-sm">
                  {advisories.map((x, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span>{x.icon}</span>
                      <span className="break-words">{x.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-zinc-300">
                  No special notes today.
                </div>
              )}
            </div>

            {/* Warnings (optional) */}
            {ENABLE_WARNINGS && (
              <div className="bg-zinc-900 text-zinc-100 rounded shadow p-4 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-2">
                  Official Weather Warnings
                </h3>
                {warnings?.length ? (
                  <ul className="space-y-2 text-sm">
                    {warnings.map((w, idx) => {
                      const sev = (w.severity ?? w.level ?? "").toString();
                      const badge =
                        sev.includes("red") || sev === "3"
                          ? "bg-red-900/40 text-red-200"
                          : sev.includes("orange") || sev === "2"
                          ? "bg-orange-900/40 text-orange-200"
                          : sev.includes("yellow") || sev === "1"
                          ? "bg-amber-900/40 text-amber-200"
                          : "bg-zinc-800 text-zinc-300";
                      const title = w.event || w.headline || "Warning";
                      const start = w.start || w.effective || w.onset;
                      const end = w.end || w.expires || w.expiry;
                      const wtz = w.timezone || tz;
                      return (
                        <li
                          key={idx}
                          className="border border-zinc-700 rounded p-2 bg-zinc-800"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${badge}`}
                            >
                              {w.severity_text || w.severity || "Info"}
                            </span>
                            <div className="font-semibold break-words">
                              {title}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            {start ? fmtLong(start, wtz) : "—"} →{" "}
                            {end ? fmtLong(end, wtz) : "—"} ({wtz})
                          </div>
                          {w.description ? (
                            <div className="mt-1 text-sm text-zinc-200 whitespace-pre-wrap break-words">
                              {String(w.description).slice(0, 220)}
                              {String(w.description).length > 220 ? "…" : ""}
                            </div>
                          ) : null}
                          {w.instruction ? (
                            <div className="mt-1 text-xs text-zinc-300 whitespace-pre-wrap break-words">
                              Advice: {String(w.instruction).slice(0, 220)}
                              {String(w.instruction).length > 220 ? "…" : ""}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-sm text-zinc-200 bg-zinc-900/50 border border-zinc-700 rounded p-2">
                    No official alerts for this location.
                  </div>
                )}
              </div>
            )}

            {/* Pollen (optional) */}
            {ENABLE_POLLEN && (
              <div className="bg-zinc-900 text-zinc-100 rounded shadow p-4 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-2">
                  Pollen — local time ({tz})
                </h3>
                {!pollen?.hourly ? (
                  <div className="text-sm text-zinc-200 bg-zinc-900/50 border border-zinc-700 rounded p-2">
                    No pollen data.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {["tree_pollen", "grass_pollen", "weed_pollen"].map(
                      (key) => {
                        const hourlyP = pollenHourly || {};
                        const times = Array.isArray(hourlyP.time)
                          ? hourlyP.time
                          : [];
                        let best = 0,
                          bestDiff = Infinity;
                        times.forEach((tStamp, i) => {
                          const ms =
                            typeof tStamp === "number"
                              ? tStamp * 1000
                              : Date.parse(tStamp || 0);
                          const diff = Math.abs(ms - Date.now());
                          if (diff < bestDiff) {
                            bestDiff = diff;
                            best = i;
                          }
                        });
                        const nowVal = Array.isArray(hourlyP[key])
                          ? hourlyP[key][best]
                          : undefined;
                        const next12 = Array.isArray(hourlyP[key])
                          ? hourlyP[key]
                              .slice(best, best + 12)
                              .filter(Number.isFinite)
                          : [];
                        const dayMax = next12.length
                          ? Math.max(...next12)
                          : undefined;
                        const nowScale = scalePollen(nowVal);
                        const maxScale = scalePollen(dayMax);
                        const label = key.split("_")[0];
                        return (
                          <div
                            key={key}
                            className="border border-zinc-700 rounded p-3 bg-zinc-800"
                          >
                            <div className="text-sm text-zinc-400 capitalize">
                              {label}
                            </div>
                            <div
                              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${nowScale.cls}`}
                            >
                              {nowScale.label}
                            </div>
                            <div className="text-xs text-zinc-400 mt-1">
                              Today peak:{" "}
                              <span
                                className={`px-1 rounded ${maxScale.cls}`}
                              >
                                {maxScale.label}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
