-- Switzerland Cities Phase 3: verify selected municipality study-location representatives.
-- This is not a complete campus inventory. EPFL is explicitly excluded from Lausanne municipality linkage because its main campus is in Ecublens near Lausanne.
with verified_location(institution_name,city_slug,location_source_url) as (
  values
    ('Eidgenössische Technische Hochschule Zürich ETH','zurich','https://ethz.ch/en/the-eth-zurich/contact-directions.html'),
    ('Universität Zürich UZH','zurich','https://www.uzh.ch/en/explore/organization/campuses.html'),
    ('Université de Lausanne UNIL','lausanne','https://www.unil.ch/central/en/home/menuinst/contact-et-plan.html'),
    ('Universität Basel','basel','https://www.unibas.ch/en/University/Contact-Directions.html'),
    ('Università della Svizzera italiana USI','lugano','https://www.usi.ch/en/university/contact'),
    ('Université de Fribourg Unifr','fribourg','https://www.unifr.ch/home/en/impressum.html'),
    ('Université de Genève UNIGE','geneva','https://www.unige.ch/en/contact/')
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
      'normalization_batch','ch_city_linkage_v1',
      'record_scope','verified_city_study_location_representative',
      'location_quality','verified_official_institution_city',
      'programme_assignment_verified',true,
      'programme_location_evidence','official_institution_city_location_plus_exact_programme_source_city',
      'campus_inventory_complete',false,
      'source_tier','official_institution',
      'institution_identifier_maturity','provisional_accredited_university_name_identity'
    ),
    updated_at=now()
from verified_location v
join catalog.institutions i on i.country_code='CH' and i.canonical_name=v.institution_name and i.status='active'
join catalog.institution_identifiers ii on ii.institution_id=i.id and ii.identifier_system='CH_ACCREDITED_UNIVERSITY_NAME'
join core.geographies g on g.country_code='CH' and g.slug=v.city_slug and g.metadata->>'publication_tier'='A'
where c.institution_id=i.id and c.status='active' and lower(trim(c.city))=lower(trim(g.name)) and c.geography_id=g.id;

update catalog.campuses c
set metadata=coalesce(c.metadata,'{}'::jsonb) || jsonb_build_object(
      'programme_assignment_verified',false,
      'campus_inventory_complete',false,
      'city_publication_excluded',true,
      'city_publication_exclusion_reason','EPFL main campus is in Ecublens near Lausanne; a Lausanne destination label is not municipality-delivery evidence',
      'city_publication_exclusion_source','https://www.epfl.ch/labs/rrl/contact/'
    ),
    updated_at=now()
from catalog.institutions i
where c.institution_id=i.id and i.country_code='CH' and i.canonical_name='Ecole polytechnique fédérale de Lausanne EPFL' and c.status='active';

do $$
declare n integer; bad integer; epfl_bad integer;
begin
  select count(*) into n from catalog.campuses c join catalog.institutions i on i.id=c.institution_id
  where i.country_code='CH' and c.status='active' and c.metadata->>'normalization_batch'='ch_city_linkage_v1';
  if n<>7 then raise exception 'CH verified Tier A study locations expected 7, found %',n; end if;

  select count(*) into bad from catalog.campuses c join catalog.institutions i on i.id=c.institution_id join core.geographies g on g.id=c.geography_id
  where i.country_code='CH' and c.metadata->>'normalization_batch'='ch_city_linkage_v1'
    and (g.metadata->>'publication_tier'<>'A' or coalesce((c.metadata->>'programme_assignment_verified')::boolean,false) is not true
      or coalesce((c.metadata->>'campus_inventory_complete')::boolean,true) is not false);
  if bad<>0 then raise exception 'CH verified study-location metadata contract failed'; end if;

  select count(*) into epfl_bad from catalog.campuses c join catalog.institutions i on i.id=c.institution_id
  where i.country_code='CH' and i.canonical_name='Ecole polytechnique fédérale de Lausanne EPFL'
    and coalesce((c.metadata->>'programme_assignment_verified')::boolean,false) is true;
  if epfl_bad<>0 then raise exception 'EPFL must not be assigned to Lausanne municipality without municipality-specific evidence'; end if;
end $$;;
