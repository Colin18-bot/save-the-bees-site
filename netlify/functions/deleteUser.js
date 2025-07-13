// netlify/functions/deleteUser.js

import { createClient } from '@supabase/supabase-js';

// Use environment variables injected by Netlify
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate env vars
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in environment variables.');
  throw new Error('Supabase config error.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
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
      console.error('Supabase deleteUser error:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to delete user' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' }),
    };
  } catch (err) {
    console.error('Function error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
