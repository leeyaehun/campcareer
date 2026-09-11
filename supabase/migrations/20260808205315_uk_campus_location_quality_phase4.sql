update core.geographies
set
  slug = lower(trim(both '-' from regexp_replace(name, '[^A-Za-z0-9]+', '-', 'g'))),
  updated_at = now()
where country_code = 'UK'
  and slug is null
  and name ~ '[A-Za-z0-9]';

with settlements(name, region_code, geography_type) as (
  values
    ('Uxbridge', 'London', 'city'),
    ('Egham', 'South East', 'city'),
    ('Hatfield', 'East', 'city'),
    ('Salford', 'North West', 'city'),
    ('Derry~Londonderry', 'Northern Ireland', 'city'),
    ('Penryn', 'South West', 'city'),
    ('Truro', 'South West', 'city'),
    ('Medway', 'South East', 'other'),
    ('Southwell', 'East Midlands', 'city'),
    ('Mansfield', 'East Midlands', 'city'),
    ('Winchester', 'South East', 'city'),
    ('Henley-on-Thames', 'South East', 'city'),
    ('Ascot', 'South East', 'city'),
    ('Sutton Bonington', 'East Midlands', 'locality'),
    ('Galashiels', 'Scotland', 'city'),
    ('Stromness', 'Scotland', 'city')
)
insert into core.geographies(country_code, geography_type, name, region_code, slug, metadata, status)
select
  'UK', s.geography_type, s.name, s.region_code,
  lower(trim(both '-' from regexp_replace(s.name, '[^A-Za-z0-9]+', '-', 'g'))),
  jsonb_build_object('source_kind','institution_official_campus_location','normalization_batch','uk_institution_locations_v1'),
  'active'
from settlements s
where not exists (
  select 1 from core.geographies g
  where g.country_code='UK'
    and g.geography_type=s.geography_type
    and lower(g.name)=lower(s.name)
    and coalesce(g.region_code,'')=coalesce(s.region_code,'')
);

update catalog.campuses c
set
  locality = coalesce(c.locality, c.city),
  locality_geography_id = coalesce(c.locality_geography_id, c.geography_id),
  metadata = coalesce(c.metadata, '{}'::jsonb) || jsonb_build_object(
    'record_scope','legacy_offering_anchor',
    'location_quality','legacy_city',
    'display_policy','fallback_only',
    'legacy_source_table', case when lower(c.name)='main listed campus' then 'ingest.courses_uk' else 'public.colleges_uk' end,
    'normalization_batch','uk_institution_locations_v1'
  ),
  updated_at=now()
from catalog.institutions i
where c.institution_id=i.id
  and i.country_code='UK'
  and c.status <> 'inactive'
  and lower(c.name) like '%listed campus%';

with locations(legacy_provider_id, location_key, campus_name, city, region, address_line, postal_code, official_url) as (
  values
    ('brunel-university-london','uxbridge','Uxbridge Campus','Uxbridge','London','Kingston Lane, Uxbridge','UB8 3PH','https://www.brunel.ac.uk/about/finding-us'),
    ('royal-holloway-university-of-london','egham','Egham Campus','Egham','South East',null,null,'https://www.royalholloway.ac.uk/student-life/our-campus/'),
    ('royal-holloway-university-of-london','central-london','Central London Campus','London','London',null,null,'https://www.royalholloway.ac.uk/student-life/our-campus/'),
    ('university-of-hertfordshire','college-lane','College Lane Campus','Hatfield','East','College Lane, Hatfield, Hertfordshire','AL10 9AB','https://www.herts.ac.uk/visit-us'),
    ('university-of-hertfordshire','de-havilland','de Havilland Campus','Hatfield','East',null,'AL10 9EU','https://www.herts.ac.uk/visit-us'),
    ('city-university-of-london','clerkenwell','Clerkenwell Campus','London','London','Northampton Square, London','EC1V 0HB','https://www.citystgeorges.ac.uk/about/find-contact/find'),
    ('city-university-of-london','moorgate','Moorgate Campus','London','London',null,null,'https://www.citystgeorges.ac.uk/about/find-contact/find'),
    ('city-university-of-london','tooting','Tooting Campus','London','London','Cranmer Terrace, London','SW17 0RE','https://www.citystgeorges.ac.uk/about/find-contact/find'),
    ('university-of-salford','peel-park','Peel Park Campus','Salford','North West',null,null,'https://www.salford.ac.uk/campus'),
    ('university-of-salford','frederick-road','Frederick Road Campus','Salford','North West',null,null,'https://www.salford.ac.uk/campus'),
    ('university-of-salford','mediacity','MediaCity Campus','Salford','North West',null,null,'https://www.salford.ac.uk/campus'),
    ('ulster-university','belfast','Belfast Campus','Belfast','Northern Ireland',null,null,'https://www.ulster.ac.uk/campuses'),
    ('ulster-university','coleraine','Coleraine Campus','Coleraine','Northern Ireland',null,null,'https://www.ulster.ac.uk/campuses'),
    ('ulster-university','derry-londonderry','Derry~Londonderry Campus','Derry~Londonderry','Northern Ireland',null,null,'https://www.ulster.ac.uk/campuses'),
    ('university-of-exeter','streatham','Streatham Campus','Exeter','South West',null,null,'https://www.exeter.ac.uk/our-campuses/'),
    ('university-of-exeter','st-lukes','St Luke''s Campus','Exeter','South West',null,null,'https://www.exeter.ac.uk/our-campuses/'),
    ('university-of-exeter','penryn','Penryn Campus','Penryn','South West','Penryn, Cornwall','TR10 9FE','https://www.exeter.ac.uk/our-campuses/penryn-campus/'),
    ('university-of-exeter','truro','Truro Campus','Truro','South West',null,null,'https://www.exeter.ac.uk/our-campuses/'),
    ('university-of-kent','canterbury','Canterbury Campus','Canterbury','South East','University of Kent, Canterbury, Kent','CT2 7NZ','https://www.kent.ac.uk/locations'),
    ('university-of-kent','medway','Medway Campus','Medway','South East',null,null,'https://www.kent.ac.uk/locations'),
    ('nottingham-trent-university','city','City Campus','Nottingham','East Midlands','50 Shakespeare Street, Nottingham','NG1 4FQ','https://www.ntu.ac.uk/about-us/campuses'),
    ('nottingham-trent-university','clifton','Clifton Campus','Nottingham','East Midlands',null,null,'https://www.ntu.ac.uk/about-us/campuses'),
    ('nottingham-trent-university','brackenhurst','Brackenhurst Campus','Southwell','East Midlands',null,null,'https://www.ntu.ac.uk/about-us/campuses'),
    ('nottingham-trent-university','london','NTU London','London','London',null,null,'https://www.ntu.ac.uk/about-us/campuses'),
    ('nottingham-trent-university','mansfield','Mansfield Hub','Mansfield','East Midlands',null,null,'https://www.ntu.ac.uk/about-us/campuses'),
    ('university-of-southampton','highfield','Highfield Campus','Southampton','South East','University Road, Southampton','SO17 1BJ','https://www.southampton.ac.uk/student-life/campuses'),
    ('university-of-southampton','hospital','University Hospital Southampton','Southampton','South East',null,null,'https://www.southampton.ac.uk/student-life/campuses'),
    ('university-of-southampton','waterfront','Waterfront Campus','Southampton','South East',null,null,'https://www.southampton.ac.uk/student-life/campuses'),
    ('university-of-southampton','winchester','Winchester Campus','Winchester','South East',null,null,'https://www.southampton.ac.uk/student-life/campuses'),
    ('university-of-southampton','avenue','Avenue Campus','Southampton','South East',null,null,'https://www.southampton.ac.uk/student-life/campuses'),
    ('university-of-southampton','boldrewood','Boldrewood Innovation Campus','Southampton','South East',null,null,'https://www.southampton.ac.uk/student-life/campuses'),
    ('university-of-southampton','city-centre','City Centre Campus','Southampton','South East','Guildhall Square, Above Bar Street, Southampton','SO14 7DU','https://www.southampton.ac.uk/student-life/campuses/city-centre-campus'),
    ('university-of-reading','whiteknights','Whiteknights Campus','Reading','South East',null,null,'https://www.reading.ac.uk/essentials/Campus-and-Local-Area'),
    ('university-of-reading','london-road','London Road Campus','Reading','South East',null,null,'https://www.reading.ac.uk/essentials/Campus-and-Local-Area'),
    ('university-of-reading','greenlands','Greenlands Campus','Henley-on-Thames','South East',null,null,'https://www.reading.ac.uk/essentials/Campus-and-Local-Area'),
    ('king-s-college-london','denmark-hill','Denmark Hill Campus','London','London',null,null,'https://www.kcl.ac.uk/visit'),
    ('king-s-college-london','guys','Guy''s Campus','London','London',null,null,'https://www.kcl.ac.uk/visit'),
    ('king-s-college-london','st-thomas','St Thomas'' Campus','London','London',null,null,'https://www.kcl.ac.uk/visit'),
    ('king-s-college-london','strand','Strand Campus','London','London','Strand, London','WC2R 2LS','https://www.kcl.ac.uk/visit'),
    ('king-s-college-london','waterloo','Waterloo Campus','London','London',null,null,'https://www.kcl.ac.uk/visit'),
    ('imperial-college-london','south-kensington','South Kensington Campus','London','London','Exhibition Road, London','SW7 2AZ','https://www.imperial.ac.uk/visit/campuses/south-kensington/'),
    ('imperial-college-london','white-city','White City Campus','London','London','80–92 Wood Lane, London','W12 0BZ','https://www.imperial.ac.uk/white-city-campus/find-us/'),
    ('imperial-college-london','silwood-park','Silwood Park Campus','Ascot','South East',null,null,'https://www.imperial.ac.uk/visit/campuses/'),
    ('imperial-college-london','old-oak','Old Oak Innovation Cluster','London','London',null,null,'https://www.imperial.ac.uk/visit/campuses/'),
    ('imperial-college-london','hammersmith-hospital','Hammersmith Hospital Campus','London','London',null,null,'https://www.imperial.ac.uk/visit/campuses/'),
    ('imperial-college-london','st-marys-hospital','St Mary''s Hospital Campus','London','London',null,null,'https://www.imperial.ac.uk/visit/campuses/'),
    ('imperial-college-london','charing-cross','Charing Cross Hospital Campus','London','London',null,null,'https://www.imperial.ac.uk/visit/campuses/'),
    ('imperial-college-london','royal-brompton','Royal Brompton Hospital Campus','London','London',null,null,'https://www.imperial.ac.uk/visit/campuses/'),
    ('imperial-college-london','chelsea-westminster','Chelsea and Westminster Hospital Campus','London','London',null,null,'https://www.imperial.ac.uk/visit/campuses/'),
    ('university-of-nottingham','university-park','University Park Campus','Nottingham','East Midlands','University Park, Nottingham','NG7 2RD','https://www.nottingham.ac.uk/about/campuses/campuses.aspx'),
    ('university-of-nottingham','jubilee','Jubilee Campus','Nottingham','East Midlands','Wollaton Road, Nottingham','NG8 1BB','https://www.nottingham.ac.uk/about/campuses/campuses.aspx'),
    ('university-of-nottingham','kings-meadow','King''s Meadow Campus','Nottingham','East Midlands','Lenton Lane, Nottingham','NG7 2NR','https://www.nottingham.ac.uk/about/campuses/campuses.aspx'),
    ('university-of-nottingham','castle-meadow','Castle Meadow Campus','Nottingham','East Midlands',null,null,'https://www.nottingham.ac.uk/about/campuses/campuses.aspx'),
    ('university-of-nottingham','medical-school','Medical School','Nottingham','East Midlands','Queen''s Medical Centre, Nottingham','NG7 2UH','https://www.nottingham.ac.uk/about/campuses/campuses.aspx'),
    ('university-of-nottingham','sutton-bonington','Sutton Bonington Campus','Sutton Bonington','East Midlands','Sutton Bonington, Leicestershire','LE12 5RD','https://www.nottingham.ac.uk/about/campuses/campuses.aspx'),
    ('swansea-university','singleton-park','Singleton Park Campus','Swansea','Wales',null,null,'https://www.swansea.ac.uk/the-university/location/'),
    ('swansea-university','bay','Bay Campus','Swansea','Wales',null,null,'https://www.swansea.ac.uk/the-university/location/'),
    ('heriot-watt-university','edinburgh','Edinburgh Campus','Edinburgh','Scotland',null,'EH14 4AS','https://www.hw.ac.uk/campuses'),
    ('heriot-watt-university','scottish-borders','Scottish Borders Campus','Galashiels','Scotland',null,'TD1 3HF','https://www.hw.ac.uk/campuses'),
    ('heriot-watt-university','orkney','Orkney Campus','Stromness','Scotland','Franklin Road, Stromness','KW16 3AN','https://www.hw.ac.uk/campuses'),
    ('university-college-london','bloomsbury','Bloomsbury Campus','London','London','Gower Street, London','WC1E 6BT','https://www.ucl.ac.uk/about/campuses-and-facilities/ucl-campuses'),
    ('university-college-london','ucl-east','UCL East','London','London','Queen Elizabeth Olympic Park, Stratford, London',null,'https://www.ucl.ac.uk/about/campuses-and-facilities/ucl-campuses'),
    ('queen-mary-university-of-london','mile-end','Mile End Campus','London','London',null,null,'https://www.qmul.ac.uk/study/explore-our-campuses/'),
    ('queen-mary-university-of-london','whitechapel','Whitechapel Campus','London','London',null,null,'https://www.qmul.ac.uk/study/explore-our-campuses/'),
    ('queen-mary-university-of-london','charterhouse-square','Charterhouse Square Campus','London','London',null,null,'https://www.qmul.ac.uk/study/explore-our-campuses/'),
    ('queen-mary-university-of-london','west-smithfield','West Smithfield Campus','London','London',null,null,'https://www.qmul.ac.uk/study/explore-our-campuses/'),
    ('queen-mary-university-of-london','lincolns-inn-fields','Lincoln''s Inn Fields Campus','London','London',null,null,'https://www.qmul.ac.uk/study/explore-our-campuses/'),
    ('cardiff-university','cathays-park','Cathays Park Campus','Cardiff','Wales',null,null,'https://www.cardiff.ac.uk/study/student-life/campuses'),
    ('cardiff-university','heath-park','Heath Park Campus','Cardiff','Wales',null,null,'https://www.cardiff.ac.uk/study/student-life/campuses')
), resolved as (
  select l.*, ii.institution_id, g.id as geography_id
  from locations l
  join catalog.institution_identifiers ii
    on ii.identifier_system='UK_PROVIDER_ID' and ii.identifier_value=l.legacy_provider_id
  join catalog.institutions i on i.id=ii.institution_id and i.country_code='UK'
  left join lateral (
    select g1.id
    from core.geographies g1
    where g1.country_code='UK' and lower(g1.name)=lower(l.city)
    order by case g1.geography_type when 'city' then 0 when 'locality' then 1 when 'other' then 2 else 3 end, g1.id
    limit 1
  ) g on true
)
insert into catalog.campuses(
  id,institution_id,name,city,locality,region,country_code,geography_id,locality_geography_id,
  address_line,postal_code,official_url,source_url,source_checked_at,metadata,status
)
select
  md5('uk_verified_location:' || r.legacy_provider_id || ':' || r.location_key)::uuid,
  r.institution_id,r.campus_name,r.city,r.city,r.region,'UK',r.geography_id,r.geography_id,
  r.address_line,r.postal_code,r.official_url,r.official_url,now(),
  jsonb_build_object(
    'record_scope','verified_campus_location','location_quality','verified_official','source_tier','institution_official',
    'location_key',r.location_key,'legacy_provider_id',r.legacy_provider_id,'normalization_batch','uk_institution_locations_v1',
    'programme_assignment_verified',false
  ),'active'
from resolved r
on conflict (id) do update set
  name=excluded.name,city=excluded.city,locality=excluded.locality,region=excluded.region,
  geography_id=excluded.geography_id,locality_geography_id=excluded.locality_geography_id,
  address_line=excluded.address_line,postal_code=excluded.postal_code,official_url=excluded.official_url,
  source_url=excluded.source_url,source_checked_at=excluded.source_checked_at,metadata=excluded.metadata,
  status=excluded.status,updated_at=now();

create or replace view public.institution_location_uk_v1
with (security_invoker = true) as
select
  c.institution_id,c.id as campus_id,c.name,
  coalesce(nullif(g.name,''),nullif(c.city,''),nullif(c.locality,'')) as city_name,
  g.slug as city_slug,
  coalesce(nullif(c.city,''),nullif(c.locality,'')) as reported_city,
  c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,
  c.metadata ->> 'location_quality' as location_quality,
  c.metadata ->> 'record_scope' as record_scope
from catalog.campuses c
join catalog.institutions i on i.id=c.institution_id and i.country_code='UK'
left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.status='active'
where c.status <> 'inactive'
  and (
    c.metadata ->> 'location_quality'='verified_official'
    or (
      c.metadata ->> 'record_scope'='legacy_offering_anchor'
      and not exists (
        select 1 from catalog.campuses verified
        where verified.institution_id=c.institution_id
          and verified.status <> 'inactive'
          and verified.metadata ->> 'location_quality'='verified_official'
      )
    )
  );

comment on view public.institution_location_uk_v1 is
  'Service-role UK location policy: prefer institution-official campus/location records and fall back to legacy city-level offering anchors only when no verified official inventory exists.';
revoke all on public.institution_location_uk_v1 from public, anon, authenticated;
grant select on public.institution_location_uk_v1 to service_role;

create or replace view public.institution_explorer_uk_v1
with (security_invoker = true) as
select
  i.id as institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,
  coalesce(programmes.program_count,0)::integer as program_count,
  coalesce(locations.location_count,0)::integer as campus_count,
  coalesce(locations.place_count,0)::integer as city_count,
  coalesce(locations.place_names,array[]::text[]) as city_names
from catalog.institutions i
left join lateral (
  select count(*)::integer as program_count from catalog.programmes p
  where p.institution_id=i.id and p.status='active'
) programmes on true
left join lateral (
  select count(*)::integer as location_count,
    (count(distinct l.city_name) filter (where nullif(btrim(l.city_name),'') is not null))::integer as place_count,
    coalesce(array_agg(distinct l.city_name order by l.city_name) filter (where nullif(btrim(l.city_name),'') is not null),array[]::text[]) as place_names
  from public.institution_location_uk_v1 l where l.institution_id=i.id
) locations on true
where i.status <> 'inactive' and i.slug is not null and i.country_code='UK';

comment on view public.institution_explorer_uk_v1 is
  'Service-role UK Institution explorer with verified location counts and legacy city fallback while preserving canonical programme totals.';
revoke all on public.institution_explorer_uk_v1 from public, anon, authenticated;
grant select on public.institution_explorer_uk_v1 to service_role;

create or replace view public.institution_detail_uk_v1
with (security_invoker = true) as
select
  i.id as institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,i.status,
  coalesce(ex.program_count,0)::integer as program_count,
  coalesce(ex.campus_count,0)::integer as campus_count,
  coalesce(ex.city_count,0)::integer as city_count,
  coalesce(ex.city_names,array[]::text[]) as city_names,
  null::text as cricos_provider_code,null::text as cricos_source_url,
  coalesce(locations.campus_locations,'[]'::jsonb) as campus_locations,
  coalesce(programmes.study_areas,'[]'::jsonb) as study_areas,
  coalesce(programmes.programme_types,'[]'::jsonb) as programme_types,
  coalesce(programmes.programme_preview,'[]'::jsonb) as programme_preview
from catalog.institutions i
left join public.institution_explorer_uk_v1 ex on ex.institution_id=i.id
left join lateral (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',l.campus_id,'name',l.name,'city',l.city_name,'citySlug',l.city_slug,'reportedCity',l.reported_city,
    'region',l.region,'address',l.address_line,'postalCode',l.postal_code,'officialUrl',l.official_url
  ) order by coalesce(l.city_name,l.reported_city,''),coalesce(l.name,''),l.campus_id),'[]'::jsonb) as campus_locations
  from public.institution_location_uk_v1 l where l.institution_id=i.id
) locations on true
left join lateral (
  select
    (select coalesce(jsonb_agg(jsonb_build_object('name',areas.field_name,'count',areas.program_count) order by areas.program_count desc,areas.field_name),'[]'::jsonb)
     from (select p.field_name,count(*)::integer as program_count from catalog.programmes p
           where p.institution_id=i.id and p.status='active' and nullif(btrim(p.field_name),'') is not null
           group by p.field_name order by program_count desc,p.field_name limit 8) areas) as study_areas,
    (select coalesce(jsonb_agg(jsonb_build_object('name',types.programme_type,'count',types.program_count) order by types.program_count desc,types.programme_type),'[]'::jsonb)
     from (select p.programme_type,count(*)::integer as program_count from catalog.programmes p
           where p.institution_id=i.id and p.status='active' and nullif(btrim(p.programme_type),'') is not null
           group by p.programme_type order by program_count desc,p.programme_type limit 8) types) as programme_types,
    (select coalesce(jsonb_agg(jsonb_build_object('id',preview.id,'legacyProgramId',null,'title',preview.canonical_title,'programmeType',preview.programme_type,'fieldName',preview.field_name)
       order by preview.canonical_title,preview.id),'[]'::jsonb)
     from (select p.id,p.canonical_title,p.programme_type,p.field_name from catalog.programmes p
           where p.institution_id=i.id and p.status='active' and nullif(btrim(p.canonical_title),'') is not null
           order by p.canonical_title,p.id limit 12) preview) as programme_preview
) programmes on true
where i.status <> 'inactive' and i.slug is not null and i.country_code='UK';

comment on view public.institution_detail_uk_v1 is
  'Service-role UK Institution detail with institution-official location inventory where normalized and safe legacy city fallback elsewhere. Programme previews remain non-routable until UK Program detail pages exist.';
revoke all on public.institution_detail_uk_v1 from public, anon, authenticated;
grant select on public.institution_detail_uk_v1 to service_role;

do $$
declare
  anchor_count integer;
  offering_count integer;
  offering_anchor_count integer;
  verified_location_count integer;
  verified_institution_count integer;
  explorer_institution_count integer;
  detail_institution_count integer;
  institutions_without_display_location integer;
  verified_without_official_source integer;
  duplicate_verified_location_count integer;
begin
  select count(*) into anchor_count
  from catalog.campuses c join catalog.institutions i on i.id=c.institution_id
  where i.country_code='UK' and c.status <> 'inactive' and c.metadata ->> 'record_scope'='legacy_offering_anchor';

  select count(*) into offering_count
  from catalog.programme_offerings po
  join catalog.programmes p on p.id=po.programme_id
  join catalog.institutions i on i.id=p.institution_id
  where i.country_code='UK' and p.status='active';

  select count(*) into offering_anchor_count
  from catalog.programme_offerings po
  join catalog.programmes p on p.id=po.programme_id
  join catalog.institutions i on i.id=p.institution_id
  join catalog.campuses c on c.id=po.campus_id
  where i.country_code='UK' and p.status='active' and c.metadata ->> 'record_scope'='legacy_offering_anchor';

  select count(*),count(distinct institution_id) into verified_location_count,verified_institution_count
  from catalog.campuses
  where country_code='UK' and status <> 'inactive' and metadata ->> 'location_quality'='verified_official';

  select count(*) into verified_without_official_source
  from catalog.campuses
  where country_code='UK' and status <> 'inactive' and metadata ->> 'location_quality'='verified_official'
    and (official_url is null or official_url !~ '^https://' or source_url is null or source_url !~ '^https://');

  select count(*) into duplicate_verified_location_count
  from (
    select institution_id,metadata ->> 'location_key'
    from catalog.campuses
    where country_code='UK' and status <> 'inactive' and metadata ->> 'location_quality'='verified_official'
    group by institution_id,metadata ->> 'location_key' having count(*)>1
  ) d;

  select count(*) into explorer_institution_count from public.institution_explorer_uk_v1;
  select count(*) into detail_institution_count from public.institution_detail_uk_v1;

  select count(*) into institutions_without_display_location
  from catalog.institutions i
  where i.country_code='UK' and i.status <> 'inactive'
    and not exists (select 1 from public.institution_location_uk_v1 l where l.institution_id=i.id);

  if anchor_count <> 50 then raise exception 'Expected 50 UK legacy offering anchors, found %',anchor_count; end if;
  if offering_count <> 185 or offering_anchor_count <> 185 then raise exception 'UK offerings %, anchored %',offering_count,offering_anchor_count; end if;
  if verified_location_count <> 69 or verified_institution_count <> 19 then raise exception 'Expected 69 verified UK locations across 19 institutions, found % across %',verified_location_count,verified_institution_count; end if;
  if verified_without_official_source <> 0 then raise exception 'Verified UK locations missing HTTPS provenance: %',verified_without_official_source; end if;
  if duplicate_verified_location_count <> 0 then raise exception 'Duplicate verified UK location keys: %',duplicate_verified_location_count; end if;
  if explorer_institution_count <> 50 or detail_institution_count <> 50 then raise exception 'UK read models explorer %, detail %',explorer_institution_count,detail_institution_count; end if;
  if institutions_without_display_location <> 0 then raise exception 'UK institutions without display location: %',institutions_without_display_location; end if;
end $$;;
