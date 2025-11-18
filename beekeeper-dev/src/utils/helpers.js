// src/utils/helpers.js

// Format a date string into a more readable format
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Capitalize the first letter of a string
export const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Generate a unique identifier (UUID-like)
export const generateId = () =>
  "_" + Math.random().toString(36).substr(2, 9);

// Group items by a given key
export const groupBy = (array, key) =>
  array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
