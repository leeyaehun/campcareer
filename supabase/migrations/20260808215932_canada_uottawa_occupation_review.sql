-- Canada Programs Phase 3: University of Ottawa occupation review and selected current program URL verification.
-- Occupation relevance is reviewed independently of still-unverified program-level international intake availability.

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Graduate Diploma Chartered Professional Accountancy' then 'https://telfer.uottawa.ca/en/graduate-diploma-in-chartered-professional-accountancy'
      when title='Master of Health Sciences Occupational Therapy' then 'https://catalogue.uottawa.ca/en/graduate/master-health-sciences-occupational-therapy/'
      when title='Master of Health Sciences Physiotherapy' then 'https://www.uottawa.ca/faculty-health-sciences/rehabilitation/our-programs/master-of-health-sciences-physiotherapy-mhsc'
      else official_program_url end,
    source_as_of='2026-08-08',
    source_status=case
      when title='Graduate Diploma Chartered Professional Accountancy' then 'official_program_page_verified_cpa_professional_pathway_canadian_degree_required'
      when title='Master of Health Sciences Occupational Therapy' then 'official_program_page_verified_entry_to_practice_ot'
      when title='Master of Health Sciences Physiotherapy' then 'official_program_page_verified_accredited_entry_to_practice_pt'
      else source_status end
where institution_name='University of Ottawa'
  and title in ('Graduate Diploma Chartered Professional Accountancy','Master of Health Sciences Occupational Therapy','Master of Health Sciences Physiotherapy');

update public.program_pgwp_ca_staging p
set international_program_admission_status='professional_program_current_intake_availability_not_yet_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || case
      when c.title='Graduate Diploma Chartered Professional Accountancy' then ' uOttawa/Telfer CPA Graduate Diploma reviewed 2026-08-08: the program directly covers CPA PEP Core/Elective content and prepares students for capstones. Admission requires a Canadian bachelor degree and international degree equivalencies are not accepted; current intake-specific international publishability is therefore not inferred.'
      when c.title='Master of Health Sciences Occupational Therapy' then ' uOttawa MHSc Occupational Therapy catalogue reviewed 2026-08-08: this is the professional OT master program and international degree equivalencies are addressed, but current intake-specific international seat availability was not established.'
      else ' uOttawa MHSc Physiotherapy program reviewed 2026-08-08: the program is PEAC-accredited and is the professional physiotherapy pathway; international degree equivalencies are addressed, but current intake-specific international seat availability was not established.' end
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Ottawa'
  and c.title in ('Graduate Diploma Chartered Professional Accountancy','Master of Health Sciences Occupational Therapy','Master of Health Sciences Physiotherapy');

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','environmental-engineer','mechanical-engineer') then 'related'
      when o.canonical_career_id='counsellor' and c.credential_type='Doctorate' then 'related'
      when o.canonical_career_id='counsellor' then 'direct'
      when o.canonical_career_id='registered-nurse' then 'related'
      when o.canonical_career_id='social-worker' and c.credential_type='Doctorate' then 'related'
      when o.canonical_career_id='social-worker' then 'direct'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' and c.credential_type='Doctorate' then 'related'
      when o.canonical_career_id='sustainability-specialist' then 'direct'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='accountant' then 'Direct professional-accountancy pathway: the Telfer CPA Graduate Diploma covers CPA PEP Core/Elective content and prepares students for the capstone modules; current international intake publishability remains held.'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','environmental-engineer','mechanical-engineer') then 'Graduate engineering study is advanced technical/research education rather than the first accredited professional engineering credential; relation limited to related.'
      when o.canonical_career_id='counsellor' and c.credential_type='Doctorate' then 'Doctoral Educational Counselling is advanced/research professional study; relation limited to related.'
      when o.canonical_career_id='counsellor' then 'MEd Counselling Psychology is direct counselling-focused professional graduate education.'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') then 'Direct professional rehabilitation degree. uOttawa official program pages describe the entry-to-practice OT/PT curriculum; international intake availability remains a separate publication check.'
      when o.canonical_career_id='registered-nurse' then 'Graduate Nursing MSc/PhD programs are advanced/post-licensure nursing education rather than the first RN credential; relation limited to related.'
      when o.canonical_career_id='social-worker' and c.credential_type='Doctorate' then 'Social Work PhD is advanced research education, not the first professional social-work credential; relation limited to related.'
      when o.canonical_career_id='social-worker' then 'Master of Social Work is direct professional social-work education.'
      else 'Reviewed 2026-08-08 against uOttawa current credential scope and regulated-role level; occupation relevance is separated from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of Ottawa'
  and o.review_status='candidate';;
