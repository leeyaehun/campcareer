-- Canada Programs Phase 3: normalize three small official-URL admission cases with current provider evidence.
-- Evidence checked 2026-08-09 against Carleton undergraduate deadlines, Humber live availability, and VIU/Selkirk partnership instructions.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_september_2026_deadline_2027_04_01',
    source_url='https://admissions.carleton.ca/deadlines/',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Carleton BCS reviewed 2026-08-09: the 2026-27 admissions timeline states OUAC and Carleton direct international applications open in September 2026, with the main international deadline April 1, 2027. Fall 2027 is therefore not yet open as of August 9.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Carleton University'
  and c.title='Bachelor of Computer Science'
  and c.credential_type='Bachelor of Computer Science';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='september_2026_january_2027_international_open_may_2027_canada_open_outside_canada_opening_soon',
    cip_code='19.0709',
    field_of_study_required=true,
    field_of_study_eligible=true,
    ircc_program_eligible=true,
    pgwp_program_status='humber_program_page_pgwp_eligible_cip_19_0709',
    source_url='https://healthsciences.humber.ca/programs/early-childhood-education.html',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Humber ECE reviewed 2026-08-09: the live program page lists PGWP Eligible Yes, CIP 19.0709 and international availability Open for September 2026 and January 2027. May 2027 is Open for international applicants in Canada and Opening Soon for applicants outside Canada.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Humber Polytechnic'
  and c.title='Early Childhood Education'
  and c.credential_type='Diploma';

update public.program_catalog_ca_staging
set source_as_of='2026-08-09',
    source_status='official_program_page_verified_partner_delivery_admission_through_selkirk_college'
where institution_name='Vancouver Island University'
  and title='Pharmacy Technician'
  and credential_type='Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status='restricted_not_open_standalone_viu_delivery_partner_apply_through_selkirk_college',
    source_url='https://hshs.viu.ca/pharmacy-technician',
    source_as_of='2026-08-09',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' VIU Pharmacy Technician reviewed 2026-08-09: VIU is a lab/practicum delivery partner. The official VIU page directs applicants to apply to Selkirk College and indicate VIU for the lab/practicum portion. This VIU staging identity is therefore held as a non-standalone admission route rather than treated as an independently open VIU intake.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title='Pharmacy Technician'
  and c.credential_type='Diploma';;
