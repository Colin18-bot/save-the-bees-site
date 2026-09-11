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
set search_path to 'public'
as $function$
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
  v_event_date date := coalesce(p_event_date, current_date);
  v_new_queenless_process_id uuid;
begin
  if v_progress = '' then
    raise exception 'Progress is required';
  end if;

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
      user_id, reference, queen_year, marked, actual_colour,
      origin, emerged_on, status, notes
    ) values (
      v_uid,
      'Q-' || extract(year from v_event_date)::integer::text || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
      extract(year from v_event_date)::integer,
      false,
      'Unmarked',
      'Home-reared queen',
      v_event_date,
      'virgin',
      nullif(trim(coalesce(p_notes, '')), '')
    ) returning id into v_queen_id;

    insert into public.queen_assignments (
      user_id, queen_id, apiary_id, hive_id,
      started_on, start_reason, notes
    ) values (
      v_uid, v_queen_id, v_apiary_id, p_hive_id,
      v_event_date, 'Queen emerged', nullif(trim(coalesce(p_notes, '')), '')
    ) returning id into v_assignment_id;

    update public.queen_processes set queen_id = v_queen_id where id = v_process_id;
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
      v_queen_status := 'no longer present';
      v_close_assignment := true;
      v_close_process := true;
    else v_queen_status := null;
  end case;

  if v_queen_id is not null and v_queen_status is not null then
    update public.queens
    set status = v_queen_status
    where id = v_queen_id and user_id = v_uid;
  end if;

  if v_close_assignment and v_assignment_id is not null then
    update public.queen_assignments
    set ended_on = v_event_date,
        end_reason = v_progress,
        notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where id = v_assignment_id;
  end if;

  if v_process_id is not null then
    update public.queen_processes
    set status = v_progress_lower,
        expected_check_on = coalesce(p_expected_check_on, expected_check_on),
        ended_on = case when v_close_process then v_event_date else ended_on end,
        notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes)
    where id = v_process_id;
  end if;

  if v_progress_lower = 'queenless confirmed' then
    insert into public.queen_processes (
      user_id, apiary_id, hive_id, process_type, method, status,
      started_on, expected_check_on, notes, metadata
    ) values (
      v_uid, v_apiary_id, p_hive_id,
      'queenless_plan', 'Not yet decided', 'queenless confirmed',
      v_event_date, p_expected_check_on,
      nullif(trim(coalesce(p_notes, '')), ''),
      jsonb_build_object('created_from_progress', 'Queenless confirmed')
    ) returning id into v_new_queenless_process_id;

    v_process_id := v_new_queenless_process_id;
  end if;

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, process_id,
    event_date, event_type, title, detail, metadata
  ) values (
    v_uid, v_apiary_id, p_hive_id, v_queen_id, v_process_id,
    v_event_date, 'progress', v_progress,
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_strip_nulls(jsonb_build_object('expected_check_on', p_expected_check_on))
  );

  return jsonb_build_object(
    'queen_id', v_queen_id,
    'process_id', v_process_id,
    'assignment_ended', v_close_assignment,
    'process_ended', v_close_process,
    'queenless_plan_created', v_progress_lower = 'queenless confirmed'
  );
end;
$function$;
