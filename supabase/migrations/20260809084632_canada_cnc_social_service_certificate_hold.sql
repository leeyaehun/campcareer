-- Canada Programs Phase 3: replace admission-unverified with an explicit current no-offering hold for the CNC Social Service Worker Certificate.
-- Evidence checked 2026-08-09 against the current CNC program page.

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='not_accepting_current_no_program_offerings_scheduled'
where institution_name='College of New Caledonia'
  and title='Social Service Worker Certificate'
  and credential_type='Certificate';

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_not_accepting_no_program_offerings_scheduled',
    source_url='https://cnc.bc.ca/programs-courses/programs/detail/social-service-worker-certificate',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' CNC Social Service Worker Certificate reviewed 2026-08-09: the current official program page states there are no offerings of this program scheduled at this time and advises applicants to check back later. Occupation relevance is retained separately from current publishability.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='College of New Caledonia'
  and c.title='Social Service Worker Certificate'
  and c.credential_type='Certificate';;
