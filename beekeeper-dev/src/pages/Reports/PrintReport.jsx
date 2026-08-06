// src/pages/Reports/PrintReport.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { supabase } from "../../services/supabase";
import ReportHeader from "./components/ReportHeader";
import ReportFilters from "./components/ReportFilters";
import ReportStatus from "./components/ReportStatus";
import ExportCentre from "./components/ExportCentre";
import ReportTabs from "./components/ReportTabs";
import PrintCover from "./components/PrintCover";
import ReportContent from "./components/ReportContent";
import PhotoGalleryModal from "./components/PhotoGalleryModal";
import { loadReportData } from "./utils/reportQueries";
import {
  buildApiaryRows,
  buildHiveRows,
  buildInspectionRows,
  buildQueenRows,
  buildQueenAssignmentRows,
  buildQueenEventRows,
  buildQueenProcessRows,
  buildQueenSnapshotRows,
  downloadApiariesCSV as exportApiariesCSV,
  downloadHivesCSV as exportHivesCSV,
  downloadInspectionsCSV as exportInspectionsCSV,
  downloadCombinedCSV as exportCombinedCSV,
  downloadTodosCSV as exportTodosCSV,
  downloadLogbookCSV as exportLogbookCSV,
  downloadQueensCSV as exportQueensCSV,
  downloadNfcCSV as exportNfcCSV,
} from "./utils/reportExports";
import { formatDerivedWeather, getTempUnit } from "../../utils/formatDerivedWeather";
import {
  INSIGHT_LEVELS,
  analyzeInspection,
  analyzeInspectionSet,
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
  if (level === INSIGHT_LEVELS.CRITICAL || level === "high")
    return "border-red-200 bg-red-50 text-red-900";
  if (level === INSIGHT_LEVELS.WARNING || level === "medium")
    return "border-orange-200 bg-orange-50 text-orange-900";
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
  const [hasQueenData, setHasQueenData] = useState(false);
  const [checkingReportAccess, setCheckingReportAccess] = useState(true);

  const savedFiltersRef = useRef(getSavedReportFilters());
  const didAutoRunSavedReportRef = useRef(false);

  const [apiaryId, setApiaryId] = useState(() => savedFiltersRef.current.apiaryId || "");
  const [hiveId, setHiveId] = useState(() => savedFiltersRef.current.hiveId || "");
  const [fromDate, setFromDate] = useState(() => savedFiltersRef.current.fromDate || DEFAULT_FROM);
  const [toDate, setToDate] = useState(() => savedFiltersRef.current.toDate || DEFAULT_TO);
  const [includeArchived, setIncludeArchived] = useState(() =>
    boolFromSaved(savedFiltersRef.current.includeArchived, false)
  );
  const [includeInspections, setIncludeInspections] = useState(() =>
    boolFromSaved(savedFiltersRef.current.includeInspections, true)
  );
  const [includeTodos, setIncludeTodos] = useState(() =>
    boolFromSaved(savedFiltersRef.current.includeTodos, true)
  );
  const [includeLogbook, setIncludeLogbook] = useState(() =>
    boolFromSaved(savedFiltersRef.current.includeLogbook, true)
  );
  const [includeQueens, setIncludeQueens] = useState(() =>
    boolFromSaved(savedFiltersRef.current.includeQueens, true)
  );
  const [includeNfc, setIncludeNfc] = useState(() =>
    boolFromSaved(savedFiltersRef.current.includeNfc, false)
  );
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);

  const [activeTab, setActiveTab] = useState(() => savedFiltersRef.current.activeTab || "summary");
  const [gallery, setGallery] = useState(null);
  const [reportData, setReportData] = useState({
    apiaries: [],
    hives: [],
    inspections: [],
    todos: [],
    logbook: [],
    nfcHives: [],
    inspectionById: new Map(),
    queenReport: {
      queens: [],
      assignments: [],
      events: [],
      processes: [],
      snapshots: [],
      currentByHive: [],
      totalRecords: 0,
      hasData: false,
    },
  });

  const reportApiaries = reportData.apiaries;
  const reportHives = reportData.hives;
  const inspections = reportData.inspections;
  const todos = reportData.todos;
  const logbook = reportData.logbook;
  const nfcHives = reportData.nfcHives;
  const inspectionById = reportData.inspectionById;
  const queenReport = reportData.queenReport || {
    queens: [],
    assignments: [],
    events: [],
    processes: [],
    snapshots: [],
    currentByHive: [],
    totalRecords: 0,
    hasData: false,
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPremium = subscriptionLevel === "premium";
  const canUseQueenReports = isPremium || hasQueenData;
  const queenOnlyAccess = !isPremium && hasQueenData;

  const effectiveIncludeInspections = isPremium && includeInspections;
  const effectiveIncludeTodos = isPremium && includeTodos;
  const effectiveIncludeLogbook = isPremium && includeLogbook;
  const effectiveIncludeQueens = canUseQueenReports && includeQueens;
  const effectiveIncludeNfc = isPremium && includeNfc;

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
          includeQueens,
          includeNfc,
          activeTab,
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
    includeQueens,
    includeNfc,
    activeTab,
  ]);

  useEffect(() => {
    document.title = `Reports Centre — ${fmtUK(fromDate)}–${fmtUK(toDate)}`;
  }, [fromDate, toDate]);

  useEffect(() => {
    let cancelled = false;

    const loadReportAccess = async () => {
      setCheckingReportAccess(true);

      try {
        const { data: userWrap } = await supabase.auth.getUser();
        const uid = userWrap?.user?.id;

        if (!uid) {
          if (cancelled) return;

          setSubscriptionLevel("free");
          setHasQueenData(false);
          setIncludeInspections(false);
          setIncludeTodos(false);
          setIncludeLogbook(false);
          setIncludeQueens(false);
          setIncludeNfc(false);
          setActiveTab("summary");
          return;
        }

        let profile = null;

        const { data: profileById, error: profileByIdError } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("id", uid)
          .maybeSingle();

        if (!profileByIdError && profileById) {
          profile = profileById;
        }

        if (!profile) {
          const { data: profileByUserId } = await supabase
            .from("profiles")
            .select("subscription_level")
            .eq("user_id", uid)
            .maybeSingle();

          profile = profileByUserId;
        }

        const level = String(profile?.subscription_level || "free").toLowerCase();

        const queenCounts = await Promise.all([
          supabase.from("queens").select("id", { count: "exact", head: true }),
          supabase.from("queen_assignments").select("id", { count: "exact", head: true }),
          supabase.from("queen_processes").select("id", { count: "exact", head: true }),
          supabase.from("queen_events").select("id", { count: "exact", head: true }),
        ]);

        if (cancelled) return;

        const retainedQueenData = queenCounts.some(
          (result) => !result.error && Number(result.count || 0) > 0
        );

        setSubscriptionLevel(level);
        setHasQueenData(retainedQueenData);

        if (level !== "premium") {
          // Free users entering through retained Queen access must remain Queen-report-only.
          setIncludeInspections(false);
          setIncludeTodos(false);
          setIncludeLogbook(false);
          setIncludeNfc(false);
          setIncludeQueens(retainedQueenData);
          setActiveTab(retainedQueenData ? "queens" : "summary");
        }
      } catch (accessError) {
        if (!cancelled) {
          console.error("Unable to check report access:", accessError);
          setSubscriptionLevel("free");
          setHasQueenData(false);
          setIncludeInspections(false);
          setIncludeTodos(false);
          setIncludeLogbook(false);
          setIncludeQueens(false);
          setIncludeNfc(false);
          setActiveTab("summary");
        }
      } finally {
        if (!cancelled) setCheckingReportAccess(false);
      }
    };

    loadReportAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: apiaryRows }, { data: hiveRows }] = await Promise.all([
        supabase
          .from("apiaries")
          .select("id, name, archived_at")
          .order("name", { ascending: true }),
        supabase
          .from("hives")
          .select("id, name, apiary_id, nfc_uid, archived_at")
          .order("name", { ascending: true }),
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
    () =>
      new Map(hives.map((h) => [h.id, { name: h.name || "Unnamed Hive", apiary_id: h.apiary_id }])),
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
      row.apiary_id ||
      apiaryForHive(row.hive_id) ||
      i?.apiary_id ||
      apiaryForHive(i?.hive_id) ||
      "";
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
    if (checkingReportAccess) return;

    setLoading(true);
    setError("");

    try {
      const nextReportData = await loadReportData({
        supabase,
        dayjs,
        includeInspections: effectiveIncludeInspections,
        includeTodos: effectiveIncludeTodos,
        includeLogbook: effectiveIncludeLogbook,
        includeQueens: effectiveIncludeQueens,
        includeNfc: effectiveIncludeNfc,
        includeArchived,
        isPremium,
        apiaryId,
        hiveId,
        fromDate,
        toDate,
      });

      setReportData(nextReportData);
      setHasGeneratedReport(true);
      setActiveTab((current) => {
        const validTabs = [
          ...(isPremium ? ["summary"] : []),
          ...(effectiveIncludeInspections
            ? ["insights", "timeline", "details", "photos"]
            : []),
          ...(effectiveIncludeTodos || effectiveIncludeLogbook ? ["tasks"] : []),
          ...(effectiveIncludeQueens ? ["queens"] : []),
        ];

        const fallbackTab = effectiveIncludeQueens ? "queens" : "summary";
        return validTabs.includes(current) ? current : fallbackTab;
      });
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
    const openTasks = todos.filter(
      (t) => !["complete", "completed"].includes(String(t.status || "").toLowerCase())
    ).length;
    const completedTasks = todos.length - openTasks;
    const diseaseCount = inspections.filter((x) => x.signs_disease).length;
    const pestCount = inspections.filter((x) => x.signs_pests).length;
    const varroaCount = inspections.filter((x) => x.varroa_seen).length;
    const photoCount = inspections.reduce(
      (sum, x) => sum + (Array.isArray(x.photos) ? x.photos.length : 0),
      0
    );
    const fullInspections = inspections.filter(
      (x) => (x.inspection_type || "full_inspection") === "full_inspection"
    ).length;
    const strongColony = inspectionInsights.filter((x) => x.title === "Strong colony").length;
    const queenLikely = inspectionInsights.filter((x) =>
      ["Queen confirmed", "Queen seen", "Queen likely present"].includes(x.title)
    ).length;
    const highAlerts = inspectionInsights.filter((x) =>
      [INSIGHT_LEVELS.WARNING, INSIGHT_LEVELS.CRITICAL, "high"].includes(x.level)
    ).length;

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
  const totalRecords =
    reportApiaries.length +
    reportHives.length +
    inspections.length +
    todos.length +
    logbook.length +
    nfcHives.length +
    Number(queenReport.totalRecords || 0);

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
        alert(
          "The photo could not be downloaded directly, so the image link has been copied instead."
        );
      } else {
        window.prompt("Copy this photo link:", item.url);
      }
    }
  };

  const apiaryRows = useMemo(() => {
    return buildApiaryRows({
      apiaries: reportApiaries,
    });
  }, [reportApiaries]);

  const hiveRows = useMemo(() => {
    return buildHiveRows({
      hives: reportHives,
      apiaryName,
    });
  }, [reportHives, apiaryName]);

  const inspectionRows = useMemo(() => {
    return buildInspectionRows({
      inspections,
      effectiveIds,
      apiaryName,
      displayHive,
      fmtUK,
      inspectionTypeLabel,
      formatWeatherForDisplay,
      valueWithOther,
      boolYesNo,
      getInspectionAnalysis,
    });
  }, [inspections, apiaryName, inspectionById, intelligence]);

  const queenRows = useMemo(
    () => buildQueenRows({ queenReport, apiaryName, displayHive }),
    [queenReport, apiaryName, hiveMap]
  );

  const queenAssignmentRows = useMemo(
    () => buildQueenAssignmentRows({ queenReport, apiaryName, displayHive }),
    [queenReport, apiaryName, hiveMap]
  );

  const queenEventRows = useMemo(
    () => buildQueenEventRows({ queenReport, apiaryName, displayHive }),
    [queenReport, apiaryName, hiveMap]
  );

  const queenProcessRows = useMemo(
    () => buildQueenProcessRows({ queenReport, apiaryName, displayHive }),
    [queenReport, apiaryName, hiveMap]
  );

  const queenSnapshotRows = useMemo(
    () => buildQueenSnapshotRows({ queenReport, apiaryName, displayHive }),
    [queenReport, apiaryName, hiveMap]
  );

  const downloadApiariesCSV = () => {
    if (!isPremium) return;
    exportApiariesCSV({
      apiaryRows,
    });
  };

  const downloadHivesCSV = () => {
    if (!isPremium) return;
    exportHivesCSV({
      hiveRows,
    });
  };

  const downloadInspectionsCSV = () => {
    if (!isPremium) return;
    exportInspectionsCSV({ inspectionRows });
  };

  const downloadCombinedCSV = () => {
    exportCombinedCSV({
      apiaryRows: isPremium ? apiaryRows : [],
      hiveRows: isPremium ? hiveRows : [],
      inspectionRows: isPremium ? inspectionRows : [],
      todos: isPremium ? todos : [],
      logbook: isPremium ? logbook : [],
      nfcHives: isPremium ? nfcHives : [],
      queenRows,
      queenAssignmentRows,
      queenEventRows,
      queenProcessRows,
      queenSnapshotRows,
      effectiveIds,
      apiaryName,
      displayHive,
      relatedInspectionLabel,
      fmtUK,
    });
  };

  const downloadTodosCSV = () => {
    if (!isPremium) return;
    exportTodosCSV({
      todos,
      effectiveIds,
      apiaryName,
      displayHive,
      relatedInspectionLabel,
      fmtUK,
    });
  };

  const downloadLogbookCSV = () => {
    if (!isPremium) return;
    exportLogbookCSV({
      logbook,
      effectiveIds,
      apiaryName,
      displayHive,
      relatedInspectionLabel,
      fmtUK,
    });
  };

  const downloadQueensCSV = () => {
    if (!canUseQueenReports) return;
    exportQueensCSV({ queenRows });
  };

  const downloadNfcCSV = () => {
    if (!isPremium) return;

    exportNfcCSV({
      nfcHives,
      apiaryName,
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="print-report-shell max-w-7xl mx-auto">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 15mm 12mm;
          }

          html,
          body {
            background: white !important;
            color: #111827 !important;
            font-size: 10.5pt;
            line-height: 1.35;
          }

          h1,
          h2,
          h3,
          h4 {
            page-break-after: avoid;
            break-after: avoid;
            color: #111827 !important;
            margin-top: 0;
          }

          p {
            orphans: 3;
            widows: 3;
            margin: 0 0 4px 0;
          }

          .no-print,
          .photo-modal {
            display: none !important;
          }

          .print-report-shell {
            max-width: none !important;
            margin: 0 !important;
          }

          /*
           * Keep only the report cover on its own page.
           * PrintCover is the direct .print-card child of the report shell.
           */
          .print-report-shell > .print-card {
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /*
           * Report sections may now use the remaining space on a page and
           * continue naturally onto the next page instead of being moved
           * forward as one large block.
           */
          .print-card {
            background: white !important;
            padding: 14px !important;
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            margin: 0 0 5mm 0 !important;
          }

          section,
          details {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }

          /*
           * Keep smaller, self-contained records together where practical.
           * Browsers may still split an item if it is taller than one page.
           */
          article,
          figure,
          .print-summary-card,
          .print-field,
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          img {
            max-width: 100%;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /*
           * Do not force every selected report section onto a fresh page.
           * A modest gap is retained between consecutive major sections.
           */
          .print-page {
            page-break-before: auto !important;
            break-before: auto !important;
          }

          .print-page + .print-page {
            margin-top: 6mm !important;
          }

          .page-break {
            page-break-before: always;
            break-before: page;
          }

          .print-brand-bar {
            background: #14532d !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-summary-card {
            background: white !important;
          }

          .print-photo {
            display: block;
            width: 100%;
            height: 110px;
            object-fit: cover;
            border-radius: 8px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          summary {
            list-style: none;
            page-break-after: avoid;
            break-after: avoid;
          }

          summary::-webkit-details-marker {
            display: none;
          }

          .overflow-x-auto {
            overflow: visible !important;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
            break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          th,
          td {
            padding: 7px 6px;
            vertical-align: top;
            border-bottom: 1px solid #e5e7eb;
          }
        }
      `}</style>

      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard#print" className="text-sm font-medium text-blue-700 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="no-print">
        <ReportHeader
          reportScope={reportScope}
          fromDate={fromDate}
          toDate={toDate}
          generatedAt={generatedAt}
          fmtUK={fmtUK}
        />
      </div>

      <ReportFilters
        apiaries={apiaries}
        hivesForApiary={hivesForApiary}
        apiaryId={apiaryId}
        setApiaryId={setApiaryId}
        hiveId={hiveId}
        setHiveId={setHiveId}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        includeArchived={includeArchived}
        setIncludeArchived={setIncludeArchived}
        includeInspections={includeInspections}
        setIncludeInspections={setIncludeInspections}
        includeTodos={includeTodos}
        setIncludeTodos={setIncludeTodos}
        includeLogbook={includeLogbook}
        setIncludeLogbook={setIncludeLogbook}
        includeQueens={includeQueens}
        setIncludeQueens={setIncludeQueens}
        includeNfc={includeNfc}
        setIncludeNfc={setIncludeNfc}
        isPremium={isPremium}
        hasQueenData={hasQueenData}
        runQuery={runQuery}
        loading={loading || checkingReportAccess}
        error={error}
      />

      {totalRecords === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Generate a report to load printable records and enable CSV exports.
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm no-print">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Step 2</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">Review Your Report</h2>
            <p className="mt-1 text-sm text-gray-600">
              Check the generated report below before printing or exporting.
            </p>
          </div>

          <ReportStatus
            inspections={inspections}
            todos={todos}
            logbook={logbook}
            nfcHives={nfcHives}
            queenCount={queenRows.length}
            isPremium={isPremium}
            includeQueens={effectiveIncludeQueens}
            includeNfc={effectiveIncludeNfc}
            photoCount={summary.photoCount}
            generatedAt={generatedAt}
          />

          <ReportTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isPremium={isPremium}
            includeInspections={effectiveIncludeInspections}
            includeTodos={effectiveIncludeTodos}
            includeLogbook={effectiveIncludeLogbook}
            includeQueens={effectiveIncludeQueens}
          />

          <PrintCover
            reportScope={reportScope}
            fromDate={fromDate}
            toDate={toDate}
            generatedAt={generatedAt}
            fmtUK={fmtUK}
            apiaries={reportApiaries}
            hives={reportHives}
            inspections={inspections}
            todos={todos}
            logbook={logbook}
            queenCount={queenRows.length}
            isPremium={isPremium}
            queenOnlyAccess={queenOnlyAccess}
            includeQueens={effectiveIncludeQueens}
            photoCount={summary.photoCount}
          />

          <ReportContent
            activeTab={activeTab}
            reportScope={reportScope}
            fromDate={fromDate}
            toDate={toDate}
            generatedAt={generatedAt}
            fmtUK={fmtUK}
            inspections={inspections}
            todos={todos}
            logbook={logbook}
            queenReport={queenReport}
            nfcHives={nfcHives}
            isPremium={isPremium}
            includeInspections={effectiveIncludeInspections}
            includeTodos={effectiveIncludeTodos}
            includeLogbook={effectiveIncludeLogbook}
            includeQueens={effectiveIncludeQueens}
            includeNfc={effectiveIncludeNfc}
            apiaryName={apiaryName}
            summary={summary}
            latestInspection={latestInspection}
            groupedInspectionInsights={groupedInspectionInsights}
            getInspectionAnalysis={getInspectionAnalysis}
            displayHive={displayHive}
            inspectionTypeLabel={inspectionTypeLabel}
            formatWeatherForDisplay={formatWeatherForDisplay}
            valueWithOther={valueWithOther}
            valueOrDash={valueOrDash}
            boolYesNo={boolYesNo}
            insightClasses={insightClasses}
            insightDot={insightDot}
            galleryItemsForInspection={galleryItemsForInspection}
            openInspectionGallery={openInspectionGallery}
            shareInspection={shareInspection}
            effectiveIds={effectiveIds}
            relatedInspectionLabel={relatedInspectionLabel}
          />

          <ExportCentre
            apiaries={reportApiaries}
            hives={reportHives}
            loading={loading || checkingReportAccess}
            totalRecords={totalRecords}
            inspections={inspections}
            todos={todos}
            logbook={logbook}
            nfcHives={nfcHives}
            queenRows={queenRows}
            isPremium={isPremium}
            includeQueens={effectiveIncludeQueens}
            includeNfc={effectiveIncludeNfc}
            downloadApiariesCSV={downloadApiariesCSV}
            downloadHivesCSV={downloadHivesCSV}
            downloadInspectionsCSV={downloadInspectionsCSV}
            downloadTodosCSV={downloadTodosCSV}
            downloadLogbookCSV={downloadLogbookCSV}
            downloadQueensCSV={downloadQueensCSV}
            downloadNfcCSV={downloadNfcCSV}
            downloadCombinedCSV={downloadCombinedCSV}
            handlePrint={handlePrint}
          />
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
