// src/intelligence/helpers/dates.js

export const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const daysBetween = (from, to = new Date()) => {
  const start = toDate(from);
  const end = toDate(to);

  if (!start || !end) return null;

  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const daysSince = (value) => {
  const days = daysBetween(value, new Date());
  return days === null ? null : Math.max(0, days);
};

export const sortByDateDesc = (rows = [], key = "date") =>
  [...rows].sort(
    (a, b) =>
      new Date(b?.[key] || b?.created_at || 0) -
      new Date(a?.[key] || a?.created_at || 0)
  );

export const isOlderThanDays = (value, days) => {
  const age = daysSince(value);
  return age !== null && age > days;
};
