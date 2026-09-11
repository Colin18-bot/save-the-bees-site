revoke all on function public.queen_record_progress(uuid, date, text, text, date) from public;
revoke all on function public.queen_record_progress(uuid, date, text, text, date) from anon;
grant execute on function public.queen_record_progress(uuid, date, text, text, date) to authenticated;
