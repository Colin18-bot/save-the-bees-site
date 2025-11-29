// src/pages/Apiaries/NewApiary.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { forwardGeocode } from "../../utils/geocode";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// --- helpers (no extra libs) ---
async function reverseGeocodeCountry(lat, lon) {
  const key = import.meta.env.VITE_LOCATIONIQ_KEY;

  // 1) Try LocationIQ if a key exists
  if (key) {
    try {
      const url = `https://us1.locationiq.com/v1/reverse?key=${encodeURIComponent(
        key
      )}&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
        lon
      )}&format=json&normalizeaddress=1`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const code = (data?.address?.country_code || "").toUpperCase() || null;
        const name = data?.address?.country || null;
        if (name) return { code, name };
      }
    } catch {
      /* fall through to fallback */
    }
  }

  // 2) Fallback: maps.co (Nominatim wrapper; no key needed)
  try {
    const url = `https://geocode.maps.co/reverse?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const code = (data?.address?.country_code || "").toUpperCase() || null;
    const name = data?.address?.country || null;
    return name ? { code, name } : null;
  } catch {
    return null;
  }
}

async function detectTimezone(lat, lon) {
  const url = `https://api.open-meteo.com/v1/timezone?latitude=${encodeURIComponent(
    lat
  )}&longitude=${encodeURIComponent(lon)}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const tz = data?.timezone;
  return typeof tz === "string" && tz ? tz : null;
}

const LocationMarker = ({ latitude, longitude, setLatitude, setLongitude }) => {
  const map = useMap();
  useMapEvents({
    click(e) {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    },
  });
  useEffect(() => {
    if (latitude != null && longitude != null) {
      const currentZoom = map.getZoom();
      map.setView([latitude, longitude], currentZoom);
    }
  }, [latitude, longitude, map]);
  return (
    <>
      {latitude != null && longitude != null && (
        <>
          <Marker position={[latitude, longitude]} icon={markerIcon} />
          <Circle
            center={[latitude, longitude]}
            radius={4828}
            pathOptions={{ color: "green", fillOpacity: 0.2 }}
          />
        </>
      )}
    </>
  );
};

const NewApiary = () => {
  const navigate = useNavigate();

  // Core fields
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Country (shown) + tz (not stored per Option A)
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [tz, setTz] = useState("Europe/London");

  const [establishedDate, setEstablishedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [locationTypes, setLocationTypes] = useState([]);
  const [siteSettings, setSiteSettings] = useState([]);
  const [selectedLocationType, setSelectedLocationType] = useState("");
  const [selectedSiteSetting, setSelectedSiteSetting] = useState("");
  const [otherLocationType, setOtherLocationType] = useState("");
  const [otherSiteSetting, setOtherSiteSetting] = useState("");
  const [notes, setNotes] = useState("");

  // Photo
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Misc
  const [isDefault, setIsDefault] = useState(false);
  const [addressSearch, setAddressSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const successRef = useRef(null);

  // Reusable button styles (consistent sizes)
  const greenBtn =
    "bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const blueBtn =
    "bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500";

  const grayBtn =
    "bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-400";

  // Dropdowns
  useEffect(() => {
    (async () => {
      const { data: locationTypeData } = await supabase
        .from("location_types")
        .select();
      const { data: siteSettingData } = await supabase
        .from("site_settings")
        .select();
      if (locationTypeData) setLocationTypes(locationTypeData);
      if (siteSettingData) setSiteSettings(siteSettingData);
    })();
  }, []);

  // Prefill tz from profile (not stored with apiary)
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("timezone")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.timezone) setTz(profile.timezone);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Auto-update Country and tz when the pin changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (latitude == null || longitude == null) return;

      const [ccResult, tzResult] = await Promise.allSettled([
        reverseGeocodeCountry(latitude, longitude),
        detectTimezone(latitude, longitude),
      ]);

      if (cancelled) return;

      if (ccResult.status === "fulfilled" && ccResult.value) {
        setCountry(ccResult.value.name);
        setCountryCode(ccResult.value.code || "");
      }
      if (tzResult.status === "fulfilled" && tzResult.value) {
        setTz(tzResult.value);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  // Success scroll
  useEffect(() => {
    if (successMessage) {
      successRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [successMessage]);

  // Photo preview
  useEffect(() => {
    if (!photo) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Require a pin on the map before saving
    if (latitude == null || longitude == null) {
      setErrorMessage(
        "Please click on the map to place the pin for your apiary location before saving."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated.");

      // Free plan guard
      let subLevel = "free";
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof?.subscription_level) subLevel = prof.subscription_level;
      } catch {
        /* ignore */
      }

      if (subLevel !== "premium") {
        const { count, error: cntErr } = await supabase
          .from("apiaries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("archived_at", null);
        if (cntErr) throw cntErr;
        if ((count ?? 0) >= 1) {
          throw new Error("Free plan allows only 1 apiary.");
        }
      }

      // Prevent duplicate names
      const { data: existing, error: dupErr } = await supabase
        .from("apiaries")
        .select("id")
        .eq("name", name)
        .eq("user_id", user.id)
        .is("archived_at", null);

      if (dupErr) throw dupErr;
      if (existing && existing.length > 0) {
        throw new Error("An active apiary with this name already exists.");
      }

      // 1) Insert apiary (no upload yet)
      const payloadInsert = {
        user_id: user.id,
        name,
        latitude,
        longitude,
        established_date: establishedDate || null,
        location_type:
          selectedLocationType === "Other"
            ? otherLocationType || null
            : selectedLocationType || null,
        site_setting:
          selectedSiteSetting === "Other"
            ? otherSiteSetting || null
            : selectedSiteSetting || null,
        notes: notes || null,
        is_default: false,
      };

      const { data: insertedApiary, error: insErr } = await supabase
        .from("apiaries")
        .insert(payloadInsert)
        .select("id")
        .single();

      if (insErr) throw insErr;

      let photo_url = null;
      let photo_path = null;

      // 2) Upload photo (after insert)
      if (photo && insertedApiary?.id) {
        const safeName = photo.name.replace(/[^\w.-]+/g, "_");
        photo_path = `apiaries/${user.id}/${insertedApiary.id}/${Date.now()}-${safeName}`;

        const { error: upErr } = await supabase.storage
          .from("photos")
          .upload(photo_path, photo, {
            upsert: true,
            contentType: photo.type || "image/jpeg",
          });

        if (upErr) {
          await supabase.from("apiaries").delete().eq("id", insertedApiary.id);
          throw new Error("Image upload failed: " + upErr.message);
        }

        const { data: pub } = supabase.storage
          .from("photos")
          .getPublicUrl(photo_path);

        // Store a clean URL with no cache-busting querystring
        photo_url = pub?.publicUrl || "";

        // Save URL (and PATH if available)
        let updateErr = null;
        const { error: updErr1 } = await supabase
          .from("apiaries")
          .update({ photo_url, photo_path })
          .eq("id", insertedApiary.id);
        updateErr = updErr1;

        if (
          updateErr &&
          /column .*photo_path.* does not exist/i.test(
            updateErr.message || ""
          )
        ) {
          await supabase
            .from("apiaries")
            .update({ photo_url })
            .eq("id", insertedApiary.id);
        } else if (updateErr) {
          throw updateErr;
        }
      }

      // 3) Default flag handling
      if (isDefault && insertedApiary?.id) {
        await supabase
          .from("apiaries")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .is("archived_at", null)
          .neq("id", insertedApiary.id);

        await supabase
          .from("apiaries")
          .update({ is_default: true })
          .eq("id", insertedApiary.id);

        await supabase
          .from("profiles")
          .update({ default_apiary_id: insertedApiary.id })
          .eq("user_id", user.id);
      }

      setSuccessMessage("Apiary saved successfully!");
      navigate("/apiaries");
    } catch (err) {
      console.error("Error saving apiary:", err);
      setErrorMessage(err.message || "Failed to save apiary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">New Apiary</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Apiary Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Date Apiary Established
          </label>
          <input
            type="date"
            value={establishedDate}
            onChange={(e) => setEstablishedDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <select
          value={selectedLocationType}
          onChange={(e) => setSelectedLocationType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Location Type</option>
          {locationTypes.map((type) => (
            <option key={type.id} value={type.name}>
              {type.name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        {selectedLocationType === "Other" && (
          <input
            type="text"
            placeholder="Specify other location type"
            value={otherLocationType}
            onChange={(e) => setOtherLocationType(e.target.value)}
            className="w-full border p-2 rounded"
          />
        )}

        <select
          value={selectedSiteSetting}
          onChange={(e) => setSelectedSiteSetting(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Site Setting</option>
          {siteSettings.map((setting) => (
            <option key={setting.id} value={setting.name}>
              {setting.name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        {selectedSiteSetting === "Other" && (
          <input
            type="text"
            placeholder="Specify other site setting"
            value={otherSiteSetting}
            onChange={(e) => setOtherSiteSetting(e.target.value)}
            className="w-full border p-2 rounded"
          />
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by address"
            value={addressSearch}
            onChange={(e) => setAddressSearch(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            type="button"
            onClick={async () => {
              if (!addressSearch.trim()) return;
              try {
                const hit = await forwardGeocode(addressSearch.trim());
                if (!hit) {
                  alert("Location not found.");
                  return;
                }
                setLatitude(Number(hit.lat));
                setLongitude(Number(hit.lon));
              } catch (err) {
                console.error("Address search failed:", err);
                if (
                  String(err?.message || "").includes("VITE_LOCATIONIQ_KEY")
                ) {
                  alert("Missing LocationIQ key in .env");
                } else {
                  alert("Address search failed. Please try again.");
                }
              }
            }}
            className={blueBtn}
          >
            Search
          </button>
        </div>

        <div className="h-64">
          <MapContainer
            center={[latitude ?? 51.4816, longitude ?? -3.1791]}
            zoom={13}
            className="clickable-map"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationMarker
              latitude={latitude}
              longitude={longitude}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
            />
          </MapContainer>
        </div>

        {/* Tip about pin + zoom/foraging area */}
        <div className="mt-2 text-xs text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-2">
          <strong className="block font-semibold mb-1">Tip</strong>
          <p>
            After searching for an address, you still need to{" "}
            <span className="font-semibold">click on the map</span> to drop the
            pin exactly where your apiary is. You can zoom and drag the map –
            zoom out to see the green circle, which shows the approximate
            foraging area around your apiary.
          </p>
        </div>

        {/* Country under the map (autofills from the pin; editable) */}
        <div>
          {latitude != null && longitude != null && (
            <div className="text-xs text-gray-600 mb-1">
              Selected location: {latitude.toFixed(5)},{" "}
              {longitude.toFixed(5)} (approx.)
            </div>
          )}
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="United Kingdom"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setLatitude(null);
              setLongitude(null);
            }}
            className={blueBtn}
          >
            Reset Pin
          </button>
          {/* Example neutral button if you add more actions later */}
          {/* <button type="button" className={grayBtn}>Another Action</button> */}
        </div>

        <textarea
          placeholder="Add any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {photo && (
          <div className="mt-3">
            <div className="relative inline-flex flex-col items-start mb-2 max-w-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 w-auto max-w-full object-contain rounded border"
              />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
                aria-label="Remove photo"
              >
                ×
              </button>
              <div className="mt-1 text-xs text-gray-600 break-all">
                {photo?.name || "image"}
              </div>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="block mt-2"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={() => setIsDefault(!isDefault)}
            id="isDefault"
          />
          <label htmlFor="isDefault">Set as default apiary</label>
        </div>

        {errorMessage && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <strong>{errorMessage}</strong>
          </div>
        )}

        {successMessage && (
          <div
            ref={successRef}
            className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm mb-4"
          >
            {successMessage}
          </div>
        )}

        <button type="submit" disabled={saving} className={greenBtn}>
          {saving ? "Saving..." : "Save Apiary"}
        </button>
      </form>
    </div>
  );
};

export default NewApiary;
