console.log("✅ Dashboard.js loaded");

// ✅ Create Supabase client
const supabase = window.supabase.createClient(
  'https://ijgkmgvtaqtipslmscjq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68'
);

// ✅ Session check on load
supabase.auth.getSession().then(({ data, error }) => {
  const loadingScreen = document.getElementById('member-loading-screen');

  if (error || !data.session) {
    console.warn("⚠️ No session:", error);
    alert("⚠️ You are not logged in. Redirecting...");
    window.location.href = '/hivetag-netlify/hivetag/auth.html';
  } else {
    console.log("✅ Logged in as:", data.session.user.email);
    if (loadingScreen) loadingScreen.style.display = 'none';
  }
});

// ✅ Cookie check warning
if (!navigator.cookieEnabled) {
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

// ✅ Logout handler
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("❌ Logout failed: " + error.message);
  } else {
    alert("✅ You have been logged out.");
    window.location.href = "/hivetag-netlify/hivetag/auth.html";
  }
});

// ✅ Delete account with confirmation
document.getElementById("delete-account-btn")?.addEventListener("click", async () => {
  const confirmDelete = confirm("⚠️ Are you sure you want to delete your account? This cannot be undone.");

  if (!confirmDelete) return;

  const session = await supabase.auth.getSession();
  const user = session?.data?.session?.user;

  if (!user) {
    alert("❌ No user session found.");
    return;
  }

  // 🔐 Send deletion request to Netlify function
  const response = await fetch("/.netlify/functions/delete-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "DEL_95X8z!Dk3vQh6rTg"
    },
    body: JSON.stringify({ user_id: user.id })
  });

  if (response.ok) {
    alert("✅ Your account has been deleted.");
    window.location.href = "/hivetag-netlify/hivetag/auth.html";
  } else {
    const msg = await response.text();
    alert("❌ Failed to delete account: " + msg);
  }
});
