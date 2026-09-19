-- Keep Queenless process history aligned with the dated event, even when entered later.

create or replace function public.tg_queenless_event_backdate_process()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.event_type = 'queenless_plan' and new.process_id is not null then
    update public.queen_processes
    set started_on = least(started_on, new.event_date),
        updated_at = now()
    where id = new.process_id
      and user_id = new.user_id
      and process_type = 'queenless_plan'
      and new.event_date < started_on;
  end if;

  return new;
end;
$function$;

drop trigger if exists queenless_events_backdate_process on public.queen_events;
create trigger queenless_events_backdate_process
after insert on public.queen_events
for each row
when (new.event_type = 'queenless_plan')
execute function public.tg_queenless_event_backdate_process();
