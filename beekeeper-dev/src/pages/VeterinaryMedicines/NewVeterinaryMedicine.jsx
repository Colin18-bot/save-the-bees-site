import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function NewVeterinaryMedicine() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [holderExists, setHolderExists] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [holderAddress, setHolderAddress] = useState("");
  const [holderPostcode, setHolderPostcode] = useState("");

  const [productName, setProductName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [batchNumber, setBatchNumber] = useState("");
  const [quantityPurchased, setQuantityPurchased] = useState("");
  const [invoiceReference, setInvoiceReference] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

        const { data, error } = await supabase
          .from("veterinary_medicine_settings")
          .select("record_holder_name,record_holder_address,record_holder_postcode")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (!active) return;

        if (data) {
          setHolderExists(true);
          setHolderName(data.record_holder_name || "");
          setHolderAddress(data.record_holder_address || "");
          setHolderPostcode(data.record_holder_postcode || "");
        }
      } catch (err) {
        if (active) setErrorMsg(err.message || String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!holderName.trim() || !holderAddress.trim() || !holderPostcode.trim()) {
      setErrorMsg("Beekeeper / record holder name, address and postcode are required.");
      return;
    }

    if (
      !productName.trim() ||
      !supplierName.trim() ||
      !purchaseDate ||
      !batchNumber.trim() ||
      !quantityPurchased.trim()
    ) {
      setErrorMsg("Please complete all required medicine purchase fields.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

      if (!holderExists) {
        const { error: holderError } = await supabase.from("veterinary_medicine_settings").upsert(
          {
            user_id: user.id,
            record_holder_name: holderName.trim(),
            record_holder_address: holderAddress.trim(),
            record_holder_postcode: holderPostcode.trim(),
          },
          { onConflict: "user_id" }
        );
        if (holderError) throw holderError;
      }

      const { error: medicineError } = await supabase.from("veterinary_medicines").insert({
        user_id: user.id,
        product_name: productName.trim(),
        supplier_name: supplierName.trim(),
        supplier_address: supplierAddress.trim() || null,
        purchase_date: purchaseDate,
        batch_number: batchNumber.trim(),
        quantity_purchased: quantityPurchased.trim(),
        invoice_reference: invoiceReference.trim() || null,
        expiry_date: expiryDate || null,
        // The database trigger snapshots the current record-holder details.
        record_holder_name: holderName.trim(),
        record_holder_address: holderAddress.trim(),
        record_holder_postcode: holderPostcode.trim(),
      });

      if (medicineError) throw medicineError;
      navigate("/veterinary-medicines");
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading veterinary medicine form…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 text-sm text-gray-500">
            <Link to="/veterinary-medicines" className="hover:underline">
              Veterinary Medicines
            </Link>{" "}
            / Add Medicine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">Add Veterinary Medicine</h1>
          <p className="mt-1 text-sm text-gray-600">
            Record the medicine exactly as purchased. HiveTag does not calculate remaining stock or treatment duration.
          </p>
        </div>
        <Link
          to="/veterinary-medicines"
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Back to medicines
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 md:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1a3329]">Beekeeper / record holder</h2>
              <p className="mt-1 text-sm text-gray-600">
                These details are saved with this medicine as a historical snapshot and will not be changed if your current details change later.
              </p>
            </div>
            {holderExists && (
              <Link
                to="/veterinary-medicines"
                className="text-sm font-medium text-[#1a3329] underline underline-offset-2"
              >
                Change current details
              </Link>
            )}
          </div>

          {holderExists ? (
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</div>
                <div className="mt-1 font-medium text-gray-900">{holderName}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Address</div>
                <div className="mt-1 whitespace-pre-line text-gray-900">
                  {holderAddress}\n{holderPostcode}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Beekeeper / record holder name *">
                <input
                  className="input"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                />
              </Field>
              <Field label="Postcode *">
                <input
                  className="input"
                  value={holderPostcode}
                  onChange={(e) => setHolderPostcode(e.target.value)}
                  required
                />
              </Field>
              <Field label="Address *" className="md:col-span-2">
                <textarea
                  className="input min-h-24"
                  value={holderAddress}
                  onChange={(e) => setHolderAddress(e.target.value)}
                  required
                />
              </Field>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-lg font-semibold text-[#1a3329]">Purchase details</h2>
          <p className="mt-1 text-sm text-gray-500">
            Use the wording and quantities shown on the medicine packaging or purchase record.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Product name *">
              <input
                className="input"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Apivar, Api-Bioxal, Apiguard"
                required
              />
            </Field>

            <Field label="Batch number *">
              <input
                className="input"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
            </Field>

            <Field label="Supplier name *">
              <input
                className="input"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
            </Field>

            <Field label="Date purchased *">
              <input
                type="date"
                className="input"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
            </Field>

            <Field label="Supplier address" className="md:col-span-2">
              <textarea
                className="input min-h-20"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                placeholder="Name and address of supplier, if available"
              />
            </Field>

            <Field label="Quantity purchased *" hint="Free text so different pack formats can be recorded accurately.">
              <input
                className="input"
                value={quantityPurchased}
                onChange={(e) => setQuantityPurchased(e.target.value)}
                placeholder="e.g. 2 packs of 10 strips, 35 g, 4 trays"
                required
              />
            </Field>

            <Field label="Expiry date">
              <input
                type="date"
                className="input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </Field>

            <Field label="Receipt / invoice / reference number">
              <input
                className="input"
                value={invoiceReference}
                onChange={(e) => setInvoiceReference(e.target.value)}
                placeholder="Optional"
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/veterinary-medicines"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-[#1a3329] shadow-sm hover:bg-yellow-300 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Medicine"}
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.75rem;
          background: white;
          padding: 0.625rem 0.75rem;
          color: rgb(17 24 39);
        }
        .input:focus {
          outline: none;
          border-color: #1a3329;
          box-shadow: 0 0 0 2px rgba(26, 51, 41, 0.12);
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
