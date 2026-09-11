alter view public.program_explorer_fi_v1 set (security_invoker=true);
alter view public.program_detail_fi_v1 set (security_invoker=true);
revoke all on public.program_explorer_fi_v1 from public,anon,authenticated;
revoke all on public.program_detail_fi_v1 from public,anon,authenticated;
grant select on public.program_explorer_fi_v1 to service_role;
grant select on public.program_detail_fi_v1 to service_role;
