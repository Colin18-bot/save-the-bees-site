document.addEventListener("DOMContentLoaded", async () => {
  const SUPABASE_URL = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
  const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxMDY4NjcsImV4cCI6MjAzNDY4Mjg2N30.-FJgXZ9WvORnuwGHc7LOmQeqUbWWcdRtA2Dr92i0nqM';

  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);

  // ✅ Check if the user is logged in
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    // ⛔ Not logged in
    window.location.href = "/hivetag-netlify/hivetag/auth.html";
    return;
  }

  // ✅ Handle logout
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
