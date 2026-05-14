// src/pages/Reports/ProfitLoss.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "../../services/supabase";

const fmtDateUK = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : ""); // UK display/print
const ukStamp = () => dayjs().format("DDMMYYYY-HHmm"); // for file names

const DEFAULT_FROM = dayjs().startOf("month").format("YYYY-MM-DD");
const DEFAULT_TO = dayjs().format("YYYY-MM-DD");

const money = (n, ccy = "GBP") => {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy }).format(num);
  } catch {
    return `${ccy} ${num.toFixed(2)}`;
  }
};

export default function ProfitLoss() {
  const [fromDate, setFromDate] = useState(DEFAULT_FROM);
  const [toDate, setToDate] = useState(DEFAULT_TO);
  const [currency, setCurrency] = useState(
    () => (localStorage.getItem("prefs.currency") || "GBP").toUpperCase()
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // prevents double print
  const printingRef = useRef(false);

  // Tab title shows UK range
  useEffect(() => {
    document.title = `Profit & Loss — ${fmtDateUK(fromDate)} to ${fmtDateUK(toDate)} • BeezKnees`;
  }, [fromDate, toDate]);

  // React live to Settings → Default Currency changes
  useEffect(() => {
    const onCurrency = (evt) => {
      const next = (evt?.detail?.currency || localStorage.getItem("prefs.currency") || "GBP").toUpperCase();
      setCurrency(next);
    };
    window.addEventListener("prefs:currency", onCurrency);
    return () => window.removeEventListener("prefs:currency", onCurrency);
  }, []);

  const totals = useMemo(() => {
    const revenue = sales.reduce((a, r) => a + (Number(r.revenue) || 0), 0);
    const cogs = sales.reduce((a, r) => a + (Number(r.cogs_total) || 0), 0);
    const gross = revenue - cogs;
    const exp = expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0);
    const net = gross - exp;
    return { revenue, cogs, gross, expenses: exp, net };
  }, [sales, expenses]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not signed in.");

      const { data: orderRows, error: oErr } = await supabase
        .from("sales_orders")
        .select("id, sold_at")
        .eq("user_id", uid)
        .gte("sold_at", dayjs(fromDate).startOf("day").toISOString())
        .lte("sold_at", dayjs(toDate).endOf("day").toISOString());
      if (oErr) throw oErr;

      let saleRows = [];
      if (orderRows?.length) {
        const ids = orderRows.map((o) => o.id);
        const chunks = [];
        for (let i = 0; i < ids.length; i += 500) chunks.push(ids.slice(i, i + 500));
        const results = await Promise.all(
          chunks.map((batch) =>
            supabase
              .from("sales_lines")
              .select("order_id, product_name, product_type, unit, qty, unit_price, discount, cogs_per_unit_cached")
              .in("order_id", batch)
          )
        );
        saleRows = results.flatMap((r) => r.data || []);
        const when = new Map(orderRows.map((o) => [o.id, o.sold_at]));
        saleRows = saleRows
          .map((l) => {
            const qty = Number(l.qty || 0);
            const price = Number(l.unit_price || 0);
            const disc = Number(l.discount || 0);
            const cogsU = Number(l.cogs_per_unit_cached || 0);
            const revenue = qty * price - disc;
            const cogs_total = qty * cogsU;
            const profit = revenue - cogs_total;
            return {
              date: when.get(l.order_id),
              product_name: l.product_name,
              product_type: l.product_type,
              unit: l.unit || "unit",
              qty,
              unit_price: price,
              discount: disc,
              cogs_per_unit: cogsU,
              revenue,
              cogs_total,
              profit,
            };
          })
          .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
      }

      const { data: expenseRows, error: eErr } = await supabase
        .from("expenses")
        .select("occurred_at, category, vendor, amount, currency, invoice_number, notes")
        .gte("occurred_at", dayjs(fromDate).startOf("day").toISOString())
        .lte("occurred_at", dayjs(toDate).endOf("day").toISOString())
        .eq("user_id", uid);
      if (eErr) throw eErr;

      setSales(saleRows || []);
      setExpenses(expenseRows || []);
    } catch (err) {
      setErr(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- EXPORT CSV (UK dates everywhere) ---------- */
  const handleExportCSV = () => {
    const lines = [];
    // Top "page title" line in UK format
    lines.push(`Profit & Loss ${fmtDateUK(fromDate)} to ${fmtDateUK(toDate)}`, "");

    lines.push("Summary");
    lines.push(`Revenue,${totals.revenue}`);
    lines.push(`COGS,${totals.cogs}`);
    lines.push(`Gross Profit,${totals.gross}`);
    lines.push(`Expenses,${totals.expenses}`);
    lines.push(`Net Profit,${totals.net}`, "");

    lines.push("Sales");
    lines.push("Date,Product,Type,Qty,Unit,Unit price,Discount,COGS/unit,Gross,COGS,Profit");
    for (const r of sales) {
      lines.push(
        [
          fmtDateUK(r.date), // UK format in CSV
          csvSafe(r.product_name),
          csvSafe(r.product_type),
          r.qty,
          r.unit,
          r.unit_price,
          r.discount || 0,
          r.cogs_per_unit,
          r.revenue,
          r.cogs_total,
          r.profit,
        ].join(",")
      );
    }
    lines.push("");

    lines.push("Expenses");
    lines.push("Date,Category,Vendor,Amount,Invoice #,Notes");
    for (const ex of expenses) {
      lines.push(
        [
          fmtDateUK(ex.occurred_at), // UK format in CSV
          csvSafe(ex.category),
          csvSafe(ex.vendor || ""),
          ex.amount,
          csvSafe(ex.invoice_number || ""),
          csvSafe(ex.notes || ""),
        ].join(",")
      );
    }

    const csv = lines.join("\r\n");
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      // UK-ordered file name
      `profit_and_loss_${dayjs(fromDate).format("DDMMYYYY")}_to_${dayjs(toDate).format("DDMMYYYY")}_${ukStamp()}.csv`
    );
  };

  /* ---------- PRINT / PDF (UK dates in title + visible range) ---------- */
  const handlePrint = () => {
    if (printingRef.current) return;
    printingRef.current = true;

    const salesRows =
      sales.length === 0
        ? `<tr><td colspan="10" class="muted">No sales in this range.</td></tr>`
        : sales
            .map(
              (r) => `
          <tr>
            <td>${fmtDateUK(r.date)}</td>
            <td>${escapeHtml(r.product_name)}</td>
            <td>${escapeHtml(r.product_type)}</td>
            <td class="num">${r.qty} ${escapeHtml(r.unit)}</td>
            <td class="num">${money(r.unit_price, currency)}</td>
            <td class="num">${r.discount ? money(r.discount, currency) : "—"}</td>
            <td class="num">${money(r.cogs_per_unit, currency)}</td>
            <td class="num">${money(r.revenue, currency)}</td>
            <td class="num">${money(r.cogs_total, currency)}</td>
            <td class="num strong">${money(r.profit, currency)}</td>
          </tr>
        `
            )
            .join("");

    const expensesRows =
      expenses.length === 0
        ? `<tr><td colspan="6" class="muted">No expenses in this range.</td></tr>`
        : expenses
            .map(
              (ex) => `
          <tr>
            <td>${fmtDateUK(ex.occurred_at)}</td>
            <td>${escapeHtml(ex.category)}</td>
            <td>${escapeHtml(ex.vendor || "—")}</td>
            <td class="num">${money(ex.amount, ex.currency || currency)}</td>
            <td>${escapeHtml(ex.invoice_number || "—")}</td>
            <td>${escapeHtml(ex.notes || "—")}</td>
          </tr>
        `
            )
            .join("");

    const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Profit &amp; Loss ${fmtDateUK(fromDate)} to ${fmtDateUK(toDate)}</title>
<style>
  :root { --text:#111827; --muted:#6b7280; --border:#e5e7eb; --bg:#fff; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, "Helvetica Neue", Arial; color:var(--text); background:var(--bg); margin:24px; }
  h1 { font-size:20px; margin:0 0 16px; }
  .range { color:var(--muted); margin-bottom:16px; }
  .cards { display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; margin-bottom:18px; }
  .card { border:1px solid var(--border); border-radius:8px; padding:10px; }
  .label { font-size:10px; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
  .value { font-size:16px; font-weight:700; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th, td { border-bottom:1px solid var(--border); padding:6px 8px; text-align:left; vertical-align:top; }
  thead th { border-top:1px solid var(--border); background:#f9fafb; }
  .num { text-align:right; white-space:nowrap; }
  .strong { font-weight:700; }
  .muted { color:var(--muted); text-align:center; padding:12px 8px; }
  .section { margin-top:18px; }
  .section h2 { font-size:16px; margin:0 0 6px; }
  @media print { body { margin:12mm; } .cards { gap:8px; } }
</style>
</head>
<body>
  <h2>Profit &amp; Loss</h2>
  <div class="range">Range: ${fmtDateUK(fromDate)} – ${fmtDateUK(toDate)} • Currency: ${escapeHtml(currency)}</div>
  <div class="cards">
    <div class="card"><div class="label">Revenue</div><div class="value">${money(totals.revenue, currency)}</div></div>
    <div class="card"><div class="label">COGS</div><div class="value">${money(totals.cogs, currency)}</div></div>
    <div class="card"><div class="label">Gross Profit</div><div class="value">${money(totals.gross, currency)}</div></div>
    <div class="card"><div class="label">Expenses</div><div class="value">${money(totals.expenses, currency)}</div></div>
    <div class="card"><div class="label">Net Profit</div><div class="value">${money(totals.net, currency)}</div></div>
  </div>

  <div class="section">
    <h2>Sales</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Product</th><th>Type</th>
          <th class="num">Qty</th><th class="num">Unit price</th><th class="num">Discount</th>
          <th class="num">COGS / unit</th><th class="num">Gross</th><th class="num">COGS</th><th class="num">Profit</th>
        </tr>
      </thead>
      <tbody>${salesRows}</tbody>
      ${sales.length ? `<tfoot><tr>
        <td colspan="7" class="strong">Totals</td>
        <td class="num strong">${money(totals.revenue, currency)}</td>
        <td class="num strong">${money(totals.cogs, currency)}</td>
        <td class="num strong">${money(totals.gross, currency)}</td>
      </tr></tfoot>` : ""}
    </table>
  </div>

  <div class="section">
    <h2>Expenses</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Category</th><th>Vendor</th><th class="num">Amount</th><th>Invoice #</th><th>Notes</th>
        </tr>
      </thead>
      <tbody>${expensesRows}</tbody>
      ${expenses.length ? `<tfoot><tr>
        <td colspan="3" class="strong">Total Expenses</td>
        <td class="num strong">${money(totals.expenses, currency)}</td>
        <td colspan="2"></td>
      </tr></tfoot>` : ""}
    </table>
  </div>

  <script>
    // content-only; printing handled by parent via iframe onload
  </script>
</body></html>`;

    // Hidden iframe approach avoids popups and blank prints
    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "print-frame");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const cleanup = () => {
      try {
        document.body.removeChild(iframe);
      } catch {
        // ignore
      }
      printingRef.current = false;
    };

    const onLoaded = () => {
      try {
        const w = iframe.contentWindow;
        if (!w) {
          cleanup();
          return;
        }
        w.onafterprint = cleanup;
        setTimeout(() => {
          try {
            w.focus();
            w.print();
          } catch {
            cleanup();
          }
        }, 80);
      } catch {
        cleanup();
      }
    };

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      iframe.onload = onLoaded;
      doc.open();
      doc.write(html);
      doc.close();
    } else {
      cleanup();
    }
  };

  /* ---------- UI ---------- */
  const BTN_BASE =
    "inline-flex items-center justify-center h-10 px-4 rounded text-white font-medium transition whitespace-nowrap";
  const BTN_GREEN = "bg-green-700 hover:bg-green-800";
  const BTN_SLATE = "bg-slate-800 hover:bg-slate-900";
  const BTN_BLUE = "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Profit &amp; Loss</h2>
      {/* Visible UK range hint on page (helps users and matches print) */}
      <p className="text-sm text-gray-600 mb-4">
        Range: <strong>{fmtDateUK(fromDate)} to {fmtDateUK(toDate)}</strong>
      </p>

      <div className="border rounded p-4 mb-6">
        {/* STACKED layout: buttons first (top-left), filters underneath */}
        <div className="flex flex-col gap-4">
          {/* Buttons (top-left) */}
          <div className="flex flex-wrap items-start gap-3">
            <button type="button" onClick={load} disabled={loading} className={`${BTN_BASE} ${BTN_GREEN}`}>
              {loading ? "Loading…" : "Refresh"}
            </button>
            <button type="button" onClick={handleExportCSV} className={`${BTN_BASE} ${BTN_SLATE}`}>
              Export CSV
            </button>
            <button type="button" onClick={handlePrint} className={`${BTN_BASE} ${BTN_BLUE}`}>
              Print / Save PDF
            </button>
          </div>

          {/* Filters UNDER the buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:w-[680px]">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={fromDate}
                onChange={(evt) => setFromDate(evt.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={toDate}
                onChange={(evt) => setToDate(evt.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <input
                className="w-full border rounded px-3 py-2 font-mono"
                value={currency}
                onChange={(evt) =>
                  setCurrency(evt.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))
                }
              />
            </div>
          </div>
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <SummaryCard label="Revenue" value={money(totals.revenue, currency)} />
        <SummaryCard label="COGS" value={money(totals.cogs, currency)} />
        <SummaryCard label="Gross Profit" value={money(totals.gross, currency)} />
        <SummaryCard label="Expenses" value={money(totals.expenses, currency)} />
        <SummaryCard label="Net Profit" value={money(totals.net, currency)} strong />
      </div>

      {/* SALES */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Sales</h2>
        <div className="md:hidden space-y-3">
          {sales.length === 0 ? (
            <p className="text-gray-500">No sales in this range.</p>
          ) : (
            sales.map((r, idx) => (
              <div key={idx} className="border rounded p-3 bg-white">
                <div className="text-sm text-gray-600 mb-2">{fmtDateUK(r.date)}</div>
                <div className="text-sm">
                  <span className="font-medium">Product:</span> {r.product_name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Type:</span> {r.product_type}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Qty:</span> {r.qty} {r.unit}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Unit price:</span> {money(r.unit_price, currency)}
                </div>
                {r.discount ? (
                  <div className="text-sm">
                    <span className="font-medium">Discount:</span> {money(r.discount, currency)}
                  </div>
                ) : null}
                <div className="text-sm">
                  <span className="font-medium">COGS/unit:</span> {money(r.cogs_per_unit, currency)}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <KV label="Gross" value={money(r.revenue, currency)} />
                  <KV label="COGS" value={money(r.cogs_total, currency)} />
                  <KV label="Profit" value={money(r.profit, currency)} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <TH>Date</TH>
                  <TH>Product</TH>
                  <TH>Type</TH>
                  <TH className="text-right">Qty</TH>
                  <TH className="text-right">Unit price</TH>
                  <TH className="text-right">Discount</TH>
                  <TH className="text-right">COGS / unit</TH>
                  <TH className="text-right">Gross</TH>
                  <TH className="text-right">COGS</TH>
                  <TH className="text-right">Profit</TH>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={10}>
                      No sales in this range.
                    </td>
                  </tr>
                ) : (
                  sales.map((r, idx) => (
                    <tr key={idx} className="border-b">
                      <TD>{fmtDateUK(r.date)}</TD>
                      <TD>{r.product_name}</TD>
                      <TD>{r.product_type}</TD>
                      <TD className="text-right">
                        {r.qty} {r.unit}
                      </TD>
                      <TD className="text-right">{money(r.unit_price, currency)}</TD>
                      <TD className="text-right">{r.discount ? money(r.discount, currency) : "—"}</TD>
                      <TD className="text-right">{money(r.cogs_per_unit, currency)}</TD>
                      <TD className="text-right">{money(r.revenue, currency)}</TD>
                      <TD className="text-right">{money(r.cogs_total, currency)}</TD>
                      <TD className="text-right font-medium">{money(r.profit, currency)}</TD>
                    </tr>
                  ))
                )}
              </tbody>
              {sales.length > 0 && (
                <tfoot>
                  <tr className="border-t font-semibold">
                    <TD colSpan={7}>Totals</TD>
                    <TD className="text-right">{money(totals.revenue, currency)}</TD>
                    <TD className="text-right">{money(totals.cogs, currency)}</TD>
                    <TD className="text-right">{money(totals.gross, currency)}</TD>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </section>

      {/* EXPENSES */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Expenses</h2>
        <div className="md:hidden space-y-3">
          {expenses.length === 0 ? (
            <p className="text-gray-500">No expenses in this range.</p>
          ) : (
            expenses.map((ex, idx) => (
              <div key={idx} className="border rounded p-3 bg-white">
                <div className="text-sm text-gray-600 mb-2">{fmtDateUK(ex.occurred_at)}</div>
                <div className="text-sm">
                  <span className="font-medium">Category:</span> {ex.category}
                </div>
                {ex.vendor && (
                  <div className="text-sm">
                    <span className="font-medium">Vendor:</span> {ex.vendor}
                  </div>
                )}
                <div className="mt-2 text-sm">
                  <span className="font-medium">Amount:</span>{" "}
                  {money(ex.amount, ex.currency || currency)}
                </div>
                {ex.invoice_number && (
                  <div className="text-xs text-gray-600 mt-1">Invoice: {ex.invoice_number}</div>
                )}
                {ex.notes && <div className="text-xs text-gray-600 mt-1">{ex.notes}</div>}
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <TH>Date</TH>
                  <TH>Category</TH>
                  <TH>Vendor</TH>
                  <TH className="text-right">Amount</TH>
                  <TH>Invoice #</TH>
                  <TH>Notes</TH>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={6}>
                      No expenses in this range.
                    </td>
                  </tr>
                ) : (
                  expenses.map((ex, idx) => (
                    <tr key={idx} className="border-b">
                      <TD>{fmtDateUK(ex.occurred_at)}</TD>
                      <TD>{ex.category}</TD>
                      <TD>{ex.vendor || "—"}</TD>
                      <TD className="text-right">{money(ex.amount, ex.currency || currency)}</TD>
                      <TD>{ex.invoice_number || "—"}</TD>
                      <TD className="max-w-[420px] truncate" title={ex.notes || ""}>
                        {ex.notes || "—"}
                      </TD>
                    </tr>
                  ))
                )}
              </tbody>
              {expenses.length > 0 && (
                <tfoot>
                  <tr className="border-t font-semibold">
                    <TD colSpan={3}>Total Expenses</TD>
                    <TD className="text-right">{money(totals.expenses, currency)}</TD>
                    <TD colSpan={2}></TD>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

/* helpers */
function SummaryCard({ label, value, strong = false }) {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-lg ${strong ? "font-extrabold" : "font-semibold"} mt-1`}>{value}</div>
    </div>
  );
}
function TH({ children, className = "" }) {
  return <th className={`py-2 pr-3 ${className}`}>{children}</th>;
}
function TD({ children, className = "", colSpan }) {
  return (
    <td className={`py-2 pr-3 align-top ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
function KV({ label, value }) {
  return (
    <div className="border rounded p-2 bg-gray-50">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function csvSafe(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
