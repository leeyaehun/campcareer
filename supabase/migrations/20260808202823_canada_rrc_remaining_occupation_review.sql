-- Complete remaining Red River College Polytechnic occupation relationship review.
-- Program-level international admission remains unverified for these rows, so publication stays held.

with decisions(canonical_career_id,title,relation_type,reviewer_note) as (
  values
    ('animal-science-technician','Veterinary Technology','direct','Direct veterinary technology pathway.'),
    ('animator','Animation','direct','Direct animation pathway.'),
    ('baker','Baking and Pastry Arts','direct','Direct baking and pastry pathway.'),
    ('community-worker','Community Development','direct','Direct community-development/community-work pathway.'),
    ('cybersecurity-analyst','Information Security','direct','Direct information-security/cybersecurity pathway.'),
    ('early-childhood-teacher','Early Childhood Education - Workplace','direct','Direct workplace-based ECE diploma pathway.'),
    ('engineering-technician','Power Engineering Technology (3rd Class)','direct','Direct power engineering technology pathway.'),
    ('engineering-technician','Power Engineering Technology (5th Class)','direct','Direct power engineering technology pathway.'),
    ('environmental-scientist','Applied Environmental Studies','direct','Direct applied environmental studies pathway.'),
    ('medical-laboratory-technician','Medical Laboratory Sciences','direct','Direct medical laboratory sciences pathway.'),
    ('restaurant-manager','Hotel & Restaurant Management','direct','Direct hotel/restaurant management pathway.'),
    ('tourism-manager','Business Administration - Tourism Management','direct','Direct tourism management pathway.'),
    ('tourism-manager','Hospitality and Tourism Management','direct','Direct hospitality/tourism management pathway.'),
    ('welder','Welding - Women of Steel','direct','Direct welding training pathway; cohort targeting does not change occupation relevance.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,d.relation_type,d.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join decisions d on d.canonical_career_id=l.canonical_career_id and d.title=c.title
  where c.institution_name='Red River College Polytechnic' and l.review_status='candidate'
)
update public.program_occupation_ca_staging l
set review_status='approved',relation_type=r.relation_type,source_checked_at=date '2026-08-08',reviewer_note=r.reviewer_note,reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id and l.canonical_career_id=r.canonical_career_id;;
