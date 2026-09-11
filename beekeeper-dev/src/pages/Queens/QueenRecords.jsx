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
const SWARM_DESCRIPTION =
  "Record whether the swarm was lost, recovered and returned, or moved to another hive or nucleus.";
const INLINE_ACTION_LABELS = [
  "Add a Queen",
  "Edit Queen Information",
  "Record Queen Progress",
  "Record a Split",
  "Transfer a Queen",
  "Introduce a Queen",
  "Set Queenless Colony Plan",
];

export default function QueenRecords() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tabNotice, setTabNotice] = useState("");
  const [baseVersion, setBaseVersion] = useState(0);
  const baseRef = useRef(null);
  const successPollRef = useRef(null);

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

      if (activeTab === "history") {
        window.requestAnimationFrame(() => {
          if (cancelled || !baseRef.current) return;

          const badges = Array.from(baseRef.current.querySelectorAll("span")).filter(
            (item) => (item.textContent || "").trim() === "Queenless Confirmed"
          );

          badges.forEach((badge) => {
            const row = badge.closest("div.grid");
            const detailColumn = row?.children?.[1];

            badge.textContent = "No longer present";
            badge.className =
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 border-gray-200";

            if (detailColumn && !detailColumn.querySelector('[data-queenless-history-reason="true"]')) {
              const reason = document.createElement("p");
              reason.dataset.queenlessHistoryReason = "true";
              reason.className = "mt-1 text-xs text-gray-500";
              reason.textContent = "Reason: Colony confirmed Queenless";
              detailColumn.appendChild(reason);
            }
          });
        });
      }
    };

    const frame = window.requestAnimationFrame(syncTab);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [activeTab, baseVersion]);

  useEffect(() => {
    if (activeTab !== "events" || !baseRef.current) return undefined;

    const updateSwarmDescription = () => {
      const swarmButton = Array.from(baseRef.current?.querySelectorAll("button") || []).find(
        (item) => (item.textContent || "").includes("Record a Swarm")
      );
      const paragraphs = swarmButton?.querySelectorAll("p");
      if (paragraphs?.length > 1 && paragraphs[1].textContent !== SWARM_DESCRIPTION) {
        paragraphs[1].textContent = SWARM_DESCRIPTION;
      }
    };

    updateSwarmDescription();
    const observer = new MutationObserver(updateSwarmDescription);
    observer.observe(baseRef.current, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [activeTab, baseVersion]);

  useEffect(
    () => () => {
      if (successPollRef.current) window.clearTimeout(successPollRef.current);
    },
    []
  );

  const refreshBase = () => {
    setBaseVersion((value) => value + 1);
  };

  const handleLifecycleRecorded = () => {
    refreshBase();
  };

  const scrollToInlineForm = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const form = baseRef.current?.querySelector("form");
        const formSection = form?.closest("section");
        formSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const handleBaseClickCapture = (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;

    const buttonText = button.textContent || "";

    if (buttonText.includes("Record a Swarm")) {
      event.preventDefault();
      event.stopPropagation();
      setTabNotice("");
      setActiveTab("swarm");
      return;
    }

    if (INLINE_ACTION_LABELS.some((label) => buttonText.includes(label))) {
      scrollToInlineForm();
    }
  };

  const handleBaseSubmitCapture = () => {
    if (successPollRef.current) window.clearTimeout(successPollRef.current);

    let attempts = 0;
    const findCompletedSave = () => {
      attempts += 1;
      const root = baseRef.current;
      if (!root) return;

      const actionForm = root.querySelector("form");
      if (!actionForm) {
        const messageParagraph = Array.from(root.querySelectorAll("p")).find((item) =>
          (item.textContent || "").includes("saved successfully.")
        );
        const successBox = messageParagraph?.parentElement?.parentElement;
        if (successBox) {
          successBox.scrollIntoView({ behavior: "smooth", block: "start" });
          successPollRef.current = null;
          return;
        }
      }

      if (attempts < 100) {
        successPollRef.current = window.setTimeout(findCompletedSave, 100);
      } else {
        successPollRef.current = null;
      }
    };

    successPollRef.current = window.setTimeout(findCompletedSave, 100);
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
        onSubmitCapture={handleBaseSubmitCapture}
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
