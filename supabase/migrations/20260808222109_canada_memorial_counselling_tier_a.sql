-- Canada Programs Phase 3: promote Memorial MEd Counselling Psychology to publication Tier A.
-- Evidence checked 2026-08-08 against the current Faculty of Education program/admission page.

update public.program_catalog_ca_staging
set official_program_url='https://www.mun.ca/educ/programs/graduate-programs/master/counselling-psychology/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_spring_2027_international_application_open'
where institution_name='Memorial University of Newfoundland'
  and title='Counselling Psychology'
  and credential_type='MEd';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='spring_2027_international_application_open_closes_2026_08_15',
    source_url='https://www.mun.ca/educ/programs/graduate-programs/master/counselling-psychology/',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Memorial MEd Counselling Psychology page reviewed 2026-08-08: the Spring 2027 Accelerated Cohort is a full-time on-campus program with an August 15, 2026 application deadline; applicants with international credentials are explicitly supported through the published WES course-by-course evaluation requirement and the page links to the online application. The program prepares professional counselling practitioners and supports CCPA Canadian Certified Counsellor eligibility.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Memorial University of Newfoundland'
  and c.title='Counselling Psychology'
  and c.credential_type='MEd';;
