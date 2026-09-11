-- Canada Programs Phase 3: replace generic admission-unverified for four more RRC programs with explicit current restrictions.
-- Evidence checked 2026-08-09 against current RRC catalogue and provider international program guidance.

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',source_status='official_current_program_verified_manitoba_residents_only'
where institution_name='Red River College Polytechnic' and title='Veterinary Technology' and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='international_ineligible_manitoba_residents_only_refugee_study_permit_exception_requires_manitoba_residency',
    source_url='https://catalogue.rrc.ca/Programs/WPG/Fulltime/ANIHF-DP/PrinterFriendly',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Veterinary Technology reviewed 2026-08-09: the current programme is a funded high-demand Manitoba-residents-only program; non-Manitoba applications are cancelled. A narrow exception exists for refugee-status applicants who are Manitoba residents and hold a study permit. It is not a general international-student admission route.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic'
  and c.title='Veterinary Technology' and c.credential_type='Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',source_status='official_current_program_verified_manitoba_residents_only'
where institution_name='Red River College Polytechnic' and title='Welding - Women of Steel' and credential_type='Applied Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='international_ineligible_manitoba_residents_only_refugee_study_permit_exception_requires_manitoba_residency',
    source_url='https://catalogue.rrc.ca/Programs/WPG/Fulltime/WELWF-AT',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Welding - Women of Steel reviewed 2026-08-09: the current catalogue explicitly limits this high-demand program to Manitoba residents; non-Manitoba applications are cancelled. Refugee-status applicants must still be Manitoba residents. This is not a general international-student admission route.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic'
  and c.title='Welding - Women of Steel' and c.credential_type='Applied Certificate';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',source_status='official_current_program_verified_conditional_out_of_province_international_consideration'
where institution_name='Red River College Polytechnic' and title='Baking and Pastry Arts' and credential_type='Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='restricted_not_yet_open_for_international_september_2027_considered_only_if_seats_available_three_months_before_start',
    ircc_program_eligible=false,
    pgwp_program_status='rrc_official_noneligible_pgwp_list_legacy_name_maps_to_current_renamed_program',
    source_url='https://catalogue.rrc.ca/Programs/WPG/FullTime/BAKPF-CT',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Baking and Pastry Arts reviewed 2026-08-09: the current renamed program usually fills with Manitoba residents. Out-of-province and international applicants may apply but are considered only if seats remain three months before the start. The next estimated start is September 1, 2027, so international consideration is not currently open. The provider non-PGWP state from the explicitly renamed former Professional Baking and Pastry program remains applicable.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic'
  and c.title='Baking and Pastry Arts' and c.credential_type='Certificate';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',source_status='official_current_joint_program_requires_university_of_winnipeg_years_1_and_2'
where institution_name='Red River College Polytechnic' and title='Applied Environmental Studies' and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='restricted_not_open_standalone_apply_to_university_of_winnipeg_complete_years_1_and_2_before_rrc_year_3',
    source_url='https://catalogue.rrc.ca/Programs/WPG/Fulltime/APPEF-DP/AdmissionRequirements',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Applied Environmental Studies reviewed 2026-08-09: this is a five-year joint University of Winnipeg/RRC program. Applicants must apply to University of Winnipeg and complete Years 1 and 2 before applying to RRC for Year 3. This RRC row is therefore held as a non-standalone entry identity.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic'
  and c.title='Applied Environmental Studies' and c.credential_type='Diploma';;
