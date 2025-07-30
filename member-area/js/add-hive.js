import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form[name='add-hive-form']");
  const apiarySelect = document.getElementById("apiary_name");
  const hivePhoto = document.getElementById("hivePhoto");
  const preview = document.getElementById("preview");
  const deleteBtn = document.getElementById("deleteImageBtn");

  let resizedFile = null;
  let uploadedFilePath = null;

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    alert("You must be logged in to add a hive.");
    form.querySelector("button[type='submit']").disabled = true;
    return;
  }

  // === Populate apiary list ===
  const { data: apiaries, error: apiaryErr } = await supabase
    .from("apiaries")
    .select("apiary_name")
    .eq("user_id", userId);

  if (apiaryErr || !apiaries.length) {
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

  // === Handle Hive Type "Other" ===
  const hiveType = document.getElementById("hive_type");
  const otherWrapper = document.getElementById("hiveTypeOtherWrapper");
  const otherInput = document.getElementById("hive_type_other");

  hiveType.addEventListener("change", () => {
    otherWrapper.classList.toggle("hidden", hiveType.value.toLowerCase() !== "other");
    if (hiveType.value !== "other") otherInput.value = "";
  });

  // === Handle Image Preview and Delete ===
  if (hivePhoto && preview && deleteBtn) {
    hivePhoto.addEventListener("change", async () => {
      const file = hivePhoto.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("Image is too large. Please use a file under 10MB.");
        hivePhoto.value = "";
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024;
        let { width, height } = img;

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

        canvas.toBlob((blob) => {
          resizedFile = new File([blob], file.name, { type: "image/jpeg" });
        }, "image/jpeg", 0.8);

        preview.innerHTML = "";
        preview.appendChild(img);
        deleteBtn.classList.remove("hidden");
      };

      reader.readAsDataURL(file);
    });

    deleteBtn.addEventListener("click", async () => {
      hivePhoto.value = "";
      preview.innerHTML = "";
      deleteBtn.classList.add("hidden");

      if (uploadedFilePath) {
        await supabase.storage.from("photos").remove([uploadedFilePath]);
        uploadedFilePath = null;
      }

      resizedFile = null;
    });
  }

  // === Form Submit ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const apiary_name = apiarySelect.value.trim();
    const hive_id = document.getElementById("hive_id").value.trim();
    const hive_type_raw = hiveType.value;
    const hive_type_other_val = otherInput.value.trim();
    const hive_type = hive_type_raw === "other" ? hive_type_other_val : hive_type_raw;
    const hive_status = document.getElementById("hive_status").value;
    const hive_start_date = document.getElementById("hive_start_date").value || null;
    const hive_notes = document.getElementById("hive_notes").value.trim();
    let hive_photo_url = null;

    // === Validate Required Fields ===
    if (!apiary_name) {
      alert("Please select or enter an apiary name.");
      return;
    }
    if (!hive_id) {
      alert("Hive ID cannot be empty.");
      return;
    }
    if (hive_type_raw === "other" && !hive_type_other_val) {
      alert("Please specify the other hive type.");
      return;
    }

    // === Duplicate Hive Check ===
    const { data: existing, error: checkErr } = await supabase
      .from("hives")
      .select("hive_id")
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

    // === Upload Photo ===
    if (resizedFile) {
      uploadedFilePath = `${userId}/hive-photos/${Date.now()}_${resizedFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("photos")
        .upload(uploadedFilePath, resizedFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadErr) {
        alert("Image upload failed: " + uploadErr.message);
        return;
      }

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(uploadedFilePath);
      hive_photo_url = urlData.publicUrl;
    }

    // === Save Hive ===
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
