-- Switzerland Cities Phase 2: normalize the six Tier A study destinations to official FSO/BFS municipality scope.
-- Source authority: Federal Statistical Office, Official Directory of Municipalities, state 01.01.2026.
with approved(city_name,official_name,public_slug,expected_uuid,canton_code,canton_name,municipality_code,scope_note) as (
  values
    ('Zurich','Zürich','zurich','d135bf41-af8d-ab3e-3dbd-be29eceefdc3'::uuid,'ZH','Zürich','261','Use Zürich municipality as the statistical and public route boundary.'),
    ('Lausanne','Lausanne','lausanne','09dde9b3-f30f-09b0-feb9-e246d23ce7f3'::uuid,'VD','Vaud','5586','Use Lausanne municipality as the statistical boundary. Programme linkage still requires verified physical study-location evidence and must not treat the wider Lausanne academic cluster as the municipality.'),
    ('Basel','Basel','basel','2efe8123-2879-86c8-98a2-b8a445ca71b5'::uuid,'BS','Basel-Stadt','2701','Use Basel municipality, not the full Basel trinational region.'),
    ('Lugano','Lugano','lugano','5871ef5f-62b0-3da7-eb99-a81b557fedfb'::uuid,'TI','Ticino','5192','Use Lugano municipality as the public study-destination boundary.'),
    ('Fribourg','Fribourg','fribourg','15880ec6-33af-93a2-8838-e36551741db6'::uuid,'FR','Fribourg','2196','Use Fribourg municipality; Freiburg is retained as a language alias.'),
    ('Geneva','Genève','geneva','58a97820-a306-ab21-b894-d091211a8857'::uuid,'GE','Genève','6621','Use Genève municipality, not the full canton or cross-border metropolitan area.')
)
update core.geographies g
set slug=a.public_slug,
    geography_type='city',
    code=a.municipality_code,
    scope_kind='city',
    region_code=a.canton_code,
    status='active',
    metadata=coalesce(g.metadata,'{}'::jsonb) || jsonb_build_object(
      'ch_city_normalization_v1',true,
      'publication_tier','A',
      'publication_status','approved_not_indexed',
      'public_slug',a.public_slug,
      'official_municipality_name',a.official_name,
      'canton_code',a.canton_code,
      'canton_name',a.canton_name,
      'bfs_municipality_number',a.municipality_code,
      'study_destination_scope','bfs_municipality',
      'scope_note',a.scope_note,
      'scope_standard','FSO/BFS Official Directory of Municipalities 01.01.2026',
      'scope_source_url','https://www.agvchapp.bfs.admin.ch/',
      'population_geography_contract','bfs_municipality',
      'campus_membership_contract','phase_3_explicit_location_evidence_required'
    ),
    updated_at=now()
from approved a
where g.id=a.expected_uuid
  and g.country_code='CH'
  and g.geography_type='city'
  and g.canonical_geography_id is null
  and g.name=a.city_name;

with alias_seed(slug,alias,alias_type) as (
  values
    ('zurich','Zurich','other'),('zurich','Zürich','canonical_name'),
    ('lausanne','Lausanne','canonical_name'),
    ('basel','Basel','canonical_name'),
    ('lugano','Lugano','canonical_name'),
    ('fribourg','Fribourg','canonical_name'),('fribourg','Freiburg','other'),
    ('geneva','Geneva','other'),('geneva','Genève','canonical_name')
)
insert into core.geography_aliases(geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select g.id,'CH',a.alias,lower(trim(a.alias)),g.region_code,a.alias_type,'FSO/BFS Official Directory of Municipalities','https://www.agvchapp.bfs.admin.ch/'
from alias_seed a join core.geographies g on g.country_code='CH' and g.slug=a.slug and g.canonical_geography_id is null
on conflict do nothing;

insert into core.geography_aliases(geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select g.id,'CH',g.slug,lower(g.slug),g.region_code,'slug','core.geographies','https://www.agvchapp.bfs.admin.ch/'
from core.geographies g
where g.country_code='CH' and g.canonical_geography_id is null and g.slug in ('zurich','lausanne','basel','lugano','fribourg','geneva')
on conflict do nothing;

do $$
declare normalized_count integer; wrong_uuid integer; duplicate_count integer; unexpected_tier_a integer; bad_code integer; alias_count integer;
begin
  select count(*) into normalized_count
  from core.geographies g
  where g.country_code='CH' and g.geography_type='city' and g.canonical_geography_id is null
    and g.slug in ('zurich','lausanne','basel','lugano','fribourg','geneva')
    and g.scope_kind='city' and g.status='active'
    and g.metadata->>'publication_tier'='A'
    and g.metadata->>'study_destination_scope'='bfs_municipality'
    and g.metadata->>'bfs_municipality_number'=g.code;
  if normalized_count<>6 then raise exception 'Switzerland Tier A normalization expected 6 rows, found %',normalized_count; end if;

  select count(*) into wrong_uuid from core.geographies g
  where g.country_code='CH' and g.slug in ('zurich','lausanne','basel','lugano','fribourg','geneva') and not (
    (g.slug='zurich' and g.id='d135bf41-af8d-ab3e-3dbd-be29eceefdc3'::uuid) or
    (g.slug='lausanne' and g.id='09dde9b3-f30f-09b0-feb9-e246d23ce7f3'::uuid) or
    (g.slug='basel' and g.id='2efe8123-2879-86c8-98a2-b8a445ca71b5'::uuid) or
    (g.slug='lugano' and g.id='5871ef5f-62b0-3da7-eb99-a81b557fedfb'::uuid) or
    (g.slug='fribourg' and g.id='15880ec6-33af-93a2-8838-e36551741db6'::uuid) or
    (g.slug='geneva' and g.id='58a97820-a306-ab21-b894-d091211a8857'::uuid));
  if wrong_uuid<>0 then raise exception 'Switzerland Tier A UUID preservation contract failed'; end if;

  select count(*) into duplicate_count from (
    select slug from core.geographies where country_code='CH' and canonical_geography_id is null
      and slug in ('zurich','lausanne','basel','lugano','fribourg','geneva') group by slug having count(*)<>1
  ) q;
  if duplicate_count<>0 then raise exception 'Switzerland Tier A canonical city duplicate contract failed'; end if;

  select count(*) into unexpected_tier_a from core.geographies g
  where g.country_code='CH' and g.geography_type='city' and g.canonical_geography_id is null
    and g.metadata->>'publication_tier'='A' and g.slug not in ('zurich','lausanne','basel','lugano','fribourg','geneva');
  if unexpected_tier_a<>0 then raise exception 'Unexpected Switzerland Tier A geography detected'; end if;

  select count(*) into bad_code from core.geographies g where g.country_code='CH' and g.metadata->>'publication_tier'='A' and (
    (g.slug='zurich' and (g.code<>'261' or g.region_code<>'ZH')) or
    (g.slug='lausanne' and (g.code<>'5586' or g.region_code<>'VD')) or
    (g.slug='basel' and (g.code<>'2701' or g.region_code<>'BS')) or
    (g.slug='lugano' and (g.code<>'5192' or g.region_code<>'TI')) or
    (g.slug='fribourg' and (g.code<>'2196' or g.region_code<>'FR')) or
    (g.slug='geneva' and (g.code<>'6621' or g.region_code<>'GE')));
  if bad_code<>0 then raise exception 'Switzerland municipality/canton code contract failed'; end if;

  select count(*) into alias_count from core.geography_aliases a join core.geographies g on g.id=a.geography_id
  where g.country_code='CH' and g.metadata->>'publication_tier'='A';
  if alias_count<15 then raise exception 'Expected at least 15 Switzerland Tier A aliases, found %',alias_count; end if;
end $$;;
