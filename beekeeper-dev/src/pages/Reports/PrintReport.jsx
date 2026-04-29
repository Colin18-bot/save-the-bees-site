// src/pages/Reports/PrintReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { supabase } from "../../services/supabase";
import { formatDerivedWeather, getTempUnit } from "../../utils/formatDerivedWeather";

// Helpers: UK display vs ISO for inputs/queries
const fmtUK = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "");
const DEFAULT_FROM = dayjs().subtract(30, "day").format("YYYY-MM-DD"); // ISO for inputs
const DEFAULT_TO = dayjs().format("YYYY-MM-DD"); // ISO for inputs
const safeParseDerivedWeather = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s.startsWith("{")) return null;

  try {
    const obj = JSON.parse(s);
    if (!obj || typeof obj !== "object") return null;

    const desc = typeof obj.desc === "string" ? obj.desc : "";
    const temp_c = Number.isFinite(Number(obj.temp_c)) ? Number(obj.temp_c) : null;

    if (!desc && temp_c === null) return null;
    return { desc, temp_c };
  } catch {
    return null;
  }
};

const formatWeatherForDisplay = (rawWeather) => {
  const parsed = safeParseDerivedWeather(rawWeather);
  if (!parsed) return rawWeather || "";

  const unit = getTempUnit();
  return formatDerivedWeather(parsed, unit);
};

export default function PrintReport() {
  const location = useLocation();

  // lookups
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);

  // subscription (Premium gating)
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const isPremium = subscriptionLevel === "premium";

  // filters
  const [apiaryId, setApiaryId] = useState("");
  const [hiveId, setHiveId] = useState("");
  const [fromDate, setFromDate] = useState(DEFAULT_FROM); // ISO
  const [toDate, setToDate] = useState(DEFAULT_TO); // ISO
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includeInspections, setIncludeInspections] = useState(true);
  const [includeTodos, setIncludeTodos] = useState(true);
  const [includeLogbook, setIncludeLogbook] = useState(true);

  // IMPORTANT: NFC toggle starts OFF by default.
  // Premium users can enable it; Free users never see it.
  const [includeNfc, setIncludeNfc] = useState(false);

  // data
  const [inspections, setInspections] = useState([]);
  const [todos, setTodos] = useState([]);
  const [logbook, setLogbook] = useState([]);
  const [nfcHives, setNfcHives] = useState([]);
  const [inspectionById, setInspectionById] = useState(new Map());

  // schema detection (start false; enable after safe probe)
  const [hasTodoInspectionCol, setHasTodoInspectionCol] = useState(false);
  const [hasLogInspectionCol, setHasLogInspectionCol] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update tab title with UK date range
  useEffect(() => {
    document.title = `Reports & Exports — ${fmtUK(fromDate)}–${fmtUK(toDate)}`;
  }, [fromDate, toDate]);

  // Load subscription level for Premium-only NFC options
useEffect(() => {
  (async () => {
    try {
      const { data: userWrap } = await supabase.auth.getUser();
      const uid = userWrap?.user?.id;

      if (!uid) {
        setSubscriptionLevel("free");
        setIncludeNfc(false);
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", uid)
        .maybeSingle();

      if (profErr) {
        setSubscriptionLevel("free");
        setIncludeNfc(false);
        return;
      }

      const level = profile?.subscription_level || "free";
      setSubscriptionLevel(level);

      if (level !== "premium") {
        setIncludeNfc(false);
      }
    } catch {
      setSubscriptionLevel("free");
      setIncludeNfc(false);
    }
  })();
}, []);

  // name lookups
  const apiaryName = useMemo(
    () => new Map(apiaries.map((a) => [a.id, a.name || "Unnamed Apiary"])),
    [apiaries]
  );

  const hiveMap = useMemo(
    () =>
      new Map(
        hives.map((h) => [
          h.id,
          { name: h.name || "Unnamed Hive", apiary_id: h.apiary_id },
        ])
      ),
    [hives]
  );

  const hivesForApiary = useMemo(() => {
    if (!apiaryId) return hives;
    return hives.filter((h) => String(h.apiary_id) === String(apiaryId));
  }, [hives, apiaryId]);

  useEffect(() => {
    (async () => {
      const [{ data: apiaryRows }, { data: hiveRows }] = await Promise.all([
        supabase
          .from("apiaries")
          .select("id, name, archived_at")
          .order("name", { ascending: true }),
        supabase
          .from("hives")
          .select("id, name, apiary_id, archived_at")
          .order("name", { ascending: true }),
      ]);
      setApiaries(apiaryRows || []);
      setHives(hiveRows || []);

      const params = new URLSearchParams(location.search);
      const aid = params.get("apiary_id");
      if (aid) setApiaryId(aid);
    })();
  }, [location.search]);

  const hiveName = (id) => hiveMap.get(id)?.name || "Unknown Hive";
  const apiaryForHive = (hid) => (hid ? hiveMap.get(hid)?.apiary_id || "" : "");

  // nice display for hive column (handles “All hives”)
  const displayHive = (hid, aid) => {
    if (hid) return hiveName(hid);
    if (aid) return "All hives";
    return "Unknown Hive";
  };

  const effectiveIds = (row) => {
    const i = row?.inspection_id ? inspectionById.get(row.inspection_id) : null;
    const resolvedHiveId = row.hive_id || i?.hive_id || "";
    const resolvedApiaryId =
      row.apiary_id ||
      apiaryForHive(row.hive_id) ||
      i?.apiary_id ||
      apiaryForHive(i?.hive_id) ||
      "";
    return { resolvedHiveId, resolvedApiaryId };
  };

  const missingInspectionCol = (err) =>
    err &&
    /column .*inspection_id.* does not exist/i.test(String(err?.message || err));

  const runQuery = async () => {
    setLoading(true);
    setError("");
    try {
      let inspectionsData = [];
      let todosData = [];
      let logbookData = [];
      let nfcData = [];

      // SAFETY: Free users must never query NFC, even if state is tampered
      const allowNfc = isPremium && includeNfc;

      // ---- SAFE schema detection (no 400s) ----
      const detectHasInspectionId = async (table) => {
        const { data, error } = await supabase.from(table).select("*").range(0, 0);
        if (error) return false;
        if (!data || !data.length) return false;
        return Object.prototype.hasOwnProperty.call(data[0], "inspection_id");
      };

      try {
        const [todoHasInsp, logHasInsp] = await Promise.all([
          detectHasInspectionId("todos"),
          detectHasInspectionId("logbook"),
        ]);
        setHasTodoInspectionCol(todoHasInsp);
        setHasLogInspectionCol(logHasInsp);
      } catch {
        // ignore
      }

      // ---------- Inspections ----------
      if (includeInspections) {
        let q = supabase
          .from("inspections")
          .select(
            // ✅ includes derived + observed
            "id, apiary_id, hive_id, date, weather, weather_observed, colony_behavior, hive_population, brood_pattern, food_stores, signs_disease, disease_types, signs_pests, pest_types, notes, archived_at, created_at"
          );

        if (!includeArchived) q = q.is("archived_at", null);
        if (hiveId) q = q.eq("hive_id", hiveId);
        else if (apiaryId) q = q.eq("apiary_id", apiaryId);
        if (fromDate) q = q.gte("date", fromDate);
        if (toDate) q = q.lte("date", toDate);

        const { data, error } = await q;
        if (error) throw error;
        inspectionsData = data || [];
      }

      // inspection ids for linking (if needed)
      let inspIds = [];
      const needInspIds =
        (includeTodos && hasTodoInspectionCol) || (includeLogbook && hasLogInspectionCol);

      if (needInspIds && (hiveId || apiaryId)) {
        let iq = supabase.from("inspections").select("id");
        if (hiveId) iq = iq.eq("hive_id", hiveId);
        else if (apiaryId) iq = iq.eq("apiary_id", apiaryId);
        const { data, error } = await iq;
        if (error) throw error;
        inspIds = (data || []).map((r) => r.id);
      }

      // ---------- Task To-Dos ----------
      if (includeTodos) {
        const buildTodoQuery = (mode, byInspection = false) => {
          let q = supabase.from("todos").select("*");
          if (!includeArchived) q = q.is("archived_at", null);
          if (byInspection) q = q.in("inspection_id", inspIds);

          if (mode === "due") {
            if (fromDate) q = q.gte("due_date", fromDate);
            if (toDate) q = q.lte("due_date", toDate);
          } else {
            q = q.is("due_date", null);
            if (fromDate) q = q.gte("created_at", fromDate);
            if (toDate)
              q = q.lte(
                "created_at",
                dayjs(toDate).add(1, "day").format("YYYY-MM-DD")
              );
          }

          if (hiveId) q = q.eq("hive_id", hiveId);
          else if (apiaryId) q = q.eq("apiary_id", apiaryId);

          return q;
        };

        const { data: A1, error: E1 } = await buildTodoQuery("due");
        if (E1) throw E1;

        const { data: A2, error: E2 } = await buildTodoQuery("created");
        if (E2) throw E2;

        let B1 = [];
        let B2 = [];
        if (hasTodoInspectionCol && inspIds.length) {
          const r1 = await buildTodoQuery("due", true);
          if (!missingInspectionCol(r1.error)) {
            if (r1.error) throw r1.error;
            B1 = r1.data || [];
          } else {
            setHasTodoInspectionCol(false);
          }

          const r2 = await buildTodoQuery("created", true);
          if (!missingInspectionCol(r2.error)) {
            if (r2.error) throw r2.error;
            B2 = r2.data || [];
          } else {
            setHasTodoInspectionCol(false);
          }
        }

        const map = new Map();
        for (const r of A1 || []) map.set(r.id, r);
        for (const r of A2 || []) map.set(r.id, r);
        for (const r of B1 || []) map.set(r.id, r);
        for (const r of B2 || []) map.set(r.id, r);
        todosData = Array.from(map.values());
      }

      // ---------- Logbook ----------
      if (includeLogbook) {
        const buildLogQuery = (mode, byInspection = false) => {
          let q = supabase.from("logbook").select("*");
          if (!includeArchived) q = q.is("archived_at", null);
          if (byInspection) q = q.in("inspection_id", inspIds);

          if (mode === "date") {
            if (fromDate) q = q.gte("date", fromDate);
            if (toDate) q = q.lte("date", toDate);
          } else {
            q = q.is("date", null);
            if (fromDate) q = q.gte("created_at", fromDate);
            if (toDate)
              q = q.lte(
                "created_at",
                dayjs(toDate).add(1, "day").format("YYYY-MM-DD")
              );
          }

          if (hiveId) q = q.eq("hive_id", hiveId);
          else if (apiaryId) q = q.eq("apiary_id", apiaryId);

          return q;
        };

        const { data: A1, error: E1 } = await buildLogQuery("date");
        if (E1) throw E1;

        const { data: A2, error: E2 } = await buildLogQuery("created");
        if (E2) throw E2;

        let B1 = [];
        let B2 = [];
        if (hasLogInspectionCol && inspIds.length) {
          const r1 = await buildLogQuery("date", true);
          if (!missingInspectionCol(r1.error)) {
            if (r1.error) throw r1.error;
            B1 = r1.data || [];
          } else {
            setHasLogInspectionCol(false);
          }

          const r2 = await buildLogQuery("created", true);
          if (!missingInspectionCol(r2.error)) {
            if (r2.error) throw r2.error;
            B2 = r2.data || [];
          } else {
            setHasLogInspectionCol(false);
          }
        }

        const map = new Map();
        for (const r of A1 || []) map.set(r.id, r);
        for (const r of A2 || []) map.set(r.id, r);
        for (const r of B1 || []) map.set(r.id, r);
        for (const r of B2 || []) map.set(r.id, r);
        logbookData = Array.from(map.values());
      }

      // ---------- NFC TAGGED HIVES ----------
      if (allowNfc) {
        let q = supabase
          .from("hives")
          .select("id, name, apiary_id, nfc_uid, archived_at")
          .not("nfc_uid", "is", null);

        if (!includeArchived) q = q.is("archived_at", null);
        if (hiveId) q = q.eq("id", hiveId);
        else if (apiaryId) q = q.eq("apiary_id", apiaryId);

        const { data, error } = await q;
        if (error) throw error;
        nfcData = data || [];
      } else {
        nfcData = [];
      }

      // build inspection lookup (for rows that only have inspection_id)
      if (hasTodoInspectionCol || hasLogInspectionCol) {
        const refIds = new Set(
          [
            ...(hasTodoInspectionCol ? todosData : []),
            ...(hasLogInspectionCol ? logbookData : []),
          ]
            .map((r) => r.inspection_id)
            .filter(Boolean)
        );
        if (refIds.size) {
          const ids = Array.from(refIds);
          const batches = [];
          for (let i = 0; i < ids.length; i += 500) {
            batches.push(
              supabase
                .from("inspections")
                .select("id, apiary_id, hive_id, date")
                .in("id", ids.slice(i, i + 500))
            );
          }
          const results = await Promise.all(batches);
          const all = results.flatMap((r) => r.data || []);
          setInspectionById(new Map(all.map((r) => [r.id, r])));
        } else {
          setInspectionById(new Map());
        }
      } else {
        setInspectionById(new Map());
      }

      setInspections(inspectionsData);
      setTodos(todosData);
      setLogbook(logbookData);
      setNfcHives(nfcData);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  // CSV helpers
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const downloadCSV = (filename, rows, headers) => {
    const headerLine = headers.map(esc).join(",");
    const body = rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");
    const blob = new Blob([headerLine + "\n" + body], {
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

  const downloadCombinedCSV = () => {
    const allowNfc = isPremium && includeNfc;

    // ✅ Added weather_observed column
    const headers = [
      "type",
      "date",
      "apiary",
      "hive",
      "title",
      "weather",
      "weather_observed",
      "colony_behavior",
      "hive_population",
      "brood_pattern",
      "food_stores",
      "signs_disease",
      "disease_types",
      "signs_pests",
      "pest_types",
      "notes",
      "due_date",
      "status",
      "created_at",
      "archived",
    ];

    const rows = [];

    if (includeInspections) {
      for (const x of inspections) {
        const { resolvedApiaryId, resolvedHiveId } = effectiveIds(x);
        rows.push({
          type: "Inspection",
          date: fmtUK(x.date),
          apiary: apiaryName.get(resolvedApiaryId) || "",
          hive: displayHive(resolvedHiveId, resolvedApiaryId),
          title: `Inspection ${fmtUK(x.date)}`,
          weather: formatWeatherForDisplay(x.weather),
          weather_observed: x.weather_observed || "",
          colony_behavior: x.colony_behavior || "",
          hive_population: x.hive_population || "",
          brood_pattern: x.brood_pattern || "",
          food_stores: x.food_stores || "",
          signs_disease: x.signs_disease ? "Yes" : "No",
          disease_types: Array.isArray(x.disease_types)
            ? x.disease_types.join("; ")
            : x.disease_types || "",
          signs_pests: x.signs_pests ? "Yes" : "No",
          pest_types: Array.isArray(x.pest_types)
            ? x.pest_types.join("; ")
            : x.pest_types || "",
          notes: x.notes || "",
          due_date: "",
          status: "",
          created_at: fmtUK(x.created_at),
          archived: x.archived_at ? "Yes" : "No",
        });
      }
    }

    if (includeTodos) {
      for (const t of todos) {
        const { resolvedApiaryId, resolvedHiveId } = effectiveIds(t);
        rows.push({
          type: "To-Do",
          date: fmtUK(t.due_date || t.created_at),
          apiary: apiaryName.get(resolvedApiaryId) || "",
          hive: displayHive(resolvedHiveId, resolvedApiaryId),
          title: t.title || "",
          weather: "",
          weather_observed: "",
          colony_behavior: "",
          hive_population: "",
          brood_pattern: "",
          food_stores: "",
          signs_disease: "",
          disease_types: "",
          signs_pests: "",
          pest_types: "",
          notes: t.notes || "",
          due_date: fmtUK(t.due_date),
          status: t.status || "",
          created_at: fmtUK(t.created_at),
          archived: t.archived_at ? "Yes" : "No",
        });
      }
    }

    if (includeLogbook) {
      for (const l of logbook) {
        const { resolvedApiaryId, resolvedHiveId } = effectiveIds(l);
        const text = l.entry || l.notes || l.note || l.content || l.text || l.message || "";
        rows.push({
          type: "Logbook",
          date: fmtUK(l.date || l.created_at),
          apiary: apiaryName.get(resolvedApiaryId) || "",
          hive: displayHive(resolvedHiveId, resolvedApiaryId),
          title: l.log_type || "",
          weather: "",
          weather_observed: "",
          colony_behavior: "",
          hive_population: "",
          brood_pattern: "",
          food_stores: "",
          signs_disease: "",
          disease_types: "",
          signs_pests: "",
          pest_types: "",
          notes: text,
          due_date: "",
          status: "",
          created_at: fmtUK(l.created_at),
          archived: l.archived_at ? "Yes" : "No",
        });
      }
    }

    // Premium-only NFC in combined CSV
    if (allowNfc) {
      for (const h of nfcHives) {
        rows.push({
          type: "NFC Tag",
          date: "",
          apiary: apiaryName.get(h.apiary_id) || "",
          hive: h.name || "Unnamed Hive",
          title: "NFC tag",
          weather: "",
          weather_observed: "",
          colony_behavior: "",
          hive_population: "",
          brood_pattern: "",
          food_stores: "",
          signs_disease: "",
          disease_types: "",
          signs_pests: "",
          pest_types: "",
          notes: h.nfc_uid ? `NFC UID: ${h.nfc_uid}` : "",
          due_date: "",
          status: "",
          created_at: "",
          archived: h.archived_at ? "Yes" : "No",
        });
      }
    }

    downloadCSV(`bees-report-${ukStamp()}.csv`, rows, headers);
  };

  const downloadInspectionsCSV = () => {
    // ✅ Added weather_observed column
    const headers = [
      "date",
      "apiary",
      "hive",
      "weather",
      "weather_observed",
      "colony_behavior",
      "hive_population",
      "brood_pattern",
      "food_stores",
      "signs_disease",
      "disease_types",
      "signs_pests",
      "pest_types",
      "notes",
      "created_at",
      "archived",
    ];

    const rows = inspections.map((x) => {
      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(x);
      return {
        date: fmtUK(x.date),
        apiary: apiaryName.get(resolvedApiaryId) || "",
        hive: displayHive(resolvedHiveId, resolvedApiaryId),
        weather: formatWeatherForDisplay(x.weather),
        weather_observed: x.weather_observed || "",
        colony_behavior: x.colony_behavior || "",
        hive_population: x.hive_population || "",
        brood_pattern: x.brood_pattern || "",
        food_stores: x.food_stores || "",
        signs_disease: x.signs_disease ? "Yes" : "No",
        disease_types: Array.isArray(x.disease_types)
          ? x.disease_types.join("; ")
          : x.disease_types || "",
        signs_pests: x.signs_pests ? "Yes" : "No",
        pest_types: Array.isArray(x.pest_types)
          ? x.pest_types.join("; ")
          : x.pest_types || "",
        notes: x.notes || "",
        created_at: fmtUK(x.created_at),
        archived: x.archived_at ? "Yes" : "No",
      };
    });

    downloadCSV(`inspections-${ukStamp()}.csv`, rows, headers);
  };

  const downloadTodosCSV = () => {
    const headers = [
      "due_date",
      "apiary",
      "hive",
      "title",
      "notes",
      "status",
      "created_at",
      "archived",
    ];
    const rows = todos.map((t) => {
      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(t);
      return {
        due_date: fmtUK(t.due_date),
        apiary: apiaryName.get(resolvedApiaryId) || "",
        hive: displayHive(resolvedHiveId, resolvedApiaryId),
        title: t.title || "",
        notes: t.notes || "",
        status: t.status || "",
        created_at: fmtUK(t.created_at),
        archived: t.archived_at ? "Yes" : "No",
      };
    });
    downloadCSV(`tasks-${ukStamp()}.csv`, rows, headers);
  };

  const downloadLogbookCSV = () => {
    const headers = ["date", "apiary", "hive", "title", "text", "archived"];
    const rows = logbook.map((l) => {
      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(l);
      const text = l.entry || l.notes || l.note || l.content || l.text || l.message || "";
      return {
        date: fmtUK(l.date || l.created_at),
        apiary: apiaryName.get(resolvedApiaryId) || "",
        hive: displayHive(resolvedHiveId, resolvedApiaryId),
        title: l.log_type || "",
        text,
        archived: l.archived_at ? "Yes" : "No",
      };
    });
    downloadCSV(`logbook-${ukStamp()}.csv`, rows, headers);
  };

  const downloadNfcCSV = () => {
    // Safety: Free users should never be able to generate this
    if (!isPremium) return;

    const headers = ["apiary", "hive", "nfc_uid", "archived"];
    const rows = nfcHives.map((h) => ({
      apiary: apiaryName.get(h.apiary_id) || "",
      hive: h.name || "Unnamed Hive",
      nfc_uid: h.nfc_uid || "",
      archived: h.archived_at ? "Yes" : "No",
    }));
    downloadCSV(`nfc-tags-${ukStamp()}.csv`, rows, headers);
  };

  return (
    <div className="p-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* sticky back bar */}
      <div className="no-print sticky top-0 z-30 -mx-6 px-6 py-3 bg-white/90 backdrop-blur border-b flex items-center justify-between">
        <Link to="/dashboard#print" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mt-4">Reports &amp; Exports</h1>
      <p className="text-sm text-gray-600 mb-4">
        Date range: <strong>{fmtUK(fromDate)}–{fmtUK(toDate)}</strong>
      </p>

      {/* Controls */}
      <div className="no-print border rounded p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Apiary</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={apiaryId}
              onChange={(e) => {
                setApiaryId(e.target.value);
                const selected = hiveMap.get(hiveId);
                if (
                  e.target.value &&
                  selected &&
                  String(selected.apiary_id) !== String(e.target.value)
                ) {
                  setHiveId("");
                }
              }}
            >
              <option value="">All Apiaries</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.archived_at ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hive</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={hiveId}
              onChange={(e) => setHiveId(e.target.value)}
            >
              <option value="">All Hives{apiaryId ? " in Apiary" : ""}</option>
              {hivesForApiary.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                  {h.archived_at ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            />
            <span>Include archived</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeInspections}
              onChange={(e) => setIncludeInspections(e.target.checked)}
            />
            <span>Inspections</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeTodos}
              onChange={(e) => setIncludeTodos(e.target.checked)}
            />
            <span>Tasks</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeLogbook}
              onChange={(e) => setIncludeLogbook(e.target.checked)}
            />
            <span>Logbook</span>
          </label>

          {/* Premium-only NFC toggle */}
          {isPremium && (
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeNfc}
                onChange={(e) => setIncludeNfc(e.target.checked)}
              />
              <span>NFC tags</span>
            </label>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={runQuery}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Loading…" : "Generate Report"}
          </button>

          <button
            onClick={downloadCombinedCSV}
            className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Download CSV (Combined)
          </button>

          <button
            onClick={downloadInspectionsCSV}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
            disabled={loading || !inspections.length}
          >
            CSV: Inspections
          </button>

          <button
            onClick={downloadTodosCSV}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
            disabled={loading || !todos.length}
          >
            CSV: Tasks
          </button>

          <button
            onClick={downloadLogbookCSV}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
            disabled={loading || !logbook.length}
          >
            CSV: Logbook
          </button>

          {/* Premium-only NFC CSV button */}
          {isPremium && (
            <button
              onClick={downloadNfcCSV}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
              disabled={loading || !nfcHives.length || !includeNfc}
              title={!includeNfc ? "Enable NFC tags to export NFC CSV" : ""}
            >
              CSV: NFC tags
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Results */}
      <div className="space-y-8">
        {includeInspections && (
          <section className="card border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">Inspections</h2>
            {inspections.length === 0 ? (
              <p className="text-gray-500">No matching inspections.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Apiary</th>
                      <th className="py-2 pr-3">Hive</th>
                      <th className="py-2 pr-3">Weather (derived)</th>
                      <th className="py-2 pr-3">Weather (observed)</th>
                      <th className="py-2 pr-3">Colony</th>
                      <th className="py-2 pr-3">Population</th>
                      <th className="py-2 pr-3">Brood</th>
                      <th className="py-2 pr-3">Stores</th>
                      <th className="py-2 pr-3">Disease</th>
                      <th className="py-2 pr-3">Pests</th>
                      <th className="py-2 pr-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map((x) => {
                      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(x);
                      return (
                        <tr key={x.id} className="border-b align-top">
                          <td className="py-2 pr-3 whitespace-nowrap">{fmtUK(x.date)}</td>
                          <td className="py-2 pr-3">{apiaryName.get(resolvedApiaryId) || ""}</td>
                          <td className="py-2 pr-3">
                            {displayHive(resolvedHiveId, resolvedApiaryId)}
                          </td>
                          <td className="py-2 pr-3">{formatWeatherForDisplay(x.weather)}</td>
                          <td className="py-2 pr-3">{x.weather_observed || ""}</td>
                          <td className="py-2 pr-3">{x.colony_behavior || ""}</td>
                          <td className="py-2 pr-3">{x.hive_population || ""}</td>
                          <td className="py-2 pr-3">{x.brood_pattern || ""}</td>
                          <td className="py-2 pr-3">{x.food_stores || ""}</td>
                          <td className="py-2 pr-3">
                            {x.signs_disease
                              ? Array.isArray(x.disease_types)
                                ? x.disease_types.join(", ")
                                : "Yes"
                              : "No"}
                          </td>
                          <td className="py-2 pr-3">
                            {x.signs_pests
                              ? Array.isArray(x.pest_types)
                                ? x.pest_types.join(", ")
                                : "Yes"
                              : "No"}
                          </td>
                          <td className="py-2 pr-3">{x.notes || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {includeTodos && (
          <section className="card border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">Tasks</h2>
            {todos.length === 0 ? (
              <p className="text-gray-500">No matching tasks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">Due</th>
                      <th className="py-2 pr-3">Apiary</th>
                      <th className="py-2 pr-3">Hive</th>
                      <th className="py-2 pr-3">Title</th>
                      <th className="py-2 pr-3">Notes</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map((t) => {
                      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(t);
                      return (
                        <tr key={t.id} className="border-b align-top">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {fmtUK(t.due_date || t.created_at)}
                          </td>
                          <td className="py-2 pr-3">{apiaryName.get(resolvedApiaryId) || ""}</td>
                          <td className="py-2 pr-3">
                            {displayHive(resolvedHiveId, resolvedApiaryId)}
                          </td>
                          <td className="py-2 pr-3">{t.title || ""}</td>
                          <td className="py-2 pr-3">{t.notes || ""}</td>
                          <td className="py-2 pr-3">{t.status || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {includeLogbook && (
          <section className="card border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">Logbook</h2>
            {logbook.length === 0 ? (
              <p className="text-gray-500">No matching log entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Apiary</th>
                      <th className="py-2 pr-3">Hive</th>
                      <th className="py-2 pr-3">Title</th>
                      <th className="py-2 pr-3">Text</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logbook.map((l) => {
                      const { resolvedApiaryId, resolvedHiveId } = effectiveIds(l);
                      const text =
                        l.entry || l.notes || l.note || l.content || l.text || l.message || "";
                      return (
                        <tr key={l.id} className="border-b align-top">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {fmtUK(l.date || l.created_at)}
                          </td>
                          <td className="py-2 pr-3">{apiaryName.get(resolvedApiaryId) || ""}</td>
                          <td className="py-2 pr-3">
                            {displayHive(resolvedHiveId, resolvedApiaryId)}
                          </td>
                          <td className="py-2 pr-3">{l.log_type || ""}</td>
                          <td className="py-2 pr-3">{text}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Premium-only NFC results section */}
        {isPremium && includeNfc && (
          <section className="card border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">NFC Tags</h2>
            <p className="text-xs text-gray-600 mb-2">
              Shows hives that currently have an NFC tag linked. This respects the Apiary/Hive and
              archived filters, but not the date range.
            </p>
            {nfcHives.length === 0 ? (
              <p className="text-gray-500">No NFC tags found for this filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">Apiary</th>
                      <th className="py-2 pr-3">Hive</th>
                      <th className="py-2 pr-3">NFC Tag ID</th>
                      <th className="py-2 pr-3">Archived</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nfcHives.map((h) => (
                      <tr key={h.id} className="border-b align-top">
                        <td className="py-2 pr-3">{apiaryName.get(h.apiary_id) || ""}</td>
                        <td className="py-2 pr-3">{h.name || "Unnamed Hive"}</td>
                        <td className="py-2 pr-3">
                          <code className="px-1.5 py-0.5 bg-gray-50 border rounded text-[11px] break-all">
                            {h.nfc_uid}
                          </code>
                        </td>
                        <td className="py-2 pr-3">{h.archived_at ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}