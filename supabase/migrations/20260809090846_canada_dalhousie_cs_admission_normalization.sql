-- Canada Programs Phase 3: normalize current Dalhousie Computer Science undergraduate and MCSc admission states.
-- Evidence checked 2026-08-09 against current Dalhousie program, admissions calendar and Faculty of Computer Science pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='january_2027_international_application_open_deadline_2026_11_15',
    source_url='https://www.dal.ca/study/programs/undergraduate/computer-science-bcs.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Dalhousie BCS reviewed 2026-08-09: the current program page lists September and January starts and provides Apply Now. Dalhousie admission regulations allow January admission to BCSc/Computer Science pathways with a November 15 application deadline. International applicants are supported under the university international admission requirements. January 2027 is therefore treated as currently open, subject to program capacity.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Dalhousie University'
  and c.title='Computer Science (BCS)'
  and c.credential_type='Bachelor of Computer Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='january_2027_international_deadline_closed_2026_08_01_next_september_2027_cycle_opening_not_published',
    source_url='https://www.dal.ca/study/programs/graduate-professional/computer-science-mcsc.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Dalhousie MCSc reviewed 2026-08-09: the official program page lists an August 1 deadline for international applicants seeking January admission; that deadline has passed. September international applications use an April 1 deadline, but the current MCSc page does not publish the next Fall 2027 opening date, so current publication remains held rather than inferred open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Dalhousie University'
  and c.title='Computer Science (MCSc)'
  and c.credential_type='Master of Computer Science';;
