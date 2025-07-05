 <!-- Toggle 'Other' Inputs -->
  <script>
    function toggleOtherInput(selectElement, inputId) {
      const input = document.getElementById(inputId);
      input.style.display = selectElement.value === "Other" ? "block" : "none";
    }
  </script>

  <!-- Map JS -->
  <script>
    const map = L.map('map').setView([51.505, -0.09], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([51.505, -0.09], { draggable: true }).addTo(map);

    // Update lat/lon fields when marker moved
    marker.on('dragend', function (e) {
      const { lat, lng } = e.target.getLatLng();
      document.getElementById('latitude').value = lat.toFixed(6);
      document.getElementById('longitude').value = lng.toFixed(6);
    });

    // Address search via enter key
    document.getElementById('address').addEventListener('keypress', async function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const results = await res.json();
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          marker.setLatLng([lat, lon]);
          map.setView([lat, lon], 14);
          document.getElementById('latitude').value = lat.toFixed(6);
          document.getElementById('longitude').value = lon.toFixed(6);
        } else {
          alert('No results found. Please refine your address.');
        }
      }
    });
  </script>