update public.program_pgwp_ca_staging p
set international_program_admission_status='international_not_accepting_current_2026_27_admissions_closed_reopen_late_september_2026',
    source_url='https://www.nscc.ca/international-students/admissions-and-costs/apply-to-nscc/index.asp',
    source_as_of=date '2026-08-08',
    verified_at=now(),
    rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'Official NSCC international admissions page checked 2026-08-08: international admissions for the 2026/27 academic year are closed and are expected to reopen in late September. Current publication must remain held until applications reopen or a newer official status is verified.')
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Nova Scotia Community College'
  and p.international_students_eligible is true
  and lower(coalesce(p.international_program_admission_status,'')) not like '%not_eligible_for_study_permit%';;
