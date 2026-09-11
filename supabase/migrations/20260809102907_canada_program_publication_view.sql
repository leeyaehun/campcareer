create or replace view public.ca_program_publication_v1
with (security_invoker = true)
as
with approved_targets as (
  select
    o.program_catalog_id,
    array_agg(distinct o.canonical_career_id order by o.canonical_career_id) as career_ids,
    array_agg(distinct o.relation_type order by o.relation_type) filter (where o.relation_type is not null) as relation_types
  from public.program_occupation_ca_staging o
  where o.review_status = 'approved'
  group by o.program_catalog_id
), program_state as (
  select
    c.id as program_catalog_id,
    c.source_name,
    c.source_program_key,
    c.institution_id as institution_key,
    c.institution_name,
    i.slug as institution_slug,
    i.website_url as institution_website_url,
    c.title,
    c.credential_type,
    c.education_level,
    c.field_name,
    c.language,
    c.province,
    c.city,
    c.duration_years,
    c.tuition_fee_cad,
    c.program_code,
    c.official_program_url,
    c.source_url,
    c.source_as_of,
    c.source_status,
    c.collected_at,
    p.matched_dli_number,
    p.international_students_eligible,
    p.international_program_admission_status,
    p.ircc_program_eligible,
    p.pgwp_program_status,
    p.cip_code,
    p.ircc_detail_url,
    p.verified_at,
    a.career_ids,
    coalesce(a.relation_types, array[]::text[]) as relation_types,
    case
      when nullif(btrim(c.title), '') is null then 'missing_title'
      when nullif(btrim(c.institution_id), '') is null then 'missing_institution'
      when nullif(btrim(c.source_url), '') is null then 'missing_source'
      when c.source_as_of is null and c.collected_at is null then 'missing_source_date'
      when nullif(btrim(p.matched_dli_number), '') is null then 'missing_dli'
      when p.international_students_eligible is not true then 'international_ineligible'
      when lower(coalesce(c.source_status, '')) like '%excluded_%' then 'excluded_non_core'
      when lower(coalesce(c.source_status, '')) like '%suspended%' then 'suspended'
      when lower(coalesce(c.source_status, '')) like '%not_accepting%' then 'not_accepting'
      when lower(coalesce(c.source_status, '')) like '%pending_review%' then 'pending_review'
      when lower(coalesce(c.source_status, '')) like '%cancelled%' then 'cancelled'
      when lower(coalesce(c.source_status, '')) like '%legacy_%' then 'legacy'
      when lower(coalesce(c.source_status, '')) like '%one_time_delivery_closed%' then 'closed_delivery'
      when lower(coalesce(c.source_status, '')) like '%parent_program_multiple_credentials%' then 'ambiguous_parent'
      when lower(coalesce(p.international_program_admission_status, '')) like '%not_assessed_non_core%' then 'admission_non_core'
      when lower(coalesce(p.international_program_admission_status, '')) like '%phase3_reviewed_unresolved%' then 'admission_evidence_unavailable'
      when nullif(btrim(p.international_program_admission_status), '') is null then 'admission_unverified'
      when lower(coalesce(p.international_program_admission_status, '')) ~ '(not_yet_verified|not verified|should_be_checked|dli_and_study_permit_eligibility_not_verified)'
        or (
          (
            lower(coalesce(p.international_program_admission_status, '')) like '%intake%'
            or lower(coalesce(p.international_program_admission_status, '')) like '%availability%'
          )
          and (
            lower(coalesce(p.international_program_admission_status, '')) like '%check%'
            or lower(coalesce(p.international_program_admission_status, '')) like '%separate%'
          )
        ) then 'admission_unverified'
      when lower(coalesce(p.international_program_admission_status, '')) ~ '(suspended|cancelled|not_accepting|not currently|not_current|unavailable|closed|not_yet_open|not yet open|restricted_not_open|temporarily_paused|not_eligible_for_study_permit|legacy_program)'
        then 'admission_closed_or_restricted'
      else null
    end as hold_reason,
    case
      when p.ircc_program_eligible is true then 'eligible'
      when p.ircc_program_eligible is false then 'ineligible'
      else 'unknown'
    end as pgwp_state
  from public.program_catalog_ca_staging c
  join approved_targets a on a.program_catalog_id = c.id
  join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
  left join public.institution_program_catalog_identity_ca_v1 i
    on i.program_catalog_id = c.institution_id
), classified as (
  select
    ps.*,
    case
      when ps.hold_reason is not null then 'C'
      when nullif(btrim(ps.official_program_url), '') is not null then 'A'
      else 'B'
    end as publication_tier
  from program_state ps
)
select
  classified.*,
  publication_tier = 'A' as indexable_detail,
  publication_tier in ('A', 'B') as publicly_listed
from classified;

revoke all on public.ca_program_publication_v1 from public;
revoke all on public.ca_program_publication_v1 from anon;
revoke all on public.ca_program_publication_v1 from authenticated;
grant select on public.ca_program_publication_v1 to service_role;

comment on view public.ca_program_publication_v1 is
  'Canada Phase 4 programme publication surface scoped to approved target-career relationships; Tier A/B are listable and Tier C remains held.';;
