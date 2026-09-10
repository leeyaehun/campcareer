-- P0.5: raw country-occupation records include legacy score components and
-- source evidence. They are consumed only by server-only read models; public
-- routes return the deliberately shaped Career Page representation instead.
--
-- Deploy the application version that uses supabaseAdmin for these reads
-- before applying this migration. The service role continues to bypass RLS.

grant select on table public.country_occupation_profiles to service_role;
grant select on table public.country_occupation_metric_snapshots to service_role;
grant select on table public.country_occupation_specialisations to service_role;
grant select on table public.country_occupation_region_metrics to service_role;
grant select on table public.country_occupation_links to service_role;
grant select on table public.country_occupation_program_links to service_role;

drop policy if exists "country occupation profiles public read" on public.country_occupation_profiles;
drop policy if exists "country occupation metrics public read" on public.country_occupation_metric_snapshots;
drop policy if exists "country occupation specialisations public read" on public.country_occupation_specialisations;
drop policy if exists "country occupation regions public read" on public.country_occupation_region_metrics;
drop policy if exists "country occupation links public read" on public.country_occupation_links;
drop policy if exists "country occupation program links public read" on public.country_occupation_program_links;

revoke all on table public.country_occupation_profiles from public, anon, authenticated;
revoke all on table public.country_occupation_metric_snapshots from public, anon, authenticated;
revoke all on table public.country_occupation_specialisations from public, anon, authenticated;
revoke all on table public.country_occupation_region_metrics from public, anon, authenticated;
revoke all on table public.country_occupation_links from public, anon, authenticated;
revoke all on table public.country_occupation_program_links from public, anon, authenticated;
