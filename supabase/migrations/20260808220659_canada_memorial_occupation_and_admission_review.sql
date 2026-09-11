-- Canada Programs Phase 3: Memorial University occupation review and targeted professional-program admission verification.
-- Evidence checked 2026-08-08 against current Memorial Pharmacy and Nursing admissions pages.

-- Entry-to-practice PharmD explicitly accepts international applicants; current next-entry application timing is not clearly published on the live page.
update public.program_catalog_ca_staging
set official_program_url='https://www.mun.ca/pharmacy/programs-and-admissions/doctor-of-pharmacy-entry-to-practice-pharmd/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_entry_to_practice_international_supported_next_cycle_timing_unverified'
where institution_name='Memorial University of Newfoundland'
  and title='Doctor of Pharmacy' and credential_type='Professional Doctorate';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='entry_to_practice_pharmd_international_applicants_supported_next_application_timing_not_yet_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Memorial Entry-to-Practice PharmD admissions reviewed 2026-08-08: the school publishes a dedicated international applicant fee and international tuition, confirming international applicants are supported. The live page still shows an older application-deadline reference, so the next intake open status is intentionally not inferred.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Memorial University of Newfoundland'
  and c.title='Doctor of Pharmacy' and c.credential_type='Professional Doctorate';

-- Pharmacy MSc/PhD are research graduate programs rather than the entry-to-practice pharmacist degree.
update public.program_catalog_ca_staging
set source_status='official_catalog_research_pharmacy_not_entry_to_practice',
    source_as_of='2026-08-08'
where institution_name='Memorial University of Newfoundland'
  and title='Pharmacy' and credential_type in ('MSc','PhD');

-- Four-year BScN supports international applicants; Fall 2027 applications open September 10, 2026.
update public.program_catalog_ca_staging
set official_program_url='https://www.mun.ca/nursingadmissions/program-information/four-year-option/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_fall_2027_international_not_yet_open'
where institution_name='Memorial University of Newfoundland'
  and title='Bachelor of Science in Nursing (four-year option)';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_09_10',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Memorial BScN four-year Nursing admissions reviewed 2026-08-08: international applicants are encouraged to apply; Fall 2027 applications open September 10, 2026 and close January 20, 2027.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Memorial University of Newfoundland'
  and c.title='Bachelor of Science in Nursing (four-year option)';

-- Accelerated BScN is site-dependent: St. Johns is paused while Western Regional remains open; Fall 2027 applications open September 10.
update public.program_catalog_ca_staging
set official_program_url='https://www.mun.ca/nursingadmissions/program-information/accelerated-option/',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_multi_site_stjohns_paused_wrson_open_fall_2027_not_yet_open'
where institution_name='Memorial University of Newfoundland'
  and title='Bachelor of Science in Nursing (three-year accelerated option)';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_application_not_yet_open_opens_2026_09_10_accelerated_stjohns_paused_wrson_open',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Memorial accelerated BScN reviewed 2026-08-08: St. Johns Faculty of Nursing is paused/not accepting new accelerated students while Western Regional School of Nursing remains open; Fall 2027 applications open September 10, 2026. The aggregate staging row remains held because site availability differs.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Memorial University of Newfoundland'
  and c.title='Bachelor of Science in Nursing (three-year accelerated option)';

-- Review all remaining Memorial occupation candidates independently of publication state.
update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy' and c.credential_type in ('MSc','PhD') then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy' and c.credential_type in ('MSc','PhD') then null
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') then 'related'
      when o.canonical_career_id='data-engineer' then 'common_pathway'
      when o.canonical_career_id='registered-nurse' and c.credential_type in ('MScN','PhD') then 'related'
      when o.canonical_career_id='social-worker' and c.credential_type='PhD' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='special-education-teacher' then 'related'
      when o.canonical_career_id='supply-chain-analyst' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='pharmacist' and c.title='Doctor of Pharmacy' then 'Direct pharmacist pathway: Memorial Entry-to-Practice PharmD leads to national licensing examination eligibility and explicitly supports international applicants; next application timing remains unverified.'
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy' then 'Rejected: Pharmacy MSc/PhD are research graduate programs, distinct from Memorial Entry-to-Practice PharmD pharmacist qualification.'
      when o.canonical_career_id='registered-nurse' and c.credential_type='Bachelor Degree' then 'Direct RN professional pathway. International applicants are supported; the four-year and accelerated options have separate current site/intake timing.'
      when o.canonical_career_id='registered-nurse' then 'Graduate Nursing is advanced/post-licensure nursing education rather than the first RN credential; relation limited to related.'
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') then 'Graduate engineering degree is advanced technical/research education and is not treated as the first accredited professional engineering credential; relation limited to related.'
      when o.canonical_career_id='social-worker' and c.credential_type='PhD' then 'Social Work PhD is advanced research study rather than first professional qualification; relation limited to related.'
      else 'Reviewed 2026-08-08 against Memorial current credential scope and regulated-role level; occupation relevance is separated from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Memorial University of Newfoundland'
  and o.review_status='candidate';;
