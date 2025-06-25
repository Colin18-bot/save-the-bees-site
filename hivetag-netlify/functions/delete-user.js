// File: netlify/functions/delete-user.js

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { user_id, api_key } = JSON.parse(event.body);

  // Optional: Protect with a secret
  if (api_key !== process.env.DELETION_API_KEY) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'User ID is required' }),
    };
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) {
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unexpected error occurred' }),
    };
  }
};
