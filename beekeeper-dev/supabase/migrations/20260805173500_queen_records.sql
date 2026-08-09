-- HiveTag Queen Records foundation
-- Staging migration
-- Creates permanent Queen records, assignments, processes, events,
-- and immutable Queen snapshots on inspections.

begin;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.is_current_user_premium()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and lower(coalesce(p.subscription_level, 'free')) = 'premium'
  );
$$;

revoke all on function public.is_current_user_premium() from public;
grant execute on function public.is_current_user_premium() to authenticated;
grant execute on function public.is_current_user_premium() to service_role;

create or replace function public.queen_marking_colour(p_year integer)
returns text
language sql
immutable
as $$
  select case right(p_year::text, 1)
    when '1' then 'White'
    when '6' then 'White'
    when '2' then 'Yellow'
    when '7' then 'Yellow'
    when '3' then 'Red'
    when '8' then 'Red'
    when '4' then 'Green'
    when '9' then 'Green'
    when '5' then 'Blue'
    when '0' then 'Blue'
    else null
  end;
$$;

revoke all on function public.queen_marking_colour(integer) from public;
grant execute on function public.queen_marking_colour(integer) to authenticated;
grant execute on function public.queen_marking_colour(integer) to service_role;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table if not exists public.queens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  reference text,
  queen_year integer,
  marked boolean not null default false,
  actual_colour text,
  clipped boolean,
  origin text,
  supplier text,
  emerged_on date,
  introduced_on date,
  status text not null default 'active',
  notes text,

  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint queens_year_check
    check (queen_year is null or queen_year between 1900 and 2200),

  constraint queens_actual_colour_check
    check (
      actual_colour is null
      or actual_colour in ('White', 'Yellow', 'Red', 'Green', 'Blue', 'Unmarked')
    )
);

create table if not exists public.queen_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  queen_id uuid not null
    references public.queens(id) on delete cascade,
  apiary_id uuid not null
    references public.apiaries(id) on delete cascade,
  hive_id uuid not null
    references public.hives(id) on delete cascade,

  started_on date not null default current_date,
  ended_on date,
  start_reason text,
  end_reason text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint queen_assignments_dates_check
    check (ended_on is null or ended_on >= started_on)
);

create table if not exists public.queen_processes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  apiary_id uuid not null
    references public.apiaries(id) on delete cascade,
  hive_id uuid not null
    references public.hives(id) on delete cascade,
  queen_id uuid
    references public.queens(id) on delete set null,
  source_hive_id uuid
    references public.hives(id) on delete set null,

  process_type text not null,
  method text,
  status text not null default 'active',
  started_on date not null default current_date,
  expected_check_on date,
  ended_on date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint queen_processes_dates_check
    check (ended_on is null or ended_on >= started_on)
);

create table if not exists public.queen_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  apiary_id uuid not null
    references public.apiaries(id) on delete cascade,
  hive_id uuid not null
    references public.hives(id) on delete cascade,
  queen_id uuid
    references public.queens(id) on delete cascade,
  process_id uuid
    references public.queen_processes(id) on delete set null,

  event_date date not null default current_date,
  event_type text not null,
  title text,
  detail text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inspection snapshot columns
-- ---------------------------------------------------------------------------

alter table public.inspections
  add column if not exists queen_id uuid;

alter table public.inspections
  add column if not exists queen_snapshot jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inspections_queen_id_fkey'
      and conrelid = 'public.inspections'::regclass
  ) then
    alter table public.inspections
      add constraint inspections_queen_id_fkey
      foreign key (queen_id)
      references public.queens(id)
      on delete set null;
  end if;
end;
$$;

comment on column public.inspections.queen_snapshot is
  'Immutable copy of the Queen information that applied when the inspection was saved.';

-- ---------------------------------------------------------------------------
-- Indexes and current-record protection
-- ---------------------------------------------------------------------------

create index if not exists queens_user_idx
  on public.queens(user_id);

create index if not exists queens_user_archived_idx
  on public.queens(user_id, archived_at);

create unique index if not exists queens_reference_unique_per_user
  on public.queens(user_id, lower(reference))
  where reference is not null and archived_at is null;

create index if not exists queen_assignments_user_idx
  on public.queen_assignments(user_id);

create index if not exists queen_assignments_hive_history_idx
  on public.queen_assignments(hive_id, started_on desc);

create index if not exists queen_assignments_queen_history_idx
  on public.queen_assignments(queen_id, started_on desc);

create unique index if not exists queen_assignments_one_current_queen_per_hive
  on public.queen_assignments(hive_id)
  where ended_on is null;

create unique index if not exists queen_assignments_one_current_hive_per_queen
  on public.queen_assignments(queen_id)
  where ended_on is null;

create index if not exists queen_processes_user_idx
  on public.queen_processes(user_id);

create index if not exists queen_processes_hive_idx
  on public.queen_processes(hive_id, started_on desc);

create unique index if not exists queen_processes_one_active_per_hive
  on public.queen_processes(hive_id)
  where ended_on is null;

create index if not exists queen_events_user_idx
  on public.queen_events(user_id);

create index if not exists queen_events_hive_date_idx
  on public.queen_events(hive_id, event_date desc, created_at desc);

create index if not exists queen_events_queen_date_idx
  on public.queen_events(queen_id, event_date desc, created_at desc);

create index if not exists inspections_queen_id_idx
  on public.inspections(queen_id);

-- ---------------------------------------------------------------------------
-- Ownership and relationship consistency
-- ---------------------------------------------------------------------------

create or replace function public.tg_queen_assignments_enforce_consistency()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_queen_user uuid;
  v_hive_user uuid;
  v_apiary_id uuid;
begin
  select q.user_id
    into v_queen_user
  from public.queens q
  where q.id = new.queen_id;

  if v_queen_user is null then
    raise exception 'Queen % not found', new.queen_id;
  end if;

  select h.user_id, h.apiary_id
    into v_hive_user, v_apiary_id
  from public.hives h
  where h.id = new.hive_id;

  if v_hive_user is null then
    raise exception 'Hive % not found', new.hive_id;
  end if;

  if v_queen_user <> v_hive_user then
    raise exception 'Queen and hive belong to different users';
  end if;

  new.user_id := v_hive_user;
  new.apiary_id := v_apiary_id;

  return new;
end;
$$;

create or replace function public.tg_queen_processes_enforce_consistency()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_hive_user uuid;
  v_apiary_id uuid;
  v_related_user uuid;
begin
  select h.user_id, h.apiary_id
    into v_hive_user, v_apiary_id
  from public.hives h
  where h.id = new.hive_id;

  if v_hive_user is null then
    raise exception 'Hive % not found', new.hive_id;
  end if;

  if new.queen_id is not null then
    select q.user_id
      into v_related_user
    from public.queens q
    where q.id = new.queen_id;

    if v_related_user is null then
      raise exception 'Queen % not found', new.queen_id;
    end if;

    if v_related_user <> v_hive_user then
      raise exception 'Queen and hive belong to different users';
    end if;
  end if;

  if new.source_hive_id is not null then
    select h.user_id
      into v_related_user
    from public.hives h
    where h.id = new.source_hive_id;

    if v_related_user is null then
      raise exception 'Source hive % not found', new.source_hive_id;
    end if;

    if v_related_user <> v_hive_user then
      raise exception 'Source hive and destination hive belong to different users';
    end if;
  end if;

  new.user_id := v_hive_user;
  new.apiary_id := v_apiary_id;

  return new;
end;
$$;

create or replace function public.tg_queen_events_enforce_consistency()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_hive_user uuid;
  v_apiary_id uuid;
  v_related_user uuid;
begin
  select h.user_id, h.apiary_id
    into v_hive_user, v_apiary_id
  from public.hives h
  where h.id = new.hive_id;

  if v_hive_user is null then
    raise exception 'Hive % not found', new.hive_id;
  end if;

  if new.queen_id is not null then
    select q.user_id
      into v_related_user
    from public.queens q
    where q.id = new.queen_id;

    if v_related_user is null then
      raise exception 'Queen % not found', new.queen_id;
    end if;

    if v_related_user <> v_hive_user then
      raise exception 'Queen and hive belong to different users';
    end if;
  end if;

  if new.process_id is not null then
    select p.user_id
      into v_related_user
    from public.queen_processes p
    where p.id = new.process_id;

    if v_related_user is null then
      raise exception 'Queen process % not found', new.process_id;
    end if;

    if v_related_user <> v_hive_user then
      raise exception 'Queen process and hive belong to different users';
    end if;
  end if;

  new.user_id := v_hive_user;
  new.apiary_id := v_apiary_id;

  return new;
end;
$$;

drop trigger if exists queen_assignments_enforce_consistency
  on public.queen_assignments;

create trigger queen_assignments_enforce_consistency
before insert or update of queen_id, hive_id, apiary_id, user_id
on public.queen_assignments
for each row
execute function public.tg_queen_assignments_enforce_consistency();

drop trigger if exists queen_processes_enforce_consistency
  on public.queen_processes;

create trigger queen_processes_enforce_consistency
before insert or update of hive_id, apiary_id, queen_id, source_hive_id, user_id
on public.queen_processes
for each row
execute function public.tg_queen_processes_enforce_consistency();

drop trigger if exists queen_events_enforce_consistency
  on public.queen_events;

create trigger queen_events_enforce_consistency
before insert or update of hive_id, apiary_id, queen_id, process_id, user_id
on public.queen_events
for each row
execute function public.tg_queen_events_enforce_consistency();

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists queens_set_updated_at on public.queens;
create trigger queens_set_updated_at
before update on public.queens
for each row
execute function public.set_updated_at();

drop trigger if exists queen_assignments_set_updated_at
  on public.queen_assignments;
create trigger queen_assignments_set_updated_at
before update on public.queen_assignments
for each row
execute function public.set_updated_at();

drop trigger if exists queen_processes_set_updated_at
  on public.queen_processes;
create trigger queen_processes_set_updated_at
before update on public.queen_processes
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Immutable inspection snapshot
-- ---------------------------------------------------------------------------

create or replace function public.build_queen_snapshot(
  p_queen_id uuid,
  p_hive_id uuid,
  p_on_date date,
  p_user_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_strip_nulls(
    jsonb_build_object(
      'queen_id', q.id,
      'reference', q.reference,
      'queen_year', q.queen_year,
      'expected_colour', public.queen_marking_colour(q.queen_year),
      'marked', q.marked,
      'actual_colour', q.actual_colour,
      'clipped', q.clipped,
      'origin', q.origin,
      'supplier', q.supplier,
      'emerged_on', q.emerged_on,
      'introduced_on', q.introduced_on,
      'status', q.status,
      'notes', q.notes,
      'hive_id', p_hive_id,
      'inspection_date', p_on_date,
      'assignment_started_on', qa.started_on,
      'assignment_start_reason', qa.start_reason
    )
  )
  from public.queens q
  left join lateral (
    select a.started_on, a.start_reason
    from public.queen_assignments a
    where a.queen_id = q.id
      and a.hive_id = p_hive_id
      and a.started_on <= coalesce(p_on_date, current_date)
      and (
        a.ended_on is null
        or a.ended_on >= coalesce(p_on_date, current_date)
      )
    order by a.started_on desc
    limit 1
  ) qa on true
  where q.id = p_queen_id
    and q.user_id = p_user_id;
$$;

revoke all on function public.build_queen_snapshot(uuid, uuid, date, uuid)
  from public;
grant execute on function public.build_queen_snapshot(uuid, uuid, date, uuid)
  to service_role;

create or replace function public.tg_inspections_queen_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queen_user uuid;
begin
  if new.queen_id is not null then
    select q.user_id
      into v_queen_user
    from public.queens q
    where q.id = new.queen_id;

    if v_queen_user is null then
      raise exception 'Queen % not found', new.queen_id;
    end if;

    if v_queen_user <> new.user_id then
      raise exception 'Queen and inspection belong to different users';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.queen_id is null then
      new.queen_snapshot := null;
    elsif new.queen_snapshot is null then
      new.queen_snapshot := public.build_queen_snapshot(
        new.queen_id,
        new.hive_id,
        new.date,
        new.user_id
      );
    end if;

    return new;
  end if;

  if new.queen_id is distinct from old.queen_id then
    if new.queen_id is null then
      new.queen_snapshot := null;
    else
      new.queen_snapshot := public.build_queen_snapshot(
        new.queen_id,
        new.hive_id,
        new.date,
        new.user_id
      );
    end if;
  elsif old.queen_snapshot is not null then
    -- Preserve the historical snapshot even if the live Queen record changes.
    new.queen_snapshot := old.queen_snapshot;
  elsif new.queen_id is not null and new.queen_snapshot is null then
    new.queen_snapshot := public.build_queen_snapshot(
      new.queen_id,
      new.hive_id,
      new.date,
      new.user_id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists zz_inspections_queen_snapshot
  on public.inspections;

create trigger zz_inspections_queen_snapshot
before insert or update of queen_id, queen_snapshot, hive_id, date, user_id
on public.inspections
for each row
execute function public.tg_inspections_queen_snapshot();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Read access is retained after downgrade.
-- Insert, update and delete require the current Premium plan.
-- ---------------------------------------------------------------------------

alter table public.queens enable row level security;
alter table public.queen_assignments enable row level security;
alter table public.queen_processes enable row level security;
alter table public.queen_events enable row level security;

drop policy if exists queens_select_own on public.queens;
create policy queens_select_own
on public.queens
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists queens_insert_premium on public.queens;
create policy queens_insert_premium
on public.queens
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queens_update_premium on public.queens;
create policy queens_update_premium
on public.queens
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
)
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queens_delete_premium on public.queens;
create policy queens_delete_premium
on public.queens
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_assignments_select_own
  on public.queen_assignments;
create policy queen_assignments_select_own
on public.queen_assignments
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists queen_assignments_insert_premium
  on public.queen_assignments;
create policy queen_assignments_insert_premium
on public.queen_assignments
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_assignments_update_premium
  on public.queen_assignments;
create policy queen_assignments_update_premium
on public.queen_assignments
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
)
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_assignments_delete_premium
  on public.queen_assignments;
create policy queen_assignments_delete_premium
on public.queen_assignments
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_processes_select_own
  on public.queen_processes;
create policy queen_processes_select_own
on public.queen_processes
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists queen_processes_insert_premium
  on public.queen_processes;
create policy queen_processes_insert_premium
on public.queen_processes
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_processes_update_premium
  on public.queen_processes;
create policy queen_processes_update_premium
on public.queen_processes
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
)
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_processes_delete_premium
  on public.queen_processes;
create policy queen_processes_delete_premium
on public.queen_processes
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_events_select_own
  on public.queen_events;
create policy queen_events_select_own
on public.queen_events
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists queen_events_insert_premium
  on public.queen_events;
create policy queen_events_insert_premium
on public.queen_events
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_events_update_premium
  on public.queen_events;
create policy queen_events_update_premium
on public.queen_events
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
)
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists queen_events_delete_premium
  on public.queen_events;
create policy queen_events_delete_premium
on public.queen_events
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

grant select, insert, update, delete
  on public.queens
  to authenticated;

grant select, insert, update, delete
  on public.queen_assignments
  to authenticated;

grant select, insert, update, delete
  on public.queen_processes
  to authenticated;

grant select, insert, update, delete
  on public.queen_events
  to authenticated;

grant all on public.queens to service_role;
grant all on public.queen_assignments to service_role;
grant all on public.queen_processes to service_role;
grant all on public.queen_events to service_role;

-- ---------------------------------------------------------------------------
-- Account deletion support
-- ---------------------------------------------------------------------------

create or replace function public.delete_my_account()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();

  d_queen_events       int := 0;
  d_queen_processes    int := 0;
  d_queen_assignments  int := 0;
  d_queens             int := 0;
  d_sales_lines        int := 0;
  d_expenses           int := 0;
  d_inventory_items    int := 0;
  d_logbook            int := 0;
  d_todos              int := 0;
  d_inspections        int := 0;
  d_hives              int := 0;
  d_apiaries           int := 0;
  d_profiles           int := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.queen_events
  where user_id = v_uid;
  get diagnostics d_queen_events = row_count;

  delete from public.queen_processes
  where user_id = v_uid;
  get diagnostics d_queen_processes = row_count;

  delete from public.queen_assignments
  where user_id = v_uid;
  get diagnostics d_queen_assignments = row_count;

  delete from public.queens
  where user_id = v_uid;
  get diagnostics d_queens = row_count;

  delete from public.sales_lines
  where user_id = v_uid;
  get diagnostics d_sales_lines = row_count;

  delete from public.expenses
  where user_id = v_uid;
  get diagnostics d_expenses = row_count;

  delete from public.inventory_items
  where user_id = v_uid;
  get diagnostics d_inventory_items = row_count;

  delete from public.logbook
  where user_id = v_uid;
  get diagnostics d_logbook = row_count;

  delete from public.todos
  where user_id = v_uid;
  get diagnostics d_todos = row_count;

  delete from public.inspections
  where user_id = v_uid;
  get diagnostics d_inspections = row_count;

  delete from public.hives
  where user_id = v_uid;
  get diagnostics d_hives = row_count;

  delete from public.apiaries
  where user_id = v_uid;
  get diagnostics d_apiaries = row_count;

  delete from public.profiles
  where user_id = v_uid;
  get diagnostics d_profiles = row_count;

  return jsonb_build_object(
    'queen_events', d_queen_events,
    'queen_processes', d_queen_processes,
    'queen_assignments', d_queen_assignments,
    'queens', d_queens,
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
end;
$$;

create or replace function public.delete_user(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.queen_events       where user_id = uid;
  delete from public.queen_processes    where user_id = uid;
  delete from public.queen_assignments  where user_id = uid;
  delete from public.queens             where user_id = uid;
  delete from public.inspections        where user_id = uid;
  delete from public.hives              where user_id = uid;
  delete from public.apiaries           where user_id = uid;
  delete from public.todos              where user_id = uid;
  delete from public.logbook            where user_id = uid;
  delete from public.inventory_items    where user_id = uid;
  delete from public.expenses           where user_id = uid;
  delete from public.sales_lines        where user_id = uid;
  delete from public.sales_orders       where user_id = uid;
  delete from public.profiles           where user_id = uid;
end;
$$;

commit;