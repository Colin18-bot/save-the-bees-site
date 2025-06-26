console.log("✅ Dashboard.js loaded");

// ✅ Create Supabase client
const supabase = window.supabase.createClient(
  'https://ijgkmgvtaqtipslmscjq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68'
);

// ✅ Check session on page load
supabase.auth.getSession().then(({ data, error }) => {
  if (error || !data.session) {
    console.warn("⚠️ No session:", error);
    alert("⚠️ You are not logged in. Redirecting...");
    window.location.href = '/hivetag-netlify/hivetag/auth.html';
  } else {
    console.log("✅ Logged in as:", data.session.user.email);
  }
});

// ✅ Silent cookie check
if (!navigator.cookieEnabled) {
  console.warn("⚠️ Cookies are disabled. Session may not persist.");
  const warning = document.createElement('p');
  warning.textContent = "⚠️ Your browser has cookies disabled. Login won't work correctly.";
  warning.style.color = "red";
  warning.style.fontWeight = "bold";
  warning.style.backgroundColor = "#fff3cd";
  warning.style.padding = "1rem";
  warning.style.border = "2px solid #ffcc00";
  warning.style.borderRadius = "6px";
  warning.style.margin = "1rem auto";
  warning.style.maxWidth = "600px";
  warning.style.textAlign = "center";
  document.body.prepend(warning);
}

// ✅ Detect session expiry (auto-logout)
supabase.auth.onAuthStateChange((event, session) => {
  if (!session) {
    console.warn("⚠️ Session expired or user signed out.");
    alert("⚠️ Your session has expired. Please log in again.");
    window.location.href = '/hivetag-netlify/hivetag/auth.html';
  }
});

// ✅ Logout button handler
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Logout failed:", error.message);
        alert("❌ Logout failed. Please try again.");
      } else {
        console.log("✅ Logged out successfully.");
        window.location.href = '/hivetag-netlify/hivetag/auth.html';
      }
    });
  }
});
