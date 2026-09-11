-- Canada Programs Phase 3: resolve CNC Nursing Baccalaureate admission-unverified state from current partner-program evidence.
-- Evidence checked 2026-08-09. The Northern Collaborative Baccalaureate Nursing Program (NCBNP) is a joint UNBC/CNC/CMTN program.
-- UNBC's current undergraduate application-deadline table explicitly lists the September 2027 NCBNP international intake as "No intake".
-- CNC's program page still shows a generic "Applications still open" state, so the partner program's explicit international intake table governs publication readiness.
-- Preserve international_students_eligible=true as a durable/non-permanent field; this migration records the current-cycle admission hold only.

update public.program_catalog_ca_staging
set source_as_of = date '2026-08-09',
    source_status = 'official_partner_admission_deadline_verified_fall_2027_international_no_intake'
where institution_name = 'College of New Caledonia'
  and title = 'Nursing Baccalaureate'
  and credential_type = 'Bachelor Degree';

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'fall_2027_international_no_intake_unbc_partner_program',
    source_url = 'https://www.unbc.ca/programs-and-admissions/undergraduate/undergraduate-application-deadlines',
    source_as_of = date '2026-08-09',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes, ''), 'CNC Nursing Baccalaureate reviewed 2026-08-09: the joint UNBC/CNC Northern Collaborative Baccalaureate Nursing Program is current, but UNBC current undergraduate application deadlines explicitly list September 2027 International as No intake. CNC generic Applications still open is not treated as international seat availability. Keep the occupation relationship approved and hold publication for the current international cycle; re-check a future cycle rather than asserting permanent international ineligibility.')
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'College of New Caledonia'
  and c.title = 'Nursing Baccalaureate'
  and c.credential_type = 'Bachelor Degree';;
