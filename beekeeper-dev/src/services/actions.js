// src/services/actions.js
import { supabase } from "./supabase.js"; // ← add .js for Deno

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

  // Postgres FK violation (23503) often surfaces as: violates foreign key constraint "xyz"
  if (String(code) !== "23503" && !/foreign key constraint/i.test(message)) return "";

  const constraint =
    (message.match(/constraint\s+\"([^\"]+)\"/i)?.[1] ||
      details.match(/constraint\s+\"([^\"]+)\"/i)?.[1] ||
      "");

  const MAP = {
    // Apiary children
    hives_apiary_id_fkey:
      "You can’t delete this apiary because it still has hives (including any in the archive). Delete those hives first, or archive the apiary instead.",
    inspections_apiary_id_fkey:
      "You can’t delete this apiary because it still has inspections (including any in the archive). Delete those inspections first, or archive the apiary instead.",
    todos_apiary_id_fkey:
      "You can’t delete this apiary because it still has to-dos (including any in the archive). Delete those to-dos first, or archive the apiary instead.",
    logbook_apiary_id_fkey:
      "You can’t delete this apiary because it still has logbook entries (including any in the archive). Delete those logbook entries first, or archive the apiary instead.",

    // Hive children
    inspections_hive_id_fkey:
      "You can’t delete this hive because it still has inspections (including any in the archive). Delete those inspections first, or archive the hive instead.",
    todos_hive_id_fkey:
      "You can’t delete this hive because it still has to-dos (including any in the archive). Delete those to-dos first, or archive the hive instead.",
    logbook_hive_id_fkey:
      "You can’t delete this hive because it still has logbook entries (including any in the archive). Delete those logbook entries first, or archive the hive instead.",

    // Inspection children
    logbook_inspection_id_fkey:
      "You can’t delete this inspection because it still has logbook entries linked to it (including any in the archive). Delete those logbook entries first, or archive the inspection instead.",

    // Todo children (if you ever FK logbook to todos etc.)
    logbook_todo_id_fkey:
      "You can’t delete this to-do because it still has logbook entries linked to it (including any in the archive). Delete those logbook entries first, or archive the to-do instead.",
  };

  if (constraint && MAP[constraint]) return MAP[constraint];

  // Generic fallback based on the table being deleted (if provided)
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

/** Extract { bucket, path } from a Supabase public URL (useful for migration/legacy only) */
export function parseStoragePublicUrl(url) {
  if (!url) return null;
  const m = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

/** Archive a row (sets archived_at = now()) */
export async function archiveItem(table, id) {
  return await supabase
    .from(table)
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
}

/**
 * Call the solid server-side delete pipeline (Edge Function).
 * This prevents orphaned storage files by:
 *  - deleting Storage first (service role)
 *  - only then clearing/deleting the DB row
 *
 * Function name must match what you deploy.
 */
const DELETE_FN = "delete-row-with-photos";

/**
 * mode:
 *  - "clear_photo": delete storage objects and clear photo fields
 *  - "delete_row": delete storage objects then delete the row
 *
 * removeOne:
 *  - for inspections (photos array), remove a single photo by {path} or {url}
 */
export async function serverDeleteRowWithPhotos({
  table,
  id,
  mode = "delete_row",
  removeOne,
}) {
  const { data, error } = await supabase.functions.invoke(DELETE_FN, {
    body: { table, id, mode, ...(removeOne ? { removeOne } : {}) },
  });

  // IMPORTANT: do not continue on error (this is what stops orphans)
  if (error) return { data: null, error };

  // Some edge functions return { error: "..." } in JSON body with 200.
  // Treat that as an error too.
  if (data && typeof data === "object" && data.error) {
    return { data: null, error: { message: data.error } };
  }

  return { data, error: null };
}

/**
 * smartDeleteApiary(id)
 * - If linked children exist (via optional RPC check_apiary_children), archive it.
 * - Otherwise, hard-delete via server pipeline (storage first, then row)
 */
export async function smartDeleteApiary(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_apiary_children", {
      apiary_id: id,
    });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { hives = 0, inspections = 0, todos = 0, logs = 0 } = row || {};
      hasChildren = hives + inspections + todos + logs > 0;
    }
  } catch {
    /* RPC may not exist — ignore */
  }

  if (hasChildren) {
    const { error } = await archiveItem("apiaries", id);
    return { archived: true, error };
  }

  const { error } = await serverDeleteRowWithPhotos({
    table: "apiaries",
    id,
    mode: "delete_row",
  });
  return { archived: false, error };
}

/**
 * smartDeleteHive(id)
 * - If linked children exist (RPC check_hive_children), archive it.
 * - Otherwise, hard-delete via server pipeline (storage first, then row)
 */
export async function smartDeleteHive(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_hive_children", {
      hive_id: id,
    });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { inspections = 0, todos = 0, logs = 0 } = row || {};
      hasChildren = inspections + todos + logs > 0;
    }
  } catch {
    /* RPC may not exist — ignore */
  }

  if (hasChildren) {
    const { error } = await archiveItem("hives", id);
    return { archived: true, error };
  }

  const { error } = await serverDeleteRowWithPhotos({
    table: "hives",
    id,
    mode: "delete_row",
  });
  return { archived: false, error };
}

/**
 * smartDeleteInspection(id)
 * - Hard delete via server pipeline (storage first, then row)
 * - This supports both:
 *   - legacy inspections.photos[] URLs
 *   - new inspections.photo_paths[] (once you add it)
 */
export async function smartDeleteInspection(id) {
  const { error } = await serverDeleteRowWithPhotos({
    table: "inspections",
    id,
    mode: "delete_row",
  });
  return { archived: false, error };
}

/**
 * Remove a single inspection photo (solid).
 * Provide either an object path or a public URL.
 * This will:
 *  - delete that one storage object
 *  - remove it from the row arrays
 */
export async function removeOneInspectionPhoto(id, { path, url }) {
  const { data, error } = await serverDeleteRowWithPhotos({
    table: "inspections",
    id,
    mode: "clear_photo", // function treats removeOne specially and updates arrays
    removeOne: { path, url },
  });
  return { data, error };
}

/**
 * smartDeleteTodo(id)
 * - Archives if it has children (optional RPC)
 * - Otherwise deletes row. (If todos have attachments, move them into the same server function later.)
 *
 * NOTE: Your current schema audit doesn’t show a guaranteed photo_path for todos.
 * If you add todo photo_path(s), route this through serverDeleteRowWithPhotos too.
 */
export async function smartDeleteTodo(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_todo_children", {
      todo_id: id,
    });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { logs = 0, attachments = 0 } = row || {};
      hasChildren = logs + attachments > 0;
    }
  } catch {
    /* RPC may not exist — ignore */
  }

  if (hasChildren) {
    const { error } = await archiveItem("todos", id);
    return { archived: true, error };
  }

  // Until todos are added to the server pipeline with explicit paths,
  // we just delete the row (no storage handled here).
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
