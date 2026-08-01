// src/pages/Settings.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, useLocation } from "react-router-dom";

const AVATAR_BUCKET = "photos";

const COMMON_TIMEZONES = [
  "Europe/London",
  "UTC",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
];

const COMMON_CURRENCIES = [
  { code: "GBP", label: "British Pound" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "NZD", label: "New Zealand Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "INR", label: "Indian Rupee" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "SEK", label: "Swedish Krona" },
  { code: "NOK", label: "Norwegian Krone" },
  { code: "DKK", label: "Danish Krone" },
  { code: "PLN", label: "Polish Złoty" },
  { code: "CZK", label: "Czech Koruna" },
  { code: "HUF", label: "Hungarian Forint" },
  { code: "RON", label: "Romanian Leu" },
  { code: "TRY", label: "Turkish Lira" },
  { code: "ZAR", label: "South African Rand" },
  { code: "AED", label: "UAE Dirham" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "QAR", label: "Qatari Riyal" },
  { code: "KWD", label: "Kuwaiti Dinar" },
  { code: "BHD", label: "Bahraini Dinar" },
  { code: "OMR", label: "Omani Rial" },
  { code: "ILS", label: "Israeli New Shekel" },
  { code: "EGP", label: "Egyptian Pound" },
  { code: "KES", label: "Kenyan Shilling" },
  { code: "NGN", label: "Nigerian Naira" },
  { code: "GHS", label: "Ghanaian Cedi" },
  { code: "MAD", label: "Moroccan Dirham" },
  { code: "HKD", label: "Hong Kong Dollar" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "TWD", label: "New Taiwan Dollar" },
  { code: "KRW", label: "South Korean Won" },
  { code: "THB", label: "Thai Baht" },
  { code: "MYR", label: "Malaysian Ringgit" },
  { code: "IDR", label: "Indonesian Rupiah" },
  { code: "PHP", label: "Philippine Peso" },
  { code: "VND", label: "Vietnamese Dong" },
  { code: "PKR", label: "Pakistani Rupee" },
  { code: "BDT", label: "Bangladeshi Taka" },
  { code: "LKR", label: "Sri Lankan Rupee" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "CLP", label: "Chilean Peso" },
  { code: "COP", label: "Colombian Peso" },
  { code: "PEN", label: "Peruvian Sol" },
  { code: "ARS", label: "Argentine Peso" },
  { code: "UYU", label: "Uruguayan Peso" },
];

const getAllTimezones = () => {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      const vals = Intl.supportedValuesOf("timeZone");
      if (Array.isArray(vals) && vals.length) return vals;
    }
  } catch {
    // intentionally ignore (older browsers)
  }
  return COMMON_TIMEZONES;
};

function tzLabel(tz) {
  const now = new Date();
  let offset = "UTC";
  try {
    const part = new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      timeZoneName: "shortOffset",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value;
    if (part) offset = part.replace(/^GMT/, "UTC");
  } catch {
    // intentionally ignore if timeZone unsupported
  }
  let longName = "";
  try {
    longName =
      new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        timeZoneName: "long",
      })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    // intentionally ignore if long name unsupported
  }
  return `(${offset}) ${tz}${longName ? ` – ${longName}` : ""}`;
}

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    // intentionally ignore parse/format issues
    return iso;
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Account
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Subscription
  const [plan, setPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null);

  // Personalisation
  const [timezone, setTimezone] = useState(
    localStorage.getItem("prefs.timezone") || "Europe/London"
  );
  const [currency, setCurrency] = useState(localStorage.getItem("prefs.currency") || "GBP");
  const [defaultApiaryId, setDefaultApiaryId] = useState("");

  // Avatar
  const [photoUrl, setPhotoUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  // Lists / UI
  const [apiaries, setApiaries] = useState([]);
  const TIMEZONES = useMemo(() => getAllTimezones(), []);

  // Toast
  const [status, setStatus] = useState(null);
  const statusTimerRef = useRef(null);

  const showStatus = useCallback((msg, type = "success", duration = 3500) => {
    setStatus({ type, msg });
    if (duration) {
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
      statusTimerRef.current = window.setTimeout(() => setStatus(null), duration);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    };
  }, []);

  const StatusToast = ({ status, onClose }) => {
    if (!status) return null;
    const base =
      "fixed right-4 bottom-4 z-[1000] max-w-md shadow-lg rounded-lg px-4 py-3 border flex items-start gap-3";
    const styles =
      status.type === "error"
        ? "bg-red-50 border-red-200 text-red-800"
        : status.type === "info"
          ? "bg-blue-50 border-blue-200 text-blue-800"
          : "bg-green-50 border-green-200 text-green-800";
    const icon = status.type === "error" ? "⚠️" : status.type === "info" ? "ℹ️" : "✅";
    return (
      <div role="status" aria-live="polite" className={`${base} ${styles}`}>
        <span className="text-lg leading-none">{icon}</span>
        <div className="flex-1 text-sm">{status.msg}</div>
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="ml-2 text-xs opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    );
  };

  const passwordChecks = (pw) => ({
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  });

  const refreshApiariesDefault = useCallback(async (uid) => {
    const { data, error } = await supabase
      .from("apiaries")
      .select("id, name, is_default")
      .eq("user_id", uid)
      .is("archived_at", null)
      .order("name", { ascending: true });

    if (!error) {
      const list = data || [];
      setApiaries(list);
      const cur = list.find((a) => a.is_default);
      setDefaultApiaryId(cur ? cur.id : "");
    }
  }, []);

  const loadProfile = useCallback(async (uid) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "display_name, avatar_url, subscription_level, subscription_status, current_period_end, email"
      )
      .eq("user_id", uid)
      .maybeSingle();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setPhotoUrl(profile.avatar_url || "");
      setPlan(profile.subscription_level || "free");
      setSubscriptionStatus(profile.subscription_status || "");
      setCurrentPeriodEnd(profile.current_period_end || null);
      setEmail(profile.email || "");

      const level = profile.subscription_level || "free";
      localStorage.setItem("subscription_level", level);
      window.dispatchEvent(new CustomEvent("subscription:updated", { detail: { level } }));

      if (profile.display_name) {
        document.title = `BeezKnees – Welcome ${profile.display_name}`;
      }
    }

    return profile;
  }, []);

  useEffect(() => {
    const level = plan || "free";
    localStorage.setItem("subscription_level", level);
    window.dispatchEvent(new CustomEvent("subscription:updated", { detail: { level } }));
  }, [plan]);

  useEffect(() => {
    (async () => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        navigate("/login?redirect=/settings");
        return;
      }

      setEmail(userData.user.email || "");
      await loadProfile(userData.user.id);

      const { data: apiaryRows } = await supabase
        .from("apiaries")
        .select("id, name, is_default")
        .eq("user_id", userData.user.id)
        .is("archived_at", null)
        .order("name", { ascending: true });

      const list = apiaryRows || [];
      setApiaries(list);
      const currentDefault = list.find((a) => a.is_default);
      setDefaultApiaryId(currentDefault ? currentDefault.id : "");
    })();
  }, [navigate, loadProfile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("upgrade") !== "success") return;

    let cancelled = false;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;

      showStatus("Upgrade successful. Finalising subscription…", "info", 3000);
      for (let i = 0; i < 6 && !cancelled; i++) {
        const prof = await loadProfile(uid);
        if (prof?.subscription_level === "premium") {
          showStatus("Welcome to HiveTag Premium! Your subscription is now active.", "success");
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.search, loadProfile, showStatus]);

  const saveProfile = async () => {
    setStatus(null);

    if (!/^[A-Z]{3}$/.test(currency)) {
      showStatus("Please enter a valid 3-letter currency code (e.g. GBP, USD, EUR).", "error");
      return;
    }

    const { data: userData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !userData?.user) {
      showStatus("Not authenticated.", "error");
      return;
    }
    const uid = userData.user.id;

    const authEmail = userData.user.email || "";
    const safeEmail = email?.trim() || authEmail;
    if (!safeEmail) {
      showStatus("Failed to save profile: no email available.", "error");
      return;
    }

    const updates = {
      user_id: uid,
      email: safeEmail,
      display_name: displayName || null,
      avatar_url: photoUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: "user_id" });

    if (upsertErr) {
      console.error("Supabase upsert error:", upsertErr);
      showStatus(`Failed to save profile: ${upsertErr.message}`, "error");
      return;
    }

    localStorage.setItem("prefs.timezone", timezone);
    localStorage.setItem("prefs.currency", currency);
    window.dispatchEvent(new CustomEvent("prefs:currency", { detail: { currency } }));
    window.dispatchEvent(new CustomEvent("prefs:timezone", { detail: { timezone } }));

    try {
      await supabase.from("apiaries").update({ is_default: false }).eq("user_id", uid);

      if (defaultApiaryId) {
        const { error: setErr } = await supabase
          .from("apiaries")
          .update({ is_default: true })
          .eq("id", defaultApiaryId)
          .eq("user_id", uid);
        if (setErr) throw setErr;
      }

      await refreshApiariesDefault(uid);

      showStatus("Profile saved.", "success");
      if (displayName) {
        document.title = `BeezKnees – Welcome ${displayName}`;
      }
      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: { display_name: displayName, avatar_url: photoUrl },
        })
      );
    } catch (e) {
      console.error("Error updating default apiary:", e);
      showStatus(`Profile saved, but failed to update default apiary: ${e?.message || e}`, "error");
    }
  };

  const handlePasswordChange = async () => {
    setStatus(null);

    const c = passwordChecks(password);
    const allOk = c.length && c.lower && c.upper && c.digit && c.symbol;
    if (!allOk) {
      showStatus("Please meet all password requirements.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showStatus("Passwords do not match.", "error");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      showStatus("Error updating password.", "error");
      return;
    }

    setPassword("");
    setConfirmPassword("");
    showStatus("Password updated.", "success");
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    showStatus("Uploading avatar...", "info", 0);

    const { data: userData, error: authErr } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (authErr || !uid) {
      showStatus("Not authenticated.", "error");
      return;
    }

    const ext = (avatarFile.name.split(".").pop() || "jpg").toLowerCase();
    const safeName = avatarFile.name.replace(/[^\w.-]+/g, "_") || `avatar.${ext}`;
    const path = `avatar/${uid}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage.from(AVATAR_BUCKET).upload(path, avatarFile, {
      upsert: true,
      contentType: avatarFile.type || "image/jpeg",
    });

    if (upErr) {
      console.error("Avatar upload error:", upErr);
      showStatus("Avatar upload failed.", "error");
      return;
    }

    try {
      const nestedPrefix = `avatar/${uid}`;
      const { data: oldFiles, error: listErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .list(nestedPrefix, {
          limit: 100,
        });

      if (!listErr && Array.isArray(oldFiles) && oldFiles.length) {
        const toRemove = oldFiles
          .map((f) => `${nestedPrefix}/${f.name}`)
          .filter((fullPath) => fullPath !== path);
        if (toRemove.length) {
          await supabase.storage.from(AVATAR_BUCKET).remove(toRemove);
        }
      }
    } catch (e) {
      console.warn("Avatar cleanup skipped:", e);
    }

    const { data: publicData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const publicUrl = `${publicData?.publicUrl || ""}?t=${Date.now()}`;
    setPhotoUrl(publicUrl);

    const { error: profErr } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", uid);

    if (profErr) {
      console.error("Profile avatar_url update error:", profErr);
      showStatus("Avatar uploaded, but failed to save URL to profile.", "error");
      return;
    }

    window.dispatchEvent(new CustomEvent("profile:updated", { detail: { avatar_url: publicUrl } }));
    showStatus("Avatar uploaded and saved to profile.", "success");
  };

  const handleAvatarDelete = async () => {
    setStatus(null);

    const { data: userData, error: authErr } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (authErr || !uid) {
      showStatus("Not authenticated.", "error");
      return;
    }

    try {
      const nestedPrefix = `avatar/${uid}`;
      const { data: files, error: listErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .list(nestedPrefix, {
          limit: 100,
        });

      if (!listErr && Array.isArray(files) && files.length) {
        const paths = files.map((f) => `${nestedPrefix}/${f.name}`);
        await supabase.storage.from(AVATAR_BUCKET).remove(paths);
      }
    } catch (e) {
      console.error("Avatar delete (storage) error:", e);
      // continue, we'll still clear the profile field
    }

    const { error: profErr } = await supabase
      .from("profiles")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("user_id", uid);

    if (profErr) {
      console.error("Avatar delete (profile) error:", profErr);
      showStatus("Photo removed from storage, but failed to update profile.", "error");
      return;
    }

    setPhotoUrl("");
    setAvatarFile(null);
    window.dispatchEvent(new CustomEvent("profile:updated", { detail: { avatar_url: null } }));
    showStatus("Profile photo removed.", "success");
  };

  // ======= Export helpers =======
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const canConfirmDelete = confirmDeleteText.trim().toUpperCase() === "DELETE";

  // Handlers for reactive prefs
  const handleTimezoneChange = (val) => {
    setTimezone(val);
    localStorage.setItem("prefs.timezone", val);
    window.dispatchEvent(new CustomEvent("prefs:timezone", { detail: { timezone: val } }));
  };

  const handleCurrencyChange = (valRaw) => {
    const val = (valRaw || "").toUpperCase().slice(0, 3);
    setCurrency(val);
    localStorage.setItem("prefs.currency", val);
    window.dispatchEvent(new CustomEvent("prefs:currency", { detail: { currency: val } }));
  };

  return (
    <div className="p-6 w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      {/* ===== Profile ===== */}
      <section
        className="mb-10 border rounded-xl p-4 bg-white shadow-sm"
        aria-labelledby="profile-settings"
      >
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="profile-settings" className="text-xl font-semibold">
            Profile (saved together)
          </h2>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs sm:text-sm text-emerald-800 max-w-xs sm:max-w-none self-start sm:self-auto">
            Save Profile affects these fields
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Display name</label>
            <input
              value={displayName}
              onChange={(evt) => setDisplayName(evt.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Beekeeper"
            />
            <p className="text-xs text-gray-500 mt-1">This appears in greetings and exports.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(evt) => handleTimezoneChange(evt.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tzLabel(tz)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              We store the IANA ID (e.g. <code>Europe/London</code>).
            </p>
          </div>

          <div>
            <label className="block font-medium mb-1">Default Currency</label>
            <input
              list="currency-list"
              value={currency}
              onChange={(evt) => handleCurrencyChange(evt.target.value)}
              maxLength={3}
              pattern="[A-Za-z]{3}"
              className="w-full border rounded px-3 py-2 font-mono"
              placeholder="e.g. GBP"
              title="Enter a 3-letter ISO code (e.g. GBP, USD, EUR)"
            />
            <datalist id="currency-list">
              {COMMON_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </datalist>
            <p className="text-xs text-gray-500 mt-1">
              Used to pre-fill Inventory, Expenses and Sales.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Default Apiary</label>
            <select
              value={defaultApiaryId || ""}
              onChange={(evt) => setDefaultApiaryId(evt.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={apiaries.length === 0}
            >
              <option value="">None</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.is_default ? " ★" : ""}
                </option>
              ))}
            </select>
            {apiaries.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                You don’t have any apiaries yet. Create one to set a default.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={saveProfile}
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
          >
            Save Profile
          </button>
        </div>
      </section>

      {/* ===== Account Security ===== */}
      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Account Security</h2>
        <div>
          <label className="block font-medium mb-1">Change Password</label>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="New password"
              autoComplete="new-password"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(evt) => setConfirmPassword(evt.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            <button
              onClick={handlePasswordChange}
              className="self-start bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-1"
            >
              Update Password
            </button>
          </div>
        </div>
      </section>

      <hr className="my-6" />

      {/* Billing & Subscription */}
      <BillingSection
        plan={plan}
        subscriptionStatus={subscriptionStatus}
        currentPeriodEnd={currentPeriodEnd}
        setPlan={setPlan}
        showStatus={showStatus}
      />

      <hr className="my-6" />

      {/* Avatar */}
      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold">Profile Photo</h2>
        {photoUrl ? (
          <img src={photoUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border" />
        ) : (
          <div className="w-20 h-20 rounded-full border flex items-center justify-center text-xs text-gray-500">
            No photo
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(evt) => setAvatarFile(evt.target.files?.[0] || null)}
        />
        <div className="flex gap-2">
          <button
            onClick={handleAvatarUpload}
            className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800"
          >
            Upload
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={handleAvatarDelete}
              className="px-3 py-2 border rounded text-sm"
            >
              Remove photo
            </button>
          )}
        </div>
      </section>

      <hr className="my-10" />

      {/* Export */}
      <ExportSection showStatus={showStatus} />

      {/* Danger Zone */}
      <DangerZone
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        confirmDeleteText={confirmDeleteText}
        setConfirmDeleteText={setConfirmDeleteText}
        canConfirmDelete={canConfirmDelete}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        showStatus={showStatus}
      />

      <StatusToast status={status} onClose={() => setStatus(null)} />
    </div>
  );
};

/* ====== Small presentational sub-sections ====== */

function BillingSection({ plan, subscriptionStatus, currentPeriodEnd, setPlan, showStatus }) {
  const navigate = useNavigate();
  const [subStatus, setSubStatus] = useState(subscriptionStatus);
  const [periodEnd, setPeriodEnd] = useState(currentPeriodEnd);

  useEffect(() => {
    setSubStatus(subscriptionStatus);
  }, [subscriptionStatus]);

  useEffect(() => {
    setPeriodEnd(currentPeriodEnd);
  }, [currentPeriodEnd]);

  return (
    <section className="mb-8 space-y-3">
      <h2 className="text-xl font-semibold">Billing & Subscription</h2>
      <div className="text-sm text-gray-700 space-y-1">
        <div>
          <span className="font-medium">Plan:</span> {plan || "free"}
        </div>
        {subStatus && (
          <div>
            <span className="font-medium">Status:</span>{" "}
            {{
              active: "Active",
              trialing: "Trial",
              cancels_at_period_end: "Cancellation Scheduled",
              past_due: "Payment Required",
              unpaid: "Payment Required",
              canceled: "Cancelled",
              incomplete: "Payment Pending",
              incomplete_expired: "Expired",
            }[subStatus] || subStatus}
          </div>
        )}
        {periodEnd && (
          <div>
            <span className="font-medium">
              {subStatus === "cancels_at_period_end" ? "Premium access ends" : "Next renewal"}:
            </span>{" "}
            {formatDate(periodEnd)}
          </div>
        )}
      </div>

      {subStatus === "cancels_at_period_end" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">⚠ Cancellation Scheduled</p>

          <p className="mt-2">Your Premium subscription has been cancelled.</p>

          <p className="mt-2">
            Your Premium access will remain active until{" "}
            <span className="font-semibold">{formatDate(periodEnd)}</span>.
          </p>

          <p className="mt-2">You can resume your subscription at any time from Manage Billing.</p>
        </div>
      )}

      <div className="flex gap-3 pt-2 items-center">
        {plan === "premium" ? (
          <button
            onClick={async () => {
              try {
                const { data: sessionData } = await supabase.auth.getSession();
                const session = sessionData?.session;
                if (!session) return showStatus("Please sign in first.", "error");

                const base = import.meta.env.BASE_URL ?? "/";
                const baseTrimmed = base.endsWith("/") ? base.slice(0, -1) : base;
                const returnUrl = `${window.location.origin}${baseTrimmed}/settings`;

                const fnUrl =
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-billing-portal` +
                  `?token=${encodeURIComponent(session.access_token)}` +
                  `&return_url=${encodeURIComponent(returnUrl)}`;

                window.location.href = fnUrl;
              } catch (e) {
                showStatus(`Billing portal error: ${e?.message || e}`, "error");
              }
            }}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
          >
            Manage billing
          </button>
        ) : (
          <button
            onClick={() => navigate("/pricing")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Upgrade to Premium
          </button>
        )}

        <button
          onClick={async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user?.id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("subscription_level, subscription_status, current_period_end")
                .eq("user_id", userData.user.id)
                .maybeSingle();

              if (profile) {
                setPlan(profile.subscription_level || "free");
                setSubStatus(profile.subscription_status || "");
                setPeriodEnd(profile.current_period_end || null);
              }
            }
            showStatus("Refreshed subscription status.", "success");
          }}
          className="px-3 py-2 border rounded text-sm"
          title="Refresh subscription"
        >
          Refresh
        </button>
      </div>
    </section>
  );
}

function ExportSection({ showStatus }) {
  const TABLES = [
    "profiles",
    "apiaries",
    "hives",
    "inspections",
    "todos",
    "logbook",
    "inventory_items",
    "expenses",
    "sales_lines",
  ];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const csvEscape = (v) => {
    if (v === null || v === undefined) return "";
    let s = typeof v === "object" ? JSON.stringify(v) : String(v);
    const needs = /[",\n]/.test(s);
    s = s.replace(/"/g, '""');
    return needs ? `"${s}"` : s;
  };

  const jsonToCsv = (rows) => {
    if (!rows || rows.length === 0) return "";
    const headers = Array.from(
      rows.reduce((set, r) => {
        Object.keys(r || {}).forEach((k) => set.add(k));
        return set;
      }, new Set())
    );
    const head = headers.join(",");
    const body = rows.map((r) => headers.map((h) => csvEscape(r?.[h])).join(",")).join("\n");
    return `${head}\n${body}\n`;
  };

  const fetchAllRows = async (table) => {
    const pageSize = 2000;
    let from = 0;
    let all = [];
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .range(from, from + pageSize - 1);
      if (error) throw error;
      const batch = data || [];
      all = all.concat(batch);
      if (batch.length < pageSize) break;
      from += pageSize;
      await sleep(25);
    }
    return all;
  };

  const handleExportZip = async () => {
    try {
      showStatus("Loading export libraries…", "info", 0);

      const { default: JSZip } = await import(/* @vite-ignore */ "https://esm.sh/jszip@3.10.1");
      const fsMod = await import(/* @vite-ignore */ "https://esm.sh/file-saver@2.0.5");

      const saveAs =
        fsMod.saveAs ||
        fsMod.default ||
        (typeof window !== "undefined" ? window.saveAs : undefined);
      if (typeof saveAs !== "function") {
        throw new Error("FileSaver loaded but saveAs was not found");
      }

      const zip = new JSZip();

      showStatus("Collecting data…", "info", 0);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id || "anonymous";
      const email = userData?.user?.email || "user";

      const dataFolder = zip.folder("data");
      const counts = {};

      for (const t of TABLES) {
        showStatus(`Exporting ${t}…`, "info", 0);
        const rows = await fetchAllRows(t);
        counts[t] = rows.length;
        dataFolder.file(`${t}.csv`, jsonToCsv(rows));
      }

      const meta = {
        app: "BeezKnees",
        generatedAt: new Date().toISOString(),
        user: { uid, email },
        tables: TABLES,
        counts: {
          ...counts,
          photos_listed: 0,
          photos_embedded: 0,
        },
        notes: [
          "CSV files are under /data/",
          "Images are not included in this export for privacy protection.",
          "Excluded tables: location_types, site_settings.",
        ],
      };

      zip.file("metadata.json", JSON.stringify(meta, null, 2));

      showStatus("Building ZIP…", "info", 0);
      const blob = await zip.generateAsync({ type: "blob" });

      const safeEmail = (email || "user").replace(/[^a-z0-9._-]/gi, "_");
      const filename = `beezknees-export-${safeEmail}-${new Date().toISOString().slice(0, 10)}.zip`;

      saveAs(blob, filename);
      showStatus("Export complete — ZIP downloaded.", "success");
    } catch (e) {
      console.error(e);
      showStatus(`Export failed: ${e?.message || e}`, "error");
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold">Export</h2>
      <p className="text-sm text-gray-600 mb-3">
        Download a ZIP containing your data in CSV format, including <code>profiles</code>,{" "}
        <code>apiaries</code>, <code>hives</code>, <code>inspections</code>, <code>tasks</code>,{" "}
        <code>logbook</code>, <code>inventory items</code>, <code>expenses</code> and{" "}
        <code>sales</code>. Images are not included in the export.
      </p>

      <button
        onClick={handleExportZip}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
      >
        Export my data (ZIP)
      </button>
    </section>
  );
}

function DangerZone({
  showDeleteModal,
  setShowDeleteModal,
  confirmDeleteText,
  setConfirmDeleteText,
  canConfirmDelete,
  isDeleting,
  setIsDeleting,
  showStatus,
}) {
  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      showStatus("Please sign in first.", "error");
      setIsDeleting(false);
      return;
    }

    try {
      showStatus("Cancelling any active subscription…", "info", 0);
      await supabase.functions
        .invoke("cancel-subscription", { body: { immediate: true } })
        .catch(() => {
          // ignore (optional)
        });

      showStatus("Deleting your account and all files…", "info", 0);
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: { immediate: true, dryRun: false },
      });

      if (error) {
        console.error("delete-account error:", error);
        showStatus(`Account deletion failed: ${error.message || error}`, "error");
        setIsDeleting(false);
        return;
      }

      console.log("delete-account result:", data);
      await supabase.auth.signOut();
      setShowDeleteModal(false);
      setIsDeleting(false);
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
      showStatus(`Account deletion failed: ${e?.message || e}`, "error");
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
      <div className="mt-3 p-4 border border-red-200 rounded bg-red-50">
        <p className="text-sm text-red-800 mb-3">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          onClick={() => {
            setShowDeleteModal(true);
            setConfirmDeleteText("");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Confirm account deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will cancel your subscription, remove all photos and data, and permanently delete
              your account.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm:
            </p>
            <input
              className="w-full px-3 py-2 border rounded mb-4"
              value={confirmDeleteText}
              onChange={(evt) => setConfirmDeleteText(evt.target.value)}
              autoFocus
              placeholder="DELETE"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(false);
                    setConfirmDeleteText("");
                  }
                }}
                className="px-4 py-2 rounded border"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!canConfirmDelete || isDeleting}
                className={`px-4 py-2 rounded text-white ${
                  canConfirmDelete && !isDeleting
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                {isDeleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Settings;
