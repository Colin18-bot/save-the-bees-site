import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [unit, setUnit] = useState("piece");
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [trackStock, setTrackStock] = useState(false);
  const [isConsumable, setIsConsumable] = useState(false);
  const [notes, setNotes] = useState("");

  // Linking scope
  const [usageScope, setUsageScope] = useState("unassigned"); // 'global' | 'apiary' | 'hives' | 'unassigned'
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState("");
  const [selectedHiveIds, setSelectedHiveIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mixedNotice, setMixedNotice] = useState("");

  const total = useMemo(() => {
    const q = Number(quantity) || 0;
    const up = Number(purchasePrice) || 0;
    return (q * up).toFixed(2);
  }, [quantity, purchasePrice]);

  // Load item + assignments
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const { data: item, error: itemErr } = await supabase
          .from("inventory_items")
          .select("*")
          .eq("id", id)
          .single();
        if (itemErr) throw itemErr;
        if (!active) return;

        setName(item.name || "");
        setCategory(item.category || "");
        setSku(item.sku || "");
        setSupplierName(item.supplier_name || "");
        setInvoiceNumber(item.invoice_number || "");
        setPurchaseDate(item.purchase_date || "");
        setUnit(item.unit || "piece");
        setQuantity(item.quantity ?? 1);
        setPurchasePrice(item.purchase_price == null ? "" : String(item.purchase_price));
        setCurrency((item.currency || "GBP").toUpperCase());
        setTrackStock(!!item.track_stock);
        setIsConsumable(!!item.is_consumable);
        setNotes(item.notes || "");

        const { data: assigns, error: aErr } = await supabase
          .from("inventory_item_assignments")
          .select("id, level, apiary_id, hive_id")
          .eq("item_id", id);
        if (aErr) throw aErr;
        if (!active) return;

        if (!assigns || assigns.length === 0) {
          setUsageScope("unassigned");
          setSelectedApiaryId("");
          setSelectedHiveIds([]);
        } else {
          const levels = new Set(assigns.map((a) => a.level));
          if (levels.size > 1) {
            setMixedNotice(
              "This item currently has mixed links (e.g., global + hive). Saving will replace them with your new selection below."
            );
          } else {
            setMixedNotice("");
          }

          if (levels.has("global") && levels.size === 1) {
            setUsageScope("global");
          } else if (levels.has("apiary") && levels.size === 1) {
            setUsageScope("apiary");
            setSelectedApiaryId(assigns[0].apiary_id || "");
          } else if (levels.has("hive") && levels.size === 1) {
            setUsageScope("hives");
            const hiveIds = assigns.map((a) => a.hive_id).filter(Boolean);
            setSelectedHiveIds(hiveIds);

            // infer most common apiary among selected hives
            if (hiveIds.length) {
              const { data: hRows, error: hErr } = await supabase
                .from("hives")
                .select("id, apiary_id")
                .in("id", hiveIds);
              if (!hErr && hRows?.length) {
                const counts = new Map();
                for (const h of hRows) {
                  counts.set(h.apiary_id, (counts.get(h.apiary_id) || 0) + 1);
                }
                const [bestApiaryId] =
                  [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
                setSelectedApiaryId(bestApiaryId || "");
              }
            }
          } else {
            setUsageScope("hives");
            setSelectedHiveIds(assigns.filter((a) => a.hive_id).map((a) => a.hive_id));
          }
        }
      } catch (err) {
        setErrorMsg(err.message || String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Load apiaries if needed
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (usageScope === "apiary" || usageScope === "hives") {
        const { data, error } = await supabase
          .from("apiaries")
          .select("id, name")
          .order("name", { ascending: true });
        if (!mounted) return;
        if (error) setErrorMsg(error.message);
        else setApiaries(data || []);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [usageScope]);

  // Load hives if needed
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (usageScope === "hives" && selectedApiaryId) {
        const { data, error } = await supabase
          .from("hives")
          .select("id, name, apiary_id")
          .eq("apiary_id", selectedApiaryId)
          .order("name", { ascending: true });
        if (!mounted) return;
        if (error) setErrorMsg(error.message);
        else setHives(data || []);
      } else {
        setHives([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [usageScope, selectedApiaryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    if (usageScope === "apiary" && !selectedApiaryId) {
      setErrorMsg("Please select an apiary.");
      return;
    }
    if (usageScope === "hives" && selectedHiveIds.length === 0) {
      setErrorMsg("Please choose at least one hive.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error(userErr?.message || "Not authenticated.");

      // 1) Update the item (mapped to your schema)
      const updatePayload = {
        name: name.trim(),
        category: category || null,
        sku: sku || null,
        supplier_name: supplierName || null,
        invoice_number: invoiceNumber || null,
        purchase_date: purchaseDate || null,
        unit: unit || null,
        quantity: quantity === "" ? null : Number(quantity),
        purchase_price: purchasePrice === "" ? null : Number(purchasePrice),
        currency: (currency || "GBP").toUpperCase(),
        track_stock: !!trackStock,
        is_consumable: !!isConsumable,
        notes: notes || null,
      };

      const { error: upErr } = await supabase
        .from("inventory_items")
        .update(updatePayload)
        .eq("id", id);
      if (upErr) throw upErr;

      // 2) Replace assignments
      const { error: delErr } = await supabase
        .from("inventory_item_assignments")
        .delete()
        .eq("item_id", id);
      if (delErr) throw delErr;

      const newRows = [];
      if (usageScope === "global") {
        newRows.push({ owner_id: user.id, item_id: id, level: "global" });
      } else if (usageScope === "apiary") {
        newRows.push({
          owner_id: user.id,
          item_id: id,
          level: "apiary",
          apiary_id: selectedApiaryId,
        });
      } else if (usageScope === "hives") {
        for (const hiveId of selectedHiveIds) {
          newRows.push({
            owner_id: user.id,
            item_id: id,
            level: "hive",
            hive_id: hiveId,
          });
        }
      }
      if (newRows.length > 0) {
        const { error: insErr } = await supabase
          .from("inventory_item_assignments")
          .insert(newRows);
        if (insErr) throw insErr;
      }

      navigate("/inventory");
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item and its links? This cannot be undone.")) return;
    try {
      // remove assignments then item
      await supabase.from("inventory_item_assignments").delete().eq("item_id", id);
      await supabase.from("inventory_items").delete().eq("id", id);
      navigate("/inventory");
    } catch (e) {
      setErrorMsg(e.message || String(e));
    }
  };

  if (loading) return <div className="p-6">Loading item…</div>;

  const symbolFor = (ccy) => ({ GBP: "£", EUR: "€", USD: "$" }[ccy] || ccy);
  const symbol = symbolFor(currency);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Edit Inventory Item</h1>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      {mixedNotice && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {mixedNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Name *</span>
            <input
              className="rounded-xl border p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Category</span>
            <input
              className="rounded-xl border p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Brood Box, Smoker…"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">SKU</span>
            <input
              className="rounded-xl border p-2"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Supplier</span>
            <input
              className="rounded-xl border p-2"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Invoice #</span>
            <input
              className="rounded-xl border p-2"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Purchase Date</span>
            <input
              type="date"
              className="rounded-xl border p-2"
              value={purchaseDate || ""}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Unit</span>
            <input
              className="rounded-xl border p-2"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Quantity</span>
            <input
              type="number"
              className="rounded-xl border p-2"
              value={quantity}
              min={0}
              step="1"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Purchase Price</span>
              <input
                type="number"
                className="rounded-xl border p-2"
                value={purchasePrice}
                min={0}
                step="0.01"
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Currency</span>
              <select
                className="rounded-xl border p-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              >
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>

          <div className="flex items-end">
            <div className="text-sm">
              <div className="font-medium">Total</div>
              <div className="text-gray-700">
                {symbol} {total}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 md:col-span-1">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={trackStock}
              onChange={(e) => setTrackStock(e.target.checked)}
            />
            <span className="text-sm">Track stock</span>
          </label>

          <label className="flex items-center gap-2 md:col-span-1">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={isConsumable}
              onChange={(e) => setIsConsumable(e.target.checked)}
            />
            <span className="text-sm">Consumable</span>
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <textarea
              className="rounded-xl border p-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        {/* Linked To / Usage Scope */}
        <div className="rounded-2xl border p-4">
          <div className="text-base font-semibold mb-3">Where will this be used?</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["global", "apiary", "hives", "unassigned"].map((v) => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="usageScope"
                  value={v}
                  checked={usageScope === v}
                  onChange={(e) => setUsageScope(e.target.value)}
                />
                <span className="text-sm">
                  {v === "global"
                    ? "All hives (Global)"
                    : v === "apiary"
                    ? "Specific apiary"
                    : v === "hives"
                    ? "Specific hive(s)"
                    : "Unassigned for now"}
                </span>
              </label>
            ))}
          </div>

          {usageScope === "apiary" && (
            <div className="mt-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Apiary</span>
                <select
                  className="rounded-xl border p-2"
                  value={selectedApiaryId}
                  onChange={(e) => setSelectedApiaryId(e.target.value)}
                >
                  <option value="">Select an apiary…</option>
                  {apiaries.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {usageScope === "hives" && (
            <div className="mt-4 space-y-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Apiary (to filter hives)</span>
                <select
                  className="rounded-xl border p-2"
                  value={selectedApiaryId}
                  onChange={(e) => {
                    setSelectedApiaryId(e.target.value);
                    setSelectedHiveIds([]);
                  }}
                >
                  <option value="">Select an apiary…</option>
                  {apiaries.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedApiaryId && (
                <div>
                  <div className="text-sm font-medium mb-2">Hives</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {hives.length === 0 && (
                      <div className="text-sm text-gray-500">No hives found in this apiary.</div>
                    )}
                    {hives.map((h) => (
                      <label key={h.id} className="flex items-center gap-2 rounded-xl border p-2">
                        <input
                          type="checkbox"
                          checked={selectedHiveIds.includes(h.id)}
                          onChange={() =>
                            setSelectedHiveIds((prev) =>
                              prev.includes(h.id)
                                ? prev.filter((i) => i !== h.id)
                                : [...prev, h.id]
                            )
                          }
                        />
                        <span className="text-sm">{h.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl px-4 py-2 border bg-black text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {/* NEW: Delete button (black) */}
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-2xl px-4 py-2 border bg-black text-white"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => navigate("/inventory")}
            className="rounded-2xl px-4 py-2 border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
