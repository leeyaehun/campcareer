-- Canada Programs Phase 3: Simon Fraser University occupation review and targeted international-admission verification.
-- Evidence checked 2026-08-08 against current SFU undergraduate admissions, Computing Science, Environmental Science, REM and engineering pages.

update public.program_pgwp_ca_staging p
set international_program_admission_status='spring_2027_general_application_open_program_specific_availability_not_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SFU undergraduate admissions reviewed 2026-08-08: Spring 2027 applications are open July 1 through September 15, 2026. Program-specific intake availability is not inferred solely from the institution-wide application window.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and p.international_program_admission_status='institution_dli_confirmed_program_level_admission_not_yet_verified'
  and c.credential_type in ('Bachelor of Science','Bachelor of Science or Bachelor of Arts','Bachelor of Arts or Bachelor of Science','Bachelor of Applied Science','Bachelor of Applied Science and Bachelor of Business Administration','Bachelor of Business Administration or Bachelor of Science','Bachelor of Business Administration or Bachelor of Environment','Bachelor of Environment');

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Cybersecurity' then 'https://www.sfu.ca/fas/study/future-graduates/programs/diploma-professional-computer-science/'
      else 'https://www.sfu.ca/fas/study/future-graduates/programs/graduate-diploma-in-big-data.html'
    end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_domestic_only_2026'
where institution_name='Simon Fraser University'
  and ((title='Cybersecurity' and credential_type='Graduate Diploma')
       or (title='Big Data' and credential_type='Graduate Diploma'));

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_graduate_diploma_domestic_canadian_pr_only_international_ineligible',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SFU Professional Computer Science Graduate Diploma page reviewed 2026-08-08: due to capacity limitations, current Big Data/Cybersecurity graduate diplomas are open only to Canadian citizens or permanent residents.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and ((c.title='Cybersecurity' and c.credential_type='Graduate Diploma')
       or (c.title='Big Data' and c.credential_type='Graduate Diploma'));

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Cybersecurity' then 'https://www.sfu.ca/fas/study/future-graduates/programs/master-cybersecurity.html'
      else 'https://www.sfu.ca/fas/study/future-graduates/programs/master-big-data.html'
    end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_fall_2027_not_yet_open'
where institution_name='Simon Fraser University'
  and ((title='Cybersecurity' and credential_type='Master of Cybersecurity')
       or (title='Big Data' and credential_type='Master of Science'));

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_10_01',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SFU Professional Computing Science admissions reviewed 2026-08-08: international-background applicants are supported; the next Fall 2027 Master of Cybersecurity / MSc Big Data application cycle opens October 1, 2026.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and ((c.title='Cybersecurity' and c.credential_type='Master of Cybersecurity')
       or (c.title='Big Data' and c.credential_type='Master of Science'));

update public.program_catalog_ca_staging
set official_program_url='https://www.sfu.ca/evsc/prospective-students/graduate/admission.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_spring_2027_open'
where institution_name='Simon Fraser University'
  and title='Environmental Science'
  and credential_type in ('Master of Science','Doctor of Philosophy');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='spring_2027_international_application_open_closes_2026_10_31',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SFU Environmental Science graduate admissions reviewed 2026-08-08: Spring 2027 applications are OPEN through October 31, 2026; application instructions explicitly include applicants with international transcripts.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and c.title='Environmental Science'
  and c.credential_type in ('Master of Science','Doctor of Philosophy');

update public.program_catalog_ca_staging
set official_program_url='https://www.sfu.ca/rem/prospective-students/graduate-students/admission.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_2027_not_yet_open'
where institution_name='Simon Fraser University'
  and title='Resource and Environmental Management'
  and credential_type in ('Master of Resource Management','Doctor of Philosophy');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_application_not_yet_open_opens_october_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SFU REM graduate admissions reviewed 2026-08-08: the 2026 application period is complete and applications for 2027 open in October 2026.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and c.title='Resource and Environmental Management'
  and c.credential_type in ('Master of Resource Management','Doctor of Philosophy');

update public.program_catalog_ca_staging
set official_program_url='https://www.sfu.ca/fas/study/future-graduates/apply/sustainable-energy-engineering.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_current_cycle_closed_2027_not_published'
where institution_name='Simon Fraser University'
  and title='Sustainable Energy Engineering'
  and credential_type in ('Master of Applied Science','Master of Engineering','Doctor of Philosophy');

update public.program_pgwp_ca_staging p
set international_program_admission_status='fall_2026_closed_2027_application_cycle_not_yet_published',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SFU Sustainable Energy Engineering graduate application page reviewed 2026-08-08: published Summer/Fall 2026 deadlines have passed and a 2027 cycle is not yet published; international applicants are discussed but current publication remains held.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and c.title='Sustainable Energy Engineering'
  and c.credential_type in ('Master of Applied Science','Master of Engineering','Doctor of Philosophy');

update public.program_catalog_ca_staging
set official_program_url='https://www.sfu.ca/students/calendar/2026/fall/programs/early-learning/post-baccalaureate-diploma.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_advanced_early_learning_study'
where institution_name='Simon Fraser University'
  and title='Early Learning' and credential_type='Post Baccalaureate Diploma';

update public.program_catalog_ca_staging
set official_program_url='https://www.sfu.ca/students/calendar/2026/fall/programs/special-education/post-baccalaureate-diploma.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_advanced_special_education_study'
where institution_name='Simon Fraser University'
  and title='Special Education' and credential_type='Post Baccalaureate Diploma';

update public.program_catalog_ca_staging
set official_program_url='https://www.sfu.ca/fas/study/future-undergraduates/programs/major/mechatronics-bachelor-applied-science.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_ceab_accredited'
where institution_name='Simon Fraser University'
  and title='Mechatronic Systems Engineering'
  and credential_type='Bachelor of Applied Science';

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id='accountant' and c.title like 'Accounting with %Analytics' then 'related'
      when o.canonical_career_id='business-analyst' then 'direct'
      when o.canonical_career_id='counsellor' then 'related'
      when o.canonical_career_id='cybersecurity-analyst' then 'direct'
      when o.canonical_career_id='data-analyst' and c.title like 'Accounting with %Analytics' then 'related'
      when o.canonical_career_id='data-analyst' and c.title='Data Science in Physics' then 'related'
      when o.canonical_career_id='data-analyst' then 'common_pathway'
      when o.canonical_career_id='data-engineer' and c.title='Big Data' then 'direct'
      when o.canonical_career_id='data-engineer' and c.title='Data Science in Physics' then 'related'
      when o.canonical_career_id='data-engineer' then 'common_pathway'
      when o.canonical_career_id='early-childhood-teacher' then 'related'
      when o.canonical_career_id='environmental-scientist' and c.credential_type in ('Master of Science','Doctor of Philosophy') then 'related'
      when o.canonical_career_id='financial-analyst' then 'related'
      when o.canonical_career_id='mechanical-engineer' and c.credential_type in ('Master of Applied Science','Doctor of Philosophy') then 'related'
      when o.canonical_career_id='mechanical-engineer' then 'common_pathway'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='special-education-teacher' then 'related'
      when o.canonical_career_id='sustainability-specialist' and c.credential_type in ('Doctor of Philosophy','Master of Resource Management','Master of Applied Science','Master of Engineering') then 'related'
      when o.canonical_career_id='sustainability-specialist' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='counsellor' then 'Counselling and Human Development PBD is relevant advanced study but is not treated as a completed professional counsellor credential; relation limited to related.'
      when o.canonical_career_id='early-childhood-teacher' then 'SFU Early Learning PBD focuses on work with ages three through eight but is advanced post-baccalaureate study rather than a stand-alone provincial ECE entry credential; relation limited to related.'
      when o.canonical_career_id='special-education-teacher' then 'SFU Special Education PBD is designed for educators and health professionals already working with disability populations; it is advanced specialization rather than first teacher certification.'
      when o.canonical_career_id='mechanical-engineer' and c.credential_type in ('Bachelor of Applied Science','Bachelor of Applied Science and Bachelor of Business Administration') then 'SFU Mechatronic Systems Engineering is CEAB-accredited and supplies P.Eng. academic requirements, but it is multidisciplinary rather than a Mechanical Engineering degree; mapped as a common pathway to mechanical-engineer.'
      when o.canonical_career_id='data-engineer' and c.title='Big Data' then 'SFU Big Data explicitly trains data architects and related technical roles; direct data-engineer relation retained, while current international eligibility is handled separately by credential/intake.'
      else 'Reviewed 2026-08-08 against SFU current program scope and credential level; occupation relevance is kept separate from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Simon Fraser University'
  and o.review_status='candidate';;
