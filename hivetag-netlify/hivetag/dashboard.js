console.log("✅ Dashboard.js loaded");

// ✅ Supabase UMD (global) version uses this
const supabase = window.supabase.createClient(
  'https://hivetag.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmV0YWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODAwMDAwMCwiZXhwIjoyMDAzNTc2MDAwfQ.ANKeNgxM7XfwtAv-9dFgN8Zq5X5JSZzPtwtAoRyq4sAS'
);

// ✅ Now you can safely call getSession anywhere
supabase.auth.getSession().then(({ data, error }) => {
  console.log("👤 Session:", data);
  if (!data.session) {
    alert("⚠️ You are not logged in. Redirecting...");
    window.location.href = '/hivetag-netlify/hivetag/auth.html';
  } else {
    console.log("✅ Logged in as:", data.session.user.email);
  }
});
