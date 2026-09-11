with urls(title,url,status) as (values
  ('Health Care Assistant','https://www.yukonu.ca/programs/health-care-assistant','official_current_program_verified_2026_27'),
  ('Culinary Arts','https://www.yukonu.ca/programs/culinary-arts','official_current_program_verified_2026_27'),
  ('Early Learning','https://www.yukonu.ca/programs/early-learning','official_current_program_verified_2026_27'),
  ('Northern Outdoor and Environmental Studies','https://www.yukonu.ca/programs/northern-outdoor-and-environmental-studies','official_current_program_verified_2026_27')
)
update public.program_catalog_ca_staging c
set official_program_url=u.url, source_as_of='2026-08-08', source_status=u.status
from urls u where c.institution_name='Yukon University' and c.title=u.title;

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_program_not_accepting_international_applicants_2026_27',
    source_url='https://www.yukonu.ca/programs/health-care-assistant', source_as_of='2026-08-08', verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Yukon University Health Care Assistant page states that due to high demand the program is not able to accept international applicants at this time.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Yukon University' and c.title='Health Care Assistant';

with decisions(title,career_id,relation_type,note) as (values
  ('Health Care Assistant','care-worker','direct','The HCA certificate directly prepares front-line caregivers to provide personal care and support in community and facility settings.'),
  ('Culinary Arts','cook','direct','The Culinary Arts certificate is direct professional cook training and includes apprenticeship Level I and II Cook examinations.'),
  ('Culinary Arts','chef','common_pathway','The cook-training certificate is a common foundational pathway toward chef roles but does not itself represent advanced chef-level experience.'),
  ('Early Learning','early-childhood-teacher','direct','The Early Learning diploma explicitly prepares early childhood educators through coursework and three practicum placements.'),
  ('Northern Outdoor and Environmental Studies','environmental-scientist','related','NOES is multidisciplinary environmental studies covering ecological and environmental issues; it is relevant preparation but broader than a dedicated environmental-science degree.'),
  ('Multimedia Communication','multimedia-designer','direct','The current program planning guide covers image editing, web design, desktop publishing, digital audio/video and graphic design, directly aligning to multimedia design work.')
)
update public.program_occupation_ca_staging o
set review_status='approved', relation_type=d.relation_type, source_checked_at='2026-08-08', reviewer_note=d.note, reviewed_at=now()
from public.program_catalog_ca_staging c, decisions d
where o.program_catalog_id=c.id and c.institution_name='Yukon University'
  and c.title=d.title and o.canonical_career_id=d.career_id and o.review_status='candidate';;
