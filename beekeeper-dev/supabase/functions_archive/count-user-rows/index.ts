// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/count-user-rows/index.ts
// Read-only: returns counts of rows owned by a user across common tables.
// Uses header-based counting (Prefer: count=exact) — no SQL aggregates.
// Runs locally with Deno (no Docker).

import { serve } from "std/http/server.ts";
import { load } from "std/dotenv/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// NOTE: std/dotenv in this version does not support `overwrite`
await load({ envPath: ".env.local", export: true }).catch(() => {});
await load({ envPath: ".env",       export: true }).catch(() => {});

// Env fallbacks (support both naming styles)
const SUPABASE_URL =
  (Deno.env.get("SUPABASE_URL") || Deno.env.get("PUBLIC_SUPABASE_URL") || "").trim();
const SERVICE_ROLE =
  (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || "").trim();

function restHeaders(extra?: Record<string, string>) {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    Accept: "application/json",
    Prefer: "count=exact",
    ...(extra || {}),
  };
}

function parseTotal(resp: Response): number | null {
  // PostgREST returns Content-Range with Prefer: count=exact
  const cr = resp.headers.get("content-range") ?? resp.headers.get("Content-Range");
  if (!cr) return null;
  const m = cr.match(/\/(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

type TableProbe = { table: string; cols: string[] };

const CANDIDATES: TableProbe[] = [
  { table: "profiles",        cols: ["user_id", "id"] },
  { table: "apiaries",        cols: ["owner_id", "user_id"] },
  { table: "hives",           cols: ["owner_id", "user_id"] },
  { table: "inspections",     cols: ["owner_id", "user_id"] },
  { table: "logbook",         cols: ["owner_id", "user_id"] },
  { table: "todos",           cols: ["owner_id", "user_id"] },
  { table: "inventory_items", cols: ["owner_id", "user_id"] },
  { table: "expenses",        cols: ["owner_id", "user_id"] },
  { table: "sales_orders",    cols: ["owner_id", "user_id"] },
  { table: "sales_lines",     cols: ["owner_id", "user_id", "order_user_id"] },
  { table: "site_settings",   cols: ["user_id", "owner_id"] },
  { table: "location_types",  cols: ["owner_id", "user_id"] },
];

// Count using header-based total (no aggregates), return null if column invalid/not exposed.
async function countFor(table: string, col: string, uid: string): Promise<number | null> {
  const qs = new URLSearchParams({ select: "id", [col]: `eq.${uid}` });
  const url = `${SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: restHeaders({ Range: "0-0" }), // tiny payload; total comes from Content-Range
  });
  if (!resp.ok) return null;
  const total = parseTotal(resp);
  return typeof total === "number" ? total : 0;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");
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

    const results: Array<{ table: string; matchedColumn: string | null; count: number }> = [];

    for (const probe of CANDIDATES) {
      let matched: string | null = null;
      let total = 0;
      for (const col of probe.cols) {
        const n = await countFor(probe.table, col, uid).catch(() => null);
        if (typeof n === "number") {
          matched = col;
          total = n;
          break;
        }
      }
      results.push({ table: probe.table, matchedColumn: matched, count: total });
    }

    const nonZero = results.filter((r) => r.count > 0);

    return new Response(
      JSON.stringify(
        {
          uid,
          summary: { nonZeroCount: nonZero.length, totalTablesScanned: results.length },
          nonZero,
          all: results,
        },
        null,
        2,
      ),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
