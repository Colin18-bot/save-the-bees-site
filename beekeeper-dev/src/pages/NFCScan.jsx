// src/pages/NFCScan.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

// --- Helpers ---------------------------------------------------------------

// Decode NDEF "text" / "mime:text/plain" safely
function decodeNdefText(record) {
  try {
    if (record.recordType === "text") {
      // record.data is a DataView per spec (Chrome)
      const dv = record.data;
      const bytes = dv?.buffer ? new Uint8Array(dv.buffer) : new Uint8Array(dv);
      if (!bytes.length) return "";
      const langLen = bytes[0] & 0x3f; // b0..5 = language code length
      const body = bytes.slice(1 + langLen);
      return new TextDecoder().decode(body).trim();
    }
    if (record.recordType === "mime" && record.mediaType === "text/plain") {
      return new TextDecoder().decode(record.data).trim();
    }
  } catch (_) {}
  return "";
}

// Try to extract a useful code from an NDEF reading event
function extractTagCode(evt) {
  // 1) Hardware serial (works on some Androids; not on iOS Safari)
  const serial = (evt?.serialNumber || "").trim();
  if (serial) return serial;

  // 2) NDEF records
  try {
    const recs = evt?.message?.records || [];
    for (const rec of recs) {
      // URL record (Chrome returns recordType "url" / "absolute-url")
      if (rec.recordType === "url" || rec.recordType === "absolute-url") {
        const dataStr =
          typeof rec.data === "string"
            ? rec.data
            : new TextDecoder().decode(rec.data || new Uint8Array(0));
        try {
          const u = new URL(dataStr, window.location.origin);
          // Prefer ?t / ?nfc / ?tag
          const q =
            u.searchParams.get("t") ||
            u.searchParams.get("nfc") ||
            u.searchParams.get("tag");
          if (q) return q;
          // Else last path segment
          const segs = u.pathname.split("/").filter(Boolean);
          if (segs.length) return segs[segs.length - 1];
          return dataStr;
        } catch {
          // Not a full URL? Just return raw string
          if (dataStr) return dataStr;
        }
      }
      if (rec.recordType === "text" || rec.recordType === "mime") {
        const s = decodeNdefText(rec);
        if (s) return s;
      }
    }
  } catch (_) {}

  return "";
}

const normalizeTag = (s) => (s || "").trim().replace(/\s+/g, "").toLowerCase();

// --------------------------------------------------------------------------

export default function NFCScan() {
  const navigate = useNavigate();
  const [qs] = useSearchParams();
  const location = useLocation();

  const [message, setMessage] = useState("Waiting for NFC scan…");
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    // If a tag value is already in the URL (?t= / ?nfc= / ?tag=), use that.
    const fromUrl = qs.get("t") || qs.get("nfc") || qs.get("tag") || "";
    if (fromUrl && !startedRef.current) {
      startedRef.current = true;
      handleLookup(fromUrl);
      return;
    }

    let cancelled = false;
    (async () => {
      if (!("NDEFReader" in window)) {
        setError(
          "This device/browser can’t scan NFC directly. You can still use tags programmed with a URL that includes a code (e.g. /nfc?t=YOURCODE)."
        );
        return;
      }

      try {
        const reader = new window.NDEFReader();
        await reader.scan();
        setMessage("Hold a tag near the phone…");

        reader.onreadingerror = () => {
          if (!cancelled) setError("NFC scan failed. Please try again.");
        };

        reader.onreading = async (evt) => {
          if (cancelled) return;
          const raw = extractTagCode(evt);
          const code = normalizeTag(raw);
          if (!code) {
            setError(
              "Couldn’t read a code from this tag. Program it with a URL or text, or use a device that exposes the hardware UID."
            );
            return;
          }
          setMessage("Tag detected. Looking up hive…");
          await handleLookup(code, raw);
        };
      } catch (e) {
        console.error(e);
        setError(
          "Could not start NFC scan (permission or browser support). If your tag opens a URL, include the code as ?t=YOURCODE."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qs]);

  async function handleLookup(codeMaybeLower, originalRaw = null) {
    setError("");
    const rawCode = (originalRaw ?? codeMaybeLower) || "";
    const code = normalizeTag(codeMaybeLower);
    if (!code) {
      setError("Empty tag.");
      return;
    }

    // Require auth, but keep the deep link so we come back here.
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      const next = encodeURIComponent(`/nfc?nfc=${encodeURIComponent(rawCode)}`);
      navigate(`/login?redirect=${next}`);
      return;
    }

    // Prefer exact lowercase match (uses your lower(nfc_uid) unique index if rows are normalised)
    let hive = null;

    let resp = await supabase
      .from("hives")
      .select("id, apiary_id, name")
      .eq("user_id", userId)
      .eq("nfc_uid", code)
      .is("archived_at", null)
      .maybeSingle();

    if (resp.error) {
      console.error(resp.error);
      setError("Lookup failed. Please try again.");
      return;
    }
    hive = resp.data || null;

    // Fallback to case-insensitive equality for any legacy rows not lowercased yet
    if (!hive) {
      const fallback = await supabase
        .from("hives")
        .select("id, apiary_id, name")
        .eq("user_id", userId)
        .ilike("nfc_uid", rawCode.trim())
        .is("archived_at", null)
        .maybeSingle();

      if (fallback.error) {
        console.error(fallback.error);
        setError("Lookup failed. Please try again.");
        return;
      }
      hive = fallback.data || null;
    }

    if (hive) {
      // Found → go straight to New Inspection
      const url = `/inspections/new?hive_id=${hive.id}` +
        `&apiary_id=${hive.apiary_id || ""}` +
        `&nfc_uid=${encodeURIComponent(rawCode)}`;
      navigate(url, { replace: true });
    } else {
      // Not found → New Hive with nfc prefilled
      navigate(`/hives/new?nfc_uid=${encodeURIComponent(rawCode)}`, { replace: true });
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Scan NFC Tag</h1>
      <p className="text-yellow-700 font-medium mb-3">{message}</p>
      {error && <p className="text-red-600">{error}</p>}
      <div className="text-xs text-zinc-500 mt-6">
        Tip: you can also write a URL to the tag like&nbsp;
        <code>/nfc?t=&lt;your-code&gt;</code>&nbsp;so iOS opens the right page without Web NFC.
      </div>
    </div>
  );
}
