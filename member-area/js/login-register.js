// login-register.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Shortened for privacy
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  // ==== Show/Hide Password (Login) ====
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  // ==== Show/Hide Password (Register) ====
  const registerPasswordInput = document.getElementById("register-password");
  const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");
  if (toggleRegisterPassword && registerPasswordInput) {
    toggleRegisterPassword.addEventListener("click", function () {
      const type = registerPasswordInput.type === "password" ? "text" : "password";
      registerPasswordInput.type = type;
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  // ==== Password Rules (Register) ====
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

  // ==== Login ====
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value;

      if (!email || !password) return alert("Please enter both email and password.");

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return alert("Login failed: " + error.message);

      window.location.href = "../html/dashboard.html";
    });
  }

  // ==== Register ====
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = registerPasswordInput.value;

      const allValid = [...document.querySelectorAll("#password-rules li")].every(item =>
        item.classList.contains("valid")
      );

      if (!name || !email || !password) return alert("Please fill in all fields.");
      if (!allValid) return alert("Please ensure your password meets all the requirements.");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          alert("That email is already in use. Please log in instead.");
        } else {
          alert("Registration failed: " + error.message);
        }
        return;
      }

      // Send welcome email via Netlify function
      try {
        await fetch("/.netlify/functions/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, name })
        });
      } catch (err) {
        console.warn("Failed to send welcome email:", err);
      }

      // Redirect to login page
      window.location.href = "login.html";
    });
  }

  // ==== Forgot Password ====
  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      if (!email) return alert("Please enter your email address.");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.beezknees.co.uk/member-area/forms/reset-password.html'
      });

      if (error) return alert("Failed to send reset link: " + error.message);

      alert("If this email exists, a reset link has been sent.");
      window.location.href = "login.html";
    });
  }

  // ==== Google Login ====
  const googleBtn = document.getElementById("google-login");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://www.beezknees.co.uk/member-area/html/dashboard.html'
        }
      });

      if (error) alert("Google login failed: " + error.message);
    });
  }
});
