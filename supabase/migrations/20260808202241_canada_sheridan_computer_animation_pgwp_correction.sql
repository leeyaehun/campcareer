-- Correct Sheridan Computer Animation PGWP state.
-- The official program page verifies current international availability, but no explicit PGWP-aligned marker was verified on 2026-08-08.
-- Do not infer PGWP eligibility from title, credential, or institution-level eligibility.

update public.program_pgwp_ca_staging p
set ircc_program_eligible = null,
    pgwp_program_status = 'field_of_study_required_exact_cip_not_verified_no_inference',
    source_url = 'https://www.sheridancollege.ca/programs/computer-animation',
    source_as_of = date '2026-08-08',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'Correction 2026-08-08: the official Computer Animation page verifies international availability but an explicit PGWP-aligned marker was not verified; PGWP eligibility is therefore unknown and is not inferred.')
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'Sheridan College'
  and c.program_code = 'PCANM'
  and c.title = 'Computer Animation';;
