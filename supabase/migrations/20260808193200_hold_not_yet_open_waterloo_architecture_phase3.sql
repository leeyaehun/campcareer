update public.program_pgwp_ca_staging p
set international_program_admission_status='current_closed_fall_2027_application_cycle_not_yet_open_opens_mid_september_2026',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'Corrective publication hold: on 2026-08-08 Waterloo states Fall 2027 undergraduate Architecture applications open in mid-September 2026; the cycle is not yet open and must remain held.')
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='University of Waterloo' and c.title='Architecture' and c.credential_type='Bachelor of Architectural Studies';;
