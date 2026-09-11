-- Canada Programs Phase 3: review George Brown occupation links.
-- Program availability and official URLs were verified by the preceding George Brown migrations.
-- This migration converts the remaining title-match queue into explicit reviewed relationships.

update public.program_occupation_ca_staging o
set review_status = 'rejected',
    match_basis = 'manual',
    relation_type = null,
    source_checked_at = date '2026-08-08',
    reviewer_note = 'Rejected in Phase 3: current official George Brown availability marks this programme unavailable, suspended, or closed to international applicants.',
    reviewed_at = now()
from public.program_catalog_ca_staging c
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.review_status = 'candidate'
  and c.institution_name = 'George Brown Polytechnic'
  and (
    lower(coalesce(c.source_status, '')) ~ '(international_not_available|suspended|closed)'
    or lower(coalesce(p.international_program_admission_status, '')) ~ '(international_not_available|international_suspended|international_closed)'
  );

with reviewed(program_code, canonical_career_id, relation_type, reviewer_note) as (
  values
    ('B103','accountant','direct','Reviewed against the current George Brown programme title and scope; accounting is direct occupational preparation.'),
    ('B157','accountant','direct','Reviewed against the current George Brown programme title and scope; accounting is direct occupational preparation.'),
    ('H113','baker','direct','Reviewed against the current George Brown baking and pastry programme scope.'),
    ('H128','baker','direct','Reviewed against the current George Brown baking and pastry programme scope.'),
    ('T405','business-analyst','direct','Reviewed against the current George Brown Information Systems Business Analysis programme scope.'),
    ('C112','care-worker','direct','Reviewed against the current George Brown Personal Support Worker programme scope.'),
    ('T180','carpenter','direct','Reviewed against the current George Brown Carpentry and Renovation Technician programme scope.'),
    ('H100','chef','common_pathway','Culinary Management is a common education pathway to chef roles rather than a one-to-one trade credential.'),
    ('H315','chef','common_pathway','Culinary Management degree study is a common pathway to chef and culinary leadership roles.'),
    ('H316','chef','common_pathway','Culinary Management degree study is a common pathway to chef and culinary leadership roles.'),
    ('T164','civil-engineer','related','Civil Engineering Technology is related preparation but does not itself confer the regulated professional engineer title.'),
    ('T465','cloud-engineer','direct','Reviewed against the current George Brown Cloud Computing Technologies programme scope.'),
    ('C119','community-worker','direct','Reviewed against the current George Brown Social Service Worker programme scope.'),
    ('C135','community-worker','direct','Reviewed against the current George Brown Social Service Worker programme scope.'),
    ('T312','construction-manager','common_pathway','Construction Management degree study is a common pathway to construction management roles.'),
    ('T314','construction-manager','common_pathway','Construction Management degree study is a common pathway to construction management roles.'),
    ('T316','construction-manager','common_pathway','Construction Management degree study is a common pathway to construction management roles.'),
    ('T317','construction-manager','common_pathway','Construction Management degree study is a common pathway to construction management roles.'),
    ('T318','construction-manager','common_pathway','Construction Management degree study is a common pathway to construction management roles.'),
    ('T433','cybersecurity-analyst','direct','Reviewed against the current George Brown Cyber Security programme scope.'),
    ('B430','data-analyst','related','People Analytics is an analytics-specialized programme, but its domain focus is narrower than general data analyst preparation.'),
    ('C100','early-childhood-teacher','direct','Reviewed against the current George Brown Early Childhood Education programme scope.'),
    ('C118','early-childhood-teacher','direct','Reviewed against the current George Brown Early Childhood Education programme scope.'),
    ('C130','early-childhood-teacher','direct','Reviewed against the current George Brown Early Childhood Education programme scope.'),
    ('C160','early-childhood-teacher','direct','Reviewed against the current George Brown Early Childhood Education programme scope.'),
    ('T167','electrician','direct','Reviewed as direct pre-apprenticeship/technical preparation for electrical trade pathways.'),
    ('T105','engineering-technician','direct','Reviewed against the current George Brown Construction Engineering Technology programme scope.'),
    ('T161','engineering-technician','direct','Reviewed against the current George Brown Construction Engineering Technician programme scope.'),
    ('T164','engineering-technician','direct','Reviewed against the current George Brown Civil Engineering Technology programme scope.'),
    ('T182','engineering-technician','direct','Reviewed against the current George Brown Electromechanical Engineering Technology programme scope.'),
    ('B130','financial-analyst','common_pathway','Finance study is a common education pathway to financial analyst roles.'),
    ('B133','financial-analyst','common_pathway','Finance study is a common education pathway to financial analyst roles.'),
    ('B150','financial-analyst','common_pathway','Finance study is a common education pathway to financial analyst roles.'),
    ('G122','graphic-designer','direct','Reviewed against the current George Brown Graphic Design programme scope.'),
    ('H130','hospitality-supervisor','common_pathway','Tourism and Hospitality Management is a common pathway to hospitality supervisory roles.'),
    ('H130','hotel-manager','common_pathway','Tourism and Hospitality Management is a common pathway to hotel management roles.'),
    ('B134','human-resources-specialist','direct','Reviewed against the current George Brown Human Resources programme scope.'),
    ('B144','human-resources-specialist','direct','Reviewed against the current George Brown Human Resources programme scope.'),
    ('B154','human-resources-specialist','direct','Reviewed against the current George Brown Human Resources programme scope.'),
    ('B408','human-resources-specialist','direct','Reviewed against the current George Brown Human Resources Management programme scope.'),
    ('T162','hvac-technician','direct','Reviewed against the current George Brown Heating, Refrigeration, and Air Conditioning Technology programme scope.'),
    ('T141','ict-support-technician','direct','Computer Systems Technician is direct technical preparation for ICT support and systems technician roles.'),
    ('T178','interior-designer','direct','Reviewed against the current George Brown Interior Design programme scope.'),
    ('T320','interior-designer','direct','Reviewed against the current George Brown Bachelor of Interior Design programme scope.'),
    ('B122','logistics-coordinator','common_pathway','Supply Chain and Operations Management is a common pathway to logistics coordinator roles.'),
    ('B162','logistics-coordinator','common_pathway','Supply Chain and Operations Management is a common pathway to logistics coordinator roles.'),
    ('B108','marketing-specialist','direct','Reviewed against the current George Brown marketing programme scope.'),
    ('B120','marketing-specialist','direct','Reviewed against the current George Brown marketing programme scope.'),
    ('B158','marketing-specialist','direct','Reviewed against the current George Brown marketing programme scope.'),
    ('B312','marketing-specialist','direct','Reviewed against the current George Brown Digital Marketing degree scope.'),
    ('B400','marketing-specialist','direct','Reviewed against the current George Brown Sport and Event Marketing programme scope.'),
    ('B433','marketing-specialist','direct','Reviewed against the current George Brown Marketing Management - Digital Media programme scope.'),
    ('T182','mechanical-engineer','related','Electromechanical Engineering Technology is related preparation but does not itself confer the regulated professional engineer title.'),
    ('B433','multimedia-designer','related','Digital-media marketing study is related to multimedia production/design but is not a direct multimedia design credential.'),
    ('S126','occupational-therapist','related','Occupational Therapist Assistant training is related but does not qualify a graduate as an occupational therapist.'),
    ('S126','physiotherapist','related','Physical Therapist Assistant training is related but does not qualify a graduate as a physiotherapist.'),
    ('T165','plumber','direct','Reviewed as direct technical preparation for plumbing trade pathways.'),
    ('B156','project-manager','common_pathway','Project Management study is a common pathway to project manager roles.'),
    ('B415','project-manager','common_pathway','Project Management study is a common pathway to project manager roles.'),
    ('H130','restaurant-manager','common_pathway','Tourism and Hospitality Management is a common pathway to restaurant management roles.'),
    ('B122','supply-chain-analyst','common_pathway','Supply Chain and Operations Management is a common pathway to supply-chain analyst roles.'),
    ('B162','supply-chain-analyst','common_pathway','Supply Chain and Operations Management is a common pathway to supply-chain analyst roles.'),
    ('H130','tourism-manager','common_pathway','Tourism and Hospitality Management is a common pathway to tourism management roles.'),
    ('G113','ux-designer','direct','Interaction Design is direct preparation for UX and interaction design roles.'),
    ('B122','warehouse-manager','common_pathway','Supply Chain and Operations Management is a common pathway to warehouse and distribution management roles.'),
    ('B162','warehouse-manager','common_pathway','Supply Chain and Operations Management is a common pathway to warehouse and distribution management roles.'),
    ('T166','welder','direct','Reviewed as direct technical preparation for welding trade pathways.'),
    ('C133','youth-worker','direct','Reviewed against the current George Brown Child and Youth Care programme scope.'),
    ('C153','youth-worker','direct','Reviewed against the current George Brown Child and Youth Care programme scope.')
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
  on c.institution_name = 'George Brown Polytechnic'
 and c.program_code = r.program_code
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.canonical_career_id = r.canonical_career_id
  and o.review_status = 'candidate'
  and c.source_status = 'official_program_page_verified_international_open_2026_27'
  and p.international_program_admission_status in (
    'official_program_availability_international_open_2026_27',
    'official_program_page_international_open_2026_27'
  );

update public.program_occupation_ca_staging o
set review_status = 'rejected',
    match_basis = 'manual',
    relation_type = null,
    source_checked_at = date '2026-08-08',
    reviewer_note = 'Rejected in Phase 3: Practical Nursing is a distinct regulated nursing pathway and is not direct preparation for the registered-nurse target.',
    reviewed_at = now()
from public.program_catalog_ca_staging c
where o.program_catalog_id = c.id
  and c.institution_name = 'George Brown Polytechnic'
  and c.program_code = 'S121'
  and o.canonical_career_id = 'registered-nurse'
  and o.review_status = 'candidate';;
