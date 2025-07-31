import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.querySelector("form.inspection-form");
const preview = document.getElementById("preview");
const photoInput = document.getElementById("photo");
const deleteImageBtn = document.getElementById("deleteImageBtn");
let photoUrls = [];

function get(id) {
  return document.getElementById(id)?.value.trim() || null;
}

function toggleOtherCheckboxGroup(groupName, inputName) {
  const checkboxes = document.querySelectorAll(`input[name="${groupName}[]"]`);
  const otherInput = document.querySelector(`input[name='${inputName}']`);
  checkboxes.forEach(box => {
    box.addEventListener("change", () => {
      const show = [...checkboxes].some(cb => cb.checked && cb.value === "other");
      otherInput.classList.toggle("hidden", !show);
      if (!show) otherInput.value = "";
    });
  });
}

function toggleRadioGroup(name, sectionId) {
  const radios = document.querySelectorAll(`input[name='${name}']`);
  const section = document.getElementById(sectionId);
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      section.classList.toggle("hidden", radio.value !== "yes");
    });
  });
}

function toggleColonyOther() {
  const select = document.getElementById("colony");
  const otherInput = document.querySelector("input[name='colony_behaviour_other']");
  if (!select || !otherInput) return;
  select.addEventListener("change", () => {
    otherInput.classList.toggle("hidden", select.value !== "other");
    if (select.value !== "other") otherInput.value = "";
  });
  otherInput.classList.toggle("hidden", select.value !== "other");
}

function handlePhotoUploads() {
  if (!navigator.onLine) {
    photoInput.disabled = true;
    return;
  }
  photoInput.addEventListener("change", async () => {
    preview.innerHTML = "";
    photoUrls = [];
    for (const file of photoInput.files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from("photos").upload(fileName, file);
      if (error) return alert("Image upload failed: " + error.message);
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(fileName);
      photoUrls.push(publicUrl);

      const imgBox = document.createElement("div");
      imgBox.className = "img-thumb";
      const img = document.createElement("img");
      img.src = publicUrl;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Remove";
      btn.onclick = () => {
        imgBox.remove();
        photoUrls = photoUrls.filter(url => url !== publicUrl);
      };
      imgBox.appendChild(img);
      imgBox.appendChild(btn);
      preview.appendChild(imgBox);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("You must be logged in.");

  const dateField = document.getElementById("inspection_date");
  const today = new Date().toISOString().split("T")[0];
  dateField.value = today;

  const apiarySelect = document.getElementById("apiary_name");
  const hiveSelect = document.getElementById("hive_id");

  const { data: apiaries } = await supabase.from("apiaries").select("id, apiary_name, latitude, longitude").eq("user_id", user.id);
  apiaries.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.apiary_name;
    apiarySelect.appendChild(opt);
  });

  async function fetchWeather(date, lat, lon) {
    try {
      if (date > today) throw new Error("Future date not allowed");
      const res = await fetch(`https://api.weatherapi.com/v1/history.json?key=39921156867541d5812194436251705&q=${lat},${lon}&dt=${date}`);
      const data = await res.json();
      const day = data?.forecast?.forecastday?.[0]?.day;
      document.getElementById("weather").value = day?.condition.text || "";
      document.getElementById("temperature").value = day?.avgtemp_c || "";
      document.getElementById("humidity").value = day?.avghumidity || "";
    } catch (e) {
      alert("Weather fetch failed: " + e.message);
      document.getElementById("weather").value = "";
      document.getElementById("temperature").value = "";
      document.getElementById("humidity").value = "";
    }
  }

  apiarySelect.addEventListener("change", async () => {
    hiveSelect.innerHTML = '<option value="">Select Hive</option>';
    const { data: hives } = await supabase.from("hives").select("id, hive_id").eq("user_id", user.id).eq("apiary_id", apiarySelect.value);
    hives.forEach(h => {
      const opt = document.createElement("option");
      opt.value = h.id;
      opt.textContent = h.hive_id;
      hiveSelect.appendChild(opt);
    });
  });

  apiarySelect.dispatchEvent(new Event("change"));
  dateField.addEventListener("change", () => {
    const selected = dateField.value;
    const selectedApiary = apiaries.find(a => a.id === apiarySelect.value);
    if (selectedApiary) fetchWeather(selected, selectedApiary.latitude, selectedApiary.longitude);
  });
  dateField.dispatchEvent(new Event("change"));

  toggleColonyOther();
  toggleOtherCheckboxGroup("queen_status", "queen_status_other");
  toggleOtherCheckboxGroup("environment_signs", "environment_signs_other");
  toggleOtherCheckboxGroup("disease_list", "disease_other");
  toggleOtherCheckboxGroup("pest_list", "pest_other");
  toggleRadioGroup("disease_present", "diseaseDetails");
  toggleRadioGroup("pests_present", "pestDetails");
  handlePhotoUploads();

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      user_id: user.id,
      inspection_date: get("inspection_date"),
      weather: get("weather"),
      temperature: parseFloat(get("temperature")) || null,
      humidity: parseFloat(get("humidity")) || null,
      apiary_name: apiarySelect.value,
      hive_id: hiveSelect.value,
      colony_behaviour: get("colony"),
      colony_behaviour_other: get("colony_behaviour_other"),
      environment_signs: [...document.querySelectorAll("input[name='environment_signs[]']:checked")].map(x => x.value),
      environment_signs_other: get("environment_signs_other"),
      hive_population: get("population"),
      brood_pattern: get("broodPattern"),
      food_stores: get("foodStores"),
      queen_status: [...document.querySelectorAll("input[name='queen_status[]']:checked")].map(x => x.value),
      queen_status_other: get("queen_status_other"),
      disease_present: document.querySelector("input[name='disease_present']:checked")?.value || null,
      disease_list: [...document.querySelectorAll("input[name='disease_list[]']:checked")].map(x => x.value),
      disease_other: get("disease_other"),
      pests_present: document.querySelector("input[name='pests_present']:checked")?.value || null,
      pest_list: [...document.querySelectorAll("input[name='pest_list[]']:checked")].map(x => x.value),
      pest_other: get("pest_other"),
      inspection_notes: get("notes"),
      inspection_photo_url: photoUrls.length ? photoUrls.join(",") : null,
      latitude: parseFloat(get("latitude")) || null,
      longitude: parseFloat(get("longitude")) || null,
    };

    if (!payload.inspection_date || !payload.user_id || !payload.apiary_name || !payload.hive_id) {
      alert("Missing required fields: Date, Apiary, Hive");
      return;
    }

    const { error } = await supabase.from("inspections").insert([payload]);
    if (error) {
      alert("Submission failed: " + error.message);
      return;
    }

    window.location.href = "/member-area/html/dashboard.html";
  });
});
