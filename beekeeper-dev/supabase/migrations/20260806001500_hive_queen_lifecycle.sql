-- HiveTag hive and Queen lifecycle protection
-- Apply after:
--   20260805173500_queen_records.sql
--   20260805190000_queen_records_actions.sql
--   20260805213000_inspection_queen_snapshots.sql
--   20260805230000_queenless_colony_workflow.sql
--
-- This migration:
--   • closes the current Queen assignment and active Queen process when a hive is archived;
--   • preserves all historical Queen assignments, events and inspection snapshots;
--   • restores a hive without reactivating its former Queen or Queen process;
--   • permanently deletes hive-specific Queen history and removes only genuinely orphaned Queen records;
--   • prevents Queen references from being reused, including references belonging to archived Queens.

begin;

-- ---------------------------------------------------------------------------
-- Hive archive information
-- ---------------------------------------------------------------------------

alter table public.hives
  add column if not exists archive_reason text;

alter table public.hives
  add column if not exists archive_notes text;

comment on column public.hives.archive_reason is
  'Reason selected when the hive was archived. Queen lifecycle records are closed at the same time.';

comment on column public.hives.archive_notes is
  'Optional notes recorded when the hive was archived.';

-- ---------------------------------------------------------------------------
-- Queen references must remain unique even after a Queen is archived
-- ---------------------------------------------------------------------------

drop index if exists public.queens_reference_unique_per_user;

do $$
begin
  if exists (
    select 1
    from public.queens q
    where q.reference is not null
      and trim(q.reference) <> ''
    group by q.user_id, lower(trim(q.reference))
    having count(*) > 1
  ) then
    raise exception
      'Duplicate Queen references already exist. Resolve them before applying the permanent Queen reference constraint.';
  end if;
end;
$$;

create unique index if not exists queens_reference_unique_per_user
  on public.queens(user_id, lower(trim(reference)))
  where reference is not null and trim(reference) <> '';

-- ---------------------------------------------------------------------------
-- Close Queen lifecycle records whenever a hive changes from active to archived
-- ---------------------------------------------------------------------------

create or replace function public.tg_hive_queen_archive_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_date date;
  v_reason_code text;
  v_reason_label text;
  v_queen_status text;
  v_current_queen_id uuid;
  v_process_id uuid;
  v_detail text;
begin
  if old.archived_at is null and new.archived_at is not null then
    v_event_date := (new.archived_at at time zone 'Europe/London')::date;
    v_reason_code := lower(trim(coalesce(nullif(new.archive_reason, ''), 'administrative')));

    case v_reason_code
      when 'winter_loss' then
        v_reason_label := 'Winter loss';
        v_queen_status := 'died with colony';
      when 'colony_died_out' then
        v_reason_label := 'Colony died out';
        v_queen_status := 'died with colony';
      when 'colony_combined' then
        v_reason_label := 'Colony combined';
        v_queen_status := 'no longer assigned';
      when 'colony_moved' then
        v_reason_label := 'Colony moved or removed';
        v_queen_status := 'no longer assigned';
      when 'equipment_removed' then
        v_reason_label := 'Hive equipment removed from use';
        v_queen_status := 'no longer assigned';
      when 'administrative' then
        v_reason_label := 'Administrative archive';
        v_queen_status := 'unassigned';
      when 'other' then
        v_reason_label := 'Other';
        v_queen_status := 'unassigned';
      else
        v_reason_code := 'other';
        v_reason_label := 'Other';
        v_queen_status := 'unassigned';
    end case;

    new.archive_reason := v_reason_code;

    select qa.queen_id
      into v_current_queen_id
    from public.queen_assignments qa
    where qa.hive_id = new.id
      and qa.user_id = new.user_id
      and qa.ended_on is null
    order by qa.started_on desc, qa.created_at desc
    limit 1;

    select qp.id
      into v_process_id
    from public.queen_processes qp
    where qp.hive_id = new.id
      and qp.user_id = new.user_id
      and qp.ended_on is null
    order by qp.started_on desc, qp.created_at desc
    limit 1;

    update public.queen_assignments qa
    set
      ended_on = greatest(qa.started_on, v_event_date),
      end_reason = v_reason_label,
      notes = case
        when nullif(trim(coalesce(new.archive_notes, '')), '') is null then qa.notes
        else concat_ws(E'\n', nullif(trim(coalesce(qa.notes, '')), ''), trim(new.archive_notes))
      end,
      updated_at = now()
    where qa.hive_id = new.id
      and qa.user_id = new.user_id
      and qa.ended_on is null;

    update public.queen_processes qp
    set
      ended_on = greatest(qp.started_on, v_event_date),
      expected_check_on = null,
      status = 'ended by hive archive',
      notes = case
        when nullif(trim(coalesce(new.archive_notes, '')), '') is null then qp.notes
        else concat_ws(E'\n', nullif(trim(coalesce(qp.notes, '')), ''), trim(new.archive_notes))
      end,
      metadata = coalesce(qp.metadata, '{}'::jsonb) || jsonb_build_object(
        'hive_archive_reason', v_reason_code,
        'hive_archive_label', v_reason_label
      ),
      updated_at = now()
    where qp.hive_id = new.id
      and qp.user_id = new.user_id
      and qp.ended_on is null;

    if v_current_queen_id is not null
       and not exists (
         select 1
         from public.queen_assignments qa
         where qa.queen_id = v_current_queen_id
           and qa.ended_on is null
       ) then
      update public.queens q
      set
        status = v_queen_status,
        archived_at = coalesce(q.archived_at, new.archived_at),
        updated_at = now()
      where q.id = v_current_queen_id
        and q.user_id = new.user_id;
    end if;

    v_detail :=
      'Hive archived — ' || v_reason_label ||
      case
        when nullif(trim(coalesce(new.archive_notes, '')), '') is null then '.'
        else '. ' || trim(new.archive_notes)
      end;

    insert into public.queen_events (
      user_id,
      apiary_id,
      hive_id,
      queen_id,
      process_id,
      event_date,
      event_type,
      title,
      detail,
      metadata
    )
    values (
      new.user_id,
      new.apiary_id,
      new.id,
      v_current_queen_id,
      v_process_id,
      v_event_date,
      'hive_archived',
      'Hive archived',
      v_detail,
      jsonb_build_object(
        'archive_reason', v_reason_code,
        'archive_reason_label', v_reason_label
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists zz_hive_queen_archive_lifecycle
  on public.hives;

create trigger zz_hive_queen_archive_lifecycle
before update of archived_at
on public.hives
for each row
execute function public.tg_hive_queen_archive_lifecycle();

-- ---------------------------------------------------------------------------
-- Backfill any hive that was archived before this lifecycle protection existed
-- ---------------------------------------------------------------------------

create temporary table hive_queen_archive_backfill
on commit drop
as
select
  qa.id as assignment_id,
  qa.queen_id,
  h.id as hive_id,
  h.user_id,
  h.archived_at,
  greatest(qa.started_on, (h.archived_at at time zone 'Europe/London')::date) as ended_on
from public.queen_assignments qa
join public.hives h
  on h.id = qa.hive_id
 and h.user_id = qa.user_id
where h.archived_at is not null
  and qa.ended_on is null;

update public.queen_assignments qa
set
  ended_on = b.ended_on,
  end_reason = coalesce(nullif(qa.end_reason, ''), 'Hive archived'),
  updated_at = now()
from hive_queen_archive_backfill b
where qa.id = b.assignment_id;

update public.queen_processes qp
set
  ended_on = greatest(qp.started_on, (h.archived_at at time zone 'Europe/London')::date),
  expected_check_on = null,
  status = 'ended by hive archive',
  metadata = coalesce(qp.metadata, '{}'::jsonb) || jsonb_build_object(
    'hive_archive_reason',
    coalesce(nullif(h.archive_reason, ''), 'administrative')
  ),
  updated_at = now()
from public.hives h
where qp.hive_id = h.id
  and qp.user_id = h.user_id
  and h.archived_at is not null
  and qp.ended_on is null;

update public.queens q
set
  status = case
    when coalesce(h.archive_reason, '') in ('winter_loss', 'colony_died_out')
      then 'died with colony'
    else 'unassigned'
  end,
  archived_at = coalesce(q.archived_at, h.archived_at),
  updated_at = now()
from hive_queen_archive_backfill b
join public.hives h
  on h.id = b.hive_id
where q.id = b.queen_id
  and q.user_id = b.user_id
  and not exists (
    select 1
    from public.queen_assignments qa
    where qa.queen_id = q.id
      and qa.ended_on is null
  );

-- ---------------------------------------------------------------------------
-- Authenticated archive and restore actions
-- ---------------------------------------------------------------------------

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
      archived_at = now()
    where id = p_hive_id
      and user_id = v_uid;
  end if;

  return jsonb_build_object(
    'ok', true,
    'hive_id', p_hive_id,
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
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select h.apiary_id, a.archived_at
    into v_apiary_id, v_apiary_archived_at
  from public.hives h
  join public.apiaries a
    on a.id = h.apiary_id
   and a.user_id = h.user_id
  where h.id = p_hive_id
    and h.user_id = v_uid
  for update of h;

  if v_apiary_id is null then
    raise exception 'Hive not found';
  end if;

  if v_apiary_archived_at is not null then
    raise exception 'Cannot restore hive: its apiary is archived. Restore the apiary first.';
  end if;

  update public.hives
  set
    archived_at = null,
    archive_reason = null,
    archive_notes = null
  where id = p_hive_id
    and user_id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'hive_id', p_hive_id,
    'current_queen_reactivated', false,
    'queen_process_reactivated', false
  );
end;
$$;

revoke all on function public.archive_hive_with_queen_lifecycle(uuid, text, text)
  from public;
grant execute on function public.archive_hive_with_queen_lifecycle(uuid, text, text)
  to authenticated;
grant execute on function public.archive_hive_with_queen_lifecycle(uuid, text, text)
  to service_role;

revoke all on function public.restore_hive_after_archive(uuid)
  from public;
grant execute on function public.restore_hive_after_archive(uuid)
  to authenticated;
grant execute on function public.restore_hive_after_archive(uuid)
  to service_role;

-- ---------------------------------------------------------------------------
-- Service-role permanent deletion with orphan Queen cleanup
-- Called only by the delete-row-with-photos Edge Function after it has
-- authenticated the user and confirmed ownership.
-- ---------------------------------------------------------------------------

create or replace function public.delete_hive_with_queen_cleanup(
  p_hive_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_queen_ids uuid[] := '{}'::uuid[];
  v_hive_deleted integer := 0;
  v_queens_deleted integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'This function may only be called by the service role';
  end if;

  if p_user_id is null then
    raise exception 'Missing user ID';
  end if;

  select h.user_id
    into v_owner_id
  from public.hives h
  where h.id = p_hive_id
  for update;

  if v_owner_id is null then
    raise exception 'Hive not found';
  end if;

  if v_owner_id <> p_user_id then
    raise exception 'Forbidden';
  end if;

  select coalesce(array_agg(distinct x.queen_id), '{}'::uuid[])
    into v_queen_ids
  from (
    select qa.queen_id
    from public.queen_assignments qa
    where qa.hive_id = p_hive_id

    union

    select qe.queen_id
    from public.queen_events qe
    where qe.hive_id = p_hive_id
      and qe.queen_id is not null

    union

    select qp.queen_id
    from public.queen_processes qp
    where qp.hive_id = p_hive_id
      and qp.queen_id is not null
  ) x;

  delete from public.hives h
  where h.id = p_hive_id
    and h.user_id = p_user_id;

  get diagnostics v_hive_deleted = row_count;

  if v_hive_deleted <> 1 then
    raise exception 'Hive could not be deleted';
  end if;

  delete from public.queens q
  where q.user_id = p_user_id
    and q.id = any(v_queen_ids)
    and not exists (
      select 1
      from public.queen_assignments qa
      where qa.queen_id = q.id
    )
    and not exists (
      select 1
      from public.queen_events qe
      where qe.queen_id = q.id
    )
    and not exists (
      select 1
      from public.queen_processes qp
      where qp.queen_id = q.id
    )
    and not exists (
      select 1
      from public.inspections i
      where i.queen_id = q.id
    );

  get diagnostics v_queens_deleted = row_count;

  return jsonb_build_object(
    'ok', true,
    'hive_id', p_hive_id,
    'deleted_queens', v_queens_deleted
  );
end;
$$;

revoke all on function public.delete_hive_with_queen_cleanup(uuid, uuid)
  from public;
grant execute on function public.delete_hive_with_queen_cleanup(uuid, uuid)
  to service_role;

commit;