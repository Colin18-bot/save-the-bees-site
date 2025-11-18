// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import { Link, useLocation } from "react-router-dom";

// Weather label/icon maps (for 5-day forecast)
const WX_LABEL = {
  0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
  56: "Freezing drizzle", 57: "Freezing drizzle",
  61: "Rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Freezing rain",
  71: "Snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Showers", 81: "Showers", 82: "Heavy showers",
  85: "Snow showers", 86: "Snow showers",
  95: "Thunderstorm", 96: "Thundery rain", 99: "Thundery rain",
};
const WX_ICON = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌦️",
  56: "🌧️❄️", 57: "🌧️❄️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  66: "🌧️❄️", 67: "🌧️❄️",
  71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️",
  80: "🌦️", 81: "🌦️", 82: "🌧️",
  85: "🌨️", 86: "🌨️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
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

  // Stats
  const [stats, setStats] = useState({
    apiaries: 0,
    hives: 0,
    inspections: 0,
    todos: 0,
    logbook: 0,
  });

  // Recent lists
  const [recentInspections, setRecentInspections] = useState([]);
  const [recentTodos, setRecentTodos] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

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
        printAnchorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [location]);

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

  // ---- Stats (filter-aware for hives/inspections/todos/logbook; apiaries stays global) ----
  const fetchStats = async (apiaryId = "all") => {
    const { count: apiaries } = await supabase
      .from("apiaries")
      .select("*", { count: "exact", head: true })
      .is("archived_at", null);

    let hivesQ = supabase.from("hives").select("*", { count: "exact", head: true }).is("archived_at", null);
    if (apiaryId !== "all") hivesQ = hivesQ.eq("apiary_id", apiaryId);
    const { count: hives } = await hivesQ;

    let inspQ = supabase.from("inspections").select("*", { count: "exact", head: true }).is("archived_at", null);
    if (apiaryId !== "all") inspQ = inspQ.eq("apiary_id", apiaryId);
    const { count: inspections } = await inspQ;

    let todosQ = supabase.from("todos").select("*", { count: "exact", head: true });
    if (apiaryId !== "all") todosQ = todosQ.eq("apiary_id", apiaryId);
    const { count: todos } = await todosQ;

    let logsQ = supabase.from("logbook").select("*", { count: "exact", head: true }).is("archived_at", null);
    if (apiaryId !== "all") logsQ = logsQ.eq("apiary_id", apiaryId);
    const { count: logbook } = await logsQ;

    setStats({ apiaries, hives, inspections, todos, logbook });
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
    if (lastFail && now - parseInt(lastFail) < 30 * 60 * 1000) {
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
        !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180;

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
        daily: "temperature_2m_max,temperature_2m_min,weather_code",
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

      setWeather({
        current: {
          temperature_2m: current.temperature_2m,
          wind_speed_10m: current.wind_speed_10m,
          weather_code: current.weather_code,
        },
        forecast: {
          time: daily.time || [],
          temperature_2m_min: daily.temperature_2m_min || [],
          temperature_2m_max: daily.temperature_2m_max || [],
          weather_code: daily.weather_code || daily.weathercode || [],
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

  // Initial + whenever filter changes (for lists/stats)
  useEffect(() => {
    fetchStats(selectedApiaryId);
    fetchRecentInspections(selectedApiaryId);
    fetchRecentTodos(selectedApiaryId);
    fetchRecentLogs(selectedApiaryId);
  }, [selectedApiaryId]);

  // Weather loads once (default apiary)
  useEffect(() => {
    fetchWeather();
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

  const seeAllInspectionsHref =
    `/inspections${selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""}`;
  const seeAllTodosHref =
    `/todos${selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""}`;
  const seeAllLogbookHref =
    `/logbook${selectedApiaryId !== "all" ? `?apiary_id=${encodeURIComponent(selectedApiaryId)}` : ""}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Filter by Apiary */}
        <div className="flex items-center gap-2">
          <label htmlFor="apiaryFilter" className="font-medium">Filter by Apiary:</label>
          <select
            id="apiaryFilter"
            className="border rounded px-2 py-1"
            value={selectedApiaryId}
            onChange={(e) => setSelectedApiaryId(e.target.value)}
          >
            <option value="all">All Apiaries</option>
            {apiariesList.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

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
          <Link
            to={reportHref}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Open Reports &amp; Export
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
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
              <p className="text-xs text-gray-400 mt-1">(this apiary / total)</p>
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
      </div>

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
                  className={`border p-2 rounded text-sm flex items-center justify-between ${i.archived_at ? "opacity-60" : ""}`}
                  title={i.archived_at ? "Archived inspection" : ""}
                >
                  <div className="min-w-0">
                    <strong className="mr-1">{formatUKDate(i.date)}</strong>
                    {i.apiary_id && apiaryNameById[i.apiary_id] ? ` • Apiary: ${apiaryNameById[i.apiary_id]}` : ""}
                    {i.hive_id && hiveNameById[i.hive_id] ? ` • Hive: ${hiveNameById[i.hive_id]}` : ""}
                    {i.notes ? ` — ${i.notes.slice(0, 80)}` : ""}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Keep archived pill on the right for inspections */}
                    <ArchivedPill at={i.archived_at} />
                    {!i.archived_at && (
                      <>
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
                      </>
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
                    className={`border p-2 rounded text-sm flex items-center justify-between ${t.archived_at ? "opacity-60" : ""}`}
                    title={t.archived_at ? "Archived task" : ""}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>{t.due_date ? formatUKDate(t.due_date) : "No date"}</strong>
                        <span className={statusPill(t.status)}>{t.status || "Pending"}</span>
                        {overdue && <span className="text-red-700 text-xs font-semibold">Overdue</span>}
                        {/* Removed Archived pill from left cluster for tasks */}
                      </div>
                      <div className="truncate">
                        {t.title}
                        {t.hive_name ? ` • Hive: ${t.hive_name}` : ""}
                        {t.apiary_id && apiaryNameById[t.apiary_id] ? ` • Apiary: ${apiaryNameById[t.apiary_id]}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {t.archived_at ? (
                        <ArchivedPill at={t.archived_at} />
                      ) : (
                        <>
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
                        </>
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
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="mr-1">{formatUKDate(l.date)}</strong>: {l.log_type}
                        {/* Removed Archived pill from left cluster for logs */}
                      </div>
                      {l.apiary_id && apiaryNameById[l.apiary_id] ? ` • Apiary: ${apiaryNameById[l.apiary_id]}` : ""}
                      {l.entry ? ` — ${l.entry.slice(0, 80)}` : ""}
                      {/* Only show linked inspection if this log entry is not archived */}
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
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {l.archived_at ? (
                        <ArchivedPill at={l.archived_at} />
                      ) : (
                        <>
                          <Link
                            to={toLogbookList(l.id)}
                            className="text-blue-600 hover:underline whitespace-nowrap"
                            aria-label={`Open log entry ${l.id} in list`}
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
                        </>
                      )}
                    </div>
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

      {/* Weather Snapshot */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-1">Weather Snapshot</h2>
        <p className="text-xs text-gray-600 mb-3">
          📍 Weather is based on your <strong>default apiary</strong>
          {defaultApiaryName ? `: ${defaultApiaryName}` : ""}.{" "}
          <Link to="/settings" className="text-blue-600 underline">Change default in Settings</Link>.
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
          <div className="text-sm">
            <p>
              <strong>Now:</strong>{" "}
              {weather?.current?.temperature_2m ?? "N/A"}°C, Wind {weather?.current?.wind_speed_10m ?? "N/A"} km/h
            </p>
            <p className="mt-2"><strong>Next 5 Days:</strong></p>
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
                      {formatUKDate(day)}: {icon} {label && `${label} — `}{tmin}°C → {tmax}°C
                    </li>
                  );
                })
              ) : (
                <li>No forecast.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="space-x-4">
          <Link to="/apiaries/new" className="text-blue-600 underline">New Apiary</Link>
          <Link to="/hives/new" className="text-blue-600 underline">New Hive</Link>
          <Link to="/inspections/new" className="text-blue-600 underline">New Inspection</Link>
          <Link to="/archive" className="text-blue-600 underline">View Archive</Link>
          <Link to={reportHref} className="text-blue-600 underline">Report / Export</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
