// src/services/actions.js
import { supabase } from "./supabase.js"; // keep .js for Deno compatibility

/** Nicely format Supabase errors for toasts/alerts */
export function humaniseSupabaseError(err, context = {}) {
  if (!err) return "";
  if (typeof err === "string") return err;
  return fkFriendlyMessage(err, context) || err.message || err.hint || "Unexpected error";
}

/** FK-safe, user-friendly messages (used by humaniseSupabaseError) */
function fkFriendlyMessage(err, context = {}) {
  const code = err.code || err.status || err.error_code || "";
  const message = String(err.message || "");
  const details = String(err.details || "");

  if (String(code) !== "23503" && !/foreign key constraint/i.test(message)) return "";

  const constraint =
    message.match(/constraint\s+"([^"]+)"/i)?.[1] ||
    details.match(/constraint\s+"([^"]+)"/i)?.[1] ||
    "";

  const MAP = {
    hives_apiary_id_fkey:
      "You can’t delete this apiary because it still has hives (including any in the archive). Delete those hives first, or archive the apiary instead.",
    inspections_apiary_id_fkey:
      "You can’t delete this apiary because it still has inspections (including any in the archive). Delete those inspections first, or archive the apiary instead.",
    todos_apiary_id_fkey:
      "You can’t delete this apiary because it still has to-dos (including any in the archive). Delete those to-dos first, or archive the apiary instead.",
    logbook_apiary_id_fkey:
      "You can’t delete this apiary because it still has logbook entries (including any in the archive). Delete those logbook entries first, or archive the apiary instead.",

    inspections_hive_id_fkey:
      "You can’t delete this hive because it still has inspections (including any in the archive). Delete those inspections first, or archive the hive instead.",
    todos_hive_id_fkey:
      "You can’t delete this hive because it still has to-dos (including any in the archive). Delete those to-dos first, or archive the hive instead.",
    logbook_hive_id_fkey:
      "You can’t delete this hive because it still has logbook entries (including any in the archive). Delete those logbook entries first, or archive the hive instead.",

    logbook_inspection_id_fkey:
      "You can’t delete this inspection because it still has logbook entries linked to it (including any in the archive). Delete those logbook entries first, or archive the inspection instead.",

    logbook_todo_id_fkey:
      "You can’t delete this to-do because it still has logbook entries linked to it (including any in the archive). Delete those logbook entries first, or archive the to-do instead.",
  };

  if (constraint && MAP[constraint]) return MAP[constraint];

  const table = context.table || "";
  if (table === "apiaries")
    return "You can’t delete this apiary because other records still reference it (including archived records). Delete those linked items first, or archive the apiary instead.";
  if (table === "hives")
    return "You can’t delete this hive because other records still reference it (including archived records). Delete those linked items first, or archive the hive instead.";
  if (table === "inspections")
    return "You can’t delete this inspection because other records still reference it (including archived records). Delete those linked items first, or archive the inspection instead.";
  if (table === "todos")
    return "You can’t delete this to-do because other records still reference it (including archived records). Delete those linked items first, or archive it instead.";

  return "You can’t delete this item because other records still reference it (including archived records). Delete the linked items first, or archive it instead.";
}

/** Extract { bucket, path } from a Supabase Storage URL (public or signed) */
export function parseStoragePublicUrl(url) {
  if (!url) return null;
  const noQuery = String(url).split("?")[0];
  const m = noQuery.match(/\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

/** Archive a row (sets archived_at = now()) */
export async function archiveItem(table, id) {
  return await supabase.from(table).update({ archived_at: new Date().toISOString() }).eq("id", id);
}

/**
 * Edge Function name (must match deployed folder name)
 * supabase/functions/delete-row-with-photos
 */
const DELETE_FN = "delete-storage";

/**
 * IMPORTANT:
 * Supabase Edge preflight can fail if apikey header is missing.
 * We force headers via a direct fetch fallback if invoke() fails.
 */

function getEnv(key) {
  // Vite exposes envs via import.meta.env
  // We keep this tiny helper for safety.
  try {
    return import.meta?.env?.[key];
  } catch {
    return undefined;
  }
}

const SUPABASE_URL = getEnv("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnv("VITE_SUPABASE_ANON_KEY");

/** Direct call to Edge Function with explicit headers (apikey + auth) */
async function fetchEdgeFunction(fnName, body) {
  if (!SUPABASE_URL) {
    return { data: null, error: { message: "Missing VITE_SUPABASE_URL in environment" } };
  }
  if (!SUPABASE_ANON_KEY) {
    return { data: null, error: { message: "Missing VITE_SUPABASE_ANON_KEY in environment" } };
  }

  const {
    data: { session },
    error: sessErr,
  } = await supabase.auth.getSession();

  if (sessErr) return { data: null, error: sessErr };
  if (!session?.access_token) {
    return { data: null, error: { message: "Not signed in (missing access token)" } };
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ✅ critical headers:
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  // If preflight/edge rejects, this might not be JSON
  const text = await res.text().catch(() => "");
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    return {
      data: null,
      error: {
        message:
          (json && (json.error || json.message)) ||
          `Edge function ${fnName} failed (${res.status})`,
        status: res.status,
        raw: text?.slice(0, 500),
      },
    };
  }

  return { data: json, error: null };
}

/**
 * Solid server-side delete pipeline (Storage first, then DB).
 *
 * mode:
 *  - "clear_photo": delete storage objects and clear photo fields
 *  - "delete_row": delete storage objects then delete the row
 *
 * removeOne:
 *  - for inspections (photos array), remove a single photo by {path} or {url}
 */
export async function serverDeleteRowWithPhotos({ table, id, mode = "delete_row", removeOne }) {
  const payload = { table, id, mode, ...(removeOne ? { removeOne } : {}) };

  // 1) Try official invoke() first
  const inv = await supabase.functions.invoke(DELETE_FN, { body: payload });

  // If invoke returns a transport/gateway error, fallback to direct fetch (forces apikey header)
  if (inv?.error) {
    const fallback = await fetchEdgeFunction(DELETE_FN, payload);
    if (fallback.error) {
      // Return whichever has more useful info; fallback usually does.
      return { data: null, error: fallback.error };
    }
    // Some functions return { error: "..." } with 200
    if (fallback.data && typeof fallback.data === "object" && fallback.data.error) {
      return { data: null, error: { message: fallback.data.error } };
    }
    return { data: fallback.data, error: null };
  }

  // 2) Normal invoke success path
  const { data, error } = inv;
  if (error) return { data: null, error };

  // Some functions return { error: "..." } in JSON body with 200
  if (data && typeof data === "object" && data.error) {
    return { data: null, error: { message: data.error } };
  }

  return { data, error: null };
}

/* ------------------------------------------------------------------ */
/* ✅ Backwards-compatible helpers expected by your React pages        */
/* ------------------------------------------------------------------ */

export async function deleteRowWithPhoto(table, id, urlCol = "photo_url") {
  void urlCol; // kept for compatibility
  return await serverDeleteRowWithPhotos({ table, id, mode: "delete_row" });
}

export async function deleteRowAndRemoveUrls(table, id, urlsCol = "photos") {
  void urlsCol; // kept for compatibility
  return await serverDeleteRowWithPhotos({ table, id, mode: "delete_row" });
}

/* ------------------------------------------------------------------ */
/* Optional “smart delete” helpers you already had                     */
/* ------------------------------------------------------------------ */

export async function smartDeleteApiary(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_apiary_children", { apiary_id: id });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { hives = 0, inspections = 0, todos = 0, logs = 0 } = row || {};
      hasChildren = hives + inspections + todos + logs > 0;
    }
  } catch {
    // ignore
  }

  if (hasChildren) {
    const { error } = await archiveItem("apiaries", id);
    return { archived: true, error };
  }

  const { error } = await serverDeleteRowWithPhotos({ table: "apiaries", id, mode: "delete_row" });
  return { archived: false, error };
}

export async function smartDeleteHive(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_hive_children", { hive_id: id });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { inspections = 0, todos = 0, logs = 0 } = row || {};
      hasChildren = inspections + todos + logs > 0;
    }
  } catch {
    // ignore
  }

  if (hasChildren) {
    const { error } = await archiveItem("hives", id);
    return { archived: true, error };
  }

  const { error } = await serverDeleteRowWithPhotos({ table: "hives", id, mode: "delete_row" });
  return { archived: false, error };
}

export async function smartDeleteInspection(id) {
  const { error } = await serverDeleteRowWithPhotos({ table: "inspections", id, mode: "delete_row" });
  return { archived: false, error };
}

export async function removeOneInspectionPhoto(id, { path, url }) {
  const { data, error } = await serverDeleteRowWithPhotos({
    table: "inspections",
    id,
    mode: "clear_photo", // function treats removeOne specially
    removeOne: { path, url },
  });
  return { data, error };
}

export async function smartDeleteTodo(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_todo_children", { todo_id: id });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { logs = 0, attachments = 0 } = row || {};
      hasChildren = logs + attachments > 0;
    }
  } catch {
    // ignore
  }

  if (hasChildren) {
    const { error } = await archiveItem("todos", id);
    return { archived: true, error };
  }

  const { error } = await supabase.from("todos").delete().eq("id", id);
  return { archived: false, error };
}

/** Ensure this is the ONLY default apiary for a user */
export async function setOnlyDefaultApiaryForUser(userId, apiaryId) {
  if (!userId || !apiaryId) return;

  await supabase
    .from("apiaries")
    .update({ is_default: false })
    .eq("user_id", userId)
    .is("archived_at", null)
    .neq("id", apiaryId);

  await supabase.from("apiaries").update({ is_default: true }).eq("id", apiaryId);
}
