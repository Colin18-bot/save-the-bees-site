// ✅ Toggle dropdowns on small screens
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const dropdown = this.closest('.dropdown');
    const isOpening = !dropdown.classList.contains('open');

    // Close other open dropdowns
    document.querySelectorAll('.dropdown.open').forEach(d => {
      if (d !== dropdown) d.classList.remove('open');
    });

    dropdown.classList.toggle('open');

    // 👉 Scroll into view only if opening
    if (isOpening) {
      dropdown.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  });
});

// ✅ Close dropdowns when clicking outside
document.addEventListener('click', function () {
  document.querySelectorAll('.dropdown.open').forEach(dropdown => {
    dropdown.classList.remove('open');
  });
});

// ✅ Hamburger menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', function () {
  navMenu.classList.toggle('active');

  // ✅ Prevent background scroll when menu is open
  if (navMenu.classList.contains('active')) {
    document.body.classList.add('menu-open');
    document.documentElement.classList.add('menu-open');
  } else {
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
  }
});
