// Toggle mobile menu
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle?.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Toggle dropdown submenus on arrow click only
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const dropdown = this.closest('.dropdown');
    dropdown.classList.toggle('open');
  });
});

// Optional: Close dropdowns when clicking elsewhere
document.addEventListener('click', function (e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
  }
});
