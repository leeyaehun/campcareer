-- Canada Programs Phase 3: close remaining occupation candidates for Holland College, Selkirk College,
-- Lethbridge Polytechnic and Langara College. Admission/PGWP states remain unchanged unless already verified.

-- Holland College
update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing' then null
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing' then 'Rejected: Practical Nursing prepares licensed practical nurses, not Registered Nurses.'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') then 'Occupational Therapist Assistant and Physiotherapist Assistant is an assistant-level diploma and does not qualify graduates as occupational therapists or physiotherapists; relation limited to related.'
      else 'Reviewed 2026-08-08 against Holland College credential title and occupational level; current admission availability remains a separate verification state.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='Holland College' and o.review_status='candidate';

-- Selkirk College
update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='registered-nurse' and c.title in ('Nursing Unit Clerk - Certificate','Practical Nursing - Diploma') then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='registered-nurse' and c.title in ('Nursing Unit Clerk - Certificate','Practical Nursing - Diploma') then null
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy Technician - Diploma' then 'related'
      when o.canonical_career_id='primary-school-teacher' then 'common_pathway'
      when o.canonical_career_id in ('data-analyst','data-engineer') then 'common_pathway'
      when o.canonical_career_id='financial-analyst' then 'common_pathway'
      when o.canonical_career_id='chef' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.title='Nursing Unit Clerk - Certificate' then 'Rejected: Nursing Unit Clerk is a non-clinical unit administration occupation, not Registered Nurse education.'
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing - Diploma' then 'Rejected: Practical Nursing is a distinct regulated practical-nurse pathway, not Registered Nurse qualification.'
      when o.canonical_career_id='pharmacist' then 'Pharmacy Technician is a distinct regulated technician occupation and is related to pharmacy practice but does not qualify graduates as pharmacists.'
      when o.canonical_career_id='primary-school-teacher' then 'Elementary Education Associate of Arts is a university-transfer/common pathway toward teacher education, not a completed teacher-certification credential.'
      when o.canonical_career_id in ('data-analyst','data-engineer') then 'Foundations in Rural Data Science is a foundational certificate and is retained as a common pathway rather than a complete occupational credential.'
      else 'Reviewed 2026-08-08 against Selkirk College credential title and occupational level; admission publishability remains separate.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='Selkirk College' and o.review_status='candidate';

-- Lethbridge Polytechnic
update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id='civil-engineer' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='civil-engineer' then 'Civil Engineering Technology is technologist-level preparation and does not itself confer the regulated professional engineer qualification; relation limited to related.'
      when o.canonical_career_id='registered-nurse' then 'Bachelor-level Nursing and Nursing After Degree are direct RN professional education pathways; international admission status remains separately unverified at program level.'
      else 'Reviewed 2026-08-08 against Lethbridge Polytechnic credential title and occupational level; admission and PGWP state remain independent.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='Lethbridge Polytechnic' and o.review_status='candidate';

-- Langara College
update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id='hospitality-supervisor' then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='hospitality-supervisor' then 'Nutrition and Food Service Management is relevant food-service operations education but broader/different from a direct hospitality-supervisor credential; relation limited to related.'
      else 'Reviewed 2026-08-08 against Langara credential title and occupational level; program-level international admission remains separately conservative.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and c.institution_name='Langara College' and o.review_status='candidate';;
