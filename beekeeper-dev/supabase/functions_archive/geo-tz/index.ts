// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/geo-tz/index.ts
// POST or GET with { lat, lng } (body JSON for POST; query string for GET)
// Returns: { timezone: "America/New_York" }

import { serve } from "std/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

type Coord = number;

function parseCoord(v: unknown, min: number, max: number, name: string): Coord {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) throw new Error(`${name} must be a number`);
  if (n < min || n > max) throw new Error(`${name} out of range`);
  return n;
}

async function lookupTimezone(lat: number, lng: number): Promise<string> {
  // Use Open-Meteo's free timezone endpoint server-side (no CORS issues here)
  const url = `https://api.open-meteo.com/v1/timezone?latitude=${encodeURIComponent(
    lat
  )}&longitude=${encodeURIComponent(lng)}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Upstream timezone service failed: ${resp.status} ${text}`.trim());
  }
  const data = await resp.json();
  const tz = data?.timezone;
  if (!tz || typeof tz !== "string") throw new Error("No timezone in response");
  return tz;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let lat: unknown;
    let lng: unknown;

    if (req.method === "GET") {
      const url = new URL(req.url);
      lat = url.searchParams.get("lat");
      lng = url.searchParams.get("lng");
    } else {
      const body = await req.json().catch(() => ({}));
      lat = body.lat ?? body.latitude;
      lng = body.lng ?? body.longitude;
    }

    const latNum = parseCoord(lat, -90, 90, "lat");
    const lngNum = parseCoord(lng, -180, 180, "lng");

    const timezone = await lookupTimezone(latNum, lngNum);

    return new Response(JSON.stringify({ timezone }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
