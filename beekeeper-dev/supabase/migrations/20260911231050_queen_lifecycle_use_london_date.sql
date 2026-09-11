-- Keep Queen lifecycle date validation aligned with the UK-facing app date.
-- Supabase runs in UTC, which otherwise causes valid local dates just after
-- midnight during BST to be rejected as being in the future.

alter function public.queen_create_for_hive(uuid,date,text,text,integer,boolean,text,boolean,text,text,text,date)
  set timezone to 'Europe/London';

alter function public.queen_record_progress(uuid,date,text,text,date)
  set timezone to 'Europe/London';

alter function public.queen_record_split(uuid,uuid,date,text,text,date,text)
  set timezone to 'Europe/London';

alter function public.queen_record_split_v2(uuid,uuid,date,text,text,text,text,uuid,date,text)
  set timezone to 'Europe/London';

alter function public.queen_record_swarm(uuid,date,text,date,text)
  set timezone to 'Europe/London';

alter function public.queen_record_swarm_v2(uuid,date,text,uuid,text,date,text)
  set timezone to 'Europe/London';

alter function public.queen_record_union(uuid,uuid,uuid,date,uuid,text,text)
  set timezone to 'Europe/London';

alter function public.queen_set_queenless_plan(uuid,date,text,text,uuid,date,text)
  set timezone to 'Europe/London';

alter function public.queen_start_rearing(uuid,date,text,date,text)
  set timezone to 'Europe/London';

alter function public.queen_transfer(uuid,uuid,date,text)
  set timezone to 'Europe/London';
