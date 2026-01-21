// @ts-nocheck
// deno-lint-ignore-file

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type TableName = "apiaries" | "hives" | "logbook" | "inspections";
type Mode = "clear_photo" | "delete_row";

type RemoveOne = { path?: string; url?: string };

type DeleteBody = {
  table: TableName;
  id: string;
  mode: Mode;
  removeOne?: RemoveOne;
};

type CfgSingle = { userCol: "user_id"; urlCol: "photo_url"; pathCol: "photo_path" };
type CfgMulti = { userCol: "user_id"; urlsCol: "photos"; pathsCol: "photo_paths" };
type TableCfg = CfgSingle | CfgMulti;

const TABLES: Record<TableName, TableCfg> = {
  apiaries: { userCol: "user_id", urlCol: "photo_url", pathCol: "photo_path" },
  hives: { userCol: "user_id", urlCol: "photo_url", pathCol: "photo_path" },
  logbook: { userCol: "user_id", urlCol: "photo_url", pathCol: "photo_path" },
  inspections: { userCol: "user_id", urlsCol: "photos", pathsCol: "photo_paths" },
};

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim();
const SERVICE_ROLE = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function parsePublicUrl(url: string | null | undefined) {
  if (!url) return null;
  const clean = url.split("?")[0];
  const m = clean.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

// THIS avoids the red 7015 errors: always index a dictionary type
function get(rec: Record<string, unknown>, key: string): unknown {
  return rec[key];
}

function isTableName(v: unknown): v is TableName {
  return v === "apiaries" || v === "hives" || v === "logbook" || v === "inspections";
}

function isMode(v: unknown): v is Mode {
  return v === "clear_photo" || v === "delete_row";
}

function isDeleteBody(v: unknown): v is DeleteBody {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!isTableName(o.table)) return false;
  if (typeof o.id !== "string" || !o.id) return false;
  if (!isMode(o.mode)) return false;

  if (o.removeOne === undefined) return true;
  if (!o.removeOne || typeof o.removeOne !== "object") return false;

  const r = o.removeOne as Record<string, unknown>;
  const pathOk = r.path === undefined || typeof r.path === "string";
  const urlOk = r.url === undefined || typeof r.url === "string";
  return pathOk && urlOk;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) return json(500, { error: "Missing SUPABASE envs" });

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!jwt) return json(401, { error: "Missing Authorization bearer token" });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userRes, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userRes?.user) return json(401, { error: "Invalid user session" });
    const uid = userRes.user.id;

    const raw = (await req.json().catch(() => null)) as unknown;
    if (!isDeleteBody(raw)) return json(400, { error: "Missing/invalid {table,id,mode}" });

    const { table, id, mode, removeOne } = raw;
    const cfg = TABLES[table];

    // 1) Fetch row (and verify ownership)
    const selectCols =
      table === "inspections"
        ? `${cfg.userCol}, ${(cfg as CfgMulti).urlsCol}, ${(cfg as CfgMulti).pathsCol}`
        : `${cfg.userCol}, ${(cfg as CfgSingle).urlCol}, ${(cfg as CfgSingle).pathCol}`;

    const { data: row, error: rowErr } = await admin
      .from(table)
      .select(selectCols)
      .eq("id", id)
      .maybeSingle();

    if (rowErr) return json(500, { error: rowErr.message });
    if (!row) return json(404, { error: "Row not found" });

    const rec = row as unknown as Record<string, unknown>;


    // Ownership check (always user_id)
    if (String(get(rec, "user_id") ?? "") !== uid) return json(403, { error: "Forbidden" });

    const bucket = "photos";

    // 2) Determine paths to delete
    let pathsToDelete: string[] = [];

    if (table === "inspections") {
      const urlsKey = (cfg as CfgMulti).urlsCol;   // "photos"
      const pathsKey = (cfg as CfgMulti).pathsCol; // "photo_paths"

      const storedPaths = asStringArray(get(rec, pathsKey));
      const storedUrls = asStringArray(get(rec, urlsKey));

      // Prefer stored paths
      pathsToDelete = storedPaths.slice();

      // Fallback: derive paths from URLs (legacy)
      if (!pathsToDelete.length && storedUrls.length) {
        for (const u of storedUrls) {
          const p = parsePublicUrl(u);
          if (p?.bucket === bucket) pathsToDelete.push(p.path);
        }
      }

      // Optional: remove a single photo
      if (removeOne?.path || removeOne?.url) {
        const onePath =
          removeOne.path ||
          (parsePublicUrl(removeOne.url || "")?.bucket === bucket
            ? parsePublicUrl(removeOne.url || "")?.path
            : null);

        if (onePath) {
          // Delete just this one file FIRST
          const { error: delErr } = await admin.storage.from(bucket).remove([onePath]);
          if (delErr) return json(500, { error: `Storage delete failed: ${delErr.message}` });

          // Remove from arrays AFTER deletion
          const newPaths = storedPaths.filter((p) => p !== onePath);
          const newUrls = storedUrls.filter((u) => {
            const p = parsePublicUrl(u);
            return !(p?.bucket === bucket && p.path === onePath);
          });

          const patch: Record<string, unknown> = {};
          patch[pathsKey] = newPaths;
          patch[urlsKey] = newUrls;

          const { error: updErr } = await admin.from(table).update(patch).eq("id", id);
          if (updErr) return json(500, { error: `DB update failed: ${updErr.message}` });

          return json(200, { ok: true, mode: "remove_one", deleted: [onePath] });
        }
      }
    } else {
      const urlKey = (cfg as CfgSingle).urlCol;
      const pathKey = (cfg as CfgSingle).pathCol;

      const storedPath = get(rec, pathKey);
      const storedUrl = get(rec, urlKey);

      if (typeof storedPath === "string" && storedPath) {
        pathsToDelete.push(storedPath);
      } else if (typeof storedUrl === "string" && storedUrl) {
        const p = parsePublicUrl(storedUrl);
        if (p?.bucket === bucket) pathsToDelete.push(p.path);
      }
    }

    pathsToDelete = uniq(pathsToDelete);

    // 3) Delete storage FIRST
    if (pathsToDelete.length) {
      const { error: delErr } = await admin.storage.from(bucket).remove(pathsToDelete);
      if (delErr) return json(500, { error: `Storage delete failed: ${delErr.message}`, paths: pathsToDelete });
    }

    // 4) Then clear refs or delete row
    if (mode === "clear_photo") {
      if (table === "inspections") {
        const urlsKey = (cfg as CfgMulti).urlsCol;
        const pathsKey = (cfg as CfgMulti).pathsCol;

        const patch: Record<string, unknown> = {};
        patch[urlsKey] = [];
        patch[pathsKey] = [];

        const { error: updErr } = await admin.from(table).update(patch).eq("id", id);
        if (updErr) return json(500, { error: `DB update failed: ${updErr.message}` });
      } else {
        const urlKey = (cfg as CfgSingle).urlCol;
        const pathKey = (cfg as CfgSingle).pathCol;

        const patch: Record<string, unknown> = {};
        patch[urlKey] = null;
        patch[pathKey] = null;

        const { error: updErr } = await admin.from(table).update(patch).eq("id", id);
        if (updErr) return json(500, { error: `DB update failed: ${updErr.message}` });
      }

      return json(200, { ok: true, mode, deleted: pathsToDelete });
    }

    // delete_row
    const { error: delRowErr } = await admin.from(table).delete().eq("id", id);
    if (delRowErr) return json(500, { error: `Row delete failed: ${delRowErr.message}` });

    return json(200, { ok: true, mode, deleted: pathsToDelete });
  } catch (e) {
    return json(500, { error: String(e) });
  }
});
