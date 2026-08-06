const dateWithin = (value, fromDate, toDate) => {
  if (!value) return false;
  const text = String(value).slice(0, 10);
  if (fromDate && text < fromDate) return false;
  if (toDate && text > toDate) return false;
  return true;
};

const overlapsRange = (startedOn, endedOn, fromDate, toDate) => {
  const started = startedOn ? String(startedOn).slice(0, 10) : "";
  const ended = endedOn ? String(endedOn).slice(0, 10) : "";

  if (toDate && started && started > toDate) return false;
  if (fromDate && ended && ended < fromDate) return false;
  return true;
};

const queenWasSeen = (inspection) => {
  const raw = inspection?.queen_status;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values.some((value) => String(value).trim().toLowerCase() === "seen");
};

const sortDateDesc = (left, right, field) =>
  String(right?.[field] || "").localeCompare(String(left?.[field] || ""));

const emptyQueenReport = () => ({
  queens: [],
  assignments: [],
  events: [],
  processes: [],
  snapshots: [],
  currentByHive: [],
  totalRecords: 0,
  hasData: false,
});

async function loadQueenReportData({
  supabase,
  hivesData,
  includeArchived,
  fromDate,
  toDate,
}) {
  if (!hivesData.length) return emptyQueenReport();

  const hiveIds = hivesData.map((hive) => hive.id);
  const hiveIdSet = new Set(hiveIds);

  const [
    queensResult,
    assignmentsResult,
    processesResult,
    eventsResult,
    snapshotsResult,
    sightingsResult,
  ] = await Promise.all([
    supabase.from("queens").select("*"),
    supabase.from("queen_assignments").select("*").in("hive_id", hiveIds),
    supabase.from("queen_processes").select("*").in("hive_id", hiveIds),
    supabase.from("queen_events").select("*").order("event_date", { ascending: false }),
    (() => {
      let query = supabase
        .from("inspections")
        .select(
          "id, apiary_id, hive_id, date, archived_at, queen_id, queen_snapshot"
        )
        .in("hive_id", hiveIds)
        .not("queen_snapshot", "is", null);

      if (!includeArchived) query = query.is("archived_at", null);
      if (fromDate) query = query.gte("date", fromDate);
      if (toDate) query = query.lte("date", toDate);
      return query.order("date", { ascending: false });
    })(),
    (() => {
      let query = supabase
        .from("inspections")
        .select("id, hive_id, queen_id, date, queen_status, archived_at")
        .in("hive_id", hiveIds)
        .not("queen_id", "is", null);

      if (!includeArchived) query = query.is("archived_at", null);
      return query.order("date", { ascending: false });
    })(),
  ]);

  for (const [label, result] of [
    ["Queens", queensResult],
    ["Queen assignments", assignmentsResult],
    ["Queen processes", processesResult],
    ["Queen events", eventsResult],
    ["Queen snapshots", snapshotsResult],
    ["Queen inspection sightings", sightingsResult],
  ]) {
    if (result.error) throw new Error(`${label}: ${result.error.message}`);
  }

  const allAssignments = assignmentsResult.data || [];
  const allProcesses = processesResult.data || [];

  const directlyScopedEvents = (eventsResult.data || []).filter((event) =>
    [event.hive_id, event.source_hive_id, event.destination_hive_id].some((id) =>
      hiveIdSet.has(id)
    )
  );

  const relevantQueenIds = new Set([
    ...allAssignments.map((row) => row.queen_id).filter(Boolean),
    ...allProcesses.map((row) => row.queen_id).filter(Boolean),
    ...directlyScopedEvents.map((row) => row.queen_id).filter(Boolean),
  ]);

  let queens = (queensResult.data || []).filter((queen) =>
    relevantQueenIds.has(queen.id)
  );

  const queenIdSet = new Set(queens.map((queen) => queen.id));
  const assignments = allAssignments.filter((row) => queenIdSet.has(row.queen_id));
  const processes = allProcesses.filter(
    (row) => !row.queen_id || queenIdSet.has(row.queen_id)
  );

  const events = (eventsResult.data || [])
    .filter((event) => {
      const eventHiveIds = [
        event.hive_id,
        event.source_hive_id,
        event.destination_hive_id,
      ].filter(Boolean);

      if (eventHiveIds.length) {
        return eventHiveIds.some((id) => hiveIdSet.has(id));
      }

      return Boolean(event.queen_id && queenIdSet.has(event.queen_id));
    })
    .filter((event) => dateWithin(event.event_date || event.created_at, fromDate, toDate));

  const historicalAssignments = assignments.filter((row) =>
    overlapsRange(row.started_on, row.ended_on, fromDate, toDate)
  );

  const historicalProcesses = processes.filter((row) =>
    overlapsRange(row.started_on, row.ended_on, fromDate, toDate)
  );

  const snapshots = snapshotsResult.data || [];
  const sightings = sightingsResult.data || [];
  const queensById = new Map(queens.map((queen) => [queen.id, queen]));

  const currentByHive = hivesData.map((hive) => {
    const hiveAssignments = assignments
      .filter((assignment) => assignment.hive_id === hive.id)
      .sort((a, b) => sortDateDesc(a, b, "started_on"));

    const currentAssignment = hiveAssignments.find((assignment) => !assignment.ended_on) || null;
    const currentQueen = currentAssignment
      ? queensById.get(currentAssignment.queen_id) || null
      : null;

    const activeProcess = processes
      .filter((process) => process.hive_id === hive.id && !process.ended_on)
      .sort((a, b) => sortDateDesc(a, b, "started_on"))[0] || null;

    const lastSeen = currentQueen
      ? sightings
          .filter(
            (inspection) =>
              inspection.hive_id === hive.id &&
              inspection.queen_id === currentQueen.id &&
              queenWasSeen(inspection)
          )
          .sort((a, b) => sortDateDesc(a, b, "date"))[0]?.date || null
      : null;

    return {
      hive,
      currentAssignment,
      currentQueen,
      activeProcess,
      lastSeen,
      assignmentCount: hiveAssignments.length,
      eventCount: events.filter((event) => event.hive_id === hive.id).length,
    };
  });

  const totalRecords =
    queens.length +
    historicalAssignments.length +
    events.length +
    historicalProcesses.length +
    snapshots.length;

  return {
    queens,
    assignments: historicalAssignments,
    allAssignments: assignments,
    events,
    processes: historicalProcesses,
    allProcesses: processes,
    snapshots,
    currentByHive,
    totalRecords,
    hasData: totalRecords > 0 || currentByHive.some((row) => row.currentQueen || row.activeProcess),
  };
}

export async function loadReportData({
  supabase,
  dayjs,
  includeInspections,
  includeTodos,
  includeLogbook,
  includeQueens,
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
    let query = supabase.from("inspections").select("*");

    if (!includeArchived) query = query.is("archived_at", null);
    if (hiveId) query = query.eq("hive_id", hiveId);
    else if (apiaryId) query = query.eq("apiary_id", apiaryId);
    if (fromDate) query = query.gte("date", fromDate);
    if (toDate) query = query.lte("date", toDate);

    const { data, error } = await query.order("date", { ascending: false });
    if (error) throw error;
    inspectionsData = data || [];
  }

  let inspectionIdsForLinks = [];

  if (hiveId || apiaryId) {
    let inspectionQuery = supabase.from("inspections").select("id");

    if (hiveId) inspectionQuery = inspectionQuery.eq("hive_id", hiveId);
    else if (apiaryId) inspectionQuery = inspectionQuery.eq("apiary_id", apiaryId);

    const { data } = await inspectionQuery;
    inspectionIdsForLinks = (data || []).map((row) => row.id);
  }

  if (includeTodos) {
    const buildTodoQuery = (mode) => {
      let query = supabase.from("todos").select("*");

      if (!includeArchived) query = query.is("archived_at", null);

      if (mode === "due") {
        if (fromDate) query = query.gte("due_date", fromDate);
        if (toDate) query = query.lte("due_date", toDate);
      } else {
        query = query.is("due_date", null);
        if (fromDate) query = query.gte("created_at", fromDate);
        if (toDate) {
          query = query.lte("created_at", dayjs(toDate).add(1, "day").format("YYYY-MM-DD"));
        }
      }

      if (hiveId) query = query.eq("hive_id", hiveId);
      else if (apiaryId) query = query.eq("apiary_id", apiaryId);

      return query;
    };

    const [{ data: first, error: firstError }, { data: second, error: secondError }] =
      await Promise.all([buildTodoQuery("due"), buildTodoQuery("created")]);

    if (firstError) throw firstError;
    if (secondError) throw secondError;

    const map = new Map();
    for (const row of first || []) map.set(row.id, row);
    for (const row of second || []) map.set(row.id, row);

    if (inspectionIdsForLinks.length) {
      const { data: linked, error } = await supabase
        .from("todos")
        .select("*")
        .in("inspection_id", inspectionIdsForLinks);

      if (!error) {
        for (const row of linked || []) map.set(row.id, row);
      }
    }

    todosData = Array.from(map.values());
  }

  if (includeLogbook) {
    const buildLogQuery = (mode) => {
      let query = supabase.from("logbook").select("*");

      if (!includeArchived) query = query.is("archived_at", null);

      if (mode === "date") {
        if (fromDate) query = query.gte("date", fromDate);
        if (toDate) query = query.lte("date", toDate);
      } else {
        query = query.is("date", null);
        if (fromDate) query = query.gte("created_at", fromDate);
        if (toDate) {
          query = query.lte("created_at", dayjs(toDate).add(1, "day").format("YYYY-MM-DD"));
        }
      }

      if (hiveId) query = query.eq("hive_id", hiveId);
      else if (apiaryId) query = query.eq("apiary_id", apiaryId);

      return query;
    };

    const [{ data: first, error: firstError }, { data: second, error: secondError }] =
      await Promise.all([buildLogQuery("date"), buildLogQuery("created")]);

    if (firstError) throw firstError;
    if (secondError) throw secondError;

    const map = new Map();
    for (const row of first || []) map.set(row.id, row);
    for (const row of second || []) map.set(row.id, row);

    if (inspectionIdsForLinks.length) {
      const { data: linked, error } = await supabase
        .from("logbook")
        .select("*")
        .in("inspection_id", inspectionIdsForLinks);

      if (!error) {
        for (const row of linked || []) map.set(row.id, row);
      }
    }

    logbookData = Array.from(map.values());
  }

  if (isPremium && includeNfc) {
    let query = supabase
      .from("hives")
      .select("id, name, apiary_id, nfc_uid, archived_at")
      .not("nfc_uid", "is", null);

    if (!includeArchived) query = query.is("archived_at", null);
    if (hiveId) query = query.eq("id", hiveId);
    else if (apiaryId) query = query.eq("apiary_id", apiaryId);

    const { data, error } = await query;
    if (error) throw error;
    nfcData = data || [];
  }

  const referenceIds = new Set([
    ...todosData.map((row) => row.inspection_id).filter(Boolean),
    ...logbookData.map((row) => row.inspection_id).filter(Boolean),
  ]);

  let inspectionLookup = new Map();

  if (referenceIds.size) {
    const { data } = await supabase
      .from("inspections")
      .select("id, apiary_id, hive_id, date")
      .in("id", Array.from(referenceIds));

    inspectionLookup = new Map((data || []).map((row) => [row.id, row]));
  }

  const queenReport = includeQueens
    ? await loadQueenReportData({
        supabase,
        hivesData,
        includeArchived,
        fromDate,
        toDate,
      })
    : emptyQueenReport();

  return {
    apiaries: apiariesData,
    hives: hivesData,
    inspections: inspectionsData,
    todos: todosData,
    logbook: logbookData,
    nfcHives: nfcData,
    inspectionById: inspectionLookup,
    queenReport,
  };
}
