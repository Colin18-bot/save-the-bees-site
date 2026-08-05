-- HiveTag Queen Records actions
-- Apply after 20260805173500_queen_records.sql.
-- These RPC functions keep multi-table Queen changes atomic.

begin;

create or replace function public.queen_require_premium()
returns uuid
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

  if not public.is_current_user_premium() then
    raise exception 'HiveTag Premium is required to change Queen records';
  end if;

  return v_uid;
end;
$$;

revoke all on function public.queen_require_premium() from public;
grant execute on function public.queen_require_premium() to authenticated;
grant execute on function public.queen_require_premium() to service_role;

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
as $$
declare
  v_uid uuid := public.queen_require_premium();
  v_apiary_id uuid;
  v_queen_id uuid;
  v_assignment_id uuid;
  v_process_id uuid;
  v_reference text;
  v_mode text := lower(trim(coalesce(p_mode, 'add')));
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
      and qa.ended_on is null
  ) then
    raise exception 'This hive already has a current Queen assignment';
  end if;

  if exists (
    select 1
    from public.queen_processes qp
    where qp.hive_id = p_hive_id
      and qp.ended_on is null
  ) then
    raise exception 'This hive already has an active Queen process';
  end if;

  v_reference := nullif(trim(coalesce(p_reference, '')), '');

  if v_reference is null then
    v_reference :=
      'Q-' ||
      coalesce(
        p_queen_year,
        extract(year from coalesce(p_event_date, current_date))::integer
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
    case
      when v_mode = 'introduce' then coalesce(p_event_date, current_date)
      else null
    end,
    case
      when v_mode = 'introduce' then 'acceptance pending'
      else 'active'
    end,
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
    coalesce(p_event_date, current_date),
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
      coalesce(p_event_date, current_date),
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
    coalesce(p_event_date, current_date),
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
set search_path = public
as $$
declare
  v_uid uuid := public.queen_require_premium();
begin
  update public.queens q
  set
    reference = nullif(trim(coalesce(p_reference, '')), ''),
    queen_year = p_queen_year,
    marked = coalesce(p_marked, false),
    actual_colour = case
      when coalesce(p_marked, false)
        then nullif(trim(coalesce(p_actual_colour, '')), '')
      else 'Unmarked'
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
$$;

create or replace function public.queen_record_progress(
  p_hive_id uuid,
  p_event_date date,
  p_progress text,
  p_notes text,
  p_expected_check_on date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.queen_require_premium();
  v_apiary_id uuid;
  v_assignment_id uuid;
  v_queen_id uuid;
  v_process_id uuid;
  v_process_queen_id uuid;
  v_progress text := trim(coalesce(p_progress, ''));
  v_progress_lower text := lower(trim(coalesce(p_progress, '')));
  v_close_assignment boolean := false;
  v_close_process boolean := false;
  v_queen_status text;
begin
  if v_progress = '' then
    raise exception 'Progress is required';
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

  select qa.id, qa.queen_id
    into v_assignment_id, v_queen_id
  from public.queen_assignments qa
  where qa.hive_id = p_hive_id
    and qa.user_id = v_uid
    and qa.ended_on is null
  limit 1;

  select qp.id, qp.queen_id
    into v_process_id, v_process_queen_id
  from public.queen_processes qp
  where qp.hive_id = p_hive_id
    and qp.user_id = v_uid
    and qp.ended_on is null
  order by qp.started_on desc
  limit 1;

  v_queen_id := coalesce(v_queen_id, v_process_queen_id);

  if v_queen_id is null and v_process_id is null then
    raise exception 'No current Queen or active Queen process was found for this hive';
  end if;

  if v_queen_id is null and v_progress_lower = 'queen emerged' then
    insert into public.queens (
      user_id,
      reference,
      queen_year,
      marked,
      actual_colour,
      origin,
      emerged_on,
      status,
      notes
    )
    values (
      v_uid,
      'Q-' ||
        extract(year from coalesce(p_event_date, current_date))::integer::text ||
        '-' ||
        upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
      extract(year from coalesce(p_event_date, current_date))::integer,
      false,
      'Unmarked',
      'Home-reared queen',
      coalesce(p_event_date, current_date),
      'virgin',
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
      coalesce(p_event_date, current_date),
      'Queen emerged',
      nullif(trim(coalesce(p_notes, '')), '')
    )
    returning id into v_assignment_id;

    update public.queen_processes
    set queen_id = v_queen_id
    where id = v_process_id;
  end if;

  case v_progress_lower
    when 'queen accepted' then v_queen_status := 'accepted';
    when 'queen released' then v_queen_status := 'introduced';
    when 'virgin queen seen' then v_queen_status := 'virgin';
    when 'queen emerged' then v_queen_status := 'virgin';
    when 'mating outcome pending' then v_queen_status := 'mating';
    when 'eggs observed' then v_queen_status := 'laying';
    when 'laying queen confirmed' then
      v_queen_status := 'laying';
      v_close_process := true;
    when 'queen presumed lost' then
      v_queen_status := 'presumed lost';
      v_close_assignment := true;
      v_close_process := true;
    when 'queenless confirmed' then
      v_queen_status := 'queenless';
      v_close_assignment := true;
      v_close_process := true;
    else v_queen_status := null;
  end case;

  if v_queen_id is not null and v_queen_status is not null then
    update public.queens
    set status = v_queen_status
    where id = v_queen_id
      and user_id = v_uid;
  end if;

  if v_close_assignment and v_assignment_id is not null then
    update public.queen_assignments
    set
      ended_on = coalesce(p_event_date, current_date),
      end_reason = v_progress,
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where id = v_assignment_id;
  end if;

  if v_process_id is not null then
    update public.queen_processes
    set
      status = v_progress_lower,
      expected_check_on = coalesce(p_expected_check_on, expected_check_on),
      ended_on = case
        when v_close_process then coalesce(p_event_date, current_date)
        else ended_on
      end,
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where id = v_process_id;
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
    coalesce(p_event_date, current_date),
    'progress',
    v_progress,
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_strip_nulls(
      jsonb_build_object('expected_check_on', p_expected_check_on)
    )
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'process_id', v_process_id,
    'assignment_ended', v_close_assignment,
    'process_ended', v_close_process
  );
end;
$$;

create or replace function public.queen_transfer(
  p_source_hive_id uuid,
  p_destination_hive_id uuid,
  p_event_date date,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.queen_require_premium();
  v_source_apiary_id uuid;
  v_destination_apiary_id uuid;
  v_assignment_id uuid;
  v_queen_id uuid;
  v_new_assignment_id uuid;
begin
  if p_source_hive_id = p_destination_hive_id then
    raise exception 'Source and destination hives must be different';
  end if;

  select h.apiary_id into v_source_apiary_id
  from public.hives h
  where h.id = p_source_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  select h.apiary_id into v_destination_apiary_id
  from public.hives h
  where h.id = p_destination_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  if v_source_apiary_id is null or v_destination_apiary_id is null then
    raise exception 'Source or destination hive was not found';
  end if;

  select qa.id, qa.queen_id
    into v_assignment_id, v_queen_id
  from public.queen_assignments qa
  where qa.hive_id = p_source_hive_id
    and qa.user_id = v_uid
    and qa.ended_on is null
  limit 1;

  if v_queen_id is null then
    raise exception 'The source hive does not have a current Queen';
  end if;

  if exists (
    select 1
    from public.queen_assignments qa
    where qa.hive_id = p_destination_hive_id
      and qa.ended_on is null
  ) then
    raise exception 'The destination hive already has a current Queen';
  end if;

  if exists (
    select 1
    from public.queen_processes qp
    where qp.hive_id = p_destination_hive_id
      and qp.ended_on is null
  ) then
    raise exception 'The destination hive already has an active Queen process';
  end if;

  update public.queen_assignments
  set
    ended_on = coalesce(p_event_date, current_date),
    end_reason = 'Transferred to another hive',
    notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
  where id = v_assignment_id;

  update public.queen_processes
  set
    ended_on = coalesce(p_event_date, current_date),
    status = 'ended by transfer'
  where hive_id = p_source_hive_id
    and user_id = v_uid
    and ended_on is null;

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
    v_destination_apiary_id,
    p_destination_hive_id,
    coalesce(p_event_date, current_date),
    'Transferred from another hive',
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_new_assignment_id;

  update public.queens
  set status = 'active'
  where id = v_queen_id
    and user_id = v_uid;

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_source_apiary_id, p_source_hive_id, v_queen_id,
    coalesce(p_event_date, current_date), 'transfer_out',
    'Queen transferred out',
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object('destination_hive_id', p_destination_hive_id)
  );

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_destination_apiary_id, p_destination_hive_id, v_queen_id,
    coalesce(p_event_date, current_date), 'transfer_in',
    'Queen transferred in',
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object('source_hive_id', p_source_hive_id)
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'assignment_id', v_new_assignment_id
  );
end;
$$;

create or replace function public.queen_record_swarm(
  p_hive_id uuid,
  p_event_date date,
  p_replacement_method text,
  p_expected_check_on date,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.queen_require_premium();
  v_apiary_id uuid;
  v_assignment_id uuid;
  v_queen_id uuid;
  v_process_id uuid;
begin
  select h.apiary_id into v_apiary_id
  from public.hives h
  where h.id = p_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  if v_apiary_id is null then
    raise exception 'Hive not found or not available';
  end if;

  select qa.id, qa.queen_id
    into v_assignment_id, v_queen_id
  from public.queen_assignments qa
  where qa.hive_id = p_hive_id
    and qa.user_id = v_uid
    and qa.ended_on is null
  limit 1;

  if v_queen_id is null then
    raise exception 'This hive does not have a current Queen to record as swarmed';
  end if;

  update public.queen_assignments
  set
    ended_on = coalesce(p_event_date, current_date),
    end_reason = 'Swarmed',
    notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
  where id = v_assignment_id;

  update public.queens
  set status = 'swarmed'
  where id = v_queen_id
    and user_id = v_uid;

  update public.queen_processes
  set
    ended_on = coalesce(p_event_date, current_date),
    status = 'ended by swarm'
  where hive_id = p_hive_id
    and user_id = v_uid
    and ended_on is null;

  if nullif(trim(coalesce(p_replacement_method, '')), '') is not null then
    insert into public.queen_processes (
      user_id,
      apiary_id,
      hive_id,
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
      'replacement_after_swarm',
      trim(p_replacement_method),
      'active',
      coalesce(p_event_date, current_date),
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), '')
    )
    returning id into v_process_id;
  end if;

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, process_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_apiary_id, p_hive_id, v_queen_id, v_process_id,
    coalesce(p_event_date, current_date), 'swarm',
    'Swarm recorded',
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_strip_nulls(
      jsonb_build_object(
        'replacement_method', nullif(trim(coalesce(p_replacement_method, '')), ''),
        'expected_check_on', p_expected_check_on
      )
    )
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'process_id', v_process_id
  );
end;
$$;

create or replace function public.queen_record_split(
  p_source_hive_id uuid,
  p_destination_hive_id uuid,
  p_event_date date,
  p_queen_location text,
  p_replacement_method text,
  p_expected_check_on date,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.queen_require_premium();
  v_source_apiary_id uuid;
  v_destination_apiary_id uuid;
  v_assignment_id uuid;
  v_queen_id uuid;
  v_location text := lower(trim(coalesce(p_queen_location, '')));
  v_process_id uuid;
begin
  if p_source_hive_id = p_destination_hive_id then
    raise exception 'Source and destination hives must be different';
  end if;

  if v_location not in ('destination', 'source', 'unknown') then
    raise exception 'Queen location must be destination, source or unknown';
  end if;

  select h.apiary_id into v_source_apiary_id
  from public.hives h
  where h.id = p_source_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  select h.apiary_id into v_destination_apiary_id
  from public.hives h
  where h.id = p_destination_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  if v_source_apiary_id is null or v_destination_apiary_id is null then
    raise exception 'Source or destination hive was not found';
  end if;

  select qa.id, qa.queen_id
    into v_assignment_id, v_queen_id
  from public.queen_assignments qa
  where qa.hive_id = p_source_hive_id
    and qa.user_id = v_uid
    and qa.ended_on is null
  limit 1;

  if v_queen_id is null then
    raise exception 'The source hive does not have a current Queen';
  end if;

  if exists (
    select 1
    from public.queen_assignments qa
    where qa.hive_id = p_destination_hive_id
      and qa.ended_on is null
  ) then
    raise exception 'The destination hive already has a current Queen';
  end if;

  if exists (
    select 1
    from public.queen_processes qp
    where qp.hive_id = p_destination_hive_id
      and qp.ended_on is null
  ) then
    raise exception 'The destination hive already has an active Queen process';
  end if;

  update public.queen_processes
  set
    ended_on = coalesce(p_event_date, current_date),
    status = 'ended by split'
  where hive_id = p_source_hive_id
    and user_id = v_uid
    and ended_on is null;

  if v_location = 'destination' then
    update public.queen_assignments
    set
      ended_on = coalesce(p_event_date, current_date),
      end_reason = 'Moved during split',
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where id = v_assignment_id;

    insert into public.queen_assignments (
      user_id, queen_id, apiary_id, hive_id,
      started_on, start_reason, notes
    )
    values (
      v_uid, v_queen_id, v_destination_apiary_id, p_destination_hive_id,
      coalesce(p_event_date, current_date), 'Moved during split',
      nullif(trim(coalesce(p_notes, '')), '')
    );

    if nullif(trim(coalesce(p_replacement_method, '')), '') is not null then
      insert into public.queen_processes (
        user_id, apiary_id, hive_id,
        process_type, method, status,
        started_on, expected_check_on, notes
      )
      values (
        v_uid, v_source_apiary_id, p_source_hive_id,
        'replacement_after_split', trim(p_replacement_method), 'active',
        coalesce(p_event_date, current_date), p_expected_check_on,
        nullif(trim(coalesce(p_notes, '')), '')
      )
      returning id into v_process_id;
    end if;

  elsif v_location = 'source' then
    if nullif(trim(coalesce(p_replacement_method, '')), '') is not null then
      insert into public.queen_processes (
        user_id, apiary_id, hive_id,
        process_type, method, status,
        started_on, expected_check_on, notes
      )
      values (
        v_uid, v_destination_apiary_id, p_destination_hive_id,
        'replacement_after_split', trim(p_replacement_method), 'active',
        coalesce(p_event_date, current_date), p_expected_check_on,
        nullif(trim(coalesce(p_notes, '')), '')
      )
      returning id into v_process_id;
    end if;

  else
    update public.queen_assignments
    set
      ended_on = coalesce(p_event_date, current_date),
      end_reason = 'Queen location unknown after split',
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where id = v_assignment_id;

    update public.queens
    set status = 'location unknown'
    where id = v_queen_id
      and user_id = v_uid;

    insert into public.queen_processes (
      user_id, apiary_id, hive_id,
      process_type, method, status,
      started_on, expected_check_on, notes
    )
    values (
      v_uid, v_source_apiary_id, p_source_hive_id,
      'queen_location_check',
      'Queen location unknown after split',
      'active',
      coalesce(p_event_date, current_date),
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), '')
    )
    returning id into v_process_id;

    insert into public.queen_processes (
      user_id, apiary_id, hive_id,
      process_type, method, status,
      started_on, expected_check_on, notes
    )
    values (
      v_uid, v_destination_apiary_id, p_destination_hive_id,
      'queen_location_check',
      'Queen location unknown after split',
      'active',
      coalesce(p_event_date, current_date),
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), '')
    );
  end if;

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, process_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_source_apiary_id, p_source_hive_id, v_queen_id, v_process_id,
    coalesce(p_event_date, current_date), 'split',
    'Split recorded',
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_strip_nulls(
      jsonb_build_object(
        'destination_hive_id', p_destination_hive_id,
        'queen_location', v_location,
        'replacement_method', nullif(trim(coalesce(p_replacement_method, '')), ''),
        'expected_check_on', p_expected_check_on
      )
    )
  );

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_destination_apiary_id, p_destination_hive_id, v_queen_id,
    coalesce(p_event_date, current_date), 'split',
    'Colony created by split',
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object(
      'source_hive_id', p_source_hive_id,
      'queen_location', v_location
    )
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'process_id', v_process_id,
    'queen_location', v_location
  );
end;
$$;

create or replace function public.queen_start_rearing(
  p_hive_id uuid,
  p_event_date date,
  p_method text,
  p_expected_check_on date,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.queen_require_premium();
  v_apiary_id uuid;
  v_process_id uuid;
  v_queen_id uuid;
begin
  select h.apiary_id into v_apiary_id
  from public.hives h
  where h.id = p_hive_id
    and h.user_id = v_uid
    and h.archived_at is null;

  if v_apiary_id is null then
    raise exception 'Hive not found or not available';
  end if;

  if exists (
    select 1
    from public.queen_processes qp
    where qp.hive_id = p_hive_id
      and qp.ended_on is null
  ) then
    raise exception 'This hive already has an active Queen process';
  end if;

  select qa.queen_id into v_queen_id
  from public.queen_assignments qa
  where qa.hive_id = p_hive_id
    and qa.user_id = v_uid
    and qa.ended_on is null
  limit 1;

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
    'queen_rearing',
    nullif(trim(coalesce(p_method, '')), ''),
    'active',
    coalesce(p_event_date, current_date),
    p_expected_check_on,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_process_id;

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, process_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_apiary_id, p_hive_id, v_queen_id, v_process_id,
    coalesce(p_event_date, current_date), 'queen_rearing',
    'Queen rearing started',
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_strip_nulls(
      jsonb_build_object(
        'method', nullif(trim(coalesce(p_method, '')), ''),
        'expected_check_on', p_expected_check_on
      )
    )
  );

  return jsonb_build_object('process_id', v_process_id);
end;
$$;

revoke all on function public.queen_create_for_hive(
  uuid, date, text, text, integer, boolean, text, boolean,
  text, text, text, date
) from public;
revoke all on function public.queen_update_details(
  uuid, text, integer, boolean, text, boolean,
  text, text, date, date, text, text
) from public;
revoke all on function public.queen_record_progress(
  uuid, date, text, text, date
) from public;
revoke all on function public.queen_transfer(
  uuid, uuid, date, text
) from public;
revoke all on function public.queen_record_swarm(
  uuid, date, text, date, text
) from public;
revoke all on function public.queen_record_split(
  uuid, uuid, date, text, text, date, text
) from public;
revoke all on function public.queen_start_rearing(
  uuid, date, text, date, text
) from public;

grant execute on function public.queen_create_for_hive(
  uuid, date, text, text, integer, boolean, text, boolean,
  text, text, text, date
) to authenticated, service_role;
grant execute on function public.queen_update_details(
  uuid, text, integer, boolean, text, boolean,
  text, text, date, date, text, text
) to authenticated, service_role;
grant execute on function public.queen_record_progress(
  uuid, date, text, text, date
) to authenticated, service_role;
grant execute on function public.queen_transfer(
  uuid, uuid, date, text
) to authenticated, service_role;
grant execute on function public.queen_record_swarm(
  uuid, date, text, date, text
) to authenticated, service_role;
grant execute on function public.queen_record_split(
  uuid, uuid, date, text, text, date, text
) to authenticated, service_role;
grant execute on function public.queen_start_rearing(
  uuid, date, text, date, text
) to authenticated, service_role;

commit;