// src/pages/Archive.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";
import {
  getApiaryDeleteSummary,
  getInspectionDeleteSummary,
  humaniseSupabaseError,
  restoreApiaryLifecycle,
  restoreHiveAfterArchive,
  restoreInspectionLifecycle,
  restoreLogbookLifecycle,
  restoreTodoLifecycle,
  serverDeleteRowWithPhotos,
} from "../services/actions";

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

  const fetchData = useCallback(async () => {
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

    // apiaries for filter dropdown – only those that are archived
    const apiaryOptionsFromArchived = (apiariesArch || [])
      .map((a) => ({
        id: a.id,
        name: a.name || "Unnamed Apiary",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setApiaryOptions(apiaryOptionsFromArchived);

    // build name lookups from ALL (active + archived)
    const [{ data: apiariesAll }, { data: hivesAll }] = await Promise.all([
      supabase.from("apiaries").select("id, name"),
      supabase.from("hives").select("id, name, apiary_id"),
    ]);

    setApiaryLookup(new Map((apiariesAll || []).map((a) => [a.id, a.name || "Unnamed Apiary"])));
    setHiveLookup(
      new Map(
        (hivesAll || []).map((h) => [
          h.id,
          { name: h.name || "Unnamed Hive", apiary_id: h.apiary_id },
        ])
      )
    );

    // clear any stale per-item restore errors after a refresh
    setRestoreErrors({});
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const apiaryName = useCallback((id) => apiaryLookup.get(id) || "Unknown Apiary", [apiaryLookup]);

  const hiveName = useCallback(
    (id) => (hiveLookup.get(id)?.name ? hiveLookup.get(id).name : "Unknown Hive"),
    [hiveLookup]
  );

  const hiveApiaryId = useCallback((id) => hiveLookup.get(id)?.apiary_id || "", [hiveLookup]);

  const shortId = (id) => (id ? String(id).slice(0, 8) : "");

  // Make a human-friendly label + sublines per type
  const describeItem = useCallback(
    (type, item) => {
      const errKey = `${type}-${item.id}`;

      // Make sure every item has a consistent apiary_id for filtering
      const resolvedApiaryId =
        type === "apiaries"
          ? item.id
          : item.apiary_id || (item.hive_id ? hiveApiaryId(item.hive_id) : "");

      const common = {
        errKey,
        type,
        table: type,
        id: item.id,
        archived_at: item.archived_at,
        created_at: item.created_at,
        apiary_id: resolvedApiaryId,
        hive_id: item.hive_id || "",
        inspection_id: item.inspection_id || "",
        raw: item,
      };

      if (type === "apiaries") {
        return {
          ...common,
          title: item.name || `Apiary (${shortId(item.id)})`,
          meta: [],
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
        const date = item.date
          ? new Date(item.date).toLocaleDateString("en-GB")
          : `#${shortId(item.id)}`;
        return {
          ...common,
          title: `Inspection ${item.date ? `on ${date}` : `(${shortId(item.id)})`}`,
          meta: [`Hive: ${hive}`, `Apiary: ${apiary}`],
        };
      }

      if (type === "todos") {
        const apiary = item.apiary_id ? apiaryName(item.apiary_id) : "Unknown Apiary";
        const hive = item.hive_id ? hiveName(item.hive_id) : "Unknown Hive";
        const due = item.due_date
          ? `Due: ${new Date(item.due_date).toLocaleDateString("en-GB")}`
          : null;
        return {
          ...common,
          title: item.title || `To-Do (${shortId(item.id)})`,
          meta: [due, `Hive: ${hive}`, `Apiary: ${apiary}`].filter(Boolean),
        };
      }

      if (type === "logbook") {
        const apiary = item.apiary_id ? apiaryName(item.apiary_id) : "Unknown Apiary";
        const hive = item.hive_id ? hiveName(item.hive_id) : "Unknown Hive";
        const preview = item.notes || item.note || item.content || item.text || item.message || "";
        const clipped = String(preview).trim().slice(0, 80);

        return {
          ...common,
          title: clipped ? `Log: ${clipped}${preview.length > 80 ? "…" : ""}` : "Log entry",
          meta: [`Hive: ${hive}`, `Apiary: ${apiary}`],
        };
      }

      return {
        ...common,
        title: item.name || item.title || `ID: ${item.id}`,
        meta: [],
      };
    },
    [apiaryName, hiveApiaryId, hiveName]
  );

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

      if (searchTerm) {
        const needle = searchTerm.toLowerCase();
        filtered = filtered.filter((x) => x.title.toLowerCase().includes(needle));
      }

      if (selectedApiary) {
        filtered = filtered.filter((x) => String(x.apiary_id || "") === String(selectedApiary));
      }

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
      merged.sort((a, b) => {
        const da = new Date(a.archived_at || a.created_at || 0).getTime();
        const db = new Date(b.archived_at || b.created_at || 0).getTime();
        return sortOrder === "desc" ? db - da : da - db;
      });
      return merged;
    }

    return applyFilters(lists[activeType] || [], activeType);
  }, [allData, activeType, describeItem, searchTerm, selectedApiary, sortOrder]);

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

  const TypeBadge = ({ type }) => {
    const label = SINGULAR[type] || type;
    const cls = BADGE_STYLES[type] || "bg-gray-100 text-gray-700 border border-gray-200";
    return <span className={`text-xs px-2 py-1 rounded ${cls}`}>{label}</span>;
  };

  // ====== preflight helpers ======
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

    const hi = item.hive_id;
    const ai = item.apiary_id || hiveApiaryId(item.hive_id);

    if (isArchived("hives", hi)) {
      const label = table === "inspections" ? "inspection" : table === "todos" ? "to-do" : "log entry";
      return `Cannot restore ${label}: its hive is archived. Restore the hive (and apiary) first.`;
    }
    if (isArchived("apiaries", ai)) {
      const label = table === "inspections" ? "inspection" : table === "todos" ? "to-do" : "log entry";
      return `Cannot restore ${label}: its apiary is archived. Restore the apiary first.`;
    }
    return null;
  };

  const preflightRestore = (table, item) => {
    const reason = parentArchivedReason(table, item);
    return { ok: !reason, reason };
  };
  // ====== end preflight helpers ======

  // ----- lifecycle action helpers -----
  const restoreArchivedItem = async (table, id) => {
    if (table === "apiaries") return await restoreApiaryLifecycle(id);
    if (table === "hives") return await restoreHiveAfterArchive(id);
    if (table === "inspections") return await restoreInspectionLifecycle(id);
    if (table === "todos") return await restoreTodoLifecycle(id);
    if (table === "logbook") return await restoreLogbookLifecycle(id);

    return {
      data: null,
      error: { message: `Unsupported archive type: ${table}` },
    };
  };

  const rowIsAlreadyActive = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .select("archived_at")
      .eq("id", id)
      .maybeSingle();

    return !error && data && data.archived_at === null;
  };

  const normaliseSummary = (data) =>
    Array.isArray(data) ? data[0] || {} : data || {};

  const apiaryDeleteWarning = async (item) => {
    const { data, error } = await getApiaryDeleteSummary(item.id);
    if (error) throw error;

    const summary = normaliseSummary(data);
    const hives = Number(summary.hives || 0);
    const inspections = Number(summary.inspections || 0);
    const todos = Number(summary.todos || 0);
    const logs = Number(summary.logs || 0);

    return [
      `Permanently delete the apiary “${item.name || "Unnamed Apiary"}”?`,
      "",
      "This will permanently delete everything contained in this apiary, including archived records:",
      `• ${hives} hive${hives === 1 ? "" : "s"}`,
      `• ${inspections} inspection${inspections === 1 ? "" : "s"}`,
      `• ${todos} task${todos === 1 ? "" : "s"}`,
      `• ${logs} logbook entr${logs === 1 ? "y" : "ies"}`,
      "",
      "Hive-specific Queen history will be removed. Queens transferred outside this apiary will be preserved.",
      "",
      "This cannot be undone.",
    ].join("\n");
  };

  const inspectionDeleteWarning = async (item) => {
    const { data, error } = await getInspectionDeleteSummary(item.id);
    if (error) throw error;

    const summary = normaliseSummary(data);
    const todos = Number(summary.todos || 0);
    const logs = Number(summary.logs || 0);
    const date = item.date
      ? new Date(item.date).toLocaleDateString("en-GB")
      : shortId(item.id);

    return [
      `Permanently delete the inspection dated ${date}?`,
      "",
      `This will also permanently delete ${todos} linked task${todos === 1 ? "" : "s"} and ${logs} linked logbook entr${logs === 1 ? "y" : "ies"}, including archived records.`,
      "",
      "The inspection Queen snapshot will be deleted, but the main Queen record and Queen history will not be changed.",
      "",
      "This cannot be undone.",
    ].join("\n");
  };

  // ----- single-item actions -----
  const restoreItem = async (table, item) => {
    const { ok, reason } = preflightRestore(table, item);
    if (!ok) {
      setRestoreErrors((prev) => ({
        ...prev,
        [`${table}-${item.id}`]: reason,
      }));
      return;
    }

    const result = await restoreArchivedItem(table, item.id);

    if (result.error) {
      setRestoreErrors((prev) => ({
        ...prev,
        [`${table}-${item.id}`]: friendlyRestoreError(
          table,
          result.error.message
        ),
      }));
      return;
    }

    setRestoreErrors((prev) => {
      const copy = { ...prev };
      delete copy[`${table}-${item.id}`];
      return copy;
    });

    if (table === "apiaries") {
      try {
        const { data: row } = await supabase
          .from("apiaries")
          .select("*")
          .eq("id", item.id)
          .single();

        if (row?.is_default && row?.user_id) {
          await enforceSingleDefaultOnRestore(row.id, row.user_id);
        }
      } catch {
        // Non-blocking: the database lifecycle restore has already succeeded.
      }
    }

    fetchData();
  };

  const deleteItem = async (table, item) => {
    let warning;

    try {
      if (table === "apiaries") {
        warning = await apiaryDeleteWarning(item);
      } else if (table === "inspections") {
        warning = await inspectionDeleteWarning(item);
      } else if (table === "hives") {
        warning =
          "Permanently delete this hive? Its hive-specific Queen history will also be deleted. A Queen transferred to another hive will be preserved. This cannot be undone.";
      } else {
        warning =
          "Are you sure you want to permanently delete this item? This cannot be undone.";
      }
    } catch (error) {
      alert(humaniseSupabaseError(error, { table }));
      return;
    }

    if (!window.confirm(warning)) return;

    const result = ["apiaries", "hives", "inspections", "logbook"].includes(
      table
    )
      ? await serverDeleteRowWithPhotos({
          table,
          id: item.id,
          mode: "delete_row",
        })
      : await supabase.from(table).delete().eq("id", item.id);

    if (result.error) {
      alert(humaniseSupabaseError(result.error, { table }));
      return;
    }

    fetchData();
  };

  // ----- bulk actions -----
  const restoreSelectedItems = async () => {
    const newErrors = {};

    const restoreOrder = {
      apiaries: 1,
      hives: 2,
      inspections: 3,
      todos: 4,
      logbook: 4,
    };

    const orderedItems = [...selectedItems].sort(
      (left, right) =>
        (restoreOrder[left.table] || 99) -
        (restoreOrder[right.table] || 99)
    );

    for (const { table, item } of orderedItems) {
      if (!allData[table]) continue;

      const result = await restoreArchivedItem(table, item.id);

      if (result.error) {
        // A parent restoration may already have restored this selected child.
        // Confirm its current state before treating that as an error.
        if (await rowIsAlreadyActive(table, item.id)) continue;

        newErrors[`${table}-${item.id}`] = friendlyRestoreError(
          table,
          result.error.message
        );
        continue;
      }

      if (table === "apiaries") {
        try {
          const { data: row } = await supabase
            .from("apiaries")
            .select("*")
            .eq("id", item.id)
            .single();

          if (row?.is_default && row?.user_id) {
            await enforceSingleDefaultOnRestore(row.id, row.user_id);
          }
        } catch {
          // Non-blocking: the database lifecycle restore has already succeeded.
        }
      }
    }

    setRestoreErrors((prev) => ({ ...prev, ...newErrors }));
    setSelectedItems([]);
    fetchData();
  };

  const deleteSelectedItems = async () => {
    const selectedApiaryCount = selectedItems.filter(
      ({ table }) => table === "apiaries"
    ).length;
    const selectedInspectionCount = selectedItems.filter(
      ({ table }) => table === "inspections"
    ).length;

    const warnings = [
      "Permanently delete all selected items?",
      "",
      selectedApiaryCount
        ? `${selectedApiaryCount} selected apiary${selectedApiaryCount === 1 ? "" : "ies"} will be deleted with all contained hives, inspections, tasks, logbook entries and hive-specific Queen history.`
        : null,
      selectedInspectionCount
        ? `${selectedInspectionCount} selected inspection${selectedInspectionCount === 1 ? "" : "s"} will be deleted with all linked tasks and logbook entries.`
        : null,
      "Queens transferred outside a deleted hive or apiary will be preserved.",
      "",
      "This cannot be undone.",
    ]
      .filter(Boolean)
      .join("\n");

    if (!window.confirm(warnings)) return;

    const deleteOrder = {
      logbook: 1,
      todos: 2,
      inspections: 3,
      hives: 4,
      apiaries: 5,
    };

    const orderedItems = [...selectedItems].sort(
      (left, right) =>
        (deleteOrder[left.table] || 99) -
        (deleteOrder[right.table] || 99)
    );

    for (const { table, item } of orderedItems) {
      if (!allData[table]) continue;

      const result = ["apiaries", "hives", "inspections", "logbook"].includes(
        table
      )
        ? await serverDeleteRowWithPhotos({
            table,
            id: item.id,
            mode: "delete_row",
          })
        : await supabase.from(table).delete().eq("id", item.id);

      if (result.error) {
        const alreadyDeleted =
          result.error?.status === 404 ||
          /row not found|not found/i.test(result.error?.message || "");

        if (!alreadyDeleted) {
          alert(humaniseSupabaseError(result.error, { table }));
        }
      }
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
                  <span key={i} className="inline-block">
                    {m}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {x.archived_at && (
                  <>
                    Archived: {new Date(x.archived_at).toLocaleDateString()} ·{" "}
                  </>
                )}
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
              className={`text-sm ${
                !pre.ok ? "text-blue-400 cursor-not-allowed opacity-60" : "text-blue-600 hover:underline"
              }`}
            >
              Restore
            </button>
            <button onClick={() => deleteItem(x.table, x.raw)} className="text-red-600 hover:underline text-sm">
              Delete
            </button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Archived Items</h2>

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

      {/* Bulk actions */}
      {total > 0 && (
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-gray-600 whitespace-nowrap min-h-[1.25rem]">
            {selectedItems.length > 0 ? `${selectedItems.length} selected` : "\u00A0"}
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              onClick={restoreSelectedItems}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={selectedItems.length === 0}
            >
              Restore Selected
            </button>
            <button
              onClick={deleteSelectedItems}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {total === 0 ? 0 : Math.min(startIdx + 1, total)}–{Math.min(currentPage * PAGE_SIZE, total)} of{" "}
              {total}
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              {totalPages > 1 && (
                <span className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
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
