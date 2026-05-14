// src/pages/Finance/EditExpense.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

const CATS = [
  "Equipment","Repairs","Fuel","Lease","Land Lease","Insurance",
  "Memberships","Packaging","Marketing","Transport","Training","Misc"
];

const moneyPreview = (n, ccy="GBP") => {
  if (!n) return "";
  try { return new Intl.NumberFormat(undefined, { style:"currency", currency: ccy }).format(Number(n)); }
  catch { return `${ccy} ${Number(n).toFixed(2)}`; }
};

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);

  const [category, setCategory] = useState("Equipment");
  const [amount, setAmount] = useState("");
  const defaultCurrency = (localStorage.getItem("prefs.currency") || "GBP").toUpperCase();
  const [currency, setCurrency] = useState(defaultCurrency);
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [apiaryId, setApiaryId] = useState("");
  const [hiveId, setHiveId] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (!uid) throw new Error("Not signed in.");

        const [{ data: exp, error: eErr }, { data: apiaryRows }, { data: hiveRows }] = await Promise.all([
          supabase.from("expenses").select("*").eq("id", id).eq("user_id", uid).single(),
          supabase.from("apiaries").select("id,name").eq("user_id", uid).is("archived_at", null).order("name"),
          supabase.from("hives").select("id,name,apiary_id").eq("user_id", uid).is("archived_at", null).order("name"),
        ]);
        if (eErr) throw eErr;
        if (!live) return;

        setApiaries(apiaryRows || []);
        setHives(hiveRows || []);

        setCategory(exp.category || "Equipment");
        setAmount(exp.amount ?? "");
        setCurrency((exp.currency || defaultCurrency).toUpperCase());
        setVendor(exp.vendor || "");
        setInvoiceNumber(exp.invoice_number || "");
        setOccurredAt(exp.occurred_at ? exp.occurred_at.slice(0,10) : new Date().toISOString().slice(0,10));
        setApiaryId(exp.apiary_id || "");
        setHiveId(exp.hive_id || "");
        setNotes(exp.notes || "");
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [id, defaultCurrency]);

  const filteredHives = apiaryId ? hives.filter(h => String(h.apiary_id) === String(apiaryId)) : hives;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not signed in.");

      const row = {
        category,
        amount: amount === "" ? null : Number(amount),
        currency: (currency || defaultCurrency || "GBP").toUpperCase(),
        vendor: vendor || null,
        invoice_number: invoiceNumber || null,
        occurred_at: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
        apiary_id: apiaryId || null,
        hive_id: hiveId || null,
        notes: notes || null,
      };

      const { error } = await supabase.from("expenses")
        .update(row)
        .eq("id", id)
        .eq("user_id", uid);
      if (error) throw error;

      navigate("/finance/expenses"); // back to list
    } catch (e2) {
      setErr(e2.message || String(e2));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not signed in.");
      await supabase.from("expenses").delete().eq("id", id).eq("user_id", uid);
      navigate("/finance/expenses");
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  if (loading) return <div className="p-6">Loading expense…</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-3 text-sm">
        <Link className="underline" to="/finance/expenses">← Back to Expenses</Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">Edit Expense</h2>
      {err && <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-3 rounded">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select className="w-full border rounded px-3 py-2" value={category} onChange={e=>setCategory(e.target.value)}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Amount ({(currency || defaultCurrency).toUpperCase()})</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded px-3 py-2"
              value={amount}
              onChange={e=>setAmount(e.target.value)}
              placeholder="0.00"
            />
            {amount && (
              <p className="text-xs text-gray-600 mt-1">Preview: {moneyPreview(amount, currency)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Currency</label>
            <input
              className="w-full border rounded px-3 py-2 font-mono"
              value={currency}
              onChange={e=>setCurrency((e.target.value || "").toUpperCase().slice(0,3))}
              placeholder={defaultCurrency}
              maxLength={3}
              title="3-letter ISO code, e.g. GBP, USD, EUR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={occurredAt} onChange={e=>setOccurredAt(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium">Vendor</label>
            <input className="w-full border rounded px-3 py-2" value={vendor} onChange={e=>setVendor(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium">Invoice #</label>
            <input className="w-full border rounded px-3 py-2" value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium">Apiary (optional)</label>
            <select className="w-full border rounded px-3 py-2" value={apiaryId} onChange={e=>setApiaryId(e.target.value)}>
              <option value="">—</option>
              {apiaries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Hive (optional)</label>
            <select className="w-full border rounded px-3 py-2" value={hiveId} onChange={e=>setHiveId(e.target.value)}>
              <option value="">—</option>
              {filteredHives.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl px-4 py-2 border bg-black text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-2xl px-4 py-2 border bg-black text-white"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => navigate("/finance/expenses")}
            className="rounded-2xl px-4 py-2 border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
