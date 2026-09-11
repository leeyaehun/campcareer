-- Canada Programs Phase 3: verify Winter 2027 international entry for UNB undergraduate Computer Science programs.
-- Evidence checked 2026-08-09 against UNB International application deadlines and current admissions regulations.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_application_open_guideline_deadline_2026_10_01_limited_enrolment_apply_early',
    source_url='https://www.unb.ca/international/apply/deadlines.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UNB undergraduate Computer Science reviewed 2026-08-09: UNB International states applications are accepted for Fall, Winter and Summer, with a Winter international guideline deadline of October 1. The listed Fall-only exceptions are Education, Kinesiology and Nursing, not Computer Science. UNB also flags Bachelor of Computer Science as enrolment-limited and recommends applying early. Winter 2027 is therefore treated as currently open, subject to available seats.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of New Brunswick'
  and c.title in ('Computer Science - Fredericton','Computer Science - Saint John')
  and c.credential_type in ('Bachelor of Computer Science','Bachelor of Science in Computer Science');;
