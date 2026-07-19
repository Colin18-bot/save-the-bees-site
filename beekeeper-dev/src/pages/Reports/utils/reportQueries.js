export async function loadReportData({
  supabase,
  dayjs,
  includeInspections,
  includeTodos,
  includeLogbook,
  includeNfc,
  includeArchived,
  isPremium,
  apiaryId,
  hiveId,
  fromDate,
  toDate,
}) {
  let apiariesData = [];
  let hivesData = [];
  let inspectionsData = [];
  let todosData = [];
  let logbookData = [];
  let nfcData = [];

  let apiaryQuery = supabase.from("apiaries").select("*");
  if (!includeArchived) apiaryQuery = apiaryQuery.is("archived_at", null);
  if (apiaryId) apiaryQuery = apiaryQuery.eq("id", apiaryId);

  const { data: apiariesRows, error: apiariesError } = await apiaryQuery.order("name", {
    ascending: true,
  });
  if (apiariesError) throw apiariesError;
  apiariesData = apiariesRows || [];

  let hiveQuery = supabase.from("hives").select("*");
  if (!includeArchived) hiveQuery = hiveQuery.is("archived_at", null);
  if (hiveId) hiveQuery = hiveQuery.eq("id", hiveId);
  else if (apiaryId) hiveQuery = hiveQuery.eq("apiary_id", apiaryId);

  const { data: hivesRows, error: hivesError } = await hiveQuery.order("name", {
    ascending: true,
  });
  if (hivesError) throw hivesError;
  hivesData = hivesRows || [];

  if (includeInspections) {
    let q = supabase.from("inspections").select("*");

    if (!includeArchived) q = q.is("archived_at", null);
    if (hiveId) q = q.eq("hive_id", hiveId);
    else if (apiaryId) q = q.eq("apiary_id", apiaryId);
    if (fromDate) q = q.gte("date", fromDate);
    if (toDate) q = q.lte("date", toDate);

    const { data, error } = await q.order("date", { ascending: false });
    if (error) throw error;

    inspectionsData = data || [];
  }

  let inspectionIdsForLinks = [];

  if (hiveId || apiaryId) {
    let iq = supabase.from("inspections").select("id");

    if (hiveId) iq = iq.eq("hive_id", hiveId);
    else if (apiaryId) iq = iq.eq("apiary_id", apiaryId);

    const { data } = await iq;
    inspectionIdsForLinks = (data || []).map((r) => r.id);
  }

  if (includeTodos) {
    const buildTodoQuery = (mode) => {
      let q = supabase.from("todos").select("*");

      if (!includeArchived) q = q.is("archived_at", null);

      if (mode === "due") {
        if (fromDate) q = q.gte("due_date", fromDate);
        if (toDate) q = q.lte("due_date", toDate);
      } else {
        q = q.is("due_date", null);
        if (fromDate) q = q.gte("created_at", fromDate);
        if (toDate) {
          q = q.lte("created_at", dayjs(toDate).add(1, "day").format("YYYY-MM-DD"));
        }
      }

      if (hiveId) q = q.eq("hive_id", hiveId);
      else if (apiaryId) q = q.eq("apiary_id", apiaryId);

      return q;
    };

    const [{ data: A1, error: E1 }, { data: A2, error: E2 }] = await Promise.all([
      buildTodoQuery("due"),
      buildTodoQuery("created"),
    ]);

    if (E1) throw E1;
    if (E2) throw E2;

    const map = new Map();

    for (const r of A1 || []) map.set(r.id, r);
    for (const r of A2 || []) map.set(r.id, r);

    if (inspectionIdsForLinks.length) {
      try {
        const { data: linked } = await supabase
          .from("todos")
          .select("*")
          .in("inspection_id", inspectionIdsForLinks);

        for (const r of linked || []) map.set(r.id, r);
      } catch {
        // Older schemas may not have inspection_id on todos. Ignore safely.
      }
    }

    todosData = Array.from(map.values());
  }

  if (includeLogbook) {
    const buildLogQuery = (mode) => {
      let q = supabase.from("logbook").select("*");

      if (!includeArchived) q = q.is("archived_at", null);

      if (mode === "date") {
        if (fromDate) q = q.gte("date", fromDate);
        if (toDate) q = q.lte("date", toDate);
      } else {
        q = q.is("date", null);
        if (fromDate) q = q.gte("created_at", fromDate);
        if (toDate) {
          q = q.lte("created_at", dayjs(toDate).add(1, "day").format("YYYY-MM-DD"));
        }
      }

      if (hiveId) q = q.eq("hive_id", hiveId);
      else if (apiaryId) q = q.eq("apiary_id", apiaryId);

      return q;
    };

    const [{ data: A1, error: E1 }, { data: A2, error: E2 }] = await Promise.all([
      buildLogQuery("date"),
      buildLogQuery("created"),
    ]);

    if (E1) throw E1;
    if (E2) throw E2;

    const map = new Map();

    for (const r of A1 || []) map.set(r.id, r);
    for (const r of A2 || []) map.set(r.id, r);

    if (inspectionIdsForLinks.length) {
      try {
        const { data: linked } = await supabase
          .from("logbook")
          .select("*")
          .in("inspection_id", inspectionIdsForLinks);

        for (const r of linked || []) map.set(r.id, r);
      } catch {
        // Older schemas may not have inspection_id on logbook. Ignore safely.
      }
    }

    logbookData = Array.from(map.values());
  }

  if (isPremium && includeNfc) {
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
  }

  const refIds = new Set([
    ...todosData.map((r) => r.inspection_id).filter(Boolean),
    ...logbookData.map((r) => r.inspection_id).filter(Boolean),
  ]);

  let inspectionLookup = new Map();

  if (refIds.size) {
    const { data } = await supabase
      .from("inspections")
      .select("id, apiary_id, hive_id, date")
      .in("id", Array.from(refIds));

    inspectionLookup = new Map((data || []).map((r) => [r.id, r]));
  }

  return {
    apiaries: apiariesData,
    hives: hivesData,
    inspections: inspectionsData,
    todos: todosData,
    logbook: logbookData,
    nfcHives: nfcData,
    inspectionById: inspectionLookup,
  };
}