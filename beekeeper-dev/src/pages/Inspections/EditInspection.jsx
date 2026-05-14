// src/pages/Inspections/EditInspection.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { reverseGeocode } from "../../utils/geocode";
import {
  archiveItem,
  humaniseSupabaseError,
  removeOneInspectionPhoto,
  smartDeleteInspection,
} from "../../services/actions";

import {
  formatDerivedWeather,
  getTempUnit,
} from "../../utils/formatDerivedWeather.js";

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
const FRAMES_OF_BEES_OPTS = ["1-2", "3-4", "5-6", "7-8", "9+"];
const QUEEN_CELLS_OPTS = ["None", "Cups", "Charged", "Sealed", "Supersedure"];
const BROOD_BOX_CONGESTION_OPTS = ["Low", "Medium", "High"];
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

// WMO code map
const weatherCodeMap = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const safeParseDerivedWeather = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s.startsWith("{")) return null;
  try {
    const obj = JSON.parse(s);
    if (!obj || typeof obj !== "object") return null;
    const desc = typeof obj.desc === "string" ? obj.desc : "";
    const temp_c = Number.isFinite(Number(obj.temp_c)) ? Number(obj.temp_c) : null;
    if (!desc && temp_c === null) return null;
    return { desc, temp_c };
  } catch {
    return null;
  }
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
    inspection_type: "full_inspection",
    date: "",
    weather: "",
    weather_code: "",
    weather_observed: "",
    colony_behavior: "",
    colony_behavior_other: "",
    environmental_signs: [],
    environmental_signs_other: "",
    hive_population: "",
    brood_pattern: "",
    food_stores: "",
    frames_of_bees: "",
    queen_cells: "",
    varroa_seen: false,
    brood_box_congestion: "",
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

  // ✅ Derived weather canonical storage (JSON string) + display string
  const [derivedWeatherJson, setDerivedWeatherJson] = useState("");
  const [derivedWeatherDisplay, setDerivedWeatherDisplay] = useState("");

  const [originalPhotos, setOriginalPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // keep these previews in a ref so we can clean up on unmount safely
  const previewsRef = useRef([]);
  useEffect(() => {
    previewsRef.current = newPreviews;
  }, [newPreviews]);

  // Premium/NFC helpers
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const [nfcSupported, setNfcSupported] = useState(false);

  // user id for storage paths
  const [userId, setUserId] = useState("");

  const hiveById = useMemo(() => new Map(hives.map((h) => [h.id, h])), [hives]);
  const apiaryById = useMemo(() => new Map(apiaries.map((a) => [a.id, a])), [apiaries]);

  const clearDerivedWeather = () => {
    setDerivedWeatherJson("");
    setDerivedWeatherDisplay("");
    setFormData((f) => ({ ...f, weather: "", weather_code: "" }));
  };

  // Weather helper (avg of min/max, canonical C)
  const fetchWeather = async (apiary, dateStr) => {
    const lat = Number(apiary?.latitude);
    const lon = Number(apiary?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !dateStr) {
      clearDerivedWeather();
      return;
    }

    try {
      const day = new Date(dateStr).toISOString().slice(0, 10);
      const qs = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        daily: "weather_code,temperature_2m_max,temperature_2m_min",
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
        const codes = data?.daily?.weather_code || data?.daily?.weathercode || [];
        const code = codes[idx];

        const tMaxArr = data?.daily?.temperature_2m_max || [];
        const tMinArr = data?.daily?.temperature_2m_min || [];
        const tMax = Number(tMaxArr[idx]);
        const tMin = Number(tMinArr[idx]);

        const temp_c =
          Number.isFinite(tMax) && Number.isFinite(tMin)
            ? Math.round((tMax + tMin) / 2)
            : null;

        const desc = weatherCodeMap[code] || "Unknown";

        const canonical = JSON.stringify({ desc, temp_c });
        setDerivedWeatherJson(canonical);

        const unit = getTempUnit();
        const display = formatDerivedWeather({ desc, temp_c }, unit);
        setDerivedWeatherDisplay(display);

        setFormData((f) => ({
          ...f,
          weather: display, // UI-friendly string
          weather_code: String(code ?? ""),
        }));
      } else {
        clearDerivedWeather();
      }
    } catch (e) {
      console.error("Weather fetch failed:", e);
      clearDerivedWeather();
    }
  };

  // NFC → resolve hive (case-insensitive)
  const resolveHiveByNfc = (uidRaw) => {
    if (!uidRaw) return { match: null, duplicates: false };
    const target = uidRaw.trim().toLowerCase();
    const matches = hives.filter((h) => (h.nfc_uid || "").trim().toLowerCase() === target);
    if (matches.length > 1) return { match: null, duplicates: true };
    if (matches.length === 1) return { match: matches[0], duplicates: false };
    return { match: null, duplicates: false };
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setSaveError("");
      setErrorMsg("");

      // user + profile (premium)
      const { data: userWrap } = await supabase.auth.getUser();
      const uid = userWrap?.user?.id || "";
      setUserId(uid);

      if (uid) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", uid)
          .maybeSingle();
        setSubscriptionLevel(profile?.subscription_level || "free");
      }

      const [apiaryRes, hiveRes, inspRes] = await Promise.all([
        supabase
          .from("apiaries")
          .select("id, name, latitude, longitude")
          .is("archived_at", null)
          .order("name"),
        supabase
          .from("hives")
          .select("id, name, apiary_id, nfc_uid, archived_at")
          .is("archived_at", null)
          .order("name"),
        supabase.from("inspections").select("*").eq("id", id).single(),
      ]);

      setApiaries(apiaryRes.data || []);
      setHives(hiveRes.data || []);

      if (inspRes.error) {
        console.error("Error loading inspection:", inspRes.error);
        setSaveError("Failed to load inspection.");
        setLoading(false);
        return;
      }

      const data = inspRes.data || {};
      const loadedPhotos = Array.isArray(data.photos) ? data.photos : [];

      let dateStr = data.date || "";
      if (dateStr) {
        try {
          dateStr = new Date(dateStr).toISOString().slice(0, 10);
        } catch {
          // ignore
        }
      }

      // ✅ If stored derived weather is JSON, display it with unit preference
      const parsed = safeParseDerivedWeather(data.weather);
      if (parsed) {
        const canonical = JSON.stringify({
          desc: parsed.desc,
          temp_c: parsed.temp_c,
        });
        setDerivedWeatherJson(canonical);
        setDerivedWeatherDisplay(formatDerivedWeather(parsed, getTempUnit()));
      } else {
        setDerivedWeatherJson("");
        setDerivedWeatherDisplay("");
      }

      setFormData({
        apiary_id: data.apiary_id || "",
        hive_id: data.hive_id || "",
        inspection_type: data.inspection_type || "full_inspection",
        date: dateStr || "",
        // NOTE: keep whatever is stored; UI will prefer derivedWeatherDisplay if we have it
        weather: data.weather || "",
        weather_code: data.weather_code ?? "",
        weather_observed: data.weather_observed || "",
        colony_behavior: String(data.colony_behavior ?? ""),
        colony_behavior_other: data.colony_behavior_other || "",
        environmental_signs: toArray(data.environmental_signs),
        environmental_signs_other: data.environmental_signs_other || "",
        hive_population: data.hive_population || "",
        brood_pattern: data.brood_pattern || "",
        food_stores: data.food_stores || "",
        frames_of_bees: data.frames_of_bees || "",
        queen_cells: data.queen_cells || "",
        varroa_seen: Boolean(data.varroa_seen),
        brood_box_congestion: data.brood_box_congestion || "",
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

      if (data.apiary_id) {
        const apiary = (apiaryRes.data || []).find((a) => a.id === data.apiary_id);
        if (apiary?.latitude && apiary?.longitude) {
          setApiaryLocation({ lat: apiary.latitude, lon: apiary.longitude });
          try {
            const addr = await reverseGeocode(apiary.latitude, apiary.longitude);
            setHumanAddress(addr?.display || "");
          } catch {
            setHumanAddress("");
          }

          // ✅ We DO NOT auto-refetch on load. We respect the stored derived weather.
          // If it’s legacy (plain string) and you want to “upgrade” it, change date/apiary/hive and it will refetch.
        }
      }

      if ("NDEFReader" in window) setNfcSupported(true);

      setLoading(false);
    };

    loadAll();

    return () => {
      (previewsRef.current || []).forEach(
        (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u)
      );
    };
  }, [id]);

  const hivesForApiary = useMemo(() => {
    if (!formData.apiary_id) return hives;
    return hives.filter((h) => h.apiary_id === formData.apiary_id);
  }, [hives, formData.apiary_id]);

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

    if (type === "checkbox" && (name === "signs_pests" || name === "signs_disease")) {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

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

    if (name === "apiary_id") {
      setFormData((prev) => {
        let safeHiveId = prev.hive_id;
        const hive = hiveById.get(prev.hive_id);
        if (hive && hive.apiary_id !== value) safeHiveId = "";

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
          clearDerivedWeather();
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

  const toggleInArray = (field, value) => {
    setFormData((prev) => {
      const set = new Set(prev[field] || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
  };

  /* ----- Photos ----- */
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

  /**
   * Upload new files and return [{ url, path, bucket }]
   */
  const uploadNewFiles = async () => {
    if (!newFiles.length) return [];

    const uploaded = [];
    const bucket = "photos";
    const uid = userId;

    for (const file of newFiles) {
      const safeName = String(file.name || "image").replace(/[^\w.-]+/g, "_");
      const filename = `${Date.now()}-${safeName}`;
      const path = `inspections/${uid || "unknown"}/${id}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: true });

      if (upErr) {
        console.error("Upload error:", upErr);
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data?.publicUrl) uploaded.push({ url: data.publicUrl, path, bucket });
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
        .select("archived_at")
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

    // Upload first; keep paths so we can rollback on DB failure
    const uploaded = await uploadNewFiles(); // [{url, path, bucket}]
    const uploadedUrls = uploaded.map((x) => x.url).filter(Boolean);

    // URLs the user removed from existing list
    const removed = originalPhotos.filter((oldUrl) => !(formData.photos || []).includes(oldUrl));

    // ✅ Persist canonical derived JSON if we have it; otherwise keep legacy value as-is
    const weatherToSave =
      derivedWeatherJson || (typeof formData.weather === "string" ? formData.weather : null);

    const payload = {
      apiary_id: formData.apiary_id || null,
      hive_id: formData.hive_id || null,
      inspection_type: formData.inspection_type || "full_inspection",
      date: formData.date || null,

      weather: weatherToSave || null,
      weather_code: formData.weather_code || null,
      weather_observed: formData.weather_observed || null,

      colony_behavior: formData.colony_behavior || null,
      colony_behavior_other:
        formData.colony_behavior === "Other" ? (formData.colony_behavior_other || null) : null,

      environmental_signs:
        Array.isArray(formData.environmental_signs) && formData.environmental_signs.length
          ? formData.environmental_signs
          : null,
      environmental_signs_other:
        (formData.environmental_signs || []).includes("Other")
          ? (formData.environmental_signs_other || null)
          : null,

      hive_population: formData.hive_population || null,
      brood_pattern: formData.brood_pattern || null,
      food_stores: formData.food_stores || null,
      frames_of_bees: formData.frames_of_bees || null,
      queen_cells: formData.queen_cells || null,
      varroa_seen: Boolean(formData.varroa_seen),
      brood_box_congestion: formData.brood_box_congestion || null,

      queen_status:
        Array.isArray(formData.queen_status) && formData.queen_status.length
          ? formData.queen_status
          : null,
      queen_status_other:
        (formData.queen_status || []).includes("Other") ? (formData.queen_status_other || null) : null,

      signs_disease: Boolean(formData.signs_disease),
      disease_types: formData.signs_disease
        ? (Array.isArray(formData.disease_types) && formData.disease_types.length
            ? formData.disease_types
            : null)
        : null,
      disease_other: formData.signs_disease
        ? ((formData.disease_types || []).includes("Other") ? (formData.disease_other || null) : null)
        : null,

      signs_pests: Boolean(formData.signs_pests),
      pest_types: formData.signs_pests
        ? (Array.isArray(formData.pest_types) && formData.pest_types.length ? formData.pest_types : null)
        : null,
      pest_other: formData.signs_pests
        ? ((formData.pest_types || []).includes("Other") ? (formData.pest_other || null) : null)
        : null,

      notes: formData.notes || null,

      // merged list, max 3
      photos: [...(formData.photos || []), ...uploadedUrls].slice(0, 3),
    };

    const { error } = await supabase.from("inspections").update(payload).eq("id", id);

    // If update failed, rollback newly uploaded files so you don’t leak storage
    if (error && uploaded.length) {
      const byBucket = new Map();
      for (const u of uploaded) {
        if (!u?.bucket || !u?.path) continue;
        if (!byBucket.has(u.bucket)) byBucket.set(u.bucket, []);
        byBucket.get(u.bucket).push(u.path);
      }
      for (const [bucket, paths] of byBucket.entries()) {
        try {
          await supabase.storage.from(bucket).remove(paths);
        } catch {
          // ignore rollback errors
        }
      }
    }

    // If update succeeded, delete removed old photos via EDGE FUNCTION (no orphans)
    if (!error && removed.length) {
      for (const url of removed) {
        try {
          await removeOneInspectionPhoto(id, { url });
        } catch {
          // ignore; edge function already handles idempotently, and we don't block save UX
        }
      }
    }

    // cleanup new previews (blob URLs)
    newPreviews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
    setNewPreviews([]);
    setNewFiles([]);

    setSaving(false);

    if (error) {
      console.error("Update failed", error);
      setSaveError("Failed to update inspection. " + (error.message || ""));
      return;
    }

    navigate("/inspections");
  };

const getLinkedInspectionCounts = async () => {
  const [{ count: logs = 0, error: logErr }, { count: todos = 0, error: todoErr }] =
    await Promise.all([
      supabase
        .from("logbook")
        .select("id", { count: "exact", head: true })
        .eq("inspection_id", id)
        .is("archived_at", null),

      supabase
        .from("todos")
        .select("id", { count: "exact", head: true })
        .eq("inspection_id", id)
        .is("archived_at", null),
    ]);

  return { logs, todos, error: logErr || todoErr };
};

const archiveInspectionAndLinkedItems = async () => {
  const now = new Date().toISOString();

  const [inspectionRes, logbookRes, todoRes] = await Promise.all([
    supabase.from("inspections").update({ archived_at: now }).eq("id", id),
    supabase
      .from("logbook")
      .update({ archived_at: now })
      .eq("inspection_id", id)
      .is("archived_at", null),
    supabase
      .from("todos")
      .update({ archived_at: now })
      .eq("inspection_id", id)
      .is("archived_at", null),
  ]);

  return inspectionRes.error || logbookRes.error || todoRes.error;
};

const handleArchive = async () => {
  const { logs, todos, error } = await getLinkedInspectionCounts();

  if (error) {
    console.error("Linked item check failed:", error);
    alert(
      "HiveTag could not check all linked records safely.\n\n" +
        "Nothing has been archived. Please refresh and try again."
    );
    return;
  }

  const linkedParts = [];
  if (logs > 0) linkedParts.push(`${logs} linked logbook entr${logs === 1 ? "y" : "ies"}`);
  if (todos > 0) linkedParts.push(`${todos} linked task${todos === 1 ? "" : "s"}`);

  const message =
    linkedParts.length > 0
      ? `This inspection has ${linkedParts.join(" and ")}.\n\nArchive the inspection and linked items?`
      : "Archive this inspection?";

  if (!window.confirm(message)) return;

  const archiveErr = await archiveInspectionAndLinkedItems();

  if (archiveErr) {
    console.error("Archive failed:", archiveErr);
    alert(humaniseSupabaseError(archiveErr) || "Failed to archive inspection and linked items.");
    return;
  }

  alert("Inspection and linked items archived.");
  navigate("/inspections");
};

const handleDelete = async () => {
  const { logs, todos, error } = await getLinkedInspectionCounts();

  if (error) {
    console.error("Linked item check failed:", error);
    alert(
      "HiveTag could not safely check whether this inspection has linked records.\n\n" +
        "To protect your records, the inspection has not been deleted."
    );
    return;
  }

  const linkedParts = [];
  if (logs > 0) linkedParts.push(`${logs} linked logbook entr${logs === 1 ? "y" : "ies"}`);
  if (todos > 0) linkedParts.push(`${todos} linked task${todos === 1 ? "" : "s"}`);

  if (linkedParts.length > 0) {
    const ok = window.confirm(
      `This inspection has ${linkedParts.join(" and ")}.\n\nArchive the inspection and linked items instead?`
    );

    if (!ok) return;

    const archiveErr = await archiveInspectionAndLinkedItems();

    if (archiveErr) {
      console.error("Archive failed:", archiveErr);
      alert(humaniseSupabaseError(archiveErr) || "Failed to archive inspection and linked items.");
      return;
    }

    alert("Inspection and linked items archived.");
    navigate("/inspections");
    return;
  }

  if (!window.confirm("Delete this inspection permanently? This cannot be undone.")) return;

  const { error: deleteErr } = await smartDeleteInspection(id);

  if (deleteErr) {
    console.error("Inspection delete failed:", deleteErr);
    alert(
      humaniseSupabaseError(deleteErr, { table: "inspections" }) ||
        deleteErr.message ||
        "Failed to delete inspection."
    );
    return;
  }

  alert("Inspection deleted.");
  navigate("/inspections");
};

  const totalPhotos = (formData.photos?.length || 0) + (newFiles?.length || 0);
  const canAddMorePhotos = totalPhotos < 3;

  const selectedHive = hiveById.get(formData.hive_id);
  const selectedHiveNfc = selectedHive?.nfc_uid || "";

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Inspection</h2>

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
            <label className="block text-sm font-medium mb-1">Inspection Type</label>
            <select
              name="inspection_type"
              value={formData.inspection_type || "full_inspection"}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="full_inspection">Full inspection - hive opened</option>
              <option value="external_check">External check - hive not opened</option>
              <option value="observation_only">Observation only</option>
            </select>

            <p className="text-xs text-gray-600 mb-3">
              Use External check for winter hefting, entrance checks, roof/strap checks, or visits where no brood frames are lifted.
            </p>

            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date || ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weather (derived)</label>
            <input
              type="text"
              name="weather"
              value={derivedWeatherDisplay || formData.weather || ""}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
              placeholder="Auto-fetched from apiary location"
            />

            <label className="block text-sm font-medium mb-1 mt-3">Weather (observed)</label>
            <input
              type="text"
              name="weather_observed"
              value={formData.weather_observed || ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              placeholder="What did you actually observe? (e.g. sunny, warm, light breeze)"
            />
          </div>
        </div>

        {/* Colony Behaviour */}
        <div>
          <label className="block text-sm font-medium mb-1">Colony Behaviour</label>
          <select
            name="colony_behavior"
            value={formData.colony_behavior}
            onChange={onChange}
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

        {/* Environmental Signs */}
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

        {/* Hive Population / Frames / Brood / Stores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hive Population</label>
            <select
              name="hive_population"
              value={formData.hive_population}
              onChange={onChange}
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
            <label className="block text-sm font-medium mb-1">Frames Covered by Bees</label>
            <select
              name="frames_of_bees"
              value={formData.frames_of_bees}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              {FRAMES_OF_BEES_OPTS.map((o) => (
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
              onChange={onChange}
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
            <label className="block text-sm font-medium mb-1">Brood Box Congestion</label>
            <p className="text-xs text-gray-600 mb-1">
              Based on brood box space, not supers.
            </p>
            <select
              name="brood_box_congestion"
              value={formData.brood_box_congestion}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              {BROOD_BOX_CONGESTION_OPTS.map((o) => (
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
              onChange={onChange}
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

        {/* Queen Cells */}
        <div>
          <label className="block text-sm font-medium mb-1">Queen Cells</label>
          <select
            name="queen_cells"
            value={formData.queen_cells}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select</option>
            {QUEEN_CELLS_OPTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Queen Status */}
        <div className="border rounded p-3">
          <div className="font-medium mb-2">Queen Status (select all that apply)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUEEN_OPTIONS.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.queen_status.includes(opt)}
                  onChange={() => toggleInArray("queen_status", opt)}
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

        {/* Varroa Seen */}
        <div className="border rounded p-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="varroa_seen"
              checked={formData.varroa_seen}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  varroa_seen: e.target.checked,
                }))
              }
            />
            <span className="font-medium">Varroa Seen</span>
          </label>
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

        {/* Photos */}
        <div>
          <div className="font-medium mb-2">Photos (max 3)</div>

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
          {!canAddMorePhotos && (
            <p className="text-sm text-red-600 mt-1">Maximum of 3 photos reached.</p>
          )}
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

        {(saveError || errorMsg) && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
            {saveError || errorMsg}
          </div>
        )}

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
    </div>
  );
};

export default EditInspection;