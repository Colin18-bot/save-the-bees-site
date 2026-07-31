// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/probe-table/index.ts
// Probes a single table to discover which owner column matches a UID.
// Usage (after starting):  GET http://localhost:8000/?table=profiles&uid=<uuid>

import { serve } from "std/http/server.ts";
import { load } from "std/dotenv/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Load env files (no unsupported 'overwrite' option)
await load({ envPath: ".env.local", export: true }).catch(() => {});
await load({ envPath: ".env", export: true }).catch(() => {});

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim();
const SERVICE_ROLE = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

function restHeaders() {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    Accept: "application/json",
  };
}

async function tryFetch(url: string) {
  const resp = await fetch(url, { headers: restHeaders() });
  const text = await resp.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* keep text */
  }
  return { ok: resp.ok, status: resp.status, body: json ?? text };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const table = url.searchParams.get("table")?.trim();
    const uid = url.searchParams.get("uid")?.trim() || "";

    if (!table) {
      return new Response(JSON.stringify({ error: "Missing ?table" }), {
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

    // 1) Sample row to reveal columns
    const sampleUrl = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`;
    const sample = await tryFetch(sampleUrl);
    const fields = Array.isArray(sample.body) && (sample.body as unknown[])[0]
      ? Object.keys((sample.body as Record<string, unknown>[])[0])
      : [];

    // 2) Probe common owner columns
    const candidates = ["user_id", "owner_id", "id", "profile_id", "created_by", "account_id"];
    const checks: Array<{ column: string; status: number; ok: boolean; count: number | null; error?: string }> = [];

    for (const col of candidates) {
      const qs = new URLSearchParams({ select: "count:count()", [col]: `eq.${uid}` });
      const u = `${SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`;
      const r = await fetch(u, { headers: restHeaders() });
      let count: number | null = null;
      let err: string | undefined;

      if (r.ok) {
        try {
          const arr = await r.json();
          count = Array.isArray(arr) && arr[0] && typeof arr[0].count === "number" ? arr[0].count : 0;
        } catch (e) {
          err = String(e);
        }
      } else {
        err = await r.text();
      }
      checks.push({ column: col, status: r.status, ok: r.ok, count, error: err });
    }

    return new Response(JSON.stringify({ table, uid, fields, checks, sample }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
