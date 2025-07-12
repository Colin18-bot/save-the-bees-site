const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uihngfpmoasnofyrvpmw.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Failed to delete user:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' }),
    };
  } catch (err) {
    console.error('Server error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
