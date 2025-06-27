import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  try {
    console.log('⚙️ delete-user.js triggered');

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { user_id } = JSON.parse(event.body || '{}');
    if (!user_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user_id' }),
      };
    }

    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Supabase error: ' + error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Function crashed: ' + err.message }),
    };
  }
};
