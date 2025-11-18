// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/delete-storage/index.ts
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// Adjust if your bucket name differs
const BUCKET = "photos";

const url = Deno.env.get("SUPABASE_URL") || "";
const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

if (!url || !anon || !service) {
  // Throwing here causes a 500 on cold start; instead, handle gracefully in the handler.
  console.warn("delete-storage: Missing one or more envs (SUPABASE_URL / ANON / SERVICE_ROLE).");
}

const supaAnon = url && anon ? createClient(url, anon) : null;
const supaSrv  = url && service ? createClient(url, service) : null;

// Helper: attempt to list a prefix; if it doesn't exist, returns []
async function listPrefix(prefix: string) {
  if (!supaSrv) return [];
  const { data, error } = await supaSrv.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    // @ts-ignore (recursive allowed in runtime)
    recursive: true,
  });
  if (error) return [];
  return (
    data?.map((f) =>
      prefix.endsWith("/") ? `${prefix}${f.name}` : `${prefix}/${f.name}`
    ) ?? []
  );
}

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (!url || !anon || !service || !supaAnon || !supaSrv) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing Supabase env configuration" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Accept token either as Authorization header or ?token=...
    let token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (!token) {
      const u = new URL(req.url);
      token = u.searchParams.get("token") || "";
    }
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized (no token)" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Verify caller (anon client + user token)
    const {
      data: { user },
      error: authErr,
    } = await supaAnon.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const uid = user.id;

    // Build list of potential paths to remove
    const toRemove = new Set<string>();

    // 1) Flat avatar file like avatar/<uid>.<ext>
    const exts = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
    exts.forEach((ext) => toRemove.add(`avatar/${uid}.${ext}`));

    // 2) Any nested avatar folder avatar/<uid>/...
    const nestedAvatar = await listPrefix(`avatar/${uid}`);
    nestedAvatar.forEach((p) => toRemove.add(p));

    // 3) OPTIONAL: per-user folders (safe no-ops if not present)
    const candidatePrefixes = [
      `${uid}`,            // photos/<uid>/...
      `users/${uid}`,      // photos/users/<uid>/...
      `apiaries/${uid}`,   // photos/apiaries/<uid>/...
      `hives/${uid}`,      // photos/hives/<uid>/...
    ];
    for (const prefix of candidatePrefixes) {
      const items = await listPrefix(prefix);
      items.forEach((p) => toRemove.add(p));
    }

    // Remove (if the list is empty, this is a no-op)
    const paths = Array.from(toRemove);
    let removed = 0;
    if (paths.length) {
      const { error } = await supaSrv.storage.from(BUCKET).remove(paths);
      if (error) {
        return new Response(
          JSON.stringify({ ok: false, error: error.message, attempted: paths.length }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
      removed = paths.length;
    }

    return new Response(
      JSON.stringify({ ok: true, removed }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
