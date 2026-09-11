grant usage on schema ingest to anon, authenticated;

grant select (
  id,
  country_code,
  country_name,
  visa_name,
  kind,
  note,
  authority,
  source_url,
  source_title,
  last_verified_on,
  display_order,
  is_active,
  updated_at
) on ingest.visa_pathways to anon, authenticated;

alter table ingest.visa_pathways enable row level security;

drop policy if exists public_view_select on ingest.visa_pathways;
create policy public_view_select
on ingest.visa_pathways
for select
to anon, authenticated
using (is_active);

alter view public.visa_pathways set (security_invoker = true);
grant select on public.visa_pathways to anon, authenticated;;
