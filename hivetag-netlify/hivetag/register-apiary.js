// register-apiary.js
console.log("register-apiary.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([51.505, -0.09], 6); // UK-centred default

  // Light map style (Carto)
  const lightTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  });
  lightTiles.addTo(map);

  // Optional: Dark theme (comment above if using this)
  /*
  const darkTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  });
  darkTiles.addTo(map);
  */

  // Initialize elements
  const latInput = document.getElementById("latitude");
  const lonInput = document.getElementById("longitude");
  const addressInput = document.getElementById("address");

  // Marker and Foraging Radius Circle
  let marker = L.marker([51.505, -0.09], { draggable: true }).addTo(map);
  let foragingCircle = L.circle([51.505, -0.09], {
    radius: 4828,
    color: '#007BFF',
    fillColor: '#007BFF',
    fillOpacity: 0.1
  }).addTo(map);

  // Update form when marker is dragged
  marker.on("dragend", () => {
    const { lat, lng } = marker.getLatLng();
    latInput.value = lat.toFixed(6);
    lonInput.value = lng.toFixed(6);
    foragingCircle.setLatLng([lat, lng]);
    map.setView([lat, lng], 15);
  });

  // Map click to reposition marker and circle
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    marker.setLatLng([lat, lng]);
    foragingCircle.setLatLng([lat, lng]);
    latInput.value = lat.toFixed(6);
    lonInput.value = lng.toFixed(6);
    map.setView([lat, lng], 15);
  });

  // Address search via Enter key
  addressInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = addressInput.value.trim();
      if (!query) return;

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const results = await response.json();

        if (results.length > 0) {
          const { lat, lon } = results[0];
          const latNum = parseFloat(lat);
          const lonNum = parseFloat(lon);

          marker.setLatLng([latNum, lonNum]);
          foragingCircle.setLatLng([latNum, lonNum]);
          map.setView([latNum, lonNum], 15);

          latInput.value = latNum.toFixed(6);
          lonInput.value = lonNum.toFixed(6);
        } else {
          alert("Location not found. Try a more specific search.");
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
        alert("Error during address lookup.");
      }
    }
  });

  // Optional: Prefill marker if values already set
  if (latInput.value && lonInput.value) {
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    marker.setLatLng([lat, lon]);
    foragingCircle.setLatLng([lat, lon]);
    map.setView([lat, lon], 13);
  }

  // Optional: Center map to user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 10);
    });
  }
});
