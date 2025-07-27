document.addEventListener("DOMContentLoaded", () => {
  // ==== Supabase Config ====
  const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ==== Show/Hide Password Toggle (Login) ====
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  // ==== Show/Hide Password Toggle (Register) ====
  const registerPasswordInput = document.getElementById("register-password");
  const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");

  if (toggleRegisterPassword && registerPasswordInput) {
    toggleRegisterPassword.addEventListener("click", function () {
      const type = registerPasswordInput.getAttribute("type") === "password" ? "text" : "password";
      registerPasswordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  // ==== Live Password Validation (Register Only) ====
  const passwordRules = {
    length: document.getElementById("length"),
    uppercase: document.getElementById("uppercase"),
    number: document.getElementById("number"),
    special: document.getElementById("special")
  };

  if (registerPasswordInput) {
    registerPasswordInput.addEventListener("input", () => {
      const val = registerPasswordInput.value;
      passwordRules.length.className = val.length >= 8 ? "valid" : "invalid";
      passwordRules.uppercase.className = /[A-Z]/.test(val) ? "valid" : "invalid";
      passwordRules.number.className = /\d/.test(val) ? "valid" : "invalid";
      passwordRules.special.className = /[!@#$%^&*]/.test(val) ? "valid" : "invalid";
    });
  }

  // ==== Login Form ====
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert("Login failed: " + error.message);
        return;
      }

      window.location.href = "../html/dashboard.html";
    });
  }

  // ==== Register Form ====
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      console.log("Register form submitted");

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = registerPasswordInput.value;

      const allValid = [...document.querySelectorAll("#password-rules li")].every(item =>
        item.classList.contains("valid")
      );

      if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
      }

      if (!allValid) {
        alert("Please ensure your password meets all the requirements.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: 'https://www.beezknees.co.uk/member-area/forms/login.html'
        }
      });

      console.log("Sign-up result:", data, error);

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          alert("That email is already in use. Please log in instead.");
        } else {
          alert("Registration failed: " + error.message);
        }
        return;
      }

      if (data.user && !data.user.confirmed_at) {
        alert("Registration successful! Please check your email to confirm before logging in.");
      } else {
        alert("Registration complete. Redirecting to login...");
        window.location.href = "login.html";
      }
    });
  }

  // ==== Forgot Password Form ====
  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      if (!email) {
        alert("Please enter your email address.");
        return;
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.beezknees.co.uk/member-area/forms/reset-password.html'
      });

      if (error) {
        alert("Failed to send reset link: " + error.message);
        return;
      }

      alert("If this email exists, a reset link has been sent.");
      window.location.href = "login.html";
    });
  }

  // ==== Google Login Button ====
  const googleBtn = document.getElementById("google-login");
  if (googleBtn) {
    googleBtn.addEventListener("click", async function () {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://www.beezknees.co.uk/member-area/html/dashboard.html'
        }
      });

      if (error) {
        alert("Google login failed: " + error.message);
      }
    });
  }
});
