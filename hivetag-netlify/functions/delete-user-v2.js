import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijgkmgvtaqtipslmscjq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ✅ This must be set in Netlify

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  try {
    console.log('⚙️ delete-user-v2.js triggered');

    if (event.httpMethod !== 'POST') {
      console.log('❌ Invalid method:', event.httpMethod);
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { user_id } = JSON.parse(event.body || '{}'); // ✅ matches dashboard.js
    if (!user_id) {
      console.log('❌ No user_id provided');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user_id in request body' }),
      };
    }

    console.log('🔐 Deleting user:', user_id);
    const { error } = await supabase.auth.admin.deleteUser(user_id);

    if (error) {
      console.error('🔥 Supabase error:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Supabase deletion failed: ' + error.message }),
      };
    }

    console.log('✅ User deleted successfully');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' }),
    };

  } catch (err) {
    console.error('🔥 Unhandled crash:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Function crashed: ' + err.message }),
    };
  }
};
