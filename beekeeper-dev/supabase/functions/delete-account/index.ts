// @ts-nocheck
// deno-lint-ignore-file
// supabase/functions/delete-account/index.ts
//
// Main account-deletion orchestrator:
// 1. Verifies the authenticated user
// 2. Cancels an active Stripe subscription where applicable
// 3. Deletes owned Storage files
// 4. Deletes owned database records
// 5. Deletes the Supabase Auth user
// 6. Sends Brevo C07 – Account Deleted
//
// Defaults to DRY RUN unless { dryRun: false } is sent
// or ?dryRun=false is included in the request URL.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

import { corsHeaders } from "../_shared/cors.ts";
import { sendBrevoTemplateEmail } from "../_shared/brevo.ts";
import { EMAIL_TEMPLATES } from "../_shared/emailTemplates.ts";

// Load local environment files during local development.
// These calls are harmless in deployed Supabase Edge Functions.
await load({
  envPath: ".env.local",
  export: true,
}).catch(() => {});

await load({
  envPath: ".env",
  export: true,
}).catch(() => {});

// -----------------------------------------------------------------------------
// Environment
// -----------------------------------------------------------------------------

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ??
  Deno.env.get("PROJECT_URL") ??
  "";

const SERVICE_ROLE =
  Deno.env.get("SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  "";

const STRIPE_SECRET_KEY =
  Deno.env.get("STRIPE_SECRET_KEY") ??
  Deno.env.get("STRIPE_API_KEY") ??
  "";

const BREVO_API_KEY =
  Deno.env.get("BREVO_API_KEY") ??
  "";

// -----------------------------------------------------------------------------
// Response helpers
// -----------------------------------------------------------------------------

function jsonResponse(
  body: unknown,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function restHeaders(
  extra?: Record<string, string>,
) {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    Accept: "application/json",
    Prefer: "count=exact",
    ...(extra ?? {}),
  };
}

function parseTotal(response: Response): number {
  const contentRange =
    response.headers.get("content-range") ?? "";

  const match = contentRange.match(/\/(\d+)$/);

  return match
    ? Number.parseInt(match[1], 10)
    : 0;
}

// -----------------------------------------------------------------------------
// User-owned database tables
//
// The profile is deliberately deleted last.
// -----------------------------------------------------------------------------

const DELETE_ORDER: Array<{
  table: string;
  columns: string[];
}> = [
  {
    table: "sales_lines",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "sales_orders",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "inspections",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "logbook",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "todos",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "inventory_items",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "expenses",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "hives",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "apiaries",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "site_settings",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "location_types",
    columns: ["user_id", "owner_id"],
  },
  {
    table: "profiles",
    columns: ["user_id", "id"],
  },
];

// -----------------------------------------------------------------------------
// Storage helpers
// -----------------------------------------------------------------------------

async function listOwnedStorage(
  userId: string,
) {
  const query = new URLSearchParams({
    select: "name,bucket_id,owner,created_at",
    bucket_id: "eq.photos",
    owner: `eq.${userId}`,
    order: "created_at.desc",
  });

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/storage_objects?${query.toString()}`,
    {
      headers: restHeaders(),
    },
  );

  if (!response.ok) {
    const responseText = await response.text();

    return {
      ok: false,
      error:
        `Storage listing failed (${response.status}): ${responseText}`,
      paths: [] as string[],
    };
  }

  const rows = await response.json() as Array<{
    name: string;
  }>;

  return {
    ok: true,
    error: null,
    paths: rows.map((row) => row.name),
  };
}

async function deleteStorageFiles(
  paths: string[],
) {
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

  const bucket = admin.storage.from("photos");

  let deleted = 0;

  for (let index = 0; index < paths.length; index += 100) {
    const batch = paths.slice(index, index + 100);

    const { error } = await bucket.remove(batch);

    if (error) {
      return {
        ok: false,
        deleted,
        error: error.message,
      };
    }

    deleted += batch.length;
  }

  return {
    ok: true,
    deleted,
    error: null,
  };
}

// -----------------------------------------------------------------------------
// Database helpers
// -----------------------------------------------------------------------------

async function discoverOwnedRows(
  table: string,
  possibleColumns: string[],
  userId: string,
) {
  for (const column of possibleColumns) {
    const query = new URLSearchParams({
      select: "id",
      [column]: `eq.${userId}`,
    });

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?${query.toString()}`,
      {
        headers: restHeaders({
          Range: "0-0",
        }),
      },
    );

    if (response.ok) {
      return {
        column,
        count: parseTotal(response),
      };
    }
  }

  return {
    column: null as string | null,
    count: 0,
  };
}

async function deleteOwnedRows(
  table: string,
  column: string,
  userId: string,
) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${userId}`,
    {
      method: "DELETE",
      headers: restHeaders({
        Prefer: "return=representation",
      }),
    },
  );

  if (!response.ok) {
    const responseText = await response.text();

    return {
      ok: false,
      status: response.status,
      error: responseText,
      deleted: 0,
    };
  }

  const rows = await response
    .json()
    .catch(() => []);

  return {
    ok: true,
    status: response.status,
    error: null,
    deleted: Array.isArray(rows)
      ? rows.length
      : 0,
  };
}

// -----------------------------------------------------------------------------
// Brevo helper
// -----------------------------------------------------------------------------

async function sendAccountDeletedEmail(
  email: string,
  name: string,
) {
  if (!email) {
    return {
      sent: false,
      error:
        "The deleted account did not have an email address.",
    };
  }

  if (!BREVO_API_KEY) {
    return {
      sent: false,
      error:
        "BREVO_API_KEY is not configured.",
    };
  }

  try {
    const recipientName =
      name ||
      email.split("@")[0] ||
      "Beekeeper";

    const brevoResult =
      await sendBrevoTemplateEmail(
        {
          templateId:
            EMAIL_TEMPLATES.ACCOUNT_DELETED,

          to: {
            email,
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

    return {
      sent: true,
      result: brevoResult,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "Account deletion succeeded, but C07 could not be sent:",
      message,
    );

    return {
      sent: false,
      error: message,
    };
  }
}

// -----------------------------------------------------------------------------
// Function
// -----------------------------------------------------------------------------

serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error:
          "Method not allowed. Use POST.",
      },
      405,
    );
  }

  try {
    if (!SUPABASE_URL) {
      return jsonResponse(
        {
          error:
            "Missing SUPABASE_URL in function environment.",
        },
        500,
      );
    }

    if (!SERVICE_ROLE) {
      return jsonResponse(
        {
          error:
            "Missing Supabase service-role key in function environment.",
        },
        500,
      );
    }

    const requestUrl = new URL(request.url);

    // Safe environment diagnostics.
    if (
      requestUrl.searchParams.get("diag") === "1"
    ) {
      return jsonResponse({
        environment: {
          supabaseUrlPresent:
            Boolean(SUPABASE_URL),

          serviceRolePresent:
            Boolean(SERVICE_ROLE),

          stripeSecretPresent:
            Boolean(STRIPE_SECRET_KEY),

          brevoApiKeyPresent:
            Boolean(BREVO_API_KEY),
        },
      });
    }

    const requestBody = await request
      .json()
      .catch(() => ({})) as Record<
        string,
        unknown
      >;

    const immediate =
      requestBody.immediate === true;

    /*
     * Dry-run remains the default safety behaviour.
     *
     * A real deletion requires:
     * body: { dryRun: false }
     *
     * or:
     * ?dryRun=false
     */
    let dryRun =
      requestUrl.searchParams.get("dryRun") !==
      "false";

    if (
      typeof requestBody.dryRun === "boolean"
    ) {
      dryRun = requestBody.dryRun;
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

    // -------------------------------------------------------------------------
    // Authenticate caller
    // -------------------------------------------------------------------------

    const authorization =
      request.headers.get("Authorization") ?? "";

    const accessToken =
      authorization.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : "";

    if (!accessToken) {
      return jsonResponse(
        {
          error:
            "Unauthorized: missing access token.",
        },
        401,
      );
    }

    const {
      data: userData,
      error: userError,
    } = await admin.auth.getUser(
      accessToken,
    );

    if (
      userError ||
      !userData?.user?.id
    ) {
      return jsonResponse(
        {
          error:
            "Unauthorized: invalid user session.",
        },
        401,
      );
    }

    const user = userData.user;
    const userId = user.id;
    const userEmail = user.email ?? "";

    const metadataFullName =
      typeof user.user_metadata?.full_name ===
        "string"
        ? user.user_metadata.full_name.trim()
        : "";

    const metadataGivenName =
      typeof user.user_metadata?.given_name ===
        "string"
        ? user.user_metadata.given_name.trim()
        : "";

    const userName =
      metadataGivenName ||
      metadataFullName ||
      userEmail.split("@")[0] ||
      "Beekeeper";

    // -------------------------------------------------------------------------
    // Read profile before any records are deleted
    // -------------------------------------------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await admin
      .from("profiles")
      .select(
        "stripe_customer_id, subscription_level, subscription_status",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      return jsonResponse(
        {
          error:
            `Unable to read the user profile: ${profileError.message}`,
        },
        500,
      );
    }

    // -------------------------------------------------------------------------
    // Prepare Stripe result
    // -------------------------------------------------------------------------

    let stripeResult: Record<
      string,
      unknown
    > = {
      skipped: true,
      note:
        STRIPE_SECRET_KEY
          ? "Dry run or no active subscription."
          : "No Stripe secret key configured.",
    };

    /*
     * Stripe is only called during a real deletion.
     */
    if (
      STRIPE_SECRET_KEY &&
      !dryRun &&
      profile?.stripe_customer_id
    ) {
      const { default: Stripe } =
        await import(
          "npm:stripe@12.18.0"
        );

      const stripe = new Stripe(
        STRIPE_SECRET_KEY,
        {
          apiVersion: "2022-11-15",
        },
      );

      const subscriptions =
        await stripe.subscriptions.list({
          customer:
            profile.stripe_customer_id,
          status: "active",
          limit: 1,
        });

      const subscription =
        subscriptions.data[0];

      if (subscription) {
        /*
         * A deleted account should not retain a live subscription.
         * Therefore a real account deletion cancels immediately.
         *
         * The immediate field is retained in the response for
         * compatibility with the existing frontend request.
         */
        await stripe.subscriptions.cancel(
          subscription.id,
        );

        stripeResult = {
          skipped: false,
          immediate: true,
          requestedImmediate: immediate,
          subscription:
            subscription.id,
          cancelled: true,
        };
      } else {
        stripeResult = {
          skipped: false,
          note:
            "No active Stripe subscription was found.",
        };
      }
    } else if (
      !dryRun &&
      !profile?.stripe_customer_id
    ) {
      stripeResult = {
        skipped: true,
        note:
          "No Stripe customer is associated with this account.",
      };
    }

    // -------------------------------------------------------------------------
    // Prepare Storage and database deletion plan
    // -------------------------------------------------------------------------

    const storageList =
      await listOwnedStorage(userId);

    if (!storageList.ok) {
      return jsonResponse(
        {
          error: storageList.error,
        },
        500,
      );
    }

    const deletionPlan: Array<{
      table: string;
      column: string | null;
      preCount: number;
      action: "skip" | "delete";
      result?:
        | {
            deleted: number;
          }
        | {
            error: string;
            status: number;
          };
    }> = [];

    for (const tableDefinition of DELETE_ORDER) {
      const discovery =
        await discoverOwnedRows(
          tableDefinition.table,
          tableDefinition.columns,
          userId,
        );

      deletionPlan.push({
        table:
          tableDefinition.table,

        column:
          discovery.column,

        preCount:
          discovery.count,

        action:
          discovery.count > 0 &&
          discovery.column
            ? "delete"
            : "skip",
      });
    }

    // -------------------------------------------------------------------------
    // Dry run
    // -------------------------------------------------------------------------

    if (dryRun) {
      return jsonResponse({
        dryRun: true,
        userId,

        stripe:
          STRIPE_SECRET_KEY
            ? {
                wouldCheckStripe: true,
                customerId:
                  profile
                    ?.stripe_customer_id ??
                  null,
              }
            : {
                skipped: true,
                note:
                  "No Stripe secret key configured.",
              },

        storage: {
          count:
            storageList.paths.length,
          paths:
            storageList.paths,
        },

        database:
          deletionPlan,

        email: {
          wouldSend:
            Boolean(
              userEmail &&
                BREVO_API_KEY,
            ),

          templateId:
            EMAIL_TEMPLATES
              .ACCOUNT_DELETED,
        },

        authentication: {
          wouldDelete: true,
        },
      });
    }

    // -------------------------------------------------------------------------
    // Real deletion: Storage
    // -------------------------------------------------------------------------

    const storageDeletion =
      await deleteStorageFiles(
        storageList.paths,
      );

    if (!storageDeletion.ok) {
      return jsonResponse(
        {
          error:
            "Storage deletion failed.",

          storage:
            storageDeletion,
        },
        500,
      );
    }

    // -------------------------------------------------------------------------
    // Real deletion: Database rows
    // -------------------------------------------------------------------------

    for (const step of deletionPlan) {
      if (
        step.action === "delete" &&
        step.column
      ) {
        const deletion =
          await deleteOwnedRows(
            step.table,
            step.column,
            userId,
          );

        step.result =
          deletion.ok
            ? {
                deleted:
                  deletion.deleted,
              }
            : {
                error:
                  deletion.error ??
                  "Unknown database deletion error.",

                status:
                  deletion.status,
              };

        if (!deletion.ok) {
          return jsonResponse(
            {
              error:
                "Database deletion failed.",

              failedAt:
                step,

              storage:
                storageDeletion,

              database:
                deletionPlan,
            },
            500,
          );
        }
      }
    }

    // -------------------------------------------------------------------------
    // Real deletion: Supabase Auth user
    // -------------------------------------------------------------------------

    const {
      error: authDeleteError,
    } =
      await admin.auth.admin.deleteUser(
        userId,
      );

    let authDeleted = true;
    let authAlreadyDeleted = false;

    if (authDeleteError) {
      const authMessage =
        authDeleteError.message ?? "";

      const userAlreadyGone =
        /user\s*not\s*found/i.test(
          authMessage,
        ) ||
        /not\s*found/i.test(
          authMessage,
        );

      if (!userAlreadyGone) {
        return jsonResponse(
          {
            error:
              `Authentication deletion failed: ${authMessage}`,

            stripe:
              stripeResult,

            storage:
              storageDeletion,

            database:
              deletionPlan,
          },
          500,
        );
      }

      authDeleted = false;
      authAlreadyDeleted = true;
    }

    // -------------------------------------------------------------------------
    // Send Brevo C07 after deletion has succeeded
    // -------------------------------------------------------------------------

    const accountDeletedEmail =
      await sendAccountDeletedEmail(
        userEmail,
        userName,
      );

    /*
     * An email-delivery problem does not reverse a successful
     * account deletion. The result is returned for logging and
     * troubleshooting.
     */
    return jsonResponse({
      success: true,
      dryRun: false,
      userId,

      stripe:
        stripeResult,

      storage:
        storageDeletion,

      database:
        deletionPlan,

      authentication: {
        deleted:
          authDeleted,

        alreadyDeleted:
          authAlreadyDeleted,
      },

      email:
        accountDeletedEmail,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "delete-account failed:",
      message,
    );

    return jsonResponse(
      {
        success: false,
        error: message,
      },
      500,
    );
  }
});