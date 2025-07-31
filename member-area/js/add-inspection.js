import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.querySelector("form.inspection-form");
const preview = document.getElementById("preview") || document.createElement("div");
const photoInput = document.getElementById("photo");
const deleteBtn = document.getElementById("deleteImageBtn");
let photoUrls = [];

const toggleOtherCheckboxGroup = (groupName, inputName) => {
  const checkboxes = document.querySelectorAll(`input[name="${groupName}[]"]`);
  const otherInput = document.querySelector(`input[name="${inputName}"]`);
  checkboxes.forEach(box => {
    box.addEventListener("change", () => {
      const otherChecked = [...checkboxes].some(cb => cb.value === "other" && cb.checked);
      otherInput.classList.toggle("hidden", !otherChecked);
      if (!otherChecked) otherInput.value = "";
    });
  });
};

const toggleRadioGroup = (radioName, sectionId) => {
  const radios = document.querySelectorAll(`input[name="${radioName}"]`);
  const section = document.getElementById(sectionId);
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      section.classList.toggle("hidden", radio.value !== "yes");
    });
    if (radio.checked) section.classList.toggle("hidden", radio.value !== "yes");
  });
};

const toggleColonyBehaviourOther = () => {
  const select = document.getElementById("colony");
  const otherInput = document.getElementById("colony_behaviour_other");
  if (select && otherInput) {
    select.addEventListener("change", () => {
      otherInput.classList.toggle("hidden", select.value !== "other");
      if (select.value !== "other") otherInput.value = "";
    });
    otherInput.classList.toggle("hidden", select.value !== "other");
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("You must be logged in.");

  const { data: apiaryData, error: apiaryError } = await supabase
    .from("apiaries")
    .select("apiary_name, latitude, longitude")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();

  if (apiaryError || !apiaryData) return alert("No default apiary found. Please set one.");

  const { latitude, longitude } = apiaryData;
  const dateField = document.getElementById("inspection_date");
  const today = new Date();
  let selectedDate = today.toISOString().split("T")[0];

  if (dateField) {
    dateField.type = "date";
    dateField.value = selectedDate;
    dateField.addEventListener("change", async () => {
      selectedDate = dateField.value;
      await fetchWeather(selectedDate);
    });
  }

  async function fetchWeather(date) {
    try {
      const selected = new Date(date);
      const todayStripped = new Date();
      todayStripped.setHours(0, 0, 0, 0);

      let res, data;
      if (selected.toDateString() === todayStripped.toDateString()) {
        res = await fetch(`https://api.weatherapi.com/v1/current.json?key=39921156867541d5812194436251705&q=${latitude},${longitude}`);
        data = await res.json();
        document.getElementById("weather").value = data.current.condition.text;
        document.getElementById("temperature").value = data.current.temp_c;
        document.getElementById("humidity").value = data.current.humidity;
      } else {
        res = await fetch(`https://api.weatherapi.com/v1/history.json?key=39921156867541d5812194436251705&q=${latitude},${longitude}&dt=${date}`);
        data = await res.json();
        const day = data?.forecast?.forecastday?.[0]?.day;
        if (!day) throw new Error("Missing forecast data");
        document.getElementById("weather").value = day.condition.text;
        document.getElementById("temperature").value = day.avgtemp_c;
        document.getElementById("humidity").value = day.avghumidity;
      }
    } catch (err) {
      console.error("Weather API failed:", err);
      alert("Could not load weather for selected date.");
    }
  }

  await fetchWeather(selectedDate);

  const { data: apiaries } = await supabase.from("apiaries").select("id, apiary_name").eq("user_id", user.id);
  const apiarySelect = document.getElementById("apiary_name");
  apiaries.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.apiary_name;
    opt.textContent = a.apiary_name;
    apiarySelect.appendChild(opt);
  });

  apiarySelect.addEventListener("change", async () => {
    const selectedApiary = apiarySelect.value;
    const hiveSelect = document.getElementById("hive_id");
    hiveSelect.innerHTML = '<option value="">Select Hive</option>';
    const { data: hives } = await supabase.from("hives").select("hive_id").eq("user_id", user.id).eq("apiary_name", selectedApiary);
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
                preview.appendChild(thumb);
                deleteBtn?.classList.remove("hidden");
              }
            }, "image/jpeg", 0.8);
          };
        };
        reader.readAsDataURL(file);
      }
    });

    deleteBtn?.addEventListener("click", () => {
      preview.innerHTML = "";
      photoInput.value = "";
      photoUrls = [];
      deleteBtn.classList.add("hidden");
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const get = id => document.getElementById(id)?.value.trim() || null;
    const getArray = name => [...document.querySelectorAll(`input[name='${name}[]']:checked`)].map(cb => cb.value);
    const getRadio = name => document.querySelector(`input[name='${name}']:checked`)?.value || null;

    const rawDate = get("inspection_date");
    if (!rawDate) {
      alert("Please select an inspection date.");
      return;
    }
    const inspectionDate = new Date(`${rawDate}T12:00:00Z`).toISOString();

    if (!get("hive_id")) {
      alert("Please select a hive.");
      return;
    }

    const payload = {
      user_id: user.id,
      inspection_date: inspectionDate,
      weather: get("weather"),
      temperature: parseFloat(get("temperature")),
      humidity: parseFloat(get("humidity")),
      apiary_name: get("apiary_name"),
      hive_id: get("hive_id"),
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
      inspection_photo_url: photoUrls.length ? photoUrls.join(",") : null,
      latitude,
      longitude
    };

    console.log("Submitting inspection:", payload);
    const { error } = await supabase.from("inspections").insert([payload]);
    if (error) {
      console.error("Submission failed:", error.message || error);
      alert("Submission failed. Please check for missing fields.");
    } else {
      window.location.href = "/member-area/html/dashboard.html";
    }
  });
});
