-- Reconstruct the Queen/process state that applied on the inspection date
-- when filling a previously missing inspection snapshot.

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

create or replace function public.queen_status_at_date(
  p_queen_id uuid,
  p_hive_id uuid,
  p_on_date date,
  p_user_id uuid
)
returns text
language sql
stable
security definer
set search_path to 'public'
as $function$
  with assignment as (
    select a.started_on, a.ended_on, a.start_reason
    from public.queen_assignments a
    where a.queen_id = p_queen_id
      and a.hive_id = p_hive_id
      and a.user_id = p_user_id
      and a.started_on <= coalesce(p_on_date, current_date)
      and (a.ended_on is null or a.ended_on >= coalesce(p_on_date, current_date))
    order by a.started_on desc, a.created_at desc
    limit 1
  ),
  latest_event as (
    select e.title, e.metadata
    from public.queen_events e
    where e.queen_id = p_queen_id
      and e.hive_id = p_hive_id
      and e.user_id = p_user_id
      and e.event_date <= coalesce(p_on_date, current_date)
    order by e.event_date desc, e.created_at desc
    limit 1
  )
  select coalesce(
    case lower(trim(coalesce(le.title, '')))
      when 'queen introduced' then 'acceptance pending'
      when 'queen released' then 'introduced'
      when 'queen accepted' then 'accepted'
      when 'virgin queen seen' then 'virgin'
      when 'queen emerged' then 'virgin'
      when 'mating outcome pending' then 'mating'
      when 'eggs observed' then 'laying'
      when 'laying queen confirmed' then 'laying'
      when 'queen presumed lost' then 'presumed lost'
      when 'queenless confirmed' then 'no longer present'
      when 'retrospective queen record established' then
        case
          when lower(coalesce(le.metadata->>'evidence', '')) in ('eggs observed', 'young brood observed')
            then 'laying'
          else 'active'
        end
      else null
    end,
    case
      when lower(coalesce(a.start_reason, '')) = 'queen introduced' then 'acceptance pending'
      when a.ended_on is not null and a.ended_on > coalesce(p_on_date, current_date) then 'active'
      else q.status
    end,
    'active'
  )
  from public.queens q
  left join assignment a on true
  left join latest_event le on true
  where q.id = p_queen_id
    and q.user_id = p_user_id;
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
      'status', public.queen_status_at_date(q.id, p_hive_id, p_on_date, p_user_id),
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
      and a.user_id = p_user_id
      and a.started_on <= coalesce(p_on_date, current_date)
      and (
        a.ended_on is null
        or a.ended_on >= coalesce(p_on_date, current_date)
      )
    order by a.started_on desc, a.created_at desc
    limit 1
  ) qa on true
  where q.id = p_queen_id
    and q.user_id = p_user_id;
$function$;
