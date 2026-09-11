-- Programs <-> Institutions bidirectional read links.
--
-- Extend the service-role institution detail payload with a bounded program
-- preview. Australian rows reuse the canonical legacy-program bridge so links
-- resolve to the existing /programs/au/{legacy-id}-{slug} route without fuzzy
-- matching. Canada keeps canonical program previews but no public program URL
-- is invented before a Canadian program-detail surface exists.

create or replace view public.institution_detail_v1
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
  coalesce(campuses.campus_count, 0)::integer as campus_count,
  coalesce(campuses.city_count, 0)::integer as city_count,
  coalesce(campuses.city_names, array[]::text[]) as city_names,
  identifiers.cricos_provider_code,
  identifiers.cricos_source_url,
  coalesce(campuses.campus_locations, '[]'::jsonb) as campus_locations,
  coalesce(programmes.study_areas, '[]'::jsonb) as study_areas,
  coalesce(programmes.programme_types, '[]'::jsonb) as programme_types,
  coalesce(programmes.programme_preview, '[]'::jsonb) as programme_preview
from catalog.institutions i
left join lateral (
  select
    count(*)::integer as campus_count,
    count(distinct g.id)::integer as city_count,
    coalesce(
      array_agg(distinct g.name order by g.name)
        filter (where g.id is not null),
      array[]::text[]
    ) as city_names,
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', locations.id,
            'name', locations.name,
            'city', locations.city_name,
            'citySlug', locations.city_slug,
            'reportedCity', locations.reported_city,
            'region', locations.region,
            'address', locations.address_line,
            'postalCode', locations.postal_code,
            'officialUrl', locations.official_url
          )
          order by
            coalesce(locations.city_name, locations.reported_city, ''),
            coalesce(locations.name, ''),
            locations.id
        ),
        '[]'::jsonb
      )
      from (
        select
          c2.id,
          c2.name,
          g2.name as city_name,
          g2.slug as city_slug,
          coalesce(nullif(btrim(c2.city), ''), nullif(btrim(c2.locality), '')) as reported_city,
          c2.region,
          c2.address_line,
          c2.postal_code,
          c2.official_url
        from catalog.campuses c2
        left join core.geographies g2
          on g2.id = coalesce(c2.locality_geography_id, c2.geography_id)
         and g2.geography_type = 'city'
         and g2.status = 'active'
        where c2.institution_id = i.id
          and c2.status <> 'inactive'
        order by
          coalesce(g2.name, c2.city, c2.locality, ''),
          coalesce(c2.name, ''),
          c2.id
        limit 24
      ) locations
    ) as campus_locations
  from catalog.campuses c
  left join core.geographies g
    on g.id = coalesce(c.locality_geography_id, c.geography_id)
   and g.geography_type = 'city'
   and g.status = 'active'
  where c.institution_id = i.id
    and c.status <> 'inactive'
) campuses on true
left join lateral (
  select
    count(*)::integer as program_count,
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'name', areas.field_name,
            'count', areas.program_count
          )
          order by areas.program_count desc, areas.field_name
        ),
        '[]'::jsonb
      )
      from (
        select
          p2.field_name,
          count(*)::integer as program_count
        from catalog.programmes p2
        where p2.institution_id = i.id
          and p2.status = 'active'
          and nullif(btrim(p2.field_name), '') is not null
        group by p2.field_name
        order by program_count desc, p2.field_name
        limit 8
      ) areas
    ) as study_areas,
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'name', types.programme_type,
            'count', types.program_count
          )
          order by types.program_count desc, types.programme_type
        ),
        '[]'::jsonb
      )
      from (
        select
          p3.programme_type,
          count(*)::integer as program_count
        from catalog.programmes p3
        where p3.institution_id = i.id
          and p3.status = 'active'
          and nullif(btrim(p3.programme_type), '') is not null
        group by p3.programme_type
        order by program_count desc, p3.programme_type
        limit 8
      ) types
    ) as programme_types,
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', preview.id,
            'legacyProgramId', preview.legacy_program_id,
            'title', preview.canonical_title,
            'programmeType', preview.programme_type,
            'fieldName', preview.field_name
          )
          order by preview.has_public_route desc, preview.canonical_title, preview.id
        ),
        '[]'::jsonb
      )
      from (
        select
          p4.id,
          p4.canonical_title,
          p4.programme_type,
          p4.field_name,
          active_course.id as legacy_program_id,
          (active_course.id is not null) as has_public_route
        from catalog.programmes p4
        left join public.au_program_identity_v1 api
          on api.programme_id = p4.id
         and api.institution_id = i.id
        left join ingest.courses_au active_course
          on active_course.id = api.legacy_program_id
         and active_course.cricos_status = 'active'
        where p4.institution_id = i.id
          and p4.status = 'active'
          and nullif(btrim(p4.canonical_title), '') is not null
        order by
          (active_course.id is not null) desc,
          p4.canonical_title,
          p4.id
        limit 12
      ) preview
    ) as programme_preview
  from catalog.programmes p
  where p.institution_id = i.id
    and p.status = 'active'
) programmes on true
left join lateral (
  select
    max(ii.identifier_value)
      filter (where ii.identifier_system = 'AU_CRICOS_PROVIDER_CODE') as cricos_provider_code,
    max(ii.source_url)
      filter (where ii.identifier_system = 'AU_CRICOS_PROVIDER_CODE') as cricos_source_url
  from catalog.institution_identifiers ii
  where ii.institution_id = i.id
) identifiers on true
where i.status <> 'inactive'
  and i.slug is not null
  and i.country_code in ('AU', 'CA');

comment on view public.institution_detail_v1 is
  'Service-role institution detail read model with canonical campus/program summaries and active AU public program route identities.';

revoke all on public.institution_detail_v1 from public, anon, authenticated;
grant select on public.institution_detail_v1 to service_role;

-- Fail closed if any currently public Australian Program route loses its
-- canonical institution or programme identity before this integration lands.
do $$
declare
  unresolved_active_program_count integer;
begin
  select count(*)
  into unresolved_active_program_count
  from ingest.courses_au c
  left join public.au_program_identity_v1 api
    on api.legacy_program_id = c.id
  where c.cricos_status = 'active'
    and api.programme_id is null;

  if unresolved_active_program_count > 0 then
    raise exception
      'AU Programs -> Institutions integration has % unresolved active program routes',
      unresolved_active_program_count;
  end if;
end $$;
