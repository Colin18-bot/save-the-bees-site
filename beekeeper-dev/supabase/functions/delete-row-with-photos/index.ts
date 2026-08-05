// supabase/functions/delete-row-with-photos/index.ts
// @ts-nocheck
// deno-lint-ignore-file

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type TableName = "apiaries" | "hives" | "logbook" | "inspections";
type Mode = "clear_photo" | "delete_row";
type RemoveOne = { path?: string; url?: string };

type DeleteBody = {
  table: TableName;
  id: string;
  mode: Mode;
  removeOne?: RemoveOne;
};

type CfgSingle = {
  userCol: "user_id";
  urlCol: "photo_url";
  pathCol: "photo_path";
};

type CfgMulti = {
  userCol: "user_id";
  urlsCol: "photos";
  pathsCol: "photo_paths";
};

type TableCfg = CfgSingle | CfgMulti;

const TABLES: Record<TableName, TableCfg> = {
  apiaries: {
    userCol: "user_id",
    urlCol: "photo_url",
    pathCol: "photo_path",
  },
  hives: {
    userCol: "user_id",
    urlCol: "photo_url",
    pathCol: "photo_path",
  },
  logbook: {
    userCol: "user_id",
    urlCol: "photo_url",
    pathCol: "photo_path",
  },
  inspections: {
    userCol: "user_id",
    urlsCol: "photos",
    pathsCol: "photo_paths",
  },
};

const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim();
const SERVICE_ROLE = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];
}

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function parsePublicUrl(url: string | null | undefined) {
  if (!url) return null;

  const clean = String(url).split("?")[0];
  const match = clean.match(/\/object\/public\/([^/]+)\/(.+)$/);

  if (!match) return null;

  return {
    bucket: match[1],
    path: decodeURIComponent(match[2]),
  };
}

function get(record: Record<string, unknown>, key: string): unknown {
  return record[key];
}

function isTableName(value: unknown): value is TableName {
  return (
    value === "apiaries" ||
    value === "hives" ||
    value === "logbook" ||
    value === "inspections"
  );
}

function isMode(value: unknown): value is Mode {
  return value === "clear_photo" || value === "delete_row";
}

function isDeleteBody(value: unknown): value is DeleteBody {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;

  if (!isTableName(body.table)) return false;
  if (typeof body.id !== "string" || !body.id) return false;
  if (!isMode(body.mode)) return false;

  if (body.removeOne === undefined) return true;
  if (!body.removeOne || typeof body.removeOne !== "object") return false;

  const removeOne = body.removeOne as Record<string, unknown>;
  const pathOk =
    removeOne.path === undefined || typeof removeOne.path === "string";
  const urlOk =
    removeOne.url === undefined || typeof removeOne.url === "string";

  return pathOk && urlOk;
}

async function removeStorageObjects(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  paths: string[],
) {
  const uniquePaths = uniq(paths);

  if (!uniquePaths.length) {
    return {
      deleted: [],
      warning: null,
    };
  }

  const { error } = await admin.storage.from(bucket).remove(uniquePaths);

  if (error) {
    return {
      deleted: [],
      warning: `The database change succeeded, but photo cleanup failed: ${error.message}`,
    };
  }

  return {
    deleted: uniquePaths,
    warning: null,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return json(500, {
        error: "Missing SUPABASE envs",
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!jwt) {
      return json(401, {
        error: "Missing Authorization bearer token",
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userResult, error: userError } =
      await admin.auth.getUser(jwt);

    if (userError || !userResult?.user) {
      return json(401, {
        error: "Invalid user session",
      });
    }

    const uid = userResult.user.id;

    const raw = (await req.json().catch(() => null)) as unknown;

    if (!isDeleteBody(raw)) {
      return json(400, {
        error: "Missing/invalid {table,id,mode}",
      });
    }

    const { table, id, mode, removeOne } = raw;
    const config = TABLES[table];
    const bucket = "photos";

    // Fetch the row first so ownership and photo paths are verified before
    // any database or storage change is attempted.
    let row: Record<string, unknown> | null = null;

    if (table === "inspections") {
      const urlsKey = (config as CfgMulti).urlsCol;
      const pathsKey = (config as CfgMulti).pathsCol;
      const columnsWithPaths = `${config.userCol}, ${urlsKey}, ${pathsKey}`;
      const columnsWithoutPaths = `${config.userCol}, ${urlsKey}`;

      let result = await admin
        .from(table)
        .select(columnsWithPaths)
        .eq("id", id)
        .maybeSingle();

      if (
        result.error &&
        /column .*photo_paths.* does not exist/i.test(
          result.error.message || "",
        )
      ) {
        result = await admin
          .from(table)
          .select(columnsWithoutPaths)
          .eq("id", id)
          .maybeSingle();
      }

      if (result.error) {
        return json(500, {
          error: result.error.message,
        });
      }

      if (!result.data) {
        return json(404, {
          error: "Row not found",
        });
      }

      row = result.data as Record<string, unknown>;
    } else {
      const urlKey = (config as CfgSingle).urlCol;
      const pathKey = (config as CfgSingle).pathCol;
      const columnsWithPath = `${config.userCol}, ${urlKey}, ${pathKey}`;
      const columnsWithoutPath = `${config.userCol}, ${urlKey}`;

      let result = await admin
        .from(table)
        .select(columnsWithPath)
        .eq("id", id)
        .maybeSingle();

      if (
        result.error &&
        /column .*photo_path.* does not exist/i.test(
          result.error.message || "",
        )
      ) {
        result = await admin
          .from(table)
          .select(columnsWithoutPath)
          .eq("id", id)
          .maybeSingle();
      }

      if (result.error) {
        return json(500, {
          error: result.error.message,
        });
      }

      if (!result.data) {
        return json(404, {
          error: "Row not found",
        });
      }

      row = result.data as Record<string, unknown>;
    }

    if (String(get(row, "user_id") ?? "") !== uid) {
      return json(403, {
        error: "Forbidden",
      });
    }

    let pathsToDelete: string[] = [];

    if (table === "inspections") {
      const urlsKey = (config as CfgMulti).urlsCol;
      const pathsKey = (config as CfgMulti).pathsCol;

      const storedUrls = asStringArray(get(row, urlsKey));
      const storedPaths = asStringArray(get(row, pathsKey));

      if (removeOne?.path || removeOne?.url) {
        const fromUrl = removeOne.url
          ? parsePublicUrl(removeOne.url)
          : null;

        const onePath =
          removeOne.path ||
          (fromUrl?.bucket === bucket ? fromUrl.path : null);

        if (!onePath) {
          return json(400, {
            error:
              "removeOne provided but no valid {path|url} resolved",
          });
        }

        const allowedPaths = new Set(storedPaths);

        for (const url of storedUrls) {
          const parsed = parsePublicUrl(url);

          if (parsed?.bucket === bucket) {
            allowedPaths.add(parsed.path);
          }
        }

        if (!allowedPaths.has(onePath)) {
          return json(403, {
            error:
              "Forbidden: photo does not belong to this inspection",
          });
        }

        const newPaths = storedPaths.filter(
          (path) => path !== onePath,
        );

        const newUrls = storedUrls.filter((url) => {
          const parsed = parsePublicUrl(url);

          return !(
            parsed?.bucket === bucket &&
            parsed.path === onePath
          );
        });

        const patch: Record<string, unknown> = {
          [urlsKey]: newUrls,
        };

        if (pathsKey in row) {
          patch[pathsKey] = newPaths;
        }

        // Update the database first. This prevents a failed database update
        // from leaving an inspection pointing to a photo that was deleted.
        const { error: updateError } = await admin
          .from(table)
          .update(patch)
          .eq("id", id)
          .eq("user_id", uid);

        if (updateError) {
          return json(500, {
            error: `DB update failed: ${updateError.message}`,
          });
        }

        const cleanup = await removeStorageObjects(
          admin,
          bucket,
          [onePath],
        );

        return json(200, {
          ok: true,
          mode: "remove_one",
          deleted: cleanup.deleted,
          warning: cleanup.warning,
        });
      }

      pathsToDelete = storedPaths.slice();

      if (!pathsToDelete.length && storedUrls.length) {
        for (const url of storedUrls) {
          const parsed = parsePublicUrl(url);

          if (parsed?.bucket === bucket) {
            pathsToDelete.push(parsed.path);
          }
        }
      }
    } else {
      const urlKey = (config as CfgSingle).urlCol;
      const pathKey = (config as CfgSingle).pathCol;

      const storedPath = get(row, pathKey);
      const storedUrl = get(row, urlKey);

      if (typeof storedPath === "string" && storedPath) {
        pathsToDelete.push(storedPath);
      } else if (
        typeof storedUrl === "string" &&
        storedUrl
      ) {
        const parsed = parsePublicUrl(storedUrl);

        if (parsed?.bucket === bucket) {
          pathsToDelete.push(parsed.path);
        }
      }
    }

    pathsToDelete = uniq(pathsToDelete);

    if (mode === "clear_photo") {
      if (table === "inspections") {
        const urlsKey = (config as CfgMulti).urlsCol;
        const pathsKey = (config as CfgMulti).pathsCol;

        const patch: Record<string, unknown> = {
          [urlsKey]: [],
        };

        if (pathsKey in row) {
          patch[pathsKey] = [];
        }

        const { error: updateError } = await admin
          .from(table)
          .update(patch)
          .eq("id", id)
          .eq("user_id", uid);

        if (updateError) {
          return json(500, {
            error: `DB update failed: ${updateError.message}`,
          });
        }
      } else {
        const urlKey = (config as CfgSingle).urlCol;
        const pathKey = (config as CfgSingle).pathCol;

        const patch: Record<string, unknown> = {
          [urlKey]: null,
          [pathKey]: null,
        };

        const { error: updateError } = await admin
          .from(table)
          .update(patch)
          .eq("id", id)
          .eq("user_id", uid);

        if (updateError) {
          return json(500, {
            error: `DB update failed: ${updateError.message}`,
          });
        }
      }

      const cleanup = await removeStorageObjects(
        admin,
        bucket,
        pathsToDelete,
      );

      return json(200, {
        ok: true,
        mode,
        deleted: cleanup.deleted,
        warning: cleanup.warning,
      });
    }

    // For hives, the database function removes hive-specific Queen history
    // and deletes only Queen records that have become genuinely orphaned.
    if (table === "hives") {
      const { data: deleteResult, error: deleteError } =
        await admin.rpc("delete_hive_with_queen_cleanup", {
          p_hive_id: id,
          p_user_id: uid,
        });

      if (deleteError) {
        return json(500, {
          error: `Hive delete failed: ${deleteError.message}`,
        });
      }

      const cleanup = await removeStorageObjects(
        admin,
        bucket,
        pathsToDelete,
      );

      return json(200, {
        ok: true,
        mode,
        result: deleteResult,
        deleted: cleanup.deleted,
        warning: cleanup.warning,
      });
    }

    // Other supported rows are deleted before storage cleanup. If a foreign
    // key blocks deletion, the photo remains untouched.
    const { error: deleteRowError } = await admin
      .from(table)
      .delete()
      .eq("id", id)
      .eq("user_id", uid);

    if (deleteRowError) {
      return json(500, {
        error: `Row delete failed: ${deleteRowError.message}`,
      });
    }

    const cleanup = await removeStorageObjects(
      admin,
      bucket,
      pathsToDelete,
    );

    return json(200, {
      ok: true,
      mode,
      deleted: cleanup.deleted,
      warning: cleanup.warning,
    });
  } catch (error) {
    return json(500, {
      error: String(error),
    });
  }
});