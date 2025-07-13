// Toggle dropdown menu
const profileIcon = document.getElementById("profile-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

if (profileIcon && dropdownMenu) {
  profileIcon.addEventListener("click", function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  window.addEventListener("click", function() {
    dropdownMenu.classList.remove("show");
  });
}
