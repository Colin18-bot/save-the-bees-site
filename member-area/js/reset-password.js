  const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const passwordInput = document.getElementById("new-password");
  const togglePassword = document.getElementById("togglePassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

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

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert("Password reset failed: " + error.message);
      return;
    }

    alert("Password has been reset successfully.");
    window.location.href = "login.html";
  });

