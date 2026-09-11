-- Canada Programs Phase 2/3: restore the current Dalhousie professional M.Arch and verify its open 2027 international application window.
-- Evidence checked 2026-08-09 against Dalhousie official MArch program and application portal.

insert into public.program_catalog_ca_staging (
  source_name,source_program_key,institution_name,institution_id,title,credential_type,education_level,
  field_name,language,province,city,duration_years,tuition_fee_cad,program_code,official_program_url,
  source_url,source_as_of,source_status,collected_at
)
select
  'Dalhousie Graduate Programs 2026',
  md5('Dalhousie Graduate Programs 2026|Architecture|MArch'),
  'Dalhousie University','dalhousie-university','Architecture','MArch','Master',
  'Architecture','English','NS','Halifax',null,null,null,
  'https://www.dal.ca/study/programs/graduate-professional/architecture-march.html',
  'https://apply.dal.ca/portal/program-explorer?cmd=details_page&program=MARCH',
  '2026-08-09','official_program_and_application_portal_verified_2027_summer_open',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='Dalhousie University' and title='Architecture' and credential_type='MArch'
);

insert into public.program_pgwp_ca_staging (
  program_catalog_id,institution_id,source_program_key,credential_type,education_level,matched_dli_number,matched_campus,
  institution_offers_pgwp_eligible_programs,international_students_eligible,pgwp_rule_category,field_of_study_required,
  cip_code,field_of_study_eligible,ircc_program_eligible,pgwp_program_status,ircc_detail_url,source_url,source_as_of,
  verified_at,collected_at,international_program_admission_status,rule_notes
)
select c.id,c.institution_id,c.source_program_key,c.credential_type,c.education_level,'O19209939282',null,
       true,true,'degree_no_field_of_study_requirement',false,null,null,true,
       'degree_field_exempt_structurally_eligible_general_applicant_checks_apply',null,
       'https://apply.dal.ca/portal/program-explorer?cmd=details_page&program=MARCH',
       '2026-08-09',now(),now(),
       'summer_2027_international_application_open_deadline_2026_12_01',
       'Dalhousie official application portal reviewed 2026-08-09: Architecture MArch has a 2027 Summer intake showing Apply Now, with an international applicant deadline of December 1, 2026. The program page describes the MArch as preparation for professional architecture practice. Degree-level PGWP structural eligibility is retained subject to general IRCC applicant requirements.'
from public.program_catalog_ca_staging c
where c.institution_name='Dalhousie University'
  and c.title='Architecture' and c.credential_type='MArch'
on conflict (program_catalog_id) do update set
  international_students_eligible=excluded.international_students_eligible,
  pgwp_rule_category=excluded.pgwp_rule_category,
  field_of_study_required=excluded.field_of_study_required,
  ircc_program_eligible=excluded.ircc_program_eligible,
  pgwp_program_status=excluded.pgwp_program_status,
  source_url=excluded.source_url,
  source_as_of=excluded.source_as_of,
  verified_at=excluded.verified_at,
  international_program_admission_status=excluded.international_program_admission_status,
  rule_notes=excluded.rule_notes;

insert into public.program_occupation_ca_staging (
  program_catalog_id,canonical_career_id,rule_version,match_basis,match_pattern,
  review_status,relation_type,source_checked_at,reviewer_note,matched_at,reviewed_at
)
select c.id,'architect','ca-phase3-dalhousie-2026-08-09','manual','dalhousie_current_professional_march',
       'approved','direct','2026-08-09',
       'Dalhousie MArch is the current professional architecture graduate degree; the official 2027 Summer application portal is open to international applicants through December 1, 2026.',now(),now()
from public.program_catalog_ca_staging c
where c.institution_name='Dalhousie University'
  and c.title='Architecture' and c.credential_type='MArch'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='direct',source_checked_at='2026-08-09',reviewer_note=excluded.reviewer_note,reviewed_at=now();

update public.program_catalog_ca_staging
set source_status='legacy_parent_shadow_current_professional_march',source_as_of='2026-08-09'
where institution_name='Dalhousie University'
  and title='Architecture'
  and credential_type='Graduate program of study (credential varies by program)';

update public.program_occupation_ca_staging o
set review_status='rejected',relation_type=null,source_checked_at='2026-08-09',reviewed_at=now(),
    reviewer_note='Rejected generalized graduate Architecture aggregate after restoring the explicit current Dalhousie professional MArch row.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Dalhousie University'
  and c.title='Architecture'
  and c.credential_type='Graduate program of study (credential varies by program)'
  and o.canonical_career_id='architect';;
