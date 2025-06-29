// Toggle the hamburger menu
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  // Dropdown menu toggle
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.dropdown');
      parent.classList.toggle('open');
    });
  });
});
