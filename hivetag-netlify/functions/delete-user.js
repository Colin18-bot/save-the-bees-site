const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = body.user_id;
    const apiKey = body.api_key;

    if (!userId || apiKey !== 'DEL_95X8z!Dk3vQh6rTg') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing or invalid data' })
      };
    }

    const supabase = createClient(
      'https://ijgkmgvtaqtipslmscjq.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: ' + err.message })
    };
  }
};
