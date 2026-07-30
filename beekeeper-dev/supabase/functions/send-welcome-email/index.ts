// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/send-welcome-email/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendBrevoTemplateEmail } from "../_shared/brevo.ts";
import { EMAIL_TEMPLATES } from "../_shared/emailTemplates.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY") ??
  "";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";

function jsonResponse(
  req: Request,
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      req,
      {
        success: false,
        error: "Method not allowed. Use POST.",
      },
      405,
    );
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error(
        "The Supabase Edge Function environment is not configured correctly.",
      );
    }

    if (!BREVO_API_KEY) {
      throw new Error(
        "BREVO_API_KEY is not configured in Edge Function secrets.",
      );
    }

    /*
     * Read and verify the logged-in user's access token.
     */
    const authHeader = req.headers.get("Authorization") ?? "";

    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!accessToken) {
      return jsonResponse(
        req,
        {
          success: false,
          error: "Authentication is required.",
        },
        401,
      );
    }

    /*
     * The service-role client is used only on the server.
     * The caller's JWT is still verified before any profile is accessed.
     */
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return jsonResponse(
        req,
        {
          success: false,
          error: "The authenticated user could not be verified.",
        },
        401,
      );
    }

    if (!user.email) {
      return jsonResponse(
        req,
        {
          success: false,
          error: "No email address is associated with this account.",
        },
        400,
      );
    }

    /*
     * Find the user's profile.
     */
    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "user_id, email, subscription_level, welcome_email_sent_at",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(
        `Unable to read the user profile: ${profileError.message}`,
      );
    }

    if (!profile) {
      return jsonResponse(
        req,
        {
          success: false,
          error:
            "The user profile does not exist yet. Create the profile before sending the Welcome email.",
        },
        409,
      );
    }

    /*
     * Do not send C01 more than once.
     */
    if (profile.welcome_email_sent_at) {
      return jsonResponse(req, {
        success: true,
        sent: false,
        alreadySent: true,
        message: "The Welcome email has already been sent.",
      });
    }

    /*
     * Google users may have a name in their user metadata.
     * Email/password users will usually fall back to the part
     * before the @ symbol.
     */
    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.trim()
        : "";

    const givenName =
      typeof user.user_metadata?.given_name === "string"
        ? user.user_metadata.given_name.trim()
        : "";

    const firstName =
      typeof user.user_metadata?.first_name === "string"
        ? user.user_metadata.first_name.trim()
        : "";

    const recipientName =
      firstName ||
      givenName ||
      fullName.split(" ")[0] ||
      user.email.split("@")[0] ||
      "Beekeeper";

    /*
     * Send Brevo template C01.
     */
    const brevoResult = await sendBrevoTemplateEmail(
      {
        templateId: EMAIL_TEMPLATES.WELCOME,

        to: {
          email: user.email,
          name: recipientName,
        },

        params: {
          customer_name: recipientName,
        },

        replyTo: {
          email: "support@beezknees.co.uk",
          name: "HiveTag",
        },
      },
      BREVO_API_KEY,
    );

    /*
     * Record that Brevo accepted the Welcome email.
     */
    const sentAt = new Date().toISOString();

    const {
      data: updatedProfiles,
      error: updateError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        welcome_email_sent_at: sentAt,
        updated_at: sentAt,
      })
      .eq("user_id", user.id)
      .is("welcome_email_sent_at", null)
      .select("user_id");

    if (updateError) {
      throw new Error(
        `The email was sent, but the profile could not be updated: ${updateError.message}`,
      );
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      console.warn(
        `Welcome email was accepted by Brevo, but the sent timestamp was not updated for user ${user.id}.`,
      );
    }

    return jsonResponse(req, {
      success: true,
      sent: true,
      alreadySent: false,
      message: "Welcome email sent successfully.",
      brevo: brevoResult,
    });
  } catch (error) {
    console.error("send-welcome-email failed:", error);

    return jsonResponse(
      req,
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred.",
      },
      500,
    );
  }
});