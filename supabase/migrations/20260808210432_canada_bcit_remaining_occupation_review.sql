update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type='direct',
    source_checked_at='2026-08-08',
    reviewer_note='BCIT Marketing Management option is direct marketing-specialist education. Program-level international admission remains separately unverified.',
    reviewed_at=now()
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='British Columbia Institute of Technology'
  and c.title in ('Marketing Management (Marketing Communications Option)','Marketing Management (Professional Sales Option)')
  and o.canonical_career_id='marketing-specialist'
  and o.review_status='candidate';;
