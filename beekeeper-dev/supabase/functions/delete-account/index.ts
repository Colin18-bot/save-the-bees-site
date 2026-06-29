// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/delete-account/index.ts
// Orchestrator: cancels Stripe (if key present), deletes storage, DB rows, and Auth user.
// Defaults to DRY RUN unless { dryRun: false } is sent or ?dryRun=false.
// Accepts ?uid=... for admin-style testing; otherwise resolves from Authorization: Bearer <user_jwt>.
// Adds ?diag=1 endpoint to report safe env diagnostics (lengths only).

import { serve } from "std/http/server.ts";
import { load } from "std/dotenv/mod.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// Load envs locally (no overwrite in this std version)
await load({ envPath: ".env.local", export: true }).catch(() => {});
await load({ envPath: ".env",       export: true }).catch(() => {});

// --- Environment ---
const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ??
  Deno.env.get("PROJECT_URL") ??
  "";

const SERVICE_ROLE =
  Deno.env.get("SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  "";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

// --- Helpers ---
const jsonHeaders = { "Content-Type": "application/json", ...corsHeaders };

function restHeaders(extra?: Record<string, string>) {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    Accept: "application/json",
    Prefer: "count=exact",
    ...(extra || {}),
  };
}

function parseTotal(resp: Response): number {
  const cr = resp.headers.get("content-range") || "";
  const m = cr.match(/\/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

const ORDER: Array<{ table: string; cols: string[] }> = [
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

async function listOwnedStorage(uid: string) {
  const qs = new URLSearchParams({
    select: "name,bucket_id,owner,created_at",
    bucket_id: "eq.photos",
    owner: `eq.${uid}`,
    order: "created_at.desc",
  });
  const url = `${SUPABASE_URL}/rest/v1/storage_objects?${qs.toString()}`;
  const resp = await fetch(url, { headers: restHeaders() });
  if (!resp.ok) {
    const text = await resp.text();
    return { ok: false, error: `REST ${resp.status}: ${text}`, paths: [] as string[] };
  }
  const rows = (await resp.json()) as Array<{ name: string }>;
  return { ok: true, error: null, paths: rows.map((r) => r.name) };
}

async function deleteStorage(paths: string[]) {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const bucket = admin.storage.from("photos");
  let deleted = 0;
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { error } = await bucket.remove(batch);
    if (error) return { ok: false, deleted, error: error.message };
    deleted += batch.length;
  }
  return { ok: true, deleted, error: null };
}

async function discoverCount(table: string, cols: string[], uid: string) {
  for (const col of cols) {
    const qs = new URLSearchParams({ select: "id", [col]: `eq.${uid}` });
    const url = `${SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`;
    const resp = await fetch(url, { headers: restHeaders({ Range: "0-0" }) });
    if (resp.ok) return { col, count: parseTotal(resp) };
  }
  return { col: null as string | null, count: 0 };
}

async function deleteRows(table: string, col: string, uid: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${uid}`;
  const resp = await fetch(url, {
    method: "DELETE",
    headers: restHeaders({ Prefer: "return=representation" }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    return { ok: false, status: resp.status, error: text, deleted: 0 };
  }
  const arr = await resp.json().catch(() => []);
  return {
    ok: true,
    status: resp.status,
    error: null,
    deleted: Array.isArray(arr) ? arr.length : 0,
  };
}

type StripeResult = { skipped: boolean; note?: string; immediate?: boolean; subscription?: string };

serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    // guard envs up-front
    if (!SUPABASE_URL) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL in function env" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }
    if (!SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: "Missing SERVICE_ROLE_KEY in function env" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    const url = new URL(req.url);

    // diagnostics
    if (url.searchParams.get("diag") === "1") {
      return new Response(
        JSON.stringify({
          env: {
            supabaseUrlPresent: !!SUPABASE_URL,
            serviceRoleLen: SERVICE_ROLE.length,
            stripeKeyLen: STRIPE_SECRET_KEY.length,
          },
        }),
        { headers: jsonHeaders },
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const immediate = !!(body as Record<string, unknown>)?.immediate;

    // dryRun default true unless ?dryRun=false or body { dryRun:false }
    let dryRun = url.searchParams.get("dryRun") !== "false";
    if (typeof (body as Record<string, unknown>)?.dryRun === "boolean") {
      dryRun = (body as { dryRun: boolean }).dryRun;
    }

    const supaSrv = createClient(SUPABASE_URL, SERVICE_ROLE);

    // resolve uid securely — never trust uid from URL
      const auth = req.headers.get("Authorization") ?? "";
      const token = auth.replace("Bearer ", "");

      const { data, error } = await supaSrv.auth.getUser(token);

      if (error || !data?.user?.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const uid = data.user.id;

    // Step A — Stripe cancel (skip if no key or dry-run)
    let stripeResult: StripeResult = { skipped: true, note: "No STRIPE_SECRET_KEY set" };
    if (STRIPE_SECRET_KEY && !dryRun) {
      const { default: Stripe } = await import("npm:stripe@12.18.0");
      const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

      const { data: profile } = await supaSrv
        .from("profiles")
        .select("stripe_customer_id")
        .eq("user_id", uid)
        .maybeSingle();

      if (profile?.stripe_customer_id) {
        const subs = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: "active",
          limit: 1,
        });
        const sub = subs.data[0];
        if (sub) {
          if (immediate) await stripe.subscriptions.cancel(sub.id);
          else await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
          stripeResult = { skipped: false, immediate, subscription: sub.id };
        } else {
          stripeResult = { skipped: false, note: "No active subscription" };
        }
      } else {
        stripeResult = { skipped: false, note: "No Stripe customer" };
      }
    }

    // Step B — list storage
    const list = await listOwnedStorage(uid);
    if (!list.ok) {
      return new Response(JSON.stringify({ error: list.error }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    // Step C — DB plan
    const plan: Array<{
      table: string;
      column: string | null;
      preCount: number;
      action: "skip" | "delete";
      result?: { deleted: number } | { error: string; status: number };
    }> = [];

    for (const t of ORDER) {
      const d = await discoverCount(t.table, t.cols, uid);
      plan.push({
        table: t.table,
        column: d.col,
        preCount: d.count,
        action: d.count > 0 && d.col ? "delete" : "skip",
      });
    }

    // Dry-run returns full plan without doing anything
    if (dryRun) {
      return new Response(
        JSON.stringify({
          dryRun: true,
          uid,
          stripe: STRIPE_SECRET_KEY ? { wouldCallStripe: true, immediate } : { skipped: true },
          storage: { count: list.paths.length, paths: list.paths },
          db: plan,
          auth: { wouldDelete: true },
        }),
        { headers: jsonHeaders },
      );
    }

    // Step D — delete storage
    const storageDel = await deleteStorage(list.paths);

    // Step E — delete DB rows in order
    for (const step of plan) {
      if (step.action === "delete" && step.column) {
        const res = await deleteRows(step.table, step.column, uid);
        step.result = res.ok
          ? { deleted: res.deleted }
          : { error: res.error as string, status: res.status };
        if (!res.ok) {
          return new Response(
            JSON.stringify({ error: "DB delete failed", failedAt: step, plan }),
            { status: 500, headers: jsonHeaders },
          );
        }
      }
    }

    // Step F — delete Auth user (treat "user not found" as success)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);

    if (delErr) {
      const msg = delErr.message || "";
      const alreadyGone = /user\s*not\s*found/i.test(msg) || /not\s*found/i.test(msg);
      if (!alreadyGone) {
        return new Response(
          JSON.stringify({ error: msg, storageDel, db: plan }),
          { status: 500, headers: jsonHeaders },
        );
      }
      // treat as success
      return new Response(
        JSON.stringify({
          dryRun: false,
          uid,
          stripe: stripeResult,
          storage: storageDel,
          db: plan,
          auth: { deleted: false, alreadyDeleted: true },
        }),
        { headers: jsonHeaders },
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        dryRun: false,
        uid,
        stripe: stripeResult,
        storage: storageDel,
        db: plan,
        auth: { deleted: true },
      }),
      { headers: jsonHeaders },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
