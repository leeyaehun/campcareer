-- Canada Programs Phase 3: Douglas College occupation relationship review.
-- Reviewed 2026-08-08. Admission availability remains independent from occupation relevance.

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Future Professional Pilots' then 'https://www.douglascollege.ca/program/aafpp'
      when title='Inclusive Education and Disability Studies' then 'https://www.douglascollege.ca/program/dpccs'
      else official_program_url end,
    source_as_of='2026-08-08',
    source_status=case
      when title='Future Professional Pilots' then 'official_program_page_verified_current_2026_27'
      when title='Inclusive Education and Disability Studies' then 'official_program_page_verified_current_2026_27'
      else source_status end
where institution_name='Douglas College'
  and title in ('Future Professional Pilots','Inclusive Education and Disability Studies');

update public.program_occupation_ca_staging o
set review_status='rejected',
    relation_type=null,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note='Rejected after Phase 3 provider review: Psychiatric Nursing is a distinct regulated profession in British Columbia and does not qualify a graduate for the Registered Nurse occupation.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Douglas College'
  and o.canonical_career_id='registered-nurse'
  and c.title in ('Licensed Practical Nurse Access to Psychiatric Nursing','Psychiatric Nursing');

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('financial-analyst','hotel-manager','restaurant-manager','logistics-coordinator','supply-chain-analyst','warehouse-manager','software-developer') then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' and c.title in ('Earth & Environmental Sciences','Environmental Studies') then 'common_pathway'
      when o.canonical_career_id='special-education-teacher' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='commercial-pilot'
        then 'Douglas Future Professional Pilots is jointly delivered with Professional Flight Centre; the combined pathway includes flight training sufficient for a Commercial Pilot Licence and Multi-Engine Instrument Rating.'
      when o.canonical_career_id='special-education-teacher'
        then 'Inclusive Education and Disability Studies prepares education assistants and disability/inclusion support roles; it is relevant but does not itself confer teacher certification.'
      when o.canonical_career_id in ('hotel-manager','restaurant-manager')
        then 'Hospitality Management is a common education pathway to management roles rather than a single-title immediate qualification.'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager')
        then 'Supply-chain credentials are broad pathways across logistics coordination, analysis and warehouse-management roles.'
      when o.canonical_career_id='financial-analyst'
        then 'Finance and Accounting/Finance credentials are common pathways to financial analyst roles rather than a single occupational licence.'
      when o.canonical_career_id='software-developer'
        then 'Computing Science certificate/diploma/associate credentials are broad common pathways into software-development roles.'
      when o.canonical_career_id='environmental-scientist' and c.title in ('Earth & Environmental Sciences','Environmental Studies')
        then 'Broad environmental/earth studies are common academic pathways to environmental-science work; Environmental Science remains the direct match.'
      else 'Reviewed against Douglas College program title, credential and current provider scope. Relationship is valid independently of current international admission availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Douglas College';;
