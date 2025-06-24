document.addEventListener("DOMContentLoaded", async () => {
  console.log("Dashboard script loaded.");

  // ✅ Use public anon key here
  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68';

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error } = await client.auth.signOut();

      if (error) {
        alert("Logout failed: " + error.message);
      } else {
        window.location.href = "/hivetag-netlify/hivetag/auth.html";
      }
    });
  }
});
