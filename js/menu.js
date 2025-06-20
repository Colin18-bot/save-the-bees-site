document.addEventListener('DOMContentLoaded', function () {
  // ✅ Hamburger menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // ✅ Toggle dropdowns on small screens
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpening = !dropdown.classList.contains('open');

      // Close other open dropdowns (optional)
      document.querySelectorAll('.dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });

      dropdown.classList.toggle('open');

      // Scroll into view if opening
      if (isOpening) {
        setTimeout(() => {
          dropdown.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }, 100); // slight delay ensures dropdown is open before scrolling
      }
    });
  });

  // ✅ Close dropdowns if clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
});
