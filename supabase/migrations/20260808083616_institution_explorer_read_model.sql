-- Institution explorer read model for the first public AU/CA MVP.
--
-- The canonical catalog remains the source of truth. This view only aggregates
-- active programme/campus counts and normalized city names for server-side UI
-- reads. Browser roles do not receive direct access.

create or replace view public.institution_explorer_v1
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
  coalesce(campuses.campus_count, 0)::integer as campus_count,
  coalesce(campuses.city_count, 0)::integer as city_count,
  coalesce(campuses.city_names, array[]::text[]) as city_names
from catalog.institutions i
left join lateral (
  select count(*)::integer as program_count
  from catalog.programmes p
  where p.institution_id = i.id
    and p.status = 'active'
) programmes on true
left join lateral (
  select
    count(*)::integer as campus_count,
    count(distinct g.id)::integer as city_count,
    coalesce(
      array_agg(distinct g.name order by g.name)
        filter (where g.id is not null),
      array[]::text[]
    ) as city_names
  from catalog.campuses c
  left join core.geographies g
    on g.id = coalesce(c.locality_geography_id, c.geography_id)
   and g.geography_type = 'city'
   and g.status = 'active'
  where c.institution_id = i.id
    and c.status <> 'inactive'
) campuses on true
where i.status <> 'inactive'
  and i.slug is not null;

comment on view public.institution_explorer_v1 is
  'Service-role institution explorer read model backed by canonical catalog institutions, programmes, campuses and normalized city geographies.';

revoke all on public.institution_explorer_v1 from public, anon, authenticated;
grant select on public.institution_explorer_v1 to service_role;;
