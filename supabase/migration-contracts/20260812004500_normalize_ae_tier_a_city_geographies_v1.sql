-- UAE Cities Phase 2: normalize exactly the four Phase 1 Tier A study destinations.
-- City/locality semantics are deliberately distinct from the containing emirate.

create temporary table tmp_ae_city_scope(
  slug text primary key,
  expected_id uuid not null,
  city_name text not null,
  emirate_name text not null,
  authority_name text not null,
  authority_url text not null
) on commit drop;

insert into tmp_ae_city_scope values
  ('abu-dhabi','3e96ce30-2c4a-d479-0483-40ea660d332a','Abu Dhabi','Abu Dhabi','Abu Dhabi City Municipality / Department of Municipalities and Transport','https://www.dmt.gov.ae/en/adm/About-Abu-Dhabi-City-Municipality/About-Us'),
  ('sharjah','7e6c2892-818d-e872-ec51-54e402b6b0f9','Sharjah','Sharjah','Sharjah City Municipality','https://portal.shjmun.gov.ae/en/AboutSharjahMunicipality/Pages/About-Sharjah.aspx'),
  ('al-ain','df9fa6b0-51ec-4966-64e0-f3c3a20422fd','Al Ain','Abu Dhabi','Al Ain City Municipality / Department of Municipalities and Transport','https://www.dmt.gov.ae/en/aam/About-Al-Ain-Municipality/About-Us'),
  ('dubai','c88fd374-09e4-0c70-9411-ba3e365e07ea','Dubai','Dubai','Dubai Municipality','https://www.dm.gov.ae/about-dubai-municipality/about-dubai-municipality/');

do $$
declare bad integer;
begin
  select count(*) into bad
  from tmp_ae_city_scope s
  left join core.geographies g on g.id=s.expected_id and g.country_code='AE' and g.slug=s.slug
  where g.id is null;
  if bad<>0 then raise exception 'AE Phase 2 blocked: selected City UUID/slug contract changed for % rows',bad; end if;
end $$;

update core.geographies g
set geography_type='city',
    code=null,
    region_code=null,
    scope_kind='city',
    name=s.city_name,
    status='active',
    metadata=coalesce(g.metadata,'{}'::jsonb)||jsonb_build_object(
      'ae_city_normalization_v1',true,
      'publication_tier','A',
      'publication_status','approved_not_indexed',
      'study_destination_scope','official_city_locality',
      'population_geography_contract','city_scope_only_no_emirate_substitution',
      'containing_emirate',s.emirate_name,
      'geography_authority_name',s.authority_name,
      'geography_authority_url',s.authority_url,
      'city_identifier_status','no_verified_federal_city_code',
      'campus_membership_contract','phase_3_explicit_location_evidence_required',
      'programme_coverage_status','verification_pending',
      'normalization_batch','ae_city_geography_v1'
    ),
    updated_at=now()
from tmp_ae_city_scope s
where g.id=s.expected_id;

with aliases as (
  select s.expected_id geography_id,'AE'::text country_code,s.city_name alias,lower(s.city_name) alias_normalized,
         'canonical_name'::text alias_type,'AE_CITY_OFFICIAL_LOCALITY'::text source_system,s.authority_url source_url
  from tmp_ae_city_scope s
  union all
  select s.expected_id,'AE',s.slug,s.slug,'slug','CAMPCareer_CITY_ROUTE',s.authority_url
  from tmp_ae_city_scope s
)
insert into core.geography_aliases(id,geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select md5('ae_city_alias_v1:'||a.geography_id||':'||a.alias_type||':'||a.alias_normalized)::uuid,
       a.geography_id,a.country_code,a.alias,a.alias_normalized,null,a.alias_type,a.source_system,a.source_url
from aliases a
where not exists (
  select 1 from core.geography_aliases x
  where x.geography_id=a.geography_id and x.alias_normalized=a.alias_normalized and x.alias_type=a.alias_type
);

do $$
declare city_n integer; alias_n integer; bad integer; deferred integer;
begin
  select count(*) into city_n from core.geographies
  where country_code='AE' and metadata->>'publication_tier'='A' and metadata->>'normalization_batch'='ae_city_geography_v1';
  if city_n<>4 then raise exception 'AE Phase 2 expected exactly 4 Tier A Cities, found %',city_n; end if;

  select count(*) into bad from tmp_ae_city_scope s
  join core.geographies g on g.id=s.expected_id
  where g.slug<>s.slug or g.name<>s.city_name or g.scope_kind<>'city' or g.code is not null
     or g.metadata->>'containing_emirate'<>s.emirate_name
     or g.metadata->>'population_geography_contract'<>'city_scope_only_no_emirate_substitution';
  if bad<>0 then raise exception 'AE Phase 2 City normalization contract failed for % rows',bad; end if;

  select count(*) into alias_n from core.geography_aliases a
  join tmp_ae_city_scope s on s.expected_id=a.geography_id
  where a.alias_type in ('canonical_name','slug') and a.source_system in ('AE_CITY_OFFICIAL_LOCALITY','CAMPCareer_CITY_ROUTE');
  if alias_n<8 then raise exception 'AE Phase 2 expected at least 8 selected City aliases, found %',alias_n; end if;

  select count(*) into deferred from core.geographies
  where country_code='AE' and slug in ('khor-fakkan','ajman','fujairah','ras-al-khaimah','umm-al-quwain')
    and metadata->>'publication_tier'='A';
  if deferred<>0 then raise exception 'AE Phase 2 deferred City was promoted'; end if;
end $$;