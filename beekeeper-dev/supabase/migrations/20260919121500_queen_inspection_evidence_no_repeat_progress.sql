-- Once a Queen is established as laying, later inspections with eggs remain
-- normal inspection evidence and do not create repeated lifecycle events.

create or replace function public.queen_apply_inspection_evidence_internal(
  p_inspection_id uuid,
  p_hive_id uuid,
  p_user_id uuid,
  p_queen_id uuid,
  p_event_date date,
  p_queen_status text[]
)
returns void
language plpgsql
security definer
set search_path to 'public'
set "TimeZone" to 'Europe/London'
as $function$
declare
  v_has_eggs boolean := false;
  v_assignment_id uuid;
  v_assignment_ended_on date;
  v_queen_status text;
  v_latest_event_date date;
  v_process_id uuid;
  v_existing_event boolean := false;
begin
  if p_queen_id is null or p_event_date is null then
    return;
  end if;

  if auth.uid() is null
     or auth.uid() <> p_user_id
     or not public.is_current_user_premium() then
    return;
  end if;

  v_has_eggs :=
    coalesce(p_queen_status, array[]::text[]) @> array['Eggs']::text[];

  if not v_has_eggs then
    return;
  end if;

  select qa.id, qa.ended_on
    into v_assignment_id, v_assignment_ended_on
  from public.queen_assignments qa
  where qa.user_id = p_user_id
    and qa.hive_id = p_hive_id
    and qa.queen_id = p_queen_id
    and qa.started_on <= p_event_date
    and (qa.ended_on is null or qa.ended_on >= p_event_date)
  order by qa.started_on desc, qa.created_at desc
  limit 1;

  if v_assignment_id is null then
    return;
  end if;

  select lower(trim(coalesce(q.status, '')))
    into v_queen_status
  from public.queens q
  where q.id = p_queen_id
    and q.user_id = p_user_id;

  select qp.id
    into v_process_id
  from public.queen_processes qp
  where qp.user_id = p_user_id
    and qp.hive_id = p_hive_id
    and qp.ended_on is null
    and qp.started_on <= p_event_date
    and (qp.queen_id is null or qp.queen_id = p_queen_id)
  order by qp.started_on desc, qp.created_at desc
  limit 1;

  select max(qe.event_date)
    into v_latest_event_date
  from public.queen_events qe
  where qe.user_id = p_user_id
    and qe.hive_id = p_hive_id
    and qe.queen_id = p_queen_id
    and not (
      qe.event_type = 'inspection_evidence'
      and qe.metadata->>'inspection_id' = p_inspection_id::text
    );

  if v_assignment_ended_on is not null
     or (v_latest_event_date is not null and v_latest_event_date > p_event_date) then
    return;
  end if;

  if v_queen_status = 'laying' and v_process_id is null then
    return;
  end if;

  select exists (
    select 1
    from public.queen_events qe
    where qe.user_id = p_user_id
      and qe.hive_id = p_hive_id
      and qe.queen_id = p_queen_id
      and qe.event_type = 'inspection_evidence'
      and qe.metadata->>'inspection_id' = p_inspection_id::text
      and lower(coalesce(qe.title, '')) = 'laying queen confirmed'
  )
  into v_existing_event;

  if not v_existing_event then
    insert into public.queen_events (
      user_id, apiary_id, hive_id, queen_id, process_id,
      event_date, event_type, title, detail, metadata
    )
    select
      p_user_id,
      h.apiary_id,
      p_hive_id,
      p_queen_id,
      v_process_id,
      p_event_date,
      'inspection_evidence',
      'Laying queen confirmed',
      'Confirmed from inspection evidence: eggs observed.',
      jsonb_build_object(
        'source', 'inspection',
        'inspection_id', p_inspection_id,
        'evidence', 'Eggs'
      )
    from public.hives h
    where h.id = p_hive_id
      and h.user_id = p_user_id;
  end if;

  update public.queens q
  set status = 'laying'
  where q.id = p_queen_id
    and q.user_id = p_user_id;

  if v_process_id is not null then
    update public.queen_processes
    set
      queen_id = coalesce(queen_id, p_queen_id),
      status = 'laying queen confirmed',
      ended_on = p_event_date,
      notes = concat_ws(
        E'\n',
        nullif(trim(coalesce(notes, '')), ''),
        'Laying confirmed automatically from inspection evidence: eggs observed.'
      )
    where id = v_process_id;
  end if;
end;
$function$;

revoke all on function public.queen_apply_inspection_evidence_internal(
  uuid,uuid,uuid,uuid,date,text[]
) from public;
revoke all on function public.queen_apply_inspection_evidence_internal(
  uuid,uuid,uuid,uuid,date,text[]
) from anon;
revoke all on function public.queen_apply_inspection_evidence_internal(
  uuid,uuid,uuid,uuid,date,text[]
) from authenticated;
