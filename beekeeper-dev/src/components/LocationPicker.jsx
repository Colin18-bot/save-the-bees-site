// src/components/LocationPicker.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationPicker = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const clickHandlerRef = useRef(null);

  // keep latest callback without re-binding leaflet listeners
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    // init map once
    mapRef.current = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // store handler so we can remove it on unmount
    clickHandlerRef.current = async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }

      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
            lat
          )}&lon=${encodeURIComponent(lng)}&format=json`
        );
        const data = await response.json().catch(() => ({}));
        const displayName = data?.display_name || "Unknown location";

        setAddress(displayName);
        onLocationSelectRef.current?.({ lat, lng, address: displayName });
      } catch {
        // still emit lat/lng even if reverse geocode fails
        setAddress("Unknown location");
        onLocationSelectRef.current?.({ lat, lng, address: "Unknown location" });
      }
    };

    mapRef.current.on("click", clickHandlerRef.current);

    return () => {
      try {
        if (mapRef.current && clickHandlerRef.current) {
          mapRef.current.off("click", clickHandlerRef.current);
        }
        if (mapRef.current) {
          mapRef.current.remove();
        }
      } catch {
        // ignore cleanup errors
      } finally {
        mapRef.current = null;
        markerRef.current = null;
        clickHandlerRef.current = null;
      }
    };
  }, []);

  const handleSearch = useCallback(async () => {
    if (!mapRef.current) return;
    const q = (search || "").trim();
    if (!q) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          q
        )}&format=json&limit=1`
      );
      const data = await response.json().catch(() => []);

      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];

        const latNum = Number(lat);
        const lonNum = Number(lon);

        mapRef.current.setView([latNum, lonNum], 15);

        if (markerRef.current) {
          mapRef.current.removeLayer(markerRef.current);
        }
        markerRef.current = L.marker([latNum, lonNum]).addTo(mapRef.current);

        setAddress(display_name || "Unknown location");
        onLocationSelectRef.current?.({
          lat: latNum,
          lng: lonNum,
          address: display_name || "Unknown location",
        });
      }
    } catch {
      // ignore search errors (UI stays as-is)
    }
  }, [search]);

  return (
    <div>
      <label className="block mb-1">Search by Address</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter address"
          className="w-full border p-2 rounded"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      <div id="map" className="h-64 rounded border" />

      {address && (
        <p className="mt-2 text-sm text-gray-700">
          <strong>Selected:</strong> {address}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
