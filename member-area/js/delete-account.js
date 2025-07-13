// delete-account.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Defensive: Don't crash everything if DOM isn't ready
document.addEventListener('DOMContentLoaded', () => {
  const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  const deleteBtn = document.getElementById('delete-account-button');
  if (!deleteBtn) return; // Stop if button isn't on this page

  const confirmModal = document.getElementById('confirm-modal');
  const confirmDelete = document.getElementById('confirm-delete');
  const cancelDelete = document.getElementById('cancel-delete');
  const spinner = document.getElementById('delete-spinner');
  const toast = document.getElementById('delete-toast');

  deleteBtn.addEventListener('click', () => confirmModal.classList.remove('hidden'));
  cancelDelete.addEventListener('click', () => confirmModal.classList.add('hidden'));

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
      await supabase.from('inspections').delete().eq('user_id', userId);
      await supabase.from('hives').delete().eq('user_id', userId);
      await supabase.from('apiaries').delete().eq('user_id', userId);
      await supabase.from('todo').delete().eq('user_id', userId);
      await supabase.from('logbook').delete().eq('user_id', userId);
      await supabase.from('groups').delete().eq('user_id', userId);

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
});






















