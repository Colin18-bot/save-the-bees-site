// src/pages/Apiaries/EditApiary.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import dayjs from "dayjs";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { forwardGeocode } from "../../utils/geocode";
import {
  archiveItem,
  deleteRowWithPhoto,
  humaniseSupabaseError,
} from "../../services/actions";

// Leaflet default marker
const DefaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function DraggableMarker({ position, onMove }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, map.getZoom()); }, [position, map]);
  useMapEvents({
    click(e) { onMove([e.latlng.lat, e.latlng.lng]); },
  });
  return (
    <>
      <Marker
        position={position}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            onMove([lat, lng]);
          },
        }}
      />
      <Circle center={position} radius={5000} pathOptions={{ color: "green", fillOpacity: 0.1 }} />
    </>
  );
}

/** Extract { bucket, path } from a Supabase public URL */
function parseStoragePublicUrl(url) {
  if (!url) return null;

  // Strip any query string (e.g. ?t=123456) so we get the real object path
  const noQuery = url.split("?")[0];

  const m = noQuery.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

const EditApiary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // File/preview handling (stable URL + filename)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentObject, setCurrentObject] = useState(null);

  // Map & location
  const [mapCenter, setMapCenter] = useState([51.5, -3.2]); // Cardiff-ish fallback
  const [originalCenter, setOriginalCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    notes: "",
    established_date: dayjs().format("YYYY-MM-DD"),
    location_type: "",
    site_setting: "",
    is_default: false,
    photo_url: "",
    user_id: "",
  });

  // Clean up blob URL when it changes/unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("apiaries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading apiary:", error);
        alert("Failed to load apiary.");
        setLoading(false);
        return;
      }

      setFormData({
        name: data.name || "",
        latitude: data.latitude ?? "",
        longitude: data.longitude ?? "",
        notes: data.notes || "",
        established_date: data.established_date || dayjs().format("YYYY-MM-DD"),
        location_type: data.location_type || "",
        site_setting: data.site_setting || "",
        is_default: !!data.is_default,
        photo_url: data.photo_url || "",
        user_id: data.user_id || "",
      });

      // Existing image as initial preview
      setPreviewUrl(data.photo_url || null);
      setCurrentObject(parseStoragePublicUrl(data.photo_url));

      if (Number.isFinite(Number(data.latitude)) && Number.isFinite(Number(data.longitude))) {
        const pos = [Number(data.latitude), Number(data.longitude)];
        setMapCenter(pos);
        setOriginalCenter(pos);
      }

      setLoading(false);
    })();
  }, [id]);

  const moveMarker = (pos) => {
    setMapCenter(pos);
    setFormData((prev) => ({
      ...prev,
      latitude: String(pos[0]),
      longitude: String(pos[1]),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    } else {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(formData.photo_url || null);
    }
  };

  // Upload new file if selected; otherwise keep current URL
  const uploadPhoto = async () => {
    if (!selectedFile) {
      return { url: formData.photo_url, path: currentObject?.path || null };
    }

    const filename = `${id}-${Date.now()}-${selectedFile.name.replace(/\s+/g, "_")}`;
    const path = `apiaries/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, selectedFile, { upsert: true, contentType: selectedFile.type });

    if (uploadError) {
      console.error("Photo upload error:", uploadError);
      return { url: formData.photo_url, path: currentObject?.path || null };
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return { url: data.publicUrl, path };
  };

  const deletePhoto = async () => {
    if (currentObject?.bucket && currentObject?.path) {
      const { error } = await supabase.storage.from(currentObject.bucket).remove([currentObject.path]);
      if (error) {
        console.error("Photo delete error:", error);
        alert("Failed to delete photo.");
        return;
      }
    }
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, photo_url: "" }));

    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCurrentObject(null);
  };

  // Make this apiary the *only* default for this user (and sync profile)
  const setOnlyDefaultForUser = async (userId, thisApiaryId) => {
    if (!userId || !thisApiaryId) return;

    await supabase
      .from("apiaries")
      .update({ is_default: false })
      .eq("user_id", userId)
      .is("archived_at", null)
      .neq("id", thisApiaryId);

    await supabase.from("apiaries").update({ is_default: true }).eq("id", thisApiaryId);

    const { data: userWrap } = await supabase.auth.getUser();
    const uid = userWrap?.user?.id;
    if (uid && uid === userId) {
      await supabase.from("profiles").update({ default_apiary_id: thisApiaryId }).eq("user_id", uid);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { url: newUrl, path: newPath } = await uploadPhoto();

    if (newPath && currentObject?.path && (newUrl && newUrl !== formData.photo_url)) {
      await supabase.storage
        .from(currentObject.bucket || "photos")
        .remove([currentObject.path])
        .catch(() => {});
    }

    const toNum = (v) => (v === "" || v == null ? null : Number(v));
    const normalize = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
      );

    const normalized = normalize({
      ...formData,
      latitude: toNum(formData.latitude),
      longitude: toNum(formData.longitude),
      photo_url: newUrl || null,
    });

    const { is_default: wantDefault, ...rest } = normalized;

    const { error } = await supabase.from("apiaries").update(rest).eq("id", id);
    if (error) {
      console.error("Error updating apiary:", error);
      alert("Failed to update apiary.");
      return;
    }

    if (wantDefault) {
      await setOnlyDefaultForUser(rest.user_id, id);
    } else {
      await supabase.from("apiaries").update({ is_default: false }).eq("id", id);
    }

    alert("Apiary updated successfully!");
    navigate("/apiaries");
  };

  const handleDelete = async () => {
    const { data, error: checkErr } = await supabase.rpc("check_apiary_children", { apiary_id: id });
    if (checkErr) {
      console.error(checkErr);
      alert("Could not delete, linked items. Please try again.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    const { hives = 0, inspections = 0, todos = 0, logs = 0 } = row || {};
    const hasChildren = hives + inspections + todos + logs > 0;

    if (hasChildren) {
      const ok = window.confirm(
        `This apiary has:\n• ${hives} hives\n• ${inspections} inspections\n• ${todos} to-dos\n• ${logs} log entries\n\n` +
          `Archive instead?`
      );
      if (!ok) return;

      const { error: archErr } = await archiveItem("apiaries", id);
      if (archErr) {
        console.error(archErr);
        alert("Failed to archive apiary.");
        return;
      }
      alert("Apiary archived.");
      navigate("/apiaries");
      return;
    }

    if (!window.confirm("Delete this apiary permanently? This cannot be undone.")) return;

    const { error: delErr } = await deleteRowWithPhoto("apiaries", id, "photo_url");
    if (delErr) {
      alert(humaniseSupabaseError(delErr));
      return;
    }
    alert("Apiary deleted.");
    navigate("/apiaries");
  };

  const handleArchive = async () => {
    if (!window.confirm("Are you sure you want to archive this apiary?")) return;
    const { error } = await archiveItem("apiaries", id);
    if (error) {
      console.error("Archive error:", error);
      alert("Failed to archive apiary.");
    } else {
      alert("Apiary archived.");
      navigate("/apiaries");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const hit = await forwardGeocode(searchQuery.trim());
      if (!hit) {
        alert("No results found.");
        return;
      }
      moveMarker([hit.lat, hit.lon]);
    } catch (err) {
      console.error("Search error", err);
      if (String(err?.message || "").includes("VITE_LOCATIONIQ_KEY")) {
        alert("Missing LocationIQ key in .env");
      } else {
        alert("Search failed. Please try again.");
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Apiary</h1>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Apiary name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Apiary Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* Hidden lat/lon */}
          <input type="hidden" name="latitude" value={formData.latitude} readOnly />
          <input type="hidden" name="longitude" value={formData.longitude} readOnly />

          {/* Find & Map */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Find location</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search address or place"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 py-2 bg-yellow-500 text-[#1a3329] rounded hover:bg-yellow-600"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => (originalCenter ? moveMarker(originalCenter) : alert("No saved location."))}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reset Pin
              </button>
            </div>
            <div className="h-64 w-full overflow-hidden rounded border">
              <MapContainer
                center={mapCenter}
                zoom={13}
                className="clickable-map"
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <DraggableMarker position={mapCenter} onMove={moveMarker} />
              </MapContainer>
            </div>
          </div>

          {/* Location type & site setting */}
          <div className="flex gap-4">
            <select
              name="location_type"
              value={formData.location_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Location Type</option>
              <option value="Rural">Rural</option>
              <option value="Suburban">Suburban</option>
              <option value="Industrial">Industrial</option>
              <option value="Coastal">Coastal</option>
              <option value="Other">Other</option>
            </select>
            <select
              name="site_setting"
              value={formData.site_setting}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Site Setting</option>
              <option value="Backyard">Backyard</option>
              <option value="Mountainous">Mountainous</option>
              <option value="Forest">Forest</option>
              <option value="Rooftop">Rooftop</option>
              <option value="Farmland">Farmland</option>
              <option value="Meadow">Meadow</option>
              <option value="Moorland">Moorland</option>
              <option value="Orchard">Orchard</option>
              <option value="Heathland">Heathland</option>
              <option value="Wetland">Wetland</option>
              <option value="School Grounds">School Grounds</option>
              <option value="Cemetery">Cemetery</option>
              <option value="Urban Garden">Urban Garden</option>
              <option value="Allotment">Allotment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Default toggle */}
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} />
            <label>Set as Default Apiary</label>
          </div>

          {/* Established date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date Apiary Established</label>
            <input
              type="date"
              name="established_date"
              value={formData.established_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Notes */}
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes"
            className="w-full px-3 py-2 border rounded min-h-[100px]"
          />

          {/* Photo (responsive preview + filename) */}
          <div className="flex flex-col items-start gap-2">
            {previewUrl && (
              <div className="relative inline-flex flex-col items-start mb-2 max-w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 w-auto max-w-full object-contain rounded border"
                />
                <button
                  type="button"
                  onClick={deletePhoto}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
                >
                  ×
                </button>
                <div className="mt-1 text-xs text-gray-600 break-all">
                  {selectedFile?.name || "image"}
                </div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {/* ✅ Standard green submit button (two-tone + focus ring + consistent padding) */}
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={handleArchive}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => navigate("/apiaries")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditApiary;
