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
import { supabase } from "../../services/supabase";

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

const RETAINED_CELL_METHODS = [
  "Existing emergency Queen cells retained",
  "Existing supersedure Queen cells retained",
  "Existing swarm Queen cells retained",
];

const RETAINED_CELL_METHOD_BY_POSITION = {
  "Emergency Queen cells": "Existing emergency Queen cells retained",
  "Supersedure Queen cells": "Existing supersedure Queen cells retained",
  "Swarm Queen cells": "Existing swarm Queen cells retained",
};

const queenCellPositionFromMethod = (method = "") => {
  const value = String(method).trim().toLowerCase();
  if (value === "existing emergency queen cells retained") return "Emergency Queen cells";
  if (value === "existing supersedure queen cells retained") return "Supersedure Queen cells";
  if (value === "existing swarm queen cells retained") return "Swarm Queen cells";
  return "";
};

const applyQueenCellReplacementRules = (queenCellSelect, replacementSelect) => {
  if (!queenCellSelect || !replacementSelect) return;

  const allowedRetainedMethod = RETAINED_CELL_METHOD_BY_POSITION[queenCellSelect.value] || null;
  let selectedMethodIsNowInvalid = false;

  Array.from(replacementSelect.options).forEach((option) => {
    const label = (option.textContent || "").trim();
    if (!RETAINED_CELL_METHODS.includes(label)) return;

    const allowed = label === allowedRetainedMethod;
    option.hidden = !allowed;
    option.disabled = !allowed;

    if (option.selected && !allowed) {
      selectedMethodIsNowInvalid = true;
    }
  });

  if (selectedMethodIsNowInvalid) {
    replacementSelect.value = "Not yet decided";
    replacementSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
};

const wireQueenCellReplacementRules = (root, selectedHive) => {
  const selects = Array.from(root?.querySelectorAll("select") || []);
  const queenCellSelect = selects.find((select) => {
    const labels = Array.from(select.options).map((option) => (option.textContent || "").trim());
    return labels.includes("Queen-cell position not recorded") && labels.includes("Emergency Queen cells");
  });
  const replacementSelect = selects.find((select) => {
    const labels = Array.from(select.options).map((option) => (option.textContent || "").trim());
    return labels.includes("Existing emergency Queen cells retained") && labels.includes("Not yet decided");
  });

  if (!queenCellSelect || !replacementSelect) return;

  const form = queenCellSelect.closest("form");
  const formTitle = form?.closest("section")?.querySelector("h2")?.textContent || "";
  const isQueenlessPlan = formTitle.includes("Set Queenless Colony Plan");

  if (isQueenlessPlan && !selectedHive) return;

  if (!queenCellSelect.dataset.contextualReplacementWired) {
    queenCellSelect.dataset.contextualReplacementWired = "true";
    queenCellSelect.addEventListener("change", () => {
      applyQueenCellReplacementRules(queenCellSelect, replacementSelect);
    });
  }

  if (isQueenlessPlan && selectedHive?.transition?.id) {
    if (!queenCellSelect.dataset.contextualReplacementPrefill) {
      queenCellSelect.dataset.contextualReplacementPrefill = "loading";

      supabase
        .from("queen_processes")
        .select("metadata")
        .eq("id", selectedHive.transition.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.warn("Could not load Queen-cell position for the active Queen process", error);
          }

          const savedPosition =
            data?.metadata?.queen_cell_position ||
            queenCellPositionFromMethod(selectedHive.transition?.method);

          if (
            queenCellSelect.value === "Queen-cell position not recorded" &&
            savedPosition &&
            Array.from(queenCellSelect.options).some((option) => option.value === savedPosition)
          ) {
            queenCellSelect.value = savedPosition;
            queenCellSelect.dispatchEvent(new Event("change", { bubbles: true }));
          }

          queenCellSelect.dataset.contextualReplacementPrefill = "done";
          applyQueenCellReplacementRules(queenCellSelect, replacementSelect);
        });

      return;
    }

    if (queenCellSelect.dataset.contextualReplacementPrefill === "loading") return;
  }

  applyQueenCellReplacementRules(queenCellSelect, replacementSelect);
};

const getContextualProgressOptions = (hive) => {
  const currentQueen = hive?.currentQueen;
  const status = String(currentQueen?.statusRaw || currentQueen?.status || "")
    .trim()
    .toLowerCase();
  const transitionStatus = String(hive?.transition?.status || "")
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
      ...(transitionStatus.includes("eggs observed") ? ["Laying queen confirmed"] : []),
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
  const [showBackToRegister, setShowBackToRegister] = useState(false);
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
    if (activeTab !== "overview" || !baseRef.current) return undefined;

    const updateRegisterLinks = () => {
      Array.from(baseRef.current?.querySelectorAll("span") || []).forEach((item) => {
        if ((item.textContent || "").trim() === "Open →") {
          item.textContent = "View hive →";
        }
      });
    };

    updateRegisterLinks();
    const observer = new MutationObserver(updateRegisterLinks);
    observer.observe(baseRef.current, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [activeTab, baseVersion]);

  useEffect(() => {
    if (!BASE_TABS.has(activeTab) || !baseRef.current) return undefined;

    const root = baseRef.current;

    const updateBackNavigation = () => {
      const viewingRow = Array.from(root.querySelectorAll("div")).find((item) => {
        const text = (item.textContent || "").trim();
        return item.classList.contains("border-t") && text.startsWith("Viewing:");
      });

      const existingButton = root.querySelector('[data-back-to-queen-register="true"]');

      if (!showBackToRegister) {
        existingButton?.remove();
        if (viewingRow) {
          viewingRow.classList.remove(
            "flex",
            "flex-col",
            "gap-2",
            "sm:flex-row",
            "sm:items-center",
            "sm:justify-between"
          );
        }
        return;
      }

      if (!viewingRow) return;

      viewingRow.classList.add(
        "flex",
        "flex-col",
        "gap-2",
        "sm:flex-row",
        "sm:items-center",
        "sm:justify-between"
      );

      if (existingButton && existingButton.parentElement === viewingRow) return;
      existingButton?.remove();

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.backToQueenRegister = "true";
      button.className =
        "inline-flex w-fit items-center justify-center rounded-lg border border-green-700 bg-white px-3 py-2 text-xs font-bold text-green-900 hover:bg-green-50";
      button.textContent = "← Back to Queen register";
      button.addEventListener("click", backToQueenRegister);
      viewingRow.appendChild(button);
    };

    updateBackNavigation();
    const observer = new MutationObserver(updateBackNavigation);
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      const button = root.querySelector('[data-back-to-queen-register="true"]');
      button?.removeEventListener("click", backToQueenRegister);
      button?.remove();
    };
  }, [activeTab, baseVersion, showBackToRegister]);

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

        const header = addQueenButton.firstElementChild;
        const historyLock = header?.querySelector('[data-history-lock="true"]');
        const nativeLock = header?.querySelector('svg.lucide-lock, svg[data-lucide="lock"]');

        if (nativeLock && historyLock) {
          historyLock.remove();
        } else if (header && !nativeLock && !historyLock) {
          const lock = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          lock.setAttribute("data-history-lock", "true");
          lock.setAttribute("viewBox", "0 0 24 24");
          lock.setAttribute("fill", "none");
          lock.setAttribute("stroke", "currentColor");
          lock.setAttribute("stroke-width", "2");
          lock.setAttribute("stroke-linecap", "round");
          lock.setAttribute("stroke-linejoin", "round");
          lock.setAttribute("class", "h-4 w-4 text-gray-500");
          lock.innerHTML = '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>';
          header.appendChild(lock);
        }
      }

      wireQueenCellReplacementRules(root, selectedHive);
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

  const clickBaseRefresh = () => {
    const refreshButton = Array.from(baseRef.current?.querySelectorAll("button") || []).find(
      (item) => (item.textContent || "").trim() === "Refresh"
    );

    if (refreshButton) {
      refreshButton.click();
      return true;
    }

    return false;
  };

  const refreshBase = () => {
    if (!clickBaseRefresh()) {
      setBaseVersion((value) => value + 1);
    }
  };

  const handleLifecycleRecorded = () => {
    refreshBase();
  };

  const setSelectValue = (select, value) => {
    if (!select) return;

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      "value"
    )?.set;

    if (nativeSetter) nativeSetter.call(select, value);
    else select.value = value;

    select.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const backToQueenRegister = () => {
    setTabNotice("");
    setActiveTab("overview");
    setShowBackToRegister(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const root = baseRef.current;
        if (!root) return;

        const selects = Array.from(root.querySelectorAll("select"));
        const apiarySelect = selects.find((select) =>
          Array.from(select.options).some(
            (option) => option.value === "all" && (option.textContent || "").trim() === "All apiaries"
          )
        );

        if (apiarySelect && apiarySelect.value !== "all") {
          setSelectValue(apiarySelect, "all");
        }

        window.setTimeout(() => {
          const currentSelects = Array.from(root.querySelectorAll("select"));
          const hiveSelect = currentSelects.find((select) =>
            Array.from(select.options).some(
              (option) => option.value === "all" && (option.textContent || "").trim() === "All hives"
            )
          );

          if (hiveSelect && hiveSelect.value !== "all") {
            setSelectValue(hiveSelect, "all");
          }

          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 0);
      });
    });
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

  const scrollToViewingRow = () => {
    window.setTimeout(() => {
      const viewingRow = Array.from(baseRef.current?.querySelectorAll("div") || []).find((item) => {
        const text = (item.textContent || "").trim();
        return item.classList.contains("border-t") && text.startsWith("Viewing:");
      });
      viewingRow?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
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

    if (buttonText.includes("View hive →") || buttonText.includes("Open →")) {
      setShowBackToRegister(true);
      scrollToViewingRow();
    }

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

  const handleBaseChangeCapture = () => {
    window.setTimeout(() => {
      const selects = Array.from(baseRef.current?.querySelectorAll("select") || []);
      const hiveSelect = selects.find((select) =>
        Array.from(select.options).some(
          (option) => option.value === "all" && (option.textContent || "").trim() === "All hives"
        )
      );

      if (hiveSelect?.value === "all") {
        setShowBackToRegister(false);
      }
    }, 0);
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
        onChangeCapture={handleBaseChangeCapture}
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
