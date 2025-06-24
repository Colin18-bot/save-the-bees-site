// /hivetag-netlify/hivetag/auth.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("Auth script loaded.");

  // ✅ Your actual Supabase project details
  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxMDY4NjcsImV4cCI6MjAzNDY4Mjg2N30.-FJgXZ9WvORnuwGHc7LOmQeqUbWWcdRtA2Dr92i0nqM';

  // ✅ Create Supabase client
  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

  // ✅ Grab DOM elements
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const messageBox = document.getElementById('auth-message');

  // ✅ Login event
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value
      });

      if (error) {
        messageBox.textContent = "Login failed: " + error.message;
        messageBox.style.color = "red";
      } else {
        messageBox.textContent = "Login successful! Redirecting...";
        messageBox.style.color = "green";
        setTimeout(() => {
          window.location.href = "/hivetag-netlify/hivetag/dashboard.html";
        }, 1000);
      }
    });
  }

  // ✅ Register event
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value
      });

      if (error) {
        messageBox.textContent = "Registration failed: " + error.message;
        messageBox.style.color = "red";
      } else {
        messageBox.textContent = "Registration successful! Check your email to verify.";
        messageBox.style.color = "green";
      }
    });
  }
});
