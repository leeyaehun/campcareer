update public.program_pgwp_ca_staging p
set international_program_admission_status='official_program_page_international_open_may_2027',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' September 2026 and January 2027 international intakes were closed on the reviewed provider page; May 2027 was open, so the machine-readable status records the available future intake.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Seneca Polytechnic'
  and c.program_code='PND';;
