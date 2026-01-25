import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import useCurrencyPreference from "../../hooks/useCurrencyPreference";

const categories = [
  "Brood Box",
  "Super",
  "Frames",
  "Foundation",
  "Hive Stand",
  "Feeder",
  "Queen Excluder",
  "Smoker",
  "Hive Tool",
  "Bee Suit",
  "Gloves",
  "Other",
];

export default function NewItem() {
  const navigate = useNavigate();

  // Live default currency from Settings (localStorage + event listener)
  const prefCurrency = useCurrencyPreference();

  // Base fields aligned to your schema
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [sku, setSku] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [unit, setUnit] = useState("piece");
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState("");

  // Initialise to preference; user can override
  const [currency, setCurrency] = useState(prefCurrency);
  useEffect(() => {
    setCurrency((c) => c || prefCurrency);
     
  }, [prefCurrency]);

  const [trackStock, setTrackStock] = useState(false);
  const [isConsumable, setIsConsumable] = useState(false);
  const [notes, setNotes] = useState("");

  const total = useMemo(() => {
    const q = Number(quantity) || 0;
    const up = Number(purchasePrice) || 0;
    return (q * up).toFixed(2);
  }, [quantity, purchasePrice]);

  // Linking scope
  // 'global' | 'apiary' | 'hives' | 'unassigned'
  const [usageScope, setUsageScope] = useState("unassigned");
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState("");
  const [selectedHiveIds, setSelectedHiveIds] = useState([]);

  // UX
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Helpers
  const symbolFor = (ccy) => ({ GBP: "£", EUR: "€", USD: "$" }[ccy] || ccy);
  const symbol = symbolFor(currency);

  // Load apiaries if needed
  useEffect(() => {
    let active = true;
    (async () => {
      if (usageScope === "apiary" || usageScope === "hives") {
        const { data, error } = await supabase
          .from("apiaries")
          .select("id, name")
          .order("name", { ascending: true });
        if (!active) return;
        if (error) setErrorMsg(error.message);
        else setApiaries(data || []);
      }
    })();
    return () => {
      active = false;
    };
  }, [usageScope]);

  // Load hives if needed
  useEffect(() => {
    let active = true;
    (async () => {
      if (usageScope === "hives" && selectedApiaryId) {
        const { data, error } = await supabase
          .from("hives")
          .select("id, name, apiary_id")
          .eq("apiary_id", selectedApiaryId)
          .order("name", { ascending: true });
        if (!active) return;
        if (error) setErrorMsg(error.message);
        else setHives(data || []);
      } else {
        setHives([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [usageScope, selectedApiaryId]);

  const toggleHiveSelection = (hiveId) => {
    setSelectedHiveIds((prev) =>
      prev.includes(hiveId)
        ? prev.filter((id) => id !== hiveId)
        : [...prev, hiveId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    const finalCategory =
      category === "Other" ? otherCategory.trim() || "Other" : category;

    if (usageScope === "apiary" && !selectedApiaryId) {
      setErrorMsg("Please select an apiary.");
      return;
    }
    if (usageScope === "hives" && (!selectedApiaryId || selectedHiveIds.length === 0)) {
      setErrorMsg("Please choose an apiary and at least one hive.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error(userErr?.message || "Not authenticated.");

      // 1) Create the inventory item
      const insertPayload = {
        user_id: user.id,
        name: name.trim(),
        category: finalCategory || null,
        sku: sku || null,
        supplier_name: supplierName || null,
        invoice_number: invoiceNumber || null,
        purchase_date: purchaseDate || null,
        unit: unit || null,
        quantity: quantity === "" ? null : Number(quantity),
        purchase_price: purchasePrice === "" ? null : Number(purchasePrice),
        currency: (currency || prefCurrency || "GBP").toUpperCase(),
        track_stock: !!trackStock,
        is_consumable: !!isConsumable,
        notes: notes || null,
      };

      const { data: item, error: itemErr } = await supabase
        .from("inventory_items")
        .insert([insertPayload])
        .select("id")
        .single();

      if (itemErr) throw itemErr;

      // 2) Insert assignments based on scope
      const assignments = [];
      if (usageScope === "global") {
        assignments.push({
          owner_id: user.id,
          item_id: item.id,
          level: "global",
        });
      } else if (usageScope === "apiary") {
        assignments.push({
          owner_id: user.id,
          item_id: item.id,
          level: "apiary",
          apiary_id: selectedApiaryId,
        });
      } else if (usageScope === "hives") {
        for (const hiveId of selectedHiveIds) {
          assignments.push({
            owner_id: user.id,
            item_id: item.id,
            level: "hive",
            hive_id: hiveId,
          });
        }
      }

      if (assignments.length > 0) {
        const { error: assignErr } = await supabase
          .from("inventory_item_assignments")
          .insert(assignments);
        if (assignErr) throw assignErr;
      }

      navigate("/inventory");
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">New Inventory Item</h1>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item basics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Name *</span>
            <input
              className="rounded-xl border p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Brood Box, Smoker"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Category</span>
            <select
              className="rounded-xl border p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {category === "Other" && (
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Other Category</span>
              <input
                className="rounded-xl border p-2"
                value={otherCategory}
                onChange={(e) => setOtherCategory(e.target.value)}
                placeholder="Describe the category"
              />
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">SKU</span>
            <input
              className="rounded-xl border p-2"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Supplier</span>
            <input
              className="rounded-xl border p-2"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Invoice #</span>
            <input
              className="rounded-xl border p-2"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Purchase Date</span>
            <input
              type="date"
              className="rounded-xl border p-2"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Unit</span>
            <input
              className="rounded-xl border p-2"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., piece, box, pack"
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
              placeholder="Optional notes..."
            />
          </label>
        </div>

        {/* Linked To / Usage Scope */}
        <div className="rounded-2xl border p-4">
          <div className="text-base font-semibold mb-3">Where will this be used?</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="usageScope"
                value="global"
                checked={usageScope === "global"}
                onChange={(e) => setUsageScope(e.target.value)}
              />
              <span className="text-sm">All hives (Global)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="usageScope"
                value="apiary"
                checked={usageScope === "apiary"}
                onChange={(e) => setUsageScope(e.target.value)}
              />
              <span className="text-sm">Specific apiary</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="usageScope"
                value="hives"
                checked={usageScope === "hives"}
                onChange={(e) => setUsageScope(e.target.value)}
              />
              <span className="text-sm">Specific hive(s)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="usageScope"
                value="unassigned"
                checked={usageScope === "unassigned"}
                onChange={(e) => setUsageScope(e.target.value)}
              />
              <span className="text-sm">Unassigned for now</span>
            </label>
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
                  <option value="">Select an apiary...</option>
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
                  <option value="">Select an apiary...</option>
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
                      <div className="text-sm text-gray-500">
                        No hives found in this apiary.
                      </div>
                    )}
                    {hives.map((h) => (
                      <label
                        key={h.id}
                        className="flex items-center gap-2 rounded-xl border p-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHiveIds.includes(h.id)}
                          onChange={() => toggleHiveSelection(h.id)}
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
            {saving ? "Saving..." : "Save Inventory Item"}
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
