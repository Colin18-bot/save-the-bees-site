import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaG5nZnBtb2Fzbm9meXJ2cG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzE2MTEsImV4cCI6MjA2Nzk0NzYxMX0.JO8y5G4lxGoyJozZfyxK-8VkJ5UusQzzkQxEYy8RVGo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in — redirect to login
    window.location.href = '../forms/login.html';
  }
}

checkAuth();
