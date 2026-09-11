-- Canada Programs Phase 3: close the remaining Sheridan occupation-review queue.
-- Admission availability remains independent and is not inferred here.

update public.program_occupation_ca_staging o
set review_status='rejected',
    relation_type=null,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note='Practical Nursing prepares for the RPN/LPN occupation, not the Registered Nurse occupation.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Sheridan College'
  and o.canonical_career_id='registered-nurse'
  and c.title='Practical Nursing';

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id='electrical-engineer' and c.title='Electrical Engineering Technician' then 'related'
      when o.canonical_career_id='hospitality-supervisor' and c.title='Nutrition and Food Service Management' then 'related'
      when o.canonical_career_id='sustainability-specialist' then 'related'
      when c.title='Computer Science, Honours Bachelor of (Artificial Intelligence / Cloud Computing / Data Analytics / Data Engineering / Game Engineering)'
        and o.canonical_career_id in ('cloud-engineer','data-analyst','data-engineer','software-developer') then 'common_pathway'
      when o.canonical_career_id='software-developer' and c.title='Honours Bachelor of Computer Science - Artificial Intelligence' then 'common_pathway'
      when o.canonical_career_id in ('supply-chain-analyst','warehouse-manager') then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='electrical-engineer' and c.title='Electrical Engineering Technician'
        then 'Electrical Engineering Technician is relevant technician-level preparation but does not itself confer the regulated professional engineer title.'
      when o.canonical_career_id='hospitality-supervisor' and c.title='Nutrition and Food Service Management'
        then 'Nutrition and Food Service Management is related food-service supervisory preparation rather than a broad hospitality-supervisor credential.'
      when o.canonical_career_id='sustainability-specialist'
        then 'Architectural sustainable-design technician/technology education is relevant built-environment sustainability preparation but not a single-title sustainability-specialist qualification.'
      when c.title='Computer Science, Honours Bachelor of (Artificial Intelligence / Cloud Computing / Data Analytics / Data Engineering / Game Engineering)'
        then 'The parent Computer Science degree contains multiple specializations; retained as a common pathway to the selected technology occupation rather than treated as a specialization-specific direct row.'
      when o.canonical_career_id='software-developer' and c.title='Honours Bachelor of Computer Science - Artificial Intelligence'
        then 'Computer Science with AI specialization is a common pathway into software development, but the credential is broader than a single software-development vocational qualification.'
      when o.canonical_career_id in ('supply-chain-analyst','warehouse-manager')
        then 'Supply Chain Management - Logistics Automation is a broad common pathway to analysis and warehouse-management roles.'
      when o.canonical_career_id='logistics-coordinator'
        then 'Supply Chain Management - Logistics Automation directly supports logistics coordination and operations roles.'
      when o.canonical_career_id='mechanical-engineer' and c.title='Mechanical Engineering, Honours Bachelor of Engineering'
        then 'Professional Mechanical Engineering bachelor pathway; direct match to the mechanical-engineer occupation.'
      when o.canonical_career_id='electrical-engineer' and c.title='Electrical Engineering, Honours Bachelor of Engineering'
        then 'Professional Electrical Engineering bachelor pathway; direct match to the electrical-engineer occupation.'
      else 'Reviewed against Sheridan programme title and credential level. Relationship is valid independently of current international admission availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Sheridan College';;
