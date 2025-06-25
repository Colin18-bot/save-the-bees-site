console.log('Auth script loaded.');

// ✅ Correct variables
const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68';

// ✅ Use the correct constant here
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");

  const messageEl = document.getElementById('auth-message');

  document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      messageEl.textContent = `Error: ${error.message}`;
      messageEl.style.color = 'red';
    } else {
      messageEl.textContent = '✅ Registration successful! Check your email to verify your account.';
      messageEl.style.color = 'green';
    }
  });

  document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      messageEl.textContent = `Error: ${error.message}`;
      messageEl.style.color = 'red';
    } else {
      window.location.href = '/hivetag-netlify/hivetag/dashboard.html';
    }
  });
});
