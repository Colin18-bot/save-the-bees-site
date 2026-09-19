-- Use inspection evidence to progress the current Queen lifecycle without
-- rewriting snapshots on earlier inspections.

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
  v_latest_event_date date;
  v_process_id uuid;
  v_process_started_on date;
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
      null,
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

  update public.queens q
  set status = 'laying'
  where q.id = p_queen_id
    and q.user_id = p_user_id;

  select qp.id, qp.started_on
    into v_process_id, v_process_started_on
  from public.queen_processes qp
  where qp.user_id = p_user_id
    and qp.hive_id = p_hive_id
    and qp.ended_on is null
    and qp.started_on <= p_event_date
    and (qp.queen_id is null or qp.queen_id = p_queen_id)
  order by qp.started_on desc, qp.created_at desc
  limit 1;

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

    update public.queen_events
    set process_id = v_process_id
    where user_id = p_user_id
      and hive_id = p_hive_id
      and queen_id = p_queen_id
      and event_type = 'inspection_evidence'
      and metadata->>'inspection_id' = p_inspection_id::text
      and process_id is null;
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

create or replace function public.tg_inspections_queen_snapshot()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_queen_user uuid;
  v_context_changed boolean := false;
  v_queen_evidence_changed boolean := false;
begin
  if tg_op = 'INSERT' then
    new.queen_id := public.resolve_inspection_queen_id(
      new.hive_id, new.date, new.user_id
    );
  else
    v_context_changed :=
      new.hive_id is distinct from old.hive_id
      or new.date is distinct from old.date
      or new.user_id is distinct from old.user_id;

    v_queen_evidence_changed :=
      new.queen_status is distinct from old.queen_status;

    if not v_context_changed
       and not v_queen_evidence_changed
       and old.queen_snapshot is not null then
      new.queen_id := old.queen_id;
      new.queen_snapshot := old.queen_snapshot;
      new.queen_process_snapshot := old.queen_process_snapshot;
      return new;
    end if;

    new.queen_id := public.resolve_inspection_queen_id(
      new.hive_id, new.date, new.user_id
    );
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

    perform public.queen_apply_inspection_evidence_internal(
      new.id,
      new.hive_id,
      new.user_id,
      new.queen_id,
      new.date,
      new.queen_status
    );

    new.queen_snapshot := public.build_queen_snapshot(
      new.queen_id, new.hive_id, new.date, new.user_id
    );
    new.queen_process_snapshot := null;
    return new;
  end if;

  new.queen_id := null;
  new.queen_snapshot := null;

  if v_context_changed
     or v_queen_evidence_changed
     or new.queen_process_snapshot is null then
    new.queen_process_snapshot := public.build_queen_process_snapshot(
      new.hive_id, new.date, new.user_id
    );
  end if;

  return new;
end;
$function$;
