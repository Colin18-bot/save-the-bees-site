document.addEventListener('DOMContentLoaded', function () {
  // Toggle dropdowns (mobile only)
  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 767) {
        e.preventDefault();
        const parent = this.closest('.dropdown');
        parent.classList.toggle('open');

        // Close others
        document.querySelectorAll('.dropdown').forEach(drop => {
          if (drop !== parent) drop.classList.remove('open');
        });
      }
    });
  });

  // Close all dropdowns on outside click (mobile only)
  document.addEventListener('click', e => {
    if (window.innerWidth <= 767 && !e.target.closest('#member-navbar')) {
      document.querySelectorAll('.dropdown').forEach(drop => drop.classList.remove('open'));
    }
  });
});
