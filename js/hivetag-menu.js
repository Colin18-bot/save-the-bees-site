document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle'); // Optional, if you add hamburger menu
  const memberNav = document.getElementById('member-navbar');

  // ✅ Toggle main nav menu if hamburger is used
  if (menuToggle && memberNav) {
    menuToggle.addEventListener('click', () => {
      memberNav.classList.toggle('active');
    });
  }

  // ✅ Toggle dropdowns within member nav
  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close others
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      // Toggle this
      dropdown.classList.toggle('open', !isOpen);
    });
  });

  // ✅ Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('#member-navbar .dropdown')) {
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});

// ✅ Back to Top functionality (reuse)
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = 'block';
  } else {
    backToTopBtn.style.display = 'none';
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
