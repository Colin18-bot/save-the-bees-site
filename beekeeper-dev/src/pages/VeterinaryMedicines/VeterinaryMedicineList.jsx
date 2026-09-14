import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabase";

const fiveYearsAgoIso = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

export default function VeterinaryMedicineList() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [savingHolder, setSavingHolder] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(
    location.state?.veterinaryMedicineMessage || ""
  );
  const [rows, setRows] = useState([]);
  const [usageByMedicine, setUsageByMedicine] = useState({});
  const [disposalByMedicine, setDisposalByMedicine] = useState({});
  const [recordRange, setRecordRange] = useState("all");
  const [query, setQuery] = useState("");
  const [holder, setHolder] = useState(null);
  const [editingHolder, setEditingHolder] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [holderAddress, setHolderAddress] = useState("");
  const [holderPostcode, setHolderPostcode] = useState("");

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

      const [settingsResult, medicinesResult, usageResult, disposalResult] = await Promise.all([
        supabase
          .from("veterinary_medicine_settings")
          .select("record_holder_name,record_holder_address,record_holder_postcode")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("veterinary_medicines")
          .select(
            "id,product_name,supplier_name,supplier_address,purchase_date,batch_number,quantity_purchased,invoice_reference,expiry_date,record_holder_name,record_holder_address,record_holder_postcode,created_at"
          )
          .eq("user_id", user.id)
          .order("purchase_date", { ascending: false }),
        supabase
          .from("veterinary_medicine_hive_status")
          .select(
            "treatment_hive_id,treatment_id,medicine_id,apiary_name_snapshot,hive_name_snapshot,treatment_for,method,started_on,treatment_mode,planned_completion_date,completion_action,status,completed_on,person_administering,quantity_used,withdrawal_period,notes,is_overdue"
          )
          .eq("user_id", user.id)
          .order("started_on", { ascending: false }),
        supabase
          .from("veterinary_medicine_disposals")
          .select("medicine_id,disposal_date,disposal_route,notes")
          .eq("user_id", user.id)
          .order("disposal_date", { ascending: false }),
      ]);

      if (settingsResult.error) throw settingsResult.error;
      if (medicinesResult.error) throw medicinesResult.error;
      if (usageResult.error) throw usageResult.error;
      if (disposalResult.error) throw disposalResult.error;

      const currentHolder = settingsResult.data || null;
      setHolder(currentHolder);
      setHolderName(currentHolder?.record_holder_name || "");
      setHolderAddress(currentHolder?.record_holder_address || "");
      setHolderPostcode(currentHolder?.record_holder_postcode || "");
      setEditingHolder(!currentHolder);
      setRows(medicinesResult.data || []);

      const nextUsage = {};
      (usageResult.data || []).forEach((item) => {
        if (!nextUsage[item.medicine_id]) nextUsage[item.medicine_id] = [];
        nextUsage[item.medicine_id].push(item);
      });
      setUsageByMedicine(nextUsage);

      const nextDisposals = {};
      (disposalResult.data || []).forEach((item) => {
        if (!nextDisposals[item.medicine_id]) nextDisposals[item.medicine_id] = [];
        nextDisposals[item.medicine_id].push(item);
      });
      setDisposalByMedicine(nextDisposals);
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    const cutoff = fiveYearsAgoIso();
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (recordRange === "five-years") {
        const usage = usageByMedicine[row.id] || [];
        const disposals = disposalByMedicine[row.id] || [];
        const hasRecentActivity =
          String(row.purchase_date || "") >= cutoff ||
          usage.some(
            (item) =>
              String(item.started_on || "") >= cutoff ||
              String(item.completed_on || "") >= cutoff
          ) ||
          disposals.some((item) => String(item.disposal_date || "") >= cutoff);

        if (!hasRecentActivity) return false;
      }

      if (!q) return true;
      return [
        row.product_name,
        row.supplier_name,
        row.batch_number,
        row.invoice_reference,
      ].some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [rows, query, recordRange, usageByMedicine, disposalByMedicine]);

  const treatmentGroupsForMedicine = (medicineId) => {
    const usage = usageByMedicine[medicineId] || [];
    const groups = new Map();

    usage.forEach((item) => {
      const key = item.treatment_id || item.treatment_hive_id;
      if (!groups.has(key)) {
        groups.set(key, {
          ...item,
          hives: [],
        });
      }
      groups.get(key).hives.push({
        name: item.hive_name_snapshot,
        status: item.status,
        completed_on: item.completed_on,
      });
    });

    return [...groups.values()];
  };

  const saveRecordHolder = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!holderName.trim() || !holderAddress.trim() || !holderPostcode.trim()) {
      setErrorMsg("Name, address and postcode are required for veterinary medicine records.");
      return;
    }

    setSavingHolder(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

      const payload = {
        user_id: user.id,
        record_holder_name: holderName.trim(),
        record_holder_address: holderAddress.trim(),
        record_holder_postcode: holderPostcode.trim(),
      };

      const { data, error } = await supabase
        .from("veterinary_medicine_settings")
        .upsert(payload, { onConflict: "user_id" })
        .select("record_holder_name,record_holder_address,record_holder_postcode")
        .single();

      if (error) throw error;
      setHolder(data);
      setEditingHolder(false);
      setSuccessMsg(
        "Record-holder details saved. Existing historical medicine records have not been changed."
      );
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setSavingHolder(false);
    }
  };

  if (loading) return <div className="p-6">Loading veterinary medicines…</div>;

  return (
    <div className="max-w-7xl min-w-0 mx-auto p-4 md:p-6">
      <style>{`
        #vm-print-report { display: none; }
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          #vm-print-report, #vm-print-report * { visibility: visible !important; }
          #vm-print-report {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000;
            background: #fff;
            font-size: 9pt;
            line-height: 1.25;
          }
          #vm-print-report table {
            width: 100%;
            border-collapse: collapse;
            break-inside: auto;
            page-break-inside: auto;
          }
          #vm-print-report thead { display: table-header-group; }
          #vm-print-report tfoot { display: table-footer-group; }
          #vm-print-report tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #vm-print-report th, #vm-print-report td {
            border: 1px solid #b8b8b8;
            padding: 4px 5px;
            vertical-align: top;
            text-align: left;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #vm-print-report th { background: #f2f2f2 !important; }
          #vm-print-report .vm-print-record {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
            margin-bottom: 8mm;
          }
          #vm-print-report .vm-print-record + .vm-print-record {
            break-before: page !important;
            page-break-before: always !important;
          }
          #vm-print-report .vm-print-record h2,
          #vm-print-report .vm-print-record > div {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">Veterinary Medicines</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Record medicines you purchase, where they were administered and the treatment dates you set.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rows.length > 0 && (
            <Link
              to="/veterinary-medicines/treatments/new"
              className="inline-flex items-center justify-center rounded-xl border border-[#1a3329] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a3329] hover:bg-amber-50"
            >
              Record Treatment
            </Link>
          )}
          <Link
            to="/veterinary-medicines/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#1a3329] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#24483a]"
          >
            + Add Medicine
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1a3329]">Record holder details</h2>
            <p className="mt-1 text-sm text-gray-600">
              These current details are used for new records. Historical records keep the name and address that applied when they were created.
            </p>
          </div>
          {holder && !editingHolder && (
            <button
              type="button"
              onClick={() => setEditingHolder(true)}
              className="rounded-lg border border-[#1a3329]/30 bg-white px-3 py-2 text-sm font-medium text-[#1a3329] hover:bg-amber-50"
            >
              Change details
            </button>
          )}
        </div>

        {editingHolder ? (
          <form onSubmit={saveRecordHolder} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-800">Beekeeper / record holder name *</span>
              <input
                className="rounded-xl border border-gray-300 bg-white p-2.5"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-800">Postcode *</span>
              <input
                className="rounded-xl border border-gray-300 bg-white p-2.5"
                value={holderPostcode}
                onChange={(e) => setHolderPostcode(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-800">Address *</span>
              <textarea
                className="min-h-24 rounded-xl border border-gray-300 bg-white p-2.5"
                value={holderAddress}
                onChange={(e) => setHolderAddress(e.target.value)}
                required
              />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                disabled={savingHolder}
                className="rounded-xl bg-[#1a3329] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24483a] disabled:opacity-60"
              >
                {savingHolder ? "Saving…" : "Save details"}
              </button>
              {holder && (
                <button
                  type="button"
                  onClick={() => {
                    setHolderName(holder.record_holder_name || "");
                    setHolderAddress(holder.record_holder_address || "");
                    setHolderPostcode(holder.record_holder_postcode || "");
                    setEditingHolder(false);
                  }}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</div>
              <div className="mt-1 font-medium text-gray-900">{holder?.record_holder_name}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Address</div>
              <div className="mt-1 whitespace-pre-line text-gray-900">
                <div>{holder?.record_holder_address}</div>
                <div>{holder?.record_holder_postcode}</div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1a3329]">Medicine records</h2>
              <p className="mt-1 text-sm text-gray-500">
                Older records remain available; the five-year option is a filter only.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                Show
                <select
                  value={recordRange}
                  onChange={(e) => setRecordRange(e.target.value)}
                  className="min-w-40 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900"
                >
                  <option value="all">All records</option>
                  <option value="five-years">Last 5 years</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                Search
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Product, supplier, batch…"
                  className="w-full min-w-60 rounded-xl border border-gray-300 px-3 py-2 text-sm font-normal"
                />
              </label>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={filteredRows.length === 0}
                className="rounded-xl border border-[#1a3329] bg-[#1a3329] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24483a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Print / PDF
              </button>
            </div>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-600">
            {rows.length === 0
              ? "No veterinary medicines have been recorded yet."
              : "No medicine records match the current filter."}
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-[1180px] w-full text-sm">
              <thead className="bg-[#1a3329] text-white">
                <tr>
                  <TH>Product</TH>
                  <TH>Supplier</TH>
                  <TH>Purchased</TH>
                  <TH>Batch</TH>
                  <TH>Quantity purchased</TH>
                  <TH>Invoice / reference</TH>
                  <TH>Expiry</TH>
                  <TH>Treatment history</TH>
                  <TH>Disposal</TH>
                  <TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const usage = usageByMedicine[row.id] || [];
                  const disposals = disposalByMedicine[row.id] || [];
                  const activeCount = usage.filter((item) => item.status === "active").length;
                  const overdueCount = usage.filter((item) => item.is_overdue).length;
                  const hiveNames = [...new Set(usage.map((item) => item.hive_name_snapshot).filter(Boolean))];

                  return (
                    <tr key={row.id} className="border-b border-gray-200 align-top hover:bg-amber-50/30">
                      <TD className="font-semibold text-[#1a3329]">{row.product_name}</TD>
                      <TD>
                        <div>{row.supplier_name}</div>
                        {row.supplier_address && (
                          <div className="mt-1 max-w-56 whitespace-pre-line text-xs text-gray-500">
                            {row.supplier_address}
                          </div>
                        )}
                      </TD>
                      <TD>{formatDate(row.purchase_date)}</TD>
                      <TD>{row.batch_number}</TD>
                      <TD>{row.quantity_purchased}</TD>
                      <TD>{row.invoice_reference || "—"}</TD>
                      <TD>{formatDate(row.expiry_date)}</TD>
                      <TD>
                        {usage.length === 0 ? (
                          <span className="text-gray-500">Not yet administered</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {usage.length} hive treatment record{usage.length === 1 ? "" : "s"}
                            </div>
                            {hiveNames.length > 0 && (
                              <div className="max-w-64 text-xs text-gray-600">
                                {hiveNames.slice(0, 5).join(", ")}
                                {hiveNames.length > 5 ? ` +${hiveNames.length - 5} more` : ""}
                              </div>
                            )}
                            {activeCount > 0 && (
                              <div className="text-xs font-semibold text-amber-700">
                                {activeCount} active
                              </div>
                            )}
                            {overdueCount > 0 && (
                              <div className="text-xs font-bold text-red-700">
                                {overdueCount} removal/completion overdue
                              </div>
                            )}
                          </div>
                        )}
                      </TD>
                      <TD>
                        {disposals.length === 0 ? (
                          <span className="text-gray-500">—</span>
                        ) : (
                          <div className="space-y-1">
                            {disposals.slice(0, 2).map((item, index) => (
                              <div key={`${item.disposal_date}-${index}`}>
                                <div>{formatDate(item.disposal_date)}</div>
                                <div className="text-xs text-gray-500">{item.disposal_route}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TD>
                      <TD>
                        <Link
                          to={`/veterinary-medicines/treatments/new?medicine=${row.id}`}
                          className="inline-flex whitespace-nowrap rounded-lg border border-[#1a3329]/30 bg-white px-3 py-2 text-xs font-semibold text-[#1a3329] hover:bg-amber-50"
                        >
                          Record treatment
                        </Link>
                      </TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div id="vm-print-report" aria-hidden="true">
        <div style={{ marginBottom: "6mm" }}>
          <h1 style={{ fontSize: "18pt", margin: 0 }}>Veterinary Medicine Administration Records</h1>
          <div style={{ marginTop: "2mm" }}>
            {recordRange === "five-years" ? "Last 5 years" : "All records"}
            {query.trim() ? ` • Search filter: ${query.trim()}` : ""}
          </div>
        </div>

        {filteredRows.map((row) => {
          const groups = treatmentGroupsForMedicine(row.id);
          const disposals = disposalByMedicine[row.id] || [];

          return (
            <section key={`print-${row.id}`} className="vm-print-record">
              <h2 style={{ fontSize: "13pt", margin: "0 0 2mm 0" }}>{row.product_name}</h2>

              <table style={{ marginBottom: "3mm" }}>
                <tbody>
                  <tr>
                    <th>Record holder</th>
                    <td>{row.record_holder_name}</td>
                    <th>Address</th>
                    <td>
                      {row.record_holder_address}
                      {row.record_holder_postcode ? `, ${row.record_holder_postcode}` : ""}
                    </td>
                  </tr>
                  <tr>
                    <th>Supplier</th>
                    <td>
                      {row.supplier_name}
                      {row.supplier_address ? `, ${row.supplier_address}` : ""}
                    </td>
                    <th>Purchase date</th>
                    <td>{formatDate(row.purchase_date)}</td>
                  </tr>
                  <tr>
                    <th>Batch number</th>
                    <td>{row.batch_number}</td>
                    <th>Quantity purchased</th>
                    <td>{row.quantity_purchased}</td>
                  </tr>
                  <tr>
                    <th>Invoice / reference</th>
                    <td>{row.invoice_reference || "—"}</td>
                    <th>Expiry</th>
                    <td>{formatDate(row.expiry_date)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontWeight: 700, marginBottom: "1mm" }}>Administration</div>
              {groups.length === 0 ? (
                <div style={{ marginBottom: "3mm" }}>Not yet administered.</div>
              ) : (
                <table style={{ marginBottom: "3mm" }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Apiary / hives</th>
                      <th>Used for / method</th>
                      <th>Quantity used</th>
                      <th>Withdrawal period</th>
                      <th>Administered by</th>
                      <th>Completion / removal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <tr key={`print-treatment-${group.treatment_id || group.treatment_hive_id}`}>
                        <td>{formatDate(group.started_on)}</td>
                        <td>
                          <div>{group.apiary_name_snapshot || "—"}</div>
                          <div>
                            {group.hives
                              .map((hive) =>
                                `${hive.name || "Hive"}${
                                  hive.status === "completed" && hive.completed_on
                                    ? ` (completed ${formatDate(hive.completed_on)})`
                                    : hive.status === "active"
                                      ? " (active)"
                                      : ""
                                }`
                              )
                              .join(", ")}
                          </div>
                        </td>
                        <td>
                          <div>{group.treatment_for || "—"}</div>
                          <div>{group.method || "—"}</div>
                        </td>
                        <td>{group.quantity_used || "—"}</td>
                        <td>{group.withdrawal_period || "—"}</td>
                        <td>{group.person_administering || "—"}</td>
                        <td>
                          {group.planned_completion_date ? (
                            <>
                              {group.completion_action === "remove" ? "Remove" : "Complete"}: {formatDate(group.planned_completion_date)}
                            </>
                          ) : (
                            "Completed on administration date"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ fontWeight: 700, marginBottom: "1mm" }}>Disposal if not administered</div>
              {disposals.length === 0 ? (
                <div>None recorded.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Route of disposal</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disposals.map((item, index) => (
                      <tr key={`print-disposal-${row.id}-${index}`}>
                        <td>{formatDate(item.disposal_date)}</td>
                        <td>{item.disposal_route}</td>
                        <td>{item.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TH({ children, className = "" }) {
  return <th className={`px-3 py-3 text-left font-semibold ${className}`}>{children}</th>;
}

function TD({ children, className = "" }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}
