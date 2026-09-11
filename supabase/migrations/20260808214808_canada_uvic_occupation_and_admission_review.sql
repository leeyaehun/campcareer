-- Canada Programs Phase 3: University of Victoria occupation review and targeted international-admission verification.
-- Evidence checked 2026-08-08 against current UVic undergraduate, graduate, Nursing, Social Work, Counselling and Teacher Education pages.

update public.program_catalog_ca_staging
set official_program_url='https://www.uvic.ca/health/programs/graduate/counselling-psychology/admissions/index.php',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_sep_2027_not_yet_open'
where institution_name='University of Victoria'
  and title='Counselling Psychology'
  and credential_type='Masters';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='sep_2027_international_application_not_yet_open_opens_2026_09_01',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UVic Counselling Psychology MA admissions reviewed 2026-08-08: applications for September 2027 open September 1, 2026 and close November 30, 2026; international English-language requirements are explicitly published.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and c.title='Counselling Psychology'
  and c.credential_type='Masters';

update public.program_catalog_ca_staging
set official_program_url=case
      when credential_type='Doctorate' then 'https://www.uvic.ca/graduate/programs/graduate-programs/credential-pages/computer-science-msc/computer-science-phd.php'
      else 'https://www.uvic.ca/graduate/programs/graduate-programs/credential-pages/computer-science-msc/computer-science-msc.php' end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_sep_2027_not_yet_open'
where institution_name='University of Victoria'
  and title='Computer Science'
  and credential_type in ('Masters','Doctorate');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='sep_2027_international_application_not_yet_open_opens_september_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UVic Computer Science graduate admissions reviewed 2026-08-08: domestic and international deadlines are the same and the September 2027 application portal opens in September 2026; September applications are due December 15.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and c.title='Computer Science'
  and c.credential_type in ('Masters','Doctorate');

update public.program_catalog_ca_staging
set official_program_url='https://www.uvic.ca/health/socialwork/future/bsw/admission/apply/index.php',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_next_intake_sep_2027'
where institution_name='University of Victoria'
  and title='Social Work'
  and credential_type='Degree';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='sep_2026_closed_next_sep_2027_application_cycle_not_yet_open',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UVic BSW admissions reviewed 2026-08-08: September 2026 applications are closed and the next intake is September 2027. No current open 2027 application window is inferred before the provider publishes it.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and c.title='Social Work'
  and c.credential_type='Degree';

update public.program_catalog_ca_staging
set official_program_url='https://www.uvic.ca/health/socialwork/future/msw/apply/index.php',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_sep_2027_not_yet_open'
where institution_name='University of Victoria'
  and title='Social Work'
  and credential_type='Masters';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='sep_2027_international_application_not_yet_open_opens_early_october_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UVic MSW admissions reviewed 2026-08-08: the next September 2027 intake opens in early October 2026; the Foundation stream publishes admission requirements for international students without a BSW.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and c.title='Social Work'
  and c.credential_type='Masters';

update public.program_catalog_ca_staging
set official_program_url='https://www.uvic.ca/health/nursing/undergraduate/bsn-major/index.php',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_partner_college_entry'
where institution_name='University of Victoria'
  and title='Nursing'
  and credential_type='Degree';

update public.program_pgwp_ca_staging p
set international_program_admission_status='partner_college_entry_required_program_level_admission_not_yet_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UVic BSN reviewed 2026-08-08: the degree is an RN pathway delivered through Aurora, Camosun, College of the Rockies and Selkirk partner sites. Year-one admissibility is determined by the partner college, so the aggregate UVic row remains held pending partner-specific international admission evidence.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and c.title='Nursing'
  and c.credential_type='Degree';

update public.program_catalog_ca_staging
set official_program_url=case
      when credential_type='Doctorate' then 'https://www.uvic.ca/graduate/programs/graduate-programs/credential-pages/nursing-cred/nursing-phd.php'
      else 'https://www.uvic.ca/health/nursing/students/resources/international-students/index.php' end,
    source_as_of='2026-08-08',
    source_status=case
      when credential_type='Doctorate' then 'official_program_page_verified_no_2027_intake_even_years_only'
      else 'official_program_page_verified_international_graduate_path' end
where institution_name='University of Victoria'
  and title='Nursing'
  and credential_type in ('Masters','Doctorate');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status=case
      when c.credential_type='Doctorate' then 'current_no_2027_phd_intake_even_years_only_next_cycle_not_yet_open'
      else 'international_graduate_nursing_eligible_current_intake_availability_not_yet_verified' end,
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || case
      when c.credential_type='Doctorate' then ' UVic Nursing PhD reviewed 2026-08-08: international applicants are eligible, but the PhD admits new students only in even-numbered years, so there is no September 2027 intake.'
      else ' UVic graduate Nursing international policy reviewed 2026-08-08: international applicants are considered for MN streams, subject to nursing registration and stream-specific requirements; current program-level intake availability remains unverified.' end
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and c.title='Nursing'
  and c.credential_type in ('Masters','Doctorate');

update public.program_catalog_ca_staging
set official_program_url=case
      when title like '%Secondary%' then 'https://www.uvic.ca/undergraduate/programs/undergraduate-programs/pages/teacher-education-secondary-post-degree.php'
      else 'https://www.uvic.ca/undergraduate/programs/undergraduate-programs/pages/teacher-education-elementary-post-degree.php' end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_teacher_certification_current_cycle_closed'
where institution_name='University of Victoria'
  and title in ('Teacher Education: Elementary Curriculum (post-degree professional program)','Teacher Education: Secondary Curriculum (post-degree professional program)');

update public.program_pgwp_ca_staging p
set international_program_admission_status='sep_2026_teacher_education_cycle_closed_next_cycle_not_yet_open',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UVic Teacher Education PDPP admissions reviewed 2026-08-08: the published September 2026 cycle ran October 1 to January 2 and is closed. These programs lead to eligibility for a BC Teaching Certificate; no next-cycle open status is inferred yet.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and c.title in ('Teacher Education: Elementary Curriculum (post-degree professional program)','Teacher Education: Secondary Curriculum (post-degree professional program)');

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Teacher Education: Elementary Curriculum' then 'https://www.uvic.ca/undergraduate/programs/undergraduate-programs/pages/teacher-education-elementary-curriculum.php'
      when title='Computer Science' and credential_type='Bachelor of Science (BSc)' then 'https://www.uvic.ca/undergraduate/programs/undergraduate-programs/pages/computer-science.php'
      when title='Environmental Studies' and credential_type='Degree' then 'https://www.uvic.ca/undergraduate/programs/undergraduate-programs/pages/environmental-studies.php'
      else official_program_url end,
    source_as_of='2026-08-08'
where institution_name='University of Victoria'
  and ((title='Teacher Education: Elementary Curriculum' and credential_type='Degree')
    or (title='Computer Science' and credential_type='Bachelor of Science (BSc)')
    or (title='Environmental Studies' and credential_type='Degree'));

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('civil-engineer','mechanical-engineer') and c.credential_type in ('Masters','Doctorate') then 'related'
      when o.canonical_career_id='data-analyst' then 'common_pathway'
      when o.canonical_career_id='data-engineer' then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' and c.credential_type='Degree' then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' then 'related'
      when o.canonical_career_id='registered-nurse' and c.credential_type in ('Masters','Doctorate') then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='special-education-teacher' then 'related'
      when o.canonical_career_id='youth-worker' and c.credential_type in ('Masters','Doctorate') then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.credential_type='Degree' then 'Direct RN pathway: UVic BSN prepares registered nurses, but year-one entry is through partner colleges, so international publishability remains partner-specific and held.'
      when o.canonical_career_id='registered-nurse' and c.credential_type in ('Masters','Doctorate') then 'Graduate Nursing is advanced/post-licensure education requiring prior nursing preparation and/or registration; relation limited to related rather than entry RN qualification.'
      when o.canonical_career_id in ('primary-school-teacher','secondary-school-teacher') then 'Direct teacher-certification education; UVic confirms its teacher-education professional programs prepare graduates to apply for a BC Teaching Certificate.'
      when o.canonical_career_id='special-education-teacher' then 'Special and Inclusive Education certificate/diploma is additional specialization rather than a first teacher-certification credential; relation limited to related.'
      when o.canonical_career_id='software-developer' then 'Computer Science, Software Engineering and combined computing degrees are common academic pathways to software-development roles; relation is not overstated as a single occupational credential.'
      else 'Reviewed 2026-08-08 against UVic current program scope, credential level and regulated-role distinctions; occupation relevance remains separate from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of Victoria'
  and o.review_status='candidate';;
