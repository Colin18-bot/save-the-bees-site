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

const findSelectWithOption = (root, optionText) =>
  Array.from(root?.querySelectorAll("select") || []).find((select) =>
    Array.from(select.options).some(
      (option) => (option.textContent || "").trim() === optionText
    )
  );

const readBaseContext = (root) => {
  const apiarySelect = findSelectWithOption(root, "All apiaries");
  const hiveSelect = findSelectWithOption(root, "All hives");

  return {
    ready: Boolean(apiarySelect && hiveSelect),
    apiaryId: apiarySelect && apiarySelect.value !== "all" ? String(apiarySelect.value) : "",
    hiveId: hiveSelect && hiveSelect.value !== "all" ? String(hiveSelect.value) : "",
  };
};

const findSelectByLabel = (root, labelStart) => {
  const label = Array.from(root?.querySelectorAll("label") || []).find((item) =>
    (item.textContent || "").trim().startsWith(labelStart)
  );
  return label?.querySelector("select") || null;
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
  const [selectedApiaryId, setSelectedApiaryId] = useState("");
  const [selectedHiveId, setSelectedHiveId] = useState("");
  const [selectedHiveHasQueen, setSelectedHiveHasQueen] = useState(false);
  const [panelRefreshKey, setPanelRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const baseRef = useRef(null);
  const panelRef = useRef(null);
  const successPollRef = useRef(null);
  const contextSyncRef = useRef(0);

  const hasHiveContext = Boolean(selectedApiaryId && selectedHiveId);

  const syncSelectionContext = async () => {
    const syncId = contextSyncRef.current + 1;
    contextSyncRef.current = syncId;

    const context = readBaseContext(baseRef.current);
    if (!context.ready) return;

    setSelectedApiaryId(context.apiaryId);
    setSelectedHiveId(context.hiveId);

    if (!context.apiaryId || !context.hiveId) {
      setSelectedHiveHasQueen(false);
      if (activeTab !== "overview") {
        setActiveTab("overview");
      }
      return;
    }

    try {
      const records = await getQueenRecordsOverview();
      if (contextSyncRef.current !== syncId) return;
      const hive = (records.hives || []).find(
        (item) => String(item.id) === String(context.hiveId)
      );
      setSelectedHiveHasQueen(Boolean(hive?.currentQueen));
    } catch (error) {
      console.warn("Could not refresh selected Queen Records context", error);
      if (contextSyncRef.current === syncId) {
        setSelectedHiveHasQueen(false);
      }
    }
  };

  useEffect(() => {
    let attempts = 0;
    let timer;
    let cancelled = false;

    const probe = () => {
      if (cancelled) return;
      attempts += 1;
      const context = readBaseContext(baseRef.current);
      if (context.ready) {
        syncSelectionContext();
        return;
      }
      if (attempts < 60) {
        timer = window.setTimeout(probe, 50);
      }
    };

    probe();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [baseVersion]);

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
        setTabNotice("Select a specific apiary and hive before opening this Queen Records tab.");
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
    if (activeTab !== "progress" || !selectedHiveId || !baseRef.current) return undefined;

    let cancelled = false;
    let retryTimer;

    const loadContextualPanel = async () => {
      try {
        const records = await getQueenRecordsOverview();
        if (cancelled) return;

        const hive = (records.hives || []).find(
          (item) => String(item.id) === String(selectedHiveId)
        );
        if (!hive) return;

        const options = getContextualProgressOptions(hive);
        let attempts = 0;

        const applyPanel = () => {
          if (cancelled || !baseRef.current) return;
          attempts += 1;

          const heading = Array.from(baseRef.current.querySelectorAll("h2")).find(
            (item) => (item.textContent || "").trim() === "What can be recorded?"
          );
          const card = heading?.closest("section");
          const list = Array.from(card?.children || []).find((item) =>
            item.classList?.contains("space-y-3")
          );

          if (!list) {
            if (attempts < 50) retryTimer = window.setTimeout(applyPanel, 40);
            return;
          }

          const rows = Array.from(list.children);
          rows.forEach((row, index) => {
            if (index < options.length) {
              row.style.display = "flex";
              const label = row.querySelector("p");
              if (label && label.textContent !== options[index]) {
                label.textContent = options[index];
              }
            } else {
              row.style.display = "none";
            }
          });
        };

        applyPanel();
      } catch (error) {
        console.warn("Could not contextualise Queen progress guidance", error);
      }
    };

    loadContextualPanel();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [activeTab, baseVersion, selectedHiveId]);

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
        selectedHive = (records.hives || []).find(
          (hive) => String(hive.id) === String(selectedHiveId)
        ) || null;
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
  }, [activeTab, baseVersion, selectedHiveId]);

  useEffect(() => {
    if (!panelRef.current || !selectedHiveId || !["union", "swarm"].includes(activeTab)) {
      return undefined;
    }

    const root = panelRef.current;

    const applyPanelContext = () => {
      if (activeTab === "union") {
        const firstSelect = findSelectByLabel(root, "First colony");
        const secondSelect = findSelectByLabel(root, "Second colony");

        if (firstSelect) {
          const hasSelectedHive = Array.from(firstSelect.options).some(
            (option) => String(option.value) === String(selectedHiveId)
          );
          if (hasSelectedHive && String(firstSelect.value) !== String(selectedHiveId)) {
            setSelectValue(firstSelect, selectedHiveId);
          }
          firstSelect.disabled = true;
          firstSelect.classList.add("bg-gray-100", "text-gray-700");
        }

        if (secondSelect && !secondSelect.dataset.contextInitialised) {
          let placeholder = Array.from(secondSelect.options).find(
            (option) => option.dataset?.contextPlaceholder === "true"
          );
          if (!placeholder) {
            placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select second colony";
            placeholder.dataset.contextPlaceholder = "true";
            secondSelect.insertBefore(placeholder, secondSelect.firstChild);
          }
          setSelectValue(secondSelect, "");
          secondSelect.dataset.contextInitialised = "true";
        }
      }

      if (activeTab === "swarm") {
        const sourceSelect = findSelectByLabel(root, "Colony that swarmed");
        if (sourceSelect) {
          const hasSelectedHive = Array.from(sourceSelect.options).some(
            (option) => String(option.value) === String(selectedHiveId)
          );
          if (hasSelectedHive && String(sourceSelect.value) !== String(selectedHiveId)) {
            setSelectValue(sourceSelect, selectedHiveId);
          }
          sourceSelect.disabled = true;
          sourceSelect.classList.add("bg-gray-100", "text-gray-700");
        }
      }
    };

    applyPanelContext();
    const observer = new MutationObserver(applyPanelContext);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [activeTab, selectedHiveId, panelRefreshKey]);

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

  const refreshBaseData = () => {
    if (clickBaseRefresh()) return;
    window.setTimeout(() => {
      if (!clickBaseRefresh()) {
        setBaseVersion((value) => value + 1);
      }
    }, 200);
  };

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    refreshBaseData();

    if (["union", "swarm"].includes(activeTab)) {
      setPanelRefreshKey((value) => value + 1);
    }

    window.setTimeout(() => {
      syncSelectionContext();
      setRefreshing(false);
    }, 700);
  };

  const handleLifecycleRecorded = () => {
    refreshBaseData();
    window.setTimeout(syncSelectionContext, 600);
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
    }, 80);
  };

  const applyContextualProgressOptions = async () => {
    const root = baseRef.current;
    if (!root) return;

    try {
      const recordsPromise = getQueenRecordsOverview();
      const progressSelect = await waitForProgressSelect(root);
      if (!progressSelect) return;

      const records = await recordsPromise;
      const hive = (records.hives || []).find(
        (item) => String(item.id) === String(selectedHiveId)
      );
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
      window.setTimeout(syncSelectionContext, 70);
      scrollToViewingRow();
    }

    if (buttonText.includes("Record a Swarm")) {
      event.preventDefault();
      event.stopPropagation();
      if (hasHiveContext && selectedHiveHasQueen) {
        setTabNotice("");
        setActiveTab("swarm");
      }
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
    window.setTimeout(syncSelectionContext, 0);
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
          window.setTimeout(syncSelectionContext, 300);
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

  const getTabDisabled = (tabId) => {
    if (tabId === "overview") return false;
    if (!hasHiveContext) return true;
    if (tabId === "swarm" && !selectedHiveHasQueen && activeTab !== "swarm") return true;
    return false;
  };

  const getTabTitle = (tabId) => {
    if (tabId === "overview") return "";
    if (!hasHiveContext) return "Select a specific apiary and hive first.";
    if (tabId === "swarm" && !selectedHiveHasQueen) {
      return "The selected hive has no current Queen to record as having swarmed.";
    }
    return "";
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
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <nav className="flex min-w-max" aria-label="Integrated Queen Records tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const disabled = getTabDisabled(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                disabled={disabled}
                title={getTabTitle(tab.id)}
                onClick={() => {
                  setTabNotice("");
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 border-b-4 px-5 py-4 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "border-yellow-400 bg-amber-50 text-[#1a3329]"
                    : disabled
                      ? "cursor-not-allowed border-transparent bg-gray-50 text-gray-400"
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

      {!hasHiveContext ? (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Select a specific <strong>Apiary</strong> and <strong>Hive</strong> below to unlock the Queen workflow tabs. The Overview tab remains available for the full Queen register.
        </div>
      ) : null}

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

      <div ref={panelRef}>
        {activeTab === "union" ? (
          <QueenUnionPanel key={`union-${panelRefreshKey}`} onRecorded={handleLifecycleRecorded} />
        ) : null}

        {activeTab === "swarm" ? (
          <QueenSwarmPanel key={`swarm-${panelRefreshKey}`} onRecorded={handleLifecycleRecorded} />
        ) : null}
      </div>
    </div>
  );
}
