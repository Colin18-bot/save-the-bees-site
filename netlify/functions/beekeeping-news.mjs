const FEEDS = [
  {
    id: "bbka",
    name: "British Beekeepers Association",
    shortName: "BBKA",
    homeUrl: "https://www.bbka.org.uk/",
    feedUrl:
      "https://www.bbka.org.uk/handlers/rss.ashx?feed=1&IDModule=%5B58a7a3e8-32d7-49ac-8fa0-6028844a8b44%5D",
    allowedHosts: ["bbka.org.uk", "www.bbka.org.uk"],
  },
];

const TOPIC_RULES = {
  hornet: [
    "asian hornet",
    "yellow-legged hornet",
    "yellow legged hornet",
    "vespa velutina",
    "hornet week",
  ],
  varroa: ["varroa", "varroosis", "oxalic", "thymol", "amitraz", "mite treatment"],
  health: [
    "bee health",
    "disease",
    "foulbrood",
    "efb",
    "afb",
    "nosema",
    "virus",
    "paralysis",
    "brood disorder",
    "poisoning",
    "pesticide",
  ],
  seasonal: [
    "january",
    "february",
    "march",
    "april",
    "may ",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
    "spring",
    "summer",
    "autumn",
    "winter",
    "swarm",
    "feeding",
    "stores",
    "forage",
    "honey harvest",
  ],
  research: ["research", "study", "survey", "trial", "science", "scientist", "report"],
};

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'");
}

function plainText(value = "") {
  return decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function safeItemUrl(value, feed) {
  try {
    const url = new URL(plainText(value), feed.homeUrl);
    if (url.protocol !== "https:" || !feed.allowedHosts.includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function classify(title, summary) {
  const haystack = `${title} ${summary}`.toLowerCase();
  const topics = Object.entries(TOPIC_RULES)
    .filter(([, terms]) => terms.some((term) => haystack.includes(term)))
    .map(([topic]) => topic);

  if (topics.includes("varroa") && !topics.includes("health")) topics.push("health");
  return topics.length ? topics : ["general"];
}

function truncate(value, length = 220) {
  if (value.length <= length) return value;
  const shortened = value.slice(0, length + 1).replace(/\s+\S*$/, "").trim();
  return `${shortened}…`;
}

export function parseRss(xml, feed) {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return itemBlocks
    .map((block) => {
      const title = plainText(tagValue(block, "title"));
      const link = safeItemUrl(tagValue(block, "link"), feed);
      const summary = truncate(
        plainText(tagValue(block, "description") || tagValue(block, "content:encoded")),
      );
      const rawDate = plainText(tagValue(block, "pubDate") || tagValue(block, "dc:date"));
      const parsedDate = Date.parse(rawDate);

      if (!title || !link) return null;

      return {
        id: `${feed.id}:${link}`,
        title,
        summary,
        url: link,
        publishedAt: Number.isNaN(parsedDate) ? null : new Date(parsedDate).toISOString(),
        source: feed.shortName,
        sourceName: feed.name,
        topics: classify(title, summary),
      };
    })
    .filter(Boolean);
}

function json(statusCode, body, cache = false) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cache
        ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=21600"
        : "no-store",
      "x-content-type-options": "nosniff",
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event = {}) {
  const params = event.queryStringParameters || {};
  const topic = String(params.topic || "all").toLowerCase();
  const allowedTopics = new Set(["all", "seasonal", "health", "varroa", "hornet", "research"]);
  const selectedTopic = allowedTopics.has(topic) ? topic : "all";
  const limit = Math.min(Math.max(Number.parseInt(params.limit, 10) || 12, 1), 20);

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const response = await fetch(feed.feedUrl, {
        headers: {
          accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
          "user-agent": "BeezKnees UK Beekeeping Updates/1.0 (+https://beezknees.co.uk)",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) throw new Error(`${feed.shortName} returned ${response.status}`);
      return parseRss(await response.text(), feed);
    }),
  );

  const items = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((item) => selectedTopic === "all" || item.topics.includes(selectedTopic))
    .sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0))
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .slice(0, limit);

  if (!results.some((result) => result.status === "fulfilled")) {
    return json(502, {
      error: "Updates are temporarily unavailable.",
      items: [],
      sourceDirectory: "https://www.bbka.org.uk/rss-feeds",
    });
  }

  return json(
    200,
    {
      items,
      topic: selectedTopic,
      fetchedAt: new Date().toISOString(),
      sources: FEEDS.map(({ name, shortName, homeUrl }) => ({ name, shortName, homeUrl })),
    },
    true,
  );
}

