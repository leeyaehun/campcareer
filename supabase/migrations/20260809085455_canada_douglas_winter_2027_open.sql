-- Canada Programs Phase 3: verify current Douglas College Winter 2027 international availability for selected open-enrolment programs.
-- Evidence checked 2026-08-09 against current Douglas program pages, international-program list and international application deadlines.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_application_open_deadline_2026_09_30',
    source_url='https://www.douglascollege.ca/admissions/when-apply/international-students-application-dates-and-deadlines',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Douglas College reviewed 2026-08-09: Winter January 2027 international applications are currently Accepting applications with a September 30, 2026 deadline. The selected Accounting credentials are listed as international-student programs with Winter starts and their program pages direct international applicants to the international application window.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Douglas College'
  and c.title in ('Accounting (Bachelor of Business Administration)','Accounting (Post-Baccalaureate Diploma)','Accounting (Post-Degree Diploma)');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_application_open_deadline_2026_09_30',
    source_url='https://www.douglascollege.ca/admissions/when-apply/international-students-application-dates-and-deadlines',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Douglas Future Professional Pilots reviewed 2026-08-09: the program is explicitly listed in Douglas international-student programs with Fall/Winter/Summer starts; the program page shows Winter 2027 Apply Now and the international application page shows Winter 2027 Accepting applications through September 30, 2026. PGWP state remains provider-recorded separately from publication eligibility.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Douglas College'
  and c.title='Future Professional Pilots'
  and c.credential_type='Associate Degree';;
