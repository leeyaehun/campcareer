-- Canada Programs Phase 3: review Conestoga occupation links.

update public.program_occupation_ca_staging o
set review_status = 'rejected',
    match_basis = 'manual',
    relation_type = null,
    source_checked_at = date '2026-08-08',
    reviewer_note = 'Rejected in Phase 3: current Conestoga evidence marks this programme as not accepting, restricted, Canadian-only, or otherwise unavailable to the target international applicant.',
    reviewed_at = now()
from public.program_catalog_ca_staging c
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.review_status = 'candidate'
  and c.institution_name = 'Conestoga College'
  and (
    lower(coalesce(c.source_status, '')) ~ '^not_accepting'
    or lower(coalesce(c.source_status, '')) = 'official_program_page_international_ineligible_2026'
    or lower(coalesce(p.international_program_admission_status, '')) ~ '(applications_not_currently_accepted|restricted_not_open|not_eligible_for_study_permit|international_ineligible|canadian_application_only|no_current_open_intake|no_future_intake_verified|not_accepting_international_redirect)'
  );

with reviewed(program_code, canonical_career_id, relation_type, reviewer_note) as (
  values
    ('1241C','accountant','direct','Reviewed against current Conestoga programme scope; accounting is direct occupational preparation.'),
    ('0011','accountant','direct','Reviewed against current Conestoga programme scope; accounting is direct occupational preparation.'),
    ('1400','animator','direct','Reviewed against current Conestoga Animation programme scope.'),
    ('1671C','animator','direct','Reviewed against current Conestoga Bachelor of Animation programme scope.'),
    ('1241C','auditor','direct','The current degree explicitly includes accounting and audit preparation.'),
    ('1377','baker','direct','Reviewed against current Conestoga Baking and Pastry Arts programme scope.'),
    ('1484','baker','direct','Reviewed against current Conestoga Baking and Pastry Arts Management programme scope.'),
    ('1497','bricklayer','direct','Construction Techniques - Brick and Stone is direct technical preparation for brick and stone masonry pathways.'),
    ('11651','care-worker','direct','Personal Support Worker - International is direct preparation for care/support worker roles.'),
    ('1142','carpenter','direct','Carpentry and Renovation Technician is direct technical preparation for carpentry pathways.'),
    ('1026C','chef','common_pathway','Culinary Management is a common education pathway to chef and culinary leadership roles.'),
    ('1629','civil-engineer','related','Civil Engineering Technician is related preparation but does not itself confer the regulated professional engineer title.'),
    ('0024','civil-engineer','related','Civil Engineering Technology is related preparation but does not itself confer the regulated professional engineer title.'),
    ('1276','community-worker','common_pathway','Management in Community Services is a common pathway to community-service roles.'),
    ('0009','community-worker','direct','Social Service Worker is direct preparation for community and social-service worker roles.'),
    ('1580','cybersecurity-analyst','direct','Reviewed against current Conestoga Cybersecurity Response Planning programme scope.'),
    ('1664C','data-analyst','direct','Bachelor of Data Analytics is direct preparation for data-analysis roles.'),
    ('1682C','data-analyst','common_pathway','Data Science and Artificial Intelligence is a common pathway to data-analysis roles.'),
    ('1682C','data-engineer','common_pathway','Data Science and Artificial Intelligence is a common pathway to data-engineering roles.'),
    ('1355C','early-childhood-teacher','common_pathway','Early Learning Program Development is a common pathway within early-childhood education rather than a one-to-one teaching credential.'),
    ('0003','early-childhood-teacher','direct','Early Childhood Education is direct preparation for early-childhood education roles.'),
    ('00031','early-childhood-teacher','direct','Early Childhood Education Fast Track is direct preparation for early-childhood education roles.'),
    ('0071','electrical-engineer','related','Electrical Engineering Technician is related preparation but does not itself confer the regulated professional engineer title.'),
    ('0928','electrical-engineer','related','Electrical Engineering Technology is related preparation but does not itself confer the regulated professional engineer title.'),
    ('1327','electrician','direct','Electrical Techniques is direct technical preparation for electrical trade pathways.'),
    ('0025','engineering-technician','direct','Architecture - Construction Engineering Technology is direct engineering-technology preparation.'),
    ('1629','engineering-technician','direct','Civil Engineering Technician is direct technician preparation.'),
    ('0024','engineering-technician','direct','Civil Engineering Technology is direct technologist preparation.'),
    ('0071','engineering-technician','direct','Electrical Engineering Technician is direct technician preparation.'),
    ('0928','engineering-technician','direct','Electrical Engineering Technology is direct technologist preparation.'),
    ('0029','engineering-technician','direct','Energy Systems Engineering Technology - Electrical is direct engineering-technology preparation.'),
    ('0073','engineering-technician','direct','Mechanical Engineering Technology - Design and Analysis is direct technologist preparation.'),
    ('0092','engineering-technician','direct','Mechanical Engineering Technology - Robotics and Automation is direct technologist preparation.'),
    ('1046','engineering-technician','direct','Software Engineering Technician is direct technician preparation.'),
    ('1132','engineering-technician','direct','Software Engineering Technology is direct technologist preparation.'),
    ('1502','engineering-technician','direct','Welding Engineering Technician - Robotics is direct technician preparation.'),
    ('0043','engineering-technician','direct','Welding Engineering Technology - Inspection is direct technologist preparation.'),
    ('1396','financial-analyst','common_pathway','Finance study is a common education pathway to financial analyst roles.'),
    ('0049','graphic-designer','direct','Reviewed against current Conestoga Graphic Design programme scope.'),
    ('0965','human-resources-specialist','direct','Reviewed against current Conestoga Human Resources Management programme scope.'),
    ('1097','ict-support-technician','direct','Computer Systems Technician - IT Infrastructure and Services is direct ICT support/systems preparation.'),
    ('1068C','interior-designer','direct','Reviewed against current Conestoga Bachelor of Interior Design programme scope.'),
    ('1540','logistics-coordinator','common_pathway','Supply chain and operations study is a common pathway to logistics coordinator roles.'),
    ('1411','logistics-coordinator','common_pathway','Supply Chain Management is a common pathway to logistics coordinator roles.'),
    ('1532','marketing-specialist','direct','Advertising and Marketing Communications is direct marketing preparation.'),
    ('1537','marketing-specialist','direct','Social Media Marketing is direct marketing preparation.'),
    ('0073','mechanical-engineer','related','Mechanical Engineering Technology is related preparation but does not itself confer the regulated professional engineer title.'),
    ('0092','mechanical-engineer','related','Mechanical Engineering Technology is related preparation but does not itself confer the regulated professional engineer title.'),
    ('1111','occupational-therapist','related','Occupational Therapist Assistant training is related but does not qualify a graduate as an occupational therapist.'),
    ('1499','pharmacist','related','Community Pharmacy Assistant is related pharmacy-sector preparation but does not qualify a graduate as a pharmacist.'),
    ('1501','pharmacist','related','Pharmacy Technician is a distinct regulated/support pathway and does not qualify a graduate as a pharmacist.'),
    ('1111','physiotherapist','related','Physiotherapist Assistant training is related but does not qualify a graduate as a physiotherapist.'),
    ('1245','plumber','direct','Mechanical Techniques - Plumbing is direct technical preparation for plumbing trade pathways.'),
    ('1566','project-manager','common_pathway','Information Technology Project Management is a common pathway to project manager roles.'),
    ('1635C','software-developer','common_pathway','Computer Science is a common education pathway to software-development roles.'),
    ('1514C','software-developer','common_pathway','Computer Science is a common education pathway to software-development roles.'),
    ('1009','software-developer','direct','Computer Programming is direct preparation for software/programming roles.'),
    ('0057','software-developer','direct','Computer Programming and Analysis is direct preparation for software/programming roles.'),
    ('1046','software-developer','direct','Software Engineering Technician is direct software-development preparation.'),
    ('1132','software-developer','direct','Software Engineering Technology is direct software-development preparation.'),
    ('1540','supply-chain-analyst','common_pathway','Supply chain and operations study is a common pathway to supply-chain analyst roles.'),
    ('1411','supply-chain-analyst','common_pathway','Supply Chain Management is a common pathway to supply-chain analyst roles.'),
    ('1540','warehouse-manager','common_pathway','Supply chain and operations study is a common pathway to warehouse/distribution management roles.'),
    ('1411','warehouse-manager','common_pathway','Supply Chain Management is a common pathway to warehouse/distribution management roles.'),
    ('0046','welder','direct','Welding and Fabrication Technician is direct welding preparation.'),
    ('1502','welder','related','Welding Engineering Technician - Robotics is related welding-sector preparation rather than a one-to-one trade credential.'),
    ('0043','welder','related','Welding Engineering Technology - Inspection is related welding-sector preparation rather than a one-to-one trade credential.'),
    ('1193','welder','direct','Welding Techniques is direct technical preparation for welding trade pathways.')
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
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.canonical_career_id = r.canonical_career_id
  and o.review_status = 'candidate'
  and c.source_status = 'official_program_page_verified_open_international_2026'
  and p.international_program_admission_status = 'official_program_page_open_international_2026';;
