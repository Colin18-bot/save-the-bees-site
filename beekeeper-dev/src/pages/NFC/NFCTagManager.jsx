// src/pages/NFC/NFCTagManager.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function NFCTagManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [apiaries, setApiaries] = useState([]);
  const [apiaryNameById, setApiaryNameById] = useState({});
  const [selectedApiaryId, setSelectedApiaryId] = useState("all");
  const [tags, setTags] = useState([]); // list of hives with nfc_uid
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "NFC Tag Manager • BeezKnees";
  }, []);

  // Load apiaries list for filter + name map
  useEffect(() => {
    const loadApiaries = async () => {
      try {
        const { data, error: apiaryErr } = await supabase
          .from("apiaries")
          .select("id, name")
          .is("archived_at", null)
          .order("name");

        if (apiaryErr) throw apiaryErr;

        setApiaries(data || []);

        const map = {};
        for (const a of data || []) map[a.id] = a.name;
        setApiaryNameById(map);
      } catch (e) {
        console.error("Failed to load apiaries for NFC manager:", e);
        setError("Could not load apiaries.");
      }
    };

    loadApiaries();
  }, []);

  // Load NFC-tagged hives whenever the filter changes
  useEffect(() => {
    const loadTags = async () => {
      setLoading(true);
      setError("");

      try {
        let q = supabase
          .from("hives")
          .select("id, name, apiary_id, nfc_uid, created_at, archived_at")
          .is("archived_at", null)
          .not("nfc_uid", "is", null)
          .order("created_at", { ascending: false });

        if (selectedApiaryId !== "all") {
          q = q.eq("apiary_id", selectedApiaryId);
        }

        const { data, error: hErr } = await q;
        if (hErr) throw hErr;

        setTags(data || []);
      } catch (e) {
        console.error("Failed to load NFC tags:", e);
        setError("Could not load NFC-tagged hives.");
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [selectedApiaryId]);

  const handleClearTag = async (hiveId) => {
    if (!window.confirm("Clear this NFC tag from the hive?")) return;

    try {
      setSaving(true);
      const { error: updErr } = await supabase
        .from("hives")
        .update({ nfc_uid: null })
        .eq("id", hiveId);

      if (updErr) throw updErr;

      // Remove from local list
      setTags((prev) => prev.filter((h) => h.id !== hiveId));
    } catch (e) {
      console.error("Failed to clear NFC tag:", e);
      alert("Sorry, we couldn’t clear that tag. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredTags = tags.filter((t) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (t.name || "").toLowerCase().includes(term) ||
      (t.nfc_uid || "").toLowerCase().includes(term)
    );
  });

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header / intro */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">NFC Tag Manager</h1>
            <p className="mt-1 text-sm text-gray-600">
              See which hives have HiveTag NFC linked, search by tag or hive
              name, and clear tags when you want to reuse them.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/nfc"
              className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
            >
              ← Back to Scan NFC Tag
            </Link>
            <Link
              to="/nfc/instructions"
              className="px-3 py-1.5 rounded border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
            >
              Printable NFC setup card
            </Link>
          </div>
        </header>

        {/* Filters */}
        <section className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <label
                htmlFor="nfcApiaryFilter"
                className="text-sm font-medium text-gray-700"
              >
                Filter by Apiary:
              </label>
              <select
                id="nfcApiaryFilter"
                className="border rounded px-3 py-2 text-sm"
                value={selectedApiaryId}
                onChange={(e) => setSelectedApiaryId(e.target.value)}
              >
                <option value="all">All apiaries</option>
                {apiaries.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="nfcSearch"
                className="text-sm font-medium text-gray-700"
              >
                Search:
              </label>
              <input
                id="nfcSearch"
                type="text"
                className="border rounded px-3 py-1.5 text-sm w-full md:w-64"
                placeholder="Hive name or tag ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Tip: If a physical tag is damaged or moved, clear it here and then
            scan it again on the new hive to link it.
          </p>
        </section>

        {/* Table / list */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Tagged hives</h2>

          {error && (
            <p className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-gray-500">Loading NFC tags…</p>
          ) : filteredTags.length === 0 ? (
            <p className="text-sm text-gray-500">
              No NFC tags found for this filter. Try scanning a tag from the{" "}
              <Link to="/nfc" className="text-blue-600 underline">
                Scan NFC Tag
              </Link>{" "}
              page to link your first hive.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-t border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-700">
                      Hive
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-gray-700">
                      Apiary
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-gray-700">
                      Tag ID
                    </th>
                    <th className="text-right px-3 py-2 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.map((hive) => (
                    <tr
                      key={hive.id}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-3 py-2 align-top">
                        <div className="font-semibold">
                          {hive.name || "Unnamed hive"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created:{" "}
                          {hive.created_at
                            ? new Date(
                                hive.created_at
                              ).toLocaleDateString("en-GB")
                            : "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {hive.apiary_id && apiaryNameById[hive.apiary_id]
                          ? apiaryNameById[hive.apiary_id]
                          : "—"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <code className="text-xs break-all bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                          {hive.nfc_uid}
                        </code>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col items-end gap-1">
                          <Link
                            to={`/hives?highlight=${encodeURIComponent(
                              hive.id
                            )}&type=HIVE${
                              hive.apiary_id
                                ? `&apiary_id=${encodeURIComponent(
                                    hive.apiary_id
                                  )}`
                                : ""
                            }`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Open hive in list →
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleClearTag(hive.id)}
                            disabled={saving}
                            className="text-xs text-rose-700 hover:text-rose-800 disabled:text-gray-400"
                          >
                            {saving ? "Working…" : "Clear tag from hive"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
