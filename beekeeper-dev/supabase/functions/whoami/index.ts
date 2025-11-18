// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/whoami/index.ts
// Diagnostic endpoint: verifies Supabase auth tokens and environment keys.

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL =
  Deno.env.get("PUBLIC_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Token can come from query or Authorization header
    const token =
      url.searchParams.get("token") ||
      (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, reason: "no token" }, null, 2),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify like the browser (anon client + Authorization header)
    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: anonUser, error: anonErr } = await anon.auth.getUser();

    // Service fallback (bypasses RLS if needed)
    const srv = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: srvUser, error: srvErr } = await srv.auth.getUser(token);

    const out = {
      ok: !!(anonUser?.user || srvUser?.user),
      envs: {
        has_url: !!SUPABASE_URL,
        has_anon: !!ANON_KEY,
        has_service: !!SERVICE_ROLE_KEY,
      },
      anon: {
        id: anonUser?.user?.id || null,
        email: anonUser?.user?.email || null,
        error: anonErr?.message || null,
      },
      service: {
        id: srvUser?.user?.id || null,
        email: srvUser?.user?.email || null,
        error: srvErr?.message || null,
      },
    };

    return new Response(JSON.stringify(out, null, 2), {
      status: out.ok ? 200 : 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
