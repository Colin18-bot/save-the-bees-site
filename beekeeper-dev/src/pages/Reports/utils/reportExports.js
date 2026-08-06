import dayjs from "dayjs";
import * as XLSX from "xlsx";

const esc = (value) => {
  if (value == null) return "";

  const text = String(Array.isArray(value) ? value.join("; ") : value)
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ");

  if (text.includes('"') || text.includes(",")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const excelText = (value) => {
  if (value == null || value === "") return "";
  return `="${String(value).replace(/"/g, '""')}"`;
};

const yesNo = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not recorded";
};

const titleCase = (value, fallback = "Not recorded") => {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const expectedQueenColour = (year) => {
  const digit = Number(String(year ?? "").slice(-1));
  if ([1, 6].includes(digit)) return "White";
  if ([2, 7].includes(digit)) return "Yellow";
  if ([3, 8].includes(digit)) return "Red";
  if ([4, 9].includes(digit)) return "Green";
  if ([5, 0].includes(digit)) return "Blue";
  return "";
};

const downloadCSV = (filename, rows, headers) => {
  const headerLine = headers.map(esc).join(",");
  const body = rows.map((row) => headers.map((header) => esc(row[header])).join(",")).join("\n");

  const blob = new Blob(["\uFEFF" + headerLine + "\n" + body], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const ukStamp = () => dayjs().format("DDMMYYYY-HHmm");
const fmtDate = (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "");

export function buildApiaryRows({ apiaries }) {
  return apiaries.map((apiary) => ({
    name: apiary.name || "",
    address: apiary.address || "",
    latitude: apiary.latitude ?? "",
    longitude: apiary.longitude ?? "",
    established_date: fmtDate(apiary.established_date),
    location_type: apiary.location_type || "",
    site_setting: apiary.site_setting || "",
    notes: apiary.notes || "",
    photo_url: apiary.photo_url || "",
    default_apiary: yesNo(apiary.is_default),
    archived: apiary.archived_at ? "Yes" : "No",
    created: fmtDate(apiary.created_at),
  }));
}

export function buildHiveRows({ hives, apiaryName }) {
  return hives.map((hive) => ({
    name: hive.name || "",
    apiary: apiaryName.get(hive.apiary_id) || "",
    hive_type: hive.hive_type || "",
    hive_type_other: hive.hive_type_other || "",
    date_established: fmtDate(hive.date_established),
    status: hive.status || "",
    nfc_uid: hive.nfc_uid || "",
    nfc_link_enabled: yesNo(hive.nfc_link_enabled),
    notes: hive.notes || "",
    photo_url: hive.photo_url || "",
    archived: hive.archived_at ? "Yes" : "No",
    created: fmtDate(hive.created_at),
  }));
}

export function downloadApiariesCSV({ apiaryRows }) {
  const headers = [
    "name", "address", "latitude", "longitude", "established_date", "location_type",
    "site_setting", "notes", "photo_url", "default_apiary", "archived", "created",
  ];
  downloadCSV(`apiaries-${ukStamp()}.csv`, apiaryRows, headers);
}

export function downloadHivesCSV({ hiveRows }) {
  const headers = [
    "name", "apiary", "hive_type", "hive_type_other", "date_established", "status",
    "nfc_uid", "nfc_link_enabled", "notes", "photo_url", "archived", "created",
  ];
  downloadCSV(`hives-${ukStamp()}.csv`, hiveRows, headers);
}

export function buildInspectionRows({
  inspections,
  effectiveIds,
  apiaryName,
  displayHive,
  fmtUK,
  inspectionTypeLabel,
  formatWeatherForDisplay,
  valueWithOther,
  boolYesNo,
  getInspectionAnalysis,
}) {
  return inspections.map((inspection) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(inspection);
    const analysis = getInspectionAnalysis(inspection);

    return {
      date: fmtUK(inspection.date),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      inspection_type: inspectionTypeLabel(inspection.inspection_type),
      weather: formatWeatherForDisplay(inspection.weather),
      weather_observed: inspection.weather_observed || "",
      colony_behavior: valueWithOther(inspection.colony_behavior, inspection.colony_behavior_other),
      environmental_signs: valueWithOther(inspection.environmental_signs, inspection.environmental_signs_other),
      hive_population: inspection.hive_population || "",
      frames_of_bees: excelText(inspection.frames_of_bees),
      brood_pattern: inspection.brood_pattern || "",
      brood_box_congestion: inspection.brood_box_congestion || "",
      food_stores: inspection.food_stores || "",
      queen_cells: inspection.queen_cells || "",
      queen_status: valueWithOther(inspection.queen_status, inspection.queen_status_other),
      varroa_seen: boolYesNo(inspection.varroa_seen),
      signs_disease: boolYesNo(inspection.signs_disease),
      disease_types: valueWithOther(inspection.disease_types, inspection.disease_other),
      signs_pests: boolYesNo(inspection.signs_pests),
      pest_types: valueWithOther(inspection.pest_types, inspection.pest_other),
      notes: inspection.notes || "",
      photos: Array.isArray(inspection.photos) ? inspection.photos.length : 0,
      photo_paths: Array.isArray(inspection.photos) ? inspection.photos.join("; ") : "",
      health_score: analysis.healthScore,
      health_band: analysis.healthBand?.label || "",
      insights: analysis.insights.map((item) => item.title).join("; "),
      recommendations: analysis.recommendations.join("; "),
      archived: inspection.archived_at ? "Yes" : "No",
    };
  });
}

export function downloadInspectionsCSV({ inspectionRows }) {
  const headers = [
    "date", "apiary", "hive", "inspection_type", "weather", "weather_observed",
    "colony_behavior", "environmental_signs", "hive_population", "frames_of_bees",
    "brood_pattern", "brood_box_congestion", "food_stores", "queen_cells", "queen_status",
    "varroa_seen", "signs_disease", "disease_types", "signs_pests", "pest_types", "notes",
    "photos", "photo_paths", "health_score", "health_band", "insights", "recommendations", "archived",
  ];
  downloadCSV(`inspections-${ukStamp()}.csv`, inspectionRows, headers);
}

export function buildQueenRows({ queenReport, apiaryName, displayHive }) {
  const allAssignments = queenReport.allAssignments || queenReport.assignments || [];

  return (queenReport.queens || []).map((queen) => {
    const currentAssignment = allAssignments.find(
      (assignment) => assignment.queen_id === queen.id && !assignment.ended_on
    );
    const hiveId = currentAssignment?.hive_id || "";
    const hiveRow = queenReport.currentByHive?.find((row) => row.hive?.id === hiveId);
    const apiaryId = hiveRow?.hive?.apiary_id || "";
    const expectedColour = expectedQueenColour(queen.queen_year);
    const actualColour = queen.actual_colour || (queen.marked ? expectedColour : "Unmarked");

    return {
      reference: queen.reference || "Queen record",
      queen_year: queen.queen_year || "",
      expected_colour: expectedColour,
      actual_colour: actualColour || "",
      marked: yesNo(queen.marked),
      clipped: yesNo(queen.clipped),
      origin: queen.origin || "",
      supplier: queen.supplier || "",
      emerged_on: fmtDate(queen.emerged_on),
      introduced_on: fmtDate(queen.introduced_on),
      status: titleCase(queen.status, "Active"),
      current_apiary: apiaryName.get(apiaryId) || "",
      current_hive: hiveId ? displayHive(hiveId, apiaryId) : "",
      current_since: fmtDate(currentAssignment?.started_on),
      notes: queen.notes || "",
      archived: queen.archived_at ? "Yes" : "No",
      created: fmtDate(queen.created_at),
    };
  });
}

export function buildQueenAssignmentRows({ queenReport, apiaryName, displayHive }) {
  const queensById = new Map((queenReport.queens || []).map((queen) => [queen.id, queen]));
  const hivesById = new Map(
    (queenReport.currentByHive || []).map((row) => [row.hive.id, row.hive])
  );

  return (queenReport.assignments || []).map((assignment) => {
    const queen = queensById.get(assignment.queen_id);
    const hive = hivesById.get(assignment.hive_id);
    const apiaryId = hive?.apiary_id || "";

    return {
      queen_reference: queen?.reference || "Queen record",
      apiary: apiaryName.get(apiaryId) || "",
      hive: assignment.hive_id ? displayHive(assignment.hive_id, apiaryId) : "",
      started_on: fmtDate(assignment.started_on),
      start_reason: titleCase(assignment.start_reason, ""),
      ended_on: fmtDate(assignment.ended_on),
      end_reason: titleCase(assignment.end_reason, ""),
      notes: assignment.notes || "",
    };
  });
}

export function buildQueenEventRows({ queenReport, apiaryName, displayHive }) {
  const queensById = new Map((queenReport.queens || []).map((queen) => [queen.id, queen]));
  const hivesById = new Map(
    (queenReport.currentByHive || []).map((row) => [row.hive.id, row.hive])
  );

  return (queenReport.events || []).map((event) => {
    const hiveId = event.hive_id || event.destination_hive_id || event.source_hive_id || "";
    const apiaryId = hivesById.get(hiveId)?.apiary_id || "";

    return {
      event_date: fmtDate(event.event_date || event.created_at),
      queen_reference: queensById.get(event.queen_id)?.reference || "",
      apiary: apiaryName.get(apiaryId) || "",
      hive: hiveId ? displayHive(hiveId, apiaryId) : "",
      event_type: titleCase(event.event_type, "Queen event"),
      title: event.title || "",
      detail: event.detail || "",
    };
  });
}

export function buildQueenProcessRows({ queenReport, apiaryName, displayHive }) {
  const queensById = new Map((queenReport.queens || []).map((queen) => [queen.id, queen]));
  const hivesById = new Map(
    (queenReport.currentByHive || []).map((row) => [row.hive.id, row.hive])
  );

  return (queenReport.processes || []).map((process) => {
    const apiaryId = hivesById.get(process.hive_id)?.apiary_id || "";

    return {
      queen_reference: queensById.get(process.queen_id)?.reference || "",
      apiary: apiaryName.get(apiaryId) || "",
      hive: process.hive_id ? displayHive(process.hive_id, apiaryId) : "",
      process_type: titleCase(process.process_type, "Queen process"),
      method: process.method || "",
      status: titleCase(process.status, "Active"),
      started_on: fmtDate(process.started_on),
      expected_check_on: fmtDate(process.expected_check_on),
      ended_on: fmtDate(process.ended_on),
      notes: process.notes || "",
    };
  });
}

export function buildQueenSnapshotRows({ queenReport, apiaryName, displayHive }) {
  return (queenReport.snapshots || []).map((inspection) => {
    const snapshot = inspection.queen_snapshot || {};
    const expectedColour = snapshot.expected_colour || expectedQueenColour(snapshot.queen_year);
    const actualColour = snapshot.actual_colour || (snapshot.marked ? expectedColour : "Unmarked");

    return {
      inspection_date: fmtDate(inspection.date || snapshot.inspection_date),
      apiary: apiaryName.get(inspection.apiary_id) || "",
      hive: displayHive(inspection.hive_id, inspection.apiary_id),
      queen_reference: snapshot.reference || "Queen record",
      queen_year: snapshot.queen_year || "",
      expected_colour: expectedColour || "",
      actual_colour: actualColour || "",
      marked: yesNo(snapshot.marked),
      clipped: yesNo(snapshot.clipped),
      origin: snapshot.origin || "",
      supplier: snapshot.supplier || "",
      emerged_on: fmtDate(snapshot.emerged_on),
      introduced_on: fmtDate(snapshot.introduced_on),
      status: titleCase(snapshot.status, ""),
      assignment_started_on: fmtDate(snapshot.assignment_started_on),
      assignment_start_reason: titleCase(snapshot.assignment_start_reason, ""),
      notes: snapshot.notes || "",
      inspection_archived: inspection.archived_at ? "Yes" : "No",
    };
  });
}

export function downloadQueensCSV({ queenRows }) {
  const headers = [
    "reference", "queen_year", "expected_colour", "actual_colour", "marked", "clipped",
    "origin", "supplier", "emerged_on", "introduced_on", "status", "current_apiary",
    "current_hive", "current_since", "notes", "archived", "created",
  ];
  downloadCSV(`queen-records-${ukStamp()}.csv`, queenRows, headers);
}

export function downloadCombinedCSV({
  apiaryRows,
  hiveRows,
  inspectionRows,
  todos,
  logbook,
  nfcHives,
  queenRows = [],
  queenAssignmentRows = [],
  queenEventRows = [],
  queenProcessRows = [],
  queenSnapshotRows = [],
  effectiveIds,
  apiaryName,
  displayHive,
  relatedInspectionLabel,
  fmtUK,
}) {
  const workbook = XLSX.utils.book_new();

  const addWorksheet = (name, rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const headers = Object.keys(rows[0] || {});

    worksheet["!cols"] = headers.map((header) => {
      const longestValue = rows.reduce((longest, row) => {
        const value = row?.[header];
        const text = Array.isArray(value) ? value.join("; ") : value == null ? "" : String(value);
        return Math.max(longest, text.length);
      }, header.length);

      return { wch: Math.min(Math.max(longestValue + 2, 12), 50) };
    });

    if (worksheet["!ref"]) worksheet["!autofilter"] = { ref: worksheet["!ref"] };
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  };

  const taskRows = todos.map((task) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(task);
    return {
      due_date: fmtUK(task.due_date || task.created_at),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      title: task.title || "",
      notes: task.notes || "",
      related_inspection: relatedInspectionLabel(task),
      status: task.status || "",
      archived: task.archived_at ? "Yes" : "No",
    };
  });

  const logbookRows = logbook.map((entry) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(entry);
    return {
      date: fmtUK(entry.date || entry.created_at),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      title: entry.log_type || entry.title || "",
      text: entry.entry || entry.notes || "",
      photo_url: entry.photo_url || "",
      related_inspection: relatedInspectionLabel(entry),
      archived: entry.archived_at ? "Yes" : "No",
    };
  });

  const nfcRows = nfcHives.map((hive) => ({
    apiary: apiaryName.get(hive.apiary_id) || "",
    hive: hive.name || "Unnamed Hive",
    nfc_uid: hive.nfc_uid || "",
    archived: hive.archived_at ? "Yes" : "No",
  }));

  addWorksheet("Apiaries", apiaryRows);
  addWorksheet("Hives", hiveRows);
  addWorksheet("Inspections", inspectionRows);
  addWorksheet("Tasks", taskRows);
  addWorksheet("Logbook", logbookRows);
  addWorksheet("Queens", queenRows);
  addWorksheet("Queen Assignments", queenAssignmentRows);
  addWorksheet("Queen Events", queenEventRows);
  addWorksheet("Queen Processes", queenProcessRows);
  addWorksheet("Queen Snapshots", queenSnapshotRows);
  addWorksheet("NFC Tags", nfcRows);

  if (workbook.SheetNames.length === 0) {
    window.alert("There is no report data available to export. Generate the report first.");
    return;
  }

  XLSX.writeFile(workbook, `hivetag-complete-report-${ukStamp()}.xlsx`);
}

export function downloadTodosCSV({
  todos,
  effectiveIds,
  apiaryName,
  displayHive,
  relatedInspectionLabel,
  fmtUK,
}) {
  const headers = [
    "due_date", "apiary", "hive", "title", "notes", "related_inspection", "status", "archived",
  ];
  const rows = todos.map((task) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(task);
    return {
      due_date: fmtUK(task.due_date || task.created_at),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      title: task.title || "",
      notes: task.notes || "",
      related_inspection: relatedInspectionLabel(task),
      status: task.status || "",
      archived: task.archived_at ? "Yes" : "No",
    };
  });
  downloadCSV(`tasks-${ukStamp()}.csv`, rows, headers);
}

export function downloadLogbookCSV({
  logbook,
  effectiveIds,
  apiaryName,
  displayHive,
  relatedInspectionLabel,
  fmtUK,
}) {
  const headers = [
    "date", "apiary", "hive", "title", "text", "photo_url", "related_inspection", "archived",
  ];
  const rows = logbook.map((entry) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(entry);
    return {
      date: fmtUK(entry.date || entry.created_at),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      title: entry.log_type || entry.title || "",
      text: entry.entry || entry.notes || "",
      photo_url: entry.photo_url || "",
      related_inspection: relatedInspectionLabel(entry),
      archived: entry.archived_at ? "Yes" : "No",
    };
  });
  downloadCSV(`logbook-${ukStamp()}.csv`, rows, headers);
}

export function downloadNfcCSV({ nfcHives, apiaryName }) {
  const headers = ["apiary", "hive", "nfc_uid", "archived"];
  const rows = nfcHives.map((hive) => ({
    apiary: apiaryName.get(hive.apiary_id) || "",
    hive: hive.name || "Unnamed Hive",
    nfc_uid: hive.nfc_uid || "",
    archived: hive.archived_at ? "Yes" : "No",
  }));
  downloadCSV(`nfc-tags-${ukStamp()}.csv`, rows, headers);
}
