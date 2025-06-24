document.addEventListener("DOMContentLoaded", () => {
  console.log("Auth script loaded.");

  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68';

  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const message = document.getElementById('message'); // Make sure this exists in HTML

  // ✅ LOGIN
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email = emailInput.value;
      const password = passwordInput.value;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        message.textContent = "Login failed: " + error.message;
        message.style.color = "red";
      } else {
        message.textContent = "Login successful! Redirecting...";
        message.style.color = "green";
        setTimeout(() => {
          window.location.href = "/hivetag-netlify/hivetag/dashboard.html";
        }, 1200);
      }
    });
  }

  // ✅ REGISTER
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const email = emailInput.value;
      const password = passwordInput.value;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("user already registered")) {
          message.textContent = "You're already registered. Try logging in.";
          message.style.color = "orange";
        } else {
          message.textContent = "Registration failed: " + error.message;
          message.style.color = "red";
        }
      } else {
        message.textContent = "Registration successful! Check your email to confirm.";
        message.style.color = "green";
      }
    });
  }
});
