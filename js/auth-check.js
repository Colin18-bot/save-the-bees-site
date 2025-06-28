// ✅ JS: /js/auth-check.js

document.addEventListener('DOMContentLoaded', async () => {
  const loadingScreen = document.getElementById('loading-screen');

  // Show loading screen if present
  if (loadingScreen) loadingScreen.style.display = 'flex';

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = '/hivetag-netlify/hivetag/login.html';
  } else {
    // Hide loading screen if still there
    if (loadingScreen) loadingScreen.style.display = 'none';
  }
});
