// src/pages/Logbook/EditLogEntry.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  archiveItem,
  deleteRowAndRemoveUrls,
  humaniseSupabaseError,
} from "../../services/actions";

// The choices shown in the "Log Entry" dropdown
const LOG_TYPES = [
  "Fed Bees",
  "Mite Assessment",
  "Treatment",
  "Winter Prep.",
  "Dead Hive",
  "Requeen",
  "Harvesting",
];

// Extract { bucket, path } from a Supabase public URL like:
// https://.../storage/v1/object/public/<bucket>/<path>
function parseStoragePublicUrl(url) {
  if (!url) return null;
  const m = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

const EditLogEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    log_type: "",
    custom_log_type: "", // shown only when "Other" is chosen
    date: "",
    entry: "",
    apiary_id: "",
    hive_id: "",
    inspection_id: "",
    photo_url: "",
  });

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentObject, setCurrentObject] = useState(null); // {bucket, path} for the existing photo

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load entry + apiaries (and pre-compute custom/other state)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const [{ data: entry, error: entryErr }, { data: apiaryData, error: apiErr }] = await Promise.all([
        supabase.from("logbook").select("*").eq("id", id).single(),
        supabase.from("apiaries").select("id, name").is("archived_at", null).order("name"),
      ]);

      if (entryErr) {
        setError(entryErr.message || "Failed to load entry.");
        setLoading(false);
        return;
      }
      if (apiErr) {
        setError(apiErr.message || "Failed to load apiaries.");
      }

      // Decide if log_type is one of our options or a custom value
      const loadedType = entry?.log_type || "";
      const isKnown = LOG_TYPES.includes(loadedType);
      const dropdownValue = isKnown ? loadedType : (loadedType ? "Other" : "");

      setFormData({
        log_type: dropdownValue,
        custom_log_type: isKnown ? "" : (loadedType || ""),
        date: entry?.date || "",
        entry: entry?.entry || "",
        apiary_id: entry?.apiary_id || "",
        hive_id: entry?.hive_id || "",
        inspection_id: entry?.inspection_id || "",
        photo_url: entry?.photo_url || "",
      });

      setPhotoPreview(entry?.photo_url || null);
      setCurrentObject(parseStoragePublicUrl(entry?.photo_url));
      setApiaries(apiaryData || []);
      setLoading(false);
    };

    load();
  }, [id]);

  // Load hives (active) + inspections (active) when apiary changes
  useEffect(() => {
    const loadHives = async () => {
      if (!formData.apiary_id) {
        setHives([]);
        setInspections([]);
        return;
      }
      const [{ data: hiveData }, { data: inspData }] = await Promise.all([
        supabase
          .from("hives")
          .select("id, name")
          .eq("apiary_id", formData.apiary_id)
          .is("archived_at", null)
          .order("name"),
        supabase
          .from("inspections")
          .select("id, date, hive_id, archived_at")
          .eq("apiary_id", formData.apiary_id)
          .is("archived_at", null)
          .order("date", { ascending: false }),
      ]);
      setHives(hiveData || []);
      setInspections(inspData || []);
    };
    loadHives();
  }, [formData.apiary_id]);

  // Pretty date for inspection dropdown
  const formatUKDateLabel = (iso) => {
    if (!iso) return "(no date)";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset dependent fields if apiary changes
    if (name === "apiary_id") {
      setFormData((prev) => ({
        ...prev,
        apiary_id: value,
        hive_id: "",
        inspection_id: "",
      }));
      return;
    }

    // If user switches off "Other", clear custom text so we don't accidentally save stale value
    if (name === "log_type") {
      setFormData((prev) => ({
        ...prev,
        log_type: value,
        custom_log_type: value === "Other" ? prev.custom_log_type : "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show preview
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Upload selected file (if any). Return { url, path }.
  const uploadPhoto = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return { url: formData.photo_url, path: currentObject?.path || null };

    const filename = `${id}-${Date.now()}-${file.name}`;
    const path = `logbook/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("Upload error", uploadError);
      return { url: formData.photo_url, path: currentObject?.path || null };
    }

    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return { url: data.publicUrl, path };
  };

  // Remove current photo immediately from storage and clear form state
  const handleRemovePhoto = async () => {
    if (currentObject?.bucket && currentObject?.path) {
      await supabase.storage.from(currentObject.bucket).remove([currentObject.path]).catch(() => {});
    }
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo_url: "" }));
    setCurrentObject(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const saveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Effective log_type (Other -> free text)
    let effectiveType = formData.log_type;
    if (formData.log_type === "Other") {
      effectiveType = (formData.custom_log_type || "").trim();
    }
    if (!effectiveType) {
      setSaving(false);
      setError("Please choose a Log Entry type or enter a custom value.");
      return;
    }

    // Defensive: block saving into archived parents (in case of race conditions)
    if (formData.apiary_id) {
      const { data: parentApiary } = await supabase
        .from("apiaries")
        .select("archived_at")
        .eq("id", formData.apiary_id)
        .single();
      if (parentApiary?.archived_at) {
        setSaving(false);
        setError("Selected apiary is archived. Choose an active apiary.");
        return;
      }
    }
    if (formData.hive_id) {
      const { data: parentHive } = await supabase
        .from("hives")
        .select("archived_at")
        .eq("id", formData.hive_id)
        .single();
      if (parentHive?.archived_at) {
        setSaving(false);
        setError("Selected hive is archived. Choose an active hive.");
        return;
      }
    }
    if (formData.inspection_id) {
      const { data: insp } = await supabase
        .from("inspections")
        .select("archived_at")
        .eq("id", formData.inspection_id)
        .single();
      if (insp?.archived_at) {
        setSaving(false);
        setError("Selected inspection is archived. Choose an active inspection or clear the field.");
        return;
      }
    }

    // Upload new photo (if chosen). If a different photo replaces an existing one, delete old.
    const { url: newUrl, path: newPath } = await uploadPhoto();

    if (newPath && currentObject?.path && newUrl && newUrl !== formData.photo_url) {
      await supabase.storage.from(currentObject.bucket || "photos").remove([currentObject.path]).catch(() => {});
    }

    const { error: upErr } = await supabase
      .from("logbook")
      .update({
        log_type: effectiveType,
        date: formData.date || null,
        entry: formData.entry,
        apiary_id: formData.apiary_id || null,
        hive_id: formData.hive_id || null,
        inspection_id: formData.inspection_id || null,
        photo_url: newUrl || "",
      })
      .eq("id", id);

    setSaving(false);
    if (upErr) {
      setError(upErr.message || "Failed to update entry.");
      return;
    }
    navigate("/logbook");
  };

  // Archive via shared helper
  const archiveEntry = async () => {
    if (!confirm("Are you sure you want to archive this log entry?")) return;
    const { error: upErr } = await archiveItem("logbook", id);
    if (upErr) {
      alert(humaniseSupabaseError(upErr) || "Failed to archive.");
      return;
    }
    alert("Log entry archived.");
    navigate("/logbook");
  };

  // Hard delete via shared helper (includes storage cleanup)
  const deleteEntry = async () => {
    if (!confirm("Are you sure you want to delete this log entry? This cannot be undone.")) return;

    const { error: delErr } = await deleteRowAndRemoveUrls("logbook", id, "photo_url");
    if (delErr) {
      // Handle FK errors gracefully (e.g., if something ever references this entry)
      const msg =
        delErr?.code === "23503"
          ? "Delete blocked by linked data (foreign key). Try archiving instead."
          : humaniseSupabaseError(delErr) || "Failed to delete.";
      alert(msg);
      return;
    }
    alert("Log entry deleted.");
    navigate("/logbook");
  };

  if (loading) return <div className="p-6">Loading…</div>;

  // Filter inspections: if a hive is chosen, show those for the selected hive; otherwise show all in apiary
  const filteredInspections = (inspections || []).filter((i) =>
    formData.hive_id ? i.hive_id === formData.hive_id : true
  );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Log Entry</h1>

      <form onSubmit={saveChanges} className="space-y-6">
        {/* Log Entry (type) */}
        <div className="space-y-1">
          <label htmlFor="log_type" className="block text-sm font-medium">
            Log Entry
          </label>
          <select
            id="log_type"
            name="log_type"
            value={formData.log_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          >
            <option value="">Select</option>
            {LOG_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>

          {formData.log_type === "Other" && (
            <input
              name="custom_log_type"
              value={formData.custom_log_type}
              onChange={handleChange}
              placeholder="Describe this log entry type"
              className="w-full px-3 py-2 border rounded mt-2"
            />
          )}
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label htmlFor="date" className="block text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          />
        </div>

        {/* Apiary + Hive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="apiary_id" className="block text-sm font-medium">
              Apiary
            </label>
            <select
              id="apiary_id"
              name="apiary_id"
              value={formData.apiary_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none"
              required
            >
              <option value="">Select Apiary</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="hive_id" className="block text-sm font-medium">
              Hive
            </label>
            {!formData.apiary_id ? (
              <select
                id="hive_id"
                name="hive_id"
                value=""
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-500"
              >
                <option value="">Select an apiary first</option>
              </select>
            ) : hives.length === 0 ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                This apiary has no hives yet. <Link className="underline" to="/hives/new">Add a hive</Link> first.
              </div>
            ) : (
              <select
                id="hive_id"
                name="hive_id"
                value={formData.hive_id || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none"
              >
                <option value="">Select Hive</option>
                {hives.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Related Inspection (optional) — shows dates */}
        <div className="space-y-1">
          <label htmlFor="inspection_id" className="block text-sm font-medium">
            Related Inspection (optional)
          </label>
          <select
            id="inspection_id"
            name="inspection_id"
            value={formData.inspection_id || ""}
            onChange={handleChange}
            className="w-full min-w-[260px] border rounded px-3 pr-8 py-2 focus:outline-none"
          >
            <option value="">None</option>
            {filteredInspections.map((i) => (
              <option key={i.id} value={i.id}>
                {`Inspection ${formatUKDateLabel(i.date)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label htmlFor="entry" className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="entry"
            name="entry"
            value={formData.entry || ""}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            placeholder="Describe what happened…"
          />
        </div>

        {/* Photo */}
        <div>
          <div className="flex flex-col items-start gap-2">
            {photoPreview && (
              <div className="relative" style={{ width: "8rem", height: "8rem" }}>
                <img
                  src={photoPreview}
                  alt="Log Entry"
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={archiveEntry}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={deleteEntry}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => navigate("/logbook")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLogEntry;
