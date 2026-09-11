-- Canada Programs Phase 3: review SAIT occupation relationships for programmes already represented on the current school-aligned programme list.
update public.program_occupation_ca_staging o
set review_status='approved', relation_type=case
  when o.canonical_career_id='accountant' then 'common_pathway'
  when o.canonical_career_id='aircraft-maintenance-technician' then 'direct'
  when o.canonical_career_id='civil-engineer' then 'related'
  when o.canonical_career_id='construction-manager' and lower(c.title) like 'bachelor of science in construction project management%' then 'common_pathway'
  when o.canonical_career_id='construction-manager' then 'direct'
  when o.canonical_career_id='cybersecurity-analyst' then 'direct'
  when o.canonical_career_id='data-analyst' then 'direct'
  when o.canonical_career_id='early-childhood-teacher' then 'direct'
  when o.canonical_career_id='electrical-engineer' then 'related'
  when o.canonical_career_id='engineering-technician' then 'direct'
  when o.canonical_career_id='graphic-designer' then 'direct'
  when o.canonical_career_id='human-resources-specialist' then 'direct'
  when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
  when o.canonical_career_id='marketing-specialist' then 'direct'
  when o.canonical_career_id='mechanical-engineer' then 'related'
  when o.canonical_career_id='medical-laboratory-technician' then 'direct'
  when o.canonical_career_id='project-manager' then 'common_pathway'
  when o.canonical_career_id='software-developer' then 'direct'
  when o.canonical_career_id='tourism-manager' then 'common_pathway'
  when o.canonical_career_id='ux-designer' then 'direct'
  when o.canonical_career_id='web-designer' then 'direct'
  when o.canonical_career_id='welder' and lower(c.title) like '%engineering technology%' then 'related'
  when o.canonical_career_id='welder' then 'direct'
  else 'related' end,
  match_basis='manual', source_checked_at=date '2026-08-08',
  reviewer_note=case
    when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') then 'Reviewed as related education: engineering-technology study is relevant but does not itself confer the target regulated professional engineer title.'
    when o.canonical_career_id='welder' and lower(c.title) like '%engineering technology%' then 'Reviewed as related welding-sector education rather than a one-to-one welding trade credential.'
    else 'Reviewed against the SAIT programme title, credential scope and target occupation; publication eligibility remains separately gated.' end,
  reviewed_at=now()
from public.program_catalog_ca_staging c join public.program_pgwp_ca_staging p on p.program_catalog_id=c.id
where o.program_catalog_id=c.id and o.review_status='candidate' and c.institution_name='Southern Alberta Institute of Technology'
  and p.international_program_admission_status='school_pgwp_aligned_current_list';;
