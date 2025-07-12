console.log('Auth script loaded.');

// ✅ Correct constants
const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68';

// ✅ Fix: Use Supabase client correctly
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");

  const messageEl = document.getElementById('message');

  // Register
  document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await client.auth.signUp({ email, password });

    if (error) {
      messageEl.textContent = `Error: ${error.message}`;
      messageEl.style.color = 'red';
    } else {
      messageEl.textContent = '✅ Registration successful! Check your email to verify.';
      messageEl.style.color = 'green';
    }
  });

  // Login
  document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      messageEl.textContent = `Error: ${error.message}`;
      messageEl.style.color = 'red';
    } else {
      window.location.href = '/hivetag-netlify/hivetag/dashboard.html';
    }
  });

  // Forgot Password
  document.getElementById('forgot-password').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    if (!email) {
      messageEl.textContent = 'Please enter your email to reset your password.';
      messageEl.style.color = 'orange';
      return;
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.beezknees.co.uk/hivetag-netlify/hivetag/auth.html'
    });

    if (error) {
      messageEl.textContent = `Error: ${error.message}`;
      messageEl.style.color = 'red';
    } else {
      messageEl.textContent = 'Password reset link sent! Check your email.';
      messageEl.style.color = 'green';
    }
  });
});
