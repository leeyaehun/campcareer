-- Canada Programs Phase 3: Camosun College occupation relationship review.
-- Admission availability remains independent and is not inferred here.

update public.program_occupation_ca_staging o
set review_status='rejected',
    relation_type=null,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note='Practical Nursing prepares for the LPN/RPN occupation, not the Registered Nurse occupation.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Camosun College'
  and o.canonical_career_id='registered-nurse'
  and c.title='Practical Nursing';

update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('civil-engineer','mechanical-engineer') and c.title like '%Bridge to %' then 'common_pathway'
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') then 'related'
      when o.canonical_career_id='medical-laboratory-technician' then 'related'
      when o.canonical_career_id='social-worker' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' then 'common_pathway'
      when o.canonical_career_id in ('hotel-manager','restaurant-manager','tourism-manager') then 'common_pathway'
      when o.canonical_career_id='carpenter' and c.title='Fine Furniture/Joinery Trades Foundation' then 'related'
      when o.canonical_career_id='welder' and c.title='Sheet Metal & Metal Fabrication Foundation' then 'related'
      when o.canonical_career_id='care-worker' and c.title='Education Assistant and Community Support' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id in ('civil-engineer','mechanical-engineer') and c.title like '%Bridge to %'
        then 'Camosun engineering bridge program is an explicit transfer pathway into a university engineering degree; retained as a common pathway rather than a completed professional-engineer credential.'
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer')
        then 'Engineering Technology diploma is relevant technologist-level preparation but does not itself confer the regulated professional engineer title.'
      when o.canonical_career_id='medical-laboratory-technician'
        then 'Certified Medical Laboratory Assistant is related laboratory education but distinct from technologist-level training.'
      when o.canonical_career_id='social-worker'
        then 'Pre-Social Work Associate degree is an academic transfer pathway and does not itself confer the professional social-work credential.'
      when o.canonical_career_id='financial-analyst'
        then 'Accounting/Finance credentials are common pathways to financial analyst work rather than a single occupational licence.'
      when o.canonical_career_id in ('hotel-manager','restaurant-manager','tourism-manager')
        then 'Tourism/Hospitality Management is a broad common pathway to management roles rather than an immediate single-title qualification.'
      when o.canonical_career_id='carpenter' and c.title='Fine Furniture/Joinery Trades Foundation'
        then 'Joinery/fine-furniture foundation is adjacent woodworking preparation and is related to, but narrower than, general carpentry.'
      when o.canonical_career_id='welder' and c.title='Sheet Metal & Metal Fabrication Foundation'
        then 'Sheet metal/metal fabrication is an adjacent fabrication trade and is related to, but distinct from, a direct welder foundation program.'
      when o.canonical_career_id='care-worker' and c.title='Education Assistant and Community Support'
        then 'Education Assistant and Community Support is related support-work preparation rather than direct health-care-assistant training.'
      else 'Reviewed against Camosun College program title and credential level. Relationship is valid independently of current international admission availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Camosun College';;
