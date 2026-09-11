-- Canada Programs Phase 2/3: restore missing occupation links for current University of Regina
-- Bachelor of Education After Degree elementary/secondary teacher-certification pathways and verify current Fall 2026 international application timing.
-- Evidence checked 2026-08-08 against current Faculty of Education program and international application-guide pages.

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Elementary Teacher Education' then 'https://www.uregina.ca/academics/programs/education/elementary-teacher-education.html'
      else 'https://www.uregina.ca/academics/programs/education/secondary-teacher-education.html' end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_teacher_certification_fall_2026_international_open'
where institution_name='University of Regina'
  and title in ('Elementary Teacher Education','Secondary Teacher Education')
  and credential_type='After Degree';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2026_international_education_application_open_until_2026_08_15_capacity_applies',
    source_url=case
      when c.title='Elementary Teacher Education' then 'https://www.uregina.ca/academics/programs/education/elementary-teacher-education.html'
      else 'https://www.uregina.ca/academics/programs/education/secondary-teacher-education.html' end,
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' University of Regina Education reviewed 2026-08-08: the Faculty international application guide explicitly covers Bachelor of Education After Degree Elementary and Secondary applicants and lists the Fall international application deadline as August 15, subject to earlier closure if competitive-entry capacity is reached. The provider program pages confirm the degrees prepare elementary/secondary teachers and meet Saskatchewan teacher-certification requirements.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Regina'
  and c.title in ('Elementary Teacher Education','Secondary Teacher Education')
  and c.credential_type='After Degree';

insert into public.program_occupation_ca_staging (
  program_catalog_id,canonical_career_id,rule_version,match_basis,match_pattern,
  review_status,relation_type,source_checked_at,reviewer_note,matched_at,reviewed_at
)
select c.id,v.career_id,'ca-phase3-regina-teacher-2026-08-08','manual','regina_current_teacher_certification_path',
       'approved','direct','2026-08-08',v.note,now(),now()
from public.program_catalog_ca_staging c
join (values
  ('Elementary Teacher Education','primary-school-teacher','University of Regina Elementary Teacher Education BEd After Degree is approved as meeting Saskatchewan teacher-certification requirements and directly prepares elementary school teachers; Fall 2026 international applications remain within the published August 15 deadline.'),
  ('Secondary Teacher Education','secondary-school-teacher','University of Regina Secondary Teacher Education BEd After Degree directly prepares high-school teachers and meets Saskatchewan teacher-certification requirements; Fall 2026 international applications remain within the published August 15 deadline.')
) as v(title,career_id,note) on v.title=c.title
where c.institution_name='University of Regina'
  and c.credential_type='After Degree'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='direct',source_checked_at='2026-08-08',reviewer_note=excluded.reviewer_note,reviewed_at=now();;
