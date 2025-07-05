console.log("register-apiary.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Setup Leaflet map
  const map = L.map("map").setView([51.505, -0.09], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  let marker;

  // When user clicks map, place or move marker
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
    }

    document.getElementById("latitude").value = lat.toFixed(6);
    document.getElementById("longitude").value = lng.toFixed(6);
  });

  // Optional: address search (basic)
  const addressInput = document.getElementById("address");
  addressInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = addressInput.value;
      if (!query) return;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const results = await response.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        map.setView([latNum, lonNum], 16);

        if (marker) {
          marker.setLatLng([latNum, lonNum]);
        } else {
          marker = L.marker([latNum, lonNum]).addTo(map);
        }

        document.getElementById("latitude").value = latNum.toFixed(6);
        document.getElementById("longitude").value = lonNum.toFixed(6);
      }
    }
  });
});
