// src/pages/Apiaries/ApiaryList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../services/supabase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocodeMany } from "../../utils/geocode";

const PAGE_SIZE = 3;

const ApiaryList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [apiaries, setApiaries] = useState([]);
  const [filteredApiaries, setFilteredApiaries] = useState([]);
  const [hiveCounts, setHiveCounts] = useState({});
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedApiary, setSelectedApiary] = useState("all");
  const [page, setPage] = useState(1);

  // --- highlight params
  const { highlightId, highlightType } = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return {
      highlightId: params.get("highlight") || null,
      highlightType: params.get("type") || null,
    };
  }, [location.search]);

  const jumpedToHighlightPageRef = useRef(false);

  // --- Lightbox state (portal-rendered)
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    urls: [],
    index: 0,
  });
  const closeLightbox = () =>
    setLightbox((s) => ({ ...s, isOpen: false, urls: [], index: 0 }));
  const showPrev = () =>
    setLightbox((s) => ({
      ...s,
      index: (s.index + s.urls.length - 1) % s.urls.length,
    }));
  const showNext = () =>
    setLightbox((s) => ({ ...s, index: (s.index + 1) % s.urls.length }));

  useEffect(() => {
    if (!lightbox.isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox.isOpen]);

  // Helpers
  const hasValidCoords = (lat, lon) => {
    const la = Number(lat);
    const lo = Number(lon);
    return Number.isFinite(la) && Number.isFinite(lo) && !(la === 0 && lo === 0);
  };

  // Read filter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const preselectedApiary = params.get("apiary_id");
    setSelectedApiary(preselectedApiary || "all");
    setPage(1);
    jumpedToHighlightPageRef.current = false;
  }, [location.search]);

  // Push filter to URL (preserve highlight/type)
  useEffect(() => {
    const incoming = new URLSearchParams(location.search || "");
    const params = new URLSearchParams();

    if (selectedApiary && selectedApiary !== "all") params.set("apiary_id", selectedApiary);
    if (incoming.get("highlight")) params.set("highlight", incoming.get("highlight"));
    if (incoming.get("type")) params.set("type", incoming.get("type"));

    const next = params.toString();
    const curr = (location.search || "").replace(/^\?/, "");
    if (next !== curr) {
      navigate({ search: next }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApiary]);

  // Fetch ACTIVE apiaries, then counts + reverse geocode
  useEffect(() => {
    const fetchApiaries = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("apiaries")
        .select(
          // ⬇️ include established_date here
          "id, name, latitude, longitude, notes, photo_url, is_default, established_date, created_at, archived_at"
        )
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading apiaries:", error);
        setApiaries([]);
        setFilteredApiaries([]);
        setHiveCounts({});
        setAddresses({});
        setLoading(false);
        return;
      }

      const rows = data || [];

      // default first, then newest
      const sortedRows = [...rows].sort(
        (a, b) =>
          Number(b.is_default) - Number(a.is_default) ||
          new Date(b.created_at) - new Date(a.created_at)
      );

      setApiaries(sortedRows);

      setFilteredApiaries(() => {
        if (selectedApiary === "all") return sortedRows;
        return sortedRows.filter((a) => String(a.id) === String(selectedApiary));
      });

      await Promise.all([fetchHiveCounts(sortedRows), reverseGeocodeAll(sortedRows)]);
      setLoading(false);
    };

    const fetchHiveCounts = async (apiariesIn) => {
      if (!apiariesIn.length) {
        setHiveCounts({});
        return;
      }
      const apiaryIds = apiariesIn.map((a) => a.id);
      const { data, error } = await supabase
        .from("hives")
        .select("apiary_id")
        .in("apiary_id", apiaryIds)
        .is("archived_at", null);

      if (error) {
        console.error("Error fetching hive counts:", error);
        setHiveCounts({});
        return;
      }
      const counts = {};
      data.forEach((hive) => {
        counts[hive.apiary_id] = (counts[hive.apiary_id] || 0) + 1;
      });
      setHiveCounts(counts);
    };

    const reverseGeocodeAll = async (apiariesIn) => {
      const coords = apiariesIn
        .filter((a) => hasValidCoords(a.latitude, a.longitude))
        .map((a) => ({
          id: a.id,
          lat: Number(a.latitude),
          lon: Number(a.longitude),
        }));

      try {
        const nameMap = await reverseGeocodeMany(coords);
        const normLon = (x) => (x > 180 ? x - 360 : x < -180 ? x + 360 : x);
        const newAddresses = {};
        for (const a of coords) {
          const key = `${a.lat.toFixed(6)},${a.lon.toFixed(6)}`;
          newAddresses[a.id] = nameMap.get(key) || `${a.lat}, ${normLon(a.lon)}`;
        }
        setAddresses(newAddresses);
      } catch (err) {
        console.error("Bulk geocoding failed:", err);
        setAddresses({});
      }
    };

    fetchApiaries();
     
  }, [selectedApiary]);

  // Filter by dropdown selection (client-side)
  useEffect(() => {
    if (selectedApiary === "all") {
      setFilteredApiaries(apiaries);
    } else {
      setFilteredApiaries(apiaries.filter((a) => String(a.id) === String(selectedApiary)));
    }
    setPage(1);
    jumpedToHighlightPageRef.current = false;
  }, [selectedApiary, apiaries]);

  // Pagination
  const total = filteredApiaries.length;

  // If highlight is present, auto-jump to its page once
  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "APIARY")) return;
    if (jumpedToHighlightPageRef.current) return;
    if (!filteredApiaries.length) return;

    const idx = filteredApiaries.findIndex((a) => String(a.id) === String(highlightId));
    if (idx >= 0) {
      const targetPage = Math.floor(idx / PAGE_SIZE) + 1;
      if (targetPage !== page) {
        setPage(targetPage);
      }
      jumpedToHighlightPageRef.current = true;
    }
  }, [filteredApiaries, highlightId, highlightType, page]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = filteredApiaries.slice(startIdx, endIdx);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Auto-scroll highlighted card into view
  useEffect(() => {
    if (loading || !highlightId || (highlightType && highlightType !== "APIARY")) return;
    const el = document.getElementById(`apiary-${highlightId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-amber-400");
      setTimeout(() => el.classList.remove("ring-4", "ring-amber-400"), 1500);
    }
  }, [loading, pageItems, highlightId, highlightType]);

  // --- Lightbox Portal
  const lightboxNode =
    lightbox.isOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4"
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
              alt={`Apiary photo ${lightbox.index + 1}`}
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
      </div>,
      document.body
    );

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <h1 className="text-2xl font-bold">Your Apiaries</h1>

  <div className="flex flex-col sm:flex-row gap-2">
    <Link
      to="/apiaries/new"
      className="inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
    >
      New Apiary
    </Link>

    <Link
      to="/apiaries/step-by-step"
      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-400"
    >
      Apiary Siting Guide
    </Link>
  </div>
</div>

      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div>
          <label className="mr-2 font-medium">Filter:</label>
          <select
            className="border px-2 py-1 rounded"
            value={selectedApiary}
            onChange={(e) => setSelectedApiary(e.target.value)}
          >
            <option value="all">All Apiaries</option>
            {apiaries.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
        </div>
      ) : filteredApiaries.length === 0 ? (
        <p>
          No apiaries found,{" "}
          <Link to="/apiaries/new" className="underline text-blue-600">
            add one
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((a) => {
              const canMap = hasValidCoords(a.latitude, a.longitude);
              const lat = canMap ? Number(a.latitude) : null;
              const lon = canMap ? Number(a.longitude) : null;

              const isHighlighted =
                highlightId &&
                String(a.id) === String(highlightId) &&
                (!highlightType || highlightType === "APIARY");

              // Choose which date to show: prefer established_date, otherwise created_at
              const displayDate = a.established_date || a.created_at;

              return (
                <li
                  key={a.id}
                  id={`apiary-${a.id}`}
                  data-highlight={isHighlighted ? "true" : "false"}
                  className={[
                    "border p-4 rounded shadow-sm",
                    isHighlighted ? "ring-2 ring-amber-400 bg-amber-50" : "bg-white",
                  ].join(" ")}
                >
                  {canMap ? (
                    <MapContainer
                      center={[lat, lon]}
                      zoom={13}
                      scrollWheelZoom={true}   // zoom stays enabled
                      dragging={false}         // prevents accidental map movement
                      className="h-32 w-full mb-2 rounded"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker
                        position={[lat, lon]}
                        icon={L.icon({
                          iconUrl:
                            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                        })}
                      />
                    </MapContainer>
                  ) : (
                    <div className="h-32 w-full mb-2 rounded border border-dashed flex items-center justify-center text-xs text-gray-600">
                      No coordinates set for this apiary
                    </div>
                  )}

                  {a.photo_url && (
                    <button
                      type="button"
                      className="w-full"
                      onClick={() =>
                        setLightbox({
                          isOpen: true,
                          urls: [a.photo_url],
                          index: 0,
                        })
                      }
                      aria-label={`Open photo of ${a.name}`}
                    >
                      <img
                        src={a.photo_url}
                        alt="Apiary"
                        className="w-full h-32 object-cover rounded mb-2 hover:opacity-90"
                      />
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{a.name}</h2>
                    {a.is_default && (
                      <span
                        title="Default apiary"
                        className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5 rounded"
                      >
                        ★ Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    Location: {addresses[a.id] || (canMap ? "Fetching location..." : "—")}
                  </p>

                  <p className="text-sm text-gray-600">Hives: {hiveCounts[a.id] || 0}</p>

                  {displayDate && (
                    <p className="text-xs text-gray-500">
                      Established: {new Date(displayDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-3 flex flex-col gap-2">
                    <Link
                      to={`/apiaries/${a.id}/edit`}
                      className="text-sm px-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded text-center
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
                    >
                      Edit Apiary
                    </Link>
                    <Link
                      to={`/hives?apiary_id=${a.id}`}
                      state={{ apiary_id: a.id }}
                      className="text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500"
                    >
                      View Hives
                    </Link>
                    <Link
                      to={`/hives/new?apiary_id=${a.id}`}
                      className="text-sm px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-yellow-600/40"
                    >
                      New Hive
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
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
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50 disabled:pointer-events-none
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50 disabled:pointer-events-none
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Next
              </button>
            </div>
          </div>

        </>
      )}

      {/* LIGHTBOX PORTAL */}
      {lightboxNode}
    </div>
  );
};

export default ApiaryList;
