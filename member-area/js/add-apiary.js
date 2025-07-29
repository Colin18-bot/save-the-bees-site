import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === MAP ===
const mapElement = document.getElementById("map");
if (mapElement) {
  let marker, circle;
  const map = L.map("map").setView([51.4816, -3.1791], 10);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap & CartoDB"
  }).addTo(map);

  const locateBtn = document.createElement("button");
  locateBtn.textContent = "📍 Use My Location";
  locateBtn.className = "btn-secondary";
  locateBtn.id = "locateBtn";
  locateBtn.type = "button";
  locateBtn.style.marginBottom = "1rem";
  mapElement.parentElement.insertBefore(locateBtn, mapElement);

  const latField = document.getElementById("latitude");
  const lonField = document.getElementById("longitude");

  function updateMapLocation(lat, lng) {
    map.setView([lat, lng], 13);
    setMarkerAndCircle(lat, lng);
    latField.value = lat.toFixed(6);
    lonField.value = lng.toFixed(6);
  }

  function setMarkerAndCircle(lat, lng) {
    if (!marker) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", e => {
        const { lat, lng } = e.target.getLatLng();
        updateMapLocation(lat, lng);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }

    if (!circle) {
      circle = L.circle([lat, lng], {
        radius: 4828,
        color: "#2ecc71",
        fillColor: "#aaf4c4",
        fillOpacity: 0.2
      }).addTo(map);
    } else {
      circle.setLatLng([lat, lng]);
    }

    marker.bindPopup(`Lat: ${lat.toFixed(6)}<br>Lon: ${lng.toFixed(6)}`).openPopup();
  }

  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      updateMapLocation(coords.latitude, coords.longitude);
    }, err => alert("Location error: " + err.message));
  });

  if (latField.value && lonField.value) {
    updateMapLocation(parseFloat(latField.value), parseFloat(lonField.value));
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      updateMapLocation(pos.coords.latitude, pos.coords.longitude);
    });
  }

  map.on("click", e => {
    updateMapLocation(e.latlng.lat, e.latlng.lng);
  });

  const addressSearch = document.createElement("input");
  addressSearch.type = "text";
  addressSearch.placeholder = "🔍 Search address";
  addressSearch.className = "form-input";
  addressSearch.style.marginBottom = "1rem";
  mapElement.parentElement.insertBefore(addressSearch, locateBtn);

  let searchTimeout;
  addressSearch.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const query = addressSearch.value.trim();
    if (query.length > 3) {
      searchTimeout = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(results => {
            if (results.length > 0) {
              updateMapLocation(parseFloat(results[0].lat), parseFloat(results[0].lon));
            } else {
              alert("No results found.");
            }
          });
      }, 600);
    }
  });
}

// === TOGGLE "OTHER" FIELDS ===
const toggleOther = (selectId, inputId) => {
  const select = document.getElementById(selectId);
  const input = document.getElementById(inputId);
  if (select && input) {
    const check = () => {
      input.classList.toggle("hidden", select.value !== "other");
    };
    select.addEventListener("change", check);
    check();
  }
};

toggleOther("locationType", "location_type_other");
toggleOther("siteSetting", "site_setting_other");

// === IMAGE PREVIEW, DELETE, AND RESIZE ===
let resizedFile = null;
let uploadedFilePath = null;
const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const deleteBtn = document.getElementById("deleteImageBtn");

if (photoInput && preview && deleteBtn) {
  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    // ✅ FILE SIZE LIMIT (10MB)
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image is too large. Please upload a file smaller than ${maxSizeMB}MB.`);
      photoInput.value = "";
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

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
    photoInput.value = "";
    preview.innerHTML = "";
    deleteBtn.classList.add("hidden");

    // Delete image from Supabase if uploaded
    if (uploadedFilePath) {
      const { error: deleteError } = await supabase.storage.from("photos").remove([uploadedFilePath]);
      if (deleteError) {
        console.error("Error deleting image:", deleteError);
        alert("Error deleting image: " + deleteError.message);
      } else {
        console.log("Image deleted from storage:", uploadedFilePath);
        uploadedFilePath = null;
      }
    }

    resizedFile = null;
  });
}

// === FORM SUBMIT ===
const form = document.forms["add-apiary-form"];
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("You must be logged in.");
      return;
    }

    const get = (id) => document.getElementById(id)?.value.trim() || null;

const locationType = get("locationType");
const locationTypeOther = locationType === "other" ? get("locationTypeOther") : null;

const siteSetting = get("siteSetting");
const siteSettingOther = siteSetting === "other" ? get("siteSettingOther") : null;

const isDefault = form.defaultApiary.checked;

const payload = {
  user_id: user.id,
  apiary_name: get("apiaryName"),
  location_notes: get("locationNotes"),
  postcode: get("postcode"),
  start_date: get("start_date") || null,
  location_type: locationType,
  location_type_other: locationTypeOther,
  site_setting: siteSetting,
  site_setting_other: siteSettingOther,
  latitude: parseFloat(get("latitude")),
  longitude: parseFloat(get("longitude")),
  photo_url: null,
  is_default: isDefault,
  default_apiary: isDefault
};

    if (resizedFile) {
      uploadedFilePath = `apiary-photos/${user.id}/${Date.now()}_${resizedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(uploadedFilePath, resizedFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        alert("Photo upload failed: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(uploadedFilePath);
      payload.photo_url = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("apiaries").insert([payload]);
    if (insertError) {
      console.error("Supabase insert error:", insertError);
      alert("Failed to save apiary: " + insertError.message);
    } else {
      alert("Apiary saved.");
      window.location.href = "/member-area/html/apiaries.html";
    }
  });
}