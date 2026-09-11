import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bug, CheckCircle2, RefreshCw, Save } from "lucide-react";
import { supabase } from "../../services/supabase";

const localToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const dateAfterDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const queenLabel = (queen) => {
  if (!queen) return "No current Queen";
  const colour = queen.actual_colour || (queen.marked ? "marked" : "unmarked");
  return `${queen.reference || "Queen"}${queen.queen_year ? ` • ${queen.queen_year}` : ""} • ${String(colour).toLowerCase()}`;
};

const replacementOptions = [
  "Existing swarm Queen cells retained",
  "Existing emergency Queen cells retained",
  "Existing supersedure Queen cells retained",
  "Allow colony to raise its own Queen from existing eggs or young larvae",
  "Frame of eggs or young larvae added",
  "Add a frame of eggs or young larvae later",
  "Plan to introduce a Queen cell",
  "Plan to introduce a virgin Queen",
  "Plan to introduce a mated Queen",
  "Temporarily Queenless",
  "Not yet decided",
];

export default function QueenSwarmPanel() {
  const [hives, setHives] = useState([]);
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sourceHiveId, setSourceHiveId] = useState("");
  const [outcome, setOutcome] = useState("lost_not_recovered");
  const [destinationHiveId, setDestinationHiveId] = useState("");
  const [replacementMethod, setReplacementMethod] = useState("Existing swarm Queen cells retained");
  const [eventDate, setEventDate] = useState(localToday());
  const [expectedCheckOn, setExpectedCheckOn] = useState(dateAfterDays(7));
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const userId = authData?.user?.id;
      if (!userId) throw new Error("You must be signed in to record a swarm.");

      const [profileRes, apiaryRes, hiveRes, assignmentRes, queenRes, processRes] = await Promise.all([
        supabase.from("profiles").select("subscription_level").eq("user_id", userId).maybeSingle(),
        supabase.from("apiaries").select("id, name").is("archived_at", null),
        supabase.from("hives").select("id, name, apiary_id").is("archived_at", null).order("name"),
        supabase.from("queen_assignments").select("hive_id, queen_id, started_on").is("ended_on", null),
        supabase.from("queens").select("id, reference, queen_year, marked, actual_colour, status"),
        supabase.from("queen_processes").select("hive_id").is("ended_on", null),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (apiaryRes.error) throw apiaryRes.error;
      if (hiveRes.error) throw hiveRes.error;
      if (assignmentRes.error) throw assignmentRes.error;
      if (queenRes.error) throw queenRes.error;
      if (processRes.error) throw processRes.error;

      const level = String(profileRes.data?.subscription_level || "free").toLowerCase();
      setSubscriptionLevel(level);

      const apiaryById = new Map((apiaryRes.data || []).map((item) => [item.id, item.name]));
      const queenById = new Map((queenRes.data || []).map((item) => [item.id, item]));
      const assignmentByHive = new Map((assignmentRes.data || []).map((item) => [item.hive_id, item]));
      const activeProcessHives = new Set((processRes.data || []).map((item) => item.hive_id));

      const next = (hiveRes.data || []).map((hive) => {
        const assignment = assignmentByHive.get(hive.id);
        return {
          ...hive,
          apiaryName: apiaryById.get(hive.apiary_id) || "Unknown apiary",
          queen: assignment ? queenById.get(assignment.queen_id) || null : null,
          hasActiveProcess: activeProcessHives.has(hive.id),
        };
      });

      setHives(next);
      const firstQueenright = next.find((item) => item.queen);
      setSourceHiveId((value) => value || firstQueenright?.id || "");
    } catch (loadError) {
      setError(loadError?.message || "Could not load swarm options.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const queenrightHives = useMemo(() => hives.filter((item) => item.queen), [hives]);
  const destinationHives = useMemo(
    () => hives.filter((item) => item.id !== sourceHiveId && !item.queen && !item.hasActiveProcess),
    [hives, sourceHiveId]
  );

  useEffect(() => {
    if (outcome !== "recovered_to_hive") {
      setDestinationHiveId("");
      return;
    }
    if (!destinationHives.some((item) => item.id === destinationHiveId)) {
      setDestinationHiveId(destinationHives[0]?.id || "");
    }
  }, [outcome, destinationHives, destinationHiveId]);

  if (subscriptionLevel !== "premium" && !loading) return null;

  const sourceHive = hives.find((item) => item.id === sourceHiveId) || null;
  const sourceBecomesQueenless = outcome === "lost_not_recovered" || outcome === "recovered_to_hive";

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!sourceHiveId) {
      setError("Select the colony that swarmed.");
      return;
    }
    if (outcome === "recovered_to_hive" && !destinationHiveId) {
      setError("Select the hive or nucleus where the recovered swarm was placed.");
      return;
    }

    setSaving(true);
    try {
      const { error: rpcError } = await supabase.rpc("queen_record_swarm_v2", {
        p_hive_id: sourceHiveId,
        p_event_date: eventDate || null,
        p_outcome: outcome,
        p_destination_hive_id: outcome === "recovered_to_hive" ? destinationHiveId : null,
        p_replacement_method: sourceBecomesQueenless ? replacementMethod : null,
        p_expected_check_on: sourceBecomesQueenless ? expectedCheckOn || null : null,
        p_notes: notes || null,
      });
      if (rpcError) throw rpcError;

      const successText =
        outcome === "recovered_returned"
          ? "Swarm recorded as recovered and returned. The same Queen remains current in this hive."
          : outcome === "recovered_to_hive"
            ? "Recovered swarm recorded. The Queen has moved with the swarm and the source colony now has a replacement process."
            : "Swarm recorded as not recovered. The source colony now has a replacement process.";

      setMessage(successText);
      setNotes("");
      await load();
      window.setTimeout(() => window.location.reload(), 700);
    } catch (saveError) {
      setError(saveError?.message || "The swarm record could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto mb-5 max-w-7xl px-4 sm:px-6 lg:px-8">
      <details className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
        <summary className="cursor-pointer list-none bg-blue-50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="rounded-full bg-[#1a3329] p-2 text-white">
                <Bug className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-800">Staging Queen Records</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#1a3329]">Improved Swarm Workflow</h2>
                <p className="mt-1 text-sm text-gray-700">
                  Record whether the swarm was lost, recovered and returned, or recovered into another hive or nucleus.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-bold text-blue-900">Open</span>
          </div>
        </summary>

        <form onSubmit={submit} className="space-y-5 p-5">
          {error ? (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
          {message ? (
            <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">Loading swarm options…</div>
          ) : !queenrightHives.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              No active hive currently has a Queen record available for a swarm event.
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  Colony that swarmed
                  <select value={sourceHiveId} onChange={(e) => setSourceHiveId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                    {queenrightHives.map((item) => (
                      <option key={item.id} value={item.id}>{item.name} — {item.apiaryName} — {queenLabel(item.queen)}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Swarm date
                  <input type="date" value={eventDate} max={localToday()} onChange={(e) => setEventDate(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" />
                </label>
              </div>

              {sourceHive ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-bold text-[#1a3329]">{sourceHive.name}</p>
                  <p className="mt-1 text-sm text-gray-700">Current Queen: {queenLabel(sourceHive.queen)}</p>
                </div>
              ) : null}

              <label className="block text-sm font-semibold text-gray-700">
                What happened to the swarm?
                <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                  <option value="lost_not_recovered">Swarm lost / not recovered</option>
                  <option value="recovered_returned">Swarm recovered and returned to this hive</option>
                  <option value="recovered_to_hive">Swarm recovered and placed in another hive or nucleus</option>
                </select>
              </label>

              {outcome === "recovered_returned" ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                  The existing Queen record and assignment will remain current. HiveTag will record the swarm and recovery without starting a replacement-Queen process.
                </div>
              ) : null}

              {outcome === "recovered_to_hive" ? (
                <label className="block text-sm font-semibold text-gray-700">
                  Hive or nucleus containing the recovered swarm
                  <select value={destinationHiveId} onChange={(e) => setDestinationHiveId(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                    {!destinationHives.length ? <option value="">No empty hive or nucleus available</option> : null}
                    {destinationHives.map((item) => (
                      <option key={item.id} value={item.id}>{item.name} — {item.apiaryName}</option>
                    ))}
                  </select>
                </label>
              ) : null}

              {sourceBecomesQueenless ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    How will the original colony obtain its next Queen?
                    <select value={replacementMethod} onChange={(e) => setReplacementMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
                      {replacementOptions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Next check date
                    <input type="date" value={expectedCheckOn} onChange={(e) => setExpectedCheckOn(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" />
                  </label>
                </div>
              ) : null}

              <label className="block text-sm font-semibold text-gray-700">
                Notes
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Optional details about the swarm or recovery…" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </label>

              <div className="flex justify-end border-t border-gray-100 pt-4">
                <button type="submit" disabled={saving || (outcome === "recovered_to_hive" && !destinationHives.length)} className="inline-flex items-center gap-2 rounded-lg bg-[#1a3329] px-5 py-2 text-sm font-bold text-white hover:bg-[#28513f] disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving…" : "Record Swarm"}
                </button>
              </div>
            </>
          )}
        </form>
      </details>
    </div>
  );
}
