-- Canada Programs Phase 3: normalize UCalgary Computer Science, Data Science and Information Security graduate international admissions.
-- Evidence checked 2026-08-09 against current UCalgary Faculty of Graduate Studies / Faculty of Science program pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_11_01_deadline_2027_03_01',
    source_url='https://science.ucalgary.ca/computer-science/future-students/graduate/admission-requirements',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UCalgary Computer Science graduate admissions reviewed 2026-08-09: applications for a September start open November 1; the international final deadline is March 1. The January 2027 international deadline of July 1 has already passed, so the next Fall cycle is not yet open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Calgary'
  and ((c.title='Computer Science' and c.credential_type='Doctor of Philosophy (PhD)')
    or (c.title='Computer Science - Thesis-based' and c.credential_type='Master of Science (MSc)'));

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='international_ineligible_laddered_credential_international_applicants_must_apply_directly_to_mdsa',
    source_url=c.official_program_url,
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || case
      when c.credential_type='Graduate Certificate' then ' UCalgary Data Science and Analytics Certificate reviewed 2026-08-09: the official program page states international applicants should apply directly to the Master degree; the certificate is the domestic ladder entry and is not treated as a standalone international publication target.'
      else ' UCalgary Data Science and Analytics Diploma reviewed 2026-08-09: the official program page states this program is not open for international applications and international students should apply directly to the Master of Data Science and Analytics.' end
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Calgary'
  and c.title='Data Science and Analytics'
  and c.credential_type in ('Graduate Certificate','Graduate Diploma');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_09_01_deadline_2027_04_02',
    source_url='https://grad.ucalgary.ca/future-students/graduate/discover-opportunities/explore-programs/data-science-and-analytics-mdsa-course',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UCalgary MDSA reviewed 2026-08-09: Fall applications open September 1 and the international deadline is April 2. International applicants apply directly to the Master rather than the laddered certificate/diploma. Fall 2027 is therefore not yet open as of August 9, 2026.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Calgary'
  and c.title='Data Science and Analytics'
  and c.credential_type='Master of Data Science and Analytics (MDSA)';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_09_01_deadline_2027_04_02',
    source_url='https://grad.ucalgary.ca/future-students/graduate/discover-opportunities/explore-programs/information-security-and-privacy-misp-course',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UCalgary MISP reviewed 2026-08-09: Fall applications open September 1 and the international deadline is April 2. International students apply directly to the Master of Information Security and Privacy. Fall 2027 is therefore not yet open as of August 9, 2026.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Calgary'
  and c.title='Information Security and Privacy'
  and c.credential_type='Master of Information Security and Privacy (MISP)';;
