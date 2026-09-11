-- UAE Cities Phase 3 read models: service-role-only City institution/programme directories.

create or replace view public.city_institution_directory_ae_v1 with (security_invoker=true) as
select g.id city_id,g.slug city_slug,g.name city_name,g.metadata->>'containing_emirate' emirate_name,
       g.metadata->>'study_destination_scope' study_destination_scope,
       i.id institution_id,i.canonical_name institution_name,i.slug institution_slug,i.website_url,
       ident.identifier_system authority_identifier_system,ident.identifier_value authority_identifier,ident.source_url authority_source_url,
       'source_type_specific_name_identity'::text identifier_maturity,
       c.id campus_id,c.name campus_name,c.address_line,c.postal_code,
       coalesce(c.source_url,c.official_url,i.website_url) location_source_url,
       c.metadata->>'record_scope' record_scope,c.metadata->>'location_quality' location_quality,
       coalesce((c.metadata->>'programme_assignment_verified')::boolean,false) programme_assignment_verified
from core.geographies g
join catalog.campuses c on c.geography_id=g.id and c.status='active'
join catalog.institutions i on i.id=c.institution_id and i.country_code='AE' and i.status='active'
join lateral (
  select ii.identifier_system,ii.identifier_value,ii.source_url
  from catalog.institution_identifiers ii
  where ii.institution_id=i.id and ii.identifier_system in ('AE_CAA_ACTIVE_HEI_NAME','AE_CAA_PROGRAM_PROVIDER_NAME','AE_MOE_TVET_PROGRAM_PROVIDER_NAME','AE_GCAA_TRAINING_PROVIDER_NAME')
  order by case ii.identifier_system when 'AE_CAA_ACTIVE_HEI_NAME' then 1 when 'AE_CAA_PROGRAM_PROVIDER_NAME' then 2 when 'AE_MOE_TVET_PROGRAM_PROVIDER_NAME' then 3 else 4 end
  limit 1
) ident on true
where g.country_code='AE' and g.metadata->>'publication_tier'='A'
  and g.metadata->>'normalization_batch'='ae_city_geography_v1'
  and c.metadata->>'normalization_batch'='ae_city_linkage_v1'
  and c.metadata->>'location_quality'='verified_official_institution_city';

create or replace view public.city_programme_directory_ae_v1 with (security_invoker=true) as
select g.id city_id,g.slug city_slug,g.name city_name,g.metadata->>'containing_emirate' emirate_name,
       i.id institution_id,i.canonical_name institution_name,i.slug institution_slug,
       c.id campus_id,c.name campus_name,pr.id programme_id,pr.canonical_title programme_title,pr.programme_type,pr.field_name,
       s.programme_level source_degree_level,po.id offering_id,po.market,po.delivery_mode,po.enrolment_status,
       coalesce(s.official_program_url,po.source_url,s.source_url) official_program_url,
       s.source_program_key,s.verification_tier,s.collection_status,
       pa.authority_url accreditation_source_url,pa.review_status accreditation_review_status,
       po.verification_status international_evidence_status
from catalog.programme_offerings po
join public.program_catalog_ae_staging s on po.source_system='AE_PROGRAM_STAGING' and po.source_record_key=s.source_program_key
join catalog.programmes pr on pr.id=po.programme_id and pr.status='active' and pr.institution_id=s.institution_id
join catalog.programme_accreditations pa on pa.programme_id=pr.id and pa.review_status='verified' and pa.status='approved'
join catalog.institutions i on i.id=pr.institution_id and i.country_code='AE' and i.status='active'
join catalog.campuses c on c.id=po.campus_id and c.institution_id=i.id and c.status='active'
join core.geographies g on g.id=c.geography_id and g.country_code='AE' and g.metadata->>'publication_tier'='A'
where s.accreditation_status='active'
  and s.verification_tier in ('A','B')
  and lower(trim(s.city))=lower(trim(g.name))
  and c.metadata->>'normalization_batch'='ae_city_linkage_v1'
  and coalesce((c.metadata->>'programme_assignment_verified')::boolean,false) is true;

create or replace view public.city_directory_ae_v1 with (security_invoker=true) as
select g.id city_id,g.slug,g.name,g.metadata->>'containing_emirate' emirate_name,
       g.metadata->>'study_destination_scope' study_destination_scope,
       g.metadata->>'city_identifier_status' city_identifier_status,
       count(distinct ci.campus_id)::integer linked_campus_count,
       count(distinct ci.institution_id)::integer linked_institution_count,
       count(distinct cp.programme_id)::integer linked_program_count,
       'verified_program_provider_partial_hei_coverage'::text institution_coverage_status,
       'source_type_specific_name_identity'::text institution_identifier_maturity,
       'verified_partial'::text programme_coverage_status
from core.geographies g
left join public.city_institution_directory_ae_v1 ci on ci.city_id=g.id
left join public.city_programme_directory_ae_v1 cp on cp.city_id=g.id
where g.country_code='AE' and g.metadata->>'publication_tier'='A' and g.metadata->>'normalization_batch'='ae_city_geography_v1'
group by g.id,g.slug,g.name,g.metadata;

revoke all on public.city_institution_directory_ae_v1 from public,anon,authenticated;
revoke all on public.city_programme_directory_ae_v1 from public,anon,authenticated;
revoke all on public.city_directory_ae_v1 from public,anon,authenticated;
grant select on public.city_institution_directory_ae_v1 to service_role;
grant select on public.city_programme_directory_ae_v1 to service_role;
grant select on public.city_directory_ae_v1 to service_role;

do $$
declare location_n integer; programme_n integer; city_n integer; mismatch_n integer; deferred_n integer; bad_city integer;
begin
  select count(*) into location_n from public.city_institution_directory_ae_v1;
  if location_n<>11 then raise exception 'AE Phase 3 institution directory expected 11 verified locations, found %',location_n; end if;

  select count(*) into programme_n from public.city_programme_directory_ae_v1;
  if programme_n<>98 then raise exception 'AE Phase 3 programme directory expected 98 rows, found %',programme_n; end if;

  select count(*) into city_n from public.city_directory_ae_v1;
  if city_n<>4 then raise exception 'AE Phase 3 city directory expected 4 rows, found %',city_n; end if;

  select count(*) into bad_city from public.city_directory_ae_v1 where linked_campus_count<1 or linked_institution_count<1 or linked_program_count<1;
  if bad_city<>0 then raise exception 'Every AE Tier A City must retain positive verified linkage'; end if;

  select count(*) into mismatch_n from public.city_programme_directory_ae_v1 cp
  join public.program_catalog_ae_staging s on s.source_program_key=cp.source_program_key and s.institution_id=cp.institution_id
  where lower(trim(s.city))<>lower(trim(cp.city_name));
  if mismatch_n<>0 then raise exception 'AE programme source-City mismatch detected'; end if;

  select count(*) into deferred_n from public.city_programme_directory_ae_v1
  where city_slug in ('khor-fakkan','ajman','fujairah','ras-al-khaimah','umm-al-quwain');
  if deferred_n<>0 then raise exception 'AE deferred City leaked into programme directory'; end if;

  if (select linked_program_count from public.city_directory_ae_v1 where slug='abu-dhabi')<>39 then raise exception 'AE Abu Dhabi expected 39 verified programme links'; end if;
  if (select linked_program_count from public.city_directory_ae_v1 where slug='sharjah')<>26 then raise exception 'AE Sharjah expected 26 verified programme links'; end if;
  if (select linked_program_count from public.city_directory_ae_v1 where slug='al-ain')<>18 then raise exception 'AE Al Ain expected 18 verified programme links'; end if;
  if (select linked_program_count from public.city_directory_ae_v1 where slug='dubai')<>15 then raise exception 'AE Dubai expected 15 verified programme links'; end if;
end $$;