create temporary table tmp_authority_fastpath(
  country_code text, official_name text, slug text, website_url text,
  city_name text, city_slug text, identifier_system text,
  authority_system text, authority_source_url text
) on commit drop;

insert into tmp_authority_fastpath values
('FI','University of Helsinki','university-of-helsinki','https://www.helsinki.fi/en','Helsinki','helsinki','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','Aalto University','aalto-university','https://www.aalto.fi/en','Espoo','espoo','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','University of Turku','university-of-turku','https://www.utu.fi/en','Turku','turku','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','Tampere University','tampere-university','https://www.tuni.fi/en','Tampere','tampere','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','University of Oulu','university-of-oulu','https://www.oulu.fi/en','Oulu','oulu','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','University of Eastern Finland','university-of-eastern-finland','https://www.uef.fi/en','Joensuu','joensuu','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','University of Jyväskylä','university-of-jyvaskyla','https://www.jyu.fi/en','Jyväskylä','jyvaskyla','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','LUT University','lut-university','https://www.lut.fi/en','Lappeenranta','lappeenranta','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','Åbo Akademi University','abo-akademi-university','https://www.abo.fi/en','Turku','turku','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('FI','Hanken School of Economics','hanken-school-of-economics','https://www.hanken.fi/en','Helsinki','helsinki','FI_EDUFI_TIER_A_NAME','EDUFI_STUDY_IN_FINLAND','https://www.studyinfinland.fi/news-events/finnish-universities-cwur-2026'),
('NO','Nord University','nord-university','https://www.nord.no/en','Bodø','bodo','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','Norwegian University of Life Sciences','norwegian-university-of-life-sciences','https://www.nmbu.no/en','Ås','as','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','Norwegian University of Science and Technology','norwegian-university-of-science-and-technology','https://www.ntnu.edu/','Trondheim','trondheim','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','OsloMet – Oslo Metropolitan University','oslomet-oslo-metropolitan-university','https://www.oslomet.no/en','Oslo','oslo','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','University of Agder','university-of-agder','https://www.uia.no/english','Kristiansand','kristiansand','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','University of Bergen','university-of-bergen','https://www.uib.no/en','Bergen','bergen','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','University of Inland Norway','university-of-inland-norway','https://eng.inn.no/','Elverum','elverum','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','University of Oslo','university-of-oslo','https://www.uio.no/english/','Oslo','oslo','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','University of Stavanger','university-of-stavanger','https://www.uis.no/en','Stavanger','stavanger','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','University of South-Eastern Norway','university-of-south-eastern-norway','https://www.usn.no/english/','Kongsberg','kongsberg','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('NO','UiT The Arctic University of Norway','uit-the-arctic-university-of-norway','https://en.uit.no/','Tromsø','tromso','NO_NOKUT_UNIVERSITY_NAME','NOKUT_UNIVERSITIES','https://www.nokut.no/en/higher-education/higher-education-institutions/'),
('JP','Tohoku University','tohoku-university','https://www.tohoku.ac.jp/en/','Sendai','sendai','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','University of Tsukuba','university-of-tsukuba','https://www.tsukuba.ac.jp/en/','Tsukuba','tsukuba','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','The University of Tokyo','the-university-of-tokyo','https://www.u-tokyo.ac.jp/en/','Tokyo','tokyo','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','Institute of Science Tokyo','institute-of-science-tokyo','https://www.isct.ac.jp/en','Tokyo','tokyo','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','Hitotsubashi University','hitotsubashi-university','https://www.hit-u.ac.jp/eng/','Kunitachi','kunitachi','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','Nagoya University','nagoya-university','https://en.nagoya-u.ac.jp/','Nagoya','nagoya','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','Kyoto University','kyoto-university','https://www.kyoto-u.ac.jp/en','Kyoto','kyoto','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','The University of Osaka','the-university-of-osaka','https://www.osaka-u.ac.jp/en/','Suita','suita','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('JP','Kyushu University','kyushu-university','https://www.kyushu-u.ac.jp/en/','Fukuoka','fukuoka','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','MEXT_DESIGNATED_NATIONAL_UNIVERSITIES','https://www.mext.go.jp/a_menu/koutou/houjin/houjin_00015.htm'),
('KR','Seoul National University','seoul-national-university','https://en.snu.ac.kr/','Seoul','seoul','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Korea University','korea-university','https://www.korea.edu/mbshome/mbs/en/index.do','Seoul','seoul','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Yonsei University','yonsei-university','https://www.yonsei.ac.kr/en_sc/','Seoul','seoul','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','KAIST (Korea Advanced Institute of Science and Technology)','kaist','https://www.kaist.ac.kr/en/','Daejeon','daejeon','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Pohang University of Science and Technology (POSTECH)','postech','https://www.postech.ac.kr/eng/','Pohang','pohang','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Sungkyunkwan University (SKKU)','sungkyunkwan-university','https://www.skku.edu/eng/','Seoul','seoul','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Hanyang University','hanyang-university','https://www.hanyang.ac.kr/web/eng','Seoul','seoul','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Kyung Hee University','kyung-hee-university','https://www.khu.ac.kr/eng','Seoul','seoul','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Ewha Womans University','ewha-womans-university','https://www.ewha.ac.kr/ewhaen/index.do','Seoul','seoul','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do'),
('KR','Pusan National University','pusan-national-university','https://www.pusan.ac.kr/eng/','Busan','busan','KR_IEQAS_TIER_A_NAME','NIIED_STUDY_IN_KOREA_IEQAS','https://studyinkorea.go.kr/ko/plan/certifiedUniversity.do');

insert into catalog.institutions(id,country_code,canonical_name,institution_type,website_url,status,slug,institution_kind,ownership_type)
select md5(lower(country_code)||':authority-university:'||slug)::uuid,country_code,official_name,'university',website_url,'active',slug,'university',null
from tmp_authority_fastpath
on conflict(country_code,slug) where slug is not null do update set canonical_name=excluded.canonical_name,institution_type=excluded.institution_type,website_url=excluded.website_url,status=excluded.status,institution_kind=excluded.institution_kind,ownership_type=excluded.ownership_type,updated_at=now();

insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select i.id,s.identifier_system,s.official_name,s.authority_source_url from tmp_authority_fastpath s join catalog.institutions i on i.country_code=s.country_code and i.slug=s.slug
on conflict(identifier_system,identifier_value) do update set institution_id=excluded.institution_id,source_url=excluded.source_url;

insert into core.geographies(id,country_code,geography_type,name,slug,metadata,status)
select distinct md5(lower(country_code)||':city:'||city_slug)::uuid,country_code,'city',city_name,city_slug,jsonb_build_object('source_tier','official_institution_or_authority','source_system',authority_system,'normalization_batch','fi_no_jp_kr_fastpath_v1'),'active'
from tmp_authority_fastpath
on conflict(id) do update set name=excluded.name,slug=excluded.slug,metadata=coalesce(core.geographies.metadata,'{}'::jsonb)||excluded.metadata,status='active',updated_at=now();

insert into catalog.campuses(id,institution_id,name,city,locality,country_code,geography_id,locality_geography_id,official_url,source_url,source_checked_at,metadata,status)
select md5(lower(s.country_code)||':authority-city:'||s.slug)::uuid,i.id,'Primary publication location',s.city_name,s.city_name,s.country_code,g.id,g.id,s.website_url,s.website_url,now(),jsonb_build_object('record_scope','primary_publication_city','location_quality','verified_authority_or_official','display_policy','preferred','source_tier','official_institution_or_authority','source_system',s.authority_system,'official_name',s.official_name,'location_key','primary-publication-city','coordinate_precision','not_asserted','campus_inventory_complete',false,'programme_assignment_verified',false,'normalization_batch','fi_no_jp_kr_fastpath_v1'),'active'
from tmp_authority_fastpath s join catalog.institutions i on i.country_code=s.country_code and i.slug=s.slug join core.geographies g on g.country_code=s.country_code and g.geography_type='city' and g.slug=s.city_slug and g.status='active'
on conflict(id) do update set name=excluded.name,city=excluded.city,locality=excluded.locality,geography_id=excluded.geography_id,locality_geography_id=excluded.locality_geography_id,official_url=excluded.official_url,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at,metadata=excluded.metadata,status=excluded.status,updated_at=now();

create or replace view public.institution_identity_authority_fastpath_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,ii.identifier_value official_name,ii.source_url authority_source_url,ii.identifier_system
from catalog.institutions i join catalog.institution_identifiers ii on ii.institution_id=i.id
where i.country_code in ('FI','NO','JP','KR') and i.status<>'inactive' and ii.identifier_system in ('FI_EDUFI_TIER_A_NAME','NO_NOKUT_UNIVERSITY_NAME','JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME','KR_IEQAS_TIER_A_NAME');
revoke all on public.institution_identity_authority_fastpath_v1 from public,anon,authenticated; grant select on public.institution_identity_authority_fastpath_v1 to service_role;

create or replace view public.institution_location_authority_fastpath_v1 with (security_invoker=true) as
select c.institution_id,c.id campus_id,c.name,g.name city_name,g.slug city_slug,coalesce(nullif(c.city,''),nullif(c.locality,'')) reported_city,c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,c.metadata->>'location_quality' location_quality,c.metadata->>'record_scope' record_scope
from catalog.campuses c join catalog.institutions i on i.id=c.institution_id and i.country_code in ('FI','NO','JP','KR') left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.status='active'
where c.status<>'inactive' and c.metadata->>'location_quality'='verified_authority_or_official';
revoke all on public.institution_location_authority_fastpath_v1 from public,anon,authenticated; grant select on public.institution_location_authority_fastpath_v1 to service_role;

create or replace view public.institution_explorer_authority_fastpath_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,coalesce(p.program_count,0)::integer program_count,coalesce(l.location_count,0)::integer campus_count,coalesce(l.city_count,0)::integer city_count,coalesce(l.city_names,array[]::text[]) city_names
from catalog.institutions i left join lateral (select count(*)::integer program_count from catalog.programmes p where p.institution_id=i.id and p.status='active') p on true left join lateral (select count(*)::integer location_count,count(distinct x.city_name)::integer city_count,coalesce(array_agg(distinct x.city_name order by x.city_name) filter(where x.city_name is not null),array[]::text[]) city_names from public.institution_location_authority_fastpath_v1 x where x.institution_id=i.id) l on true
where i.country_code in ('FI','NO','JP','KR') and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_explorer_authority_fastpath_v1 from public,anon,authenticated; grant select on public.institution_explorer_authority_fastpath_v1 to service_role;

create or replace view public.institution_detail_authority_fastpath_v1 with (security_invoker=true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,i.status,coalesce(p.program_count,0)::integer program_count,coalesce(l.location_count,0)::integer campus_count,coalesce(l.city_count,0)::integer city_count,coalesce(l.city_names,array[]::text[]) city_names,null::text cricos_provider_code,null::text cricos_source_url,coalesce(l.campus_locations,'[]'::jsonb) campus_locations,'[]'::jsonb study_areas,'[]'::jsonb programme_types,'[]'::jsonb programme_preview
from catalog.institutions i left join lateral (select count(*)::integer program_count from catalog.programmes p where p.institution_id=i.id and p.status='active') p on true left join lateral (select count(*)::integer location_count,count(distinct x.city_name)::integer city_count,coalesce(array_agg(distinct x.city_name order by x.city_name) filter(where x.city_name is not null),array[]::text[]) city_names,coalesce(jsonb_agg(jsonb_build_object('id',x.campus_id,'name',x.name,'city',x.city_name,'citySlug',x.city_slug,'reportedCity',x.reported_city,'region',x.region,'address',x.address_line,'postalCode',x.postal_code,'officialUrl',x.official_url) order by x.campus_id),'[]'::jsonb) campus_locations from public.institution_location_authority_fastpath_v1 x where x.institution_id=i.id) l on true
where i.country_code in ('FI','NO','JP','KR') and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_detail_authority_fastpath_v1 from public,anon,authenticated; grant select on public.institution_detail_authority_fastpath_v1 to service_role;

do $$ declare c int; begin
 select count(*) into c from public.institution_explorer_authority_fastpath_v1; if c<>40 then raise exception 'Expected 40 authority fastpath explorer rows, found %',c; end if;
 select count(*) into c from public.institution_detail_authority_fastpath_v1 where campus_count<1 or jsonb_array_length(campus_locations)<1 or program_count<>0 or jsonb_array_length(programme_preview)<>0; if c>0 then raise exception 'Authority fastpath detail invariant failures %',c; end if;
 select count(*) into c from catalog.campuses cp join catalog.institutions i on i.id=cp.institution_id where i.country_code in ('FI','NO','JP','KR') and cp.status<>'inactive' and (cp.latitude is not null or cp.longitude is not null); if c>0 then raise exception 'Authority fastpath locations must not infer coordinates: %',c; end if;
end $$;;
