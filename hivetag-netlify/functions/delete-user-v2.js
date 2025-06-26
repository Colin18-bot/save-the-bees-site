// ✅ Import Supabase client using CommonJS
const { createClient } = require('@supabase/supabase-js');

// ✅ Create Supabase client using Service Role Key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Export handler in CommonJS format
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  const { user_id, api_key } = body;

  if (api_key !== process.env.DELETION_API_KEY) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

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
      body: JSON.stringify({ error: 'Unexpected server error.' }),
    };
  }
};
