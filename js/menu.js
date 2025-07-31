document.addEventListener('DOMContentLoaded', function () {
  // === Main Nav Toggle ===
  const toggleBtn = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // === Dropdown Menu Toggle ===
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

  // === Cookie Consent Logic ===
  const popup = document.getElementById('cookie-consent');
  const acceptAllBtn = document.getElementById('accept-all');
  const acceptSelectedBtn = document.getElementById('accept-selected');
  const analyticsCheckbox = document.getElementById('analytics');
  const marketingCheckbox = document.getElementById('marketing');

  function applyConsent(consent) {
    if (consent.analytics) {
      const gaScript = document.createElement('script');
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-7C99K0XQKV';
      gaScript.async = true;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-7C99K0XQKV');
    }

    if (consent.marketing) {
      // Future: Load marketing scripts here
    }
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

  if (popup && acceptAllBtn && acceptSelectedBtn && analyticsCheckbox && marketingCheckbox) {
    if (!localStorage.getItem('cookieConsent')) {
      popup.style.display = 'block';
    }

    acceptAllBtn.addEventListener('click', () => {
      savePreferences(true, true);
    });

    acceptSelectedBtn.addEventListener('click', () => {
      savePreferences(analyticsCheckbox.checked, marketingCheckbox.checked);
    });

    const stored = localStorage.getItem('cookieConsent');
    if (stored) {
      try {
        const consent = JSON.parse(stored);
        applyConsent(consent);
      } catch (e) {
        console.error('Invalid cookie consent JSON', e);
        localStorage.removeItem('cookieConsent');
        popup.style.display = 'block';
      }
    }
  }
});
