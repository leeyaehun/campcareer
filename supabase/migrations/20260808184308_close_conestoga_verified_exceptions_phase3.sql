-- Canada Programs Phase 3: close Conestoga exceptions with current official evidence.

with verified(program_code, admission_status) as (
  values
    ('1568','official_program_page_open_international_2026'),
    ('1676','official_program_page_open_international_2026'),
    ('1680','official_program_page_open_international_2026')
), catalog_updated as (
  update public.program_catalog_ca_staging c
  set source_status = 'official_program_page_verified_open_international_2026',
      source_as_of = greatest(coalesce(c.source_as_of, date '1900-01-01'), date '2026-08-08')
  from verified v
  where c.institution_name = 'Conestoga College'
    and c.program_code = v.program_code
  returning c.id, c.program_code
)
update public.program_pgwp_ca_staging p
set international_students_eligible = true,
    international_program_admission_status = v.admission_status,
    verified_at = now()
from public.program_catalog_ca_staging c
join verified v on v.program_code = c.program_code
where p.program_catalog_id = c.id
  and c.institution_name = 'Conestoga College';

with reviewed(program_code, canonical_career_id, relation_type, reviewer_note) as (
  values
    ('1568','accountant','direct','Current Conestoga admissions page provides an international application path; Professional Accounting Practice is direct accounting preparation.'),
    ('1676','animator','common_pathway','Current Conestoga page provides an international application path; Animation and Game Fundamentals is a foundational pathway to animation roles.'),
    ('1680','plumber','direct','Current Conestoga admissions page provides an international application path; Plumbing Technician is direct technical preparation for plumbing roles.')
)
update public.program_occupation_ca_staging o
set review_status = 'approved',
    relation_type = r.relation_type,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = r.reviewer_note,
    reviewed_at = now()
from reviewed r
join public.program_catalog_ca_staging c
  on c.institution_name = 'Conestoga College'
 and c.program_code = r.program_code
where o.program_catalog_id = c.id
  and o.canonical_career_id = r.canonical_career_id
  and o.review_status = 'candidate';

update public.program_occupation_ca_staging o
set review_status = 'rejected',
    relation_type = null,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = 'Rejected in Phase 3: Conestoga Practical Nursing prepares for Registered Practical Nurse registration, not the registered-nurse target.',
    reviewed_at = now()
from public.program_catalog_ca_staging c
where o.program_catalog_id = c.id
  and c.institution_name = 'Conestoga College'
  and c.program_code = '1077'
  and o.canonical_career_id = 'registered-nurse'
  and o.review_status = 'candidate';;
