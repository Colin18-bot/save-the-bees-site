// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/_shared/test-cors/index.ts
// Minimal CORS echo endpoint to verify deployment and headers.

import { serve } from "std/http/server.ts";
import { corsHeaders } from "../cors.ts";

serve((req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Simple success response
  return new Response(
    JSON.stringify({ ok: true, method: req.method, path: new URL(req.url).pathname }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    },
  );
});
