-- Canada Programs Phase 3: Concordia University occupation review and Winter 2027 undergraduate availability verification.
-- Evidence checked 2026-08-08 against Concordia current program-availability and program pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_application_open',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Concordia undergraduate program availability reviewed 2026-08-08: this program is listed Open for Winter 2027 and the university states international students remain eligible to apply, subject to CAQ/study-permit timing.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Concordia University'
  and (
    (c.title='Accountancy' and c.credential_type='BComm')
    or (c.title='Chemical Engineering' and c.credential_type='BEng')
    or (c.title='Civil Engineering' and c.credential_type='BEng')
    or (c.title='Cybersecurity' and c.credential_type='BSc')
    or (c.title='Cybersecurity Engineering' and c.credential_type='BEng')
    or (c.title='Data Science' and c.credential_type='BA/BSc')
    or (c.title='Data Science (Computer Science – Mathematics and Statistics)' and c.credential_type='BCompSc')
    or (c.title='Electrical Engineering' and c.credential_type='BEng')
    or (c.title='Finance' and c.credential_type='BComm')
    or (c.title='Mathematical and Computational Finance' and c.credential_type='BA/BSc')
    or (c.title='Human Resource Management' and c.credential_type='BComm')
    or (c.title='Industrial Engineering' and c.credential_type='BEng')
    or (c.title='Supply Chain Operations Management' and c.credential_type='BComm')
    or (c.title='Marketing' and c.credential_type='BComm')
    or (c.title='Mechanical Engineering' and c.credential_type='BEng')
    or (c.title='Computer Science' and c.credential_type='BCompSc')
    or (c.title='Software Engineering' and c.credential_type='BEng')
    or (c.title='Environmental and Sustainability Science' and c.credential_type='BSc')
  );

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_closed_winter_2027',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Concordia undergraduate program availability reviewed 2026-08-08: this program is listed Closed for Winter 2027; no later intake is inferred as currently open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Concordia University'
  and (
    (c.title='Film Animation' and c.credential_type='BFA')
    or (c.title='Film Production' and c.credential_type='BFA')
    or (c.title='Actuarial Mathematics/Finance' and c.credential_type='BA/BSc')
    or (c.title='Early Childhood and Elementary Education' and c.credential_type='BA')
    or (c.title='Computation Arts – Computer Sciences' and c.credential_type='BFA')
    or (c.title='Computer Science – Computation Arts' and c.credential_type='BCompSc')
  );

update public.program_catalog_ca_staging
set official_program_url='https://www.concordia.ca/academics/undergraduate/accountancy-cert.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_canadian_pr_only'
where institution_name='Concordia University'
  and title='Accountancy'
  and credential_type='Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_accountancy_certificate_canadian_pr_only_international_ineligible',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Concordia Accountancy Certificate page reviewed 2026-08-08: the certificate is only open to Canadian citizens, landed immigrants and permanent residents who already hold a bachelor degree.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Concordia University'
  and c.title='Accountancy'
  and c.credential_type='Certificate';

update public.program_catalog_ca_staging
set official_program_url='https://www.concordia.ca/academics/graduate/chartered-professional-accountancy.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_next_available_winter_2027'
where institution_name='Concordia University'
  and title='Chartered Professional Accountancy (CPA)'
  and credential_type='Graduate Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='fall_2026_suspended_next_available_winter_2027_international_path_requires_credential_review',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Concordia CPA Graduate Diploma reviewed 2026-08-08: Fall 2026 intake is suspended and Winter 2027 is the next available intake. Applicants with international accounting credentials may require prerequisite/credential pathways, so international publishability is not inferred.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Concordia University'
  and c.title='Chartered Professional Accountancy (CPA)'
  and c.credential_type='Graduate Diploma';

update public.program_catalog_ca_staging
set official_program_url='https://www.concordia.ca/academics/undergraduate/early-childhood-elementary-education.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_teacher_certification_winter_2027_closed'
where institution_name='Concordia University'
  and title='Early Childhood and Elementary Education'
  and credential_type='BA';

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id='accountant' and c.credential_type='Certificate' then 'common_pathway'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','industrial-engineer','mechanical-engineer') and c.credential_type<>'BEng' then 'related'
      when o.canonical_career_id='environmental-engineer' then 'related'
      when o.canonical_career_id='environmental-scientist' then 'related'
      when o.canonical_career_id in ('data-analyst','data-engineer') and c.title like 'Data Science%' then 'common_pathway'
      when o.canonical_career_id='film-editor' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' and c.title<>'Finance' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' and c.credential_type='MSc' then 'related'
      when o.canonical_career_id='marketing-specialist' and c.credential_type='MSc' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='primary-school-teacher' then 'Direct teacher-certification pathway: Concordia confirms the BA Specialization in Early Childhood and Elementary Education is an approved 120-credit teacher-education program leading to permanent Quebec certification when certification requirements are met. Winter 2027 admission is currently closed.'
      when o.canonical_career_id='accountant' and c.credential_type='Certificate' then 'Accountancy Certificate is a prerequisite/stepping-stone pathway toward the CPA Graduate Diploma, not the completed professional-accountancy pathway; international admission is explicitly restricted.'
      when o.canonical_career_id='accountant' and c.title='Chartered Professional Accountancy (CPA)' then 'Direct professional accountancy preparation for the CPA Common Final Examination pathway; Fall 2026 is suspended and Winter 2027 is the next available intake.'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','industrial-engineer','mechanical-engineer') and c.credential_type<>'BEng' then 'Graduate/advanced engineering study is relevant but is not treated as the first accredited professional engineering credential; relation limited to related.'
      else 'Reviewed 2026-08-08 against Concordia current program scope, credential level and regulated-role distinctions; occupation relevance remains independent from current intake availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Concordia University'
  and o.review_status='candidate';;
