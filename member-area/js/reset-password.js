// reset-password.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Truncated for privacy
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === Show/Hide Password ===
const passwordInput = document.getElementById("new-password");
const togglePassword = document.getElementById("togglePassword");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

// === Password Rules (Validation) ===
const passwordRules = {
  length: document.getElementById("length"),
  uppercase: document.getElementById("uppercase"),
  number: document.getElementById("number"),
  special: document.getElementById("special")
};

if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    passwordRules.length.className = val.length >= 8 ? "valid" : "invalid";
    passwordRules.uppercase.className = /[A-Z]/.test(val) ? "valid" : "invalid";
    passwordRules.number.className = /\d/.test(val) ? "valid" : "invalid";
    passwordRules.special.className = /[!@#$%^&*]/.test(val) ? "valid" : "invalid";
  });
}

// === Submit Reset Form ===
const resetForm = document.getElementById("reset-form");
resetForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const password = passwordInput.value.trim();

  const allValid = [...document.querySelectorAll("#password-rules li")].every(item =>
    item.classList.contains("valid")
  );

  if (!allValid) {
    alert("Please ensure your password meets all the requirements.");
    return;
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    alert("Password reset failed: " + error.message);
    return;
  }

  alert("Password has been reset successfully.");
  window.location.href = "login.html";
});
