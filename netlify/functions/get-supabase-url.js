export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      key: process.env.SUPABASE_URL,
    }),
  };
}
