-- Canada Programs Phase 3: University of British Columbia occupation review and targeted admission verification.
-- Evidence checked 2026-08-08 against current UBC undergraduate admissions, Nursing, PharmD, MOT and MPT pages.

update public.program_pgwp_ca_staging p
set international_program_admission_status='fall_2027_application_cycle_not_yet_open_opens_early_october_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC undergraduate admissions page reviewed 2026-08-08: the Winter 2027/28 and Summer 2027 application opens in early October 2026; no program-specific availability is inferred before that cycle opens.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.credential_type='Undergraduate program'
  and p.international_program_admission_status='institution_dli_confirmed_program_level_admission_not_yet_verified';

update public.program_catalog_ca_staging
set official_program_url='https://nursing.ubc.ca/bsn-admission-requirements',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_international_ineligible_2026_27'
where institution_name='University of British Columbia'
  and title='Nursing'
  and credential_type='Undergraduate program';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_program_canadian_pr_refugee_status_only_international_ineligible',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC Vancouver BSN admission requirements reviewed 2026-08-08: international students are explicitly ineligible; only Canadian citizens, permanent residents and eligible protected/refugee-status applicants may apply.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title='Nursing'
  and c.credential_type='Undergraduate program';

update public.program_catalog_ca_staging
set official_program_url='https://pharmsci.ubc.ca/programs/entry-practice-pharmd-degree/admissions-information',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_canadian_pr_only_2026_27'
where institution_name='University of British Columbia'
  and title='Pharmacy (Entry-to-Practice Pharm.D.)';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_entry_to_practice_pharmd_canadian_citizen_or_pr_required',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC Entry-to-Practice PharmD admission information reviewed 2026-08-08: applicants must be Canadian citizens or permanent residents by the application deadline; this is not a publishable international-student pathway.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title='Pharmacy (Entry-to-Practice Pharm.D.)';

update public.program_catalog_ca_staging
set official_program_url='https://pharmsci.ubc.ca/programs/bachelor-pharmaceutical-sciences-degree/bachelor-pharmaceutical-sciences-program',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_not_pharmacist_licensure_pathway'
where institution_name='University of British Columbia'
  and title='Pharmaceutical Sciences'
  and credential_type='Undergraduate program';

update public.program_catalog_ca_staging
set official_program_url='https://osot.ubc.ca/prospective-students/master-of-occupational-therapy/admission-requirements/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_2027_cycle_not_yet_open'
where institution_name='University of British Columbia'
  and title='Occupational Therapy'
  and credential_type='Graduate program';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_10_15',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC MOT admission requirements reviewed 2026-08-08: international applicants are eligible; applications for 2027 entry open October 15, 2026 and close January 15, 2027.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title='Occupational Therapy'
  and c.credential_type='Graduate program';

update public.program_catalog_ca_staging
set official_program_url='https://physicaltherapy.med.ubc.ca/prospective-students-2/international-applicants/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_2027_cycle_not_yet_open'
where institution_name='University of British Columbia'
  and title='Physical Therapy'
  and credential_type='Graduate program';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_10_01',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC MPT international admissions reviewed 2026-08-08: international applicants are eligible for the main MPT cohort with a limited international seat allocation; applications open October 1 and close December 15.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title='Physical Therapy'
  and c.credential_type='Graduate program';

update public.program_catalog_ca_staging
set official_program_url='https://nursing.ubc.ca/admissions/graduate-admissions',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_graduate_2027_applications_open'
where institution_name='University of British Columbia'
  and title='Nursing'
  and credential_type='Graduate program';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='graduate_nursing_sep_2027_applications_open_closes_2026_11_15',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UBC graduate Nursing admissions reviewed 2026-08-08: September 2027 applications are open and international credentials are supported, subject to program eligibility and nurse-registration requirements.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and c.title='Nursing'
  and c.credential_type='Graduate program';

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='pharmacist' and c.title in ('Pharmaceutical Sciences','Pharmacy') then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='pharmacist' and c.title in ('Pharmaceutical Sciences','Pharmacy') then null
      when o.canonical_career_id='agronomist' then 'related'
      when o.canonical_career_id='architect' and c.title='Architecture, Advanced Studies' then 'related'
      when o.canonical_career_id='architect' then 'direct'
      when o.canonical_career_id='counsellor' and c.title='Genetic and Genomic Counselling' then 'related'
      when o.canonical_career_id='counsellor' then 'direct'
      when o.canonical_career_id='data-engineer' then 'common_pathway'
      when o.canonical_career_id='early-childhood-teacher' then 'related'
      when o.canonical_career_id='film-editor' and c.title='Creative Writing/Film Production' then 'related'
      when o.canonical_career_id='film-editor' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' then 'common_pathway'
      when o.canonical_career_id='food-technologist' and c.credential_type='Graduate program' then 'related'
      when o.canonical_career_id='forestry-technician' then 'related'
      when o.canonical_career_id='mechanical-engineer' and c.credential_type='Graduate program' then 'related'
      when o.canonical_career_id='pharmacist' and c.title in ('Pharmacy (Graduate Pharm.D.)','Pharmacy Leadership') then 'related'
      when o.canonical_career_id='registered-nurse' and c.credential_type='Graduate program' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='special-education-teacher' then 'related'
      when o.canonical_career_id='sustainability-specialist' and c.credential_type='Graduate program' then 'related'
      when o.canonical_career_id in ('supply-chain-analyst','warehouse-manager') then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='pharmacist' and c.title='Pharmaceutical Sciences' then 'Rejected for pharmacist occupation: UBC explicitly states the Bachelor of Pharmaceutical Sciences does not qualify graduates for pharmacist licensure; graduate Pharmaceutical Sciences is research education rather than entry-to-practice pharmacy.'
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy' then 'Rejected ambiguous aggregate Pharmacy catalogue row in favour of the explicit Entry-to-Practice PharmD row; avoids duplicate/parent-program overmatching.'
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy (Entry-to-Practice Pharm.D.)' then 'Direct pharmacist education, but current UBC admission rules require Canadian citizenship or permanent residency, so occupation relevance is retained while international publication is held.'
      when o.canonical_career_id='registered-nurse' and c.credential_type='Graduate program' then 'Graduate Nursing is advanced/post-licensure education and is related to RN practice, not the entry RN credential.'
      when o.canonical_career_id='early-childhood-teacher' then 'Graduate Early Childhood Education is related advanced study; it is not treated as a stand-alone entry educator credential.'
      when o.canonical_career_id='forestry-technician' then 'University-level forestry education is relevant to forestry work but is not a technician-specific credential, so relation is limited to related.'
      else 'Reviewed 2026-08-08 against the UBC program title/credential and regulated-role level; occupation relevance is separated from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of British Columbia'
  and o.review_status='candidate';;
