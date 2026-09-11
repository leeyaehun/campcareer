-- UAE Cities Phase 3: reconcile selected-provider identity and verify physical study-location representatives.
-- ECAE is a verified Abu Dhabi location but remains programme-assignment gated.
-- Fakeeh College for Medical Sciences – Dubai is deliberately excluded from City linkage pending a verified Dubai teaching-location source.

create temporary table tmp_ae_city_provider(
  institution_slug text primary key,
  city_slug text not null,
  campus_name text not null,
  address_line text,
  official_url text not null,
  programme_assignment_verified boolean not null
) on commit drop;

insert into tmp_ae_city_provider values
  ('abu-dhabi-hospitality-academy-les-roches','abu-dhabi','Abu Dhabi Hospitality Academy – Les Roches campus','Zayed Sports City, W57 Al Rawdah, Abu Dhabi','https://lesroches.edu/campuses/abu-dhabi/',true),
  ('emirates-college-for-advanced-education','abu-dhabi','Abu Dhabi Campus','Al Asayil St - Khalifa City - SE-43 - Abu Dhabi','https://www.ecae.ac.ae/en/contact-us/',false),
  ('khalifa-university','abu-dhabi','Abu Dhabi teaching-location representative',null,'https://www.ku.ac.ae/contact',true),
  ('new-york-university-abu-dhabi','abu-dhabi','Saadiyat Island Campus',null,'https://nyuad.nyu.edu/en/about/contact-us.html',true),
  ('american-university-of-sharjah','sharjah','American University of Sharjah campus',null,'https://www.aus.edu/node/28645',true),
  ('united-arab-emirates-university','al-ain','United Arab Emirates University Al Ain campus',null,'https://www.uaeu.ac.ae/en/about/contact_us.shtml',true),
  ('american-university-in-the-emirates','dubai','Dubai International Academic City campus',null,'https://ad.aue.ae/',true),
  ('dubai-college-of-tourism','dubai','One Central campus','4th Floor, Office 2, One Central, Dubai','https://dct.ac.ae/en/contact/',true),
  ('emirates-aviation-university','dubai','Dubai International Academic City campus','Dubai International Academic City, Dubai','https://www.eau.ac.ae/campus/',true),
  ('emirates-flight-training-academy','dubai','Dubai South training academy','Dubai South, Dubai World Central, Dubai','https://www.emiratesflighttrainingacademy.com/en/campus/',true),
  ('mohammed-bin-rashid-university-of-medicine-and-health-sciences','dubai','Dubai Healthcare City campus','Building 14, Dubai Healthcare City, Dubai','https://www.mbru.ac.ae/contact-us/plan-a-visit/',true);

with expected(slug,identifier_system,identifier_value,source_url) as (values
  ('abu-dhabi-hospitality-academy-les-roches','AE_CAA_PROGRAM_PROVIDER_NAME','ABU DHABI HOSPITALITY ACADEMY – LES ROCHES','https://www.caa.ae/Pages/Programs/All.aspx'),
  ('emirates-college-for-advanced-education','AE_CAA_PROGRAM_PROVIDER_NAME','EMIRATES COLLEGE FOR ADVANCED EDUCATION','https://www.caa.ae/Pages/Programs/All.aspx'),
  ('american-university-in-the-emirates','AE_CAA_PROGRAM_PROVIDER_NAME','AMERICAN UNIVERSITY IN THE EMIRATES','https://www.caa.ae/Pages/Programs/All.aspx'),
  ('emirates-aviation-university','AE_CAA_PROGRAM_PROVIDER_NAME','EMIRATES AVIATION UNIVERSITY','https://www.caa.ae/Pages/Programs/All.aspx'),
  ('fakeeh-college-medical-sciences-dubai','AE_CAA_PROGRAM_PROVIDER_NAME','FAKEEH COLLEGE FOR MEDICAL SCIENCES – DUBAI','https://www.caa.ae/Pages/Programs/All.aspx')
)
insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url,valid_from)
select i.id,e.identifier_system,e.identifier_value,e.source_url,'2026-08-12'::date
from expected e
join catalog.institutions i on i.country_code='AE' and i.slug=e.slug and i.status='active'
on conflict(identifier_system,identifier_value)
do update set institution_id=excluded.institution_id,source_url=excluded.source_url,valid_from=excluded.valid_from;

update catalog.campuses c
set name=p.campus_name,
    city=g.name,
    locality=g.name,
    geography_id=g.id,
    locality_geography_id=g.id,
    address_line=coalesce(p.address_line,c.address_line),
    official_url=p.official_url,
    source_url=p.official_url,
    source_checked_at='2026-08-12'::timestamptz,
    metadata=coalesce(c.metadata,'{}'::jsonb)||jsonb_build_object(
      'source_tier','institution_official',
      'record_scope','verified_teaching_location_representative',
      'source_system','AE_PROVIDER_OFFICIAL_TEACHING_LOCATION',
      'location_quality','verified_official_institution_city',
      'normalization_batch','ae_city_linkage_v1',
      'campus_inventory_complete',false,
      'programme_assignment_verified',p.programme_assignment_verified,
      'programme_location_evidence',case when p.programme_assignment_verified then 'provider_official_city_location_plus_exact_staging_city' else 'physical_location_verified_programme_assignment_pending' end,
      'city_membership_contract','phase_2_official_city_locality'
    ),
    status='active',
    updated_at=now()
from tmp_ae_city_provider p
join catalog.institutions i on i.country_code='AE' and i.slug=p.institution_slug and i.status='active'
join core.geographies g on g.country_code='AE' and g.slug=p.city_slug and g.metadata->>'publication_tier'='A'
where c.institution_id=i.id and c.country_code='AE' and c.status='active'
  and lower(trim(coalesce(c.city,c.locality,g.name)))=lower(trim(g.name));

update catalog.programme_offerings po
set campus_id=c.id,updated_at=now()
from public.program_catalog_ae_staging s
join catalog.institutions i on i.id=s.institution_id and i.country_code='AE' and i.status='active'
join tmp_ae_city_provider p on p.institution_slug=i.slug and p.programme_assignment_verified is true
join core.geographies g on g.country_code='AE' and g.slug=p.city_slug and g.metadata->>'publication_tier'='A'
join catalog.campuses c on c.institution_id=i.id and c.geography_id=g.id and c.status='active' and c.metadata->>'normalization_batch'='ae_city_linkage_v1'
join catalog.programmes pr on pr.institution_id=i.id and pr.id=md5('AE|PROGRAM|'||s.source_name||'|'||s.source_program_key)::uuid and pr.status='active'
join catalog.programme_accreditations pa on pa.programme_id=pr.id and pa.review_status='verified' and pa.status='approved'
where po.programme_id=pr.id
  and po.source_system='AE_PROGRAM_STAGING'
  and po.source_record_key=s.source_program_key
  and s.accreditation_status='active'
  and s.verification_tier in ('A','B')
  and lower(trim(s.city))=lower(trim(g.name));

do $$
declare identity_n integer; location_n integer; assigned_n integer; bad integer;
begin
  select count(distinct s.institution_id) into identity_n
  from public.program_catalog_ae_staging s
  where s.city in ('Abu Dhabi','Sharjah','Al Ain','Dubai')
    and exists(select 1 from catalog.institution_identifiers ii where ii.institution_id=s.institution_id);
  if identity_n<>12 then raise exception 'AE Phase 3 expected source identity for 12 selected providers, found %',identity_n; end if;

  select count(*) into location_n
  from catalog.campuses c join catalog.institutions i on i.id=c.institution_id
  where i.country_code='AE' and c.metadata->>'normalization_batch'='ae_city_linkage_v1'
    and c.metadata->>'location_quality'='verified_official_institution_city';
  if location_n<>11 then raise exception 'AE Phase 3 expected 11 verified location representatives, found %',location_n; end if;

  select count(*) into assigned_n
  from catalog.programme_offerings po
  join public.program_catalog_ae_staging s on po.source_system='AE_PROGRAM_STAGING' and po.source_record_key=s.source_program_key
  join catalog.campuses c on c.id=po.campus_id and c.metadata->>'normalization_batch'='ae_city_linkage_v1'
  where s.city in ('Abu Dhabi','Sharjah','Al Ain','Dubai') and coalesce((c.metadata->>'programme_assignment_verified')::boolean,false) is true;
  if assigned_n<>98 then raise exception 'AE Phase 3 expected 98 verified programme-location assignments, found %',assigned_n; end if;

  select count(*) into bad from catalog.campuses c join catalog.institutions i on i.id=c.institution_id
  where i.slug='fakeeh-college-medical-sciences-dubai' and c.metadata->>'normalization_batch'='ae_city_linkage_v1';
  if bad<>0 then raise exception 'AE Phase 3 Fakeeh Dubai location must remain unverified'; end if;
end $$;