// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/metoffice-warnings/index.ts
// Proxies Met Office warnings Atom feed + the issued GeoJSON to avoid browser CORS blocks.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type JsonValue = unknown;

function makeCorsHeaders(origin: string | null): HeadersInit {
  // If you want to lock this down later, replace "*" with your Netlify site origin.
  // e.g. "https://your-site.netlify.app"
  const allowOrigin = origin ?? "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",

    // Cache the proxy response briefly (you can increase later)
    "Cache-Control": "public, max-age=60",
  };
}

function jsonResponse(data: JsonValue, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

function pickGeoJsonUrlFromAtom(atomXml: string): string | null {
  const doc = new DOMParser().parseFromString(atomXml, "application/xml");

  // If parsing failed, some browsers/DOM implementations include <parsererror>
  const parserError = doc.getElementsByTagName("parsererror");
  if (parserError && parserError.length > 0) return null;

  const links = Array.from(doc.getElementsByTagName("link"));

  // Prefer rel="related" and href containing "issued"
  const related = links.find((n) => {
    const rel = n.getAttribute("rel") || "";
    const href = n.getAttribute("href") || "";
    return rel === "related" && href.includes("issued");
  });

  return related?.getAttribute("href") || null;
}

function emptyFeatureCollection(note?: string) {
  return {
    type: "FeatureCollection",
    features: [],
    ...(note ? { note } : {}),
  };
}

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const cors = makeCorsHeaders(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // Only allow GET
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405, cors);
  }

  try {
    const url = new URL(req.url);
    const mode = (url.searchParams.get("mode") || "geojson").toLowerCase();
    // mode=atom => return raw atom (debug)
    // mode=geojson => return issued GeoJSON (default)

    // 1) Fetch Atom feed
    const atomRes = await fetch("https://www.metoffice.gov.uk/weather/guides/warnings/atom", {
      headers: { Accept: "application/atom+xml, application/xml, text/xml" },
    });

    if (!atomRes.ok) {
      // Return a valid FeatureCollection so the frontend never breaks
      return jsonResponse(emptyFeatureCollection(`Atom feed failed (${atomRes.status})`), 200, cors);
    }

    const atomText = await atomRes.text();

    if (mode === "atom") {
      return new Response(atomText, {
        status: 200,
        headers: { ...cors, "Content-Type": "application/atom+xml; charset=utf-8" },
      });
    }

    // 2) Extract issued GeoJSON URL from Atom
    const geoUrl = pickGeoJsonUrlFromAtom(atomText);
    if (!geoUrl) {
      return jsonResponse(emptyFeatureCollection("Could not locate issued GeoJSON link in Atom feed."), 200, cors);
    }

    // 3) Fetch GeoJSON
    const geoRes = await fetch(geoUrl, {
      headers: { Accept: "application/geo+json, application/json" },
    });

    if (!geoRes.ok) {
      return jsonResponse(emptyFeatureCollection(`GeoJSON fetch failed (${geoRes.status})`), 200, cors);
    }

    const geoJson = await geoRes.json();

    // GUARANTEE: always return a FeatureCollection (your React code expects this)
    if (!geoJson || geoJson.type !== "FeatureCollection" || !Array.isArray(geoJson.features)) {
      return jsonResponse(emptyFeatureCollection("Upstream did not return a GeoJSON FeatureCollection."), 200, cors);
    }

    return jsonResponse(geoJson, 200, cors);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse(emptyFeatureCollection(message), 200, cors);
  }
});
