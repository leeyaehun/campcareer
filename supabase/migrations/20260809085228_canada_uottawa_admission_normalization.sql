-- Canada Programs Phase 3: normalize current uOttawa international admission states for selected approved programmes.
-- Evidence checked 2026-08-09 against uOttawa international undergraduate admissions, Telfer CPA and ORPAS uOttawa pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2026_international_closed_next_fall_2027_application_not_yet_open_opens_mid_october_2026',
    source_url='https://www.uottawa.ca/study/undergraduate-studies/application-deadlines-available-programs-international',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' uOttawa international undergraduate admissions reviewed 2026-08-09: Computer Science BSc is Closed for Fall 2026; uOttawa states applications for the following Fall can begin as early as mid-October. Fall 2027 is therefore treated as not yet open, not inferred open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Ottawa'
  and c.title='Computer Science'
  and c.credential_type='Honours Bachelor of Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='international_ineligible_requires_canadian_bachelors_degree_international_equivalencies_not_accepted',
    source_url='https://telfer.uottawa.ca/en/graduate-diploma-in-chartered-professional-accountancy',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Telfer Graduate Diploma in Chartered Professional Accountancy reviewed 2026-08-09: admission requires a Canadian bachelor degree and the official page explicitly states international equivalencies are not accepted. The program is therefore excluded from the general international-student publication set.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Ottawa'
  and c.title='Graduate Diploma Chartered Professional Accountancy'
  and c.credential_type='Graduate Diploma';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='international_ineligible_orpas_current_canadian_citizen_or_permanent_resident_only',
    source_url='https://www.ouac.on.ca/guide/orpas-ottawa',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' ORPAS uOttawa guidance reviewed 2026-08-09: uOttawa rehabilitation sciences admissions state they are currently only accepting applications from Canadian citizens or permanent residents. The Fall 2026 ORPAS cycle is closed. Current international publication is therefore ineligible; future-cycle policy changes must be re-verified rather than inferred.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Ottawa'
  and c.title in ('Master of Health Sciences Occupational Therapy','Master of Health Sciences Physiotherapy')
  and c.credential_type='Master Degree';;
