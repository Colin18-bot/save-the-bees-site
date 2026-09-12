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
import { getQueenRecordsOverview } from "../../services/queenRecords.js";

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
  "Record Progress",
  "Record a Split",
  "Transfer a Queen",
  "Introduce a Queen",
  "Set Queenless Colony Plan",
];

const LOSS_PROGRESS_OPTIONS = [
  "Queen not seen — continue monitoring",
  "Queen presumed lost",
  "Queenless confirmed",
];

const getContextualProgressOptions = (hive) => {
  const currentQueen = hive?.currentQueen;
  const status = String(currentQueen?.statusRaw || currentQueen?.status || "")
    .trim()
    .toLowerCase();

  if (!currentQueen) {
    return [
      "Emergency Queen cells started",
      "Swarm Queen cells retained",
      "Queen cells charged",
      "Queen cells sealed",
      "Queen emerged",
    ];
  }

  if (status.includes("acceptance pending") || status === "pending") {
    return [
      "Queen released",
      "Queen accepted",
      "Eggs observed",
      "Laying queen confirmed",
      ...LOSS_PROGRESS_OPTIONS,
    ];
  }

  if (status.includes("introduced")) {
    return [
      "Queen accepted",
      "Eggs observed",
      "Laying queen confirmed",
      ...LOSS_PROGRESS_OPTIONS,
    ];
  }

  if (status.includes("accepted")) {
    return ["Eggs observed", "Laying queen confirmed", ...LOSS_PROGRESS_OPTIONS];
  }

  if (status.includes("virgin")) {
    return [
      "Mating outcome pending",
      "Eggs observed",
      "Laying queen confirmed",
      ...LOSS_PROGRESS_OPTIONS,
    ];
  }

  if (status.includes("mating")) {
    return ["Eggs observed", "Laying queen confirmed", ...LOSS_PROGRESS_OPTIONS];
  }

  if (status.includes("laying")) {
    return [
      "Supersedure Queen cells confirmed",
      "Swarm Queen cells retained",
      ...LOSS_PROGRESS_OPTIONS,
    ];
  }

  return [
    "Supersedure Queen cells confirmed",
    "Swarm Queen cells retained",
    "Eggs observed",
    "Laying queen confirmed",
    ...LOSS_PROGRESS_OPTIONS,
  ];
};

const waitForProgressSelect = (root) =>
  new Promise((resolve) => {
    let attempts = 0;

    const findSelect = () => {
      attempts += 1;
      const select = Array.from(root?.querySelectorAll("select") || []).find((item) => {
        const labels = Array.from(item.options).map((option) => (option.textContent || "").trim());
        return labels.includes("Queen accepted") && labels.includes("Queenless confirmed");
      });

      if (select || attempts >= 50) {
        resolve(select || null);
        return;
      }

      window.setTimeout(findSelect, 40);
    };

    findSelect();
  });

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

    let cancelled = false;
    let selectedHive = null;

    const updateEventTiles = () => {
      const root = baseRef.current;
      if (!root) return;

      const swarmButton = Array.from(root.querySelectorAll("button")).find(
        (item) => (item.textContent || "").includes("Record a Swarm")
      );
      const paragraphs = swarmButton?.querySelectorAll("p");
      if (paragraphs?.length > 1 && paragraphs[1].textContent !== SWARM_DESCRIPTION) {
        paragraphs[1].textContent = SWARM_DESCRIPTION;
      }

      const addQueenButton = Array.from(root.querySelectorAll("button")).find(
        (item) => (item.textContent || "").includes("Add a Queen")
      );
      const hasQueenHistory = Boolean(selectedHive?.previousQueens?.length);

      if (addQueenButton && hasQueenHistory) {
        addQueenButton.disabled = true;
        addQueenButton.setAttribute("aria-disabled", "true");
        addQueenButton.title = "This hive already has Queen history. Use Introduce a Queen for a new Queen.";
        addQueenButton.classList.remove(
          "bg-white",
          "hover:border-amber-400",
          "hover:bg-amber-50",
          "hover:shadow-sm"
        );
        addQueenButton.classList.add("cursor-not-allowed", "bg-gray-100", "opacity-65");
      }
    };

    const loadSelectedHive = async () => {
      try {
        const records = await getQueenRecordsOverview();
        if (cancelled || !baseRef.current) return;

        const hivesById = new Map((records.hives || []).map((hive) => [String(hive.id), hive]));
        const selectedHiveId = Array.from(baseRef.current.querySelectorAll("select"))
          .map((select) => String(select.value || ""))
          .find((value) => hivesById.has(value));

        selectedHive = selectedHiveId ? hivesById.get(selectedHiveId) : null;
        updateEventTiles();
      } catch (error) {
        console.warn("Could not apply Queen event tile rules", error);
      }
    };

    updateEventTiles();
    loadSelectedHive();

    const observer = new MutationObserver(updateEventTiles);
    observer.observe(baseRef.current, { childList: true, subtree: true, characterData: true });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
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

  const applyContextualProgressOptions = async () => {
    const root = baseRef.current;
    if (!root) return;

    try {
      const recordsPromise = getQueenRecordsOverview();
      const progressSelect = await waitForProgressSelect(root);
      if (!progressSelect) return;

      const records = await recordsPromise;
      const hivesById = new Map((records.hives || []).map((hive) => [String(hive.id), hive]));
      const selectedHiveId = Array.from(root.querySelectorAll("select"))
        .map((select) => String(select.value || ""))
        .find((value) => hivesById.has(value));
      const hive = selectedHiveId ? hivesById.get(selectedHiveId) : null;
      if (!hive) return;

      const allowedOptions = new Set(getContextualProgressOptions(hive));
      Array.from(progressSelect.options).forEach((option) => {
        const label = (option.textContent || "").trim();
        if (option.value && !allowedOptions.has(label)) option.remove();
      });

      const form = progressSelect.closest("form");
      const existingHint = form?.querySelector('[data-contextual-progress-hint="true"]');
      if (!existingHint) {
        const hint = document.createElement("p");
        hint.dataset.contextualProgressHint = "true";
        hint.className = "mt-2 text-xs text-gray-500";
        const stage = hive.currentQueen?.status || hive.transition?.status || "current colony state";
        hint.textContent = `Showing progress options relevant to: ${stage}.`;
        progressSelect.insertAdjacentElement("afterend", hint);
      }
    } catch (error) {
      console.warn("Could not contextualise Queen progress options", error);
    }
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

    if (
      buttonText.includes("Record Queen Progress") ||
      buttonText.trim() === "Record Progress"
    ) {
      applyContextualProgressOptions();
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
