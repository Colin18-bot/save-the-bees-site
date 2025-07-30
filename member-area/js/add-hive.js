import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_KEY_HERE'; // Replace if needed
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form[name='add-hive-form']");
  const apiarySelect = document.getElementById("apiary_name");
  const hivePhoto = document.getElementById("hivePhoto");

  const user = await supabase.auth.getUser();
  const userId = user?.data?.user?.id;

  if (!userId) {
    alert("You must be logged in to add a hive.");
    form.querySelector("button[type='submit']").disabled = true;
    return;
  }

  // Populate apiary list
  const { data: apiaries, error: apiaryErr } = await supabase
    .from("apiaries")
    .select("apiary_name")
    .eq("user_id", userId);

  if (apiaryErr) {
    console.error("Error loading apiaries:", apiaryErr.message);
    alert("Could not load apiaries.");
    return;
  }

  if (!apiaries.length) {
    alert("You must add an apiary before adding a hive.");
    form.querySelector("button[type='submit']").disabled = true;
    return;
  }

  apiaries.forEach(({ apiary_name }) => {
    const opt = document.createElement("option");
    opt.value = apiary_name;
    opt.textContent = apiary_name;
    apiarySelect.appendChild(opt);
  });

  // Handle Hive Type "Other"
  const hiveType = document.getElementById("hive_type");
  const otherWrapper = document.getElementById("hiveTypeOtherWrapper");
  const otherInput = document.getElementById("hive_type_other");

  hiveType.addEventListener("change", () => {
    otherWrapper.classList.toggle("hidden", hiveType.value.toLowerCase() !== "other");
    if (hiveType.value !== "other") otherInput.value = "";
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const apiary_name = apiarySelect.value;
    const hive_id = document.getElementById("hive_id").value.trim();
    const hive_type = hiveType.value === "other" ? otherInput.value.trim() : hiveType.value;
    const hive_status = document.getElementById("hive_status").value;
    const hive_start_date = document.getElementById("hive_start_date").value || null;
    const hive_notes = document.getElementById("hive_notes").value.trim();
    const photo = hivePhoto.files[0];
    let hive_photo_url = null;

    // Check for duplicate hive ID
    const { data: existing, error: checkErr } = await supabase
      .from("hives")
      .select("hive_name")
      .eq("user_id", userId)
      .eq("apiary_name", apiary_name)
      .eq("hive_id", hive_id);

    if (checkErr) {
      alert("Error checking for duplicate hive.");
      return;
    }

    if (existing.length > 0) {
      alert(`You already have a hive with the ID "${hive_id}" in ${apiary_name}.`);
      return;
    }

    // Upload photo to Supabase Storage
    if (photo) {
      const path = `${userId}/${apiary_name}/${Date.now()}_${photo.name}`;
      const { error: uploadErr } = await supabase.storage.from("photos").upload(path, photo);

      if (uploadErr) {
        alert("Image upload failed.");
        return;
      }

      const { data: publicUrl } = supabase.storage.from("photos").getPublicUrl(path);
      hive_photo_url = publicUrl.publicUrl;
    }

    // Save hive to Supabase
    const { error: insertErr } = await supabase.from("hives").insert([{
      user_id: userId,
      apiary_name,
      hive_id,
      hive_type,
      hive_status,
      hive_start_date,
      hive_notes,
      hive_photo_url
    }]);

    if (insertErr) {
      alert("Failed to save hive.");
      console.error(insertErr);
    } else {
      window.location.href = "/member-area/html/hives.html";
    }
  });
});
