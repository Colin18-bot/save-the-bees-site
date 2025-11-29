// src/pages/Hives/NewHive.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabase";
import dayjs from "dayjs";
// ✅ GA custom events (respects consent)
import { trackEvent } from "../Legal/gaEvents";

const NewHive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const successRef = useRef(null);

  // Read query params once on mount
  const urlParams = new URLSearchParams(location.search);
  const nfcFromQuery = (urlParams.get("nfc_uid") || "").trim();
  const apiaryParamFromQuery = urlParams.get("apiary_id");
  const sourceFromQuery = urlParams.get("source") || "";

  const [formData, setFormData] = useState({
    name: "",
    apiary_id: "",
    hive_type: "",
    hive_type_other: "",
    date_established: dayjs().format("YYYY-MM-DD"),
    status: "active",
    notes: "",
    photo_url: "",
    nfc_uid: "", // set only via ?nfc_uid (scanner flow) for premium users
  });

  const [apiaries, setApiaries] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");

  // --------- Load apiaries + defaults + subscription (also pick up nfc from URL) ---------
  useEffect(() => {
    const fetchData = async () => {
      const nfcParam = nfcFromQuery;
      const apiaryParam = apiaryParamFromQuery;

      const [{ data: userWrap }, { data: apiaryData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("apiaries")
          .select("id, name, is_default, archived_at")
          .is("archived_at", null)
          .order("name"),
      ]);

      setApiaries(apiaryData || []);

      const uid = userWrap?.user?.id || null;
      if (!uid) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", uid)
        .maybeSingle();

      const level = profile?.subscription_level || "free";
      setSubscriptionLevel(level);

      // ✅ NFC behaviour:
      // - Premium + ?nfc_uid present:
      //    * If tag already linked to an ACTIVE hive → go straight to NEW INSPECTION
      //    * If not linked → prefill nfc_uid on the new hive form
      if (level === "premium" && nfcParam) {
        const { data: existingHives, error: existingErr } = await supabase
          .from("hives")
          .select("id, apiary_id")
          .ilike("nfc_uid", nfcParam) // case-insensitive exact match
          .is("archived_at", null);

        if (!existingErr && Array.isArray(existingHives)) {
          if (existingHives.length === 1) {
            const hive = existingHives[0];
            // 🔁 Hive already exists for this tag → ALWAYS start a NEW inspection
            navigate(
              `/inspections/new?hive_id=${encodeURIComponent(
                hive.id
              )}&nfc_uid=${encodeURIComponent(nfcParam)}`,
              { replace: true }
            );
            return; // stop initialisation here
          }

          if (existingHives.length > 1) {
            setErrorMessage(
              "This NFC tag is linked to multiple hives. Please resolve duplicates first."
            );
            // Do NOT prefill nfc_uid in this case
          } else {
            // No existing hive for this tag → treat as new link
            setFormData((prev) => ({ ...prev, nfc_uid: nfcParam }));
          }
        } else if (existingErr) {
          console.error("NFC lookup error in NewHive:", existingErr);
          // Fallback: allow creating, but keep error visible if you want
          setFormData((prev) => ({ ...prev, nfc_uid: nfcParam }));
        }
      }

      // Choose apiary: URL > default apiary > single option
      let chosenApiaryId = "";
      if (apiaryParam && (apiaryData || []).some((a) => a.id === apiaryParam)) {
        chosenApiaryId = apiaryParam;
      } else {
        const def = (apiaryData || []).find((a) => a.is_default);
        if (def) chosenApiaryId = def.id;
        else if ((apiaryData || []).length === 1) chosenApiaryId = apiaryData[0].id;
      }
      if (chosenApiaryId) {
        setFormData((prev) => ({ ...prev, apiary_id: chosenApiaryId }));
      }
    };

    fetchData();

    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------- Handlers ---------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "nfc_uid") setErrorMessage(""); // (no manual input shown, but safe to keep)
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemovePhoto = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const checkDuplicateHiveName = async () => {
    const { data } = await supabase
      .from("hives")
      .select("id")
      .eq("apiary_id", formData.apiary_id)
      .eq("name", formData.name)
      .is("archived_at", null);
    return data?.length > 0;
  };

  // Case-insensitive duplicate NFC check against ACTIVE hives
  const validateUniqueNfc = async (uidRaw) => {
    const uid = (uidRaw || "").trim();
    if (!uid) return false;
    const { data, error } = await supabase
      .from("hives")
      .select("id")
      .ilike("nfc_uid", uid) // exact string, case-insensitive (no wildcards)
      .is("archived_at", null);
    if (error) {
      console.error("NFC validation error:", error);
      return true; // be safe: block on error
    }
    return (data?.length || 0) > 0;
  };

  const uploadPhoto = async (hiveId) => {
    if (!selectedFile) return null;

    const safeName = selectedFile.name.replace(/\s+/g, "_");
    const filename = `hives/${hiveId}-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filename, selectedFile, { upsert: true, contentType: selectedFile.type });

    if (uploadError) return null;

    const { data: publicUrlData } = supabase.storage
      .from("photos")
      .getPublicUrl(filename);
    return publicUrlData.publicUrl;
  };

  // --------- Submit ---------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Normalize outgoing fields (empty strings -> null)
    const normalize = (obj) =>
      Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v]));

    // Required: apiary_id
    if (!formData.apiary_id) {
      setErrorMessage("Please select an apiary.");
      setLoading(false);
      return;
    }

    // Prevent duplicate name within the apiary
    if (await checkDuplicateHiveName()) {
      setErrorMessage("A hive with this name already exists in the selected apiary.");
      setLoading(false);
      return;
    }

    // Ensure apiary is active (belt & braces)
    const { data: apiaryRow } = await supabase
      .from("apiaries")
      .select("archived_at")
      .eq("id", formData.apiary_id)
      .maybeSingle();
    if (apiaryRow?.archived_at) {
      setErrorMessage("Selected apiary is archived. Choose an active apiary.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      setErrorMessage("You must be logged in.");
      setLoading(false);
      return;
    }

    // NFC duplicate guard (premium only; value set only via scanner param)
    const base = normalize(formData);
    const candidateNfc = (base.nfc_uid || "").trim();
    if (subscriptionLevel === "premium" && candidateNfc) {
      const duplicateNfc = await validateUniqueNfc(candidateNfc);
      if (duplicateNfc) {
        setErrorMessage("This NFC tag is already linked to another active hive.");
        setLoading(false);
        return;
      }
    }

    // Insert hive
    const {
      name,
      apiary_id,
      hive_type,
      hive_type_other,
      date_established,
      status,
      notes,
    } = base;

    const { data: inserted, error: insertError } = await supabase
      .from("hives")
      .insert({
        name,
        apiary_id,
        hive_type,
        hive_type_other,
        date_established,
        status,
        notes,
        nfc_uid:
          subscriptionLevel === "premium" && candidateNfc ? candidateNfc : null,
        user_id: user.id,
      })
      .select()
      .single();

    // Unique index fallback / general error
    if (insertError) {
      console.error(insertError);
      if (insertError.code === "23505") {
        setErrorMessage("This NFC tag is already linked to another hive.");
      } else {
        setErrorMessage("Failed to save hive. " + insertError.message);
      }
      setLoading(false);
      return;
    }

    // ✅ GA: track hive creation (fires only if analytics consented)
    trackEvent("hive_create", {
      hive_id: inserted?.id ?? undefined,
      apiary_id: inserted?.apiary_id ?? undefined,
      has_nfc: !!(subscriptionLevel === "premium" && candidateNfc),
      has_photo_selected: !!selectedFile,
      source: "app",
    });

    // Upload photo (optional)
    const photo_url = await uploadPhoto(inserted.id);
    if (photo_url) {
      await supabase.from("hives").update({ photo_url }).eq("id", inserted.id);

      // ✅ GA: track a follow-up photo upload event
      trackEvent("hive_photo_uploaded", {
        hive_id: inserted.id,
        apiary_id: inserted.apiary_id,
      });
    }

    setSuccessMessage("Hive saved successfully!");
    setLoading(false);
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Return to the filtered hive list for this apiary
    navigate(`/hives?apiary_id=${inserted.apiary_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">New Hive</h1>

      {/* ✅ NFC banner when coming from a scan */}
      {subscriptionLevel === "premium" && formData.nfc_uid && (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <p className="font-semibold">
            NFC tag will be linked to this hive
          </p>
          {sourceFromQuery === "nfc" && nfcFromQuery ? (
            <>
              <p className="mt-1">
                This hive is being created from an NFC scan. Once saved, tapping
                this tag will jump straight into this hive’s inspection flow.
              </p>
              <p className="mt-1">
                Tag ID:{" "}
                <code className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded text-[11px] break-all">
                  {formData.nfc_uid}
                </code>
              </p>
            </>
          ) : (
            <p className="mt-1">
              Tag ID:{" "}
              <code className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded text-[11px] break-all">
                {formData.nfc_uid}
              </code>
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="apiary_id"
          value={formData.apiary_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Select Apiary</option>
          {apiaries.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Hive Name"
          className="w-full px-3 py-2 border rounded"
          required
        />

        <select
          name="hive_type"
          value={formData.hive_type}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select Hive Type</option>
          <option value="National">National</option>
          <option value="Langstroth">Langstroth</option>
          <option value="Top Bar">Top Bar</option>
          <option value="Warre">Warre</option>
          <option value="Other">Other</option>
        </select>

        {formData.hive_type === "Other" && (
          <input
            name="hive_type_other"
            value={formData.hive_type_other}
            onChange={handleChange}
            placeholder="Specify other hive type"
            className="w-full px-3 py-2 border rounded"
          />
        )}

        <label className="block">Date hive was placed in apiary</label>
        <input
          type="date"
          name="date_established"
          value={formData.date_established}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        <label className="block">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any additional notes..."
          className="w-full px-3 py-2 border rounded min-h-[100px]"
        />

        {previewUrl && (
          <div className="relative inline-flex flex-col items-start mb-2 max-w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 w-auto max-w-full object-contain rounded border"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
            >
              ×
            </button>
            <div className="mt-1 text-xs text-gray-600 break-all">
              {selectedFile?.name || "image"}
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full px-3 py-2 border rounded"
        />

        {/* 🔴 Error box styled like NewApiary */}
        {errorMessage && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <strong>{errorMessage}</strong>
          </div>
        )}

        {successMessage && (
          <div
            ref={successRef}
            className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm"
          >
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
        >
          {loading ? "Saving..." : "Save Hive"}
        </button>
      </form>
    </div>
  );
};

export default NewHive;
