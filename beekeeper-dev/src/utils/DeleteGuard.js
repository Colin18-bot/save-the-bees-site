// src/utils/DeleteGuard.js
import { supabase } from "../services/supabase.js";

/**
 * Small helper to confirm an action in a consistent way.
 * Replace with your toast/modal if you have one.
 */
function confirmDialog(message) {
  // Use globalThis to avoid Deno "no-window" lint warning.
  const c = globalThis && typeof globalThis.confirm === "function"
    ? globalThis.confirm
    : null;
  return c ? c(message) : true; // fall back to "OK" if no confirm available
}

function nowIso() {
  return new Date().toISOString();
}

/* --------------------------- APIARY --------------------------- */
export async function deleteOrArchiveApiary(apiaryId) {
  // 1) Ask DB for child counts
  const { data, error } = await supabase.rpc("check_apiary_children", { apiary_id: apiaryId });
  if (error) {
    alert("Could not check linked items. Please try again.");
    console.error(error);
    return { ok: false };
  }
  const { hives = 0, inspections = 0, todos = 0, logs = 0 } = (data && data[0]) || {};
  const hasChildren = (hives + inspections + todos + logs) > 0;

  if (hasChildren) {
    const ok = confirmDialog(
      `This apiary has:\n• ${hives} hives\n• ${inspections} inspections\n• ${todos} to-dos\n• ${logs} log entries\n\n` +
      `Archive instead? This will archive everything underneath and keep links intact.`
    );
    if (!ok) return { ok: false };

    const { error: archErr } = await supabase
      .from("apiaries")
      .update({ archived_at: nowIso() })
      .eq("id", apiaryId);

    if (archErr) {
      alert("Failed to archive apiary.");
      console.error(archErr);
      return { ok: false };
    }
    return { ok: true, action: "archived" };
  }

  // No children → safe hard delete
  const really = confirmDialog("Delete this apiary permanently? This cannot be undone.");
  if (!really) return { ok: false };

  const { error: delErr } = await supabase.from("apiaries").delete().eq("id", apiaryId);
  if (delErr) {
    if (delErr.code === "23503") alert("Delete blocked: this apiary still has linked items. Archive instead.");
    else alert("Failed to delete apiary.");
    console.error(delErr);
    return { ok: false };
  }
  return { ok: true, action: "deleted" };
}

/* ---------------------------- HIVE ---------------------------- */
export async function deleteOrArchiveHive(hiveId) {
  const { data, error } = await supabase.rpc("check_hive_children", { hive_id: hiveId });
  if (error) {
    alert("Could not check linked items.");
    console.error(error);
    return { ok: false };
  }
  const { inspections = 0, todos = 0, logs = 0 } = (data && data[0]) || {};
  const hasChildren = (inspections + todos + logs) > 0;

  if (hasChildren) {
    const ok = confirmDialog(
      `This hive has:\n• ${inspections} inspections\n• ${todos} to-dos\n• ${logs} log entries\n\n` +
      `Archive instead? This will archive its inspections and linked to-dos/logs.`
    );
    if (!ok) return { ok: false };

    const { error: archErr } = await supabase
      .from("hives")
      .update({ archived_at: nowIso() })
      .eq("id", hiveId);

    if (archErr) {
      alert("Failed to archive hive.");
      console.error(archErr);
      return { ok: false };
    }
    return { ok: true, action: "archived" };
  }

  const really = confirmDialog("Delete this hive permanently? This cannot be undone.");
  if (!really) return { ok: false };

  const { error: delErr } = await supabase.from("hives").delete().eq("id", hiveId);
  if (delErr) {
    if (delErr.code === "23503") alert("Delete blocked: this hive still has linked items. Archive instead.");
    else alert("Failed to delete hive.");
    console.error(delErr);
    return { ok: false };
  }
  return { ok: true, action: "deleted" };
}

/* ------------------------- INSPECTION ------------------------- */
export async function deleteOrArchiveInspection(inspectionId) {
  // leaf-ish: may have logbook entries
  const { data, error } = await supabase.rpc("check_inspection_children", { inspection_id: inspectionId });
  if (error) {
    alert("Could not check linked items.");
    console.error(error);
    return { ok: false };
  }
  const { todos = 0, logs = 0 } = (data && data[0]) || {}; // todos likely 0 in your schema
  const hasChildren = (todos + logs) > 0;

  if (hasChildren) {
    const ok = confirmDialog(
      `This inspection has:\n• ${logs} log entries\n${todos ? `• ${todos} to-dos\n` : ""}\n` +
      `Archive instead? This will archive the inspection and those linked items.`
    );
    if (!ok) return { ok: false };

    const { error: archErr } = await supabase
      .from("inspections")
      .update({ archived_at: nowIso() })
      .eq("id", inspectionId);

    if (archErr) {
      alert("Failed to archive inspection.");
      console.error(archErr);
      return { ok: false };
    }
    return { ok: true, action: "archived" };
  }

  const really = confirmDialog("Delete this inspection permanently? This cannot be undone.");
  if (!really) return { ok: false };

  const { error: delErr } = await supabase.from("inspections").delete().eq("id", inspectionId);
  if (delErr) {
    if (delErr.code === "23503") alert("Delete blocked: linked items still exist. Archive instead.");
    else alert("Failed to delete inspection.");
    console.error(delErr);
    return { ok: false };
  }
  return { ok: true, action: "deleted" };
}

/* --------------------------- TODO ----------------------------- */
export async function deleteOrArchiveTodo(todoId) {
  // leaf node — recommend archive (undoable)
  const choice = confirmDialog(
    "Archive this to-do? (Safer—can be restored). Click Cancel to permanently delete instead."
  );
  if (choice) {
    const { error } = await supabase.from("todos").update({ archived_at: nowIso() }).eq("id", todoId);
    if (error) {
      alert("Failed to archive to-do."); console.error(error);
      return { ok: false };
    }
    return { ok: true, action: "archived" };
  }

  const really = confirmDialog("Delete this to-do permanently? This cannot be undone.");
  if (!really) return { ok: false };

  const { error: delErr } = await supabase.from("todos").delete().eq("id", todoId);
  if (delErr) { alert("Failed to delete to-do."); console.error(delErr); return { ok: false }; }
  return { ok: true, action: "deleted" };
}

/* ------------------------- LOG ENTRY -------------------------- */
export async function deleteOrArchiveLog(logId) {
  // leaf node (though can link to inspection) — archive recommended
  const choice = confirmDialog(
    "Archive this log entry? (Safer—can be restored). Click Cancel to permanently delete instead."
  );
  if (choice) {
    const { error } = await supabase.from("logbook").update({ archived_at: nowIso() }).eq("id", logId);
    if (error) { alert("Failed to archive log entry."); console.error(error); return { ok: false }; }
    return { ok: true, action: "archived" };
  }

  const really = confirmDialog("Delete this log entry permanently? This cannot be undone.");
  if (!really) return { ok: false };

  const { error: delErr } = await supabase.from("logbook").delete().eq("id", logId);
  if (delErr) { alert("Failed to delete log entry."); console.error(delErr); return { ok: false }; }
  return { ok: true, action: "deleted" };
}
