// src/pages/Finance/NewExpense.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

const CATS = [
  "Equipment","Repairs","Fuel","Lease","Land Lease","Insurance",
  "Memberships","Packaging","Marketing","Transport","Training","Misc"
];

const formatMoney = (n, ccy = "GBP") => {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy }).format(num);
  } catch {
    return `${ccy} ${num.toFixed(2)}`;
  }
};

export default function NewExpense() {
  const navigate = useNavigate();
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);

  const [category, setCategory] = useState("Equipment");
  const [amount, setAmount] = useState("");

  const defaultCurrency = (localStorage.getItem("prefs.currency") || "GBP").toUpperCase();
  const [currency, setCurrency] = useState(defaultCurrency);

  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0,10));
  const [apiaryId, setApiaryId] = useState("");
  const [hiveId, setHiveId] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const onPrefsCurrency = (e) => {
      const next = (e?.detail?.currency || "GBP").toUpperCase();
      setCurrency(next);
    };
    window.addEventListener("prefs:currency", onPrefsCurrency);
    return () => window.removeEventListener("prefs:currency", onPrefsCurrency);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      const [{ data: apiaryRows }, { data: hiveRows }] = await Promise.all([
        supabase.from("apiaries").select("id,name").eq("user_id", uid).is("archived_at", null).order("name"),
        supabase.from("hives").select("id,name,apiary_id").eq("user_id", uid).is("archived_at", null).order("name"),
      ]);
      setApiaries(apiaryRows || []);
      setHives(hiveRows || []);
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not signed in.");

      const row = {
        user_id: uid,
        category,
        amount: amount ? Number(amount) : null,
        currency: (currency || defaultCurrency || "GBP").toUpperCase(),
        vendor: vendor || null,
        invoice_number: invoiceNumber || null,
        occurred_at: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
        apiary_id: apiaryId || null,
        hive_id: hiveId || null,
        notes: notes || null,
      };
      const { error } = await supabase.from("expenses").insert([row]);
      if (error) throw error;

      // redirect to Expenses List after saving
      navigate("/finance/expenses");
    } catch (e2) {
      setErr(e2.message || String(e2));
    } finally {
      setSaving(false);
    }
  };

  const filteredHives = apiaryId ? hives.filter(h => String(h.apiary_id) === String(apiaryId)) : hives;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">New Expense</h2>
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
              <p className="text-xs text-gray-600 mt-1">
                Preview:&nbsp;{formatMoney(amount, (currency || defaultCurrency).toUpperCase())}
              </p>
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
            <input className="w-full border rounded px-3 py-2" value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="Supplier / Landlord…" />
          </div>

          <div>
            <label className="block text-sm font-medium">Invoice #</label>
            <input className="w-full border rounded px-3 py-2" value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium">Apiary (optional)</label>
            <select className="w-full border rounded px-3 py-2" value={apiaryId} onChange={e=>{setApiaryId(e.target.value);}}>
              <option value="">—</option>
              {apiaries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Hive (optional)</label>
            <select className="w-full border rounded px-3 py-2" value={hiveId} onChange={e=>setHiveId(e.target.value)}>
              <option value="">—</option>
              {filteredHives.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="rounded-2xl px-4 py-2 border bg-black text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Expense"}
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
