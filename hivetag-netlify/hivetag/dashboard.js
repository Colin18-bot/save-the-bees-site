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

document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_KEY = 'YOUR_PUBLIC_ANON_KEY'; // ✅ Use your ANON key

  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const logoutBtn = document.getElementById('logout-btn');
  const deleteBtn = document.getElementById('delete-account-btn');

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

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmDelete = confirm("Are you sure you want to permanently delete your account?");
      if (!confirmDelete) return;

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        alert("No user found.");
        return;
      }

      // Send request to Supabase Admin API to delete the user (via your backend)
      alert("For security, direct user deletion must be handled via backend admin API.");
    });
  }
});

