-- Canada Programs Phase 3: verify current Yukon University international application windows and provider PGWP list.
-- Evidence checked 2026-08-09 against YukonU International Application Process, Important Dates and Programs for International Students.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_10_01',
    cip_code='12.0503',
    field_of_study_required=true,
    field_of_study_eligible=false,
    ircc_program_eligible=false,
    pgwp_program_status='yukonu_official_international_program_list_not_pgwp_eligible_cip_12_0503',
    source_url='https://www.yukonu.ca/international/future-students/programs',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' YukonU reviewed 2026-08-09: Culinary Arts is listed for international students with CIP 12.0503 and Fall intake only; it is not marked PGWP eligible on the provider PGWP list. Fall 2026 international applications closed April 1, 2026 and Fall 2027 international applications open October 1, 2026, so the next available intake is not yet open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Yukon University'
  and c.title='Culinary Arts'
  and c.credential_type='Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='spring_2027_international_application_open_deadline_2026_12_01',
    cip_code='19.0709',
    field_of_study_required=true,
    field_of_study_eligible=true,
    ircc_program_eligible=true,
    pgwp_program_status='yukonu_official_international_program_list_pgwp_eligible_cip_19_0709',
    source_url='https://www.yukonu.ca/international/future-students/programs',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' YukonU reviewed 2026-08-09: Early Learning Diploma is on the international-program list with Fall/Spring intakes, PGWP eligible, CIP 19.0709. Spring 2027 international applications opened August 3, 2026 and close December 1, 2026; the current application window is open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Yukon University'
  and c.title='Early Learning'
  and c.credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='spring_2027_international_application_open_deadline_2026_12_01',
    cip_code='03.0103',
    field_of_study_required=true,
    field_of_study_eligible=true,
    ircc_program_eligible=true,
    pgwp_program_status='yukonu_official_international_program_list_pgwp_eligible_cip_03_0103',
    source_url='https://www.yukonu.ca/international/future-students/programs',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' YukonU reviewed 2026-08-09: Northern Outdoor and Environmental Studies Diploma is on the international-program list with Fall/Winter/Spring intakes, PGWP eligible, CIP 03.0103. Spring 2027 international applications opened August 3, 2026 and close December 1, 2026; the current application window is open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Yukon University'
  and c.title='Northern Outdoor and Environmental Studies'
  and c.credential_type='Diploma';;
