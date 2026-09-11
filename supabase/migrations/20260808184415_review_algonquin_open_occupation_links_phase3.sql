-- Canada Programs Phase 3: review Algonquin occupation links for programmes already verified as open/waitlisted to international applicants for 2026-27.

update public.program_occupation_ca_staging o
set review_status = 'rejected',
    relation_type = null,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = 'Rejected in Phase 3: Practical Nursing is a distinct regulated practical-nurse pathway and is not direct preparation for the registered-nurse target.',
    reviewed_at = now()
from public.program_catalog_ca_staging c
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.review_status = 'candidate'
  and c.institution_name = 'Algonquin College'
  and o.canonical_career_id = 'registered-nurse'
  and lower(c.title) like 'practical nursing%'
  and c.source_status = 'official_international_availability_open_or_waitlisted_2026_27'
  and p.international_program_admission_status = 'official_international_availability_open_or_waitlisted_2026_27';

update public.program_occupation_ca_staging o
set review_status = 'approved',
    relation_type = case
      when o.canonical_career_id = 'accountant' and lower(c.title) like '%bookkeeping%' then 'related'
      when o.canonical_career_id = 'accountant' then 'common_pathway'
      when o.canonical_career_id = 'animator' and lower(c.title) like '%foundations%' then 'common_pathway'
      when o.canonical_career_id = 'chef' then 'common_pathway'
      when o.canonical_career_id = 'civil-engineer' then 'related'
      when o.canonical_career_id = 'community-worker' and lower(c.title) like '%social service worker%' then 'direct'
      when o.canonical_career_id = 'community-worker' then 'common_pathway'
      when o.canonical_career_id = 'data-analyst' then 'common_pathway'
      when o.canonical_career_id = 'early-childhood-teacher' and lower(c.title) like '%early childhood education%' then 'direct'
      when o.canonical_career_id = 'early-childhood-teacher' then 'common_pathway'
      when o.canonical_career_id = 'electrical-engineer' and lower(c.title) like 'bachelor of engineering%' then 'common_pathway'
      when o.canonical_career_id = 'electrical-engineer' then 'related'
      when o.canonical_career_id = 'engineering-technician' and lower(coalesce(c.credential_type,'')) like '%degree%' then 'related'
      when o.canonical_career_id = 'engineering-technician' then 'direct'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id = 'mechanical-engineer' and lower(c.title) like 'bachelor of engineering%' then 'common_pathway'
      when o.canonical_career_id = 'mechanical-engineer' then 'related'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') then 'related'
      when o.canonical_career_id = 'project-manager' then 'common_pathway'
      when o.canonical_career_id = 'software-developer' and lower(c.title) like 'bachelor of technology%pathway%' then 'common_pathway'
      when o.canonical_career_id = 'sustainability-specialist' then 'common_pathway'
      else 'direct'
    end,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') and lower(c.title) not like 'bachelor of engineering%'
        then 'Reviewed as related education: technician/technology study does not itself confer the target regulated professional engineer title.'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist')
        then 'Reviewed as related education: assistant training is relevant but does not qualify the graduate for the target regulated therapist profession.'
      when o.canonical_career_id = 'engineering-technician' and lower(coalesce(c.credential_type,'')) like '%degree%'
        then 'Reviewed as related education: this is a degree-completion/pathway programme built from engineering technology rather than a technician credential itself.'
      else 'Reviewed against current Algonquin programme scope, credential level and stated occupational preparation.'
    end,
    reviewed_at = now()
from public.program_catalog_ca_staging c
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.review_status = 'candidate'
  and c.institution_name = 'Algonquin College'
  and c.source_status = 'official_international_availability_open_or_waitlisted_2026_27'
  and p.international_program_admission_status = 'official_international_availability_open_or_waitlisted_2026_27';;
