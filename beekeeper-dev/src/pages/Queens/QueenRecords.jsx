import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  CircleDot,
  Crown,
  GitBranch,
  GitMerge,
  History,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import QueenRecordsBase from "./QueenRecordsBase.jsx";
import QueenUnionPanel from "./QueenUnionPanel.jsx";
import QueenSwarmPanel from "./QueenSwarmPanel.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: Crown, baseLabel: "Overview" },
  { id: "current", label: "Current Queen", icon: CircleDot, baseLabel: "Current Queen" },
  { id: "progress", label: "Progress", icon: Activity, baseLabel: "Progress" },
  { id: "union", label: "Unite Colonies", icon: GitMerge },
  { id: "swarm", label: "Swarm", icon: Sparkles },
  { id: "history", label: "History", icon: History, baseLabel: "History" },
  { id: "events", label: "Events & Changes", icon: GitBranch, baseLabel: "Events & Changes" },
];

const BASE_TABS = new Set(["overview", "current", "progress", "history", "events"]);

export default function QueenRecords() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tabNotice, setTabNotice] = useState("");
  const [baseVersion, setBaseVersion] = useState(0);
  const baseRef = useRef(null);

  useEffect(() => {
    if (!BASE_TABS.has(activeTab)) return undefined;

    let cancelled = false;
    let retryTimer;

    const syncTab = () => {
      if (cancelled || !baseRef.current) return;

      const nav = baseRef.current.querySelector('nav[aria-label="Queen page tabs"]');
      const config = TABS.find((item) => item.id === activeTab);
      if (!nav || !config?.baseLabel) {
        retryTimer = window.setTimeout(syncTab, 40);
        return;
      }

      const button = Array.from(nav.querySelectorAll("button")).find(
        (item) => item.textContent.trim() === config.baseLabel
      );

      if (!button) return;

      if (button.disabled && activeTab !== "overview") {
        setTabNotice("Select a hive below before opening this Queen Records tab.");
        setActiveTab("overview");
        return;
      }

      setTabNotice("");
      button.click();
    };

    const frame = window.requestAnimationFrame(syncTab);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [activeTab, baseVersion]);

  const refreshBase = () => {
    setBaseVersion((value) => value + 1);
  };

  const handleLifecycleRecorded = () => {
    refreshBase();
  };

  const handleBaseClickCapture = (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;

    const text = button.textContent || "";
    if (text.includes("Record a Swarm")) {
      event.preventDefault();
      event.stopPropagation();
      setTabNotice("");
      setActiveTab("swarm");
    }
  };

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <style>{`
        .queen-base-integrated > div > div:first-child {
          display: none;
        }
        .queen-base-integrated div:has(> nav[aria-label="Queen page tabs"]) {
          display: none;
        }
      `}</style>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-400 p-3 text-[#1a3329]">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                Premium feature
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1a3329]">
                Queen Records
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-gray-600">
            Review the current Queen position, preserve Queen history and record dated colony and Queen lifecycle changes in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">
            Staging layout
          </span>
          <button
            type="button"
            onClick={refreshBase}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <nav className="flex min-w-max" aria-label="Integrated Queen Records tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-4 px-5 py-4 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "border-yellow-400 bg-amber-50 text-[#1a3329]"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-[#1a3329]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {tabNotice ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {tabNotice}
        </div>
      ) : null}

      <div
        ref={baseRef}
        onClickCapture={handleBaseClickCapture}
        className="queen-base-integrated"
        style={{ display: BASE_TABS.has(activeTab) ? "block" : "none" }}
      >
        <QueenRecordsBase key={baseVersion} />
      </div>

      {activeTab === "union" ? (
        <QueenUnionPanel onRecorded={handleLifecycleRecorded} />
      ) : null}

      {activeTab === "swarm" ? (
        <QueenSwarmPanel onRecorded={handleLifecycleRecorded} />
      ) : null}
    </div>
  );
}
