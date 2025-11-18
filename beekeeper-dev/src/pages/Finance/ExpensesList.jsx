// src/pages/Finance/ExpensesList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

const money = (n, ccy = "GBP") => {
  if (n == null || n === "") return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy }).format(Number(n));
  } catch {
    return `${ccy} ${Number(n).toFixed(2)}`;
  }
};

const fmtDateUK = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

export default function ExpensesList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (!uid) throw new Error("Not signed in.");

        const { data, error } = await supabase
          .from("expenses")
          .select("id, category, amount, currency, vendor, invoice_number, occurred_at")
          .eq("user_id", uid)
          .order("occurred_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        if (!live) return;
        setRows(data || []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading expenses…</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold">Expenses</h1>
        <Link to="/finance/expenses/new" className="rounded-2xl px-4 py-2 border bg-black text-white">
          New Expense
        </Link>
      </div>

      {err && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border p-6 text-gray-600">No expenses yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Vendor</th>
                <th className="py-2 pr-4">Invoice #</th>
                <th className="py-2 pr-4 text-right">Amount</th>
                <th className="py-2 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-4">{fmtDateUK(r.occurred_at)}</td>
                  <td className="py-2 pr-4">{r.category || "—"}</td>
                  <td className="py-2 pr-4">{r.vendor || "—"}</td>
                  <td className="py-2 pr-4">{r.invoice_number || "—"}</td>
                  <td className="py-2 pr-4 text-right">{money(r.amount, r.currency)}</td>
                  <td className="py-2 pr-2 text-right">
                    <Link
                      to={`/finance/expenses/${r.id}/edit`}
                      className="inline-flex items-center justify-center h-9 px-3 rounded border hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
