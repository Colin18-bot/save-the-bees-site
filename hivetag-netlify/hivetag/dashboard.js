import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://hivetag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...4sAS'; // your real ANON key
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ LOGOUT BUTTON
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/hivetag/login.html';
});

// ✅ DELETE ACCOUNT BUTTON
document.getElementById('delete-account-btn')?.addEventListener('click', async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    alert('❌ You are not logged in.');
    return;
  }

  const confirmDelete = confirm('Are you sure you want to permanently delete your account?');
  if (!confirmDelete) return;

  try {
    const response = await fetch('/.netlify/functions/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        api_key: 'DEL_95X8z!Dk3vQh6rTg' // 🔐 must match your Netlify DELETION_API_KEY
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
