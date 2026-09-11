-- Canada Programs Phase 3: close the remaining SAIT occupation candidate queue.
-- Admission/PGWP states remain conservative because most generalized catalogue rows still require current program-level verification.

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Chemical Laboratory Technology' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Chemical Laboratory Technology' then null
      when o.canonical_career_id='chemical-engineer' then 'related'
      when o.canonical_career_id='film-editor' then 'common_pathway'
      when o.canonical_career_id='physiotherapist' then 'related'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Chemical Laboratory Technology' then 'Rejected: Chemical Laboratory Technology prepares chemical/laboratory technologists and is distinct from medical laboratory technology and regulated medical laboratory occupations.'
      when o.canonical_career_id='chemical-engineer' then 'Chemical Engineering Technology is relevant technologist-level preparation but does not itself confer the regulated professional engineer qualification; relation limited to related.'
      when o.canonical_career_id='physiotherapist' then 'Occupational/Physical Therapist Assistant prepares assistant roles and does not qualify graduates as physiotherapists; relation limited to related.'
      when o.canonical_career_id='film-editor' then 'Film and Video Production is a common production pathway that can lead to editing roles but is not an editor-specific credential.'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'Supply Chain Management diploma is a common pathway across logistics, analysis and warehouse-management roles; relation is not overstated as a single direct occupational credential.'
      else 'Reviewed 2026-08-08 against SAIT program title and occupational level; admission publishability remains separate and conservative for generalized catalogue rows.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Southern Alberta Institute of Technology'
  and o.review_status='candidate';;
