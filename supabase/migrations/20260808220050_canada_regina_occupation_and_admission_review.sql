-- Canada Programs Phase 3: University of Regina occupation review and targeted international-admission verification.
-- Evidence checked 2026-08-08 against current U of R undergraduate deadlines and international application guides.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2026_international_general_application_open_until_2026_08_15_program_capacity_applies',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Regina undergraduate deadlines reviewed 2026-08-08: the international Fall final deadline for ALL PROGRAMS except listed competitive-entry exceptions is August 15, 2026. Program capacity and faculty-specific admission requirements still apply.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Regina'
  and c.title in ('Accounting','Data Science','Geography and Environmental Studies','Resource and Environmental Studies','Digital Marketing','Computer Science','User Experience Design')
  and c.credential_type in ('Bachelor''s Degree','Certificate','Diploma');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='scbscn_international_apply_via_saskatchewan_polytechnic_current_intake_availability_not_yet_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Regina international Nursing guide reviewed 2026-08-08: international applicants to the four-year SCBScN (including bilingual option) apply directly to Saskatchewan Polytechnic. The aggregate U of R row remains held pending partner-specific current intake availability.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Regina'
  and c.title like 'Saskatchewan Collaborative Bachelor of Science in Nursing%';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='bsw_competitive_entry_annual_january_15_current_next_intake_open_status_not_yet_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Regina Social Work international guide reviewed 2026-08-08: international applicants are supported for BSW and the annual BSW application/transcript deadline is January 15. Current next-intake application-open status is not inferred from the recurring deadline alone.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Regina'
  and c.title in ('Social Work','Bachelor of Social Work – Bilingual Option','Bachelor of Social Work After Degree');

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('data-analyst','data-engineer') then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' then 'common_pathway'
      when o.canonical_career_id='film-editor' then 'common_pathway'
      when o.canonical_career_id='human-resources-specialist' and c.title='Adult Education and Human Resources Development' then 'related'
      when o.canonical_career_id='registered-nurse' and c.title like 'Saskatchewan Collaborative Bachelor of Science in Nursing%' then 'direct'
      when o.canonical_career_id='registered-nurse' then 'related'
      when o.canonical_career_id='social-worker' and c.credential_type in ('Master of Social Work (MSW)','Master of Indigenous Social Work (MISW)','Bachelor''s Degree','After Degree') then 'direct'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.title like 'Saskatchewan Collaborative Bachelor of Science in Nursing%' then 'Direct RN professional pathway. International applicants to the four-year SCBScN apply through Saskatchewan Polytechnic, so publication remains partner/intake-specific.'
      when o.canonical_career_id='registered-nurse' then 'Graduate Nursing and Nursing Education/Leadership programs are advanced/post-licensure education rather than the first RN credential; relation limited to related.'
      when o.canonical_career_id='social-worker' then 'BSW/after-degree BSW/MSW/MISW are direct social-work education pathways; current international admission timing remains separate from occupation relevance.'
      when o.canonical_career_id='human-resources-specialist' and c.title='Adult Education and Human Resources Development' then 'Adult Education and HR Development is relevant organizational/workforce education but broader than a direct HR specialist credential; relation limited to related.'
      when o.canonical_career_id='film-editor' then 'Film Production MFA is a common production pathway that can lead to film-editing roles, but is not an editor-specific occupational credential.'
      else 'Reviewed 2026-08-08 against University of Regina current program title, credential and role level; occupation relevance is separated from international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of Regina'
  and o.review_status='candidate';;
