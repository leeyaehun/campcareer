-- Netherlands Institution Explorer / Detail publication read models.
create or replace view public.institution_explorer_nl_v1
with (security_invoker = true) as
select
  i.id as institution_id,
  i.country_code,
  i.slug,
  i.canonical_name,
  i.institution_kind,
  i.ownership_type,
  i.website_url,
  coalesce(programmes.program_count, 0)::integer as program_count,
  coalesce(locations.location_count, 0)::integer as campus_count,
  coalesce(locations.city_count, 0)::integer as city_count,
  coalesce(locations.city_names, array[]::text[]) as city_names
from catalog.institutions i
left join lateral (
  select count(*)::integer as program_count
  from catalog.programmes p
  where p.institution_id = i.id
    and p.status = 'active'
) programmes on true
left join lateral (
  select
    count(*)::integer as location_count,
    count(distinct l.city_name)::integer as city_count,
    coalesce(array_agg(distinct l.city_name order by l.city_name) filter (where l.city_name is not null), array[]::text[]) as city_names
  from public.institution_location_nl_v1 l
  where l.institution_id = i.id
) locations on true
where i.country_code = 'NL'
  and i.status <> 'inactive'
  and i.slug is not null;
comment on view public.institution_explorer_nl_v1 is 'Service-role Netherlands institution explorer backed by canonical institutions, canonical programme counts, and DUO/RIO-preferred display locations.';
revoke all on public.institution_explorer_nl_v1 from public, anon, authenticated;
grant select on public.institution_explorer_nl_v1 to service_role;

create or replace view public.institution_detail_nl_v1
with (security_invoker = true) as
select
  i.id as institution_id,
  i.country_code,
  i.slug,
  i.canonical_name,
  i.institution_kind,
  i.ownership_type,
  i.website_url,
  i.status,
  coalesce(programmes.program_count, 0)::integer as program_count,
  coalesce(locations.location_count, 0)::integer as campus_count,
  coalesce(locations.city_count, 0)::integer as city_count,
  coalesce(locations.city_names, array[]::text[]) as city_names,
  null::text as cricos_provider_code,
  null::text as cricos_source_url,
  coalesce(locations.campus_locations, '[]'::jsonb) as campus_locations,
  coalesce(programmes.study_areas, '[]'::jsonb) as study_areas,
  coalesce(programmes.programme_types, '[]'::jsonb) as programme_types,
  coalesce(programmes.programme_preview, '[]'::jsonb) as programme_preview
from catalog.institutions i
left join lateral (
  select
    count(*)::integer as location_count,
    count(distinct l.city_name)::integer as city_count,
    coalesce(array_agg(distinct l.city_name order by l.city_name) filter (where l.city_name is not null), array[]::text[]) as city_names,
    coalesce(jsonb_agg(jsonb_build_object('id', l.campus_id, 'name', l.name, 'city', l.city_name, 'citySlug', l.city_slug, 'reportedCity', l.reported_city, 'region', l.region, 'address', l.address_line, 'postalCode', l.postal_code, 'officialUrl', l.official_url) order by coalesce(l.city_name, l.reported_city, ''), l.campus_id), '[]'::jsonb) as campus_locations
  from public.institution_location_nl_v1 l
  where l.institution_id = i.id
) locations on true
left join lateral (
  select
    count(*)::integer as program_count,
    (select coalesce(jsonb_agg(jsonb_build_object('name', areas.field_name, 'count', areas.program_count) order by areas.program_count desc, areas.field_name), '[]'::jsonb)
     from (select p2.field_name, count(*)::integer as program_count from catalog.programmes p2 where p2.institution_id = i.id and p2.status = 'active' and nullif(btrim(p2.field_name), '') is not null group by p2.field_name order by program_count desc, p2.field_name limit 8) areas) as study_areas,
    (select coalesce(jsonb_agg(jsonb_build_object('name', types.programme_type, 'count', types.program_count) order by types.program_count desc, types.programme_type), '[]'::jsonb)
     from (select p3.programme_type, count(*)::integer as program_count from catalog.programmes p3 where p3.institution_id = i.id and p3.status = 'active' and nullif(btrim(p3.programme_type), '') is not null group by p3.programme_type order by program_count desc, p3.programme_type limit 8) types) as programme_types,
    (select coalesce(jsonb_agg(jsonb_build_object('id', preview.id, 'legacyProgramId', null, 'title', preview.canonical_title, 'programmeType', preview.programme_type, 'fieldName', preview.field_name) order by preview.canonical_title, preview.id), '[]'::jsonb)
     from (select p4.id, p4.canonical_title, p4.programme_type, p4.field_name from catalog.programmes p4 where p4.institution_id = i.id and p4.status = 'active' and nullif(btrim(p4.canonical_title), '') is not null order by p4.canonical_title, p4.id limit 12) preview) as programme_preview
  from catalog.programmes p
  where p.institution_id = i.id
    and p.status = 'active'
) programmes on true
where i.country_code = 'NL'
  and i.status <> 'inactive'
  and i.slug is not null;
comment on view public.institution_detail_nl_v1 is 'Service-role Netherlands institution detail read model. Institution identity and DUO/RIO locations are publishable independently of the not-yet-populated NL programme catalogue.';
revoke all on public.institution_detail_nl_v1 from public, anon, authenticated;
grant select on public.institution_detail_nl_v1 to service_role;

do $$
declare
  identity_count integer;
  explorer_count integer;
  detail_count integer;
  detail_without_location integer;
  detail_programme_mismatch integer;
begin
  select count(*) into identity_count from public.institution_identity_nl_v1;
  if identity_count <> 13 then raise exception 'Expected 13 NL official institution identities, found %', identity_count; end if;
  select count(*) into explorer_count from public.institution_explorer_nl_v1;
  if explorer_count <> 13 then raise exception 'Expected 13 NL explorer rows, found %', explorer_count; end if;
  select count(*) into detail_count from public.institution_detail_nl_v1;
  if detail_count <> 13 then raise exception 'Expected 13 NL detail rows, found %', detail_count; end if;
  select count(*) into detail_without_location from public.institution_detail_nl_v1 where campus_count < 1 or jsonb_array_length(campus_locations) < 1;
  if detail_without_location > 0 then raise exception 'Found % NL institution detail rows without a publishable location', detail_without_location; end if;
  select count(*) into detail_programme_mismatch from public.institution_detail_nl_v1 d where d.program_count <> (select count(*) from catalog.programmes p where p.institution_id = d.institution_id and p.status = 'active');
  if detail_programme_mismatch > 0 then raise exception 'Found % NL detail rows with canonical programme count mismatch', detail_programme_mismatch; end if;
end $$;;
