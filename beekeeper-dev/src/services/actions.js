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

/* ------------------------------------------------------------------ */
/* Coordinated archive and restore lifecycle                           */
/* ------------------------------------------------------------------ */

function missingId(message) {
  return { data: null, error: { message } };
}

export async function archiveApiaryLifecycle(apiaryId) {
  if (!apiaryId) return missingId("Missing apiary ID");

  return await supabase.rpc("archive_apiary_lifecycle", {
    p_apiary_id: apiaryId,
  });
}

export async function restoreApiaryLifecycle(apiaryId) {
  if (!apiaryId) return missingId("Missing apiary ID");

  return await supabase.rpc("restore_apiary_lifecycle", {
    p_apiary_id: apiaryId,
  });
}

/** Reasons supported by the hive/Queen archive lifecycle migration */
export const HIVE_ARCHIVE_REASONS = [
  { value: "winter_loss", label: "Winter loss" },
  { value: "colony_died_out", label: "Colony died out" },
  { value: "colony_combined", label: "Colony combined with another colony" },
  { value: "colony_moved", label: "Colony moved or removed" },
  { value: "equipment_removed", label: "Hive equipment removed from use" },
  { value: "administrative", label: "Administrative archive" },
  { value: "other", label: "Other" },
];

/**
 * Archive a hive and close its current Queen assignment and active Queen
 * process. Historical assignments, Queen events and inspection snapshots remain.
 */
export async function archiveHiveWithQueenLifecycle({
  hiveId,
  reason,
  notes = "",
}) {
  if (!hiveId) {
    return { data: null, error: { message: "Missing hive ID" } };
  }

  if (!reason) {
    return {
      data: null,
      error: { message: "Select a reason for archiving this hive." },
    };
  }

  return await supabase.rpc("archive_hive_with_queen_lifecycle", {
    p_hive_id: hiveId,
    p_reason: reason,
    p_notes: notes?.trim() || null,
  });
}

/**
 * Restore an archived hive without reactivating its former Queen assignment
 * or Queenless/rearing process.
 */
export async function restoreHiveAfterArchive(hiveId) {
  if (!hiveId) {
    return { data: null, error: { message: "Missing hive ID" } };
  }

  return await supabase.rpc("restore_hive_after_archive", {
    p_hive_id: hiveId,
  });
}


export async function archiveInspectionLifecycle(inspectionId) {
  if (!inspectionId) return missingId("Missing inspection ID");

  return await supabase.rpc("archive_inspection_lifecycle", {
    p_inspection_id: inspectionId,
  });
}

export async function restoreInspectionLifecycle(inspectionId) {
  if (!inspectionId) return missingId("Missing inspection ID");

  return await supabase.rpc("restore_inspection_lifecycle", {
    p_inspection_id: inspectionId,
  });
}

export async function archiveTodoLifecycle(todoId) {
  if (!todoId) return missingId("Missing task ID");

  return await supabase.rpc("archive_todo_lifecycle", {
    p_todo_id: todoId,
  });
}

export async function restoreTodoLifecycle(todoId) {
  if (!todoId) return missingId("Missing task ID");

  return await supabase.rpc("restore_todo_lifecycle", {
    p_todo_id: todoId,
  });
}

export async function archiveLogbookLifecycle(logbookId) {
  if (!logbookId) return missingId("Missing logbook entry ID");

  return await supabase.rpc("archive_logbook_lifecycle", {
    p_logbook_id: logbookId,
  });
}

export async function restoreLogbookLifecycle(logbookId) {
  if (!logbookId) return missingId("Missing logbook entry ID");

  return await supabase.rpc("restore_logbook_lifecycle", {
    p_logbook_id: logbookId,
  });
}

/**
 * Backwards-compatible archive helper. Lifecycle tables are routed through
 * their atomic RPCs so linked records are archived as one operation.
 */
export async function archiveItem(table, id) {
  if (table === "apiaries") return await archiveApiaryLifecycle(id);
  if (table === "inspections") return await archiveInspectionLifecycle(id);
  if (table === "todos") return await archiveTodoLifecycle(id);
  if (table === "logbook") return await archiveLogbookLifecycle(id);

  return await supabase
    .from(table)
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
}

export async function getApiaryDeleteSummary(apiaryId) {
  if (!apiaryId) return missingId("Missing apiary ID");

  return await supabase.rpc("get_apiary_delete_summary", {
    p_apiary_id: apiaryId,
  });
}

export async function getInspectionDeleteSummary(inspectionId) {
  if (!inspectionId) return missingId("Missing inspection ID");

  return await supabase.rpc("get_inspection_delete_summary", {
    p_inspection_id: inspectionId,
  });
}

/**
 * Edge Function name (must match deployed folder name)
 * supabase/functions/delete-row-with-photos
 */
const DELETE_FN = "delete-row-with-photos";

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
 * Solid server-side delete pipeline.
 *
 * The Edge Function changes the database first and removes storage objects
 * afterwards, so a blocked database deletion does not remove the photograph.
 *
 * mode:
 *  - "clear_photo": clear photo fields, then remove storage objects
 *  - "delete_row": delete the row, then remove storage objects
 *
 * removeOne:
 *  - for inspections (photos array), remove one photo by {path} or {url}
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
  const { data: summaryData, error: summaryError } =
    await getApiaryDeleteSummary(id);

  if (summaryError) {
    return { archived: false, error: summaryError };
  }

  const summary = Array.isArray(summaryData)
    ? summaryData[0]
    : summaryData || {};

  const hasChildren =
    Number(summary.hives || 0) +
      Number(summary.inspections || 0) +
      Number(summary.todos || 0) +
      Number(summary.logs || 0) >
    0;

  if (hasChildren) {
    const { error } = await archiveApiaryLifecycle(id);
    return { archived: true, error, summary };
  }

  const { error } = await serverDeleteRowWithPhotos({
    table: "apiaries",
    id,
    mode: "delete_row",
  });

  return { archived: false, error, summary };
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
    const { error } = await archiveHiveWithQueenLifecycle({
      hiveId: id,
      reason: "administrative",
      notes: "Archived automatically because linked records exist.",
    });
    return { archived: true, error };
  }

  const { error } = await serverDeleteRowWithPhotos({ table: "hives", id, mode: "delete_row" });
  return { archived: false, error };
}

export async function smartDeleteInspection(id) {
  const { data: summaryData, error: summaryError } =
    await getInspectionDeleteSummary(id);

  if (summaryError) {
    return { archived: false, error: summaryError };
  }

  const summary = Array.isArray(summaryData)
    ? summaryData[0]
    : summaryData || {};

  const hasChildren =
    Number(summary.todos || 0) + Number(summary.logs || 0) > 0;

  if (hasChildren) {
    const { error } = await archiveInspectionLifecycle(id);
    return { archived: true, error, summary };
  }

  const { error } = await serverDeleteRowWithPhotos({
    table: "inspections",
    id,
    mode: "delete_row",
  });

  return { archived: false, error, summary };
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
    const { error } = await archiveTodoLifecycle(id);
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
