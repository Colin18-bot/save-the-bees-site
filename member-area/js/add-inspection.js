import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.querySelector("form.inspection-form");
const preview = document.getElementById("preview") || document.createElement("div");
const photoInput = document.getElementById("photo");
let photoUrls = [];

function get(id) {
  return document.getElementById(id)?.value.trim() || null;
}

function toggleOtherCheckboxGroup(groupName, inputName) {
  const checkboxes = document.querySelectorAll(`input[name="${groupName}[]"]`);
  const otherInput = document.querySelector(`input[name="${inputName}"]`);
  checkboxes.forEach(box => {
    box.addEventListener("change", () => {
      const otherChecked = [...checkboxes].some(cb => cb.value === "other" && cb.checked);
      otherInput.classList.toggle("hidden", !otherChecked);
      if (!otherChecked) otherInput.value = "";
    });
  });
}

function toggleRadioGroup(radioName, sectionId) {
  const radios = document.querySelectorAll(`input[name="${radioName}"]`);
  const section = document.getElementById(sectionId);
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      section.classList.toggle("hidden", radio.value !== "yes");
    });
    if (radio.checked) section.classList.toggle("hidden", radio.value !== "yes");
  });
}

function toggleColonyBehaviourOther() {
  const select = document.getElementById("colony");
  const otherInput = document.querySelector("input[name='colony_behaviour_other']");
  if (select && otherInput) {
    select.addEventListener("change", () => {
      otherInput.classList.toggle("hidden", select.value !== "other");
      if (select.value !== "other") otherInput.value = "";
    });
    otherInput.classList.toggle("hidden", select.value !== "other");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("You must be logged in.");

  const { data: apiaryData, error: apiaryError } = await supabase
    .from("apiaries")
    .select("id, apiary_name, latitude, longitude")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();

  if (apiaryError || !apiaryData) return alert("No default apiary found. Please set one.");

  const { id: apiary_id, apiary_name, latitude, longitude } = apiaryData;
  const dateField = document.getElementById("inspection_date");
  let selectedDate = new Date().toISOString().split("T")[0];
  dateField.value = selectedDate;

  async function fetchWeather(date) {
    try {
      const today = new Date().toISOString().split("T")[0];
      if (date > today) throw new Error("Cannot fetch future weather");

      const res = await fetch(`https://api.weatherapi.com/v1/history.json?key=39921156867541d5812194436251705&q=${latitude},${longitude}&dt=${date}`);
      const data = await res.json();
      const day = data?.forecast?.forecastday?.[0]?.day;
      if (!day) throw new Error("No weather data found");
      document.getElementById("weather").value = day.condition.text;
      document.getElementById("temperature").value = day.avgtemp_c;
      document.getElementById("humidity").value = day.avghumidity;
    } catch (err) {
      console.error("Weather API error:", err);
      alert("Could not load weather for selected date: " + err.message);
      document.getElementById("weather").value = "";
      document.getElementById("temperature").value = "";
      document.getElementById("humidity").value = "";
    }
  }

  await fetchWeather(selectedDate);

  dateField.addEventListener("change", async () => {
    selectedDate = dateField.value;
    await fetchWeather(selectedDate);
  });

  const apiarySelect = document.getElementById("apiary_name");
  const hiveSelect = document.getElementById("hive_id");

  const { data: apiaries } = await supabase.from("apiaries").select("id, apiary_name").eq("user_id", user.id);
  apiaries.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.apiary_name;
    apiarySelect.appendChild(opt);
  });

  apiarySelect.value = apiary_id;

  async function loadHives(apiaryId) {
    hiveSelect.innerHTML = '<option value="">Select Hive</option>';
    const { data: hives } = await supabase.from("hives").select("id, hive_id").eq("user_id", user.id).eq("apiary_id", apiaryId);
    hives.forEach(h => {
      const opt = document.createElement("option");
      opt.value = h.id; // submit UUID
      opt.textContent = h.hive_id; // display text
      hiveSelect.appendChild(opt);
    });
  }

  await loadHives(apiary_id);

  apiarySelect.addEventListener("change", async () => {
    await loadHives(apiarySelect.value);
  });

  toggleColonyBehaviourOther();
  toggleOtherCheckboxGroup("queen_status", "queen_status_other");
  toggleOtherCheckboxGroup("environment_signs", "environment_signs_other");
  toggleOtherCheckboxGroup("disease_list", "disease_other");
  toggleOtherCheckboxGroup("pest_list", "pest_other");
  toggleRadioGroup("disease_present", "diseaseDetails");
  toggleRadioGroup("pests_present", "pestDetails");

  // ... [photo upload logic unchanged]

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const payload = {
      user_id: user.id,
      inspection_date: get("inspection_date"),
      weather: get("weather"),
      temperature: parseFloat(get("temperature")),
      humidity: parseFloat(get("humidity")),
      apiary_name: apiarySelect.value,
      hive_id: hiveSelect.value, // now UUID
      colony_behaviour: get("colony"),
      colony_behaviour_other: get("colony_behaviour_other"),
      environment_signs: [...document.querySelectorAll("input[name='environment_signs[]']:checked")].map(cb => cb.value),
      environment_signs_other: get("environment_signs_other"),
      hive_population: get("population"),
      brood_pattern: get("broodPattern"),
      food_stores: get("foodStores"),
      queen_status: [...document.querySelectorAll("input[name='queen_status[]']:checked")].map(cb => cb.value),
      queen_status_other: get("queen_status_other"),
      disease_present: document.querySelector("input[name='disease_present']:checked")?.value || null,
      disease_list: [...document.querySelectorAll("input[name='disease_list[]']:checked")].map(cb => cb.value),
      disease_other: get("disease_other"),
      pests_present: document.querySelector("input[name='pests_present']:checked")?.value || null,
      pest_list: [...document.querySelectorAll("input[name='pest_list[]']:checked")].map(cb => cb.value),
      pest_other: get("pest_other"),
      inspection_notes: get("notes"),
      inspection_photo_url: photoUrls.length ? photoUrls.join(",") : null,
      latitude,
      longitude
    };

    if (!payload.inspection_date || !payload.user_id || !payload.hive_id || !payload.apiary_name) {
      alert("Missing required fields: date, user, apiary or hive.");
      return;
    }

    const { error } = await supabase.from("inspections").insert([payload]);
    if (error) {
      alert("Submission failed: " + error.message);
      return console.error("Submission error:", error);
    }

    window.location.href = "/member-area/html/dashboard.html";
  });
});
