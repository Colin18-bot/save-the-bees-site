-- Final v1.5.6 Queen function parity cleanup.
-- Keep staging, production and source migrations on the same canonical definitions.

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
      'method', coalesce(
        nullif(qe.metadata->>'method', ''),
        nullif(qe.metadata->>'replacement_method', ''),
        qp.method
      ),
      'status', coalesce(nullif(qe.title, ''), 'Active'),
      'started_on', qp.started_on,
      'expected_check_on', case
        when coalesce(qe.metadata->>'expected_check_on', '') ~ '^\d{4}-\d{2}-\d{2}$'
          then (qe.metadata->>'expected_check_on')::date
        else qp.expected_check_on
      end,
      'notes', coalesce(nullif(qe.detail, ''), qp.notes),
      'inspection_date', p_on_date
    )
  )
  from public.queen_processes qp
  left join lateral (
    select e.title, e.detail, e.metadata
    from public.queen_events e
    where e.process_id = qp.id
      and e.user_id = p_user_id
      and e.event_date <= coalesce(p_on_date, current_date)
    order by e.event_date desc, e.created_at desc
    limit 1
  ) qe on true
  where qp.user_id = p_user_id
    and qp.hive_id = p_hive_id
    and qp.started_on <= coalesce(p_on_date, current_date)
    and (
      qp.ended_on is null
      or qp.ended_on > coalesce(p_on_date, current_date)
    )
  order by qp.started_on desc, qp.created_at desc
  limit 1;
$function$;

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
  set
    ended_on = greatest(started_on, v_event_date),
    status = 'ended by retrospective Queen record',
    notes = concat_ws(E'\n', nullif(trim(coalesce(notes, '')), ''), 'Queen subsequently established retrospectively.')
  where hive_id = p_hive_id
    and user_id = v_uid
    and ended_on is null
    and started_on <= v_event_date;

  insert into public.queens (
    user_id, reference, queen_year, queen_year_estimated, marked, actual_colour,
    clipped, origin, supplier, status, notes
  )
  values (
    v_uid, v_reference, p_queen_year,
    coalesce(p_year_estimated, false) and p_queen_year is not null,
    v_marked, v_actual_colour, null,
    coalesce(nullif(trim(coalesce(p_origin, '')), ''), 'Unknown'),
    null, v_status, v_notes
  )
  returning id into v_queen_id;

  insert into public.queen_assignments (
    user_id, queen_id, apiary_id, hive_id, started_on, start_reason, notes
  )
  values (
    v_uid, v_queen_id, v_apiary_id, p_hive_id, v_event_date,
    'Retrospective Queen record established', v_notes
  )
  returning id into v_assignment_id;

  insert into public.queen_events (
    user_id, apiary_id, hive_id, queen_id, event_date, event_type, title, detail, metadata
  )
  values (
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
