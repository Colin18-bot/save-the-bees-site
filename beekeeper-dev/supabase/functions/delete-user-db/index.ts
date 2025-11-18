// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/delete-user-db/index.ts
// Deletes DB rows for a user in a safe order via PostgREST.
// Default is DRY RUN unless { dryRun: false } is sent (JSON body) or ?dryRun=false.
// Runs locally with Deno (no Docker).

import { serve } from "std/http/server.ts";
import { load } from "std/dotenv/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Load envs (prefer .env.local). NOTE: std dotenv here does NOT support `overwrite`.
await load({ envPath: ".env.local", export: true }).catch(() => {});
await load({ envPath: ".env", export: true }).catch(() => {});

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim();
const SERVICE_ROLE = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

function restHeaders(extra?: Record<string, string>) {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    Accept: "application/json",
    Prefer: "count=exact",
    ...(extra || {}),
  };
}

type Target = { table: string; cols: string[] };

// Delete children first, then parents, then profile last
const ORDER: Target[] = [
  { table: "sales_lines",     cols: ["user_id", "owner_id"] },
  { table: "sales_orders",    cols: ["user_id", "owner_id"] },
  { table: "inspections",     cols: ["user_id", "owner_id"] },
  { table: "logbook",         cols: ["user_id", "owner_id"] },
  { table: "todos",           cols: ["user_id", "owner_id"] },
  { table: "inventory_items", cols: ["user_id", "owner_id"] },
  { table: "expenses",        cols: ["user_id", "owner_id"] },
  { table: "hives",           cols: ["user_id", "owner_id"] },
  { table: "apiaries",        cols: ["user_id", "owner_id"] },
  { table: "site_settings",   cols: ["user_id", "owner_id"] },
  { table: "location_types",  cols: ["user_id", "owner_id"] },
  { table: "profiles",        cols: ["user_id", "id"] }, // last
];

async function countFor(table: string, col: string, uid: string) {
  const qs = new URLSearchParams({ select: "id", [col]: `eq.${uid}` });
  const url = `${SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`;
  const resp = await fetch(url, { method: "GET", headers: restHeaders({ Range: "0-0" }) });
  if (!resp.ok) return { ok: false, status: resp.status, total: 0, colTried: col };
  const cr = resp.headers.get("content-range") || "";
  const m = cr.match(/\/(\d+)$/);
  const total = m ? parseInt(m[1], 10) : 0;
  return { ok: true, status: resp.status, total, colTried: col };
}

async function deleteFor(table: string, col: string, uid: string) {
  const qs = new URLSearchParams({ [col]: `eq.${uid}` });
  const url = `${SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`;
  const resp = await fetch(url, {
    method: "DELETE",
    headers: restHeaders({ Prefer: "return=representation" }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    return { ok: false, status: resp.status, error: text, deleted: 0, colUsed: col };
  }
  const arr = await resp.json().catch(() => []);
  return {
    ok: true,
    status: resp.status,
    error: null,
    deleted: Array.isArray(arr) ? arr.length : 0,
    colUsed: col,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid") || "";
    let dryRun = true;

    if (url.searchParams.has("dryRun")) {
      dryRun = url.searchParams.get("dryRun") !== "false";
    } else if (req.method === "POST") {
      try {
        const b = await req.json();
        if (typeof (b as Record<string, unknown>)?.dryRun === "boolean") {
          dryRun = (b as { dryRun: boolean }).dryRun;
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

    const plan: Array<{
      table: string;
      column: string | null;
      preCount: number;
      action: "skip" | "delete";
      result?: { deleted: number } | { error: string; status: number };
    }> = [];

    // Build plan by discovering which column works per table
    for (const t of ORDER) {
      let matched: string | null = null;
      let preCount = 0;
      for (const c of t.cols) {
        const res = await countFor(t.table, c, uid).catch(() => ({
          ok: false,
          status: 0,
          total: 0,
          colTried: c,
        }));
        if (res.ok) {
          matched = c;
          preCount = res.total;
          break;
        }
      }
      plan.push({ table: t.table, column: matched, preCount, action: preCount > 0 ? "delete" : "skip" });
    }

    if (dryRun) {
      return new Response(JSON.stringify({ dryRun: true, uid, plan }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Execute deletes in order for tables that matched & have rows
    for (const step of plan) {
      if (step.action === "delete" && step.column) {
        const res = await deleteFor(step.table, step.column, uid);
        if (!res.ok) {
          step.result = { error: res.error || "unknown", status: res.status };
          // Stop at first failure to avoid half-deletes
          return new Response(JSON.stringify({ dryRun: false, uid, failedAt: step, plan }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        step.result = { deleted: res.deleted };
      }
    }

    return new Response(JSON.stringify({ dryRun: false, uid, plan }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
