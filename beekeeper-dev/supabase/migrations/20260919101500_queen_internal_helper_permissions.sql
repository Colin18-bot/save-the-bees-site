-- Internal Queen snapshot/reconciliation helpers are called by owned triggers/functions,
-- not directly from the client.

revoke all on function public.reconcile_queen_context_for_hive(uuid,uuid) from public;
revoke all on function public.reconcile_queen_context_for_hive(uuid,uuid) from anon;
revoke all on function public.reconcile_queen_context_for_hive(uuid,uuid) from authenticated;

revoke all on function public.build_queen_process_snapshot(uuid,date,uuid) from public;
revoke all on function public.build_queen_process_snapshot(uuid,date,uuid) from anon;
revoke all on function public.build_queen_process_snapshot(uuid,date,uuid) from authenticated;

revoke all on function public.queen_status_at_date(uuid,uuid,date,uuid) from public;
revoke all on function public.queen_status_at_date(uuid,uuid,date,uuid) from anon;
revoke all on function public.queen_status_at_date(uuid,uuid,date,uuid) from authenticated;
