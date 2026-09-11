-- Complete the remaining Fanshawe occupation relationship review.
-- Current international admission/online-only/domestic-only holds remain unchanged.
-- Legacy duplicate shadows are rejected because their occupation relationship is represented by the coded canonical program row.

with decisions(canonical_career_id,title,program_code,relation_type,review_status,reviewer_note) as (
  values
    ('accountant','Professional Accounting','PAC2','direct','approved','Direct professional accounting pathway; online-only/current publication hold is separate.'),
    ('animal-science-technician','Veterinary Technician','VTT1','direct','approved','Direct veterinary technician pathway; current international intake closure is separate.'),
    ('animator','3D Animation and Character Design','ANC1','direct','approved','Direct animation pathway; program-level international admission remains separately unverified.'),
    ('business-analyst','Business Analysis','BAN2','direct','approved','Direct business-analysis pathway; online-only/current publication hold is separate.'),
    ('early-childhood-teacher','Early Childhood Education (Accelerated)','ECE5J','direct','approved','Direct early-childhood education pathway; current international intake closure is separate.'),
    ('electrical-engineer','Electrical Engineering Technician','ELN2','related','approved','Engineering technician credential is related to but distinct from professional electrical engineer qualification.'),
    ('electrical-engineer','Electrical Engineering Technology(Co-op)','ELY6','related','approved','Engineering technology credential is related to but distinct from professional electrical engineer qualification.'),
    ('engineering-technician','Electrical Engineering Technician','ELN2','direct','approved','Direct engineering-technician pathway.'),
    ('engineering-technician','Electrical Engineering Technology(Co-op)','ELY6','direct','approved','Direct engineering-technologist/technician pathway.'),
    ('event-planner','Event Planning','SEP2','direct','approved','Direct event-planning pathway; online-only/current publication hold is separate.'),
    ('food-technologist','Food Processing - Product Development','FPD1','direct','approved','Direct food-processing/product-development technology pathway.'),
    ('graphic-designer','Graphic Design','GRD1','direct','approved','Direct graphic-design pathway.'),
    ('human-resources-specialist','Business Administration - Human Resources','BAH1','direct','approved','Direct HR pathway; current domestic-only admission restriction is separate.'),
    ('human-resources-specialist','Human Resources Management','HMG1','direct','approved','Direct HR pathway; online-only/current publication hold is separate.'),
    ('marketing-specialist','Sport and Event Marketing','SMM1','direct','approved','Direct specialized marketing pathway.'),
    ('plumber','Plumbing Techniques','PLQ1','direct','approved','Direct plumbing trade-preparation pathway.'),
    ('project-manager','Project Management','PRJ1','direct','approved','Direct project-management pathway; online-only/current publication hold is separate.'),
    ('registered-nurse','Bachelor of Science - Nursing','NSG4','direct','approved','Direct registered-nursing degree pathway; current domestic-only admission restriction is separate.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,d.relation_type,d.review_status,d.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join decisions d
    on d.canonical_career_id=l.canonical_career_id
   and d.title=c.title
   and d.program_code=c.program_code
  where c.institution_name='Fanshawe College' and l.review_status='candidate'
)
update public.program_occupation_ca_staging l
set review_status=r.review_status,
    relation_type=r.relation_type,
    source_checked_at=date '2026-08-08',
    reviewer_note=r.reviewer_note,
    reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id
  and l.canonical_career_id=r.canonical_career_id;

update public.program_occupation_ca_staging l
set review_status='rejected',
    relation_type=null,
    source_checked_at=date '2026-08-08',
    reviewer_note='Legacy duplicate shadow; the occupation relationship is represented by the current coded Fanshawe program row.',
    reviewed_at=now()
from public.program_catalog_ca_staging c
where c.id=l.program_catalog_id
  and c.institution_name='Fanshawe College'
  and l.review_status='candidate'
  and c.source_status='legacy_duplicate_shadow_current_coded_program'
  and c.program_code is null;;
