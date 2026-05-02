import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const PremiumRequired = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-amber-800 mb-2">
          Premium feature
        </p>

        <h1 className="text-2xl font-bold text-[#1a3329] mb-3">
          🔒 This feature is included with HiveTag Premium
        </h1>

        <p className="text-gray-700 mb-4">
          Upgrade to Premium to unlock advanced tools such as reports, exports,
          inventory, sales, expenses, NFC hive tags, the Year in the Apiary seasonal guide and premium beekeeping tools.
        </p>

        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-6">
          <li>Unlimited apiaries and hives</li>
          <li>Reports and filtered CSV exports</li>
          <li>Inventory, sales, expenses and Profit &amp; Loss</li>
          <li>NFC hive tags and tagged hive tools</li>
          <li>Premium guides and advanced record tools</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/pricing${from ? `?from=${encodeURIComponent(from)}` : ""}`}
            className="inline-flex items-center justify-center rounded bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            View Premium Plan
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