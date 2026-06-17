import { useRef, useState } from "react";
import "./App.css";

import InspectionDetails from "./components/InspectionDetails";
import SiteWideIssues from "./components/SiteWideIssues";
import AssetSchedule from "./components/AssetSchedule";

function formatDateUK(dateString) {
  if (!dateString) return "________";

  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) return dateString;

  return `${day}/${month}/${year}`;
}

function getArchiveLabel(item) {
  const site = item?.inspection?.siteName || item?.name || "Unnamed inspection";
  const area = item?.inspection?.area ? ` - ${item.inspection.area}` : "";
  return `${site}${area}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInspectorText(inspection) {
  const names = [
    inspection.inspectorOne,
    inspection.inspectorTwo,
    inspection.inspector1,
    inspection.inspector2,
    inspection.inspector,
    inspection.inspectorName,
  ]
    .map((name) => String(name || "").trim())
    .filter(Boolean);

  return names.length > 0 ? names.join(" and ") : "________";
}

function getPhotoSrc(snag) {
  return snag.photo || snag.photoPreview || snag.image || snag.imageUrl || "";
}

async function imageToDataUrl(src) {
  if (!src) return "";
  if (src.startsWith("data:")) return src;

  try {
    const response = await fetch(src);
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

const navItems = [
  { id: "details", label: "Details", icon: "⌂" },
  { id: "site", label: "Site", icon: "✓" },
  { id: "assets", label: "Assets", icon: "▦" },
  { id: "archive", label: "Archive", icon: "◴" },
  { id: "export", label: "Export", icon: "⇩" },
];

export default function App() {
  const fileInputRef = useRef(null);

  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("details");

  const [inspection, setInspection] = useState({
    siteName: "",
    developer: "",
    area: "",
    sectionType: "Section 38",
    inspectionDate: "",
    inspectorOne: "",
    inspectorTwo: "",
  });

  const [selectedSiteFaults, setSelectedSiteFaults] = useState([]);
  const [snags, setSnags] = useState([]);

  const [archivedInspections, setArchivedInspections] = useState(() => {
    return JSON.parse(localStorage.getItem("archivedInspections")) || [];
  });

  const currentInspectionTitle = inspection.siteName || "New Inspection";

  function printReport() {
    window.print();
  }

  function exportInspection() {
    const data = {
      inspection,
      selectedSiteFaults,
      snags,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${inspection.siteName || "site-inspection"}.json`;
    link.click();
  }

  function importInspection(event) {
    const file = event.target.files[0];
    if (!file) return;

    const confirmed = window.confirm(
      "Import this inspection? This will replace the inspection currently on screen."
    );

    if (!confirmed) return;

    const reader = new FileReader();

    reader.onload = () => {
      const data = JSON.parse(reader.result);

      setInspection(data.inspection || inspection);
      setSelectedSiteFaults(data.selectedSiteFaults || []);
      setSnags(data.snags || []);
      setActiveTab("details");
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  function archiveInspection() {
    const archiveItem = {
      id: Date.now(),
      archivedAt: new Date().toISOString(),
      name: inspection.siteName || "Unnamed inspection",
      date: inspection.inspectionDate || new Date().toISOString().slice(0, 10),
      inspection,
      selectedSiteFaults,
      snags,
    };

    const updatedArchive = [archiveItem, ...archivedInspections];

    setArchivedInspections(updatedArchive);
    localStorage.setItem("archivedInspections", JSON.stringify(updatedArchive));

    alert("Inspection archived. You can retrieve it from the Archive tab.");
    setActiveTab("archive");
  }

  function retrieveInspection(item) {
    const confirmed = window.confirm(
      "Retrieve this archived inspection? This will replace the inspection currently on screen."
    );

    if (!confirmed) return;

    setInspection(item.inspection);
    setSelectedSiteFaults(item.selectedSiteFaults || []);
    setSnags(item.snags || []);
    setActiveTab("details");
  }

  function deleteArchivedInspection(id) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this archived inspection?"
    );

    if (!confirmed) return;

    const updatedArchive = archivedInspections.filter((item) => item.id !== id);

    setArchivedInspections(updatedArchive);
    localStorage.setItem("archivedInspections", JSON.stringify(updatedArchive));
  }

  async function exportWord() {
    alert(
  "Inspector 1: " +
    inspection.inspectorOne +
    "\nInspector 2: " +
    inspection.inspectorTwo
);
    const inspectorText = getInspectorText(inspection);

    const siteFaultsHtml =
      selectedSiteFaults.length > 0
        ? `<ul>${selectedSiteFaults
            .map((fault) => `<li>${escapeHtml(fault)}</li>`)
            .join("")}</ul>`
        : "<p>No site-wide issues recorded.</p>";

    const snagRowsHtml =
      snags.length > 0
        ? (
            await Promise.all(
              snags.map(async (snag) => {
                const originalPhoto = getPhotoSrc(snag);
                const photoSrc = await imageToDataUrl(originalPhoto);

                return `
                  <tr>
                    <td>${escapeHtml(snag.street)}</td>
                    <td>
                      ${escapeHtml(snag.assetType)}<br>
                      <strong>${escapeHtml(snag.reference)}</strong>
                    </td>
                    <td>
                      <ul>
                        ${(snag.faults || [])
                          .map((fault) => `<li>${escapeHtml(fault)}</li>`)
                          .join("")}
                      </ul>
                    </td>
                    <td>
                      ${
                        photoSrc
                          ? `<img src="${photoSrc}" width="180" style="width:180px;height:auto;" />`
                          : ""
                      }
                    </td>
                  </tr>
                `;
              })
            )
          ).join("")
        : `<tr><td colspan="4">No asset defects recorded.</td></tr>`;

    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; font-size: 11pt; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
            th { background: #eee; }
            img { max-width: 180px; height: auto; }
          </style>
        </head>
        <body>
          <h1>Street Lighting Inspection Report</h1>

          <table>
            <tr>
              <th>Site Name</th>
              <td>${escapeHtml(inspection.siteName || "________")}</td>
            </tr>
            <tr>
              <th>Developer</th>
              <td>${escapeHtml(inspection.developer || "________")}</td>
            </tr>
            <tr>
              <th>Area / Phase</th>
              <td>${escapeHtml(inspection.area || "________")}</td>
            </tr>
            <tr>
              <th>Section Type</th>
              <td>${escapeHtml(inspection.sectionType || "________")}</td>
            </tr>
            <tr>
              <th>Inspection Date</th>
              <td>${escapeHtml(formatDateUK(inspection.inspectionDate))}</td>
            </tr>
            <tr>
              <th>Inspector(s)</th>
              <td>${escapeHtml(inspectorText)}</td>
            </tr>
          </table>

          <p>
            The development at <strong>${escapeHtml(
              inspection.siteName || "________"
            )}</strong>
            was inspected on <strong>${escapeHtml(
              formatDateUK(inspection.inspectionDate)
            )}</strong>
            by <strong>${escapeHtml(inspectorText)}</strong>
            and I can confirm that it was not up to the required standard of adoption
            for the following reasons:
          </p>

          <h2>Site-Wide Issues</h2>
          ${siteFaultsHtml}

          <h2>Asset Defect Schedule</h2>
          <table>
            <thead>
              <tr>
                <th>Street</th>
                <th>Asset / Reference</th>
                <th>Defects</th>
                <th>Photo</th>
              </tr>
            </thead>
            <tbody>
              ${snagRowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${inspection.siteName || "site-inspection"}-report.doc`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className={`app ${theme}`}>
      <div className="mobile-shell">
        <header className="topbar screen-only">
          <button
            type="button"
            className="theme-toggle"
            aria-label="Toggle light and dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>

          <div className="brand-block">
            <span className="brand-kicker">Section 38 / 278</span>
            <h1>Site Inspections</h1>
            <p>{currentInspectionTitle}</p>
          </div>

          <div className="inspection-stats">
            <span>{selectedSiteFaults.length} site issue(s)</span>
            <span>{snags.length} asset snag(s)</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={importInspection}
          />
        </header>

        <main className="container">
          <div className="report-intro print-only">
            <h1>Street Lighting Inspection Report</h1>

            <p>
              The development at{" "}
              <strong>{inspection.siteName || "________"}</strong> was inspected
              on <strong>{formatDateUK(inspection.inspectionDate)}</strong> by{" "}
              <strong>{getInspectorText(inspection)}</strong> and I can confirm
              that it was not up to the required standard of adoption for the
              following reasons:
            </p>
          </div>

          <div className={activeTab === "details" ? "tab-panel" : "hidden-panel"}>
            <InspectionDetails
              inspection={inspection}
              setInspection={setInspection}
            />
          </div>

          <div className={activeTab === "site" ? "tab-panel" : "hidden-panel"}>
            <SiteWideIssues
              selectedSiteFaults={selectedSiteFaults}
              setSelectedSiteFaults={setSelectedSiteFaults}
            />
          </div>

          <div className={activeTab === "assets" ? "tab-panel" : "hidden-panel"}>
            <AssetSchedule snags={snags} setSnags={setSnags} />
          </div>

          <div className={activeTab === "archive" ? "tab-panel" : "hidden-panel"}>
            <section className="card screen-only">
              <div className="section-heading">
                <span>Saved work</span>
                <h2>Archive</h2>
              </div>

              <button type="button" className="primary-action" onClick={archiveInspection}>
                Archive Current Inspection
              </button>

              <h3>Saved Inspections</h3>

              {archivedInspections.length === 0 ? (
                <p className="empty-state">No archived inspections yet.</p>
              ) : (
                <div className="archive-list">
                  {archivedInspections.map((item) => (
                    <div className="archive-item" key={item.id}>
                      <strong>{getArchiveLabel(item)}</strong>
                      <span>Inspection date: {formatDateUK(item.date)}</span>
                      <span>
                        Developer: {item.inspection?.developer || "Not entered"}
                      </span>
                      <span>
                        {item.selectedSiteFaults?.length || 0} site issue(s) /{" "}
                        {item.snags?.length || 0} asset snag(s)
                      </span>

                      <div className="mini-actions">
                        <button type="button" onClick={() => retrieveInspection(item)}>
                          Retrieve
                        </button>

                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => deleteArchivedInspection(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className={activeTab === "export" ? "tab-panel" : "hidden-panel"}>
            <section className="card screen-only export-card">
              <div className="section-heading">
                <span>Reports & data</span>
                <h2>Export</h2>
              </div>

              <div className="action-stack">
                <button type="button" className="primary-action" onClick={exportWord}>
                  Export Word Report
                </button>

                <button type="button" onClick={printReport}>
                  PDF / Print
                </button>

                <button type="button" onClick={exportInspection}>
                  Export Reusable Data File
                </button>

                <button type="button" onClick={() => fileInputRef.current.click()}>
                  Import Reusable Data File
                </button>
              </div>

              <p className="help-text">
                Word/PDF are for sending reports. Export/import data is for saving
                and reopening inspections later.
              </p>
            </section>
          </div>
        </main>

        <nav className="bottom-nav screen-only" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeTab === item.id ? "active" : ""}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="print-only">
          <SiteWideIssues
            selectedSiteFaults={selectedSiteFaults}
            setSelectedSiteFaults={setSelectedSiteFaults}
          />

          <AssetSchedule snags={snags} setSnags={setSnags} />
        </div>
      </div>
    </div>
  );
}