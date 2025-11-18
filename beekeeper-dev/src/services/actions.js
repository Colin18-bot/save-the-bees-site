// src/services/actions.js
import { supabase } from "./supabase.js"; // ← add .js for Deno

/** Nicely format Supabase errors for toasts/alerts */
export function humaniseSupabaseError(err) {
  if (!err) return "";
  if (typeof err === "string") return err;
  return err.message || "Unexpected error";
}

/** Extract { bucket, path } from a Supabase public URL */
export function parseStoragePublicUrl(url) {
  if (!url) return null;
  const m = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

/** Remove a list of public storage URLs (ignore failures) */
export async function removeStorageUrls(urls = []) {
  const byBucket = new Map();
  for (const u of urls) {
    const p = parseStoragePublicUrl(u);
    if (!p) continue;
    if (!byBucket.has(p.bucket)) byBucket.set(p.bucket, new Set());
    byBucket.get(p.bucket).add(p.path);
  }
  for (const [bucket, setPaths] of byBucket.entries()) {
    const paths = Array.from(setPaths);
    if (!paths.length) continue;
    try {
      await supabase.storage.from(bucket).remove(paths);
    } catch {
      /* ignore storage remove errors */
    }
  }
}

/** Remove a single object by its public URL (ignore failures) */
export async function cleanObjectByPublicUrl(url) {
  const p = parseStoragePublicUrl(url);
  if (!p) return;
  try {
    await supabase.storage.from(p.bucket).remove([p.path]);
  } catch {
    /* ignore single remove error */
  }
}

/** Archive a row (sets archived_at = now()) */
export async function archiveItem(table, id) {
  return await supabase
    .from(table)
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
}

/** Delete a row and remove a single photo URL stored in `photoField` */
export async function deleteRowWithPhoto(table, id, photoField = "photo_url") {
  // fetch url first so we can clean storage
  const { data, error: readErr } = await supabase
    .from(table)
    .select(photoField)
    .eq("id", id)
    .maybeSingle();
  if (readErr) return { error: readErr };

  const url = data?.[photoField];
  if (url) await removeStorageUrls([url]);

  const { error } = await supabase.from(table).delete().eq("id", id);
  return { error };
}

/** Delete a row and remove an ARRAY of URL strings (e.g., photos[]) */
export async function deleteRowAndRemoveUrls(table, id, arrayField = "photos") {
  const { data, error: readErr } = await supabase
    .from(table)
    .select(arrayField)
    .eq("id", id)
    .maybeSingle();
  if (readErr) return { error: readErr };

  const urls = Array.isArray(data?.[arrayField]) ? data[arrayField] : [];
  if (urls.length) await removeStorageUrls(urls);

  const { error } = await supabase.from(table).delete().eq("id", id);
  return { error };
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

/**
 * smartDeleteApiary(id)
 * - If linked children exist (via optional RPC check_apiary_children), archive it.
 * - Otherwise, hard-delete and clean up its photo_url.
 */
export async function smartDeleteApiary(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_apiary_children", { apiary_id: id });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { hives = 0, inspections = 0, todos = 0, logs = 0 } = row || {};
      hasChildren = (hives + inspections + todos + logs) > 0;
    }
  } catch {
    /* RPC may not exist — ignore */
  }

  if (hasChildren) {
    const { error } = await archiveItem("apiaries", id);
    return { archived: true, error };
  }
  const { error } = await deleteRowWithPhoto("apiaries", id, "photo_url");
  return { archived: false, error };
}

/**
 * smartDeleteHive(id)
 * - If linked children exist (RPC check_hive_children), archive it.
 * - Otherwise, hard-delete and clean up its photo_url.
 */
export async function smartDeleteHive(id) {
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_hive_children", { hive_id: id });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { inspections = 0, todos = 0, logs = 0 } = row || {};
      hasChildren = (inspections + todos + logs) > 0;
    }
  } catch {
    /* RPC may not exist — ignore */
  }

  if (hasChildren) {
    const { error } = await archiveItem("hives", id);
    return { archived: true, error };
  }
  const { error } = await deleteRowWithPhoto("hives", id, "photo_url");
  return { archived: false, error };
}

/**
 * smartDeleteInspection(id)
 * - No children expected; if you store photos[], clean those before delete.
 */
export async function smartDeleteInspection(id) {
  // If your inspections table has an array `photos`, this will clean them up.
  const { error } = await deleteRowAndRemoveUrls("inspections", id, "photos");
  return { archived: false, error };
}

/**
 * smartDeleteTodo(id)
 * - If a todo has linked children (via optional RPC check_todo_children), archive it.
 * - Otherwise, hard-delete and clean up any stored file URLs if present.
 *   Works whether your todos table uses `photo_url` (single) or `photos` (array).
 */
export async function smartDeleteTodo(id) {
  // 1) Try to detect children via RPC (ignore if the function doesn’t exist)
  let hasChildren = false;
  try {
    const { data, error } = await supabase.rpc("check_todo_children", { todo_id: id });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      const { logs = 0, attachments = 0 } = row || {};
      hasChildren = (logs + attachments) > 0;
    }
  } catch {
    /* RPC may not exist — ignore */
  }

  if (hasChildren) {
    const { error } = await archiveItem("todos", id);
    return { archived: true, error };
  }

  // 2) Hard delete (first clean up any file URLs)
  const { data: todo } = await supabase
    .from("todos")
    .select("photo_url, photos")
    .eq("id", id)
    .maybeSingle();

  const urls = [
    ...(todo?.photo_url ? [todo.photo_url] : []),
    ...(Array.isArray(todo?.photos) ? todo.photos : []),
  ];
  if (urls.length) await removeStorageUrls(urls);

  const { error } = await supabase.from("todos").delete().eq("id", id);
  return { archived: false, error };
}
