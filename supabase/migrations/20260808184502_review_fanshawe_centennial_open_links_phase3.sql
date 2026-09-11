-- Canada Programs Phase 3: review occupation links for Fanshawe and Centennial programmes already verified as available to international applicants in 2026-27.

update public.program_occupation_ca_staging o
set review_status = 'approved',
    relation_type = case
      when o.canonical_career_id = 'accountant' then 'common_pathway'
      when o.canonical_career_id = 'civil-engineer' then 'related'
      when o.canonical_career_id in ('construction-manager','project-manager') then 'common_pathway'
      when o.canonical_career_id = 'electrical-engineer' then 'related'
      when o.canonical_career_id = 'engineering-technician' then 'direct'
      when o.canonical_career_id = 'financial-analyst' then 'common_pathway'
      when o.canonical_career_id in ('logistics-coordinator','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id = 'mechanical-engineer' then 'related'
      when o.canonical_career_id = 'supply-chain-analyst' and lower(c.title) like '%aerospace operations%' then 'related'
      when o.canonical_career_id = 'supply-chain-analyst' then 'common_pathway'
      else 'direct'
    end,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer')
        then 'Reviewed as related education: technician/technology study is relevant but does not itself confer the target regulated professional engineer title.'
      when o.canonical_career_id = 'supply-chain-analyst' and lower(c.title) like '%aerospace operations%'
        then 'Reviewed as related operations education with supply-chain relevance, not a direct general supply-chain analyst credential.'
      else 'Reviewed against the current institution programme scope, credential level, and verified 2026-27 international availability.'
    end,
    reviewed_at = now()
from public.program_catalog_ca_staging c
left join public.program_pgwp_ca_staging p on p.program_catalog_id = c.id
where o.program_catalog_id = c.id
  and o.review_status = 'candidate'
  and (
    (
      c.institution_name = 'Fanshawe College'
      and (
        (c.source_status = 'official_program_page_verified_international_open_2026_27'
          and p.international_program_admission_status = 'official_program_page_international_open_2026_27')
        or
        (c.source_status = 'official_program_page_verified_international_open_or_waitlisted_2026_27'
          and p.international_program_admission_status = 'official_program_page_international_open_or_waitlisted_2026_27')
      )
    )
    or
    (
      c.institution_name = 'Centennial College'
      and (
        (c.source_status = 'official_program_page_verified_international_available_2026_27'
          and p.international_program_admission_status = 'official_program_page_international_available_2026_27')
        or
        (c.source_status = 'official_program_page_verified_international_active_2026_27'
          and p.international_program_admission_status = 'official_current_program_with_international_application_path_fall_2026')
      )
    )
  );;
