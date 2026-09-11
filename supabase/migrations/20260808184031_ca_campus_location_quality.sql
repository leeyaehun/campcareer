with settlements(name, region_code) as (
  values
    ('Calgary','AB'),('Camrose','AB'),('Edmonton','AB'),('Burnaby','BC'),('Fort St. John','BC'),('Kelowna','BC'),('Prince George','BC'),('Quesnel','BC'),('Surrey','BC'),('Terrace','BC'),('Vancouver','BC'),('Victoria','BC'),('Winnipeg','MB'),('Fredericton','NB'),('Saint John','NB'),('Corner Brook','NL'),('St. John''s','NL'),('Halifax','NS'),('Alfred','ON'),('Brantford','ON'),('Breslau','ON'),('Burlington','ON'),('Cambridge','ON'),('Guelph','ON'),('Hamilton','ON'),('Kemptville','ON'),('Kingston','ON'),('Kitchener','ON'),('London','ON'),('Mississauga','ON'),('Oshawa','ON'),('Ottawa','ON'),('Pembroke','ON'),('Ridgetown','ON'),('St. Catharines','ON'),('Stratford','ON'),('Toronto','ON'),('Waterloo','ON'),('Windsor','ON'),('Montreal','QC'),('Quebec City','QC'),('Sainte-Anne-de-Bellevue','QC'),('Saskatoon','SK')
)
insert into core.geographies(country_code,geography_type,name,region_code,slug,metadata,status)
select 'CA','city',s.name,s.region_code,lower(trim(both '-' from regexp_replace(s.name,'[^A-Za-z0-9]+','-','g'))),jsonb_build_object('source_kind','ircc_dli_location','normalization_batch','ca_institution_locations_v1'),'active'
from settlements s
where not exists(select 1 from core.geographies g where g.country_code='CA' and g.geography_type='city' and lower(g.name)=lower(s.name) and coalesce(g.region_code,'')=coalesce(s.region_code,''));

update catalog.campuses c
set locality=coalesce(c.locality,c.city), locality_geography_id=coalesce(c.locality_geography_id,c.geography_id), metadata=coalesce(c.metadata,'{}'::jsonb)||jsonb_build_object('record_scope','legacy_offering_anchor','location_quality','legacy_city','display_policy','fallback_only','legacy_source_table','catalog.programme_offerings','normalization_batch','ca_institution_locations_v1'), updated_at=now()
from catalog.institutions i
where c.institution_id=i.id and i.country_code='CA' and c.status<>'inactive' and lower(c.name) like '%listed campus%';

with locations(legacy_provider_id,location_key,display_name,city,region_code,source_city,source_location_label) as (
values
('brock-university','hamilton','Hamilton Campus','Hamilton','ON','Hamilton','Hamilton Campus'),
('brock-university','st-catharines','Main Campus','St. Catharines','ON','St. Catharines','Main Campus'),
('carleton-university','ottawa','Ottawa DLI-listed location','Ottawa','ON','Ottawa','Ottawa'),
('concordia-university','montreal','Montréal DLI-listed location','Montreal','QC','Montréal','Montréal'),
('dalhousie-university','halifax','Halifax DLI-listed location','Halifax','NS','Halifax','Halifax'),
('macewan-university','edmonton','Edmonton DLI-listed locations','Edmonton','AB','Edmonton','City Centre Campus, Centre for the Arts & Communications, Alberta College'),
('mcgill-university','macdonald','Macdonald Campus','Sainte-Anne-de-Bellevue','QC','Sainte-Anne-de-Bellevue','Macdonald Campus'),
('mcgill-university','montreal-main','Main Campus','Montreal','QC','Montréal','Campus principal'),
('mcmaster-university','hamilton','Hamilton DLI-listed locations','Hamilton','ON','Hamilton','Downtown Centre, McMaster Innovation Park, Main Campus, McMaster Nursing at Mohawk (Collaborative)'),
('mcmaster-university','burlington','DeGroote School of Business','Burlington','ON','Burlington','DeGroote School of Business'),
('mcmaster-university','kitchener','Kitchener DLI-listed locations','Kitchener','ON','Kitchener','McMaster Nursing at Conestoga (Collaborative), Waterloo Regional Campus'),
('mcmaster-university','st-catharines','Niagara Regional Campus','St. Catharines','ON','St. Catharines','Niagara Regional Campus'),
('memorial-university-of-newfoundland','corner-brook','Grenfell Campus','Corner Brook','NL','Corner Brook','Grenfell Campus'),
('memorial-university-of-newfoundland','st-johns','St. John’s DLI-listed locations','St. John''s','NL','St. John’s','Fisheries and Marine Institute Campus, St. John’s Campus'),
('ontario-tech-university','oshawa','Oshawa DLI-listed location','Oshawa','ON','Oshawa','Oshawa'),
('queen-s-university','kingston','Main Campus','Kingston','ON','Kingston','Main Campus'),
('queen-s-university','toronto','Queen’s School of Business Toronto Facility','Toronto','ON','Toronto','Queen’s School of Business Toronto Facility'),
('simon-fraser-university','burnaby','Burnaby DLI-listed location','Burnaby','BC','Burnaby',''),
('simon-fraser-university','surrey','Surrey DLI-listed location','Surrey','BC','Surrey',''),
('simon-fraser-university','vancouver','Vancouver DLI-listed location','Vancouver','BC','Vancouver',''),
('toronto-metropolitan-university','toronto','Toronto DLI-listed location','Toronto','ON','Toronto','Toronto'),
('universit-de-montr-al','montreal','Montréal DLI-listed location','Montreal','QC','Montréal','Montréal'),
('universit-du-qu-bec-montr-al','montreal','Montréal DLI-listed location','Montreal','QC','Montréal','Montréal'),
('universit-laval','quebec-city','Québec DLI-listed location','Quebec City','QC','Québec','Québec'),
('university-of-alberta','camrose','Augustana Campus','Camrose','AB','Camrose','Augustana Campus'),
('university-of-alberta','edmonton','Edmonton DLI-listed locations','Edmonton','AB','Edmonton','Main, Campus St. Jean'),
('university-of-british-columbia','kelowna','Kelowna DLI-listed location','Kelowna','BC','Kelowna',''),
('university-of-british-columbia','vancouver','Vancouver DLI-listed location','Vancouver','BC','Vancouver',''),
('university-of-calgary','calgary','Calgary DLI-listed location','Calgary','AB','Calgary','Calgary'),
('university-of-guelph','guelph','Main Campus','Guelph','ON','Guelph','Main Campus'),
('university-of-guelph','toronto','University of Guelph-Humber','Toronto','ON','Toronto','University of Guelph-Humber'),
('university-of-guelph','alfred','Campus d’Alfred','Alfred','ON','Alfred','Campus d’Alfred'),
('university-of-guelph','kemptville','Kemptville Campus','Kemptville','ON','Kemptville','Kemptville Campus'),
('university-of-guelph','ridgetown','Ridgetown Campus','Ridgetown','ON','Ridgetown','Ridgetown Campus'),
('university-of-manitoba','winnipeg','Winnipeg DLI-listed location','Winnipeg','MB','Winnipeg','Winnipeg'),
('university-of-new-brunswick','fredericton','UNB – Fredericton','Fredericton','NB','Fredericton','UNB – Fredericton'),
('university-of-new-brunswick','saint-john','UNB – Saint John','Saint John','NB','Saint John','UNB – Saint John'),
('university-of-northern-british-columbia','fort-st-john','Fort St. John DLI-listed location','Fort St. John','BC','Fort St. John',''),
('university-of-northern-british-columbia','prince-george','Prince George DLI-listed location','Prince George','BC','Prince George',''),
('university-of-northern-british-columbia','quesnel','Quesnel DLI-listed location','Quesnel','BC','Quesnel',''),
('university-of-northern-british-columbia','terrace','Terrace DLI-listed location','Terrace','BC','Terrace',''),
('university-of-ottawa','ottawa','Ottawa DLI-listed locations','Ottawa','ON','Ottawa','Algonquin College of Applied Arts and Technology (Collaborative), La Cité Collégiale (Collaborative), Main Campus'),
('university-of-ottawa','pembroke','Pembroke DLI-listed collaborative location','Pembroke','ON','Pembroke','Algonquin College of Applied Arts and Technology (Collaborative)'),
('university-of-ottawa','windsor','Windsor DLI-listed location','Windsor','ON','Windsor','Université d’Ottawa/University of Ottawa'),
('university-of-ottawa','toronto','Toronto DLI-listed location','Toronto','ON','Toronto','Université d’Ottawa/University of Ottawa'),
('university-of-saskatchewan','saskatoon','Saskatoon DLI-listed location','Saskatoon','SK','Saskatoon','Saskatoon'),
('university-of-toronto','mississauga','Mississauga DLI-listed location','Mississauga','ON','Mississauga','Mississauga'),
('university-of-toronto','toronto','Toronto DLI-listed locations','Toronto','ON','Toronto','Main Campus, Scarborough Campus'),
('university-of-victoria','victoria','Victoria DLI-listed location','Victoria','BC','Victoria',''),
('university-of-waterloo','breslau','Wellington Flight Centre Campus (Aviation)','Breslau','ON','Breslau','Wellington Flight Centre Campus (Aviation)'),
('university-of-waterloo','cambridge','School of Architecture','Cambridge','ON','Cambridge','School of Architecture'),
('university-of-waterloo','waterloo','Waterloo DLI-listed locations','Waterloo','ON','Waterloo','Allen Square Campus, Balsillie School of International Affairs, Main Campus'),
('university-of-waterloo','stratford','Stratford Campus','Stratford','ON','Stratford','Stratford Campus'),
('university-of-waterloo','toronto','Master of Taxation Site','Toronto','ON','Toronto','Master of Taxation Site'),
('western-university','london','London DLI-listed location','London','ON','London','The University of Western Ontario'),
('wilfrid-laurier-university','brantford','Brantford Campus','Brantford','ON','Brantford','Brantford Campus'),
('wilfrid-laurier-university','kitchener','Kitchener Location','Kitchener','ON','Kitchener','Kitchener Location'),
('wilfrid-laurier-university','toronto','Toronto Location','Toronto','ON','Toronto','Toronto Location'),
('wilfrid-laurier-university','waterloo','Main Campus','Waterloo','ON','Waterloo','Main Campus'),
('york-university','toronto','Toronto DLI-listed locations','Toronto','ON','Toronto','Campus Glendon, Campus principal, Miles S. Nadal Management Centre, Osgoode Hall Law School, Schulich Executive Education (Schulich ExecEd)')
), resolved as (
select l.*,legacy.institution_id,official.identifier_value as dli_number,g.id as geography_id
from locations l
join catalog.institution_identifiers legacy on legacy.identifier_system='CA_PROVIDER_ID' and legacy.identifier_value=l.legacy_provider_id
join catalog.institution_identifiers official on official.institution_id=legacy.institution_id and official.identifier_system='CA_DLI'
join catalog.institutions i on i.id=legacy.institution_id and i.country_code='CA'
join core.geographies g on g.country_code='CA' and g.geography_type='city' and lower(g.name)=lower(l.city) and coalesce(g.region_code,'')=coalesce(l.region_code,'') and g.status='active'
)
insert into catalog.campuses(id,institution_id,name,city,region,country_code,status,geography_id,locality,locality_geography_id,address_line,postal_code,official_url,source_url,source_checked_at,metadata,created_at,updated_at)
select gen_random_uuid(),r.institution_id,r.display_name,r.city,r.region_code,'CA','active',r.geography_id,r.city,r.geography_id,null,null,null,'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html',now(),jsonb_build_object('record_scope','ircc_dli_location','location_quality','verified_official','display_policy','preferred','source_kind','ircc_dli_list','dli_number',r.dli_number,'source_city',r.source_city,'source_location_label',r.source_location_label,'location_key',r.location_key,'normalization_batch','ca_institution_locations_v1'),now(),now()
from resolved r
where not exists(select 1 from catalog.campuses existing where existing.institution_id=r.institution_id and existing.country_code='CA' and existing.metadata->>'normalization_batch'='ca_institution_locations_v1' and existing.metadata->>'record_scope'='ircc_dli_location' and existing.metadata->>'location_key'=r.location_key);

create or replace view public.institution_location_ca_v1 with (security_invoker=true) as
with verified as (
select c.id as campus_id,c.institution_id,c.name,g.name as city_name,g.slug as city_slug,coalesce(nullif(btrim(c.city),''),nullif(btrim(c.locality),'')) as reported_city,c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,c.metadata
from catalog.campuses c left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.geography_type='city' and g.status='active'
join catalog.institutions i on i.id=c.institution_id and i.country_code='CA'
where c.status<>'inactive' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='ircc_dli_location' and c.metadata->>'location_quality'='verified_official'
), fallback as (
select c.id as campus_id,c.institution_id,c.name,g.name as city_name,g.slug as city_slug,coalesce(nullif(btrim(c.city),''),nullif(btrim(c.locality),'')) as reported_city,c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,c.metadata
from catalog.campuses c left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.geography_type='city' and g.status='active'
join catalog.institutions i on i.id=c.institution_id and i.country_code='CA'
where c.status<>'inactive' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='legacy_offering_anchor' and not exists(select 1 from verified v where v.institution_id=c.institution_id)
)
select * from verified union all select * from fallback;
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
from public.institution_detail_v1 base join public.institution_identity_ca_v1 identity on identity.institution_id=base.institution_id
left join lateral (
select count(*)::integer as location_count,count(distinct coalesce(v.city_name,v.reported_city))::integer as city_count,coalesce(array_agg(distinct coalesce(v.city_name,v.reported_city) order by coalesce(v.city_name,v.reported_city)) filter(where coalesce(v.city_name,v.reported_city) is not null),array[]::text[]) as city_names,
(select coalesce(jsonb_agg(jsonb_build_object('id',x.campus_id,'name',x.name,'city',x.city_name,'citySlug',x.city_slug,'reportedCity',x.reported_city,'region',x.region,'address',x.address_line,'postalCode',x.postal_code,'officialUrl',x.official_url,'sourceUrl',x.source_url,'sourceCheckedAt',x.source_checked_at) order by coalesce(x.city_name,x.reported_city,''),coalesce(x.name,''),x.campus_id),'[]'::jsonb) from (select * from public.institution_location_ca_v1 v2 where v2.institution_id=base.institution_id order by coalesce(v2.city_name,v2.reported_city,''),coalesce(v2.name,''),v2.campus_id limit 24) x) as campus_locations
from public.institution_location_ca_v1 v where v.institution_id=base.institution_id
) loc on true where base.country_code='CA';
revoke all on public.institution_detail_ca_v1 from public,anon,authenticated; grant select on public.institution_detail_ca_v1 to service_role;

do $$ declare legacy_anchor_count integer; active_offering_count integer; offering_anchor_count integer; verified_location_count integer; verified_institution_count integer; display_institution_count integer; invalid_source_count integer; duplicate_location_key_count integer; missing_geography_count integer;
begin
select count(*) into legacy_anchor_count from catalog.campuses c join catalog.institutions i on i.id=c.institution_id where i.country_code='CA' and c.status<>'inactive' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='legacy_offering_anchor'; if legacy_anchor_count<>30 then raise exception 'Expected 30 Canadian legacy offering anchors, found %',legacy_anchor_count; end if;
select count(*),count(*) filter(where anchor.metadata->>'record_scope'='legacy_offering_anchor' and anchor.metadata->>'normalization_batch'='ca_institution_locations_v1') into active_offering_count,offering_anchor_count from catalog.programme_offerings po join catalog.programmes p on p.id=po.programme_id join catalog.institutions i on i.id=p.institution_id join catalog.campuses anchor on anchor.id=po.campus_id where i.country_code='CA' and p.status='active'; if active_offering_count<>165 or offering_anchor_count<>165 then raise exception 'Expected all 165 active Canadian programme offerings to retain legacy anchors; offerings %, anchors %',active_offering_count,offering_anchor_count; end if;
select count(*),count(distinct c.institution_id) into verified_location_count,verified_institution_count from catalog.campuses c join catalog.institutions i on i.id=c.institution_id where i.country_code='CA' and c.status<>'inactive' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='ircc_dli_location' and c.metadata->>'location_quality'='verified_official'; if verified_location_count<>60 or verified_institution_count<>30 then raise exception 'Expected 60 verified IRCC locations across 30 Canadian institutions; found % across %',verified_location_count,verified_institution_count; end if;
select count(distinct institution_id) into display_institution_count from public.institution_location_ca_v1; if display_institution_count<>30 then raise exception 'Expected display locations for all 30 Canadian institutions, found %',display_institution_count; end if;
select count(*) into invalid_source_count from catalog.campuses c join catalog.institutions i on i.id=c.institution_id where i.country_code='CA' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='ircc_dli_location' and c.source_url is distinct from 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html'; if invalid_source_count>0 then raise exception 'Found % Canadian verified locations without canonical IRCC provenance',invalid_source_count; end if;
select count(*)-count(distinct (c.institution_id,c.metadata->>'location_key')) into duplicate_location_key_count from catalog.campuses c join catalog.institutions i on i.id=c.institution_id where i.country_code='CA' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='ircc_dli_location'; if duplicate_location_key_count>0 then raise exception 'Found % duplicate Canadian IRCC location keys',duplicate_location_key_count; end if;
select count(*) into missing_geography_count from catalog.campuses c join catalog.institutions i on i.id=c.institution_id where i.country_code='CA' and c.metadata->>'normalization_batch'='ca_institution_locations_v1' and c.metadata->>'record_scope'='ircc_dli_location' and coalesce(c.locality_geography_id,c.geography_id) is null; if missing_geography_count>0 then raise exception 'Found % Canadian IRCC locations without normalized geography',missing_geography_count; end if;
end $$;;
