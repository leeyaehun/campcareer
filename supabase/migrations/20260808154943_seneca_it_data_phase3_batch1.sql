-- Classify occupation-priority Seneca IT/Data programmes using current 2026-27 programme pages and international application paths checked 2026-08-08.
with verified(program_code, official_program_url, pgwp_eligible, cip_code) as (
  values
    ('BCMS','https://www.senecapolytechnic.ca/programs/fulltime/BCMS.html',true,'11.0701'),
    ('BSA','https://www.senecapolytechnic.ca/programs/fulltime/BSA.html',true,'14.0903'),
    ('BSD','https://www.senecapolytechnic.ca/programs/fulltime/BSD.html',true,null),
    ('CAA','https://www.senecapolytechnic.ca/programs/fulltime/CAA.html',true,null),
    ('CYT','https://www.senecapolytechnic.ca/programs/fulltime/CYT.html',true,'11.1003'),
    ('DSA','https://www.senecapolytechnic.ca/programs/fulltime/DSA.html',true,null),
    ('IFS','https://www.senecapolytechnic.ca/programs/fulltime/IFS.html',true,null),
    ('MRK','https://www.senecapolytechnic.ca/programs/fulltime/MRK.html',true,null)
), updated as (
  update public.program_catalog_ca_staging c
  set official_program_url=v.official_program_url,
      source_status='official_program_page_verified_international_open_2026_27',
      source_as_of=greatest(coalesce(c.source_as_of,date '1900-01-01'),date '2026-08-08')
  from verified v
  where c.institution_name='Seneca Polytechnic' and c.program_code=v.program_code
  returning c.id,c.program_code
), pgwp as (
  update public.program_pgwp_ca_staging p
  set international_students_eligible=true,
      international_program_admission_status='official_program_page_international_open_or_apply_2026_27',
      ircc_program_eligible=v.pgwp_eligible,
      pgwp_program_status='school_official_pgwp_eligible_2026_27',
      cip_code=coalesce(v.cip_code,p.cip_code),
      verified_at=now()
  from updated u join verified v on v.program_code=u.program_code
  where p.program_catalog_id=u.id
  returning p.program_catalog_id
), ban as (
  update public.program_catalog_ca_staging c
  set official_program_url='https://www.senecapolytechnic.ca/programs/fulltime/BAN.html',
      source_status='legacy_renamed_to_data_analytics_das_september_2026',
      source_as_of=greatest(coalesce(c.source_as_of,date '1900-01-01'),date '2026-08-08')
  where c.institution_name='Seneca Polytechnic' and c.program_code='BAN'
  returning c.id
), ban_pgwp as (
  update public.program_pgwp_ca_staging p
  set international_program_admission_status='legacy_name_for_existing_students_new_students_use_das_from_september_2026',
      verified_at=now()
  where p.program_catalog_id in (select id from ban)
  returning p.program_catalog_id
), direct_relations as (
  update public.program_occupation_ca_staging o
  set review_status='approved', match_basis='manual', relation_type='direct', source_checked_at=now(), reviewed_at=now(), reviewer_note='Reviewed against current Seneca programme curriculum and stated career outcomes.'
  from public.program_catalog_ca_staging c
  where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic'
    and ((c.program_code in ('CAA') and o.canonical_career_id='cloud-engineer') or (c.program_code in ('CYT','IFS') and o.canonical_career_id='cybersecurity-analyst'))
  returning o.program_catalog_id
), common_pathways as (
  update public.program_occupation_ca_staging o
  set review_status='approved', match_basis='manual', relation_type='common_pathway', source_checked_at=now(), reviewed_at=now(), reviewer_note='Reviewed as a common education pathway to the occupation.'
  from public.program_catalog_ca_staging c
  where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic'
    and ((c.program_code in ('BCMS','BSA','BSD') and o.canonical_career_id='software-developer') or (c.program_code='DSA' and o.canonical_career_id in ('data-analyst','data-engineer')))
  returning o.program_catalog_id
)
update public.program_occupation_ca_staging o
set review_status='approved', match_basis='manual', relation_type='related', source_checked_at=now(), reviewed_at=now(), reviewer_note='Digital Marketing Communications & Analytics includes analytics, but is primarily a marketing communications programme rather than a general Data Analyst pathway.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic' and c.program_code='MRK' and o.canonical_career_id='data-analyst';;
