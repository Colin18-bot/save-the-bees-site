import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function NFCOpen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const hiveId = (searchParams.get("hive_id") || "").trim();

    if (!hiveId) {
      navigate("/hives", { replace: true });
      return;
    }

    navigate(
      `/inspections/new?hive_id=${encodeURIComponent(hiveId)}&source=nfc`,
      { replace: true }
    );
  }, [navigate, searchParams]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Opening hive…</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while HiveTag opens the linked inspection screen.
        </p>
      </div>
    </div>
  );
}