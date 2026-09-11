-- Canada Programs Phase 3: verify current international admission for two official-URL college programs.
-- Evidence checked 2026-08-09 against live Fanshawe and Conestoga program pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='current_2026_27_international_application_open_program_currently_available_to_international_applicants_only',
    source_url='https://www.fanshawec.ca/programs/anc1-3d-animation-and-character-design/current',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Fanshawe ANC1 reviewed 2026-08-09: the live 3D Animation and Character Design page explicitly states the program is currently available to International applicants only and provides an international Apply Now route through Fanshawe VAS. Exact PGWP/CIP state remains separate and is not inferred.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Fanshawe College'
  and c.title='3D Animation and Character Design'
  and c.credential_type='Ontario College Graduate Certificate';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='september_2026_international_application_open',
    source_url='https://www.conestogac.on.ca/fulltime/woodworking-technician',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Conestoga Woodworking Technician reviewed 2026-08-09: the live September 2026 program page provides a dedicated Apply now: international applicants route, publishes 2026-27 international tuition for the September 2026/Winter 2027 delivery sequence, and current international admission requirements/contact details. The current September 2026 program is therefore treated as internationally open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Conestoga College'
  and c.title='Woodworking Technician (Optional Co-op)'
  and c.credential_type='Ontario College Diploma';;
