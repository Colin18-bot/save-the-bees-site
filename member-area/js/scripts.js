document.addEventListener('DOMContentLoaded', () => {

  // === Member Dropdown Toggle (must be outside import) ===
  const profileIcon = document.getElementById("profile-icon");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (profileIcon && dropdownMenu) {
    profileIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    window.addEventListener("click", function () {
      dropdownMenu.classList.remove("show");
    });
  }

  import('./supabaseClient.js').then(({ supabase: client }) => {

    // === Auto-Fill Profile Info ===
    client.auth.getUser().then(({ data }) => {
      if (data.user) {
        const profileName = document.getElementById("profile-name");
        const email = document.getElementById("dropdown-email");
        if (profileName && email) {
          profileName.textContent = data.user.user_metadata.full_name || "Logged in";
          email.textContent = data.user.email;
        }
      }
    });

    // === Password Strength Meter ===
    const passwordInput = document.getElementById('register-password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthLabel = document.getElementById('password-strength');

    if (passwordInput && strengthBar && strengthFill && strengthLabel) {
      import('https://cdn.jsdelivr.net/npm/zxcvbn@4.4.2/dist/zxcvbn.js').then(({ default: zxcvbn }) => {
        passwordInput.addEventListener('input', () => {
          const result = zxcvbn(passwordInput.value);
          const score = result.score;

          const labels = ['Very Weak 🔴', 'Weak 🟠', 'Fair 🟡', 'Good 🟢', 'Strong ✅'];
          const colors = ['#d32f2f', '#f57c00', '#fbc02d', '#388e3c', '#2e7d32'];
          const widths = ['20%', '40%', '60%', '80%', '100%'];

          strengthFill.style.width = widths[score];
          strengthFill.style.backgroundColor = colors[score];
          strengthLabel.textContent = `Strength: ${labels[score]}`;
          strengthBar.setAttribute('aria-valuenow', score);
        });
      });
    }

    // === Password Visibility Toggle ===
    document.querySelectorAll('.toggle-password').forEach(icon => {
      icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input && input.type) {
          input.type = input.type === 'password' ? 'text' : 'password';
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      });
    });

    // === Login ===
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('login-button');

      btn.disabled = true;
      btn.textContent = 'Logging in...';

      const { error } = await client.auth.signInWithPassword({ email, password });

      if (error) {
        alert(error.message);
        btn.textContent = 'Log In';
      } else {
        window.location.href = 'dashboard.html';
      }

      btn.disabled = false;
    });

    // === Register ===
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const btn = document.getElementById('register-button');

      btn.disabled = true;
      btn.textContent = 'Registering...';

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: 'https://www.beezknees.co.uk/login.html'
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          alert("This email is already registered. Please log in instead.");
          window.location.href = 'login.html';
        } else {
          alert(error.message);
        }
      } else if (data?.user?.identities?.length === 0) {
        alert("Account already exists. Please log in.");
        window.location.href = 'login.html';
      } else {
        alert("✅ Registration successful! Please check your email to verify your account.");
      }

      btn.disabled = false;
      btn.textContent = 'Register';
    });

    // === Forgot Password ===
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();

        if (!document.getElementById('forgot-email')) {
          const form = document.getElementById('login-form');
          const resetSection = document.createElement('div');
          resetSection.id = 'reset-password-container';
          resetSection.innerHTML = `
            <input type="email" id="forgot-email" placeholder="Enter your email to reset password" class="form-input" required style="margin-top: 10px;" />
            <button id="send-reset-link" class="form-button" style="margin-top: 5px;">Send Reset Link</button>
            <div id="forgot-message" class="form-message" style="margin-top: 5px;"></div>
          `;
          form.appendChild(resetSection);

          document.getElementById('send-reset-link').addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const email = document.getElementById('forgot-email').value.trim();
            const messageBox = document.getElementById('forgot-message');

            if (!email) {
              messageBox.innerHTML = '<p class="error">Please enter your email address.</p>';
              return;
            }

            const { error } = await client.auth.resetPasswordForEmail(email, {
              redirectTo: 'https://www.beezknees.co.uk/member-area/login.html'
            });

            if (error) {
              messageBox.innerHTML = `<p class="error">❌ ${error.message}</p>`;
            } else {
              messageBox.innerHTML = `<p class="success">📧 Password reset email sent. Check your inbox.</p>`;
            }
          });
        }
      });
    }

    // === Show Password Reset Confirmation ===
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('type') && urlParams.get('type') === 'recovery') {
      alert("✅ Your password has been reset. You can now log in with your new password.");
    }

    // === Google Sign-In ===
    document.getElementById('google-login')?.addEventListener('click', async () => {
      await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://www.beezknees.co.uk/dashboard.html'
        }
      });
    });

    // === Redirect If Already Logged In (login/register pages only) ===
    const isAuthPage = window.location.pathname.includes("login") || window.location.pathname.includes("register");
    if (isAuthPage) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.location.href = 'dashboard.html';
        }
      });
    }

    // === Theme Toggle ===
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    document.getElementById('toggle-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('toggle-theme-settings')?.addEventListener('click', toggleTheme);

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }

    // === UK Date Format ===
    document.querySelectorAll('input[type="date"]').forEach(input => {
      input.setAttribute("lang", "en-GB");
      input.setAttribute("placeholder", "dd/mm/yyyy");
    });

    // === Logout ===
    const logoutBtn = document.getElementById("logout-button");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to log out?")) {
          await client.auth.signOut();
          window.location.href = "login.html";
        }
      });
    }

  }); // End import supabase

}); // End DOMContentLoaded
