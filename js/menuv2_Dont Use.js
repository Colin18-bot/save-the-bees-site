console.log("✅ menu.js is running");

const toggleBtn = document.getElementById('menuToggle');
const navMenu = document.querySelector('.nav-menu');

console.log("✅ toggleBtn:", toggleBtn);
console.log("✅ navMenu:", navMenu);

document.addEventListener('DOMContentLoaded', function () {
  console.log("✅ DOM ready");

  // === Hamburger Menu Toggle ===
  const toggleBtn = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.nav-menu'); // ← Fix: matches your HTML

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      console.log("✅ Hamburger toggled");
    });
  }

  // === Dropdown Toggle ===
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      document.querySelectorAll('.dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      dropdown.classList.toggle('open');
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });

  // === Back to Top Button ===
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // === Cookie Consent ===
  const popup = document.getElementById('cookie-consent');
  const acceptAllBtn = document.getElementById('accept-all');
  const acceptSelectedBtn = document.getElementById('accept-selected');
  const analyticsCheckbox = document.getElementById('analytics');
  const marketingCheckbox = document.getElementById('marketing');

  // Check if user has already made a choice
  if (!localStorage.getItem('cookieConsent')) {
    popup.style.display = 'block';
  }

  function savePreferences(analytics, marketing) {
    const consent = {
      essential: true,
      analytics: analytics,
      marketing: marketing
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    popup.style.display = 'none';
    applyConsent(consent);
  }

  acceptAllBtn.addEventListener('click', () => {
    savePreferences(true, true);
  });

  acceptSelectedBtn.addEventListener('click', () => {
    savePreferences(analyticsCheckbox.checked, marketingCheckbox.checked);
  });

  // Example: You can load or block scripts here based on consent
  function applyConsent(consent) {
    if (consent.analytics) {
      // Load Google Analytics here
      // e.g. insert GA script dynamically
    }
    if (consent.marketing) {
      // Load marketing pixels/scripts here
    }
  }

  // Re-apply saved preferences on load
  const stored = localStorage.getItem('cookieConsent');
  if (stored) {
    const consent = JSON.parse(stored);
    applyConsent(consent);
  }
});
