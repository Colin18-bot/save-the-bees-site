// supabase/functions/delete-row-with-photos/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

type TableName = "apiaries" | "hives" | "logbook" | "inspections";
type Mode = "clear_photo" | "delete_row";

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim();
const SERVICE_ROLE = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

const TABLES: Record<TableName, Record<string, string>> = {

  apiaries: { userCol: "user_id", urlCol: "photo_url", pathCol: "photo_path" },
  hives: { userCol: "user_id", urlCol: "photo_url", pathCol: "photo_path" },
  logbook: { userCol: "user_id", urlCol: "photo_url", pathCol: "photo_path" },
  inspections: { userCol: "user_id", urlsCol: "photos", pathsCol: "photo_paths" },
};

function parsePublicUrl(url: string | null | undefined) {
  if (!url) return null;
  const clean = url.split("?")[0];
  const m = clean.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE envs" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing Authorization bearer token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userRes, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Invalid user session" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const uid = userRes.user.id;

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    
    const table = body?.table as TableName;
    const id = body?.id as string;
    const mode = body?.mode as Mode;
    const removeOne = body?.removeOne as { path?: string; url?: string } | undefined;

    if (!table || !TABLES[table] || !id || !mode) {
      return new Response(JSON.stringify({ error: "Missing/invalid {table,id,mode}" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1) Read row and verify ownership
    const cfg = TABLES[table];
    const selectCols =
      table === "inspections"
        ? `${cfg.userCol}, ${cfg.urlsCol}, ${cfg.pathsCol}`
        : `${cfg.userCol}, ${cfg.urlCol}, ${cfg.pathCol}`;

    const { data: row, error: rowErr } = await admin
      .from(table)
      .select(selectCols)
      .eq("id", id)
      .maybeSingle();

    if (rowErr) {
      return new Response(JSON.stringify({ error: rowErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!row) {
      return new Response(JSON.stringify({ error: "Row not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (row[cfg.userCol] !== uid) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 2) Build list of storage paths to delete (prefer *_path fields)
    const bucket = "photos";
    let paths: string[] = [];

    if (table === "inspections") {
      const storedPaths = asStringArray(row[cfg.pathsCol]);
      const storedUrls = asStringArray(row[cfg.urlsCol]);

      paths = storedPaths.slice();

      // fallback for legacy rows with only URLs:
      if (!paths.length && storedUrls.length) {
        for (const u of storedUrls) {
          const p = parsePublicUrl(u);
          if (p?.bucket === bucket) paths.push(p.path);
        }
      }

      // optional: remove one photo only
      if (removeOne?.path || removeOne?.url) {
        const onePath =
          removeOne.path ||
          (parsePublicUrl(removeOne.url || "")?.bucket === bucket
            ? parsePublicUrl(removeOne.url || "")?.path
            : null);

        if (onePath) {
          // delete JUST this one path first
          const { error: delErr } = await admin.storage.from(bucket).remove([onePath]);
          if (delErr) {
            return new Response(JSON.stringify({ error: `Storage delete failed: ${delErr.message}` }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          // update arrays after deletion
          const newPaths = storedPaths.filter((p) => p !== onePath);
          const newUrls = storedUrls.filter((u) => {
            const p = parsePublicUrl(u);
            return !(p?.bucket === bucket && p.path === onePath);
          });

          const { error: updErr } = await admin
            .from(table)
            .update({ [cfg.pathsCol]: newPaths, [cfg.urlsCol]: newUrls })
            .eq("id", id);

          if (updErr) {
            return new Response(JSON.stringify({ error: `DB update failed: ${updErr.message}` }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          return new Response(JSON.stringify({ ok: true, mode: "remove_one", deleted: [onePath] }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }
    } else {
      const storedPath = (row[cfg.pathCol] as string | null) || null;
      const storedUrl = (row[cfg.urlCol] as string | null) || null;

      if (storedPath) paths.push(storedPath);

      // fallback for legacy rows with only URL:
      if (!paths.length && storedUrl) {
        const p = parsePublicUrl(storedUrl);
        if (p?.bucket === bucket) paths.push(p.path);
      }
    }

    paths = uniq(paths);

    // 3) Delete storage FIRST
    if (paths.length) {
      const { error: delErr } = await admin.storage.from(bucket).remove(paths);
      if (delErr) {
        return new Response(JSON.stringify({ error: `Storage delete failed: ${delErr.message}`, paths }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // 4) Then clear refs or delete row
    if (mode === "clear_photo") {
      if (table === "inspections") {
        const { error: updErr } = await admin
          .from(table)
          .update({ [cfg.urlsCol]: [], [cfg.pathsCol]: [] })
          .eq("id", id);
        if (updErr) throw updErr;
      } else {
        const { error: updErr } = await admin
          .from(table)
          .update({ [cfg.urlCol]: null, [cfg.pathCol]: null })
          .eq("id", id);
        if (updErr) throw updErr;
      }

      return new Response(JSON.stringify({ ok: true, mode, deleted: paths }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // delete_row
    const { error: delRowErr } = await admin.from(table).delete().eq("id", id);
    if (delRowErr) {
      return new Response(JSON.stringify({ error: `Row delete failed: ${delRowErr.message}` }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true, mode, deleted: paths }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
