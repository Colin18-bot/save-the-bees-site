// src/pages/Todos/TodoList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../services/supabase";
import { Link, useLocation, useNavigate } from "react-router-dom";

const PAGE_SIZE = 3; // 3 cards per page

// DB truth: 'pending' | 'completed'
const isDone = (status) => String(status || "").toLowerCase() === "completed";
const prettyStatus = (status) =>
  isDone(status) ? "Completed" : "Pending";

const badgeClass = (status) =>
  isDone(status)
    ? "bg-green-100 text-green-800 border border-green-200"
    : "bg-yellow-100 text-yellow-800 border border-yellow-200";

const TodoList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read URL params (highlight + type + apiary_id)
  const { highlightId, highlightType, apiaryFromUrl } = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return {
      highlightId: params.get("highlight") || null,
      highlightType: params.get("type") || null, // expect "TODO"
      apiaryFromUrl: params.get("apiary_id") || "",
    };
  }, [location.search]);

  // Prevent infinite loops when auto-jumping to the page with the highlight
  const jumpedRef = useRef(false);

  const [todos, setTodos] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [selectedApiary, setSelectedApiary] = useState(apiaryFromUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("list"); // "grid" or "list"

  // Keep selectedApiary in sync if URL changes elsewhere
  useEffect(() => {
    setSelectedApiary(apiaryFromUrl);
    jumpedRef.current = false;
  }, [apiaryFromUrl]);

  // Push current filter back to URL, preserving highlight/type
  useEffect(() => {
    const incoming = new URLSearchParams(location.search || "");
    const params = new URLSearchParams();
    if (selectedApiary) params.set("apiary_id", selectedApiary);
    if (incoming.get("highlight")) params.set("highlight", incoming.get("highlight"));
    if (incoming.get("type")) params.set("type", incoming.get("type"));
    const next = params.toString();
    const curr = (location.search || "").replace(/^\?/, "");
    if (next !== curr) navigate({ search: next }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApiary]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    // ACTIVE todos (+ optional apiary filter)
    let todoQuery = supabase
      .from("todos")
      .select(
        "id, title, due_date, apiary_id, hive_id, hive_name, status, notes, completed_at, archived_at"
      )
      .is("archived_at", null)
      .order("due_date", { ascending: true });

    if (selectedApiary) {
      todoQuery = todoQuery.eq("apiary_id", selectedApiary);
    }

    const [{ data: todoData, error: todoErr }, { data: apiaryData, error: apiaryErr }] =
      await Promise.all([
        todoQuery,
        supabase
          .from("apiaries")
          .select("id, name")
          .is("archived_at", null)
          .order("name", { ascending: true }),
      ]);

    if (todoErr) setError(todoErr.message || "Failed to load todos");
    if (apiaryErr) setError((prev) => prev || apiaryErr.message || "Failed to load apiaries");

    setTodos(todoData || []);
    setApiaries(apiaryData || []);
    setLoading(false);
    setPage(1);
    jumpedRef.current = false; // reset highlight jump when dataset changes
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApiary]);

  const apiaryNameById = useMemo(() => {
    const map = new Map();
    for (const a of apiaries) map.set(a.id, a.name);
    return map;
  }, [apiaries]);

  const filteredTodos = selectedApiary
    ? todos.filter((t) => t.apiary_id === selectedApiary)
    : todos;

  // Auto-jump to page containing highlighted TODO (once)
  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "TODO")) return;
    if (jumpedRef.current) return;
    if (!filteredTodos.length) return;

    const idx = filteredTodos.findIndex((t) => String(t.id) === String(highlightId));
    if (idx >= 0) {
      const targetPage = Math.floor(idx / PAGE_SIZE) + 1;
      if (targetPage !== page) setPage(targetPage);
      jumpedRef.current = true;
    }
  }, [filteredTodos, highlightId, highlightType, page]);

  const total = filteredTodos.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageTodos = filteredTodos.slice(startIdx, endIdx);

  // After page renders, if a task is highlighted, scroll it into view.
  useEffect(() => {
    if (!highlightId || (highlightType && highlightType !== "TODO")) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`todo-${highlightId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
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

  /**
   * Mark as complete with robust fallbacks:
   * 1) Try update + returning row (needs SELECT policy to return).
   * 2) If returning not allowed, retry update without .select() and then refetch.
   * 3) If RLS blocks update entirely, surface full error details.
   * NOTE: Table constraint requires lowercase 'completed'. Trigger sets completed_at automatically.
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
      // Attempt 1: update + return the row
      const { data, error } = await supabase
        .from("todos")
        .update({ status: "completed" }) // <-- lowercase to satisfy todos_status_chk
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

        // Attempt 2: retry without returning rows, then refetch
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

      // Success with returned row — sync local state precisely
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

  {/* Controls wrapper – now always below the heading */}
  <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
    {/* Filter by Apiary – responsive like LogEntryList */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap sm:mr-2 mb-1 sm:mb-0">
        Filter by Apiary:
      </label>
      <select
        value={selectedApiary}
        onChange={(e) => {
          setSelectedApiary(e.target.value);
          setPage(1);
        }}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-full sm:w-auto"
      >
        <option value="">All Apiaries</option>
        {apiaries.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>

    {/* View toggle */}
    <div className="flex border border-gray-300 rounded overflow-hidden self-start sm:self-auto">
      <button
        type="button"
        onClick={() => setView("list")}
        className={`px-3 py-1 text-sm ${
          view === "list" ? "bg-green-700 text-white" : "bg-white"
        }`}
      >
        List
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        className={`px-3 py-1 text-sm ${
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
      {filteredTodos.length === 0 ? (
        <div className="space-y-2">
          <p>
            No task items found.{" "}
            <Link
              to="/todos/new"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Add one now
            </Link>
          </p>
        </div>
      ) : view === "grid" ? (
        <>
          {/* GRID VIEW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pageTodos.map((todo) => {
              const apiaryName = todo.apiary_id
                ? apiaryNameById.get(todo.apiary_id)
                : null;
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
                    <span
                      className={`text-xs px-2 py-1 rounded ${badgeClass(todo.status)}`}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-gray-600">Due:</span>{" "}
                      {formatUKDate(todo.due_date)}
                      {overdue && (
                        <span className="ml-2 text-red-600">Overdue</span>
                      )}
                    </p>
                    <p className="text-gray-600">
                      {apiaryName && (
                        <span className="mr-2">Apiary: {apiaryName}</span>
                      )}
                      {hiveLabel && <span>Hive: {hiveLabel}</span>}
                    </p>
                    {todo.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        {todo.notes}
                      </p>
                    )}
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
                    {/* Calendar link */}
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

          {/* Pagination – unified style */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {total === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, total)}–
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
              const apiaryName = todo.apiary_id
                ? apiaryNameById.get(todo.apiary_id)
                : "";
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
                        <span className="mr-2">
                          Due: {formatUKDate(todo.due_date)}
                        </span>
                        {overdue && (
                          <span className="mr-2 text-red-600">Overdue</span>
                        )}
                        {apiaryName && (
                          <span className="mr-2">Apiary: {apiaryName}</span>
                        )}
                        {hiveLabel && <span>Hive: {hiveLabel}</span>}
                      </p>
                      {todo.notes && (
                        <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                          {todo.notes}
                        </p>
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

          {/* Pagination – unified style */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              Showing {total === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, total)}–
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
