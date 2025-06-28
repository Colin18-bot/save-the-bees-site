document.addEventListener('DOMContentLoaded', function () {
  const memberNav = document.getElementById('member-navbar');

  // ✅ Toggle dropdowns on click (mobile only)
  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close other open dropdowns
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      dropdown.classList.toggle('open', !isOpen);
    });
  });

  // ✅ Close dropdown if clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('#member-navbar')) {
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
