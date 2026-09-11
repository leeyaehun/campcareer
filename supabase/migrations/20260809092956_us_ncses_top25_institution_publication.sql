create temporary table tmp_us_ncses_top25(
  ncses_rank integer, unitid text, canonical_name text, website_url text,
  city_name text, state_code text, city_slug text
) on commit drop;

insert into tmp_us_ncses_top25 values
(1,'162928','Johns Hopkins University','https://www.jhu.edu/','Baltimore','MD','baltimore'),
(2,'170976','University of Michigan','https://umich.edu/','Ann Arbor','MI','ann-arbor'),
(3,'236948','University of Washington','https://www.washington.edu/','Seattle','WA','seattle'),
(4,'110680','UC San Diego','https://ucsd.edu/','La Jolla','CA','la-jolla'),
(5,'190150','Columbia University','https://www.columbia.edu/','New York','NY','new-york'),
(6,'110699','UC San Francisco','https://www.ucsf.edu/','San Francisco','CA','san-francisco'),
(7,'126614','University of Colorado Boulder','https://www.colorado.edu/','Boulder','CO','boulder'),
(8,'221999','Vanderbilt University','https://www.vanderbilt.edu/','Nashville','TN','nashville'),
(9,'215293','University of Pittsburgh','https://www.pitt.edu/','Pittsburgh','PA','pittsburgh'),
(10,'179867','Washington University in St. Louis','https://washu.edu/','St. Louis','MO','st-louis'),
(11,'215062','University of Pennsylvania','https://www.upenn.edu/','Philadelphia','PA','philadelphia'),
(12,'243744','Stanford University','https://www.stanford.edu/','Stanford','CA','stanford'),
(13,'198419','Duke University','https://www.duke.edu/','Durham','NC','durham'),
(14,'130794','Yale University','https://www.yale.edu/','New Haven','CT','new-haven'),
(15,'110662','UCLA','https://www.ucla.edu/','Los Angeles','CA','los-angeles'),
(16,'193900','New York University','https://www.nyu.edu/','New York','NY','new-york'),
(17,'190415','Cornell University','https://www.cornell.edu/','Ithaca','NY','ithaca'),
(18,'199120','University of North Carolina at Chapel Hill','https://www.unc.edu/','Chapel Hill','NC','chapel-hill'),
(19,'147767','Northwestern University','https://www.northwestern.edu/','Evanston','IL','evanston'),
(20,'174066','University of Minnesota Twin Cities','https://twin-cities.umn.edu/','Minneapolis','MN','minneapolis'),
(21,'228778','The University of Texas at Austin','https://www.utexas.edu/','Austin','TX','austin'),
(22,'214777','Penn State','https://www.psu.edu/','University Park','PA','university-park'),
(23,'139658','Emory University','https://www.emory.edu/','Atlanta','GA','atlanta'),
(24,'240444','University of Wisconsin–Madison','https://www.wisc.edu/','Madison','WI','madison'),
(25,'166027','Harvard University','https://www.harvard.edu/','Cambridge','MA','cambridge');

update catalog.institutions i
set canonical_name=s.canonical_name,
    institution_type='university',
    institution_kind='university',
    website_url=s.website_url,
    status='active',
    updated_at=now()
from tmp_us_ncses_top25 s
join catalog.institution_identifiers ii
  on ii.identifier_system='US_UNIT_ID' and ii.identifier_value=s.unitid
where i.id=ii.institution_id and i.country_code='US';

update catalog.institution_identifiers ii
set source_url='https://nces.ed.gov/ipeds/datacenter/InstitutionList.aspx'
from tmp_us_ncses_top25 s
where ii.identifier_system='US_UNIT_ID' and ii.identifier_value=s.unitid;

insert into catalog.campuses(
  id,institution_id,name,city,locality,region,country_code,
  official_url,source_url,source_checked_at,metadata,status
)
select
  md5('us:ncses-top25-location:'||s.unitid)::uuid,
  i.id,
  'IPEDS primary publication city',
  s.city_name,s.city_name,s.state_code,'US',
  s.website_url,'https://nces.ed.gov/ipeds/datacenter/InstitutionList.aspx',now(),
  jsonb_build_object(
    'record_scope','primary_publication_city',
    'location_quality','verified_ipeds_city',
    'display_policy','preferred',
    'source_tier','federal_statistical_system',
    'source_system','NCES_IPEDS',
    'unitid',s.unitid,
    'city_slug',s.city_slug,
    'state_code',s.state_code,
    'ncses_rank',s.ncses_rank,
    'selection_basis','NCSES_FY2024_FEDERAL_SE_SUPPORT_TOP25',
    'selection_source_url','https://www.ncses.nsf.gov/pubs/nsf26319',
    'coordinate_precision','not_asserted',
    'campus_inventory_complete',false,
    'programme_assignment_verified',false,
    'normalization_batch','us_ncses_top25_v1'
  ),
  'active'
from tmp_us_ncses_top25 s
join catalog.institution_identifiers ii
  on ii.identifier_system='US_UNIT_ID' and ii.identifier_value=s.unitid
join catalog.institutions i on i.id=ii.institution_id and i.country_code='US'
on conflict(id) do update set
  name=excluded.name,city=excluded.city,locality=excluded.locality,region=excluded.region,
  official_url=excluded.official_url,source_url=excluded.source_url,
  source_checked_at=excluded.source_checked_at,metadata=excluded.metadata,
  status=excluded.status,updated_at=now();

create or replace view public.institution_identity_us_tier_a_v1
with (security_invoker=true) as
with cohort(ncses_rank,unitid) as (values
  (1,'162928'),(2,'170976'),(3,'236948'),(4,'110680'),(5,'190150'),
  (6,'110699'),(7,'126614'),(8,'221999'),(9,'215293'),(10,'179867'),
  (11,'215062'),(12,'243744'),(13,'198419'),(14,'130794'),(15,'110662'),
  (16,'193900'),(17,'190415'),(18,'199120'),(19,'147767'),(20,'174066'),
  (21,'228778'),(22,'214777'),(23,'139658'),(24,'240444'),(25,'166027')
)
select i.id institution_id,i.country_code,i.slug,i.canonical_name,
  c.ncses_rank,ii.identifier_value unitid,ii.source_url unitid_source_url,
  'https://www.ncses.nsf.gov/pubs/nsf26319'::text selection_source_url
from cohort c
join catalog.institution_identifiers ii
  on ii.identifier_system='US_UNIT_ID' and ii.identifier_value=c.unitid
join catalog.institutions i on i.id=ii.institution_id
where i.country_code='US' and i.status<>'inactive' and i.slug is not null;

comment on view public.institution_identity_us_tier_a_v1 is
  'Service-role US launch cohort: NCES IPEDS UNITID identity for the FY2024 NCSES top 25 federal S&E support recipient universities. NCSES ranking is a publication selection basis, not an institution identifier.';
revoke all on public.institution_identity_us_tier_a_v1 from public,anon,authenticated;
grant select on public.institution_identity_us_tier_a_v1 to service_role;

create or replace view public.institution_location_us_tier_a_v1
with (security_invoker=true) as
select c.institution_id,c.id campus_id,c.name,
  coalesce(nullif(c.city,''),nullif(c.locality,'')) city_name,
  c.metadata->>'city_slug' city_slug,
  coalesce(nullif(c.city,''),nullif(c.locality,'')) reported_city,
  c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,
  c.metadata->>'location_quality' location_quality,
  c.metadata->>'record_scope' record_scope,
  c.metadata->>'unitid' unitid,
  (c.metadata->>'ncses_rank')::integer ncses_rank
from catalog.campuses c
join catalog.institutions i on i.id=c.institution_id and i.country_code='US'
where c.status<>'inactive'
  and c.metadata->>'normalization_batch'='us_ncses_top25_v1'
  and c.metadata->>'location_quality'='verified_ipeds_city';

comment on view public.institution_location_us_tier_a_v1 is
  'Service-role city/state publication locations for the US NCSES top-25 cohort, sourced from existing NCES/IPEDS-backed institution records; no complete campus inventory or coordinates asserted.';
revoke all on public.institution_location_us_tier_a_v1 from public,anon,authenticated;
grant select on public.institution_location_us_tier_a_v1 to service_role;

create or replace view public.institution_explorer_us_tier_a_v1
with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,
  i.institution_kind,i.ownership_type,i.website_url,
  identity.ncses_rank,identity.unitid,
  coalesce(p.program_count,0)::integer program_count,
  coalesce(l.location_count,0)::integer campus_count,
  coalesce(l.city_count,0)::integer city_count,
  coalesce(l.city_names,array[]::text[]) city_names
from public.institution_identity_us_tier_a_v1 identity
join catalog.institutions i on i.id=identity.institution_id
left join lateral (
  select count(*)::integer program_count from catalog.programmes p
  where p.institution_id=i.id and p.status='active'
) p on true
left join lateral (
  select count(*)::integer location_count,
    count(distinct x.city_name)::integer city_count,
    coalesce(array_agg(distinct x.city_name order by x.city_name)
      filter(where x.city_name is not null),array[]::text[]) city_names
  from public.institution_location_us_tier_a_v1 x where x.institution_id=i.id
) l on true;

revoke all on public.institution_explorer_us_tier_a_v1 from public,anon,authenticated;
grant select on public.institution_explorer_us_tier_a_v1 to service_role;

create or replace view public.institution_detail_us_tier_a_v1
with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,
  i.institution_kind,i.ownership_type,i.website_url,i.status,
  identity.ncses_rank,identity.unitid,identity.unitid_source_url,identity.selection_source_url,
  coalesce(p.program_count,0)::integer program_count,
  coalesce(l.location_count,0)::integer campus_count,
  coalesce(l.city_count,0)::integer city_count,
  coalesce(l.city_names,array[]::text[]) city_names,
  null::text cricos_provider_code,null::text cricos_source_url,
  coalesce(l.campus_locations,'[]'::jsonb) campus_locations,
  '[]'::jsonb study_areas,'[]'::jsonb programme_types,'[]'::jsonb programme_preview
from public.institution_identity_us_tier_a_v1 identity
join catalog.institutions i on i.id=identity.institution_id
left join lateral (
  select count(*)::integer program_count from catalog.programmes p
  where p.institution_id=i.id and p.status='active'
) p on true
left join lateral (
  select count(*)::integer location_count,
    count(distinct x.city_name)::integer city_count,
    coalesce(array_agg(distinct x.city_name order by x.city_name)
      filter(where x.city_name is not null),array[]::text[]) city_names,
    coalesce(jsonb_agg(jsonb_build_object(
      'id',x.campus_id,'name',x.name,'city',x.city_name,'citySlug',x.city_slug,
      'reportedCity',x.reported_city,'region',x.region,'address',x.address_line,
      'postalCode',x.postal_code,'officialUrl',x.official_url
    ) order by x.campus_id),'[]'::jsonb) campus_locations
  from public.institution_location_us_tier_a_v1 x where x.institution_id=i.id
) l on true;

revoke all on public.institution_detail_us_tier_a_v1 from public,anon,authenticated;
grant select on public.institution_detail_us_tier_a_v1 to service_role;

do $$ declare c int; begin
  select count(*) into c from public.institution_identity_us_tier_a_v1;
  if c<>25 then raise exception 'Expected 25 US Tier A identities, found %',c; end if;

  select count(*) into c from public.institution_identity_us_tier_a_v1
  where unitid !~ '^[0-9]{6}$' or unitid_source_url !~ '^https://'
    or selection_source_url !~ '^https://';
  if c>0 then raise exception 'Found % invalid US Tier A identities',c; end if;

  select count(*) into c from public.institution_explorer_us_tier_a_v1
  where institution_kind is distinct from 'university'
    or ownership_type is null or website_url !~ '^https://';
  if c>0 then raise exception 'Found % invalid US Tier A institution rows',c; end if;

  select count(*) into c from public.institution_detail_us_tier_a_v1
  where campus_count<1 or jsonb_array_length(campus_locations)<1
    or program_count<>0 or jsonb_array_length(programme_preview)<>0;
  if c>0 then raise exception 'US Tier A detail invariant failures %',c; end if;

  select count(*) into c
  from catalog.campuses cp
  join public.institution_identity_us_tier_a_v1 x on x.institution_id=cp.institution_id
  where cp.metadata->>'normalization_batch'='us_ncses_top25_v1'
    and (cp.latitude is not null or cp.longitude is not null);
  if c>0 then raise exception 'US Tier A publication locations must not infer coordinates %',c; end if;
end $$;;
