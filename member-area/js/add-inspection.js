import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form");
  const apiarySelect = document.getElementById("apiary_name");
  const hiveSelect = document.getElementById("hive");
  const photoInput = document.getElementById("photo");
  const preview = document.getElementById("preview") || document.createElement("div");
  const latInput = document.getElementById("latitude");
  const lonInput = document.getElementById("longitude");

  let photoUrls = [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("You must be logged in.");

  // === Populate Apiary List ===
  const { data: apiaries } = await supabase.from("apiaries").select("apiary_name, id").eq("user_id", user.id);
  apiaries.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.apiary_name;
    apiarySelect.appendChild(opt);
  });

  // === On Apiary Change, Populate Hive List ===
  apiarySelect.addEventListener("change", async () => {
    hiveSelect.innerHTML = `<option value="">Select Hive</option>`;
    const { data: hives } = await supabase.from("hives").select("hive_id, id").eq("apiary_name", apiarySelect.value);
    hives.forEach(h => {
      const opt = document.createElement("option");
      opt.value = h.id;
      opt.textContent = h.hive_id;
      hiveSelect.appendChild(opt);
    });
  });

  // === Get Weather Data from Default Apiary
  const { data: defaultApiary } = await supabase.from("apiaries").select("*").eq("user_id", user.id).eq("is_default", true).single();
  if (!defaultApiary) return alert("Default apiary not set.");

  const lat = defaultApiary.latitude;
  const lon = defaultApiary.longitude;
  latInput.value = lat;
  lonInput.value = lon;

  const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=39921156867541d5812194436251705&q=${lat},${lon}`);
  const weatherJson = await res.json();
  document.getElementById("weather").value = weatherJson.current.condition.text;
  document.getElementById("temperature").value = weatherJson.current.temp_c;
  document.getElementById("humidity").value = weatherJson.current.humidity;

  // === Toggle Checkbox "Other" Inputs ===
  function setupCheckboxOther(groupName, textboxName) {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}[]"]`);
    const otherBox = document.querySelector(`input[name="${textboxName}"]`);
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const otherChecked = Array.from(checkboxes).some(c => c.value === "other" && c.checked);
        otherBox.classList.toggle("hidden", !otherChecked);
      });
    });
  }

  setupCheckboxOther("queen_status", "queen_status_other");
  setupCheckboxOther("environment_signs", "environment_signs_other");
  setupCheckboxOther("disease_list", "disease_other");
  setupCheckboxOther("pest_list", "pest_other");

  // === Toggle Disease & Pest Sections
  function setupRadioToggle(radioName, sectionId) {
    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    const section = document.getElementById(sectionId);
    radios.forEach(r => {
      r.addEventListener("change", () => {
        section.classList.toggle("hidden", r.value !== "yes");
      });
      if (r.checked) section.classList.toggle("hidden", r.value !== "yes");
    });
  }

  setupRadioToggle("disease_present", "diseaseDetails");
  setupRadioToggle("pests_present", "pestDetails");

  // === Multi Photo Upload
  if (photoInput && preview) {
    preview.id = "preview";
    photoInput.parentNode.insertBefore(preview, photoInput.nextSibling);

    photoInput.addEventListener("change", async () => {
      preview.innerHTML = "";
      photoUrls = [];

      const files = Array.from(photoInput.files).slice(0, 5); // Max 5 images

      for (let file of files) {
        if (!file.type.startsWith("image/")) continue;

        const path = `${user.id}/inspection-photos/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("photos").upload(path, file);
        if (error) {
          alert("Upload failed");
          return;
        }

        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);

        const img = document.createElement("img");
        img.src = urlData.publicUrl;
        img.classList.add("preview-img");
        img.style.maxWidth = "100px";
        preview.appendChild(img);
      }
    });
  }

  // === Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const get = id => document.getElementById(id)?.value.trim() || null;
    const getArray = name => Array.from(document.querySelectorAll(`[name='${name}[]']:checked`)).map(e => e.value);
    const getRadio = name => document.querySelector(`input[name='${name}']:checked`)?.value || null;

    const payload = {
      user_id: user.id,
      inspection_date: new Date().toISOString(),
      apiary_name: apiarySelect.value,
      hive_id: hiveSelect.value,
      latitude: lat,
      longitude: lon,
      weather: get("weather"),
      temperature: get("temperature"),
      humidity: get("humidity"),
      colony_behaviour: get("colony"),
      colony_behaviour_other: get("colony_behaviour_other"),
      environment_signs: getArray("environment_signs"),
      environment_signs_other: get("environment_signs_other"),
      hive_population: get("population"),
      brood_pattern: get("broodPattern"),
      food_stores: get("foodStores"),
      queen_status: getArray("queen_status"),
      queen_status_other: get("queen_status_other"),
      disease_present: getRadio("disease_present"),
      disease_list: getArray("disease_list"),
      disease_other: get("disease_other"),
      pests_present: getRadio("pests_present"),
      pest_list: getArray("pest_list"),
      pest_other: get("pest_other"),
      inspection_notes: get("notes"),
      inspection_photo_url: photoUrls[0] || null // Only one saved now
    };

    const { error } = await supabase.from("inspections").insert([payload]);
    if (error) {
      console.error(error);
      alert("Error saving inspection.");
    } else {
      window.location.href = "/member-area/html/inspections.html";
    }
  });
});
