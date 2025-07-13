// netlify/functions/deleteUser.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { userId } = JSON.parse(event.body)

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' }),
      }
    }

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Supabase deleteUser error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to delete user' }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' }),
    }
  } catch (err) {
    console.error('Function error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
