// Toggle hamburger menu
const toggleBtn = document.getElementById('menuToggle');
const navMenu = document.querySelector('.nav-menu');

if (toggleBtn && navMenu) {
  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// Dropdown toggle (desktop + mobile)
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

dropdownToggles.forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();
    const parent = button.closest('.dropdown');
    parent.classList.toggle('open');
  });
});

// Optional: close dropdown if clicking outside
document.addEventListener('click', e => {
  document.querySelectorAll('.dropdown').forEach(drop => {
    if (!drop.contains(e.target)) drop.classList.remove('open');
  });
});
