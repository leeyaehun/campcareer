-- Canada Programs Phase 3: normalize SFU Early Learning and Special Education PBD Spring 2027 entry pathway.
-- Evidence checked 2026-08-09 against current SFU degree-holder admission dates and 2026 Fall Education calendar.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='spring_2027_degree_holder_university_application_open_deadline_2026_09_15_post_baccalaureate_program_declaration_after_admission',
    source_url='https://www.sfu.ca/students/admission/apply/dates-deadlines/transfer/spring-term.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || case
      when c.title='Early Learning' then ' SFU Early Learning PBD reviewed 2026-08-09: the diploma is current in the Fall 2026 Faculty of Education calendar. Applicants who already hold a bachelor degree use SFU degree-holder undergraduate admission, which is currently open for Spring 2027 from July 1 to September 15, 2026. PBD program approval/declaration follows university admission, so this is recorded as an open degree-holder entry pathway rather than guaranteed automatic diploma declaration.'
      else ' SFU Special Education PBD reviewed 2026-08-09: the diploma is current in the Fall 2026 Faculty of Education calendar and serves educators/health professionals working with persons with disabilities. Applicants who hold a bachelor degree use SFU degree-holder undergraduate admission, which is currently open for Spring 2027 from July 1 to September 15, 2026. PBD program approval/declaration follows university admission, so this is recorded as an open degree-holder entry pathway rather than guaranteed automatic diploma declaration.' end
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and c.title in ('Early Learning','Special Education')
  and c.credential_type='Post Baccalaureate Diploma';;
