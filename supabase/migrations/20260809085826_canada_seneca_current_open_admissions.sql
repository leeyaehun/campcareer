-- Canada Programs Phase 3: synchronize selected Seneca rows with current program-level international availability.
-- Evidence checked 2026-08-09 against live Seneca program availability pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='september_2026_january_2027_may_2027_international_open',
    source_url='https://www.senecapolytechnic.ca/programs/fulltime/DMM.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Seneca DMM reviewed 2026-08-09: the live program page lists International Applicants as Open for September 2026, January 2027 and May 2027, and identifies the program as PGWP eligible.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Seneca Polytechnic'
  and c.title='Digital & Social Media Marketing'
  and c.credential_type='Ontario College Graduate Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='september_2026_january_2027_may_2027_international_open',
    source_url='https://www.senecapolytechnic.ca/programs/fulltime/PME.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Seneca PME reviewed 2026-08-09: the live program page lists International Applicants as Open for September 2026, January 2027 and May 2027, and identifies the program as PGWP eligible.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Seneca Polytechnic'
  and c.title='Project Management – Environmental'
  and c.credential_type='Ontario College Graduate Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='september_2026_january_2027_international_open',
    source_url='https://www.senecapolytechnic.ca/programs/fulltime/BBM.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Seneca revised Honours Bachelor of Commerce reviewed 2026-08-09: the live program page lists International Applicants as Open for September 2026 and January 2027 and identifies the degree as PGWP eligible. Accounting, Business Management, Human Resources Management, Marketing and Supply Chain Management are current majors in the revised BBM.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Seneca Polytechnic'
  and c.title='Honours Bachelor of Commerce – Business Management'
  and c.credential_type='Bachelor Degree';;
