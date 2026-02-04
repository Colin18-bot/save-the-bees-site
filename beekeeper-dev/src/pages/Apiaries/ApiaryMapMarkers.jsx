// src/pages/Apiaries/ApiaryMapMarkers.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  GeoJSON,
  FeatureGroup,
  useMapEvents,
  LayersControl,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../services/supabase";

// --- Marker types (keep these consistent with your DB values)
const MARKER_TYPES = [
  { value: "water_source", label: "Water source" },
  { value: "watercourse", label: "Watercourse" },
  { value: "forage", label: "Forage hotspot" },
  { value: "asian_hornet", label: "Asian hornet sighting" },
  { value: "shelter", label: "Shelter / windbreak" },
  { value: "risk", label: "Risk" },
  { value: "access", label: "Access / parking" },
  { value: "other", label: "Other" },
];

// --- Helper: build a small SVG icon (no external files needed)
const svgIcon = (emoji, bg = "#111827") => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <path d="M22 56c8-12 16-21 16-32C38 11.85 31.15 4 22 4S6 11.85 6 24c0 11 8 20 16 32z" fill="${bg}"/>
    <circle cx="22" cy="22" r="12" fill="white" opacity="0.22"/>
    <text x="22" y="27" text-anchor="middle" font-size="16">${emoji}</text>
  </svg>`.trim();

  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [44, 56],
    iconAnchor: [22, 56],
    popupAnchor: [0, -56],
  });
};

// --- Icons by type
const icons = {
  apiary: svgIcon("🏠", "#166534"),
  water_source: svgIcon("💧", "#1D4ED8"),
  watercourse: svgIcon("🌊", "#2563EB"),
  forage: svgIcon("🌼", "#CA8A04"),
  asian_hornet: svgIcon("⚠️", "#B91C1C"),
  shelter: svgIcon("🌳", "#15803D"),
  risk: svgIcon("🚫", "#7C2D12"),
  access: svgIcon("🅿️", "#334155"),
  other: svgIcon("📍", "#111827"),
};

const iconByType = (type) => icons[type] || icons.other;

// --- OpenWeather tile overlays (requires VITE_OPENWEATHER_KEY)
const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

// --- Base map sources
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR = "&copy; OpenStreetMap contributors";

// Light basemap (CartoDB Positron) - great contrast for weather overlays
const LIGHT_TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Satellite basemap (Esri)
const SAT_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SAT_TILE_ATTR = "Tiles &copy; Esri";

// OpenWeather “Weather Maps 1.0” tile layers (most useful ones for beekeeping)
// NOTE: OpenWeather's wind tiles are primarily WIND SPEED; they don't give arrow direction.
const OWM_OVERLAYS = [
  { id: "owm_precip", name: "Weather: Precipitation", layer: "precipitation_new", opacity: 0.8 },
  { id: "owm_clouds", name: "Weather: Clouds", layer: "clouds_new", opacity: 0.7 },
  { id: "owm_temp", name: "Weather: Temperature", layer: "temp_new", opacity: 0.75 },
  { id: "owm_wind", name: "Weather: Wind speed", layer: "wind_new", opacity: 0.75 },
];

const owmTileUrl = (layer) =>
  `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${OPENWEATHER_KEY}`;

function TapToAddMarker({ isAddMode, onPick }) {
  useMapEvents({
    click(e) {
      if (!isAddMode) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Watches Leaflet overlay toggles, so the warnings layer behaves like a REAL map layer
function WarningsOverlayWatcher({ layerRef, onEnable, onDisable }) {
  useMapEvents({
    overlayadd(e) {
      const layer = layerRef?.current;
      const leafletLayer = layer?.leafletElement ?? layer;
      if (leafletLayer && e.layer === leafletLayer) onEnable();
    },
    overlayremove(e) {
      const layer = layerRef?.current;
      const leafletLayer = layer?.leafletElement ?? layer;
      if (leafletLayer && e.layer === leafletLayer) onDisable();
    },
  });
  return null;
}

// Watches OpenWeather overlay toggles (so we can auto-switch basemap for contrast)
function WeatherOverlaysWatcher({ weatherRefs, onAnyWeatherOn, onAllWeatherOff }) {
  const map = useMapEvents({
    overlayadd(e) {
      const layers = Object.values(weatherRefs?.current || {})
        .map((r) => (r?.leafletElement ?? r))
        .filter(Boolean);

      if (layers.some((l) => e.layer === l)) onAnyWeatherOn();
    },
    overlayremove() {
      const layers = Object.values(weatherRefs?.current || {})
        .map((r) => (r?.leafletElement ?? r))
        .filter(Boolean);

      // If NONE of the weather layers are still on the map, fire off
      const anyStillOn = layers.some((l) => map.hasLayer(l));
      if (!anyStillOn) onAllWeatherOff();
    },
  });

  return null;
}

const ApiaryMapMarkers = () => {
  const { apiaryId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [apiary, setApiary] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [apiaryOptions, setApiaryOptions] = useState([]);

  const [isAddMode, setIsAddMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    type: "forage",
    title: "",
    notes: "",
    observed_at: "",
  });

  const markerCount = markers.length;

  // Legend toggle (main legend)
  const [showLegend, setShowLegend] = useState(true);

  // Pollen card toggle (hide/show)
  const [showPollen, setShowPollen] = useState(true);

  // Mobile: collapse bulky header panels so the map is visible
  const [showPanels, setShowPanels] = useState(false);

  // When any popup is open, lift the map layer ABOVE the header overlays
  const [isAnyPopupOpen, setIsAnyPopupOpen] = useState(false);

  // --- Met Office official weather warnings
  const [warningsEnabled, setWarningsEnabled] = useState(false);
  const [warningsGeoJson, setWarningsGeoJson] = useState(null);
  const [warningsLoading, setWarningsLoading] = useState(false);
  const [warningsError, setWarningsError] = useState("");
  const warningsLayerRef = useRef(null);

  // --- Weather UX
  // Basemap selection (Map / Light / Satellite)
  const [baseMap, setBaseMap] = useState("map"); // "map" | "light" | "satellite"

  // Toggle: auto-switch basemap when weather overlays turn on
  const [autoLightOnWeather, setAutoLightOnWeather] = useState(true);

  // Track if any weather overlay is currently enabled
  const [anyWeatherOn, setAnyWeatherOn] = useState(false);

  // Remember what basemap the user had before auto-switching
  const prevBaseMapRef = useRef(null);
  const autoSwitchedRef = useRef(false);

  // Refs to OpenWeather overlay layers so we can detect ON/OFF in LayersControl
  const weatherLayerRefs = useRef({});

  // Pollen (selected apiary location only)
  const [pollen, setPollen] = useState(null);
  const [pollenLoading, setPollenLoading] = useState(false);
  const [pollenError, setPollenError] = useState("");

  const safeNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

    const pollenLabel = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";

    // Open-Meteo pollen is in grains/m³ (not an index)
    if (n <= 0) return "None";
    if (n < 10) return "Low";
    if (n < 50) return "Moderate";
    return "High";
  };

  const summarisePollen = (current) => {
    if (!current) return null;

    const alder = safeNum(current.alder_pollen);
    const birch = safeNum(current.birch_pollen);
    const olive = safeNum(current.olive_pollen);
    const grass = safeNum(current.grass_pollen);
    const mugwort = safeNum(current.mugwort_pollen);
    const ragweed = safeNum(current.ragweed_pollen);

    const treeVals = [alder, birch, olive].filter((x) => x !== null);
    const weedVals = [mugwort, ragweed].filter((x) => x !== null);

    const tree = treeVals.length ? Math.max(...treeVals) : null;
    const weed = weedVals.length ? Math.max(...weedVals) : null;

    return {
      tree,
      grass,
      weed,
      tree_label: pollenLabel(tree),
      grass_label: pollenLabel(grass),
      weed_label: pollenLabel(weed),
      raw: { alder, birch, olive, mugwort, ragweed },
    };
  };

  const getSeverity = (props) => {
    const p = props || {};
    return (
      p.severity ||
      p.awareness_level ||
      p.awarenessLevel ||
      p.eventSeverity ||
      p.severityLevel ||
      ""
    );
  };

  // --- Met Office warnings: style + fetch
  const severityStyle = useCallback((severity) => {
    const s = String(severity || "").toLowerCase();

    if (s.includes("red")) {
      return { color: "#991b1b", weight: 2, fillColor: "#ef4444", fillOpacity: 0.25 };
    }
    if (s.includes("amber") || s.includes("orange")) {
      return { color: "#92400e", weight: 2, fillColor: "#f59e0b", fillOpacity: 0.22 };
    }
    if (s.includes("yellow")) {
      return { color: "#a16207", weight: 2, fillColor: "#fde047", fillOpacity: 0.18 };
    }

    return { color: "#0f172a", weight: 2, fillColor: "#94a3b8", fillOpacity: 0.15 };
  }, []);

  const fetchMetOfficeWarnings = useCallback(async () => {
    setWarningsLoading(true);
    setWarningsError("");

    try {
      const { data, error } = await supabase.functions.invoke("metoffice-warnings", {
        method: "GET",
      });

      if (error) throw new Error(error.message || "Edge function error");
      if (!data || data.type !== "FeatureCollection") {
        throw new Error("Edge function returned unexpected data (expected GeoJSON FeatureCollection).");
      }

      setWarningsGeoJson(data);
    } catch (e) {
      console.error(e);
      setWarningsGeoJson(null);

      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
        setWarningsError(
          "Met Office warnings function not found. Check the Edge Function name is exactly: metoffice-warnings, then deploy it."
        );
      } else {
        setWarningsError("Official warnings unavailable right now. Check the Edge Function is deployed and working.");
      }
    } finally {
      setWarningsLoading(false);
    }
  }, []);

  const fetchPollenForApiary = async (lat, lon) => {
    setPollenLoading(true);
    setPollenError("");

    try {
         const url =
        "https://air-quality-api.open-meteo.com/v1/air-quality" +
        `?latitude=${encodeURIComponent(lat)}` +
        `&longitude=${encodeURIComponent(lon)}` +
        "&domains=cams_europe" +
        "&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen" +
        "&timezone=auto";


      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Pollen request failed (${res.status})`);

      const json = await res.json();
      setPollen(summarisePollen(json?.current));
    } catch (e) {
      console.error(e);
      setPollen(null);
      setPollenError("Pollen data unavailable for this location right now.");
    } finally {
      setPollenLoading(false);
    }
  };

  // Measure header height (for map padding)
  const headerRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);

  useEffect(() => {
    const measure = () => setHeaderH(headerRef.current?.offsetHeight || 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const center = useMemo(() => {
    if (!apiary?.latitude || !apiary?.longitude) return [51.4816, -3.1791];
    return [Number(apiary.latitude), Number(apiary.longitude)];
  }, [apiary]);

  // Load apiary list for dropdown
  useEffect(() => {
    const loadApiaryOptions = async () => {
      const { data, error } = await supabase
        .from("apiaries")
        .select("id, name")
        .is("archived_at", null)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load apiary options:", error);
        return;
      }

      setApiaryOptions(data || []);
    };

    loadApiaryOptions();
  }, []);

  const loadAll = async () => {
    setLoading(true);

    const { data: apiaryData, error: apiaryErr } = await supabase
      .from("apiaries")
      .select("id, name, latitude, longitude, address, hives(count)")
      .eq("id", apiaryId)
      .single();

    if (apiaryErr) {
      console.error(apiaryErr);
      alert("Could not load apiary.");
      setLoading(false);
      return;
    }

    const { data: markerData, error: markerErr } = await supabase
      .from("apiary_map_markers")
      .select("id, apiary_id, type, title, notes, latitude, longitude, observed_at, created_at, updated_at")
      .eq("apiary_id", apiaryId)
      .order("created_at", { ascending: false });

    if (markerErr) {
      console.error(markerErr);
      alert("Could not load map markers (is the table created?).");
      setLoading(false);
      return;
    }

    setApiary(apiaryData);
    setMarkers(markerData || []);

    const la = Number(apiaryData?.latitude);
    const lo = Number(apiaryData?.longitude);
    if (Number.isFinite(la) && Number.isFinite(lo)) {
      fetchPollenForApiary(la, lo);
    } else {
      setPollen(null);
      setPollenError("No coordinates saved for this apiary.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiaryId]);

  // If user enables warnings layer, auto-fetch once (if we have no data yet)
  useEffect(() => {
    if (warningsEnabled && !warningsGeoJson && !warningsLoading && !warningsError) {
      fetchMetOfficeWarnings();
    }
  }, [warningsEnabled, warningsGeoJson, warningsLoading, warningsError, fetchMetOfficeWarnings]);

  // Auto-switch basemap when weather overlays turn on/off (if toggle enabled)
  const handleAnyWeatherOn = useCallback(() => {
    setAnyWeatherOn(true);

    if (!autoLightOnWeather) return;

    // If user is already on light or satellite, don't force anything.
    // (Satellite is intentionally allowed anytime.)
    if (baseMap === "light" || baseMap === "satellite") return;

    // Switch to light for contrast, but remember previous basemap.
    prevBaseMapRef.current = baseMap;
    autoSwitchedRef.current = true;
    setBaseMap("light");
  }, [autoLightOnWeather, baseMap]);

  const handleAllWeatherOff = useCallback(() => {
    setAnyWeatherOn(false);

    if (!autoLightOnWeather) return;

    // Only restore if WE auto-switched earlier (and user hasn't manually changed basemap).
    if (autoSwitchedRef.current && prevBaseMapRef.current) {
      const prev = prevBaseMapRef.current;
      prevBaseMapRef.current = null;
      autoSwitchedRef.current = false;

      // If user is still on light, restore. If they changed manually, do nothing.
      setBaseMap((curr) => (curr === "light" ? prev : curr));
    }
  }, [autoLightOnWeather]);

  const startAdd = () => {
    setIsAddMode(true);
    setPendingPoint(null);
    setEditingId(null);
  };

  const cancelAdd = () => {
    setIsAddMode(false);
    setPendingPoint(null);
  };

  const openAddFormForPoint = (pt) => {
    setPendingPoint(pt);
    setEditDraft({ type: "forage", title: "", notes: "", observed_at: "" });
  };

  const saveNewMarker = async () => {
    if (!pendingPoint) return;

    const payload = {
      apiary_id: apiaryId,
      type: editDraft.type,
      title: editDraft.title?.trim() || null,
      notes: editDraft.notes?.trim() || null,
      latitude: pendingPoint.lat,
      longitude: pendingPoint.lng,
      observed_at: editDraft.type === "asian_hornet" && editDraft.observed_at ? editDraft.observed_at : null,
    };

    const { error } = await supabase.from("apiary_map_markers").insert(payload);

    if (error) {
      console.error(error);
      alert("Failed to save marker.");
      return;
    }

    setIsAddMode(false);
    setPendingPoint(null);
    await loadAll();
  };

  const beginEdit = (m) => {
    setEditingId(m.id);
    setEditDraft({
      type: m.type || "forage",
      title: m.title || "",
      notes: m.notes || "",
      observed_at: m.observed_at || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ type: "forage", title: "", notes: "", observed_at: "" });
  };

  const saveEdit = async (id) => {
    const payload = {
      type: editDraft.type,
      title: editDraft.title?.trim() || null,
      notes: editDraft.notes?.trim() || null,
      observed_at: editDraft.type === "asian_hornet" && editDraft.observed_at ? editDraft.observed_at : null,
    };

    const { error } = await supabase.from("apiary_map_markers").update(payload).eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to update marker.");
      return;
    }

    setEditingId(null);
    await loadAll();
  };

  const deleteMarker = async (id) => {
    const ok = window.confirm("Delete this marker? This cannot be undone.");
    if (!ok) return;

    const { error } = await supabase.from("apiary_map_markers").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete marker.");
      return;
    }

    if (editingId === id) cancelEdit();
    await loadAll();
  };

  // Prevent Leaflet click-through when pressing buttons inside the popup.
  const stopClickThrough = useCallback((e) => {
    if (!e) return;
    e.preventDefault?.();
    e.stopPropagation?.();
    if (e.nativeEvent?.stopPropagation) e.nativeEvent.stopPropagation();
  }, []);

  // Pick again: clear selected point, keep add mode on, then user taps map to select a new location.
  const pickAgain = useCallback(
    (e) => {
      stopClickThrough(e);
      setPendingPoint(null);
    },
    [stopClickThrough]
  );

  const popupHandlers = useMemo(
    () => ({
      popupopen: () => setIsAnyPopupOpen(true),
      popupclose: () => setIsAnyPopupOpen(false),
    }),
    []
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-sm opacity-70">Loading map…</div>
      </div>
    );
  }

  if (!apiary) {
    return (
      <div className="p-4">
        <div className="text-sm">Apiary not found.</div>
      </div>
    );
  }

  const hasCoords = Number.isFinite(Number(apiary?.latitude)) && Number.isFinite(Number(apiary?.longitude));

  // Small helper to keep label/input spacing consistent (and prevent “label protrusion”)
  const FieldLabel = ({ children }) => (
    <div className="mt-2">
      <label className="block text-xs opacity-70 mb-1">{children}</label>
    </div>
  );

  // Basemap config from state
  const baseLayerConfig =
    baseMap === "light"
      ? { url: LIGHT_TILE_URL, attribution: LIGHT_TILE_ATTR }
      : baseMap === "satellite"
        ? { url: SAT_TILE_URL, attribution: SAT_TILE_ATTR }
        : { url: OSM_TILE_URL, attribution: OSM_ATTR };

  return (
    <div className="relative w-full" style={{ height: "100dvh" }}>
      {/* Popup styling (fix label/padding issues inside Leaflet popups) */}
      <style>{`
        .bk-popup .leaflet-popup-content-wrapper {
          border: 2px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 18px 60px rgba(0,0,0,0.35);
          background: rgba(255,255,255,0.98);
          border-radius: 18px;
          padding: 0 !important;
        }
        .bk-popup .leaflet-popup-content {
          margin: 14px 16px !important;
          width: auto !important;
        }
        .bk-popup .leaflet-popup-tip {
          background: rgba(255,255,255,0.98);
          box-shadow: 0 12px 35px rgba(0,0,0,0.25);
        }
        .bk-popup .leaflet-popup-close-button {
          top: 10px;
          right: 10px;
          width: 28px;
          height: 28px;
          line-height: 26px;
          border-radius: 9999px;
          color: rgba(15, 23, 42, 0.75);
        }
        .bk-popup .leaflet-popup-close-button:hover {
          background: rgba(15, 23, 42, 0.06);
          color: rgba(15, 23, 42, 0.9);
        }
        .bk-popup * { box-sizing: border-box; }

              /* Leaflet controls should stay clickable */
        .leaflet-control { z-index: 1000; }
      `}</style>

      {/* Top bar */}
      <div
        ref={headerRef}
        className={`absolute top-0 left-0 right-0 p-2 sm:p-3 ${isAnyPopupOpen ? "z-[400]" : "z-[1000]"}`}
      >

       <div className="flex flex-col gap-2 rounded-2xl bg-white/95 shadow px-2 py-2 sm:px-3 max-h-[42dvh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <select
                  className="w-full sm:max-w-[220px] border rounded-lg px-2 py-1 text-sm"
                  value={apiaryId}
                  onChange={(e) => navigate(`/apiaries/${e.target.value}/map`)}
                  aria-label="Select apiary"
                >
                  {apiaryOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>

                <div className="text-sm font-semibold">— Map markers</div>

                <div className="text-xs px-2 py-1 rounded-full border bg-white">
                  Markers: <span className="font-semibold">{markerCount}</span>
                </div>

                <div className="text-xs px-2 py-1 rounded-full border bg-white">
                  Warnings: <span className="font-semibold">{warningsEnabled ? "On" : "Off"}</span>
                </div>

                <div className="text-xs px-2 py-1 rounded-full border bg-white">
                  Weather: <span className="font-semibold">{anyWeatherOn ? "On" : "Off"}</span>
                </div>
              </div>

              <div className="text-xs opacity-70 truncate">{apiary.address || " "}</div>
            </div>

            <div className="w-full sm:w-auto grid grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-2 sm:justify-end">

              <button
                className="text-xs px-2 py-2 rounded-xl border hover:bg-gray-50 sm:hidden"

                type="button"
                onClick={() => setShowPanels((v) => !v)}
              >
                {showPanels ? "Hide panels" : "Show panels"}
              </button>

              <button
                className="text-xs px-2 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
                onClick={() => fetchMetOfficeWarnings()}
                type="button"
                disabled={warningsLoading || !warningsEnabled}
                title={warningsEnabled ? "Refresh Met Office warnings" : "Turn on the warnings layer first"}
              >
                {warningsLoading ? "Refreshing…" : "Refresh warnings"}
              </button>

              <button
                className="text-xs px-2 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => navigate(-1)}
                type="button"
              >
                Back
              </button>

              {!isAddMode ? (
                <button
                  className="text-xs px-2 py-2 rounded-xl bg-black text-white hover:opacity-90"
                  onClick={startAdd}
                  type="button"
                >
                  Add marker
                </button>
              ) : (
                <button
                  className="text-sm px-3 py-2 rounded-xl border hover:bg-gray-50"
                  onClick={cancelAdd}
                  type="button"
                >
                  Cancel add
                </button>
              )}
            </div>
          </div>

          {/* Weather UX controls (toggle + basemap selector) */}
          <div className={`${showPanels ? "block" : "hidden"} sm:block`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-white px-3 pt-2 pb-4 sm:py-2">

            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs font-semibold">Weather visibility</div>

              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={autoLightOnWeather}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setAutoLightOnWeather(next);

                    // If they turn this OFF while we auto-switched earlier, stop restoring later.
                    if (!next) {
                      prevBaseMapRef.current = null;
                      autoSwitchedRef.current = false;
                    }
                  }}
                />
                Auto-switch to Light basemap when weather layers turn on
              </label>

            </div>
        </div>

            <div className="flex items-center gap-2 justify-end">
              <div className="text-xs opacity-70">Basemap</div>
              <select
                className="border rounded-lg px-2 py-1 text-sm"
                value={baseMap}
                onChange={(e) => {
                  // Manual override: never “snap back” later
                  prevBaseMapRef.current = null;
                  autoSwitchedRef.current = false;
                  setBaseMap(e.target.value);
                }}
                aria-label="Select basemap"
              >
                <option value="map">Map</option>
                <option value="light">Light</option>
                <option value="satellite">Satellite</option>
              </select>
            </div>
          </div>
        </div>

          {warningsEnabled ? (
          <div className={`${showPanels ? "block" : "hidden"} sm:block`}>
            <div className="mt-2 rounded-2xl bg-white/95 shadow px-3 py-2 text-xs">

            {warningsLoading ? (
              <div className="opacity-70">Loading official warnings…</div>
            ) : warningsError ? (
              <div className="opacity-70">{warningsError}</div>
            ) : warningsGeoJson ? (
              <div className="opacity-70">Official warnings loaded.</div>
            ) : (
              <div className="opacity-70">Turned on — waiting for data…</div>
            )}
          </div>
        </div>
      ) : null}

          {isAddMode && (
          <div className={`${showPanels ? "block" : "hidden"} sm:block`}>
            <div className="mt-2 rounded-2xl bg-white/95 shadow px-3 py-2 text-xs">

            {pendingPoint ? (
              <div className="opacity-80">Marker location selected. Fill details below and save.</div>
            ) : (
              <div className="opacity-80">Tap the map to drop a marker.</div>
            )}
            </div>
          </div>
        )}

        {/* Pollen card */}
        <div className={`mt-2 rounded-2xl bg-white/95 shadow px-3 py-2 text-xs ${showPanels ? "block" : "hidden"} sm:block`}>

          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold">Pollen (apiary location)</div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50"
                onClick={() => setShowPollen((v) => !v)}
              >
                {showPollen ? "Hide" : "Show"}
              </button>

                <button
                type="button"
                className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50"
                onClick={() => {
                  const la = Number(apiary?.latitude);
                  const lo = Number(apiary?.longitude);
                  if (Number.isFinite(la) && Number.isFinite(lo)) fetchPollenForApiary(la, lo);
                }}
                disabled={pollenLoading}
              >
                Refresh
              </button>
            </div>
          </div>

          {!showPollen ? (
            <div className="mt-1 opacity-70">Hidden.</div>
          ) : pollenLoading ? (
            <div className="mt-1 opacity-70">Loading…</div>
          ) : pollenError ? (
            <div className="mt-1 opacity-70">{pollenError}</div>
          ) : pollen ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="rounded-lg border bg-white px-2 py-1">
                <div className="opacity-70">Tree</div>
                <div className="font-semibold">{pollen.tree_label}</div>
                <div className="opacity-60">
                {pollen.tree ?? "—"}{pollen.tree != null ? " grains/m³" : ""}
              </div>
              </div>
              <div className="rounded-lg border bg-white px-2 py-1">
                <div className="opacity-70">Grass</div>
                <div className="font-semibold">{pollen.grass_label}</div>
                <div className="opacity-60">
                {pollen.grass ?? "—"}{pollen.grass != null ? " grains/m³" : ""}
              </div>
              </div>
              <div className="rounded-lg border bg-white px-2 py-1">
                <div className="opacity-70">Weed</div>
                <div className="font-semibold">{pollen.weed_label}</div>
                <div className="opacity-60">
                {pollen.weed ?? "—"}{pollen.weed != null ? " grains/m³" : ""}
              </div>
              </div>
            </div>
          ) : (
            <div className="mt-1 opacity-70">No pollen data yet.</div>
          )}

          {showPollen && <div className="mt-1 opacity-60">Note: Pollen is seasonal and provider-dependent.</div>}
        </div>
      </div>

      {/* Map padded under header.
          IMPORTANT: when a popup is open, lift the WHOLE map layer above the header so popups overlay it. */}
      <div
        style={{ paddingTop: headerH, height: "100%" }}
        className={`relative ${isAnyPopupOpen ? "z-[1200]" : "z-[0]"}`}
      >
          <MapContainer center={center} zoom={15} zoomControl={false} attributionControl={false} className="h-full w-full">

          <ZoomControl position="bottomright" />
          <AttributionControl position="bottomright" prefix={false} />


          {/* Basemap (driven by your selector) */}
          <TileLayer attribution={baseLayerConfig.attribution} url={baseLayerConfig.url} />

          <LayersControl position="bottomright">
            {/* --- Weather overlays (OpenWeather) --- */}
            {OPENWEATHER_KEY
              ? OWM_OVERLAYS.map((o) => (
                  <LayersControl.Overlay key={o.id} name={o.name}>
                    <TileLayer
                      ref={(ref) => {
                        if (ref) weatherLayerRefs.current[o.id] = ref;
                      }}
                      url={owmTileUrl(o.layer)}
                      opacity={o.opacity}
                      attribution="&copy; OpenWeather"
                      updateWhenIdle
                      keepBuffer={2}
                    />
                  </LayersControl.Overlay>
                ))
              : null}

            {/* --- Official warnings overlay (Met Office) --- */}
            <LayersControl.Overlay name="Official warnings (Met Office)">
              <FeatureGroup ref={warningsLayerRef}>
                <GeoJSON
                  data={
                    warningsGeoJson || {
                      type: "FeatureCollection",
                      features: [],
                    }
                  }
                  style={(feature) => severityStyle(getSeverity(feature?.properties))}
                  onEachFeature={(feature, layer) => {
                    const p = feature?.properties || {};
                    const title = p.headline || p.event || p.type || "Weather warning";
                    const severity = getSeverity(p) || "Unknown";
                    const from = p.onset || p.effective || "";
                    const to = p.expires || p.ends || "";

                    layer.bindPopup(`
                      <div style="font-size:12px">
                        <div style="font-weight:700; margin-bottom:4px">${title}</div>
                        <div><b>Severity:</b> ${severity}</div>
                        ${from ? `<div><b>From:</b> ${from}</div>` : ""}
                        ${to ? `<div><b>To:</b> ${to}</div>` : ""}
                      </div>
                    `);
                  }}
                />
              </FeatureGroup>
            </LayersControl.Overlay>
          </LayersControl>

          {/* Keep warningsEnabled in sync with the Leaflet LayersControl checkbox */}
          <WarningsOverlayWatcher
            layerRef={warningsLayerRef}
            onEnable={() => setWarningsEnabled(true)}
            onDisable={() => setWarningsEnabled(false)}
          />

          {/* Detect when ANY weather overlay is enabled/disabled (for auto-light UX) */}
          <WeatherOverlaysWatcher
            weatherRefs={weatherLayerRefs}
            onAnyWeatherOn={handleAnyWeatherOn}
            onAllWeatherOff={handleAllWeatherOff}
          />

          <TapToAddMarker
            isAddMode={isAddMode}
            onPick={(pt) => {
              if (!pendingPoint) openAddFormForPoint(pt);
            }}
          />

          {/* Apiary marker */}
          {hasCoords && (
            <Marker
              position={[Number(apiary.latitude), Number(apiary.longitude)]}
              icon={icons.apiary}
              eventHandlers={popupHandlers}
            >
              <Popup className="bk-popup" autoPan={false}>
                <div className="text-sm font-semibold">{apiary.name}</div>

                {apiary.address ? <div className="text-xs opacity-70">{apiary.address}</div> : null}

                <div className="mt-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="opacity-70">Total hives</span>
                    <span className="font-semibold">
                      {Array.isArray(apiary?.hives) ? apiary.hives[0]?.count ?? 0 : 0}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Foraging radius (non-interactive) */}
                    {hasCoords && (
            <Circle
              center={[Number(apiary.latitude), Number(apiary.longitude)]}
              radius={4828}
              interactive={false}
              pathOptions={{
                color: "#CA8A04",
                weight: 3,
                opacity: 1,
                fillOpacity: 0, // no fill at all
                 dashArray: null, // IMPORTANT: removes dotted line
              }}
              
            />
          )}

          {/* Existing markers */}
          {markers.map((m) => (
            <Marker
              key={m.id}
              position={[Number(m.latitude), Number(m.longitude)]}
              icon={iconByType(m.type)}
              eventHandlers={popupHandlers}
            >
              <Popup className="bk-popup" autoPan={false}>
                {editingId === m.id ? (
                  <div className="w-[240px] max-w-[calc(100vw-80px)] sm:w-[360px]">
                    <div className="text-sm font-semibold mb-2">Edit marker</div>

                    <FieldLabel>Type</FieldLabel>
                    <select
                      className="w-full border rounded-lg px-2 py-1 text-sm"
                      value={editDraft.type}
                      onChange={(e) => setEditDraft((d) => ({ ...d, type: e.target.value }))}
                    >
                      {MARKER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <FieldLabel>Title</FieldLabel>
                    <input
                      className="w-full border rounded-lg px-2 py-1 text-sm"
                      value={editDraft.title}
                      onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder={editDraft.type === "other" ? "What is this?" : "Optional (e.g. Ivy wall)"}
                    />

                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      className="w-full border rounded-lg px-2 py-1 text-sm"
                      value={editDraft.notes}
                      onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                      rows={3}
                      placeholder="Optional notes…"
                    />

                    {editDraft.type === "asian_hornet" && (
                      <>
                        <FieldLabel>Observed date</FieldLabel>
                        <input
                          className="w-full border rounded-lg px-2 py-1 text-sm"
                          type="date"
                          value={editDraft.observed_at || ""}
                          onChange={(e) => setEditDraft((d) => ({ ...d, observed_at: e.target.value }))}
                        />
                      </>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        className="flex-1 px-3 py-2 rounded-xl bg-black text-white text-sm"
                        onClick={() => saveEdit(m.id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="flex-1 px-3 py-2 rounded-xl border text-sm"
                        onClick={cancelEdit}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>

                    <button
                      className="w-full mt-2 px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
                      onClick={() => deleteMarker(m.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="w-[240px] max-w-[calc(100vw-80px)] sm:w-[360px]">
                    <div className="text-sm font-semibold">
                      {MARKER_TYPES.find((t) => t.value === m.type)?.label || m.type}
                    </div>

                    {m.title ? <div className="text-sm mt-1">{m.title}</div> : null}
                    {m.notes ? <div className="text-xs opacity-70 mt-1 whitespace-pre-wrap">{m.notes}</div> : null}
                    {m.type === "asian_hornet" && m.observed_at ? (
                      <div className="text-xs opacity-70 mt-1">Observed: {m.observed_at}</div>
                    ) : null}

                    <div className="flex gap-2 mt-3">
                      <button
                        className="flex-1 px-3 py-2 rounded-xl bg-black text-white text-sm"
                        onClick={() => beginEdit(m)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 px-3 py-2 rounded-xl border text-sm"
                        onClick={() => deleteMarker(m.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}

          {/* Pending marker */}
          {isAddMode && pendingPoint && (
            <Marker
              position={[pendingPoint.lat, pendingPoint.lng]}
              icon={iconByType(editDraft.type)}
              eventHandlers={popupHandlers}
            >
              <Popup className="bk-popup" autoPan={false}>
                <div className="w-[240px] max-w-[calc(100vw-80px)] sm:w-[360px]">
                  <div className="text-sm font-semibold mb-2">New marker</div>

                  <FieldLabel>Type</FieldLabel>
                  <select
                    className="w-full border rounded-lg px-2 py-1 text-sm"
                    value={editDraft.type}
                    onChange={(e) => setEditDraft((d) => ({ ...d, type: e.target.value }))}
                  >
                    {MARKER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <FieldLabel>Title</FieldLabel>
                  <input
                    className="w-full border rounded-lg px-2 py-1 text-sm"
                    value={editDraft.title}
                    onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                    placeholder={editDraft.type === "other" ? "What is this?" : "Optional (e.g. Pond behind gate)"}
                  />

                  <FieldLabel>Notes</FieldLabel>
                  <textarea
                    className="w-full border rounded-lg px-2 py-1 text-sm"
                    value={editDraft.notes}
                    onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                    rows={3}
                    placeholder="Optional notes…"
                  />

                  {editDraft.type === "asian_hornet" && (
                    <>
                      <FieldLabel>Observed date</FieldLabel>
                      <input
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                        type="date"
                        value={editDraft.observed_at || ""}
                        onChange={(e) => setEditDraft((d) => ({ ...d, observed_at: e.target.value }))}
                      />
                    </>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 px-3 py-2 rounded-xl bg-black text-white text-sm"
                      onClick={saveNewMarker}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="flex-1 px-3 py-2 rounded-xl border text-sm"
                      onMouseDown={stopClickThrough}
                      onClick={pickAgain}
                      type="button"
                    >
                      Pick again
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Weather mini legend removed */}


        {/* Main Legend */}
        <div className="absolute bottom-3 left-3 z-[900] max-w-[260px] rounded-2xl bg-white/90 shadow border px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold">Legend</div>
            <button
              type="button"
              className="text-[11px] px-2 py-1 rounded-lg border bg-white hover:bg-slate-50"
              onClick={() => setShowLegend((v) => !v)}
            >
              {showLegend ? "Hide" : "Show"}
            </button>
          </div>

          {showLegend && (
            <div className="mt-2 space-y-1 opacity-90">
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <span>Apiary</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💧</span>
                <span>Water source</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌊</span>
                <span>Watercourse</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌼</span>
                <span>Forage hotspot</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>Asian hornet sighting</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌳</span>
                <span>Shelter / windbreak</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚫</span>
                <span>Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🅿️</span>
                <span>Access / parking</span>
              </div>

              <div className="mt-2 pt-2 border-t opacity-80">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-[2px] bg-amber-600" />
                  <span>~3 mile foraging ring</span>
                </div>

                <div className="mt-1 text-[11px] leading-snug opacity-70">
                  Indicative range only — bees may forage further depending on conditions.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiaryMapMarkers;
