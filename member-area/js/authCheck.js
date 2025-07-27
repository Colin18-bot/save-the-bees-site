async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in — redirect to login
    window.location.href = '../forms/login.html';
  }
}

checkAuth();
