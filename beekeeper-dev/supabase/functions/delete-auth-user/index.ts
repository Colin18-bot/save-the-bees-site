// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/delete-auth-user/index.ts
// Deletes a user from Supabase Auth (admin) with optional dry-run.
// Usage: GET/POST ?uid=<uuid>&dryRun=true|false (default = true)

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { load } from "std/dotenv/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Load envs locally (no overwrite support in this std version)
await load({ envPath: ".env.local", export: true }).catch(() => {});
await load({ envPath: ".env", export: true }).catch(() => {});

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase envs" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const url = new URL(req.url);
    const uid = url.searchParams.get("uid") || "";
    let dryRun = url.searchParams.get("dryRun") !== "false"; // default true

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({} as unknown));
      if (typeof (body as Record<string, unknown>)?.dryRun === "boolean") {
        dryRun = (body as { dryRun: boolean }).dryRun;
      }
    }

    if (!uid) {
      return new Response(
        JSON.stringify({ error: "Missing ?uid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    if (dryRun) {
      // Also confirm whether the user exists
      const { data, error } = await admin.auth.admin.getUserById(uid);
      return new Response(
        JSON.stringify({
          dryRun: true,
          uid,
          exists: !!data?.user,
          error: error?.message || null,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const { error } = await admin.auth.admin.deleteUser(uid);
    if (error) {
      return new Response(
        JSON.stringify({ dryRun: false, uid, deleted: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    return new Response(
      JSON.stringify({ dryRun: false, uid, deleted: true }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
