import { supabase } from "./supabase";

const normaliseDate = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
};

export const formatQueenRecordDate = (value, fallback = "Not recorded") => {
  if (!value) return fallback;

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T12:00:00`)
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const getExpectedQueenColour = (year) => {
  const digit = Number(String(year ?? "").slice(-1));
  if ([1, 6].includes(digit)) return "White";
  if ([2, 7].includes(digit)) return "Yellow";
  if ([3, 8].includes(digit)) return "Red";
  if ([4, 9].includes(digit)) return "Green";
  if ([5, 0].includes(digit)) return "Blue";
  return null;
};

const titleCase = (value, fallback = "Not recorded") => {
  const text = String(value ?? "").trim();
  if (!text) return fallback;

  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const activeOnDate = (row, date) =>
  row.started_on <= date && (!row.ended_on || row.ended_on > date);

export async function getInspectionQueenContext(hiveId, inspectionDate) {
  if (!hiveId) {
    return { currentQueen: null, transition: null };
  }

  const targetDate = normaliseDate(inspectionDate);

  const [assignmentsResult, processesResult] = await Promise.all([
    supabase
      .from("queen_assignments")
      .select("queen_id, started_on, ended_on, created_at")
      .eq("hive_id", hiveId)
      .lte("started_on", targetDate)
      .order("started_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("queen_processes")
      .select(
        "id, queen_id, process_type, method, status, started_on, expected_check_on, ended_on, notes, created_at"
      )
      .eq("hive_id", hiveId)
      .lte("started_on", targetDate)
      .order("started_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (assignmentsResult.error) throw assignmentsResult.error;
  if (processesResult.error) throw processesResult.error;

  const assignment = (assignmentsResult.data || []).find((row) =>
    activeOnDate(row, targetDate)
  );

  const process = (processesResult.data || []).find((row) =>
    activeOnDate(row, targetDate)
  );

  let currentQueen = null;

  if (assignment?.queen_id) {
    const { data: queen, error } = await supabase
      .from("queens")
      .select(
        "id, reference, queen_year, marked, actual_colour, clipped, origin, supplier, emerged_on, introduced_on, status, notes"
      )
      .eq("id", assignment.queen_id)
      .maybeSingle();

    if (error) throw error;

    if (queen) {
      const expectedColour = getExpectedQueenColour(queen.queen_year);
      const actualColour =
        queen.actual_colour || (queen.marked ? expectedColour : "Unmarked");

      currentQueen = {
        id: queen.id,
        reference: queen.reference || "Queen record",
        year: queen.queen_year,
        expectedColour,
        actualColour: actualColour || "Not recorded",
        marked: Boolean(queen.marked),
        clipped: queen.clipped,
        origin: queen.origin || "Not recorded",
        supplier: queen.supplier || "Not recorded",
        emergedOn: queen.emerged_on,
        introducedOn: queen.introduced_on,
        status: titleCase(queen.status, "Present"),
        notes: queen.notes || "",
        currentSince: assignment.started_on,
      };
    }
  }

  return {
    currentQueen,
    transition: process
      ? {
          id: process.id,
          queenId: process.queen_id,
          method: process.method || titleCase(process.process_type, "Queen process"),
          status: titleCase(process.status, "Active"),
          startedOn: process.started_on,
          expectedCheckOn: process.expected_check_on,
          notes: process.notes || "",
        }
      : null,
  };
}

export function getQueenSnapshotSummary(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return null;

  const year = snapshot.queen_year || "Unknown year";
  const expectedColour = snapshot.expected_colour || getExpectedQueenColour(snapshot.queen_year);
  const actualColour =
    snapshot.actual_colour || (snapshot.marked ? expectedColour : "Unmarked");

  return {
    queenId: snapshot.queen_id || null,
    reference: snapshot.reference || "Queen record",
    year,
    expectedColour: expectedColour || "Not recorded",
    actualColour: actualColour || "Not recorded",
    marked: snapshot.marked,
    clipped: snapshot.clipped,
    origin: snapshot.origin || "Not recorded",
    supplier: snapshot.supplier || "Not recorded",
    emergedOn: snapshot.emerged_on || null,
    introducedOn: snapshot.introduced_on || null,
    status: titleCase(snapshot.status, "Not recorded"),
    notes: snapshot.notes || "",
    assignmentStartedOn: snapshot.assignment_started_on || null,
    assignmentStartReason: snapshot.assignment_start_reason || "",
    inspectionDate: snapshot.inspection_date || null,
  };
}

export function getQueenSnapshotLabel(snapshot) {
  const queen = getQueenSnapshotSummary(snapshot);
  if (!queen) return "";

  const colour = String(queen.actualColour || "").toLowerCase();
  const description = colour && colour !== "unmarked"
    ? `${queen.year} ${colour}-marked queen`
    : `${queen.year} unmarked queen`;

  return `${queen.reference} — ${description}`;
}
