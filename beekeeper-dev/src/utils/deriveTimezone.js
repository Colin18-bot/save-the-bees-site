// src/utils/deriveTimezone.js
// No npm packages. Fetch from Open-Meteo with timeout and clear errors.

export async function deriveTimezone(lat, lng) {
  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    throw new Error("Invalid coordinates for timezone lookup.");
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    throw new Error("Coordinates out of range.");
  }

  const url = `https://api.open-meteo.com/v1/timezone?latitude=${encodeURIComponent(
    latNum
  )}&longitude=${encodeURIComponent(lngNum)}`;

  // 6s timeout so the UI doesn't hang forever
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Timezone HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    const tz = data && typeof data.timezone === "string" ? data.timezone : null;

    if (!tz) throw new Error("Timezone not found in response.");
    return tz; // e.g., "Africa/Johannesburg"
  } catch (_err) {
    // Let the component show the red helper text; don't silently mask it.
    throw new Error("Timezone detection failed.");
  } finally {
    clearTimeout(timer);
  }
}
