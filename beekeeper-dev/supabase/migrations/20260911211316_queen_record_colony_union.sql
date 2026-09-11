create or replace function public.queen_record_union(
  p_hive_a_id uuid,
  p_hive_b_id uuid,
  p_surviving_hive_id uuid,
  p_event_date date,
  p_surviving_queen_id uuid default null,
  p_other_queen_outcome text default null,
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
  v_archive_timestamp timestamp := coalesce(p_event_date, current_date)::timestamp + interval '12 hours';
  v_hive_a_name text;
  v_hive_b_name text;
  v_hive_a_apiary uuid;
  v_hive_b_apiary uuid;
  v_surviving_hive_name text;
  v_surviving_apiary uuid;
  v_redundant_hive_id uuid;
  v_redundant_hive_name text;
  v_redundant_apiary uuid;
  v_a_assignment_id uuid;
  v_a_queen_id uuid;
  v_a_started_on date;
  v_b_assignment_id uuid;
  v_b_queen_id uuid;
  v_b_started_on date;
  v_queen_count integer := 0;
  v_surviving_queen_id uuid;
  v_surviving_queen_assignment_id uuid;
  v_surviving_queen_hive_id uuid;
  v_other_queen_id uuid;
  v_other_queen_assignment_id uuid;
  v_other_outcome_code text := lower(trim(coalesce(p_other_queen_outcome, ''));
  v_other_outcome_label text;
  v_survivor_process public.queen_processes%rowtype;
  v_redundant_process public.queen_processes%rowtype;
  v_continue_process boolean := false;
  v_new_process_id uuid;
  v_archive_notes text;
  v_detail text;
  v_batch uuid := gen_random_uuid();
begin
  if p_hive_a_id is null or p_hive_b_id is null or p_surviving_hive_id is null then
    raise exception 'Both colonies and the hive that will remain in use are required';
  end if;
  if p_hive_a_id = p_hive_b_id then
    raise exception 'Select two different hives to unite';
  end if;
  if p_surviving_hive_id not in (p_hive_a_id, p_hive_b_id) then
    raise exception 'The hive that remains in use must be one of the two colonies being united';
  end if;
  if v_event_date > current_date then
    raise exception 'The union date cannot be in the future';
  end if;

  select h.name, h.apiary_id into v_hive_a_name, v_hive_a_apiary
  from public.hives h
  where h.id = p_hive_a_id and h.user_id = v_uid and h.archived_at is null
  for update;
  if not found then raise exception 'The first hive was not found or is archived'; end if;

  select h.name, h.apiary_id into v_hive_b_name, v_hive_b_apiary
  from public.hives h
  where h.id = p_hive_b_id and h.user_id = v_uid and h.archived_at is null
  for update;
  if not found then raise exception 'The second hive was not found or is archived'; end if;

  if p_surviving_hive_id = p_hive_a_id then
    v_surviving_hive_name := v_hive_a_name;
    v_surviving_apiary := v_hive_a_apiary;
    v_redundant_hive_id := p_hive_b_id;
    v_redundant_hive_name := v_hive_b_name;
    v_redundant_apiary := v_hive_b_apiary;
  else
    v_surviving_hive_name := v_hive_b_name;
    v_surviving_apiary := v_hive_b_apiary;
    v_redundant_hive_id := p_hive_a_id;
    v_redundant_hive_name := v_hive_a_name;
    v_redundant_apiary := v_hive_a_apiary;
  end if;

  select qa.id, qa.queen_id, qa.started_on into v_a_assignment_id, v_a_queen_id, v_a_started_on
  from public.queen_assignments qa
  where qa.hive_id = p_hive_a_id and qa.user_id = v_uid and qa.ended_on is null
  limit 1 for update;

  select qa.id, qa.queen_id, qa.started_on into v_b_assignment_id, v_b_queen_id, v_b_started_on
  from public.queen_assignments qa
  where qa.hive_id = p_hive_b_id and qa.user_id = v_uid and qa.ended_on is null
  limit 1 for update;

  if v_a_queen_id is not null then
    v_queen_count := v_queen_count + 1;
    if v_event_date < v_a_started_on then raise exception 'The union date cannot be before the current Queen assignment in % began', v_hive_a_name; end if;
  end if;
  if v_b_queen_id is not null then
    v_queen_count := v_queen_count + 1;
    if v_event_date < v_b_started_on then raise exception 'The union date cannot be before the current Queen assignment in % began', v_hive_b_name; end if;
  end if;

  if v_queen_count = 0 then
    if p_surviving_queen_id is not null then raise exception 'Neither colony has a current Queen to retain'; end if;
    v_surviving_queen_id := null;
  elsif v_queen_count = 1 then
    v_surviving_queen_id := coalesce(v_a_queen_id, v_b_queen_id);
    if p_surviving_queen_id is not null and p_surviving_queen_id <> v_surviving_queen_id then
      raise exception 'The selected Queen is not the current Queen in either colony';
    end if;
  else
    if p_surviving_queen_id is null then raise exception 'Both colonies are Queenright. Select which Queen will remain after the union'; end if;
    if p_surviving_queen_id not in (v_a_queen_id, v_b_queen_id) then raise exception 'The selected Queen is not the current Queen in either colony'; end if;
    if v_other_outcome_code not in ('removed_before_union', 'lost_or_killed', 'outcome_unknown') then raise exception 'Record what happened to the Queen that did not remain'; end if;
    v_surviving_queen_id := p_surviving_queen_id;
  end if;

  if v_surviving_queen_id = v_a_queen_id then
    v_surviving_queen_assignment_id := v_a_assignment_id;
    v_surviving_queen_hive_id := p_hive_a_id;
    v_other_queen_id := v_b_queen_id;
    v_other_queen_assignment_id := v_b_assignment_id;
  elsif v_surviving_queen_id = v_b_queen_id then
    v_surviving_queen_assignment_id := v_b_assignment_id;
    v_surviving_queen_hive_id := p_hive_b_id;
    v_other_queen_id := v_a_queen_id;
    v_other_queen_assignment_id := v_a_assignment_id;
  end if;

  if v_other_queen_id is not null then
    v_other_outcome_label := case v_other_outcome_code
      when 'removed_before_union' then 'Removed before union'
      when 'lost_or_killed' then 'Lost or killed during union'
      when 'outcome_unknown' then 'Outcome unknown after union'
      else 'No longer present after union'
    end;

    update public.queen_assignments
    set ended_on = v_event_date,
        end_reason = v_other_outcome_label,
        notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes),
        updated_at = now()
    where id = v_other_queen_assignment_id and user_id = v_uid;

    update public.queens
    set status = lower(v_other_outcome_label),
        archived_at = coalesce(archived_at, (v_archive_timestamp at time zone 'Europe/London')),
        updated_at = now()
    where id = v_other_queen_id and user_id = v_uid
      and not exists (select 1 from public.queen_assignments qa where qa.queen_id = v_other_queen_id and qa.ended_on is null);
  end if;

  select qp.* into v_survivor_process
  from public.queen_processes qp
  where qp.hive_id = p_surviving_hive_id and qp.user_id = v_uid and qp.ended_on is null
  order by qp.started_on desc, qp.created_at desc
  limit 1 for update;

  select qp.* into v_redundant_process
  from public.queen_processes qp
  where qp.hive_id = v_redundant_hive_id and qp.user_id = v_uid and qp.ended_on is null
  order by qp.started_on desc, qp.created_at desc
  limit 1 for update;

  if v_surviving_queen_id is not null then
    if v_survivor_process.id is not null and v_survivor_process.queen_id is distinct from v_surviving_queen_id then
      update public.queen_processes
      set ended_on = greatest(started_on, v_event_date), expected_check_on = null,
          status = 'ended by colony union',
          notes = concat_ws(E'\n', nullif(trim(coalesce(notes, '')), ''), nullif(trim(coalesce(p_notes, '')), '')),
          metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('ended_by_union', true),
          updated_at = now()
      where id = v_survivor_process.id;
      v_survivor_process.id := null;
    end if;

    if v_redundant_process.id is not null then
      if v_redundant_process.queen_id = v_surviving_queen_id and v_survivor_process.id is null then v_continue_process := true; end if;
      update public.queen_processes
      set ended_on = greatest(started_on, v_event_date), expected_check_on = null,
          status = case when v_continue_process then 'continued after colony union' else 'ended by colony union' end,
          notes = concat_ws(E'\n', nullif(trim(coalesce(notes, '')), ''), nullif(trim(coalesce(p_notes, '')), '')),
          metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('ended_by_union', true),
          updated_at = now()
      where id = v_redundant_process.id;
    end if;
  else
    if v_redundant_process.id is not null and v_survivor_process.id is null then v_continue_process := true; end if;
    if v_redundant_process.id is not null then
      update public.queen_processes
      set ended_on = greatest(started_on, v_event_date), expected_check_on = null,
          status = case when v_continue_process then 'continued after colony union' else 'ended by colony union' end,
          notes = concat_ws(E'\n', nullif(trim(coalesce(notes, '')), ''), nullif(trim(coalesce(p_notes, '')), '')),
          metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('ended_by_union', true),
          updated_at = now()
      where id = v_redundant_process.id;
    end if;
  end if;

  if v_surviving_queen_id is not null and v_surviving_queen_hive_id <> p_surviving_hive_id then
    update public.queen_assignments
    set ended_on = v_event_date,
        end_reason = 'Moved during colony union',
        notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes),
        updated_at = now()
    where id = v_surviving_queen_assignment_id and user_id = v_uid;

    insert into public.queen_assignments (user_id, queen_id, apiary_id, hive_id, started_on, start_reason, notes)
    values (v_uid, v_surviving_queen_id, v_surviving_apiary, p_surviving_hive_id, v_event_date, 'Moved during colony union', nullif(trim(coalesce(p_notes, '')), ''));
  end if;

  if v_surviving_queen_id is not null then
    update public.queens set archived_at = null, updated_at = now()
    where id = v_surviving_queen_id and user_id = v_uid;
  end if;

  if v_continue_process and v_redundant_process.id is not null then
    insert into public.queen_processes (
      user_id, apiary_id, hive_id, queen_id, source_hive_id,
      process_type, method, status, started_on, expected_check_on, notes, metadata
    ) values (
      v_uid, v_surviving_apiary, p_surviving_hive_id,
      case when v_surviving_queen_id is null then v_redundant_process.queen_id else v_surviving_queen_id end,
      v_redundant_process.source_hive_id, v_redundant_process.process_type, v_redundant_process.method,
      'active', v_event_date, v_redundant_process.expected_check_on, v_redundant_process.notes,
      coalesce(v_redundant_process.metadata, '{}'::jsonb) || jsonb_build_object(
        'continued_from_process_id', v_redundant_process.id,
        'continued_after_union', true,
        'redundant_hive_id', v_redundant_hive_id
      )
    ) returning id into v_new_process_id;
  elsif v_surviving_queen_id is null and v_survivor_process.id is null then
    insert into public.queen_processes (user_id, apiary_id, hive_id, process_type, method, status, started_on, notes, metadata)
    values (
      v_uid, v_surviving_apiary, p_surviving_hive_id,
      'queenless_plan', 'Not yet decided after colony union', 'active', v_event_date,
      nullif(trim(coalesce(p_notes, '')), ''),
      jsonb_build_object('created_after_union', true, 'redundant_hive_id', v_redundant_hive_id)
    ) returning id into v_new_process_id;
  end if;

  v_detail := concat_ws(' • ',
    case
      when v_surviving_queen_id is null then 'Resulting colony remains Queenless'
      when v_surviving_queen_hive_id = p_surviving_hive_id then 'Existing Queen retained in surviving hive'
      else 'Queen transferred into surviving hive'
    end,
    case when v_other_queen_id is not null then 'Other Queen: ' || v_other_outcome_label end,
    nullif(trim(coalesce(p_notes, '')), '')
  );

  insert into public.queen_events (user_id, apiary_id, hive_id, queen_id, process_id, event_date, event_type, title, detail, metadata)
  values (
    v_uid, v_surviving_apiary, p_surviving_hive_id, v_surviving_queen_id, v_new_process_id,
    v_event_date, 'union', 'Colony united with ' || v_redundant_hive_name, v_detail,
    jsonb_strip_nulls(jsonb_build_object(
      'other_hive_id', v_redundant_hive_id,
      'surviving_hive_id', p_surviving_hive_id,
      'redundant_hive_id', v_redundant_hive_id,
      'surviving_queen_id', v_surviving_queen_id,
      'other_queen_id', v_other_queen_id,
      'other_queen_outcome', nullif(v_other_outcome_code, '')
    ))
  );

  insert into public.queen_events (user_id, apiary_id, hive_id, queen_id, event_date, event_type, title, detail, metadata)
  values (
    v_uid, v_redundant_apiary, v_redundant_hive_id, v_surviving_queen_id,
    v_event_date, 'union', 'Colony united into ' || v_surviving_hive_name, v_detail,
    jsonb_strip_nulls(jsonb_build_object(
      'other_hive_id', p_surviving_hive_id,
      'surviving_hive_id', p_surviving_hive_id,
      'redundant_hive_id', v_redundant_hive_id,
      'surviving_queen_id', v_surviving_queen_id,
      'other_queen_id', v_other_queen_id,
      'other_queen_outcome', nullif(v_other_outcome_code, '')
    ))
  );

  v_archive_notes := concat_ws(E'\n',
    'Colony united into ' || v_surviving_hive_name || ' on ' || to_char(v_event_date, 'DD/MM/YYYY') || '.',
    nullif(trim(coalesce(p_notes, '')), '')
  );

  update public.hives
  set archive_reason = 'colony_combined',
      archive_notes = v_archive_notes,
      archive_batch_id = v_batch,
      archive_source = 'manual',
      archived_at = v_archive_timestamp
  where id = v_redundant_hive_id and user_id = v_uid and archived_at is null;

  return jsonb_build_object(
    'ok', true,
    'surviving_hive_id', p_surviving_hive_id,
    'redundant_hive_id', v_redundant_hive_id,
    'surviving_queen_id', v_surviving_queen_id,
    'other_queen_id', v_other_queen_id,
    'other_queen_outcome', nullif(v_other_outcome_code, ''),
    'continued_process_id', v_new_process_id
  );
end;
$function$;

revoke all on function public.queen_record_union(uuid, uuid, uuid, date, uuid, text, text) from public;
revoke all on function public.queen_record_union(uuid, uuid, uuid, date, uuid, text, text) from anon;
grant execute on function public.queen_record_union(uuid, uuid, uuid, date, uuid, text, text) to authenticated;
