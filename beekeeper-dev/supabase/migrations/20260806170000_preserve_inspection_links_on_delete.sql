-- 20260806170000_preserve_inspection_links_on_delete.sql
--
-- Corrects permanent inspection deletion so linked tasks and logbook entries
-- are preserved. Their inspection_id is cleared atomically before the
-- inspection is removed. Existing archive state and all other record data are
-- retained.

begin;

create or replace function public.delete_inspection_with_linked_cleanup(
  p_inspection_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_logs_unlinked integer := 0;
  v_todos_unlinked integer := 0;
  v_inspections_deleted integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'This function may only be called by the service role';
  end if;

  select i.user_id
  into v_owner_id
  from public.inspections i
  where i.id = p_inspection_id
  for update;

  if v_owner_id is null then
    raise exception 'Inspection not found';
  end if;

  if v_owner_id <> p_user_id then
    raise exception 'Forbidden';
  end if;

  -- Preserve every linked logbook entry, including archived entries.
  update public.logbook
  set inspection_id = null
  where user_id = p_user_id
    and inspection_id = p_inspection_id;
  get diagnostics v_logs_unlinked = row_count;

  -- Preserve every linked task, including archived tasks.
  update public.todos
  set inspection_id = null
  where user_id = p_user_id
    and inspection_id = p_inspection_id;
  get diagnostics v_todos_unlinked = row_count;

  -- The inspection Queen snapshot is removed by its foreign-key cascade.
  -- The main Queen record, assignments, events and processes are untouched.
  delete from public.inspections
  where id = p_inspection_id
    and user_id = p_user_id;
  get diagnostics v_inspections_deleted = row_count;

  if v_inspections_deleted <> 1 then
    raise exception 'Inspection could not be deleted';
  end if;

  return jsonb_build_object(
    'ok', true,
    'inspection_id', p_inspection_id,
    'deleted_inspections', v_inspections_deleted,
    'preserved_todos', v_todos_unlinked,
    'preserved_logs', v_logs_unlinked,
    'unlinked_todos', v_todos_unlinked,
    'unlinked_logs', v_logs_unlinked,
    'main_queen_record_changed', false
  );
end;
$$;

revoke all on function public.delete_inspection_with_linked_cleanup(uuid, uuid)
from public;

grant execute on function public.delete_inspection_with_linked_cleanup(uuid, uuid)
to service_role;

commit;
