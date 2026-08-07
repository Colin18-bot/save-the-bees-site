import { supabase } from "./supabase";

const UK_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const asDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T12:00:00`)
    : new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatQueenDate = (value, fallback = "Not recorded") => {
  const date = asDate(value);
  return date ? UK_DATE.format(date) : fallback;
};

export const getQueenColourForYear = (year) => {
  const lastDigit = Number(String(year ?? "").slice(-1));
  if ([1, 6].includes(lastDigit)) return "White";
  if ([2, 7].includes(lastDigit)) return "Yellow";
  if ([3, 8].includes(lastDigit)) return "Red";
  if ([4, 9].includes(lastDigit)) return "Green";
  if ([5, 0].includes(lastDigit)) return "Blue";
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

const yesNo = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not recorded";
};

const queenWasSeen = (inspection) => {
  const raw = inspection?.queen_status;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values.some((value) => String(value).trim().toLowerCase() === "seen");
};

const dateSortDescending = (a, b, field) => {
  const left = asDate(a?.[field])?.getTime() ?? 0;
  const right = asDate(b?.[field])?.getTime() ?? 0;
  return right - left;
};

const throwIfError = (result, label) => {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data ?? [];
};

const currentAssignmentForQueen = (assignments, queenId) =>
  assignments.find(
    (assignment) => assignment.queen_id === queenId && !assignment.ended_on
  );

const buildCurrentQueen = ({ queen, assignment, inspections }) => {
  if (!queen || !assignment) return null;

  const expectedColour = getQueenColourForYear(queen.queen_year);
  const actualColour =
    queen.actual_colour || (queen.marked ? expectedColour : "Unmarked");

  const lastSeenInspection = inspections
  .filter(
    (inspection) =>
      inspection.queen_id === queen.id &&
      queenWasSeen(inspection)
  )
  .sort((a, b) => dateSortDescending(a, b, "date"))[0];

  return {
    id: queen.id,
    reference: queen.reference || "Queen record",
    year: queen.queen_year || "Unknown",
    expectedColour,
    actualColour,
    marked: yesNo(queen.marked),
    clipped: yesNo(queen.clipped),
    origin: queen.origin || "Not recorded",
    supplier: queen.supplier || "Not recorded",
    emergedOn: formatQueenDate(queen.emerged_on, "Unknown"),
    emergedOnRaw: queen.emerged_on || "",
    introducedOn: formatQueenDate(queen.introduced_on, "Not applicable"),
    introducedOnRaw: queen.introduced_on || "",
    currentSince: formatQueenDate(assignment.started_on),
    currentSinceRaw: assignment.started_on || "",
    lastSeen: formatQueenDate(lastSeenInspection?.date, "Not yet recorded"),
    status: titleCase(queen.status, "Present"),
    statusRaw: queen.status || "active",
    notes: queen.notes || "No Queen notes recorded.",
  };
};

const buildPreviousQueen = ({
  assignment,
  queen,
  assignments,
  hivesById,
}) => {
  const expectedColour = getQueenColourForYear(queen?.queen_year);
  const actualColour =
    queen?.actual_colour || (queen?.marked ? expectedColour : "Unmarked");
  const markedSummary =
    actualColour === "Unmarked"
      ? "unmarked"
      : `${String(actualColour).toLowerCase()}-marked`;

  const activeLocation = currentAssignmentForQueen(assignments, assignment.queen_id);
  const currentHiveName = activeLocation
    ? hivesById.get(activeLocation.hive_id)?.name
    : null;

  return {
    id: assignment.id,
    queenId: assignment.queen_id,
    reference: queen?.reference || "Previous Queen",
    period: `${formatQueenDate(assignment.started_on)} – ${formatQueenDate(
      assignment.ended_on
    )}`,
    summary: `${queen?.queen_year || "Unknown year"} ${markedSummary} queen`,
    outcome: titleCase(assignment.end_reason || queen?.status, "Ended"),
    currentLocation: currentHiveName
      ? `Currently assigned to ${currentHiveName}`
      : "No longer assigned",
  };
};

const buildTransition = (process) => {
  if (!process) return null;

  return {
    id: process.id,
    queenId: process.queen_id,
    method: process.method || titleCase(process.process_type, "Queen process"),
    startedOn: formatQueenDate(process.started_on),
    status: titleCase(process.status, "Active"),
    expectedCheck: formatQueenDate(process.expected_check_on, "Not scheduled"),
    expectedCheckRaw: process.expected_check_on || "",
    note: process.notes || "No additional notes recorded.",
  };
};

const buildEvents = (events) =>
  [...events]
    .sort((a, b) => {
      const dateDifference = dateSortDescending(a, b, "event_date");
      if (dateDifference !== 0) return dateDifference;
      return dateSortDescending(a, b, "created_at");
    })
    .map((event) => ({
      id: event.id,
      date: formatQueenDate(event.event_date),
      dateRaw: event.event_date,
      type: event.title || titleCase(event.event_type, "Queen event"),
      detail: event.detail || "No additional details recorded.",
    }));

const buildProgress = (events, transition) => {
  const items = buildEvents(events).map((event) => ({
    id: event.id,
    date: event.date,
    dateRaw: event.dateRaw,
    title: event.type,
    detail: event.detail,
  }));

  if (transition?.expectedCheckRaw) {
    items.push({
      id: `expected-${transition.id}`,
      date: transition.expectedCheck,
      dateRaw: transition.expectedCheckRaw,
      title: "Queen follow-up due",
      detail: transition.note,
    });
  }

  return items.sort((a, b) => {
    const left = asDate(a.dateRaw)?.getTime() ?? 0;
    const right = asDate(b.dateRaw)?.getTime() ?? 0;
    return left - right;
  });
};

const buildNextAction = (transition) => {
  if (!transition) {
    return {
      title: "No Queen follow-up scheduled",
      due: "Not scheduled",
      note: "Record a dated Queen event whenever the colony or Queen position changes.",
    };
  }

  return {
    title: `Check ${transition.status.toLowerCase()}`,
    due: transition.expectedCheck,
    note: transition.note,
  };
};

const needsAttention = (currentQueen, transition) => {
  if (!currentQueen) return true;

  const status = String(currentQueen.status || "").toLowerCase();
  if (
    ["pending", "lost", "queenless", "unknown", "failed"].some((word) =>
      status.includes(word)
    )
  ) {
    return true;
  }

  if (transition?.expectedCheckRaw) {
    const due = asDate(transition.expectedCheckRaw);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (due && due <= today) return true;
  }

  return false;
};

export async function getQueenRecordsOverview() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user?.id) throw new Error("You must be signed in to view Queen Records.");

  const [
    profileResult,
    apiariesResult,
    hivesResult,
    queensResult,
    assignmentsResult,
    processesResult,
    eventsResult,
    inspectionsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_level")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("apiaries")
      .select("id, name")
      .is("archived_at", null)
      .order("name"),
    supabase
      .from("hives")
      .select("id, name, apiary_id")
      .is("archived_at", null)
      .order("name"),
    supabase.from("queens").select("*"),
    supabase.from("queen_assignments").select("*"),
    supabase.from("queen_processes").select("*"),
    supabase
      .from("queen_events")
      .select("*")
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("inspections")
      .select("id, hive_id, queen_id, date, queen_status")
      .not("queen_id", "is", null)
      .order("date", { ascending: false })
      .limit(1000),
  ]);

  if (profileResult.error) {
    throw new Error(`Profile: ${profileResult.error.message}`);
  }

  const apiaries = throwIfError(apiariesResult, "Apiaries");
  const hives = throwIfError(hivesResult, "Hives");
  const queens = throwIfError(queensResult, "Queens");
  const assignments = throwIfError(assignmentsResult, "Queen assignments");
  const processes = throwIfError(processesResult, "Queen processes");
  const events = throwIfError(eventsResult, "Queen events");
  const inspections = throwIfError(inspectionsResult, "Queen inspections");

  const apiariesById = new Map(apiaries.map((apiary) => [apiary.id, apiary]));
  const hivesById = new Map(hives.map((hive) => [hive.id, hive]));
  const queensById = new Map(queens.map((queen) => [queen.id, queen]));

  const normalisedHives = hives.map((hive) => {
    const hiveAssignments = assignments
      .filter((assignment) => assignment.hive_id === hive.id)
      .sort((a, b) => dateSortDescending(a, b, "started_on"));

    const currentAssignment = hiveAssignments.find(
      (assignment) => !assignment.ended_on
    );
    const currentQueenRow = currentAssignment
      ? queensById.get(currentAssignment.queen_id)
      : null;
    const currentQueen = buildCurrentQueen({
      queen: currentQueenRow,
      assignment: currentAssignment,
      inspections,
    });

    const previousQueens = hiveAssignments
      .filter((assignment) => assignment.ended_on)
      .map((assignment) =>
        buildPreviousQueen({
          assignment,
          queen: queensById.get(assignment.queen_id),
          assignments,
          hivesById,
        })
      );

    const activeProcessRow = processes
      .filter((process) => process.hive_id === hive.id && !process.ended_on)
      .sort((a, b) => dateSortDescending(a, b, "started_on"))[0];
    const transition = buildTransition(activeProcessRow);

    const hiveEvents = events.filter((event) => event.hive_id === hive.id);
    const normalisedEvents = buildEvents(hiveEvents);

    const status = currentQueen
      ? currentQueen.status
      : transition
      ? transition.status
      : "No Queen record";

    return {
      id: hive.id,
      apiaryId: hive.apiary_id,
      apiaryName: apiariesById.get(hive.apiary_id)?.name || "Unknown apiary",
      name: hive.name,
      status,
      attention:
      currentQueen ||
      transition ||
      previousQueens.length > 0 ||
        normalisedEvents.length > 0
      ? needsAttention(currentQueen, transition)
      : false,
      currentQueen,
      previousQueens,
      transition,
      nextAction: buildNextAction(transition),
      progress: buildProgress(hiveEvents, transition),
      events: normalisedEvents,
    };
  });

  return {
    userId: user.id,
    subscriptionLevel: String(
      profileResult.data?.subscription_level || "free"
    ).toLowerCase(),
    hasQueenData:
      queens.length > 0 ||
      assignments.length > 0 ||
      processes.length > 0 ||
      events.length > 0,
    apiaries,
    hives: normalisedHives,
  };
}

const callQueenRpc = async (functionName, parameters) => {
  const { data, error } = await supabase.rpc(functionName, parameters);
  if (error) throw new Error(error.message);
  return data;
};

export const createQueenForHive = ({
  hiveId,
  eventDate,
  mode,
  reference,
  queenYear,
  markingColour,
  clipped,
  origin,
  supplier,
  notes,
  expectedCheckOn,
}) =>
  callQueenRpc("queen_create_for_hive", {
    p_hive_id: hiveId,
    p_event_date: eventDate || null,
    p_mode: mode,
    p_reference: reference || null,
    p_queen_year: queenYear ? Number(queenYear) : null,
    p_marked: markingColour !== "Unmarked",
    p_actual_colour: markingColour || "Unmarked",
    p_clipped: clipped === "yes" ? true : clipped === "no" ? false : null,
    p_origin: origin || null,
    p_supplier: supplier || null,
    p_notes: notes || null,
    p_expected_check_on: expectedCheckOn || null,
  });

export const updateQueenDetails = ({
  queenId,
  reference,
  queenYear,
  markingColour,
  clipped,
  origin,
  supplier,
  emergedOn,
  introducedOn,
  status,
  notes,
}) =>
  callQueenRpc("queen_update_details", {
    p_queen_id: queenId,
    p_reference: reference || null,
    p_queen_year: queenYear ? Number(queenYear) : null,
    p_marked: markingColour !== "Unmarked",
    p_actual_colour: markingColour || "Unmarked",
    p_clipped: clipped === "yes" ? true : clipped === "no" ? false : null,
    p_origin: origin || null,
    p_supplier: supplier || null,
    p_emerged_on: emergedOn || null,
    p_introduced_on: introducedOn || null,
    p_status: status || "active",
    p_notes: notes || null,
  });

export const recordQueenProgress = ({
  hiveId,
  eventDate,
  progress,
  notes,
  expectedCheckOn,
}) =>
  callQueenRpc("queen_record_progress", {
    p_hive_id: hiveId,
    p_event_date: eventDate || null,
    p_progress: progress,
    p_notes: notes || null,
    p_expected_check_on: expectedCheckOn || null,
  });

export const transferQueen = ({
  sourceHiveId,
  destinationHiveId,
  eventDate,
  notes,
}) =>
  callQueenRpc("queen_transfer", {
    p_source_hive_id: sourceHiveId,
    p_destination_hive_id: destinationHiveId,
    p_event_date: eventDate || null,
    p_notes: notes || null,
  });

export const recordQueenSwarm = ({
  hiveId,
  eventDate,
  replacementMethod,
  expectedCheckOn,
  notes,
}) =>
  callQueenRpc("queen_record_swarm", {
    p_hive_id: hiveId,
    p_event_date: eventDate || null,
    p_replacement_method: replacementMethod || null,
    p_expected_check_on: expectedCheckOn || null,
    p_notes: notes || null,
  });

export const recordQueenSplit = ({
  sourceHiveId,
  destinationHiveId,
  eventDate,
  queenLocation,
  splitReason,
  queenCellPosition,
  replacementMethod,
  broodSourceHiveId,
  expectedCheckOn,
  notes,
}) =>
  callQueenRpc("queen_record_split_v2", {
    p_source_hive_id: sourceHiveId,
    p_destination_hive_id: destinationHiveId,
    p_event_date: eventDate || null,
    p_queen_location: queenLocation,
    p_split_reason: splitReason || null,
    p_queen_cell_position: queenCellPosition || null,
    p_replacement_method: replacementMethod || null,
    p_brood_source_hive_id: broodSourceHiveId || null,
    p_expected_check_on: expectedCheckOn || null,
    p_notes: notes || null,
  });

export const setQueenlessColonyPlan = ({
  hiveId,
  eventDate,
  method,
  queenCellPosition,
  sourceHiveId,
  expectedCheckOn,
  notes,
}) =>
  callQueenRpc("queen_set_queenless_plan", {
    p_hive_id: hiveId,
    p_event_date: eventDate || null,
    p_method: method || null,
    p_queen_cell_position: queenCellPosition || null,
    p_source_hive_id: sourceHiveId || null,
    p_expected_check_on: expectedCheckOn || null,
    p_notes: notes || null,
  });
