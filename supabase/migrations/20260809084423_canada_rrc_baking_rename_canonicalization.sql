-- Canada Programs Phase 3: canonicalize RRC Professional Baking and Pastry -> Baking and Pastry Arts rename.
-- Evidence checked 2026-08-09 against the current RRC catalogue Recent Changes and International Education PGWP list.

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_current_program_verified_renamed_from_professional_baking_and_pastry'
where institution_name='Red River College Polytechnic'
  and title='Baking and Pastry Arts'
  and credential_type='Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    ircc_program_eligible=false,
    pgwp_program_status='rrc_official_noneligible_pgwp_list_legacy_name_maps_to_current_renamed_program',
    international_program_admission_status='program_level_international_admission_not_yet_verified_current_renamed_baking_program',
    source_url='https://www.rrc.ca/international/study-at-rrc/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC catalogue reviewed 2026-08-09: Professional Baking and Pastry was renamed Baking and Pastry Arts. The current RRC International Education non-PGWP list still uses the former Professional Baking and Pastry name; the explicit catalogue rename establishes program identity, so the provider-specific PGWP-ineligible state is carried to the renamed current program. Current international intake availability is not inferred from the legacy-name international list and remains unverified.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Baking and Pastry Arts'
  and c.credential_type='Certificate';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='legacy_duplicate_shadow_renamed_to_baking_and_pastry_arts'
where institution_name='Red River College Polytechnic'
  and title='Professional Baking and Pastry'
  and credential_type='Certificate';

update public.program_pgwp_ca_staging p
set international_program_admission_status='legacy_program_renamed_to_baking_and_pastry_arts',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC catalogue explicitly states this former program name has been replaced by Baking and Pastry Arts; retained only as a legacy identity shadow.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Professional Baking and Pastry'
  and c.credential_type='Certificate';

update public.program_occupation_ca_staging o
set review_status='rejected',relation_type=null,source_checked_at='2026-08-09',reviewed_at=now(),
    reviewer_note='Rejected legacy program-name shadow: RRC explicitly renamed Professional Baking and Pastry to Baking and Pastry Arts; the current renamed row retains the baker relationship.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Red River College Polytechnic'
  and c.title='Professional Baking and Pastry'
  and c.credential_type='Certificate'
  and o.canonical_career_id='baker';;
