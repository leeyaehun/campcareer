-- Canada Programs Phase 3: normalize admission state for pre-existing UBC Computer Science rows with official URLs.
-- Evidence checked 2026-08-09 against current UBC undergraduate dates/deadlines and Computer Science graduate admissions pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_application_cycle_not_yet_open_opens_early_october_2026',
    source_url='https://you.ubc.ca/applying-ubc/dates-deadlines/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC undergraduate dates reviewed 2026-08-09: the online application for Winter Session September 2027-April 2028 opens in early October 2026 and is due January 15, 2027. These existing Computer Science BA/BSc rows remain held until that cycle opens.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title in ('Computer Science (BA) - Okanagan','Computer Science (BA) - Vancouver','Computer Science (BSc) - Okanagan','Computer Science (BSc) - Vancouver');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='current_2026_27_bcs_second_degree_application_closed_next_cycle_not_yet_verified',
    source_url='https://www.cs.ubc.ca/bcs/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC Integrated Computer Science BCS reviewed 2026-08-09: the official BCS application site states admissions for the 2026/27 academic year are closed. The next cycle opening has not yet been published, so current publication remains held.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title='Integrated Computer Science'
  and c.credential_type='Bachelor of Computer Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_msc_application_not_yet_open_opens_late_september_2026_deadline_december_15',
    source_url='https://www.cs.ubc.ca/students/grad/admissions/application-components-required-documents/online-application',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC Computer Science MSc reviewed 2026-08-09: the department states the online MSc/PhD application is available between late September and December 15. The UBC Graduate School page currently says upcoming intake deadlines have not yet been configured, so the next cycle is treated as not yet open rather than inferred open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title='Master of Science in Computer Science'
  and c.credential_type='Master of Science';;
