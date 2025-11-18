// src/components/LocationPicker.jsx
import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationPicker = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    mapRef.current = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);

    mapRef.current.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }

      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const displayName = data.display_name || "Unknown location";

      setAddress(displayName);
      onLocationSelect({ lat, lng, address: displayName });
    });
  }, []);

  const handleSearch = async () => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${search}&format=json&limit=1`
    );
    const data = await response.json();
    if (data[0]) {
      const { lat, lon, display_name } = data[0];
      mapRef.current.setView([lat, lon], 15);
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }
      markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
      setAddress(display_name);
      onLocationSelect({ lat, lng: lon, address: display_name });
    }
  };

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
