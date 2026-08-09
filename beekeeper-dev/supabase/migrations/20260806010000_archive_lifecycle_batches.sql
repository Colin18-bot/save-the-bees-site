-- HiveTag coordinated archive, restore and delete lifecycle
-- Staging migration
-- Apply after:
--   20260806001500_hive_queen_lifecycle.sql
--
-- This migration:
--   • records why and as part of which operation each row was archived;
--   • restores only records archived by the same parent operation;
--   • preserves current Queen assignments/processes during apiary and downgrade archives;
--   • keeps individual hive archives as genuine Queen lifecycle events;
--   • archives/restores inspections with their linked tasks and logbook entries atomically;
--   • provides accurate all-record delete summaries;
--   • provides service-role permanent deletion for apiaries and inspections.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Archive provenance
-- ---------------------------------------------------------------------------

alter table public.apiaries
  add column if not exists archive_batch_id uuid,
  add column if not exists archive_source text;

alter table public.hives
  add column if not exists archive_batch_id uuid,
  add column if not exists archive_source text;

alter table public.inspections
  add column if not exists archive_batch_id uuid,
  add column if not exists archive_source text;

alter table public.todos
  add column if not exists archive_batch_id uuid,
  add column if not exists archive_source text;

alter table public.logbook
  add column if not exists archive_batch_id uuid,
  add column if not exists archive_source text;

comment on column public.apiaries.archive_batch_id is
  'Groups the apiary and only those child rows archived by the same operation.';
comment on column public.apiaries.archive_source is
  'manual, downgrade or legacy. Child rows use apiary/downgrade provenance.';

comment on column public.hives.archive_batch_id is
  'Groups the hive and only those child rows archived by the same operation.';
comment on column public.hives.archive_source is
  'manual, apiary, downgrade or legacy.';

comment on column public.inspections.archive_batch_id is
  'Groups the inspection and only those child rows archived by the same operation.';
comment on column public.inspections.archive_source is
  'manual, apiary, hive, downgrade or legacy.';

comment on column public.todos.archive_batch_id is
  'Archive operation identifier used for safe parent restoration.';
comment on column public.todos.archive_source is
  'manual, apiary, hive, inspection, downgrade or legacy.';

comment on column public.logbook.archive_batch_id is
  'Archive operation identifier used for safe parent restoration.';
comment on column public.logbook.archive_source is
  'manual, apiary, hive, inspection, downgrade or legacy.';

create index if not exists apiaries_archive_batch_idx
  on public.apiaries(user_id, archive_batch_id)
  where archived_at is not null;

create index if not exists hives_archive_batch_idx
  on public.hives(user_id, archive_batch_id)
  where archived_at is not null;

create index if not exists inspections_archive_batch_idx
  on public.inspections(user_id, archive_batch_id)
  where archived_at is not null;

create index if not exists todos_archive_batch_idx
  on public.todos(user_id, archive_batch_id)
  where archived_at is not null;

create index if not exists logbook_archive_batch_idx
  on public.logbook(user_id, archive_batch_id)
  where archived_at is not null;

-- Existing archived records cannot safely be reconstructed into historical
-- parent batches, so mark each as a separate legacy archive.
update public.apiaries
set
  archive_batch_id = coalesce(archive_batch_id, gen_random_uuid()),
  archive_source = coalesce(nullif(archive_source, ''), 'legacy')
where archived_at is not null;

update public.hives
set
  archive_batch_id = coalesce(archive_batch_id, gen_random_uuid()),
  archive_source = coalesce(nullif(archive_source, ''), 'legacy')
where archived_at is not null;

update public.inspections
set
  archive_batch_id = coalesce(archive_batch_id, gen_random_uuid()),
  archive_source = coalesce(nullif(archive_source, ''), 'legacy')
where archived_at is not null;

update public.todos
set
  archive_batch_id = coalesce(archive_batch_id, gen_random_uuid()),
  archive_source = coalesce(nullif(archive_source, ''), 'legacy')
where archived_at is not null;

update public.logbook
set
  archive_batch_id = coalesce(archive_batch_id, gen_random_uuid()),
  archive_source = coalesce(nullif(archive_source, ''), 'legacy')
where archived_at is not null;

update public.apiaries
set archive_batch_id = null, archive_source = null
where archived_at is null
  and (archive_batch_id is not null or archive_source is not null);

update public.hives
set archive_batch_id = null, archive_source = null
where archived_at is null
  and (archive_batch_id is not null or archive_source is not null);

update public.inspections
set archive_batch_id = null, archive_source = null
where archived_at is null
  and (archive_batch_id is not null or archive_source is not null);

update public.todos
set archive_batch_id = null, archive_source = null
where archived_at is null
  and (archive_batch_id is not null or archive_source is not null);

update public.logbook
set archive_batch_id = null, archive_source = null
where archived_at is null
  and (archive_batch_id is not null or archive_source is not null);

-- Any direct legacy update of archived_at receives a safe manual batch.
create or replace function public.tg_prepare_archive_metadata()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.archived_at is null and new.archived_at is not null then
    new.archive_batch_id := coalesce(new.archive_batch_id, gen_random_uuid());
    new.archive_source := coalesce(nullif(trim(new.archive_source), ''), 'manual');
  elsif old.archived_at is not null and new.archived_at is null then
    new.archive_batch_id := null;
    new.archive_source := null;
  end if;

  return new;
end;
$$;

drop trigger if exists aa_prepare_archive_metadata on public.apiaries;
create trigger aa_prepare_archive_metadata
before update of archived_at on public.apiaries
for each row
execute function public.tg_prepare_archive_metadata();

drop trigger if exists aa_prepare_archive_metadata on public.hives;
create trigger aa_prepare_archive_metadata
before update of archived_at on public.hives
for each row
execute function public.tg_prepare_archive_metadata();

drop trigger if exists aa_prepare_archive_metadata on public.inspections;
create trigger aa_prepare_archive_metadata
before update of archived_at on public.inspections
for each row
execute function public.tg_prepare_archive_metadata();

drop trigger if exists aa_prepare_archive_metadata on public.todos;
create trigger aa_prepare_archive_metadata
before update of archived_at on public.todos
for each row
execute function public.tg_prepare_archive_metadata();

drop trigger if exists aa_prepare_archive_metadata on public.logbook;
create trigger aa_prepare_archive_metadata
before update of archived_at on public.logbook
for each row
execute function public.tg_prepare_archive_metadata();

-- ---------------------------------------------------------------------------
-- Batch-aware archive cascades
-- ---------------------------------------------------------------------------

create or replace function public.cascade_archive_apiary()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_child_source text;
begin
  if old.archived_at is null and new.archived_at is not null then
    v_child_source :=
      case
        when new.archive_source = 'downgrade' then 'downgrade'
        else 'apiary'
      end;

    update public.todos
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and apiary_id = new.id
      and archived_at is null;

    update public.logbook
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and apiary_id = new.id
      and archived_at is null;

    -- The hive trigger handles hive-linked inspections, tasks and logs.
    update public.hives
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and apiary_id = new.id
      and archived_at is null;
  end if;

  return new;
end;
$$;

create or replace function public.cascade_archive_hive()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_child_source text;
begin
  if old.archived_at is null and new.archived_at is not null then
    v_child_source :=
      case
        when new.archive_source in ('apiary', 'downgrade') then new.archive_source
        else 'hive'
      end;

    update public.todos
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and hive_id = new.id
      and archived_at is null;

    update public.logbook
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and hive_id = new.id
      and archived_at is null;

    -- The inspection trigger handles inspection-linked tasks and logs.
    update public.inspections
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and hive_id = new.id
      and archived_at is null;
  end if;

  return new;
end;
$$;

create or replace function public.cascade_archive_inspection()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_child_source text;
begin
  if old.archived_at is null and new.archived_at is not null then
    v_child_source :=
      case
        when new.archive_source in ('apiary', 'hive', 'downgrade')
          then new.archive_source
        else 'inspection'
      end;

    update public.todos
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and inspection_id = new.id
      and archived_at is null;

    update public.logbook
    set
      archived_at = new.archived_at,
      archive_batch_id = new.archive_batch_id,
      archive_source = v_child_source
    where user_id = new.user_id
      and inspection_id = new.id
      and archived_at is null;
  end if;

  return new;
end;
$$;

-- Keep the existing trigger names, but ensure they execute the new functions.
drop trigger if exists trg_cascade_archive_apiary on public.apiaries;
create trigger trg_cascade_archive_apiary
after update of archived_at on public.apiaries
for each row
execute function public.cascade_archive_apiary();

drop trigger if exists trg_cascade_archive_hive on public.hives;
create trigger trg_cascade_archive_hive
after update of archived_at on public.hives
for each row
execute function public.cascade_archive_hive();

drop trigger if exists trg_cascade_archive_inspection on public.inspections;
create trigger trg_cascade_archive_inspection
after update of archived_at on public.inspections
for each row
execute function public.cascade_archive_inspection();

-- Apiary and plan-downgrade archives are administrative/temporary. They must
-- not close the current Queen assignment or active Queen process.
drop trigger if exists zz_hive_queen_archive_lifecycle on public.hives;
create trigger zz_hive_queen_archive_lifecycle
before update of archived_at on public.hives
for each row
when (
  old.archived_at is null
  and new.archived_at is not null
  and coalesce(new.archive_source, 'manual') not in ('apiary', 'downgrade')
)
execute function public.tg_hive_queen_archive_lifecycle();

-- ---------------------------------------------------------------------------
-- Downgrade archive provenance
-- ---------------------------------------------------------------------------

create or replace function public.handle_downgrade_archive()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := new.user_id;
  oldsub text := coalesce(lower(trim(old.subscription_level)), 'free');
  newsub text := coalesce(lower(trim(new.subscription_level)), 'free');
  keep_apiary uuid;
  v_batch uuid := gen_random_uuid();
  v_now timestamptz := now();
begin
  if not (oldsub <> 'free' and newsub = 'free') then
    return new;
  end if;

  select a.id
  into keep_apiary
  from public.apiaries a
  where a.user_id = uid
    and a.archived_at is null
    and a.id = new.default_apiary_id
  limit 1;

  if keep_apiary is null then
    select a.id
    into keep_apiary
    from public.apiaries a
    where a.user_id = uid
      and a.archived_at is null
    order by a.id desc
    limit 1;
  end if;

  if keep_apiary is not null then
    update public.apiaries
    set
      archived_at = v_now,
      archive_batch_id = v_batch,
      archive_source = 'downgrade'
    where user_id = uid
      and archived_at is null
      and id <> keep_apiary;
  end if;

  if keep_apiary is not null then
    with ranked as (
      select
        h.id,
        row_number() over(order by h.id desc) as rn
      from public.hives h
      where h.apiary_id = keep_apiary
        and h.user_id = uid
        and h.archived_at is null
    )
    update public.hives h
    set
      archived_at = v_now,
      archive_batch_id = v_batch,
      archive_source = 'downgrade'
    from ranked r
    where h.id = r.id
      and r.rn > 2;
  end if;

  -- Defensive consistency repair for an already-archived apiary that still
  -- contains an active hive.
  update public.hives h
  set
    archived_at = coalesce(a.archived_at, v_now),
    archive_batch_id = coalesce(a.archive_batch_id, v_batch),
    archive_source =
      case
        when a.archive_source = 'downgrade' then 'downgrade'
        else 'apiary'
      end
  from public.apiaries a
  where a.id = h.apiary_id
    and a.user_id = uid
    and a.archived_at is not null
    and h.archived_at is null;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Authenticated atomic archive and restore actions
-- ---------------------------------------------------------------------------

create or replace function public.archive_apiary_lifecycle(
  p_apiary_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_batch uuid := gen_random_uuid();
  v_already_archived boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select a.archived_at is not null
  into v_already_archived
  from public.apiaries a
  where a.id = p_apiary_id
    and a.user_id = v_uid
  for update;

  if v_already_archived is null then
    raise exception 'Apiary not found';
  end if;

  if not v_already_archived then
    update public.apiaries
    set
      archived_at = now(),
      archive_batch_id = v_batch,
      archive_source = 'manual'
    where id = p_apiary_id
      and user_id = v_uid;
  else
    select archive_batch_id
    into v_batch
    from public.apiaries
    where id = p_apiary_id
      and user_id = v_uid;
  end if;

  return jsonb_build_object(
    'ok', true,
    'apiary_id', p_apiary_id,
    'archive_batch_id', v_batch,
    'already_archived', v_already_archived
  );
end;
$$;

create or replace function public.restore_apiary_lifecycle(
  p_apiary_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_batch uuid;
  v_source text;
  v_child_source text;
  v_hives integer := 0;
  v_inspections integer := 0;
  v_todos integer := 0;
  v_logs integer := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select a.archive_batch_id, a.archive_source
  into v_batch, v_source
  from public.apiaries a
  where a.id = p_apiary_id
    and a.user_id = v_uid
    and a.archived_at is not null
  for update;

  if not found then
    raise exception 'Archived apiary not found';
  end if;

  v_child_source :=
    case
      when v_source = 'downgrade' then 'downgrade'
      when v_source = 'legacy' then 'legacy'
      else 'apiary'
    end;

  update public.apiaries
  set archived_at = null
  where id = p_apiary_id
    and user_id = v_uid;

  if v_source <> 'legacy' then
    update public.hives
    set archived_at = null
    where user_id = v_uid
      and apiary_id = p_apiary_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_hives = row_count;

    update public.inspections
    set archived_at = null
    where user_id = v_uid
      and apiary_id = p_apiary_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_inspections = row_count;

    update public.todos
    set archived_at = null
    where user_id = v_uid
      and apiary_id = p_apiary_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_todos = row_count;

    update public.logbook
    set archived_at = null
    where user_id = v_uid
      and apiary_id = p_apiary_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_logs = row_count;
  end if;

  return jsonb_build_object(
    'ok', true,
    'apiary_id', p_apiary_id,
    'restored_hives', v_hives,
    'restored_inspections', v_inspections,
    'restored_todos', v_todos,
    'restored_logs', v_logs,
    'queen_lifecycle_preserved', true
  );
end;
$$;

-- Replace the earlier hive archive function so the operation always receives
-- an explicit manual batch.
create or replace function public.archive_hive_with_queen_lifecycle(
  p_hive_id uuid,
  p_reason text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reason text := lower(trim(coalesce(p_reason, '')));
  v_batch uuid := gen_random_uuid();
  v_already_archived boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if v_reason not in (
    'winter_loss',
    'colony_died_out',
    'colony_combined',
    'colony_moved',
    'equipment_removed',
    'administrative',
    'other'
  ) then
    raise exception 'Select a valid hive archive reason';
  end if;

  select h.archived_at is not null
  into v_already_archived
  from public.hives h
  where h.id = p_hive_id
    and h.user_id = v_uid
  for update;

  if v_already_archived is null then
    raise exception 'Hive not found';
  end if;

  if not v_already_archived then
    update public.hives
    set
      archive_reason = v_reason,
      archive_notes = nullif(trim(coalesce(p_notes, '')), ''),
      archive_batch_id = v_batch,
      archive_source = 'manual',
      archived_at = now()
    where id = p_hive_id
      and user_id = v_uid;
  else
    select archive_batch_id
    into v_batch
    from public.hives
    where id = p_hive_id
      and user_id = v_uid;
  end if;

  return jsonb_build_object(
    'ok', true,
    'hive_id', p_hive_id,
    'archive_batch_id', v_batch,
    'already_archived', v_already_archived
  );
end;
$$;

create or replace function public.restore_hive_after_archive(
  p_hive_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_apiary_id uuid;
  v_apiary_archived_at timestamptz;
  v_batch uuid;
  v_source text;
  v_child_source text;
  v_inspections integer := 0;
  v_todos integer := 0;
  v_logs integer := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select
    h.apiary_id,
    a.archived_at,
    h.archive_batch_id,
    h.archive_source
  into
    v_apiary_id,
    v_apiary_archived_at,
    v_batch,
    v_source
  from public.hives h
  join public.apiaries a
    on a.id = h.apiary_id
   and a.user_id = h.user_id
  where h.id = p_hive_id
    and h.user_id = v_uid
    and h.archived_at is not null
  for update of h;

  if not found then
    raise exception 'Archived hive not found';
  end if;

  if v_apiary_archived_at is not null then
    raise exception 'Cannot restore hive: its apiary is archived. Restore the apiary first.';
  end if;

  v_child_source :=
    case
      when v_source in ('apiary', 'downgrade') then v_source
      when v_source = 'legacy' then 'legacy'
      else 'hive'
    end;

  update public.hives
  set
    archived_at = null,
    archive_reason = null,
    archive_notes = null
  where id = p_hive_id
    and user_id = v_uid;

  if v_source <> 'legacy' then
    update public.inspections
    set archived_at = null
    where user_id = v_uid
      and hive_id = p_hive_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_inspections = row_count;

    update public.todos
    set archived_at = null
    where user_id = v_uid
      and hive_id = p_hive_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_todos = row_count;

    update public.logbook
    set archived_at = null
    where user_id = v_uid
      and hive_id = p_hive_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_logs = row_count;
  end if;

  return jsonb_build_object(
    'ok', true,
    'hive_id', p_hive_id,
    'restored_inspections', v_inspections,
    'restored_todos', v_todos,
    'restored_logs', v_logs,
    'current_queen_reactivated', false,
    'queen_process_reactivated', false,
    'queen_lifecycle_was_preserved',
      coalesce(v_source in ('apiary', 'downgrade'), false)
  );
end;
$$;

create or replace function public.archive_inspection_lifecycle(
  p_inspection_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_batch uuid := gen_random_uuid();
  v_already_archived boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select i.archived_at is not null
  into v_already_archived
  from public.inspections i
  where i.id = p_inspection_id
    and i.user_id = v_uid
  for update;

  if v_already_archived is null then
    raise exception 'Inspection not found';
  end if;

  if not v_already_archived then
    update public.inspections
    set
      archived_at = now(),
      archive_batch_id = v_batch,
      archive_source = 'manual'
    where id = p_inspection_id
      and user_id = v_uid;
  else
    select archive_batch_id
    into v_batch
    from public.inspections
    where id = p_inspection_id
      and user_id = v_uid;
  end if;

  return jsonb_build_object(
    'ok', true,
    'inspection_id', p_inspection_id,
    'archive_batch_id', v_batch,
    'already_archived', v_already_archived
  );
end;
$$;

create or replace function public.restore_inspection_lifecycle(
  p_inspection_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_batch uuid;
  v_source text;
  v_child_source text;
  v_hive_id uuid;
  v_apiary_id uuid;
  v_todos integer := 0;
  v_logs integer := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select
    i.archive_batch_id,
    i.archive_source,
    i.hive_id,
    i.apiary_id
  into
    v_batch,
    v_source,
    v_hive_id,
    v_apiary_id
  from public.inspections i
  where i.id = p_inspection_id
    and i.user_id = v_uid
    and i.archived_at is not null
  for update;

  if not found then
    raise exception 'Archived inspection not found';
  end if;

  if exists (
    select 1
    from public.apiaries a
    where a.id = v_apiary_id
      and a.user_id = v_uid
      and a.archived_at is not null
  ) then
    raise exception 'Cannot restore inspection: its apiary is archived. Restore the apiary first.';
  end if;

  if exists (
    select 1
    from public.hives h
    where h.id = v_hive_id
      and h.user_id = v_uid
      and h.archived_at is not null
  ) then
    raise exception 'Cannot restore inspection: its hive is archived. Restore the hive first.';
  end if;

  v_child_source :=
    case
      when v_source in ('apiary', 'hive', 'downgrade') then v_source
      when v_source = 'legacy' then 'legacy'
      else 'inspection'
    end;

  update public.inspections
  set archived_at = null
  where id = p_inspection_id
    and user_id = v_uid;

  if v_source <> 'legacy' then
    update public.todos
    set archived_at = null
    where user_id = v_uid
      and inspection_id = p_inspection_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_todos = row_count;

    update public.logbook
    set archived_at = null
    where user_id = v_uid
      and inspection_id = p_inspection_id
      and archived_at is not null
      and archive_batch_id = v_batch
      and archive_source = v_child_source;
    get diagnostics v_logs = row_count;
  end if;

  return jsonb_build_object(
    'ok', true,
    'inspection_id', p_inspection_id,
    'restored_todos', v_todos,
    'restored_logs', v_logs,
    'queen_snapshot_preserved', true,
    'main_queen_record_changed', false
  );
end;
$$;

create or replace function public.archive_todo_lifecycle(
  p_todo_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_batch uuid := gen_random_uuid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.todos
  set
    archived_at = now(),
    archive_batch_id = v_batch,
    archive_source = 'manual'
  where id = p_todo_id
    and user_id = v_uid
    and archived_at is null;

  if not found then
    raise exception 'Active task not found';
  end if;

  return jsonb_build_object(
    'ok', true,
    'todo_id', p_todo_id,
    'archive_batch_id', v_batch
  );
end;
$$;

create or replace function public.restore_todo_lifecycle(
  p_todo_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.todos
  set archived_at = null
  where id = p_todo_id
    and user_id = v_uid
    and archived_at is not null;

  if not found then
    raise exception 'Archived task not found';
  end if;

  return jsonb_build_object('ok', true, 'todo_id', p_todo_id);
end;
$$;

create or replace function public.archive_logbook_lifecycle(
  p_logbook_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_batch uuid := gen_random_uuid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.logbook
  set
    archived_at = now(),
    archive_batch_id = v_batch,
    archive_source = 'manual'
  where id = p_logbook_id
    and user_id = v_uid
    and archived_at is null;

  if not found then
    raise exception 'Active logbook entry not found';
  end if;

  return jsonb_build_object(
    'ok', true,
    'logbook_id', p_logbook_id,
    'archive_batch_id', v_batch
  );
end;
$$;

create or replace function public.restore_logbook_lifecycle(
  p_logbook_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.logbook
  set archived_at = null
  where id = p_logbook_id
    and user_id = v_uid
    and archived_at is not null;

  if not found then
    raise exception 'Archived logbook entry not found';
  end if;

  return jsonb_build_object('ok', true, 'logbook_id', p_logbook_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Accurate delete summaries, including archived records
-- ---------------------------------------------------------------------------

create or replace function public.check_apiary_children(
  apiary_id uuid
)
returns table(
  hives integer,
  inspections integer,
  todos integer,
  logs integer
)
language sql
stable
security definer
set search_path = public
as $$
  with owned as (
    select a.id
    from public.apiaries a
    where a.id = check_apiary_children.apiary_id
      and a.user_id = auth.uid()
  ),
  hive_ids as (
    select h.id
    from public.hives h
    join owned o on o.id = h.apiary_id
  ),
  inspection_ids as (
    select i.id
    from public.inspections i
    join owned o on o.id = i.apiary_id
  )
  select
    (select count(*)::integer from hive_ids),
    (
      select count(*)::integer
      from public.inspections i
      where i.user_id = auth.uid()
        and (
          i.apiary_id in (select id from owned)
          or i.hive_id in (select id from hive_ids)
        )
    ),
    (
      select count(*)::integer
      from public.todos t
      where t.user_id = auth.uid()
        and (
          t.apiary_id in (select id from owned)
          or t.hive_id in (select id from hive_ids)
          or t.inspection_id in (select id from inspection_ids)
        )
    ),
    (
      select count(*)::integer
      from public.logbook l
      where l.user_id = auth.uid()
        and (
          l.apiary_id in (select id from owned)
          or l.hive_id in (select id from hive_ids)
          or l.inspection_id in (select id from inspection_ids)
        )
    );
$$;

create or replace function public.check_inspection_children(
  inspection_id uuid
)
returns table(
  logs integer,
  todos integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (
      select count(*)::integer
      from public.logbook l
      where l.user_id = auth.uid()
        and l.inspection_id = check_inspection_children.inspection_id
    ),
    (
      select count(*)::integer
      from public.todos t
      where t.user_id = auth.uid()
        and t.inspection_id = check_inspection_children.inspection_id
    );
$$;

create or replace function public.get_apiary_delete_summary(
  p_apiary_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row record;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.apiaries a
    where a.id = p_apiary_id
      and a.user_id = v_uid
  ) then
    raise exception 'Apiary not found';
  end if;

  select *
  into v_row
  from public.check_apiary_children(p_apiary_id);

  return jsonb_build_object(
    'apiary_id', p_apiary_id,
    'hives', coalesce(v_row.hives, 0),
    'inspections', coalesce(v_row.inspections, 0),
    'todos', coalesce(v_row.todos, 0),
    'logs', coalesce(v_row.logs, 0)
  );
end;
$$;

create or replace function public.get_inspection_delete_summary(
  p_inspection_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row record;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.inspections i
    where i.id = p_inspection_id
      and i.user_id = v_uid
  ) then
    raise exception 'Inspection not found';
  end if;

  select *
  into v_row
  from public.check_inspection_children(p_inspection_id);

  return jsonb_build_object(
    'inspection_id', p_inspection_id,
    'todos', coalesce(v_row.todos, 0),
    'logs', coalesce(v_row.logs, 0)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Service-role permanent deletion
-- The Edge Function authenticates ownership, collects every affected photo,
-- calls these functions, and then removes storage objects only after success.
-- ---------------------------------------------------------------------------

create or replace function public.delete_inspection_with_linked_cleanup(
  p_inspection_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_logs integer := 0;
  v_todos integer := 0;
  v_inspections integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'This function may only be called by the service role';
  end if;

  select i.user_id
  into v_owner_id
  from public.inspections i
  where i.id = p_inspection_id
  for update;

  if v_owner_id is null then
    raise exception 'Inspection not found';
  end if;

  if v_owner_id <> p_user_id then
    raise exception 'Forbidden';
  end if;

  delete from public.logbook
  where user_id = p_user_id
    and inspection_id = p_inspection_id;
  get diagnostics v_logs = row_count;

  delete from public.todos
  where user_id = p_user_id
    and inspection_id = p_inspection_id;
  get diagnostics v_todos = row_count;

  delete from public.inspections
  where id = p_inspection_id
    and user_id = p_user_id;
  get diagnostics v_inspections = row_count;

  if v_inspections <> 1 then
    raise exception 'Inspection could not be deleted';
  end if;

  return jsonb_build_object(
    'ok', true,
    'inspection_id', p_inspection_id,
    'deleted_inspections', v_inspections,
    'deleted_todos', v_todos,
    'deleted_logs', v_logs,
    'main_queen_record_changed', false
  );
end;
$$;

create or replace function public.delete_apiary_with_lifecycle_cleanup(
  p_apiary_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_hive_ids uuid[] := '{}'::uuid[];
  v_inspection_ids uuid[] := '{}'::uuid[];
  v_hive_id uuid;
  v_logs integer := 0;
  v_todos integer := 0;
  v_inspections integer := 0;
  v_hives integer := 0;
  v_apiaries integer := 0;
  v_deleted_queens integer := 0;
  v_hive_result jsonb;
begin
  if auth.role() <> 'service_role' then
    raise exception 'This function may only be called by the service role';
  end if;

  select a.user_id
  into v_owner_id
  from public.apiaries a
  where a.id = p_apiary_id
  for update;

  if v_owner_id is null then
    raise exception 'Apiary not found';
  end if;

  if v_owner_id <> p_user_id then
    raise exception 'Forbidden';
  end if;

  select coalesce(array_agg(h.id order by h.id), '{}'::uuid[])
  into v_hive_ids
  from public.hives h
  where h.apiary_id = p_apiary_id
    and h.user_id = p_user_id;

  select coalesce(array_agg(i.id order by i.id), '{}'::uuid[])
  into v_inspection_ids
  from public.inspections i
  where i.user_id = p_user_id
    and (
      i.apiary_id = p_apiary_id
      or i.hive_id = any(v_hive_ids)
    );

  delete from public.logbook l
  where l.user_id = p_user_id
    and (
      l.apiary_id = p_apiary_id
      or l.hive_id = any(v_hive_ids)
      or l.inspection_id = any(v_inspection_ids)
    );
  get diagnostics v_logs = row_count;

  delete from public.todos t
  where t.user_id = p_user_id
    and (
      t.apiary_id = p_apiary_id
      or t.hive_id = any(v_hive_ids)
      or t.inspection_id = any(v_inspection_ids)
    );
  get diagnostics v_todos = row_count;

  delete from public.inspections i
  where i.user_id = p_user_id
    and i.id = any(v_inspection_ids);
  get diagnostics v_inspections = row_count;

  foreach v_hive_id in array v_hive_ids
  loop
    v_hive_result :=
      public.delete_hive_with_queen_cleanup(v_hive_id, p_user_id);

    v_hives := v_hives + 1;
    v_deleted_queens :=
      v_deleted_queens
      + coalesce((v_hive_result ->> 'deleted_queens')::integer, 0);
  end loop;

  delete from public.apiaries a
  where a.id = p_apiary_id
    and a.user_id = p_user_id;
  get diagnostics v_apiaries = row_count;

  if v_apiaries <> 1 then
    raise exception 'Apiary could not be deleted';
  end if;

  return jsonb_build_object(
    'ok', true,
    'apiary_id', p_apiary_id,
    'deleted_apiaries', v_apiaries,
    'deleted_hives', v_hives,
    'deleted_inspections', v_inspections,
    'deleted_todos', v_todos,
    'deleted_logs', v_logs,
    'deleted_orphan_queens', v_deleted_queens
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

revoke all on function public.archive_apiary_lifecycle(uuid) from public;
grant execute on function public.archive_apiary_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.restore_apiary_lifecycle(uuid) from public;
grant execute on function public.restore_apiary_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.archive_hive_with_queen_lifecycle(uuid, text, text)
  from public;
grant execute on function public.archive_hive_with_queen_lifecycle(uuid, text, text)
  to authenticated, service_role;

revoke all on function public.restore_hive_after_archive(uuid) from public;
grant execute on function public.restore_hive_after_archive(uuid)
  to authenticated, service_role;

revoke all on function public.archive_inspection_lifecycle(uuid) from public;
grant execute on function public.archive_inspection_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.restore_inspection_lifecycle(uuid) from public;
grant execute on function public.restore_inspection_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.archive_todo_lifecycle(uuid) from public;
grant execute on function public.archive_todo_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.restore_todo_lifecycle(uuid) from public;
grant execute on function public.restore_todo_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.archive_logbook_lifecycle(uuid) from public;
grant execute on function public.archive_logbook_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.restore_logbook_lifecycle(uuid) from public;
grant execute on function public.restore_logbook_lifecycle(uuid)
  to authenticated, service_role;

revoke all on function public.check_apiary_children(uuid) from public;
grant execute on function public.check_apiary_children(uuid)
  to authenticated, service_role;

revoke all on function public.check_inspection_children(uuid) from public;
grant execute on function public.check_inspection_children(uuid)
  to authenticated, service_role;

revoke all on function public.get_apiary_delete_summary(uuid) from public;
grant execute on function public.get_apiary_delete_summary(uuid)
  to authenticated, service_role;

revoke all on function public.get_inspection_delete_summary(uuid) from public;
grant execute on function public.get_inspection_delete_summary(uuid)
  to authenticated, service_role;

revoke all on function public.delete_inspection_with_linked_cleanup(uuid, uuid)
  from public;
grant execute on function public.delete_inspection_with_linked_cleanup(uuid, uuid)
  to service_role;

revoke all on function public.delete_apiary_with_lifecycle_cleanup(uuid, uuid)
  from public;
grant execute on function public.delete_apiary_with_lifecycle_cleanup(uuid, uuid)
  to service_role;

commit;