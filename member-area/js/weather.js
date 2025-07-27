document.addEventListener('DOMContentLoaded', () => {
  const forecastContainer = document.getElementById("weatherForecast");
  const select = document.getElementById("apiarySelect");
  const heading = document.getElementById("apiaryNameHeading");

  if (forecastContainer && select && heading) {
    // Initialize Leaflet map
    let map = L.map('map').setView([51.402, -3.280], 11);
    let marker = L.marker([51.402, -3.280]).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Format date to UK style: DD MMM YYYY
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    // Fetch weather from WeatherAPI
    async function fetchWeather(lat, lon) {
      forecastContainer.innerHTML = '<p>Loading...</p>';
      try {
        const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=39921156867541d5812194436251705&q=${lat},${lon}&days=3`);
        const data = await res.json();
        renderForecast(data.forecast.forecastday);
      } catch (err) {
        forecastContainer.innerHTML = '<p>Error loading weather data.</p>';
        console.error("Weather API error:", err);
      }
    }

    // Render weather cards
    function renderForecast(days) {
      forecastContainer.innerHTML = '';
      days.forEach(day => {
        const rainChance = parseInt(day.day.daily_chance_of_rain);
        let cardClass = "forecast-card-safe";
        if (rainChance >= 80) cardClass = "forecast-card-danger";
        else if (rainChance >= 50) cardClass = "forecast-card-warning";

        const card = document.createElement("div");
        card.className = `forecast-card ${cardClass}`;
        card.innerHTML = `
          <h3>${formatDate(day.date)}</h3>
          <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
          <p>${day.day.condition.text}</p>
          <p><strong>High:</strong> ${day.day.maxtemp_c}°C</p>
          <p><strong>Low:</strong> ${day.day.mintemp_c}°C</p>
          <p><strong>Chance of Rain:</strong> ${rainChance}%</p>
        `;
        forecastContainer.appendChild(card);
      });
    }

    // Handle apiary change
    select.addEventListener("change", () => {
      const [lat, lon, name] = select.value.split(",");
      heading.textContent = `Weather for: ${name}`;
      map.setView([lat, lon], 11);
      marker.setLatLng([lat, lon]);
      fetchWeather(lat, lon);
    });

    // Initial forecast
    const [latInit, lonInit, nameInit] = select.value.split(",");
    heading.textContent = `Weather for: ${nameInit}`;
    fetchWeather(latInit, lonInit);
  }
});
