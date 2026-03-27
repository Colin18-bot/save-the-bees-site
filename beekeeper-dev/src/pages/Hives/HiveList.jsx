// src/pages/Hives/HiveList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../services/supabase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocodeMany } from "../../utils/geocode";

const PAGE_SIZE = 9;

const HiveList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { highlightId, highlightType } = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return {
      highlightId: params.get("highlight") || null,
      highlightType: params.get("type") || null,
    };
  }, [location.search]);

  const jumpedToHighlightPageRef = useRef(false);

  const [selectedApiary, setSelectedApiary] = useState(() => {
    const params = new URLSearchParams(location.search || "");
    return (
      params.get("apiary_id") ||
      (location.state && location.state.apiary_id) ||
      "all"
    );
  });

  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiaryOptions, setApiaryOptions] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [noInspectionBanner, setNoInspectionBanner] = useState("");
  const [inspectionCounts, setInspectionCounts] = useState({});
  const [page, setPage] = useState(1);

  // ✅ plan gating
  const [isPremium, setIsPremium] = useState(false);

  // Filter to show only NFC-tagged hives (Premium only in UI)
  const [showTaggedOnly, setShowTaggedOnly] = useState(false);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const apiaryFromUrl = params.get("apiary_id") || "all";
    if (apiaryFromUrl !== selectedApiary) {
      setSelectedApiary(apiaryFromUrl);
      setPage(1);
      jumpedToHighlightPageRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const pushApiaryToUrl = (nextApiary = selectedApiary) => {
    const incoming = new URLSearchParams(location.search || "");
    const params = new URLSearchParams();

    if (nextApiary && nextApiary !== "all") {
      params.set("apiary_id", nextApiary);
    }
    if (incoming.get("highlight")) {
      params.set("highlight", incoming.get("highlight"));
    }
    if (incoming.get("type")) {
      params.set("type", incoming.get("type"));
    }

    navigate({ search: params.toString() }, { replace: true });
  };

  // ✅ Determine plan from profiles.subscription_level
  useEffect(() => {
    let cancelled = false;

    const loadPlan = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) {
        if (!cancelled) setIsPremium(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", uid)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        // Safe default: treat as Free if anything goes wrong
        setIsPremium(false);
        return;
      }

      const level = String(profile?.subscription_level || "free").toLowerCase();
      setIsPremium(level === "premium");
    };

    loadPlan();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ If user is not Premium, force this feature off
  useEffect(() => {
    if (!isPremium && showTaggedOnly) setShowTaggedOnly(false);
  }, [isPremium, showTaggedOnly]);

  useEffect(() => {
    const fetchApiaries = async () => {
      const { data, error } = await supabase
        .from("apiaries")
        .select("id, name, latitude, longitude")
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (!error) setApiaryOptions(data || []);
    };

    fetchApiaries();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchHives = async () => {
      setLoading(true);

      let query = supabase
        .from("hives")
        .select("*, apiaries(name, latitude, longitude)")
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (selectedApiary !== "all") {
        query = query.eq("apiary_id", selectedApiary);
      }

      const { data, error } = await query;
      if (cancelled) return;

      if (!error) {
        const rows = data || [];
        setHives(rows);

        const coords = rows
          .map((h) => {
            const lat = Number(h.apiaries?.latitude);
            const lon = Number(h.apiaries?.longitude);
            return { id: h.id, lat, lon };
          })
          .filter(
            (c) =>
              Number.isFinite(c.lat) &&
              Number.isFinite(c.lon) &&
              !(c.lat === 0 && c.lon === 0)
          );

        try {
          const nameMap = await reverseGeocodeMany(coords);
          if (cancelled) return;

          const addr = {};
          for (const c of coords) {
            const key = `${c.lat.toFixed(6)},${c.lon.toFixed(6)}`;
            addr[c.id] = nameMap.get(key) || `${c.lat}, ${c.lon}`;
          }
          setAddresses(addr);
        } catch (e) {
          if (!cancelled) {
            console.error("Bulk reverse geocode failed:", e);
            setAddresses({});
          }
        }

        if (rows.length) {
          const hiveIds = rows.map((h) => h.id);
          const { data: inspRows, error: inspErr } = await supabase
            .from("inspections")
            .select("id, hive_id")
            .in("hive_id", hiveIds)
            .is("archived_at", null);

          if (!cancelled) {
            if (!inspErr && inspRows) {
              const counts = {};
              for (const r of inspRows) {
                counts[r.hive_id] = (counts[r.hive_id] || 0) + 1;
              }
              setInspectionCounts(counts);
            } else {
              setInspectionCounts({});
            }
          }
        } else {
          setInspectionCounts({});
        }
      }

      if (!cancelled) setLoading(false);
    };

    fetchHives();

    return () => {
      cancelled = true;
    };
  }, [selectedApiary]);

  const checkInspectionsAndNavigate = async (hiveId) => {
    const { count, error } = await supabase
      .from("inspections")
      .select("id", { count: "exact", head: true })
      .eq("hive_id", hiveId)
      .is("archived_at", null);

    if (!error && count && count > 0) {
      navigate(`/inspections?hive_id=${hiveId}`);
    } else {
      setNoInspectionBanner(hiveId);
      setTimeout(() => navigate(`/inspections/new?hive_id=${hiveId}`), 3000);
    }
  };

  // Tagged hives info (Android nfc_uid OR iPhone/iPad nfc_link_enabled)
  const taggedCount = useMemo(
    () => hives.filter((h) => !!h.nfc_uid || !!h.nfc_link_enabled).length,
    [hives]
  );

  // ✅ Only allow tagged-only filtering when Premium
  const filteredHives = useMemo(() => {
    if (!isPremium) return hives;
    return showTaggedOnly
      ? hives.filter((h) => !!h.nfc_uid || !!h.nfc_link_enabled)
      : hives;
  }, [hives, showTaggedOnly, isPremium]);

  const total = filteredHives.length;

  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "HIVE")) return;
    if (jumpedToHighlightPageRef.current) return;
    if (!filteredHives.length) return;

    const idx = filteredHives.findIndex(
      (h) => String(h.id) === String(highlightId)
    );

    if (idx >= 0) {
      const targetPage = Math.floor(idx / PAGE_SIZE) + 1;
      if (targetPage !== page) setPage(targetPage);
      jumpedToHighlightPageRef.current = true;
    }
  }, [filteredHives, highlightId, highlightType, page]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = filteredHives.slice(startIdx, endIdx);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const statusClasses = {
    active: "bg-white",
    inactive: "bg-gray-100",
    "under observation": "bg-yellow-50",
  };

  const hasValidCoords = (apiaries) => {
    const lat = Number(apiaries?.latitude);
    const lon = Number(apiaries?.longitude);
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      !(lat === 0 && lon === 0)
    );
  };

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
              alt={`Hive photo ${lightbox.index + 1}`}
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
        <h1 className="text-2xl font-bold">Your Hives</h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            to="/hives/new"
            className="inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
          >
            New Hive
          </Link>

          <Link
            to="/hives/step-by-step"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-400"
          >
            Hive Siting Guide
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div>
          <label className="mr-2 font-medium">Filter by Apiary:</label>
          <select
            className="border px-2 py-1 rounded"
            value={selectedApiary}
            onChange={(e) => {
              const next = e.target.value;
              setSelectedApiary(next);
              setPage(1);
              jumpedToHighlightPageRef.current = false;
              pushApiaryToUrl(next);
            }}
          >
            <option value="all">All Apiaries</option>
            {apiaryOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Premium-only: NFC tagged filter + summary */}
        {isPremium && (
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={showTaggedOnly}
                onChange={(e) => {
                  setShowTaggedOnly(e.target.checked);
                  setPage(1);
                  jumpedToHighlightPageRef.current = false;
                }}
              />
              Show only tagged hives
            </label>
            <span className="text-xs text-gray-600">
              Tagged hives: <span className="font-semibold">{taggedCount}</span>{" "}
              of <span className="font-semibold">{hives.length}</span>
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
        </div>
      ) : filteredHives.length === 0 ? (
        <p>
          No hives found,{" "}
          <Link to="/hives/new" className="underline text-blue-600">
            Add one now
          </Link>
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((hive) => {
              const canMap = hasValidCoords(hive.apiaries);
              const lat = canMap ? Number(hive.apiaries.latitude) : null;
              const lon = canMap ? Number(hive.apiaries.longitude) : null;

              const isHighlighted =
                highlightId &&
                String(hive.id) === String(highlightId) &&
                (!highlightType || highlightType === "HIVE");

              return (
                <li
                  key={hive.id}
                  id={`hive-${hive.id}`}
                  data-highlight={isHighlighted ? "true" : "false"}
                  className={[
                    "border p-4 rounded shadow-sm",
                    statusClasses[hive.status] || "bg-white",
                    isHighlighted ? "ring-2 ring-amber-400 bg-amber-50" : "",
                  ].join(" ")}
                >
                  {canMap ? (
                    <MapContainer
                      center={[lat, lon]}
                      zoom={13}
                      scrollWheelZoom={true}
                      dragging={false}
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

                  {hive.photo_url && (
                    <button
                      type="button"
                      className="w-full"
                      onClick={() =>
                        setLightbox({
                          isOpen: true,
                          urls: [hive.photo_url],
                          index: 0,
                        })
                      }
                      aria-label={`Open photo of ${hive.name}`}
                    >
                      <img
                        src={hive.photo_url}
                        alt="Hive"
                        className="w-full h-32 object-cover rounded mb-2 hover:opacity-90"
                      />
                    </button>
                  )}

                  {/* Name + NFC tag badge (Premium-only) */}
                  <h2 className="text-lg font-semibold flex flex-col gap-1">
                    <span>{hive.name}</span>

                    {isPremium && (hive.nfc_uid || hive.nfc_link_enabled) && (
                      <span
                        className="inline-flex items-center gap-2 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 max-w-full"
                        title={
                          hive.nfc_uid
                            ? `Android NFC tag: ${hive.nfc_uid}`
                            : "iPhone / iPad NFC link enabled"
                        }
                      >
                        <span className="font-semibold uppercase tracking-wide">
                          NFC tag
                        </span>
                        <span className="font-mono truncate max-w-[170px]">
                          {hive.nfc_uid ? hive.nfc_uid : "iPhone / iPad"}
                        </span>
                      </span>
                    )}
                  </h2>

                  <p className="text-sm text-gray-600">
                    Apiary: {hive.apiaries?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Location:{" "}
                    {addresses[hive.id] ||
                      (canMap ? "Fetching location..." : "—")}
                  </p>

                  {hive.date_established && (
                    <p className="text-sm text-gray-600">
                      Placed in apiary:{" "}
                      {new Date(hive.date_established).toLocaleDateString()}
                    </p>
                  )}

                  <p className="text-sm text-gray-600">
                    {(inspectionCounts[hive.id] ?? 0)}{" "}
                    {inspectionCounts[hive.id] === 1
                      ? "inspection"
                      : "inspections"}
                  </p>

                  {hive.hive_type && (
                    <p className="text-sm text-gray-600">Type: {hive.hive_type}</p>
                  )}
                  {hive.status && (
                    <p className="text-sm text-gray-600">Status: {hive.status}</p>
                  )}

                  <div className="mt-3 flex flex-col gap-2">
                    <Link
                      to={`/hives/${hive.id}/edit`}
                      className="text-sm px-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded text-center
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
                    >
                      Edit Hive
                    </Link>

                    <Link
                      to={`/inspections/new?hive_id=${hive.id}&apiary_id=${hive.apiary_id}`}
                      className="text-sm px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-yellow-600/40"
                    >
                      New Inspection
                    </Link>

                    <button
                      type="button"
                      onClick={() => checkInspectionsAndNavigate(hive.id)}
                      className="text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500"
                    >
                      View Inspections
                    </button>
                  </div>

                  {noInspectionBanner === hive.id && (
                    <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm">
                      No inspections for this hive yet. Redirecting you to create one...
                    </div>
                  )}
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

      {lightboxNode}
    </div>
  );
};

export default HiveList;