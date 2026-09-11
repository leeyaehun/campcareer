-- Canada Programs Phase 3: normalize the U of T MScPhm paused-admission state to the readiness-audit closed/not-accepting vocabulary.
-- Semantic no-op: admissions remain paused; this prevents an official-URL row from being misclassified as Tier A.

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_not_accepting_admissions_paused_no_confirmed_reopening_timeline',
    verified_at=now()
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Toronto'
  and c.title='Pharmacy'
  and c.credential_type='MScPhm'
  and p.international_program_admission_status='current_admissions_paused_no_confirmed_reopening_timeline';;
