// src/pages/Todos/TodoList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../services/supabase";
import { Link, useLocation, useNavigate } from "react-router-dom";

const PAGE_SIZE = 9;

// DB truth: 'pending' | 'completed'
const isDone = (status) => String(status || "").toLowerCase() === "completed";
const prettyStatus = (status) => (isDone(status) ? "Completed" : "Pending");

const badgeClass = (status) =>
  isDone(status)
    ? "bg-green-100 text-green-800 border border-green-200"
    : "bg-yellow-100 text-yellow-800 border border-yellow-200";

const TodoList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read URL params (highlight + type + apiary/hive + from/to)
  const {
    highlightId,
    highlightType,
    apiaryFromUrl,
    hiveFromUrl,
    fromFromUrl,
    toFromUrl,
  } = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return {
      highlightId: params.get("highlight") || null,
      highlightType: (params.get("type") || "").toUpperCase() || null, // ✅ normalize: "TODO"
      apiaryFromUrl: params.get("apiary_id") || "",
      hiveFromUrl: params.get("hive_id") || "",
      fromFromUrl: params.get("from") || "",
      toFromUrl: params.get("to") || "",
    };
  }, [location.search]);

  // Prevent infinite loops when auto-jumping to the page with the highlight
  const jumpedRef = useRef(false);

  // Track filter signature so we only reset pagination when REAL filters change
  const filterSigRef = useRef("");

  // Track whether we've already scrolled to the highlighted card for this page/load
  const hasScrolledRef = useRef(false);

  const [todos, setTodos] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);

  const [selectedApiary, setSelectedApiary] = useState(apiaryFromUrl);
  const [selectedHive, setSelectedHive] = useState(hiveFromUrl);

  // date range filters (YYYY-MM-DD)
  const [dateFrom, setDateFrom] = useState(fromFromUrl);
  const [dateTo, setDateTo] = useState(toFromUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("list"); // "grid" or "list"

  // ✅ Sync filters from URL, but ONLY reset page when filters actually change
  // (so adding highlight/type won't kick you back to page 1)
  useEffect(() => {
    const nextSig = `${apiaryFromUrl || ""}|${hiveFromUrl || ""}|${fromFromUrl || ""}|${
      toFromUrl || ""
    }`;

    setSelectedApiary(apiaryFromUrl);
    setSelectedHive(hiveFromUrl);
    setDateFrom(fromFromUrl);
    setDateTo(toFromUrl);

    if (filterSigRef.current !== nextSig) {
      filterSigRef.current = nextSig;
      setPage(1);
      jumpedRef.current = false;
      hasScrolledRef.current = false;
    }
    // If only highlight/type changed, do NOT reset page/refs
  }, [apiaryFromUrl, hiveFromUrl, fromFromUrl, toFromUrl]);

  // Push current filters back to URL, preserving highlight/type
  useEffect(() => {
    const incoming = new URLSearchParams(location.search || "");
    const params = new URLSearchParams();

    if (selectedApiary) params.set("apiary_id", selectedApiary);
    if (selectedHive) params.set("hive_id", selectedHive);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    // Preserve context params exactly as they arrived
    if (incoming.get("highlight")) params.set("highlight", incoming.get("highlight"));
    if (incoming.get("type")) params.set("type", incoming.get("type"));

    const next = params.toString();
    const curr = (location.search || "").replace(/^\?/, "");
    if (next !== curr) navigate({ search: next }, { replace: true });
  }, [selectedApiary, selectedHive, dateFrom, dateTo, location.search, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    // ACTIVE todos (+ optional apiary/hive/date filters)
    let todoQuery = supabase
      .from("todos")
      .select(
        "id, title, due_date, apiary_id, hive_id, hive_name, status, notes, completed_at, archived_at"
      )
      .is("archived_at", null)
      .order("due_date", { ascending: true });

    if (selectedApiary) todoQuery = todoQuery.eq("apiary_id", selectedApiary);
    if (selectedHive) todoQuery = todoQuery.eq("hive_id", selectedHive);

    // Date range filters (todos.due_date is DATE)
    if (dateFrom) todoQuery = todoQuery.gte("due_date", dateFrom);
    if (dateTo) todoQuery = todoQuery.lte("due_date", dateTo);

    const [
      { data: todoData, error: todoErr },
      { data: apiaryData, error: apiaryErr },
      { data: hiveData, error: hiveErr },
    ] = await Promise.all([
      todoQuery,
      supabase
        .from("apiaries")
        .select("id, name")
        .is("archived_at", null)
        .order("name", { ascending: true }),
      supabase
        .from("hives")
        .select("id, name, apiary_id")
        .is("archived_at", null)
        .order("name", { ascending: true }),
    ]);

    if (todoErr) setError(todoErr.message || "Failed to load todos");
    if (apiaryErr)
      setError((prev) => prev || apiaryErr.message || "Failed to load apiaries");
    if (hiveErr)
      setError((prev) => prev || hiveErr.message || "Failed to load hives");

    setTodos(todoData || []);
    setApiaries(apiaryData || []);
    setHives(hiveData || []);

    setLoading(false);

    // Dataset changed; allow highlight/page/scroll to run again
    jumpedRef.current = false;
    hasScrolledRef.current = false;
    setPage(1);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApiary, selectedHive, dateFrom, dateTo]);

  const apiaryNameById = useMemo(() => {
    const map = new Map();
    for (const a of apiaries) map.set(a.id, a.name);
    return map;
  }, [apiaries]);

  // Hive dropdown options: if apiary chosen, only show those hives
  const hivesForSelectedApiary = useMemo(() => {
    if (!selectedApiary) return hives;
    return hives.filter((h) => String(h.apiary_id) === String(selectedApiary));
  }, [hives, selectedApiary]);

  // If apiary changes, clear hive if it no longer belongs
  useEffect(() => {
    if (!selectedHive) return;
    if (!selectedApiary) return;
    const hv = hives.find((h) => String(h.id) === String(selectedHive));
    if (hv && String(hv.apiary_id) !== String(selectedApiary)) {
      setSelectedHive("");
      jumpedRef.current = false;
      hasScrolledRef.current = false;
      setPage(1);
    }
  }, [selectedApiary, selectedHive, hives]);

  // Auto-jump to page containing highlighted TODO (once per dataset/filter set)
  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "TODO")) return;
    if (jumpedRef.current) return;
    if (!todos.length) return;

    const idx = todos.findIndex((t) => String(t.id) === String(highlightId));
    if (idx >= 0) {
      const targetPage = Math.floor(idx / PAGE_SIZE) + 1;
      if (targetPage !== page) {
        setPage(targetPage);
        hasScrolledRef.current = false; // allow scroll after page switches
      }
      jumpedRef.current = true;
    }
  }, [todos, highlightId, highlightType, page]);

  const total = todos.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageTodos = todos.slice(startIdx, endIdx);

  // After page renders, if a task is highlighted, scroll it into view (once)
  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "TODO")) return;
    if (hasScrolledRef.current) return;

    const t = setTimeout(() => {
      const el = document.getElementById(`todo-${highlightId}`);
      if (el) {
        hasScrolledRef.current = true;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-amber-400", "bg-amber-50");
        setTimeout(() => el.classList.remove("ring-2", "ring-amber-400"), 1600);
      }
    }, 80);

    return () => clearTimeout(t);
  }, [pageTodos, highlightId, highlightType]);

  const isOverdueDate = (d, status) => {
    if (!d || isDone(status)) return false;
    const today = new Date();
    const due = new Date(d);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // UK format with hyphens: DD-MM-YYYY
  const formatUKDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
    jumpedRef.current = false;
    hasScrolledRef.current = false;
  };

  const clearHive = () => {
    setSelectedHive("");
    setPage(1);
    jumpedRef.current = false;
    hasScrolledRef.current = false;
  };

  /**
   * Mark as complete with robust fallbacks:
   * 1) Try update + returning row (needs SELECT policy to return).
   * 2) If returning not allowed, retry update without .select() and then refetch.
   */
  const markComplete = async (id) => {
    const showErr = (prefix, err) => {
      const parts = [prefix];
      if (err?.message) parts.push(err.message);
      if (err?.details) parts.push(err.details);
      if (err?.hint) parts.push(err.hint);
      alert(parts.join("\n"));
    };

    try {
      const { data, error } = await supabase
        .from("todos")
        .update({ status: "completed" })
        .eq("id", id)
        .select("id, status, completed_at")
        .single();

      if (error) {
        const code = error.code || "";
        const status = error.status || 0;
        const looksLikeNoReturningAllowed =
          code === "PGRST116" || status === 406 || /returning/i.test(error.message || "");

        if (!looksLikeNoReturningAllowed) {
          showErr("Could not mark this task as completed.", error);
          return;
        }

        const { error: upd2Err } = await supabase
          .from("todos")
          .update({ status: "completed" })
          .eq("id", id);

        if (upd2Err) {
          showErr("Could not mark this task as completed.", upd2Err);
          return;
        }

        await fetchAll();
        return;
      }

      if (data) {
        setTodos((prev) =>
          prev.map((t) =>
            String(t.id) === String(id)
              ? {
                  ...t,
                  status: data.status || "completed",
                  completed_at: data.completed_at || t.completed_at,
                }
              : t
          )
        );
      } else {
        await fetchAll();
      }
    } catch (e) {
      showErr("Could not mark this task as completed.", e);
    }
  };

  if (loading) return <p className="p-4">Loading Task list...</p>;

  return (
    <div className="p-6 space-y-4">
      {/* Header: heading on its own line, controls underneath */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold mb-3">Tasks</h1>

        {/* Controls wrapper – same style as InspectionList / LogEntryList */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:flex-wrap sm:items-end sm:justify-start">
          {/* Filter by Apiary */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Filter by Apiary:
            </label>
            <select
              value={selectedApiary}
              onChange={(e) => {
                setSelectedApiary(e.target.value);
                setSelectedHive("");
                setPage(1);
                jumpedRef.current = false;
                hasScrolledRef.current = false;
              }}
              className="border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-[220px]"
            >
              <option value="">All Apiaries</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Hive + Clear hive beside dropdown */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Filter by Hive:
            </label>

            <div className="flex items-center gap-2">
              <select
                value={selectedHive}
                onChange={(e) => {
                  setSelectedHive(e.target.value);
                  setPage(1);
                  jumpedRef.current = false;
                  hasScrolledRef.current = false;
                }}
                disabled={hivesForSelectedApiary.length === 0}
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-[220px]"
              >
                <option value="">
                  All Hives{selectedApiary ? " in Apiary" : ""}
                </option>
                {hivesForSelectedApiary.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              {selectedHive && (
                <button
                  type="button"
                  onClick={clearHive}
                  className="text-sm px-3 py-2 border rounded hover:bg-gray-100 whitespace-nowrap flex-shrink-0"
                >
                  Clear hive
                </button>
              )}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Date from:</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-[170px]"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                  jumpedRef.current = false;
                  hasScrolledRef.current = false;
                }}
              />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Date to:</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full sm:w-[170px]"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                  jumpedRef.current = false;
                  hasScrolledRef.current = false;
                }}
              />
            </div>

            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={clearDates}
                className="text-sm px-3 py-2 border rounded hover:bg-gray-100 w-full sm:w-auto"
              >
                Clear dates
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex border border-gray-300 rounded overflow-hidden self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-2 text-sm ${
                view === "list" ? "bg-green-700 text-white" : "bg-white"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`px-3 py-2 text-sm ${
                view === "grid" ? "bg-green-700 text-white" : "bg-white"
              }`}
            >
              Grid
            </button>
          </div>

          {/* Add new */}
          <Link
            to="/todos/new"
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded self-start sm:self-auto"
          >
            New Task
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm mb-3">
          {error}
        </div>
      )}

      {/* Empty / List & Grid */}
      {todos.length === 0 ? (
        <div className="space-y-2">
          <p>
            No task items found.{" "}
            <Link to="/todos/new" className="text-blue-600 underline hover:text-blue-800">
              Add one now
            </Link>
          </p>
        </div>
      ) : view === "grid" ? (
        <>
          {/* GRID VIEW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pageTodos.map((todo) => {
              const apiaryName = todo.apiary_id ? apiaryNameById.get(todo.apiary_id) : null;
              const hiveLabel = todo.hive_name || "";
              const overdue = isOverdueDate(todo.due_date, todo.status);

              const isHighlighted =
                highlightId &&
                String(todo.id) === String(highlightId) &&
                (!highlightType || highlightType === "TODO");

              const displayStatus = prettyStatus(todo.status);

              return (
                <div
                  key={todo.id}
                  id={`todo-${todo.id}`}
                  data-highlight={isHighlighted ? "true" : "false"}
                  className={[
                    "shadow rounded p-4",
                    isHighlighted ? "ring-2 ring-amber-400 bg-amber-50" : "bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-lg">{todo.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${badgeClass(todo.status)}`}>
                      {displayStatus}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-gray-600">Due:</span> {formatUKDate(todo.due_date)}
                      {overdue && <span className="ml-2 text-red-600">Overdue</span>}
                    </p>
                    <p className="text-gray-600">
                      {apiaryName && <span className="mr-2">Apiary: {apiaryName}</span>}
                      {hiveLabel && <span>Hive: {hiveLabel}</span>}
                    </p>
                    {todo.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{todo.notes}</p>}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/todos/${todo.id}/edit`}
                      className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
                    >
                      Edit
                    </Link>

                    {!isDone(todo.status) && (
                      <button
                        type="button"
                        onClick={() => markComplete(todo.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
                      >
                        Mark complete
                      </button>
                    )}

                    {todo.due_date && (
                      <Link
                        to={`/calendar?date=${encodeURIComponent(todo.due_date)}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-2 rounded"
                        title="View this month in Calendar"
                      >
                        📅 Calendar
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              {totalPages > 1 && (
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* LIST VIEW */}
          <div className="divide-y divide-gray-200 bg-white rounded shadow">
            {pageTodos.map((todo) => {
              const apiaryName = todo.apiary_id ? apiaryNameById.get(todo.apiary_id) : "";
              const hiveLabel = todo.hive_name || "";
              const overdue = isOverdueDate(todo.due_date, todo.status);

              const isHighlighted =
                highlightId &&
                String(todo.id) === String(highlightId) &&
                (!highlightType || highlightType === "TODO");

              const displayStatus = prettyStatus(todo.status);

              return (
                <div
                  key={todo.id}
                  id={`todo-${todo.id}`}
                  data-highlight={isHighlighted ? "true" : "false"}
                  className={[
                    "p-4",
                    isHighlighted ? "bg-amber-50 ring-2 ring-amber-400" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{todo.title}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeClass(
                            todo.status
                          )}`}
                        >
                          {displayStatus}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        <span className="mr-2">Due: {formatUKDate(todo.due_date)}</span>
                        {overdue && <span className="mr-2 text-red-600">Overdue</span>}
                        {apiaryName && <span className="mr-2">Apiary: {apiaryName}</span>}
                        {hiveLabel && <span>Hive: {hiveLabel}</span>}
                      </p>

                      {todo.notes && (
                        <p className="mt-2 text-gray-800 whitespace-pre-wrap">{todo.notes}</p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <Link
                          to={`/todos/${todo.id}/edit`}
                          className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                        >
                          Edit
                        </Link>

                        {!isDone(todo.status) && (
                          <button
                            type="button"
                            onClick={() => markComplete(todo.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                          >
                            Mark complete
                          </button>
                        )}

                        {todo.due_date && (
                          <Link
                            to={`/calendar?date=${encodeURIComponent(todo.due_date)}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            📅 Calendar
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              {totalPages > 1 && (
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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

export default TodoList;
