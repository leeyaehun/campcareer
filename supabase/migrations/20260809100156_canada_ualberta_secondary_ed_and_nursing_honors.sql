-- Canada Programs Phase 3: resolve additional University of Alberta program-level admission / identity holds.
-- Evidence checked 2026-08-09. Occupation relevance and PGWP state remain unchanged.

update public.program_catalog_ca_staging
set source_as_of = date '2026-08-09',
    source_status = case
      when credential_type = 'Master of Education'
        then 'official_secondary_education_med_current_cycle_closed_deadline_march_1_next_cycle_not_confirmed_open'
      when credential_type = 'Doctor of Philosophy'
        then 'official_secondary_education_phd_current_cycle_closed_deadline_december_1_next_cycle_not_confirmed_open'
      else source_status
    end,
    official_program_url = 'https://www.ualberta.ca/secondary-education/graduate-programs/doctor-of-education.html'
where institution_name = 'University of Alberta'
  and title = 'Secondary Education'
  and credential_type in ('Master of Education','Doctor of Philosophy');

update public.program_pgwp_ca_staging p
set international_program_admission_status = case
      when c.credential_type = 'Master of Education'
        then 'current_fall_summer_2026_cycle_closed_deadline_march_1_next_cycle_not_confirmed_open'
      when c.credential_type = 'Doctor of Philosophy'
        then 'current_fall_summer_2026_cycle_closed_deadline_december_1_next_cycle_not_confirmed_open'
      else p.international_program_admission_status
    end,
    source_url = 'https://www.ualberta.ca/secondary-education/graduate-programs/doctor-of-education.html',
    source_as_of = date '2026-08-09',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), case
      when c.credential_type = 'Master of Education'
        then 'UAlberta Secondary Education MEd reviewed 2026-08-09: the current department graduate-program page lists international applicant document requirements and a March 1 deadline for Fall/Summer admission. The 2026 cycle is closed; the next cycle is not promoted until portal availability is explicitly confirmed.'
      when c.credential_type = 'Doctor of Philosophy'
        then 'UAlberta Secondary Education PhD reviewed 2026-08-09: the current department graduate-program page lists international applicant document requirements and a December 1 deadline for Fall/Summer admission. The 2026 cycle is closed; the next cycle is not promoted merely because a recurring future deadline exists.'
      else null
    end)
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'University of Alberta'
  and c.title = 'Secondary Education'
  and c.credential_type in ('Master of Education','Doctor of Philosophy');

update public.program_catalog_ca_staging
set source_as_of = date '2026-08-09',
    source_status = 'parent_program_multiple_credentials_nursing_honors_collaborative_internal_and_after_degree_direct_entry',
    official_program_url = 'https://www.ualberta.ca/nursing/programs/undergraduate-programs-and-their-admissions-requirements/honors-program/frequently-asked-questions.html'
where institution_name = 'University of Alberta'
  and title = 'Bachelor of Science in Nursing Honors'
  and credential_type = 'Bachelor of Science in Nursing Honors';

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'program_identity_requires_variant_split_collaborative_honors_internal_progression_vs_after_degree_honors_direct_entry',
    source_url = 'https://www.ualberta.ca/nursing/programs/undergraduate-programs-and-their-admissions-requirements/honors-program/frequently-asked-questions.html',
    source_as_of = date '2026-08-09',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'UAlberta Nursing Honors reviewed 2026-08-09: the current Honors FAQ distinguishes Collaborative Honors, entered by students already in year 2 of the Collaborative BScN, from After Degree Honors, which must be applied to directly before the first year of the After Degree program. The aggregate DB row is therefore held as an ambiguous parent identity until these admission variants are canonicalized separately.')
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'University of Alberta'
  and c.title = 'Bachelor of Science in Nursing Honors'
  and c.credential_type = 'Bachelor of Science in Nursing Honors';;
