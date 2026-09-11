-- BE/CH/SE/DK institution fast-path rollout.
-- Phases 1/2 verified a zero canonical baseline and current authority lists.
-- Phases 3/4/7 publish official-name identity, city-level locations, Explorer and Detail.
-- Phases 5/6 remain pending while canonical programme data is absent.

create temporary table tmp_institution_fastpath(
  country_code text, official_name text, slug text, website_url text,
  city_name text, city_slug text, identifier_system text,
  authority_system text, authority_source_url text
) on commit drop;

insert into tmp_institution_fastpath values
  ('BE','KU Leuven','ku-leuven','https://www.kuleuven.be/','Leuven','leuven','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://onderwijs.vlaanderen.be/nl/directies-administraties-en-besturen/hoger-onderwijs/toezicht/overzicht-regeringscommissarissen'),
  ('BE','Universiteit Gent','universiteit-gent','https://www.ugent.be/','Ghent','ghent','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://onderwijs.vlaanderen.be/nl/directies-administraties-en-besturen/hoger-onderwijs/toezicht/overzicht-regeringscommissarissen'),
  ('BE','Universiteit Antwerpen','universiteit-antwerpen','https://www.uantwerpen.be/','Antwerp','antwerp','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://onderwijs.vlaanderen.be/nl/directies-administraties-en-besturen/hoger-onderwijs/toezicht/overzicht-regeringscommissarissen'),
  ('BE','Vrije Universiteit Brussel','vrije-universiteit-brussel','https://www.vub.be/','Brussels','brussels','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://onderwijs.vlaanderen.be/nl/directies-administraties-en-besturen/hoger-onderwijs/toezicht/overzicht-regeringscommissarissen'),
  ('BE','Université catholique de Louvain','universite-catholique-de-louvain','https://www.uclouvain.be/','Louvain-la-Neuve','louvain-la-neuve','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://rfie.ares-ac.be/actualites/mai-2026'),
  ('BE','Université libre de Bruxelles','universite-libre-de-bruxelles','https://www.ulb.be/','Brussels','brussels','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://rfie.ares-ac.be/actualites/mai-2026'),
  ('BE','Université de Liège','universite-de-liege','https://www.uliege.be/','Liège','liege','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://rfie.ares-ac.be/actualites/mai-2026'),
  ('BE','Université de Namur','universite-de-namur','https://www.unamur.be/','Namur','namur','BE_OFFICIAL_UNIVERSITY_NAME','FLEMISH_EDUCATION_OR_ARES','https://rfie.ares-ac.be/actualites/mai-2026'),
  ('CH','Ecole polytechnique fédérale de Lausanne EPFL','ecole-polytechnique-federale-de-lausanne-epfl','https://www.epfl.ch/','Lausanne','lausanne','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Eidgenössische Technische Hochschule Zürich ETH','eidgenossische-technische-hochschule-zurich-eth','https://ethz.ch/','Zurich','zurich','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Universität Basel','universitat-basel','https://www.unibas.ch/','Basel','basel','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Universität Bern UniBE','universitat-bern-unibe','https://www.unibe.ch/','Bern','bern','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Université de Fribourg Unifr','universite-de-fribourg-unifr','https://www.unifr.ch/','Fribourg','fribourg','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Université de Genève UNIGE','universite-de-geneve-unige','https://www.unige.ch/','Geneva','geneva','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Université de Lausanne UNIL','universite-de-lausanne-unil','https://www.unil.ch/','Lausanne','lausanne','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Universität Luzern Unilu','universitat-luzern-unilu','https://www.unilu.ch/','Lucerne','lucerne','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Université de Neuchâtel UniNE','universite-de-neuchatel-unine','https://www.unine.ch/','Neuchâtel','neuchatel','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Universität St. Gallen HSG','universitat-st-gallen-hsg','https://www.unisg.ch/','St. Gallen','st-gallen','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Università della Svizzera italiana USI','universita-della-svizzera-italiana-usi','https://www.usi.ch/','Lugano','lugano','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('CH','Universität Zürich UZH','universitat-zurich-uzh','https://www.uzh.ch/','Zurich','zurich','CH_ACCREDITED_UNIVERSITY_NAME','SWISSUNIVERSITIES_HEDA','https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions'),
  ('SE','Uppsala University','uppsala-university','https://www.uu.se/','Uppsala','uppsala','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','Lund University','lund-university','https://www.lu.se/','Lund','lund','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','University of Gothenburg','university-of-gothenburg','https://www.gu.se/','Gothenburg','gothenburg','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','Stockholm University','stockholm-university','https://www.su.se/','Stockholm','stockholm','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','Umeå University','umea-university','https://www.umu.se/','Umeå','umea','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','Linköping University','linkoping-university','https://liu.se/','Linköping','linkoping','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','Karolinska Institutet','karolinska-institutet','https://ki.se/','Stockholm','stockholm','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','KTH Royal Institute of Technology','kth-royal-institute-of-technology','https://www.kth.se/','Stockholm','stockholm','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','Chalmers University of Technology','chalmers-university-of-technology','https://www.chalmers.se/','Gothenburg','gothenburg','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('SE','Swedish University of Agricultural Sciences','swedish-university-of-agricultural-sciences','https://www.slu.se/','Uppsala','uppsala','SE_UKA_UNIVERSITY_NAME','UKA_DEGREE_AWARDING_LIST','https://www.uka.se/sa-fungerar-hogskolan/universitet-och-hogskolor/lista-over-universitet-hogskolor-och-enskilda-utbildningsanordnare'),
  ('DK','Aalborg Universitet','aalborg-universitet','https://www.aau.dk/','Aalborg','aalborg','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet'),
  ('DK','Aarhus Universitet','aarhus-universitet','https://www.au.dk/','Aarhus','aarhus','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet'),
  ('DK','Copenhagen Business School','copenhagen-business-school','https://www.cbs.dk/','Frederiksberg','frederiksberg','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet'),
  ('DK','Danmarks Tekniske Universitet','danmarks-tekniske-universitet','https://www.dtu.dk/','Lyngby','lyngby','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet'),
  ('DK','IT-Universitetet i København','it-universitetet-i-kobenhavn','https://www.itu.dk/','Copenhagen','copenhagen','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet'),
  ('DK','Københavns Universitet','kobenhavns-universitet','https://www.ku.dk/','Copenhagen','copenhagen','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet'),
  ('DK','Roskilde Universitet','roskilde-universitet','https://www.ruc.dk/','Roskilde','roskilde','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet'),
  ('DK','Syddansk Universitet','syddansk-universitet','https://www.sdu.dk/','Odense','odense','DK_UFM_UNIVERSITY_NAME','UFM_UNIVERSITIES','https://ufm.dk/ministeriet/organisation/institutioner-under-ministeriet');

insert into catalog.institutions(
  id,country_code,canonical_name,institution_type,website_url,status,slug,institution_kind,ownership_type
)
select md5(lower(country_code)||':official-university:'||slug)::uuid,
  country_code,official_name,'university',website_url,'active',slug,'university',null
from tmp_institution_fastpath
on conflict(country_code,slug) where slug is not null
do update set canonical_name=excluded.canonical_name,institution_type=excluded.institution_type,
  website_url=excluded.website_url,status=excluded.status,institution_kind=excluded.institution_kind,
  ownership_type=excluded.ownership_type,updated_at=now();

insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select i.id,s.identifier_system,s.official_name,s.authority_source_url
from tmp_institution_fastpath s
join catalog.institutions i on i.country_code=s.country_code and i.slug=s.slug
on conflict(identifier_system,identifier_value)
do update set institution_id=excluded.institution_id,source_url=excluded.source_url;

insert into core.geographies(id,country_code,geography_type,name,slug,metadata,status)
select distinct md5(lower(country_code)||':city:'||city_slug)::uuid,country_code,'city',city_name,city_slug,
  jsonb_build_object('source_tier','official_institution_or_authority','source_system',authority_system,
    'normalization_batch','eu_fastpath_universities_v1'),'active'
from tmp_institution_fastpath
on conflict(id) do update set name=excluded.name,slug=excluded.slug,
  metadata=coalesce(core.geographies.metadata,'{}'::jsonb)||excluded.metadata,status='active',updated_at=now();

insert into catalog.campuses(
  id,institution_id,name,city,locality,country_code,geography_id,locality_geography_id,
  official_url,source_url,source_checked_at,metadata,status
)
select md5(lower(s.country_code)||':university-city:'||s.slug)::uuid,i.id,'Primary university location',
  s.city_name,s.city_name,s.country_code,g.id,g.id,s.website_url,s.website_url,now(),
  jsonb_build_object('record_scope','primary_university_city','location_quality','verified_authority_or_official',
    'display_policy','preferred','source_tier','official_institution_or_authority',
    'source_system',s.authority_system,'official_name',s.official_name,
    'location_key','primary-university-city','coordinate_precision','not_asserted',
    'campus_inventory_complete',false,'programme_assignment_verified',false,
    'normalization_batch','eu_fastpath_universities_v1'),'active'
from tmp_institution_fastpath s
join catalog.institutions i on i.country_code=s.country_code and i.slug=s.slug
join core.geographies g on g.country_code=s.country_code and g.geography_type='city' and g.slug=s.city_slug and g.status='active'
on conflict(id) do update set name=excluded.name,city=excluded.city,locality=excluded.locality,
  geography_id=excluded.geography_id,locality_geography_id=excluded.locality_geography_id,
  official_url=excluded.official_url,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at,
  metadata=excluded.metadata,status='active',updated_at=now();

create or replace view public.institution_identity_eu_fastpath_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,
  x.identifier_value official_name,x.source_url authority_source_url,x.identifier_system
from catalog.institutions i
join catalog.institution_identifiers x on x.institution_id=i.id
where i.country_code in ('BE','CH','SE','DK') and i.status<>'inactive' and i.slug is not null
  and x.identifier_system in ('BE_OFFICIAL_UNIVERSITY_NAME','CH_ACCREDITED_UNIVERSITY_NAME','SE_UKA_UNIVERSITY_NAME','DK_UFM_UNIVERSITY_NAME');

create or replace view public.institution_location_eu_fastpath_v1 with (security_invoker=true) as
select c.institution_id,i.country_code,c.id campus_id,c.name,g.name city_name,g.slug city_slug,
  coalesce(nullif(c.city,''),nullif(c.locality,'')) reported_city,c.region,c.address_line,c.postal_code,
  c.official_url,c.source_url,c.source_checked_at,c.metadata->>'location_quality' location_quality,
  c.metadata->>'record_scope' record_scope
from catalog.campuses c
join catalog.institutions i on i.id=c.institution_id and i.country_code in ('BE','CH','SE','DK')
left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.status='active'
where c.status<>'inactive' and c.metadata->>'normalization_batch'='eu_fastpath_universities_v1';

create or replace view public.institution_explorer_eu_fastpath_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,
  coalesce(p.program_count,0)::int program_count,coalesce(l.location_count,0)::int campus_count,
  coalesce(l.city_count,0)::int city_count,coalesce(l.city_names,array[]::text[]) city_names
from catalog.institutions i
left join lateral (select count(*)::int program_count from catalog.programmes p
  where p.institution_id=i.id and p.status='active') p on true
left join lateral (select count(*)::int location_count,count(distinct x.city_name)::int city_count,
  coalesce(array_agg(distinct x.city_name order by x.city_name) filter(where x.city_name is not null),array[]::text[]) city_names
  from public.institution_location_eu_fastpath_v1 x where x.institution_id=i.id) l on true
where i.country_code in ('BE','CH','SE','DK') and i.status<>'inactive' and i.slug is not null;

create or replace view public.institution_detail_eu_fastpath_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,i.status,
  coalesce(p.program_count,0)::int program_count,coalesce(l.location_count,0)::int campus_count,
  coalesce(l.city_count,0)::int city_count,coalesce(l.city_names,array[]::text[]) city_names,
  null::text cricos_provider_code,null::text cricos_source_url,
  coalesce(l.campus_locations,'[]'::jsonb) campus_locations,
  '[]'::jsonb study_areas,'[]'::jsonb programme_types,'[]'::jsonb programme_preview
from catalog.institutions i
left join lateral (select count(*)::int program_count from catalog.programmes p
  where p.institution_id=i.id and p.status='active') p on true
left join lateral (select count(*)::int location_count,count(distinct x.city_name)::int city_count,
  coalesce(array_agg(distinct x.city_name order by x.city_name) filter(where x.city_name is not null),array[]::text[]) city_names,
  coalesce(jsonb_agg(jsonb_build_object('id',x.campus_id,'name',x.name,'city',x.city_name,'citySlug',x.city_slug,
    'reportedCity',x.reported_city,'region',x.region,'address',x.address_line,'postalCode',x.postal_code,
    'officialUrl',x.official_url) order by x.campus_id),'[]'::jsonb) campus_locations
  from public.institution_location_eu_fastpath_v1 x where x.institution_id=i.id) l on true
where i.country_code in ('BE','CH','SE','DK') and i.status<>'inactive' and i.slug is not null;

revoke all on public.institution_identity_eu_fastpath_v1,public.institution_location_eu_fastpath_v1,
  public.institution_explorer_eu_fastpath_v1,public.institution_detail_eu_fastpath_v1 from public,anon,authenticated;
grant select on public.institution_identity_eu_fastpath_v1,public.institution_location_eu_fastpath_v1,
  public.institution_explorer_eu_fastpath_v1,public.institution_detail_eu_fastpath_v1 to service_role;

do $$
declare r record; c int;
begin
  for r in select country_code,count(*)::int expected from tmp_institution_fastpath group by country_code loop
    select count(*) into c from public.institution_identity_eu_fastpath_v1 where country_code=r.country_code;
    if c<>r.expected then raise exception '% identity mismatch: % vs %',r.country_code,c,r.expected; end if;
    select count(*) into c from public.institution_location_eu_fastpath_v1 where country_code=r.country_code;
    if c<>r.expected then raise exception '% location mismatch: % vs %',r.country_code,c,r.expected; end if;
    select count(*) into c from public.institution_detail_eu_fastpath_v1
      where country_code=r.country_code and (campus_count<1 or program_count<>0 or jsonb_array_length(programme_preview)<>0);
    if c<>0 then raise exception '% detail QA failures: %',r.country_code,c; end if;
  end loop;
  select count(*) into c from catalog.institutions
  where country_code in ('BE','CH','SE','DK') and status<>'inactive'
    and (institution_kind is distinct from 'university' or ownership_type is not null or website_url !~ '^https://');
  if c<>0 then raise exception 'Canonical fast-path QA failures: %',c; end if;
  select count(*) into c from catalog.campuses cp join catalog.institutions i on i.id=cp.institution_id
  where i.country_code in ('BE','CH','SE','DK') and cp.status<>'inactive'
    and cp.metadata->>'normalization_batch'='eu_fastpath_universities_v1'
    and (cp.latitude is not null or cp.longitude is not null);
  if c<>0 then raise exception 'Fast-path locations must not infer coordinates: %',c; end if;
end $$;;
