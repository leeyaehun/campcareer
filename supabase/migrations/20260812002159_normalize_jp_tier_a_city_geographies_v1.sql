-- Japan Cities Phase 2: normalize exactly seven Tier A study destinations to reproducible official statistical/municipal scope.
do $$
declare reusable integer; collision integer;
begin
  select count(*) into reusable from core.geographies
  where country_code='JP' and geography_type='city' and canonical_geography_id is null
    and slug in ('tokyo','kyoto','nagoya','sendai','suita','tsukuba','fukuoka');
  if reusable<>7 then raise exception 'JP Phase 2 expected seven reusable Tier A geography rows, found %', reusable; end if;
  select count(*) into collision from core.geographies
  where country_code='JP' and canonical_geography_id is null and slug='kunitachi'
    and metadata->>'publication_tier'='A';
  if collision<>0 then raise exception 'Kunitachi must remain outside JP Tier A v1'; end if;
end $$;

with approved(city_name,public_slug,region_code,region_name,stat_code,official_admin_name,scope_kind_label,admin_area_kind,study_scope,scope_note) as (values
 ('Tokyo','tokyo','13','Tokyo','13100','東京都区部','statistical_urban_core','special_ward_aggregate','tokyo_23_special_wards_aggregate','Use the Tokyo 23 special wards aggregate as the CampCareer city product boundary. Tokyo Metropolis outside the 23 wards, including Kunitachi, remains separate.'),
 ('Kyoto','kyoto','26','Kyoto Prefecture','26100','京都市','municipality','municipal_city','estat_municipal_city','Use Kyoto-shi municipality as the public study-destination and population boundary; other Kyoto Prefecture municipalities remain separate.'),
 ('Nagoya','nagoya','23','Aichi Prefecture','23100','名古屋市','municipality','municipal_city','estat_municipal_city','Use Nagoya-shi municipality; raw Aichi-prefecture source labels are not inherited into Nagoya.'),
 ('Sendai','sendai','04','Miyagi Prefecture','04100','仙台市','municipality','municipal_city','estat_municipal_city','Use Sendai-shi municipality as the study-destination and population boundary.'),
 ('Suita','suita','27','Osaka Prefecture','27205','吹田市','municipality','municipal_city','estat_municipal_city','Use Suita-shi municipality. Osaka City, Toyonaka and Minoh remain distinct and are never folded into Suita by university brand.'),
 ('Tsukuba','tsukuba','08','Ibaraki Prefecture','08220','つくば市','municipality','municipal_city','estat_municipal_city','Use Tsukuba-shi municipality; Tokyo-campus activity remains outside this boundary unless separately verified.'),
 ('Fukuoka','fukuoka','40','Fukuoka Prefecture','40130','福岡市','municipality','municipal_city','estat_municipal_city','Use Fukuoka-shi municipality; university locations elsewhere in Fukuoka Prefecture remain separate.')
)
update core.geographies g
set geography_type='city', code=a.stat_code, region_code=a.region_code, scope_kind=a.scope_kind_label, status='active',
    metadata=coalesce(g.metadata,'{}'::jsonb)||jsonb_build_object(
      'jp_city_normalization_v1',true,
      'publication_tier','A','publication_status','approved_not_indexed','public_slug',a.public_slug,
      'region_code',a.region_code,'region_name',a.region_name,
      'estat_area_code',a.stat_code,'official_admin_name',a.official_admin_name,
      'admin_area_kind',a.admin_area_kind,'study_destination_scope',a.study_scope,
      'population_geography_contract','statistics_bureau_estat_same_area_code',
      'scope_boundary_label',a.official_admin_name||' ('||a.stat_code||')','scope_note',a.scope_note,
      'scope_standard','Statistics Bureau / e-Stat statistical area code',
      'scope_source_url','https://www.e-stat.go.jp/','population_source_url','https://www.e-stat.go.jp/',
      'source_system','JAPAN_ESTAT_AREA_CODE','source_tier','government_official','normalization_batch','jp_cities_phase_2_v1',
      'campus_membership_contract','phase_3_explicit_teaching_location_required',
      'programme_coverage_status','verification_pending'),
    updated_at=now()
from approved a
where g.country_code='JP' and g.canonical_geography_id is null and g.slug=a.public_slug;

insert into core.geography_aliases(geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select g.id,'JP',g.name,lower(regexp_replace(trim(g.name),'\s+',' ','g')),g.region_code,'canonical_name','JAPAN_ESTAT_AREA_CODE','https://www.e-stat.go.jp/'
from core.geographies g
where g.country_code='JP' and g.canonical_geography_id is null and g.metadata->>'publication_tier'='A'
on conflict do nothing;

insert into core.geography_aliases(geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select g.id,'JP',g.slug,lower(trim(g.slug)),g.region_code,'slug','core.geographies','https://www.e-stat.go.jp/'
from core.geographies g
where g.country_code='JP' and g.canonical_geography_id is null and g.metadata->>'publication_tier'='A'
on conflict do nothing;

with aliases(slug,alias) as (values
 ('tokyo','東京都区部'),('tokyo','東京23区'),('kyoto','京都市'),('nagoya','名古屋市'),('sendai','仙台市'),('suita','吹田市'),('tsukuba','つくば市'),('fukuoka','福岡市')
)
insert into core.geography_aliases(geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select g.id,'JP',a.alias,lower(trim(a.alias)),g.region_code,'source','JAPAN_ESTAT_AREA_CODE','https://www.e-stat.go.jp/'
from aliases a join core.geographies g on g.country_code='JP' and g.slug=a.slug and g.canonical_geography_id is null
on conflict do nothing;

do $$
declare n integer; bad integer; unexpected integer; k_tier text;
begin
  select count(*) into n from core.geographies
  where country_code='JP' and canonical_geography_id is null and metadata->>'publication_tier'='A'
    and slug in ('tokyo','kyoto','nagoya','sendai','suita','tsukuba','fukuoka')
    and metadata->>'publication_status'='approved_not_indexed'
    and metadata->>'programme_coverage_status'='verification_pending';
  if n<>7 then raise exception 'JP Tier A normalization expected 7 rows, found %',n; end if;
  select count(*) into bad from core.geographies where country_code='JP' and metadata->>'publication_tier'='A' and
    ((slug='tokyo' and (code<>'13100' or region_code<>'13' or metadata->>'study_destination_scope'<>'tokyo_23_special_wards_aggregate')) or
     (slug='kyoto' and (code<>'26100' or region_code<>'26')) or
     (slug='nagoya' and (code<>'23100' or region_code<>'23')) or
     (slug='sendai' and (code<>'04100' or region_code<>'04')) or
     (slug='suita' and (code<>'27205' or region_code<>'27')) or
     (slug='tsukuba' and (code<>'08220' or region_code<>'08')) or
     (slug='fukuoka' and (code<>'40130' or region_code<>'40')));
  if bad<>0 then raise exception 'JP e-Stat area-code contract failed'; end if;
  select count(*) into unexpected from core.geographies where country_code='JP' and metadata->>'publication_tier'='A'
    and slug not in ('tokyo','kyoto','nagoya','sendai','suita','tsukuba','fukuoka');
  if unexpected<>0 then raise exception 'Unexpected JP Tier A geography detected'; end if;
  select metadata->>'publication_tier' into k_tier from core.geographies where country_code='JP' and slug='kunitachi' and canonical_geography_id is null;
  if k_tier is not null then raise exception 'Kunitachi leaked into JP Tier A'; end if;
end $$;;
