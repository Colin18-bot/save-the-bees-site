console.log("✅ Dashboard.js loaded");

// ✅ Create Supabase client from UMD global
const supabase = window.supabase.createClient(
  'https://hivetag.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmV0YWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODAwMDAwMCwiZXhwIjoyMDAzNTc2MDAwfQ.ANKeNgxM7XfwtAv-9dFgN8Zq5X5JSZzPtwtAoRyq4sAS'
);

// ✅ Check session on load
supabase.auth.getSession().then(({ data, error }) => {
  if (error || !data.session) {
    console.warn("⚠️ No session:", error);
    alert("⚠️ You are not logged in. Redirecting...");
    window.location.href = '/hivetag-netlify/hivetag/auth.html';
  } else {
    console.log("✅ Logged in as:", data.session.user.email);
  }
});
