// src/pages/Calendar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";
import { coordinateHiveIntelligence } from "../intelligence";

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
  for (let i = 0; i < firstDay; i++) cells.push({ date: null, inMonth: false });
  for (let d = 1; d <= totalDays; d++)
    cells.push({ date: new Date(year, month, d), inMonth: true });
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
  } catch {
    // localStorage may be blocked – ignore
  }
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
  QUEEN: "QUEEN",
  TREATMENT: "TREATMENT",
};
const TYPE_LABEL = {
  [TYPE.APIARY]: "Apiary",
  [TYPE.HIVE]: "Hive",
  [TYPE.INSPECTION]: "Inspection",
  [TYPE.TODO]: "Task",
  [TYPE.LOGBOOK]: "Logbook",
  [TYPE.QUEEN]: "Queens",
  [TYPE.TREATMENT]: "Treatments",
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
  queen: () => "/queens",
  treatment: () => "/veterinary-medicines",
};
const safeLink = (fn, id) => (id ? fn(id) : null);

/** ----------------------------------------------------------------
 *  MAIN COMPONENT
 * ----------------------------------------------------------------*/
const Calendar = () => {
  const location = useLocation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

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
  const [queenEvents, setQueenEvents] = useState([]);
  const [queenProcesses, setQueenProcesses] = useState([]);
  const [medicineTreatments, setMedicineTreatments] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkPlan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setIsPremium(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setIsPremium(false);
        return;
      }

      const level = String(data?.subscription_level || "free").toLowerCase();
      setIsPremium(level === "premium");
    };

    checkPlan();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filters
  const [apiaryId, setApiaryId] = useState("all");
  const [hiveId, setHiveId] = useState("all");
  const [typeFilter, setTypeFilter] = useState({
    [TYPE.APIARY]: true,
    [TYPE.HIVE]: true,
    [TYPE.INSPECTION]: true,
    [TYPE.TODO]: true,
    [TYPE.LOGBOOK]: true,
    [TYPE.QUEEN]: true,
    [TYPE.TREATMENT]: true,
  });

  // UI
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [hidden, setHidden] = useState(loadHidden());

  const [selected, setSelected] = useState(null);
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

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [
          apiRes,
          hiveRes,
          inspRes,
          todoRes,
          queenEventRes,
          queenProcessRes,
          treatmentRes,
        ] = await Promise.all([
          getTable("apiaries", "name"),
          getTable("hives", "name"),
          getTable("inspections", "created_at"),
          getTable("todos", "created_at"),
          getTable("queen_events", "event_date"),
          getTable("queen_processes", "expected_check_on"),
          getTable("veterinary_medicine_hive_status", "started_on"),
        ]);

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
        setQueenEvents(queenEventRes);
        setQueenProcesses(queenProcessRes);
        setMedicineTreatments(treatmentRes);
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

  const visibleHivesForFilter = useMemo(() => {
    const list =
      apiaryId === "all"
        ? hives
        : hives.filter((h) => String(h.apiary_id) === String(apiaryId));
    return [...list].sort((a, b) =>
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

    const apiaryEvents = (apiaries || [])
      .map((a) => {
        const date = pickDate(a, [
          "established_date",
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

    const hiveEvents = (hives || [])
      .map((h) => {
        const date = pickDate(h, [
          "date_established",
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

    const healthByInspectionId = new Map();

    if (isPremium) {
      const inspectionsByHive = new Map();

      (inspections || []).forEach((inspection) => {
        if (!inspection?.hive_id) return;
        const hiveKey = String(inspection.hive_id);
        if (!inspectionsByHive.has(hiveKey)) inspectionsByHive.set(hiveKey, []);
        inspectionsByHive.get(hiveKey).push(inspection);
      });

      inspectionsByHive.forEach((hiveInspections) => {
        hiveInspections.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const history = [];
        hiveInspections.forEach((inspection) => {
          history.push(inspection);
          const assessment = coordinateHiveIntelligence({ history, inspection });
          healthByInspectionId.set(String(inspection.id), assessment);
        });
      });
    }

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
          health: healthByInspectionId.get(String(i.id)) || null,
        };
      })
      .filter(Boolean);

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

    const queenCalendarEvents = (queenEvents || [])
      .filter((q) => {
        const eventType = String(q.event_type || "").toLowerCase();
        const title = String(q.title || "").toLowerCase();
        return eventType !== "queen_added" && title !== "queen record added";
      })
      .map((q) => {
        const date = pickDate(q, ["event_date", "created_at"]);
        if (!date) return null;

        return {
          key: `${TYPE.QUEEN}:${q.id}`,
          type: TYPE.QUEEN,
          date,
          title: q.title || "Queen event",
          subtitle: TYPE_LABEL[TYPE.QUEEN],
          link: "/queens",
          apiary_id: q.apiary_id || null,
          hive_id: q.hive_id || null,
          queen_id: q.queen_id || null,
          queen_event_id: q.id,
          status: "active",
          completed: false,
          detail: q.detail || null,
        };
      })
      .filter(Boolean);

    const queenFollowUpEvents = (queenProcesses || [])
      .filter((process) => process.expected_check_on && !process.ended_on)
      .map((process) => {
        const date = pickDate(process, ["expected_check_on"]);
        if (!date) return null;

        const processType = String(process.process_type || "").toLowerCase();
        const titleByType = {
          introduction: "Follow-up: Queen introduction",
          replacement_after_split: "Follow-up: Queen replacement",
          queen_location_check: "Follow-up: Queen location check",
          queenless_plan: "Follow-up: Queenless colony",
          queen_rearing: "Follow-up: Queen rearing",
        };
        const fallbackTitle = processType
          ? `Follow-up: ${processType.replace(/_/g, " ")}`
          : "Follow-up: Queen check";

        return {
          key: `${TYPE.QUEEN}:${process.id}`,
          type: TYPE.QUEEN,
          date,
          title: titleByType[processType] || fallbackTitle,
          subtitle: "Queen follow-up",
          link: "/queens",
          apiary_id: process.apiary_id || null,
          hive_id: process.hive_id || null,
          queen_id: process.queen_id || null,
          queen_process_id: process.id,
          status: "active",
          completed: false,
          detail: process.notes || null,
        };
      })
      .filter(Boolean);

    const treatmentEvents = (medicineTreatments || []).flatMap((t) => {
      const result = [];
      const started = pickDate(t, ["started_on"]);
      const planned = pickDate(t, ["planned_completion_date"]);
      const completedOn = pickDate(t, ["completed_on"]);
      const isDone = String(t.status || "").toLowerCase() === "completed";
      const isOneOff = t.treatment_mode === "one_off";
      const product = t.product_name || "Veterinary treatment";
      const actionWord = t.completion_action === "remove" ? "Remove" : "Complete";

      if (started) {
        result.push({
          key: `${TYPE.TREATMENT}:${t.treatment_hive_id}:start`,
          type: TYPE.TREATMENT,
          date: started,
          title: isOneOff ? `${product} treatment administered` : `${product} treatment started`,
          subtitle: isOneOff ? "One-off treatment" : "Treatment started",
          link: ROUTES_VIEW.treatment(),
          apiary_id: t.apiary_id || null,
          hive_id: t.hive_id || null,
          apiary_name_snapshot: t.apiary_name_snapshot || null,
          hive_name_snapshot: t.hive_name_snapshot || null,
          status: "active",
          completed: isDone,
          overdue: false,
          product_name: product,
          method: t.method || null,
          treatment_for: t.treatment_for || null,
          started_on: started,
          planned_completion_date: planned,
          completed_on: completedOn,
          treatment_status: t.status || null,
          completion_action: t.completion_action || null,
          detail: t.notes || null,
        });
      }

      if (!isDone && !isOneOff && planned) {
        result.push({
          key: `${TYPE.TREATMENT}:${t.treatment_hive_id}:due`,
          type: TYPE.TREATMENT,
          date: planned,
          title: t.is_overdue
            ? `OVERDUE — ${actionWord} ${product}`
            : `${actionWord} ${product}`,
          subtitle: t.is_overdue ? "Treatment removal/completion overdue" : "Treatment due",
          link: ROUTES_VIEW.treatment(),
          apiary_id: t.apiary_id || null,
          hive_id: t.hive_id || null,
          apiary_name_snapshot: t.apiary_name_snapshot || null,
          hive_name_snapshot: t.hive_name_snapshot || null,
          status: "active",
          completed: false,
          overdue: !!t.is_overdue,
          product_name: product,
          method: t.method || null,
          treatment_for: t.treatment_for || null,
          started_on: started,
          planned_completion_date: planned,
          completed_on: null,
          treatment_status: t.status || null,
          completion_action: t.completion_action || null,
          detail: t.notes || null,
        });
      }

      if (isDone && !isOneOff && completedOn && completedOn !== started) {
        result.push({
          key: `${TYPE.TREATMENT}:${t.treatment_hive_id}:completed`,
          type: TYPE.TREATMENT,
          date: completedOn,
          title: `${product} treatment completed`,
          subtitle: "Treatment completed",
          link: ROUTES_VIEW.treatment(),
          apiary_id: t.apiary_id || null,
          hive_id: t.hive_id || null,
          apiary_name_snapshot: t.apiary_name_snapshot || null,
          hive_name_snapshot: t.hive_name_snapshot || null,
          status: "active",
          completed: true,
          overdue: false,
          product_name: product,
          method: t.method || null,
          treatment_for: t.treatment_for || null,
          started_on: started,
          planned_completion_date: planned,
          completed_on: completedOn,
          treatment_status: t.status || null,
          completion_action: t.completion_action || null,
          detail: t.notes || null,
        });
      }

      return result;
    });

    const all = [
      ...apiaryEvents,
      ...hiveEvents,
      ...inspEvents,
      ...todoEvents,
      ...logEvents,
      ...queenCalendarEvents,
      ...queenFollowUpEvents,
      ...treatmentEvents,
    ];
    return all.filter((e) => inRange(e.date));
  }, [
    year,
    month,
    apiaries,
    hives,
    inspections,
    todos,
    logbook,
    queenEvents,
    queenProcesses,
    medicineTreatments,
    isPremium,
  ]);

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
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        if (!!a.overdue !== !!b.overdue) return a.overdue ? -1 : 1;
        return a.type.localeCompare(b.type);
      });
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
    if (e.type === TYPE.TREATMENT && e.overdue) return base + " bg-red-600";
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
      case TYPE.QUEEN:
        return base + " bg-fuchsia-500";
      case TYPE.TREATMENT:
        return base + " bg-lime-600";
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

    if (e.type === TYPE.TREATMENT && e.overdue) {
      return base + " bg-red-100 border-red-400 text-red-900 font-bold";
    }

    switch (e.type) {
      case TYPE.APIARY:
        return base + " bg-emerald-100 border-emerald-300 text-emerald-900" + strike;
      case TYPE.HIVE:
        return base + " bg-sky-100 border-sky-300 text-sky-900" + strike;
      case TYPE.INSPECTION:
        return base + " bg-amber-100 border-amber-300 text-amber-900" + strike;
      case TYPE.LOGBOOK:
        return base + " bg-rose-100 border-rose-300 text-rose-900" + strike;
      case TYPE.TODO:
        return (
          base +
          " bg-violet-100 border-violet-300 text-violet-900" +
          (futureTodo ? " ring-1 ring-violet-400" : "") +
          strike
        );
      case TYPE.QUEEN:
        return base + " bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900" + strike;
      case TYPE.TREATMENT:
        return base + " bg-lime-100 border-lime-300 text-lime-900" + strike;
      default:
        return base + " bg-zinc-100 border-zinc-300 text-zinc-900" + strike;
    }
  };

  const eventsTitle = (y, m) =>
    `${new Date(y, m, 1).toLocaleString("en-GB", { month: "long" })} ${y}`;
  const eventsTitleShort = (y, m) =>
    `${new Date(y, m, 1).toLocaleString("en-GB", { month: "short" })} ${y}`;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">
          <span className="sm:hidden">Calendar — {eventsTitleShort(year, month)}</span>
          <span className="hidden sm:inline">Calendar — {eventsTitle(year, month)}</span>
        </h2>

        <div className="flex flex-wrap items-start gap-3 w-full">
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

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full md:w-auto md:ml-2">
            {[
              TYPE.APIARY,
              TYPE.HIVE,
              TYPE.INSPECTION,
              TYPE.LOGBOOK,
              TYPE.TODO,
              TYPE.QUEEN,
              TYPE.TREATMENT,
            ].map((t) => (
              <label
                key={t}
                className="flex items-center gap-1 text-xs sm:text-sm min-w-[45%] sm:min-w-0"
              >
                <input
                  type="checkbox"
                  className="accent-black"
                  checked={!!typeFilter[t]}
                  onChange={(e) =>
                    setTypeFilter((prev) => ({ ...prev, [t]: e.target.checked }))
                  }
                />
                <span>{TYPE_LABEL[t]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-2">
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
                  {new Date(2000, m, 1).toLocaleString("en-GB", { month: "long" })}
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
                <option key={y} value={y}>{y}</option>
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

      <div className="flex items-center flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded border bg-emerald-100 border-emerald-300 text-emerald-900">Apiary</span>
        <span className="px-2 py-0.5 rounded border bg-sky-100 border-sky-300 text-sky-900">Hive</span>
        <span className="px-2 py-0.5 rounded border bg-amber-100 border-amber-300 text-amber-900">Inspection</span>
        <span className="px-2 py-0.5 rounded border bg-rose-100 border-rose-300 text-rose-900">Logbook</span>
        <span className="px-2 py-0.5 rounded border bg-violet-100 border-violet-300 text-violet-900">Task</span>
        <span className="px-2 py-0.5 rounded border bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900">Queens</span>
        <span className="px-2 py-0.5 rounded border bg-lime-100 border-lime-300 text-lime-900">Treatments</span>
        <span className="px-2 py-0.5 rounded border bg-red-100 border-red-400 text-red-900 font-semibold">Overdue treatment</span>
        <span className="ml-3 text-zinc-600">✅ completed</span>
        <span className="ml-3 text-zinc-600">⊘ archived/deleted</span>
        <span className="ml-3 text-zinc-600">◉ future tasks highlighted</span>
      </div>

      <div className="border border-zinc-200 rounded-md">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
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
              <div className="p-4 text-red-700 bg-red-50 border-t border-zinc-200">{err}</div>
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
                          } ${isToday ? "px-1 rounded bg-yellow-300 text-white" : ""}`}
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
                                <span className={`ml-1 px-1 rounded text-[9px] ${badgeCls}`}>
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
        Items are never auto-removed from the calendar. Use the “×” to hide manually (stored on this device). Archived/deleted entries remain visible with a strike-through. Veterinary treatment dates remain part of the medicine history even if the hive or apiary is later removed.
      </div>

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
                {selected.type === TYPE.INSPECTION
                  ? "Inspection"
                  : selected.type === TYPE.TREATMENT
                  ? selected.title
                  : `${TYPE_LABEL[selected.type]} • ${selected.title}`}
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
                <span className="font-medium">Date:</span> {fmtLong(selected.date)}
              </p>

              {(selected.apiary_id || selected.apiary_name_snapshot) && (
                <p>
                  <span className="font-medium">Apiary:</span>{" "}
                  {selected.apiary_name_snapshot || getApiaryName(selected.apiary_id)}
                </p>
              )}
              {(selected.hive_id || selected.hive_name_snapshot) && (
                <p>
                  <span className="font-medium">Hive:</span>{" "}
                  {selected.hive_name_snapshot || getHiveName(selected.hive_id)}
                </p>
              )}

              {selected.type === TYPE.TREATMENT && (
                <div className="mt-3 rounded-lg border border-lime-200 bg-lime-50 p-3 space-y-1">
                  <p className="font-semibold text-[#1a3329]">Veterinary treatment</p>
                  {selected.product_name && (
                    <p><span className="font-medium">Medicine:</span> {selected.product_name}</p>
                  )}
                  {selected.treatment_for && (
                    <p><span className="font-medium">Used for:</span> {selected.treatment_for}</p>
                  )}
                  {selected.method && (
                    <p><span className="font-medium">Method:</span> {selected.method}</p>
                  )}
                  {selected.started_on && (
                    <p><span className="font-medium">Started:</span> {fmtLong(selected.started_on)}</p>
                  )}
                  {selected.planned_completion_date && (
                    <p>
                      <span className="font-medium">
                        {selected.completion_action === "remove" ? "Removal date:" : "Completion date:"}
                      </span>{" "}
                      {fmtLong(selected.planned_completion_date)}
                    </p>
                  )}
                  {selected.completed_on && (
                    <p><span className="font-medium">Actually completed:</span> {fmtLong(selected.completed_on)}</p>
                  )}
                  {selected.overdue && (
                    <p className="font-bold text-red-700">Treatment removal/completion is overdue.</p>
                  )}
                </div>
              )}

              {isPremium &&
                selected.type === TYPE.INSPECTION &&
                selected.health?.hasAssessment && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="font-semibold text-green-900">Hive Health at this inspection</p>
                    <p className="mt-1">
                      <span className="font-medium">Health Score:</span>{" "}
                      {selected.health.overall?.healthScore ?? "—"}/100
                      {selected.health.overall?.healthBand
                        ? ` – ${selected.health.overall.healthBand}`
                        : ""}
                    </p>
                    <p>
                      <span className="font-medium">Overall Risk:</span>{" "}
                      {selected.health.overall?.riskLevel || "Unknown"}
                    </p>
                    {selected.health.priorityItems?.length > 0 && (
                      <p>
                        <span className="font-medium">Top concern:</span>{" "}
                        {selected.health.priorityItems[0].source || "Hive Health"}
                        {selected.health.priorityItems[0].level
                          ? ` – ${selected.health.priorityItems[0].level}`
                          : ""}
                      </p>
                    )}
                  </div>
                )}

              {selected.detail && (
                <p><span className="font-medium">Details:</span> {selected.detail}</p>
              )}

              {selected.completed && <p>✅ Completed</p>}
              {(selected.status === "archived" || selected.status === "deleted") && (
                <p className="text-red-700">This item is {selected.status}.</p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {isPremium && selected.type === TYPE.INSPECTION && selected.hive_id && (
                <Link
                  to={`/hives/${selected.hive_id}`}
                  className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
                  onClick={() => setModalOpen(false)}
                >
                  View Hive Health
                </Link>
              )}

              {selected.type === TYPE.TREATMENT ? (
                <Link
                  to="/veterinary-medicines"
                  className="bg-[#1a3329] hover:bg-[#24483a] text-white text-sm px-3 py-2 rounded"
                  onClick={() => setModalOpen(false)}
                >
                  Open Veterinary Medicines
                </Link>
              ) : selected.link ? (
                <Link
                  to={
                    selected.type === TYPE.QUEEN
                      ? `/queens?hive=${encodeURIComponent(
                          selected.hive_id || ""
                        )}&queen=${encodeURIComponent(
                          selected.queen_id || ""
                        )}&event=${encodeURIComponent(
                          selected.queen_event_id || ""
                        )}&process=${encodeURIComponent(
                          selected.queen_process_id || ""
                        )}`
                      : ROUTES_VIEW[
                          selected.type === TYPE.APIARY
                            ? "apiary"
                            : selected.type === TYPE.HIVE
                            ? "hive"
                            : selected.type === TYPE.INSPECTION
                            ? "inspection"
                            : selected.type === TYPE.TODO
                            ? "todo"
                            : "log"
                        ](getIdFromKey(selected.key))
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
                  onClick={() => setModalOpen(false)}
                >
                  Open in list
                </Link>
              ) : null}

              {selected.link &&
                selected.type !== TYPE.QUEEN &&
                selected.type !== TYPE.TREATMENT && (
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
