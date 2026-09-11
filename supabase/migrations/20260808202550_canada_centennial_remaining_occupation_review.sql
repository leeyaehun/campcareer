-- Complete Centennial College's remaining occupation relationship review.
-- Suspended, apprenticeship-restricted, online-only and delivery-variant programs remain publication-held.
-- The relationship review is durable and independent from current admission availability.

with decisions(canonical_career_id,program_code,relation_type,reviewer_note) as (
  values
    ('animator','6423','direct','Direct 3D animation pathway; program is currently suspended.'),
    ('automotive-service-technician','8530','direct','Direct automotive service technician apprenticeship pathway; international restriction is separate.'),
    ('automotive-service-technician','8226','direct','Direct automotive service technician co-op/apprenticeship pathway; international restriction is separate.'),
    ('electrical-engineer','3222','related','Engineering technology credential is related to but distinct from professional electrical engineer qualification.'),
    ('electrical-engineer','3206','related','Engineering technology credential is related to but distinct from professional electrical engineer qualification.'),
    ('engineering-technician','3222','direct','Direct electronics engineering technology pathway.'),
    ('engineering-technician','3206','direct','Direct electronics engineering technology pathway.'),
    ('engineering-technician','3747','direct','Direct mechanical engineering technology pathway.'),
    ('engineering-technician','3704','direct','Direct mechanical engineering technology pathway.'),
    ('engineering-technician','3468','related','Software engineering technician training is related to the broad engineering-technician family; program is online-only.'),
    ('engineering-technician','3472','related','Software engineering technology/AI training is related to the broad engineering-technician family; program is online-only.'),
    ('engineering-technician','3462','related','Software engineering technology/AI training is related to the broad engineering-technician family; program is online-only.'),
    ('engineering-technician','3469','related','Software engineering technology training is related to the broad engineering-technician family; program is online-only.'),
    ('food-technologist','3631','direct','Direct food science technology pathway; fast-track variant is currently suspended.'),
    ('food-technologist','3620','direct','Direct food science technology pathway; program is currently suspended.'),
    ('graphic-designer','6480','direct','Direct graphic design pathway. Code 6480 is retained as a delivery/admission-code variant and remains publication-held pending current admission-code normalization.'),
    ('mechanical-engineer','3747','related','Mechanical engineering technology credential is related to but distinct from professional mechanical engineer qualification.'),
    ('mechanical-engineer','3704','related','Mechanical engineering technology credential is related to but distinct from professional mechanical engineer qualification.'),
    ('restaurant-manager','1808','common_pathway','Food and Beverage Management is a common restaurant-management pathway; program is currently suspended.'),
    ('software-developer','3468','direct','Direct software-development technician pathway; program is online-only.'),
    ('software-developer','3472','direct','Direct software-development/AI technology pathway; program is online-only.'),
    ('software-developer','3462','direct','Direct software-development/AI technology pathway; program is online-only.'),
    ('software-developer','3469','direct','Direct software-development technology pathway; program is online-only.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,d.relation_type,d.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join decisions d on d.canonical_career_id=l.canonical_career_id and d.program_code=c.program_code
  where c.institution_name='Centennial College' and l.review_status='candidate'
)
update public.program_occupation_ca_staging l
set review_status='approved',
    relation_type=r.relation_type,
    source_checked_at=date '2026-08-08',
    reviewer_note=r.reviewer_note,
    reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id
  and l.canonical_career_id=r.canonical_career_id;;
