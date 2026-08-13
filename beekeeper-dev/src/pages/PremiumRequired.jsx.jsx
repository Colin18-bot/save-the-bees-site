import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const PremiumRequired = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "";

  const contextMessage =
    from === "hive-health"
      ? "Hive Health is available with HiveTag Premium. Review explainable health scores, trends, risks, priority actions, recommendations and your colony timeline."
      : from === "queens" || from === "queen"
      ? "Queen Records are available with HiveTag Premium. Keep complete queen histories, record introductions, splits, transfers, requeening and status changes, and follow each queen throughout the colony's history."
      : "";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-800 mb-2">
          Premium feature
        </p>

        <h2 className="text-2xl font-bold text-[#1a3329] mb-3">
          🔒 Unlock this feature with HiveTag Premium
        </h2>

        <p className="text-gray-700 mb-2">
          Upgrade to HiveTag Premium to unlock intelligent Hive Health,
          complete Queen Records, professional reporting, business tools,
          NFC hive tags, premium beekeeping guides and advanced colony
          management features.
        </p>

        {contextMessage && (
          <p className="text-sm text-amber-800 bg-amber-100 border border-amber-200 rounded p-3 mb-4">
            {contextMessage}
          </p>
        )}

        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-6">
          <li>Unlimited apiaries and hives</li>
          <li>
            Advanced Hive Health with explainable health scores, trends,
            risks and recommended actions
          </li>
          <li>Dashboard Hive Health overview and colony timeline</li>
          <li>Colony Health Check</li>
          <li>
            Complete Queen Records with queen histories, introductions,
            splits, transfers, requeening and status changes
          </li>
          <li>Seasonal Guide and premium beekeeping guides</li>
          <li>Professional reports and CSV exports</li>
          <li>Inventory, sales, expenses and Profit &amp; Loss</li>
          <li>HiveTag NFC labels with tap-to-log inspections</li>
        </ul>

        <p className="text-sm text-gray-600 mb-4">
          Your existing data will be preserved. Upgrading simply unlocks the
          additional Premium features immediately.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/pricing${from ? `?from=${encodeURIComponent(from)}` : ""}`}
            className="inline-flex items-center justify-center rounded bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            Upgrade to Premium
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumRequired;