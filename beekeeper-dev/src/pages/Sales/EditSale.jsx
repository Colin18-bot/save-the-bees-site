import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";

const TYPES = ["Honey","Candle","Food","Propolis","Balm","Tincture","Wax","Other"];

function emptyLine() {
  return {
    product_name: "",
    product_type: "Honey",
    unit: "jar",
    qty: 1,
    unit_price: 0,
    discount: 0,
    cogs_per_unit_cached: 0
  };
}

const money = (n, ccy) => {
  const num = Number(n || 0);
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy }).format(num); }
  catch { return `${ccy} ${num.toFixed(2)}`; }
};

export default function EditSale() {
  const { id } = useParams(); // sales_orders.id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [soldAt, setSoldAt] = useState("");
  const [customer, setCustomer] = useState("");
  const [channel, setChannel] = useState("Direct");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([emptyLine()]);

  const currency = (localStorage.getItem("prefs.currency") || "GBP").toUpperCase();

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (!uid) throw new Error("Not signed in.");

        const [{ data: order, error: oErr }, { data: lineRows, error: lErr }] = await Promise.all([
          supabase.from("sales_orders")
            .select("id, customer_name, channel, invoice_number, sold_at, notes")
            .eq("id", id).eq("user_id", uid).single(),
          supabase.from("sales_lines")
            .select("id, product_name, product_type, unit, qty, unit_price, discount, cogs_per_unit_cached")
            .eq("order_id", id).eq("user_id", uid).order("id")
        ]);
        if (oErr) throw oErr;
        if (lErr) throw lErr;

        setSoldAt(order.sold_at ? new Date(order.sold_at).toISOString().slice(0,16) : "");
        setCustomer(order.customer_name || "");
        setChannel(order.channel || "Direct");
        setInvoiceNumber(order.invoice_number || "");
        setNotes(order.notes || "");
        setLines((lineRows && lineRows.length ? lineRows : [emptyLine()]).map(l => ({
          product_name: l.product_name || "",
          product_type: l.product_type || "Honey",
          unit: l.unit || "unit",
          qty: Number(l.qty || 0),
          unit_price: Number(l.unit_price || 0),
          discount: Number(l.discount || 0),
          cogs_per_unit_cached: Number(l.cogs_per_unit_cached || 0),
        })));
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (i) => setLines(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i, key, val) =>
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, l) => {
        const qty = Number(l.qty || 0);
        const price = Number(l.unit_price || 0);
        const disc = Number(l.discount || 0);
        const cogs = Number(l.cogs_per_unit_cached || 0);
        const gross = qty * price - disc;
        const cost  = qty * cogs;
        const profit = gross - cost;
        return {
          items: acc.items + qty,
          gross: acc.gross + (gross || 0),
          cost:  acc.cost  + (cost  || 0),
          profit: acc.profit + (profit || 0),
        };
      },
      { items: 0, gross: 0, cost: 0, profit: 0 }
    );
  }, [lines]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not signed in.");

      // Update order header
      const orderUpdate = {
        customer_name: customer || null,
        channel: channel || null,
        invoice_number: invoiceNumber || null,
        sold_at: soldAt ? new Date(soldAt).toISOString() : new Date().toISOString(),
        notes: notes || null,
      };
      const { error: oErr } = await supabase
        .from("sales_orders")
        .update(orderUpdate)
        .eq("id", id)
        .eq("user_id", uid);
      if (oErr) throw oErr;

      // Replace lines: delete then insert clean set
      const { error: delErr } = await supabase
        .from("sales_lines")
        .delete()
        .eq("order_id", id)
        .eq("user_id", uid);
      if (delErr) throw delErr;

      const normalised = lines
        .map(l => {
          const unit = (l.unit || "unit").trim();
          const type = l.product_type || "Item";
          const name = (l.product_name || "").trim() || `${type}${unit ? ` (${unit})` : ""}`;
          return {
            product_name: name,
            product_type: type,
            unit,
            qty: Number(l.qty || 0),
            unit_price: Number(l.unit_price || 0),
            discount: Number(l.discount || 0),
            cogs_per_unit_cached: Number(l.cogs_per_unit_cached || 0),
          };
        })
        .filter(l => l.qty > 0);

      if (normalised.length) {
        const rows = normalised.map(l => ({
          user_id: uid,
          order_id: id,
          ...l,
        }));
        const { error: insErr } = await supabase.from("sales_lines").insert(rows);
        if (insErr) throw insErr;
      }

      navigate("/reports/pnl"); // back to P&L
    } catch (e2) {
      setErr(e2.message || String(e2));
    } finally {
      setSaving(false);
    }
  };

  const onDeleteOrder = async () => {
    if (!confirm("Delete this sale and all its line items?")) return;
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not signed in.");
      // delete lines first (FK may cascade, but be explicit)
      await supabase.from("sales_lines").delete().eq("order_id", id).eq("user_id", uid);
      await supabase.from("sales_orders").delete().eq("id", id).eq("user_id", uid);
      navigate("/sales");
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Sale</h1>
      {err && <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-3 rounded">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Date / time</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={soldAt}
              onChange={(e)=>setSoldAt(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Invoice #</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={invoiceNumber}
              onChange={(e)=>setInvoiceNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Customer</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={customer}
              onChange={(e)=>setCustomer(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Channel</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={channel}
              onChange={(e)=>setChannel(e.target.value)}
              placeholder="Direct, Market, Online…"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Line items</label>
          <div className="space-y-3">
            {lines.map((l, i) => {
              const qty = Number(l.qty || 0);
              const price = Number(l.unit_price || 0);
              const disc = Number(l.discount || 0);
              const cogs = Number(l.cogs_per_unit_cached || 0);
              const gross = qty * price - disc;
              const cost  = qty * cogs;
              const profit = gross - cost;

              return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-3 rounded">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium">Product</label>
                    <input
                      className="w-full border rounded px-2 py-2"
                      value={l.product_name}
                      onChange={(e)=>updateLine(i,"product_name",e.target.value)}
                      placeholder="Optional — will default to Type (Unit)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium">Type</label>
                    <select
                      className="w-full border rounded px-2 py-2"
                      value={l.product_type}
                      onChange={(e)=>updateLine(i,"product_type",e.target.value)}
                    >
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium">Unit</label>
                    <input
                      className="w-full border rounded px-2 py-2"
                      value={l.unit}
                      onChange={(e)=>updateLine(i,"unit",e.target.value)}
                      placeholder="jar, bar, kg…"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium">Qty</label>
                    <input
                      type="number" step="1" min="0"
                      className="w-full border rounded px-2 py-2"
                      value={l.qty}
                      onChange={(e)=>updateLine(i,"qty",e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium">Unit price</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full border rounded px-2 py-2"
                      value={l.unit_price}
                      onChange={(e)=>updateLine(i,"unit_price",e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium">Discount</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full border rounded px-2 py-2"
                      value={l.discount}
                      onChange={(e)=>updateLine(i,"discount",e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium" title="What it costs you to produce/buy one unit.">
                      Your cost per unit (COGS)
                    </label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full border rounded px-2 py-2"
                      value={l.cogs_per_unit_cached}
                      onChange={(e)=>updateLine(i,"cogs_per_unit_cached",e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-12 text-xs text-gray-700 border-t pt-2 flex flex-wrap gap-4">
                    <span>Gross: <b>{money(gross, currency)}</b></span>
                    <span>Cost: <b>{money(cost, currency)}</b></span>
                    <span>Est. Profit: <b>{money(profit, currency)}</b></span>
                    <button type="button" onClick={()=>removeLine(i)} className="ml-auto text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
            <button type="button" onClick={addLine} className="px-3 py-1 border rounded hover:bg-gray-50">
              + Add line
            </button>
            <div className="text-right">
              <div>Items: <b>{totals.items}</b></div>
              <div>Gross: <b>{money(totals.gross, currency)}</b></div>
              <div>Est. Profit: <b>{money(totals.profit, currency)}</b></div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            className="w-full border rounded px-3 py-2" rows={3}
            value={notes} onChange={(e)=>setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="rounded-2xl px-4 py-2 border bg-black text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={onDeleteOrder}
            className="rounded-2xl px-4 py-2 border bg-black text-white"
          >
            Delete Sale
          </button>

          <button
            type="button"
            onClick={() => navigate("/sales")}
            className="rounded-2xl px-4 py-2 border bg-white text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
