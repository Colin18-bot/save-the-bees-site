// === HIVETAG MASTER JS ===
// Combined logic for navigation, inspections, calendar, and apiary map

// [... all previous code remains unchanged ...]

  // === LEAFLET MAP INITIALISATION FOR ADD APIARY ===
  const mapElement = document.getElementById("map");
  if (mapElement) {
    let marker, circle;

    const map = L.map("map").setView([51.4816, -3.1791], 10);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap & CartoDB"
    }).addTo(map);

    const locateBtn = document.createElement("button");
    locateBtn.textContent = "📍 Use My Location";
    locateBtn.className = "btn-secondary";
    locateBtn.id = "locateBtn";
    locateBtn.type = "button";
    locateBtn.style.marginBottom = "1rem";
    mapElement.parentElement.insertBefore(locateBtn, mapElement);

    const latField = document.getElementById("latitude");
    const lonField = document.getElementById("longitude");

    function updateMapLocation(lat, lng) {
      map.setView([lat, lng], 13);
      setMarkerAndCircle(lat, lng);
      latField.value = lat.toFixed(6);
      lonField.value = lng.toFixed(6);
    }

    function setMarkerAndCircle(lat, lng) {
      if (!marker) {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on("dragend", e => {
          const { lat, lng } = e.target.getLatLng();
          updateMapLocation(lat, lng);
        });
      } else {
        marker.setLatLng([lat, lng]);
      }

      if (!circle) {
        circle = L.circle([lat, lng], {
          radius: 4828,
          color: "#2ecc71",
          fillColor: "#aaf4c4",
          fillOpacity: 0.2
        }).addTo(map);
      } else {
        circle.setLatLng([lat, lng]);
      }

      marker.bindPopup(`Lat: ${lat.toFixed(6)}<br>Lon: ${lng.toFixed(6)}`).openPopup();
    }

    // New logic block inserted as requested
    const locateBtnExternal = document.getElementById("locateBtn");
    if (locateBtnExternal && mapElement) {
      locateBtnExternal.addEventListener("click", () => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          latField.value = latitude.toFixed(6);
          lonField.value = longitude.toFixed(6);
          map.setView([latitude, longitude], 14);

          if (marker) {
            marker.setLatLng([latitude, longitude]);
          } else {
            marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
          }
        }, (err) => {
          alert("Unable to retrieve your location: " + err.message);
        });
      });
    }

    if (latField.value && lonField.value) {
      updateMapLocation(parseFloat(latField.value), parseFloat(lonField.value));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        updateMapLocation(latitude, longitude);
      });
    }

    map.on("click", e => {
      const { lat, lng } = e.latlng;
      updateMapLocation(lat, lng);
    });

    const addressSearch = document.createElement("input");
    addressSearch.type = "text";
    addressSearch.placeholder = "🔍 Search address (optional)";
    addressSearch.className = "form-input";
    addressSearch.style.marginBottom = "1rem";
    mapElement.parentElement.insertBefore(addressSearch, locateBtn);

    let searchTimeout;
    addressSearch.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      const query = addressSearch.value.trim();
      if (query.length > 3) {
        searchTimeout = setTimeout(() => {
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(results => {
              if (results.length > 0) {
                const { lat, lon } = results[0];
                updateMapLocation(parseFloat(lat), parseFloat(lon));
              } else {
                alert("No results found.");
              }
            });
        }, 600);
      }
    });
  }
