-- Canada Programs Phase 3: verify current international application windows for SAIT Supply Chain diploma and two BCIT Flexible Learning marketing certificates.
-- Evidence checked 2026-08-09 against live SAIT and BCIT program/international pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2026_winter_2027_spring_2027_international_application_windows_open_program_apply_now',
    source_url='https://www.sait.ca/programs-and-courses/diplomas/business-administration-supply-chain-management',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' SAIT Business Administration - Supply Chain Management reviewed 2026-08-09: the live program page provides Apply and lists international application opening dates of Aug 1, 2025 for Fall 2026, Dec 7, 2025 for Winter 2027, and Mar 4, 2026 for Spring 2027. All three application windows have opened; Fall 2027 availability is still to be announced. Exact PGWP/CIP state remains separate and is not inferred.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Southern Alberta Institute of Technology'
  and c.title='Business Administration - Supply Chain Management Major' and c.credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_application_open_deadline_2026_11_01_flexible_learning',
    source_url='https://www.bcit.ca/international-applicants/flexible-credential-programs/',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' BCIT Flexible Learning Marketing reviewed 2026-08-09: BCIT international Flexible Credential Programs lists this certificate as international. Flexible Learning marketing programs accept applications throughout the year; Winter international applications have a November 1 deadline. Winter 2027 is therefore currently open. PGWP status is not inferred from international availability.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='British Columbia Institute of Technology'
  and c.title in ('Marketing Management (Marketing Communications Option)','Marketing Management (Professional Sales Option)')
  and c.credential_type='Certificate';;
