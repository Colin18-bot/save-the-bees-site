// src/pages/Archive.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

const PAGE_SIZE = 9;

// ✅ Proper singular labels + color styles per type
const SINGULAR = {
  apiaries: "Apiary",
  hives: "Hive",
  inspections: "Inspection",
  todos: "To-Do",
  logbook: "Log",
};

const BADGE_STYLES = {
  apiaries: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  hives: "bg-green-100 text-green-800 border border-green-200",
  inspections: "bg-blue-100 text-blue-800 border border-blue-200",
  todos: "bg-purple-100 text-purple-800 border border-purple-200",
  logbook: "bg-gray-100 text-gray-800 border border-gray-200",
};

const Archive = () => {
  const [allData, setAllData] = useState({
    apiaries: [],
    hives: [],
    inspections: [],
    todos: [],
    logbook: [],
  });

  // Lookup maps for names (active + archived)
  const [apiaryLookup, setApiaryLookup] = useState(new Map());
  const [hiveLookup, setHiveLookup] = useState(new Map());

  const [activeType, setActiveType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedApiary, setSelectedApiary] = useState("");
  const [selectedItems, setSelectedItems] = useState([]); // [{table, item}]
  const [apiaryOptions, setApiaryOptions] = useState([]);

  // Inline restore error messages keyed by `${table}-${id}`
  const [restoreErrors, setRestoreErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const fetchArchived = async (table) =>
      (await supabase.from(table).select("*").not("archived_at", "is", null)).data || [];

    // archived rows for the Archive list
    const apiariesArch = await fetchArchived("apiaries");
    const hivesArch = await fetchArchived("hives");
    const inspectionsArch = await fetchArchived("inspections");
    const todosArch = await fetchArchived("todos");
    const logbookArch = await fetchArchived("logbook");

    setAllData({
      apiaries: apiariesArch,
      hives: hivesArch,
      inspections: inspectionsArch,
      todos: todosArch,
      logbook: logbookArch,
    });

    // active apiaries for filter dropdown
    const { data: apiariesActive } = await supabase
      .from("apiaries")
      .select("id, name")
      .is("archived_at", null)
      .order("name", { ascending: true });

    setApiaryOptions(apiariesActive || []);

    // build name lookups from ALL (active + archived)
    const [{ data: apiariesAll }, { data: hivesAll }] = await Promise.all([
      supabase.from("apiaries").select("id, name"),
      supabase.from("hives").select("id, name, apiary_id"),
    ]);

    setApiaryLookup(new Map((apiariesAll || []).map((a) => [a.id, a.name || "Unnamed Apiary"])));
    setHiveLookup(
      new Map((hivesAll || []).map((h) => [h.id, { name: h.name || "Unnamed Hive", apiary_id: h.apiary_id }]))
    );

    // clear any stale per-item restore errors after a refresh
    setRestoreErrors({});
  };

  // ----- helpers -----
  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  };

  // When restoring an apiary that has is_default=true, make it the only default
  const enforceSingleDefaultOnRestore = async (apiaryId, userId) => {
    if (!apiaryId || !userId) return;

    await supabase
      .from("apiaries")
      .update({ is_default: false })
      .eq("user_id", userId)
      .is("archived_at", null)
      .neq("id", apiaryId);

    await supabase.from("apiaries").update({ is_default: true }).eq("id", apiaryId);

    const uid = await getUserId();
    if (uid && uid === userId) {
      await supabase.from("profiles").update({ default_apiary_id: apiaryId }).eq("user_id", uid);
    }
  };

  // If archiving a default apiary → clear profile.default_apiary_id
  const clearProfileDefaultIfArchiving = async (apiaryId, userId, isDefault) => {
    if (!apiaryId || !userId) return;
    if (!isDefault) return;

    const uid = await getUserId();
    if (uid && uid === userId) {
      await supabase
        .from("profiles")
        .update({ default_apiary_id: null })
        .eq("user_id", uid)
        .in("default_apiary_id", [apiaryId]);
    }
  };

  // If deleting a default apiary → clear profile.default_apiary_id
  const clearProfileDefaultIfDeleting = async (apiaryId, userId /* , isDefault */) => {
    if (!apiaryId || !userId) return;

    const uid = await getUserId();
    if (uid && uid === userId) {
      await supabase
        .from("profiles")
        .update({ default_apiary_id: null })
        .eq("user_id", uid)
        .in("default_apiary_id", [apiaryId]);
    }
  };

  // Map raw DB error text to a friendly inline message (uses singular labels)
  const friendlyRestoreError = (table, errMsg) => {
    const lower = String(errMsg || "").toLowerCase();
    if (lower.includes("cannot restore hive")) {
      return "Cannot restore hive: its apiary is archived. Restore the apiary first.";
    }
    if (lower.includes("cannot restore inspection")) {
      return "Cannot restore inspection: its hive or apiary is archived. Restore parent first.";
    }
    if (lower.includes("cannot restore to-do")) {
      return "Cannot restore to-do: its parent hive/apiary is archived. Restore parent first.";
    }
    if (lower.includes("cannot restore log entry")) {
      return "Cannot restore log entry: its parent hive/apiary is archived. Restore parent first.";
    }
    const label = SINGULAR[table] || table;
    return `Restore failed${table ? ` for ${label.toLowerCase()}` : ""}: ${errMsg}`;
  };

  // ---------- filtering / shaping ----------
  const apiaryName = (id) => apiaryLookup.get(id) || "Unknown Apiary";
  const hiveName = (id) => (hiveLookup.get(id)?.name ? hiveLookup.get(id).name : "Unknown Hive");
  const hiveApiaryId = (id) => hiveLookup.get(id)?.apiary_id || "";
  const shortId = (id) => (id ? String(id).slice(0, 8) : "");

  // Make a human-friendly label + sublines per type
  const describeItem = (type, item) => {
    const errKey = `${type}-${item.id}`;
    const common = {
      errKey,
      type,
      table: type,
      id: item.id,
      archived_at: item.archived_at,
      created_at: item.created_at,
      apiary_id: item.apiary_id || (item.hive_id ? hiveApiaryId(item.hive_id) : ""),
      hive_id: item.hive_id || "",
      inspection_id: item.inspection_id || "",
      raw: item,
    };

    if (type === "apiaries") {
      return {
        ...common,
        title: item.name || `Apiary (${shortId(item.id)})`,
        meta: [`Apiary`],
      };
    }

    if (type === "hives") {
      const apiary = item.apiary_id ? apiaryName(item.apiary_id) : "Unknown Apiary";
      const title = item.name || `Hive (${shortId(item.id)})`;
      return {
        ...common,
        title,
        meta: [`Apiary: ${apiary}`],
      };
    }

    if (type === "inspections") {
      const apiary = item.apiary_id ? apiaryName(item.apiary_id) : "Unknown Apiary";
      const hive = item.hive_id ? hiveName(item.hive_id) : "Unknown Hive";
      const date = item.date ? new Date(item.date).toLocaleDateString("en-GB") : `#${shortId(item.id)}`;
      return {
        ...common,
        title: `Inspection ${item.date ? `on ${date}` : `(${shortId(item.id)})`}`,
        meta: [`Hive: ${hive}`, `Apiary: ${apiary}`],
      };
    }

    if (type === "todos") {
      const apiary = item.apiary_id ? apiaryName(item.apiary_id) : "Unknown Apiary";
      const hive = item.hive_id ? hiveName(item.hive_id) : "Unknown Hive";
      const due =
        item.due_date ? `Due: ${new Date(item.due_date).toLocaleDateString("en-GB")}` : null;
      return {
        ...common,
        title: item.title || `To-Do (${shortId(item.id)})`,
        meta: [due, `Hive: ${hive}`, `Apiary: ${apiary}`].filter(Boolean),
      };
    }

    // logbook: try notes/content preview; always show linked hive/apiary
    if (type === "logbook") {
      const apiary = item.apiary_id ? apiaryName(item.apiary_id) : "Unknown Apiary";
      const hive = item.hive_id ? hiveName(item.hive_id) : "Unknown Hive";
      const preview =
        item.notes || item.note || item.content || item.text || item.message || "";
      const clipped = String(preview).trim().slice(0, 80);
      return {
        ...common,
        title: clipped ? `Log: ${clipped}${preview.length > 80 ? "…" : ""}` : `Log entry (${shortId(item.id)})`,
        meta: [`Hive: ${hive}`, `Apiary: ${apiary}`],
      };
    }

    // fallback
    return {
      ...common,
      title: item.name || item.title || `ID: ${item.id}`,
      meta: [],
    };
  };

  // Shape + filter combined list for the current tab
  const activeItems = useMemo(() => {
    const lists = {
      apiaries: allData.apiaries,
      hives: allData.hives,
      inspections: allData.inspections,
      todos: allData.todos,
      logbook: allData.logbook,
    };

    const applyFilters = (items, type) => {
      let filtered = items.map((it) => describeItem(type, it));

      // search by title
      if (searchTerm) {
        const needle = searchTerm.toLowerCase();
        filtered = filtered.filter((x) => x.title.toLowerCase().includes(needle));
      }

      // filter by apiary (if we can resolve an apiary_id)
      if (selectedApiary) {
        filtered = filtered.filter(
          (x) => String(x.apiary_id || "") === String(selectedApiary)
        );
      }

      // sort by archived_at (fallback created_at)
      filtered.sort((a, b) => {
        const da = new Date(a.archived_at || a.created_at || 0).getTime();
        const db = new Date(b.archived_at || b.created_at || 0).getTime();
        return sortOrder === "desc" ? db - da : da - db;
      });

      return filtered;
    };

    if (activeType === "all") {
      const merged = [
        ...applyFilters(lists.apiaries, "apiaries"),
        ...applyFilters(lists.hives, "hives"),
        ...applyFilters(lists.inspections, "inspections"),
        ...applyFilters(lists.todos, "todos"),
        ...applyFilters(lists.logbook, "logbook"),
      ];
      // already sorted inside applyFilters, but we merged — sort once more globally
      merged.sort((a, b) => {
        const da = new Date(a.archived_at || a.created_at || 0).getTime();
        const db = new Date(b.archived_at || b.created_at || 0).getTime();
        return sortOrder === "desc" ? db - da : da - db;
      });
      return merged;
    }

    return applyFilters(lists[activeType] || [], activeType);
  }, [allData, apiaryLookup, hiveLookup, activeType, searchTerm, selectedApiary, sortOrder]);

  // Reset to page 1 when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeType, searchTerm, selectedApiary, sortOrder]);

  const total = activeItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = activeItems.slice(startIdx, endIdx);

  // ----- UI bits -----
  const archiveTypes = [
    { label: "All", value: "all" },
    { label: "Apiaries", value: "apiaries" },
    { label: "Hives", value: "hives" },
    { label: "Inspections", value: "inspections" },
    { label: "Tasks", value: "todos" },
    { label: "Logbook", value: "logbook" },
  ];

  // ✅ Colored, singular badge
  const TypeBadge = ({ type }) => {
    const label = SINGULAR[type] || type;
    const cls = BADGE_STYLES[type] || "bg-gray-100 text-gray-700 border border-gray-200";
    return <span className={`text-xs px-2 py-1 rounded ${cls}`}>{label}</span>;
  };

  // ====== NEW: preflight helpers to avoid 400s ======
  const isArchived = (table, id) => {
    if (!id) return false;
    const list = allData[table] || [];
    return list.some((row) => String(row.id) === String(id));
  };

  const parentArchivedReason = (table, item) => {
    if (table === "apiaries") return null;

    if (table === "hives") {
      if (isArchived("apiaries", item.apiary_id)) {
        return "Cannot restore hive: its apiary is archived. Restore the apiary first.";
      }
      return null;
    }

    // inspections, todos, logbook can hang off a hive and/or apiary
    const hi = item.hive_id;
    const ai = item.apiary_id || hiveApiaryId(item.hive_id);

    if (isArchived("hives", hi)) {
      const label =
        table === "inspections" ? "inspection" : table === "todos" ? "to-do" : "log entry";
      return `Cannot restore ${label}: its hive is archived. Restore the hive (and apiary) first.`;
    }
    if (isArchived("apiaries", ai)) {
      const label =
        table === "inspections" ? "inspection" : table === "todos" ? "to-do" : "log entry";
      return `Cannot restore ${label}: its apiary is archived. Restore the apiary first.`;
    }
    return null;
  };

  const preflightRestore = (table, item) => {
    const reason = parentArchivedReason(table, item);
    return { ok: !reason, reason };
  };
  // ====== end preflight helpers ======

  // ----- single-item actions -----
  const restoreItem = async (table, item) => {
    // preflight: skip PATCH if parents are archived
    const { ok, reason } = preflightRestore(table, item);
    if (!ok) {
      setRestoreErrors((prev) => ({ ...prev, [`${table}-${item.id}`]: reason }));
      return;
    }

    const { error } = await supabase.from(table).update({ archived_at: null }).eq("id", item.id);

    if (error) {
      setRestoreErrors((prev) => ({
        ...prev,
        [`${table}-${item.id}`]: friendlyRestoreError(table, error.message),
      }));
      return;
    }

    // success → clear any error message for this item
    setRestoreErrors((prev) => {
      const copy = { ...prev };
      delete copy[`${table}-${item.id}`];
      return copy;
    });

    if (table === "apiaries") {
      try {
        const { data: row } = await supabase.from("apiaries").select("*").eq("id", item.id).single();
        if (row?.is_default && row?.user_id) {
          await enforceSingleDefaultOnRestore(row.id, row.user_id);
        }
      } catch (_) {}
    }
    fetchData();
  };

  const deleteItem = async (table, item) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This cannot be undone.")) return;

    if (table === "apiaries") {
      try {
        await clearProfileDefaultIfDeleting(item.id, item.user_id, !!item.is_default);
      } catch (_) {}
    }

    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (!error) fetchData();
  };

  // Archive an item (special-case for apiaries)
  const archiveItem = async (table, item) => {
    if (table === "apiaries") {
      try {
        await clearProfileDefaultIfArchiving(item.id, item.user_id, !!item.is_default);
      } catch (_) {}
    }
    const { error } = await supabase
      .from(table)
      .update({ archived_at: new Date().toISOString() })
      .eq("id", item.id);
    if (!error) fetchData();
  };

  // ----- bulk actions -----
  const restoreSelectedItems = async () => {
    const newErrors = {};
    for (const { table, item } of selectedItems) {
      if (!allData[table]) continue;

      // preflight each item to avoid 400s
      const { ok, reason } = preflightRestore(table, item);
      if (!ok) {
        newErrors[`${table}-${item.id}`] = reason;
        continue; // do not send PATCH
      }

      const { error } = await supabase.from(table).update({ archived_at: null }).eq("id", item.id);
      if (error) {
        newErrors[`${table}-${item.id}`] = friendlyRestoreError(table, error.message);
        continue;
      }

      if (table === "apiaries") {
        try {
          const { data: row } = await supabase.from("apiaries").select("*").eq("id", item.id).single();
          if (row?.is_default && row?.user_id) {
            await enforceSingleDefaultOnRestore(row.id, row.user_id);
          }
        } catch (_) {}
      }
    }
    if (Object.keys(newErrors).length) {
      setRestoreErrors((prev) => ({ ...prev, ...newErrors }));
    }
    setSelectedItems([]);
    fetchData();
  };

  const deleteSelectedItems = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all selected items? This cannot be undone."))
      return;

    for (const { table, item } of selectedItems) {
      if (!allData[table]) continue;

      if (table === "apiaries") {
        try {
          await clearProfileDefaultIfDeleting(item.id, item.user_id, !!item.is_default);
        } catch (_) {}
      }
      await supabase.from(table).delete().eq("id", item.id);
    }
    setSelectedItems([]);
    fetchData();
  };

  // ----- selection helpers -----
  const toggleSelectItem = (table, item) => {
    const exists = selectedItems.find((sel) => sel.item.id === item.id && sel.table === table);
    if (exists) {
      setSelectedItems((prev) => prev.filter((sel) => !(sel.item.id === item.id && sel.table === table)));
    } else {
      setSelectedItems((prev) => [...prev, { table, item }]);
    }
  };

  // selection shortcuts (work on the full filtered list, not just the current page)
  const selectFromList = (list) => {
    const map = new Map();
    list.forEach((x) => {
      const key = `${x.table}-${x.id}`;
      map.set(key, { table: x.table, item: x.raw });
    });
    setSelectedItems(Array.from(map.values()));
  };

  const clearSelection = () => setSelectedItems([]);

  const selectAllFiltered = () => selectFromList(activeItems);
  const selectByType = (type) => selectFromList(activeItems.filter((x) => x.table === type));

  const Row = ({ x }) => {
    const checked = selectedItems.some((sel) => sel.item.id === x.id && sel.table === x.table);
    const errKey = `${x.table}-${x.id}`;

    // preflight for button state
    const pre = preflightRestore(x.table, x.raw);

    return (
      <li className="border p-4 rounded shadow-sm bg-white">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleSelectItem(x.table, x.raw)}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{x.title}</p>
                <TypeBadge type={x.type} />
              </div>
              <div className="text-sm text-gray-600 mt-1 space-x-2 space-y-1">
                {x.meta.map((m, i) => (
                  <span key={i} className="inline-block">{m}</span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {x.archived_at && <>Archived: {new Date(x.archived_at).toLocaleDateString()} · </>}
                {x.created_at && <>Created: {new Date(x.created_at).toLocaleDateString()}</>}
              </div>
              {(!pre.ok || restoreErrors[errKey]) && (
                <p className="text-sm text-red-600 mt-2">{restoreErrors[errKey] || pre.reason}</p>
              )}
            </div>
          </div>
          <div className="space-x-3 shrink-0">
            <button
              onClick={() => restoreItem(x.table, x.raw)}
              disabled={!pre.ok}
              title={!pre.ok ? pre.reason : "Restore"}
              className={`text-sm ${!pre.ok ? "text-blue-400 cursor-not-allowed opacity-60" : "text-blue-600 hover:underline"}`}
            >
              Restore
            </button>
            <button
              onClick={() => deleteItem(x.table, x.raw)}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Archived Items</h1>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {archiveTypes.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => {
              setActiveType(value);
              setSelectedItems([]);
              setRestoreErrors({});
            }}
            className={`px-4 py-2 rounded ${
              activeType === value ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search / Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <input
          type="text"
          placeholder="Search by name or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/4"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>

        {activeType !== "apiaries" && (
          <select
            value={selectedApiary}
            onChange={(e) => setSelectedApiary(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-1/3"
          >
            <option value="">All Apiaries</option>
            {apiaryOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selection shortcuts */}
      {total > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Select:</span>
          <button
            onClick={selectAllFiltered}
            className="text-sm px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            All (filtered)
          </button>
          <button
            onClick={() => selectByType("apiaries")}
            className="text-sm px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            Apiaries
          </button>
          <button
            onClick={() => selectByType("hives")}
            className="text-sm px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            Hives
          </button>
          <button
            onClick={() => selectByType("inspections")}
            className="text-sm px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            Inspections
          </button>
          <button
            onClick={() => selectByType("todos")}
            className="text-sm px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            Tasks
          </button>
          <button
            onClick={() => selectByType("logbook")}
            className="text-sm px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            Logbook
          </button>
          <button
            onClick={clearSelection}
            className="text-sm px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            None
          </button>
        </div>
      )}

      {/* Bulk actions (when there are results) */}
      {total > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 ? `${selectedItems.length} selected` : null}
          </div>
          <div className="space-x-2">
            <button
              onClick={restoreSelectedItems}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              disabled={selectedItems.length === 0}
            >
              Restore Selected
            </button>
            <button
              onClick={deleteSelectedItems}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              disabled={selectedItems.length === 0}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {total === 0 ? (
        <p className="text-gray-500">No archived {activeType === "all" ? "items" : activeType}.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {pageItems.map((x) => (
              <Row key={`${x.table}-${x.id}`} x={x} />
            ))}
          </ul>

          {/* Pagination — bottom only, matches InspectionList.jsx */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50"
              >
                Prev
              </button>
              {totalPages > 1 && (
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCurrentPage(n)}
                      className={`text-sm px-3 py-2 rounded border ${
                        n === currentPage
                          ? "bg-green-700 text-white border-green-800"
                          : "bg-white border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Archive;
