-- Complete Conestoga College's remaining occupation relationship review.
-- Conflicting/separate international admission variants remain publication-held.

with decisions(canonical_career_id,title,relation_type,reviewer_note) as (
  values
    ('carpenter','Woodworking Technician (Optional Co-op)','related','Woodworking technician training is closely related to carpentry/cabinetmaking but is not the same trade credential as carpenter.'),
    ('early-childhood-teacher','Early Childhood Education Resource Consulting','related','ECE Resource Consulting is an advanced/specialized pathway for the ECE field rather than a primary entry program to early-childhood teaching.'),
    ('marketing-specialist','Business - Marketing','direct','Direct marketing pathway; conflicting current international availability remains a separate publication hold.'),
    ('marketing-specialist','Business Administration - Marketing','direct','Direct marketing pathway; current international admission verification remains a separate hold.'),
    ('marketing-specialist','Business Administration - Marketing (Co-op)','direct','Direct marketing pathway; current international admission verification remains a separate hold.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,d.relation_type,d.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join decisions d on d.canonical_career_id=l.canonical_career_id and d.title=c.title
  where c.institution_name='Conestoga College' and l.review_status='candidate'
)
update public.program_occupation_ca_staging l
set review_status='approved',relation_type=r.relation_type,source_checked_at=date '2026-08-08',reviewer_note=r.reviewer_note,reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id and l.canonical_career_id=r.canonical_career_id;;
