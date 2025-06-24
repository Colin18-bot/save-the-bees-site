// /hivetag-netlify/hivetag/auth.js

document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_API_KEY = 'eyJhbGciOi...'; // your full key here

  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value
      });
      if (error) {
        alert("Login failed: " + error.message);
      } else {
        alert("Login successful!");
        window.location.href = "/hivetag-netlify/hivetag/dashboard.html";
      }
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value
      });
      if (error) {
        alert("Registration failed: " + error.message);
      } else {
        alert("Registration successful! Please check your email.");
      }
    });
  }
});
