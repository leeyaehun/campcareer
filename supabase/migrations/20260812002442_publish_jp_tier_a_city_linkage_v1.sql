-- Japan Cities Phase 3: verified teaching-location representatives, conservative city programme linkage, private read models.
with locations(institution_name,city_slug,campus_name,address_line,postal_code,official_url) as (values
 ('The University of Tokyo','tokyo','Hongo Campus','7-3-1 Hongo, Bunkyo-ku, Tokyo','113-0033','https://www.u-tokyo.ac.jp/en/general/visit_campuses.html'),
 ('Institute of Science Tokyo','tokyo','Ookayama Campus','2-12-1 Ookayama, Meguro-ku, Tokyo','152-8550','https://www.isct.ac.jp/en/001/access'),
 ('Kyoto University','kyoto','Yoshida Campus','Yoshida-honmachi, Sakyo-ku, Kyoto','606-8501','https://www.t.kyoto-u.ac.jp/en/access'),
 ('Kyoto Culinary Art College','kyoto','Uzumasa Campus','4-5 Uzumasa-yasui-nishizawa-cho, Ukyo-ku, Kyoto','616-8083','https://www.taiwa.ac.jp/global/en/access.php'),
 ('Kyoto Pastry & Bakery Art College','kyoto','Uzumasa Campus','4-5 Uzumasa-yasui-nishizawa-cho, Ukyo-ku, Kyoto','616-8083','https://www.taiwa.ac.jp/global/en/access.php'),
 ('Kyoto Koka University','kyoto','Kyoto Koka Campus','38 Nishikyogoku Kadono-cho, Ukyo-ku, Kyoto','615-0882','https://webetc.koka.ac.jp/kokusai/form.php'),
 ('Nagoya University','nagoya','Nagoya teaching locations — Higashiyama representative','Furo-cho, Chikusa-ku, Nagoya','464-8601','https://en.nagoya-u.ac.jp/access'),
 ('Tohoku University','sendai','Sendai teaching locations — city-level verified','2-1-1 Katahira, Aoba-ku, Sendai','980-8577','https://campus.bureau.tohoku.ac.jp/en_index.php'),
 ('The University of Osaka','suita','Suita Campus','1-1 Yamadaoka, Suita, Osaka','565-0871','https://www.osaka-u.ac.jp/en/access/top'),
 ('University of Tsukuba','tsukuba','Tsukuba Campus','1-1-1 Tennodai, Tsukuba, Ibaraki','305-8577','https://www.tsukuba.ac.jp/en/contact/'),
 ('Kyushu University','fukuoka','Ito Campus','744 Motooka, Nishi-ku, Fukuoka','819-0395','https://www.kyushu-u.ac.jp/en/campus/ito')
)
insert into catalog.campuses(institution_id,name,city,region,country_code,geography_id,locality,locality_geography_id,address_line,postal_code,official_url,source_url,source_checked_at,metadata,status)
select i.id,l.campus_name,g.name,g.metadata->>'region_name','JP',g.id,g.name,g.id,l.address_line,l.postal_code,l.official_url,l.official_url,now(),
 jsonb_build_object('source_tier','institution_official','record_scope','verified_teaching_location_representative','source_system','UNIVERSITY_OFFICIAL_TEACHING_LOCATION','location_quality','verified_official_institution_city','normalization_batch','jp_city_linkage_v1','campus_inventory_complete',false,'programme_assignment_verified',true,'city_membership_contract','phase_2_estat_area_boundary','programme_linkage_policy','explicit_allowlist_only'),'active'
from locations l join catalog.institutions i on i.country_code='JP' and i.canonical_name=l.institution_name and i.status='active'
join core.geographies g on g.country_code='JP' and g.slug=l.city_slug and g.metadata->>'publication_tier'='A' and g.canonical_geography_id is null;

with assignment(institution_name,source_city,campus_name) as (values
 ('Nagoya University','Nagoya','Nagoya teaching locations — Higashiyama representative'),
 ('Tohoku University','Sendai','Sendai teaching locations — city-level verified'),
 ('Kyoto Culinary Art College','Kyoto','Uzumasa Campus'),
 ('Kyoto Pastry & Bakery Art College','Kyoto','Uzumasa Campus'),
 ('Kyoto Koka University','Kyoto','Kyoto Koka Campus')
)
update catalog.programme_offerings po set campus_id=c.id,updated_at=now()
from public.program_catalog_jp_staging s
join assignment a on a.institution_name=s.institution_name and a.source_city=s.city
join catalog.institutions i on i.id=s.institution_id and i.country_code='JP' and i.canonical_name=a.institution_name
join catalog.campuses c on c.institution_id=i.id and c.name=a.campus_name and c.country_code='JP' and c.status='active' and c.metadata->>'normalization_batch'='jp_city_linkage_v1'
join catalog.programmes p on p.institution_id=i.id and p.status='active'
where po.programme_id=p.id and po.source_system='JP_PROGRAM_SOURCE' and po.source_record_key=(s.source_name||':'||s.source_program_key)
 and po.verification_status='verified' and s.verification_tier='A';

create or replace view public.city_institution_directory_jp_v1 with (security_invoker=true) as
select g.id city_id,g.slug city_slug,g.name city_name,g.region_code,g.metadata->>'region_name' region_name,g.code admin_code,i.id institution_id,i.canonical_name institution_name,i.slug institution_slug,i.website_url,
 ii.identifier_system authority_identifier_system,ii.identifier_value authority_identifier,ii.source_url authority_source_url,
 case when ii.identifier_system='JP_STUDYINJAPAN_SCHOOL_CODE' then 'studyinjapan_school_code_verified' else 'official_or_mext_name_verified' end::text identifier_maturity,
 c.id campus_id,c.name campus_name,c.address_line,c.postal_code,coalesce(c.source_url,c.official_url,i.website_url) location_source_url,c.metadata->>'record_scope' record_scope,c.metadata->>'location_quality' location_quality,coalesce((c.metadata->>'programme_assignment_verified')::boolean,false) programme_assignment_verified
from core.geographies g join catalog.campuses c on c.geography_id=g.id and c.status='active' and c.metadata->>'normalization_batch'='jp_city_linkage_v1'
join catalog.institutions i on i.id=c.institution_id and i.status='active' and i.country_code='JP'
join lateral (select x.identifier_system,x.identifier_value,x.source_url from catalog.institution_identifiers x where x.institution_id=i.id order by case x.identifier_system when 'JP_STUDYINJAPAN_SCHOOL_CODE' then 1 when 'JP_MEXT_DESIGNATED_NATIONAL_UNIVERSITY_NAME' then 2 when 'JP_OFFICIAL_PROVIDER_NAME' then 3 else 9 end,x.identifier_system limit 1) ii on true
where g.country_code='JP' and g.metadata->>'publication_tier'='A' and c.metadata->>'location_quality'='verified_official_institution_city';

create or replace view public.city_programme_directory_jp_v1 with (security_invoker=true) as
select g.id city_id,g.slug city_slug,g.name city_name,i.id institution_id,i.canonical_name institution_name,i.slug institution_slug,c.id campus_id,c.name campus_name,pr.id programme_id,pr.canonical_title programme_title,pr.programme_type,pr.field_name,s.degree_level source_degree_level,po.id offering_id,po.market,po.delivery_mode,po.enrolment_status,po.source_url offering_source_url,s.official_program_url,s.international_source_url,s.source_program_key,s.city source_city,s.verification_tier,s.collection_status
from catalog.programme_offerings po
join public.program_catalog_jp_staging s on po.source_system='JP_PROGRAM_SOURCE' and po.source_record_key=(s.source_name||':'||s.source_program_key)
join catalog.programmes pr on pr.id=po.programme_id and pr.status='active' and pr.institution_id=s.institution_id
join catalog.institutions i on i.id=pr.institution_id and i.status='active' and i.country_code='JP'
join catalog.campuses c on c.id=po.campus_id and c.institution_id=i.id and c.status='active'
join core.geographies g on g.id=c.geography_id and g.country_code='JP' and g.metadata->>'publication_tier'='A'
where po.verification_status='verified' and s.verification_tier='A' and c.metadata->>'normalization_batch'='jp_city_linkage_v1' and coalesce((c.metadata->>'programme_assignment_verified')::boolean,false) is true and lower(trim(s.city))=lower(trim(g.name));

create or replace view public.city_directory_jp_v1 with (security_invoker=true) as
select g.id city_id,g.slug,g.name,g.region_code,g.metadata->>'region_name' region_name,g.code admin_code,g.metadata->>'study_destination_scope' study_destination_scope,
 count(distinct ci.campus_id)::integer linked_campus_count,count(distinct ci.institution_id)::integer linked_institution_count,count(distinct cp.programme_id)::integer linked_program_count,
 'selected_official_provider_core_full_hei_coverage_pending'::text institution_coverage_status,'mixed_mext_studyinjapan_official_identifier_verified'::text institution_identifier_maturity,
 case when count(distinct cp.programme_id)>0 then 'verified_partial' else 'verification_pending' end::text programme_coverage_status
from core.geographies g left join public.city_institution_directory_jp_v1 ci on ci.city_id=g.id left join public.city_programme_directory_jp_v1 cp on cp.city_id=g.id
where g.country_code='JP' and g.metadata->>'publication_tier'='A' group by g.id,g.slug,g.name,g.region_code,g.code,g.metadata;

revoke all on public.city_institution_directory_jp_v1 from public,anon,authenticated;
revoke all on public.city_programme_directory_jp_v1 from public,anon,authenticated;
revoke all on public.city_directory_jp_v1 from public,anon,authenticated;
grant select on public.city_institution_directory_jp_v1 to service_role;
grant select on public.city_programme_directory_jp_v1 to service_role;
grant select on public.city_directory_jp_v1 to service_role;

do $$
declare loc_n integer; prog_n integer; city_n integer; bad_city integer; bad_source integer; forbidden integer; tokyo_n integer; suit_n integer;
begin
 select count(*) into loc_n from public.city_institution_directory_jp_v1; if loc_n<>11 then raise exception 'JP Tier A teaching-location representatives expected 11, found %',loc_n; end if;
 select count(*) into prog_n from public.city_programme_directory_jp_v1; if prog_n<>54 then raise exception 'JP conservative city programme linkage expected 54, found %',prog_n; end if;
 select count(*) into city_n from public.city_directory_jp_v1; if city_n<>7 then raise exception 'JP city directory expected 7 rows, found %',city_n; end if;
 select count(*) into bad_city from public.city_directory_jp_v1 where linked_campus_count<1 or linked_institution_count<1; if bad_city<>0 then raise exception 'Every JP Tier A city must have verified institution/location representation'; end if;
 select count(*) into bad_source from public.city_programme_directory_jp_v1 where lower(trim(source_city))<>lower(trim(city_name)); if bad_source<>0 then raise exception 'JP strict programme source-city mismatch detected'; end if;
 select count(*) into forbidden from public.city_programme_directory_jp_v1 where source_city in ('Aichi','Tochigi','Gunma','Osaka') or city_slug='kunitachi'; if forbidden<>0 then raise exception 'JP forbidden prefecture/Osaka/Kunitachi leakage detected'; end if;
 select linked_program_count into tokyo_n from public.city_directory_jp_v1 where slug='tokyo'; if tokyo_n<>0 then raise exception 'Tokyo multi-campus programmes must remain pending'; end if;
 select linked_program_count into suit_n from public.city_directory_jp_v1 where slug='suita'; if suit_n<>0 then raise exception 'Raw Osaka programmes must not auto-link to Suita'; end if;
end $$;;
