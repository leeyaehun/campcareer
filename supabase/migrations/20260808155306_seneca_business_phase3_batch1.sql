-- Classify occupation-priority Seneca business programmes using current official programme pages checked 2026-08-08.
with verified(program_code, official_program_url) as (
  values
    ('ACC','https://www.senecapolytechnic.ca/programs/fulltime/ACC.html'),
    ('ACF','https://www.senecapolytechnic.ca/programs/fulltime/ACF.html'),
    ('APP','https://www.senecapolytechnic.ca/programs/fulltime/APP.html'),
    ('BAM','https://www.senecapolytechnic.ca/programs/fulltime/BAM.html'),
    ('BHR','https://www.senecapolytechnic.ca/programs/fulltime/BHR.html'),
    ('BMT','https://www.senecapolytechnic.ca/programs/fulltime/BMT.html'),
    ('DMM','https://www.senecapolytechnic.ca/programs/fulltime/DMM.html'),
    ('HRM','https://www.senecapolytechnic.ca/programs/fulltime/HRM.html'),
    ('PMC','https://www.senecapolytechnic.ca/programs/fulltime/PMC.html'),
    ('PME','https://www.senecapolytechnic.ca/programs/fulltime/PME.html'),
    ('PRA','https://www.senecapolytechnic.ca/programs/fulltime/PRA.html'),
    ('SCM','https://www.senecapolytechnic.ca/programs/fulltime/SCM.html'),
    ('SEM','https://www.senecapolytechnic.ca/programs/fulltime/SEM.html')
), updated as (
  update public.program_catalog_ca_staging c
  set official_program_url=v.official_program_url,
      source_status='official_program_page_verified_international_open_2026_27',
      source_as_of=greatest(coalesce(c.source_as_of,date '1900-01-01'),date '2026-08-08')
  from verified v
  where c.institution_name='Seneca Polytechnic' and c.program_code=v.program_code
  returning c.id,c.program_code
), admission as (
  update public.program_pgwp_ca_staging p
  set international_students_eligible=true,
      international_program_admission_status='official_program_page_international_open_2026_27',
      verified_at=now()
  where p.program_catalog_id in (select id from updated)
  returning p.program_catalog_id
), explicit_pgwp(program_code,cip_code) as (
  values
    ('DMM','52.1404'),
    ('PMC','11.1005'),
    ('PME',null),
    ('SCM','52.0203'),
    ('SEM','04.0301')
), pgwp_update as (
  update public.program_pgwp_ca_staging p
  set ircc_program_eligible=true,
      pgwp_program_status='school_official_pgwp_eligible_2026_27',
      cip_code=coalesce(e.cip_code,p.cip_code),
      verified_at=now()
  from public.program_catalog_ca_staging c join explicit_pgwp e on e.program_code=c.program_code
  where p.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic'
  returning p.program_catalog_id
), unavailable(program_code, official_program_url) as (
  values
    ('EMK','https://www.senecapolytechnic.ca/programs/fulltime/EMK.html'),
    ('EVC','https://www.senecapolytechnic.ca/programs/fulltime/EVC.html'),
    ('FEA','https://www.senecapolytechnic.ca/programs/fulltime/FEA.html'),
    ('GOM','https://www.senecapolytechnic.ca/programs/fulltime/GOM.html'),
    ('MKM','https://www.senecapolytechnic.ca/programs/fulltime/MKM.html')
), unavailable_updated as (
  update public.program_catalog_ca_staging c
  set official_program_url=u.official_program_url,
      source_status='international_not_available_program_unavailable_2026',
      source_as_of=greatest(coalesce(c.source_as_of,date '1900-01-01'),date '2026-08-08')
  from unavailable u
  where c.institution_name='Seneca Polytechnic' and c.program_code=u.program_code
  returning c.id
), unavailable_pgwp as (
  update public.program_pgwp_ca_staging p
  set international_students_eligible=false,
      international_program_admission_status='current_seneca_program_page_marks_program_unavailable',
      verified_at=now()
  where p.program_catalog_id in (select id from unavailable_updated)
  returning p.program_catalog_id
), legacy(program_code, official_program_url, successor_note) as (
  values
    ('BACF','https://www.senecapolytechnic.ca/programs/fulltime/BACF.html','new_students_use_revised_bbm_accounting_finance_major_from_september_2026'),
    ('BHRM','https://www.senecapolytechnic.ca/programs/fulltime/BHRM.html','new_students_use_revised_bbm_human_resources_major_from_september_2026'),
    ('BMRK','https://www.senecapolytechnic.ca/programs/fulltime/BMRK.html','new_students_use_revised_bbm_marketing_major_from_september_2026')
), legacy_updated as (
  update public.program_catalog_ca_staging c
  set official_program_url=l.official_program_url,
      source_status='legacy_restructured_into_bbm_september_2026',
      source_as_of=greatest(coalesce(c.source_as_of,date '1900-01-01'),date '2026-08-08')
  from legacy l
  where c.institution_name='Seneca Polytechnic' and c.program_code=l.program_code
  returning c.id,c.program_code
), legacy_pgwp as (
  update public.program_pgwp_ca_staging p
  set international_program_admission_status=l.successor_note,
      verified_at=now()
  from legacy_updated u join legacy l on l.program_code=u.program_code
  where p.program_catalog_id=u.id
  returning p.program_catalog_id
), reject_gom as (
  update public.program_occupation_ca_staging o
  set review_status='rejected', match_basis='manual', relation_type=null,
      source_checked_at=now(), reviewed_at=now(),
      reviewer_note='Rejected: Global Hospitality Operations Management is not a Supply Chain Analyst programme.'
  from public.program_catalog_ca_staging c
  where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic' and c.program_code='GOM' and o.canonical_career_id='supply-chain-analyst'
  returning o.program_catalog_id
), direct_relations as (
  update public.program_occupation_ca_staging o
  set review_status='approved', match_basis='manual', relation_type='direct', source_checked_at=now(), reviewed_at=now(),
      reviewer_note='Reviewed against current Seneca programme scope and stated career outcomes.'
  from public.program_catalog_ca_staging c
  where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic'
    and ((c.program_code in ('ACC','ACF','APP','PRA') and o.canonical_career_id='accountant')
      or (c.program_code in ('BAM','BMT','DMM','SEM') and o.canonical_career_id='marketing-specialist')
      or (c.program_code in ('BHR','HRM') and o.canonical_career_id='human-resources-specialist')
      or (c.program_code in ('PMC','PME') and o.canonical_career_id='project-manager'))
  returning o.program_catalog_id
), financial_relation as (
  update public.program_occupation_ca_staging o
  set review_status='approved', match_basis='manual', relation_type='common_pathway', source_checked_at=now(), reviewed_at=now(),
      reviewer_note='Accounting & Finance is a common pathway to junior financial analyst roles.'
  from public.program_catalog_ca_staging c
  where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic' and c.program_code='ACF' and o.canonical_career_id='financial-analyst'
  returning o.program_catalog_id
)
update public.program_occupation_ca_staging o
set review_status='approved', match_basis='manual', relation_type='common_pathway', source_checked_at=now(), reviewed_at=now(),
    reviewer_note='Supply Chain Management – Global Logistics is a common pathway across logistics, supply-chain analysis and warehouse-management roles.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic' and c.program_code='SCM'
  and o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager');;
