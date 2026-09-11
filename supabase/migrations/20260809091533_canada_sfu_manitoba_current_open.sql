-- Canada Programs Phase 3: verify current SFU Mechatronics and University of Manitoba Computer Science entry pathways.
-- Evidence checked 2026-08-09 against current SFU Spring 2027 admission pages / calendar and UM Computer Science program page.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='spring_2027_international_application_open_deadline_2026_09_15_mechatronics_admitted_students_may_enter_any_term',
    source_url='https://www.sfu.ca/students/admission/apply/dates-deadlines/high-school/spring-term/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SFU Mechatronic Systems Engineering reviewed 2026-08-09: the current Fall 2026 academic calendar states the program begins each fall but admitted students may enter in any term. SFU undergraduate Spring 2027 applications are currently open July 1 through September 15, 2026 for all applicants, including international applicants. The BASc therefore has a current Spring 2027 entry pathway.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and c.title='Mechatronic Systems Engineering'
  and c.credential_type='Bachelor of Applied Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_faculty_of_science_direct_entry_open_deadline_2026_10_01_computer_science_major_or_honours_declared_after_24_credits',
    source_url='https://umanitoba.ca/explore/programs-of-study/computer-science-bsc',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Manitoba Computer Science reviewed 2026-08-09: applicants enter the Faculty of Science rather than selecting the Computer Science Major/Honours at initial admission. The official CS program page lists international direct-entry Winter applications opening in early May with an October 1 deadline. Computer Science Major or BCSc Honours is declared after at least 24 credit hours and program-specific requirements, so this status represents a current open Faculty of Science pathway rather than guaranteed first-term declaration of the major.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Manitoba'
  and c.title in ('Computer Science - Bachelor of Computer Science (Honours)','Computer Science - Bachelor of Science (Major)')
  and c.credential_type in ('Bachelor of Computer Science','Bachelor of Science');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_closed_deadline_2026_07_01_summer_2027_deadline_2026_11_01_application_open_status_not_yet_verified',
    source_url='https://umanitoba.ca/explore/undergraduate-admissions/requirements/nursing',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Manitoba BN reviewed 2026-08-09: the Winter 2027 international application deadline was July 1, 2026 and has passed. The Summer 2027 international deadline is November 1, 2026, but the program-specific page does not explicitly state the Summer application is currently open, so that future intake is not inferred open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Manitoba'
  and c.title='Nursing'
  and c.credential_type='Bachelor of Nursing';;
