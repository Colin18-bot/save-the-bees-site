import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function VeterinaryMedicineDashboardPanel() {
  const [summary, setSummary] = useState({
    loading: true,
    error: "",
    purchases: 0,
    active: 0,
    overdue: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(userError?.message || "Not authenticated.");
        }

        const [purchasesResult, treatmentResult] = await Promise.all([
          supabase
            .from("veterinary_medicines")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("veterinary_medicine_hive_status")
            .select("treatment_hive_id,status,is_overdue")
            .eq("user_id", user.id),
        ]);

        if (purchasesResult.error) throw purchasesResult.error;
        if (treatmentResult.error) throw treatmentResult.error;
        if (cancelled) return;

        const treatments = treatmentResult.data || [];
        const active = treatments.filter((item) => item.status === "active");

        setSummary({
          loading: false,
          error: "",
          purchases: purchasesResult.count || 0,
          active: active.length,
          overdue: active.filter((item) => item.is_overdue).length,
        });
      } catch (error) {
        if (cancelled) return;
        console.error("Unable to load veterinary medicine dashboard summary:", error);
        setSummary({
          loading: false,
          error: "Veterinary medicine summary could not be loaded.",
          purchases: 0,
          active: 0,
          overdue: 0,
        });
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-6 mb-6 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-green-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-[#1a3329]">Veterinary Medicines</h2>
            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-900">
              Free &amp; Premium
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Keep medicine purchase, treatment, completion and unused-medicine disposal records together.
          </p>
        </div>

        <Link
          to="/veterinary-medicines"
          className="shrink-0 text-sm font-semibold text-blue-700 hover:underline"
        >
          Open Veterinary Medicines →
        </Link>
      </div>

      {summary.loading ? (
        <p className="mt-4 text-sm text-gray-500">Loading medicine summary…</p>
      ) : summary.error ? (
        <p className="mt-4 text-sm text-red-700">{summary.error}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <div className="text-2xl font-extrabold text-[#1a3329]">{summary.purchases}</div>
            <div className="text-xs font-semibold text-gray-700">Medicine purchases</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-white p-3 text-center">
            <div className="text-2xl font-extrabold text-amber-900">{summary.active}</div>
            <div className="text-xs font-semibold text-amber-800">Active hive treatments</div>
          </div>
          <div
            className={`rounded-lg border p-3 text-center ${
              summary.overdue > 0
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-white"
            }`}
          >
            <div
              className={`text-2xl font-extrabold ${
                summary.overdue > 0 ? "text-red-900" : "text-green-900"
              }`}
            >
              {summary.overdue}
            </div>
            <div
              className={`text-xs font-semibold ${
                summary.overdue > 0 ? "text-red-800" : "text-green-800"
              }`}
            >
              Overdue hive treatments
            </div>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-600">
        Veterinary medicine record keeping is available on Free and Premium. The dedicated Print / PDF medicine register is a Premium feature.
      </p>
    </section>
  );
}
