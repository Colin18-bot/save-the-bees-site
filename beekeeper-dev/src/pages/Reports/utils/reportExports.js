import dayjs from "dayjs";
import * as XLSX from "xlsx";

const esc = (v) => {
  if (v == null) return "";

  const s = String(Array.isArray(v) ? v.join("; ") : v)
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ");

  if (s.includes('"') || s.includes(",")) {
    return `"${s.replace(/"/g, '""')}"`;
  }

  return s;
};

const excelText = (value) => {
  if (value == null || value === "") return "";
  return `="${String(value).replace(/"/g, '""')}"`;
};

const yesNo = (value) => (value ? "Yes" : "No");

const downloadCSV = (filename, rows, headers) => {
  const headerLine = headers.map(esc).join(",");
  const body = rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");

  const blob = new Blob(["\uFEFF" + headerLine + "\n" + body], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};

const ukStamp = () => dayjs().format("DDMMYYYY-HHmm");
const fmtDate = (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "");

export function buildApiaryRows({ apiaries }) {
  return apiaries.map((a) => ({
    name: a.name || "",
    address: a.address || "",
    latitude: a.latitude ?? "",
    longitude: a.longitude ?? "",
    established_date: fmtDate(a.established_date),
    location_type: a.location_type || "",
    site_setting: a.site_setting || "",
    notes: a.notes || "",
    photo_url: a.photo_url || "",
    default_apiary: yesNo(a.is_default),
    archived: a.archived_at ? "Yes" : "No",
    created: fmtDate(a.created_at),
  }));
}

export function buildHiveRows({ hives, apiaryName }) {
  return hives.map((h) => ({
    name: h.name || "",
    apiary: apiaryName.get(h.apiary_id) || "",
    hive_type: h.hive_type || "",
    hive_type_other: h.hive_type_other || "",
    date_established: fmtDate(h.date_established),
    status: h.status || "",
    nfc_uid: h.nfc_uid || "",
    nfc_link_enabled: yesNo(h.nfc_link_enabled),
    notes: h.notes || "",
    photo_url: h.photo_url || "",
    archived: h.archived_at ? "Yes" : "No",
    created: fmtDate(h.created_at),
  }));
}

export function downloadApiariesCSV({ apiaryRows }) {
  const headers = [
    "name",
    "address",
    "latitude",
    "longitude",
    "established_date",
    "location_type",
    "site_setting",
    "notes",
    "photo_url",
    "default_apiary",
    "archived",
    "created",
  ];

  downloadCSV(`apiaries-${ukStamp()}.csv`, apiaryRows, headers);
}

export function downloadHivesCSV({ hiveRows }) {
  const headers = [
    "name",
    "apiary",
    "hive_type",
    "hive_type_other",
    "date_established",
    "status",
    "nfc_uid",
    "nfc_link_enabled",
    "notes",
    "photo_url",
    "archived",
    "created",
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
  return inspections.map((x) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(x);
    const analysis = getInspectionAnalysis(x);

    return {
      date: fmtUK(x.date),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      inspection_type: inspectionTypeLabel(x.inspection_type),
      weather: formatWeatherForDisplay(x.weather),
      weather_observed: x.weather_observed || "",
      colony_behavior: valueWithOther(x.colony_behavior, x.colony_behavior_other),
      environmental_signs: valueWithOther(x.environmental_signs, x.environmental_signs_other),
      hive_population: x.hive_population || "",
      frames_of_bees: excelText(x.frames_of_bees),
      brood_pattern: x.brood_pattern || "",
      brood_box_congestion: x.brood_box_congestion || "",
      food_stores: x.food_stores || "",
      queen_cells: x.queen_cells || "",
      queen_status: valueWithOther(x.queen_status, x.queen_status_other),
      varroa_seen: boolYesNo(x.varroa_seen),
      signs_disease: boolYesNo(x.signs_disease),
      disease_types: valueWithOther(x.disease_types, x.disease_other),
      signs_pests: boolYesNo(x.signs_pests),
      pest_types: valueWithOther(x.pest_types, x.pest_other),
      notes: x.notes || "",
      photos: Array.isArray(x.photos) ? x.photos.length : 0,
      photo_paths: Array.isArray(x.photos) ? x.photos.join("; ") : "",
      health_score: analysis.healthScore,
      health_band: analysis.healthBand?.label || "",
      insights: analysis.insights.map((i) => i.title).join("; "),
      recommendations: analysis.recommendations.join("; "),
      archived: x.archived_at ? "Yes" : "No",
    };
  });
}

export function downloadInspectionsCSV({ inspectionRows }) {
  const headers = [
    "date",
    "apiary",
    "hive",
    "inspection_type",
    "weather",
    "weather_observed",
    "colony_behavior",
    "environmental_signs",
    "hive_population",
    "frames_of_bees",
    "brood_pattern",
    "brood_box_congestion",
    "food_stores",
    "queen_cells",
    "queen_status",
    "varroa_seen",
    "signs_disease",
    "disease_types",
    "signs_pests",
    "pest_types",
    "notes",
    "photos",
    "photo_paths",
    "health_score",
    "health_band",
    "insights",
    "recommendations",
    "archived",
  ];

  downloadCSV(`inspections-${ukStamp()}.csv`, inspectionRows, headers);
}

export function downloadCombinedCSV({
  apiaryRows,
  hiveRows,
  inspectionRows,
  todos,
  logbook,
  nfcHives,
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

      return {
        wch: Math.min(Math.max(longestValue + 2, 12), 50),
      };
    });

    if (worksheet["!ref"]) {
      worksheet["!autofilter"] = {
        ref: worksheet["!ref"],
      };
    }

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
    "due_date",
    "apiary",
    "hive",
    "title",
    "notes",
    "related_inspection",
    "status",
    "archived",
  ];

  const rows = todos.map((t) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(t);

    return {
      due_date: fmtUK(t.due_date || t.created_at),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      title: t.title || "",
      notes: t.notes || "",
      related_inspection: relatedInspectionLabel(t),
      status: t.status || "",
      archived: t.archived_at ? "Yes" : "No",
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
    "date",
    "apiary",
    "hive",
    "title",
    "text",
    "photo_url",
    "related_inspection",
    "archived",
  ];

  const rows = logbook.map((l) => {
    const { resolvedApiaryId, resolvedHiveId } = effectiveIds(l);

    return {
      date: fmtUK(l.date || l.created_at),
      apiary: apiaryName.get(resolvedApiaryId) || "",
      hive: displayHive(resolvedHiveId, resolvedApiaryId),
      title: l.log_type || l.title || "",
      text: l.entry || l.notes || "",
      photo_url: l.photo_url || "",
      related_inspection: relatedInspectionLabel(l),
      archived: l.archived_at ? "Yes" : "No",
    };
  });

  downloadCSV(`logbook-${ukStamp()}.csv`, rows, headers);
}

export function downloadNfcCSV({ nfcHives, apiaryName }) {
  const headers = ["apiary", "hive", "nfc_uid", "archived"];

  const rows = nfcHives.map((h) => ({
    apiary: apiaryName.get(h.apiary_id) || "",
    hive: h.name || "Unnamed Hive",
    nfc_uid: h.nfc_uid || "",
    archived: h.archived_at ? "Yes" : "No",
  }));

  downloadCSV(`nfc-tags-${ukStamp()}.csv`, rows, headers);
}
