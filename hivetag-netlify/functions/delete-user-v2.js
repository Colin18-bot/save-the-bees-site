import { createClient } from '@supabase/supabase-js';

// ✅ Use server-level keys from Netlify environment
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, api_key } = req.body;

  console.log("🔍 Received user_id:", user_id);
  console.log("🔑 Provided API key:", api_key);

  if (api_key !== process.env.DELETION_API_KEY) {
    console.warn("❌ Unauthorized request");
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!user_id) {
    console.warn("⚠️ No user ID provided");
    return res.status(400).json({ error: 'User ID is required' });
  }

  
  try {
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};
