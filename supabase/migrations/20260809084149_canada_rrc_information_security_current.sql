-- Canada Programs Phase 3: canonicalize RRC Polytech Information Security to its current post-graduate diploma.
-- Evidence checked 2026-08-09 against current RRC catalogue and International Education availability list.

update public.program_catalog_ca_staging
set credential_type='Post-Graduate Diploma',
    education_level='Postgraduate',
    official_program_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/ISECF-PG',
    source_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/ISECF-PG',
    source_as_of='2026-08-09',
    source_status='official_current_program_verified_information_security_postgraduate_diploma_international_open'
where institution_name='Red River College Polytechnic'
  and title='Information Security'
  and credential_type='Advanced Diploma';

update public.program_pgwp_ca_staging p
set credential_type='Post-Graduate Diploma',
    education_level='Postgraduate',
    international_students_eligible=true,
    international_program_admission_status='september_2026_international_application_open',
    cip_code='11.1003',
    field_of_study_required=true,
    field_of_study_eligible=true,
    ircc_program_eligible=true,
    pgwp_program_status='rrc_international_list_pgwp_eligible_cip_11_1003_current_open',
    source_url='https://www.rrc.ca/international/study-at-rrc/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Information Security reviewed 2026-08-09: current catalogue program ISECF-PG is a two-year Post-Graduate Diploma. RRC International Education lists it under PGWP-eligible programs with CIP 11.1003 and September 2026 international availability Open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Information Security'
  and c.credential_type='Post-Graduate Diploma';

update public.program_occupation_ca_staging o
set source_checked_at='2026-08-09',reviewed_at=now(),
    reviewer_note='RRC Information Security is confirmed as the current two-year Post-Graduate Diploma (ISECF-PG); September 2026 international applications are Open and RRC lists CIP 11.1003 as PGWP eligible. Occupation relevance remains approved.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Information Security'
  and c.credential_type='Post-Graduate Diploma'
  and o.review_status='approved';;
