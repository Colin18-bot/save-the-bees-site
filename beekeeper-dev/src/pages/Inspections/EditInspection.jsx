// src/pages/Inspections/EditInspection.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { reverseGeocode } from "../../utils/geocode";
import {
  archiveItem,
  deleteRowAndRemoveUrls,
  humaniseSupabaseError,
} from "../../services/actions";

/* --- Option sets (mirror NewInspection.jsx) --- */
const COLONY_BEHAVIOUR_OPTS = ["Calm", "Aggressive", "Other"];
const ENVIRONMENTAL_SIGNS_OPTS = [
  "Entering/exiting",
  "Bringing in pollen",
  "Robbing",
  "Unusual odour",
  "Other",
];
const HIVE_POPULATION_OPTS = ["Low", "Moderate", "Strong"];
const BROOD_PATTERN_OPTS = ["Spotty", "Solid"];
const FOOD_STORES_OPTS = ["Low", "Moderate", "Full"];
const QUEEN_OPTIONS = ["Seen", "Eggs", "Capped brood", "Uncapped brood", "Other"];
const PEST_TYPES = ["Mice", "Ants", "Beetles", "Wax Moths", "Wasps", "Other"];
const DISEASE_TYPES = [
  "Varroa",
  "Chalkbrood",
  "Sacbrood",
  "EFB",
  "AFB",
  "Nosema",
  "Dead bees",
  "Other",
];

const toArray = (v) => {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return [s];
  }
  return [];
};

/** Extract { bucket, path } from a Supabase public URL */
function parseStoragePublicUrl(url) {
  if (!url) return null;
  const m = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

// WMO code map
const weatherCodeMap = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  56: "Light freezing drizzle", 57: "Dense freezing drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  66: "Light freezing rain", 67: "Heavy freezing rain",
  71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
};

const EditInspection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [apiaryLocation, setApiaryLocation] = useState(null);
  const [humanAddress, setHumanAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    apiary_id: "",
    hive_id: "",
    date: "",
    weather: "",
    weather_code: "", // ⬅️ keep code in sync with NewInspection
    colony_behavior: "",
    colony_behavior_other: "",
    environmental_signs: [],
    environmental_signs_other: "",
    hive_population: "",
    brood_pattern: "",
    food_stores: "",
    queen_status: [],
    queen_status_other: "",
    signs_disease: false,
    disease_types: [],
    disease_other: "",
    signs_pests: false,
    pest_types: [],
    pest_other: "",
    notes: "",
    photos: [],
  });

  const [originalPhotos, setOriginalPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // Premium/NFC helpers
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const [nfcSupported, setNfcSupported] = useState(false);

  const hiveById = useMemo(() => new Map(hives.map((h) => [h.id, h])), [hives]);
  const apiaryById = useMemo(() => new Map(apiaries.map((a) => [a.id, a])), [apiaries]);

  // Weather helper
  const fetchWeather = async (apiary, dateStr) => {
    if (!apiary?.latitude || !apiary?.longitude || !dateStr) {
      setFormData((f) => ({ ...f, weather: f.weather || "", weather_code: f.weather_code || "" }));
      return;
    }
    try {
      const day = new Date(dateStr).toISOString().slice(0, 10);
      const qs = new URLSearchParams({
        latitude: String(apiary.latitude),
        longitude: String(apiary.longitude),
        daily: "weather_code",
        start_date: day,
        end_date: day,
        timezone: "auto",
      }).toString();

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs}`);
      if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
      const data = await res.json();
      const times = data?.daily?.time || [];
      const idx = times.indexOf(day);
      if (idx !== -1 && idx != null) {
        const codes = data.daily.weather_code || data.daily.weathercode || [];
        const code = codes[idx];
        setFormData((f) => ({
          ...f,
          weather: weatherCodeMap[code] || "Unknown",
          weather_code: String(code ?? ""),
        }));
      } else {
        setFormData((f) => ({ ...f, weather: "", weather_code: "" }));
      }
    } catch (e) {
      console.error("Weather fetch failed:", e);
      setFormData((f) => ({ ...f, weather: "", weather_code: "" }));
    }
  };

  // NFC → resolve hive (case-insensitive)
  const resolveHiveByNfc = (uidRaw) => {
    if (!uidRaw) return { match: null, duplicates: false };
    const target = uidRaw.trim().toLowerCase();
    const matches = hives.filter(
      (h) => (h.nfc_uid || "").trim().toLowerCase() === target
    );
    if (matches.length > 1) return { match: null, duplicates: true };
    if (matches.length === 1) return { match: matches[0], duplicates: false };
    return { match: null, duplicates: false };
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setSaveError("");

      // Profile (premium)
      const { data: userWrap } = await supabase.auth.getUser();
      if (userWrap?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", userWrap.user.id)
          .maybeSingle();
        setSubscriptionLevel(profile?.subscription_level || "free");
      }

      const [apiaryRes, hiveRes] = await Promise.all([
        supabase.from("apiaries").select("id, name, latitude, longitude").is("archived_at", null),
        supabase.from("hives").select("id, name, apiary_id, nfc_uid, archived_at").is("archived_at", null),
      ]);
      setApiaries(apiaryRes.data || []);
      setHives(hiveRes.data || []);

      const { data, error } = await supabase.from("inspections").select("*").eq("id", id).single();

      if (error) {
        console.error("Error loading inspection:", error);
        setSaveError("Failed to load inspection.");
        setLoading(false);
        return;
      }

      const loadedPhotos = Array.isArray(data.photos) ? data.photos : [];
      setFormData({
        apiary_id: data.apiary_id || "",
        hive_id: data.hive_id || "",
        date: data.date || "",
        weather: data.weather || "",
        weather_code: data.weather_code ?? "", // ⬅️ keep code if present
        colony_behavior: String(data.colony_behavior ?? ""),
        colony_behavior_other: data.colony_behavior_other || "",
        environmental_signs: toArray(data.environmental_signs),
        environmental_signs_other: data.environmental_signs_other || "",
        hive_population: data.hive_population || "",
        brood_pattern: data.brood_pattern || "",
        food_stores: data.food_stores || "",
        queen_status: toArray(data.queen_status),
        queen_status_other: data.queen_status_other || "",
        signs_disease: Boolean(data.signs_disease),
        disease_types: toArray(data.disease_types),
        disease_other: data.disease_other || "",
        signs_pests: Boolean(data.signs_pests),
        pest_types: toArray(data.pest_types),
        pest_other: data.pest_other || "",
        notes: data.notes || "",
        photos: loadedPhotos,
      });
      setOriginalPhotos(loadedPhotos);

      // initial location + reverse geocode + weather
      if (data.apiary_id) {
        const apiary = apiaryRes.data?.find((a) => a.id === data.apiary_id);
        if (apiary?.latitude && apiary?.longitude) {
          setApiaryLocation({ lat: apiary.latitude, lon: apiary.longitude });
          try {
            const addr = await reverseGeocode(apiary.latitude, apiary.longitude);
            if (addr?.display) setHumanAddress(addr.display);
          } catch {
            setHumanAddress("");
          }
          if (data.date) fetchWeather(apiary, data.date);
        }
      }

      setLoading(false);
    };

    loadAll();
    if ("NDEFReader" in window) setNfcSupported(true);
  }, [id]);

  const hivesForApiary = useMemo(
    () => (formData.apiary_id ? hives.filter((h) => h.apiary_id === formData.apiary_id) : hives),
    [hives, formData.apiary_id]
  );

  useEffect(() => {
    setErrorMsg("");
    if (!formData.hive_id || !formData.apiary_id) return;
    const hive = hiveById.get(formData.hive_id);
    if (hive && hive.apiary_id !== formData.apiary_id) {
      setErrorMsg("That hive belongs to a different apiary.");
    }
  }, [formData.hive_id, formData.apiary_id, hiveById]);

  // ----- Change handlers -----
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    // boolean toggles
    if (type === "checkbox" && (name === "signs_pests" || name === "signs_disease")) {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // hive selection: auto-set apiary + refresh weather + address
    if (name === "hive_id") {
      setFormData((prev) => {
        const next = { ...prev, hive_id: value };
        const hive = hiveById.get(value);
        if (hive) {
          next.apiary_id = hive.apiary_id;
          const apiary = apiaryById.get(hive.apiary_id);
          if (apiary) {
            fetchWeather(apiary, prev.date || next.date);
            setApiaryLocation({ lat: apiary.latitude, lon: apiary.longitude });
            reverseGeocode(apiary.latitude, apiary.longitude)
              .then((addr) => setHumanAddress(addr?.display || ""))
              .catch(() => setHumanAddress(""));
          }
        }
        setErrorMsg("");
        return next;
      });
      return;
    }

    // apiary selection: refresh weather + address, clear mismatched hive
    if (name === "apiary_id") {
      setFormData((prev) => {
        let safeHiveId = prev.hive_id;
        const hive = hiveById.get(prev.hive_id);
        if (hive && hive.apiary_id !== value) {
          safeHiveId = "";
        }
        const next = { ...prev, apiary_id: value, hive_id: safeHiveId };
        const apiary = apiaryById.get(value);
        if (apiary) {
          fetchWeather(apiary, prev.date || next.date);
          setApiaryLocation({ lat: apiary.latitude, lon: apiary.longitude });
          reverseGeocode(apiary.latitude, apiary.longitude)
            .then((addr) => setHumanAddress(addr?.display || ""))
            .catch(() => setHumanAddress(""));
        } else {
          setApiaryLocation(null);
          setHumanAddress("");
        }
        if (safeHiveId === "" && prev.hive_id) {
          setErrorMsg("Previous hive was cleared because it doesn’t belong to the selected apiary.");
        } else {
          setErrorMsg("");
        }
        return next;
      });
      return;
    }

    // date change: refresh weather for selected apiary
    if (name === "date") {
      setFormData((prev) => {
        const next = { ...prev, date: value };
        const apiary = apiaryById.get(prev.apiary_id);
        if (apiary) fetchWeather(apiary, value);
        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectSingle = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const toggleInArray = (field, value) => {
    setFormData((prev) => {
      const set = new Set(prev[field] || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
  };
  const toggleQueen = (opt) => toggleInArray("queen_status", opt);

  /* ----- Photos ----- */
  useEffect(() => {
    return () => {
      newPreviews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
    };
  }, [newPreviews]);

  const onPickPhotos = (e) => {
    const filesPicked = Array.from(e.target.files || []);
    if (!filesPicked.length) return;
    const remainingSlots = Math.max(0, 3 - (formData.photos.length + newFiles.length));
    const selected = filesPicked.slice(0, remainingSlots);
    const urls = selected.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...selected]);
    setNewPreviews((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const removeNewPhotoAt = (idx) => {
    setNewPreviews((prev) => {
      const c = [...prev];
      const [removed] = c.splice(idx, 1);
      if (removed?.startsWith("blob:")) URL.revokeObjectURL(removed);
      return c;
    });
    setNewFiles((prev) => {
      const c = [...prev];
      c.splice(idx, 1);
      return c;
    });
  };
  const removeExistingPhotoAt = (idx) => {
    setFormData((prev) => {
      const c = [...prev.photos];
      c.splice(idx, 1);
      return { ...prev, photos: c };
    });
  };

  const uploadNewFiles = async () => {
    if (!newFiles.length) return [];
    const uploaded = [];
    for (const file of newFiles) {
      const safeName = file.name.replace(/\s+/g, "_");
      const filename = `${id}-${Date.now()}-${safeName}`;
      const path = `inspections/${filename}`;
      const { error: upErr } = await supabase.storage
        .from("photos")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) {
        console.error("Upload error:", upErr);
        continue;
      }
      const { data } = supabase.storage.from("photos").getPublicUrl(path);
      if (data?.publicUrl) uploaded.push(data.publicUrl);
    }
    return uploaded;
  };

  // ----- NFC scan (premium only) -----
  const handleNfcScan = async () => {
    if (subscriptionLevel !== "premium") return;
    try {
      const reader = new window.NDEFReader();
      await reader.scan();
      reader.onreading = async (event) => {
        const uid = event.serialNumber || "";
        if (!uid) return;

        const { match, duplicates } = resolveHiveByNfc(uid);
        if (duplicates) {
          setSaveError("This NFC tag is assigned to multiple hives. Please resolve duplicates first.");
          return;
        }
        if (match) {
          setSaveError("");
          setFormData((prev) => {
            const next = { ...prev, hive_id: match.id, apiary_id: match.apiary_id };
            const apiary = apiaryById.get(match.apiary_id);
            if (apiary) {
              fetchWeather(apiary, prev.date || next.date);
              setApiaryLocation({ lat: apiary.latitude, lon: apiary.longitude });
              reverseGeocode(apiary.latitude, apiary.longitude)
                .then((addr) => setHumanAddress(addr?.display || ""))
                .catch(() => setHumanAddress(""));
            }
            return next;
          });
          alert(`NFC tag detected and hive selected: ${match.name}`);
        } else {
          alert("No hive found for this NFC tag.");
        }
      };
    } catch (err) {
      console.error("NFC scan error:", err);
      alert("Failed to start NFC scan. Your browser/device may not support it.");
    }
  };

  // ----- Save / Archive / Delete -----
  const handleSave = async (e) => {
    e.preventDefault();
    if (errorMsg) return;
    setSaving(true);
    setSaveError("");

    // Guard: prevent saving to archived parents
    if (formData.apiary_id) {
      const { data: parentApiary } = await supabase
        .from("apiaries")
        .select("archived_at, latitude, longitude")
        .eq("id", formData.apiary_id)
        .single();
      if (parentApiary?.archived_at) {
        setSaving(false);
        setSaveError("Selected apiary is archived. Choose an active apiary.");
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
        setSaveError("Selected hive is archived. Choose an active hive.");
        return;
      }
    }

    const uploadedUrls = await uploadNewFiles();
    const removed = originalPhotos.filter((oldUrl) => !formData.photos.includes(oldUrl));
    const { archived, ...rest } = formData;

    // Build payload with DB-friendly nulls
    const payload = {
      ...rest,
      queen_status: Array.isArray(rest.queen_status) && rest.queen_status.length ? rest.queen_status : null,
      environmental_signs:
        Array.isArray(rest.environmental_signs) && rest.environmental_signs.length ? rest.environmental_signs : null,
      disease_types: rest.signs_disease
        ? (Array.isArray(rest.disease_types) && rest.disease_types.length ? rest.disease_types : null)
        : null,
      pest_types: rest.signs_pests
        ? (Array.isArray(rest.pest_types) && rest.pest_types.length ? rest.pest_types : null)
        : null,
      disease_other: rest.signs_disease ? (rest.disease_other || null) : null,
      pest_other: rest.signs_pests ? (rest.pest_other || null) : null,
      weather: rest.weather || null,
      weather_code: rest.weather_code || null, // ⬅️ persist code too
      photos: [...rest.photos, ...uploadedUrls].slice(0, 3),
    };

    // Save
    const { error } = await supabase.from("inspections").update(payload).eq("id", id);

    // Remove any storage objects that the user removed from the list
    if (!error && removed.length) {
      const pathsByBucket = new Map();
      for (const u of removed) {
        const parsed = parseStoragePublicUrl(u);
        if (!parsed) continue;
        if (!pathsByBucket.has(parsed.bucket)) pathsByBucket.set(parsed.bucket, []);
        pathsByBucket.get(parsed.bucket).push(parsed.path);
      }
      for (const [bucket, paths] of pathsByBucket.entries()) {
        try { await supabase.storage.from(bucket).remove(paths); } catch {}
      }
    }

    newPreviews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
    setNewPreviews([]); setNewFiles([]); setSaving(false);

    if (error) {
      console.error("Update failed", error);
      setSaveError("Failed to update inspection. " + (error.message || ""));
      return;
    }
    navigate("/inspections");
  };

  const handleArchive = async () => {
    if (!window.confirm("Are you sure you want to archive this inspection?")) return;
    const { error } = await archiveItem("inspections", id);
    if (error) {
      alert(humaniseSupabaseError(error) || "Failed to archive inspection.");
      return;
    }
    navigate("/inspections");
  };

  const handleDelete = async () => {
    const { data, error: checkErr } = await supabase.rpc("check_inspection_children", { inspection_id: id });
    if (checkErr) {
      console.error(checkErr);
      alert("Could not delete, linked items. Please try again.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    const { logs = 0, todos = 0 } = row || {};
    const hasChildren = (logs + todos) > 0;

    if (hasChildren) {
      const ok = window.confirm(
        `This inspection has:\n• ${logs} logbook entr${logs === 1 ? "y" : "ies"}${todos ? `\n• ${todos} to-do${todos === 1 ? "" : "s"}` : ""}\n\n` +
        `Archive instead? This will archive the inspection and those linked items.`
      );
      if (!ok) return;

      const { error: archErr } = await archiveItem("inspections", id);
      if (archErr) {
        console.error(archErr);
        alert("Failed to archive inspection.");
        return;
      }
      alert("Inspection archived.");
      navigate("/inspections");
      return;
    }

    if (!window.confirm("Delete this inspection permanently? This cannot be undone.")) return;

    const { error: delErr } = await deleteRowAndRemoveUrls("inspections", id, "photos");
    if (delErr) {
      alert(humaniseSupabaseError(delErr) || "Failed to delete inspection.");
      return;
    }
    alert("Inspection deleted.");
    navigate("/inspections");
  };

  const showColonyOther = formData.colony_behavior === "Other";
  const showEnvOther = formData.environmental_signs.includes("Other");
  const showPestOther = formData.pest_types.includes("Other");
  const showDiseaseOther = formData.disease_types.includes("Other");
  const totalPhotos = formData.photos.length + newFiles.length;
  const canAddMorePhotos = totalPhotos < 3;

  const selectedHive = hiveById.get(formData.hive_id);
  const selectedHiveNfc = selectedHive?.nfc_uid || "";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Inspection</h1>

      {/* Premium NFC helpers (scan to select hive) */}
      {subscriptionLevel === "premium" && nfcSupported && (
        <div className="mb-4 p-3 border rounded bg-blue-50 text-blue-900 flex items-center justify-between">
          <div className="text-sm">
            Tap an NFC tag to quickly select its hive.
            {selectedHiveNfc && (
              <span className="ml-2">
                Current hive NFC: <span className="font-mono">{selectedHiveNfc}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleNfcScan}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Scan NFC
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          {/* Apiary/Hive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Apiary</label>
              <select
                name="apiary_id"
                value={formData.apiary_id}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Apiary</option>
                {apiaries.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {apiaryLocation && humanAddress && (
                <p className="text-xs text-gray-600 mt-1">{humanAddress}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hive</label>
              <select
                name="hive_id"
                value={formData.hive_id}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Hive</option>
                {hivesForApiary.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
              {selectedHiveNfc && (
                <div className="text-xs text-gray-600 mt-1">
                  NFC: <span className="font-mono">{selectedHiveNfc}</span>
                </div>
              )}
            </div>
          </div>

          {/* Date / Weather */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weather</label>
              <input
                type="text"
                name="weather"
                value={formData.weather || ""}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
                placeholder="(auto)"
              />
            </div>
          </div>

          {/* Colony Behaviour */}
          <div>
            <label className="block text-sm font-medium mb-1">Colony Behaviour</label>
            <select
              name="colony_behavior"
              value={formData.colony_behavior}
              onChange={onSelectSingle("colony_behavior")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              {COLONY_BEHAVIOUR_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {formData.colony_behavior === "Other" && (
              <input
                type="text"
                name="colony_behavior_other"
                value={formData.colony_behavior_other}
                onChange={onChange}
                placeholder="Describe other behavior"
                className="w-full border rounded px-3 py-2 mt-2"
              />
            )}
          </div>

          {/* Environmental Signs (multi) */}
          <div className="border rounded p-3">
            <div className="font-medium mb-2">Environmental Signs (select all that apply)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ENVIRONMENTAL_SIGNS_OPTS.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.environmental_signs.includes(opt)}
                    onChange={() => toggleInArray("environmental_signs", opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {formData.environmental_signs.includes("Other") && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Environmental Signs — Other</label>
                <input
                  type="text"
                  name="environmental_signs_other"
                  value={formData.environmental_signs_other}
                  onChange={onChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}
          </div>

          {/* Hive Population / Brood Pattern / Food Stores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hive Population</label>
              <select
                name="hive_population"
                value={formData.hive_population}
                onChange={onSelectSingle("hive_population")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                {HIVE_POPULATION_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Brood Pattern</label>
              <select
                name="brood_pattern"
                value={formData.brood_pattern}
                onChange={onSelectSingle("brood_pattern")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                {BROOD_PATTERN_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Food Stores</label>
              <select
                name="food_stores"
                value={formData.food_stores}
                onChange={onSelectSingle("food_stores")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                {FOOD_STORES_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Queen Status (multi) */}
          <div className="border rounded p-3">
            <div className="font-medium mb-2">Queen Status (select all that apply)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {QUEEN_OPTIONS.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.queen_status.includes(opt)}
                    onChange={() => toggleQueen(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {formData.queen_status.includes("Other") && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Queen Other</label>
                <input
                  type="text"
                  name="queen_status_other"
                  value={formData.queen_status_other}
                  onChange={onChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}
          </div>

          {/* Pests / Disease */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="signs_pests" checked={formData.signs_pests} onChange={onChange} />
                <span className="font-medium">Signs of Pests</span>
              </label>
              {formData.signs_pests && (
                <>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {PEST_TYPES.map((p) => (
                      <label key={p} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.pest_types.includes(p)}
                          onChange={() => toggleInArray("pest_types", p)}
                        />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                  {formData.pest_types.includes("Other") && (
                    <input
                      type="text"
                      name="pest_other"
                      value={formData.pest_other}
                      onChange={onChange}
                      placeholder="Describe other pest"
                      className="w-full border rounded px-3 py-2 mt-2"
                    />
                  )}
                </>
              )}
            </div>

            <div className="border rounded p-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="signs_disease" checked={formData.signs_disease} onChange={onChange} />
                <span className="font-medium">Signs of Disease</span>
              </label>
              {formData.signs_disease && (
                <>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {DISEASE_TYPES.map((d) => (
                      <label key={d} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.disease_types.includes(d)}
                          onChange={() => toggleInArray("disease_types", d)}
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                  {formData.disease_types.includes("Other") && (
                    <input
                      type="text"
                      name="disease_other"
                      value={formData.disease_other}
                      onChange={onChange}
                      placeholder="Describe other disease"
                      className="w-full border rounded px-3 py-2 mt-2"
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Photos: existing + new, max 3 total */}
          <div>
            <div className="font-medium mb-2">Photos (max 3)</div>

            {/* Existing */}
            {formData.photos.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {formData.photos.map((url, idx) => (
                  <div key={url + idx} className="relative">
                    <img src={url} alt="Inspection" className="w-24 h-24 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhotoAt(idx)}
                      className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New (not uploaded yet) */}
            {newPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {newPreviews.map((u, idx) => (
                  <div key={u + idx} className="relative">
                    <img src={u} alt="New" className="w-24 h-24 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removeNewPhotoAt(idx)}
                      className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={onPickPhotos}
              className="block"
              disabled={!canAddMorePhotos}
            />
            {!canAddMorePhotos && <p className="text-sm text-red-600 mt-1">Maximum of 3 photos reached.</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Inspector Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows={3}
              className="w-full border rounded px-3 py-2"
              placeholder="Add any additional notes…"
            />
          </div>

          {/* Errors */}
          {(saveError || errorMsg) && (
            <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
              {saveError || errorMsg}
            </div>
          )}

                    {/* Actions */}
          <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || Boolean(errorMsg)}
              className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleArchive}
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded"
            >
              Archive
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded"
            >
              Delete
            </button>

            <button
              type="button"
              onClick={() => navigate("/inspections")}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
            >
              Cancel
            </button>
          </div>

        </form>
      )}
    </div>
  );
};

export default EditInspection;
