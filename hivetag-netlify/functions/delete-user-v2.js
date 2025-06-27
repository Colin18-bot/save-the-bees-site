import { createClient } from '@supabase/supabase-js'

// Use environment variables or fallback for testing
const supabaseUrl = 'https://ijgkmgvtaqtipslmscjq.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ MATCH THIS

const supabase = createClient(supabaseUrl, supabaseKey)

exports.handler = async (event, context) => {
  try {
    console.log('⚙️ delete-user-v2.js triggered');

    // Require POST only
    if (event.httpMethod !== 'POST') {
      console.log('❌ Invalid method:', event.httpMethod);
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { userId } = JSON.parse(event.body || '{}');
    if (!userId) {
      console.log('❌ No userId provided in body');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId in request body' }),
      };
    }

    console.log('🔐 Deleting user:', userId);

    const { error } = await supabase.auth.admin.deleteUser(userId);
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
