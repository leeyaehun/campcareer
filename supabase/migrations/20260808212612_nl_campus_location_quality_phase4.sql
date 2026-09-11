-- Netherlands institution location quality layer.
--
-- Preserve the 13 historical city/coordinate rows from ingest.colleges_nl as
-- legacy anchors. Publish one registry-backed institution location per current
-- research-university institution using the DUO/RIO higher-education address
-- dataset as provenance. These rows are intentionally city-level and do not
-- claim a precise campus footprint or programme-to-campus assignment.
--
-- DUO Open Onderwijsdata / RIO higher-education addresses:
-- https://onderwijsdata.duo.nl/datasets/adressen_ho/resources/bf1da9c6-c688-4873-91b1-b12c9ac2c132

update catalog.campuses c
set
  locality = coalesce(c.locality, c.city),
  locality_geography_id = coalesce(c.locality_geography_id, c.geography_id),
  metadata = coalesce(c.metadata, '{}'::jsonb) || jsonb_build_object(
    'record_scope', 'legacy_location_anchor',
    'location_quality', 'legacy_city_coordinates',
    'display_policy', 'fallback_only',
    'legacy_source_table', 'ingest.colleges_nl',
    'normalization_batch', 'nl_institution_locations_v1'
  ),
  updated_at = now()
from catalog.institutions i
where c.institution_id = i.id
  and i.country_code = 'NL'
  and c.status <> 'inactive'
  and lower(c.name) like '%listed campus%';

with resolved as (
  select
    legacy.identifier_value as legacy_provider_id,
    official.identifier_value as brin_code,
    i.id as institution_id,
    i.website_url,
    c.city,
    c.region,
    c.geography_id,
    coalesce(c.locality_geography_id, c.geography_id) as locality_geography_id
  from catalog.institutions i
  join catalog.institution_identifiers legacy
    on legacy.institution_id = i.id
   and legacy.identifier_system = 'NL_PROVIDER_ID'
  join catalog.institution_identifiers official
    on official.institution_id = i.id
   and official.identifier_system = 'NL_BRIN'
  join catalog.campuses c
    on c.institution_id = i.id
   and c.status <> 'inactive'
   and c.metadata ->> 'record_scope' = 'legacy_location_anchor'
  where i.country_code = 'NL'
    and i.status <> 'inactive'
)
insert into catalog.campuses(
  id,
  institution_id,
  name,
  city,
  locality,
  region,
  country_code,
  geography_id,
  locality_geography_id,
  official_url,
  source_url,
  source_checked_at,
  metadata,
  status
)
select
  md5('nl_registered_location:' || r.legacy_provider_id)::uuid,
  r.institution_id,
  'Registered institution location',
  r.city,
  r.city,
  r.region,
  'NL',
  r.geography_id,
  r.locality_geography_id,
  r.website_url,
  'https://onderwijsdata.duo.nl/datasets/adressen_ho/resources/bf1da9c6-c688-4873-91b1-b12c9ac2c132',
  now(),
  jsonb_build_object(
    'record_scope', 'registered_institution_location',
    'location_quality', 'verified_registry_city',
    'display_policy', 'preferred',
    'source_tier', 'government_registry',
    'registry_system', 'DUO_RIO',
    'brin_code', r.brin_code,
    'legacy_provider_id', r.legacy_provider_id,
    'location_key', 'rio-registered-city',
    'coordinate_precision', 'not_asserted',
    'programme_assignment_verified', false,
    'normalization_batch', 'nl_institution_locations_v1'
  ),
  'active'
from resolved r
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  locality = excluded.locality,
  region = excluded.region,
  geography_id = excluded.geography_id,
  locality_geography_id = excluded.locality_geography_id,
  official_url = excluded.official_url,
  source_url = excluded.source_url,
  source_checked_at = excluded.source_checked_at,
  metadata = excluded.metadata,
  status = excluded.status,
  updated_at = now();

create or replace view public.institution_location_nl_v1
with (security_invoker = true) as
select
  c.institution_id,
  c.id as campus_id,
  c.name,
  coalesce(nullif(g.name, ''), nullif(c.city, ''), nullif(c.locality, '')) as city_name,
  g.slug as city_slug,
  coalesce(nullif(c.city, ''), nullif(c.locality, '')) as reported_city,
  c.region,
  c.address_line,
  c.postal_code,
  c.official_url,
  c.source_url,
  c.source_checked_at,
  c.metadata ->> 'location_quality' as location_quality,
  c.metadata ->> 'record_scope' as record_scope,
  c.metadata ->> 'brin_code' as brin_code
from catalog.campuses c
join catalog.institutions i
  on i.id = c.institution_id
 and i.country_code = 'NL'
left join core.geographies g
  on g.id = coalesce(c.locality_geography_id, c.geography_id)
 and g.status = 'active'
where c.status <> 'inactive'
  and (
    c.metadata ->> 'location_quality' = 'verified_registry_city'
    or (
      c.metadata ->> 'record_scope' = 'legacy_location_anchor'
      and not exists (
        select 1
        from catalog.campuses verified
        where verified.institution_id = c.institution_id
          and verified.status <> 'inactive'
          and verified.metadata ->> 'location_quality' = 'verified_registry_city'
      )
    )
  );

comment on view public.institution_location_nl_v1 is
  'Service-role Netherlands institution location policy: prefer DUO/RIO registry-backed city-level locations and fall back to legacy imported city anchors without inventing campus precision.';

revoke all on public.institution_location_nl_v1 from public, anon, authenticated;
grant select on public.institution_location_nl_v1 to service_role;

do $$
declare
  legacy_anchor_count integer;
  verified_location_count integer;
  verified_institution_count integer;
  verified_without_source integer;
  verified_with_coordinates integer;
  duplicate_verified_location_count integer;
  display_institution_count integer;
begin
  select count(*)
  into legacy_anchor_count
  from catalog.campuses c
  join catalog.institutions i on i.id = c.institution_id
  where i.country_code = 'NL'
    and c.status <> 'inactive'
    and c.metadata ->> 'record_scope' = 'legacy_location_anchor';

  if legacy_anchor_count <> 13 then
    raise exception 'Expected 13 NL legacy location anchors, found %', legacy_anchor_count;
  end if;

  select count(*), count(distinct institution_id)
  into verified_location_count, verified_institution_count
  from catalog.campuses
  where country_code = 'NL'
    and status <> 'inactive'
    and metadata ->> 'location_quality' = 'verified_registry_city';

  if verified_location_count <> 13 or verified_institution_count <> 13 then
    raise exception
      'Expected 13 registry-backed NL locations across 13 institutions, found % across %',
      verified_location_count,
      verified_institution_count;
  end if;

  select count(*)
  into verified_without_source
  from catalog.campuses
  where country_code = 'NL'
    and status <> 'inactive'
    and metadata ->> 'location_quality' = 'verified_registry_city'
    and (
      source_url is null
      or source_url !~ '^https://onderwijsdata[.]duo[.]nl/'
      or metadata ->> 'source_tier' is distinct from 'government_registry'
      or metadata ->> 'registry_system' is distinct from 'DUO_RIO'
      or metadata ->> 'brin_code' !~ '^[0-9]{2}[A-Z]{2}$'
    );

  if verified_without_source > 0 then
    raise exception 'Found % NL registry locations without valid DUO/RIO provenance', verified_without_source;
  end if;

  select count(*)
  into verified_with_coordinates
  from catalog.campuses
  where country_code = 'NL'
    and status <> 'inactive'
    and metadata ->> 'location_quality' = 'verified_registry_city'
    and (latitude is not null or longitude is not null);

  if verified_with_coordinates > 0 then
    raise exception 'NL registry city locations must not assert unverified precise coordinates; found % rows', verified_with_coordinates;
  end if;

  select count(*)
  into duplicate_verified_location_count
  from (
    select institution_id, metadata ->> 'location_key'
    from catalog.campuses
    where country_code = 'NL'
      and status <> 'inactive'
      and metadata ->> 'location_quality' = 'verified_registry_city'
    group by institution_id, metadata ->> 'location_key'
    having count(*) > 1
  ) duplicates;

  if duplicate_verified_location_count > 0 then
    raise exception 'NL registry locations contain % duplicate location keys', duplicate_verified_location_count;
  end if;

  select count(distinct institution_id)
  into display_institution_count
  from public.institution_location_nl_v1;

  if display_institution_count <> 13 then
    raise exception 'NL location policy must expose a display location for 13 institutions; found %', display_institution_count;
  end if;
end $$;;
