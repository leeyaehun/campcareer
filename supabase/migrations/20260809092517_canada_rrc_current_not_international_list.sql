-- Canada Programs Phase 3: close remaining RRC generic admission-unverified rows using the live International Education programme list.
-- Evidence checked 2026-08-09. RRC International Education states that its listed programs are the programs that apply to international students,
-- and separately lists both PGWP-eligible and non-PGWP international programs. Animation and Power Engineering 3rd/5th are absent from both current lists.
-- We preserve international_students_eligible=true where historical/catalogue evidence exists and record a current-availability hold rather than a permanent ineligibility claim.

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',source_status='official_current_program_verified_not_listed_current_rrc_international_availability'
where institution_name='Red River College Polytechnic'
  and title='Animation' and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_international_unavailable_not_listed_on_rrc_international_program_availability_page_next_program_start_2027_09_01',
    source_url='https://www.rrc.ca/international/study-at-rrc/',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Animation reviewed 2026-08-09: the current catalogue shows a September 1, 2027 estimated start and Apply Now, but RRC International Education defines its live list as the programs that apply to international students and Animation is absent from both the PGWP-eligible and non-PGWP international lists. Current international availability is therefore held as unavailable/not listed; future list updates should be re-verified rather than assuming permanent ineligibility.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic'
  and c.title='Animation' and c.credential_type='Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',source_status='official_current_laddered_program_not_listed_current_rrc_international_availability'
where institution_name='Red River College Polytechnic'
  and title='Power Engineering Technology (3rd Class)' and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_international_unavailable_not_listed_on_rrc_international_program_availability_page_laddered_requires_4th_class_licence',
    source_url='https://www.rrc.ca/international/study-at-rrc/',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Power Engineering Technology 3rd Class reviewed 2026-08-09: the current catalogue describes a one-year laddered diploma that builds on a 4th Class licence and publishes a September 2026 start, including an international fee estimate. However, RRC International Education omits the program from both current international program lists. Current international availability is therefore held as unavailable/not listed rather than treated as generally open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic'
  and c.title='Power Engineering Technology (3rd Class)' and c.credential_type='Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',source_status='official_current_program_not_listed_current_rrc_international_availability'
where institution_name='Red River College Polytechnic'
  and title='Power Engineering Technology (5th Class)' and credential_type='Applied Certificate';

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_international_unavailable_not_listed_on_rrc_international_program_availability_page',
    source_url='https://www.rrc.ca/international/study-at-rrc/',
    source_as_of='2026-08-09',verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' RRC Power Engineering Technology 5th Class reviewed 2026-08-09: the program is current in the catalogue, but RRC International Education omits it from both the PGWP-eligible and non-PGWP lists that define current international programs. Current international availability is therefore held as unavailable/not listed; this does not assert permanent international ineligibility.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic'
  and c.title='Power Engineering Technology (5th Class)' and c.credential_type='Applied Certificate';;
