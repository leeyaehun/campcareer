-- Canada Programs Phase 3: Humber occupation relationship review.
-- Reviewed 2026-08-08 from current staged Humber catalogue titles and credential levels.
-- Admission availability remains independent and is not inferred by this migration.

-- Reject clear occupation false positives / different regulated occupations.
update public.program_occupation_ca_staging o
set review_status='rejected',
    relation_type=null,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing'
        then 'Practical Nursing prepares for the RPN/LPN occupation, not the Registered Nurse occupation.'
      when o.canonical_career_id='supply-chain-analyst' and c.title='Hospitality and Tourism Operations Management'
        then 'Hospitality and Tourism Operations Management is not a supply-chain analyst education pathway; this was a title-keyword false positive.'
      else 'Rejected after manual Phase 3 occupation review.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Humber Polytechnic'
  and (
    (o.canonical_career_id='registered-nurse' and c.title='Practical Nursing')
    or
    (o.canonical_career_id='supply-chain-analyst' and c.title='Hospitality and Tourism Operations Management')
  );

-- Approve the remaining durable occupation relationships. Current intake availability stays separate.
update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer') then 'related'
      when o.canonical_career_id='mechanical-engineer' and c.title <> 'Mechatronics Engineering (Bachelor of Engineering)' then 'related'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist','pharmacist') then 'related'
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Medical Laboratory Assistant' then 'related'
      when o.canonical_career_id='carpenter' and c.title='Industrial Woodworking Technician' then 'related'
      when o.canonical_career_id in ('financial-analyst','logistics-coordinator','supply-chain-analyst','warehouse-manager','sustainability-specialist') then 'common_pathway'
      when o.canonical_career_id='mechanical-engineer' and c.title='Mechatronics Engineering (Bachelor of Engineering)' then 'common_pathway'
      when o.canonical_career_id='multimedia-designer' and c.title='Graphic Design for Print and Digital Media' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer')
        then 'Humber technician/technology education is relevant technical preparation but does not itself confer the regulated professional engineer title.'
      when o.canonical_career_id='mechanical-engineer' and c.title <> 'Mechatronics Engineering (Bachelor of Engineering)'
        then 'Mechanical/electromechanical technician or technologist education is relevant technical preparation but distinct from professional engineer qualification.'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist')
        then 'The OTA/PTA diploma prepares assistant-level practitioners and is related to, but distinct from, the regulated therapist occupation.'
      when o.canonical_career_id='pharmacist'
        then 'Pharmacy Technician is a distinct regulated/support occupation and is retained only as related education to pharmacist work.'
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Medical Laboratory Assistant'
        then 'Medical Laboratory Assistant is related laboratory education but distinct from the technologist-level pathway.'
      when o.canonical_career_id='carpenter' and c.title='Industrial Woodworking Technician'
        then 'Industrial Woodworking is adjacent millwork/woodworking preparation rather than a direct general carpenter qualification.'
      when o.canonical_career_id in ('financial-analyst','logistics-coordinator','supply-chain-analyst','warehouse-manager','sustainability-specialist')
        then 'Reviewed as a broad common education pathway to the target role rather than a single-title vocational qualification.'
      when o.canonical_career_id='mechanical-engineer' and c.title='Mechatronics Engineering (Bachelor of Engineering)'
        then 'Mechatronics Engineering is a professional engineering pathway with substantial mechanical overlap; retained as a common pathway rather than a direct Mechanical Engineering degree.'
      when o.canonical_career_id='multimedia-designer' and c.title='Graphic Design for Print and Digital Media'
        then 'Graphic design for print/digital media can support multimedia-design roles depending on portfolio specialization; retained as a common pathway.'
      else 'Reviewed against Humber programme title and credential level. Relationship is valid independently of current international admission availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Humber Polytechnic';;
