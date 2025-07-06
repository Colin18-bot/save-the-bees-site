console.log("register-hive.js loaded");

function toggleOtherField(selectEl, otherInputEl) {
  if (selectEl.value === "other") {
    otherInputEl.style.display = "block";
    otherInputEl.required = false;
  } else {
    otherInputEl.style.display = "none";
    otherInputEl.required = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  toggleOtherField(document.getElementById('hiveType'), document.getElementById('otherHiveType'));
});
