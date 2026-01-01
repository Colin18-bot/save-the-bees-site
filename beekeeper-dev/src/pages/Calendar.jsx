// src/pages/Calendar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

/** ----------------------------------------------------------------
 *  DATE HELPERS
 * ----------------------------------------------------------------*/
const ymd = (d) => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const todayYMD = () => ymd(new Date());

const startOfMonth = (year, month) => new Date(year, month, 1);
const endOfMonth = (year, month) => new Date(year, month + 1, 0);

const daysInMonthGrid = (year, month) => {
  const first = startOfMonth(year, month);
  const last = endOfMonth(year, month);
  const firstDay = first.getDay(); // 0..6 (Sun..Sat)
  const totalDays = last.getDate();

  const cells = [];
  // Leading blanks
  for (let i = 0; i < firstDay; i++) cells.push({ date: null, inMonth: false });
  // Actual days
  for (let d = 1; d <= totalDays; d++)
    cells.push({ date: new Date(year, month, d), inMonth: true });
  // Trailing blanks
  while (cells.length % 7 !== 0) cells.push({ date: null, inMonth: false });

  return cells;
};

const fmtDayNum = (d) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(d);
const fmtLong = (d) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

/** ----------------------------------------------------------------
 *  SAFE FIELD PICKERS
 * ----------------------------------------------------------------*/
const firstTruthy = (obj, keys = []) => {
  for (const k of keys) if (obj && obj[k]) return obj[k];
  return null;
};

// returns 'archived' | 'deleted' | 'active'
const archivedState = (row) => {
  const del = firstTruthy(row, ["deleted_at", "deletedAt"]);
  if (del) return "deleted";
  const arc = firstTruthy(row, ["archived_at", "archivedAt"]);
  if (arc) return "archived";
  return "active";
};

const isCompleted = (row) => {
  const status = (row?.status || "").toString().toLowerCase();
  return !!row?.completed_at || status === "done" || status === "completed";
};

const pickDate = (row, candidates) => {
  const v = firstTruthy(row, candidates);
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : ymd(d);
};

/** ----------------------------------------------------------------
 *  LOCAL HIDE (manual remove from grid only) via localStorage
 * ----------------------------------------------------------------*/
const LS_KEY_HIDDEN = "calendar.hiddenEvents";
const loadHidden = () => {
  try {
    const raw = localStorage.getItem(LS_KEY_HIDDEN);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
};
const saveHidden = (set) => {
  try {
    localStorage.setItem(LS_KEY_HIDDEN, JSON.stringify([...set]));
  } catch {}
};

/** ----------------------------------------------------------------
 *  EVENT TYPES + ROUTES
 * ----------------------------------------------------------------*/
const TYPE = {
  APIARY: "APIARY",
  HIVE: "HIVE",
  INSPECTION: "INSPECTION",
  TODO: "TODO",
  LOGBOOK: "LOGBOOK",
};
const TYPE_LABEL = {
  [TYPE.APIARY]: "Apiary",
  [TYPE.HIVE]: "Hive",
  [TYPE.INSPECTION]: "Inspection",
  [TYPE.TODO]: "Task",
  [TYPE.LOGBOOK]: "Logbook",
};

const ROUTES_EDIT = {
  apiary: (id) => `/apiaries/${id}/edit`,
  hive: (id) => `/hives/${id}/edit`,
  inspection: (id) => `/inspections/${id}/edit`,
  todo: (id) => `/todos/${id}/edit`,
  log: (id) => `/logbook/${id}/edit`,
};
const ROUTES_VIEW = {
  apiary: (id) => `/apiaries?highlight=${encodeURIComponent(id)}`,
  hive: (id) => `/hives?highlight=${encodeURIComponent(id)}`,
  inspection: (id) =>
    `/inspections?highlight=${encodeURIComponent(id)}&type=INSPECTION`,
  todo: (id) => `/todos?highlight=${encodeURIComponent(id)}&type=TODO`,
  log: (id) => `/logbook?highlight=${encodeURIComponent(id)}&type=LOGBOOK`,
};
const safeLink = (fn, id) => (id ? fn(id) : null);

/** ----------------------------------------------------------------
 *  MAIN COMPONENT
 * ----------------------------------------------------------------*/
const Calendar = () => {
  const location = useLocation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0..11

  // Parse ?date=YYYY-MM-DD to jump to its month (monthly view)
  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const q = params.get("date");
    if (q) {
      const dt = new Date(q);
      if (!isNaN(dt.getTime())) {
        setYear(dt.getFullYear());
        setMonth(dt.getMonth());
      }
    }
  }, [location.search]);

  // Data
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [todos, setTodos] = useState([]);
  const [logbook, setLogbook] = useState([]);

  // Filters
  const [apiaryId, setApiaryId] = useState("all");
  const [hiveId, setHiveId] = useState("all");
  const [typeFilter, setTypeFilter] = useState({
    [TYPE.APIARY]: true,
    [TYPE.HIVE]: true,
    [TYPE.INSPECTION]: true,
    [TYPE.TODO]: true,
    [TYPE.LOGBOOK]: true,
  });

  // UI
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [hidden, setHidden] = useState(loadHidden()); // Set of "TYPE:id"

  // Modal state
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null); // clicked event
  const [modalOpen, setModalOpen] = useState(false);

  const openEvent = (e) => {
    setSelected(e);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };
  const getIdFromKey = (key) => (key ? key.split(":")[1] : null);

  // Lookups for names (apiary/hive)
  const apiaryNameById = useMemo(() => {
    const map = new Map();
    for (const a of apiaries) map.set(String(a.id), a.name || `Apiary ${a.id}`);
    return map;
  }, [apiaries]);
  const hiveNameById = useMemo(() => {
    const map = new Map();
    for (const h of hives) map.set(String(h.id), h.name || `Hive ${h.id}`);
    return map;
  }, [hives]);

  const getApiaryName = (id) =>
    id ? apiaryNameById.get(String(id)) || `Apiary ${id}` : null;
  const getHiveName = (id) =>
    id ? hiveNameById.get(String(id)) || `Hive ${id}` : null;

  // Simple table getter (keep ABOVE useEffect)
  const getTable = async (table, orderBy) => {
    try {
      let q = supabase.from(table).select("*");
      if (orderBy) q = q.order(orderBy, { ascending: false });
      const { data, error } = await q;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  };

  // Load everything
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [apiRes, hiveRes, inspRes, todoRes] = await Promise.all([
          getTable("apiaries", "name"),
          getTable("hives", "name"),
          getTable("inspections", "created_at"),
          getTable("todos", "created_at"),
        ]);

        // Logbook: try several likely table names
        let logbookRows = await getTable("logbook", "created_at");
        if (!logbookRows.length)
          logbookRows = await getTable("inspection_logbook", "created_at");
        if (!logbookRows.length)
          logbookRows = await getTable("logbook_entries", "created_at");
        if (!logbookRows.length)
          logbookRows = await getTable("inspection_logs", "created_at");

        if (!alive) return;
        setApiaries(apiRes);
        setHives(hiveRes);
        setInspections(inspRes);
        setTodos(todoRes);
        setLogbook(logbookRows);
      } catch {
        if (!alive) return;
        setErr("Failed to load calendar data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Hives for Hive filter (dependent on Apiary)
  const visibleHivesForFilter = useMemo(() => {
    const list =
      apiaryId === "all"
        ? hives
        : hives.filter((h) => String(h.apiary_id) === String(apiaryId));
    return list.sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [hives, apiaryId]);

  /** Build unified events for the selected Month/Year */
  const events = useMemo(() => {
    const monthStart = startOfMonth(year, month);
    const monthEnd = endOfMonth(year, month);
    const inRange = (dYmd) => {
      if (!dYmd) return false;
      const d = new Date(dYmd + "T00:00:00");
      return d >= monthStart && d <= monthEnd;
    };

    // Apiaries → Established (use established_date from DB)
    const apiaryEvents = (apiaries || [])
      .map((a) => {
        const date = pickDate(a, [
          "established_date", // ✅ actual column
          "established_on",
          "established_at",
          "created_on",
          "created_at",
        ]);
        if (!date) return null;
        return {
          key: `${TYPE.APIARY}:${a.id}`,
          type: TYPE.APIARY,
          date,
          title: a.name || "Apiary",
          subtitle: TYPE_LABEL[TYPE.APIARY],
          link: safeLink(ROUTES_EDIT.apiary, a.id),
          apiary_id: a.id,
          hive_id: null,
          status: archivedState(a),
          completed: false,
        };
      })
      .filter(Boolean);

    // Hives → Date established (use date_established from DB)
    const hiveEvents = (hives || [])
      .map((h) => {
        const date = pickDate(h, [
          "date_established", // ✅ actual column from NewHive.jsx
          "installed_at",
          "established_on",
          "created_at",
          "created_on",
        ]);
        if (!date) return null;
        return {
          key: `${TYPE.HIVE}:${h.id}`,
          type: TYPE.HIVE,
          date,
          title: h.name || "Hive",
          subtitle: TYPE_LABEL[TYPE.HIVE],
          link: safeLink(ROUTES_EDIT.hive, h.id),
          apiary_id: h.apiary_id || null,
          hive_id: h.id,
          status: archivedState(h),
          completed: false,
        };
      })
      .filter(Boolean);

    // Inspections → date
    const inspEvents = (inspections || [])
      .map((i) => {
        const date = pickDate(i, ["date", "inspected_on", "created_at"]);
        if (!date) return null;
        return {
          key: `${TYPE.INSPECTION}:${i.id}`,
          type: TYPE.INSPECTION,
          date,
          title: "Inspection",
          subtitle: TYPE_LABEL[TYPE.INSPECTION],
          link: safeLink(ROUTES_EDIT.inspection, i.id),
          apiary_id: i.apiary_id || null,
          hive_id: i.hive_id || null,
          status: archivedState(i),
          completed: false,
        };
      })
      .filter(Boolean);

    // Todos → due_date (or created_at fallback)
    const todoEvents = (todos || [])
      .map((t) => {
        const date = pickDate(t, ["due_date", "created_at"]);
        if (!date) return null;
        return {
          key: `${TYPE.TODO}:${t.id}`,
          type: TYPE.TODO,
          date,
          title: t.title || "Task",
          subtitle: TYPE_LABEL[TYPE.TODO],
          link: safeLink(ROUTES_EDIT.todo, t.id),
          apiary_id: t.apiary_id || null,
          hive_id: t.hive_id || null,
          status: archivedState(t),
          completed: isCompleted(t),
        };
      })
      .filter(Boolean);

    // Logbook → date (or created_at)
    const logEvents = (logbook || [])
      .map((l) => {
        const date = pickDate(l, ["date", "created_at"]);
        if (!date) return null;
        return {
          key: `${TYPE.LOGBOOK}:${l.id}`,
          type: TYPE.LOGBOOK,
          date,
          title: l.log_type || "Log",
          subtitle: TYPE_LABEL[TYPE.LOGBOOK],
          link: safeLink(ROUTES_EDIT.log, l.id),
          apiary_id: l.apiary_id || null,
          hive_id: l.hive_id || null,
          status: archivedState(l),
          completed: false,
        };
      })
      .filter(Boolean);

    const all = [
      ...apiaryEvents,
      ...hiveEvents,
      ...inspEvents,
      ...todoEvents,
      ...logEvents,
    ];
    return all.filter((e) => inRange(e.date));
  }, [year, month, apiaries, hives, inspections, todos, logbook]);

  // Filters → build visible map keyed by date
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (!typeFilter[e.type]) return false;
      if (apiaryId !== "all" && String(e.apiary_id || "") !== String(apiaryId))
        return false;
      if (hiveId !== "all" && String(e.hive_id || "") !== String(hiveId))
        return false;
      return true;
    });
  }, [events, typeFilter, apiaryId, hiveId]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const e of filteredEvents) {
      if (!e || !e.date) continue;
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    // Sort entries per day by type (stable visual order)
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.type.localeCompare(b.type));
      map.set(k, arr);
    }
    return map;
  }, [filteredEvents]);

  const unhideAll = () => {
    const next = new Set();
    setHidden(next);
    saveHidden(next);
  };
  const hideEvent = (key) => {
    const next = new Set(hidden);
    next.add(key);
    saveHidden(next);
    setHidden(next);
  };

  const dotClass = (e) => {
    const base = "inline-block w-1.5 h-1.5 rounded-full mt-1";
    switch (e.type) {
      case TYPE.APIARY:
        return base + " bg-emerald-500";
      case TYPE.HIVE:
        return base + " bg-sky-500";
      case TYPE.INSPECTION:
        return base + " bg-amber-500";
      case TYPE.LOGBOOK:
        return base + " bg-rose-500";
      case TYPE.TODO:
        return base + " bg-violet-500";
      default:
        return base + " bg-zinc-400";
    }
  };

  const pillClass = (e) => {
    const base =
      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border max-w-full truncate";
    const strike =
      e.status === "archived" || e.status === "deleted"
        ? " line-through opacity-60"
        : "";
    const futureTodo =
      e.type === TYPE.TODO &&
      !e.completed &&
      new Date(e.date + "T00:00:00") >= startOfMonth(year, month);
    switch (e.type) {
      case TYPE.APIARY:
        return (
          base +
          " bg-emerald-100 border-emerald-300 text-emerald-900" +
          strike
        );
      case TYPE.HIVE:
        return base + " bg-sky-100 border-sky-300 text-sky-900" + strike;
      case TYPE.INSPECTION:
        return (
          base + " bg-amber-100 border-amber-300 text-amber-900" + strike
        );
      case TYPE.LOGBOOK:
        return base + " bg-rose-100 border-rose-300 text-rose-900" + strike;
      case TYPE.TODO:
        return (
          base +
          " bg-violet-100 border-violet-300 text-violet-900" +
          (futureTodo ? " ring-1 ring-violet-400" : "") +
          strike
        );
      default:
        return base + " bg-zinc-100 border-zinc-300 text-zinc-900" + strike;
    }
  };

  const eventsTitle = (y, m) =>
    `${new Date(y, m, 1).toLocaleString("en-GB", {
      month: "long",
    })} ${y}`;

  const eventsTitleShort = (y, m) =>
    `${new Date(y, m, 1).toLocaleString("en-GB", {
      month: "short",
    })} ${y}`;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">
          {/* Mobile: short month (Nov 2025) */}
          <span className="sm:hidden">
            Calendar — {eventsTitleShort(year, month)}
          </span>
          {/* Desktop/tablet: full month (November 2025) */}
          <span className="hidden sm:inline">
            Calendar — {eventsTitle(year, month)}
          </span>
        </h1>

        {/* FILTERS – Row 1 */}
        <div className="flex flex-wrap items-start gap-3 w-full">
          {/* Apiary + Hive – stack on mobile, inline on larger screens */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium">Apiary:</label>
              <select
                className="w-full sm:w-auto flex-1 sm:flex-none border border-zinc-300 bg-white text-black rounded px-2 py-1 text-sm"
                value={apiaryId}
                onChange={(e) => setApiaryId(e.target.value)}
              >
                <option value="all">All apiaries</option>
                {apiaries.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name || `Apiary ${a.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium">Hive:</label>
              <select
                className="w-full sm:w-auto flex-1 sm:flex-none border border-zinc-300 bg-white text-black rounded px-2 py-1 text-sm"
                value={hiveId}
                onChange={(e) => setHiveId(e.target.value)}
              >
                <option value="all">All hives</option>
                {visibleHivesForFilter.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name || `Hive ${h.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type checkboxes – wrap nicely on mobile */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full md:w-auto md:ml-2">
            {[TYPE.APIARY, TYPE.HIVE, TYPE.INSPECTION, TYPE.LOGBOOK, TYPE.TODO].map(
              (t) => (
                <label
                  key={t}
                  className="flex items-center gap-1 text-xs sm:text-sm min-w-[45%] sm:min-w-0"
                >
                  <input
                    type="checkbox"
                    className="accent-black"
                    checked={!!typeFilter[t]}
                    onChange={(e) =>
                      setTypeFilter((prev) => ({
                        ...prev,
                        [t]: e.target.checked,
                      }))
                    }
                  />
                  <span>{TYPE_LABEL[t]}</span>
                </label>
              )
            )}
          </div>
        </div>
      </div>

      {/* FILTERS – Row 2: Date controls (left) + Hidden controls (right) */}
      <div className="flex flex-wrap items-start gap-2">
        {/* Date controls – stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Month:</label>
            <select
              className="border border-zinc-300 bg-white text-black rounded px-2 py-1 text-sm w-full sm:w-auto"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, m) => (
                <option key={m} value={m}>
                  {new Date(2000, m, 1).toLocaleString("en-GB", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Year:</label>
            <select
              className="border border-zinc-300 bg-white text-black rounded px-2 py-1 text-sm w-full sm:w-auto"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from(
                { length: 9 },
                (_, i) => new Date().getFullYear() - 4 + i
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            className="px-2 py-1 text-sm rounded border border-zinc-300 bg-white hover:bg-zinc-100 text-black w-full sm:w-auto"
            onClick={() => {
              const d = new Date();
              setYear(d.getFullYear());
              setMonth(d.getMonth());
            }}
            title="Jump to current month"
          >
            Today
          </button>
        </div>

        {/* Hidden controls – below on mobile, right on larger screens */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto mt-1 sm:mt-0">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              className="accent-black"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            Show hidden
          </label>
          <button
            className="px-2 py-1 text-xs rounded border border-zinc-300 bg-white hover:bg-zinc-100 text-black"
            onClick={unhideAll}
            title="Unhide all manually hidden items"
          >
            Unhide all
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded border bg-emerald-100 border-emerald-300 text-emerald-900">
          Apiary
        </span>
        <span className="px-2 py-0.5 rounded border bg-sky-100 border-sky-300 text-sky-900">
          Hive
        </span>
        <span className="px-2 py-0.5 rounded border bg-amber-100 border-amber-300 text-amber-900">
          Inspection
        </span>
        <span className="px-2 py-0.5 rounded border bg-rose-100 border-rose-300 text-rose-900">
          Logbook
        </span>
        <span className="px-2 py-0.5 rounded border bg-violet-100 border-violet-300 text-violet-900">
          Task
        </span>
        <span className="ml-3 text-zinc-600">✅ completed</span>
        <span className="ml-3 text-zinc-600">⊘ archived/deleted</span>
        <span className="ml-3 text-zinc-600">◉ future tasks highlighted</span>
      </div>

      {/* CALENDAR GRID */}
      <div className="border border-zinc-200 rounded-md">
        {/* scrollable wrapper – only really used on small screens */}
        <div className="overflow-x-auto">
          {/* keep the grid at a sensible width so days aren’t too squeezed */}
          <div className="min-w-[640px]">
            {/* weekday headings */}
            <div className="grid grid-cols-7 bg-zinc-50 text-[11px] sm:text-xs font-medium">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="px-1.5 sm:px-2 py-1.5 sm:py-2 border-b border-zinc-200"
                >
                  {d}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8 sm:p-10">
                <div className="w-8 h-8 border-4 border-zinc-400 border-dotted rounded-full animate-spin" />
              </div>
            ) : err ? (
              <div className="p-4 text-red-700 bg-red-50 border-t border-zinc-200">
                {err}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-zinc-200">
                {daysInMonthGrid(year, month).map((cell, idx) => {
                  const inMonth = cell.inMonth;
                  const dateYMD = cell.date ? ymd(cell.date) : null;
                  const dayEvents = dateYMD
                    ? (eventsByDay.get(dateYMD) || []).filter(
                        (e) => showHidden || !hidden.has(e.key)
                      )
                    : [];
                  const isToday = dateYMD === todayYMD();

                  return (
                    <div
                      key={idx}
                      className={`min-h-[80px] sm:min-h-[110px] bg-white ${
                        inMonth ? "" : "bg-zinc-50"
                      } p-1 sm:p-1.5`}
                    >
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <div
                          className={`text-[11px] sm:text-xs font-semibold ${
                            inMonth ? "text-zinc-800" : "text-zinc-400"
                          } ${
                            isToday
                              ? "px-1 rounded bg-yellow-300 text-white"
                              : ""
                          }`}
                        >
                          {cell.date ? fmtDayNum(cell.date) : ""}
                        </div>
                        {dayEvents.length > 4 && (
                          <div className="text-[9px] sm:text-[10px] text-zinc-500">
                            {dayEvents.length} items
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5 sm:space-y-1">
                        {dayEvents.slice(0, 4).map((e) => {
                          const isDisabled =
                            e.status === "archived" || e.status === "deleted";
                          const badgeText =
                            e.status === "deleted"
                              ? "DELETED"
                              : e.status === "archived"
                              ? "ARCHIVED"
                              : "";
                          const badgeCls =
                            e.status === "deleted"
                              ? "bg-red-200 text-red-900"
                              : "bg-zinc-200 text-zinc-800";

                          const content = (
                            <span
                              className={
                                pillClass(e) +
                                " text-[10px] sm:text-xs px-1.5 sm:px-2 py-[1px] sm:py-0.5"
                              }
                              title={
                                isDisabled
                                  ? "Check archives"
                                  : `${e.subtitle}\n${fmtLong(e.date)}`
                              }
                            >
                              <span>
                                {e.completed ? "✅ " : ""}
                                {e.title}
                              </span>
                              {badgeText && (
                                <span
                                  className={`ml-1 px-1 rounded text-[9px] ${badgeCls}`}
                                >
                                  {badgeText}
                                </span>
                              )}
                            </span>
                          );

                          return (
                            <div key={e.key} className="flex items-start gap-1">
                              <span className={dotClass(e)} />
                              {isDisabled || !e.link ? (
                                content
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openEvent(e)}
                                  className="text-left truncate"
                                  title="Open details"
                                >
                                  {content}
                                </button>
                              )}
                              {!showHidden && (
                                <button
                                  className="ml-auto hidden sm:inline text-[10px] text-zinc-500 hover:text-zinc-800"
                                  title="Hide this item from the calendar (manual only)"
                                  onClick={() => hideEvent(e.key)}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Items are never auto-removed from the calendar. Use the “×” to hide
        manually (stored on this device). Archived/deleted entries remain
        visible with a strike-through and cannot be opened here — check your
        archive view.
      </div>

      {/* -------- Modal -------- */}
      {modalOpen && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="w-[90vw] max-w-md bg-white rounded-lg shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">
                {TYPE_LABEL[selected.type]} • {selected.title}
              </h3>
              <button
                className="text-zinc-500 hover:text-zinc-800"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="text-sm text-zinc-700 space-y-1">
              <p>
                <span className="font-medium">Date:</span>{" "}
                {fmtLong(selected.date)}
              </p>

              {selected.apiary_id && (
                <p>
                  <span className="font-medium">Apiary:</span>{" "}
                  {getApiaryName(selected.apiary_id)}
                </p>
              )}
              {selected.hive_id && (
                <p>
                  <span className="font-medium">Hive:</span>{" "}
                  {getHiveName(selected.hive_id)}
                </p>
              )}

              {selected.completed && <p>✅ Completed</p>}
              {(selected.status === "archived" ||
                selected.status === "deleted") && (
                <p className="text-red-700">
                  This item is {selected.status}.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {/* VIEW -> go to list, with highlight */}
              {selected.link && (
                <Link
                  to={ROUTES_VIEW[
                    selected.type === TYPE.APIARY
                      ? "apiary"
                      : selected.type === TYPE.HIVE
                      ? "hive"
                      : selected.type === TYPE.INSPECTION
                      ? "inspection"
                      : selected.type === TYPE.TODO
                      ? "todo"
                      : "log"
                  ](getIdFromKey(selected.key))}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
                  onClick={() => setModalOpen(false)}
                >
                  Open in list
                </Link>
              )}
              {selected.link && (
                <Link
                  to={selected.link}
                  className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
                  onClick={() => setModalOpen(false)}
                >
                  Edit
                </Link>
              )}
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
