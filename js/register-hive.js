// register-hive.js

// Assumes user_id is saved in localStorage at login
const userId = localStorage.getItem("user_id");

// Initialize Supabase client with your project credentials
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

// Handle display of "Other" text boxes
function toggleOtherField(selectEl, otherInputEl) {
  if (selectEl.value === "other") {
    otherInputEl.style.display = "block";
    otherInputEl.required = true;
  } else {
    otherInputEl.style.display = "none";
    otherInputEl.required = false;
  }
}

hiveTypeSelect.addEventListener("change", () => toggleOtherField(hiveTypeSelect, otherHiveType));
beeSourceSelect.addEventListener("change", () => toggleOtherField(beeSourceSelect, otherBeeSource));
queenBreedSelect.addEventListener("change", () => toggleOtherField(queenBreedSelect, otherQueenBreed));

// Populate apiary dropdown
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

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const photo = formData.get("photo");

  const payload = {
    user_id: userId,
    apiary_id: formData.get("apiary"),
    name: formData.get("hiveName"),
    hive_type: formData.get("hiveType") === "other" ? formData.get("otherHiveType") : formData.get("hiveType"),
    num_deeps: formData.get("deeps") || null,
    num_supers: formData.get("supers") || null,
    total_frames: formData.get("frames") || null,
    colour: formData.get("hiveColour"),
    bee_source: formData.get("beeSource") === "other" ? formData.get("otherBeeSource") : formData.get("beeSource"),
    date_established: formData.get("hiveEstablished") || null,
    queen_breed: formData.get("queenBreed") === "other" ? formData.get("otherQueenBreed") : formData.get("queenBreed"),
    queen_color: formData.get("queen_color"),
    date_queen_accepted: formData.get("queenAccepted") || null,
    notes: formData.get("notes") || ""
  };

  // Insert hive
  const { data, error } = await supabase.from("hives").insert([payload]).select();
  if (error) {
    alert("Failed to register hive: " + error.message);
    return;
  }

  const hiveId = data[0].id;

  // Upload image if present
  if (photo && photo.name) {
    const filename = `${userId}/${hiveId}/${Date.now()}_${photo.name}`;
    const { error: uploadError } = await supabase.storage.from("hive-photos").upload(filename, photo);

    if (!uploadError) {
      // Optional: Update hive record with photo path
      await supabase.from("hives").update({ photo_path: filename }).eq("id", hiveId);
    }
  }

  alert("Hive registered successfully!");
  form.reset();
  window.location.href = "/hivetag-netlify/hivetag/dashboard.html";
});
