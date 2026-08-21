// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/update-marketing-consent/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ??
  Deno.env.get("PROJECT_URL") ??
  "";

const SERVICE_ROLE =
  Deno.env.get("SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  "";

/*
 * Current consent wording/version.
 *
 * Increment this only if the marketing consent wording is
 * materially changed in the future.
 */
const CONSENT_VERSION = "v1";

const ALLOWED_SOURCES = new Set([
  "existing_user_popup",
  "settings",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

serve(async (request: Request) => {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Method not allowed. Use POST.",
      },
      405,
    );
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return jsonResponse(
        {
          success: false,
          error: "Missing Supabase server configuration.",
        },
        500,
      );
    }

    /*
     * Authenticate the caller.
     */
    const authorization =
      request.headers.get("Authorization") ?? "";

    const accessToken =
      authorization.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : "";

    if (!accessToken) {
      return jsonResponse(
        {
          success: false,
          error: "Unauthorized: missing access token.",
        },
        401,
      );
    }

    const admin = createClient(
      SUPABASE_URL,
      SERVICE_ROLE,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: userData,
      error: userError,
    } = await admin.auth.getUser(accessToken);

    if (
      userError ||
      !userData?.user?.id
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Unauthorized: invalid user session.",
        },
        401,
      );
    }

    const userId = userData.user.id;

    /*
     * Read and validate request.
     *
     * Expected:
     * {
     *   consent: true | false,
     *   source: "existing_user_popup" | "settings"
     * }
     */
    const body = await request
      .json()
      .catch(() => null);

    if (
      !body ||
      typeof body !== "object"
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid request body.",
        },
        400,
      );
    }

    if (typeof body.consent !== "boolean") {
      return jsonResponse(
        {
          success: false,
          error: "consent must be true or false.",
        },
        400,
      );
    }

    const source =
      typeof body.source === "string"
        ? body.source.trim()
        : "";

    if (!ALLOWED_SOURCES.has(source)) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid consent source.",
        },
        400,
      );
    }

    /*
     * Server controls the timestamp and wording version.
     * The browser cannot supply either.
     */
    const updatedAt = new Date().toISOString();

    const {
      data: profile,
      error: updateError,
    } = await admin
      .from("profiles")
      .update({
        marketing_email_consent: body.consent,
        marketing_email_consent_updated_at: updatedAt,
        marketing_email_consent_source: source,
        marketing_email_consent_version: CONSENT_VERSION,
      })
      .eq("user_id", userId)
      .select(
        `
          marketing_email_consent,
          marketing_email_consent_updated_at,
          marketing_email_consent_source,
          marketing_email_consent_version
        `,
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "update-marketing-consent profile update failed:",
        updateError,
      );

      return jsonResponse(
        {
          success: false,
          error: "Unable to save email preference.",
        },
        500,
      );
    }

    if (!profile) {
      return jsonResponse(
        {
          success: false,
          error: "User profile was not found.",
        },
        404,
      );
    }

    return jsonResponse({
      success: true,

      consent: {
        marketingEmailConsent:
          profile.marketing_email_consent,

        updatedAt:
          profile.marketing_email_consent_updated_at,

        source:
          profile.marketing_email_consent_source,

        version:
          profile.marketing_email_consent_version,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "update-marketing-consent failed:",
      message,
    );

    return jsonResponse(
      {
        success: false,
        error: "Unable to save email preference.",
      },
      500,
    );
  }
});