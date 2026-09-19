-- Queen retrospective records and delayed inspection reconciliation.
-- Staging-first migration.

alter table public.inspections
  add column if not exists queen_process_snapshot jsonb;

alter table public.queens
  add column if not exists queen_year_estimated boolean not null default false;

create or replace function public.build_queen_process_snapshot(
  p_hive_id uuid,
  p_on_date date,
  p_user_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  select jsonb_strip_nulls(
    jsonb_build_object(
      'process_id', qp.id,
      'queen_id', qp.queen_id,
      'process_type', qp.process_type,
      'method', qp.method,
      'status', qp.status,
      'started_on', qp.started_on,
      'expected_check_on', qp.expected_check_on,
      'ended_on', qp.ended_on,
      'notes', qp.notes,
      'inspection_date', p_on_date
    )
  )
  from public.queen_processes qp
  where qp.user_id = p_user_id
    and qp.hive_id = p_hive_id
    and qp.started_on <= coalesce(p_on_date, current_date)
    and (qp.ended_on is null or qp.ended_on > coalesce(p_on_date, current_date))
  order by qp.started_on desc, qp.created_at desc
  limit 1;
$function$;

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
set search_path to 'public'
as $function$
  select jsonb_strip_nulls(
    jsonb_build_object(
      'queen_id', q.id,
      'reference', q.reference,
      'queen_year', q.queen_year,
      'queen_year_estimated', q.queen_year_estimated,
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
      and (a.ended_on is null or a.ended_on >= coalesce(p_on_date, current_date))
    order by a.started_on desc
    limit 1
  ) qa on true
  where q.id = p_queen_id
    and q.user_id = p_user_id;
$function$;

create or replace function public.tg_inspections_queen_snapshot()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_queen_user uuid;
  v_context_changed boolean := false;
begin
  if tg_op = 'INSERT' then
    new.queen_id := public.resolve_inspection_queen_id(new.hive_id, new.date, new.user_id);
  else
    v_context_changed :=
      new.hive_id is distinct from old.hive_id
      or new.date is distinct from old.date
      or new.user_id is distinct from old.user_id;

    if not v_context_changed and old.queen_snapshot is not null then
      new.queen_id := old.queen_id;
      new.queen_snapshot := old.queen_snapshot;
      new.queen_process_snapshot := old.queen_process_snapshot;
      return new;
    end if;

    new.queen_id := public.resolve_inspection_queen_id(new.hive_id, new.date, new.user_id);
  end if;

  if new.queen_id is not null then
    select q.user_id into v_queen_user
    from public.queens q
    where q.id = new.queen_id;

    if v_queen_user is null then
      raise exception 'Queen % not found', new.queen_id;
    end if;

    if v_queen_user <> new.user_id then
      raise exception 'Queen and inspection belong to different users';
    end if;

    new.queen_snapshot := public.build_queen_snapshot(
      new.queen_id, new.hive_id, new.date, new.user_id
    );
    return new;
  end if;

  new.queen_id := null;
  new.queen_snapshot := null;

  if v_context_changed or new.queen_process_snapshot is null then
    new.queen_process_snapshot := public.build_queen_process_snapshot(
      new.hive_id, new.date, new.user_id
    );
  end if;

  return new;
end;
$function$;

drop trigger if exists zz_inspections_queen_snapshot on public.inspections;
create trigger zz_inspections_queen_snapshot
before insert or update of queen_id, queen_snapshot, queen_process_snapshot, hive_id, date, user_id
on public.inspections
for each row
execute function public.tg_inspections_queen_snapshot();

create or replace function public.reconcile_queen_context_for_hive(
  p_hive_id uuid,
  p_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_count integer := 0;
begin
  update public.inspections i
  set queen_snapshot = i.queen_snapshot,
      queen_process_snapshot = i.queen_process_snapshot
  where i.hive_id = p_hive_id
    and i.user_id = p_user_id
    and i.archived_at is null
    and i.queen_snapshot is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

create or replace function public.tg_reconcile_queen_assignment_inspections()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public.reconcile_queen_context_for_hive(new.hive_id, new.user_id);
  if tg_op = 'UPDATE' and old.hive_id is distinct from new.hive_id then
    perform public.reconcile_queen_context_for_hive(old.hive_id, old.user_id);
  end if;
  return new;
end;
$function$;

drop trigger if exists queen_assignments_reconcile_inspections on public.queen_assignments;
create trigger queen_assignments_reconcile_inspections
after insert or update of hive_id, queen_id, started_on, ended_on
on public.queen_assignments
for each row
execute function public.tg_reconcile_queen_assignment_inspections();

create or replace function public.tg_reconcile_queen_process_inspections()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public.reconcile_queen_context_for_hive(new.hive_id, new.user_id);
  if tg_op = 'UPDATE' and old.hive_id is distinct from new.hive_id then
    perform public.reconcile_queen_context_for_hive(old.hive_id, old.user_id);
  end if;
  return new;
end;
$function$;

drop trigger if exists queen_processes_reconcile_inspections on public.queen_processes;
create trigger queen_processes_reconcile_inspections
after insert or update of hive_id, queen_id, process_type, method, status, started_on, ended_on
on public.queen_processes
for each row
execute function public.tg_reconcile_queen_process_inspections();

create or replace function public.queen_establish_retrospective(
  p_hive_id uuid,
  p_event_date date,
  p_reference text,
  p_queen_year integer,
  p_year_estimated boolean,
  p_marking text,
  p_origin text,
  p_evidence text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
set "TimeZone" to 'Europe/London'
as $function$
declare
  v_uid uuid := public.queen_require_premium();
  v_apiary_id uuid;
  v_queen_id uuid;
  v_assignment_id uuid;
  v_reference text;
  v_event_date date := coalesce(p_event_date, current_date);
  v_marking text := lower(trim(coalesce(p_marking, 'unknown')));
  v_actual_colour text;
  v_marked boolean := false;
  v_evidence text := lower(trim(coalesce(p_evidence, 'existing records')));
  v_status text := 'active';
  v_notes text;
  v_later_process_start date;
begin
  if v_event_date > current_date then
    raise exception 'The first-known Queen date cannot be in the future';
  end if;

  select h.apiary_id into v_apiary_id
  from public.hives h
  where h.id = p_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  if v_apiary_id is null then
    raise exception 'Hive not found or not available';
  end if;

  if exists (
    select 1 from public.queen_assignments qa
    where qa.hive_id = p_hive_id
      and qa.user_id = v_uid
      and qa.ended_on is null
  ) then
    raise exception 'This hive already has a current Queen assignment';
  end if;

  select min(qp.started_on) into v_later_process_start
  from public.queen_processes qp
  where qp.hive_id = p_hive_id
    and qp.user_id = v_uid
    and qp.ended_on is null
    and qp.started_on > v_event_date;

  if v_later_process_start is not null then
    raise exception
      'This date conflicts with later Queen activity beginning on %. Review the later Queen record before establishing this historical Queen.',
      to_char(v_later_process_start, 'FMDD FMMonth YYYY');
  end if;

  if p_queen_year is not null and (p_queen_year < 1900 or p_queen_year > 2200) then
    raise exception 'Queen year is outside the supported range';
  end if;

  if v_marking in ('unknown', 'not known', 'not recorded') then
    v_actual_colour := null;
  elsif v_marking = 'unmarked' then
    v_actual_colour := 'Unmarked';
  elsif v_marking in ('white','yellow','red','green','blue') then
    v_actual_colour := initcap(v_marking);
    v_marked := true;
  else
    raise exception 'Unsupported Queen marking value';
  end if;

  if v_evidence in ('eggs observed', 'young brood observed') then
    v_status := 'laying';
  end if;

  v_reference := nullif(trim(coalesce(p_reference, '')), '');
  if v_reference is null then
    v_reference := 'Q-' || coalesce(p_queen_year::text, 'UNK') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;

  v_notes := concat_ws(
    E'\n',
    'Retrospective Queen record established after Queen Records became available. Exact historical details may be unknown.',
    nullif(trim(coalesce(p_notes, '')), '')
  );

  update public.queen_processes
  set ended_on = greatest(started_on, v_event_date),
      status = 'ended by retrospective Queen record',
      notes = concat_ws(E'\n', nullif(trim(coalesce(notes, '')), ''), 'Queen subsequently established retrospectively.')
  where hive_id = p_hive_id
    and user_id = v_uid
    and ended_on is null
    and started_on <= v_event_date;

  insert into public.queens (
    user_id, reference, queen_year, queen_year_estimated, marked, actual_colour,
    clipped, origin, supplier, status, notes
  ) values (
    v_uid, v_reference, p_queen_year,
    coalesce(p_year_estimated, false) and p_queen_year is not null,
    v_marked, v_actual_colour, null,
    coalesce(nullif(trim(coalesce(p_origin, '')), ''), 'Unknown'),
    null, v_status, v_notes
  )
  returning id into v_queen_id;

  insert into public.queen_assignments (
    user_id, queen_id, apiary_id, hive_id, started_on, start_reason, notes
  ) values (
    v_uid, v_queen_id, v_apiary_id, p_hive_id, v_event_date,
    'Retrospective Queen record established', v_notes
  )
  returning id into v_assignment_id;

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, event_date, event_type, title, detail, metadata
  ) values (
    v_uid, v_apiary_id, p_hive_id, v_queen_id, v_event_date,
    'queen_added', 'Retrospective Queen record established', v_notes,
    jsonb_strip_nulls(jsonb_build_object(
      'retrospective', true,
      'evidence', nullif(trim(coalesce(p_evidence, '')), ''),
      'queen_year', p_queen_year,
      'queen_year_estimated', coalesce(p_year_estimated, false),
      'marking', v_marking,
      'origin', coalesce(nullif(trim(coalesce(p_origin, '')), ''), 'Unknown')
    ))
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'assignment_id', v_assignment_id,
    'reconciled', true
  );
end;
$function$;

create or replace function public.queen_update_details(
  p_queen_id uuid,
  p_reference text,
  p_queen_year integer,
  p_marked boolean,
  p_actual_colour text,
  p_clipped boolean,
  p_origin text,
  p_supplier text,
  p_emerged_on date,
  p_introduced_on date,
  p_status text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := public.queen_require_premium();
begin
  update public.queens q
  set reference = nullif(trim(coalesce(p_reference, '')), ''),
      queen_year = p_queen_year,
      marked = coalesce(p_marked, false),
      actual_colour = case
        when nullif(trim(coalesce(p_actual_colour, '')), '') is null then null
        when lower(trim(p_actual_colour)) = 'unknown' then null
        when lower(trim(p_actual_colour)) = 'unmarked' then 'Unmarked'
        else initcap(trim(p_actual_colour))
      end,
      clipped = p_clipped,
      origin = nullif(trim(coalesce(p_origin, '')), ''),
      supplier = nullif(trim(coalesce(p_supplier, '')), ''),
      emerged_on = p_emerged_on,
      introduced_on = p_introduced_on,
      status = coalesce(nullif(trim(coalesce(p_status, '')), ''), q.status),
      notes = nullif(trim(coalesce(p_notes, '')), '')
  where q.id = p_queen_id
    and q.user_id = v_uid;

  if not found then
    raise exception 'Queen record not found';
  end if;

  return jsonb_build_object('queen_id', p_queen_id);
end;
$function$;

revoke all on function public.queen_establish_retrospective(uuid,date,text,integer,boolean,text,text,text,text) from public;
revoke all on function public.queen_establish_retrospective(uuid,date,text,integer,boolean,text,text,text,text) from anon;
grant execute on function public.queen_establish_retrospective(uuid,date,text,integer,boolean,text,text,text,text) to authenticated;
