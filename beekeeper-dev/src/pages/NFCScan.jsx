// src/pages/NFCScan.jsx
import React, { useEffect, useState, useCallback } from "react";
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

  const handleScan = useCallback(
    async () => {
      setInfoMessage("");
      setErrorMessage("");

      if (supportStatus !== "supported") {
        setErrorMessage(
          "This device or browser doesn’t support Web NFC. Try Chrome for Android, or use the normal inspection flow."
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
        // Web NFC setup
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

          setInfoMessage(
            "Tag detected. Looking up the hive linked to this tag…"
          );

          // Look up hive by NFC UID
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
            // Known + active hive → New Inspection
            setInfoMessage(
              `Found hive “${hive.name}”. Opening a new inspection for this hive…`
            );
            navigate(
              `/inspections/new?hive_id=${encodeURIComponent(
                hive.id
              )}&apiary_id=${encodeURIComponent(
                hive.apiary_id
              )}&source=nfc`
            );
            return;
          }

          if (hive && hive.archived_at) {
            // Tag linked to archived hive
            setErrorMessage(
              "This tag is linked to an archived hive. Unarchive or update the hive first, or assign this tag to a new hive."
            );
            setInfoMessage("");
            return;
          }

          // Unknown tag → New Hive with nfc_uid pre-filled
          setInfoMessage(
            "This tag isn’t linked to any hive yet. Let’s create a new hive using this tag."
          );
          navigate(
            `/hives/new?nfc_uid=${encodeURIComponent(serial)}&source=nfc`
          );
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
            "This device or browser doesn’t support Web NFC. Try Chrome for Android, or use the normal inspection flow.";
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
    },
    [supportStatus, isScanning, navigate]
  );

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
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold mb-1">Scan NFC Tag</h1>
          <p className="text-gray-600 text-sm">
            Tap a HiveTag NFC label with your phone to jump straight into that
            hive’s inspection flow. Works best with Chrome on Android.
          </p>

          {/* NFC helper links: instructions + tag manager + store */}
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
              <span>Manage NFC tags</span>
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

        {/* Main NFC card */}
        <section className="bg-white rounded-lg shadow p-5 space-y-4">
          {loadingSub ? (
            <p className="text-sm text-gray-600">
              Checking your plan and NFC support…
            </p>
          ) : subscriptionLevel !== "premium" ? (
            <div className="space-y-3">
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
            </div>
          ) : (
            <>
              {supportStatus === "unsupported" && (
                <div className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  This device or browser doesn’t support Web NFC. You can still
                  use HiveTag labels if they’re encoded with a URL that opens
                  this page, or use the normal inspection flow instead.
                </div>
              )}

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
                    : "Scan NFC Tag"}
                </button>
                <p className="text-xs text-gray-500">
                  Make sure NFC is enabled on your phone. Hold the tag near the
                  back of your device until it beeps or vibrates.
                </p>
              </div>
            </>
          )}
        </section>

        {/* Debug panel – Premium only, for you as the app builder */}
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
