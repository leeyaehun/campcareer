-- Canada Programs Phase 3: verify the current BCIT Applied Computer Science (Database Option) international intake.
-- Evidence checked 2026-08-09 against the official BCIT program page and international-program list.

update public.program_catalog_ca_staging
set official_program_url='https://www.bcit.ca/programs/applied-computer-science-database-option-bachelor-of-science-full-time-part-time-867cbsc/',
    source_url='https://www.bcit.ca/programs/applied-computer-science-database-option-bachelor-of-science-full-time-part-time-867cbsc/',
    source_as_of='2026-08-09',
    source_status='official_program_page_verified_winter_2027_international_open'
where institution_name='British Columbia Institute of Technology'
  and title='Applied Computer Science (Database Option)'
  and credential_type='Bachelor of Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_application_open_deadline_2026_11_01',
    ircc_program_eligible=true,
    pgwp_program_status='official_bcit_international_program_list_pgwp_eligible_degree',
    source_url='https://www.bcit.ca/programs/applied-computer-science-database-option-bachelor-of-science-full-time-part-time-867cbsc/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' BCIT Database Option BSc reviewed 2026-08-09: the official program page shows Apply Now. Full-time Winter (January) applications open May 1 and the international deadline is November 1; therefore the January 2027 international application window is currently open. The BCIT international-program list marks the degree as international and PGWP eligible.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='British Columbia Institute of Technology'
  and c.title='Applied Computer Science (Database Option)'
  and c.credential_type='Bachelor of Science';

update public.program_occupation_ca_staging o
set review_status='approved',relation_type='common_pathway',source_checked_at='2026-08-09',reviewed_at=now(),
    reviewer_note='BCIT Applied Computer Science Database Option BSc provides advanced database design, administration, optimization, security and data warehousing training. The January 2027 international application window is currently open through November 1, 2026.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='British Columbia Institute of Technology'
  and c.title='Applied Computer Science (Database Option)'
  and c.credential_type='Bachelor of Science'
  and o.canonical_career_id='database-administrator';;
