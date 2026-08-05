-- HiveTag Queenless colony workflow improvements
-- Apply after 20260805190000_queen_records_actions.sql.
--
-- This migration:
--   1. Allows a Queen to be introduced into a hive that already has an active
--      queenless/rearing transition, while preserving and closing that history.
--   2. Adds a richer split workflow with a reason, Queen-cell position and
--      replacement plan for whichever colony is left queenless.
--   3. Allows the plan for a queenless colony to be created or updated later,
--      including adding a brood frame after the split.

begin;

-- ---------------------------------------------------------------------------
-- Introduce a Queen after an existing queenless/rearing transition
-- ---------------------------------------------------------------------------

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
  v_event_date date := coalesce(p_event_date, current_date);
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
  -- An actual introduction, however, intentionally supersedes the earlier plan.
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

-- ---------------------------------------------------------------------------
-- Richer split workflow
-- ---------------------------------------------------------------------------

create or replace function public.queen_record_split_v2(
  p_source_hive_id uuid,
  p_destination_hive_id uuid,
  p_event_date date,
  p_queen_location text,
  p_split_reason text,
  p_queen_cell_position text,
  p_replacement_method text,
  p_brood_source_hive_id uuid,
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
  v_event_date date := coalesce(p_event_date, current_date);
  v_process_id uuid;
  v_queenless_hive_id uuid;
  v_queenless_apiary_id uuid;
  v_detail text;
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

  if p_brood_source_hive_id is not null then
    if p_brood_source_hive_id = p_source_hive_id and v_location = 'destination' then
      -- valid: brood may remain in the original hive
      null;
    elsif p_brood_source_hive_id = p_destination_hive_id and v_location = 'source' then
      -- valid: brood may be in the newly created colony
      null;
    elsif not exists (
      select 1
      from public.hives h
      where h.id = p_brood_source_hive_id
        and h.user_id = v_uid
        and h.archived_at is null
    ) then
      raise exception 'Brood source hive was not found';
    end if;
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
      and qa.user_id = v_uid
      and qa.ended_on is null
  ) then
    raise exception 'The destination hive already has a current Queen';
  end if;

  if exists (
    select 1
    from public.queen_processes qp
    where qp.hive_id = p_destination_hive_id
      and qp.user_id = v_uid
      and qp.ended_on is null
  ) then
    raise exception 'The destination hive already has an active Queen process';
  end if;

  update public.queen_processes
  set
    ended_on = v_event_date,
    status = 'ended by split'
  where hive_id = p_source_hive_id
    and user_id = v_uid
    and ended_on is null;

  if v_location = 'destination' then
    update public.queen_assignments
    set
      ended_on = v_event_date,
      end_reason = 'Moved during split',
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where id = v_assignment_id;

    insert into public.queen_assignments (
      user_id, queen_id, apiary_id, hive_id,
      started_on, start_reason, notes
    )
    values (
      v_uid, v_queen_id, v_destination_apiary_id, p_destination_hive_id,
      v_event_date, 'Moved during split',
      nullif(trim(coalesce(p_notes, '')), '')
    );

    v_queenless_hive_id := p_source_hive_id;
    v_queenless_apiary_id := v_source_apiary_id;

  elsif v_location = 'source' then
    v_queenless_hive_id := p_destination_hive_id;
    v_queenless_apiary_id := v_destination_apiary_id;

  else
    update public.queen_assignments
    set
      ended_on = v_event_date,
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
      started_on, expected_check_on, notes, metadata
    )
    values (
      v_uid, v_source_apiary_id, p_source_hive_id,
      'queen_location_check',
      'Queen location unknown after split',
      'active',
      v_event_date,
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), ''),
      jsonb_strip_nulls(jsonb_build_object(
        'split_reason', nullif(trim(coalesce(p_split_reason, '')), ''),
        'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), '')
      ))
    )
    returning id into v_process_id;

    insert into public.queen_processes (
      user_id, apiary_id, hive_id,
      process_type, method, status,
      started_on, expected_check_on, notes, metadata
    )
    values (
      v_uid, v_destination_apiary_id, p_destination_hive_id,
      'queen_location_check',
      'Queen location unknown after split',
      'active',
      v_event_date,
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), ''),
      jsonb_strip_nulls(jsonb_build_object(
        'split_reason', nullif(trim(coalesce(p_split_reason, '')), ''),
        'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), '')
      ))
    );
  end if;

  if v_queenless_hive_id is not null
     and nullif(trim(coalesce(p_replacement_method, '')), '') is not null then
    insert into public.queen_processes (
      user_id,
      apiary_id,
      hive_id,
      source_hive_id,
      process_type,
      method,
      status,
      started_on,
      expected_check_on,
      notes,
      metadata
    )
    values (
      v_uid,
      v_queenless_apiary_id,
      v_queenless_hive_id,
      p_brood_source_hive_id,
      'replacement_after_split',
      trim(p_replacement_method),
      'active',
      v_event_date,
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), ''),
      jsonb_strip_nulls(jsonb_build_object(
        'split_reason', nullif(trim(coalesce(p_split_reason, '')), ''),
        'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), ''),
        'brood_source_hive_id', p_brood_source_hive_id
      ))
    )
    returning id into v_process_id;
  end if;

  v_detail := nullif(
    concat_ws(
      ' • ',
      nullif(trim(coalesce(p_split_reason, '')), ''),
      nullif(trim(coalesce(p_queen_cell_position, '')), ''),
      nullif(trim(coalesce(p_notes, '')), '')
    ),
    ''
  );

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, process_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_source_apiary_id, p_source_hive_id, v_queen_id, v_process_id,
    v_event_date, 'split',
    'Split recorded',
    v_detail,
    jsonb_strip_nulls(jsonb_build_object(
      'destination_hive_id', p_destination_hive_id,
      'queen_location', v_location,
      'split_reason', nullif(trim(coalesce(p_split_reason, '')), ''),
      'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), ''),
      'replacement_method', nullif(trim(coalesce(p_replacement_method, '')), ''),
      'brood_source_hive_id', p_brood_source_hive_id,
      'expected_check_on', p_expected_check_on
    ))
  );

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id,
    event_date, event_type, title, detail, metadata
  )
  values (
    v_uid, v_destination_apiary_id, p_destination_hive_id, v_queen_id,
    v_event_date, 'split',
    'Colony created by split',
    v_detail,
    jsonb_strip_nulls(jsonb_build_object(
      'source_hive_id', p_source_hive_id,
      'queen_location', v_location,
      'split_reason', nullif(trim(coalesce(p_split_reason, '')), ''),
      'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), ''),
      'replacement_method', nullif(trim(coalesce(p_replacement_method, '')), ''),
      'brood_source_hive_id', p_brood_source_hive_id,
      'expected_check_on', p_expected_check_on
    ))
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'process_id', v_process_id,
    'queen_location', v_location,
    'queenless_hive_id', v_queenless_hive_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Create or update the plan for an already queenless hive
-- ---------------------------------------------------------------------------

create or replace function public.queen_set_queenless_plan(
  p_hive_id uuid,
  p_event_date date,
  p_method text,
  p_queen_cell_position text,
  p_source_hive_id uuid,
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
  v_previous_method text;
  v_event_date date := coalesce(p_event_date, current_date);
  v_method text := nullif(trim(coalesce(p_method, '')), '');
  v_title text;
  v_detail text;
  v_updated boolean := false;
begin
  if v_method is null then
    raise exception 'A Queenless colony plan is required';
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
    select 1
    from public.queen_assignments qa
    where qa.hive_id = p_hive_id
      and qa.user_id = v_uid
      and qa.ended_on is null
  ) then
    raise exception 'This action is only available for a hive without a current Queen';
  end if;

  if p_source_hive_id is not null then
    if p_source_hive_id = p_hive_id then
      raise exception 'The brood source must be a different hive';
    end if;

    if not exists (
      select 1
      from public.hives h
      where h.id = p_source_hive_id
        and h.user_id = v_uid
        and h.archived_at is null
    ) then
      raise exception 'Brood source hive was not found';
    end if;
  end if;

  select qp.id, qp.method
    into v_process_id, v_previous_method
  from public.queen_processes qp
  where qp.hive_id = p_hive_id
    and qp.user_id = v_uid
    and qp.ended_on is null
  order by qp.started_on desc, qp.created_at desc
  limit 1;

  if v_process_id is null then
    insert into public.queen_processes (
      user_id,
      apiary_id,
      hive_id,
      source_hive_id,
      process_type,
      method,
      status,
      started_on,
      expected_check_on,
      notes,
      metadata
    )
    values (
      v_uid,
      v_apiary_id,
      p_hive_id,
      p_source_hive_id,
      'queenless_plan',
      v_method,
      'active',
      v_event_date,
      p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), ''),
      jsonb_strip_nulls(jsonb_build_object(
        'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), ''),
        'source_hive_id', p_source_hive_id
      ))
    )
    returning id into v_process_id;
  else
    update public.queen_processes
    set
      source_hive_id = p_source_hive_id,
      process_type = 'queenless_plan',
      method = v_method,
      status = 'active',
      expected_check_on = p_expected_check_on,
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
        'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), ''),
        'source_hive_id', p_source_hive_id,
        'plan_updated_on', v_event_date
      ))
    where id = v_process_id;

    v_updated := true;
  end if;

  v_title := case
    when lower(v_method) like '%frame of eggs%' and lower(v_method) like '%added%'
      then 'Frame of eggs or young larvae added'
    when lower(v_method) like '%frame of eggs%'
      then 'Brood frame planned'
    when lower(v_method) like '%raise its own queen%'
      then 'Colony left to raise its own Queen'
    when lower(v_method) like '%emergency%cells retained%'
      then 'Emergency Queen cells retained'
    when lower(v_method) like '%supersedure%cells retained%'
      then 'Supersedure Queen cells retained'
    when lower(v_method) like '%swarm%cells retained%'
      then 'Swarm Queen cells retained'
    else 'Queenless colony plan updated'
  end;

  v_detail := nullif(
    concat_ws(
      ' • ',
      nullif(trim(coalesce(p_queen_cell_position, '')), ''),
      nullif(trim(coalesce(p_notes, '')), '')
    ),
    ''
  );

  insert into public.queen_events (
    user_id,
    apiary_id,
    hive_id,
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
    v_process_id,
    v_event_date,
    'queenless_plan',
    v_title,
    v_detail,
    jsonb_strip_nulls(jsonb_build_object(
      'method', v_method,
      'previous_method', nullif(trim(coalesce(v_previous_method, '')), ''),
      'queen_cell_position', nullif(trim(coalesce(p_queen_cell_position, '')), ''),
      'source_hive_id', p_source_hive_id,
      'expected_check_on', p_expected_check_on,
      'updated_existing_process', v_updated
    ))
  );

  return jsonb_build_object(
    'process_id', v_process_id,
    'updated_existing_process', v_updated
  );
end;
$$;

revoke all on function public.queen_record_split_v2(
  uuid, uuid, date, text, text, text, text, uuid, date, text
) from public;
revoke all on function public.queen_set_queenless_plan(
  uuid, date, text, text, uuid, date, text
) from public;

grant execute on function public.queen_record_split_v2(
  uuid, uuid, date, text, text, text, text, uuid, date, text
) to authenticated;
grant execute on function public.queen_record_split_v2(
  uuid, uuid, date, text, text, text, text, uuid, date, text
) to service_role;

grant execute on function public.queen_set_queenless_plan(
  uuid, date, text, text, uuid, date, text
) to authenticated;
grant execute on function public.queen_set_queenless_plan(
  uuid, date, text, text, uuid, date, text
) to service_role;

commit;
