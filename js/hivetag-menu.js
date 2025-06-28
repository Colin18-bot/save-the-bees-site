// Toggle hamburger menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.member-nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('show');
});

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