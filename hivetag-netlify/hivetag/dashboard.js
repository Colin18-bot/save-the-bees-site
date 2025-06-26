console.log("✅ Dashboard.js loaded");

// ✅ Use correct Supabase project
const supabase = window.supabase.createClient(
  'https://ijgkmgvtaqtipslmscjq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ2ttZ3Z0YXF0aXBzbG1zY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQzNjEsImV4cCI6MjA2NjM2MDM2MX0.TOWVE8-l4pm8iajr3zyq8h5s205B1aBuXf0AzUuya68'
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
