console.log("✅ Dashboard script loaded");

// ✅ Import Supabase Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ Full Supabase project config
const supabaseUrl = 'https://hivetag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmV0YWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODAwMDAwMCwiZXhwIjoyMDAzNTc2MDAwfQ.ANKeNgxM7XfwtAv-9dFgN8Zq5X5JSZzPtwtAoRyq4sAS';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Session check
const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

if (sessionError || !sessionData.session) {
  alert("⚠️ You are not logged in. Redirecting to login page.");
  window.location.href = '/hivetag-netlify/hivetag/auth.html';
} else {
  console.log("👤 Logged in as:", sessionData.session.user.email);
}

// ✅ LOGOUT button handler
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  console.log("🔌 Logging out...");
  await supabase.auth.signOut();
  window.location.href = '/hivetag-netlify/hivetag/auth.html';
});

// ✅ DELETE ACCOUNT button handler
document.getElementById('delete-account-btn')?.addEventListener('click', async () => {
  const confirmDelete = confirm("⚠️ Are you sure you want to permanently delete your account?");
  if (!confirmDelete) return;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    alert("❌ No user is currently logged in.");
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        api_key: 'DEL_95X8z!Dk3vQh6rTg'
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Account deleted successfully.");
      await supabase.auth.signOut();
      window.location.href = '/hivetag-netlify/hivetag/auth.html';
    } else {
      throw new Error(result.error || "Unknown error deleting account.");
    }

  } catch (err) {
    console.error("❌ Delete Error:", err);
    alert(`❌ ${err.message}`);
  }
});
