update public.program_pgwp_ca_staging p
set international_program_admission_status='international_not_accepting_2026_27_institution_wide_domestic_only',
    source_url='https://www.auroracollege.nt.ca/future-students/admissions/apply/',
    source_as_of='2026-08-08', verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Aurora College official admissions page states international student applications are closed for the 2026-2027 academic year and only qualified Canadian residents are being accepted.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Aurora College';

with decisions(title,career_id,relation_type,note) as (values
  ('Business Administration – Accounting Stream Diploma','accountant','common_pathway','The Accounting Stream provides accounting coursework and is designed to support further progression toward CPA/professional accounting credentials.'),
  ('Business Administration Accounting Stream – Work Experience Diploma','accountant','common_pathway','The Accounting Stream Work Experience diploma adds placements to the accounting curriculum and is a common pathway toward accounting roles and further professional study.'),
  ('Personal Support Worker','care-worker','direct','Aurora College states the program prepares Personal Support Workers for community health-care settings and daily-living support roles.'),
  ('Early Learning and Child Care Certificate','early-childhood-teacher','direct','The ELCC certificate develops applied early-childhood education and care competencies for work with young children and families.'),
  ('Early Learning and Child Care Diploma','early-childhood-teacher','direct','The two-year ELCC diploma is direct early-childhood education and care preparation with applied learning and field placements.'),
  ('Bachelor of Science in Nursing','registered-nurse','direct','Aurora College BScN is a four-year practice-based nursing degree explicitly preparing students for a career as a Registered Nurse.')
)
update public.program_occupation_ca_staging o
set review_status='approved', relation_type=d.relation_type,
    source_checked_at='2026-08-08', reviewer_note=d.note, reviewed_at=now()
from public.program_catalog_ca_staging c, decisions d
where o.program_catalog_id=c.id and c.institution_name='Aurora College'
  and c.title=d.title and o.canonical_career_id=d.career_id and o.review_status='candidate';;
