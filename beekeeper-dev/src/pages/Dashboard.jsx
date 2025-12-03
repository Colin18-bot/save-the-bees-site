// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import { Link, useLocation } from "react-router-dom";

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

  // Name lookups / apiary list for filter
  const [apiariesList, setApiariesList] = useState([]); // [{id, name}]
  const [apiaryNameById, setApiaryNameById] = useState({});
  const [hiveNameById, setHiveNameById] = useState({});

  // Subscription level (for NFC visibility etc.)
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");

  const formatUKDate = (d) => {
    if (!d) return "No date";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
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
        supabase
          .from("apiaries")
          .select("id, name")
          .is("archived_at", null)
          .order("name"),
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

    let todosQ = supabase
      .from("todos")
      .select("*", { count: "exact", head: true });
    if (apiaryId !== "all") todosQ = todosQ.eq("apiary_id", apiaryId);
    const { count: todos } = await todosQ;

    let logsQ = supabase
      .from("logbook")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);
    if (apiaryId !== "all") logsQ = logsQ.eq("apiary_id", apiaryId);
    const { count: logbook } = await logsQ;

    setStats({ apiaries, hives, inspections, todos, logbook });
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
      .select(`
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
      `)
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
      const bad =
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180;

      if (bad) {
        // London fallback
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
      if (!current) throw new Error("No current weather in response");

      const windMph = Number.isFinite(current.wind_speed_10m)
        ? Math.round(current.wind_speed_10m * 0.621371)
        : null;

      setWeather({
        current: {
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
      selectedApiaryId !== "all"
        ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}`
        : ""
    }`;
  const toTodosList = (id) =>
    `/todos?highlight=${encodeURIComponent(id)}&type=TODO${
      selectedApiaryId !== "all"
        ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}`
        : ""
    }`;
  const toLogbookList = (id) =>
    `/logbook?highlight=${encodeURIComponent(id)}&type=LOGBOOK${
      selectedApiaryId !== "all"
        ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}`
        : ""
    }`;

  // NEW: helper to jump into HiveList with highlight on a specific hive
  const toHiveInList = (id) =>
    `/hives?highlight=${encodeURIComponent(id)}&type=HIVE${
      selectedApiaryId !== "all"
        ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}`
        : ""
    }`;

  const seeAllInspectionsHref = `/inspections${
    selectedApiaryId !== "all"
      ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}`
      : ""
  }`;
  const seeAllTodosHref = `/todos${
    selectedApiaryId !== "all"
      ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}`
      : ""
  }`;
  const seeAllLogbookHref = `/logbook${
    selectedApiaryId !== "all"
      ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}`
      : ""
  }`;

  // Hives link for NFC "See all tagged hives"
  const hivesHref = `/hives${
    selectedApiaryId !== "all"
      ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}`
      : ""
  }`;

  // --- Beekeeper Notes (Dashboard version, default apiary or London) ---
  const safeArr = (a) => (Array.isArray(a) ? a : []);
  const beekeeperNotes = useMemo(() => {
    if (!weather || !weather.forecast) return [];

    const daily = weather.forecast;
    const tempsMin = safeArr(daily.temperature_2m_min).filter(Number.isFinite);
    const tempsMax = safeArr(daily.temperature_2m_max).filter(Number.isFinite);
    const windsMax = safeArr(daily.wind_speed_10m_max).filter(Number.isFinite);
    const precs = safeArr(daily.precipitation_sum).filter(Number.isFinite);

    const out = [];

    // Fixed units on dashboard: °C + km/h
    const unit = "C";
    const windUnit = "kmh";
    const toF = (c) => Math.round((c * 9) / 5 + 32);
    const tempLabel = (c) =>
      unit === "C" ? `${c}°C` : `${toF(c)}°F`;
    const windLabel = windUnit === "kmh" ? "km/h" : "mph";

    // Month / season profile
    const nowDate = new Date();
    const month = nowDate.getMonth(); // 0 = Jan

    if (month === 11 || month === 0 || month === 1) {
      // Dec–Feb
      if (month === 0) {
        out.push({
          icon: "📆",
          text:
            "January – deep winter. Avoid full inspections unless there is a clear emergency such as suspected starvation or damage.",
        });
      } else if (month === 1) {
        out.push({
          icon: "📆",
          text:
            "February – colonies are building up brood but weather is still unreliable. Keep the hive closed except for quick emergency checks.",
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
          "Winter feeding – use fondant above the crown board hole. Judge food by hefting the hive rather than pulling frames.",
      });
      out.push({
        icon: "❄️",
        text: `Foraging is very limited below about ${tempLabel(
          10
        )}. Expect little or no flight; bees will rely heavily on stored food.`,
      });
      out.push({
        icon: "🛠️",
        text:
          "After storms, frost or snow, check entrances are clear, roofs are secure, and stands are stable.",
      });
    } else if (month >= 2 && month <= 4) {
      // Mar–May
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
            "April – main build-up. Inspections become more regular when it is mild and calm; avoid chilling brood.",
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
        text: `Full inspections are comfortable once day-time highs are around ${tempLabel(
          15
        )} and conditions are calm. Between ${tempLabel(
          10
        )}–${tempLabel(14)} keep checks brief and focused.`,
      });
      out.push({
        icon: "⚠️",
        text:
          "Monitor colony weight and brood pattern; use emergency fondant or warm syrup on mild days if colonies feel worryingly light.",
      });
    } else if (month >= 5 && month <= 7) {
      // Jun–Aug
      if (month === 5) {
        out.push({
          icon: "📆",
          text:
            "June – peak season. Expect strong colonies and active swarm control in suitable weather.",
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
          "Late summer is a key window for Varroa treatment. Always follow product temperature and timing guidance.",
      });
    } else if (month >= 8 && month <= 10) {
      // Sep–Nov
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
          "Moisture kills more bees than cold. Keep roofs sound, hives off the ground, and ensure modest ventilation without big draughts.",
      });
    }

    // Live, simple weather-based guidance
    const strongWindThresholdKmh = 40;
    const maxWind = windsMax.length ? Math.max(...windsMax) : 0;
    const heavyRain = precs.some((mm) => mm >= 10);
    const minTemp = tempsMin.length ? Math.min(...tempsMin) : 99;
    const maxTemp = tempsMax.length ? Math.max(...tempsMax) : 0;

    if (maxWind >= strongWindThresholdKmh) {
      const displayThreshold =
        windUnit === "kmh"
          ? `≥${strongWindThresholdKmh} ${windLabel}`
          : `≥${Math.round(strongWindThresholdKmh * 0.621371)} ${windLabel}`;
      out.push({
        icon: "💨",
        text: `Strong winds expected (${displayThreshold}). Avoid opening hives; secure roofs and add straps or weights if needed.`,
      });
    }

    if (heavyRain) {
      out.push({
        icon: "🌧️",
        text:
          "Heavy rain in the forecast. Foraging will be poor; plan manipulations for drier, calmer windows.",
      });
    }

    if (minTemp <= 5 || maxTemp < 10) {
      out.push({
        icon: "🥶",
        text: `Forecast highs below about ${tempLabel(
          10
        )}. Expect little or no foraging – colonies will mainly rely on stored food.`,
      });
    } else if (maxTemp >= 10 && maxTemp < 15) {
      out.push({
        icon: "🍃",
        text: `Daytime highs between roughly ${tempLabel(
          10
        )} and ${tempLabel(
          15
        )}. Short checks are possible in bright, calm spells but avoid long brood exposure.`,
      });
    }

    if (maxTemp < 10) {
      out.push({
        icon: "🚫🐝",
        text: `Daytime highs below ${tempLabel(
          10
        )}. Full inspections risk chilling brood and stressing the colony – avoid unless absolutely essential.`,
      });
    } else if (maxTemp >= 10 && maxTemp < 15) {
      out.push({
        icon: "⚠️",
        text: `Daytime highs around ${tempLabel(
          10
        )}–${tempLabel(
          15
        )}. Only open colonies when necessary and keep the brood nest exposed for the shortest possible time.`,
      });
    } else if (maxTemp >= 15 && maxWind < strongWindThresholdKmh) {
      out.push({
        icon: "✅",
        text: `At least one mild, calmer day near ${tempLabel(
          15
        )} or above is forecast. Conditions are generally suitable for normal inspections if needed.`,
      });
    }

    const hotThresholdC = 28;
    if (maxTemp >= hotThresholdC) {
      out.push({
        icon: "🥵",
        text: `Hot spell likely (around ${tempLabel(
          hotThresholdC
        )} or above). Ensure plenty of water and ventilation and avoid long inspections in the middle of the day.`,
      });
    }

    return out;
  }, [weather]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Filter by Apiary */}
        <div className="w-full md:w-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label
            htmlFor="apiaryFilter"
            className="font-medium text-sm whitespace-nowrap"
          >
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
              – print or download your NFC setup guide, then tap{" "}
              <strong>Scan NFC Tag</strong> to start using your tags.
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
            Open Reports or Export Inspections, Tasks, and Logbook by
            Apiary/Hive and date range.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={reportHref}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Open Reports &amp; Export
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">Apiaries</p>
          {selectedApiaryId === "all" ? (
            <>
              <p className="text-2xl font-bold">{stats.apiaries}</p>
              <p className="text-xs text-gray-400 mt-1">(all apiaries)</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold">1 / {stats.apiaries}</p>
              <p className="text-xs text-gray-400 mt-1">
                (this apiary / total)
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">Hives</p>
          <p className="text-2xl font-bold">{stats.hives}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">Inspections</p>
          <p className="text-2xl font-bold">{stats.inspections}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">Tasks</p>
          <p className="text-2xl font-bold">{stats.todos}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">Logbook</p>
          <p className="text-2xl font-bold">{stats.logbook}</p>
        </div>

        {/* NFC Tagged Hives count (Premium only) */}
        {subscriptionLevel === "premium" && (
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-500">NFC Tagged Hives</p>
            <p className="text-2xl font-bold">{nfcSummary.tagged}</p>
            <p className="text-xs text-gray-400 mt-1">
              of {nfcSummary.total} hives
              {selectedApiaryId !== "all" ? " (this filter)" : ""}
            </p>
          </div>
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
                        {hive.name ||
                          hiveNameById[hive.id] ||
                          "Unnamed hive"}
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
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-right">
                <Link
                  to={hivesHref}
                  className="text-sm text-blue-600 hover:underline"
                >
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
                  className={`border p-2 rounded text-sm ${
                    i.archived_at ? "opacity-60" : ""
                  }`}
                  title={i.archived_at ? "Archived inspection" : ""}
                >
                  <div className="min-w-0">
                    <strong className="mr-1">
                      {formatUKDate(i.date)}
                    </strong>
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
                          aria-label={`Open inspection ${formatUKDate(
                            i.date
                          )} in list`}
                        >
                          Open →
                        </Link>
                        <Link
                          to={`/inspections/${i.id}/edit`}
                          className="text-xs text-gray-600 hover:underline whitespace-nowrap"
                          aria-label={`Edit inspection ${formatUKDate(
                            i.date
                          )}`}
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
              <Link
                to={seeAllInspectionsHref}
                className="text-sm text-blue-600 hover:underline"
              >
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
                    className={`border p-2 rounded text-sm ${
                      t.archived_at ? "opacity-60" : ""
                    }`}
                    title={t.archived_at ? "Archived task" : ""}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>
                          {t.due_date
                            ? formatUKDate(t.due_date)
                            : "No date"}
                        </strong>
                        <span className={statusPill(t.status)}>
                          {t.status || "Pending"}
                        </span>
                        {overdue && (
                          <span className="text-red-700 text-xs font-semibold">
                            Overdue
                          </span>
                        )}
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
              <Link
                to={seeAllTodosHref}
                className="text-sm text-blue-600 hover:underline"
              >
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
                  className={`border p-2 rounded text-sm ${
                    l.archived_at ? "opacity-60" : ""
                  }`}
                  title={l.archived_at ? "Archived log entry" : ""}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="mr-1">
                        {formatUKDate(l.date)}
                      </strong>
                      : {l.log_type}
                    </div>
                    {l.apiary_id && apiaryNameById[l.apiary_id]
                      ? ` • Apiary: ${apiaryNameById[l.apiary_id]}`
                      : ""}
                    {l.entry ? ` — ${l.entry.slice(0, 80)}` : ""}
                    {!l.archived_at && l.inspection?.date && (
                      <>
                        {" • "}
                        <Link
                          to={`/inspections/${l.inspection_id}/edit`}
                          className="text-blue-600 underline"
                        >
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
              <Link
                to={seeAllLogbookHref}
                className="text-sm text-blue-600 hover:underline"
              >
                See all log entries →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Weather Snapshot + Beekeeper Notes */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-1">Weather Snapshot</h2>
        <p className="text-xs text-gray-600 mb-3">
          📍 Weather is based on your <strong>default apiary</strong>
          {defaultApiaryName ? `: ${defaultApiaryName}` : ""}.{" "}
          <Link to="/settings" className="text-blue-600 underline">
            Change default in Settings
          </Link>
          .
          {usedFallback && (
            <>
              {" "}
              <span className="text-amber-700">
                (No coordinates set for the default apiary — showing a default
                location: London.)
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
                <strong>Now:</strong>{" "}
                {weather?.current?.temperature_2m ?? "N/A"}°C, Wind{" "}
                {weather?.current?.wind_speed_mph ?? "N/A"} mph
              </p>
              <p className="mt-2">
                <strong>Next 5 Days:</strong>
              </p>
              <ul className="grid grid-cols-1 gap-x-6">
                {Array.isArray(weather?.forecast?.time) &&
                weather.forecast.time.length ? (
                  weather.forecast.time.slice(0, 5).map((day, index) => {
                    const wc = weather?.forecast?.weather_code?.[index];
                    const icon = WX_ICON[wc] || "⛅";
                    const label = WX_LABEL[wc] || "";
                    const tmin =
                      weather?.forecast?.temperature_2m_min?.[index] ?? "N/A";
                    const tmax =
                      weather?.forecast?.temperature_2m_max?.[index] ?? "N/A";
                    return (
                      <li key={day ?? index}>
                        {formatUKDate(day)}: {icon}{" "}
                        {label && `${label} — `}
                        {tmin}°C → {tmax}°C
                      </li>
                    );
                  })
                ) : (
                  <li>No forecast.</li>
                )}
              </ul>
            </div>

            {/* Dashboard Beekeeper Notes (default apiary / London) */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-1">Beekeeper Notes</h3>
              <p className="text-[11px] text-gray-500 mb-2">
                Guide only – this is general beekeeping advice linked to the
                forecast for your default apiary (or a default London location
                if no coordinates are set). Weather, forage and nectar flows
                vary by region, altitude and micro-climate, and every colony
                behaves differently. Always use your own judgement, local
                experience and any guidance from your beekeeping association or
                mentor. Never rely on this panel alone for critical decisions
                about inspections, feeding or treatments.
              </p>
              {beekeeperNotes.length ? (
                <ul className="space-y-1 text-xs text-gray-800">
                  {beekeeperNotes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span>{n.icon}</span>
                      <span>{n.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">
                  No special notes today.
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
