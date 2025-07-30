import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.forms['add-inspection-form'];
const photoInput = document.getElementById("inspectionPhoto");
let photoUrl = null;

function toggleOtherField(selectId, otherId) {
  const select = document.getElementById(selectId);
  const other = document.getElementById(otherId);
  if (select && other) {
    const handler = () => {
      other.classList.toggle("hidden", select.value !== "other");
    };
    select.addEventListener("change", handler);
    handler();
  }
}

function toggleRadioGroup(radioName, sectionId) {
  const radios = document.getElementsByName(radioName);
  const section = document.getElementById(sectionId);
  radios.forEach(r => {
    r.addEventListener("change", () => {
      section.classList.toggle("hidden", r.value !== "yes");
    });
    if (r.checked) {
      section.classList.toggle("hidden", r.value !== "yes");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in to submit an inspection.");
    return;
  }

  // Fetch default apiary location
  const { data: apiaryData, error: apiaryError } = await supabase
    .from("apiaries")
    .select("latitude, longitude")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();

  if (apiaryError || !apiaryData) {
    alert("Default apiary location required to fetch weather.");
    return;
  }

  const lat = apiaryData.latitude;
  const lon = apiaryData.longitude;

  // Fetch weather data
  const weatherRes = await fetch(`https://api.weatherapi.com/v1/current.json?key=39921156867541d5812194436251705&q=${lat},${lon}`);
  const weatherJson = await weatherRes.json();
  const weather = weatherJson.current.condition.text;
  const temperature = weatherJson.current.temp_c;
  const humidity = weatherJson.current.humidity;

  // Toggle dynamic fields
  toggleOtherField("colony_behaviour", "colony_behaviour_other");
  toggleOtherField("queen_status", "queen_status_other");
  toggleOtherField("environment_signs", "environment_signs_other");
  toggleRadioGroup("disease_present", "diseaseDetails");
  toggleRadioGroup("pests_present", "pestDetails");

  // Image upload
  if (photoInput) {
    photoInput.addEventListener("change", async () => {
      const file = photoInput.files[0];
      if (file) {
        const path = `${user.id}/inspection-photos/${Date.now()}_${file.name}`;
        const { error: uploadErr } = await supabase.storage.from("photos").upload(path, file);
        if (!uploadErr) {
          const { data } = supabase.storage.from("photos").getPublicUrl(path);
          photoUrl = data.publicUrl;
        } else {
          alert("Failed to upload image.");
          console.error(uploadErr);
        }
      }
    });
  }

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const get = id => document.getElementById(id)?.value.trim() || null;
    const getArray = name => Array.from(document.querySelectorAll(`[name='${name}']:checked`)).map(e => e.value);
    const getRadio = name => document.querySelector(`input[name='${name}']:checked`)?.value || null;

    const payload = {
      user_id: user.id,
      inspection_date: new Date().toISOString(),
      apiary_name: get("apiary_name"),
      hive_id: get("hiveSelect"),
      weather,
      temperature,
      humidity,
      colony_behaviour: get("colony_behaviour"),
      colony_behaviour_other: get("colony_behaviour_other"),
      environment_signs: getArray("environment_signs"),
      environment_signs_other: get("environment_signs_other"),
      hive_population: get("hive_population"),
      brood_pattern: get("brood_pattern"),
      food_stores: get("food_stores"),
      queen_status: getArray("queen_status"),
      queen_status_other: get("queen_status_other"),
      disease_present: getRadio("disease_present"),
      disease_list: getArray("disease_list"),
      disease_other: get("disease_other"),
      pests_present: getRadio("pests_present"),
      pest_list: getArray("pest_list"),
      pest_other: get("pest_other"),
      inspection_notes: get("inspection_notes"),
      inspection_photo_url: photoUrl
    };

    const { error } = await supabase.from("inspections").insert([payload]);
    if (error) {
      console.error(error);
      alert("Failed to submit inspection.");
    } else {
      window.location.href = "/member-area/html/inspections.html";
    }
  });
});