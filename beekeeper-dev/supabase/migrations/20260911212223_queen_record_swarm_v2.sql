create or replace function public.queen_record_swarm_v2(
  p_hive_id uuid,
  p_event_date date,
  p_outcome text,
  p_destination_hive_id uuid default null,
  p_replacement_method text default null,
  p_expected_check_on date default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_uid uuid := public.queen_require_premium();
  v_event_date date := coalesce(p_event_date, current_date);
  v_outcome text := lower(trim(coalesce(p_outcome, ''));
  v_source_apiary_id uuid;
  v_source_hive_name text;
  v_destination_apiary_id uuid;
  v_destination_hive_name text;
  v_assignment_id uuid;
  v_assignment_started_on date;
  v_queen_id uuid;
  v_queen_status text;
  v_process_id uuid;
  v_replacement_method text := coalesce(nullif(trim(coalesce(p_replacement_method, '')), ''), 'Not yet decided');
  v_title text;
  v_detail text;
begin
  if v_outcome not in ('lost_not_recovered', 'recovered_returned', 'recovered_to_hive') then
    raise exception 'Select a valid swarm outcome';
  end if;

  if v_event_date > current_date then
    raise exception 'The swarm date cannot be in the future';
  end if;

  select h.apiary_id, h.name
    into v_source_apiary_id, v_source_hive_name
  from public.hives h
  where h.id = p_hive_id
    and h.user_id = v_uid
    and h.archived_at is null
  for update;

  if v_source_apiary_id is null then
    raise exception 'Hive not found or not available';
  end if;

  select qa.id, qa.queen_id, qa.started_on
    into v_assignment_id, v_queen_id, v_assignment_started_on
  from public.queen_assignments qa
  where qa.hive_id = p_hive_id
    and qa.user_id = v_uid
    and qa.ended_on is null
  limit 1
  for update;

  if v_queen_id is null then
    raise exception 'This hive does not have a current Queen to record as swarmed';
  end if;

  if v_event_date < v_assignment_started_on then
    raise exception 'The swarm date cannot be before the current Queen assignment began';
  end if;

  select q.status
    into v_queen_status
  from public.queens q
  where q.id = v_queen_id
    and q.user_id = v_uid
  for update;

  if v_outcome = 'recovered_to_hive' then
    if p_destination_hive_id is null then
      raise exception 'Select the hive or nucleus where the recovered swarm was placed';
    end if;

    if p_destination_hive_id = p_hive_id then
      raise exception 'Choose Recovered and returned to this hive when the swarm was put back into the same hive';
    end if;

    select h.apiary_id, h.name
      into v_destination_apiary_id, v_destination_hive_name
    from public.hives h
    where h.id = p_destination_hive_id
      and h.user_id = v_uid
      and h.archived_at is null
    for update;

    if v_destination_apiary_id is null then
      raise exception 'Destination hive or nucleus was not found';
    end if;

    if exists (
      select 1 from public.queen_assignments qa
      where qa.hive_id = p_destination_hive_id
        and qa.user_id = v_uid
        and qa.ended_on is null
    ) then
      raise exception 'The destination hive already has a current Queen';
    end if;

    if exists (
      select 1 from public.queen_processes qp
      where qp.hive_id = p_destination_hive_id
        and qp.user_id = v_uid
        and qp.ended_on is null
    ) then
      raise exception 'The destination hive already has an active Queen process';
    end if;
  elsif p_destination_hive_id is not null then
    raise exception 'A destination hive is only used when a recovered swarm is placed in another hive or nucleus';
  end if;

  if v_outcome = 'recovered_returned' then
    v_title := 'Swarm recovered and returned';
    v_detail := nullif(trim(coalesce(p_notes, '')), '');

    insert into public.queen_events (
      user_id, apiary_id, hive_id, queen_id,
      event_date, event_type, title, detail, metadata
    ) values (
      v_uid, v_source_apiary_id, p_hive_id, v_queen_id,
      v_event_date, 'swarm', v_title, v_detail,
      jsonb_build_object('swarm_outcome', v_outcome)
    );

    return jsonb_build_object(
      'queen_id', v_queen_id,
      'process_id', null,
      'swarm_outcome', v_outcome,
      'queen_assignment_ended', false,
      'destination_hive_id', null
    );
  end if;

  update public.queen_processes
  set ended_on = greatest(started_on, v_event_date),
      expected_check_on = null,
      status = 'ended by swarm',
      notes = case
        when nullif(trim(coalesce(p_notes, '')), '') is null then notes
        else concat_ws(E'\n', nullif(trim(coalesce(notes, '')), ''), trim(p_notes))
      end,
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('ended_by_swarm', true),
      updated_at = now()
  where hive_id = p_hive_id
    and user_id = v_uid
    and ended_on is null;

  update public.queen_assignments
  set ended_on = v_event_date,
      end_reason = case
        when v_outcome = 'lost_not_recovered' then 'Swarmed — not recovered'
        else 'Swarmed — recovered into another hive'
      end,
      notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes),
      updated_at = now()
  where id = v_assignment_id
    and user_id = v_uid;

  if v_outcome = 'lost_not_recovered' then
    update public.queens
    set status = 'swarmed', updated_at = now()
    where id = v_queen_id and user_id = v_uid;
    v_title := 'Swarm lost / not recovered';
  else
    insert into public.queen_assignments (
      user_id, queen_id, apiary_id, hive_id,
      started_on, start_reason, notes
    ) values (
      v_uid, v_queen_id, v_destination_apiary_id, p_destination_hive_id,
      v_event_date, 'Recovered swarm hived',
      nullif(trim(coalesce(p_notes, '')), '')
    );

    update public.queens
    set status = coalesce(nullif(v_queen_status, ''), 'active'),
        archived_at = null,
        updated_at = now()
    where id = v_queen_id and user_id = v_uid;

    v_title := 'Swarm recovered into ' || v_destination_hive_name;
  end if;

  insert into public.queen_processes (
    user_id, apiary_id, hive_id,
    process_type, method, status,
    started_on, expected_check_on, notes, metadata
  ) values (
    v_uid, v_source_apiary_id, p_hive_id,
    'replacement_after_swarm', v_replacement_method, 'active',
    v_event_date, p_expected_check_on,
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_strip_nulls(jsonb_build_object(
      'swarm_outcome', v_outcome,
      'recovered_destination_hive_id', p_destination_hive_id
    ))
  ) returning id into v_process_id;

  v_detail := nullif(concat_ws(
    ' • ',
    case
      when v_outcome = 'lost_not_recovered' then 'Swarm not recovered'
      else 'Recovered swarm placed in ' || v_destination_hive_name
    end,
    'Source colony: ' || v_replacement_method,
    nullif(trim(coalesce(p_notes, '')), '')
  ), '');

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, process_id,
    event_date, event_type, title, detail, metadata
  ) values (
    v_uid, v_source_apiary_id, p_hive_id, v_queen_id, v_process_id,
    v_event_date, 'swarm', v_title, v_detail,
    jsonb_strip_nulls(jsonb_build_object(
      'swarm_outcome', v_outcome,
      'destination_hive_id', p_destination_hive_id,
      'replacement_method', v_replacement_method,
      'expected_check_on', p_expected_check_on
    ))
  );

  if v_outcome = 'recovered_to_hive' then
    insert into public.queen_events (
      user_id, apiary_id, hive_id, queen_id,
      event_date, event_type, title, detail, metadata
    ) values (
      v_uid, v_destination_apiary_id, p_destination_hive_id, v_queen_id,
      v_event_date, 'swarm_recovery',
      'Recovered swarm hived from ' || v_source_hive_name,
      nullif(trim(coalesce(p_notes, '')), ''),
      jsonb_build_object('source_hive_id', p_hive_id, 'swarm_outcome', v_outcome)
    );
  end if;

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'process_id', v_process_id,
    'swarm_outcome', v_outcome,
    'queen_assignment_ended', true,
    'destination_hive_id', p_destination_hive_id
  );
end;
$function$;

revoke all on function public.queen_record_swarm_v2(uuid, date, text, uuid, text, date, text) from public;
revoke all on function public.queen_record_swarm_v2(uuid, date, text, uuid, text, date, text) from anon;
grant execute on function public.queen_record_swarm_v2(uuid, date, text, uuid, text, date, text) to authenticated;
