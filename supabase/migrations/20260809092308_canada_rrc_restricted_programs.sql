-- Canada Programs Phase 3: replace generic admission-unverified with explicit restrictions for three current RRC programs.
-- Evidence checked 2026-08-09 against current RRC catalogue, Program Explorer and International Education pages.

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_current_program_verified_manitoba_residents_only'
where institution_name='Red River College Polytechnic'
  and title='Medical Laboratory Sciences'
  and credential_type='Advanced Diploma';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='international_ineligible_manitoba_residents_only_refugee_study_permit_exception_requires_manitoba_residency',
    source_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/MELAF-AD/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Medical Laboratory Sciences reviewed 2026-08-09: the current catalogue states this funded high-demand program is open to Manitoba residents only and non-Manitoba applications are cancelled. A narrow exception permits refugee-status applicants who are Manitoba residents and hold a study permit. This is not a general international-student admission route.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Medical Laboratory Sciences'
  and c.credential_type='Advanced Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_current_program_verified_employment_based_workplace_pathway'
where institution_name='Red River College Polytechnic'
  and title='Early Childhood Education - Workplace'
  and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='restricted_not_open_standalone_requires_current_child_care_assistant_employment_in_licensed_manitoba_childcare_program',
    source_url='https://www.rrc.ca/explore/program/early-childhood-education-workplace/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Early Childhood Education Workplace reviewed 2026-08-09: the program is specifically designed for experienced child care assistants working in licensed childcare programs across Manitoba, with students continuing to work three days per week and completing practica at their workplace. It is therefore held as an employment-based pathway rather than a general standalone international entry program.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Early Childhood Education - Workplace'
  and c.credential_type='Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_current_specialization_requires_business_administration_common_term'
where institution_name='Red River College Polytechnic'
  and title='Business Administration - Tourism Management'
  and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='restricted_not_open_standalone_apply_to_business_administration_then_specialize_after_common_first_term',
    source_url='https://www.rrc.ca/explore/program/business-administration-tourism-management/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Business Administration - Tourism Management reviewed 2026-08-09: the current program page states students interested in Tourism Management must apply to and complete the first common term of Business Administration before choosing the specialization. This staging row is held as a non-standalone specialization; current international availability must be represented through the Business Administration entry program.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Business Administration - Tourism Management'
  and c.credential_type='Diploma';;
