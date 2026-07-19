// src/intelligence/change/buildChangeSummary.js

export function buildChangeSummary(changes = [], scoreChange = null) {
  const improved = changes.filter((change) => change.direction === "improved");
  const declined = changes.filter((change) => change.direction === "declined");

  if (declined.length === 0 && improved.length > 0) {
    return "This inspection shows an overall improvement compared with the previous inspection.";
  }

  if (declined.length > 0 && improved.length === 0) {
    return "This inspection shows areas that may need attention compared with the previous inspection.";
  }

  if (declined.length > 0 && improved.length > 0) {
    return "This inspection shows mixed changes compared with the previous inspection.";
  }

  if (scoreChange !== null && scoreChange > 0) {
    return "The health score has improved since the previous inspection.";
  }

  if (scoreChange !== null && scoreChange < 0) {
    return "The health score has reduced since the previous inspection.";
  }

  return "No major changes were detected compared with the previous inspection.";
}