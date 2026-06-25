// src/pages/Reports/PrintReport.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { supabase } from "../../services/supabase";
import { formatDerivedWeather, getTempUnit } from "../../utils/formatDerivedWeather";
import {
  INSIGHT_LEVELS,
  analyzeInspection,
  analyzeInspectionSet,
  buildInspectionInsights,
  buildShareableInspectionSummary,
} from "../../utils/hiveIntelligence";

const fmtUK = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "");
const DEFAULT_FROM = dayjs().subtract(30, "day").format("YYYY-MM-DD");
const DEFAULT_TO = dayjs().format("YYYY-MM-DD");

const REPORT_FILTERS_STORAGE_KEY = "hivetag_report_filters_v1";

const getSavedReportFilters = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REPORT_FILTERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const boolFromSaved = (value, fallback) => (typeof value === "boolean" ? value : fallback);

const safeParseDerivedWeather = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s.startsWith("{")) return null;

  try {
    const obj = JSON.parse(s);
    if (!obj || typeof obj !== "object") return null;

    const desc = typeof obj.desc === "string" ? obj.desc : "";
    const temp_c = Number.isFinite(Number(obj.temp_c)) ? Number(obj.temp_c) : null;

    if (!desc && temp_c === null) return null;
    return { desc, temp_c };
  } catch {
    return null;
  }
};

const formatWeatherForDisplay = (rawWeather) => {
  const parsed = safeParseDerivedWeather(rawWeather);
  if (!parsed) return rawWeather || "";

  const unit = getTempUnit();
  return formatDerivedWeather(parsed, unit);
};

const boolYesNo = (value) => (value ? "Yes" : "No");
const valueOrDash = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (value === true) return "Yes";
  if (value === false) return "No";
  return value || "—";
};
const valueWithOther = (value, other) => {
  const main = Array.isArray(value) ? value.filter(Boolean).join(", ") : value || "";
  const extra = other ? String(other).trim() : "";
  if (main && extra) return `${main}; Other: ${extra}`;
  return main || extra || "—";
};
const inspectionTypeLabel = (value) => {
  if (value === "full_inspection") return "Full inspection";
  if (value === "quick_check") return "Quick check";
  if (value === "external_check") return "External check";
  return value || "—";
};
const insightClasses = (level) => {
  if (level === INSIGHT_LEVELS.CRITICAL || level === "high") return "border-red-200 bg-red-50 text-red-900";
  if (level === INSIGHT_LEVELS.WARNING || level === "medium") return "border-orange-200 bg-orange-50 text-orange-900";
  if (level === INSIGHT_LEVELS.WATCH) return "border-amber-200 bg-amber-50 text-amber-900";
  if (level === INSIGHT_LEVELS.INFO) return "border-blue-200 bg-blue-50 text-blue-900";
  return "border-green-200 bg-green-50 text-green-900";
};
const insightDot = (level) => {
  if (level === INSIGHT_LEVELS.CRITICAL || level === "high") return "🔴";
  if (level === INSIGHT_LEVELS.WARNING || level === "medium") return "🟠";
  if (level === INSIGHT_LEVELS.WATCH) return "🟡";
  if (level === INSIGHT_LEVELS.INFO) return "🔵";
  return "🟢";
};

export default function PrintReport() {
  const location = useLocation();

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");

  const savedFiltersRef = useRef(getSavedReportFilters());
  const didAutoRunSavedReportRef = useRef(false);

  const [apiaryId, setApiaryId] = useState(() => savedFiltersRef.current.apiaryId || "");
  const [hiveId, setHiveId] = useState(() => savedFiltersRef.current.hiveId || "");
  const [fromDate, setFromDate] = useState(() => savedFiltersRef.current.fromDate || DEFAULT_FROM);
  const [toDate, setToDate] = useState(() => savedFiltersRef.current.toDate || DEFAULT_TO);
  const [includeArchived, setIncludeArchived] = useState(() => boolFromSaved(savedFiltersRef.current.includeArchived, false));
  const [includeInspections, setIncludeInspections] = useState(() => boolFromSaved(savedFiltersRef.current.includeInspections, true));
  const [includeTodos, setIncludeTodos] = useState(() => boolFromSaved(savedFiltersRef.current.includeTodos, true));
  const [includeLogbook, setIncludeLogbook] = useState(() => boolFromSaved(savedFiltersRef.current.includeLogbook, true));
  const [includeNfc, setIncludeNfc] = useState(() => boolFromSaved(savedFiltersRef.current.includeNfc, false));
  const [hasGeneratedReport, setHasGeneratedReport] = useState(() => boolFromSaved(savedFiltersRef.current.hasGeneratedReport, false));

  const [activeTab, setActiveTab] = useState(() => savedFiltersRef.current.activeTab || "summary");
  const [gallery, setGallery] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [todos, setTodos] = useState([]);
  const [logbook, setLogbook] = useState([]);
  const [nfcHives, setNfcHives] = useState([]);
  const [inspectionById, setInspectionById] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPremium = subscriptionLevel === "premium";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        REPORT_FILTERS_STORAGE_KEY,
        JSON.stringify({
          apiaryId,
          hiveId,
          fromDate,
          toDate,
          includeArchived,
          includeInspections,
          includeTodos,
          includeLogbook,
          includeNfc,
          activeTab,
          hasGeneratedReport,
        })
      );
    } catch {
      // Ignore storage failures. The report still works normally.
    }
  }, [
    apiaryId,
    hiveId,
    fromDate,
    toDate,
    includeArchived,
    includeInspections,
    includeTodos,
    includeLogbook,
    includeNfc,
    activeTab,
    hasGeneratedReport,
  ]);

  useEffect(() => {
    document.title = `Reports Centre — ${fmtUK(fromDate)}–${fmtUK(toDate)}`;
  }, [fromDate, toDate]);

  useEffect(() => {
    (async () => {
      const { data: userWrap } = await supabase.auth.getUser();
      const uid = userWrap?.user?.id;

      if (!uid) {
        setSubscriptionLevel("free");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", uid)
        .maybeSingle();

      const level = profile?.subscription_level || "free";
      setSubscriptionLevel(level);
      if (level !== "premium") setIncludeNfc(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: apiaryRows }, { data: hiveRows }] = await Promise.all([
        supabase.from("apiaries").select("id, name, archived_at").order("name", { ascending: true }),
        supabase.from("hives").select("id, name, apiary_id, nfc_uid, archived_at").order("name", { ascending: true }),
      ]);

      setApiaries(apiaryRows || []);
      setHives(hiveRows || []);

      const params = new URLSearchParams(location.search);
      const aid = params.get("apiary_id");
      const hid = params.get("hive_id");
      if (aid) setApiaryId(aid);
      if (hid) setHiveId(hid);
    })();
  }, [location.search]);

  const apiaryName = useMemo(
    () => new Map(apiaries.map((a) => [a.id, a.name || "Unnamed Apiary"])),
    [apiaries]
  );

  const hiveMap = useMemo(
    () => new Map(hives.map((h) => [h.id, { name: h.name || "Unnamed Hive", apiary_id: h.apiary_id }])),
    [hives]
  );

  const hivesForApiary = useMemo(() => {
    if (!apiaryId) return hives;
    return hives.filter((h) => String(h.apiary_id) === String(apiaryId));
  }, [hives, apiaryId]);

  const hiveName = (id) => hiveMap.get(id)?.name || "Unknown Hive";
  const apiaryForHive = (hid) => (hid ? hiveMap.get(hid)?.apiary_id || "" : "");
  const displayHive = (hid, aid) => {
    if (hid) return hiveName(hid);
    if (aid) return "All hives";
    return "Unknown Hive";
  };

  const effectiveIds = (row) => {
    const i = row?.inspection_id ? inspectionById.get(row.inspection_id) : null;
    const resolvedHiveId = row.hive_id || i?.hive_id || "";
    const resolvedApiaryId =
      row.apiary_id || apiaryForHive(row.hive_id) || i?.apiary_id || apiaryForHive(i?.hive_id) || "";
    return { resolvedHiveId, resolvedApiaryId };
  };

  const relatedInspectionLabel = (row) => {
    if (!row?.inspection_id) return "";
    const inspection = inspectionById.get(row.inspection_id);
    if (!inspection) return "Linked inspection";
    return `${fmtUK(inspection.date)} — ${inspection.hive_id ? hiveName(inspection.hive_id) : "Unknown hive"}`;
  };

  const reportScope = useMemo(() => {
    if (hiveId) return hiveName(hiveId);
    if (apiaryId) return apiaryName.get(apiaryId) || "Selected apiary";
    return "All apiaries and hives";
  }, [apiaryId, hiveId, apiaryName, hives]);

  const runQuery = async () => {
    setLoading(true);
    setError("");

    try {
      let inspectionsData = [];
      let todosData = [];
      let logbookData = [];
      let nfcData = [];

      if (includeInspections) {
        let q = supabase.from("inspections").select("*");
        if (!includeArchived) q = q.is("archived_at", null);
        if (hiveId) q = q.eq("hive_id", hiveId);
        else if (apiaryId) q = q.eq("apiary_id", apiaryId);
        if (fromDate) q = q.gte("date", fromDate);
        if (toDate) q = q.lte("date", toDate);
        const { data, error } = await q.order("date", { ascending: false });
        if (error) throw error;
        inspectionsData = data || [];
      }

      let inspectionIdsForLinks = [];
      if (hiveId || apiaryId) {
        let iq = supabase.from("inspections").select("id");
        if (hiveId) iq = iq.eq("hive_id", hiveId);
        else if (apiaryId) iq = iq.eq("apiary_id", apiaryId);
        const { data } = await iq;
        inspectionIdsForLinks = (data || []).map((r) => r.id);
      }

      if (includeTodos) {
        const buildTodoQuery = (mode) => {
          let q = supabase.from("todos").select("*");
          if (!includeArchived) q = q.is("archived_at", null);
          if (mode === "due") {
            if (fromDate) q = q.gte("due_date", fromDate);
            if (toDate) q = q.lte("due_date", toDate);
          } else {
            q = q.is("due_date", null);
            if (fromDate) q = q.gte("created_at", fromDate);
            if (toDate) q = q.lte("created_at", dayjs(toDate).add(1, "day").format("YYYY-MM-DD"));
          }
          if (hiveId) q = q.eq("hive_id", hiveId);
          else if (apiaryId) q = q.eq("apiary_id", apiaryId);
          return q;
        };

        const [{ data: A1, error: E1 }, { data: A2, error: E2 }] = await Promise.all([
          buildTodoQuery("due"),
          buildTodoQuery("created"),
        ]);
        if (E1) throw E1;
        if (E2) throw E2;
        const map = new Map();
        for (const r of A1 || []) map.set(r.id, r);
        for (const r of A2 || []) map.set(r.id, r);

        if (inspectionIdsForLinks.length) {
          try {
            const { data: linked } = await supabase.from("todos").select("*").in("inspection_id", inspectionIdsForLinks);
            for (const r of linked || []) map.set(r.id, r);
          } catch {
            // Older schemas may not have inspection_id on todos. Ignore safely.
          }
        }
        todosData = Array.from(map.values());
      }

      if (includeLogbook) {
        const buildLogQuery = (mode) => {
          let q = supabase.from("logbook").select("*");
          if (!includeArchived) q = q.is("archived_at", null);
          if (mode === "date") {
            if (fromDate) q = q.gte("date", fromDate);
            if (toDate) q = q.lte("date", toDate);
          } else {
            q = q.is("date", null);
            if (fromDate) q = q.gte("created_at", fromDate);
            if (toDate) q = q.lte("created_at", dayjs(toDate).add(1, "day").format("YYYY-MM-DD"));
          }
          if (hiveId) q = q.eq("hive_id", hiveId);
          else if (apiaryId) q = q.eq("apiary_id", apiaryId);
          return q;
        };

        const [{ data: A1, error: E1 }, { data: A2, error: E2 }] = await Promise.all([
          buildLogQuery("date"),
          buildLogQuery("created"),
        ]);
        if (E1) throw E1;
        if (E2) throw E2;
        const map = new Map();
        for (const r of A1 || []) map.set(r.id, r);
        for (const r of A2 || []) map.set(r.id, r);

        if (inspectionIdsForLinks.length) {
          try {
            const { data: linked } = await supabase.from("logbook").select("*").in("inspection_id", inspectionIdsForLinks);
            for (const r of linked || []) map.set(r.id, r);
          } catch {
            // Older schemas may not have inspection_id on logbook. Ignore safely.
          }
        }
        logbookData = Array.from(map.values());
      }

      if (isPremium && includeNfc) {
        let q = supabase.from("hives").select("id, name, apiary_id, nfc_uid, archived_at").not("nfc_uid", "is", null);
        if (!includeArchived) q = q.is("archived_at", null);
        if (hiveId) q = q.eq("id", hiveId);
        else if (apiaryId) q = q.eq("apiary_id", apiaryId);
        const { data, error } = await q;
        if (error) throw error;
        nfcData = data || [];
      }

      const refIds = new Set([
        ...todosData.map((r) => r.inspection_id).filter(Boolean),
        ...logbookData.map((r) => r.inspection_id).filter(Boolean),
      ]);
      if (refIds.size) {
        const { data } = await supabase
          .from("inspections")
          .select("id, apiary_id, hive_id, date")
          .in("id", Array.from(refIds));
        setInspectionById(new Map((data || []).map((r) => [r.id, r])));
      } else {
        setInspectionById(new Map());
      }

      setInspections(inspectionsData);
      setTodos(todosData);
      setLogbook(logbookData);
      setNfcHives(nfcData);
      setHasGeneratedReport(true);
      setActiveTab((current) => current || "summary");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasGeneratedReport) return;
    if (didAutoRunSavedReportRef.current) return;
    if (!apiaries.length && !hives.length) return;

    didAutoRunSavedReportRef.current = true;
    runQuery();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiaries.length, hives.length, hasGeneratedReport]);

  const intelligence = useMemo(() => analyzeInspectionSet(inspections), [inspections]);

  const getInspectionAnalysis = (inspection) => {
    if (!inspection) return analyzeInspection({});
    return intelligence.analysesById.get(inspection.id) || analyzeInspection(inspection);
  };

  const inspectionInsights = useMemo(() => {
    return inspections.flatMap((insp) => {
      const analysis = intelligence.analysesById.get(insp.id) || analyzeInspection(insp);
      return analysis.insights.map((insight) => ({ ...insight, inspection: insp, analysis }));
    });
  }, [inspections, intelligence]);

  const groupedInspectionInsights = useMemo(() => {
    return inspections
      .map((insp) => {
        const analysis = intelligence.analysesById.get(insp.id) || analyzeInspection(insp);
        return {
          inspection: insp,
          analysis,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          changesSincePrevious: analysis.changesSincePrevious || [],
        };
      })
      .filter((group) => group.insights.length > 0);
  }, [inspections, intelligence]);

  const summary = useMemo(() => {
    const openTasks = todos.filter((t) => !["complete", "completed"].includes(String(t.status || "").toLowerCase())).length;
    const completedTasks = todos.length - openTasks;
    const diseaseCount = inspections.filter((x) => x.signs_disease).length;
    const pestCount = inspections.filter((x) => x.signs_pests).length;
    const varroaCount = inspections.filter((x) => x.varroa_seen).length;
    const photoCount = inspections.reduce((sum, x) => sum + (Array.isArray(x.photos) ? x.photos.length : 0), 0);
    const fullInspections = inspections.filter((x) => (x.inspection_type || "full_inspection") === "full_inspection").length;
    const strongColony = inspectionInsights.filter((x) => x.title === "Strong colony").length;
    const queenLikely = inspectionInsights.filter((x) => ["Queen confirmed", "Queen seen", "Queen likely present"].includes(x.title)).length;
    const highAlerts = inspectionInsights.filter((x) => [INSIGHT_LEVELS.WARNING, INSIGHT_LEVELS.CRITICAL, "high"].includes(x.level)).length;

    return {
      openTasks,
      completedTasks,
      diseaseCount,
      pestCount,
      varroaCount,
      photoCount,
      fullInspections,
      strongColony,
      queenLikely,
      highAlerts,
      averageHealthScore: intelligence.averageHealthScore,
      averageHealthBand: intelligence.averageHealthBand?.label || "—",
    };
  }, [todos, inspections, inspectionInsights, intelligence]);

  const latestInspection = inspections[0] || null;
  const generatedAt = dayjs().format("DD/MM/YYYY HH:mm");
  const totalRecords = inspections.length + todos.length + logbook.length + nfcHives.length;

  const galleryItemsForInspection = (inspection) =>
    (Array.isArray(inspection?.photos) ? inspection.photos : [])
      .filter(Boolean)
      .map((url, index) => ({
        url,
        index,
        inspection,
        title: `${fmtUK(inspection.date)} — ${displayHive(inspection.hive_id, inspection.apiary_id)}`,
        caption: inspection.notes || "",
      }));

  const openInspectionGallery = (inspection, startIndex = 0) => {
    const items = galleryItemsForInspection(inspection);
    if (!items.length) return;
    setGallery({ items, index: startIndex });
  };

  const buildInspectionShareText = (inspection) => {
    const analysis = getInspectionAnalysis(inspection);
    const header = [
      `Date: ${fmtUK(inspection.date)}`,
      `Hive: ${displayHive(inspection.hive_id, inspection.apiary_id)}`,
      `Type: ${inspectionTypeLabel(inspection.inspection_type)}`,
      "",
    ].join("\n");

    return `${header}${buildShareableInspectionSummary(inspection, analysis)}`;
  };

  const copyTextFallback = async (text, copiedMessage, promptLabel) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert(copiedMessage);
        return;
      }
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }

    window.prompt(promptLabel, text);
  };

  const shareInspection = async (inspection) => {
    const text = buildInspectionShareText(inspection);
    const title = `HiveTag inspection ${fmtUK(inspection.date)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Share failed", err);
    }

    await copyTextFallback(
      text,
      "Inspection summary copied. You can now paste it into WhatsApp, email or a message.",
      "Copy this inspection summary:"
    );
  };

  const shareCurrentPhoto = async () => {
    if (!gallery?.items?.length) return;
    const item = gallery.items[gallery.index];
    const text = `${item.title}\n${item.url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text, url: item.url });
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Photo share failed", err);
    }

    await copyTextFallback(
      text,
      "Photo link copied. You can now paste it into WhatsApp, email or a message.",
      "Copy this photo link:"
    );
  };

  const downloadCurrentPhoto = async () => {
    if (!gallery?.items?.length) return;

    const item = gallery.items[gallery.index];
    const filename = `hivetag-inspection-photo-${fmtUK(item.inspection.date).replaceAll("/", "-")}-${item.index + 1}.jpg`;

    try {
      const response = await fetch(item.url, { mode: "cors" });
      if (!response.ok) throw new Error("Photo download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Photo download failed", err);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.url);
        alert("The photo could not be downloaded directly, so the image link has been copied instead.");
      } else {
        window.prompt("Copy this photo link:", item.url);
      }
    }
  };

  const esc = (v) => {
    if (v == null) return "";
    const s = String(Array.isArray(v) ? v.join("; ") : v);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const downloadCSV = (filename, rows, headers) => {
    const headerLine = headers.map(esc).join(",");
    const body = rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");
    const blob = new Blob([headerLine + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ukStamp = () => dayjs().format("DDMMYYYY-HHmm");

  const inspectionRows = inspections.map((x) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(x);
    return {
      date: fmtUK(x.date),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      inspection_type: inspectionTypeLabel(x.inspection_type),
      weather: formatWeatherForDisplay(x.weather),
      weather_observed: x.weather_observed || "",
      colony_behavior: valueWithOther(x.colony_behavior, x.colony_behavior_other),
      environmental_signs: valueWithOther(x.environmental_signs, x.environmental_signs_other),
      hive_population: x.hive_population || "",
      frames_of_bees: x.frames_of_bees || "",
      brood_pattern: x.brood_pattern || "",
      brood_box_congestion: x.brood_box_congestion || "",
      food_stores: x.food_stores || "",
      queen_cells: x.queen_cells || "",
      queen_status: valueWithOther(x.queen_status, x.queen_status_other),
      varroa_seen: boolYesNo(x.varroa_seen),
      signs_disease: boolYesNo(x.signs_disease),
      disease_types: valueWithOther(x.disease_types, x.disease_other),
      signs_pests: boolYesNo(x.signs_pests),
      pest_types: valueWithOther(x.pest_types, x.pest_other),
      notes: x.notes || "",
      photos: Array.isArray(x.photos) ? x.photos.length : 0,
      health_score: getInspectionAnalysis(x).healthScore,
      health_band: getInspectionAnalysis(x).healthBand?.label || "",
      insights: getInspectionAnalysis(x).insights.map((i) => i.title).join("; "),
      recommendations: getInspectionAnalysis(x).recommendations.join("; "),
      archived: x.archived_at ? "Yes" : "No",
    };
  });

  const downloadInspectionsCSV = () => {
    const headers = [
      "date",
      "apiary",
      "hive",
      "inspection_type",
      "weather",
      "weather_observed",
      "colony_behavior",
      "environmental_signs",
      "hive_population",
      "frames_of_bees",
      "brood_pattern",
      "brood_box_congestion",
      "food_stores",
      "queen_cells",
      "queen_status",
      "varroa_seen",
      "signs_disease",
      "disease_types",
      "signs_pests",
      "pest_types",
      "notes",
      "photos",
      "health_score",
      "health_band",
      "insights",
      "recommendations",
      "archived",
    ];
    downloadCSV(`inspections-${ukStamp()}.csv`, inspectionRows, headers);
  };

  const downloadCombinedCSV = () => {
    const headers = ["type", "date", "apiary", "hive", "title", "summary", "related_inspection", "status", "archived"];
    const rows = [];

    inspectionRows.forEach((r) =>
      rows.push({
        type: "Inspection",
        date: r.date,
        apiary: r.apiary,
        hive: r.hive,
        title: r.inspection_type,
        summary: [r.insights, r.notes].filter(Boolean).join(" | "),
        related_inspection: "",
        status: "",
        archived: r.archived,
      })
    );

    todos.forEach((t) => {
      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(t);
      rows.push({
        type: "Task",
        date: fmtUK(t.due_date || t.created_at),
        apiary: apiaryName.get(resolvedApiaryId) || "",
        hive: displayHive(resolvedHiveId, resolvedApiaryId),
        title: t.title || "",
        summary: t.notes || "",
        related_inspection: relatedInspectionLabel(t),
        status: t.status || "",
        archived: t.archived_at ? "Yes" : "No",
      });
    });

    logbook.forEach((l) => {
      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(l);
      rows.push({
        type: "Logbook",
        date: fmtUK(l.date || l.created_at),
        apiary: apiaryName.get(resolvedApiaryId) || "",
        hive: displayHive(resolvedHiveId, resolvedApiaryId),
        title: l.log_type || l.title || "Log entry",
        summary: l.entry || l.notes || "",
        related_inspection: relatedInspectionLabel(l),
        status: "",
        archived: l.archived_at ? "Yes" : "No",
      });
    });

    nfcHives.forEach((h) =>
      rows.push({
        type: "NFC tag",
        date: "",
        apiary: apiaryName.get(h.apiary_id) || "",
        hive: h.name || "Unnamed Hive",
        title: "NFC tag",
        summary: h.nfc_uid || "",
        related_inspection: "",
        status: "",
        archived: h.archived_at ? "Yes" : "No",
      })
    );

    downloadCSV(`hivetag-report-${ukStamp()}.csv`, rows, headers);
  };

  const downloadTodosCSV = () => {
    const headers = ["due_date", "apiary", "hive", "title", "notes", "related_inspection", "status", "archived"];
    const rows = todos.map((t) => {
      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(t);
      return {
        due_date: fmtUK(t.due_date || t.created_at),
        apiary: apiaryName.get(resolvedApiaryId) || "",
        hive: displayHive(resolvedHiveId, resolvedApiaryId),
        title: t.title || "",
        notes: t.notes || "",
        related_inspection: relatedInspectionLabel(t),
        status: t.status || "",
        archived: t.archived_at ? "Yes" : "No",
      };
    });
    downloadCSV(`tasks-${ukStamp()}.csv`, rows, headers);
  };

  const downloadLogbookCSV = () => {
    const headers = ["date", "apiary", "hive", "title", "text", "related_inspection", "archived"];
    const rows = logbook.map((l) => {
      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(l);
      return {
        date: fmtUK(l.date || l.created_at),
        apiary: apiaryName.get(resolvedApiaryId) || "",
        hive: displayHive(resolvedHiveId, resolvedApiaryId),
        title: l.log_type || l.title || "",
        text: l.entry || l.notes || "",
        related_inspection: relatedInspectionLabel(l),
        archived: l.archived_at ? "Yes" : "No",
      };
    });
    downloadCSV(`logbook-${ukStamp()}.csv`, rows, headers);
  };

  const downloadNfcCSV = () => {
    if (!isPremium) return;
    const headers = ["apiary", "hive", "nfc_uid", "archived"];
    const rows = nfcHives.map((h) => ({
      apiary: apiaryName.get(h.apiary_id) || "",
      hive: h.name || "Unnamed Hive",
      nfc_uid: h.nfc_uid || "",
      archived: h.archived_at ? "Yes" : "No",
    }));
    downloadCSV(`nfc-tags-${ukStamp()}.csv`, rows, headers);
  };

  const handlePrint = () => window.print();

  const tabButton = (id, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full text-sm font-semibold border ${
        activeTab === id
          ? "bg-green-800 text-white border-green-800"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  const SummaryCard = ({ label, value, note }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm print-summary-card">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
    </div>
  );

  return (
    <div className="print-report-shell max-w-7xl mx-auto">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .photo-modal { display: none !important; }
          .print-report-shell { max-width: none !important; margin: 0 !important; }
          .print-card { box-shadow: none !important; border: 1px solid #d9d9d9 !important; break-inside: avoid; }
          .page-break { page-break-before: always; }
          .print-brand-bar { background: #14532d !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-summary-card { break-inside: avoid; }
          .print-photo { max-height: 120px !important; object-fit: cover; }
          details { break-inside: avoid; }
          summary::-webkit-details-marker { display: none; }
          table { break-inside: auto; }
          tr { break-inside: avoid; break-after: auto; }
        }
      `}</style>

      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard#print" className="text-sm font-medium text-blue-700 hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadCombinedCSV} className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-black" disabled={loading || totalRecords === 0}>
            CSV: Combined
          </button>
          <button onClick={handlePrint} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800" disabled={loading || totalRecords === 0}>
            Create Professional PDF
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-yellow-50 p-6 shadow-sm print-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-800">HiveTag Premium</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">Beekeeping Reports Centre</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-700">
              Build professional hive records with summaries, inspection timelines, colony insights, task evidence, logbook notes and photos.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 text-sm text-gray-700 shadow-sm">
            <p><strong>Scope:</strong> {reportScope}</p>
            <p><strong>Range:</strong> {fmtUK(fromDate)} – {fmtUK(toDate)}</p>
            <p><strong>Generated:</strong> {generatedAt}</p>
          </div>
        </div>
      </div>

      <div className="no-print mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Apiary</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={apiaryId}
              onChange={(e) => {
                setApiaryId(e.target.value);
                setHiveId("");
              }}
            >
              <option value="">All apiaries</option>
              {apiaries.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hive</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2" value={hiveId} onChange={(e) => setHiveId(e.target.value)}>
              <option value="">All hives</option>
              {hivesForApiary.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
            <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
            <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} /> Include archived</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeInspections} onChange={(e) => setIncludeInspections(e.target.checked)} /> Inspections</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeTodos} onChange={(e) => setIncludeTodos(e.target.checked)} /> Tasks</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeLogbook} onChange={(e) => setIncludeLogbook(e.target.checked)} /> Logbook</label>
          {isPremium && <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeNfc} onChange={(e) => setIncludeNfc(e.target.checked)} /> NFC tags</label>}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={runQuery} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800" disabled={loading}>
            {loading ? "Loading…" : "Generate Report"}
          </button>
          <button onClick={downloadInspectionsCSV} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200" disabled={loading || !inspections.length}>CSV: Inspections</button>
          <button onClick={downloadTodosCSV} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200" disabled={loading || !todos.length}>CSV: Tasks</button>
          <button onClick={downloadLogbookCSV} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200" disabled={loading || !logbook.length}>CSV: Logbook</button>
          {isPremium && <button onClick={downloadNfcCSV} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200" disabled={loading || !nfcHives.length || !includeNfc}>CSV: NFC tags</button>}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {totalRecords === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Generate a report to view summaries, insights and printable records.
        </div>
      ) : (
        <>
          <div className="no-print mt-6 flex flex-wrap gap-2">
            {tabButton("summary", "Executive Summary")}
            {tabButton("insights", "Colony Insights")}
            {tabButton("timeline", "Inspection Timeline")}
            {tabButton("details", "Detailed Records")}
            {tabButton("photos", "Photos")}
            {tabButton("tasks", "Tasks & Logbook")}
          </div>

          <div className="mt-6 space-y-6">
            {(activeTab === "summary" || false) && (
              <section className="space-y-6 print:block">
                <div className="print-brand-bar rounded-3xl bg-green-900 p-6 text-white print-card">
                  <p className="text-sm uppercase tracking-wide text-green-100">Professional Beekeeping Report</p>
                  <h2 className="mt-1 text-3xl font-bold">{reportScope}</h2>
                  <p className="mt-2 text-green-50">{fmtUK(fromDate)} – {fmtUK(toDate)} • Generated {generatedAt}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryCard label="Inspections" value={inspections.length} note={`${summary.fullInspections} full inspections`} />
                  <SummaryCard label="Average health score" value={summary.averageHealthScore || "—"} note={summary.averageHealthBand} />
                  <SummaryCard label="Strong colony signals" value={summary.strongColony} note="From inspection evidence" />
                  <SummaryCard label="Queen likely / OK" value={summary.queenLikely} note="Eggs or queen recorded" />
                  <SummaryCard label="Disease concerns" value={summary.diseaseCount} note="Recorded in inspections" />
                  <SummaryCard label="Pest concerns" value={summary.pestCount} note={`${summary.varroaCount} varroa sightings`} />
                  <SummaryCard label="Open tasks" value={summary.openTasks} note={`${summary.completedTasks} completed`} />
                  <SummaryCard label="Photos" value={summary.photoCount} note="Inspection photo evidence" />
                </div>

                {latestInspection && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                    <h3 className="text-lg font-bold text-gray-900">Latest inspection snapshot</h3>
                    <p className="mt-1 text-sm font-semibold text-green-800">Health score: {getInspectionAnalysis(latestInspection).healthScore}/100 — {getInspectionAnalysis(latestInspection).healthBand?.label}</p>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <p><strong>Date:</strong> {fmtUK(latestInspection.date)}</p>
                      <p><strong>Hive:</strong> {displayHive(latestInspection.hive_id, latestInspection.apiary_id)}</p>
                      <p><strong>Type:</strong> {inspectionTypeLabel(latestInspection.inspection_type)}</p>
                      <p><strong>Population:</strong> {valueOrDash(latestInspection.hive_population)}</p>
                      <p><strong>Brood:</strong> {valueOrDash(latestInspection.brood_pattern)}</p>
                      <p><strong>Stores:</strong> {valueOrDash(latestInspection.food_stores)}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === "insights" && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                <h2 className="text-xl font-bold text-gray-900">Colony Insights</h2>
                <p className="mt-1 text-sm text-gray-600">
                  These are grouped by inspection date so the beekeeper can review one visit at a time. They support beekeeper judgement; they do not diagnose disease or replace an inspection.
                </p>

                {groupedInspectionInsights.length === 0 ? (
                  <p className="mt-4 text-gray-500">No insights found for this report period.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {groupedInspectionInsights.map(({ inspection, analysis, insights, recommendations, changesSincePrevious }) => {
                      const highestLevel = insights.some((i) => i.level === INSIGHT_LEVELS.CRITICAL)
                        ? INSIGHT_LEVELS.CRITICAL
                        : insights.some((i) => i.level === INSIGHT_LEVELS.WARNING)
                          ? INSIGHT_LEVELS.WARNING
                          : insights.some((i) => i.level === INSIGHT_LEVELS.WATCH)
                            ? INSIGHT_LEVELS.WATCH
                            : insights.some((i) => i.level === INSIGHT_LEVELS.INFO)
                              ? INSIGHT_LEVELS.INFO
                              : INSIGHT_LEVELS.GOOD;

                      return (
                        <article key={inspection.id} className={`rounded-2xl border p-4 ${insightClasses(highestLevel)}`}>
                          <div className="flex flex-col gap-2 border-b border-current/10 pb-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-lg font-bold">
                                {fmtUK(inspection.date)} — {displayHive(inspection.hive_id, inspection.apiary_id)}
                              </h3>
                              <p className="mt-1 text-sm">
                                {inspectionTypeLabel(inspection.inspection_type || "full_inspection")} · Health score {analysis.healthScore}/100 ({analysis.healthBand?.label}) · {valueOrDash(inspection.hive_population)} colony · Queen: {valueWithOther(inspection.queen_status, inspection.queen_status_other)}
                              </p>
                            </div>
                            <span className="w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase">
                              {insights.length} insight{insights.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {insights.map((item) => (
                              <span key={item.title} className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold">
                                {insightDot(item.level)} {item.title}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                            {insights.map((item) => (
                              <div key={`${inspection.id}-${item.title}`} className="rounded-xl bg-white/60 p-3 text-sm">
                                <p className="font-bold">{item.title}</p>
                                <p className="mt-1">{item.summary || "Based on the inspection record."}</p>
                                {item.reasons?.length > 0 && (
                                  <ul className="mt-2 list-disc pl-5">
                                    {item.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>

                          {changesSincePrevious.length > 0 && (
                            <div className="mt-4 rounded-xl bg-white/60 p-3 text-sm">
                              <p className="font-bold">What changed since the previous inspection</p>
                              <ul className="mt-2 list-disc pl-5">
                                {changesSincePrevious.map((change) => (
                                  <li key={`${inspection.id}-${change.title}`}>
                                    <strong>{change.title}:</strong> {change.summary}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {recommendations.length > 0 && (
                            <div className="mt-4 rounded-xl bg-white/70 p-3 text-sm">
                              <p className="font-bold">Recommended actions</p>
                              <ul className="mt-2 list-disc pl-5">
                                {recommendations.map((item) => <li key={`${inspection.id}-${item}`}>{item}</li>)}
                              </ul>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "timeline" && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                <h2 className="text-xl font-bold text-gray-900">Inspection Timeline</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-600">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Hive</th>
                        <th className="py-2 pr-3">Type</th>
                        <th className="py-2 pr-3">Health</th>
                        <th className="py-2 pr-3">Queen</th>
                        <th className="py-2 pr-3">Brood</th>
                        <th className="py-2 pr-3">Stores</th>
                        <th className="py-2 pr-3">Issues / Insights</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspections.map((x) => {
                        const analysis = getInspectionAnalysis(x);
                        const insights = analysis.insights;
                        return (
                          <tr key={x.id} className="border-b align-top">
                            <td className="py-3 pr-3 whitespace-nowrap font-medium">{fmtUK(x.date)}</td>
                            <td className="py-3 pr-3">{displayHive(x.hive_id, x.apiary_id)}</td>
                            <td className="py-3 pr-3">{inspectionTypeLabel(x.inspection_type)}</td>
                            <td className="py-3 pr-3">{analysis.healthScore}/100<br /><span className="text-xs text-gray-500">{analysis.healthBand?.label}</span></td>
                            <td className="py-3 pr-3">{valueWithOther(x.queen_status, x.queen_status_other)}</td>
                            <td className="py-3 pr-3">{valueOrDash(x.brood_pattern)}</td>
                            <td className="py-3 pr-3">{valueOrDash(x.food_stores)}</td>
                            <td className="py-3 pr-3">
                              <div className="flex flex-wrap gap-1">
                                {insights.length ? insights.map((i) => (
                                  <span key={i.title} className={`rounded-full border px-2 py-1 text-xs ${insightClasses(i.level)}`}>{i.title}</span>
                                )) : <span className="text-gray-400">No issues recorded</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === "details" && (
              <section className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                  <h2 className="text-xl font-bold text-gray-900">Detailed Inspection Records</h2>
                  <p className="mt-1 text-sm text-gray-600">Each inspection is collapsed on screen to avoid endless scrolling. Use the PDF button to print the full report.</p>
                </div>

                {inspections.map((x) => {
                  const analysis = getInspectionAnalysis(x);
                  const insights = analysis.insights;
                  return (
                    <details key={x.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card" open={inspections.length <= 3}>
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{fmtUK(x.date)} — {displayHive(x.hive_id, x.apiary_id)}</h3>
                            <p className="text-sm text-gray-600">{inspectionTypeLabel(x.inspection_type)} • Health score {analysis.healthScore}/100 ({analysis.healthBand?.label}) • {formatWeatherForDisplay(x.weather) || "Weather not recorded"}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {insights.slice(0, 3).map((i) => <span key={i.title} className={`rounded-full border px-2 py-1 text-xs ${insightClasses(i.level)}`}>{i.title}</span>)}
                          </div>
                        </div>
                      </summary>

                      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Field label="Weather derived" value={formatWeatherForDisplay(x.weather)} />
                        <Field label="Weather observed" value={x.weather_observed} />
                        <Field label="Colony behaviour" value={valueWithOther(x.colony_behavior, x.colony_behavior_other)} />
                        <Field label="Environmental signs" value={valueWithOther(x.environmental_signs, x.environmental_signs_other)} />
                        <Field label="Hive population" value={x.hive_population} />
                        <Field label="Frames of bees" value={x.frames_of_bees} />
                        <Field label="Brood pattern" value={x.brood_pattern} />
                        <Field label="Brood box congestion" value={x.brood_box_congestion} />
                        <Field label="Food stores" value={x.food_stores} />
                        <Field label="Queen cells" value={x.queen_cells} />
                        <Field label="Queen status" value={valueWithOther(x.queen_status, x.queen_status_other)} />
                        <Field label="Varroa seen" value={boolYesNo(x.varroa_seen)} />
                        <Field label="Disease" value={x.signs_disease ? valueWithOther(x.disease_types, x.disease_other) : "No"} />
                        <Field label="Pests" value={x.signs_pests ? valueWithOther(x.pest_types, x.pest_other) : "No"} />
                      </div>

                      {x.notes && (
                        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                          <p className="font-semibold text-gray-900">Notes</p>
                          <p className="mt-1 whitespace-pre-wrap">{x.notes}</p>
                        </div>
                      )}

                      <div className="no-print mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        <button
                          type="button"
                          onClick={() => shareInspection(x)}
                          className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                        >
                          Share Inspection
                        </button>
                        {galleryItemsForInspection(x).length > 0 && (
                          <button
                            type="button"
                            onClick={() => openInspectionGallery(x)}
                            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                          >
                            View Full Gallery ({galleryItemsForInspection(x).length})
                          </button>
                        )}
                      </div>

                      {galleryItemsForInspection(x).length > 0 && (
                        <div className="mt-4">
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {galleryItemsForInspection(x).slice(0, 3).map((item) => (
                              <img
                                key={item.url}
                                src={item.url}
                                alt={`Inspection ${fmtUK(x.date)} photo ${item.index + 1}`}
                                className="print-photo h-32 w-full rounded-xl object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </details>
                  );
                })}
              </section>
            )}

            {activeTab === "photos" && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                <h2 className="text-xl font-bold text-gray-900">Photo Timeline</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Photos stay as clean thumbnails in the report. Use the gallery link to open a larger viewer with download and share controls.
                </p>

                {inspections.filter((x) => galleryItemsForInspection(x).length > 0).length === 0 ? (
                  <p className="mt-4 text-gray-500">No photos found in this report period.</p>
                ) : (
                  <div className="mt-4 space-y-6">
                    {inspections
                      .filter((x) => galleryItemsForInspection(x).length > 0)
                      .map((x) => {
                        const items = galleryItemsForInspection(x);
                        return (
                          <article key={x.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {fmtUK(x.date)} — {displayHive(x.hive_id, x.apiary_id)}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {items.length} photo{items.length === 1 ? "" : "s"} attached to this inspection
                                </p>
                              </div>
                              <div className="no-print flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => openInspectionGallery(x)}
                                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-green-800 ring-1 ring-green-200 hover:bg-green-50"
                                >
                                  🔍 View full gallery
                                </button>
                                <button
                                  type="button"
                                  onClick={() => shareInspection(x)}
                                  className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                                >
                                  Share inspection summary
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                              {items.slice(0, 4).map((item) => (
                                <figure key={item.url} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                  <img
                                    src={item.url}
                                    alt={`Inspection ${fmtUK(x.date)} photo ${item.index + 1}`}
                                    className="print-photo h-40 w-full object-cover"
                                  />
                                  <figcaption className="px-3 py-2 text-xs text-gray-600">Photo {item.index + 1}</figcaption>
                                </figure>
                              ))}
                            </div>
                          </article>
                        );
                      })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "tasks" && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                  <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                  {todos.length === 0 ? <p className="mt-3 text-gray-500">No matching tasks.</p> : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead><tr className="border-b text-left"><th className="py-2 pr-3">Due</th><th className="py-2 pr-3">Hive</th><th className="py-2 pr-3">Task</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Related inspection</th></tr></thead>
                        <tbody>{todos.map((t) => { const ids = effectiveIds(t); return <tr key={t.id} className="border-b align-top"><td className="py-2 pr-3 whitespace-nowrap">{fmtUK(t.due_date || t.created_at)}</td><td className="py-2 pr-3">{displayHive(ids.resolvedHiveId, ids.resolvedApiaryId)}</td><td className="py-2 pr-3"><strong>{t.title}</strong><br /><span className="text-gray-600">{t.notes}</span></td><td className="py-2 pr-3">{t.status || "—"}</td><td className="py-2 pr-3">{relatedInspectionLabel(t)}</td></tr>; })}</tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                  <h2 className="text-xl font-bold text-gray-900">Logbook</h2>
                  {logbook.length === 0 ? <p className="mt-3 text-gray-500">No matching log entries.</p> : (
                    <div className="mt-4 space-y-3">
                      {logbook.map((l) => { const ids = effectiveIds(l); return <div key={l.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="font-semibold text-gray-900">{fmtUK(l.date || l.created_at)} — {displayHive(ids.resolvedHiveId, ids.resolvedApiaryId)}</p><p className="text-sm text-gray-600">{l.log_type || l.title || "Log entry"}</p><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{l.entry || l.notes || ""}</p>{relatedInspectionLabel(l) && <p className="mt-2 text-xs text-gray-500">Related: {relatedInspectionLabel(l)}</p>}</div>; })}
                    </div>
                  )}
                </div>

                {isPremium && includeNfc && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
                    <h2 className="text-xl font-bold text-gray-900">NFC Tags</h2>
                    {nfcHives.length === 0 ? <p className="mt-3 text-gray-500">No matching NFC tags.</p> : (
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {nfcHives.map((h) => <div key={h.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="font-semibold">{h.name}</p><p className="text-sm text-gray-600">{apiaryName.get(h.apiary_id)}</p><code className="mt-2 block rounded bg-white p-2 text-xs break-all">{h.nfc_uid}</code></div>)}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        </>
      )}

      {gallery && (
        <PhotoGalleryModal
          gallery={gallery}
          setGallery={setGallery}
          onDownload={downloadCurrentPhoto}
          onShare={shareCurrentPhoto}
        />
      )}
    </div>
  );
}

function PhotoGalleryModal({ gallery, setGallery, onDownload, onShare }) {
  const item = gallery.items[gallery.index];
  const total = gallery.items.length;

  const goTo = (nextIndex) => {
    const wrapped = (nextIndex + total) % total;
    setGallery({ ...gallery, index: wrapped });
  };

  return (
    <div className="photo-modal fixed inset-0 z-[9999] bg-black/90 p-4 text-white" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-sm text-white/70">{gallery.index + 1} of {total}</p>
            <h2 className="text-lg font-bold">{item.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onDownload} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20">
              Download
            </button>
            <button type="button" onClick={onShare} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20">
              Share
            </button>
            <button type="button" onClick={() => setGallery(null)} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100">
              Close
            </button>
          </div>
        </div>

        <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center">
          {total > 1 && (
            <button
              type="button"
              onClick={() => goTo(gallery.index - 1)}
              className="absolute left-0 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl font-bold hover:bg-white/20"
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img
            src={item.url}
            alt={`${item.title} photo ${item.index + 1}`}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />

          {total > 1 && (
            <button
              type="button"
              onClick={() => goTo(gallery.index + 1)}
              className="absolute right-0 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl font-bold hover:bg-white/20"
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>

        {item.caption && (
          <div className="mt-4 max-h-28 overflow-auto rounded-xl bg-white/10 p-3 text-sm text-white/90">
            <p className="font-semibold">Inspection notes</p>
            <p className="mt-1 whitespace-pre-wrap">{item.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-900">{valueOrDash(value)}</p>
    </div>
  );
}
