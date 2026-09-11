-- Canada Programs Phase 3: University of Manitoba occupation review and targeted international-admission verification.
-- Evidence checked 2026-08-08 against current UM Engineering, Pharmacy, Nursing and graduate admissions pages.

update public.program_catalog_ca_staging
set official_program_url='https://umanitoba.ca/explore/programs-of-study/engineering-bsc',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_fall_2027_not_yet_open'
where institution_name='University of Manitoba'
  and title in ('Civil Engineering','Electrical Engineering','Mechanical Engineering')
  and credential_type='Bachelor of Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_early_october_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Manitoba Engineering BSc page reviewed 2026-08-08: international Fall direct-entry applications open annually in early October and close May 1; Fall 2027 is therefore not yet open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Manitoba'
  and c.title in ('Civil Engineering','Electrical Engineering','Mechanical Engineering')
  and c.credential_type='Bachelor of Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_graduate_application_open_program_specific_deadline_applies',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Manitoba graduate application timing reviewed 2026-08-08: Fall applications become available July 1 of the previous year (up to 16 months before the start term), so Fall 2027 application access is open; department-specific deadlines and supervision requirements still apply.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Manitoba'
  and c.title in ('Civil Engineering','Mechanical Engineering')
  and c.credential_type in ('M.Eng.','M.Sc.','Ph.D.');

update public.program_catalog_ca_staging
set official_program_url='https://umanitoba.ca/explore/programs-of-study/pharmacy-pharmd',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_canadian_pr_only_current_cycle_closed'
where institution_name='University of Manitoba'
  and title='Pharmacy'
  and credential_type='Doctor of Pharmacy';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_pharmd_canadian_citizen_or_pr_only_international_ineligible_2026_cycle_closed',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Manitoba PharmD admission requirements reviewed 2026-08-08: Manitoba-resident and out-of-province applicant pools are defined as Canadian citizens or permanent residents; the published 2026 application deadline was March 1, 2026. Occupation relevance remains direct while international publication is held.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Manitoba'
  and c.title='Pharmacy'
  and c.credential_type='Doctor of Pharmacy';

update public.program_catalog_ca_staging
set official_program_url='https://umanitoba.ca/explore/undergraduate-admissions/requirements/nursing',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_winter_2027_international_closed_next_summer_2027'
where institution_name='University of Manitoba'
  and title='Nursing'
  and credential_type='Bachelor of Nursing';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_closed_next_summer_2027_deadline_2026_11_01_application_open_status_not_yet_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Manitoba Bachelor of Nursing admission page reviewed 2026-08-08: Winter 2027 international applications closed July 1, 2026; Summer 2027 international applications have a November 1, 2026 deadline. Current Summer 2027 application-open status is not inferred from the deadline alone.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Manitoba'
  and c.title='Nursing'
  and c.credential_type='Bachelor of Nursing';

update public.program_catalog_ca_staging
set official_program_url='https://umanitoba.ca/explore/programs-of-study/computer-science-bsc',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_current_2026_27'
where institution_name='University of Manitoba'
  and title in ('Computer Science - Bachelor of Computer Science (Honours)','Computer Science - Bachelor of Science (Major)');

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('civil-engineer','mechanical-engineer') and c.credential_type in ('M.Eng.','M.Sc.','Ph.D.') then 'related'
      when o.canonical_career_id='community-worker' then 'related'
      when o.canonical_career_id in ('data-analyst','data-engineer') and c.title='Data Science' then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' then 'common_pathway'
      when o.canonical_career_id='farm-manager' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' then 'common_pathway'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='pharmacist' then 'Direct pharmacist education: UM PharmD is the entry-to-practice professional degree. Current admission pools require Canadian citizenship or permanent residency, so international publication is held separately.'
      when o.canonical_career_id='registered-nurse' then 'Direct RN pathway: UM Bachelor of Nursing is the professional nursing degree and accepts international applicants, but the Winter 2027 international deadline has passed and the next intake open status remains unverified.'
      when o.canonical_career_id in ('civil-engineer','mechanical-engineer') and c.credential_type in ('M.Eng.','M.Sc.','Ph.D.') then 'Graduate engineering study is advanced education rather than the first professional engineering credential; relation limited to related.'
      when o.canonical_career_id='farm-manager' then 'Agribusiness is a common academic/business pathway to farm-management roles but does not itself establish farm-manager occupational qualification.'
      when o.canonical_career_id='community-worker' then 'Recreation Management and Community Development is relevant community-development education but broader than a direct community-service-worker credential; relation limited to related.'
      else 'Reviewed 2026-08-08 against University of Manitoba current program scope, credential level and regulated-role distinctions; occupation relevance is separated from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of Manitoba'
  and o.review_status='candidate';;
