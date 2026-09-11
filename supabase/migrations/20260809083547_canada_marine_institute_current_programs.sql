-- Canada Programs Phase 2/3: restore current Marine Institute Nautical Science and Marine Engineering programs.
-- Evidence checked 2026-08-09 against current Marine Institute program, international-admissions and fee pages.
-- Current public pages establish international eligibility and annual international deadlines, but the login-gated portal
-- does not expose the selected Fall 2027 term publicly; publication therefore remains held until cycle selection is verified.

insert into public.program_catalog_ca_staging (
  source_name,source_program_key,institution_name,institution_id,title,credential_type,education_level,
  field_name,language,province,city,duration_years,tuition_fee_cad,program_code,official_program_url,
  source_url,source_as_of,source_status,collected_at
)
select
  'Marine Institute Current Programs 2026-27',
  md5('Marine Institute Current Programs 2026-27|Nautical Science|Diploma of Technology'),
  'Memorial University of Newfoundland','memorial-university-of-newfoundland','Nautical Science','Diploma of Technology','Diploma',
  'Nautical Science','English','NL','St. John''s',4,null,null,
  'https://www.mi.mun.ca/Programs/NauticalScience/',
  'https://www.mi.mun.ca/Programs/NauticalScience/',
  '2026-08-09','official_marine_institute_program_verified_international_supported_cycle_term_not_yet_verified',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='Memorial University of Newfoundland' and title='Nautical Science' and credential_type='Diploma of Technology'
);

insert into public.program_catalog_ca_staging (
  source_name,source_program_key,institution_name,institution_id,title,credential_type,education_level,
  field_name,language,province,city,duration_years,tuition_fee_cad,program_code,official_program_url,
  source_url,source_as_of,source_status,collected_at
)
select
  'Marine Institute Current Programs 2026-27',
  md5('Marine Institute Current Programs 2026-27|Marine Engineering|Diploma of Technology'),
  'Memorial University of Newfoundland','memorial-university-of-newfoundland','Marine Engineering','Diploma of Technology','Diploma',
  'Marine Engineering','English','NL','St. John''s',4,null,null,
  'https://www.mi.mun.ca/programs/marineengineering/',
  'https://www.mi.mun.ca/programs/marineengineering/',
  '2026-08-09','official_marine_institute_program_verified_international_supported_cycle_term_not_yet_verified',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='Memorial University of Newfoundland' and title='Marine Engineering' and credential_type='Diploma of Technology'
);

insert into public.program_pgwp_ca_staging (
  program_catalog_id,institution_id,source_program_key,credential_type,education_level,matched_dli_number,matched_campus,
  institution_offers_pgwp_eligible_programs,international_students_eligible,pgwp_rule_category,field_of_study_required,
  cip_code,field_of_study_eligible,ircc_program_eligible,pgwp_program_status,ircc_detail_url,source_url,source_as_of,
  verified_at,collected_at,international_program_admission_status,rule_notes
)
select c.id,c.institution_id,c.source_program_key,c.credential_type,c.education_level,'O19440995346','Marine Institute - St. John''s',
       true,true,'non_degree_field_of_study_required',true,null,null,null,
       'field_of_study_required_exact_cip_not_verified_no_inference',null,c.official_program_url,'2026-08-09',now(),now(),
       'international_supported_annual_march_1_deadline_fall_2027_portal_term_not_yet_verified',
       case when c.title='Nautical Science'
         then 'Marine Institute reviewed 2026-08-09: Nautical Science is a four-year Diploma of Technology preparing ships officers. International applicants are explicitly supported, with an annual March 1 international deadline and published 2026/27 international tuition. Transport Canada certification itself is restricted to Canadian citizens/permanent residents, so international graduates must pursue certification in their own country. The Fall 2027 term choice is not publicly visible before portal login, so current-cycle publication remains held. Exact CIP/PGWP field-of-study eligibility is not inferred.'
         else 'Marine Institute reviewed 2026-08-09: Marine Engineering is a four-year Diploma of Technology preparing marine engineering officers. International applicants are explicitly supported, with an annual March 1 international deadline and published 2026/27 international tuition. Transport Canada certification itself is restricted to Canadian citizens/permanent residents, so international graduates must pursue certification in their own country. The Fall 2027 term choice is not publicly visible before portal login, so current-cycle publication remains held. Exact CIP/PGWP field-of-study eligibility is not inferred.' end
from public.program_catalog_ca_staging c
where c.institution_name='Memorial University of Newfoundland'
  and c.title in ('Nautical Science','Marine Engineering')
  and c.credential_type='Diploma of Technology'
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
select c.id,'deck-officer','ca-phase3-marine-institute-2026-08-09','manual','marine_institute_nautical_science',
       'approved','direct','2026-08-09',
       'Marine Institute Nautical Science is a Transport Canada-accredited cadet program designed to prepare graduates for ships-officer duties and Watchkeeping Mate examination pathways. International students are supported but must obtain professional certification in their own country.',now(),now()
from public.program_catalog_ca_staging c
where c.institution_name='Memorial University of Newfoundland'
  and c.title='Nautical Science' and c.credential_type='Diploma of Technology'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='direct',source_checked_at='2026-08-09',reviewer_note=excluded.reviewer_note,reviewed_at=now();

insert into public.program_occupation_ca_staging (
  program_catalog_id,canonical_career_id,rule_version,match_basis,match_pattern,
  review_status,relation_type,source_checked_at,reviewer_note,matched_at,reviewed_at
)
select c.id,'marine-engineer','ca-phase3-marine-institute-2026-08-09','manual','marine_institute_marine_engineering',
       'approved','direct','2026-08-09',
       'Marine Institute Marine Engineering is a direct ship-engineering officer program covering propulsion plant operation, machinery maintenance and engineering watch duties. International students are supported but must obtain professional certification in their own country.',now(),now()
from public.program_catalog_ca_staging c
where c.institution_name='Memorial University of Newfoundland'
  and c.title='Marine Engineering' and c.credential_type='Diploma of Technology'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='direct',source_checked_at='2026-08-09',reviewer_note=excluded.reviewer_note,reviewed_at=now();;
