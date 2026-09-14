import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

export default function VeterinaryMedicinePrint() {
  const [searchParams] = useSearchParams();
  const recordRange = searchParams.get("range") === "five-years" ? "five-years" : "all";
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [usageByMedicine, setUsageByMedicine] = useState({});
  const [disposalByMedicine, setDisposalByMedicine] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

        const [medicinesResult, usageResult, disposalResult] = await Promise.all([
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
            .order("started_on", { ascending: true }),
          supabase
            .from("veterinary_medicine_disposals")
            .select("id,medicine_id,disposal_date,quantity_disposed,disposal_route,notes")
            .eq("user_id", user.id)
            .order("disposal_date", { ascending: true }),
        ]);

        if (medicinesResult.error) throw medicinesResult.error;
        if (usageResult.error) throw usageResult.error;
        if (disposalResult.error) throw disposalResult.error;

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
        quantity_used: item.quantity_used,
      });
    });

    return [...groups.values()];
  };

  if (loading) {
    return <div className="vm-print-status">Preparing veterinary medicine records…</div>;
  }

  if (errorMsg) {
    return (
      <div className="vm-print-status">
        <strong>Unable to prepare the print report.</strong>
        <div>{errorMsg}</div>
      </div>
    );
  }

  return (
    <div className="vm-print-shell">
      <style>{`
        @page {
          size: A4 landscape;
          margin: 10mm;
        }

        html, body {
          background: #ececec;
        }

        .vm-print-shell {
          min-height: 100vh;
          color: #111;
          font-family: Arial, Helvetica, sans-serif;
        }

        .vm-print-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 18px;
          background: #1a3329;
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,.18);
        }

        .vm-print-toolbar button {
          border: 1px solid rgba(255,255,255,.45);
          border-radius: 8px;
          padding: 8px 14px;
          background: #fff;
          color: #1a3329;
          font-weight: 700;
          cursor: pointer;
        }

        .vm-print-document {
          width: min(1120px, calc(100% - 28px));
          margin: 18px auto 36px;
        }

        .vm-print-cover,
        .vm-medicine-record {
          box-sizing: border-box;
          background: #fff;
          padding: 10mm;
          margin: 0 auto 16px;
          box-shadow: 0 1px 8px rgba(0,0,0,.18);
        }

        .vm-print-cover h1 {
          margin: 0;
          font-size: 22px;
        }

        .vm-print-cover p {
          margin: 6px 0 0;
          font-size: 13px;
        }

        .vm-medicine-record {
          break-before: page;
          page-break-before: always;
        }

        .vm-medicine-record:first-of-type {
          break-before: auto;
          page-break-before: auto;
        }

        .vm-record-header {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .vm-record-header h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }

        .vm-print-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 11px;
          line-height: 1.28;
        }

        .vm-print-table th,
        .vm-print-table td {
          border: 1px solid #aeb4b1;
          padding: 5px 6px;
          vertical-align: top;
          text-align: left;
          overflow-wrap: anywhere;
        }

        .vm-print-table th {
          background: #f1f3f2;
          font-weight: 700;
        }

        .vm-summary-table {
          margin-bottom: 10px;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .vm-data-table {
          margin-top: 10px;
        }

        .vm-data-table thead {
          display: table-header-group;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .vm-data-table tbody {
          break-inside: auto;
          page-break-inside: auto;
        }

        .vm-data-table tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .vm-section-heading-row th {
          background: #dfe8e3;
          color: #183229;
          font-size: 12px;
          padding-top: 6px;
          padding-bottom: 6px;
        }

        .vm-empty-row td {
          padding: 7px;
          color: #444;
          font-style: italic;
        }

        .vm-print-status {
          padding: 32px;
          font-family: Arial, Helvetica, sans-serif;
        }

        @media print {
          html, body, #root {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          .vm-print-toolbar {
            display: none !important;
          }

          .vm-print-document {
            width: auto !important;
            margin: 0 !important;
          }

          .vm-print-cover,
          .vm-medicine-record {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .vm-print-cover {
            margin-bottom: 7mm !important;
          }

          .vm-medicine-record {
            break-before: page !important;
            page-break-before: always !important;
          }

          .vm-medicine-record:first-of-type {
            break-before: auto !important;
            page-break-before: auto !important;
          }

          .vm-record-header,
          .vm-summary-table,
          .vm-data-table thead,
          .vm-data-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .vm-data-table thead {
            display: table-header-group !important;
          }

          .vm-print-table th {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="vm-print-toolbar">
        <div>
          <strong>Veterinary Medicine Administration Records</strong>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {recordRange === "five-years" ? "Last 5 years" : "All records"}
            {query.trim() ? ` · Search: ${query.trim()}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => window.close()}>
            Close
          </button>
          <button type="button" onClick={() => window.print()}>
            Print / save PDF
          </button>
        </div>
      </div>

      <main className="vm-print-document">
        <div className="vm-print-cover">
          <h1>Veterinary Medicine Administration Records</h1>
          <p>
            {recordRange === "five-years" ? "Last 5 years" : "All records"}
            {query.trim() ? ` · Search filter: ${query.trim()}` : ""}
          </p>
        </div>

        {filteredRows.length === 0 ? (
          <div className="vm-print-cover">No medicine records match the current filter.</div>
        ) : (
          filteredRows.map((row) => {
            const groups = treatmentGroupsForMedicine(row.id);
            const disposals = disposalByMedicine[row.id] || [];

            return (
              <article key={row.id} className="vm-medicine-record">
                <div className="vm-record-header">
                  <h2>{row.product_name}</h2>

                  <table className="vm-print-table vm-summary-table">
                    <tbody>
                      <tr>
                        <th style={{ width: "13%" }}>Record holder</th>
                        <td style={{ width: "37%" }}>{row.record_holder_name}</td>
                        <th style={{ width: "13%" }}>Address</th>
                        <td style={{ width: "37%" }}>
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
                </div>

                <table className="vm-print-table vm-data-table">
                  <thead>
                    <tr className="vm-section-heading-row">
                      <th colSpan="7">Administration</th>
                    </tr>
                    <tr>
                      <th style={{ width: "7%" }}>Date</th>
                      <th style={{ width: "39%" }}>Apiary / hives</th>
                      <th style={{ width: "9%" }}>Used for / method</th>
                      <th style={{ width: "10%" }}>Quantity used per hive</th>
                      <th style={{ width: "9%" }}>Withdrawal period</th>
                      <th style={{ width: "9%" }}>Administered by</th>
                      <th style={{ width: "17%" }}>Completion / removal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.length === 0 ? (
                      <tr className="vm-empty-row">
                        <td colSpan="7">Not yet administered.</td>
                      </tr>
                    ) : (
                      groups.map((group) => (
                        <tr key={group.treatment_id || group.treatment_hive_id}>
                          <td>{formatDate(group.started_on)}</td>
                          <td>
                            <div>{group.apiary_name_snapshot || "—"}</div>
                            <div>
                              {group.hives
                                .map(
                                  (hive) =>
                                    `${hive.name || "Hive"} — ${hive.quantity_used || "—"}${
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
                            {group.planned_completion_date
                              ? `${group.completion_action === "remove" ? "Remove" : "Complete"}: ${formatDate(
                                  group.planned_completion_date
                                )}`
                              : "Completed on administration date"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <table className="vm-print-table vm-data-table">
                  <thead>
                    <tr className="vm-section-heading-row">
                      <th colSpan="4">Disposal of unused medicine</th>
                    </tr>
                    <tr>
                      <th style={{ width: "15%" }}>Date</th>
                      <th style={{ width: "21%" }}>Quantity disposed</th>
                      <th style={{ width: "42%" }}>Route of disposal</th>
                      <th style={{ width: "22%" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disposals.length === 0 ? (
                      <tr className="vm-empty-row">
                        <td colSpan="4">No disposal of unused medicine recorded.</td>
                      </tr>
                    ) : (
                      disposals.map((item) => (
                        <tr key={item.id}>
                          <td>{formatDate(item.disposal_date)}</td>
                          <td>{item.quantity_disposed || "—"}</td>
                          <td>{item.disposal_route}</td>
                          <td>{item.notes || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
}
