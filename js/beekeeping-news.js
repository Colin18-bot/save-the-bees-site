(function () {
  "use strict";

  const ENDPOINT = "/.netlify/functions/beekeeping-news";
  const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function safeUrl(value) {
    try {
      const url = new URL(value, window.location.origin);
      return url.protocol === "https:" ? url.href : "#";
    } catch {
      return "#";
    }
  }

  function formatDate(value) {
    if (!value) return "Recently published";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently published" : DATE_FORMAT.format(date);
  }

  function articleCard(item) {
    const article = document.createElement("article");
    article.className = "bee-news-card";

    const meta = document.createElement("p");
    meta.className = "bee-news-card__meta";
    const source = document.createElement("span");
    source.className = "bee-news-card__source";
    source.textContent = item.source || "UK beekeeping source";
    const separator = document.createElement("span");
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = " · ";
    const time = document.createElement("time");
    if (item.publishedAt) time.dateTime = item.publishedAt;
    time.textContent = formatDate(item.publishedAt);
    meta.append(source, separator, time);

    const heading = document.createElement("h3");
    heading.className = "bee-news-card__title";
    const titleLink = document.createElement("a");
    titleLink.href = safeUrl(item.url);
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent = item.title;
    heading.append(titleLink);
    article.append(meta, heading);

    if (item.summary) {
      const summary = document.createElement("p");
      summary.className = "bee-news-card__summary";
      summary.textContent = item.summary;
      article.append(summary);
    }

    const readMore = document.createElement("a");
    readMore.className = "bee-news-card__link";
    readMore.href = safeUrl(item.url);
    readMore.target = "_blank";
    readMore.rel = "noopener noreferrer";
    readMore.setAttribute("aria-label", `Read “${item.title}” at ${item.source || "the source"}`);
    readMore.textContent = "Read at source →";
    article.append(readMore);
    return article;
  }

  function showMessage(root, message, isError) {
    const existing = root.querySelector(".bee-news-status");
    const status = existing || document.createElement("p");
    status.className = `bee-news-status${isError ? " bee-news-status--error" : ""}`;
    status.textContent = message;
    if (!existing) root.append(status);
  }

  async function loadFeed(root, topicOverride) {
    const list = root.querySelector("[data-bee-news-list]");
    if (!list) return;
    const topic = topicOverride || root.dataset.topic || "all";
    const limit = Math.min(Math.max(Number.parseInt(root.dataset.limit || "6", 10), 1), 20);
    const params = new URLSearchParams({ topic, limit: String(limit) });

    root.setAttribute("aria-busy", "true");
    list.replaceChildren();
    showMessage(root, "Loading the latest updates…", false);

    try {
      const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error("Feed request failed");
      const data = await response.json();
      const status = root.querySelector(".bee-news-status");
      if (status) status.remove();

      if (!Array.isArray(data.items) || data.items.length === 0) {
        showMessage(root, "There are no current updates in this category.", false);
      } else {
        list.replaceChildren(...data.items.map(articleCard));
      }

      const updated = root.querySelector("[data-bee-news-updated]");
      if (updated && data.fetchedAt) updated.textContent = `Checked ${formatDate(data.fetchedAt)}`;
    } catch {
      list.replaceChildren();
      showMessage(root, "The latest updates cannot be loaded just now. Please try again shortly.", true);
    } finally {
      root.setAttribute("aria-busy", "false");
    }
  }

  function initialise(root) {
    const buttons = root.querySelectorAll("[data-news-topic]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        loadFeed(root, button.dataset.newsTopic || "all");
      });
    });
    loadFeed(root);
  }

  document.querySelectorAll("[data-bee-news]").forEach(initialise);
})();

