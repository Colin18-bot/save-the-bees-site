// /hivetag-netlify/hivetag/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_API_KEY = 'eyJhbGciOi...'; // full key here

  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert("Logout failed: " + error.message);
      } else {
        window.location.href = "/hivetag-netlify/hivetag/auth.html";
      }
    });
  }
});
