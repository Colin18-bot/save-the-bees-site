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
type DbRow = Record<string, unknown>;

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

function chunk<T>(values: T[], size = 100): T[][] {
  const output: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }

  return output;
}

function parseStorageUrl(url: string | null | undefined) {
  if (!url) return null;

  const clean = String(url).split("?")[0];
  const match = clean.match(/\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);

  if (!match) return null;

  return {
    bucket: match[1],
    path: decodeURIComponent(match[2]),
  };
}

function get(record: DbRow, key: string): unknown {
  return record[key];
}

function isMissingColumn(error: unknown, column: string) {
  const message = String((error as { message?: string })?.message || "");
  return new RegExp(`column .*${column}.* does not exist`, "i").test(message);
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

function addSinglePhotoPaths(
  target: string[],
  rows: DbRow[],
  bucket: string,
) {
  for (const row of rows) {
    const storedPath = get(row, "photo_path");
    const storedUrl = get(row, "photo_url");

    if (typeof storedPath === "string" && storedPath) {
      target.push(storedPath);
    }

    if (typeof storedUrl === "string" && storedUrl) {
      const parsed = parseStorageUrl(storedUrl);

      if (parsed?.bucket === bucket) {
        target.push(parsed.path);
      }
    }
  }
}

function addInspectionPhotoPaths(
  target: string[],
  rows: DbRow[],
  bucket: string,
) {
  for (const row of rows) {
    target.push(...asStringArray(get(row, "photo_paths")));

    for (const url of asStringArray(get(row, "photos"))) {
      const parsed = parseStorageUrl(url);

      if (parsed?.bucket === bucket) {
        target.push(parsed.path);
      }
    }
  }
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

async function selectSinglePhotoRows(
  admin: ReturnType<typeof createClient>,
  table: "apiaries" | "hives" | "logbook",
  configure: (query: any) => any,
): Promise<{ rows: DbRow[]; error: unknown | null }> {
  let result = await configure(
    admin.from(table).select("id, user_id, photo_url, photo_path"),
  );

  if (result.error && isMissingColumn(result.error, "photo_path")) {
    result = await configure(
      admin.from(table).select("id, user_id, photo_url"),
    );
  }

  return {
    rows: (result.data || []) as DbRow[],
    error: result.error || null,
  };
}

async function selectInspectionPhotoRows(
  admin: ReturnType<typeof createClient>,
  configure: (query: any) => any,
): Promise<{ rows: DbRow[]; error: unknown | null }> {
  let result = await configure(
    admin.from("inspections").select("id, user_id, photos, photo_paths"),
  );

  if (result.error && isMissingColumn(result.error, "photo_paths")) {
    result = await configure(
      admin.from("inspections").select("id, user_id, photos"),
    );
  }

  return {
    rows: (result.data || []) as DbRow[],
    error: result.error || null,
  };
}

async function fetchOwnedTargetRow(
  admin: ReturnType<typeof createClient>,
  table: TableName,
  id: string,
): Promise<{ row: DbRow | null; error: unknown | null }> {
  if (table === "inspections") {
    let result = await admin
      .from(table)
      .select("user_id, photos, photo_paths")
      .eq("id", id)
      .maybeSingle();

    if (result.error && isMissingColumn(result.error, "photo_paths")) {
      result = await admin
        .from(table)
        .select("user_id, photos")
        .eq("id", id)
        .maybeSingle();
    }

    return {
      row: (result.data || null) as DbRow | null,
      error: result.error || null,
    };
  }

  const config = TABLES[table] as CfgSingle;
  const columnsWithPath = `${config.userCol}, ${config.urlCol}, ${config.pathCol}`;
  const columnsWithoutPath = `${config.userCol}, ${config.urlCol}`;

  let result = await admin
    .from(table)
    .select(columnsWithPath)
    .eq("id", id)
    .maybeSingle();

  if (result.error && isMissingColumn(result.error, config.pathCol)) {
    result = await admin
      .from(table)
      .select(columnsWithoutPath)
      .eq("id", id)
      .maybeSingle();
  }

  return {
    row: (result.data || null) as DbRow | null,
    error: result.error || null,
  };
}

function collectInspectionDeletePaths(
  targetRow: DbRow,
  bucket: string,
) {
  const paths: string[] = [];

  // Permanent inspection deletion removes only the inspection and its own
  // photographs. Linked tasks and logbook entries are preserved by the
  // database RPC and have their inspection_id cleared, so their photographs
  // must remain untouched.
  addInspectionPhotoPaths(paths, [targetRow], bucket);

  return uniq(paths);
}

async function collectApiaryDeletePaths(
  admin: ReturnType<typeof createClient>,
  apiaryId: string,
  uid: string,
  targetRow: DbRow,
  bucket: string,
) {
  const paths: string[] = [];
  addSinglePhotoPaths(paths, [targetRow], bucket);

  const hiveResult = await selectSinglePhotoRows(
    admin,
    "hives",
    (query) => query.eq("user_id", uid).eq("apiary_id", apiaryId),
  );

  if (hiveResult.error) {
    throw new Error(
      `Could not collect hive photos: ${(hiveResult.error as { message?: string })?.message || String(hiveResult.error)}`,
    );
  }

  addSinglePhotoPaths(paths, hiveResult.rows, bucket);
  const hiveIds = uniq(
    hiveResult.rows
      .map((row) => String(get(row, "id") || ""))
      .filter(Boolean),
  );

  const inspectionsById = new Map<string, DbRow>();

  const directInspectionResult = await selectInspectionPhotoRows(
    admin,
    (query) => query.eq("user_id", uid).eq("apiary_id", apiaryId),
  );

  if (directInspectionResult.error) {
    throw new Error(
      `Could not collect inspection photos: ${(directInspectionResult.error as { message?: string })?.message || String(directInspectionResult.error)}`,
    );
  }

  for (const row of directInspectionResult.rows) {
    inspectionsById.set(String(get(row, "id")), row);
  }

  for (const hiveIdChunk of chunk(hiveIds)) {
    const linkedInspectionResult = await selectInspectionPhotoRows(
      admin,
      (query) => query.eq("user_id", uid).in("hive_id", hiveIdChunk),
    );

    if (linkedInspectionResult.error) {
      throw new Error(
        `Could not collect hive inspection photos: ${(linkedInspectionResult.error as { message?: string })?.message || String(linkedInspectionResult.error)}`,
      );
    }

    for (const row of linkedInspectionResult.rows) {
      inspectionsById.set(String(get(row, "id")), row);
    }
  }

  const inspectionRows = Array.from(inspectionsById.values());
  addInspectionPhotoPaths(paths, inspectionRows, bucket);

  const inspectionIds = uniq(
    inspectionRows
      .map((row) => String(get(row, "id") || ""))
      .filter(Boolean),
  );

  const logbookById = new Map<string, DbRow>();

  const directLogResult = await selectSinglePhotoRows(
    admin,
    "logbook",
    (query) => query.eq("user_id", uid).eq("apiary_id", apiaryId),
  );

  if (directLogResult.error) {
    throw new Error(
      `Could not collect apiary logbook photos: ${(directLogResult.error as { message?: string })?.message || String(directLogResult.error)}`,
    );
  }

  for (const row of directLogResult.rows) {
    logbookById.set(String(get(row, "id")), row);
  }

  for (const hiveIdChunk of chunk(hiveIds)) {
    const hiveLogResult = await selectSinglePhotoRows(
      admin,
      "logbook",
      (query) => query.eq("user_id", uid).in("hive_id", hiveIdChunk),
    );

    if (hiveLogResult.error) {
      throw new Error(
        `Could not collect hive logbook photos: ${(hiveLogResult.error as { message?: string })?.message || String(hiveLogResult.error)}`,
      );
    }

    for (const row of hiveLogResult.rows) {
      logbookById.set(String(get(row, "id")), row);
    }
  }

  for (const inspectionIdChunk of chunk(inspectionIds)) {
    const inspectionLogResult = await selectSinglePhotoRows(
      admin,
      "logbook",
      (query) =>
        query.eq("user_id", uid).in("inspection_id", inspectionIdChunk),
    );

    if (inspectionLogResult.error) {
      throw new Error(
        `Could not collect inspection logbook photos: ${(inspectionLogResult.error as { message?: string })?.message || String(inspectionLogResult.error)}`,
      );
    }

    for (const row of inspectionLogResult.rows) {
      logbookById.set(String(get(row, "id")), row);
    }
  }

  addSinglePhotoPaths(paths, Array.from(logbookById.values()), bucket);

  return {
    paths: uniq(paths),
    counts: {
      hives: hiveIds.length,
      inspections: inspectionIds.length,
      logbook: logbookById.size,
    },
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
        error: "Missing Supabase Edge Function environment variables",
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
        error: "Missing or invalid {table,id,mode}",
      });
    }

    const { table, id, mode, removeOne } = raw;
    const config = TABLES[table];
    const bucket = "photos";

    if (removeOne && table !== "inspections") {
      return json(400, {
        error: "removeOne is supported only for inspection photographs",
      });
    }

    const targetResult = await fetchOwnedTargetRow(admin, table, id);

    if (targetResult.error) {
      return json(500, {
        error:
          (targetResult.error as { message?: string })?.message ||
          String(targetResult.error),
      });
    }

    if (!targetResult.row) {
      return json(404, {
        error: "Row not found",
      });
    }

    const row = targetResult.row;

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
          ? parseStorageUrl(removeOne.url)
          : null;

        const onePath =
          removeOne.path ||
          (fromUrl?.bucket === bucket ? fromUrl.path : null);

        if (!onePath) {
          return json(400, {
            error: "removeOne did not resolve to a valid photograph path",
          });
        }

        const allowedPaths = new Set(storedPaths);

        for (const url of storedUrls) {
          const parsed = parseStorageUrl(url);

          if (parsed?.bucket === bucket) {
            allowedPaths.add(parsed.path);
          }
        }

        if (!allowedPaths.has(onePath)) {
          return json(403, {
            error: "Forbidden: photograph does not belong to this inspection",
          });
        }

        const newPaths = storedPaths.filter((path) => path !== onePath);
        const newUrls = storedUrls.filter((url) => {
          const parsed = parseStorageUrl(url);

          return !(
            parsed?.bucket === bucket &&
            parsed.path === onePath
          );
        });

        const patch: DbRow = {
          [urlsKey]: newUrls,
        };

        if (pathsKey in row) {
          patch[pathsKey] = newPaths;
        }

        const { error: updateError } = await admin
          .from(table)
          .update(patch)
          .eq("id", id)
          .eq("user_id", uid);

        if (updateError) {
          return json(500, {
            error: `Database update failed: ${updateError.message}`,
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

      addInspectionPhotoPaths(pathsToDelete, [row], bucket);
    } else {
      addSinglePhotoPaths(pathsToDelete, [row], bucket);
    }

    pathsToDelete = uniq(pathsToDelete);

    if (mode === "clear_photo") {
      if (table === "inspections") {
        const urlsKey = (config as CfgMulti).urlsCol;
        const pathsKey = (config as CfgMulti).pathsCol;
        const patch: DbRow = {
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
            error: `Database update failed: ${updateError.message}`,
          });
        }
      } else {
        const urlKey = (config as CfgSingle).urlCol;
        const pathKey = (config as CfgSingle).pathCol;
        const patch: DbRow = {
          [urlKey]: null,
        };

        if (pathKey in row) {
          patch[pathKey] = null;
        }

        const { error: updateError } = await admin
          .from(table)
          .update(patch)
          .eq("id", id)
          .eq("user_id", uid);

        if (updateError) {
          return json(500, {
            error: `Database update failed: ${updateError.message}`,
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

    if (table === "apiaries") {
      const collected = await collectApiaryDeletePaths(
        admin,
        id,
        uid,
        row,
        bucket,
      );

      const { data: deleteResult, error: deleteError } =
        await admin.rpc("delete_apiary_with_lifecycle_cleanup", {
          p_apiary_id: id,
          p_user_id: uid,
        });

      if (deleteError) {
        return json(500, {
          error: `Apiary delete failed: ${deleteError.message}`,
        });
      }

      const cleanup = await removeStorageObjects(
        admin,
        bucket,
        collected.paths,
      );

      return json(200, {
        ok: true,
        mode,
        result: deleteResult,
        collected: collected.counts,
        deleted: cleanup.deleted,
        warning: cleanup.warning,
      });
    }

    if (table === "inspections") {
      const collectedPaths = collectInspectionDeletePaths(
        row,
        bucket,
      );

      const { data: deleteResult, error: deleteError } =
        await admin.rpc("delete_inspection_with_linked_cleanup", {
          p_inspection_id: id,
          p_user_id: uid,
        });

      if (deleteError) {
        return json(500, {
          error: `Inspection delete failed: ${deleteError.message}`,
        });
      }

      const cleanup = await removeStorageObjects(
        admin,
        bucket,
        collectedPaths,
      );

      return json(200, {
        ok: true,
        mode,
        result: deleteResult,
        deleted: cleanup.deleted,
        warning: cleanup.warning,
      });
    }

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
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
