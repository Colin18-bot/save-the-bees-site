// src/utils/geocode.js

// ---- Simple persistent cache (localStorage) ----
const CACHE_KEY = "geocode_cache_v1";
let cache;
try {
  cache = new Map(
    Object.entries(JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"))
  );
} catch {
  cache = new Map();
}
const saveCache = () => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(Object.fromEntries(cache))
    );
  } catch {
    // no-op: best-effort cache write (quota/private mode can fail)
  }
};

// ---- In-flight de-duplication: lat,lon -> Promise ----
const inflight = new Map();

// ---- Throttle queue (≈1 req/sec) ----
const queue = [];
let busy = false;
async function runQueue() {
  if (busy || queue.length === 0) return;
  busy = true;
  const { fn, resolve, reject } = queue.shift();
  try {
    const val = await fn();
    resolve(val);
  } catch (e) {
    reject(e);
  } finally {
    // Space requests ~1.1s to satisfy free-tier limits comfortably
    setTimeout(() => {
      busy = false;
      runQueue();
    }, 1100);
  }
}
function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    runQueue();
  });
}

// ---- Helpers ----
const roundKey = (lat, lon) =>
  `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`;

const fetchJSON = async (url) => {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return { res, json: res.ok ? await res.json() : null };
};

const buildPrettyFromAddress = (addrObj) => {
  if (!addrObj) return null;
  const a = addrObj || {};
  const parts = [
    a.road,
    a.house_number,
    a.suburb,
    a.city || a.town || a.village,
    a.state,
    a.postcode,
    a.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

// ---- Forward geocode (LocationIQ first, fallback to maps.co) ----
export async function forwardGeocode(query) {
  const q = (query || "").trim();
  if (!q) return null;

  const key = import.meta.env.VITE_LOCATIONIQ_KEY;

  // 1) Try LocationIQ (if key present)
  if (key) {
    try {
      const url = `https://us1.locationiq.com/v1/search?key=${encodeURIComponent(
        key
      )}&q=${encodeURIComponent(q)}&format=json&limit=1`;
      const { res, json } = await fetchJSON(url);
      if (res.ok && Array.isArray(json) && json.length > 0) {
        const first = json[0];
        const lat = Number(first.lat);
        const lon = Number(first.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          return {
            lat,
            lon,
            display: first.display_name || `${lat}, ${lon}`,
          };
        }
      }
    } catch {
      // fall through to fallback
    }
  }

  // 2) Fallback: maps.co (Nominatim wrapper, no key)
  try {
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(
      q
    )}&limit=1`;
    const { res, json } = await fetchJSON(url);
    if (res.ok && Array.isArray(json) && json.length > 0) {
      const first = json[0];
      const lat = Number(first.lat);
      const lon = Number(first.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return {
          lat,
          lon,
          display: first.display_name || `${lat}, ${lon}`,
        };
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

// ---- Reverse geocode (cache + throttle + retries + fallback) ----
export function reverseGeocode(lat, lon) {
  const liqKey = import.meta.env.VITE_LOCATIONIQ_KEY;
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
    return Promise.resolve(`${lat}, ${lon}`);
  }

  const key = roundKey(lat, lon);
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  if (inflight.has(key)) return inflight.get(key);

  const p = enqueue(async () => {
    // Try LocationIQ first (if key present), then fallback to maps.co
    let lastErr;

    // ----- Attempt 1: LocationIQ (with small retry + 429 handling)
    if (liqKey) {
      let attempt = 0;
      const maxAttempts = 2;
      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          const url = `https://us1.locationiq.com/v1/reverse?key=${encodeURIComponent(
            liqKey
          )}&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
            lon
          )}&format=json&normalizeaddress=1`;
          const res = await fetch(url, { headers: { Accept: "application/json" } });

          if (res.status === 429) {
            const retryAfter = Number(res.headers.get("Retry-After")) || 2;
            await new Promise((r) =>
              setTimeout(r, Math.max(1000, retryAfter * 1000))
            );
            continue;
          }

          if (!res.ok) throw new Error(`Reverse geocode HTTP ${res.status}`);

          const data = await res.json();
          const pretty =
            data?.display_name?.trim() ||
            buildPrettyFromAddress(data?.address) ||
            key;
          cache.set(key, pretty);
          saveCache();
          return pretty;
        } catch (e) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 800 * attempt));
        }
      }
    }

    // ----- Attempt 2: maps.co (no key)
    {
      let attempt = 0;
      const maxAttempts = 2;
      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          const url = `https://geocode.maps.co/reverse?lat=${encodeURIComponent(
            lat
          )}&lon=${encodeURIComponent(lon)}`;
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error(`Fallback reverse geocode HTTP ${res.status}`);

          const data = await res.json();
          const pretty =
            data?.display_name?.trim() ||
            buildPrettyFromAddress(data?.address) ||
            key;
          cache.set(key, pretty);
          saveCache();
          return pretty;
        } catch (e) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 700 * attempt));
        }
      }
    }

    // If both services failed, surface the last error (caller may fall back to coords)
    throw lastErr || new Error("Reverse geocode failed");
  }).finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, p);
  return p;
}

// ---- Convenience: reverse many safely (sequential) ----
export async function reverseGeocodeMany(
  items,
  pickLat = (x) => x.lat,
  pickLon = (x) => x.lon
) {
  const out = new Map(); // key -> display
  for (const item of items) {
    const lat = pickLat(item);
    const lon = pickLon(item);
    if (lat == null || lon == null) continue;

    const key = roundKey(lat, lon);
    if (out.has(key)) continue;

    try {
      const name = await reverseGeocode(lat, lon);
      out.set(key, name);
    } catch {
      out.set(key, `${lat}, ${lon}`);
    }
  }
  return out; // Map of "lat,lon" -> "Display Name"
}
