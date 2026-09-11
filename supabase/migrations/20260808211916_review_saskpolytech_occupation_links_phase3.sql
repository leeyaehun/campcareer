-- Canada Programs Phase 3: Saskatchewan Polytechnic occupation review.
-- Occupation relevance is reviewed separately from international admission availability.

-- Reject clear false positives / distinct regulated occupations.
update public.program_occupation_ca_staging o
set review_status='rejected',
    relation_type=null,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='ict-support-technician' and c.title='Building Systems Technician'
        then 'Building Systems Technician is a building/facilities systems program, not an ICT support technician pathway.'
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing'
        then 'Practical Nursing prepares for the LPN/RPN occupation, not Registered Nurse.'
      when o.canonical_career_id='registered-nurse' and c.title='Psychiatric Nursing'
        then 'Psychiatric Nursing is a distinct regulated nursing profession and is not the Registered Nurse pathway.'
      else 'Rejected after manual Phase 3 occupation review.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Saskatchewan Polytechnic'
  and (
    (o.canonical_career_id='ict-support-technician' and c.title='Building Systems Technician')
    or
    (o.canonical_career_id='registered-nurse' and c.title in ('Practical Nursing','Psychiatric Nursing'))
  );

-- Approve remaining durable relationships conservatively by occupational level.
update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer') then 'related'
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Medical Laboratory Assistant' then 'related'
      when o.canonical_career_id='pharmacist' then 'related'
      when o.canonical_career_id in ('chef','hotel-manager','restaurant-manager') then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer')
        then 'Engineering Technology diploma is relevant technologist-level preparation but does not itself confer the regulated professional engineer title.'
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Medical Laboratory Assistant'
        then 'Medical Laboratory Assistant is related laboratory education but distinct from the technologist-level pathway.'
      when o.canonical_career_id='pharmacist'
        then 'Pharmacy Technician is a distinct regulated/support occupation and is retained only as related education to pharmacist work.'
      when o.canonical_career_id='chef'
        then 'Culinary Arts is a common pathway to chef roles; cook-level work is the more direct initial occupational outcome.'
      when o.canonical_career_id in ('hotel-manager','restaurant-manager')
        then 'Hospitality Management is a broad common pathway to management roles rather than an immediate single-title qualification.'
      when o.canonical_career_id='counsellor'
        then 'Mental Health and Addictions Counselling is direct occupational preparation for counselling roles within its practice scope.'
      else 'Reviewed against Saskatchewan Polytechnic program title and credential level. Relationship is valid independently of current international admission availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Saskatchewan Polytechnic';;
