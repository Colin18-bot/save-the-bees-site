// src/components/AlertsWidget.jsx
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function AlertsWidget() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: userWrap } = await supabase.auth.getUser();
      const uid = userWrap?.user?.id;
      if (!uid) { setAlerts([]); setLoading(false); return; }

      const { data, error } = await supabase.rpc("get_alerts_for_user", { p_user: uid });
      if (!error) setAlerts((data || []).filter(a => !a.is_dismissed));
      setLoading(false);
    })();
  }, []);

  const markRead = async (id) => {
    const { data: userWrap } = await supabase.auth.getUser();
    const uid = userWrap?.user?.id;
    await supabase.from("alert_receipts")
      .upsert({ user_id: uid, alert_id: id, read_at: new Date().toISOString() });
    setAlerts(a => a.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  const dismiss = async (id) => {
    const { data: userWrap } = await supabase.auth.getUser();
    const uid = userWrap?.user?.id;
    await supabase.from("alert_receipts")
      .upsert({ user_id: uid, alert_id: id, dismissed_at: new Date().toISOString() });
    setAlerts(a => a.filter(x => x.id !== id));
  };

  if (loading) return <div className="p-4 bg-white rounded shadow">Loading alerts…</div>;
  if (!alerts.length) return null;

  const badge = (s) =>
    s === "critical" ? "bg-red-100 text-red-800 border-red-200"
    : s === "warning" ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Alerts near your apiaries</h3>
      </div>
      <ul className="space-y-3">
        {alerts.slice(0, 5).map(a => (
          <li key={a.id} className="border rounded p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded border ${badge(a.severity)}`}>
                    {a.severity.toUpperCase()}
                  </span>
                  <span className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
                    {a.type}
                  </span>
                  {Number.isFinite(a.distance_km) && (
                    <span className="text-xs text-gray-500">
                      ~{Math.round(a.distance_km)} km
                    </span>
                  )}
                </div>
                <h4 className="font-semibold mt-1">{a.title}</h4>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{a.body}</p>
                {a.source_url && (
                  <a className="text-sm text-blue-600 underline mt-1 inline-block" href={a.source_url} target="_blank" rel="noreferrer">
                    Source / more info
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {!a.is_read && (
                  <button onClick={() => markRead(a.id)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">
                    Mark read
                  </button>
                )}
                <button onClick={() => dismiss(a.id)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">
                  Dismiss
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
