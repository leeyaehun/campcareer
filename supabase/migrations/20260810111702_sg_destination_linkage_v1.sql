-- Singapore country-level destination institution/campus linkage v1.
-- Refreshes the six official primary locations and publishes one service-role
-- destination-oriented directory. No neighbourhood/planning area is promoted
-- to a canonical study-destination city.

with source_rows(uen, source_url) as (
  values
    ('200604346E', 'https://www.nus.edu.sg/contact'),
    ('200604393R', 'https://www.ntu.edu.sg/about-us/contact-us'),
    ('200000267Z', 'https://www.smu.edu.sg/about/contact'),
    ('200913519C', 'https://www.sutd.edu.sg/contact-us/contact-sutd/'),
    ('200917667D', 'https://www.singaporetech.edu.sg/campus-locations'),
    ('200504979Z', 'https://www.suss.edu.sg/contact-us')
), resolved as (
  select c.id as campus_id, s.source_url
  from source_rows s
  join public.institution_identity_sg_v1 identity on identity.uen = s.uen
  join catalog.campuses c on c.institution_id = identity.institution_id
  where c.status <> 'inactive'
    and c.metadata ->> 'location_quality' = 'verified_official'
)
update catalog.campuses c
set source_url = r.source_url,
    official_url = r.source_url,
    source_checked_at = now(),
    updated_at = now()
from resolved r
where c.id = r.campus_id;

create or replace view public.study_destination_institution_sg_v1
with (security_invoker = true) as
select
  d.country_code,
  d.destination_name,
  identity.institution_id,
  identity.slug as institution_slug,
  identity.canonical_name as institution_name,
  identity.uen,
  identity.uen_source_url,
  i.website_url,
  location.campus_id,
  location.name as campus_name,
  location.city_name,
  location.reported_city,
  location.address_line,
  location.postal_code,
  location.official_url as location_official_url,
  location.source_url as location_source_url,
  location.source_checked_at as location_source_checked_at,
  location.location_quality,
  location.record_scope,
  false::boolean as programme_delivery_verified
from public.study_destination_sg_v1 d
join public.institution_identity_sg_v1 identity
  on identity.country_code = d.country_code
join catalog.institutions i
  on i.id = identity.institution_id
join public.institution_location_sg_v1 location
  on location.institution_id = identity.institution_id
where d.country_code = 'SG'
  and i.status <> 'inactive';

comment on view public.study_destination_institution_sg_v1 is
  'Service-role Singapore destination institution/location linkage. Institution/campus presence never implies programme delivery.';

revoke all on public.study_destination_institution_sg_v1 from public, anon, authenticated;
grant select on public.study_destination_institution_sg_v1 to service_role;

do $$
declare
  row_count integer;
  institution_count integer;
  bad_location_count integer;
  inferred_delivery_count integer;
begin
  select count(*), count(distinct institution_id)
  into row_count, institution_count
  from public.study_destination_institution_sg_v1;

  if row_count <> 6 or institution_count <> 6 then
    raise exception 'Expected 6 SG destination location rows across 6 institutions, found %/%', row_count, institution_count;
  end if;

  select count(*) into bad_location_count
  from public.study_destination_institution_sg_v1
  where address_line is null
     or postal_code !~ '^[0-9]{6}$'
     or location_source_url !~ '^https://'
     or location_quality is distinct from 'verified_official';

  if bad_location_count > 0 then
    raise exception 'Found % SG destination institution rows without verified official location evidence', bad_location_count;
  end if;

  select count(*) into inferred_delivery_count
  from public.study_destination_institution_sg_v1
  where programme_delivery_verified = true;

  if inferred_delivery_count > 0 then
    raise exception 'SG programme delivery must not be inferred from location linkage';
  end if;
end $$;;
