-- Canada Programs Phase 3: normalize University of Alberta program-level admission structure and current-cycle holds.
-- Evidence checked 2026-08-09. Occupation relevance remains independent from current admission publishability.
-- No PGWP state is inferred or changed here.

update public.program_catalog_ca_staging
set source_as_of = date '2026-08-09',
    source_status = 'official_engineering_structure_verified_common_qualifying_first_year_not_standalone_direct_entry',
    official_program_url = 'https://www.ualberta.ca/en/engineering/admissions-programs/undergraduate/index.html'
where institution_name = 'University of Alberta'
  and credential_type = 'Bachelor of Science in Engineering'
  and title in ('Chemical Engineering','Civil Engineering','Electrical Engineering','Mechanical Engineering','Mechatronics and Robotics Engineering');

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'not_current_standalone_direct_entry_common_qualifying_first_year_then_internal_discipline_selection',
    source_url = 'https://www.ualberta.ca/en/engineering/admissions-programs/undergraduate/index.html',
    source_as_of = date '2026-08-09',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'UAlberta Engineering reviewed 2026-08-09: the current Faculty of Engineering undergraduate page states that students begin in a common/foundational Qualifying First Year and select their discipline and degree path after first year. The named discipline remains a valid career pathway, but this discipline row is not treated as a standalone direct-entry international admission program.')
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'University of Alberta'
  and c.credential_type = 'Bachelor of Science in Engineering'
  and c.title in ('Chemical Engineering','Civil Engineering','Electrical Engineering','Mechanical Engineering','Mechatronics and Robotics Engineering');

update public.program_catalog_ca_staging
set source_as_of = date '2026-08-09',
    source_status = 'official_nursing_collaborative_current_fall_2026_application_closed_deadline_march_1',
    official_program_url = 'https://www.ualberta.ca/nursing/programs/undergraduate-programs-and-their-admissions-requirements/collaborative-program.html'
where institution_name = 'University of Alberta'
  and title = 'Bachelor of Science in Nursing Collaborative Program'
  and credential_type = 'Bachelor of Science in Nursing';

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'current_fall_2026_application_closed_deadline_march_1',
    source_url = 'https://www.ualberta.ca/nursing/programs/undergraduate-programs-and-their-admissions-requirements/collaborative-program.html',
    source_as_of = date '2026-08-09',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'UAlberta BScN Collaborative reviewed 2026-08-09: the current Faculty of Nursing program page lists March 1 as the application deadline. The Fall 2026 cycle is therefore closed on the review date; the next intake is not inferred open until current-cycle evidence is published.')
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'University of Alberta'
  and c.title = 'Bachelor of Science in Nursing Collaborative Program'
  and c.credential_type = 'Bachelor of Science in Nursing';

update public.program_catalog_ca_staging
set source_as_of = date '2026-08-09',
    source_status = 'official_mls_degree_completion_current_application_closed_deadline_july_1',
    official_program_url = 'https://www.ualberta.ca/en/medicine/programs/mls/professionalcertification/admission-and-application.html'
where institution_name = 'University of Alberta'
  and title = 'Bachelor of Science in Medical Laboratory Science - Degree Completion'
  and credential_type = 'Bachelor of Science in Medical Laboratory Science';

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'current_application_cycle_closed_deadline_july_1',
    source_url = 'https://www.ualberta.ca/en/medicine/programs/mls/professionalcertification/admission-and-application.html',
    source_as_of = date '2026-08-09',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'UAlberta BSc Medical Laboratory Science Degree Completion reviewed 2026-08-09: the current program application page lists July 1 as the application deadline and August 1 for supporting documents. The current application cycle is closed on the review date; no future cycle is inferred open.')
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'University of Alberta'
  and c.title = 'Bachelor of Science in Medical Laboratory Science - Degree Completion'
  and c.credential_type = 'Bachelor of Science in Medical Laboratory Science';;
