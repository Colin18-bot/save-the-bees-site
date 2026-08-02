// supabase/functions/send-test-email/index.ts

/*
 * This declaration is only for the VS Code TypeScript checker.
 * Supabase provides Deno automatically when the function runs.
 */
declare const Deno: {
  serve(
    handler: (
      request: Request
    ) => Response | Promise<Response>
  ): void;

  env: {
    get(name: string): string | undefined;
  };
};

import { sendBrevoTemplateEmail } from "../_shared/brevo.ts";
import { EMAIL_TEMPLATES } from "../_shared/emailTemplates.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed. Use POST.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const apiKey = Deno.env.get("BREVO_API_KEY");

    if (!apiKey) {
      throw new Error(
        "BREVO_API_KEY is not configured in Supabase Edge Function secrets."
      );
    }

    /*
     * For safety, this staging test sends only to the
     * BeezKnees support mailbox.
     */
    const recipientEmail = "support@beezknees.co.uk";
    const recipientName = "Colin";

    const brevoResult = await sendBrevoTemplateEmail(
      {
        templateId: EMAIL_TEMPLATES.WELCOME,

        to: {
          email: recipientEmail,
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
      apiKey
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Test welcome email sent to ${recipientEmail}.`,
        brevo: brevoResult,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("send-test-email failed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});