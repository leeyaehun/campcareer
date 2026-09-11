-- Canada Programs Phase 3: correct BCIT Applied Computer Science (Database Option) program-specific PGWP evidence
-- and restore the missing database-administrator occupation pathway.
-- Current intake availability remains held because the public program page does not establish a current international application-open state.

update public.program_catalog_ca_staging
set official_program_url='https://www.bcit.ca/programs/applied-computer-science-database-option-bachelor-of-science-full-time-part-time-8670bsc/',
    source_as_of='2026-08-08',
    source_status='official_program_page_and_international_pgwp_list_verified'
where institution_name='British Columbia Institute of Technology'
  and title='Applied Computer Science (Database Option)'
  and credential_type='Bachelor of Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    pgwp_rule_category='degree_no_field_of_study_requirement',
    field_of_study_required=false,
    field_of_study_eligible=null,
    ircc_program_eligible=true,
    pgwp_program_status='official_bcit_international_program_list_pgwp_eligible_degree',
    international_program_admission_status='program_level_international_admission_not_yet_verified',
    source_url='https://www.bcit.ca/international-students/programs-and-tuition/',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes='BCIT International Programs and Tuition page reviewed 2026-08-08: Applied Computer Science (Database Option), Bachelor of Science (8670BSC) is explicitly listed as available to international students and PGWP eligible. The earlier program_pgwp_noneligible status was incorrect and is superseded by this program-specific provider evidence. Current intake application availability is still not established by the public listing and therefore remains held as not yet verified.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='British Columbia Institute of Technology'
  and c.title='Applied Computer Science (Database Option)'
  and c.credential_type='Bachelor of Science';

insert into public.program_occupation_ca_staging (
  program_catalog_id,canonical_career_id,rule_version,match_basis,match_pattern,
  review_status,relation_type,source_checked_at,reviewer_note,matched_at,reviewed_at
)
select c.id,'database-administrator','ca-phase3-bcit-database-2026-08-08','manual','bcit_applied_computer_science_database_option',
       'approved','common_pathway','2026-08-08',
       'BCIT Applied Computer Science (Database Option) is a current Bachelor of Science program focused on database/application computing and is a strong common pathway to database-administrator roles. BCIT explicitly lists the program for international students and as PGWP eligible; current intake application availability remains separately unverified.',now(),now()
from public.program_catalog_ca_staging c
where c.institution_name='British Columbia Institute of Technology'
  and c.title='Applied Computer Science (Database Option)'
  and c.credential_type='Bachelor of Science'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='common_pathway',source_checked_at='2026-08-08',reviewer_note=excluded.reviewer_note,reviewed_at=now();;
