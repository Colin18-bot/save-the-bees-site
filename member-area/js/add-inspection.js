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
  const otherInput = document.getElementById("colony_behaviour_other");
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

  const { data: hives } = await supabase.from("hives").select("hive_id, apiary_id").eq("user_id", user.id).eq("apiary_id", apiary_id);
  hiveSelect.innerHTML = '<option value="">Select Hive</option>';
  hives.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h.hive_id;
    opt.textContent = h.hive_id;
    hiveSelect.appendChild(opt);
  });

  apiarySelect.addEventListener("change", async () => {
    const selectedApiaryId = apiarySelect.value;
    hiveSelect.innerHTML = '<option value="">Select Hive</option>';
    const { data: hives } = await supabase.from("hives").select("hive_id").eq("user_id", user.id).eq("apiary_id", selectedApiaryId);
    hives.forEach(h => {
      const opt = document.createElement("option");
      opt.value = h.hive_id;
      opt.textContent = h.hive_id;
      hiveSelect.appendChild(opt);
    });
  });

  toggleColonyBehaviourOther();
  toggleOtherCheckboxGroup("queen_status", "queen_status_other");
  toggleOtherCheckboxGroup("environment_signs", "environment_signs_other");
  toggleOtherCheckboxGroup("disease_list", "disease_other");
  toggleOtherCheckboxGroup("pest_list", "pest_other");
  toggleRadioGroup("disease_present", "diseaseDetails");
  toggleRadioGroup("pests_present", "pestDetails");

  if (photoInput) {
    if (!navigator.onLine) {
      alert("You are offline. Image upload is disabled.");
      photoInput.disabled = true;
    }

    photoInput.addEventListener("change", async () => {
      preview.innerHTML = "";
      photoUrls = [];
      const files = [...photoInput.files].slice(0, 3);

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          alert("Image must be less than 10MB");
          continue;
        }

        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            let { width, height } = img;
            const maxSize = 1024;
            if (width > height && width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            } else if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            canvas.toBlob(async blob => {
              const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
              const filePath = `${user.id}/inspection-photos/${Date.now()}_${file.name}`;
              const { error } = await supabase.storage.from("photos").upload(filePath, resizedFile);
              if (!error) {
                const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);
                photoUrls.push(urlData.publicUrl);
                const thumb = img.cloneNode();
                thumb.classList.add("thumbnail");
                thumb.title = "Click to remove";
                thumb.style.cursor = "pointer";
                thumb.addEventListener("click", () => {
                  photoUrls = photoUrls.filter(url => url !== urlData.publicUrl);
                  thumb.remove();
                });
                preview.appendChild(thumb);
              }
            }, "image/jpeg", 0.8);
          };
        };
        reader.readAsDataURL(file);
      }
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const payload = {
      user_id: user.id,
      inspection_date: get("inspection_date"),
      weather: get("weather"),
      temperature: parseFloat(get("temperature")),
      humidity: parseFloat(get("humidity")),
      apiary_name: apiary_id,
      hive_id: get("hive_id"),
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

    if (!payload.inspection_date || !payload.user_id) {
      alert("Missing required fields: date or user.");
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
