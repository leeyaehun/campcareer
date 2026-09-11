update public.program_catalog_ca_staging
set source_status='international_not_available_current_2026_27', source_as_of='2026-08-08'
where institution_name='Confederation College' and title in ('Social Service Worker','Social Service Worker - Accelerated');

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_program_not_available_for_international_students_2026_27',
    source_url=case c.title when 'Social Service Worker' then 'https://www.confederationcollege.ca/program/social-service-worker/admission' else 'https://www.confederationcollege.ca/program/social-service-worker-accelerated/admission' end,
    source_as_of='2026-08-08', verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Confederation College current admission page explicitly states this program is not currently available for international students.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Confederation College'
  and c.title in ('Social Service Worker','Social Service Worker - Accelerated');

with decisions(title,career_id,relation_type,note) as (values
  ('Business - Accounting','accountant','direct','The two-year Business - Accounting diploma explicitly prepares graduates for entry-level accounting positions including junior accountant roles.'),
  ('Business Administration - Accounting','accountant','direct','The advanced accounting diploma is direct accounting education and further professional-study preparation.'),
  ('Civil Engineering Technology','civil-engineer','related','Civil Engineering Technology is technologist-level preparation relevant to civil engineering but does not itself confer the regulated professional engineer title.'),
  ('Civil Engineering Technology','engineering-technician','direct','The advanced diploma explicitly prepares Civil Engineering Technologists and is direct technician/technologist-level preparation.'),
  ('Social Service Worker','community-worker','direct','The diploma directly prepares social service, outreach, case-management and community-support workers.'),
  ('Social Service Worker - Accelerated','community-worker','direct','The accelerated diploma is direct social-service/community-work preparation for applicants with prior related education.'),
  ('Business - Marketing','marketing-specialist','direct','The diploma directly develops marketing, advertising, market research, digital marketing and communications skills and career outcomes.')
)
update public.program_occupation_ca_staging o
set review_status='approved', relation_type=d.relation_type, source_checked_at='2026-08-08', reviewer_note=d.note, reviewed_at=now()
from public.program_catalog_ca_staging c, decisions d
where o.program_catalog_id=c.id and c.institution_name='Confederation College'
  and c.title=d.title and o.canonical_career_id=d.career_id and o.review_status='candidate';;
