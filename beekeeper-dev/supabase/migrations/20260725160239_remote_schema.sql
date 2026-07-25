

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."inventory_assignment_level" AS ENUM (
    'global',
    'apiary',
    'hive'
);


ALTER TYPE "public"."inventory_assignment_level" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."app_delete_storage_from_url"("url" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  clean text;
  bucket text;
  obj text;
  slash int;
begin
  if url is null or url = '' then
    return;
  end if;

  -- If it's a full Supabase public/signed URL, strip the prefix
  if url like '%/storage/v1/object/%/' then
    clean := regexp_replace(url, '^.*?/storage/v1/object/(public|sign)/', '', 'i');
  else
    clean := url;
  end if;

  -- strip any ?query
  clean := split_part(clean, '?', 1);

  -- split "bucket/path..."
  slash := strpos(clean, '/');
  if slash <= 1 then
    return;
  end if;

  bucket := substr(clean, 1, slash - 1);
  obj    := substr(clean, slash + 1);

  if bucket is null or bucket = '' or obj is null or obj = '' then
    return;
  end if;

  -- delete; ignore errors so we don't block the parent delete
  perform storage.delete(bucket, array[obj]);

exception when others then
  -- swallow errors; never block user deletion on a storage hiccup
  null;
end;
$$;


ALTER FUNCTION "public"."app_delete_storage_from_url"("url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."app_delete_storage_urls_from_row"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  fld text;
  val text;
  j jsonb;
begin
  -- Use OLD for DELETE; for UPDATE we want to clean up OLD (replaced) URLs
  if (tg_op = 'DELETE') then
    j := to_jsonb(OLD);
  else
    j := to_jsonb(OLD); -- on UPDATE, if you add a BEFORE/AFTER UPDATE trigger, this cleans old URLs
  end if;

  -- Loop over text values and delete any that look like Storage URLs/keys
  for val in
    select value
    from jsonb_each_text(j)
    where value like '%/storage/v1/object/%/%'  -- public/signed URLs
       or value like '%/%'                      -- also catch "bucket/path" keys
  loop
    perform app_delete_storage_from_url(val);
  end loop;

  if (tg_op = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;


ALTER FUNCTION "public"."app_delete_storage_urls_from_row"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."app_is_member"("uid" "uuid", "grp" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.group_members gm
    where gm.user_id = uid and gm.group_id = grp
  );
$$;


ALTER FUNCTION "public"."app_is_member"("uid" "uuid", "grp" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_activate_apiary"("target_apiary_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
declare
  uid uuid := auth.uid();
  lvl text;
  is_currently_archived boolean;
begin
  if uid is null then return false; end if;

  select subscription_level into lvl
  from public.profiles
  where user_id = uid;

  if lower(coalesce(lvl, 'free')) = 'premium' then
    return true;
  end if;

  select (a.archived_at is not null) into is_currently_archived
  from public.apiaries a
  where a.id = target_apiary_id
    and a.user_id = uid;

  -- If it’s already active, allow updates
  if is_currently_archived is distinct from true then
    return true;
  end if;

  -- If restoring (archived -> active), enforce Free limit
  return public.can_create_apiary();
end $$;


ALTER FUNCTION "public"."can_activate_apiary"("target_apiary_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_activate_hive"("target_hive_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
declare
  uid uuid := auth.uid();
  lvl text;
  is_currently_archived boolean;
begin
  if uid is null then return false; end if;

  select subscription_level into lvl
  from public.profiles
  where user_id = uid;

  if lower(coalesce(lvl, 'free')) = 'premium' then
    return true;
  end if;

  select (h.archived_at is not null) into is_currently_archived
  from public.hives h
  where h.id = target_hive_id
    and h.user_id = uid;

  if is_currently_archived is distinct from true then
    return true;
  end if;

  return public.can_create_hive();
end $$;


ALTER FUNCTION "public"."can_activate_hive"("target_hive_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_apiary"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
declare
  uid uuid := auth.uid();
  lvl text;
  active_apiaries int;
begin
  if uid is null then
    return false;
  end if;

  select subscription_level
    into lvl
  from public.profiles
  where user_id = uid;

  if lower(coalesce(lvl, 'free')) = 'premium' then
    return true;
  end if;

  select count(*)
    into active_apiaries
  from public.apiaries
  where user_id = uid
    and archived_at is null;

  return active_apiaries < 1;
end $$;


ALTER FUNCTION "public"."can_create_apiary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_apiary"("uid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  sub text;
  n   integer;
begin
  -- Normalize subscription to lowercase/trim; default to 'free' if missing
  select lower(trim(subscription_level)) into sub
  from public.profiles
  where user_id = uid;

  sub := coalesce(sub, 'free');

  -- Non-free plans are unlimited here
  if sub <> 'free' then
    return true;
  end if;

  -- Free plan: allow only if user has < 1 active apiary
  select count(*) into n
  from public.apiaries
  where user_id = uid
    and archived_at is null;

  return n < 1;
end;
$$;


ALTER FUNCTION "public"."can_create_apiary"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_hive"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
declare
  uid uuid := auth.uid();
  lvl text;
  active_hives int;
begin
  if uid is null then
    return false;
  end if;

  select subscription_level
    into lvl
  from public.profiles
  where user_id = uid;

  if lower(coalesce(lvl, 'free')) = 'premium' then
    return true;
  end if;

  select count(*)
    into active_hives
  from public.hives
  where user_id = uid
    and archived_at is null;

  return active_hives < 2;
end $$;


ALTER FUNCTION "public"."can_create_hive"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cascade_archive_apiary"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.archived_at is distinct from old.archived_at and new.archived_at is not null then
    update public.todos
       set archived_at = new.archived_at
     where apiary_id = new.id
       and archived_at is null;

    update public.logbook
       set archived_at = new.archived_at
     where apiary_id = new.id
       and archived_at is null;

    -- cascade down to hives (their trigger handles deeper levels)
    update public.hives
       set archived_at = new.archived_at
     where apiary_id = new.id
       and archived_at is null;
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."cascade_archive_apiary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cascade_archive_hive"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.archived_at is distinct from old.archived_at and new.archived_at is not null then
    -- directly linked to hive
    update public.todos
       set archived_at = new.archived_at
     where hive_id = new.id
       and archived_at is null;

    update public.logbook
       set archived_at = new.archived_at
     where hive_id = new.id
       and archived_at is null;

    -- cascade to inspections (their trigger handles logbook via inspection_id)
    update public.inspections
       set archived_at = new.archived_at
     where hive_id = new.id
       and archived_at is null;
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."cascade_archive_hive"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cascade_archive_inspection"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.archived_at is distinct from old.archived_at and new.archived_at is not null then
    update public.logbook
       set archived_at = new.archived_at
     where inspection_id = new.id
       and archived_at is null;
    -- NOTE: no todos update here (no inspection_id column in todos)
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."cascade_archive_inspection"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_apiary_children"("apiary_id" "uuid") RETURNS TABLE("hives" integer, "inspections" integer, "todos" integer, "logs" integer)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    coalesce((select count(1) from public.hives h
              where h.apiary_id = check_apiary_children.apiary_id
                and h.user_id   = auth.uid()
                and h.archived_at is null), 0) as hives,
    coalesce((select count(1) from public.inspections i
              where i.apiary_id = check_apiary_children.apiary_id
                and i.user_id   = auth.uid()
                and i.archived_at is null), 0) as inspections,
    0::int as todos,
    0::int as logs;
$$;


ALTER FUNCTION "public"."check_apiary_children"("apiary_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_apiary_children_v2"("p_apiary_id" "uuid") RETURNS TABLE("hives" bigint, "inspections" bigint, "todos" bigint, "logs" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    (select count(*) from public.hives       where apiary_id = p_apiary_id),
    (select count(*) from public.inspections where apiary_id = p_apiary_id),
    (select count(*) from public.todos       where apiary_id = p_apiary_id),
    (select count(*) from public.logbook     where apiary_id = p_apiary_id);
$$;


ALTER FUNCTION "public"."check_apiary_children_v2"("p_apiary_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_hive_children"("hive_id" "uuid") RETURNS TABLE("inspections" integer, "todos" integer, "logs" integer)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    coalesce((select count(1) from public.inspections i
              where i.hive_id = check_hive_children.hive_id
                and i.user_id = auth.uid()
                and i.archived_at is null), 0) as inspections,
    0::int as todos,
    0::int as logs;
$$;


ALTER FUNCTION "public"."check_hive_children"("hive_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_hive_children_v2"("p_hive_id" "uuid") RETURNS TABLE("inspections" bigint, "todos" bigint, "logs" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    (select count(*) from public.inspections where hive_id = p_hive_id),
    (select count(*) from public.todos       where hive_id = p_hive_id),
    (select count(*) from public.logbook     where hive_id = p_hive_id);
$$;


ALTER FUNCTION "public"."check_hive_children_v2"("p_hive_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_inspection_children"("inspection_id" "uuid") RETURNS TABLE("logs" integer, "todos" integer)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select 0::int as logs, 0::int as todos;
$$;


ALTER FUNCTION "public"."check_inspection_children"("inspection_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_inspection_children_v2"("p_inspection_id" "uuid") RETURNS TABLE("logs" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    (select count(*) from public.logbook where inspection_id = p_inspection_id);
$$;


ALTER FUNCTION "public"."check_inspection_children_v2"("p_inspection_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."collect_user_photo_paths"("uid" "uuid") RETURNS TABLE("path" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
declare
  r record;
  sql text := '';
  first boolean := true;
begin
  -- scan candidate columns on tables that ALSO have a user_id column
  for r in
    select c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.columns u
      on u.table_schema = c.table_schema
     and u.table_name   = c.table_name
     and u.column_name  = 'user_id'
    where c.table_schema = 'public'
      and c.data_type in ('text','character varying')
      and c.column_name ~* '(path|photo|image|url)'
      and c.table_name in (
        'profiles','apiaries','hives','inspections',
        'logbook','inventory_items','expenses','sales_lines','todos'
      )
  loop
    if not first then sql := sql || ' union all '; end if;
    first := false;

    -- profiles avatar URLs may be full public URLs – strip prefix to a storage path
    if r.table_name = 'profiles' then
      sql := sql || format($f$
        select nullif(
                 regexp_replace(%1$I.%2$I,
                   '^.*?/storage/v1/object/public/photos/', ''
                 ), ''
               ) as path
        from %1$I
        where %1$I.user_id = %L
          and %1$I.%2$I is not null
      $f$, r.table_name, r.column_name, uid);
    else
      sql := sql || format($f$
        select %1$I.%2$I as path
        from %1$I
        where %1$I.user_id = %L
          and %1$I.%2$I is not null
          and (
            %1$I.%2$I ilike 'avatar/%%'
            or %1$I.%2$I ilike 'apiaries/%%'
            or %1$I.%2$I ilike 'hives/%%'
            or %1$I.%2$I ilike 'inspections/%%'
            or %1$I.%2$I like '%.jpg'  or %1$I.%2$I like '%.jpeg'
            or %1$I.%2$I like '%.png'  or %1$I.%2$I like '%.webp'
            or %1$I.%2$I like '%.gif'  or %1$I.%2$I like '%.avif'
          )
      $f$, r.table_name, r.column_name, uid);
    end if;
  end loop;

  if first then
    -- nothing matched (no candidate columns)
    return;
  end if;

  return query execute
    'select distinct path from (' || sql || ') t where path is not null';
end
$_$;


ALTER FUNCTION "public"."collect_user_photo_paths"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compute_remind_at"("p_user_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_due_at" timestamp with time zone, "p_offset_days" integer) RETURNS TABLE("remind_at" timestamp with time zone, "tz_used" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_tz text;
  v_offset int := greatest(coalesce(p_offset_days, 1), 0);
  v_local_date date;
  v_local_0900 timestamp without time zone;
begin
  -- choose timezone: apiary -> hive's apiary -> profile -> fallback
  v_tz := null;

  if p_apiary_id is not null then
    select a.tz into v_tz
    from public.apiaries a
    where a.id = p_apiary_id and a.archived_at is null;
  end if;

  if v_tz is null and p_hive_id is not null then
    select a.tz into v_tz
    from public.hives h
    join public.apiaries a on a.id = h.apiary_id
    where h.id = p_hive_id
      and h.archived_at is null
      and a.archived_at is null;
  end if;

  if v_tz is null then
    select p.timezone into v_tz
    from public.profiles p
    where p.user_id = p_user_id;
  end if;

  if v_tz is null or v_tz = '' then
    v_tz := 'Europe/London';
  end if;

  -- no due date? return tz only
  if p_due_at is null then
    return query select null::timestamptz, v_tz;
    return;
  end if;

  -- due day at 09:00 local, minus offset days, back to UTC
  v_local_date  := (p_due_at at time zone v_tz)::date;
  v_local_0900  := v_local_date::timestamp + time '09:00';
  return query
    select ((v_local_0900 - make_interval(days => v_offset)) at time zone v_tz)::timestamptz, v_tz;
end
$$;


ALTER FUNCTION "public"."compute_remind_at"("p_user_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_due_at" timestamp with time zone, "p_offset_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."create_profile_for_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_my_account"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_uid uuid := auth.uid();

  d_sales_lines      int := 0;
  d_expenses         int := 0;
  d_inventory_items  int := 0;
  d_logbook          int := 0;
  d_todos            int := 0;
  d_inspections      int := 0;
  d_hives            int := 0;
  d_apiaries         int := 0;
  d_profiles         int := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Children → parents
  delete from sales_lines      where user_id = v_uid;  get diagnostics d_sales_lines     = row_count;
  delete from expenses         where user_id = v_uid;  get diagnostics d_expenses        = row_count;
  delete from inventory_items  where user_id = v_uid;  get diagnostics d_inventory_items = row_count;
  delete from logbook          where user_id = v_uid;  get diagnostics d_logbook         = row_count;
  delete from todos            where user_id = v_uid;  get diagnostics d_todos           = row_count;
  delete from inspections      where user_id = v_uid;  get diagnostics d_inspections     = row_count;
  delete from hives            where user_id = v_uid;  get diagnostics d_hives           = row_count;
  delete from apiaries         where user_id = v_uid;  get diagnostics d_apiaries        = row_count;
  delete from profiles         where user_id = v_uid;  get diagnostics d_profiles        = row_count;

  return jsonb_build_object(
    'sales_lines', d_sales_lines,
    'expenses', d_expenses,
    'inventory_items', d_inventory_items,
    'logbook', d_logbook,
    'todos', d_todos,
    'inspections', d_inspections,
    'hives', d_hives,
    'apiaries', d_apiaries,
    'profiles', d_profiles
  );
end
$$;


ALTER FUNCTION "public"."delete_my_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user"("uid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  DELETE FROM inspections     WHERE user_id = uid;
  DELETE FROM hives           WHERE user_id = uid;
  DELETE FROM apiaries        WHERE user_id = uid;
  DELETE FROM todos           WHERE user_id = uid;
  DELETE FROM logbook         WHERE user_id = uid;
  DELETE FROM inventory_items WHERE user_id = uid;
  DELETE FROM expenses        WHERE user_id = uid;
  DELETE FROM sales_lines     WHERE user_id = uid;
  DELETE FROM sales_orders    WHERE user_id = uid;
  DELETE FROM profiles        WHERE user_id = uid;
END;
$$;


ALTER FUNCTION "public"."delete_user"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_free_apiary_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  sub text;
  n   integer;
begin
  -- Read subscription; default to 'free'
  select lower(trim(subscription_level)) into sub
  from public.profiles
  where user_id = new.user_id;

  sub := coalesce(sub, 'free');

  if sub = 'free' then
    select count(*) into n
    from public.apiaries
    where user_id = new.user_id
      and archived_at is null;

    if n >= 1 then
      raise exception 'Free plan limit reached: only 1 active apiary allowed';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_free_apiary_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_free_apiary_unarchive_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  sub text;
  n   integer;
begin
  -- Only care when setting archived_at back to NULL
  if not (new.archived_at is null and old.archived_at is not null) then
    return new;
  end if;

  -- Read plan; default to free
  select lower(trim(subscription_level)) into sub
  from public.profiles
  where user_id = new.user_id;

  sub := coalesce(sub, 'free');

  if sub = 'free' then
    -- Count OTHER active apiaries (exclude the row being unarchived)
    select count(*) into n
    from public.apiaries a
    where a.user_id = new.user_id
      and a.archived_at is null
      and a.id <> new.id;

    if n >= 1 then
      raise exception 'Free plan limit: only 1 active apiary allowed';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_free_apiary_unarchive_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_free_hive_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  uid uuid;
  sub text;
  n   integer;
begin
  -- Find the owning user via the apiary
  select a.user_id into uid
  from public.apiaries a
  where a.id = new.apiary_id;

  if uid is null then
    -- If we can't resolve the user, skip (or raise if you prefer)
    return new;
  end if;

  -- Read plan (default to 'free')
  select lower(trim(p.subscription_level)) into sub
  from public.profiles p
  where p.user_id = uid;

  sub := coalesce(sub, 'free');

  if sub = 'free' then
    -- Count current active hives for this user across all apiaries
    select count(*) into n
    from public.hives h
    join public.apiaries a on a.id = h.apiary_id
    where a.user_id = uid
      and h.archived_at is null;

    if n >= 2 then
      raise exception 'Free plan limit reached: only 2 active hives allowed';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_free_hive_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_free_hive_unarchive_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  uid uuid;
  sub text;
  n   integer;
begin
  -- Only care when setting archived_at back to NULL
  if not (new.archived_at is null and old.archived_at is not null) then
    return new;
  end if;

  -- Resolve owning user via apiary
  select a.user_id into uid
  from public.apiaries a
  where a.id = new.apiary_id;

  if uid is null then
    return new;
  end if;

  -- Read plan; default to free
  select lower(trim(p.subscription_level)) into sub
  from public.profiles p
  where p.user_id = uid;

  sub := coalesce(sub, 'free');

  if sub = 'free' then
    -- Count OTHER active hives for this user (exclude the row being unarchived)
    select count(*) into n
    from public.hives h
    join public.apiaries a on a.id = h.apiary_id
    where a.user_id = uid
      and h.archived_at is null
      and h.id <> new.id;

    if n >= 2 then
      raise exception 'Free plan limit: only 2 active hives allowed';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_free_hive_unarchive_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_due_task_emails_dry_run"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare v_rows int := 0;
begin
  insert into public.todos_email_outbox (todo_id, to_email, subject, body)
  select
    t.id,
    coalesce(t.notify_email, p.email::text, au.email) as to_email,
    format('Upcoming task: %s - due %s',
           coalesce(t.title,'Task'),
           to_char((t.due_at at time zone t.tz_used_on_create),'YYYY-MM-DD')) as subject,
    (
      'You''re receiving this because you opted into email reminders for tasks.' || E'\n\n' ||
      'Task: ' || coalesce(t.title,'Task') || E'\n' ||
      'Due (local): ' || to_char((t.due_at at time zone t.tz_used_on_create),'YYYY-MM-DD HH24:MI') ||
        ' ' || t.tz_used_on_create || E'\n' ||
      'Reminder time (local): ' || to_char((t.remind_at at time zone t.tz_used_on_create),'YYYY-MM-DD HH24:MI') ||
        ' ' || t.tz_used_on_create || E'\n' ||
      'Apiary: ' || coalesce(a.name, case when t.apiary_id is null then 'All apiaries' else 'Unknown apiary' end) || E'\n' ||
      'Hive: '   || coalesce(h.name, case when t.hive_id   is null then 'All hives'     else 'Unknown hive'   end) || E'\n\n' ||
      'To stop these emails for this task, mark it Completed.' || E'\n'
    ) as body
  from public.todos t
  left join public.hives h on h.id = t.hive_id
  left join public.apiaries a on a.id = coalesce(t.apiary_id, h.apiary_id)
  left join public.profiles p on p.user_id = t.user_id
  left join auth.users au on au.id = t.user_id
  where t.status='pending'
    and t.notify_via='email'
    and coalesce(t.notify_opt_in,false)=true
    and t.reminder_sent_at is null
    and t.archived_at is null
    and (t.hive_id is null or h.archived_at is null)
    and (coalesce(t.apiary_id, h.apiary_id) is null or a.archived_at is null)
    and t.remind_at is not null
    and t.remind_at <= now()
  on conflict (todo_id) do nothing;

  get diagnostics v_rows = row_count;
  return v_rows;
end
$$;


ALTER FUNCTION "public"."enqueue_due_task_emails_dry_run"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."group_member_counts"("g_ids" "uuid"[]) RETURNS TABLE("group_id" "uuid", "member_count" integer)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select group_id, count(*)::int
  from public.group_members
  where group_id = any(g_ids)
  group by group_id
$$;


ALTER FUNCTION "public"."group_member_counts"("g_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_downgrade_archive"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  uid uuid := new.user_id;
  oldsub text := coalesce(lower(trim(old.subscription_level)), 'free');
  newsub text := coalesce(lower(trim(new.subscription_level)), 'free');
  keep_apiary uuid;
begin
  -- Only act when moving from non-free -> free
  if not (oldsub <> 'free' and newsub = 'free') then
    return new;
  end if;

  -- Choose apiary to keep:
  -- 1) profiles.default_apiary_id if active and owned by this user
  select a.id into keep_apiary
  from public.apiaries a
  where a.user_id = uid
    and a.archived_at is null
    and a.id = new.default_apiary_id
  limit 1;

  -- 2) else newest active apiary by id
  if keep_apiary is null then
    select a.id into keep_apiary
    from public.apiaries a
    where a.user_id = uid
      and a.archived_at is null
    order by a.id desc
    limit 1;
  end if;

  -- Archive other active apiaries
  if keep_apiary is not null then
    update public.apiaries
       set archived_at = now()
     where user_id = uid
       and archived_at is null
       and id <> keep_apiary;
  end if;

  -- Limit hives in kept apiary to top 2 (by newest id)
  if keep_apiary is not null then
    with ranked as (
      select h.id,
             row_number() over(order by h.id desc) as rn
      from public.hives h
      where h.apiary_id = keep_apiary
        and h.archived_at is null
    )
    update public.hives h
       set archived_at = now()
      from ranked r
     where h.id = r.id
       and r.rn > 2;
  end if;

  -- Ensure hives under newly archived apiaries are archived too
  update public.hives h
     set archived_at = now()
    from public.apiaries a
   where a.id = h.apiary_id
     and a.user_id = uid
     and a.archived_at is not null
     and h.archived_at is null;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_downgrade_archive"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hives_block_restore_if_parent_archived"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- restoring = archived_at goes from NOT NULL -> NULL
  IF (OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL) THEN
    PERFORM 1
    FROM public.apiaries a
    WHERE a.id = NEW.apiary_id
      AND a.archived_at IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cannot restore hive: its apiary is archived. Restore the apiary first.';
    END IF;
  END IF;
  RETURN NEW;
END$$;


ALTER FUNCTION "public"."hives_block_restore_if_parent_archived"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inspection_rank"("p_inspection_id" "uuid", "p_apiary_id" "uuid" DEFAULT NULL::"uuid", "p_hive_id" "uuid" DEFAULT NULL::"uuid", "p_from" "date" DEFAULT NULL::"date", "p_to" "date" DEFAULT NULL::"date") RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  with target as (
    select i.date, i.created_at, i.id
    from public.inspections i
    where i.id = p_inspection_id
      and i.archived_at is null
    limit 1
  )
  select
    case
      when (select count(*) from target) = 0 then null
      else (
        select count(*)
        from public.inspections i
        cross join target t
        where i.archived_at is null
          and (p_hive_id is null or i.hive_id = p_hive_id)
          and (p_apiary_id is null or i.apiary_id = p_apiary_id)
          and (p_from is null or i.date >= p_from)
          and (p_to   is null or i.date <= p_to)
          and (
            i.date > t.date
            or (i.date = t.date and i.created_at > t.created_at)
            or (i.date = t.date and i.created_at = t.created_at and i.id > t.id)
          )
      )
    end;
$$;


ALTER FUNCTION "public"."inspection_rank"("p_inspection_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_from" "date", "p_to" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inspections_block_restore_if_parents_archived"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL) THEN
    PERFORM 1
    FROM public.hives h
    JOIN public.apiaries a ON a.id = h.apiary_id
    WHERE h.id = NEW.hive_id
      AND h.archived_at IS NULL
      AND a.archived_at IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cannot restore inspection: its hive (or apiary) is archived. Restore parent first.';
    END IF;
  END IF;
  RETURN NEW;
END$$;


ALTER FUNCTION "public"."inspections_block_restore_if_parents_archived"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_group_member"("p_group_id" "uuid", "p_user" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id  = coalesce(p_user, auth.uid())
  );
$$;


ALTER FUNCTION "public"."is_group_member"("p_group_id" "uuid", "p_user" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."jwt"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb
$$;


ALTER FUNCTION "public"."jwt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."logbook_block_restore_if_parent_archived"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL) THEN
    IF (NEW.hive_id IS NOT NULL) THEN
      PERFORM 1
      FROM public.hives h
      JOIN public.apiaries a ON a.id = h.apiary_id
      WHERE h.id = NEW.hive_id
        AND h.archived_at IS NULL
        AND a.archived_at IS NULL;
    ELSE
      PERFORM 1
      FROM public.apiaries a
      WHERE a.id = NEW.apiary_id
        AND a.archived_at IS NULL;
    END IF;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cannot restore log entry: its parent (hive/apiary) is archived. Restore parent first.';
    END IF;
  END IF;
  RETURN NEW;
END$$;


ALTER FUNCTION "public"."logbook_block_restore_if_parent_archived"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."moddatetime"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."moddatetime"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_hive_nfc"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.nfc_uid is not null then
    new.nfc_uid := lower(replace(new.nfc_uid, ' ', ''));
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."normalize_hive_nfc"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."pl_summary"("p_year" integer, "p_month" integer DEFAULT NULL::integer) RETURNS TABLE("year" integer, "month" integer, "revenue" numeric, "cogs" numeric, "expenses" numeric, "profit" numeric)
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
WITH bounds AS (
  SELECT
    make_date(p_year, COALESCE(p_month, 1), 1) AS start_date,
    CASE
      WHEN p_month IS NULL
        THEN (make_date(p_year, 12, 31) + interval '1 day')  -- whole year
      ELSE (make_date(p_year, p_month, 1) + interval '1 month') -- that month
    END AS end_exclusive
),
revenue AS (
  SELECT SUM((sl.qty * sl.unit_price) - COALESCE(sl.discount, 0)) AS total
  FROM sales_orders so
  JOIN sales_lines  sl
    ON sl.order_id = so.id
   AND sl.user_id  = so.user_id
  CROSS JOIN bounds b
  WHERE so.user_id = auth.uid()
    AND so.sold_at >= b.start_date
    AND so.sold_at <  b.end_exclusive
),
cogs AS (
  SELECT SUM(sl.qty * sl.cogs_per_unit_cached) AS total
  FROM sales_orders so
  JOIN sales_lines  sl
    ON sl.order_id = so.id
   AND sl.user_id  = so.user_id
  CROSS JOIN bounds b
  WHERE so.user_id = auth.uid()
    AND so.sold_at >= b.start_date
    AND so.sold_at <  b.end_exclusive
),
exp AS (
  SELECT SUM(e.amount) AS total
  FROM expenses e
  CROSS JOIN bounds b
  WHERE e.user_id = auth.uid()
    AND e.occurred_at >= b.start_date
    AND e.occurred_at <  b.end_exclusive
)
SELECT
  p_year                                                AS year,
  p_month                                               AS month,
  COALESCE((SELECT total FROM revenue), 0)              AS revenue,
  COALESCE((SELECT total FROM cogs),    0)              AS cogs,
  COALESCE((SELECT total FROM exp),     0)              AS expenses,
  COALESCE((SELECT total FROM revenue), 0)
    - COALESCE((SELECT total FROM cogs), 0)
    - COALESCE((SELECT total FROM exp),  0)             AS profit;
$$;


ALTER FUNCTION "public"."pl_summary"("p_year" integer, "p_month" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$ select auth.role() $$;


ALTER FUNCTION "public"."role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_due_task_emails"("limit_rows" integer DEFAULT 20) RETURNS TABLE("todo_id" "uuid", "to_email" "text", "http_status" integer, "sent" boolean, "error" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'private'
    AS $$
declare
  v_key text;
  r record;
  resp jsonb;
  st int;
begin
  -- Read secret from private table
  select value into v_key
  from private.service_secrets
  where name = 'resend_api_key';

  if v_key is null then
    raise exception 'Missing secret: resend_api_key';
  end if;

  for r in
    select t.id,
           coalesce(t.notify_email, p.email::text, au.email) as to_email,
           coalesce(t.title,'Task') as title,
           t.tz_used_on_create, t.due_at, t.remind_at
    from public.todos t
    left join public.profiles p on p.user_id = t.user_id
    left join auth.users au    on au.id = t.user_id
    where t.status='pending'
      and coalesce(t.notify_opt_in,false)=true
      and t.notify_via='email'
      and t.reminder_sent_at is null
      and t.remind_at is not null
      and t.remind_at <= now()
    order by t.remind_at
    limit limit_rows
  loop
    resp := net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Authorization', 'Bearer '||v_key,
        'Content-Type','application/json'
      ),
      body := jsonb_build_object(
        'from', 'onboarding@resend.dev',  -- fine for first live test
        'to',   r.to_email,
        'subject', format('Upcoming task: %s - due %s',
                   r.title, to_char((r.due_at at time zone r.tz_used_on_create),'YYYY-MM-DD')),
        'text', format(
          'You''re receiving this because you opted into email reminders for tasks.%s%sTask: %s%sDue (local): %s %s%sReminder time (local): %s %s%s%s',
          E'\n\n',
          '', r.title,
          E'\n',
          to_char((r.due_at   at time zone r.tz_used_on_create),'YYYY-MM-DD HH24:MI'), r.tz_used_on_create, E'\n',
          to_char((r.remind_at at time zone r.tz_used_on_create),'YYYY-MM-DD HH24:MI'), r.tz_used_on_create, E'\n\n',
          'To stop these emails for this task, mark it Completed.'
        )
      )::jsonb,
      timeout_milliseconds := 15000
    );

    st := coalesce((resp->>'status')::int, 0);

    todo_id := r.id; to_email := r.to_email; http_status := st;

    if st between 200 and 299 then
      update public.todos
      set reminder_sent_at = now()
      where id = r.id;
      sent := true; error := null;
    else
      sent := false; error := resp::text;
    end if;

    return next;
  end loop;
end
$$;


ALTER FUNCTION "public"."send_due_task_emails"("limit_rows" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_id_default"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_user_id_default"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_profile_default_apiary"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'DELETE' then
    -- Clear profile default if pointing at the deleted apiary
    update public.profiles p
      set default_apiary_id = null
    where p.default_apiary_id = old.id;
    return null;
  end if;

  if tg_op = 'UPDATE' then
    -- If this apiary toggled default ON, make it the profile default
    if new.is_default = true and coalesce(old.is_default,false) <> true
    then
      update public.profiles p
        set default_apiary_id = new.id
      where p.user_id = new.user_id;
    end if;

    -- If this apiary got archived or default turned OFF and profile points to it, clear it
    if (new.archived_at is not null)
       or (coalesce(old.is_default,false) = true and new.is_default <> true)
    then
      update public.profiles p
        set default_apiary_id = null
      where p.default_apiary_id = new.id;
    end if;

    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_default = true then
      update public.profiles p
        set default_apiary_id = new.id
      where p.user_id = new.user_id;
    end if;
    return new;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."sync_profile_default_apiary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_profile_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.profiles
  set email = new.email
  where user_id = new.id;
  return new;
end;
$$;


ALTER FUNCTION "public"."sync_profile_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."t_delete_photo_url"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform app_delete_storage_from_url(OLD.photo_url);
  return OLD;
end $$;


ALTER FUNCTION "public"."t_delete_photo_url"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_hives_sync_user_from_apiary"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  a_user uuid;
begin
  select user_id into a_user from public.apiaries where id = new.apiary_id;
  if a_user is null then
    raise exception 'apiary % not found', new.apiary_id;
  end if;
  new.user_id := a_user;
  return new;
end$$;


ALTER FUNCTION "public"."tg_hives_sync_user_from_apiary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_inspections_enforce_consistency"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  a_user uuid;
  h_user uuid;
  h_api  uuid;
begin
  select user_id into a_user from public.apiaries where id = new.apiary_id;
  if a_user is null then
    raise exception 'apiary % not found', new.apiary_id;
  end if;

  select user_id, apiary_id into h_user, h_api from public.hives where id = new.hive_id;
  if h_user is null then
    raise exception 'hive % not found', new.hive_id;
  end if;

  if h_api <> new.apiary_id then
    raise exception 'hive % does not belong to apiary %', new.hive_id, new.apiary_id;
  end if;

  if a_user <> h_user then
    raise exception 'apiary and hive belong to different users';
  end if;

  new.user_id := a_user;
  return new;
end$$;


ALTER FUNCTION "public"."tg_inspections_enforce_consistency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_profiles_touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at := now();
  return new;
end$$;


ALTER FUNCTION "public"."tg_profiles_touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."todos_block_restore_if_parent_archived"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL) THEN
    -- prefer checking hive if todos.hive_id exists; otherwise apiary
    IF (NEW.hive_id IS NOT NULL) THEN
      PERFORM 1
      FROM public.hives h
      JOIN public.apiaries a ON a.id = h.apiary_id
      WHERE h.id = NEW.hive_id
        AND h.archived_at IS NULL
        AND a.archived_at IS NULL;
    ELSE
      PERFORM 1
      FROM public.apiaries a
      WHERE a.id = NEW.apiary_id
        AND a.archived_at IS NULL;
    END IF;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cannot restore to-do: its parent (hive/apiary) is archived. Restore parent first.';
    END IF;
  END IF;
  RETURN NEW;
END$$;


ALTER FUNCTION "public"."todos_block_restore_if_parent_archived"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."todos_set_completed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  -- If marking complete and timestamp not set, set it
  if (new.status ilike 'complete' or new.status ilike 'completed')
     and new.completed_at is null then
    new.completed_at := now();
  end if;

  -- If changing away from complete, clear it
  if tg_op = 'UPDATE'
     and (old.status ilike 'complete' or old.status ilike 'completed')
     and not (new.status ilike 'complete' or new.status ilike 'completed') then
    new.completed_at := null;
  end if;

  return new;
end
$$;


ALTER FUNCTION "public"."todos_set_completed_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."todos_set_user_id"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end$$;


ALTER FUNCTION "public"."todos_set_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$ select auth.uid() $$;


ALTER FUNCTION "public"."uid"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "private"."service_secrets" (
    "name" "text" NOT NULL,
    "value" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "private"."service_secrets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."apiaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "latitude" double precision,
    "longitude" double precision,
    "address" "text",
    "established_date" "date",
    "location_type" "text",
    "site_setting" "text",
    "notes" "text",
    "photo_url" "text",
    "is_default" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "tz" "text",
    "photo_path" "text"
);


ALTER TABLE "public"."apiaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."apiary_map_markers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "apiary_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "type" "text" NOT NULL,
    "title" "text",
    "notes" "text",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "observed_at" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."apiary_map_markers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "occurred_at" "date" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text",
    "amount" numeric(12,2) NOT NULL,
    "currency" "text" DEFAULT 'GBP'::"text",
    "apiary_id" "uuid",
    "vendor" "text",
    "invoice_no" "text",
    "receipt_url" "text",
    "hive_id" "uuid",
    "invoice_number" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hives" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "apiary_id" "uuid",
    "name" "text" NOT NULL,
    "hive_type" "text",
    "hive_type_other" "text",
    "date_established" "date",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "photo_url" "text",
    "nfc_uid" "text",
    "archived_at" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "photo_path" "text",
    "nfc_link_enabled" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."hives" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inspections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "apiary_id" "uuid" NOT NULL,
    "hive_id" "uuid" NOT NULL,
    "nfc_uid" "text",
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "weather" "text",
    "colony_behavior" "text",
    "colony_behavior_other" "text",
    "environmental_signs" "text"[],
    "environmental_signs_other" "text",
    "hive_population" "text",
    "brood_pattern" "text",
    "food_stores" "text",
    "queen_status" "text"[],
    "queen_status_other" "text",
    "signs_disease" boolean DEFAULT false,
    "disease_types" "text"[],
    "disease_other" "text",
    "signs_pests" boolean DEFAULT false,
    "pest_types" "text"[],
    "pest_other" "text",
    "notes" "text",
    "photos" "text"[],
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "weather_code" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "photo_paths" "text"[],
    "weather_observed" "text",
    "frames_of_bees" "text",
    "queen_cells" "text",
    "varroa_seen" boolean,
    "brood_box_congestion" "text",
    "inspection_type" "text" DEFAULT 'full_inspection'::"text" NOT NULL,
    CONSTRAINT "inspections_inspection_type_chk" CHECK (("inspection_type" = ANY (ARRAY['full_inspection'::"text", 'external_check'::"text", 'observation_only'::"text"])))
);


ALTER TABLE "public"."inspections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_item_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "level" "public"."inventory_assignment_level" NOT NULL,
    "apiary_id" "uuid",
    "hive_id" "uuid",
    "qty_allocated" numeric(12,3),
    "unit" "text",
    "starts_at" "date",
    "ends_at" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "assign_level_consistency" CHECK (((("level" = 'global'::"public"."inventory_assignment_level") AND ("apiary_id" IS NULL) AND ("hive_id" IS NULL)) OR (("level" = 'apiary'::"public"."inventory_assignment_level") AND ("apiary_id" IS NOT NULL) AND ("hive_id" IS NULL)) OR (("level" = 'hive'::"public"."inventory_assignment_level") AND ("hive_id" IS NOT NULL))))
);


ALTER TABLE "public"."inventory_item_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sku" "text",
    "name" "text" NOT NULL,
    "category" "text",
    "subcategory" "text",
    "unit" "text" DEFAULT 'piece'::"text",
    "is_consumable" boolean DEFAULT false NOT NULL,
    "track_stock" boolean DEFAULT false NOT NULL,
    "condition" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nfc_uid" "text",
    "status" "text" DEFAULT 'In use'::"text",
    "quantity" numeric,
    "purchase_date" "date",
    "purchase_type" "text",
    "purchase_price" numeric,
    "currency" "text",
    "supplier_name" "text",
    "invoice_number" "text",
    "apiary_id" "uuid",
    "hive_id" "uuid",
    "serial_number" "text",
    "warranty_expires" "date",
    CONSTRAINT "inventory_items_currency_chk" CHECK ((("currency" IS NULL) OR ("currency" ~ '^[A-Z]{3}$'::"text")))
);


ALTER TABLE "public"."inventory_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."location_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."location_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."logbook" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "apiary_id" "uuid",
    "hive_id" "uuid",
    "inspection_id" "uuid",
    "entry" "text",
    "all_hives" boolean DEFAULT false,
    "date" "date",
    "photo_url" "text",
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "fed_what" "text",
    "fed_amount" "text",
    "mite_method" "text",
    "disease" "text",
    "product_used" "text",
    "dosage" "text",
    "breed" "text",
    "breed_other" "text",
    "source" "text",
    "source_other" "text",
    "marking" "text",
    "marking_other" "text",
    "details" "jsonb",
    "log_type" "text" NOT NULL,
    "photo_path" "text"
);


ALTER TABLE "public"."logbook" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "email" "extensions"."citext" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subscription_level" "text" DEFAULT 'free'::"text" NOT NULL,
    "timezone" "text",
    "locale" "text",
    "default_apiary_id" "uuid",
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "subscription_status" "text",
    "current_period_end" timestamp with time zone,
    CONSTRAINT "profiles_subscription_level_check" CHECK (("subscription_level" = ANY (ARRAY['free'::"text", 'standard'::"text", 'premium'::"text"]))),
    CONSTRAINT "profiles_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['trialing'::"text", 'active'::"text", 'past_due'::"text", 'incomplete'::"text", 'incomplete_expired'::"text", 'canceled'::"text", 'unpaid'::"text", 'cancels_at_period_end'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_lines" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "packaging_id" "uuid",
    "product_name" "text" NOT NULL,
    "qty" integer NOT NULL,
    "unit_price" numeric(12,2) NOT NULL,
    "discount" numeric(12,2) DEFAULT 0,
    "tax_rate" numeric(5,2) DEFAULT 0,
    "cogs_per_unit_cached" numeric(12,4) DEFAULT 0,
    "product_type" "text" DEFAULT 'Inventory'::"text",
    "unit" "text"
);


ALTER TABLE "public"."sales_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_no" "text",
    "sold_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "channel" "text",
    "customer_name" "text",
    "currency" "text" DEFAULT 'GBP'::"text",
    "notes" "text",
    "invoice_number" "text"
);


ALTER TABLE "public"."sales_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."storage_objects" WITH ("security_invoker"='true') AS
 SELECT "id",
    "name",
    "bucket_id",
    "owner",
    "created_at",
    "updated_at",
    "metadata"
   FROM "storage"."objects";


ALTER VIEW "public"."storage_objects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" NOT NULL,
    "due_date" "date",
    "apiary_id" "uuid",
    "hive_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "hive_name" "text",
    "archived_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "category" "text",
    "priority" "text",
    "source" "text",
    "seasonal_month" "text",
    "inspection_id" "uuid",
    CONSTRAINT "todos_status_chk" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."todos" OWNER TO "postgres";


COMMENT ON TABLE "public"."todos" IS 'Tasks created from NewTodo. "All Hives" is stored as NULL in hive_id.';



ALTER TABLE ONLY "private"."service_secrets"
    ADD CONSTRAINT "service_secrets_pkey" PRIMARY KEY ("name");



ALTER TABLE ONLY "public"."apiaries"
    ADD CONSTRAINT "apiaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."apiary_map_markers"
    ADD CONSTRAINT "apiary_map_markers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hives"
    ADD CONSTRAINT "hives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_user_hive_date_uniq" UNIQUE ("user_id", "hive_id", "date");



ALTER TABLE ONLY "public"."inventory_item_assignments"
    ADD CONSTRAINT "inventory_item_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_nfc_uid_key" UNIQUE ("nfc_uid");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."location_types"
    ADD CONSTRAINT "location_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."logbook"
    ADD CONSTRAINT "logbook_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."sales_lines"
    ADD CONSTRAINT "sales_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_orders"
    ADD CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");



CREATE INDEX "apiaries_active_idx" ON "public"."apiaries" USING "btree" ("id") WHERE ("archived_at" IS NULL);



CREATE INDEX "apiaries_active_user_idx" ON "public"."apiaries" USING "btree" ("user_id") WHERE ("archived_at" IS NULL);



CREATE INDEX "apiaries_archived_idx" ON "public"."apiaries" USING "btree" ("archived_at");



CREATE INDEX "apiaries_name_trgm_idx" ON "public"."apiaries" USING "gin" ("name" "extensions"."gin_trgm_ops");



CREATE UNIQUE INDEX "apiaries_one_default_per_user" ON "public"."apiaries" USING "btree" ("user_id") WHERE ("is_default" IS TRUE);



CREATE INDEX "apiaries_user_archived_created_idx" ON "public"."apiaries" USING "btree" ("user_id", "archived_at", "created_at" DESC);



CREATE INDEX "apiaries_user_archived_idx" ON "public"."apiaries" USING "btree" ("user_id", "archived_at");



CREATE INDEX "apiaries_user_id_idx" ON "public"."apiaries" USING "btree" ("user_id");



CREATE INDEX "apiaries_user_idx" ON "public"."apiaries" USING "btree" ("user_id");



CREATE UNIQUE INDEX "apiaries_user_name_active_uniq" ON "public"."apiaries" USING "btree" ("user_id", "lower"("name")) WHERE ("archived_at" IS NULL);



CREATE INDEX "apiary_map_markers_apiary_id_idx" ON "public"."apiary_map_markers" USING "btree" ("apiary_id");



CREATE INDEX "apiary_map_markers_type_idx" ON "public"."apiary_map_markers" USING "btree" ("type");



CREATE INDEX "apiary_map_markers_user_id_idx" ON "public"."apiary_map_markers" USING "btree" ("user_id");



CREATE INDEX "expenses_apiary_idx" ON "public"."expenses" USING "btree" ("apiary_id");



CREATE INDEX "expenses_hive_idx" ON "public"."expenses" USING "btree" ("hive_id");



CREATE INDEX "expenses_user_date_idx" ON "public"."expenses" USING "btree" ("user_id", "occurred_at");



CREATE INDEX "expenses_user_id_occurred_at_idx" ON "public"."expenses" USING "btree" ("user_id", "occurred_at" DESC);



CREATE INDEX "hives_active_idx" ON "public"."hives" USING "btree" ("id") WHERE ("archived_at" IS NULL);



CREATE INDEX "hives_active_user_apiary_idx" ON "public"."hives" USING "btree" ("user_id", "apiary_id") WHERE ("archived_at" IS NULL);



CREATE INDEX "hives_apiary_archived_created_idx" ON "public"."hives" USING "btree" ("apiary_id", "archived_at", "created_at" DESC);



CREATE INDEX "hives_apiary_id_idx" ON "public"."hives" USING "btree" ("apiary_id");



CREATE INDEX "hives_apiary_idx" ON "public"."hives" USING "btree" ("apiary_id");



CREATE UNIQUE INDEX "hives_apiary_name_active_uniq" ON "public"."hives" USING "btree" ("apiary_id", "lower"("name")) WHERE ("archived_at" IS NULL);



CREATE INDEX "hives_archived_idx" ON "public"."hives" USING "btree" ("archived_at");



CREATE INDEX "hives_created_at_idx" ON "public"."hives" USING "btree" ("created_at");



CREATE INDEX "hives_name_trgm_idx" ON "public"."hives" USING "gin" ("name" "extensions"."gin_trgm_ops");



CREATE UNIQUE INDEX "hives_nfc_uid_lower_uniq" ON "public"."hives" USING "btree" ("lower"("nfc_uid")) WHERE ("nfc_uid" IS NOT NULL);



CREATE UNIQUE INDEX "hives_nfc_uid_unique" ON "public"."hives" USING "btree" ("user_id", "lower"("nfc_uid")) WHERE (("nfc_uid" IS NOT NULL) AND ("archived_at" IS NULL));



CREATE UNIQUE INDEX "hives_nfc_uid_unique_active" ON "public"."hives" USING "btree" ("lower"("nfc_uid")) WHERE (("archived_at" IS NULL) AND ("nfc_uid" IS NOT NULL));



CREATE UNIQUE INDEX "hives_unique_nfc_active_idx" ON "public"."hives" USING "btree" ("lower"("nfc_uid")) WHERE (("archived_at" IS NULL) AND ("nfc_uid" IS NOT NULL) AND ("length"("btrim"("nfc_uid")) > 0));



CREATE INDEX "hives_user_apiary_archived_idx" ON "public"."hives" USING "btree" ("user_id", "apiary_id", "archived_at");



CREATE INDEX "hives_user_archived_created_idx" ON "public"."hives" USING "btree" ("user_id", "archived_at", "created_at" DESC);



CREATE INDEX "hives_user_id_idx" ON "public"."hives" USING "btree" ("user_id");



CREATE INDEX "hives_user_idx" ON "public"."hives" USING "btree" ("user_id");



CREATE UNIQUE INDEX "hives_user_nfc_uid_uniq" ON "public"."hives" USING "btree" ("user_id", "lower"("nfc_uid")) WHERE ("nfc_uid" IS NOT NULL);



CREATE INDEX "idx_apiaries_archived_at" ON "public"."apiaries" USING "btree" ("archived_at");



CREATE INDEX "idx_apiaries_is_default" ON "public"."apiaries" USING "btree" ("is_default");



CREATE INDEX "idx_apiaries_user_id" ON "public"."apiaries" USING "btree" ("user_id");



CREATE INDEX "idx_apiaries_user_id_fk" ON "public"."apiaries" USING "btree" ("user_id");



CREATE INDEX "idx_assign_apiary" ON "public"."inventory_item_assignments" USING "btree" ("apiary_id");



CREATE INDEX "idx_assign_hive" ON "public"."inventory_item_assignments" USING "btree" ("hive_id");



CREATE INDEX "idx_assign_item" ON "public"."inventory_item_assignments" USING "btree" ("item_id");



CREATE INDEX "idx_assign_level" ON "public"."inventory_item_assignments" USING "btree" ("level");



CREATE INDEX "idx_expenses_apiary_id_fk" ON "public"."expenses" USING "btree" ("apiary_id");



CREATE INDEX "idx_expenses_hive_id_fk" ON "public"."expenses" USING "btree" ("hive_id");



CREATE INDEX "idx_expenses_user_id_fk" ON "public"."expenses" USING "btree" ("user_id");



CREATE INDEX "idx_hives_apiary_id_fk" ON "public"."hives" USING "btree" ("apiary_id");



CREATE INDEX "idx_hives_user_id" ON "public"."hives" USING "btree" ("user_id");



CREATE INDEX "idx_hives_user_id_fk" ON "public"."hives" USING "btree" ("user_id");



CREATE INDEX "idx_inspections_apiary_id_fk" ON "public"."inspections" USING "btree" ("apiary_id");



CREATE INDEX "idx_inspections_hive_id_fk" ON "public"."inspections" USING "btree" ("hive_id");



CREATE INDEX "idx_inspections_user_id" ON "public"."inspections" USING "btree" ("user_id");



CREATE INDEX "idx_inspections_user_id_fk" ON "public"."inspections" USING "btree" ("user_id");



CREATE INDEX "idx_inventory_items_apiary" ON "public"."inventory_items" USING "btree" ("apiary_id");



CREATE INDEX "idx_inventory_items_apiary_id_fk" ON "public"."inventory_items" USING "btree" ("apiary_id");



CREATE INDEX "idx_inventory_items_hive" ON "public"."inventory_items" USING "btree" ("hive_id");



CREATE INDEX "idx_inventory_items_hive_id_fk" ON "public"."inventory_items" USING "btree" ("hive_id");



CREATE INDEX "idx_inventory_items_user" ON "public"."inventory_items" USING "btree" ("user_id");



CREATE INDEX "idx_inventory_items_user_id_fk" ON "public"."inventory_items" USING "btree" ("user_id");



CREATE INDEX "idx_logbook_apiary_id_fk" ON "public"."logbook" USING "btree" ("apiary_id");



CREATE INDEX "idx_logbook_hive_id_fk" ON "public"."logbook" USING "btree" ("hive_id");



CREATE INDEX "idx_logbook_user_id" ON "public"."logbook" USING "btree" ("user_id");



CREATE INDEX "idx_logbook_user_id_fk" ON "public"."logbook" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_default_apiary" ON "public"."profiles" USING "btree" ("default_apiary_id");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_stripe_customer" ON "public"."profiles" USING "btree" ("stripe_customer_id");



CREATE UNIQUE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_sales_lines_user_id_fk" ON "public"."sales_lines" USING "btree" ("user_id");



CREATE INDEX "idx_sales_orders_user_id_fk" ON "public"."sales_orders" USING "btree" ("user_id");



CREATE INDEX "idx_todos_apiary_id" ON "public"."todos" USING "btree" ("apiary_id");



CREATE INDEX "idx_todos_apiary_id_fk" ON "public"."todos" USING "btree" ("apiary_id");



CREATE INDEX "idx_todos_archived_at" ON "public"."todos" USING "btree" ("archived_at");



CREATE INDEX "idx_todos_due_date" ON "public"."todos" USING "btree" ("due_date");



CREATE INDEX "idx_todos_hive_id" ON "public"."todos" USING "btree" ("hive_id");



CREATE INDEX "idx_todos_hive_id_fk" ON "public"."todos" USING "btree" ("hive_id");



CREATE INDEX "idx_todos_inspection_id" ON "public"."todos" USING "btree" ("inspection_id");



CREATE INDEX "idx_todos_status" ON "public"."todos" USING "btree" ("status");



CREATE INDEX "idx_todos_user_id" ON "public"."todos" USING "btree" ("user_id");



CREATE INDEX "idx_todos_user_id_fk" ON "public"."todos" USING "btree" ("user_id");



CREATE INDEX "inspections_active_idx" ON "public"."inspections" USING "btree" ("id") WHERE ("archived_at" IS NULL);



CREATE INDEX "inspections_active_user_date_idx" ON "public"."inspections" USING "btree" ("user_id", "date" DESC) WHERE ("archived_at" IS NULL);



CREATE INDEX "inspections_apiary_archived_date_idx" ON "public"."inspections" USING "btree" ("apiary_id", "archived_at", "date" DESC);



CREATE INDEX "inspections_apiary_idx" ON "public"."inspections" USING "btree" ("apiary_id");



CREATE INDEX "inspections_archived_idx" ON "public"."inspections" USING "btree" ("archived_at");



CREATE INDEX "inspections_by_hive" ON "public"."inspections" USING "btree" ("user_id", "hive_id") WHERE ("archived_at" IS NULL);



CREATE INDEX "inspections_by_nfc" ON "public"."inspections" USING "btree" ("user_id", "nfc_uid") WHERE (("nfc_uid" IS NOT NULL) AND ("archived_at" IS NULL));



CREATE INDEX "inspections_hive_archived_date_idx" ON "public"."inspections" USING "btree" ("hive_id", "archived_at", "date" DESC);



CREATE INDEX "inspections_hive_idx" ON "public"."inspections" USING "btree" ("hive_id");



CREATE INDEX "inspections_user_archived_date_idx" ON "public"."inspections" USING "btree" ("user_id", "archived_at", "date" DESC);



CREATE INDEX "inspections_user_id_idx" ON "public"."inspections" USING "btree" ("user_id");



CREATE INDEX "inspections_user_idx" ON "public"."inspections" USING "btree" ("user_id");



CREATE INDEX "inventory_items_cat_idx" ON "public"."inventory_items" USING "btree" ("category", "subcategory");



CREATE INDEX "inventory_items_nfc_uid_idx" ON "public"."inventory_items" USING "btree" ("nfc_uid");



CREATE INDEX "inventory_items_user_id_idx" ON "public"."inventory_items" USING "btree" ("user_id");



CREATE INDEX "logbook_active_user_created_idx" ON "public"."logbook" USING "btree" ("user_id", "created_at" DESC) WHERE ("archived_at" IS NULL);



CREATE INDEX "logbook_apiary_idx" ON "public"."logbook" USING "btree" ("apiary_id");



CREATE INDEX "logbook_date_idx" ON "public"."logbook" USING "btree" ("date");



CREATE INDEX "logbook_hive_idx" ON "public"."logbook" USING "btree" ("hive_id");



CREATE INDEX "logbook_inspection_idx" ON "public"."logbook" USING "btree" ("inspection_id");



CREATE INDEX "logbook_user_archived_created_idx" ON "public"."logbook" USING "btree" ("user_id", "archived_at", "created_at" DESC);



CREATE INDEX "logbook_user_idx" ON "public"."logbook" USING "btree" ("user_id");



CREATE INDEX "sales_lines_user_order_idx" ON "public"."sales_lines" USING "btree" ("user_id", "order_id");



CREATE INDEX "sales_orders_user_date_idx" ON "public"."sales_orders" USING "btree" ("user_id", "sold_at");



CREATE INDEX "todos_active_user_duedate_idx" ON "public"."todos" USING "btree" ("user_id", "due_date") WHERE ("archived_at" IS NULL);



CREATE INDEX "todos_status_due_idx" ON "public"."todos" USING "btree" ("status", "due_date") WHERE ("archived_at" IS NULL);



CREATE INDEX "todos_title_trgm_idx" ON "public"."todos" USING "gin" ("title" "extensions"."gin_trgm_ops");



CREATE INDEX "todos_user_archived_duedate_idx" ON "public"."todos" USING "btree" ("user_id", "archived_at", "due_date");



CREATE OR REPLACE TRIGGER "hives_block_restore_parent_archived" BEFORE UPDATE ON "public"."hives" FOR EACH ROW WHEN ((("old"."archived_at" IS NOT NULL) AND ("new"."archived_at" IS NULL))) EXECUTE FUNCTION "public"."hives_block_restore_if_parent_archived"();



CREATE OR REPLACE TRIGGER "hives_sync_user_from_apiary" BEFORE INSERT OR UPDATE OF "apiary_id" ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."tg_hives_sync_user_from_apiary"();



CREATE OR REPLACE TRIGGER "inspections_block_restore_parents_archived" BEFORE UPDATE ON "public"."inspections" FOR EACH ROW WHEN ((("old"."archived_at" IS NOT NULL) AND ("new"."archived_at" IS NULL))) EXECUTE FUNCTION "public"."inspections_block_restore_if_parents_archived"();



CREATE OR REPLACE TRIGGER "inspections_enforce_consistency" BEFORE INSERT OR UPDATE OF "apiary_id", "hive_id" ON "public"."inspections" FOR EACH ROW EXECUTE FUNCTION "public"."tg_inspections_enforce_consistency"();



CREATE OR REPLACE TRIGGER "inventory_item_assignments_updated_at" BEFORE UPDATE ON "public"."inventory_item_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"();



CREATE OR REPLACE TRIGGER "logbook_block_restore_parent_archived" BEFORE UPDATE ON "public"."logbook" FOR EACH ROW WHEN ((("old"."archived_at" IS NOT NULL) AND ("new"."archived_at" IS NULL))) EXECUTE FUNCTION "public"."logbook_block_restore_if_parent_archived"();



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_touch_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."tg_profiles_touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_user_id_default_apiaries" BEFORE INSERT ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_id_default"();



CREATE OR REPLACE TRIGGER "set_user_id_default_hives" BEFORE INSERT ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_id_default"();



CREATE OR REPLACE TRIGGER "set_user_id_default_inspections" BEFORE INSERT ON "public"."inspections" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_id_default"();



CREATE OR REPLACE TRIGGER "t_logbook_updated_at" BEFORE UPDATE ON "public"."logbook" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "todos_block_restore_parent_archived" BEFORE UPDATE ON "public"."todos" FOR EACH ROW WHEN ((("old"."archived_at" IS NOT NULL) AND ("new"."archived_at" IS NULL))) EXECUTE FUNCTION "public"."todos_block_restore_if_parent_archived"();



CREATE OR REPLACE TRIGGER "trg_apiaries_del_files" AFTER DELETE ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_apiaries_photo_del" AFTER DELETE ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."t_delete_photo_url"();



CREATE OR REPLACE TRIGGER "trg_apiaries_upd_files" BEFORE UPDATE ON "public"."apiaries" FOR EACH ROW WHEN (("to_jsonb"("old".*) IS DISTINCT FROM "to_jsonb"("new".*))) EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();

ALTER TABLE "public"."apiaries" DISABLE TRIGGER "trg_apiaries_upd_files";



CREATE OR REPLACE TRIGGER "trg_apiary_map_markers_updated_at" BEFORE UPDATE ON "public"."apiary_map_markers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_archive_on_downgrade" AFTER UPDATE OF "subscription_level" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_downgrade_archive"();



CREATE OR REPLACE TRIGGER "trg_cascade_archive_apiary" AFTER UPDATE OF "archived_at" ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_archive_apiary"();



CREATE OR REPLACE TRIGGER "trg_cascade_archive_hive" AFTER UPDATE OF "archived_at" ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_archive_hive"();



CREATE OR REPLACE TRIGGER "trg_cascade_archive_inspection" AFTER UPDATE OF "archived_at" ON "public"."inspections" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_archive_inspection"();



CREATE OR REPLACE TRIGGER "trg_enforce_free_apiary_limit" BEFORE INSERT ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_free_apiary_limit"();



CREATE OR REPLACE TRIGGER "trg_enforce_free_apiary_unarchive" BEFORE UPDATE ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_free_apiary_unarchive_limit"();



CREATE OR REPLACE TRIGGER "trg_enforce_free_hive_limit" BEFORE INSERT ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_free_hive_limit"();



CREATE OR REPLACE TRIGGER "trg_enforce_free_hive_unarchive" BEFORE UPDATE ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_free_hive_unarchive_limit"();



CREATE OR REPLACE TRIGGER "trg_hives_del_files" AFTER DELETE ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_hives_photo_del" AFTER DELETE ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."t_delete_photo_url"();



CREATE OR REPLACE TRIGGER "trg_hives_upd_files" BEFORE UPDATE ON "public"."hives" FOR EACH ROW WHEN (("to_jsonb"("old".*) IS DISTINCT FROM "to_jsonb"("new".*))) EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_inspections_del_files" AFTER DELETE ON "public"."inspections" FOR EACH ROW EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_inspections_upd_files" BEFORE UPDATE ON "public"."inspections" FOR EACH ROW WHEN (("to_jsonb"("old".*) IS DISTINCT FROM "to_jsonb"("new".*))) EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_inventory_items_del_files" AFTER DELETE ON "public"."inventory_items" FOR EACH ROW EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_inventory_items_upd_files" BEFORE UPDATE ON "public"."inventory_items" FOR EACH ROW WHEN (("to_jsonb"("old".*) IS DISTINCT FROM "to_jsonb"("new".*))) EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_logbook_del_files" AFTER DELETE ON "public"."logbook" FOR EACH ROW EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_logbook_upd_files" BEFORE UPDATE ON "public"."logbook" FOR EACH ROW WHEN (("to_jsonb"("old".*) IS DISTINCT FROM "to_jsonb"("new".*))) EXECUTE FUNCTION "public"."app_delete_storage_urls_from_row"();



CREATE OR REPLACE TRIGGER "trg_normalize_hive_nfc" BEFORE INSERT OR UPDATE OF "nfc_uid" ON "public"."hives" FOR EACH ROW EXECUTE FUNCTION "public"."normalize_hive_nfc"();



CREATE OR REPLACE TRIGGER "trg_sync_profile_default_apiary" AFTER INSERT OR UPDATE OF "is_default", "archived_at" ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."sync_profile_default_apiary"();



CREATE OR REPLACE TRIGGER "trg_sync_profile_default_apiary_delete" AFTER DELETE ON "public"."apiaries" FOR EACH ROW EXECUTE FUNCTION "public"."sync_profile_default_apiary"();



CREATE OR REPLACE TRIGGER "trg_todos_set_completed_at" BEFORE INSERT OR UPDATE ON "public"."todos" FOR EACH ROW EXECUTE FUNCTION "public"."todos_set_completed_at"();



CREATE OR REPLACE TRIGGER "trg_todos_updated_at" BEFORE UPDATE ON "public"."todos" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."apiaries"
    ADD CONSTRAINT "apiaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."apiary_map_markers"
    ADD CONSTRAINT "apiary_map_markers_apiary_fk" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "public"."hives"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hives"
    ADD CONSTRAINT "hives_apiary_fk" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."hives"
    ADD CONSTRAINT "hives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "public"."hives"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_item_assignments"
    ADD CONSTRAINT "inventory_item_assignments_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_item_assignments"
    ADD CONSTRAINT "inventory_item_assignments_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "public"."hives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_item_assignments"
    ADD CONSTRAINT "inventory_item_assignments_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_apiary_fk" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_hive_fk" FOREIGN KEY ("hive_id") REFERENCES "public"."hives"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."logbook"
    ADD CONSTRAINT "logbook_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."logbook"
    ADD CONSTRAINT "logbook_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "public"."hives"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."logbook"
    ADD CONSTRAINT "logbook_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."logbook"
    ADD CONSTRAINT "logbook_user_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_default_apiary_id_fkey" FOREIGN KEY ("default_apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_lines"
    ADD CONSTRAINT "sales_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_lines"
    ADD CONSTRAINT "sales_lines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_orders"
    ADD CONSTRAINT "sales_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "public"."apiaries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "public"."hives"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_user_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "deny_all" ON "private"."service_secrets" USING (false);



ALTER TABLE "private"."service_secrets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."apiaries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "apiaries_delete_own" ON "public"."apiaries" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "apiaries_insert" ON "public"."apiaries" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ( SELECT "public"."can_create_apiary"() AS "can_create_apiary")));



CREATE POLICY "apiaries_select_own" ON "public"."apiaries" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "apiaries_update_own" ON "public"."apiaries" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND (("archived_at" IS NOT NULL) OR ( SELECT "public"."can_activate_apiary"("apiaries"."id") AS "can_activate_apiary"))));



ALTER TABLE "public"."apiary_map_markers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "apiary_map_markers_delete_own" ON "public"."apiary_map_markers" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "apiary_map_markers_insert_own" ON "public"."apiary_map_markers" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "apiary_map_markers_select_own" ON "public"."apiary_map_markers" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "apiary_map_markers_update_own" ON "public"."apiary_map_markers" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "expenses_owner_del" ON "public"."expenses" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "expenses_owner_ins" ON "public"."expenses" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "expenses_owner_sel" ON "public"."expenses" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "expenses_owner_upd" ON "public"."expenses" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."hives" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "hives_delete_own" ON "public"."hives" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "hives_insert_own" ON "public"."hives" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ( SELECT "public"."can_create_hive"() AS "can_create_hive") AND (EXISTS ( SELECT 1
   FROM "public"."apiaries" "a"
  WHERE (("a"."id" = "hives"."apiary_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "hives_select_own" ON "public"."hives" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "hives_update_own" ON "public"."hives" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND (("archived_at" IS NOT NULL) OR ( SELECT "public"."can_activate_hive"("hives"."id") AS "can_activate_hive"))));



ALTER TABLE "public"."inspections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inspections_delete_own" ON "public"."inspections" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "inspections_insert_own" ON "public"."inspections" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "inspections_select_own" ON "public"."inspections" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "inspections_update_own" ON "public"."inspections" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."inventory_item_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_items_owner_del" ON "public"."inventory_items" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "inventory_items_owner_ins" ON "public"."inventory_items" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "inventory_items_owner_sel" ON "public"."inventory_items" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "inventory_items_owner_upd" ON "public"."inventory_items" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."location_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."logbook" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "logbook_delete_own" ON "public"."logbook" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "logbook_insert_own" ON "public"."logbook" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "logbook_select_own" ON "public"."logbook" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "logbook_update_own" ON "public"."logbook" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "owner can delete assignments" ON "public"."inventory_item_assignments" FOR DELETE USING (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "owner can insert assignments" ON "public"."inventory_item_assignments" FOR INSERT WITH CHECK (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "owner can update assignments" ON "public"."inventory_item_assignments" FOR UPDATE USING (("owner_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "owner can view assignments" ON "public"."inventory_item_assignments" FOR SELECT USING (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_own" ON "public"."profiles" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "profiles_self_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "profiles_update_self" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "profiles_upsert_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "read all" ON "public"."location_types" FOR SELECT USING (true);



ALTER TABLE "public"."sales_lines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sales_lines_owners_rw" ON "public"."sales_lines" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."sales_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sales_orders_owners_rw" ON "public"."sales_orders" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_settings_read_authenticated" ON "public"."site_settings" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."todos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "todos_delete_own" ON "public"."todos" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "todos_insert_own" ON "public"."todos" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "todos_select_own" ON "public"."todos" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "todos_update_own" ON "public"."todos" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."app_delete_storage_from_url"("url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."app_delete_storage_from_url"("url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."app_delete_storage_from_url"("url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."app_delete_storage_urls_from_row"() TO "anon";
GRANT ALL ON FUNCTION "public"."app_delete_storage_urls_from_row"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."app_delete_storage_urls_from_row"() TO "service_role";



GRANT ALL ON FUNCTION "public"."app_is_member"("uid" "uuid", "grp" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."app_is_member"("uid" "uuid", "grp" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."app_is_member"("uid" "uuid", "grp" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_activate_apiary"("target_apiary_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_activate_apiary"("target_apiary_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_activate_apiary"("target_apiary_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_activate_apiary"("target_apiary_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_activate_hive"("target_hive_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_activate_hive"("target_hive_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_activate_hive"("target_hive_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_activate_hive"("target_hive_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_create_apiary"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_create_apiary"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_apiary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_apiary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_apiary"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_apiary"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_apiary"("uid" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_create_hive"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_create_hive"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_hive"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_hive"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cascade_archive_apiary"() TO "anon";
GRANT ALL ON FUNCTION "public"."cascade_archive_apiary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cascade_archive_apiary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cascade_archive_hive"() TO "anon";
GRANT ALL ON FUNCTION "public"."cascade_archive_hive"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cascade_archive_hive"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cascade_archive_inspection"() TO "anon";
GRANT ALL ON FUNCTION "public"."cascade_archive_inspection"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cascade_archive_inspection"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_apiary_children"("apiary_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_apiary_children"("apiary_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_apiary_children"("apiary_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_apiary_children_v2"("p_apiary_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_apiary_children_v2"("p_apiary_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_apiary_children_v2"("p_apiary_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_hive_children"("hive_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_hive_children"("hive_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_hive_children"("hive_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_hive_children_v2"("p_hive_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_hive_children_v2"("p_hive_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_hive_children_v2"("p_hive_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_inspection_children"("inspection_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_inspection_children"("inspection_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_inspection_children"("inspection_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_inspection_children_v2"("p_inspection_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_inspection_children_v2"("p_inspection_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_inspection_children_v2"("p_inspection_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."collect_user_photo_paths"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."collect_user_photo_paths"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."collect_user_photo_paths"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."compute_remind_at"("p_user_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_due_at" timestamp with time zone, "p_offset_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."compute_remind_at"("p_user_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_due_at" timestamp with time zone, "p_offset_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."compute_remind_at"("p_user_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_due_at" timestamp with time zone, "p_offset_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_my_account"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_my_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_my_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_my_account"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_user"("uid" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_user"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_free_apiary_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_free_apiary_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_free_apiary_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_free_apiary_unarchive_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_free_apiary_unarchive_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_free_apiary_unarchive_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_free_hive_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_free_hive_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_free_hive_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_free_hive_unarchive_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_free_hive_unarchive_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_free_hive_unarchive_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_due_task_emails_dry_run"() TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_due_task_emails_dry_run"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_due_task_emails_dry_run"() TO "service_role";



GRANT ALL ON FUNCTION "public"."group_member_counts"("g_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."group_member_counts"("g_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."group_member_counts"("g_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_downgrade_archive"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_downgrade_archive"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_downgrade_archive"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hives_block_restore_if_parent_archived"() TO "anon";
GRANT ALL ON FUNCTION "public"."hives_block_restore_if_parent_archived"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."hives_block_restore_if_parent_archived"() TO "service_role";



GRANT ALL ON FUNCTION "public"."inspection_rank"("p_inspection_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_from" "date", "p_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."inspection_rank"("p_inspection_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_from" "date", "p_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inspection_rank"("p_inspection_id" "uuid", "p_apiary_id" "uuid", "p_hive_id" "uuid", "p_from" "date", "p_to" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."inspections_block_restore_if_parents_archived"() TO "anon";
GRANT ALL ON FUNCTION "public"."inspections_block_restore_if_parents_archived"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."inspections_block_restore_if_parents_archived"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_group_member"("p_group_id" "uuid", "p_user" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_group_member"("p_group_id" "uuid", "p_user" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_group_member"("p_group_id" "uuid", "p_user" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."jwt"() TO "anon";
GRANT ALL ON FUNCTION "public"."jwt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."jwt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."logbook_block_restore_if_parent_archived"() TO "anon";
GRANT ALL ON FUNCTION "public"."logbook_block_restore_if_parent_archived"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."logbook_block_restore_if_parent_archived"() TO "service_role";



GRANT ALL ON FUNCTION "public"."moddatetime"() TO "anon";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_hive_nfc"() TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_hive_nfc"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_hive_nfc"() TO "service_role";



GRANT ALL ON FUNCTION "public"."pl_summary"("p_year" integer, "p_month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."pl_summary"("p_year" integer, "p_month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."pl_summary"("p_year" integer, "p_month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."role"() TO "anon";
GRANT ALL ON FUNCTION "public"."role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_due_task_emails"("limit_rows" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."send_due_task_emails"("limit_rows" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_due_task_emails"("limit_rows" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_id_default"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_id_default"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_id_default"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_profile_default_apiary"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_profile_default_apiary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_profile_default_apiary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_profile_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_profile_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_profile_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."t_delete_photo_url"() TO "anon";
GRANT ALL ON FUNCTION "public"."t_delete_photo_url"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."t_delete_photo_url"() TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_hives_sync_user_from_apiary"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_hives_sync_user_from_apiary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_hives_sync_user_from_apiary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_inspections_enforce_consistency"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_inspections_enforce_consistency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_inspections_enforce_consistency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_profiles_touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_profiles_touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_profiles_touch_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."todos_block_restore_if_parent_archived"() TO "anon";
GRANT ALL ON FUNCTION "public"."todos_block_restore_if_parent_archived"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."todos_block_restore_if_parent_archived"() TO "service_role";



GRANT ALL ON FUNCTION "public"."todos_set_completed_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."todos_set_completed_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."todos_set_completed_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."todos_set_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."todos_set_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."todos_set_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uid"() TO "anon";
GRANT ALL ON FUNCTION "public"."uid"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uid"() TO "service_role";
























GRANT ALL ON TABLE "public"."apiaries" TO "anon";
GRANT ALL ON TABLE "public"."apiaries" TO "authenticated";
GRANT ALL ON TABLE "public"."apiaries" TO "service_role";



GRANT ALL ON TABLE "public"."apiary_map_markers" TO "anon";
GRANT ALL ON TABLE "public"."apiary_map_markers" TO "authenticated";
GRANT ALL ON TABLE "public"."apiary_map_markers" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."hives" TO "anon";
GRANT ALL ON TABLE "public"."hives" TO "authenticated";
GRANT ALL ON TABLE "public"."hives" TO "service_role";



GRANT ALL ON TABLE "public"."inspections" TO "anon";
GRANT ALL ON TABLE "public"."inspections" TO "authenticated";
GRANT ALL ON TABLE "public"."inspections" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_item_assignments" TO "anon";
GRANT ALL ON TABLE "public"."inventory_item_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_item_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_items" TO "service_role";



GRANT ALL ON TABLE "public"."location_types" TO "anon";
GRANT ALL ON TABLE "public"."location_types" TO "authenticated";
GRANT ALL ON TABLE "public"."location_types" TO "service_role";



GRANT ALL ON TABLE "public"."logbook" TO "anon";
GRANT ALL ON TABLE "public"."logbook" TO "authenticated";
GRANT ALL ON TABLE "public"."logbook" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sales_lines" TO "anon";
GRANT ALL ON TABLE "public"."sales_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_lines" TO "service_role";



GRANT ALL ON TABLE "public"."sales_orders" TO "anon";
GRANT ALL ON TABLE "public"."sales_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_orders" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."storage_objects" TO "anon";
GRANT ALL ON TABLE "public"."storage_objects" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_objects" TO "service_role";



GRANT ALL ON TABLE "public"."todos" TO "anon";
GRANT ALL ON TABLE "public"."todos" TO "authenticated";
GRANT ALL ON TABLE "public"."todos" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























