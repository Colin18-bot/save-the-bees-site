import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://hivetag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmV0YWc...4sAS'; // Replace with full ANON key
const deletionApiKey = 'DEL_95X8z!Dk3vQh6rTg'; // Must match Netlify env var

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🔓 Logout button
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Logout failed: ' + error.message);
  } else {
    window.location.href = '/hivetag/auth.html';
  }
});

// 🗑️ Delete account button
document.getElementById('delete-account-btn')?.addEventListener('click', async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    alert('❌ You are not logged in.');
    return;
  }

  const confirmDelete = confirm('⚠️ Are you sure you want to permanently delete your account?');
  if (!confirmDelete) return;

  try {
    const response = await fetch('/.netlify/functions/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        api_key: deletionApiKey,
      }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid server response: ${text}`);
    }

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to delete account.');

    alert('✅ Account deleted successfully.');
    await supabase.auth.signOut();
    window.location.href = '/hivetag/auth.html';
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});
