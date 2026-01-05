// src/pages/Logbook/LogEntryList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

const PAGE_SIZE = 9;

const LogEntryList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- highlight/query params (normalize type to UPPERCASE)
  const {
    highlightId,
    highlightType,
    apiaryFromUrl,
    hiveFromUrl,
    inspectionIdFromUrl,
    fromFromUrl,
    toFromUrl,
    returnPageFromUrl,
  } = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const rawType = params.get("type");

    // return_page = page we were on in InspectionList when we clicked "View logs"
    // (we preserve it so "View Inspection" can jump back to that page)
    const rp = params.get("return_page") || "";

    return {
      highlightId: params.get("highlight") || null,
      highlightType: (rawType || "").toUpperCase() || null, // "LOGBOOK"
      apiaryFromUrl: params.get("apiary_id") || "", // "" means all
      hiveFromUrl: params.get("hive_id") || "", // "" means all
      inspectionIdFromUrl: params.get("inspection_id") || "", // "" means no inspection filter
      fromFromUrl: params.get("from") || "",
      toFromUrl: params.get("to") || "",
      returnPageFromUrl: rp, // keep as string, validate when used
    };
  }, [location.search]);

  // Avoid loops when auto-jumping to highlight page
  const jumpedToHighlightPageRef = useRef(false);

  const [entries, setEntries] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);

  const [selectedApiary, setSelectedApiary] = useState(apiaryFromUrl); // from URL
  const [selectedHive, setSelectedHive] = useState(hiveFromUrl); // from URL

  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [page, setPage] = useState(1);

  // date range filters (YYYY-MM-DD)
  const [dateFrom, setDateFrom] = useState(fromFromUrl);
  const [dateTo, setDateTo] = useState(toFromUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // keep a tiny bit of context about the inspection (date) if we can fetch it fast
  const [inspectionMeta, setInspectionMeta] = useState(null); // { id, date } | null

  // --- Lightbox (single image only)
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    url: "",
  });

  const openLightbox = (url) => {
    if (!url) return;
    setLightbox({ isOpen: true, url });
  };
  const closeLightbox = () => setLightbox({ isOpen: false, url: "" });

  // Esc to close + body scroll lock
  useEffect(() => {
    if (!lightbox.isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox.isOpen]);

  // Keep selected filters in sync if URL changes elsewhere
  useEffect(() => {
    setSelectedApiary(apiaryFromUrl);
    setSelectedHive(hiveFromUrl);
    setDateFrom(fromFromUrl);
    setDateTo(toFromUrl);
    jumpedToHighlightPageRef.current = false;
    setPage(1);
  }, [apiaryFromUrl, hiveFromUrl, fromFromUrl, toFromUrl]);

  // Push filters to URL whenever they change (preserve highlight/type/inspection_id/return_page)
  useEffect(() => {
    const incoming = new URLSearchParams(location.search || "");
    const params = new URLSearchParams();

    if (selectedApiary) params.set("apiary_id", selectedApiary);
    if (selectedHive) params.set("hive_id", selectedHive);

    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    // Preserve context params (keep exactly what's already there)
    if (incoming.get("highlight")) params.set("highlight", incoming.get("highlight"));
    if (incoming.get("type")) params.set("type", incoming.get("type"));
    if (incoming.get("inspection_id"))
      params.set("inspection_id", incoming.get("inspection_id"));

    // ✅ CRITICAL: preserve return_page so InspectionList can jump back correctly
    if (incoming.get("return_page"))
      params.set("return_page", incoming.get("return_page"));

    const next = params.toString();
    const curr = (location.search || "").replace(/^\?/, "");
    if (next !== curr) {
      navigate({ search: next }, { replace: true });
    }
  }, [selectedApiary, selectedHive, dateFrom, dateTo, location.search, navigate]);

  // If an inspection filter is present, fetch a tiny bit of meta for the banner
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!inspectionIdFromUrl) {
        setInspectionMeta(null);
        return;
      }
      const { data } = await supabase
        .from("inspections")
        .select("id, date")
        .eq("id", inspectionIdFromUrl)
        .single();
      if (!ignore) setInspectionMeta(data || null);
    })();
    return () => {
      ignore = true;
    };
  }, [inspectionIdFromUrl]);

  // fetch active options + active entries
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");

      // Base query for ACTIVE log entries
      let entriesQuery = supabase
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
          all_hives,
          archived_at,
          created_at,
          inspection:inspection_id ( id, date )
        `
        )
        .is("archived_at", null)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      // PRIORITY: If inspection filter is present, use it (and ignore apiary/hive to avoid conflicts)
      if (inspectionIdFromUrl) {
        entriesQuery = entriesQuery.eq("inspection_id", inspectionIdFromUrl);
      } else {
        if (selectedApiary) entriesQuery = entriesQuery.eq("apiary_id", selectedApiary);
        if (selectedHive) entriesQuery = entriesQuery.eq("hive_id", selectedHive);
      }

      // Date range filters (logbook.date is DATE)
      if (dateFrom) entriesQuery = entriesQuery.gte("date", dateFrom);
      if (dateTo) entriesQuery = entriesQuery.lte("date", dateTo);

      const [
        { data: entriesData, error: entriesErr },
        { data: apiaryData, error: apiaryErr },
        { data: hiveData, error: hiveErr },
      ] = await Promise.all([
        entriesQuery,
        supabase
          .from("apiaries")
          .select("id, name")
          .is("archived_at", null)
          .order("name", { ascending: true }),
        supabase
          .from("hives")
          .select("id, name, apiary_id")
          .is("archived_at", null)
          .order("name", { ascending: true }),
      ]);

      if (entriesErr) setError(entriesErr.message || "Failed to load logbook entries.");
      if (apiaryErr) setError((prev) => prev || apiaryErr.message || "Failed to load apiaries.");
      if (hiveErr) setError((prev) => prev || hiveErr.message || "Failed to load hives.");

      setEntries(entriesData || []);
      setApiaries(apiaryData || []);
      setHives(hiveData || []);
      setPage(1);
      setLoading(false);
      jumpedToHighlightPageRef.current = false;
    };

    fetchAll();
  }, [selectedApiary, selectedHive, inspectionIdFromUrl, dateFrom, dateTo]);

  const apiaryNameById = useMemo(() => {
    const m = new Map();
    for (const a of apiaries) m.set(a.id, a.name);
    return m;
  }, [apiaries]);

  const hiveNameById = useMemo(() => {
    const m = new Map();
    for (const h of hives) m.set(h.id, h.name);
    return m;
  }, [hives]);

  // hive dropdown options: if apiary chosen, only show those hives
  const hivesForSelectedApiary = useMemo(() => {
    if (!selectedApiary) return hives;
    return hives.filter((h) => String(h.apiary_id) === String(selectedApiary));
  }, [hives, selectedApiary]);

  // Client-side filter (defensive; server already filters when selected)
  const filtered = useMemo(() => {
    if (inspectionIdFromUrl) return entries; // already scoped to inspection
    let out = entries;
    if (selectedApiary) out = out.filter((e) => e.apiary_id === selectedApiary);
    if (selectedHive) out = out.filter((e) => e.hive_id === selectedHive);
    return out;
  }, [entries, selectedApiary, selectedHive, inspectionIdFromUrl]);

  // If a highlight is present, auto-jump to the correct page (once)
  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "LOGBOOK")) return;
    if (jumpedToHighlightPageRef.current) return;
    if (!filtered.length) return;

    const idx = filtered.findIndex((e) => String(e.id) === String(highlightId));
    if (idx >= 0) {
      const targetPage = Math.floor(idx / PAGE_SIZE) + 1;
      if (targetPage !== page) setPage(targetPage);
      jumpedToHighlightPageRef.current = true;
    }
  }, [filtered, highlightId, highlightType, page]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  // After pageItems render, scroll highlighted card into view and pulse it
  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "LOGBOOK")) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`log-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-amber-400", "bg-amber-50");
        setTimeout(() => el.classList.remove("ring-2", "ring-amber-400"), 1600);
      }
    }, 80);
    return () => clearTimeout(t);
  }, [pageItems, highlightId, highlightType]);

  const formatUKDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Helpers for banner actions
  const clearInspectionFilter = () => {
    const params = new URLSearchParams(location.search || "");
    params.delete("inspection_id");
    navigate({ search: params.toString() || "" }, { replace: true });
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const clearHive = () => {
    setSelectedHive("");
    setPage(1);
  };

  // If apiary changes, clear hive if it no longer belongs
  useEffect(() => {
    if (!selectedHive) return;
    if (!selectedApiary) return;
    const hv = hives.find((h) => String(h.id) === String(selectedHive));
    if (hv && String(hv.apiary_id) !== String(selectedApiary)) {
      setSelectedHive("");
    }
  }, [selectedApiary, selectedHive, hives]);

  // ✅ Build "View Inspection" link and include the ORIGINAL InspectionList page (return_page)
  const buildInspectionListLink = (inspectionId) => {
    const params = new URLSearchParams();

    // If we are NOT in inspection-scoped mode, preserve current list filters
    if (!inspectionIdFromUrl) {
      if (selectedApiary) params.set("apiary_id", selectedApiary);
      if (selectedHive) params.set("hive_id", selectedHive);
    }

    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    // ✅ jump back to the same page the user was on in InspectionList
    const rpNum = Number(returnPageFromUrl || "");
    if (Number.isFinite(rpNum) && rpNum >= 1) {
      params.set("page", String(Math.floor(rpNum)));
    }

    params.set("highlight", inspectionId);
    params.set("type", "INSPECTION");

    return `/inspections?${params.toString()}`;
  };

  if (loading) return <div className="p-4">Loading logbook…</div>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-3">Logbook Entries</h2>

        {/* Controls wrapper (LEFT aligned now) */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:flex-wrap sm:items-end sm:justify-start">
          {/* Filter by apiary */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Filter by Apiary:
            </label>
            <select
              value={selectedApiary}
              onChange={(e) => {
                setSelectedApiary(e.target.value);
                setSelectedHive(""); // reset hive when apiary changes
                setPage(1);
              }}
              disabled={!!inspectionIdFromUrl}
              className={`border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-auto ${
                inspectionIdFromUrl
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">All Apiaries</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Hive */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Filter by Hive:
            </label>

            <div className="flex items-center gap-2">
              <select
                value={selectedHive}
                onChange={(e) => {
                  setSelectedHive(e.target.value);
                  setPage(1);
                }}
                disabled={!!inspectionIdFromUrl || hivesForSelectedApiary.length === 0}
                className={`border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-[220px] ${
                  inspectionIdFromUrl
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : ""
                }`}
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

              {selectedHive && !inspectionIdFromUrl && (
                <button
                  type="button"
                  onClick={clearHive}
                  className="text-sm px-3 py-2 border rounded hover:bg-gray-100 whitespace-nowrap flex-shrink-0"
                >
                  Clear hive
                </button>
              )}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Date from:</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-auto"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Date to:</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-auto"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

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

          {/* View toggle */}
          <div className="flex border border-gray-300 rounded overflow-hidden self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm ${
                viewMode === "list" ? "bg-green-700 text-white" : "bg-white"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm ${
                viewMode === "grid" ? "bg-green-700 text-white" : "bg-white"
              }`}
            >
              Grid
            </button>
          </div>

          {/* Add new */}
          <Link
            to="/logbook/new"
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded self-start sm:self-auto"
          >
            New Log Entry
          </Link>
        </div>
      </div>

      {/* Filter banner when inspection_id is active */}
{inspectionIdFromUrl && (
  <div className="mb-4 p-3 rounded border bg-blue-50 border-blue-200 text-blue-900 flex flex-wrap items-center gap-3">
    <span className="text-sm">
      {inspectionMeta?.date ? (
        <>
          Showing logbook entries for the inspection on{" "}
          <strong>{formatUKDate(inspectionMeta.date)}</strong>.
        </>
      ) : (
        <>Showing logbook entries linked to this inspection.</>
      )}
    </span>

    <button
      type="button"
      onClick={clearInspectionFilter}
      className="text-sm underline text-blue-800 hover:text-blue-900"
    >
      Clear inspection filter
    </button>

    <Link
      to={`/inspections/${inspectionIdFromUrl}/edit`}
      className="text-sm underline text-blue-800 hover:text-blue-900"
    >
      Edit this inspection
    </Link>
  </div>
)}

      {/* Error */}
      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm mb-3">
          {error}
        </div>
      )}

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="space-y-2">
          <p>
            No logbook entries found.{" "}
            <Link
              to="/logbook/new"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Add one now
            </Link>
          </p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="divide-y divide-gray-200 bg-white rounded shadow">
              {pageItems.map((e) => {
                const apiaryName = e.apiary_id ? apiaryNameById.get(e.apiary_id) : null;
                const hiveName = e.hive_id ? hiveNameById.get(e.hive_id) : null;
                const inspDate = e.inspection?.date ? formatUKDate(e.inspection.date) : null;

                const isHighlighted =
                  highlightId &&
                  String(e.id) === String(highlightId) &&
                  (!highlightType || highlightType === "LOGBOOK");

                return (
                  <div
                    key={e.id}
                    id={`log-${e.id}`}
                    data-highlight={isHighlighted ? "true" : "false"}
                    className={["p-4", isHighlighted ? "bg-amber-50" : ""].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{e.log_type}</h3>
                          {e.all_hives && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              All hives in apiary
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600">
                          <span className="mr-2">Date: {formatUKDate(e.date)}</span>
                          {apiaryName && <span className="mr-2">Apiary: {apiaryName}</span>}
                          {!e.all_hives && hiveName && <span>Hive: {hiveName}</span>}
                        </p>

                        {e.entry && (
                          <p className="mt-2 text-gray-800 whitespace-pre-wrap">{e.entry}</p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                          {e.inspection_id && (
                            <Link
                              to={buildInspectionListLink(e.inspection_id)}
                              className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                            >
                              {inspDate ? `View Inspection (${inspDate})` : "View Inspection"}
                            </Link>
                          )}

                          <Link
                            to={`/logbook/${e.id}/edit`}
                            className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>

                      {e.photo_url?.trim() && (
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => openLightbox(e.photo_url.trim())}
                            className="block focus:outline-none"
                            aria-label="Open photo"
                          >
                            <img
                              src={e.photo_url}
                              alt="Log"
                              className="w-28 h-20 object-cover rounded border hover:opacity-90"
                              onError={(ev) => (ev.currentTarget.style.display = "none")}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pageItems.map((e) => {
                const apiaryName = e.apiary_id ? apiaryNameById.get(e.apiary_id) : null;
                const hiveName = e.hive_id ? hiveNameById.get(e.hive_id) : null;
                const inspDate = e.inspection?.date ? formatUKDate(e.inspection.date) : null;

                const isHighlighted =
                  highlightId &&
                  String(e.id) === String(highlightId) &&
                  (!highlightType || highlightType === "LOGBOOK");

                return (
                  <div
                    key={e.id}
                    id={`log-${e.id}`}
                    data-highlight={isHighlighted ? "true" : "false"}
                    className={[
                      "bg-white shadow rounded p-4 flex flex-col",
                      isHighlighted ? "ring-2 ring-amber-400 bg-amber-50" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      {e.photo_url?.trim() && (
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => openLightbox(e.photo_url.trim())}
                            className="block focus:outline-none"
                            aria-label="Open photo"
                          >
                            <img
                              src={e.photo_url}
                              alt="Log"
                              className="w-28 h-20 object-cover rounded border hover:opacity-90"
                              onError={(ev) => (ev.currentTarget.style.display = "none")}
                            />
                          </button>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{e.log_type}</h3>
                          {e.all_hives && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              All hives in apiary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatUKDate(e.date)}
                          {apiaryName && <> • {apiaryName}</>}
                          {!e.all_hives && hiveName && <> • {hiveName}</>}
                        </p>
                      </div>
                    </div>

                    {e.entry && (
                      <p className="mt-3 text-gray-800 whitespace-pre-wrap line-clamp-3">
                        {e.entry}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      {e.inspection_id && (
                        <Link
                          to={buildInspectionListLink(e.inspection_id)}
                          className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
                        >
                          {inspDate ? `View Inspection (${inspDate})` : "View Inspection"}
                        </Link>
                      )}

                      <Link
                        to={`/logbook/${e.id}/edit`}
                        className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {total === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, total)}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              {totalPages > 1 && (
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* LIGHTBOX (single image) via PORTAL */}
      {lightbox.isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-5xl">
              <button
                onClick={closeLightbox}
                className="absolute -top-3 -right-3 bg-white rounded-full shadow px-3 py-1 text-sm font-semibold"
                aria-label="Close"
              >
                ✕
              </button>
              <div className="bg-white rounded-lg p-3">
                <img
                  src={lightbox.url}
                  alt="Log photo"
                  className="max-h-[80vh] w-full object-contain rounded"
                />
                <div className="mt-2 text-center">
                  <a
                    href={lightbox.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Open original in new tab
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default LogEntryList;
