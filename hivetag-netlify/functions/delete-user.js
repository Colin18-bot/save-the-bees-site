// ✅ dashboard.js (place in public/js or wherever you're serving frontend scripts)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://hivetag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmV0YWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5NzAwMDAwMCwiZXhwIjoxOTIyNTM2MDAwfQ.mfCzWhNE2bnqvj8zS-QD7L5d5qLjgUklXc0gzzlS4sAS';
const DELETION_API_KEY = 'DEL_95X8z!Dk3vQh6rTg'; // must match Netlify env

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔒 Logout
const logoutBtn = document.getElementById('logout');
logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/hivetag/login.html';
});

// 🗑️ Delete Account
const deleteBtn = document.getElementById('delete-account');
deleteBtn?.addEventListener('click', async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    alert('❌ User not logged in.');
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
        api_key: DELETION_API_KEY
      })
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid server response: ${text}`);
    }

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Unknown error');

    alert('✅ Account deleted successfully.');
    await supabase.auth.signOut();
    window.location.href = '/hivetag/login.html';
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});