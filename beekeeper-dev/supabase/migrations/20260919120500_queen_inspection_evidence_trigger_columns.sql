-- Ensure edits to inspection Queen evidence invoke the Queen snapshot/lifecycle trigger.

drop trigger if exists zz_inspections_queen_snapshot on public.inspections;

create trigger zz_inspections_queen_snapshot
before insert or update of
  queen_id,
  queen_snapshot,
  queen_process_snapshot,
  queen_status,
  hive_id,
  date,
  user_id
on public.inspections
for each row
execute function public.tg_inspections_queen_snapshot();
