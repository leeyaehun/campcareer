update public.program_catalog_ca_staging
set official_program_url='https://www.ualberta.ca/en/engineering/admissions-programs/undergraduate/index.html',
    source_as_of='2026-08-08',
    source_status='official_current_undergraduate_engineering_program_verified_2026_27'
where institution_name='University of Alberta'
  and title in ('Chemical Engineering','Civil Engineering','Electrical Engineering','Mechanical Engineering','Mechatronics and Robotics Engineering')
  and credential_type='Bachelor of Science in Engineering';

update public.program_catalog_ca_staging
set official_program_url='https://www.ualberta.ca/en/medicine/programs/mls', source_as_of='2026-08-08',
    source_status='official_current_medical_laboratory_science_program_verified_2026_27'
where institution_name='University of Alberta' and title='Bachelor of Science in Medical Laboratory Science';

update public.program_catalog_ca_staging
set official_program_url='https://www.ualberta.ca/en/medicine/programs/mls/professionalcertification/admission-and-application.html', source_as_of='2026-08-08',
    source_status='official_current_medical_laboratory_science_degree_completion_verified_2026_27'
where institution_name='University of Alberta' and title='Bachelor of Science in Medical Laboratory Science - Degree Completion';

update public.program_catalog_ca_staging
set official_program_url='https://cms.cloudfront.ualberta.ca/en/pharmacy/about-us/index.html', source_as_of='2026-08-08',
    source_status='official_current_pharmacy_program_verified_2026_27'
where institution_name='University of Alberta' and title in ('Pharmacy','Pharmacy for Practicing Pharmacists');

update public.program_catalog_ca_staging
set official_program_url='https://www.ualberta.ca/secondary-education/graduate-programs/doctor-of-education.html', source_as_of='2026-08-08',
    source_status='official_current_secondary_education_graduate_program_verified_2026_27'
where institution_name='University of Alberta' and title='Secondary Education' and credential_type in ('Master of Education','Doctor of Philosophy');

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_closed_2026_entry_mls_application_deadline_april_1_2026',
    source_url='https://www.ualberta.ca/en/medicine/programs/mls', source_as_of='2026-08-08', verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UAlberta MLS official page states the current-year application deadline was April 1, 2026. A later intake was not inferred.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='University of Alberta' and c.title='Bachelor of Science in Medical Laboratory Science';

with decisions(title,credential_type,career_id,relation_type,note) as (values
  ('Accounting','Master of Accounting','accountant','direct','Master of Accounting is advanced professional accounting education aligned to accounting practice and CPA preparation.'),
  ('Chemical Engineering','Bachelor of Science in Engineering','chemical-engineer','direct','Chemical Engineering BSc in Engineering is direct professional engineering education in the occupation discipline.'),
  ('Civil Engineering','Bachelor of Science in Engineering','civil-engineer','direct','Civil Engineering BSc in Engineering is direct professional engineering education in the occupation discipline.'),
  ('Electrical Engineering','Bachelor of Science in Engineering','electrical-engineer','direct','Electrical Engineering BSc in Engineering is direct professional engineering education in the occupation discipline.'),
  ('Financial Management','Master of Financial Management','financial-analyst','common_pathway','Master of Financial Management is a strong advanced finance pathway to financial-analysis roles, but the occupation is broader than the degree title.'),
  ('Mechanical Engineering','Bachelor of Science in Engineering','mechanical-engineer','direct','Mechanical Engineering BSc in Engineering is direct professional engineering education in the occupation discipline.'),
  ('Mechatronics and Robotics Engineering','Bachelor of Science in Engineering','mechanical-engineer','related','Mechatronics and Robotics Engineering overlaps mechanical systems but is a distinct multidisciplinary engineering discipline.'),
  ('Bachelor of Science in Medical Laboratory Science','Bachelor of Science in Medical Laboratory Science','medical-laboratory-technician','direct','UAlberta MLS is direct medical laboratory professional education and prepares graduates for the CSMLS general certification examination.'),
  ('Bachelor of Science in Medical Laboratory Science - Degree Completion','Bachelor of Science in Medical Laboratory Science','medical-laboratory-technician','related','The degree-completion route is post-professional education for already certified medical laboratory professionals rather than an entry pathway.'),
  ('Pharmacy','Doctor of Pharmacy (PharmD)','pharmacist','direct','The entry-to-practice PharmD is direct professional pharmacist education.'),
  ('Pharmacy for Practicing Pharmacists','Doctor of Pharmacy (PharmD)','pharmacist','related','This is post-professional PharmD education for already practicing pharmacists, not an entry-to-practice route.'),
  ('Bachelor of Science in Nursing','Bachelor of Science in Nursing','registered-nurse','direct','The BScN is direct registered-nurse education.'),
  ('Bachelor of Science in Nursing After Degree','Bachelor of Science in Nursing After Degree','registered-nurse','direct','The BScN After Degree is an entry-to-practice RN pathway for eligible degree holders.'),
  ('Bachelor of Science in Nursing Collaborative Program','Bachelor of Science in Nursing','registered-nurse','direct','The collaborative BScN is direct registered-nurse education.'),
  ('Bachelor of Science in Nursing Honors','Bachelor of Science in Nursing Honors','registered-nurse','direct','The BScN Honors remains direct registered-nurse education with an added honors/research component.'),
  ('Secondary Education','Master of Education','secondary-school-teacher','related','The MEd is advanced education for educators and commonly expects teaching experience; it is not the initial teacher-certification degree.'),
  ('Secondary Education','Doctor of Philosophy','secondary-school-teacher','related','The PhD is advanced research education in curriculum and pedagogy rather than initial secondary-teacher certification.'),
  ('Sustainable Agricultural Systems','Bachelor of Science in Agriculture','sustainability-specialist','related','Sustainable Agricultural Systems provides substantial sustainability and resource-management preparation but is agriculture-sector specific.')
)
update public.program_occupation_ca_staging o
set review_status='approved', relation_type=d.relation_type, source_checked_at='2026-08-08', reviewer_note=d.note, reviewed_at=now()
from public.program_catalog_ca_staging c, decisions d
where o.program_catalog_id=c.id and c.institution_name='University of Alberta'
  and c.title=d.title and coalesce(c.credential_type,'')=d.credential_type
  and o.canonical_career_id=d.career_id and o.review_status='candidate';;
