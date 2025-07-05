console.log("register-apiary.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Set up base map
  const map = L.map("map").setView([51.505, -0.09], 6); // UK-centred

  // Light theme
  const lightTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  });
  lightTiles.addTo(map);

  let marker;
  let foragingCircle;

  const latInput = document.getElementById("latitude");
  const lonInput = document.getElementById("longitude");
  const addressInput = document.getElementById("address");

  // Handle map click to place/move marker and draw 3-mile radius
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;

    if (marker) {
      marker.setLatLng([lat, lng]);
      foragingCircle.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      foragingCircle = L.circle([lat, lng], {
        radius: 4828, // 3 miles in meters
        color: '#007BFF',
        fillColor: '#007BFF',
        fillOpacity: 0.1
      }).addTo(map);
    }

    // Fit map to show full circle
    const bounds = foragingCircle.getBounds();
    map.fitBounds(bounds, { padding: [20, 20] });

    latInput.value = lat.toFixed(6);
    lonInput.value = lng.toFixed(6);
  });

  // Address search via Nominatim
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

          if (marker) {
            marker.setLatLng([latNum, lonNum]);
            foragingCircle.setLatLng([latNum, lonNum]);
          } else {
            marker = L.marker([latNum, lonNum], { draggable: true }).addTo(map);
            foragingCircle = L.circle([latNum, lonNum], {
              radius: 4828,
              color: '#007BFF',
              fillColor: '#007BFF',
              fillOpacity: 0.1
            }).addTo(map);
          }

          // Fit map to show full circle
          const bounds = foragingCircle.getBounds();
          map.fitBounds(bounds, { padding: [20, 20] });

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

  // Pre-fill lat/lon on load (e.g., for edit mode)
  if (latInput.value && lonInput.value) {
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    marker = L.marker([lat, lon], { draggable: true }).addTo(map);
    foragingCircle = L.circle([lat, lon], {
      radius: 4828,
      color: '#007BFF',
      fillColor: '#007BFF',
      fillOpacity: 0.1
    }).addTo(map);
    const bounds = foragingCircle.getBounds();
    map.fitBounds(bounds, { padding: [20, 20] });
  }

  // Center map to user's location if available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 10);
    });
  }
});
