// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/delete-user-photos/index.ts
// Deletes user-owned files from the `photos` bucket.
// Defaults to DRY RUN (no deletes) unless explicitly told to delete.
// Run locally with Deno (no Docker).

import { serve } from "std/http/server.ts";
import { load } from "std/dotenv/mod.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// Load envs (prefer .env.local). NOTE: std dotenv here does NOT support `overwrite`.
await load({ envPath: ".env.local", export: true }).catch(() => {});
await load({ envPath: ".env", export: true }).catch(() => {});

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim();
const SERVICE_ROLE = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

// diagnostics (no secrets printed)
console.log("[env]", {
  url: SUPABASE_URL,
  keyPrefix: SERVICE_ROLE ? SERVICE_ROLE.slice(0, 6) : "",
  keyLen: SERVICE_ROLE.length,
});

function restHeaders() {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    Accept: "application/json",
  };
}

function chunk<T>(arr: T[], size = 100): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");

    // dryRun = true (default) unless explicitly set to false via query (?dryRun=false)
    // or JSON body { dryRun: false }
    let dryRun = true;
    if (url.searchParams.has("dryRun")) {
      dryRun = url.searchParams.get("dryRun") !== "false";
    } else if (req.method === "POST") {
      try {
        const body = await req.json();
        if (typeof (body as Record<string, unknown>)?.dryRun === "boolean") {
          dryRun = (body as { dryRun: boolean }).dryRun;
        }
      } catch { /* ignore */ }
    }

    if (!uid) {
      return new Response(JSON.stringify({ error: "Missing ?uid" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE envs" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // STEP A — list owned objects via PUBLIC view created earlier (storage_objects)
    const qs = new URLSearchParams({
      select: "name,bucket_id,owner,created_at",
      bucket_id: "eq.photos",
      owner: `eq.${uid}`,
      order: "created_at.desc",
    });
    const restUrl = `${SUPABASE_URL}/rest/v1/storage_objects?${qs.toString()}`;
    const resp = await fetch(restUrl, { headers: restHeaders() });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: `REST ${resp.status}: ${text}` }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const rows = (await resp.json()) as Array<{ name: string; bucket_id: string }>;
    const paths = rows.map((r) => r.name);

    if (dryRun) {
      return new Response(
        JSON.stringify({ dryRun: true, uid, count: paths.length, paths }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (paths.length === 0) {
      return new Response(
        JSON.stringify({ dryRun: false, uid, attempted: 0, deleted: 0 }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // STEP B — delete in chunks via Storage API
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const bucket = admin.storage.from("photos");

    let deleted = 0;
    for (const batch of chunk(paths, 100)) {
      const { error } = await bucket.remove(batch);
      if (error) {
        return new Response(
          JSON.stringify({
            dryRun: false,
            uid,
            attempted: paths.length,
            deleted,
            error: error.message,
            lastBatch: batch,
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
      deleted += batch.length;
    }

    return new Response(
      JSON.stringify({ dryRun: false, uid, attempted: paths.length, deleted }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
