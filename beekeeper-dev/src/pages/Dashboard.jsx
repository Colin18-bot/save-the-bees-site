// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import { Link, useLocation } from "react-router-dom";

import { buildBeekeeperNotes } from "../utils/buildBeekeeperNotes.js";

// Weather label/icon maps (for 5-day forecast)
const WX_LABEL = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thundery rain",
  99: "Thundery rain",
};
const WX_ICON = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  56: "🌧️❄️",
  57: "🌧️❄️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "🌧️❄️",
  67: "🌧️❄️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  77: "❄️",
  80: "🌦️",
  81: "🌦️",
  82: "🌧️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

const statusPill = (status = "") => {
  const s = String(status).toLowerCase();
  if (s === "complete" || s === "completed" || s === "done") {
    return "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200";
  }
  return "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200";
};

// Updated to light orange to match archived palette
const ArchivedPill = ({ at }) =>
  at ? (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
      title="This item is archived"
    >
      Archived
    </span>
  ) : null;

const isOverdue = (dateIso, status) => {
  if (!dateIso) return false;
  const s = String(status || "").toLowerCase();
  if (s === "complete" || s === "completed" || s === "done") return false;
  const today = new Date();
  const due = new Date(dateIso);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

/**
 * Centered, “button-like” stat tile
 * - Keeps same size via p-4 and a small min-height
 * - Background + hover highlight stays in-keeping (amber/green)
 */
const StatTile = ({ to, title, value, subtitle, cta = "Open →", variant = "default" }) => {
  const base =
    "group relative rounded-xl p-4 border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const layout = "flex flex-col items-center justify-center text-center gap-1 min-h-[108px]";

  const variants = {
    default:
      "bg-gradient-to-br from-amber-50 to-green-50 border-amber-200/70 hover:from-amber-100 hover:to-green-100 hover:border-amber-300/80 hover:shadow-md focus-visible:ring-amber-400",
    nfc:
      "bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200/70 hover:from-blue-100 hover:to-emerald-100 hover:border-blue-300/80 hover:shadow-md focus-visible:ring-blue-400",
  };

  return (
    <Link to={to} className={`${base} ${layout} ${variants[variant] || variants.default}`}>
      <div className="text-sm text-gray-700 font-medium">{title}</div>

      <div className="text-3xl font-extrabold tracking-tight text-[#1a3329] leading-none">
        {value}
      </div>

      {subtitle ? <div className="text-xs text-gray-600">{subtitle}</div> : null}

      <div className="pt-1 text-xs font-semibold text-blue-700 group-hover:text-blue-800">
        {cta}
      </div>

      {/* subtle inner highlight ring on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 group-hover:ring-black/10" />
    </Link>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const printAnchorRef = useRef(null);

  // Filter
  const [selectedApiaryId, setSelectedApiaryId] = useState("all");

  // Stripe upgrade banner
  const [stripeMessage, setStripeMessage] = useState("");

  // Stats
  const [stats, setStats] = useState({
    apiaries: 0,
    hives: 0,
    inspections: 0,
    todos: 0,
    logbook: 0,
  });

  // NFC summary (filter-aware)
  const [nfcSummary, setNfcSummary] = useState({
    tagged: 0,
    total: 0,
  });

  // Recent lists
  const [recentInspections, setRecentInspections] = useState([]);
  const [recentTodos, setRecentTodos] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  // Recent NFC-tagged hives
  const [recentNfcHives, setRecentNfcHives] = useState([]);

  // Loading flags for recent sections
  const [loadingInspections, setLoadingInspections] = useState(true);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Weather
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [defaultApiaryName, setDefaultApiaryName] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  // ✅ Keep the *real* apiary latitude for season profile even if weather falls back to London
  const [defaultApiaryLatitude, setDefaultApiaryLatitude] = useState(null);

  // --- Weather timezone helpers (apiary-local time) ---
  const weatherTz = weather?.timezone || "UTC";

  const fmtLocalTime = (unixSeconds, tz) => {
    if (!Number.isFinite(unixSeconds)) return "";
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(unixSeconds * 1000));
  };

  // Name lookups / apiary list for filter
  const [apiariesList, setApiariesList] = useState([]); // [{id, name}]
  const [apiaryNameById, setApiaryNameById] = useState({});
  const [hiveNameById, setHiveNameById] = useState({});

  // Subscription level (for NFC visibility etc.)
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");

  // ✅ FIX: handles unix seconds correctly (Open-Meteo daily.time is unixtime seconds)
  // Optional tz: pass weatherTz for weather forecast dates to match apiary-local timezone.
  const formatUKDate = (d, tz) => {
    if (d === null || d === undefined || d === "") return "No date";

    // Detect unix seconds (number or numeric string)
    const asNumber = typeof d === "number" ? d : Number(d);
    if (Number.isFinite(asNumber)) {
      const dt = new Date(asNumber * 1000);

      if (tz) {
        return new Intl.DateTimeFormat("en-GB", {
          timeZone: tz,
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(dt);
      }

      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const yyyy = dt.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    // Otherwise assume ISO / parseable date string (Supabase dates)
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);

    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Build report link with current filter
  const reportHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (selectedApiaryId !== "all") qs.set("apiary_id", selectedApiaryId);
    return `/reports/print${qs.toString() ? `?${qs.toString()}` : ""}`;
  }, [selectedApiaryId]);

  // Smooth scroll to #print if coming back from PrintReport
  useEffect(() => {
    if (location.hash === "#print" && printAnchorRef.current) {
      setTimeout(() => {
        printAnchorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  }, [location]);

  // Stripe upgrade banner: show after returning from checkout
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("upgraded") === "1") {
      setStripeMessage(
        "Thanks for upgrading to Premium. NFC tap-to-log and unlimited apiaries/hives are now enabled on your account."
      );
    }
  }, [location.search]);

  // ---- Lookups (names + list for filter) ----
  useEffect(() => {
    const fetchNameLookups = async () => {
      const [{ data: apiaries }, { data: hives }] = await Promise.all([
        supabase.from("apiaries").select("id, name").is("archived_at", null).order("name"),
        supabase.from("hives").select("id, name").is("archived_at", null),
      ]);
      const aMap = {};
      for (const a of apiaries || []) aMap[a.id] = a.name;
      const hMap = {};
      for (const h of hives || []) hMap[h.id] = h.name;
      setApiaryNameById(aMap);
      setHiveNameById(hMap);
      setApiariesList(apiaries || []);
    };
    fetchNameLookups();
  }, []);

  // ---- Stats (filter-aware) ----
  const fetchStats = async (apiaryId = "all") => {
    const { count: apiaries } = await supabase
      .from("apiaries")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);

    let hivesQ = supabase
      .from("hives")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);
    if (apiaryId !== "all") hivesQ = hivesQ.eq("apiary_id", apiaryId);
    const { count: hives } = await hivesQ;

    let inspQ = supabase
      .from("inspections")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);
    if (apiaryId !== "all") inspQ = inspQ.eq("apiary_id", apiaryId);
    const { count: inspections } = await inspQ;

    let todosQ = supabase.from("todos").select("*", { count: "exact", head: true });
    if (apiaryId !== "all") todosQ = todosQ.eq("apiary_id", apiaryId);
    const { count: todos } = await todosQ;

    let logsQ = supabase
      .from("logbook")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);
    if (apiaryId !== "all") logsQ = logsQ.eq("apiary_id", apiaryId);
    const { count: logbook } = await logsQ;

    setStats({
      apiaries: apiaries || 0,
      hives: hives || 0,
      inspections: inspections || 0,
      todos: todos || 0,
      logbook: logbook || 0,
    });
  };

  // ---- NFC summary counts (filter-aware) ----
  const fetchNfcSummary = async (apiaryId = "all") => {
    try {
      let totalQ = supabase
        .from("hives")
        .select("*", { count: "exact", head: true })
        .is("archived_at", null);
      if (apiaryId !== "all") totalQ = totalQ.eq("apiary_id", apiaryId);
      const { count: total } = await totalQ;

      let taggedQ = supabase
        .from("hives")
        .select("*", { count: "exact", head: true })
        .is("archived_at", null)
        .not("nfc_uid", "is", null);
      if (apiaryId !== "all") taggedQ = taggedQ.eq("apiary_id", apiaryId);
      const { count: tagged } = await taggedQ;

      setNfcSummary({
        tagged: tagged || 0,
        total: total || 0,
      });
    } catch (e) {
      console.error("Failed to load NFC summary:", e);
      setNfcSummary({ tagged: 0, total: 0 });
    }
  };

  // ---- Recent NFC-tagged hives (filter-aware) ----
  const fetchRecentNfcHives = async (apiaryId = "all") => {
    try {
      let q = supabase
        .from("hives")
        .select("id, name, apiary_id, nfc_uid, archived_at")
        .is("archived_at", null)
        .not("nfc_uid", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);

      if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);

      const { data, error } = await q;
      if (error) {
        console.error("Failed to load recent NFC hives:", error);
        setRecentNfcHives([]);
      } else {
        setRecentNfcHives(data || []);
      }
    } catch (err) {
      console.error("Failed to load recent NFC hives:", err);
      setRecentNfcHives([]);
    }
  };

  // ---- Recent lists (filter-aware) ----
  const fetchRecentInspections = async (apiaryId = "all") => {
    setLoadingInspections(true);
    let q = supabase
      .from("inspections")
      .select("id, date, notes, apiary_id, hive_id, archived_at")
      .order("date", { ascending: false })
      .limit(6);
    if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);
    const { data } = await q;
    setRecentInspections(data || []);
    setLoadingInspections(false);
  };

  const fetchRecentTodos = async (apiaryId = "all") => {
    setLoadingTodos(true);
    let q = supabase
      .from("todos")
      .select("id, title, due_date, status, hive_name, apiary_id, archived_at")
      .order("due_date", { ascending: false })
      .limit(6);
    if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);
    const { data } = await q;
    setRecentTodos(data || []);
    setLoadingTodos(false);
  };

  const fetchRecentLogs = async (apiaryId = "all") => {
    setLoadingLogs(true);
    let q = supabase
      .from("logbook")
      .select(
        `
        id,
        log_type,
        entry,
        date,
        apiary_id,
        hive_id,
        inspection_id,
        photo_url,
        archived_at,
        inspection:inspection_id ( id, date )
      `
      )
      .order("date", { ascending: false })
      .limit(6);
    if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);
    const { data } = await q;
    setRecentLogs(data || []);
    setLoadingLogs(false);
  };

  // ---- Weather (default apiary) ----
  const fetchWeather = async () => {
    const lastFail = localStorage.getItem("weather_last_fail");
    const now = Date.now();
    if (lastFail && now - parseInt(lastFail, 10) < 30 * 60 * 1000) {
      setWeatherError("Weather temporarily unavailable (last attempt failed).");
      return;
    }
    try {
      let { data: apiaries } = await supabase
        .from("apiaries")
        .select("id, name, latitude, longitude, is_default")
        .order("is_default", { ascending: false })
        .limit(1);

      const chosen = apiaries?.[0] || null;
      setDefaultApiaryName(chosen?.name || "");

      let lat = Number(chosen?.latitude);
      let lon = Number(chosen?.longitude);
      setDefaultApiaryLatitude(Number.isFinite(lat) ? lat : null);

      const bad =
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180;

      if (bad) {
        lat = 51.5074;
        lon = -0.1278;
        setUsedFallback(true);
      } else {
        setUsedFallback(false);
      }

      const qs = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: "temperature_2m,weather_code,wind_speed_10m",
        daily:
          "temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,precipitation_sum",
        timezone: "auto",
        timeformat: "unixtime",
      }).toString();

      const url = `https://api.open-meteo.com/v1/forecast?${qs}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const current = json.current || {};
      const daily = json.daily || {};
      if (!json.current) throw new Error("No current weather in response");

      const windMph = Number.isFinite(current.wind_speed_10m)
        ? Math.round(current.wind_speed_10m * 0.621371)
        : null;

      setWeather({
        timezone: json.timezone || "UTC",
        latitude: lat,
        longitude: lon,
        current: {
          time: current.time,
          temperature_2m: current.temperature_2m,
          wind_speed_10m: current.wind_speed_10m,
          wind_speed_mph: windMph,
          weather_code: current.weather_code,
        },
        forecast: {
          time: daily.time || [],
          temperature_2m_min: daily.temperature_2m_min || [],
          temperature_2m_max: daily.temperature_2m_max || [],
          weather_code: daily.weather_code || daily.weathercode || [],
          wind_speed_10m_max: daily.wind_speed_10m_max || [],
          precipitation_sum: daily.precipitation_sum || [],
        },
      });

      setWeatherError(null);
      localStorage.removeItem("weather_last_fail");
    } catch (e) {
      console.error("Weather load failed:", e);
      setWeather(null);
      setWeatherError("No weather available");
      localStorage.setItem("weather_last_fail", Date.now().toString());
    }
  };

  // Initial + whenever filter changes
  useEffect(() => {
    fetchStats(selectedApiaryId);
    fetchRecentInspections(selectedApiaryId);
    fetchRecentTodos(selectedApiaryId);
    fetchRecentLogs(selectedApiaryId);
    fetchNfcSummary(selectedApiaryId);
    fetchRecentNfcHives(selectedApiaryId);
  }, [selectedApiaryId]);

  // Weather loads once (default apiary)
  useEffect(() => {
    fetchWeather();
  }, []);

  // Subscription level for this user (for NFC visibility)
  useEffect(() => {
    const fetchSubscriptionLevel = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error loading profile for dashboard:", error);
          return;
        }

        if (profile?.subscription_level) {
          setSubscriptionLevel(profile.subscription_level);
        }
      } catch (err) {
        console.error("Failed to load subscription level:", err);
      }
    };

    fetchSubscriptionLevel();
  }, []);

  // Helpers for building list links with highlight + filter
  const toInspectionsList = (id) =>
    `/inspections?highlight=${encodeURIComponent(id)}&type=INSPECTION${
      selectedApiaryId !== "all" ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
    }`;
  const toTodosList = (id) =>
    `/todos?highlight=${encodeURIComponent(id)}&type=TODO${
      selectedApiaryId !== "all" ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
    }`;
  const toLogbookList = (id) =>
    `/logbook?highlight=${encodeURIComponent(id)}&type=LOGBOOK${
      selectedApiaryId !== "all" ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
    }`;

  // NEW: helper to jump into HiveList with highlight on a specific hive
  const toHiveInList = (id) =>
    `/hives?highlight=${encodeURIComponent(id)}&type=HIVE${
      selectedApiaryId !== "all" ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
    }`;

  const seeAllInspectionsHref = `/inspections${
    selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
  }`;
  const seeAllTodosHref = `/todos${
    selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
  }`;
  const seeAllLogbookHref = `/logbook${
    selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
  }`;

  // Hives link for NFC "See all tagged hives"
  const hivesHref = `/hives${
    selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
  }`;

  // --- Dashboard stat tile links (carry apiary filter where it makes sense) ---
  const apiariesHref = "/apiaries";
  const inspectionsHref = `/inspections${
    selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
  }`;
  const todosHref = `/todos${
    selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
  }`;
  const logbookHref = `/logbook${
    selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""
  }`;

  // ✅ your confirmed NFC manager route
  const nfcManagerHref = "/nfc/manage";

  // --- Beekeeper Notes (Dashboard preview, based on the same rules as Weather page) ---
  const beekeeperNotes = useMemo(() => {
    if (!weather?.forecast) return [];

    // Convert Dashboard's "forecast" shape into the "daily" shape the shared helper expects
    const daily = {
      time: weather.forecast.time,
      temperature_2m_min: weather.forecast.temperature_2m_min,
      temperature_2m_max: weather.forecast.temperature_2m_max,
      precipitation_sum: weather.forecast.precipitation_sum,
      wind_speed_10m_max: weather.forecast.wind_speed_10m_max,
      weather_code: weather.forecast.weather_code,
    };

    return buildBeekeeperNotes({
      daily,
      weather,
      timezone: weather?.timezone || "UTC",
      unit: "C",
      windUnit: "kmh",
      warnings: [],
      pollen: null,

      // ✅ drives north/south/tropical month profile
      latitude: defaultApiaryLatitude ?? weather?.latitude,
    });
  }, [weather, defaultApiaryLatitude]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <Link
            to="/help/getting-started"
            className="text-xs text-gray-500 hover:text-blue-600 hover:underline"
          >
            New here? Read Getting Started →
          </Link>
        </div>

        {/* Filter by Apiary */}
        <div className="w-full md:w-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label htmlFor="apiaryFilter" className="font-medium text-sm whitespace-nowrap">
            Filter by Apiary:
          </label>
          <select
            id="apiaryFilter"
            className="w-full sm:w-auto border rounded px-3 py-2"
            value={selectedApiaryId}
            onChange={(e) => setSelectedApiaryId(e.target.value)}
          >
            <option value="all">All Apiaries</option>
            {apiariesList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stripe upgrade banner */}
      {stripeMessage && (
        <div className="no-print rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-start justify-between text-sm text-green-800">
          <p>{stripeMessage}</p>
          <button
            type="button"
            onClick={() => setStripeMessage("")}
            className="ml-4 text-green-700 hover:text-green-900"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* NFC instructions + CTA (Premium only) */}
      {subscriptionLevel === "premium" && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-blue-900">
            <span className="inline-flex items-center gap-1 font-semibold">
              <span role="img" aria-label="NFC">
                📶
              </span>
              HiveTag NFC
            </span>
            <span className="ml-1">
              – print or download your NFC setup guide, then tap <strong>Scan NFC Tag</strong> to
              start using your tags.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/nfc/instructions"
              className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Open NFC instructions
            </Link>
            <Link
              to="/nfc"
              className="px-3 py-1.5 rounded text-xs font-semibold bg-amber-400 text-[#1a3329] hover:bg-amber-300 border border-amber-500/70"
            >
              Scan NFC Tag
            </Link>
          </div>
        </div>
      )}

      {/* Reports & Export */}
      <div
        ref={printAnchorRef}
        id="print"
        className="no-print bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-semibold">Reports &amp; Export</h2>
          <p className="text-gray-600 mt-1">
            Open Reports or Export Inspections, Tasks, and Logbook by Apiary/Hive and date range.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={reportHref} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Open Reports &amp; Export
          </Link>
        </div>
      </div>

      {/* Stats buttons (centered + nicer theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatTile
          to={apiariesHref}
          title="Apiaries"
          value={selectedApiaryId === "all" ? stats.apiaries : `1 / ${stats.apiaries}`}
          subtitle={selectedApiaryId === "all" ? null : "(this apiary / total)"}
          cta="Open →"
          variant="default"
        />

        <StatTile
          to={hivesHref}
          title="Hives"
          value={stats.hives}
          subtitle={selectedApiaryId !== "all" ? "(this filter)" : null}
          cta="Open →"
          variant="default"
        />

        <StatTile
          to={inspectionsHref}
          title="Inspections"
          value={stats.inspections}
          subtitle={selectedApiaryId !== "all" ? "(this filter)" : null}
          cta="Open →"
          variant="default"
        />

        <StatTile
          to={todosHref}
          title="Tasks"
          value={stats.todos}
          subtitle={selectedApiaryId !== "all" ? "(this filter)" : null}
          cta="Open →"
          variant="default"
        />

        <StatTile
          to={logbookHref}
          title="Logbook"
          value={stats.logbook}
          subtitle={selectedApiaryId !== "all" ? "(this filter)" : null}
          cta="Open →"
          variant="default"
        />

        {subscriptionLevel === "premium" && (
          <StatTile
            to={nfcManagerHref}
            title="NFC Tagged Hives"
            value={nfcSummary.tagged}
            subtitle={`of ${nfcSummary.total} hives${selectedApiaryId !== "all" ? " (this filter)" : ""}`}
            cta="Manage →"
            variant="nfc"
          />
        )}
      </div>

      {/* NFC Tagged Hives list (Premium only) */}
      {subscriptionLevel === "premium" && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-lg font-semibold">NFC Tagged Hives</h2>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
              <span role="img" aria-label="NFC">
                📶
              </span>
              <span className="font-mono">
                {nfcSummary.tagged} / {nfcSummary.total}
              </span>
              {selectedApiaryId !== "all" && (
                <span className="text-[10px] uppercase tracking-wide text-blue-700/80">
                  this filter
                </span>
              )}
            </span>
          </div>

          {recentNfcHives.length === 0 ? (
            <p className="text-sm text-gray-500">
              No NFC tags assigned yet.{" "}
              <Link to="/nfc" className="text-blue-600 underline">
                Scan a tag to link your first hive.
              </Link>
            </p>
          ) : (
            <>
              <ul className="space-y-2 text-sm">
                {recentNfcHives.map((hive) => (
                  <li
                    key={hive.id}
                    className="border p-2 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {hive.name || hiveNameById[hive.id] || "Unnamed hive"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {hive.apiary_id && apiaryNameById[hive.apiary_id]
                          ? `Apiary: ${apiaryNameById[hive.apiary_id]}`
                          : "Apiary: —"}
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-gray-700 break-all">
                        Tag: {hive.nfc_uid}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        to={toHiveInList(hive.id)}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                        aria-label={`Open hive ${hive.name || hive.id} in hive list`}
                      >
                        Open hive →
                      </Link>
                      <Link
                        to={nfcManagerHref}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                        aria-label="Open NFC tag manager"
                      >
                        Manage tags →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-right">
                <Link to={hivesHref} className="text-sm text-blue-600 hover:underline">
                  See all tagged hives →
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent Inspections */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Recent Inspections</h2>
        {loadingInspections ? (
          <p className="text-gray-500">Loading…</p>
        ) : recentInspections.length === 0 ? (
          <p className="text-gray-500">No recent inspections.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {recentInspections.map((i) => (
                <li
                  key={i.id}
                  className={`border p-2 rounded text-sm ${i.archived_at ? "opacity-60" : ""}`}
                  title={i.archived_at ? "Archived inspection" : ""}
                >
                  <div className="min-w-0">
                    <strong className="mr-1">{formatUKDate(i.date)}</strong>
                    {i.apiary_id && apiaryNameById[i.apiary_id]
                      ? ` • Apiary: ${apiaryNameById[i.apiary_id]}`
                      : ""}
                    {i.hive_id && hiveNameById[i.hive_id]
                      ? ` • Hive: ${hiveNameById[i.hive_id]}`
                      : ""}
                    {i.notes ? ` — ${i.notes.slice(0, 80)}` : ""}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 justify-between">
                    <ArchivedPill at={i.archived_at} />
                    {!i.archived_at && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          to={toInspectionsList(i.id)}
                          className="text-blue-600 hover:underline whitespace-nowrap"
                          aria-label={`Open inspection ${formatUKDate(i.date)} in list`}
                        >
                          Open →
                        </Link>
                        <Link
                          to={`/inspections/${i.id}/edit`}
                          className="text-xs text-gray-600 hover:underline whitespace-nowrap"
                          aria-label={`Edit inspection ${formatUKDate(i.date)}`}
                        >
                          ✎ Edit
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-right">
              <Link to={seeAllInspectionsHref} className="text-sm text-blue-600 hover:underline">
                See all inspections →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Recent Tasks</h2>
        {loadingTodos ? (
          <p className="text-gray-500">Loading…</p>
        ) : recentTodos.length === 0 ? (
          <p className="text-gray-500">No recent tasks.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {recentTodos.map((t) => {
                const overdue = isOverdue(t.due_date, t.status);
                return (
                  <li
                    key={t.id}
                    className={`border p-2 rounded text-sm ${t.archived_at ? "opacity-60" : ""}`}
                    title={t.archived_at ? "Archived task" : ""}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>{t.due_date ? formatUKDate(t.due_date) : "No date"}</strong>
                        <span className={statusPill(t.status)}>{t.status || "Pending"}</span>
                        {overdue && <span className="text-red-700 text-xs font-semibold">Overdue</span>}
                      </div>
                      <div className="truncate">
                        {t.title}
                        {t.hive_name ? ` • Hive: ${t.hive_name}` : ""}
                        {t.apiary_id && apiaryNameById[t.apiary_id]
                          ? ` • Apiary: ${apiaryNameById[t.apiary_id]}`
                          : ""}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 justify-between">
                      {t.archived_at && <ArchivedPill at={t.archived_at} />}
                      {!t.archived_at && (
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link
                            to={toTodosList(t.id)}
                            className="text-blue-600 hover:underline whitespace-nowrap"
                            aria-label={`Open task ${t.title} in list`}
                          >
                            Open →
                          </Link>
                          <Link
                            to={`/todos/${t.id}/edit`}
                            className="text-xs text-gray-600 hover:underline whitespace-nowrap"
                            aria-label={`Edit task ${t.title}`}
                          >
                            ✎ Edit
                          </Link>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 text-right">
              <Link to={seeAllTodosHref} className="text-sm text-blue-600 hover:underline">
                See all tasks →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Recent Log Entries */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Recent Log Entries</h2>
        {loadingLogs ? (
          <p className="text-gray-500">Loading…</p>
        ) : recentLogs.length === 0 ? (
          <p className="text-gray-500">No recent log entries.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {recentLogs.map((l) => (
                <li
                  key={l.id}
                  className={`border p-2 rounded text-sm ${l.archived_at ? "opacity-60" : ""}`}
                  title={l.archived_at ? "Archived log entry" : ""}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="mr-1">{formatUKDate(l.date)}</strong>: {l.log_type}
                    </div>
                    {l.apiary_id && apiaryNameById[l.apiary_id]
                      ? ` • Apiary: ${apiaryNameById[l.apiary_id]}`
                      : ""}
                    {l.entry ? ` — ${l.entry.slice(0, 80)}` : ""}
                    {!l.archived_at && l.inspection?.date && (
                      <>
                        {" • "}
                        <Link to={`/inspections/${l.inspection_id}/edit`} className="text-blue-600 underline">
                          Inspection ({formatUKDate(l.inspection.date)})
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 justify-between">
                    {l.archived_at && <ArchivedPill at={l.archived_at} />}
                    {!l.archived_at && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          to={toLogbookList(l.id)}
                          className="text-blue-600 hover:underline whitespace-nowrap"
                          aria-label={`Open log entry ${l.id}`}
                        >
                          Open →
                        </Link>
                        <Link
                          to={`/logbook/${l.id}/edit`}
                          className="text-xs text-gray-600 hover:underline whitespace-nowrap"
                          aria-label={`Edit log entry ${l.id}`}
                        >
                          ✎ Edit
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-right">
              <Link to={seeAllLogbookHref} className="text-sm text-blue-600 hover:underline">
                See all log entries →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Weather Snapshot + Seasonal Beekeeper Notes teaser */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-1">Weather Snapshot</h2>
        <p className="text-xs text-gray-600 mb-3">
          📍 Weather is based on your <strong>default apiary</strong>
          {defaultApiaryName ? `: ${defaultApiaryName}` : ""}.{" "}
          <Link to="/settings" className="text-blue-600 underline">
            Change default in Settings
          </Link>
          .{" "}
          <span className="text-gray-500">
            Local time ({weatherTz})
            {Number.isFinite(weather?.current?.time)
              ? ` • updated ${fmtLocalTime(weather.current.time, weatherTz)}`
              : ""}
          </span>
          {usedFallback && (
            <>
              {" "}
              <span className="text-amber-700">
                (No coordinates set for the default apiary — showing a default location: London.)
              </span>
            </>
          )}
        </p>
        {weatherError ? (
          <p className="text-gray-500">{weatherError}</p>
        ) : !weather ? (
          <p className="text-gray-500">Loading weather...</p>
        ) : (
          <>
            <div className="text-sm">
              <p>
                <strong>Now:</strong> {weather?.current?.temperature_2m ?? "N/A"}°C, (
                {Number.isFinite(weather?.current?.wind_speed_10m)
                  ? Math.round(weather.current.wind_speed_10m)
                  : "N/A"}{" "}
                km/h)
              </p>
              <p className="mt-2">
                <strong>Next 5 Days:</strong>
              </p>
              <ul className="grid grid-cols-1 gap-x-6">
                {Array.isArray(weather?.forecast?.time) && weather.forecast.time.length ? (
                  weather.forecast.time.slice(0, 5).map((day, index) => {
                    const wc = weather?.forecast?.weather_code?.[index];
                    const icon = WX_ICON[wc] || "⛅";
                    const label = WX_LABEL[wc] || "";
                    const tmin = weather?.forecast?.temperature_2m_min?.[index] ?? "N/A";
                    const tmax = weather?.forecast?.temperature_2m_max?.[index] ?? "N/A";
                    return (
                      <li key={day ?? index}>
                        {formatUKDate(day, weatherTz)}: {icon} {label && `${label} — `}
                        {tmin}°C → {tmax}°C
                      </li>
                    );
                  })
                ) : (
                  <li>No forecast.</li>
                )}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-1">Seasonal Beekeeper Notes</h3>
              <p className="text-[11px] text-gray-500 mb-2">
                Guide only – this panel gives general beekeeping information based on typical
                cool–temperate conditions and average colony behaviour. Any comments about
                inspections, feeding, Varroa control or other treatments are purely advisory and are
                not instructions. Weather, forage, pollen and alert data come from third-party
                services and may be inaccurate or change at short notice. Conditions vary by region,
                altitude and micro-climate and every colony is different, so always use your own
                judgement and follow the product label, official guidance and advice from your
                local beekeeping association, Bee Inspectors, vets and experienced mentors. Do not
                rely on this panel alone when deciding whether to inspect, feed or treat your bees.
              </p>
              {beekeeperNotes.length ? (
                <>
                  <ul className="space-y-1 text-xs text-gray-800">
                    {beekeeperNotes.slice(0, 3).map((n, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>{n.icon}</span>
                        <span>{n.text}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-gray-600">
                    This is just a short preview.{" "}
                    <Link to="/weather" className="text-blue-600 underline">
                      View full Seasonal Beekeeper Notes and detailed weather →
                    </Link>
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500">
                  No special notes today.{" "}
                  <Link to="/weather" className="text-blue-600 underline">
                    Open the Weather page for full Seasonal Beekeeper Notes →
                  </Link>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="space-x-4">
          <Link to="/apiaries/new" className="text-blue-600 underline">
            New Apiary
          </Link>
          <Link to="/hives/new" className="text-blue-600 underline">
            New Hive
          </Link>
          <Link to="/inspections/new" className="text-blue-600 underline">
            New Inspection
          </Link>
          {subscriptionLevel === "premium" && (
            <Link to="/nfc" className="text-blue-600 underline">
              Scan NFC Tag (Premium)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;