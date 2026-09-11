-- Canada Programs Phase 3: University of Waterloo occupation review, admission-cycle verification, and aggregate shadow cleanup.
-- Evidence checked 2026-08-08 against current Waterloo undergraduate/graduate admissions and School of Pharmacy pages.

update public.program_pgwp_ca_staging p
set international_program_admission_status='fall_2027_application_cycle_not_yet_open_opens_mid_september_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Waterloo undergraduate admissions timeline reviewed 2026-08-08: full-time September 2027 applications open through OUAC in mid-September 2026; international students use the same program deadlines.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Waterloo'
  and p.international_program_admission_status='institution_dli_confirmed_program_level_admission_not_yet_verified'
  and (c.credential_type='Undergraduate program' or c.credential_type='Bachelor of Computer Science / Bachelor of Mathematics')
  and exists (
    select 1 from public.program_occupation_ca_staging o
    where o.program_catalog_id=c.id and o.review_status='candidate'
  );

update public.program_pgwp_ca_staging p
set international_program_admission_status='fall_2027_graduate_applications_open_program_specific_deadline_applies',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Waterloo Future Graduate Students admissions reviewed 2026-08-08: graduate programs are currently accepting applications for Fall 2027; each program-specific deadline and requirements still apply.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Waterloo'
  and p.international_program_admission_status='institution_dli_confirmed_program_level_admission_not_yet_verified'
  and c.credential_type not in ('Undergraduate program','Bachelor of Computer Science / Bachelor of Mathematics')
  and exists (
    select 1 from public.program_occupation_ca_staging o
    where o.program_catalog_id=c.id and o.review_status='candidate'
  );

update public.program_catalog_ca_staging
set official_program_url='https://uwaterloo.ca/pharmacy/doctor-pharmacy-pharmd',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_next_cycle_not_yet_open_2028'
where institution_name='University of Waterloo'
  and title='Pharmacy'
  and credential_type='Undergraduate program';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='jan_2027_closed_next_jan_2028_application_opens_september_2026',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Waterloo PharmD page reviewed 2026-08-08: January 2027 applications are closed; the next January 2028 application cycle opens in September 2026. International-background applicants are supported subject to the published PharmD admission requirements.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Waterloo'
  and c.title='Pharmacy'
  and c.credential_type='Undergraduate program';

update public.program_catalog_ca_staging
set official_program_url=case
      when credential_type='PhD' then 'https://uwaterloo.ca/future-graduate-students/programs/by-faculty/science/pharmacy-doctor-philosophy-phd'
      else 'https://uwaterloo.ca/pharmacy/graduate-studies/master-science-and-doctor-philosophy-pharmacy'
    end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_research_not_pharmacist_qualification'
where institution_name='University of Waterloo'
  and title='Pharmacy'
  and credential_type in ('MSc','PhD');

update public.program_catalog_ca_staging
set source_status='legacy_duplicate_shadow_current_detailed_program',
    source_as_of='2026-08-08'
where institution_name='University of Waterloo'
  and (
    (title='Computer Science' and credential_type in ('Undergraduate program','PhD','MMath'))
    or (title='Computer Science (Quantum Information)' and credential_type='MMath')
  );

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='pharmacist' and c.credential_type in ('MSc','PhD') then 'rejected'
      when o.canonical_career_id='software-developer'
        and c.source_status='legacy_duplicate_shadow_current_detailed_program' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='pharmacist' and c.credential_type in ('MSc','PhD') then null
      when o.canonical_career_id='software-developer'
        and c.source_status='legacy_duplicate_shadow_current_detailed_program' then null
      when o.canonical_career_id='accountant' and c.credential_type='PhD' then 'related'
      when o.canonical_career_id='accountant' and c.title='Mathematics and Chartered Professional Accountancy' then 'common_pathway'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer') and c.credential_type<>'Undergraduate program' then 'related'
      when o.canonical_career_id='data-analyst' and c.title='Geospatial Data Analysis' then 'related'
      when o.canonical_career_id in ('data-analyst','data-engineer') then 'common_pathway'
      when o.canonical_career_id='financial-analyst' and c.credential_type='PhD' then 'related'
      when o.canonical_career_id='financial-analyst' then 'common_pathway'
      when o.canonical_career_id='mechanical-engineer' and c.title='Mechatronics Engineering' then 'common_pathway'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' and c.credential_type in ('MES','PhD') then 'related'
      when o.canonical_career_id='sustainability-specialist' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='pharmacist' and c.credential_type in ('MSc','PhD') then 'Rejected for pharmacist occupation: Waterloo explicitly states its Pharmacy MSc and PhD are thesis/research degrees and do not qualify graduates to practise pharmacy in Canada; the PharmD row is the entry-to-practice pathway.'
      when o.canonical_career_id='pharmacist' and c.credential_type='Undergraduate program' then 'Direct pharmacist pathway: Waterloo PharmD prepares pharmacists. January 2027 is closed and the next January 2028 cycle opens in September 2026, so current international publication remains held by admission timing.'
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_detailed_program' then 'Rejected aggregate catalogue shadow because a current detailed Waterloo Computer Science program row with an official program page is already present.'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer') and c.credential_type<>'Undergraduate program' then 'Graduate engineering study is relevant advanced education but is not treated as the first professional engineering credential; relation limited to related.'
      else 'Reviewed 2026-08-08 against Waterloo program title/credential and regulated-role level; occupation relevance is kept separate from current international admission timing.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of Waterloo'
  and o.review_status='candidate';;
