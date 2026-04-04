document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      document.querySelectorAll('.dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
      } else {
        dropdown.classList.remove('open');
      }
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });

    // ✅ Cookie Consent Logic
  const popup = document.getElementById('cookie-consent');
  const acceptAllBtn = document.getElementById('accept-all');
  const acceptSelectedBtn = document.getElementById('accept-selected');
  const analyticsCheckbox = document.getElementById('analytics');
  const marketingCheckbox = document.getElementById('marketing');

  const GA_MEASUREMENT_ID = 'G-T1974NZN05';

    function loadGoogleAnalytics() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  function applyConsent(consent) {
    if (consent && consent.analytics === true) {
      loadGoogleAnalytics();
    }
  }

  const savedConsent = localStorage.getItem('cookieConsent');

  if (popup && !savedConsent) {
    popup.style.display = 'block';
  }

  if (savedConsent) {
    try {
      applyConsent(JSON.parse(savedConsent));
    } catch (error) {
      console.error('Invalid cookie consent data:', error);
    }
  }

  function savePreferences(analytics, marketing) {
    const consent = {
      essential: true,
      analytics: analytics,
      marketing: marketing
    };

    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    applyConsent(consent);

    if (popup) popup.style.display = 'none';
  }

  if (acceptAllBtn && acceptSelectedBtn) {
    acceptAllBtn.addEventListener('click', () => {
      savePreferences(true, true);
    });

    acceptSelectedBtn.addEventListener('click', () => {
      savePreferences(
        analyticsCheckbox?.checked || false,
        marketingCheckbox?.checked || false
      );
    });
  }
});

const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
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
}
