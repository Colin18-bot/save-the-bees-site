begin;

revoke all on function public.delete_user(uuid) from public;
revoke all on function public.delete_user(uuid) from authenticated;

grant execute on function public.delete_user(uuid) to service_role;

commit;