document.getElementById('delete-account').addEventListener('click', async () => {
  const user = supabase.auth.user();
  if (!user) {
    alert('You are not logged in.');
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: user.id }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete account');
    }

    alert('Account deleted successfully.');
    await supabase.auth.signOut();
    window.location.href = '/hivetag/login.html';
  } catch (error) {
    alert(`Network error: ${error.message}`);
  }
});
