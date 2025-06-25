// File: hivetag-netlify/functions/delete-user.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Netlify handler format
export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { user_id, api_key } = JSON.parse(event.body || '{}');

  // Validate API key
  if (api_key !== process.env.DELETION_API_KEY) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Unauthorized request' }),
    };
  }

  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing user_id' }),
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
