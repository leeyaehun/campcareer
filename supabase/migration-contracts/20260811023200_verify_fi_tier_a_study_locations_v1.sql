-- Finland Cities Phase 3 data step: verify the existing university-core city-location representatives.
-- Production was applied as controlled, individually constrained updates after the bulk migration safety gateway rejected the combined operation.
-- This deterministic migration is the replay contract; it resolves rows by canonical institution identity and Tier A municipality rather than generated UUIDs.
with verified_location(institution_name,city_slug,location_source_url) as (
  values
    ('Aalto University','espoo','https://www.aalto.fi/en/aalto-university/campus-and-premises'),
    ('University of Helsinki','helsinki','https://www.helsinki.fi/en/about-us/university-helsinki/campuses'),
    ('Hanken School of Economics','helsinki','https://www.hanken.fi/en/about-hanken/contact-information'),
    ('Tampere University','tampere','https://www.tuni.fi/en/about-us/campuses'),
    ('University of Turku','turku','https://www.utu.fi/en/university/campuses'),
    ('Åbo Akademi University','turku','https://www.abo.fi/en/about-abo-akademi-university/campuses/'),
    ('University of Oulu','oulu','https://www.oulu.fi/en/university/campuses'),
    ('University of Jyväskylä','jyvaskyla','https://www.jyu.fi/en/about-us/campus'),
    ('LUT University','lappeenranta','https://www.lut.fi/en/about-us/campuses/lappeenranta-campus'),
    ('University of Eastern Finland','joensuu','https://www.uef.fi/en/joensuu-campus')
)
update catalog.campuses c
set name=i.canonical_name || ' — ' || g.name || ' study location',
    city=g.name,
    locality=g.name,
    geography_id=g.id,
    locality_geography_id=g.id,
    source_url=v.location_source_url,
    source_checked_at=now(),
    metadata=coalesce(c.metadata,'{}'::jsonb) || jsonb_build_object(
      'normalization_batch','fi_city_linkage_v1',
      'record_scope','verified_city_study_location_representative',
      'location_quality','verified_official_institution_city',
      'programme_assignment_verified',true,
      'programme_location_evidence','official_programme_source_city_matches_verified_institution_city',
      'campus_inventory_complete',false,
      'source_tier','official_institution',
      'institution_identifier_maturity','provisional_name_identity_studyinfo_oid_pending'
    ),
    updated_at=now()
from verified_location v
join catalog.institutions i on i.country_code='FI' and i.canonical_name=v.institution_name and i.status='active'
join catalog.institution_identifiers ii on ii.institution_id=i.id and ii.identifier_system='FI_EDUFI_TIER_A_NAME'
join core.geographies g on g.country_code='FI' and g.slug=v.city_slug and g.metadata->>'publication_tier'='A'
where c.institution_id=i.id
  and c.status='active'
  and lower(trim(c.city))=lower(trim(g.name))
  and c.geography_id=g.id;

do $$ declare n integer; begin
  select count(*) into n from catalog.campuses c join catalog.institutions i on i.id=c.institution_id
  where i.country_code='FI' and c.status='active' and c.metadata->>'normalization_batch'='fi_city_linkage_v1';
  if n<>10 then raise exception 'FI verified university-core city locations expected 10, found %',n; end if;
end $$;
