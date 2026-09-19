-- Ensure reconciled inspections contain either a Queen snapshot or a process snapshot,
-- never stale copies of both, and allow estimated Queen years to be corrected later.

create or replace function public.tg_inspections_queen_snapshot()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_queen_user uuid;
  v_context_changed boolean := false;
begin
  if tg_op = 'INSERT' then
    new.queen_id := public.resolve_inspection_queen_id(
      new.hive_id,
      new.date,
      new.user_id
    );
  else
    v_context_changed :=
      new.hive_id is distinct from old.hive_id
      or new.date is distinct from old.date
      or new.user_id is distinct from old.user_id;

    if not v_context_changed and old.queen_snapshot is not null then
      new.queen_id := old.queen_id;
      new.queen_snapshot := old.queen_snapshot;
      new.queen_process_snapshot := old.queen_process_snapshot;
      return new;
    end if;

    new.queen_id := public.resolve_inspection_queen_id(
      new.hive_id,
      new.date,
      new.user_id
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

    new.queen_snapshot := public.build_queen_snapshot(
      new.queen_id, new.hive_id, new.date, new.user_id
    );
    new.queen_process_snapshot := null;
    return new;
  end if;

  new.queen_id := null;
  new.queen_snapshot := null;

  if v_context_changed or new.queen_process_snapshot is null then
    new.queen_process_snapshot := public.build_queen_process_snapshot(
      new.hive_id, new.date, new.user_id
    );
  end if;

  return new;
end;
$function$;

create or replace function public.queen_update_details(
  p_queen_id uuid,
  p_reference text,
  p_queen_year integer,
  p_queen_year_estimated boolean,
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
set search_path to 'public'
as $function$
declare
  v_uid uuid := public.queen_require_premium();
begin
  update public.queens q
  set
    reference = nullif(trim(coalesce(p_reference, '')), ''),
    queen_year = p_queen_year,
    queen_year_estimated = coalesce(p_queen_year_estimated, false) and p_queen_year is not null,
    marked = coalesce(p_marked, false),
    actual_colour = case
      when nullif(trim(coalesce(p_actual_colour, '')), '') is null then null
      when lower(trim(p_actual_colour)) = 'unknown' then null
      when lower(trim(p_actual_colour)) = 'unmarked' then 'Unmarked'
      else initcap(trim(p_actual_colour))
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
$function$;

revoke all on function public.queen_update_details(
  uuid,text,integer,boolean,boolean,text,boolean,text,text,date,date,text,text
) from public;
revoke all on function public.queen_update_details(
  uuid,text,integer,boolean,boolean,text,boolean,text,text,date,date,text,text
) from anon;
grant execute on function public.queen_update_details(
  uuid,text,integer,boolean,boolean,text,boolean,text,text,date,date,text,text
) to authenticated;
