-- Canada Programs Phase 2/3: add missing University of Toronto PharmD and BScN professional rows,
-- verify selected professional-program admission states, and review the remaining occupation queue.
-- Evidence checked 2026-08-08 against current Leslie Dan Pharmacy, Bloomberg Nursing, OT and PT pages.

insert into public.program_catalog_ca_staging (
  source_name,source_program_key,institution_name,institution_id,title,credential_type,education_level,
  field_name,language,province,city,duration_years,tuition_fee_cad,program_code,official_program_url,
  source_url,source_as_of,source_status,collected_at
)
select
  'University of Toronto Professional Program Pages',
  md5('University of Toronto Professional Program Pages|Doctor of Pharmacy|PharmD'),
  'University of Toronto','university-of-toronto','Doctor of Pharmacy','PharmD','Doctoral professional degree',
  'Pharmacy','English','ON','Toronto',3.0,null,null,
  'https://www.pharmacy.utoronto.ca/programs/doctor-pharmacy-pharmd',
  'https://www.pharmacy.utoronto.ca/programs/doctor-pharmacy-pharmd',
  '2026-08-08','official_program_page_verified_entry_to_practice_fall_2027_not_yet_open',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='University of Toronto' and title='Doctor of Pharmacy' and credential_type='PharmD'
);

insert into public.program_catalog_ca_staging (
  source_name,source_program_key,institution_name,institution_id,title,credential_type,education_level,
  field_name,language,province,city,duration_years,tuition_fee_cad,program_code,official_program_url,
  source_url,source_as_of,source_status,collected_at
)
select
  'University of Toronto Professional Program Pages',
  md5('University of Toronto Professional Program Pages|Bachelor of Science in Nursing|BScN'),
  'University of Toronto','university-of-toronto','Bachelor of Science in Nursing','BScN','Bachelor',
  'Nursing','English','ON','Toronto',2.0,null,null,
  'https://bloomberg.nursing.utoronto.ca/learn-with-us/bachelor-of-science-in-nursing/',
  'https://bloomberg.nursing.utoronto.ca/learn-with-us/bachelor-of-science-in-nursing/',
  '2026-08-08','official_program_page_verified_second_entry_rn_fall_2027_not_yet_open',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='University of Toronto' and title='Bachelor of Science in Nursing' and credential_type='BScN'
);

insert into public.program_pgwp_ca_staging (
  program_catalog_id,institution_id,source_program_key,credential_type,education_level,matched_dli_number,matched_campus,
  institution_offers_pgwp_eligible_programs,international_students_eligible,pgwp_rule_category,field_of_study_required,
  cip_code,field_of_study_eligible,ircc_program_eligible,pgwp_program_status,ircc_detail_url,source_url,source_as_of,
  verified_at,collected_at,international_program_admission_status,rule_notes
)
select c.id,c.institution_id,c.source_program_key,c.credential_type,c.education_level,'O19332746152',null,
       true,true,'degree_no_field_of_study_requirement',false,null,null,true,
       'degree_field_exempt_structurally_eligible_general_applicant_checks_apply',null,
       'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility.html',
       '2026-08-08',now(),now(),
       case when c.title='Doctor of Pharmacy'
         then 'fall_2027_international_application_not_yet_open_opens_2026_09_17'
         else 'sep_2027_international_application_not_yet_open_opens_2026_11_01' end,
       case when c.title='Doctor of Pharmacy'
         then 'U of T three-year PharmD is the entry-to-practice pharmacy degree. The faculty explicitly welcomes qualified international applicants; Fall 2027 applications open September 17, 2026. Degree-level PGWP structural eligibility is separate from applicant-specific IRCC requirements.'
         else 'U of T second-entry BScN is an approved professional nursing degree and the faculty welcomes international applicants who meet requirements. Applications open November 1 for the next September intake. Degree-level PGWP structural eligibility is separate from applicant-specific IRCC requirements.' end
from public.program_catalog_ca_staging c
where c.institution_name='University of Toronto'
  and ((c.title='Doctor of Pharmacy' and c.credential_type='PharmD')
    or (c.title='Bachelor of Science in Nursing' and c.credential_type='BScN'))
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
select c.id,v.career_id,'ca-phase3-utoronto-2026-08-08','manual','utoronto_current_professional_program',
       'approved','direct','2026-08-08',v.note,now(),now()
from public.program_catalog_ca_staging c
join (values
  ('Doctor of Pharmacy','PharmD','pharmacist','U of T three-year PharmD is the current entry-to-practice professional pharmacy degree and welcomes qualified international applicants; Fall 2027 applications open September 17, 2026.'),
  ('Bachelor of Science in Nursing','BScN','registered-nurse','U of T second-entry BScN is the professional nursing degree leading to RN practice; the faculty explicitly welcomes international applicants meeting admission requirements.')
) as v(title,credential,career_id,note)
  on c.title=v.title and c.credential_type=v.credential
where c.institution_name='University of Toronto'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='direct',source_checked_at='2026-08-08',reviewer_note=excluded.reviewer_note,reviewed_at=now();

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Occupational Therapy' then 'https://ot.utoronto.ca/master-science-occupational-therapy'
      else 'https://physicaltherapy.utoronto.ca/admissions-0' end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_entry_to_practice_canadian_pr_only'
where institution_name='University of Toronto'
  and ((title='Occupational Therapy' and credential_type='MScOT')
    or (title='Physical Therapy' and credential_type='MScPT'));

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_entry_to_practice_program_canadian_citizen_or_pr_only_international_ineligible',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' U of T professional OT/PT admissions reviewed 2026-08-08: applicants must hold Canadian citizenship or permanent-resident status. The program remains a direct occupational qualification but is not publishable as an international-student pathway.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Toronto'
  and ((c.title='Occupational Therapy' and c.credential_type='MScOT')
    or (c.title='Physical Therapy' and c.credential_type='MScPT'));

update public.program_catalog_ca_staging
set official_program_url='https://www.pharmacy.utoronto.ca/programs/graduate-department-pharmaceutical-sciences/master-science-pharmaceutical-sciences-msc',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_research_degree_not_pharmacist_qualification'
where institution_name='University of Toronto'
  and title='Pharmaceutical Sciences' and credential_type='MSc / PhD';

update public.program_catalog_ca_staging
set official_program_url='https://www.pharmacy.utoronto.ca/programs/graduate-department-pharmaceutical-sciences/master-science-pharmacy-mscphm',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_advanced_pharmacist_program_admissions_paused'
where institution_name='University of Toronto'
  and title='Pharmacy' and credential_type='MScPhm';

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_admissions_paused_no_confirmed_reopening_timeline',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' U of T MScPhm page reviewed 2026-08-08: admissions are currently paused with no confirmed reopening timeline. The degree is advanced professional practice for experienced/qualified pharmacists and is not an entry-to-practice pharmacist credential.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Toronto'
  and c.title='Pharmacy' and c.credential_type='MScPhm';

update public.program_catalog_ca_staging
set official_program_url='https://bloomberg.nursing.utoronto.ca/learn-with-us/how-to-apply/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_advanced_graduate_nursing'
where institution_name='University of Toronto'
  and title='Nursing Science' and credential_type='DN / MN / PhD';

update public.program_pgwp_ca_staging p
set international_program_admission_status='graduate_nursing_next_cycle_not_yet_open_opens_2026_11_01_program_specific_requirements_apply',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Bloomberg Nursing application page reviewed 2026-08-08: MN, PhD and Doctor of Nursing applications open November 1. These are advanced graduate programs rather than the entry BScN RN pathway.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Toronto'
  and c.title='Nursing Science' and c.credential_type='DN / MN / PhD';

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='pharmacist' and c.title='Pharmaceutical Sciences' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='pharmacist' and c.title='Pharmaceutical Sciences' then null
      when o.canonical_career_id='architect' and c.credential_type='PhD' then 'related'
      when o.canonical_career_id='chemical-engineer' then 'related'
      when o.canonical_career_id='community-worker' then 'related'
      when o.canonical_career_id='counsellor' and c.title='Genetic Counselling' then 'related'
      when o.canonical_career_id='counsellor' then 'related'
      when o.canonical_career_id='data-analyst' then 'direct'
      when o.canonical_career_id='environmental-scientist' then 'related'
      when o.canonical_career_id='financial-analyst' and c.title='Accounting and Finance' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' then 'direct'
      when o.canonical_career_id='forestry-technician' then 'related'
      when o.canonical_career_id='industrial-engineer' then 'related'
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy' then 'related'
      when o.canonical_career_id='registered-nurse' then 'related'
      when o.canonical_career_id='social-worker' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'direct'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='pharmacist' and c.title='Pharmaceutical Sciences' then 'Rejected for pharmacist occupation: U of T Pharmaceutical Sciences MSc/PhD are research-intensive graduate degrees; the newly added three-year PharmD is the entry-to-practice pharmacist program.'
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy' then 'MScPhm is advanced clinical/professional practice for people who already hold pharmacy qualification or licensure; it is related to pharmacist practice but not an entry-to-practice pathway, and admissions are currently paused.'
      when o.canonical_career_id='registered-nurse' then 'Graduate Nursing Science is advanced/post-licensure education, not the initial RN credential; the newly added second-entry BScN is the direct RN pathway.'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') then 'Direct entry-to-practice professional degree, but current admission rules require Canadian citizenship or permanent residency, so occupation relevance remains direct while international publication is held.'
      when o.canonical_career_id='architect' and c.credential_type='PhD' then 'Architecture PhD is advanced research education and not the first professional architecture credential; relation limited to related while the MArch remains direct.'
      else 'Reviewed 2026-08-08 against University of Toronto current program scope, credential level and regulated-role distinctions; occupation relevance is separated from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of Toronto'
  and o.review_status='candidate';;
