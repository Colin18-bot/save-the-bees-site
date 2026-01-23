// src/pages/Logbook/NewLogEntry.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

const LOG_TYPES = [
  "Fed Bees",
  "Mite Assessment",
  "Treatment",
  "Winter Prep.",
  "Dead Hive",
  "Requeen",
  "Harvesting",
  "Other",
];

const todayISO = () => new Date().toISOString().split("T")[0];

const makeInitialForm = () => ({
  date: todayISO(),
  apiary_id: "",
  hive_id: "",
  all_hives: false,
  inspection_id: "",
  log_type_select: "",
  log_type_custom: "",
  entry: "",
});

function formatUKDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatHM(isoOrNull) {
  if (!isoOrNull) return "";
  const d = new Date(isoOrNull);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function NewLogEntry() {
  const navigate = useNavigate();
  const successRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);

  // New: stable preview + filename
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState(makeInitialForm());

  // --- lookup maps for labels
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

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("apiaries")
        .select("id, name")
        .is("archived_at", null)
        .order("name");
      setApiaries(data || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!form.apiary_id) {
        setHives([]);
        return;
      }
      const { data } = await supabase
        .from("hives")
        .select("id, name, apiary_id")
        .eq("apiary_id", form.apiary_id)
        .is("archived_at", null)
        .order("name");
      setHives(data || []);
    })();
  }, [form.apiary_id]);

  useEffect(() => {
    (async () => {
      if (!form.apiary_id) {
        setInspections([]);
        return;
      }
      // include created_at to get a time component if `date` is date-only
      let q = supabase
        .from("inspections")
        .select("id, date, created_at, apiary_id, hive_id")
        .eq("apiary_id", form.apiary_id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (!form.all_hives && form.hive_id) q = q.eq("hive_id", form.hive_id);

      const { data } = await q;
      setInspections(data || []);
    })();
  }, [form.apiary_id, form.hive_id, form.all_hives]);

  const hivesForApiary = useMemo(() => {
    if (!form.apiary_id) return [];
    return hives.filter((h) => h.apiary_id === form.apiary_id);
  }, [hives, form.apiary_id]);

  const noHives = form.apiary_id && hivesForApiary.length === 0;

  const onChange = (e) => {
    const { id, name, value } = e.target;
    const key = id || name;

    if (key === "apiary_id") {
      setForm((p) => ({
        ...p,
        apiary_id: value,
        hive_id: "",
        all_hives: false,
        inspection_id: "",
      }));
      return;
    }
    if (key === "hive_id") {
      if (value === "ALL_SPECIAL")
        setForm((p) => ({
          ...p,
          hive_id: "",
          all_hives: true,
          inspection_id: "",
        }));
      else
        setForm((p) => ({
          ...p,
          hive_id: value,
          all_hives: false,
          inspection_id: "",
        }));
      return;
    }

    setForm((p) => ({ ...p, [key]: value }));
  };

  // --- photo preview
  const onPickPhoto = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    } else {
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const removePhoto = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ✅ UPDATED: return BOTH { url, path }
  const uploadPhotoIfAny = async () => {
    if (!selectedFile) return { url: null, path: null };

    const safeName = selectedFile.name.replace(/\s+/g, "_");
    const filePath = `logbook/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from("photos")
      .upload(filePath, selectedFile, {
        contentType: selectedFile.type,
        upsert: true,
      });

    if (upErr) return { url: null, path: null, err: upErr.message };

    const { data } = supabase.storage.from("photos").getPublicUrl(filePath);
    return { url: data?.publicUrl || null, path: filePath };
  };

  const saveEntry = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.apiary_id) {
      setSaving(false);
      setError("Please select an apiary.");
      return;
    }
    if (!noHives && !form.all_hives && !form.hive_id) {
      setSaving(false);
      setError("Please select a hive or choose All Hives.");
      return;
    }

    let finalLogType = form.log_type_select;
    if (finalLogType === "Other") {
      finalLogType = form.log_type_custom.trim();
      if (!finalLogType) {
        setSaving(false);
        setError("Please enter a custom Log Entry name for 'Other'.");
        return;
      }
    } else if (!finalLogType) {
      setSaving(false);
      setError("Please choose a Log Entry type.");
      return;
    }

    // ✅ UPDATED: capture both url + path
    const { url: photo_url, path: photo_path } = await uploadPhotoIfAny();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      user_id: user?.id || null,
      date: form.date || null,
      apiary_id: form.apiary_id || null,
      hive_id: form.all_hives ? null : form.hive_id || null,
      all_hives: form.all_hives,
      inspection_id: form.inspection_id || null,
      log_type: finalLogType,
      entry: form.entry || "",
      photo_url: photo_url || null,
      photo_path: photo_path || null, // ✅ NEW
    };

    const { error: insertErr } = await supabase.from("logbook").insert([payload]);
    setSaving(false);
    if (insertErr) {
      setError(insertErr.message || "Failed to save log entry.");
      return;
    }

    setSuccess("Log entry saved successfully!");
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    await new Promise((r) => setTimeout(r, 1200));
    navigate("/logbook");
  };

  const handleCancel = () => {
    setForm(makeInitialForm());
    setError("");
    setSuccess("");
    removePhoto();
  };

  // ---- build grouped options for "Related Inspection"
  const inspectionsGroupedByDay = useMemo(() => {
    const map = new Map();
    for (const i of inspections) {
      const key =
        (i?.date ? i.date.slice(0, 10) : null) ||
        (i?.created_at ? i.created_at.slice(0, 10) : null);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(i);
    }
    for (const [, arr] of map.entries()) {
      arr.sort((a, b) => {
        const ta = new Date(a.date || a.created_at).getTime();
        const tb = new Date(b.date || b.created_at).getTime();
        if (tb !== ta) return tb - ta;
        const ha = (hiveNameById.get(a.hive_id) || "").toString();
        const hb = (hiveNameById.get(b.hive_id) || "").toString();
        return ha.localeCompare(hb);
      });
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [inspections, hiveNameById]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">New Hive Logbook Entry</h1>

      <form onSubmit={saveEntry} className="space-y-6">
        {/* Core fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="apiary_id" className="block text-sm font-medium mb-1">
              Apiary
            </label>
            <select
              id="apiary_id"
              value={form.apiary_id}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 focus:outline-none"
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

          <div>
            <label htmlFor="hive_id" className="block text-sm font-medium mb-1">
              Hive
            </label>
            {noHives ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                This apiary has no hives yet.{" "}
                <Link to="/hives/new" className="underline">
                  Add a hive
                </Link>{" "}
                first.
              </div>
            ) : (
              <select
                id="hive_id"
                value={form.all_hives ? "ALL_SPECIAL" : form.hive_id}
                onChange={onChange}
                className="w-full border rounded px-3 py-2 focus:outline-none"
                required
              >
                <option value="">Select a hive…</option>
                {hivesForApiary.length > 0 && (
                  <option value="ALL_SPECIAL">All Hives</option>
                )}
                {hivesForApiary.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Related Inspection (optional) */}
          <div className="md:col-span-2 lg:col-span-2">
            <label htmlFor="inspection_id" className="block text-sm font-medium mb-1">
              Related Inspection (optional)
            </label>
            <select
              id="inspection_id"
              value={form.inspection_id}
              onChange={onChange}
              className="w-full min-w-[260px] border rounded px-3 pr-8 py-2 focus:outline-none"
            >
              <option value="">None</option>
              {inspectionsGroupedByDay.map(([day, list]) => (
                <optgroup key={day} label={formatUKDateLabel(day)}>
                  {list.map((i) => {
                    const hiveName =
                      hiveNameById.get(i.hive_id) || "Unassigned hive";
                    const apiaryName =
                      apiaryNameById.get(i.apiary_id) || "Apiary";
                    const timeStr = formatHM(i.date) || formatHM(i.created_at);
                    const label = `${hiveName} (${apiaryName})${
                      timeStr ? ` • ${timeStr}` : ""
                    }`;
                    return (
                      <option key={i.id} value={i.id}>
                        {label}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Tip: change the Hive selector above to narrow inspections to that
              hive only.
            </p>
          </div>
        </div>

        {/* Log Entry type */}
        <div>
          <label className="block text-sm font-medium mb-1">Log Entry</label>
          <select
            id="log_type_select"
            value={form.log_type_select}
            onChange={onChange}
            className="w-full border rounded px-3 py-2 focus:outline-none"
            required
          >
            <option value="">Select type…</option>
            {LOG_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {form.log_type_select === "Other" && (
            <input
              id="log_type_custom"
              value={form.log_type_custom}
              onChange={onChange}
              placeholder="Enter custom log entry name"
              className="w-full border rounded px-3 py-2 focus:outline-none mt-2"
            />
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="entry" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            id="entry"
            value={form.entry}
            onChange={onChange}
            rows={4}
            className="w-full border rounded px-3 py-2 focus:outline-none"
            placeholder="Add details for this log entry…"
          />
        </div>

        {/* Photo upload (responsive container + filename) */}
        <div>
          <label className="block text-sm font-medium mb-1">Photo (optional)</label>
          {!previewUrl ? (
            <input
              type="file"
              accept="image/*"
              onChange={onPickPhoto}
              className="w-full border rounded px-3 py-2"
            />
          ) : (
            <div className="relative inline-flex flex-col items-start mb-2 max-w-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 w-auto max-w-full object-contain rounded border"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
                aria-label="Remove photo"
                title="Remove"
              >
                ×
              </button>
              <div className="mt-1 text-xs text-gray-600 break-all">
                {selectedFile?.name || "image"}
              </div>
            </div>
          )}
        </div>

        {/* Inline messages */}
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div
            ref={successRef}
            className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm"
          >
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500
                       disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? "Saving…" : "Save Entry"}
          </button>

          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
