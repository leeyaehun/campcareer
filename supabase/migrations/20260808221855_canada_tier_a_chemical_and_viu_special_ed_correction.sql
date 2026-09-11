-- Canada Programs Phase 3: promote verified Concordia Chemical Engineering to publication Tier A
-- and correct VIU Master of Education in Special Education admission/PGWP evidence.
-- Evidence checked 2026-08-08 against current provider pages.

-- Concordia Chemical Engineering (BEng): Winter 2027 international applications are already verified Open.
-- Add the missing official current program URL so the reviewed program can publish as Tier A.
update public.program_catalog_ca_staging
set official_program_url='https://www.concordia.ca/academics/undergraduate/chemical-engineering.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_winter_2027_international_open'
where institution_name='Concordia University'
  and title='Chemical Engineering'
  and credential_type='BEng';

update public.program_pgwp_ca_staging p
set source_url='https://www.concordia.ca/academics/undergraduate/chemical-engineering.html',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Concordia Chemical Engineering BEng page reviewed 2026-08-08: current official program page confirms the BEng, Fall/Winter start terms and international qualification routes. Winter 2027 international application availability was already verified Open in the Concordia availability migration.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Concordia University'
  and c.title='Chemical Engineering'
  and c.credential_type='BEng';

-- VIU M.Ed. Special Education: provider-specific evidence overrides the earlier broad institutional PGWP assumption.
-- International Fall 2026 applications are closed and the program page explicitly says completion does not make
-- international students eligible for a Post-Graduation Work Permit.
update public.program_catalog_ca_staging
set official_program_url='https://www.viu.ca/programs/education/master-education-special-education',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_international_closed_not_pgwp_eligible'
where institution_name='Vancouver Island University'
  and title='Master of Education in Special Education'
  and credential_type='Master Degree';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2026_international_closed_next_intake_not_yet_verified',
    ircc_program_eligible=false,
    pgwp_program_status='official_provider_states_program_not_pgwp_eligible',
    source_url='https://www.viu.ca/programs/education/master-education-special-education',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes='VIU Master of Education in Special Education provider page reviewed 2026-08-08. The International section lists the September 2026 part-time intake as closed and explicitly states that completion of this program does not make students eligible for a Post-Graduation Work Permit. This program-specific evidence supersedes the earlier institution-wide degree PGWP assumption.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title='Master of Education in Special Education'
  and c.credential_type='Master Degree';;
