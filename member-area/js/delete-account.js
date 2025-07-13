// delete-account.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// These values are now safely injected from the HTML <script> tag
const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Elements
const deleteBtn = document.getElementById('delete-account-button');
const confirmModal = document.getElementById('confirm-modal');
const confirmDelete = document.getElementById('confirm-delete');
const cancelDelete = document.getElementById('cancel-delete');
const spinner = document.getElementById('delete-spinner');
const toast = document.getElementById('delete-toast');

// Show modal
deleteBtn.addEventListener('click', () => {
  confirmModal.classList.remove('hidden');
});

// Cancel modal
cancelDelete.addEventListener('click', () => {
  confirmModal.classList.add('hidden');
});

// Confirm delete
confirmDelete.addEventListener('click', async () => {
  spinner.classList.remove('hidden');
  confirmModal.classList.add('hidden');

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    alert("You're not logged in.");
    spinner.classList.add('hidden');
    return;
  }

  const userId = user.id;

  try {
    // Delete related data
    await supabase.from('inspections').delete().eq('user_id', userId);
    await supabase.from('hives').delete().eq('user_id', userId);
    await supabase.from('apiaries').delete().eq('user_id', userId);
    await supabase.from('todo').delete().eq('user_id', userId);
    await supabase.from('logbook').delete().eq('user_id', userId);
    await supabase.from('groups').delete().eq('user_id', userId);

    // Call serverless function to delete the user
    const res = await fetch('/.netlify/functions/deleteUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!res.ok) throw new Error('Server function failed');

    toast.classList.remove('hidden');
    setTimeout(() => {
      window.location.href = 'account-deleted.html';
    }, 2000);
  } catch (err) {
    console.error(err);
    alert('Failed to delete account.');
  } finally {
    spinner.classList.add('hidden');
  }
});
