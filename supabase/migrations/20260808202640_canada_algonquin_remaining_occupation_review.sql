-- Complete Algonquin College's remaining occupation relationship review.
-- Admission restrictions/suspensions/joint-institution identity holds remain unchanged.

with approvals(canonical_career_id,title,relation_type,reviewer_note) as (
  values
    ('accountant','Business Administration - Accounting','direct','Direct accounting pathway; current international availability hold is separate.'),
    ('carpenter','Heritage Carpentry and Joinery','direct','Direct carpentry/joinery pathway; current international suspension is separate.'),
    ('electrical-engineer','Bachelor of Engineering (Automation and Robotics Engineering) (Co-op) Pathway for Electrical Engineering Technician','related','Automation and Robotics BEng is an engineering degree related to electrical engineering; current intake suspension is separate.'),
    ('electrical-engineer','Electrical Engineering Technology','related','Engineering technology credential is related to but distinct from professional electrical engineer qualification.'),
    ('engineering-technician','Electrical Engineering Technology','direct','Direct electrical engineering technologist/technician pathway.'),
    ('financial-analyst','Business Administration - Finance','direct','Direct finance pathway.'),
    ('marketing-specialist','Advertising and Marketing Communications Management','direct','Direct marketing communications pathway.'),
    ('marketing-specialist','Bachelor of Digital Marketing Communication (Honours) (Co-op) Pathway for Public Relations','direct','Direct digital marketing communication pathway; current intake suspension is separate.'),
    ('marketing-specialist','Bachelor of Digital Marketing Communication Honours Co-op','direct','Direct digital marketing communication degree pathway; current intake suspension is separate.'),
    ('multimedia-designer','Bachelor of Information Technology - Interactive Multimedia and Design Co-op','direct','Direct interactive multimedia/design pathway; joint-institution identity hold is separate.'),
    ('network-administrator','Bachelor of Information Technology - Networking Technology Co-op','direct','Direct networking technology pathway; joint-institution identity hold is separate.'),
    ('registered-nurse','Bachelor of Science in Nursing Honours Pathway for Registered Practical Nurses','direct','Direct BScN pathway to registered-nursing qualification; next application cycle is separately held.'),
    ('tourism-manager','Bachelor of Hospitality and Tourism Management Honours Co-op','direct','Direct hospitality/tourism management degree pathway; current intake suspension is separate.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,a.relation_type,a.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join approvals a on a.canonical_career_id=l.canonical_career_id and a.title=c.title
  where c.institution_name='Algonquin College' and l.review_status='candidate'
)
update public.program_occupation_ca_staging l
set review_status='approved',relation_type=r.relation_type,source_checked_at=date '2026-08-08',reviewer_note=r.reviewer_note,reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id and l.canonical_career_id=r.canonical_career_id;

with rejections(canonical_career_id,title,reviewer_note) as (
  values
    ('care-worker','Practical Nursing Pathway for Personal Support Worker','This is a progression pathway for people already qualified/working as Personal Support Workers, not a program that trains entrants for the care-worker occupation.'),
    ('engineering-technician','Bachelor of Engineering (Automation and Robotics Engineering) (Co-op) Pathway for Electrical Engineering Technician','This BEng pathway requires prior electrical-engineering-technician preparation and progresses beyond the technician occupation; it is not an entry pathway to engineering technician.'),
    ('registered-nurse','Practical Nursing Pathway for Personal Support Worker','Practical Nursing prepares for the RPN/LPN role, not Registered Nurse licensure.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,r.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join rejections r on r.canonical_career_id=l.canonical_career_id and r.title=c.title
  where c.institution_name='Algonquin College' and l.review_status='candidate'
)
update public.program_occupation_ca_staging l
set review_status='rejected',relation_type=null,source_checked_at=date '2026-08-08',reviewer_note=r.reviewer_note,reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id and l.canonical_career_id=r.canonical_career_id;;
