console.log("Dashboard script loaded.");

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Setup Supabase client
  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68';

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

  // 🔘 Logout logic
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

  // 🗑️ Delete account logic
  const deleteBtn = document.getElementById('delete-account-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmDelete = confirm("⚠️ Are you sure you want to permanently delete your account?");
      if (!confirmDelete) return;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("No user found or not logged in.");
        return;
      }

      try {
        const response = await fetch('/.netlify/functions/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: user.id,
            api_key: 'DEL_95X8z!Dk3vQh6rTg' // ✅ Must match Netlify DELETION_API_KEY
          })
        });

        let result;
        try {
          result = await response.json();
        } catch {
          alert("❌ Server returned an invalid response.");
          return;
        }

        if (response.ok) {
          alert("✅ Account deleted successfully.");
          await supabase.auth.signOut();
          window.location.href = "/hivetag-netlify/hivetag/auth.html";
        } else {
          alert("❌ Error deleting account: " + result.error);
        }

      } catch (err) {
        alert("❌ Network error: " + err.message);
      }
    });
  }
});
