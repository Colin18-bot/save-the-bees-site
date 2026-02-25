// src/pages/Inspections/InspectionList.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  formatDerivedWeather,
  getTempUnit,
} from "../../utils/formatDerivedWeather";

const PAGE_SIZE = 9;

const clampInt = (v, fallback = 1) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i >= 1 ? i : fallback;
};

const InspectionList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);

  const [selectedApiary, setSelectedApiary] = useState("");
  const [selectedHive, setSelectedHive] = useState("");

  // Date range filters (YYYY-MM-DD)
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // IMPORTANT: page is driven from URL now
  const [, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // related logbook map { [inspection_id]: { count, recent: Log[] } }
  const [logMap, setLogMap] = useState({});

  // Lightbox state
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    urls: [],
    index: 0,
  });

  const closeLightbox = useCallback(() => {
  setLightbox((s) => ({ ...s, isOpen: false, urls: [], index: 0 }));
}, []);

const showPrev = useCallback(() => {
  setLightbox((s) => {
    if (!s.urls?.length) return s;
    return { ...s, index: (s.index + s.urls.length - 1) % s.urls.length };
  });
}, []);

const showNext = useCallback(() => {
  setLightbox((s) => {
    if (!s.urls?.length) return s;
    return { ...s, index: (s.index + 1) % s.urls.length };
  });
}, []);

  // Track whether we've already auto-scrolled to the highlighted card
  const hasScrolledRef = useRef(false);

  // prevent highlight-page alignment running repeatedly for same URL state
  const alignedKeyRef = useRef("");

  // Read query params (including page)
  const {
    highlightId,
    highlightType,
    nfcUid,
    apiaryFromUrl,
    hiveFromUrl,
    fromFromUrl,
    toFromUrl,
    pageFromUrl,
  } = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const rawType = params.get("type");
    return {
      highlightId: params.get("highlight") || null,
      highlightType: (rawType || "").toUpperCase() || null,
      nfcUid: params.get("nfc_uid") || null,

      apiaryFromUrl: params.get("apiary_id") || "",
      hiveFromUrl: params.get("hive_id") || "",
      fromFromUrl: params.get("from") || "",
      toFromUrl: params.get("to") || "",
      pageFromUrl: clampInt(params.get("page") || "1", 1),
    };
  }, [location.search]);

  // Esc / Arrow keys (lightbox)
  useEffect(() => {
    if (!lightbox.isOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox.isOpen, closeLightbox, showPrev, showNext]);

  // Load lookup options (ACTIVE only)
  useEffect(() => {
    const loadLookups = async () => {
      const [{ data: apiaryData }, { data: hiveData }] = await Promise.all([
        supabase
          .from("apiaries")
          .select("id, name")
          .is("archived_at", null)
          .order("name", { ascending: true }),
        supabase
          .from("hives")
          .select("id, name, apiary_id, nfc_uid")
          .is("archived_at", null)
          .order("name", { ascending: true }),
      ]);
      setApiaries(apiaryData || []);
      setHives(hiveData || []);
    };
    loadLookups();
  }, []);

  // Sync local filter state + page state FROM URL
  useEffect(() => {
    setSelectedApiary(apiaryFromUrl);
    setSelectedHive(hiveFromUrl);
    setDateFrom(fromFromUrl);
    setDateTo(toFromUrl);

    // page is always from URL
    setPage(pageFromUrl);

    // allow re-scroll when navigation happens
    hasScrolledRef.current = false;
  }, [apiaryFromUrl, hiveFromUrl, fromFromUrl, toFromUrl, pageFromUrl]);

  // Helper: write params back to URL (single place)
  const setSearchParams = useCallback(
  (updates) => {
    const incoming = new URLSearchParams(location.search || "");
    const params = new URLSearchParams();

    // keep filters
    const apiary_id = updates.apiary_id ?? incoming.get("apiary_id") ?? "";
    const hive_id = updates.hive_id ?? incoming.get("hive_id") ?? "";
    const from = updates.from ?? incoming.get("from") ?? "";
    const to = updates.to ?? incoming.get("to") ?? "";

    if (apiary_id) params.set("apiary_id", apiary_id);
    if (hive_id) params.set("hive_id", hive_id);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    // page
    const pageNext = updates.page ?? incoming.get("page") ?? "1";
    const pInt = clampInt(pageNext, 1);
    params.set("page", String(pInt));

    // preserve context
    if (incoming.get("highlight")) params.set("highlight", incoming.get("highlight"));
    if (incoming.get("type")) params.set("type", incoming.get("type"));
    if (incoming.get("nfc_uid")) params.set("nfc_uid", incoming.get("nfc_uid"));

    const next = params.toString();
    const curr = (location.search || "").replace(/^\?/, "");
    if (next !== curr) navigate({ search: next }, { replace: true });
  },
  [location.search, navigate]
);

  // ✅ If highlight is present: compute the correct page deterministically
  // Approach: fetch ordered IDs under current filters, find index, set URL page.
  useEffect(() => {
    if (!highlightId) return;
    if (highlightType && highlightType !== "INSPECTION") return;

    const key = `${highlightId}|${apiaryFromUrl}|${hiveFromUrl}|${fromFromUrl}|${toFromUrl}|size:${PAGE_SIZE}`;
    if (alignedKeyRef.current === key) return;
    alignedKeyRef.current = key;

    let cancelled = false;

    (async () => {
      try {
        // build the same filter set as list
        let q = supabase
          .from("inspections")
          .select("id")
          .is("archived_at", null)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
          .order("id", { ascending: false });

        if (hiveFromUrl) q = q.eq("hive_id", hiveFromUrl);
        else if (apiaryFromUrl) q = q.eq("apiary_id", apiaryFromUrl);

        if (fromFromUrl) q = q.gte("date", fromFromUrl);
        if (toFromUrl) q = q.lte("date", toFromUrl);

        const { data, error } = await q;
        if (cancelled) return;
        if (error) {
          console.warn("Highlight page-align: failed to fetch ids", error);
          return;
        }

        const ids = (data || []).map((x) => String(x.id));
        const idx = ids.findIndex((id) => id === String(highlightId));
        if (idx < 0) return;

        const targetPage = Math.floor(idx / PAGE_SIZE) + 1;

        // if URL page isn't the target, update it
        if (targetPage !== pageFromUrl) {
          setSearchParams({ page: targetPage });
        }
      } catch (e) {
        if (!cancelled) console.warn("Highlight page-align threw:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
    // IMPORTANT: use URL-derived vars only
  }, [
    highlightId,
    highlightType,
    apiaryFromUrl,
    hiveFromUrl,
    fromFromUrl,
    toFromUrl,
    pageFromUrl,
    setSearchParams,
  ]);

  // Fetch inspections with pagination (ACTIVE ONLY) — now uses pageFromUrl as truth
  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);

      // COUNT
      let countQuery = supabase
        .from("inspections")
        .select("id", { count: "exact", head: true })
        .is("archived_at", null);

      if (hiveFromUrl) countQuery = countQuery.eq("hive_id", hiveFromUrl);
      else if (apiaryFromUrl) countQuery = countQuery.eq("apiary_id", apiaryFromUrl);

      if (fromFromUrl) countQuery = countQuery.gte("date", fromFromUrl);
      if (toFromUrl) countQuery = countQuery.lte("date", toFromUrl);

      const { count } = await countQuery;
      const totalCount = count || 0;
      setTotal(totalCount);

      // Clamp page
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      const safePage = Math.min(pageFromUrl, totalPages);

      // if clamped differs, write it to URL
      if (safePage !== pageFromUrl) {
        setSearchParams({ page: safePage });
        setLoading(false);
        return;
      }

      const from = (safePage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // DATA
      let dataQuery = supabase
        .from("inspections")
        .select(
          "id, apiary_id, hive_id, date, created_at, weather, weather_observed, weather_code, colony_behavior, colony_behavior_other, environmental_signs, environmental_signs_other, hive_population, brood_pattern, food_stores, queen_status, queen_status_other, signs_disease, disease_types, disease_other, signs_pests, pest_types, pest_other, notes, photos"
        )
        .is("archived_at", null)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      if (hiveFromUrl) dataQuery = dataQuery.eq("hive_id", hiveFromUrl);
      else if (apiaryFromUrl) dataQuery = dataQuery.eq("apiary_id", apiaryFromUrl);

      if (fromFromUrl) dataQuery = dataQuery.gte("date", fromFromUrl);
      if (toFromUrl) dataQuery = dataQuery.lte("date", toFromUrl);

      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;
      if (!error) {
        setInspections(data || []);

        // Batch fetch related logbook entries for these inspections
        const ids = (data || []).map((x) => x.id);
        if (ids.length > 0) {
          const { data: logs } = await supabase
            .from("logbook")
            .select("id, inspection_id, date, log_type, entry, archived_at")
            .is("archived_at", null)
            .in("inspection_id", ids)
            .order("date", { ascending: false });

          const m = {};
          (logs || []).forEach((l) => {
            if (!l.inspection_id) return;
            if (!m[l.inspection_id]) m[l.inspection_id] = { count: 0, recent: [] };
            m[l.inspection_id].count += 1;
            if (m[l.inspection_id].recent.length < 2) m[l.inspection_id].recent.push(l);
          });
          setLogMap(m);
        } else {
          setLogMap({});
        }
      } else {
        console.warn("fetchInspections error:", error);
      }

      setLoading(false);
    };

    fetchInspections();
  }, [
    apiaryFromUrl,
    hiveFromUrl,
    fromFromUrl,
    toFromUrl,
    pageFromUrl,
    setSearchParams,
    location.key,
  ]);

  // Lookup helpers
  const apiaryName = useMemo(() => {
    const map = new Map(apiaries.map((a) => [String(a.id), a.name]));
    return (id) => map.get(String(id)) || "Unknown Apiary";
  }, [apiaries]);

  const hiveName = useMemo(() => {
    const map = new Map(hives.map((h) => [String(h.id), h.name]));
    return (id) => map.get(String(id)) || "Unknown Hive";
  }, [hives]);

  const selectedHiveHasNfc = useMemo(() => {
    if (!hiveFromUrl) return false;
    const hv = hives.find((h) => String(h.id) === String(hiveFromUrl));
    return !!hv?.nfc_uid;
  }, [hives, hiveFromUrl]);

  const safeParseDerivedWeather = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s.startsWith("{")) return null;

  try {
    const obj = JSON.parse(s);
    if (!obj || typeof obj !== "object") return null;

    const desc = typeof obj.desc === "string" ? obj.desc : "";
    const temp_c =
      Number.isFinite(Number(obj.temp_c)) ? Number(obj.temp_c) : null;

    if (!desc && temp_c === null) return null;

    return { desc, temp_c };
  } catch {
    return null;
  }
};

  const formatDate = (primary, fallback) => {
    const value = primary || fallback;
    if (!value) return "";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);
    return dt.toLocaleDateString("en-GB");
  };

  const hivesForSelectedApiary = useMemo(() => {
    if (!selectedApiary) return hives;
    return hives.filter((h) => String(h.apiary_id) === String(selectedApiary));
  }, [hives, selectedApiary]);

  // ✅ Build logbook link that includes return_page
  const buildLogbookLink = (inspectionId, highlightLogId) => {
    const params = new URLSearchParams();

    params.set("inspection_id", inspectionId);

    // preserve current InspectionList filters from URL (not state)
    if (apiaryFromUrl) params.set("apiary_id", apiaryFromUrl);
    if (hiveFromUrl) params.set("hive_id", hiveFromUrl);
    if (fromFromUrl) params.set("from", fromFromUrl);
    if (toFromUrl) params.set("to", toFromUrl);

    // ✅ CRITICAL
    params.set("return_page", String(pageFromUrl));

    if (highlightLogId) {
      params.set("highlight", highlightLogId);
      params.set("type", "LOGBOOK");
    }

    return `/logbook?${params.toString()}`;
  };

  // Auto-scroll to highlighted card once (after data is loaded)
  useEffect(() => {
    if (loading) return;
    if (!highlightId || (highlightType && highlightType !== "INSPECTION")) return;
    if (hasScrolledRef.current) return;

    const el = document.getElementById(`insp-${highlightId}`);
    if (el) {
      hasScrolledRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-amber-400");
      setTimeout(() => el.classList.remove("ring-4", "ring-amber-400"), 1500);
    }
  }, [loading, highlightId, highlightType, inspections]);

  const buildSummary = (insp) => {
    const out = [];
    const pushIf = (label, value) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        if (value.length) out.push({ label, value: value.join(", ") });
        return;
      }
      const trimmed = typeof value === "string" ? value.trim() : value;
      if (trimmed !== "" && trimmed !== false) out.push({ label, value: trimmed });
    };
          // Derived weather formatting (JSON-aware)
      const parsedWeather = safeParseDerivedWeather(insp.weather);
      if (parsedWeather) {
        const unit = getTempUnit();
        pushIf(
          "Weather (derived)",
          formatDerivedWeather(parsedWeather, unit)
        );
      } else {
        pushIf("Weather (derived)", insp.weather);
    }
    pushIf("Weather (observed)", insp.weather_observed);
    pushIf(
      "Colony",
      insp.colony_behavior === "Other"
        ? insp.colony_behavior_other || "Other"
        : insp.colony_behavior
    );
    pushIf("Env. signs", insp.environmental_signs);
    if (insp.environmental_signs?.includes("Other"))
      pushIf("Env. other", insp.environmental_signs_other);
    pushIf("Population", insp.hive_population);
    pushIf("Brood", insp.brood_pattern);
    pushIf("Stores", insp.food_stores);
    pushIf("Queen", insp.queen_status);
    if (insp.queen_status?.includes("Other"))
      pushIf("Queen other", insp.queen_status_other);
    if (insp.signs_pests) {
      pushIf("Pests", insp.pest_types);
      pushIf("Pest other", insp.pest_other);
    }
    pushIf("Notes", insp.notes);
    return out;
  };

  const getDiseaseInfo = (insp) => {
    const types = Array.isArray(insp?.disease_types) ? insp.disease_types : [];
    const other = (insp?.disease_other || "").trim();
    const hasAFB = types.includes("AFB");
    const hasEFB = types.includes("EFB");
    const hasVarroa = types.includes("Varroa");
    const notifiable = hasAFB || hasEFB;
    const label = [...types, ...(other ? [other] : [])].join(", ") || "—";
    return { label, notifiable, hasVarroa };
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const clearDates = () => {
    setSearchParams({ from: "", to: "", page: 1 });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <h1 className="text-2xl font-bold">Your Inspection Records</h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            to="/inspections/new"
            className="inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
          >
            Start new inspection
          </Link>

          <Link
            to="/inspections/step-by-step"
            className="inline-flex items-center justify-center text-sm px-3 py-2 border rounded hover:bg-gray-100"
            title="View the step-by-step inspection guide"
          >
            Step-by-step inspection guide
          </Link>
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          {/* Apiary */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Filter by Apiary:
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-[220px]"
              value={selectedApiary}
              onChange={(e) => {
                const nextApiary = e.target.value;
                // write to URL + reset page
                setSearchParams({ apiary_id: nextApiary, hive_id: "", page: 1 });
              }}
            >
              <option value="">All Apiaries</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hive */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Filter by Hive:
            </label>
            <div className="flex items-center gap-2">
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-[220px]"
                value={selectedHive}
                onChange={(e) => {
                  const nextHive = e.target.value;
                  // keep apiary in sync (if hive selected)
                  if (!nextHive) {
                    setSearchParams({ hive_id: "", page: 1 });
                    return;
                  }
                  const hv = hives.find((h) => String(h.id) === String(nextHive));
                  const nextApiary = hv?.apiary_id || apiaryFromUrl || "";
                  setSearchParams({
                    hive_id: nextHive,
                    apiary_id: nextApiary,
                    page: 1,
                  });
                }}
                disabled={hivesForSelectedApiary.length === 0}
              >
                <option value="">
                  All Hives{selectedApiary ? " in Apiary" : ""}
                </option>
                {hivesForSelectedApiary.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              {selectedHive && (
                <button
                  type="button"
                  onClick={() => setSearchParams({ hive_id: "", page: 1 })}
                  className="text-sm px-3 py-2 border rounded hover:bg-gray-100 whitespace-nowrap flex-shrink-0"
                >
                  Clear Hive
                </button>
              )}
            </div>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Date from:
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-[170px]"
              value={dateFrom}
              onChange={(e) => setSearchParams({ from: e.target.value, page: 1 })}
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Date to:
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-[170px]"
              value={dateTo}
              onChange={(e) => setSearchParams({ to: e.target.value, page: 1 })}
            />
          </div>

          {/* Clear dates */}
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={clearDates}
              className="text-sm px-3 py-2 border rounded hover:bg-gray-100 w-full sm:w-auto"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* NFC context banner */}
      {hiveFromUrl && selectedHiveHasNfc && nfcUid && (
        <div className="mb-4 p-3 border rounded bg-green-50 text-green-900 text-sm">
          <p className="font-semibold">
           NFC tag recognised for hive &quot;{hiveName(hiveFromUrl)}&quot;.
          </p>
          <p className="mt-1">
            You&apos;re viewing this hive&apos;s inspection history. Tap this hive&apos;s NFC
            tag again to start a new inspection, or use the button below.
          </p>
          <div className="mt-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/inspections/new?hive_id=${encodeURIComponent(hiveFromUrl)}${
                    nfcUid ? `&nfc_uid=${encodeURIComponent(nfcUid)}` : ""
                  }`
                )
              }
              className="inline-flex items-center bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm px-3 py-1.5 rounded"
            >
              Start new inspection
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : total === 0 ? (
        <p>
          No inspections found,{" "}
          <Link to="/inspections/new" className="text-blue-600 underline">
            Add one now
          </Link>
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {inspections.map((insp) => {
              const summary = buildSummary(insp);
              const photos = Array.isArray(insp.photos) ? insp.photos : [];
              const diseaseInfo = insp.signs_disease ? getDiseaseInfo(insp) : null;

              const isHighlighted =
                highlightId &&
                String(insp.id) === String(highlightId) &&
                (!highlightType || highlightType === "INSPECTION");

              const logs = logMap[insp.id] || { count: 0, recent: [] };

              const hiveForCard = hives.find((h) => String(h.id) === String(insp.hive_id));
              const showNfcHeaderPill =
                hiveForCard &&
                hiveForCard.nfc_uid &&
                hiveFromUrl &&
                String(hiveFromUrl) === String(insp.hive_id);

              return (
                <div
                  key={insp.id}
                  id={`insp-${insp.id}`}
                  data-highlight={isHighlighted ? "true" : "false"}
                  className={[
                    "border rounded shadow-sm p-4 flex flex-col transition",
                    isHighlighted ? "ring-2 ring-amber-400 bg-amber-50" : "bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{hiveName(insp.hive_id)}</h2>
                      {showNfcHeaderPill && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          NFC tag
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {formatDate(insp.date, insp.created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{apiaryName(insp.apiary_id)}</p>

                  <div className="mb-2 flex items-center gap-3">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${
                        logs.count > 0
                          ? "bg-gray-100 text-gray-800 border-gray-200"
                          : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}
                      title={`${logs.count} linked logbook entr${logs.count === 1 ? "y" : "ies"}`}
                    >
                      {logs.count} log{logs.count === 1 ? "" : "s"}
                    </span>

                    {logs.count > 0 && (
                      <Link
                        to={buildLogbookLink(insp.id, logs.recent[0]?.id)}
                        className="text-blue-600 hover:underline text-sm"
                        aria-label="View related logbook entries"
                      >
                        View logs →
                      </Link>
                    )}
                  </div>

                  {hiveForCard?.nfc_uid && (
                    <div className="mb-2">
                      <span
                        className="inline-flex items-center gap-2 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 max-w-full"
                        title={`NFC tag: ${hiveForCard.nfc_uid}`}
                      >
                        <span className="font-semibold uppercase tracking-wide">NFC tag</span>
                        <span className="font-mono truncate max-w-[170px]">
                          {hiveForCard.nfc_uid}
                        </span>
                      </span>
                    </div>
                  )}

                  {logs.recent.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {logs.recent.map((l) => (
                        <li key={l.id} className="text-xs text-gray-600">
                          <span className="font-medium">{l.log_type}</span>{" "}
                          {l.date ? `• ${formatDate(l.date)}` : ""} —{" "}
                          {l.entry ? l.entry.slice(0, 80) : ""}
                          {l.entry && l.entry.length > 80 ? "…" : ""}
                        </li>
                      ))}
                    </ul>
                  )}

                  <ul className="text-sm space-y-1 mb-3 mt-2">
                    {summary.map((row, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{row.label}: </span>
                        {row.value}
                      </li>
                    ))}

                    {insp.signs_disease && (
                      <li>
                        <span className="font-medium">Disease: </span>
                        <span
                          className={[
                            "inline-block px-1.5 py-0.5 rounded border",
                            diseaseInfo?.notifiable
                              ? "bg-red-50 border-red-200 text-red-800"
                              : diseaseInfo?.hasVarroa
                              ? "bg-amber-50 border-amber-200 text-amber-900"
                              : "bg-gray-50 border-gray-200 text-gray-800",
                          ].join(" ")}
                        >
                          {diseaseInfo?.label}
                        </span>
                      </li>
                    )}
                  </ul>

                  {insp.signs_disease && diseaseInfo?.notifiable && (
                    <div className="mb-3 p-2 text-sm rounded border bg-red-50 border-red-200 text-red-800">
                      ⚠️ Notifiable disease suspected (AFB/EFB). Report to the relevant authority.
                    </div>
                  )}

                  {insp.signs_disease && !diseaseInfo?.notifiable && diseaseInfo?.hasVarroa && (
                    <div className="mb-3 p-2 text-sm rounded border bg-amber-50 border-amber-200 text-amber-900">
                      Varroa present — reporting required per national rules.
                    </div>
                  )}

                  {photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {photos.slice(0, 3).map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightbox({ isOpen: true, urls: photos, index: i })}
                          className="focus:outline-none"
                          aria-label={`Open photo ${i + 1} of ${photos.length}`}
                        >
                          <img
                            src={url}
                            alt={`Inspection photo ${i + 1}`}
                            className="w-20 h-20 object-cover rounded border hover:opacity-90"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => navigate(`/inspections/${insp.id}/edit`)}
                      className="inline-block bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
                    >
                      Edit Inspection
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {Math.min((pageFromUrl - 1) * PAGE_SIZE + 1, total)}–{" "}
              {Math.min(pageFromUrl * PAGE_SIZE, total)} of {total}
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              {totalPages > 1 && (
                <span className="text-xs text-gray-500">
                  Page {pageFromUrl} of {totalPages}
                </span>
              )}

              <button
                type="button"
                onClick={() => setSearchParams({ page: Math.max(1, pageFromUrl - 1) })}
                disabled={pageFromUrl === 1}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setSearchParams({ page: Math.min(totalPages, pageFromUrl + 1) })}
                disabled={pageFromUrl === totalPages}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-5xl w-full">
            <button
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 bg-white rounded-full shadow px-3 py-1 text-sm font-semibold z-40"
              aria-label="Close"
            >
              ✕
            </button>

            {lightbox.urls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous image"
                  className="absolute inset-y-0 left-0 w-1/3 z-30 flex items-center justify-center"
                >
                  <span className="bg-white/90 hover:bg-white rounded-full shadow px-4 py-3 select-none">
                    ‹
                  </span>
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute inset-y-0 right-0 w-1/3 z-30 flex items-center justify-center"
                >
                  <span className="bg-white/90 hover:bg-white rounded-full shadow px-4 py-3 select-none">
                    ›
                  </span>
                </button>
              </>
            )}

            <div className="relative z-20 bg-white rounded-lg p-3">
              <img
                src={lightbox.urls[lightbox.index]}
                alt={`Inspection photo ${lightbox.index + 1}`}
                className="max-h-[80vh] w-full object-contain rounded"
              />
              {lightbox.urls.length > 1 && (
                <div className="mt-2 text-center text-sm text-gray-600">
                  {lightbox.index + 1} / {lightbox.urls.length}
                </div>
              )}
              <div className="mt-2 text-center">
                <a
                  href={lightbox.urls[lightbox.index]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Open original in new tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionList;
