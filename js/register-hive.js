// register-hive.js

console.log("register-hive.js loaded");

// Assumes user_id is saved in localStorage at login
const userId = localStorage.getItem("user_id");

// Initialize Supabase client
const supabase = supabase.createClient(
  'https://ijgkmgvtaqtipslmscjq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68'
);

// DOM Elements
const form = document.getElementById("registerHiveForm");
const hiveTypeSelect = document.getElementById("hiveType");
const otherHiveType = document.getElementById("otherHiveType");
const beeSourceSelect = document.getElementById("beeSource");
const otherBeeSource = document.getElementById("otherBeeSource");
const queenBreedSelect = document.getElementById("queenBreed");
const otherQueenBreed = document.getElementById("otherQueenBreed");
const formMessage = document.getElementById("form-message");
const submitBtn = form.querySelector("button[type='submit']");

function toggleOtherField(selectEl, otherInputEl) {
  if (selectEl.value === "other") {
    otherInputEl.style.display = "block";
    otherInputEl.required = false;
  } else {
    otherInputEl.style.display = "none";
    otherInputEl.required = false;
  }
}

hiveTypeSelect.addEventListener("change", () => toggleOtherField(hiveTypeSelect, otherHiveType));
beeSourceSelect.addEventListener("change", () => toggleOtherField(beeSourceSelect, otherBeeSource));
queenBreedSelect.addEventListener("change", () => toggleOtherField(queenBreedSelect, otherQueenBreed));

async function populateApiaryOptions() {
  const { data, error } = await supabase
    .from("apiaries")
    .select("id, name")
    .eq("user_id", userId);

  const apiarySelect = document.getElementById("apiary");
  if (error) {
    alert("Error loading apiaries");
    return;
  }

  data.forEach((apiary) => {
    const option = document.createElement("option");
    option.value = apiary.id;
    option.textContent = apiary.name;
    apiarySelect.appendChild(option);
  });
}

populateApiaryOptions();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  formMessage.className = "";
  formMessage.textContent = "Saving hive...";

  const formData = new FormData(form);
  const photo = formData.get("photo");

  const payload = {
    user_id: userId,
    apiary_id: formData.get("apiary"),
    hive_name: formData.get("hiveName"),
    hive_type: formData.get("hiveType"),
    other_hive_type: formData.get("hiveType") === "other" ? formData.get("otherHiveType") : null,
    num_deeps: formData.get("deeps") || null,
    num_supers: formData.get("supers") || null,
    total_frames: formData.get("frames") || null,
    frames_in_deeps: formData.get("framesInDeeps") || null,
    frames_in_supers: formData.get("frames") || null,
    hive_colour: formData.get("hiveColour"),
    bee_source: formData.get("beeSource"),
    other_bee_source: formData.get("beeSource") === "other" ? formData.get("otherBeeSource") : null,
    date_establish: formData.get("hiveEstablished") || null,
    queen_breed: formData.get("queenBreed"),
    other_queen_breed: formData.get("queenBreed") === "other" ? formData.get("otherQueenBreed") : null,
    queen_color: formData.get("queen_color"),
    date_queen_accepted: formData.get("queenAccepted") || null,
    notes: formData.get("notes") || ""
  };

  try {
    const { data, error } = await supabase.from("hives").insert([payload]).select();
    if (error) throw error;

    const hiveId = data[0].id;

    if (photo && photo.name) {
      const filename = `${userId}/${hiveId}/${Date.now()}_${photo.name}`;
      const { error: uploadError } = await supabase.storage.from("hive-photos").upload(filename, photo);

      if (!uploadError) {
        await supabase.from("hives").update({ photo_path: filename }).eq("id", hiveId);
      }
    }

    formMessage.textContent = "✅ Hive registered successfully! Redirecting to dashboard...";
    formMessage.className = "form-success";
    setTimeout(() => {
      window.location.href = "/hivetag-netlify/hivetag/dashboard.html";
    }, 2500);
  } catch (err) {
    console.error("Hive registration failed:", err);
    formMessage.textContent = "❌ Failed to register hive. Please try again.";
    formMessage.className = "form-error";
  } finally {
    submitBtn.disabled = false;
  }
});
