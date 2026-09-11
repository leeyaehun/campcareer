-- Canada Programs Phase 3: verify current Winter 2027 international admission for selected USask undergraduate programs.
-- Evidence checked 2026-08-09 against current University of Saskatchewan admissions pages.

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_program_and_admissions_page_verified_winter_2027_international_open'
where institution_name='University of Saskatchewan'
  and title='Animal Science'
  and credential_type='Bachelor of Science in Agriculture (B.S.A.)';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_application_open_deadline_2026_09_01',
    source_url='https://admissions.usask.ca/animal-science.php',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' USask Animal Science admissions reviewed 2026-08-09: the B.S.A. is direct-entry, the official page lists Winter January 2027 with an international application deadline of September 1, 2026, and offers a current Begin an application action.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Saskatchewan'
  and c.title='Animal Science'
  and c.credential_type='Bachelor of Science in Agriculture (B.S.A.)';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_program_and_admissions_page_verified_winter_2027_bsc_pathway_open'
where institution_name='University of Saskatchewan'
  and title in ('Applied Computing - Data Analytics','Applied Computing - Data Analytics - Honours')
  and credential_type in ('Bachelor of Science (B.Sc. Four-year)','Bachelor of Science Honours (B.Sc. Honours)');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='winter_2027_international_bsc_entry_open_deadline_2026_09_01_applied_computing_major_declared_after_first_year',
    source_url='https://admissions.usask.ca/applied-computing.php',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' USask Applied Computing admissions reviewed 2026-08-09: new students apply to the College of Arts and Science B.Sc.; Winter January 2027 international applications are open through September 1, 2026. Applied Computing major selection occurs competitively after first year, so the status describes an open degree-entry pathway rather than guaranteed first-year admission to the major.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Saskatchewan'
  and c.title in ('Applied Computing - Data Analytics','Applied Computing - Data Analytics - Honours')
  and c.credential_type in ('Bachelor of Science (B.Sc. Four-year)','Bachelor of Science Honours (B.Sc. Honours)');;
