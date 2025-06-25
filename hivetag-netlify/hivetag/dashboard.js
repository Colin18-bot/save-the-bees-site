import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ Your actual Supabase project values
const supabaseUrl = 'https://hivetag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmV0YWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4NjQzMjkzMiwiZXhwIjoyMDAyMDE4NTMyfQ.Ng1sjNT-8HxKZrkFVw5pTFG_xx3SasGIRZnW6pqF4sAS';

// ✅ Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Logout button
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('❌ Logout failed: ' + error.message);
  } else {
    window.location.href = '/hivetag/auth.html';
  }
});

// ✅ Delete account button
document.getElementById('delete-account-btn')?.addEventListener('click', async () => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert('❌ You are not logged in.');
    return;
  }

  const confirmDelete = confirm('⚠️ Are you sure you want to permanently delete your account?');
  if (!confirmDelete) return;

  try {
    const response = await fetch('/.netlify/functions/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        api_key: 'DEL_95X8z!Dk3vQh6rTg'
      })
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid server response: ${text}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error deleting account.');
    }

    alert('✅ Account deleted successfully.');
    await supabase.auth.signOut();
    window.location.href = '/hivetag/auth.html';
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});
