// src/intelligence/constants/priorities.js

export const PRIORITIES = Object.freeze({
  INFO: "info",
  MONITOR: "monitor",
  IMPORTANT: "important",
  CRITICAL: "critical",
});

export const PRIORITY_RANK = Object.freeze({
  [PRIORITIES.INFO]: 1,
  [PRIORITIES.MONITOR]: 2,
  [PRIORITIES.IMPORTANT]: 3,
  [PRIORITIES.CRITICAL]: 4,
});

export const getPriorityRank = (priority) => PRIORITY_RANK[priority] || 0;
