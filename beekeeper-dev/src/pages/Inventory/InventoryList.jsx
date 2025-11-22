import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import useCurrencyPreference from "../../hooks/useCurrencyPreference";

const money = (n, ccy = "GBP") => {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy }).format(num);
  } catch {
    // Fallback if code is unknown to Intl
    return `${ccy} ${num.toFixed(2)}`;
  }
};

export default function InventoryList() {
  const prefCurrency = useCurrencyPreference();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated.");

        const { data, error } = await supabase
          .from("inventory_items")
          .select("id,name,category,unit,quantity,purchase_price,currency,sku")
          .eq("user_id", user.id)
          .order("name", { ascending: true });

        if (error) throw error;
        if (!active) return;

        setRows(data || []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => {
      return (
        (r.name || "").toLowerCase().includes(query) ||
        (r.category || "").toLowerCase().includes(query) ||
        (r.sku || "").toLowerCase().includes(query)
      );
    });
  }, [q, rows]);

  if (loading) return <div className="p-6">Loading inventory…</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link
  to="/inventory/new"
  className="inline-flex items-center justify-center rounded-2xl border bg-black text-white px-3 py-1.5 text-sm self-start sm:self-auto"
>
  New Inventory Item
</Link>

      </div>

      {err && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {err}
        </div>
      )}

      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, category, or SKU…"
          className="w-full md:w-96 border rounded px-3 py-2"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-600">No inventory items found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm bg-white border rounded">
            <thead>
              <tr className="border-b">
                <TH>Name</TH>
                <TH>Category</TH>
                <TH>SKU</TH>
                <TH className="text-right">Qty</TH>
                <TH className="text-right">Unit</TH>
                <TH className="text-right">Purchase Price</TH>
                <TH className="text-right">Total</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const qty = Number(r.quantity || 0);
                const unitPrice = Number(r.purchase_price || 0);
                const rowCurrency = (r.currency || prefCurrency || "GBP").toUpperCase();
                const total = qty * unitPrice;

                return (
                  <tr key={r.id} className="border-b">
                    <TD>{r.name}</TD>
                    <TD>{r.category || "—"}</TD>
                    <TD>{r.sku || "—"}</TD>
                    <TD className="text-right">{qty}</TD>
                    <TD className="text-right">{r.unit || "unit"}</TD>
                    <TD className="text-right">{money(unitPrice, rowCurrency)}</TD>
                    <TD className="text-right font-medium">{money(total, rowCurrency)}</TD>
                    <TD className="text-right">
                      <Link
                        to={`/inventory/${r.id}/edit`}
                        className="inline-flex items-center justify-center h-9 px-3 rounded border hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TH({ children, className = "" }) {
  return <th className={`py-2 px-3 text-left ${className}`}>{children}</th>;
}
function TD({ children, className = "" }) {
  return <td className={`py-2 px-3 align-top ${className}`}>{children}</td>;
}
