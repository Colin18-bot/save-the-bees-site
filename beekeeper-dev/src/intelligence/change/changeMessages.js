// src/intelligence/change/changeMessages.js

const labels = {
  queen: "Queen",
  brood_pattern: "Brood quality",
  food_stores: "Food stores",
  hive_population: "Population",
};

export function buildChangeMessages(changes = []) {
  return changes.map((change) => {
    const label = labels[change.field] || change.label || change.field;

    if (change.direction === "improved") {
      return {
        ...change,
        message: `${label} has improved since the previous inspection.`,
      };
    }

    if (change.direction === "declined") {
      return {
        ...change,
        message: `${label} has declined since the previous inspection.`,
      };
    }

    if (change.direction === "unchanged") {
      return {
        ...change,
        message: `${label} is unchanged since the previous inspection.`,
      };
    }

    return {
      ...change,
      message: `${label} could not be compared with the previous inspection.`,
    };
  });
}