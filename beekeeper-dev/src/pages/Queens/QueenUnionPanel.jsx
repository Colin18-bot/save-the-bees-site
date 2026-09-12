import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, GitMerge, RefreshCw, Save } from "lucide-react";
import { supabase } from "../../services/supabase";

const localToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const queenLabel = (queen) => {
  if (!queen) return "Queenless";
  const colour = queen.actual_colour || (queen.marked ? "marked" : "unmarked");
  return `${queen.reference || "Queen"}${queen.queen_year ? ` • ${queen.queen_year}` : ""} • ${String(colour).toLowerCase()}`;
};

const cancelToOverview = () => {
  const nav = document.querySelector('nav[aria-label="Integrated Queen Records tabs"]');
  const overviewButton = Array.from(nav?.querySelectorAll("button") || []).find(
    (button) => (button.textContent || "").trim() === "Overview"
  );

  overviewButton?.click();
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

export default function QueenUnionPanel({ onRecorded }) {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(null);
  const [hiveAId, setHiveAId] = useState("");
  const [hiveBId, setHiveBId] = useState("");
  const [survivingHiveId, setSurvivingHiveId] = useState("");
  const [survivingQueenId, setSurvivingQueenId] = useState("");
  const [otherQueenOutcome, setOtherQueenOutcome] = useState("");
  const [eventDate, setEventDate] = useState(localToday());
  const [notes, setNotes] = useState("");
  const submitGuard = useRef(false);

  const load = async ({ resetSelection = false } = {}) => {
    setLoading(true);
    setError("");
    try {
      const [
        { data: apiaries, error: apiaryError },
        { data: hiveRows, error: hiveError },
        { data: assignments, error: assignmentError },
        { data: queens, error: queenError },
      ] = await Promise.all([
        supabase.from("apiaries").select("id, name").is("archived_at", null),
        supabase.from("hives").select("id, name, apiary_id").is("archived_at", null).order("name"),
        supabase.from("queen_assignments").select("hive_id, queen_id, started_on").is("ended_on", null),
        supabase.from("queens").select("id, reference, queen_year, marked, actual_colour, status"),
      ]);

      if (apiaryError) throw apiaryError;
      if (hiveError) throw hiveError;
      if (assignmentError) throw assignmentError;
      if (queenError) throw queenError;

      const apiaryById = new Map((apiaries || []).map((item) => [item.id, item.name]));
      const queenById = new Map((queens || []).map((item) => [item.id, item]));
      const assignmentByHive = new Map((assignments || []).map((item) => [item.hive_id, item]));

      const next = (hiveRows || []).map((hive) => {
        const assignment = assignmentByHive.get(hive.id);
        return {
          ...hive,
          apiaryName: apiaryById.get(hive.apiary_id) || "Unknown apiary",
          queen: assignment ? queenById.get(assignment.queen_id) || null : null,
        };
      });

      setHives(next);

      if (resetSelection) {
        const first = next[0] || null;
        setHiveAId(first?.id || "");
        setHiveBId("");
        setSurvivingHiveId("");
        setSurvivingQueenId("");
        setOtherQueenOutcome("");
      }
    } catch (loadError) {
      setError(loadError?.message || "Could not load hives for colony union.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ resetSelection: true });
  }, []);

  useEffect(() => {
    if (!hiveAId || !hiveBId) {
      if (survivingHiveId) setSurvivingHiveId("");
      return;
    }
    if (hiveAId === hiveBId) {
      setHiveBId("");
      setSurvivingHiveId("");
      return;
    }
    if (survivingHiveId && ![hiveAId, hiveBId].includes(survivingHiveId)) {
      setSurvivingHiveId("");
    }
  }, [hiveAId, hiveBId, survivingHiveId]);

  const hiveA = hives.find((item) => item.id === hiveAId) || null;
  const hiveB = hives.find((item) => item.id === hiveBId) || null;
  const pairSelected = Boolean(hiveA && hiveB && hiveA.id !== hiveB.id);
  const queens = useMemo(
    () => (pairSelected ? [hiveA?.queen, hiveB?.queen].filter(Boolean) : []),
    [hiveA, hiveB, pairSelected]
  );
  const bothQueenright = queens.length === 2;
  const oneQueenright = queens.length === 1;

  useEffect(() => {
    if (!pairSelected) {
      setSurvivingQueenId("");
      setOtherQueenOutcome("");
      return;
    }

    if (oneQueenright) {
      setSurvivingQueenId(queens[0]?.id || "");
      setOtherQueenOutcome("");
    } else if (!bothQueenright) {
      setSurvivingQueenId("");
      setOtherQueenOutcome("");
    } else if (!queens.some((queen) => queen.id === survivingQueenId)) {
      setSurvivingQueenId("");
    }
  }, [pairSelected, oneQueenright, bothQueenright, queens, survivingQueenId]);

  const submit = async (event) => {
    event.preventDefault();

    if (submitGuard.current || completed) return;

    setError("");

    if (!hiveAId || !hiveBId || hiveAId === hiveBId) {
      setError("Select two different colonies to unite.");
      return;
    }
    if (![hiveAId, hiveBId].includes(survivingHiveId)) {
      setError("Select which hive will remain in use after the union.");
      return;
    }
    if (bothQueenright && !survivingQueenId) {
      setError("Both colonies are Queenright. Select which Queen will remain.");
      return;
    }
    if (bothQueenright && !otherQueenOutcome) {
      setError("Record what happened to the Queen that did not remain.");
      return;
    }

    const survivingHive = survivingHiveId === hiveAId ? hiveA : hiveB;
    const redundantHive = survivingHiveId === hiveAId ? hiveB : hiveA;

    submitGuard.current = true;
    setSaving(true);

    try {
      const { error: rpcError } = await supabase.rpc("queen_record_union", {
        p_hive_a_id: hiveAId,
        p_hive_b_id: hiveBId,
        p_surviving_hive_id: survivingHiveId,
        p_event_date: eventDate || null,
        p_surviving_queen_id: survivingQueenId || null,
        p_other_queen_outcome: otherQueenOutcome || null,
        p_notes: notes || null,
      });
      if (rpcError) throw rpcError;

      setCompleted({
        survivingHive: survivingHive?.name || "Surviving hive",
        redundantHive: redundantHive?.name || "Redundant hive",
        eventDate,
      });
      onRecorded?.();
    } catch (saveError) {
      submitGuard.current = false;
      setError(saveError?.message || "The colony union could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const recordAnother = async () => {
    submitGuard.current = false;
    setCompleted(null);
    setError("");
    setNotes("");
    setEventDate(localToday());
    await load({ resetSelection: true });
  };

  if (loading && !completed) {
    return (
      <div className="mb-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Loading colony union options…
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <section className="overflow-hidden rounded-2xl border border-amber-300 bg-white shadow-sm ring-1 ring-amber-100">
        <div className="flex flex-col gap-3 bg-amber-50 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="rounded-full bg-[#1a3329] p-2 text-white">
              <GitMerge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1a3329]">Unite Colonies</h2>
              <p className="mt-1 max-w-3xl text-sm text-gray-700">
                Record two colonies being united, choose which physical hive remains in use, and preserve or transfer the correct Queen independently.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-900">
            Staging only
          </span>
        </div>

        {completed ? (
          <div className="p-5">
            <div className="rounded-2xl border border-green-300 bg-green-50 p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-700" />
                <div>
                  <h3 className="text-lg font-extrabold text-green-950">Union recorded successfully</h3>
                  <p className="mt-2 text-sm text-green-900">
                    <strong>{completed.survivingHive}</strong> remains in use. <strong>{completed.redundantHive}</strong> has been archived as the redundant hive. Queen and colony history have been preserved.
                  </p>
                  <p className="mt-2 text-sm font-semibold text-green-900">
                    This form is now locked so the same action cannot be submitted again accidentally.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={recordAnother}
                className="rounded-lg border border-[#1a3329] bg-white px-5 py-2.5 text-sm font-bold text-[#1a3329] hover:bg-green-50"
              >
                Record another union
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 p-5">
            {error ? (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                First colony
                <select
                  value={hiveAId}
                  onChange={(e) => {
                    setHiveAId(e.target.value);
                    setSurvivingHiveId("");
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  {hives.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.apiaryName} — {queenLabel(item.queen)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Second colony
                <select
                  value={hiveBId}
                  onChange={(e) => {
                    setHiveBId(e.target.value);
                    setSurvivingHiveId("");
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  {hives.filter((item) => item.id !== hiveAId).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.apiaryName} — {queenLabel(item.queen)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {!pairSelected ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                Select the second colony to continue with the union details.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[hiveA, hiveB].map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="font-bold text-[#1a3329]">{item.name}</p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">{item.apiaryName}</p>
                      <p className="mt-2 text-sm text-gray-700">{queenLabel(item.queen)}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Which hive will remain in use after the union?
                    <select
                      value={survivingHiveId}
                      onChange={(e) => setSurvivingHiveId(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                    >
                      <option value="">Select surviving hive</option>
                      <option value={hiveA.id}>{hiveA.name}</option>
                      <option value={hiveB.id}>{hiveB.name}</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Union date
                    <input
                      type="date"
                      value={eventDate}
                      max={localToday()}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <strong>What happens to the other hive?</strong> The hive you do not choose to keep will be moved to the Archive as the redundant physical hive. It will not be deleted, and its Queen and colony history will remain preserved.
                </div>

                {bothQueenright ? (
                  <div className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 lg:grid-cols-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Both colonies are Queenright — which Queen will remain?
                      <select
                        value={survivingQueenId}
                        onChange={(e) => setSurvivingQueenId(e.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                      >
                        <option value="">Select surviving Queen</option>
                        {queens.map((queen) => {
                          const owner = hiveA?.queen?.id === queen.id ? hiveA : hiveB;
                          return (
                            <option key={queen.id} value={queen.id}>
                              {owner?.name}: {queenLabel(queen)}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="text-sm font-semibold text-gray-800">
                      What happened to the Queen that did not remain?
                      <select
                        value={otherQueenOutcome}
                        onChange={(e) => setOtherQueenOutcome(e.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                      >
                        <option value="">Select outcome</option>
                        <option value="removed_before_union">Removed before union</option>
                        <option value="lost_or_killed">Lost or killed during union</option>
                        <option value="outcome_unknown">Outcome unknown after union</option>
                      </select>
                    </label>
                  </div>
                ) : oneQueenright ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                    The only current Queen will automatically remain with the united colony. If the other hive is the one kept in use, her Queen assignment will transfer to it.
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    Both colonies are Queenless. The resulting colony will remain Queenless and HiveTag will preserve or create an active Queenless plan for the surviving hive.
                  </div>
                )}

                <label className="block text-sm font-semibold text-gray-700">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Optional details about the union…"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
              </>
            )}

            <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-4">
              <button
                type="submit"
                disabled={
                  saving ||
                  hives.length < 2 ||
                  !pairSelected ||
                  !survivingHiveId ||
                  (bothQueenright && (!survivingQueenId || !otherQueenOutcome))
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a3329] px-5 py-2 text-sm font-bold text-white hover:bg-[#28513f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Record Colony Union"}
              </button>
              <button
                type="button"
                onClick={cancelToOverview}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
