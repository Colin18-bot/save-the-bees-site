// src/pages/Inspections/NewInspection.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import dayjs from "dayjs";
// ✅ GA custom events (respects consent)
import { trackEvent } from "../Legal/gaEvents";

// ✅ Shared formatter + unit preference (localStorage)
import {
  formatDerivedWeather,
  getTempUnit,
} from "../../utils/formatDerivedWeather.js";

// WMO → text
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

// --- Simple country → authority helper (used in compliance note)
const COUNTRIES = ["England & Wales", "Scotland", "Northern Ireland"];
const COUNTRY_AUTH = {
  "England & Wales": {
    name: "National Bee Unit (BeeBase)",
    url: "https://www.nationalbeeunit.com/",
  },
  Scotland: {
    name: "Agriculture Dept (see Scottish guidance)",
    url: "https://www.gov.scot/policies/animal-health/bees/",
  },
  "Northern Ireland": {
    name: "DAERA Bee Health",
    url: "https://www.daera-ni.gov.uk/topics/animal-health-and-welfare/bees",
  },
};

const NewInspection = () => {
  const [params] = useSearchParams();
  const nfc_uidParam = params.get("nfc_uid");
  const hiveIdParam = params.get("hive_id");
  const apiaryIdParam = params.get("apiary_id");
  const fromParam = params.get("from"); // e.g. "saved" after NFC save

  const navigate = useNavigate();
  const successRef = useRef(null);

  const [formData, setFormData] = useState({
    apiary_id: "",
    hive_id: "",
    date: dayjs().format("YYYY-MM-DD"),
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
    queen_status: [],
    queen_status_other: "",
    signs_disease: "no",
    disease_types: [],
    disease_other: "",
    signs_pests: "no",
    pest_types: [],
    pest_other: "",
    notes: "",
  });

  // Derived weather (stored as JSON string in DB), and display string for the read-only input
  const [derivedWeatherJson, setDerivedWeatherJson] = useState("");
  const [derivedWeatherDisplay, setDerivedWeatherDisplay] = useState("");

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // NFC / subscription
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const [nfcSupported, setNfcSupported] = useState(false);

  // responsive photo preview state
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // ⚠️ Country selector for compliance note (defaults to E&W)
  const [reportCountry, setReportCountry] = useState("England & Wales");

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach(
        (p) => p.url?.startsWith("blob:") && URL.revokeObjectURL(p.url)
      );
    };
  }, [previews]);

  const clearDerivedWeather = () => {
    setDerivedWeatherJson("");
    setDerivedWeatherDisplay("");
    setFormData((f) => ({ ...f, weather: "", weather_code: "" }));
  };

  const fetchWeather = async (apiary, dateStr) => {
    const lat = Number(apiary?.latitude);
    const lon = Number(apiary?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      clearDerivedWeather();
      return;
    }

    try {
      const day = dayjs(dateStr || formData.date).format("YYYY-MM-DD");
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

        // ✅ Average of min/max, stored as Celsius canonical
        const temp_c =
          Number.isFinite(tMax) && Number.isFinite(tMin)
            ? Math.round((tMax + tMin) / 2)
            : null;

        const desc = weatherCodeMap[code] || "Unknown";

        // ✅ Store canonical JSON for DB
        const json = JSON.stringify({ desc, temp_c });
        setDerivedWeatherJson(json);

        // ✅ Display respects unit preference from Weather.jsx localStorage
        const unit = getTempUnit();
        const display = formatDerivedWeather({ desc, temp_c }, unit);

        setDerivedWeatherDisplay(display);

        setFormData((f) => ({
          ...f,
          // keep UI readable (NOT JSON)
          weather: display,
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

  // Load lists + defaults + subscription + NFC preselection
  useEffect(() => {
    const fetchDefaults = async () => {
      const { data: userWrap } = await supabase.auth.getUser();
      let level = "free";

      if (userWrap?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", userWrap.user.id)
          .maybeSingle();
        level = profile?.subscription_level || "free";
      }
      setSubscriptionLevel(level);

      const [{ data: hivesData }, { data: apiariesData }] = await Promise.all([
        supabase
          .from("hives")
          .select("id, name, apiary_id, nfc_uid")
          .is("archived_at", null),
        supabase
          .from("apiaries")
          .select("id, name, latitude, longitude")
          .is("archived_at", null),
      ]);

      const safeHives = hivesData || [];
      const safeApiaries = apiariesData || [];
      setHives(safeHives);
      setApiaries(safeApiaries);

      let chosenHiveId = "";
      let chosenApiaryId = "";

      // 1) Direct hive_id param
      if (hiveIdParam) {
        const hv = safeHives.find((h) => h.id === hiveIdParam);
        if (hv) {
          chosenHiveId = hv.id;
          chosenApiaryId = hv.apiary_id;
        }
      }

      // 2) apiary_id param
      if (!chosenApiaryId && apiaryIdParam) {
        const ap = safeApiaries.find((a) => a.id === apiaryIdParam);
        if (ap) chosenApiaryId = ap.id;
      }

      // 3) NFC param – PREMIUM ONLY
      if (level === "premium" && nfc_uidParam) {
        const matches = safeHives.filter(
          (h) =>
            (h.nfc_uid || "").trim().toLowerCase() ===
            nfc_uidParam.trim().toLowerCase()
        );

        if (matches.length > 1) {
          setErrorMessage(
            "This NFC tag is linked to multiple hives. Please resolve duplicates first."
          );
        } else if (matches.length === 1) {
          const hive = matches[0];
          chosenHiveId = hive.id;
          chosenApiaryId = hive.apiary_id;
        } else if (!hiveIdParam) {
          setErrorMessage("No hive found for this NFC tag.");
        }
      }

      setFormData((f) => ({
        ...f,
        hive_id: chosenHiveId || f.hive_id,
        apiary_id: chosenApiaryId || f.apiary_id,
      }));

      // ✅ Fetch derived weather for the inspection date (not always "today")
      const targetDate = dayjs().format("YYYY-MM-DD");
      const apiary = safeApiaries.find(
        (a) => a.id === (chosenApiaryId || formData.apiary_id)
      );
      if (apiary) fetchWeather(apiary, targetDate);
    };

    fetchDefaults();
    if ("NDEFReader" in window) setNfcSupported(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files: picked } = e.target;
    const arrayFields = new Set([
      "environmental_signs",
      "queen_status",
      "disease_types",
      "pest_types",
    ]);

    if (arrayFields.has(name)) {
      setFormData((prev) => {
        const set = new Set(prev[name]);
        checked ? set.add(value) : set.delete(value);
        return { ...prev, [name]: Array.from(set) };
      });
      return;
    }

    if (type === "file") {
      const pickedFiles = Array.from(picked || []);
      if (!pickedFiles.length) return;

      const remainingSlots = Math.max(0, 3 - files.length);
      const selected = pickedFiles.slice(0, remainingSlots);

      setFiles((prev) => [...prev, ...selected]);

      setPreviews((prev) => {
        const next = [...prev];
        for (const f of selected) {
          next.push({
            id: `${f.name}-${Date.now()}-${Math.random()
              .toString(16)
              .slice(2)}`,
            url: URL.createObjectURL(f),
            name: f.name,
          });
        }
        return next;
      });

      // allow re-selecting same file
      e.target.value = "";
      return;
    }

    setFormData((prev) => {
      if (name === "hive_id") {
        const hive = hives.find((h) => h.id === value);
        const newApiaryId = hive?.apiary_id || prev.apiary_id;
        if (newApiaryId !== prev.apiary_id) {
          const apiary = apiaries.find((a) => a.id === newApiaryId);
          if (apiary) fetchWeather(apiary, prev.date);
        }
        return { ...prev, hive_id: value, apiary_id: newApiaryId };
      }

      if (name === "apiary_id") {
        const apiary = apiaries.find((a) => a.id === value);
        if (apiary) fetchWeather(apiary, prev.date);
        const hive = hives.find((h) => h.id === prev.hive_id);
        const safeHiveId = hive?.apiary_id === value ? prev.hive_id : "";
        if (safeHiveId === "" && prev.hive_id) {
          setErrorMessage(
            "Previous hive was cleared because it doesn’t belong to the new apiary."
          );
        }
        return { ...prev, apiary_id: value, hive_id: safeHiveId };
      }

      if (name === "date") {
        const apiary = apiaries.find((a) => a.id === prev.apiary_id);
        if (apiary) fetchWeather(apiary, value);
        return { ...prev, date: value };
      }

      return { ...prev, [name]: value };
    });
  };

  const removePhoto = (id) => {
    const idx = previews.findIndex((p) => p.id === id);
    if (idx === -1) return;

    const pv = previews[idx];
    if (pv?.url?.startsWith("blob:")) URL.revokeObjectURL(pv.url);

    setPreviews((prev) => prev.filter((p) => p.id !== id));
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Premium: NFC scan to auto-select hive (with duplicate safeguards)
  const handleNfcScan = async () => {
    if (subscriptionLevel !== "premium") return;
    try {
      const reader = new window.NDEFReader();
      await reader.scan();
      reader.onreading = async (event) => {
        const uid = event.serialNumber || "";
        if (!uid) return;

        const matches = hives.filter(
          (h) => (h.nfc_uid || "").trim().toLowerCase() === uid.trim().toLowerCase()
        );

        if (matches.length > 1) {
          setErrorMessage(
            "This NFC tag is linked to multiple hives. Please resolve duplicates first."
          );
          return;
        }

        if (matches.length === 1) {
          const hive = matches[0];
          const apiary = apiaries.find((a) => a.id === hive.apiary_id);
          setFormData((prev) => ({
            ...prev,
            hive_id: hive.id,
            apiary_id: hive.apiary_id,
          }));
          if (apiary) fetchWeather(apiary, formData.date);
          setErrorMessage("");
          alert(`NFC tag detected. Selected hive: ${hive.name}`);
        } else {
          setErrorMessage("No hive found for this NFC tag.");
        }
      };
    } catch (err) {
      console.error("NFC scan error:", err);
      setErrorMessage("Failed to start NFC scan. Your browser/device may not support it.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.apiary_id || !formData.hive_id) {
      setErrorMessage("Please select both apiary and hive.");
      setSaving(false);
      return;
    }

    // Guard: hive must belong to apiary
    const hive = hives.find((h) => h.id === formData.hive_id);
    if (hive && hive.apiary_id !== formData.apiary_id) {
      setErrorMessage("Selected hive belongs to a different apiary.");
      setSaving(false);
      return;
    }

    // Guard: parents must be active
    const [{ data: apiaryRow }, { data: hiveRow }] = await Promise.all([
      supabase.from("apiaries").select("archived_at").eq("id", formData.apiary_id).single(),
      supabase.from("hives").select("archived_at").eq("id", formData.hive_id).single(),
    ]);

    if (apiaryRow?.archived_at) {
      setErrorMessage("Selected apiary is archived. Choose an active apiary.");
      setSaving(false);
      return;
    }
    if (hiveRow?.archived_at) {
      setErrorMessage("Selected hive is archived. Choose an active hive.");
      setSaving(false);
      return;
    }

    const { data: userWrap } = await supabase.auth.getUser();

    // normalize booleans + empty strings/arrays
    const base = {
      ...formData,
      signs_disease: formData.signs_disease === "yes",
      signs_pests: formData.signs_pests === "yes",
    };

    // ✅ Ensure DB stores canonical JSON derived weather if available
    if (derivedWeatherJson) {
      base.weather = derivedWeatherJson;
    }

    if (!base.signs_disease) {
      base.disease_types = null;
      base.disease_other = null;
    }
    if (!base.signs_pests) {
      base.pest_types = null;
      base.pest_other = null;
    }

    const normalize = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => {
          if (Array.isArray(v)) return [k, v.length ? v : null];
          return [k, v === "" ? null : v];
        })
      );

    const insertPayload = {
      ...normalize(base),
      user_id: userWrap?.user?.id || null,
      // photos + photo_paths will be set after upload (or remain null)
      photos: null,
      photo_paths: null,
    };

    // Insert row
    const { data: inserted, error: insertErr } = await supabase
      .from("inspections")
      .insert(insertPayload)
      .select("id, apiary_id, hive_id, weather_code")
      .single();

    if (insertErr) {
      console.error("Insert inspection error:", insertErr);
      setErrorMessage(insertErr.message || "Failed to save inspection.");
      setSaving(false);
      return;
    }

    // ✅ GA: track inspection creation
    trackEvent("inspection_create", {
      inspection_id: inserted.id,
      apiary_id: inserted.apiary_id,
      hive_id: inserted.hive_id,
      weather_code: insertPayload.weather_code ?? undefined,
      has_disease: !!base.signs_disease,
      has_pests: !!base.signs_pests,
      photos_selected: files.length,
      source: "app",
    });

    // Upload up to 3 photos -> store URLs + PATHS (paths are what the Edge Function prefers)
    const uploadedUrls = [];
    const uploadedPaths = [];

    for (const f of files.slice(0, 3)) {
      try {
        const safeName = f.name.replace(/\s+/g, "_");
        const path = `inspections/${inserted.id}-${Date.now()}-${safeName}`;

        const { error: upErr } = await supabase.storage
          .from("photos")
          .upload(path, f, { upsert: true, contentType: f.type });

        if (upErr) {
          console.error("Photo upload error:", upErr);
          continue;
        }

        const { data: u } = supabase.storage.from("photos").getPublicUrl(path);
        if (u?.publicUrl) {
          uploadedUrls.push(u.publicUrl);
          uploadedPaths.push(path);
        }
      } catch (err) {
        console.error("Photo upload error:", err);
      }
    }

    if (uploadedUrls.length) {
      await supabase
        .from("inspections")
        .update({
          photos: uploadedUrls,
          photo_paths: uploadedPaths,
        })
        .eq("id", inserted.id);

      // ✅ GA: follow-up event once uploads succeed
      trackEvent("inspection_photos_uploaded", {
        inspection_id: inserted.id,
        apiary_id: inserted.apiary_id,
        hive_id: inserted.hive_id,
        count_photos: uploadedUrls.length,
      });
    }

    // cleanup previews now we’re leaving
    previews.forEach((p) => p.url?.startsWith("blob:") && URL.revokeObjectURL(p.url));
    setPreviews([]);
    setFiles([]);

    setSuccessMessage("Inspection saved successfully!");
    setSaving(false);

    setTimeout(() => {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    // Redirect logic:
    if (nfc_uidParam && inserted.hive_id) {
      navigate(
        `/inspections/new?hive_id=${encodeURIComponent(inserted.hive_id)}&nfc_uid=${encodeURIComponent(
          nfc_uidParam
        )}&from=saved`
      );
    } else {
      navigate("/inspections");
    }
  };

  const hivesForSelectedApiary = formData.apiary_id
    ? hives.filter((h) => h.apiary_id === formData.apiary_id)
    : hives;

  const renderDiseaseCompliance = () => {
    if (formData.signs_disease !== "yes") return null;

    const hasAFB = formData.disease_types.includes("AFB");
    const hasEFB = formData.disease_types.includes("EFB");
    const hasVarroa = formData.disease_types.includes("Varroa");

    if (!hasAFB && !hasEFB && !hasVarroa) return null;

    const auth = COUNTRY_AUTH[reportCountry] || COUNTRY_AUTH["England & Wales"];

    const isNotifiable = hasAFB || hasEFB;
    const boxCls = isNotifiable
      ? "bg-red-50 border-red-200 text-red-800"
      : "bg-amber-50 border-amber-200 text-amber-900";

    return (
      <div className={`mt-3 p-3 border rounded text-sm ${boxCls}`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold">Country for reporting:</span>
          <select
            value={reportCountry}
            onChange={(e) => setReportCountry(e.target.value)}
            className="border rounded px-2 py-1 bg-white text-gray-800 text-sm"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {isNotifiable && (
          <p className="mb-1">
            <strong>AFB/EFB are notifiable diseases.</strong> By law you must report
            immediately to{" "}
            <a href={auth.url} target="_blank" rel="noreferrer" className="underline">
              {auth.name}
            </a>{" "}
            ({reportCountry}). Avoid moving combs/kit off-site until advised by an inspector.
          </p>
        )}

        {hasVarroa && (
          <p className="mt-1">
            <strong>Varroa (monitoring):</strong> Varroa is <strong>not a notifiable disease</strong>{" "}
            in the UK. Beekeepers are encouraged to monitor infestation levels, keep treatment
            records, and share concerns (e.g., unusually high counts or suspected treatment
            resistance) with{" "}
            <a href={auth.url} target="_blank" rel="noreferrer" className="underline">
              {auth.name}
            </a>{" "}
            where appropriate.
          </p>
        )}
      </div>
    );
  };

  const resolvedHiveId = formData.hive_id || hiveIdParam || "";

  return (
    <div className="p-4 max-w-3xl mx-auto rounded-x1 shadow-lg">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold">New Inspection</h1>

        <Link
          to="/inspections/step-by-step"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center text-sm px-3 py-2 border rounded hover:bg-gray-100 w-full sm:w-auto"
          title="Open the step-by-step inspection guide"
          onClick={() => trackEvent("inspection_guide_open", { source: "new_inspection" })}
        >
          Step-by-step inspection guide
        </Link>
      </div>

      {fromParam === "saved" && nfc_uidParam && resolvedHiveId && (
        <div className="mb-3 p-3 border rounded bg-green-50 text-green-900 text-sm">
          <p className="font-semibold">Last inspection for this hive was saved successfully.</p>
          <p className="mt-1">
            You’re ready to start another inspection, or you can{" "}
            <Link
              to={`/inspections?hive_id=${encodeURIComponent(resolvedHiveId)}&nfc_uid=${encodeURIComponent(
                nfc_uidParam
              )}`}
              className="underline"
            >
              view this hive’s inspection history
            </Link>
            .
          </p>
        </div>
      )}

      {subscriptionLevel === "premium" && nfc_uidParam && (
        <div className="mb-3 p-3 border rounded bg-green-50 text-green-900 text-sm">
          <p>
            Arrived via NFC tag:{" "}
            <code className="px-1 py-0.5 bg-white border rounded">{nfc_uidParam}</code>. Hive
            has been pre-selected where possible.
          </p>
          {resolvedHiveId && (
            <p className="mt-1">
              <Link
                to={`/inspections?hive_id=${encodeURIComponent(resolvedHiveId)}&nfc_uid=${encodeURIComponent(
                  nfc_uidParam
                )}`}
                className="text-green-800 underline"
              >
                View this hive’s inspection history →
              </Link>
            </p>
          )}
        </div>
      )}

      {subscriptionLevel === "premium" && nfcSupported && (
        <div className="mb-4 p-3 border rounded bg-blue-50 text-blue-900 flex items-center justify-between">
          <div className="text-sm">Tap an NFC tag to instantly select its hive.</div>
          <button
            type="button"
            onClick={handleNfcScan}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Scan NFC
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Apiary */}
        <div>
          <label className="block font-semibold">Select Apiary</label>
          <select
            name="apiary_id"
            value={formData.apiary_id}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Apiary</option>
            {apiaries.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Hive */}
        <div>
          <label className="block font-semibold">Select Hive</label>
          <select
            name="hive_id"
            value={formData.hive_id}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Hive</option>
            {hivesForSelectedApiary.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date + Weather */}
        <div>
          <label className="block font-semibold">Inspection Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />

          <label className="block font-semibold mt-4">Weather (derived)</label>
          <input
            type="text"
            name="weather"
            value={derivedWeatherDisplay || formData.weather}
            readOnly
            className="w-full border px-3 py-2 rounded mt-2 bg-gray-100 text-gray-700"
            placeholder="Auto-fetched from apiary location"
          />

          <label className="block font-semibold mt-4">Weather (observed)</label>
          <input
            type="text"
            name="weather_observed"
            value={formData.weather_observed}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mt-2"
            placeholder="What did you actually observe at the hive? (e.g. sunny, warm, light breeze)"
          />
        </div>

        {/* Colony Behaviour */}
        <div>
          <label className="block font-semibold">Colony Behaviour</label>
          <select
            name="colony_behavior"
            value={formData.colony_behavior}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="Calm">Calm</option>
            <option value="Aggressive">Aggressive</option>
            <option value="Other">Other</option>
          </select>
          {formData.colony_behavior === "Other" && (
            <input
              type="text"
              name="colony_behavior_other"
              value={formData.colony_behavior_other}
              onChange={handleChange}
              placeholder="Describe other behavior"
              className="w-full border px-3 py-2 rounded mt-2"
            />
          )}
        </div>

        {/* Environmental Signs */}
        <div>
          <label className="block font-semibold">Environmental Signs</label>
          {["Entering/exiting", "Bringing in pollen", "Robbing", "Unusual odour", "Other"].map(
            (opt) => (
              <label key={opt} className="block">
                <input
                  type="checkbox"
                  name="environmental_signs"
                  value={opt}
                  checked={formData.environmental_signs.includes(opt)}
                  onChange={handleChange}
                  className="mr-2"
                />
                {opt}
              </label>
            )
          )}
          {formData.environmental_signs.includes("Other") && (
            <input
              type="text"
              name="environmental_signs_other"
              value={formData.environmental_signs_other}
              onChange={handleChange}
              placeholder="Describe other signs"
              className="w-full border px-3 py-2 rounded mt-2"
            />
          )}
        </div>

        {/* Hive Population */}
        <div>
          <label className="block font-semibold">Hive Population</label>
          <select
            name="hive_population"
            value={formData.hive_population}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="Strong">Strong</option>
          </select>
        </div>

        {/* Brood Pattern */}
        <div>
          <label className="block font-semibold">Brood Pattern</label>
          <select
            name="brood_pattern"
            value={formData.brood_pattern}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="Spotty">Spotty</option>
            <option value="Solid">Solid</option>
          </select>
        </div>

        {/* Food Stores */}
        <div>
          <label className="block font-semibold">Food Stores</label>
          <select
            name="food_stores"
            value={formData.food_stores}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="Full">Full</option>
          </select>
        </div>

        {/* Queen Status */}
        <div>
          <label className="block font-semibold">Queen Status</label>
          {["Seen", "Eggs", "Capped brood", "Uncapped brood", "Other"].map((opt) => (
            <label key={opt} className="block">
              <input
                type="checkbox"
                name="queen_status"
                value={opt}
                checked={formData.queen_status.includes(opt)}
                onChange={handleChange}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
          {formData.queen_status.includes("Other") && (
            <input
              type="text"
              name="queen_status_other"
              value={formData.queen_status_other}
              onChange={handleChange}
              placeholder="Describe other queen status"
              className="w-full border px-3 py-2 rounded mt-2"
            />
          )}
        </div>

        {/* Disease */}
        <div>
          <label className="block font-semibold">Signs of Disease</label>
          <select
            name="signs_disease"
            value={formData.signs_disease}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>

          {formData.signs_disease === "yes" && (
            <>
              {["Varroa", "Chalkbrood", "Sacbrood", "EFB", "AFB", "Nosema", "Dead bees", "Other"].map(
                (opt) => (
                  <label key={opt} className="block">
                    <input
                      type="checkbox"
                      name="disease_types"
                      value={opt}
                      checked={formData.disease_types.includes(opt)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                )
              )}

              {formData.disease_types.includes("Other") && (
                <input
                  type="text"
                  name="disease_other"
                  value={formData.disease_other}
                  onChange={handleChange}
                  placeholder="Describe other disease"
                  className="w-full border px-3 py-2 rounded mt-2"
                />
              )}

              {renderDiseaseCompliance()}
            </>
          )}
        </div>

        {/* Pests */}
        <div>
          <label className="block font-semibold">Signs of Pests</label>
          <select
            name="signs_pests"
            value={formData.signs_pests}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>

          {formData.signs_pests === "yes" && (
            <>
              {["Mice", "Ants", "Beetles", "Wax Moths", "Wasps", "Other"].map((opt) => (
                <label key={opt} className="block">
                  <input
                    type="checkbox"
                    name="pest_types"
                    value={opt}
                    checked={formData.pest_types.includes(opt)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}

              {formData.pest_types.includes("Other") && (
                <input
                  type="text"
                  name="pest_other"
                  value={formData.pest_other}
                  onChange={handleChange}
                  placeholder="Describe other pest"
                  className="w-full border px-3 py-2 rounded mt-2"
                />
              )}
            </>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold">Inspector Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full border px-3 py-2 rounded"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block font-semibold mb-1">Upload Photos (max 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            name="photos"
            onChange={handleChange}
            className="block w-full px-3 py-2 border rounded"
            disabled={files.length >= 3}
          />
          {files.length >= 3 && (
            <p className="text-sm text-red-600 mt-1">Maximum of 3 photos reached.</p>
          )}

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((p) => (
                <div key={p.id} className="relative flex flex-col items-start">
                  <img
                    src={p.url}
                    alt={p.name}
                    className="max-h-48 w-auto max-w-full object-contain rounded border bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
                  >
                    ×
                  </button>
                  <div className="mt-1 text-xs text-gray-600 break-all">{p.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inline messages */}
        {errorMessage && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div
            ref={successRef}
            className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm"
          >
            {successMessage}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
          >
            {saving ? "Saving…" : "Save Inspection"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewInspection;