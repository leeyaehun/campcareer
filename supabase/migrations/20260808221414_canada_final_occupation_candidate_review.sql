-- Canada Programs Phase 3: close the final occupation candidate queues for Dalhousie, UNB, UPEI and UTM.
-- This migration reviews durable occupation relevance only; current international admission remains separately conservative.

-- Dalhousie: canonicalize the generalized BCS duplicate and review credential level.
update public.program_catalog_ca_staging
set source_status='legacy_duplicate_shadow_current_bcs_official_page',source_as_of='2026-08-08'
where institution_name='Dalhousie University'
  and title='Computer Science' and credential_type='Bachelor of Computer Science';

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_bcs_official_page' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_bcs_official_page' then null
      when o.canonical_career_id='agronomist' then 'related'
      when o.canonical_career_id='architect' then 'related'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','mechanical-engineer') then 'related'
      when o.canonical_career_id='registered-nurse' and c.credential_type='Graduate program of study (credential varies by program)' then 'related'
      when o.canonical_career_id='social-worker' and c.credential_type='Graduate program of study (credential varies by program)' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_bcs_official_page' then 'Rejected generalized duplicate because Dalhousie already has a current Bachelor of Computer Science row with an official program page.'
      when o.canonical_career_id='agronomist' then 'Plant Science Technology is diploma/technician-level agricultural education and is related to agronomy but not treated as a full agronomist professional pathway.'
      when o.canonical_career_id='architect' then 'Generalized graduate Architecture can mix professional and research credentials; relation retained conservatively as related rather than overstating the aggregate as the professional M.Arch.'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','mechanical-engineer') then 'Graduate engineering aggregate is advanced study rather than the first accredited professional engineering credential; relation limited to related.'
      when o.canonical_career_id='registered-nurse' and c.credential_type='Graduate program of study (credential varies by program)' then 'Graduate Nursing is advanced/post-licensure education rather than the first RN credential; relation limited to related.'
      when o.canonical_career_id='social-worker' and c.credential_type='Graduate program of study (credential varies by program)' then 'Graduate Social Work aggregate can mix professional MSW and research credentials; relation retained conservatively as related while BSW is direct.'
      else 'Reviewed 2026-08-08 against Dalhousie credential scope and occupational level; admission publishability remains separate.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='Dalhousie University' and o.review_status='candidate';

-- University of New Brunswick.
update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','electrical-engineer','mechanical-engineer') then 'related'
      when o.canonical_career_id='financial-analyst' then 'direct'
      when o.canonical_career_id='forestry-technician' then 'related'
      when o.canonical_career_id='registered-nurse' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','electrical-engineer','mechanical-engineer') then 'Graduate engineering aggregate is advanced education rather than the first accredited professional engineering credential; relation limited to related.'
      when o.canonical_career_id='forestry-technician' then 'University graduate Forestry and Environmental Management is relevant forestry education but is not technician-specific preparation; relation limited to related.'
      when o.canonical_career_id='registered-nurse' then 'Graduate Nursing is advanced/post-licensure education rather than entry RN qualification; relation limited to related.'
      when o.canonical_career_id='software-developer' then 'Bachelor/Master/graduate Computer Science are common academic pathways to software-development roles rather than a licensed occupational credential.'
      else 'Reviewed 2026-08-08 against UNB credential scope and occupational level; current admission availability remains separate.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='University of New Brunswick' and o.review_status='candidate';

-- UPEI: canonicalize generic Computer Science undergraduate shadow against the current program row.
update public.program_catalog_ca_staging
set source_status='legacy_duplicate_shadow_current_computer_science_major',source_as_of='2026-08-08'
where institution_name='University of Prince Edward Island'
  and title='Computer Science' and credential_type='Undergraduate program of study';

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_computer_science_major' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_computer_science_major' then null
      when o.canonical_career_id='accountant' and c.credential_type='Certificate' then 'common_pathway'
      when o.canonical_career_id='data-analyst' then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' and c.credential_type='Bachelor Degree' then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' then 'related'
      when o.canonical_career_id='registered-nurse' and c.credential_type='Master Degree' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' and c.credential_type='Bachelor Degree' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'related'
      when o.canonical_career_id='tourism-manager' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='software-developer' and c.source_status='legacy_duplicate_shadow_current_computer_science_major' then 'Rejected generic undergraduate Computer Science shadow because the current Computer Science Major row with an official program page already exists.'
      when o.canonical_career_id='accountant' then 'Accounting certificate is foundational/common accounting education rather than a complete professional accountant qualification.'
      when o.canonical_career_id='registered-nurse' and c.credential_type='Master Degree' then 'Master of Nursing is advanced/post-licensure nursing education rather than the initial RN credential; relation limited to related.'
      when o.canonical_career_id='registered-nurse' then 'Bachelor of Science in Nursing and accelerated BScN are direct RN professional pathways.'
      when o.canonical_career_id='environmental-scientist' and c.credential_type<>'Bachelor Degree' then 'Graduate Environmental Sciences is advanced/research education; relation retained as related rather than entry occupational preparation.'
      else 'Reviewed 2026-08-08 against UPEI credential scope and occupational level; program-level international admission remains a separate verification step.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='University of Prince Edward Island' and o.review_status='candidate';

-- University of Toronto Mississauga: these are programs-of-study (Specialist/Major/Minor) within degree structures,
-- so map them as academic pathways rather than standalone occupational credentials.
update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when c.credential_type='Minor' then 'related'
      else 'common_pathway'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when c.credential_type='Minor' then 'UTM Minor is a component of an undergraduate degree rather than a standalone professional credential; relation limited to related.'
      else 'UTM Specialist/Major is an academic program-of-study within a degree and is retained as a common pathway to the occupation rather than a standalone occupational qualification.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='University of Toronto Mississauga' and o.review_status='candidate';;
