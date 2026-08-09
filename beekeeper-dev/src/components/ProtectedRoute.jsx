// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

/**
 * Usage:
 * <ProtectedRoute>...free route...</ProtectedRoute>
 * <ProtectedRoute requireVerified>...verified email only...</ProtectedRoute>
 * <ProtectedRoute minPlan="premium">...premium only...</ProtectedRoute>
 * <ProtectedRoute minPlan="premium" allowRetainedQueenData>
 *   ...premium route also available to Free users who retain Queen data...
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
  children,
  requireVerified = false,
  minPlan = "free",
  allowRetainedQueenData = false,
}) => {
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  // Used only when minPlan === "premium".
  const [checkingPlan, setCheckingPlan] = useState(false);
  const [planOK, setPlanOK] = useState(true);

  const redirectTo = `${location.pathname}${location.search}${location.hash}`;

  // Best-effort email verification detection covering password and social sign-in.
  const isVerified = (currentUser) =>
    Boolean(currentUser?.email_confirmed_at) ||
    Boolean(currentUser?.confirmed_at) ||
    Boolean(currentUser?.user_metadata?.email_verified) ||
    Boolean(
      currentUser?.identities?.some?.(
        (identity) => identity?.identity_data?.email_verified
      )
    );

  // Initial session and authentication-state subscription.
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setUser(session?.user || null);
      setCheckingAuth(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Premium access check, with an optional retained-Queen-data fallback.
  useEffect(() => {
    let cancelled = false;

    const checkPlan = async () => {
      if (minPlan !== "premium" || !user) {
        setPlanOK(true);
        setCheckingPlan(false);
        return;
      }

      setCheckingPlan(true);
      setPlanOK(false);

      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_level, subscription_status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (profileError) {
          console.warn("Plan check failed:", profileError);
          setPlanOK(false);
          return;
        }

        const level = String(profile?.subscription_level || "free").toLowerCase();

        if (level === "premium") {
          setPlanOK(true);
          return;
        }

        if (!allowRetainedQueenData) {
          setPlanOK(false);
          return;
        }

        const queenCounts = await Promise.all([
          supabase.from("queens").select("id", { count: "exact", head: true }),
          supabase
            .from("queen_assignments")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("queen_processes")
            .select("id", { count: "exact", head: true }),
          supabase.from("queen_events").select("id", { count: "exact", head: true }),
        ]);

        if (cancelled) return;

        const hasRetainedQueenData = queenCounts.some(
          (result) => !result.error && Number(result.count || 0) > 0
        );

        setPlanOK(hasRetainedQueenData);
      } catch (error) {
        if (!cancelled) {
          console.warn("Access check failed:", error);
          setPlanOK(false);
        }
      } finally {
        if (!cancelled) setCheckingPlan(false);
      }
    };

    checkPlan();

    return () => {
      cancelled = true;
    };
  }, [allowRetainedQueenData, minPlan, user]);

  // 1) Still checking authentication.
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center mt-10 text-gray-700">
        <div className="w-6 h-6 mr-3 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  // 2) Not signed in — go to login.
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
        state={{ showLoginRequired: true }}
      />
    );
  }

  // 3) Optional email-verification gate.
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
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-2 border rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // 4) Optional Premium gate.
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
          to={`/premium-required?from=${encodeURIComponent(redirectTo)}`}
          replace
          state={{ needsUpgrade: true }}
        />
      );
    }
  }

  // 5) All checks passed.
  return children;
};

export default ProtectedRoute;