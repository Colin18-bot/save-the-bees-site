// Supabase integration JS// File: /js/auth.js

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

// Login
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login error: ' + error.message);
    } else {
      alert('Login successful!');
      // Optionally redirect to dashboard:
      // window.location.href = "/hivetag/dashboard.html";
    }
  });
}

