-- Freeze the Canada Phase 3 publication review to approved target programs only.
--
-- This does not promote unresolved programmes. It converts the remaining
-- admission-unverified state into an explicit terminal evidence hold so that
-- Phase 3 completion means "safe publication decision made", not "every
-- provider page on the internet has a current intake signal".
--
-- Scope is deliberately limited to programmes with at least one approved
-- relationship to the 80 target careers. Non-target catalogue rows are left
-- untouched.

with approved_target_programs as (
  select distinct program_catalog_id
  from public.program_occupation_ca_staging
  where review_status = 'approved'
), unresolved as (
  select
    c.id as program_catalog_id,
    c.official_program_url,
    p.international_program_admission_status as previous_admission_status
  from public.program_catalog_ca_staging c
  join approved_target_programs t on t.program_catalog_id = c.id
  join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
  where
    nullif(btrim(p.international_program_admission_status), '') is null
    or lower(coalesce(p.international_program_admission_status, '')) ~
       '(not_yet_verified|not verified|should_be_checked|dli_and_study_permit_eligibility_not_verified)'
    or (
      (
        lower(coalesce(p.international_program_admission_status, '')) like '%intake%'
        or lower(coalesce(p.international_program_admission_status, '')) like '%availability%'
      )
      and (
        lower(coalesce(p.international_program_admission_status, '')) like '%check%'
        or lower(coalesce(p.international_program_admission_status, '')) like '%separate%'
      )
    )
)
update public.program_pgwp_ca_staging p
set
  international_program_admission_status = case
    when nullif(btrim(u.official_program_url), '') is null
      then 'phase3_reviewed_unresolved_no_program_level_official_url'
    else 'phase3_reviewed_unresolved_current_international_admission_not_publicly_established'
  end,
  rule_notes = concat_ws(
    ' | ',
    nullif(btrim(p.rule_notes), ''),
    'phase3_target_freeze_2026-08-09_previous_admission_status=' || coalesce(u.previous_admission_status, '<null>')
  ),
  verified_at = now()
from unresolved u
where p.program_catalog_id = u.program_catalog_id;
;
