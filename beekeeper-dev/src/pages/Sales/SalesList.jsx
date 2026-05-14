import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

const money = (n, ccy = "GBP") => {
  const num = Number(n || 0);
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy }).format(num); }
  catch { return `${ccy} ${num.toFixed(2)}`; }
};
const fmtDateUK = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

export default function SalesList() {
  const [rows, setRows] = useState([]);       // [{ id, sold_at, customer_name, channel, invoice_number, items, revenue, cogs, profit }]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const currency = (localStorage.getItem("prefs.currency") || "GBP").toUpperCase();

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (!uid) throw new Error("Not signed in.");

        // 1) Orders
        const { data: orders, error: oErr } = await supabase
          .from("sales_orders")
          .select("id, sold_at, customer_name, channel, invoice_number")
          .eq("user_id", uid)
          .order("sold_at", { ascending: false })
          .limit(500);
        if (oErr) throw oErr;

        if (!orders?.length) {
          if (live) setRows([]);
          return;
        }

        // 2) Lines in batches and aggregate
        const ids = orders.map(o => o.id);
        const batches = [];
        for (let i = 0; i < ids.length; i += 500) batches.push(ids.slice(i, i + 500));

        const results = await Promise.all(
          batches.map(batch =>
            supabase
              .from("sales_lines")
              .select("order_id, qty, unit_price, discount, cogs_per_unit_cached")
              .in("order_id", batch)
          )
        );

        const lines = results.flatMap(r => r.data || []);

        const agg = new Map();
        for (const l of lines) {
          const qty   = Number(l.qty || 0);
          const price = Number(l.unit_price || 0);
          const disc  = Number(l.discount || 0);
          const cogsU = Number(l.cogs_per_unit_cached || 0);

          const revenue = qty * price - disc;
          const cogs    = qty * cogsU;
          const profit  = revenue - cogs;

          const a = agg.get(l.order_id) || { items: 0, revenue: 0, cogs: 0, profit: 0 };
          a.items   += qty;
          a.revenue += revenue;
          a.cogs    += cogs;
          a.profit  += profit;
          agg.set(l.order_id, a);
        }

        const list = orders.map(o => {
          const a = agg.get(o.id) || { items: 0, revenue: 0, cogs: 0, profit: 0 };
          return {
            id: o.id,
            sold_at: o.sold_at,
            customer_name: o.customer_name,
            channel: o.channel,
            invoice_number: o.invoice_number,
            ...a,
          };
        });

        if (live) setRows(list);
      } catch (e) {
        if (live) setErr(e.message || String(e));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const totals = useMemo(() => {
    return rows.reduce((a, r) => ({
      items:   a.items   + (Number(r.items)   || 0),
      revenue: a.revenue + (Number(r.revenue) || 0),
      cogs:    a.cogs    + (Number(r.cogs)    || 0),
      profit:  a.profit  + (Number(r.profit)  || 0),
    }), { items: 0, revenue: 0, cogs: 0, profit: 0 });
  }, [rows]);

  if (loading) return <div className="p-6">Loading sales…</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">Sales</h2>
        <Link to="/sales/new" className="rounded-2xl px-4 py-2 border bg-black text-white">
          New Sale
        </Link>
      </div>

      {err && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border p-6 text-gray-600">No sales yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <Summary label="Items" value={totals.items} />
            <Summary label="Revenue" value={money(totals.revenue, currency)} />
            <Summary label="COGS" value={money(totals.cogs, currency)} />
            <Summary label="Profit" value={money(totals.profit, currency)} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Invoice #</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Channel</th>
                  <th className="py-2 pr-4 text-right">Items</th>
                  <th className="py-2 pr-4 text-right">Revenue</th>
                  <th className="py-2 pr-4 text-right">COGS</th>
                  <th className="py-2 pr-4 text-right">Profit</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{fmtDateUK(r.sold_at)}</td>
                    <td className="py-2 pr-4">{r.invoice_number || "—"}</td>
                    <td className="py-2 pr-4">{r.customer_name || "—"}</td>
                    <td className="py-2 pr-4">{r.channel || "—"}</td>
                    <td className="py-2 pr-4 text-right">{r.items || 0}</td>
                    <td className="py-2 pr-4 text-right">{money(r.revenue, currency)}</td>
                    <td className="py-2 pr-4 text-right">{money(r.cogs, currency)}</td>
                    <td className="py-2 pr-4 text-right">{money(r.profit, currency)}</td>
                    <td className="py-2 pr-2">
                      <Link
                        to={`/sales/${r.id}/edit`}
                        className="inline-flex items-center justify-center h-9 px-3 rounded border hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="py-2 pr-4" colSpan={4}>Totals</td>
                  <td className="py-2 pr-4 text-right">{totals.items}</td>
                  <td className="py-2 pr-4 text-right">{money(totals.revenue, currency)}</td>
                  <td className="py-2 pr-4 text-right">{money(totals.cogs, currency)}</td>
                  <td className="py-2 pr-4 text-right">{money(totals.profit, currency)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
