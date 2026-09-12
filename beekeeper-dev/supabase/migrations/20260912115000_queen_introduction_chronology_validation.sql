-- Allow retrospective Queen entry while preventing impossible chronology.
-- A Queen introduction may be backdated, but it cannot close an active Queen
-- process on a date earlier than that process started.

create or replace function public.queen_create_for_hive(
  p_hive_id uuid,
  p_event_date date,
  p_mode text,
  p_reference text,
  p_queen_year integer,
  p_marked boolean,
  p_actual_colour text,
  p_clipped boolean,
  p_origin text,
  p_supplier text,
  p_notes text,
  p_expected_check_on date
)
returns jsonb
language plpgsql
security definer
set search_path = public
set timezone = 'Europe/London'
as $$
declare
  v_uid uuid := public.queen_require_premium();
  v_apiary_id uuid;
  v_queen_id uuid;
  v_assignment_id uuid;
  v_process_id uuid;
  v_reference text;
  v_mode text := lower(trim(coalesce(p_mode, 'add')));
  v_event_date date := coalesce(p_event_date, current_date);
  v_conflict_process_start date;
begin
  if v_mode not in ('add', 'introduce') then
    raise exception 'Unsupported Queen creation mode: %', p_mode;
  end if;

  select h.apiary_id
    into v_apiary_id
  from public.hives h
  where h.id = p_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  if v_apiary_id is null then
    raise exception 'Hive not found or not available';
  end if;

  if exists (
    select 1
    from public.queen_assignments qa
    where qa.hive_id = p_hive_id
      and qa.user_id = v_uid
      and qa.ended_on is null
  ) then
    raise exception 'This hive already has a current Queen assignment';
  end if;

  -- A simple "Add a Queen" remains unavailable while a transition is active.
  -- An actual introduction intentionally supersedes an earlier active plan,
  -- but only when the introduction date is on or after that plan started.
  if v_mode = 'add' and exists (
    select 1
    from public.queen_processes qp
    where qp.hive_id = p_hive_id
      and qp.user_id = v_uid
      and qp.ended_on is null
  ) then
    raise exception 'This hive already has an active Queen process';
  end if;

  if v_mode = 'introduce' then
    select min(qp.started_on)
      into v_conflict_process_start
    from public.queen_processes qp
    where qp.hive_id = p_hive_id
      and qp.user_id = v_uid
      and qp.ended_on is null
      and qp.started_on > v_event_date;

    if v_conflict_process_start is not null then
      raise exception
        'This date conflicts with later Queen records. HiveTag already has Queen activity for this colony starting on %. Choose a date on or after that date, or review the later Queen records first.',
        to_char(v_conflict_process_start, 'FMDD FMMonth YYYY');
    end if;

    if p_expected_check_on is not null and p_expected_check_on < v_event_date then
      raise exception 'Next check date cannot be earlier than the Queen introduction date.';
    end if;

    update public.queen_processes
    set
      ended_on = v_event_date,
      status = 'ended by Queen introduction',
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where hive_id = p_hive_id
      and user_id = v_uid
      and ended_on is null;
  end if;

  v_reference := nullif(trim(coalesce(p_reference, '')), '');

  if v_reference is null then
    v_reference :=
      'Q-' ||
      coalesce(
        p_queen_year,
        extract(year from v_event_date)::integer
      )::text ||
      '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;

  insert into public.queens (
    user_id,
    reference,
    queen_year,
    marked,
    actual_colour,
    clipped,
    origin,
    supplier,
    introduced_on,
    status,
    notes
  )
  values (
    v_uid,
    v_reference,
    p_queen_year,
    coalesce(p_marked, false),
    case
      when coalesce(p_marked, false)
        then nullif(trim(coalesce(p_actual_colour, '')), '')
      else 'Unmarked'
    end,
    p_clipped,
    nullif(trim(coalesce(p_origin, '')), ''),
    nullif(trim(coalesce(p_supplier, '')), ''),
    case when v_mode = 'introduce' then v_event_date else null end,
    case when v_mode = 'introduce' then 'acceptance pending' else 'active' end,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_queen_id;

  insert into public.queen_assignments (
    user_id,
    queen_id,
    apiary_id,
    hive_id,
    started_on,
    start_reason,
    notes
  )
  values (
    v_uid,
    v_queen_id,
    v_apiary_id,
    p_hive_id,
    v_event_date,
    case
      when v_mode = 'introduce' then 'Queen introduced'
      else 'Queen record established'
    end,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_assignment_id;

  if v_mode = 'introduce' then
    insert into public.queen_processes (
      user_id,
      apiary_id,
      hive_id,
      queen_id,
      process_type,
      method,
      status,
      started_on,
      expected_check_on,
      notes
    )
    values (
      v_uid,
      v_apiary_id,
      p_hive_id,
      v_queen_id,
      'introduction',
      nullif(trim(coalesce(p_origin, '')), ''),
      'acceptance pending',
      v_event_date,
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), '')
    )
    returning id into v_process_id;
  end if;

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
    v_uid,
    v_apiary_id,
    p_hive_id,
    v_queen_id,
    v_process_id,
    v_event_date,
    case when v_mode = 'introduce' then 'introduction' else 'queen_added' end,
    case when v_mode = 'introduce' then 'Queen introduced' else 'Queen record added' end,
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_strip_nulls(
      jsonb_build_object(
        'origin', nullif(trim(coalesce(p_origin, '')), ''),
        'supplier', nullif(trim(coalesce(p_supplier, '')), ''),
        'queen_year', p_queen_year,
        'actual_colour', nullif(trim(coalesce(p_actual_colour, '')), '')
      )
    )
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'assignment_id', v_assignment_id,
    'process_id', v_process_id
  );
end;
$$;
