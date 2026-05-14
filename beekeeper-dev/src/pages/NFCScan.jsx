// src/pages/NFCScan.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function NFCScan() {
  const navigate = useNavigate();
  const location = useLocation();

  // Subscription
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");
  const [loadingSub, setLoadingSub] = useState(true);

  // NFC + UI state
  const [supportStatus, setSupportStatus] = useState("unknown"); // "unknown" | "supported" | "unsupported"
  const [isScanning, setIsScanning] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Apple / iPhone setup
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [loadingHiveData, setLoadingHiveData] = useState(false);
  const [selectedApiaryId, setSelectedApiaryId] = useState("");
  const [selectedHiveId, setSelectedHiveId] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  // Debug panel
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    supportChecked: false,
    supported: null,
    lastSuccessfulScan: null,
    lastError: null,
    lastException: null,
    lastLookup: null,
  });

  useEffect(() => {
    document.title = "Scan NFC Tag • BeezKnees";
  }, []);

  // Detect Web NFC support
  useEffect(() => {
    const supported = typeof window !== "undefined" && "NDEFReader" in window;
    setSupportStatus(supported ? "supported" : "unsupported");
    setDebugInfo((prev) => ({
      ...prev,
      supportChecked: true,
      supported,
    }));
  }, []);

  // Load subscription level (Premium gate)
  useEffect(() => {
    const loadSub = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setSubscriptionLevel("free");
          setLoadingSub(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error loading profile in NFCScan:", error);
          setSubscriptionLevel("free");
        } else if (profile?.subscription_level) {
          setSubscriptionLevel(profile.subscription_level);
        } else {
          setSubscriptionLevel("free");
        }
      } catch (err) {
        console.error("Failed to load subscription level in NFCScan:", err);
        setSubscriptionLevel("free");
      } finally {
        setLoadingSub(false);
      }
    };

    loadSub();
  }, []);

  // Load hive data for Apple / iPhone setup
  useEffect(() => {
    const loadHiveData = async () => {
      if (loadingSub || subscriptionLevel !== "premium") return;

      setLoadingHiveData(true);

      try {
        const [
          { data: apiaryData, error: apiaryError },
          { data: hiveData, error: hiveError },
        ] = await Promise.all([
          supabase
            .from("apiaries")
            .select("id, name")
            .is("archived_at", null)
            .order("name", { ascending: true }),
          supabase
            .from("hives")
            .select("id, name, apiary_id, archived_at, nfc_link_enabled")
            .is("archived_at", null)
            .order("name", { ascending: true }),
        ]);

        if (apiaryError) {
          console.error("Error loading apiaries in NFCScan:", apiaryError);
        }

        if (hiveError) {
          console.error("Error loading hives in NFCScan:", hiveError);
        }

        const safeApiaries = apiaryData || [];
        const safeHives = hiveData || [];

        setApiaries(safeApiaries);
        setHives(safeHives);

        // Default apiary/hive selection
        if (safeApiaries.length > 0 && !selectedApiaryId) {
          const firstApiaryId = safeApiaries[0].id;
          setSelectedApiaryId(firstApiaryId);

          const firstHiveInApiary = safeHives.find(
            (h) => h.apiary_id === firstApiaryId
          );

          if (firstHiveInApiary) {
            setSelectedHiveId(firstHiveInApiary.id);
          } else if (safeHives.length > 0) {
            setSelectedHiveId(safeHives[0].id);
          }
        } else if (!selectedHiveId && safeHives.length > 0) {
          setSelectedHiveId(safeHives[0].id);
        }
      } catch (err) {
        console.error("Failed to load hive data in NFCScan:", err);
      } finally {
        setLoadingHiveData(false);
      }
    };

    loadHiveData();
  }, [loadingSub, subscriptionLevel, selectedApiaryId, selectedHiveId]);

  // Show messages when returning from NFC tag checkout
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const purchased = params.get("tags_purchased");
    const canceled = params.get("canceled");

    if (purchased === "1") {
      setInfoMessage(
        "✅ Thank you — your NFC tags order has been received. You’ll get a confirmation email from Stripe shortly."
      );
      setErrorMessage("");
    }

    if (canceled === "1") {
      setErrorMessage(
        "NFC tag checkout was cancelled — no payment was taken. You can try again at any time."
      );
    }
  }, [location.search]);

  const filteredHives = useMemo(() => {
    if (!selectedApiaryId) return hives;
    return hives.filter((hive) => hive.apiary_id === selectedApiaryId);
  }, [hives, selectedApiaryId]);

  const selectedHive = useMemo(() => {
    return hives.find((h) => h.id === selectedHiveId) || null;
  }, [hives, selectedHiveId]);

  useEffect(() => {
    if (!filteredHives.length) {
      setSelectedHiveId("");
      return;
    }

    const stillValid = filteredHives.some((hive) => hive.id === selectedHiveId);
    if (!stillValid) {
      setSelectedHiveId(filteredHives[0].id);
    }
  }, [filteredHives, selectedHiveId]);

  const generatedAppleLink = selectedHiveId
    ? `${window.location.origin}/nfc/open?hive_id=${encodeURIComponent(
        selectedHiveId
      )}`
    : "";

  const handleCopyAppleLink = async () => {
    if (!generatedAppleLink || !selectedHiveId) {
      setCopyMessage("Please select a hive first.");
      setTimeout(() => setCopyMessage(""), 2500);
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedAppleLink);

      const { error } = await supabase
        .from("hives")
        .update({ nfc_link_enabled: true })
        .eq("id", selectedHiveId);

      if (error) {
        console.error("Failed to save iPhone NFC status:", error);
        setCopyMessage("Link copied, but HiveTag could not save NFC status.");
        setTimeout(() => setCopyMessage(""), 3000);
        return;
      }

      setHives((prev) =>
        prev.map((h) =>
          h.id === selectedHiveId ? { ...h, nfc_link_enabled: true } : h
        )
      );

      setCopyMessage("NFC link copied and iPhone NFC enabled.");
      setTimeout(() => setCopyMessage(""), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
      setCopyMessage("Could not copy link. Please try again.");
      setTimeout(() => setCopyMessage(""), 2500);
    }
  };

  const handleClearAppleNfc = async () => {
    if (!selectedHiveId) {
      setCopyMessage("Please select a hive first.");
      setTimeout(() => setCopyMessage(""), 2500);
      return;
    }

    const ok = window.confirm(
      "Clear iPhone / iPad NFC status for this hive?"
    );
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("hives")
        .update({ nfc_link_enabled: false })
        .eq("id", selectedHiveId);

      if (error) {
        console.error("Failed to clear iPhone NFC status:", error);
        setCopyMessage("Could not clear iPhone NFC status. Please try again.");
        setTimeout(() => setCopyMessage(""), 3000);
        return;
      }

      setHives((prev) =>
        prev.map((h) =>
          h.id === selectedHiveId ? { ...h, nfc_link_enabled: false } : h
        )
      );

      setCopyMessage("iPhone / iPad NFC status cleared.");
      setTimeout(() => setCopyMessage(""), 2500);
    } catch (err) {
      console.error("Failed to clear iPhone NFC status:", err);
      setCopyMessage("Could not clear iPhone NFC status. Please try again.");
      setTimeout(() => setCopyMessage(""), 3000);
    }
  };

  const handleScan = useCallback(async () => {
    setInfoMessage("");
    setErrorMessage("");
    setCopyMessage("");

    if (supportStatus !== "supported") {
      setErrorMessage(
        "This device or browser doesn’t support Web NFC. Use Chrome on Android for tag scanning, or use the iPhone / iPad NFC link method below."
      );
      setDebugInfo((prev) => ({
        ...prev,
        lastError: {
          reason: "NotSupported",
          at: new Date().toISOString(),
        },
      }));
      return;
    }

    if (isScanning) {
      return;
    }

    try {
      const ndef = new NDEFReader();

      ndef.onreadingerror = () => {
        setIsScanning(false);
        setInfoMessage("");
        setErrorMessage(
          "We couldn’t read this NFC tag. Try holding your phone closer or try another tag."
        );
        setDebugInfo((prev) => ({
          ...prev,
          lastError: {
            reason: "ReadingErrorEvent",
            at: new Date().toISOString(),
          },
        }));
      };

      ndef.onreading = async (event) => {
        setIsScanning(false);
        setInfoMessage("");
        setErrorMessage("");

        const serial = event.serialNumber || "";
        const records = event.message?.records || [];
        const recordTypes = records.map((r) => r.recordType);

        const scanDebug = {
          serialNumber: serial || "(empty)",
          recordCount: records.length,
          recordTypes,
          rawMessageType: event.message?.records?.[0]?.mediaType || null,
          at: new Date().toISOString(),
        };

        setDebugInfo((prev) => ({
          ...prev,
          lastSuccessfulScan: scanDebug,
        }));

        if (!serial) {
          setErrorMessage(
            "The tag was read but didn’t provide a serial number. Try another tag."
          );
          setDebugInfo((prev) => ({
            ...prev,
            lastError: {
              reason: "EmptySerial",
              at: new Date().toISOString(),
            },
          }));
          return;
        }

        setInfoMessage("Tag detected. Looking up the hive linked to this tag…");

        const { data: hive, error } = await supabase
          .from("hives")
          .select("id, apiary_id, name, archived_at")
          .eq("nfc_uid", serial)
          .maybeSingle();

        setDebugInfo((prev) => ({
          ...prev,
          lastLookup: {
            serial,
            at: new Date().toISOString(),
            error: error ? error.message : null,
            foundHiveId: hive?.id || null,
            archivedAt: hive?.archived_at || null,
          },
        }));

        if (error) {
          console.error("Error looking up hive by NFC serial:", error);
          setErrorMessage(
            "We read the tag, but there was a problem checking your hives. Please try again."
          );
          setInfoMessage("");
          return;
        }

        if (hive && !hive.archived_at) {
          setInfoMessage(
            `Found hive “${hive.name}”. Opening a new inspection for this hive…`
          );
          navigate(
            `/inspections/new?hive_id=${encodeURIComponent(
              hive.id
            )}&apiary_id=${encodeURIComponent(hive.apiary_id)}&source=nfc`
          );
          return;
        }

        if (hive && hive.archived_at) {
          setErrorMessage(
            "This tag is linked to an archived hive. Unarchive or update the hive first, or assign this tag to a new hive."
          );
          setInfoMessage("");
          return;
        }

        setInfoMessage(
          "This Android tag isn’t linked to any hive yet. Choose a hive to link it to, or create a new hive."
        );
        navigate(`/nfc/link?nfc_uid=${encodeURIComponent(serial)}`);
      };

      setIsScanning(true);
      setInfoMessage("Hold your phone close to the NFC tag…");
      setErrorMessage("");

      await ndef.scan();
    } catch (err) {
      console.error("Error starting NFC scan:", err);
      setIsScanning(false);
      setInfoMessage("");

      let userMsg =
        "Something went wrong while starting the NFC scan. Please try again.";

      if (err && err.name === "NotAllowedError") {
        userMsg =
          "NFC permission was blocked. Please allow NFC access for your browser and try again.";
      } else if (err && err.name === "NotSupportedError") {
        userMsg =
          "This device or browser doesn’t support Web NFC. Use Chrome on Android for tag scanning, or use the iPhone / iPad NFC link method below.";
        setSupportStatus("unsupported");
      } else if (err && err.name === "AbortError") {
        userMsg =
          "The NFC scan was cancelled before a tag was read. Try again when you’re ready.";
      }

      setErrorMessage(userMsg);

      setDebugInfo((prev) => ({
        ...prev,
        lastException: {
          name: err?.name || "UnknownError",
          message: err?.message || String(err),
          at: new Date().toISOString(),
        },
      }));
    }
  }, [supportStatus, isScanning, navigate]);

  const disabledReason =
    supportStatus !== "supported"
      ? "NFC is not supported in this browser/device."
      : loadingSub
      ? "Checking your plan…"
      : subscriptionLevel !== "premium"
      ? "NFC scanning is a Premium feature."
      : null;

  const canScan =
    supportStatus === "supported" &&
    !loadingSub &&
    subscriptionLevel === "premium" &&
    !isScanning;

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h2 className="text-2xl font-bold mb-1">Set Up NFC Tags</h2>
          <p className="text-gray-600 text-sm">
            Set up and use HiveTag NFC labels for both Android and iPhone / iPad.
            Android can scan blank tags directly in the app. iPhone / iPad uses
            a HiveTag link written to the tag instead.
          </p>

          <div className="mt-3 mb-1 flex flex-wrap items-center gap-2 text-xs">
            <Link
              to="/nfc/instructions"
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-800 hover:bg-blue-100"
            >
              <span aria-hidden="true">🖨️</span>
              <span>NFC setup card</span>
            </Link>

            <Link
              to="/nfc/manage"
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 hover:bg-amber-100"
            >
              <span aria-hidden="true">📋</span>
              <span>Manage Android NFC tags</span>
            </Link>

            <Link
              to="/nfc/tags"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 hover:bg-emerald-100"
            >
              <span aria-hidden="true">🛒</span>
              <span>Buy NFC tags</span>
            </Link>
          </div>

          <p className="text-xs text-gray-600 mt-1">
            Need more detail?{" "}
            <Link to="/help#nfc" className="text-blue-600 hover:underline">
              Read NFC help →
            </Link>
          </p>
        </header>

        {loadingSub ? (
          <section className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-600">
              Checking your plan and NFC support…
            </p>
          </section>
        ) : subscriptionLevel !== "premium" ? (
          <section className="bg-white rounded-lg shadow p-5 space-y-3">
            <p className="text-sm text-gray-700">
              NFC tap-to-log is a{" "}
              <span className="font-semibold text-blue-700">Premium</span>{" "}
              feature. Upgrade to link HiveTag NFC labels to your hives and
              jump straight into inspections from a tap.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 rounded bg-yellow-400 text-[#1a3329] text-sm font-semibold hover:bg-yellow-300 border border-yellow-500"
            >
              View plans &amp; upgrade →
            </Link>
          </section>
        ) : (
          <>
            {(infoMessage || errorMessage) && (
              <section className="bg-white rounded-lg shadow p-5 space-y-3">
                {infoMessage && (
                  <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                    {infoMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    {errorMessage}
                  </div>
                )}
              </section>
            )}

            <section className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Android setup
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Use a blank NFC tag and scan it directly in HiveTag. This
                    works best in Chrome on Android.
                  </p>
                </div>

                {supportStatus === "unsupported" && (
                  <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    Web NFC is not supported in this browser/device. Android
                    users should use Chrome. Apple users should use the iPhone
                    setup card instead.
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleScan}
                    disabled={!canScan}
                    className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm font-semibold transition-colors ${
                      canScan
                        ? "bg-green-700 text-white hover:bg-green-800"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    title={disabledReason || undefined}
                  >
                    {isScanning
                      ? "Scanning… Hold near the tag"
                      : "Scan Blank NFC Tag"}
                  </button>

                  <p className="text-xs text-gray-500">
                    Android only: hold the tag near the back of your device until
                    it beeps or vibrates. If the tag is not already linked,
                    HiveTag will let you assign it to a hive.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    iPhone / iPad setup
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Apple browsers do not support Web NFC in the same way.
                    Instead, choose a hive, copy its HiveTag link, and write
                    that link to the NFC tag using an NFC writing app.
                  </p>
                </div>

                {loadingHiveData ? (
                  <p className="text-sm text-gray-600">
                    Loading your apiaries and hives…
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apiary
                      </label>
                      <select
                        value={selectedApiaryId}
                        onChange={(e) => setSelectedApiaryId(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select apiary</option>
                        {apiaries.map((apiary) => (
                          <option key={apiary.id} value={apiary.id}>
                            {apiary.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hive
                      </label>
                      <select
                        value={selectedHiveId}
                        onChange={(e) => setSelectedHiveId(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        disabled={!filteredHives.length}
                      >
                        <option value="">
                          {filteredHives.length ? "Select hive" : "No hives found"}
                        </option>
                        {filteredHives.map((hive) => (
                          <option key={hive.id} value={hive.id}>
                            {hive.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NFC link to write to the tag
                      </label>
                      <div className="rounded border bg-gray-50 px-3 py-2 text-xs text-gray-800 break-all">
                        {generatedAppleLink || "Select a hive to generate a link"}
                      </div>
                    </div>

                    {selectedHive?.nfc_link_enabled && (
                      <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                        iPhone / iPad NFC is currently enabled for this hive.
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleCopyAppleLink}
                        disabled={!generatedAppleLink}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm font-semibold transition-colors ${
                          generatedAppleLink
                            ? "bg-blue-700 text-white hover:bg-blue-800"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Copy NFC Link
                      </button>

                      <button
                        type="button"
                        onClick={handleClearAppleNfc}
                        disabled={!selectedHiveId || !selectedHive?.nfc_link_enabled}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm font-semibold transition-colors ${
                          selectedHiveId && selectedHive?.nfc_link_enabled
                            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Clear iPhone NFC status
                      </button>
                    </div>

                    {copyMessage && (
                      <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        {copyMessage}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      After copying the link, paste it into an NFC writing app
                      on your iPhone / iPad and write it to the tag. To reuse
                      the tag later, just overwrite it with a new HiveTag link.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {subscriptionLevel === "premium" && (
          <section className="border rounded-lg bg-white p-4">
            <button
              type="button"
              onClick={() => setDebugOpen((v) => !v)}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              {debugOpen
                ? "Hide debug info"
                : "Show debug info (for troubleshooting)"}
            </button>

            {debugOpen && (
              <div className="mt-3 text-xs bg-slate-900 text-slate-100 rounded p-3 overflow-x-auto">
                {debugInfo &&
                (debugInfo.lastSuccessfulScan ||
                  debugInfo.lastError ||
                  debugInfo.lastException ||
                  debugInfo.lastLookup) ? (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                ) : (
                  <p>No scans attempted yet.</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}