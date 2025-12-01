// src/pages/NFC/NFCLinkHive.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function NFCLinkHive() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const nfcUid = searchParams.get("nfc_uid") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState("all");
  const [selectedHiveId, setSelectedHiveId] = useState("");

  useEffect(() => {
    document.title = "Link NFC Tag to Hive • BeezKnees";
  }, []);

  useEffect(() => {
    if (!nfcUid) {
      setError("No NFC tag ID was provided. Try scanning the tag again.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [apiaryRes, hiveRes] = await Promise.all([
          supabase
            .from("apiaries")
            .select("id, name")
            .is("archived_at", null)
            .order("name"),
          supabase
            .from("hives")
            .select("id, name, apiary_id, archived_at")
            .is("archived_at", null)
            .order("name"),
        ]);

        if (apiaryRes.error) throw apiaryRes.error;
        if (hiveRes.error) throw hiveRes.error;

        setApiaries(apiaryRes.data || []);
        setHives(hiveRes.data || []);

        // If there's only one apiary, preselect it.
        if ((apiaryRes.data || []).length === 1) {
          setSelectedApiaryId(apiaryRes.data[0].id);
        }
      } catch (e) {
        console.error("Failed to load apiaries/hives for NFC link page:", e);
        setError("Could not load your apiaries and hives. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [nfcUid]);

  const filteredHives =
    selectedApiaryId === "all"
      ? hives
      : hives.filter((h) => h.apiary_id === selectedApiaryId);

  const handleAssignToHive = async () => {
    if (!nfcUid) {
      setError("Missing NFC tag ID. Scan the tag again.");
      return;
    }
    if (!selectedHiveId) {
      setError("Please choose a hive to assign this tag to.");
      return;
    }

    setError("");
    setStatus("");

    try {
      setSaving(true);

      // 1) Check if this NFC tag is already linked to some other active hive.
      const { data: existing, error: existingErr } = await supabase
        .from("hives")
        .select("id, name, apiary_id")
        .eq("nfc_uid", nfcUid)
        .neq("id", selectedHiveId)
        .is("archived_at", null);

      if (existingErr) {
        console.error("Failed to check existing NFC tag links:", existingErr);
        setError(
          "We read the tag, but couldn’t validate existing links. Please try again."
        );
        return;
      }

      if (existing && existing.length > 0) {
        const other = existing[0];
        setError(
          `This NFC tag is already linked to hive “${
            other.name || "another hive"
          }”. Clear it from that hive in NFC Tag Manager before assigning it here.`
        );
        return;
      }

      // 2) Check if the selected hive already has a (different) NFC tag.
      const { data: chosen, error: chosenErr } = await supabase
        .from("hives")
        .select("id, name, nfc_uid")
        .eq("id", selectedHiveId)
        .single();

      if (chosenErr) {
        console.error("Failed to load selected hive:", chosenErr);
        setError("Could not load the selected hive. Please try again.");
        return;
      }

      if (chosen?.nfc_uid && chosen.nfc_uid !== nfcUid) {
        setError(
          `The selected hive “${
            chosen.name || "this hive"
          }” already has a different NFC tag. Clear or change it on that hive before assigning a new tag.`
        );
        return;
      }

      // 3) Safe to assign: write the tag to this hive.
      const { error: updErr } = await supabase
        .from("hives")
        .update({ nfc_uid: nfcUid })
        .eq("id", selectedHiveId);

      if (updErr) throw updErr;

      const assignedHive =
        chosen || hives.find((h) => h.id === selectedHiveId) || null;

      setStatus(
        `Tag linked to hive “${
          assignedHive?.name || "Selected hive"
        }”. You can now tap this tag to open that hive.`
      );

      // Optionally redirect back to the scanner:
      // navigate("/nfc");
    } catch (e) {
      console.error("Failed to assign NFC tag to hive:", e);
      setError("Sorry, we couldn’t link this tag. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewHive = () => {
    if (!nfcUid) return;

    const apiaryPart =
      selectedApiaryId && selectedApiaryId !== "all"
        ? `&apiary_id=${encodeURIComponent(selectedApiaryId)}`
        : "";

    navigate(
      `/hives/new?nfc_uid=${encodeURIComponent(nfcUid)}${apiaryPart}&source=nfc`
    );
  };

  const shortUid =
    nfcUid.length > 16
      ? `${nfcUid.slice(0, 8)}…${nfcUid.slice(-4)}`
      : nfcUid || "Unknown";

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Link NFC Tag to Hive</h1>
            <p className="mt-1 text-sm text-gray-600">
              Choose an existing hive or create a new one for this tag.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Tag ID:{" "}
              <code className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[11px] break-all">
                {nfcUid || "Missing tag ID"}
              </code>
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <Link to="/nfc" className="text-blue-600 hover:underline">
              ← Back to Scan NFC Tag
            </Link>
          </div>
        </header>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {status && (
          <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {status}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-600">Loading your hives…</p>
        ) : !nfcUid ? (
          <p className="text-sm text-gray-600">
            No NFC tag ID found in the URL. Please go back and scan a tag again.
          </p>
        ) : (
          <>
            {/* Option 1: existing hive */}
            <section className="bg-white rounded-lg shadow p-4 space-y-4">
              <h2 className="text-lg font-semibold">
                Option 1 — Assign to an existing hive
              </h2>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="linkApiary"
                    className="text-sm font-medium text-gray-700"
                  >
                    Apiary
                  </label>
                  <select
                    id="linkApiary"
                    className="border rounded px-3 py-1.5 text-sm"
                    value={selectedApiaryId}
                    onChange={(e) => {
                      setSelectedApiaryId(e.target.value);
                      setSelectedHiveId(""); // reset hive selection
                    }}
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
                    htmlFor="linkHive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Hive
                  </label>
                  <select
                    id="linkHive"
                    className="border rounded px-3 py-1.5 text-sm min-w-[170px]"
                    value={selectedHiveId}
                    onChange={(e) => setSelectedHiveId(e.target.value)}
                  >
                    <option value="">Select hive…</option>
                    {filteredHives.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name || "Unnamed hive"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAssignToHive}
                disabled={saving || !selectedHiveId}
                className={`mt-2 inline-flex items-center px-4 py-2 rounded text-sm font-semibold text-white shadow ${
                  saving || !selectedHiveId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {saving ? "Linking tag…" : "Assign tag to selected hive"}
              </button>

              <p className="mt-2 text-xs text-gray-500">
                This will store the tag’s ID with the chosen hive. Next time you
                tap this tag, BeezKnees will take you straight to that hive’s
                inspection flow.
              </p>
            </section>

            {/* Option 2: new hive */}
            <section className="bg-white rounded-lg shadow p-4 space-y-3">
              <h2 className="text-lg font-semibold">
                Option 2 — Create a new hive with this tag
              </h2>
              <p className="text-sm text-gray-700">
                Prefer to create a brand new hive record for this tag? We’ll
                carry the tag ID into the <strong>New Hive</strong> form for
                you.
              </p>
              <button
                type="button"
                onClick={handleCreateNewHive}
                className="inline-flex items-center px-4 py-2 rounded text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow"
              >
                Create new hive with this tag
              </button>
              <p className="text-xs text-gray-500">
                Selected apiary (if any) will also be passed into the New Hive
                form.
              </p>
            </section>

            <section className="text-xs text-gray-500">
              <p>
                NFC tag: <strong>{shortUid}</strong>. If you ever need to reuse
                a tag, clear it from a hive using the{" "}
                <Link
                  to="/nfc/manage"
                  className="text-blue-600 hover:underline"
                >
                  NFC Tag Manager
                </Link>
                .
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
