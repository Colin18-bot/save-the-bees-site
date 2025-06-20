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

    // 👉 Scroll into view only if opening
    if (isOpening) {
      dropdown.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  });
});
