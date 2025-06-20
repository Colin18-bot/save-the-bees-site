/* ---------------------------------------------
   📱 Mobile Navigation Menu Interactions
   Handles hamburger toggle, closing on link click,
   and collapsing when clicking outside the nav.
---------------------------------------------- */

// Toggle the mobile navigation menu
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Close the menu when any nav link is clicked
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// Close the menu if the user clicks outside it
document.addEventListener('click', (e) => {
  const isClickInside = navMenu.contains(e.target) || menuToggle.contains(e.target);
  if (!isClickInside) {
    navMenu.classList.remove('active');
  }
});
// Toggle dropdown submenus on mobile
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const dropdown = this.closest('.dropdown');

    // Toggle open/closed
    if (dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
    } else {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      dropdown.classList.add('open');
    }
  });
});

// Close dropdowns if user taps outside
document.addEventListener('click', function (e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

