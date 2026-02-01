import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  LayersControl,
  ZoomControl,
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
    className: "", // keep clean (no default white box)
    html: svg,
    iconSize: [44, 56],
    iconAnchor: [22, 56], // bottom center of pin
    popupAnchor: [0, -56],
  });
};

// --- Icons by type (simple, clear, user-friendly)
const icons = {
  apiary: svgIcon("🏠", "#166534"), // green
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

// ✅ NEW: subtle, collapsible legend (bottom-left)
function MapLegend() {
  const [open, setOpen] = useState(true);

  const items = [
    { icon: "🏠", label: "Apiary" },
    { icon: "🌼", label: "Forage hotspot" },
    { icon: "💧", label: "Water source" },
    { icon: "🌊", label: "Watercourse" },
    { icon: "⚠️", label: "Asian hornet sighting" },
    { icon: "🌳", label: "Shelter / windbreak" },
    { icon: "🅿️", label: "Access / parking" },
    { icon: "🚫", label: "Risk" },
    { icon: "📍", label: "Other" },
  ];

  return (
    <div className="absolute bottom-3 left-3 z-[900] pointer-events-none">
      <div className="pointer-events-auto rounded-2xl bg-white/90 shadow border border-slate-200 backdrop-blur px-3 py-2 max-w-[240px]">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-700">Legend</div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50"
            aria-label={open ? "Collapse legend" : "Expand legend"}
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>

        {open && (
          <div className="mt-2 space-y-1">
            {items.map((it) => (
              <div key={it.label} className="flex items-center gap-2 text-xs text-slate-700">
                <span className="inline-flex items-center justify-center w-5">{it.icon}</span>
                <span>{it.label}</span>
              </div>
            ))}

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-700">
              <span className="inline-flex items-center justify-center w-5">⭕</span>
              <span>3-mile foraging radius</span>
            </div>

            <div className="mt-1 text-[11px] text-slate-500 leading-snug">
              Indicative range only — bees may forage further depending on conditions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TapToAddMarker({ isAddMode, onPick }) {
  useMapEvents({
    click(e) {
      if (!isAddMode) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
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

  // Dropdown options
  const [apiaryOptions, setApiaryOptions] = useState([]);

  const [isAddMode, setIsAddMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState(null);

  // Popup edit state (one marker at a time)
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ type: "forage", title: "", notes: "", observed_at: "" });

  const markerCount = markers.length;

  // ✅ measure header height so popups never hide under it
  const headerRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);

  useEffect(() => {
    const measure = () => setHeaderH(headerRef.current?.offsetHeight || 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const center = useMemo(() => {
    if (!apiary?.latitude || !apiary?.longitude) return [51.4816, -3.1791]; // fallback (Cardiff-ish)
    return [Number(apiary.latitude), Number(apiary.longitude)];
  }, [apiary]);

  // Load apiary list for dropdown (active apiaries)
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

    // 1) Load apiary
    const { data: apiaryData, error: apiaryErr } = await supabase
      .from("apiaries")
      .select("id, name, latitude, longitude, address")
      .eq("id", apiaryId)
      .single();

    if (apiaryErr) {
      console.error(apiaryErr);
      alert("Could not load apiary.");
      setLoading(false);
      return;
    }

    // 2) Load markers for this apiary
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
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiaryId]);

  const startAdd = () => {
    setIsAddMode(true);
    setPendingPoint(null);
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

  return (
    <div className="relative w-full" style={{ height: "100dvh" }}>
      {/* Top bar */}
      <div ref={headerRef} className="absolute top-0 left-0 right-0 z-[1000] p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl bg-white/95 shadow px-3 py-2">
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
            </div>

            <div className="text-xs opacity-70 truncate">{apiary.address || " "}</div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              className="text-sm px-3 py-2 rounded-xl border hover:bg-gray-50"
              onClick={() => navigate(-1)}
              type="button"
            >
              Back
            </button>

            {!isAddMode ? (
              <button
                className="text-sm px-3 py-2 rounded-xl bg-black text-white hover:opacity-90"
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

        {isAddMode && (
          <div className="mt-2 rounded-2xl bg-white/95 shadow px-3 py-2 text-xs">
            {pendingPoint ? (
              <div className="opacity-80">Marker location selected. Fill details below and save.</div>
            ) : (
              <div className="opacity-80">Tap the map to drop a marker.</div>
            )}
          </div>
        )}
      </div>

      {/* Map padded down by header height */}
      <div style={{ paddingTop: headerH, height: "100%" }}>
        {/* ✅ Legend sits above the map (bottom-left) */}
        <MapLegend />

        <MapContainer center={center} zoom={15} zoomControl={false} className="h-full w-full">
          <ZoomControl position="bottomright" />

          <LayersControl position="bottomright">
            <LayersControl.BaseLayer checked name="Map">
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <TapToAddMarker
            isAddMode={isAddMode}
            onPick={(pt) => {
              if (!pendingPoint) openAddFormForPoint(pt);
            }}
          />

          {apiary.latitude && apiary.longitude && (
            <Marker position={[Number(apiary.latitude), Number(apiary.longitude)]} icon={icons.apiary}>
              <Popup>
                <div className="text-sm font-semibold">{apiary.name}</div>
                {apiary.address ? <div className="text-xs opacity-70">{apiary.address}</div> : null}
              </Popup>
            </Marker>
          )}

          <Circle
            center={[Number(apiary.latitude), Number(apiary.longitude)]}
            radius={4828}
            pathOptions={{
              color: "#CA8A04",
              weight: 2,
              opacity: 0.8,
              fillColor: "#FDE68A",
              fillOpacity: 0.2,
              dashArray: "6,6",
            }}
          >
            <Popup>
              <div className="text-sm font-semibold">Typical foraging range</div>
              <div className="text-xs opacity-70">Approx. 3 miles from apiary</div>
            </Popup>
          </Circle>

          {markers.map((m) => (
            <Marker key={m.id} position={[Number(m.latitude), Number(m.longitude)]} icon={iconByType(m.type)}>
              <Popup>
                {editingId === m.id ? (
                  <div className="w-[240px]">
                    <div className="text-sm font-semibold mb-2">Edit marker</div>

                    <label className="text-xs opacity-70">Type</label>
                    <select
                      className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                      value={editDraft.type}
                      onChange={(e) => setEditDraft((d) => ({ ...d, type: e.target.value }))}
                    >
                      {MARKER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <label className="text-xs opacity-70">Title</label>
                    <input
                      className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                      value={editDraft.title}
                      onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder={editDraft.type === "other" ? "What is this?" : "Optional (e.g. Ivy wall)"}
                    />

                    <label className="text-xs opacity-70">Notes</label>
                    <textarea
                      className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                      value={editDraft.notes}
                      onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                      rows={3}
                      placeholder="Optional notes…"
                    />

                    {editDraft.type === "asian_hornet" && (
                      <>
                        <label className="text-xs opacity-70">Observed date</label>
                        <input
                          className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                          type="date"
                          value={editDraft.observed_at || ""}
                          onChange={(e) => setEditDraft((d) => ({ ...d, observed_at: e.target.value }))}
                        />
                      </>
                    )}

                    <div className="flex gap-2 mt-2">
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
                  <div className="w-[240px]">
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

          {isAddMode && pendingPoint && (
            <Marker position={[pendingPoint.lat, pendingPoint.lng]} icon={iconByType(editDraft.type)}>
              <Popup>
                <div className="w-[240px]">
                  <div className="text-sm font-semibold mb-2">New marker</div>

                  <label className="text-xs opacity-70">Type</label>
                  <select
                    className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                    value={editDraft.type}
                    onChange={(e) => setEditDraft((d) => ({ ...d, type: e.target.value }))}
                  >
                    {MARKER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <label className="text-xs opacity-70">Title</label>
                  <input
                    className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                    value={editDraft.title}
                    onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                    placeholder={editDraft.type === "other" ? "What is this?" : "Optional (e.g. Pond behind gate)"}
                  />

                  <label className="text-xs opacity-70">Notes</label>
                  <textarea
                    className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                    value={editDraft.notes}
                    onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                    rows={3}
                    placeholder="Optional notes…"
                  />

                  {editDraft.type === "asian_hornet" && (
                    <>
                      <label className="text-xs opacity-70">Observed date</label>
                      <input
                        className="w-full border rounded-lg px-2 py-1 text-sm mb-2"
                        type="date"
                        value={editDraft.observed_at || ""}
                        onChange={(e) => setEditDraft((d) => ({ ...d, observed_at: e.target.value }))}
                      />
                    </>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      className="flex-1 px-3 py-2 rounded-xl bg-black text-white text-sm"
                      onClick={saveNewMarker}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="flex-1 px-3 py-2 rounded-xl border text-sm"
                      onClick={() => setPendingPoint(null)}
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
      </div>
    </div>
  );
};

export default ApiaryMapMarkers;
