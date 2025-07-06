console.log("register-apiary.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([51.505, -0.09], 6);
  const lightTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  });
  lightTiles.addTo(map);

  let marker, foragingCircle;
  const latInput = document.getElementById("latitude");
  const lonInput = document.getElementById("longitude");
  const addressInput = document.getElementById("address");

  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    if (marker) {
      marker.setLatLng([lat, lng]);
      foragingCircle.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      foragingCircle = L.circle([lat, lng], {
        radius: 4828,
        color: '#007BFF',
        fillColor: '#007BFF',
        fillOpacity: 0.1
      }).addTo(map);
    }
    map.fitBounds(foragingCircle.getBounds(), { padding: [20, 20] });
    latInput.value = lat.toFixed(6);
    lonInput.value = lng.toFixed(6);
  });

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
          map.fitBounds(foragingCircle.getBounds(), { padding: [20, 20] });
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
    map.fitBounds(foragingCircle.getBounds(), { padding: [20, 20] });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 10);
    });
  }
});

// Form logic with top progress bar
const form = document.querySelector('form[name="register-apiary"]');
const formMessage = document.getElementById('form-message');
const submitButton = form.querySelector('button[type="submit"]');

// Create progress bar element
const progressBar = document.createElement('div');
progressBar.id = 'form-progress-bar';
document.body.appendChild(progressBar);

form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Start progress bar
  progressBar.classList.add('active');

  submitButton.disabled = true;
  formMessage.textContent = "";
  formMessage.className = "";

  const formData = new FormData(form);

  fetch("/", {
    method: "POST",
    body: formData,
  })
    .then(() => {
      formMessage.textContent = "✅ Apiary registered successfully! Redirecting to dashboard...";
      formMessage.className = "form-success";
      form.reset();

      setTimeout(() => {
        window.location.href = "/hivetag-netlify/hivetag/dashboard.html";
      }, 3000);
    })
    .catch((error) => {
      console.error("Form submission error:", error);
      formMessage.textContent = "❌ Something went wrong. Please try again.";
      formMessage.className = "form-error";
    })
    .finally(() => {
      progressBar.classList.remove('active');
      submitButton.disabled = false;
    });
});
