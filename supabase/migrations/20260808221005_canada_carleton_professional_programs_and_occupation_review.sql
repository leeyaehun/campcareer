-- Canada Programs Phase 2/3: add the current Carleton professional M.Arch, normalize the current BScN,
-- and close the remaining occupation candidate queue.
-- Evidence checked 2026-08-08 against current Carleton admissions, Architecture and Nursing pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_september_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Carleton undergraduate admissions timeline reviewed 2026-08-08: Fall 2027 OUAC and direct international applications open in September 2026; the main international deadline is April 1, 2027, with earlier program-specific deadlines where applicable.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Carleton University'
  and c.credential_type='Undergraduate program of study'
  and exists (
    select 1 from public.program_occupation_ca_staging o
    where o.program_catalog_id=c.id and o.review_status='candidate'
  );

update public.program_catalog_ca_staging
set title='Bachelor of Science in Nursing with RN Prescribing',
    credential_type='Bachelor of Science in Nursing (BScN)',
    education_level='Bachelor',
    official_program_url='https://admissions.carleton.ca/programs/nursing/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_current_bscn_rn_prescribing'
where institution_name='Carleton University'
  and title='Nursing'
  and credential_type='Undergraduate program of study';

update public.program_pgwp_ca_staging p
set credential_type=c.credential_type,
    education_level=c.education_level,
    international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_september_2026',
    source_url='https://admissions.carleton.ca/programs/nursing/',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Carleton current Nursing page reviewed 2026-08-08: the compressed three-year BScN with RN Prescribing is designed to prepare practice-ready Registered Nurses. Fall 2027 international applications open in September 2026.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Carleton University'
  and c.title='Bachelor of Science in Nursing with RN Prescribing';

insert into public.program_catalog_ca_staging (
  source_name,source_program_key,institution_name,institution_id,title,credential_type,education_level,
  field_name,language,province,city,duration_years,tuition_fee_cad,program_code,official_program_url,
  source_url,source_as_of,source_status,collected_at
)
select
  'Carleton Graduate Calendar 2026-27',
  md5('Carleton Graduate Calendar 2026-27|Master of Architecture|MArch'),
  'Carleton University','carleton-university','Master of Architecture','MArch','Master',
  'Architecture','English','ON','Ottawa',null,null,null,
  'https://architecture.carleton.ca/programs/graduate/march-2/',
  'https://architecture.carleton.ca/programs/graduate/march-2/',
  '2026-08-08','official_program_page_verified_cacb_accredited_professional_degree',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='Carleton University' and title='Master of Architecture' and credential_type='MArch'
);

insert into public.program_pgwp_ca_staging (
  program_catalog_id,institution_id,source_program_key,credential_type,education_level,matched_dli_number,matched_campus,
  institution_offers_pgwp_eligible_programs,international_students_eligible,pgwp_rule_category,field_of_study_required,
  cip_code,field_of_study_eligible,ircc_program_eligible,pgwp_program_status,ircc_detail_url,source_url,source_as_of,
  verified_at,collected_at,international_program_admission_status,rule_notes
)
select c.id,c.institution_id,c.source_program_key,c.credential_type,c.education_level,'O19332687812',null,
       true,true,'degree_no_field_of_study_requirement',false,null,null,true,
       'degree_field_exempt_structurally_eligible_general_applicant_checks_apply',null,
       'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility.html',
       '2026-08-08',now(),now(),
       'fall_2027_graduate_program_application_timing_not_yet_verified',
       'Carleton M.Arch is a CACB-accredited professional architecture degree. Degree-level PGWP structural eligibility is retained, while the current Fall 2027 program-specific international application window remains unverified.'
from public.program_catalog_ca_staging c
where c.institution_name='Carleton University'
  and c.title='Master of Architecture' and c.credential_type='MArch'
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
select c.id,'architect','ca-phase3-carleton-2026-08-08','manual','carleton_current_professional_march',
       'approved','direct','2026-08-08',
       'Carleton M.Arch is CACB-accredited and is the professional graduate architecture degree used in the architectural licensure education pathway.',now(),now()
from public.program_catalog_ca_staging c
where c.institution_name='Carleton University'
  and c.title='Master of Architecture' and c.credential_type='MArch'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='direct',source_checked_at='2026-08-08',reviewer_note=excluded.reviewer_note,reviewed_at=now();

update public.program_catalog_ca_staging
set source_status='legacy_parent_shadow_current_professional_march',source_as_of='2026-08-08'
where institution_name='Carleton University'
  and title='Architecture'
  and credential_type='Graduate program of study (credential varies by program)';

update public.program_catalog_ca_staging
set source_status='legacy_duplicate_shadow_current_bcs',source_as_of='2026-08-08'
where institution_name='Carleton University'
  and title='Computer Science'
  and credential_type='Undergraduate program of study';

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='architect' and c.source_status='legacy_parent_shadow_current_professional_march' then 'rejected'
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_bcs' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='architect' and c.source_status='legacy_parent_shadow_current_professional_march' then null
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_bcs' then null
      when o.canonical_career_id='architect' and c.title='Architectural Studies' then 'common_pathway'
      when o.canonical_career_id='civil-engineer' then 'related'
      when o.canonical_career_id in ('data-analyst','data-engineer') and c.title in ('Data Science','Data Science, Analytics, and Artificial Intelligence') then 'common_pathway'
      when o.canonical_career_id='data-analyst' and c.title='Social Statistics and Data Analysis' then 'direct'
      when o.canonical_career_id='environmental-engineer' then 'related'
      when o.canonical_career_id='environmental-scientist' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' then 'common_pathway'
      when o.canonical_career_id='multimedia-designer' then 'common_pathway'
      when o.canonical_career_id='social-worker' and c.credential_type='Graduate program of study (credential varies by program)' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='architect' and c.source_status='legacy_parent_shadow_current_professional_march' then 'Rejected generalized graduate Architecture aggregate after adding the current CACB-accredited M.Arch as a separate direct architect row.'
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_bcs' then 'Rejected generalized undergraduate Computer Science shadow because the current Bachelor of Computer Science row with an official program page is already present.'
      when o.canonical_career_id='registered-nurse' then 'Direct RN pathway: the current Carleton compressed three-year BScN with RN Prescribing is designed to prepare practice-ready Registered Nurses.'
      when o.canonical_career_id='architect' and c.title='Architectural Studies' then 'Architectural Studies is pre-professional undergraduate architecture education; the CACB-accredited M.Arch is the direct professional degree, so this row is a common pathway.'
      when o.canonical_career_id in ('civil-engineer','environmental-engineer') then 'Graduate engineering study is advanced education rather than the first accredited professional engineering credential; relation limited to related.'
      when o.canonical_career_id='social-worker' and c.credential_type='Graduate program of study (credential varies by program)' then 'Generalized graduate Social Work row can mix professional and research credentials; relation retained conservatively as related while the undergraduate professional pathway remains direct.'
      else 'Reviewed 2026-08-08 against Carleton current program scope, credential level and regulated-role distinctions; occupation relevance is separated from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Carleton University'
  and o.review_status='candidate';;
