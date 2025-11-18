// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

/**
 * Usage:
 * <ProtectedRoute>...free route...</ProtectedRoute>
 * <ProtectedRoute requireVerified>...verified email only...</ProtectedRoute>
 * <ProtectedRoute minPlan="premium">...premium only...</ProtectedRoute>
 */
const ProtectedRoute = ({ children, requireVerified = false, minPlan = "free" }) => {
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  // Only used if minPlan === "premium"
  const [checkingPlan, setCheckingPlan] = useState(false);
  const [planOK, setPlanOK] = useState(true); // default true so free routes don't block

  const redirectTo = `${location.pathname}${location.search}${location.hash}`;

  // Best-effort email verification detection (covers password + social)
  const isVerified = (u) =>
    Boolean(u?.email_confirmed_at) ||
    Boolean(u?.confirmed_at) ||
    Boolean(u?.user_metadata?.email_verified) ||
    Boolean(u?.identities?.some?.((id) => id?.identity_data?.email_verified));

  // Initial session + subscribe to changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(session?.user || null);
      setCheckingAuth(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Premium gate: only query profile if needed and user present
  useEffect(() => {
    let cancelled = false;

    const checkPlan = async () => {
      if (minPlan !== "premium" || !user) {
        setPlanOK(true);
        setCheckingPlan(false);
        return;
      }
      setCheckingPlan(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_level, subscription_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        // Fail open to avoid locking users out due to a transient error.
        console.warn("Plan check failed:", error);
        setPlanOK(true);
      } else {
        const level = (data?.subscription_level || "free").toLowerCase();
        setPlanOK(level === "premium");
      }
      setCheckingPlan(false);
    };

    checkPlan();
    return () => { cancelled = true; };
  }, [minPlan, user]);

  // 1) Still checking auth?
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center mt-10 text-gray-700">
        <div className="w-6 h-6 mr-3 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  // 2) Not signed in → go to login
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
        state={{ showLoginRequired: true }}
      />
    );
  }

  // 3) Email verification gate (optional) — simplified (no resend button)
  if (requireVerified && !isVerified(user)) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 border rounded bg-yellow-50 text-yellow-900">
        <h2 className="text-lg font-semibold mb-2">Please verify your email</h2>
        <p className="text-sm mb-3">
          We’ve sent a verification link to <span className="font-mono">{user.email}</span>.
          Click it, then refresh this page.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 border rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // 4) Premium gate (optional)
  if (minPlan === "premium") {
    if (checkingPlan) {
      return (
        <div className="flex items-center justify-center mt-10 text-gray-700">
          <div className="w-6 h-6 mr-3 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Checking subscription…
        </div>
      );
    }
    if (!planOK) {
      return (
        <Navigate
          to={`/pricing?from=${encodeURIComponent(redirectTo)}`}
          replace
          state={{ needsUpgrade: true }}
        />
      );
    }
  }

  // 5) All good
  return children;
};

export default ProtectedRoute;
