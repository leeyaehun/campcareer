-- Canada Programs Phase 3: normalize RRC hospitality program succession without deleting historical programme identities.
-- Evidence checked 2026-08-09 against current RRC catalogue pages.

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='legacy_parent_shadow_modified_to_hospitality_business_management_fall_2025'
where institution_name='Red River College Polytechnic'
  and title='Hospitality and Tourism Management'
  and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='legacy_program_modified_to_hospitality_business_management_fall_2025',
    source_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/HOSTF-DP',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC catalogue reviewed 2026-08-09: Hospitality and Tourism Management has been modified and offered as Hospitality Business Management since Fall 2025. This row is retained as a historical programme identity, not a current new-entry publication target.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Hospitality and Tourism Management'
  and c.credential_type='Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='not_accepting_current_2026_successor_points_to_business_admin_tourism'
where institution_name='Red River College Polytechnic'
  and title='Hospitality Business Management'
  and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_not_accepting_since_2026_05_01_successor_path_business_administration_tourism_management',
    source_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/HOBMF-DP',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC current catalogue reviewed 2026-08-09: Hospitality Business Management is no longer accepting applications effective May 1, 2026 and directs prospective students to Business Administration - Tourism Management.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Hospitality Business Management'
  and c.credential_type='Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='legacy_second_year_major_no_future_start_dates'
where institution_name='Red River College Polytechnic'
  and title='Hotel & Restaurant Management'
  and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='legacy_second_year_major_no_future_start_dates_current_new_entry_not_available',
    source_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/HOTRF-DP/LocationsDatesandFees',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC catalogue reviewed 2026-08-09: Hotel & Restaurant Management is a Year 2 major requiring the former Hospitality and Tourism Management Year 1, and the catalogue states to check back later for future start dates. Relation remains educationally relevant but the row is held from current publication.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Hotel & Restaurant Management'
  and c.credential_type='Diploma';

update public.program_occupation_ca_staging o
set review_status='rejected',relation_type=null,source_checked_at='2026-08-09',reviewed_at=now(),
    reviewer_note='Rejected legacy programme identity for current publication: RRC modified Hospitality and Tourism Management into Hospitality Business Management in Fall 2025; current prospective students are now directed toward Business Administration - Tourism Management.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Hospitality and Tourism Management'
  and c.credential_type='Diploma'
  and o.canonical_career_id='tourism-manager';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_current_second_year_specialization_after_sicd_foundation'
where institution_name='Red River College Polytechnic'
  and title='Community Development'
  and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='restricted_not_open_standalone_requires_social_innovation_and_community_development_foundation_year',
    source_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/CDEVF-DP',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC catalogue reviewed 2026-08-09: Community Development is a diploma-year specialization available after completion of the Social Innovation and Community Development foundation year. It is not treated as a standalone new international entry programme.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Community Development'
  and c.credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='september_2026_closed_september_2027_international_application_open',
    cip_code='44.0201',
    field_of_study_required=true,
    field_of_study_eligible=true,
    ircc_program_eligible=true,
    pgwp_program_status='rrc_current_international_table_pgwp_eligible_cip_44_0201',
    source_url='https://www.rrc.ca/international/study-at-rrc/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC International Education reviewed 2026-08-09: Social Innovation and Community Development is PGWP eligible under CIP 44.0201; September 2026 is Closed and September 2027 is Open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Social Innovation and Community Development'
  and c.credential_type='Diploma';;
