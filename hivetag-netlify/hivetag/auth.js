// Supabase integration JS// File: /js/auth.js

document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (!session) {
    // Redirect to login page
    window.location.href = "/hivetag-netlify/hivetag/auth.html";
  }
});

(async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in, redirect to login page
    window.location.href = "/hivetag-netlify/hivetag/auth.html";
  }
})();


// Initialize Supabase
const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NDM2MSwiZXhwIjoyMDY2MzYwMzYxfQ.PCp8AJYS-zSMXNb8VK-2QXF6QRnyw0OEMKj7v8j4sAs';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

// Button elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Input fields
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Register
if (registerBtn) {
  registerBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Registration error: ' + error.message);
    } else {
      alert('Registration successful! Please check your email to confirm.');
    }
  });
}

// Login with auto-redirect
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login error: ' + error.message);
    } else {
      alert('Login successful! Redirecting...');
      window.location.href = "/hivetag-netlify/hivetag/dashboard.html";
    }
  });
}

// dashboard.js

const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOi...'; // Your actual anon key

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

// Handle logout
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Logout error: ' + error.message);
    } else {
      window.location.href = "/hivetag-netlify/hivetag/auth.html"; // Or your login page
    }
  });
}


