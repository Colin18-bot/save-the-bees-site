// src/pages/Hives/EditHive.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabase";
import dayjs from "dayjs";
import { archiveItem, humaniseSupabaseError } from "../../services/actions";

// Extract { bucket, path } from a Supabase public URL (legacy fallback)
function parseStoragePublicUrl(url) {
  if (!url) return null;
  const m = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

// Call the deployed Edge Function for storage-first delete/clear
async function deleteWithPhotos({ table, id, mode, removeOne }) {
  const { data: sessionWrap } = await supabase.auth.getSession();
  const token = sessionWrap?.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-row-with-photos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ table, id, mode, removeOne }),
    }
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || "Delete function failed");
  }
  return json;
}

const EditHive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    apiary_id: "",
    hive_type: "",
    hive_type_other: "",
    date_established: dayjs().format("YYYY-MM-DD"),
    status: "active",
    notes: "",
    photo_url: "",
    photo_path: null,
    nfc_uid: "",
    nfc_link_enabled: false,
  });

  const [apiaries, setApiaries] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentObject, setCurrentObject] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [subscriptionLevel, setSubscriptionLevel] = useState("free");

  useEffect(() => {
    const fetchData = async () => {
      const nfcParam =
        (new URLSearchParams(location.search).get("nfc_uid") || "").trim();

      const [hiveRes, apiaryRes, userRes] = await Promise.all([
        supabase.from("hives").select("*").eq("id", id).single(),
        supabase
          .from("apiaries")
          .select("id, name")
          .is("archived_at", null)
          .order("name"),
        supabase.auth.getUser(),
      ]);

      if (hiveRes.error) {
        setError("Failed to load hive details.");
        setLoading(false);
        return;
      }

      const hive = hiveRes.data;
      setApiaries(apiaryRes.error ? [] : apiaryRes.data || []);
      setPhotoPreview(hive.photo_url || null);

      // Prefer photo_path if present; otherwise fall back to parsing url
      const legacy = parseStoragePublicUrl(hive.photo_url);
      setCurrentObject(
        hive.photo_path ? { bucket: "photos", path: hive.photo_path } : legacy
      );

      // subscription + NFC
      let level = "free";
      const uid = userRes?.data?.user?.id;
      if (uid) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_level")
          .eq("user_id", uid)
          .maybeSingle();
        level = profile?.subscription_level || "free";
        setSubscriptionLevel(level);
      }

      const nfcToUse =
        level === "premium" && nfcParam ? nfcParam : hive.nfc_uid || "";

      setFormData({
        name: hive.name || "",
        apiary_id: hive.apiary_id || "",
        hive_type: hive.hive_type || "",
        hive_type_other: hive.hive_type_other || "",
        date_established: hive.date_established || dayjs().format("YYYY-MM-DD"),
        status: hive.status || "active",
        notes: hive.notes || "",
        photo_url: hive.photo_url || "",
        photo_path: hive.photo_path || null,
        nfc_uid: nfcToUse,
        nfc_link_enabled: !!hive.nfc_link_enabled,
      });

      setLoading(false);
    };

    fetchData();

    return () => {
      if (photoPreview?.startsWith?.("blob:")) URL.revokeObjectURL(photoPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      return {
        url: formData.photo_url || "",
        path: formData.photo_path || currentObject?.path || null,
        bucket: "photos",
      };
    }

    const safeName = file.name.replace(/\s+/g, "_");
    const photo_path = `hives/${id}-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(photo_path, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      console.error("Upload error", uploadError);
      return {
        url: formData.photo_url || "",
        path: formData.photo_path || currentObject?.path || null,
        bucket: "photos",
      };
    }

    const { data } = supabase.storage.from("photos").getPublicUrl(photo_path);
    return { url: data.publicUrl, path: photo_path, bucket: "photos" };
  };

  const handleRemovePhoto = async () => {
    try {
      await deleteWithPhotos({ table: "hives", id, mode: "clear_photo" });
    } catch (e) {
      console.error(e);
      setError(String(e?.message || e));
      return;
    }

    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo_url: "", photo_path: null }));
    setCurrentObject(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const validateUniqueName = async () => {
    const { data } = await supabase
      .from("hives")
      .select("id")
      .eq("name", formData.name)
      .eq("apiary_id", formData.apiary_id)
      .neq("id", id)
      .is("archived_at", null);
    return data?.length > 0;
  };

  // Case-insensitive duplicate NFC check against ACTIVE hives, excluding self
  const validateUniqueNfc = async (uid) => {
    const trimmed = (uid || "").trim();
    if (!trimmed) return false;
    const { data, error } = await supabase
      .from("hives")
      .select("id")
      .ilike("nfc_uid", trimmed)
      .neq("id", id)
      .is("archived_at", null);
    if (error) return true; // be safe: block on error
    return (data?.length || 0) > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure parent apiary is active
    if (formData.apiary_id) {
      const { data: parent } = await supabase
        .from("apiaries")
        .select("archived_at")
        .eq("id", formData.apiary_id)
        .maybeSingle();
      if (parent?.archived_at) {
        setError("Selected apiary is archived. Please choose an active apiary.");
        return;
      }
    }

    if (await validateUniqueName()) {
      setError("A hive with this name already exists in the selected apiary.");
      return;
    }

    // NFC duplicate guard (premium only; value is read-only, from DB or URL)
    if (subscriptionLevel === "premium" && formData.nfc_uid) {
      if (await validateUniqueNfc(formData.nfc_uid)) {
        setError("This NFC tag is already linked to another hive.");
        return;
      }
    }

    const { url: newUrl, path: newPath } = await uploadPhoto();

    if (
      newPath &&
      (formData.photo_path || currentObject?.path) &&
      newUrl !== formData.photo_url
    ) {
      const oldPath = formData.photo_path || currentObject?.path || null;
      if (oldPath && oldPath !== newPath) {
        try {
          await supabase.storage.from("photos").remove([oldPath]);
        } catch {
          /* non-fatal */
        }
      }
    }

    const normalize = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
      );

    const base = normalize({
      ...formData,
      photo_url: newUrl || formData.photo_url || null,
      photo_path: newPath || formData.photo_path || null,
      nfc_uid:
        subscriptionLevel === "premium" ? (formData.nfc_uid || null) : null,
      nfc_link_enabled:
        subscriptionLevel === "premium" ? !!formData.nfc_link_enabled : false,
    });

    const { error: updateErr } = await supabase
      .from("hives")
      .update(base)
      .eq("id", id);

    if (updateErr) {
      console.error("Update error", updateErr);
      setError("Failed to update hive.");
    } else {
      alert("Hive updated successfully.");
      navigate(`/hives?apiary_id=${base.apiary_id || ""}`);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("Archive this hive?")) return;
    const { error } = await archiveItem("hives", id);
    if (error) setError("Failed to archive hive. " + (error.message || ""));
    else {
      alert("Hive archived.");
      navigate("/hives");
    }
  };

  const handleDelete = async () => {
    const { data, error: checkErr } = await supabase.rpc("check_hive_children", {
      hive_id: id,
    });
    if (checkErr) {
      alert("Could not delete, check linked items.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    const { inspections = 0, todos = 0, logs = 0 } = row || {};
    const hasChildren = inspections + todos + logs > 0;

    if (hasChildren) {
      const ok = window.confirm(
        `This hive has:\n• ${inspections} inspections\n• ${todos} to-dos\n• ${logs} log entries\n\nArchive instead?`
      );
      if (!ok) return;
      const { error: archErr } = await archiveItem("hives", id);
      if (archErr) {
        alert("Failed to archive hive.");
        return;
      }
      alert("Hive archived.");
      navigate("/hives");
      return;
    }

    if (!window.confirm("Delete this hive permanently? This cannot be undone.")) return;

    try {
      await deleteWithPhotos({ table: "hives", id, mode: "delete_row" });
    } catch (e) {
      alert(
        humaniseSupabaseError(
          { message: String(e?.message || e) },
          { table: "hives" }
        )
      );
      return;
    }

    alert("Hive deleted.");
    navigate("/hives");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Hive</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Hive Name"
          className="w-full px-3 py-2 border rounded"
          required
        />

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
            placeholder="Specify Hive Type"
            className="w-full px-3 py-2 border rounded"
          />
        )}

        <label className="block text-sm font-medium">
          Date hive was placed in apiary
        </label>
        <input
          type="date"
          name="date_established"
          value={formData.date_established}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="under observation">Under Observation</option>
        </select>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="w-full px-3 py-2 border rounded min-h-[100px]"
        />

        {subscriptionLevel === "premium" &&
          (formData.nfc_uid || formData.nfc_link_enabled) && (
            <div className="p-3 border rounded bg-gray-50 text-sm">
              <div>
                <span className="font-medium">NFC status:</span>{" "}
                {formData.nfc_uid ? (
                  <>
                    <code className="px-1 py-0.5 bg-white border rounded">
                      Android: {formData.nfc_uid}
                    </code>
                  </>
                ) : (
                  <code className="px-1 py-0.5 bg-white border rounded">
                    iPhone / iPad NFC enabled
                  </code>
                )}
              </div>

              <div className="text-gray-600 mt-1">
                NFC setup is managed from the NFC pages and can’t be edited here.
              </div>
            </div>
          )}

        <div className="flex flex-col items-start gap-2">
          {photoPreview && (
            <div className="relative w-32">
              <img
                src={photoPreview}
                alt="Hive"
                className="max-w-full h-auto object-contain rounded border"
              />
              <div className="text-xs mt-1 break-all">
                {(() => {
                  try {
                    const u = new URL(photoPreview);
                    return decodeURIComponent(u.pathname.split("/").pop()) || "image";
                  } catch {
                    return "image";
                  }
                })()}
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded hover:bg-red-700"
              >
                ×
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleArchive}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded"
          >
            Archive
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => navigate(`/hives?apiary_id=${formData.apiary_id || ""}`)}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHive;