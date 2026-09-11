create temporary table tmp_ae_group1(
  official_name text, canonical_name text, slug text, website_url text,
  city_name text, city_slug text, location_source_url text
) on commit drop;

insert into tmp_ae_group1 values
('AMERICAN UNIVERSITY OF SHARJAH','American University of Sharjah','american-university-of-sharjah','https://www.aus.edu/','Sharjah','sharjah','https://www.aus.edu/node/28645'),
('KHALIFA UNIVERSITY OF SCIENCE AND TECHNOLOGY','Khalifa University','khalifa-university','https://www.ku.ac.ae/','Abu Dhabi','abu-dhabi','https://www.ku.ac.ae/contact'),
('MOHAMMED BIN RASHID UNIVERSITY OF MEDICINE AND HEALTH SCIENCES','Mohammed Bin Rashid University of Medicine and Health Sciences','mohammed-bin-rashid-university-of-medicine-and-health-sciences','https://www.mbru.ac.ae/','Dubai','dubai','https://www.mbru.ac.ae/contact-us/'),
('NEW YORK UNIVERSITY, ABU DHABI','New York University Abu Dhabi','new-york-university-abu-dhabi','https://nyuad.nyu.edu/','Abu Dhabi','abu-dhabi','https://nyuad.nyu.edu/en/about/contact-us.html'),
('UNITED ARAB EMIRATES UNIVERSITY','United Arab Emirates University','united-arab-emirates-university','https://www.uaeu.ac.ae/en/','Al Ain','al-ain','https://www.uaeu.ac.ae/en/about/contact_us.shtml');

insert into catalog.institutions(id,country_code,canonical_name,institution_type,website_url,status,slug,institution_kind,ownership_type)
select md5('ae:caa-group1:'||slug)::uuid,'AE',canonical_name,'university',website_url,'active',slug,'university',null
from tmp_ae_group1
on conflict(country_code,slug) where slug is not null do update set canonical_name=excluded.canonical_name,institution_type=excluded.institution_type,website_url=excluded.website_url,status=excluded.status,institution_kind=excluded.institution_kind,ownership_type=excluded.ownership_type,updated_at=now();

insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select i.id,'AE_CAA_ACTIVE_HEI_NAME',s.official_name,'https://www.caa.ae/pages/institutes/all.aspx'
from tmp_ae_group1 s join catalog.institutions i on i.country_code='AE' and i.slug=s.slug
on conflict(identifier_system,identifier_value) do update set institution_id=excluded.institution_id,source_url=excluded.source_url;

insert into core.geographies(id,country_code,geography_type,name,slug,metadata,status)
select distinct md5('ae:city:'||city_slug)::uuid,'AE','city',city_name,city_slug,jsonb_build_object('source_tier','institution_official','source_system','AE_CAA_MOHESR_GROUP1','normalization_batch','ae_group1_v1'),'active'
from tmp_ae_group1
on conflict(id) do update set name=excluded.name,slug=excluded.slug,metadata=coalesce(core.geographies.metadata,'{}'::jsonb)||excluded.metadata,status='active',updated_at=now();

insert into catalog.campuses(id,institution_id,name,city,locality,country_code,geography_id,locality_geography_id,official_url,source_url,source_checked_at,metadata,status)
select md5('ae:group1-location:'||s.slug)::uuid,i.id,'Primary publication location',s.city_name,s.city_name,'AE',g.id,g.id,s.website_url,s.location_source_url,now(),jsonb_build_object('record_scope','primary_publication_city','location_quality','verified_official','display_policy','preferred','source_tier','institution_official','source_system','AE_CAA_MOHESR_GROUP1','official_name',s.official_name,'selection_basis','UAE_MOE_2024_RESEARCH_CLUSTER_GROUP1','location_key','primary-publication-city','coordinate_precision','not_asserted','campus_inventory_complete',false,'programme_assignment_verified',false,'normalization_batch','ae_group1_v1'),'active'
from tmp_ae_group1 s join catalog.institutions i on i.country_code='AE' and i.slug=s.slug join core.geographies g on g.country_code='AE' and g.geography_type='city' and g.slug=s.city_slug and g.status='active'
on conflict(id) do update set name=excluded.name,city=excluded.city,locality=excluded.locality,geography_id=excluded.geography_id,locality_geography_id=excluded.locality_geography_id,official_url=excluded.official_url,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at,metadata=excluded.metadata,status=excluded.status,updated_at=now();

create or replace view public.institution_identity_ae_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,ii.identifier_value caa_official_name,ii.source_url caa_source_url
from catalog.institutions i join catalog.institution_identifiers ii on ii.institution_id=i.id and ii.identifier_system='AE_CAA_ACTIVE_HEI_NAME'
where i.country_code='AE' and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_identity_ae_v1 from public,anon,authenticated; grant select on public.institution_identity_ae_v1 to service_role;

create or replace view public.institution_location_ae_v1 with (security_invoker=true) as
select c.institution_id,c.id campus_id,c.name,g.name city_name,g.slug city_slug,coalesce(nullif(c.city,''),nullif(c.locality,'')) reported_city,c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,c.metadata->>'location_quality' location_quality,c.metadata->>'record_scope' record_scope
from catalog.campuses c join catalog.institutions i on i.id=c.institution_id and i.country_code='AE' left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.status='active'
where c.status<>'inactive' and c.metadata->>'location_quality'='verified_official';
revoke all on public.institution_location_ae_v1 from public,anon,authenticated; grant select on public.institution_location_ae_v1 to service_role;

create or replace view public.institution_explorer_ae_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,coalesce(p.program_count,0)::integer program_count,coalesce(l.location_count,0)::integer campus_count,coalesce(l.city_count,0)::integer city_count,coalesce(l.city_names,array[]::text[]) city_names
from catalog.institutions i left join lateral (select count(*)::integer program_count from catalog.programmes p where p.institution_id=i.id and p.status='active') p on true left join lateral (select count(*)::integer location_count,count(distinct x.city_name)::integer city_count,coalesce(array_agg(distinct x.city_name order by x.city_name) filter(where x.city_name is not null),array[]::text[]) city_names from public.institution_location_ae_v1 x where x.institution_id=i.id) l on true
where i.country_code='AE' and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_explorer_ae_v1 from public,anon,authenticated; grant select on public.institution_explorer_ae_v1 to service_role;

create or replace view public.institution_detail_ae_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,i.status,coalesce(p.program_count,0)::integer program_count,coalesce(l.location_count,0)::integer campus_count,coalesce(l.city_count,0)::integer city_count,coalesce(l.city_names,array[]::text[]) city_names,null::text cricos_provider_code,null::text cricos_source_url,coalesce(l.campus_locations,'[]'::jsonb) campus_locations,'[]'::jsonb study_areas,'[]'::jsonb programme_types,'[]'::jsonb programme_preview
from catalog.institutions i left join lateral (select count(*)::integer program_count from catalog.programmes p where p.institution_id=i.id and p.status='active') p on true left join lateral (select count(*)::integer location_count,count(distinct x.city_name)::integer city_count,coalesce(array_agg(distinct x.city_name order by x.city_name) filter(where x.city_name is not null),array[]::text[]) city_names,coalesce(jsonb_agg(jsonb_build_object('id',x.campus_id,'name',x.name,'city',x.city_name,'citySlug',x.city_slug,'reportedCity',x.reported_city,'region',x.region,'address',x.address_line,'postalCode',x.postal_code,'officialUrl',x.official_url) order by x.campus_id),'[]'::jsonb) campus_locations from public.institution_location_ae_v1 x where x.institution_id=i.id) l on true
where i.country_code='AE' and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_detail_ae_v1 from public,anon,authenticated; grant select on public.institution_detail_ae_v1 to service_role;

do $$ declare c int; begin
 select count(*) into c from public.institution_identity_ae_v1; if c<>5 then raise exception 'Expected 5 AE identities, found %',c; end if;
 select count(*) into c from public.institution_explorer_ae_v1; if c<>5 then raise exception 'Expected 5 AE explorer rows, found %',c; end if;
 select count(*) into c from public.institution_detail_ae_v1 where campus_count<1 or jsonb_array_length(campus_locations)<1 or program_count<>0 or jsonb_array_length(programme_preview)<>0; if c>0 then raise exception 'AE detail invariant failures %',c; end if;
 select count(*) into c from catalog.campuses cp join catalog.institutions i on i.id=cp.institution_id where i.country_code='AE' and cp.status<>'inactive' and (cp.latitude is not null or cp.longitude is not null); if c>0 then raise exception 'AE locations must not infer coordinates %',c; end if;
end $$;;
