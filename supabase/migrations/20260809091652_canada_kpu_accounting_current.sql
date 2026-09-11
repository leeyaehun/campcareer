-- Canada Programs Phase 3: verify current KPU Post-Baccalaureate Diploma in Accounting availability and provider PGWP evidence.
-- Evidence checked 2026-08-09 against current KPU program, extended-application and international post-baccalaureate pages.

update public.program_catalog_ca_staging
set official_program_url='https://www.kpu.ca/melville/pbda',
    source_url='https://www.kpu.ca/melville/pbda',
    source_as_of='2026-08-09',
    source_status='official_program_page_verified_currently_accepting_extended_fall_2026'
where institution_name='Kwantlen Polytechnic University'
  and title='Accounting'
  and credential_type='Post-Baccalaureate Diploma';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2026_extended_application_window_current_space_permitting_international_contact_route',
    ircc_program_eligible=true,
    pgwp_program_status='kpu_provider_international_postbaccalaureate_page_pgwp_eligible',
    source_url='https://www.kpu.ca/post-bac-programs',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' KPU Accounting Post-Baccalaureate Diploma reviewed 2026-08-09: the current Melville School program page states Availability: Currently accepting applications. KPU Extended Applications lists Accounting PBD among Fall 2026 limited-intake programs that may still accept applications after July 1 and explicitly provides an International Admissions contact route. KPU international post-baccalaureate guidance identifies Accounting among post-baccalaureate programs whose graduates are eligible to apply for PGWP. Extended admission remains space permitting.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Kwantlen Polytechnic University'
  and c.title='Accounting'
  and c.credential_type='Post-Baccalaureate Diploma';;
