// supabase/functions/delete-row-with-photos/index.ts
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
  const clean = String(url).split("?")[0];
  const m = clean.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

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
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

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
    const bucket = "photos";

    // 1) Fetch row (verify ownership)
    let row: Record<string, unknown> | null = null;

    if (table === "inspections") {
      const urlsKey = (cfg as CfgMulti).urlsCol; // "photos"
      const pathsKey = (cfg as CfgMulti).pathsCol; // "photo_paths"
      const colsWithPaths = `${cfg.userCol}, ${urlsKey}, ${pathsKey}`;
      const colsWithoutPaths = `${cfg.userCol}, ${urlsKey}`;

      // Try with photo_paths first; if the column doesn't exist, retry without it.
      let r1 = await admin.from(table).select(colsWithPaths).eq("id", id).maybeSingle();
      if (r1.error && /column .*photo_paths.* does not exist/i.test(r1.error.message || "")) {
        r1 = await admin.from(table).select(colsWithoutPaths).eq("id", id).maybeSingle();
      }

      if (r1.error) return json(500, { error: r1.error.message });
      if (!r1.data) return json(404, { error: "Row not found" });
      row = r1.data as Record<string, unknown>;
    } else {
      const urlKey = (cfg as CfgSingle).urlCol;
      const pathKey = (cfg as CfgSingle).pathCol;
      const colsWithPath = `${cfg.userCol}, ${urlKey}, ${pathKey}`;
      const colsWithoutPath = `${cfg.userCol}, ${urlKey}`;

      let r1 = await admin.from(table).select(colsWithPath).eq("id", id).maybeSingle();
      if (r1.error && /column .*photo_path.* does not exist/i.test(r1.error.message || "")) {
        r1 = await admin.from(table).select(colsWithoutPath).eq("id", id).maybeSingle();
      }

      if (r1.error) return json(500, { error: r1.error.message });
      if (!r1.data) return json(404, { error: "Row not found" });
      row = r1.data as Record<string, unknown>;
    }

    if (String(get(row, "user_id") ?? "") !== uid) return json(403, { error: "Forbidden" });

    // 2) Determine paths to delete
    let pathsToDelete: string[] = [];

    if (table === "inspections") {
      const urlsKey = (cfg as CfgMulti).urlsCol;   // "photos"
      const pathsKey = (cfg as CfgMulti).pathsCol; // "photo_paths"

      const storedUrls = asStringArray(get(row, urlsKey));
      const storedPaths = asStringArray(get(row, pathsKey)); // may be [] if column missing

      // If removeOne is present, delete ONLY that one file and update arrays.
      if (removeOne?.path || removeOne?.url) {
        const fromUrl = removeOne.url ? parsePublicUrl(removeOne.url) : null;
        const onePath =
          removeOne.path ||
          (fromUrl?.bucket === bucket ? fromUrl.path : null);

        if (!onePath) {
          return json(400, { error: "removeOne provided but no valid {path|url} resolved" });
        }

        const { error: delErr } = await admin.storage.from(bucket).remove([onePath]);
        if (delErr) return json(500, { error: `Storage delete failed: ${delErr.message}` });

        const newPaths = storedPaths.filter((p) => p !== onePath);
        const newUrls = storedUrls.filter((u) => {
          const p = parsePublicUrl(u);
          return !(p?.bucket === bucket && p.path === onePath);
        });

        const patch: Record<string, unknown> = {};
        patch[urlsKey] = newUrls;
        // only write pathsKey if the column exists on the row selection
        if (pathsKey in row) patch[pathsKey] = newPaths;

        const { error: updErr } = await admin.from(table).update(patch).eq("id", id);
        if (updErr) return json(500, { error: `DB update failed: ${updErr.message}` });

        return json(200, { ok: true, mode: "remove_one", deleted: [onePath] });
      }

      // Normal delete: prefer stored paths, else derive from URLs
      pathsToDelete = storedPaths.slice();

      if (!pathsToDelete.length && storedUrls.length) {
        for (const u of storedUrls) {
          const p = parsePublicUrl(u);
          if (p?.bucket === bucket) pathsToDelete.push(p.path);
        }
      }
    } else {
      const urlKey = (cfg as CfgSingle).urlCol;
      const pathKey = (cfg as CfgSingle).pathCol;

      const storedPath = get(row, pathKey);
      const storedUrl = get(row, urlKey);

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
      if (delErr) {
        return json(500, {
          error: `Storage delete failed: ${delErr.message}`,
          paths: pathsToDelete,
        });
      }
    }

    // 4) Then clear refs or delete row
    if (mode === "clear_photo") {
      if (table === "inspections") {
        const urlsKey = (cfg as CfgMulti).urlsCol;
        const pathsKey = (cfg as CfgMulti).pathsCol;

        const patch: Record<string, unknown> = {};
        patch[urlsKey] = [];
        if (pathsKey in row) patch[pathsKey] = [];

        const { error: updErr } = await admin.from(table).update(patch).eq("id", id);
        if (updErr) return json(500, { error: `DB update failed: ${updErr.message}` });
      } else {
        const urlKey = (cfg as CfgSingle).urlCol;
        const pathKey = (cfg as CfgSingle).pathCol;

        const patch: Record<string, unknown> = {};
        patch[urlKey] = null;
        // only set if column exists; otherwise ignore
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
