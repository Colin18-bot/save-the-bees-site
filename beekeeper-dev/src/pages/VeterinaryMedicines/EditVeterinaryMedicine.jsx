import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function EditVeterinaryMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [linkedTreatmentCount, setLinkedTreatmentCount] = useState(0);

  const [recordHolderName, setRecordHolderName] = useState("");
  const [recordHolderAddress, setRecordHolderAddress] = useState("");
  const [recordHolderPostcode, setRecordHolderPostcode] = useState("");
  const [productName, setProductName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantityPurchased, setQuantityPurchased] = useState("");
  const [invoiceReference, setInvoiceReference] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

        const [medicineResult, treatmentResult] = await Promise.all([
          supabase
            .from("veterinary_medicines")
            .select(
              "id,product_name,supplier_name,supplier_address,purchase_date,batch_number,quantity_purchased,invoice_reference,expiry_date,record_holder_name,record_holder_address,record_holder_postcode"
            )
            .eq("id", id)
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("veterinary_medicine_hive_status")
            .select("treatment_hive_id", { count: "exact", head: true })
            .eq("medicine_id", id)
            .eq("user_id", user.id),
        ]);

        if (medicineResult.error) throw medicineResult.error;
        if (treatmentResult.error) throw treatmentResult.error;
        if (!medicineResult.data) throw new Error("Veterinary medicine record not found.");
        if (!active) return;

        const row = medicineResult.data;
        setRecordHolderName(row.record_holder_name || "");
        setRecordHolderAddress(row.record_holder_address || "");
        setRecordHolderPostcode(row.record_holder_postcode || "");
        setProductName(row.product_name || "");
        setSupplierName(row.supplier_name || "");
        setSupplierAddress(row.supplier_address || "");
        setPurchaseDate(row.purchase_date || "");
        setBatchNumber(row.batch_number || "");
        setQuantityPurchased(row.quantity_purchased || "");
        setInvoiceReference(row.invoice_reference || "");
        setExpiryDate(row.expiry_date || "");
        setLinkedTreatmentCount(treatmentResult.count || 0);
      } catch (err) {
        if (active) setErrorMsg(err.message || String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

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

      const { error } = await supabase
        .from("veterinary_medicines")
        .update({
          product_name: productName.trim(),
          supplier_name: supplierName.trim(),
          supplier_address: supplierAddress.trim() || null,
          purchase_date: purchaseDate,
          batch_number: batchNumber.trim(),
          quantity_purchased: quantityPurchased.trim(),
          invoice_reference: invoiceReference.trim() || null,
          expiry_date: expiryDate || null,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      navigate("/veterinary-medicines", {
        state: {
          veterinaryMedicineMessage:
            "Medicine record corrected. Linked treatment history now uses the corrected medicine details.",
        },
      });
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading medicine record…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 text-sm text-gray-500">
            <Link to="/veterinary-medicines" className="hover:underline">
              Veterinary Medicines
            </Link>{" "}
            / Correct Medicine Record
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">
            Correct Veterinary Medicine Record
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Use this page to correct an error in the original purchase record. This does not create a new medicine record.
          </p>
          <p className="mt-2 text-xs font-medium text-gray-500">* Required field</p>
        </div>
        <Link
          to="/veterinary-medicines"
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {linkedTreatmentCount > 0 && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>This medicine is already linked to treatment history.</strong> Corrections to the product name or batch number will also be reflected wherever this medicine is shown in linked treatment records.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 md:p-5">
          <h2 className="text-lg font-semibold text-[#1a3329]">Historical record holder</h2>
          <p className="mt-1 text-sm text-gray-600">
            These details are the historical snapshot saved with this purchase and are not changed when correcting the medicine details.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</div>
              <div className="mt-1 font-medium text-gray-900">{recordHolderName}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Address</div>
              <div className="mt-1 whitespace-pre-line text-gray-900">
                <div>{recordHolderAddress}</div>
                <div>{recordHolderPostcode}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-lg font-semibold text-[#1a3329]">Purchase details</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Product name *">
              <input className="input" value={productName} onChange={(e) => setProductName(e.target.value)} required />
            </Field>
            <Field label="Batch number *">
              <input className="input" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} required />
            </Field>
            <Field label="Supplier name *">
              <input className="input" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required />
            </Field>
            <Field label="Date purchased *">
              <input type="date" className="input" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
            </Field>
            <Field label="Supplier address" className="md:col-span-2">
              <textarea className="input min-h-20" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} />
            </Field>
            <Field label="Quantity purchased *">
              <input className="input" value={quantityPurchased} onChange={(e) => setQuantityPurchased(e.target.value)} required />
            </Field>
            <Field label="Expiry date">
              <input type="date" className="input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </Field>
            <Field label="Receipt / invoice / reference number">
              <input className="input" value={invoiceReference} onChange={(e) => setInvoiceReference(e.target.value)} />
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
            {saving ? "Saving…" : "Save Correction"}
          </button>
        </div>
      </form>

      <style>{`
        .input { width: 100%; border: 1px solid rgb(209 213 219); border-radius: 0.75rem; background: white; padding: 0.625rem 0.75rem; color: rgb(17 24 39); }
        .input:focus { outline: none; border-color: #1a3329; box-shadow: 0 0 0 2px rgba(26, 51, 41, 0.12); }
      `}</style>
    </div>
  );
}

function Field({ label, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {children}
    </label>
  );
}
