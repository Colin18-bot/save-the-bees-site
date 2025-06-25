import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ YOUR real Supabase project URL and ANON API key
const supabaseUrl = 'https://hivetag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmV0YWc...4sAS'; // truncated anon key

const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ LOGOUT BUTTON
document.getElementById('logout')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/hivetag/login.html';
});

// ✅ DELETE ACCOUNT BUTTON
document.getElementById('delete-account')?.addEventListener('click', async () => {
  const user = supabase.auth.user();

  if (!user) {
    alert('❌ You are not logged in.');
    return;
  }

  const confirmDelete = confirm('Are you sure you want to permanently delete your account?');
  if (!confirmDelete) return;

  try {
    const response = await fetch('/.netlify/functions/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid server response: ${text}`);
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error deleting account.');

    alert('✅ Account deleted successfully.');
    await supabase.auth.signOut();
    window.location.href = '/hivetag/login.html';
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});
