// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import { getQueenRecordsOverview } from "../services/queenRecords.js";
import { Link, useLocation } from "react-router-dom";
import DashboardIntelligencePanel from "../components/intelligence/DashboardIntelligencePanel.jsx";
import DashboardHiveTimelinePanel from "../components/intelligence/DashboardHiveTimelinePanel.jsx";
import { coordinateHiveIntelligence } from "../intelligence";

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

const DASHBOARD_SECTIONS_STORAGE_KEY = "hivetag_dashboard_sections_v1";

const DEFAULT_DASHBOARD_SECTIONS = {
  quickActions: true,
  stats: true,
  queens: true,
  healthOverview: true,
  recentTasks: true,
  recentInspections: true,
  reports: false,
  healthTimeline: false,
  nfcGuide: false,
  nfcHives: false,
  recentLogbook: false,
  weather: false,
};

const DASHBOARD_SECTION_OPTIONS = [
  { id: "quickActions", label: "Quick Actions" },
  { id: "stats", label: "Summary statistics" },
  { id: "queens", label: "Queen Status" },
  { id: "healthOverview", label: "Hive Health Overview", premium: true },
  { id: "recentTasks", label: "Recent Tasks" },
  { id: "recentInspections", label: "Recent Inspections" },
  { id: "reports", label: "Reports & Export", premium: true },
  { id: "healthTimeline", label: "Hive Health Timeline", premium: true },
  { id: "nfcGuide", label: "NFC guidance", premium: true },
  { id: "nfcHives", label: "NFC Tagged Hives", premium: true },
  { id: "recentLogbook", label: "Recent Log Entries" },
  { id: "weather", label: "Weather & Seasonal Notes" },
];

const getSavedDashboardSections = () => {
  if (typeof window === "undefined") return DEFAULT_DASHBOARD_SECTIONS;

  try {
    const saved = JSON.parse(window.localStorage.getItem(DASHBOARD_SECTIONS_STORAGE_KEY) || "{}");
    return { ...DEFAULT_DASHBOARD_SECTIONS, ...saved };
  } catch {
    return DEFAULT_DASHBOARD_SECTIONS;
  }
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
    nfc: "bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200/70 hover:from-blue-100 hover:to-emerald-100 hover:border-blue-300/80 hover:shadow-md focus-visible:ring-blue-400",
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

  // Dashboard location filters
  const [selectedApiaryId, setSelectedApiaryId] = useState("all");
  const [selectedHiveId, setSelectedHiveId] = useState("all");

  // Dashboard section customisation
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);
  const [dashboardSections, setDashboardSections] = useState(getSavedDashboardSections);

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

  // Dashboard Intelligence
  const [dashboardIntelligence, setDashboardIntelligence] = useState({
    loading: true,
    error: null,
    summary: { total: 0, healthy: 0, monitor: 0, attention: 0, critical: 0, unassessed: 0 },
    items: [],
  });

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
  const [hivesList, setHivesList] = useState([]); // [{id, name, apiary_id}]
  const [apiaryNameById, setApiaryNameById] = useState({});
  const [hiveNameById, setHiveNameById] = useState({});

  // Subscription level (for NFC visibility etc.)
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");

  // Queen Records summary (filter-aware)
  const [queenDashboard, setQueenDashboard] = useState({
    loading: true,
    error: null,
    hasQueenData: false,
    summary: {
      current: 0,
      transitions: 0,
      attention: 0,
    },
    items: [],
  });

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
    if (selectedHiveId !== "all") qs.set("hive_id", selectedHiveId);
    return `/reports/print${qs.toString() ? `?${qs.toString()}` : ""}`;
  }, [selectedApiaryId, selectedHiveId]);

  const hivesForSelectedApiary = useMemo(() => {
    if (selectedApiaryId === "all") return hivesList;
    return hivesList.filter((hive) => String(hive.apiary_id) === String(selectedApiaryId));
  }, [hivesList, selectedApiaryId]);

  useEffect(() => {
    if (selectedHiveId === "all") return;
    const hiveStillAvailable = hivesForSelectedApiary.some(
      (hive) => String(hive.id) === String(selectedHiveId)
    );
    if (!hiveStillAvailable) setSelectedHiveId("all");
  }, [hivesForSelectedApiary, selectedHiveId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DASHBOARD_SECTIONS_STORAGE_KEY, JSON.stringify(dashboardSections));
  }, [dashboardSections]);

  const setDashboardSection = (sectionId, enabled) => {
    setDashboardSections((current) => ({ ...current, [sectionId]: enabled }));
  };

  const resetDashboardSections = () => {
    setDashboardSections({ ...DEFAULT_DASHBOARD_SECTIONS });
  };

  // Show and scroll to Reports if returning from PrintReport.
  useEffect(() => {
    if (location.hash !== "#print") return;

    setDashboardSections((current) => ({ ...current, reports: true }));
    setTimeout(() => {
      printAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }, [location]);

  // Stripe upgrade return: wait for the webhook to update the profile,
  // then unlock Premium features without requiring a page refresh.
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("upgraded") !== "1") {
      return;
    }

    let cancelled = false;

    const refreshPremiumStatus = async () => {
      setStripeMessage("Thanks for upgrading to Premium. We are activating your Premium features…");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      for (let attempt = 0; attempt < 10 && !cancelled; attempt += 1) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Unable to refresh subscription after checkout:", error);
        }

        const updatedLevel = profile?.subscription_level || "free";

        if (updatedLevel === "premium") {
          setSubscriptionLevel("premium");

          localStorage.setItem("subscription_level", "premium");

          window.dispatchEvent(
            new CustomEvent("subscription:updated", {
              detail: { level: "premium" },
            })
          );

          setStripeMessage("Welcome to HiveTag Premium! Your Premium features are now active.");

          // Remove ?upgraded=1 so the message does not repeat on refresh.
          window.history.replaceState(
            {},
            document.title,
            `${window.location.pathname}${window.location.hash || ""}`
          );

          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setStripeMessage(
          "Your payment was successful. Premium activation is taking a little longer than expected; please use Refresh if the features remain locked."
        );
      }
    };

    refreshPremiumStatus();

    return () => {
      cancelled = true;
    };
  }, [location.search]);

  // ---- Lookups (names + list for filter) ----
  useEffect(() => {
    const fetchNameLookups = async () => {
      const [{ data: apiaries }, { data: hives }] = await Promise.all([
        supabase.from("apiaries").select("id, name").is("archived_at", null).order("name"),
        supabase.from("hives").select("id, name, apiary_id").is("archived_at", null).order("name"),
      ]);
      const aMap = {};
      for (const a of apiaries || []) aMap[a.id] = a.name;
      const hMap = {};
      for (const h of hives || []) hMap[h.id] = h.name;
      setApiaryNameById(aMap);
      setHiveNameById(hMap);
      setApiariesList(apiaries || []);
      setHivesList(hives || []);
    };
    fetchNameLookups();
  }, []);

  // ---- Stats (filter-aware) ----
  const fetchStats = async (apiaryId = "all", hiveId = "all") => {
    const { count: apiaries } = await supabase
      .from("apiaries")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);

    let hivesQ = supabase
      .from("hives")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);
    if (hiveId !== "all") hivesQ = hivesQ.eq("id", hiveId);
    else if (apiaryId !== "all") hivesQ = hivesQ.eq("apiary_id", apiaryId);
    const { count: hives } = await hivesQ;

    let inspQ = supabase
      .from("inspections")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);
    if (hiveId !== "all") inspQ = inspQ.eq("hive_id", hiveId);
    else if (apiaryId !== "all") inspQ = inspQ.eq("apiary_id", apiaryId);
    const { count: inspections } = await inspQ;

    let todosQ = supabase.from("todos").select("*", { count: "exact", head: true });
    if (hiveId !== "all") todosQ = todosQ.eq("hive_id", hiveId);
    else if (apiaryId !== "all") todosQ = todosQ.eq("apiary_id", apiaryId);
    const { count: todos } = await todosQ;

    let logsQ = supabase
      .from("logbook")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);
    if (hiveId !== "all") logsQ = logsQ.eq("hive_id", hiveId);
    else if (apiaryId !== "all") logsQ = logsQ.eq("apiary_id", apiaryId);
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
  const fetchNfcSummary = async (apiaryId = "all", hiveId = "all") => {
    try {
      let totalQ = supabase
        .from("hives")
        .select("*", { count: "exact", head: true })
        .is("archived_at", null);
      if (hiveId !== "all") totalQ = totalQ.eq("id", hiveId);
      else if (apiaryId !== "all") totalQ = totalQ.eq("apiary_id", apiaryId);
      const { count: total } = await totalQ;

      let taggedQ = supabase
        .from("hives")
        .select("*", { count: "exact", head: true })
        .is("archived_at", null)
        .not("nfc_uid", "is", null);
      if (hiveId !== "all") taggedQ = taggedQ.eq("id", hiveId);
      else if (apiaryId !== "all") taggedQ = taggedQ.eq("apiary_id", apiaryId);
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
  const fetchRecentNfcHives = async (apiaryId = "all", hiveId = "all") => {
    try {
      let q = supabase
        .from("hives")
        .select("id, name, apiary_id, nfc_uid, archived_at")
        .is("archived_at", null)
        .not("nfc_uid", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);

      if (hiveId !== "all") q = q.eq("id", hiveId);
      else if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);

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

  // ---- Queen Records summary (filter-aware) ----
  const fetchQueenDashboard = async (apiaryId = "all", hiveId = "all") => {
    setQueenDashboard((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }));

    try {
      const data = await getQueenRecordsOverview();
      const filteredHives = (data?.hives || []).filter((hive) => {
        if (hiveId !== "all") return String(hive.id) === String(hiveId);
        return apiaryId === "all" || String(hive.apiaryId) === String(apiaryId);
      });

      // Do not treat a hive with no Queen history at all as requiring attention.
      const trackedHives = filteredHives.filter(
        (hive) =>
          hive.currentQueen ||
          hive.transition ||
          (hive.previousQueens || []).length > 0 ||
          (hive.events || []).length > 0
      );

      const attentionHives = trackedHives.filter((hive) => hive.attention);

      const sortedHives = [...trackedHives].sort((left, right) => {
        if (left.attention !== right.attention) return left.attention ? -1 : 1;
        if (Boolean(left.transition) !== Boolean(right.transition)) {
          return left.transition ? -1 : 1;
        }
        return String(left.name || "").localeCompare(String(right.name || ""));
      });

      const items = sortedHives.slice(0, 6).map((hive) => {
        const queen = hive.currentQueen;
        const transition = hive.transition;

        let detail = "Queen history recorded";
        if (queen) {
          const marking =
            queen.actualColour && queen.actualColour !== "Not recorded"
              ? `${String(queen.actualColour).toLowerCase()}-marked`
              : "marking not recorded";
          detail = `${queen.reference} • ${queen.year} ${marking}`;
        } else if (transition) {
          detail = transition.method || "Queen transition in progress";
        }

        return {
          id: hive.id,
          name: hive.name,
          apiaryName: hive.apiaryName,
          status: hive.status,
          detail,
          attention: Boolean(hive.attention),
          nextAction: transition ? hive.nextAction : null,
        };
      });

      setQueenDashboard({
        loading: false,
        error: null,
        hasQueenData: Boolean(data?.hasQueenData),
        summary: {
          current: trackedHives.filter((hive) => hive.currentQueen).length,
          transitions: trackedHives.filter((hive) => hive.transition).length,
          attention: attentionHives.length,
        },
        items,
      });
    } catch (error) {
      console.error("Failed to load Queen status summary:", error);
      setQueenDashboard((previous) => ({
        ...previous,
        loading: false,
        error: "Queen status could not be loaded.",
      }));
    }
  };

  // ---- Dashboard Intelligence (filter-aware) ----
  const fetchDashboardIntelligence = async (apiaryId = "all", hiveId = "all") => {
    setDashboardIntelligence((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }));

    try {
      let hivesQuery = supabase
        .from("hives")
        .select("id, name, apiary_id, archived_at")
        .is("archived_at", null)
        .order("name", { ascending: true });

      if (hiveId !== "all") hivesQuery = hivesQuery.eq("id", hiveId);
      else if (apiaryId !== "all") hivesQuery = hivesQuery.eq("apiary_id", apiaryId);

      const { data: hives, error: hivesError } = await hivesQuery;
      if (hivesError) throw hivesError;

      let inspectionsQuery = supabase
        .from("inspections")
        .select(
          "id, date, apiary_id, hive_id, queen_status, queen_cells, brood_pattern, food_stores, hive_population, disease_types, signs_disease, archived_at"
        )
        .is("archived_at", null)
        .order("date", { ascending: true })
        .limit(500);

      if (hiveId !== "all") inspectionsQuery = inspectionsQuery.eq("hive_id", hiveId);
      else if (apiaryId !== "all") inspectionsQuery = inspectionsQuery.eq("apiary_id", apiaryId);

      const { data: inspections, error: inspectionsError } = await inspectionsQuery;
      if (inspectionsError) throw inspectionsError;

      const inspectionsByHive = new Map();
      for (const inspection of inspections || []) {
        if (!inspection.hive_id) continue;
        const list = inspectionsByHive.get(inspection.hive_id) || [];
        list.push(inspection);
        inspectionsByHive.set(inspection.hive_id, list);
      }

      const riskRank = {
        Critical: 5,
        High: 4,
        Important: 3,
        Medium: 3,
        Monitor: 2,
        Low: 1,
        "Very Low": 0,
        None: 0,
        Unknown: 0,
        Unassessed: -1,
      };

      const items = (hives || []).map((hive) => {
        const history = inspectionsByHive.get(hive.id) || [];
        const intelligence = coordinateHiveIntelligence({ history });
        const assessed =
          intelligence?.hasAssessment === true &&
          typeof intelligence?.overall?.healthScore === "number";
        const healthScore = assessed ? intelligence.overall.healthScore : null;
        const riskLevel = assessed
          ? intelligence?.overall?.riskLevel || "Unknown"
          : "Unassessed";

        return {
          hive,
          historyCount: history.length,
          latestInspection: history[history.length - 1] || null,
          intelligence,
          assessed,
          healthScore,
          riskLevel,
          riskRank: riskRank[riskLevel] ?? 0,
          priorityCount: assessed ? intelligence?.priorityItems?.length || 0 : 0,
        };
      });

      const sortedItems = [...items].sort((a, b) => {
        if (b.riskRank !== a.riskRank) return b.riskRank - a.riskRank;

        if (a.assessed && b.assessed && a.healthScore !== b.healthScore) {
          return a.healthScore - b.healthScore;
        }

        if (a.assessed !== b.assessed) return a.assessed ? -1 : 1;
        return b.priorityCount - a.priorityCount;
      });

      const assessedItems = items.filter((item) => item.assessed);

      const summary = {
        total: items.length,
        healthy: assessedItems.filter(
          (item) => item.healthScore >= 85 && item.riskRank <= 1
        ).length,
        monitor: assessedItems.filter(
          (item) => item.riskRank === 2 || (item.healthScore >= 55 && item.healthScore < 85)
        ).length,
        attention: assessedItems.filter(
          (item) => item.riskRank >= 3 || item.healthScore < 55
        ).length,
        critical: assessedItems.filter((item) => item.riskRank >= 4).length,
        unassessed: items.filter((item) => !item.assessed).length,
      };

      setDashboardIntelligence({
        loading: false,
        error: null,
        summary,
        items: sortedItems.slice(0, 8),
      });
    } catch (error) {
      console.error("Failed to load dashboard intelligence:", error);
      setDashboardIntelligence((previous) => ({
        ...previous,
        loading: false,
        error: "Dashboard intelligence could not be loaded.",
      }));
    }
  };

  // ---- Recent lists (filter-aware) ----
  const fetchRecentInspections = async (apiaryId = "all", hiveId = "all") => {
    setLoadingInspections(true);
    let q = supabase
      .from("inspections")
      .select("id, date, notes, apiary_id, hive_id, archived_at")
      .order("date", { ascending: false })
      .limit(6);
    if (hiveId !== "all") q = q.eq("hive_id", hiveId);
    else if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);
    const { data } = await q;
    setRecentInspections(data || []);
    setLoadingInspections(false);
  };

  const fetchRecentTodos = async (apiaryId = "all", hiveId = "all") => {
    setLoadingTodos(true);
    let q = supabase
      .from("todos")
      .select("id, title, due_date, status, hive_name, apiary_id, archived_at")
      .order("due_date", { ascending: false })
      .limit(6);
    if (hiveId !== "all") q = q.eq("hive_id", hiveId);
    else if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);
    const { data } = await q;
    setRecentTodos(data || []);
    setLoadingTodos(false);
  };

  const fetchRecentLogs = async (apiaryId = "all", hiveId = "all") => {
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
    if (hiveId !== "all") q = q.eq("hive_id", hiveId);
    else if (apiaryId !== "all") q = q.eq("apiary_id", apiaryId);
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
        !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180;

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
    fetchStats(selectedApiaryId, selectedHiveId);
    fetchRecentInspections(selectedApiaryId, selectedHiveId);
    fetchRecentTodos(selectedApiaryId, selectedHiveId);
    fetchRecentLogs(selectedApiaryId, selectedHiveId);
    fetchQueenDashboard(selectedApiaryId, selectedHiveId);

    if (subscriptionLevel === "premium") {
      fetchNfcSummary(selectedApiaryId, selectedHiveId);
      fetchRecentNfcHives(selectedApiaryId, selectedHiveId);
      fetchDashboardIntelligence(selectedApiaryId, selectedHiveId);
    }
  }, [selectedApiaryId, selectedHiveId, subscriptionLevel]);

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
          const level = profile.subscription_level;

          setSubscriptionLevel(level);
          localStorage.setItem("subscription_level", level);

          window.dispatchEvent(
            new CustomEvent("subscription:updated", {
              detail: { level },
            })
          );
        }
      } catch (err) {
        console.error("Failed to load subscription level:", err);
      }
    };

    fetchSubscriptionLevel();
  }, []);

  // Helpers for building links with the active apiary and hive filters.
  const buildFilteredHref = (path, extraParams = {}) => {
    const params = new URLSearchParams();
    if (selectedApiaryId !== "all") params.set("apiary_id", selectedApiaryId);
    if (selectedHiveId !== "all") params.set("hive_id", selectedHiveId);

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    return `${path}${query ? `?${query}` : ""}`;
  };

  const toInspectionsList = (id) =>
    buildFilteredHref("/inspections", { highlight: id, type: "INSPECTION" });
  const toTodosList = (id) => buildFilteredHref("/todos", { highlight: id, type: "TODO" });
  const toLogbookList = (id) => buildFilteredHref("/logbook", { highlight: id, type: "LOGBOOK" });
  const toHiveInList = (id) => buildFilteredHref("/hives", { highlight: id, type: "HIVE" });

  const seeAllInspectionsHref = buildFilteredHref("/inspections");
  const seeAllTodosHref = buildFilteredHref("/todos");
  const seeAllLogbookHref = buildFilteredHref("/logbook");
  const hivesHref = buildFilteredHref("/hives");

  // Dashboard stat tile links carry the current location filter where relevant.
  const apiariesHref = "/apiaries";
  const inspectionsHref = buildFilteredHref("/inspections");
  const todosHref = buildFilteredHref("/todos");
  const logbookHref = buildFilteredHref("/logbook");

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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>

          <Link
            to="/help/getting-started"
            className="text-xs text-gray-500 hover:text-blue-600 hover:underline"
          >
            New here? Read Getting Started →
          </Link>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[220px_220px_auto] xl:items-end">
          <div>
            <label htmlFor="apiaryFilter" className="block text-sm font-medium text-gray-700">
              Apiary
            </label>
            <select
              id="apiaryFilter"
              className="mt-1 w-full rounded border px-3 py-2"
              value={selectedApiaryId}
              onChange={(event) => {
                setSelectedApiaryId(event.target.value);
                setSelectedHiveId("all");
              }}
            >
              <option value="all">All Apiaries</option>
              {apiariesList.map((apiary) => (
                <option key={apiary.id} value={apiary.id}>
                  {apiary.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hiveFilter" className="block text-sm font-medium text-gray-700">
              Hive
            </label>
            <select
              id="hiveFilter"
              className="mt-1 w-full rounded border px-3 py-2"
              value={selectedHiveId}
              onChange={(event) => setSelectedHiveId(event.target.value)}
              disabled={hivesForSelectedApiary.length === 0}
            >
              <option value="all">All Hives</option>
              {hivesForSelectedApiary.map((hive) => (
                <option key={hive.id} value={hive.id}>
                  {hive.name}
                  {selectedApiaryId === "all" && apiaryNameById[hive.apiary_id]
                    ? ` — ${apiaryNameById[hive.apiary_id]}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowDashboardSettings((current) => !current)}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 sm:col-span-2 xl:col-span-1"
            aria-expanded={showDashboardSettings}
          >
            ⚙ Customise Dashboard
          </button>
        </div>
      </div>

      {showDashboardSettings && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Choose what appears on your Dashboard</h3>
              <p className="mt-1 text-sm text-gray-600">
                Your choices are saved on this device and remain after refreshing or signing in
                again.
              </p>
            </div>
            <button
              type="button"
              onClick={resetDashboardSections}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Restore recommended layout
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DASHBOARD_SECTION_OPTIONS.map((section) => (
              <label
                key={section.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={Boolean(dashboardSections[section.id])}
                  onChange={(event) => setDashboardSection(section.id, event.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-800">
                  {section.label}
                  {section.premium ? (
                    <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      {section.id === "reports" &&
                      subscriptionLevel !== "premium" &&
                      queenDashboard.hasQueenData
                        ? "Read only"
                        : "Premium"}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

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
      {dashboardSections.nfcGuide && subscriptionLevel === "premium" && (
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
      {dashboardSections.reports && (
        <div
          ref={printAnchorRef}
          id="print"
          className="no-print bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h2 className="text-lg font-semibold">Reports &amp; Export</h2>

            <p className="text-gray-600 mt-1">
              {subscriptionLevel === "premium"
                ? "Open Reports or export Inspections, Tasks, Logbook and Queen Records by Apiary, Hive and date range."
                : queenDashboard.hasQueenData
                  ? "Review and export your retained Queen Records in read-only mode."
                  : "Create printable reports and filtered exports with HiveTag Premium."}
            </p>
          </div>

          <div className="flex gap-3">
            {subscriptionLevel === "premium" || queenDashboard.hasQueenData ? (
              <Link
                to={reportHref}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {subscriptionLevel === "premium" ? "Open Reports & Export" : "Open Queen Reports"}
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 rounded"
              >
                🔒 Reports &amp; Export
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats buttons (centered + nicer theme) */}
      {dashboardSections.stats && (
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
            subtitle={
              selectedApiaryId !== "all" || selectedHiveId !== "all" ? "(this filter)" : null
            }
            cta="Open →"
            variant="default"
          />

          <StatTile
            to={inspectionsHref}
            title="Inspections"
            value={stats.inspections}
            subtitle={
              selectedApiaryId !== "all" || selectedHiveId !== "all" ? "(this filter)" : null
            }
            cta="Open →"
            variant="default"
          />

          <StatTile
            to={todosHref}
            title="Tasks"
            value={stats.todos}
            subtitle={
              selectedApiaryId !== "all" || selectedHiveId !== "all" ? "(this filter)" : null
            }
            cta="Open →"
            variant="default"
          />

          <StatTile
            to={logbookHref}
            title="Logbook"
            value={stats.logbook}
            subtitle={
              selectedApiaryId !== "all" || selectedHiveId !== "all" ? "(this filter)" : null
            }
            cta="Open →"
            variant="default"
          />

          {subscriptionLevel === "premium" && (
            <StatTile
              to={nfcManagerHref}
              title="NFC Tagged Hives"
              value={nfcSummary.tagged}
              subtitle={`of ${nfcSummary.total} hives${selectedApiaryId !== "all" || selectedHiveId !== "all" ? " (this filter)" : ""}`}
              cta="Manage →"
              variant="nfc"
            />
          )}
        </div>
      )}

      {dashboardSections.queens &&
        (subscriptionLevel === "premium" || queenDashboard.hasQueenData) && (
          <div className="bg-white rounded shadow p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-lg"
                    aria-hidden="true"
                  >
                    👑
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">Queen status</h2>
                    <p className="text-xs text-gray-600">
                      Current Queen position for the selected apiary and hive filters.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/queens"
                className="text-sm font-semibold text-blue-600 hover:underline whitespace-nowrap"
              >
                Open Queen Records →
              </Link>
            </div>

            {queenDashboard.loading ? (
              <p className="mt-4 text-sm text-gray-500">Loading Queen status…</p>
            ) : queenDashboard.error ? (
              <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {queenDashboard.error}
              </p>
            ) : !queenDashboard.hasQueenData ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-950">No Queen Records added yet</p>
                <p className="mt-1 text-sm text-amber-900">
                  Open Queen Records to add the first known Queen or start a Queen transition.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                    <div className="text-2xl font-extrabold text-green-900">
                      {queenDashboard.summary.current}
                    </div>
                    <div className="text-xs font-semibold text-green-800">Current queens</div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                    <div className="text-2xl font-extrabold text-amber-950">
                      {queenDashboard.summary.transitions}
                    </div>
                    <div className="text-xs font-semibold text-amber-900">Queen transitions</div>
                  </div>
                  <div
                    className={`rounded-lg border p-3 text-center ${
                      queenDashboard.summary.attention > 0
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div
                      className={`text-2xl font-extrabold ${
                        queenDashboard.summary.attention > 0 ? "text-red-900" : "text-gray-800"
                      }`}
                    >
                      {queenDashboard.summary.attention}
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        queenDashboard.summary.attention > 0 ? "text-red-800" : "text-gray-700"
                      }`}
                    >
                      Need attention
                    </div>
                  </div>
                </div>

                {queenDashboard.items.length > 0 ? (
                  <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {queenDashboard.items.map((item) => (
                      <li
                        key={item.id}
                        className={`rounded-lg border p-3 ${
                          item.attention
                            ? "border-amber-300 bg-amber-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1a3329] truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate">{item.apiaryName}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${
                              item.attention
                                ? "border-amber-300 bg-white text-amber-900"
                                : "border-green-200 bg-green-50 text-green-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{item.detail}</p>
                        {item.nextAction ? (
                          <p className="mt-2 text-xs text-gray-600">
                            <strong>Next:</strong> {item.nextAction.title}
                            {item.nextAction.due && item.nextAction.due !== "Not scheduled"
                              ? ` • ${item.nextAction.due}`
                              : ""}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    No Queen Records are included by the selected filters.
                  </p>
                )}
              </>
            )}
          </div>
        )}

      {dashboardSections.healthOverview && subscriptionLevel === "premium" && (
        <DashboardIntelligencePanel data={dashboardIntelligence} apiaryNameById={apiaryNameById} />
      )}

      {dashboardSections.healthTimeline && subscriptionLevel === "premium" && (
        <DashboardHiveTimelinePanel data={dashboardIntelligence} apiaryNameById={apiaryNameById} />
      )}

      {/* NFC Tagged Hives list (Premium only) */}
      {dashboardSections.nfcHives && subscriptionLevel === "premium" && (
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
      {dashboardSections.recentInspections && (
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
      )}

      {/* Recent Tasks */}
      {dashboardSections.recentTasks && (
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
                          {overdue && (
                            <span className="text-red-700 text-xs font-semibold">Overdue</span>
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
                <Link to={seeAllTodosHref} className="text-sm text-blue-600 hover:underline">
                  See all tasks →
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent Log Entries */}
      {dashboardSections.recentLogbook && (
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
                <Link to={seeAllLogbookHref} className="text-sm text-blue-600 hover:underline">
                  See all log entries →
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Weather Snapshot + Seasonal Beekeeper Notes teaser */}
      {dashboardSections.weather && (
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
                  inspections, feeding, Varroa control or other treatments are purely advisory and
                  are not instructions. Weather, forage, pollen and alert data come from third-party
                  services and may be inaccurate or change at short notice. Conditions vary by
                  region, altitude and micro-climate and every colony is different, so always use
                  your own judgement and follow the product label, official guidance and advice from
                  your local beekeeping association, Bee Inspectors, vets and experienced mentors.
                  Do not rely on this panel alone when deciding whether to inspect, feed or treat
                  your bees.
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
      )}

      {/* Quick Actions */}
      {dashboardSections.quickActions && (
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
      )}
    </div>
  );
};

export default Dashboard;
