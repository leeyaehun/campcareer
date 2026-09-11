with source_locations as (
  select identity.institution_id,identity.program_catalog_id,btrim(s.province) as region_code,btrim(s.city) as city,min(coalesce(s.official_program_url,s.source_url)) as source_url
  from public.program_catalog_ca_staging s
  join public.institution_program_catalog_identity_ca_v1 identity on identity.program_catalog_id=s.institution_id
  where s.city is not null and btrim(s.city)<>'' and not exists (
    select 1 from catalog.campuses existing
    where existing.institution_id=identity.institution_id and existing.country_code='CA' and existing.metadata->>'normalization_batch'='ca_institution_locations_v1' and existing.metadata->>'record_scope'='ircc_dli_location'
  )
  group by identity.institution_id,identity.program_catalog_id,btrim(s.province),btrim(s.city)
), resolved as (
  select source.*,i.website_url,(
    select g.id from core.geographies g where g.country_code='CA' and g.geography_type='city' and g.status='active' and lower(g.name)=lower(source.city) and coalesce(g.region_code,'')=coalesce(source.region_code,'') order by g.id limit 1
  ) as geography_id
  from source_locations source join catalog.institutions i on i.id=source.institution_id
)
insert into catalog.campuses(id,institution_id,name,city,region,country_code,status,geography_id,locality,locality_geography_id,address_line,postal_code,official_url,source_url,source_checked_at,metadata,created_at,updated_at)
select gen_random_uuid(),r.institution_id,r.city||' program-catalog study location',r.city,r.region_code,'CA','active',r.geography_id,r.city,r.geography_id,null,null,r.website_url,r.source_url,now(),jsonb_build_object('record_scope','program_catalog_location','location_quality','source_backed_official_catalog','display_policy','preferred','source_kind','official_program_catalog','program_catalog_id',r.program_catalog_id,'location_key',lower(r.region_code||':'||r.city),'normalization_batch','ca_institution_locations_v2'),now(),now()
from resolved r
where not exists(select 1 from catalog.campuses existing where existing.institution_id=r.institution_id and existing.country_code='CA' and existing.metadata->>'normalization_batch'='ca_institution_locations_v2' and existing.metadata->>'location_key'=lower(r.region_code||':'||r.city));

with ircc_locations(program_catalog_id,location_key,display_name,city,region_code,source_location_label) as (
values
('university-of-regina','sk:regina','Regina DLI-listed study location','Regina','SK','Regina'),
('nova-scotia-community-college','ns:halifax','IRCC-listed NSCC study locations','Halifax','NS','Akerley Campus, Annapolis Valley Campus, Aviation Institute, Burridge Campus, Centre of Geographic Sciences (COGS), Cumberland Campus, eCampus, Institute of Technology Campus, Ivany Campus, Kingstec Campus, Lunenburg Campus, Sydney Waterfront Campus, Nautical Institute, Pictou Campus, School of Fisheries, Shelburne Campus, Strait Area Campus, Truro Campus'),
('saskatchewan-polytechnic','sk:moose-jaw','Moose Jaw DLI-listed study location','Moose Jaw','SK','Moose Jaw'),
('saskatchewan-polytechnic','sk:prince-albert','Prince Albert DLI-listed study location','Prince Albert','SK','Prince Albert'),
('saskatchewan-polytechnic','sk:regina','Regina DLI-listed study location','Regina','SK','Regina'),
('saskatchewan-polytechnic','sk:saskatoon','Saskatoon DLI-listed study location','Saskatoon','SK','Saskatoon'),
('new-brunswick-community-college','nb:fredericton','NBCC – Fredericton','Fredericton','NB','NBCC - Fredericton'),
('new-brunswick-community-college','nb:miramichi','NBCC – Miramichi','Miramichi','NB','NBCC - Miramichi'),
('new-brunswick-community-college','nb:moncton','NBCC – Moncton','Moncton','NB','NBCC - Moncton'),
('new-brunswick-community-college','nb:saint-john','NBCC – Saint John','Saint John','NB','NBCC – Saint John'),
('new-brunswick-community-college','nb:st-andrews','NBCC – St. Andrews','St. Andrews','NB','NBCC - St. Andrews'),
('new-brunswick-community-college','nb:woodstock','NBCC – Woodstock','Woodstock','NB','NBCC - Woodstock')
), resolved as (
  select source.*,identity.institution_id,identity.dli_number,i.website_url,(
    select g.id from core.geographies g where g.country_code='CA' and g.geography_type='city' and g.status='active' and lower(g.name)=lower(source.city) and coalesce(g.region_code,'')=source.region_code order by g.id limit 1
  ) as geography_id
  from ircc_locations source
  join public.institution_program_catalog_identity_ca_v1 identity on identity.program_catalog_id=source.program_catalog_id
  join catalog.institutions i on i.id=identity.institution_id
  where identity.dli_number is not null
)
insert into catalog.campuses(id,institution_id,name,city,region,country_code,status,geography_id,locality,locality_geography_id,address_line,postal_code,official_url,source_url,source_checked_at,metadata,created_at,updated_at)
select gen_random_uuid(),r.institution_id,r.display_name,r.city,r.region_code,'CA','active',r.geography_id,r.city,r.geography_id,null,null,r.website_url,'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html',now(),jsonb_build_object('record_scope','ircc_dli_location','location_quality','verified_official','display_policy','preferred','source_kind','ircc_dli_list','dli_number',r.dli_number,'source_location_label',r.source_location_label,'program_catalog_id',r.program_catalog_id,'location_key',r.location_key,'normalization_batch','ca_institution_locations_v2'),now(),now()
from resolved r
where not exists(select 1 from catalog.campuses existing where existing.institution_id=r.institution_id and existing.country_code='CA' and existing.metadata->>'normalization_batch'='ca_institution_locations_v2' and existing.metadata->>'location_key'=r.location_key);

create or replace view public.institution_location_ca_v1 with (security_invoker=true) as
with preferred as (
  select c.id as campus_id,c.institution_id,c.name,g.name as city_name,g.slug as city_slug,coalesce(nullif(btrim(c.city),''),nullif(btrim(c.locality),'')) as reported_city,c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,c.metadata
  from catalog.campuses c join catalog.institutions i on i.id=c.institution_id and i.country_code='CA' and i.status<>'inactive'
  left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.geography_type='city' and g.status='active'
  where c.status<>'inactive' and c.metadata->>'display_policy'='preferred' and (
    (c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='ircc_dli_location' and c.metadata->>'location_quality'='verified_official')
    or (c.metadata->>'normalization_batch'='ca_institution_locations_v2' and c.metadata->>'record_scope' in ('ircc_dli_location','program_catalog_location') and c.metadata->>'location_quality' in ('verified_official','source_backed_official_catalog'))
  )
), fallback as (
  select c.id as campus_id,c.institution_id,c.name,g.name as city_name,g.slug as city_slug,coalesce(nullif(btrim(c.city),''),nullif(btrim(c.locality),'')) as reported_city,c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,c.metadata
  from catalog.campuses c join catalog.institutions i on i.id=c.institution_id and i.country_code='CA' and i.status<>'inactive'
  left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.geography_type='city' and g.status='active'
  where c.status<>'inactive' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='legacy_offering_anchor' and not exists(select 1 from preferred p where p.institution_id=c.institution_id)
)
select * from preferred union all select * from fallback;
revoke all on public.institution_location_ca_v1 from public,anon,authenticated; grant select on public.institution_location_ca_v1 to service_role;

create or replace view public.institution_explorer_ca_v1 with (security_invoker=true) as
select base.institution_id,base.country_code,base.slug,base.canonical_name,base.institution_kind,base.ownership_type,base.website_url,base.program_count,coalesce(loc.location_count,0)::integer as campus_count,coalesce(loc.city_count,0)::integer as city_count,coalesce(loc.city_names,array[]::text[]) as city_names
from public.institution_explorer_v1 base
left join lateral (
select count(*)::integer as location_count,count(distinct coalesce(v.city_name,v.reported_city))::integer as city_count,coalesce(array_agg(distinct coalesce(v.city_name,v.reported_city) order by coalesce(v.city_name,v.reported_city)) filter(where coalesce(v.city_name,v.reported_city) is not null),array[]::text[]) as city_names
from public.institution_location_ca_v1 v where v.institution_id=base.institution_id
) loc on true where base.country_code='CA';
revoke all on public.institution_explorer_ca_v1 from public,anon,authenticated; grant select on public.institution_explorer_ca_v1 to service_role;

create or replace view public.institution_detail_ca_v1 with (security_invoker=true) as
select base.institution_id,base.country_code,base.slug,base.canonical_name,base.institution_kind,base.ownership_type,base.website_url,base.status,base.program_count,coalesce(loc.location_count,0)::integer as campus_count,coalesce(loc.city_count,0)::integer as city_count,coalesce(loc.city_names,array[]::text[]) as city_names,base.cricos_provider_code,base.cricos_source_url,coalesce(loc.campus_locations,'[]'::jsonb) as campus_locations,base.study_areas,base.programme_types,base.programme_preview,identity.dli_number,identity.dli_source_url
from public.institution_detail_v1 base left join public.institution_identity_ca_v1 identity on identity.institution_id=base.institution_id
left join lateral (
select count(*)::integer as location_count,count(distinct coalesce(v.city_name,v.reported_city))::integer as city_count,coalesce(array_agg(distinct coalesce(v.city_name,v.reported_city) order by coalesce(v.city_name,v.reported_city)) filter(where coalesce(v.city_name,v.reported_city) is not null),array[]::text[]) as city_names,
(select coalesce(jsonb_agg(jsonb_build_object('id',x.campus_id,'name',x.name,'city',x.city_name,'citySlug',x.city_slug,'reportedCity',x.reported_city,'region',x.region,'address',x.address_line,'postalCode',x.postal_code,'officialUrl',x.official_url,'sourceUrl',x.source_url,'sourceCheckedAt',x.source_checked_at) order by coalesce(x.city_name,x.reported_city,''),coalesce(x.name,''),x.campus_id),'[]'::jsonb) from (select * from public.institution_location_ca_v1 v2 where v2.institution_id=base.institution_id order by coalesce(v2.city_name,v2.reported_city,''),coalesce(v2.name,''),v2.campus_id limit 24) x) as campus_locations
from public.institution_location_ca_v1 v where v.institution_id=base.institution_id
) loc on true where base.country_code='CA';
revoke all on public.institution_detail_ca_v1 from public,anon,authenticated; grant select on public.institution_detail_ca_v1 to service_role;

do $$ declare v2_location_count integer; v2_institution_count integer; display_institution_count integer; preferred_total integer; invalid_source_count integer; duplicate_key_count integer; attached_offering_count integer; nunavut_location_count integer; begin
select count(*),count(distinct c.institution_id) into v2_location_count,v2_institution_count from catalog.campuses c join catalog.institutions i on i.id=c.institution_id where i.country_code='CA' and c.status<>'inactive' and c.metadata->>'normalization_batch'='ca_institution_locations_v2'; if v2_location_count<>55 or v2_institution_count<>32 then raise exception 'Expected 55 v2 Canadian locations across 32 acquired institutions, found % across %',v2_location_count,v2_institution_count; end if;
select count(distinct institution_id),count(*) into display_institution_count,preferred_total from public.institution_location_ca_v1; if display_institution_count<>62 or preferred_total<>115 then raise exception 'Expected display locations for 62 institutions / 115 rows, found % / %',display_institution_count,preferred_total; end if;
select count(*) into invalid_source_count from catalog.campuses c where c.metadata->>'normalization_batch'='ca_institution_locations_v2' and (c.source_url is null or c.source_url !~ '^https://'); if invalid_source_count>0 then raise exception 'Found % v2 Canadian locations without HTTPS provenance',invalid_source_count; end if;
select count(*)-count(distinct (c.institution_id,c.metadata->>'location_key')) into duplicate_key_count from catalog.campuses c where c.metadata->>'normalization_batch'='ca_institution_locations_v2'; if duplicate_key_count>0 then raise exception 'Found % duplicate v2 Canadian location keys',duplicate_key_count; end if;
select count(*) into attached_offering_count from catalog.programme_offerings po join catalog.campuses c on c.id=po.campus_id where c.metadata->>'normalization_batch'='ca_institution_locations_v2'; if attached_offering_count<>0 then raise exception 'Found % programme offerings incorrectly assigned to v2 display locations',attached_offering_count; end if;
select count(*) into nunavut_location_count from catalog.campuses c join catalog.institutions i on i.id=c.institution_id where i.country_code='CA' and i.slug='nunavut-arctic-college' and c.metadata->>'normalization_batch'='ca_institution_locations_v2'; if nunavut_location_count<1 then raise exception 'Expected a source-backed program-catalog location for Nunavut Arctic College'; end if;
end $$;;
