-- Preserve the higher-priority missing-DLI hold for the SkilledTradesBC
-- Tilesetter apprenticeship row. The Phase 3 target freeze must only convert
-- admission-unverified rows, not rows already blocked before admission review.

update public.program_pgwp_ca_staging p
set
  international_program_admission_status = 'dli_and_study_permit_eligibility_not_verified',
  rule_notes = regexp_replace(
    coalesce(p.rule_notes, ''),
    ' \\| phase3_target_freeze_2026-08-09_previous_admission_status=dli_and_study_permit_eligibility_not_verified$',
    ''
  )
from public.program_catalog_ca_staging c
where c.id = p.program_catalog_id
  and c.source_name = 'SkilledTradesBC'
  and c.source_program_key = 'tilesetter-apprenticeship-ttta-surrey'
  and p.international_program_admission_status = 'phase3_reviewed_unresolved_current_international_admission_not_publicly_established';
;
