-- Canada Programs Phase 3: review BCIT occupation links for programmes already identified on the current international programme / PGWP-aligned lists.

update public.program_occupation_ca_staging o
set review_status = 'approved',
    relation_type = case
      when o.canonical_career_id = 'accountant' then 'common_pathway'
      when o.canonical_career_id = 'carpenter' and lower(c.title) like '%cabinetmaker%' then 'related'
      when o.canonical_career_id = 'civil-engineer' and lower(coalesce(c.credential_type,'')) like '%bachelor of engineering%' then 'direct'
      when o.canonical_career_id = 'civil-engineer' then 'related'
      when o.canonical_career_id = 'construction-manager' then 'direct'
      when o.canonical_career_id = 'environmental-engineer' then 'related'
      when o.canonical_career_id = 'film-editor' then 'common_pathway'
      when o.canonical_career_id = 'financial-analyst' then 'common_pathway'
      when o.canonical_career_id = 'ict-support-technician' and lower(c.title) like '%security systems%' then 'related'
      when o.canonical_career_id = 'interior-designer' and lower(coalesce(c.credential_type,'')) like '%bachelor%' then 'direct'
      when o.canonical_career_id = 'interior-designer' then 'common_pathway'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id = 'mechanical-engineer' then 'related'
      when o.canonical_career_id = 'software-developer' then 'common_pathway'
      when o.canonical_career_id = 'sustainability-specialist' then 'common_pathway'
      else 'direct'
    end,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = case
      when o.canonical_career_id in ('civil-engineer','environmental-engineer','mechanical-engineer')
           and not (o.canonical_career_id='civil-engineer' and lower(coalesce(c.credential_type,'')) like '%bachelor of engineering%')
        then 'Reviewed as related education: technology/diploma study is relevant but does not itself confer the target regulated professional engineer title.'
      when o.canonical_career_id = 'ict-support-technician' and lower(c.title) like '%security systems%'
        then 'Reviewed as related technical preparation; security-systems technician training overlaps ICT support but is not a one-to-one ICT support credential.'
      else 'Reviewed against the current BCIT international programme listing, credential level, and programme scope.'
    end,
    reviewed_at = now()
from public.program_catalog_ca_staging c
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.review_status = 'candidate'
  and c.institution_name = 'British Columbia Institute of Technology'
  and p.international_program_admission_status in (
    'international_program_listed_current',
    'bcit_international_and_pgwp_flag_current_program_list'
  );;
