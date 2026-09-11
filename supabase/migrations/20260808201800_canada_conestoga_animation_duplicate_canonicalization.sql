-- Canonicalize the duplicate Conestoga 3D Computer Animation staging rows.
-- Keep the coded 1391 row as the durable program record and hold the uncoded shadow row as legacy.
-- Occupation relevance is independent from current admissions: the canonical 1391 program is a direct animator pathway even while applications are not currently accepted.

update public.program_catalog_ca_staging
set source_status = 'legacy_duplicate_shadow_current_coded_program'
where institution_name = 'Conestoga College'
  and title = '3D Computer Animation'
  and source_program_key = '9383729e808c6689c543ffef7cda3e6a'
  and program_code is null;

update public.program_occupation_ca_staging o
set review_status = 'approved',
    relation_type = 'direct',
    source_checked_at = date '2026-08-08',
    reviewer_note = 'Direct animator pathway. Current Conestoga admission closure is a publishability hold and does not invalidate the occupation relationship.',
    reviewed_at = now()
from public.program_catalog_ca_staging c
where c.id = o.program_catalog_id
  and c.institution_name = 'Conestoga College'
  and c.title = '3D Computer Animation'
  and c.program_code = '1391'
  and c.source_program_key = 'ad80014239452a9adf0a27d4fdb899f5'
  and o.canonical_career_id = 'animator';

update public.program_occupation_ca_staging o
set review_status = 'rejected',
    relation_type = null,
    source_checked_at = date '2026-08-08',
    reviewer_note = 'Legacy duplicate shadow of the coded Conestoga 3D Computer Animation program 1391; occupation relationship is represented by the canonical coded row.',
    reviewed_at = now()
from public.program_catalog_ca_staging c
where c.id = o.program_catalog_id
  and c.institution_name = 'Conestoga College'
  and c.title = '3D Computer Animation'
  and c.source_program_key = '9383729e808c6689c543ffef7cda3e6a'
  and o.canonical_career_id = 'animator';;
