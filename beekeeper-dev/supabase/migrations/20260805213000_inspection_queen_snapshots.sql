-- HiveTag inspection Queen snapshots
-- Automatically links the Queen assigned to the hive/date and preserves
-- an immutable copy of that Queen record on the inspection.

begin;

create or replace function public.resolve_inspection_queen_id(
  p_hive_id uuid,
  p_on_date date,
  p_user_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select qa.queen_id
  from public.queen_assignments qa
  where qa.user_id = p_user_id
    and qa.hive_id = p_hive_id
    and qa.started_on <= coalesce(p_on_date, current_date)
    and (
      qa.ended_on is null
      or qa.ended_on > coalesce(p_on_date, current_date)
    )
  order by
    case when qa.ended_on is null then 0 else 1 end,
    qa.started_on desc,
    qa.created_at desc
  limit 1;
$$;

revoke all on function public.resolve_inspection_queen_id(uuid, date, uuid)
  from public;
grant execute on function public.resolve_inspection_queen_id(uuid, date, uuid)
  to service_role;

create or replace function public.tg_inspections_queen_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

    if v_context_changed or old.queen_snapshot is null then
      new.queen_id := public.resolve_inspection_queen_id(
        new.hive_id,
        new.date,
        new.user_id
      );
    else
      -- Queen identity and snapshot are historical fields. Normal edits must
      -- not replace them with later live Queen information.
      new.queen_id := old.queen_id;
      new.queen_snapshot := old.queen_snapshot;
      return new;
    end if;
  end if;

  if new.queen_id is null then
    new.queen_snapshot := null;
    return new;
  end if;

  select q.user_id
    into v_queen_user
  from public.queens q
  where q.id = new.queen_id;

  if v_queen_user is null then
    raise exception 'Queen % not found', new.queen_id;
  end if;

  if v_queen_user <> new.user_id then
    raise exception 'Queen and inspection belong to different users';
  end if;

  new.queen_snapshot := public.build_queen_snapshot(
    new.queen_id,
    new.hive_id,
    new.date,
    new.user_id
  );

  return new;
end;
$$;

-- The existing trigger created by the Queen Records foundation continues to
-- use the replaced function above. Recreate it defensively so staging and
-- future environments are identical.
drop trigger if exists zz_inspections_queen_snapshot
  on public.inspections;

create trigger zz_inspections_queen_snapshot
before insert or update of queen_id, queen_snapshot, hive_id, date, user_id
on public.inspections
for each row
execute function public.tg_inspections_queen_snapshot();

comment on column public.inspections.queen_id is
  'Queen assigned to the hive for the inspection date when the inspection was saved.';

comment on column public.inspections.queen_snapshot is
  'Immutable copy of the Queen information that applied when the inspection was saved.';

commit;
