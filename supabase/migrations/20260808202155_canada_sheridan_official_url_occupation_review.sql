-- Sheridan College Phase 3 verification for occupation-linked programs with official program URLs.
-- Official program pages checked 2026-08-08 expose current Domestic/International availability.
-- Occupation relevance is reviewed independently from current admission availability.

update public.program_catalog_ca_staging
set official_program_url = 'https://www.sheridancollege.ca/programs/digital-creature-animation-technical-direction'
where institution_name = 'Sheridan College'
  and program_code = 'PCDCA'
  and title = 'Digital Creature Animation - Technical Direction';

with verified(program_code, admission_status, pgwp_verified, official_url) as (
  values
    ('PVETT', 'official_program_page_international_available_or_waitlisted_2026_27', true, 'https://www.sheridancollege.ca/programs/veterinary-technician'),
    ('PCANM', 'official_program_page_international_available_sep_2026', true, 'https://www.sheridancollege.ca/programs/computer-animation'),
    ('PCDCA', 'official_program_page_international_available_sep_2026', null, 'https://www.sheridancollege.ca/programs/digital-creature-animation-technical-direction'),
    ('PCSCL', 'official_program_page_international_available_2026_27', true, 'https://www.sheridancollege.ca/programs/computer-systems-technician-cyber-security'),
    ('PCOES', 'official_program_page_international_available_jan_2027', true, 'https://www.sheridancollege.ca/programs/construction-engineering-technician-sustainability'),
    ('PBAMK', 'official_program_page_international_available_sep_2026_jan_2027', null, 'https://www.sheridancollege.ca/programs/business-administration-marketing'),
    ('PMMDSC', 'official_program_page_international_available_sep_2026', true, 'https://www.sheridancollege.ca/programs/marketing-management-digital-strategies'),
    ('PINME', 'official_program_page_international_available_sep_2026', true, 'https://www.sheridancollege.ca/programs/interactive-media-management'),
    ('PPHTO', 'official_program_page_international_available_sep_2026_jan_2027', true, 'https://www.sheridancollege.ca/programs/pharmacy-technician'),
    ('PCYCD', 'official_program_page_international_available_sep_2026_jan_2027', true, 'https://www.sheridancollege.ca/programs/child-and-youth-care')
), resolved as (
  select c.id as program_catalog_id, v.*
  from public.program_catalog_ca_staging c
  join verified v on v.program_code = c.program_code
  where c.institution_name = 'Sheridan College'
)
update public.program_pgwp_ca_staging p
set international_program_admission_status = r.admission_status,
    ircc_program_eligible = coalesce(r.pgwp_verified, p.ircc_program_eligible),
    pgwp_program_status = case
      when r.pgwp_verified is true then 'official_provider_program_page_pgwp_aligned_current'
      else p.pgwp_program_status
    end,
    source_url = r.official_url,
    source_as_of = date '2026-08-08',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'Sheridan official program page checked 2026-08-08 for current international availability; PGWP status updated only where the page explicitly marks the program PGWP-aligned.')
from resolved r
where p.program_catalog_id = r.program_catalog_id;

update public.program_catalog_ca_staging c
set source_status = 'official_program_page_verified_international_available_2026_27',
    source_as_of = date '2026-08-08'
where c.institution_name = 'Sheridan College'
  and c.program_code in ('PVETT','PCANM','PCDCA','PCSCL','PCOES','PBAMK','PMMDSC','PINME','PPHTO','PCYCD');

with held(program_code, title, admission_status, official_url, pgwp_verified) as (
  values
    ('PCPET', 'Computer Engineering Technology', 'current_closed_program_not_accepting_applications_2026_27', 'https://www.sheridancollege.ca/programs/computer-engineering-technology', null),
    ('PBAPM', 'Business Analysis and Process Management', 'current_closed_program_not_accepting_applications_2026_27', 'https://www.sheridancollege.ca/programs/business-analysis-process-management', null),
    ('PECEI', 'Early Childhood Education - Intensive', 'current_closed_international_sep_2026', 'https://www.sheridancollege.ca/programs/early-childhood-education-intensive', true),
    ('PBACS', 'Computer Science - Mobile Computing', 'current_intake_check_program_page_international_status_not_listed_jan_2027', 'https://www.sheridancollege.ca/programs/bachelor-computer-science-mobile-computing', true)
), resolved as (
  select c.id as program_catalog_id, h.*
  from public.program_catalog_ca_staging c
  join held h on h.program_code = c.program_code and h.title = c.title
  where c.institution_name = 'Sheridan College'
)
update public.program_pgwp_ca_staging p
set international_program_admission_status = r.admission_status,
    ircc_program_eligible = coalesce(r.pgwp_verified, p.ircc_program_eligible),
    pgwp_program_status = case
      when r.pgwp_verified is true then 'official_provider_program_page_pgwp_aligned_current'
      else p.pgwp_program_status
    end,
    source_url = r.official_url,
    source_as_of = date '2026-08-08',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'Sheridan official program page checked 2026-08-08. Current intake is held because applications are closed or the international status is not explicitly listed.')
from resolved r
where p.program_catalog_id = r.program_catalog_id;

update public.program_catalog_ca_staging c
set source_status = case
      when c.program_code in ('PCPET','PBAPM','PECEI') then 'official_program_page_verified_current_closed_2026_27'
      else 'official_program_page_verified_current_intake_needs_international_status_check_2026_27'
    end,
    source_as_of = date '2026-08-08'
where c.institution_name = 'Sheridan College'
  and c.program_code in ('PCPET','PBAPM','PECEI','PBACS');

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'current_closed_standard_entry_sep_2026_degree_completion_only',
    source_url = 'https://www.sheridancollege.ca/programs/bachelor-of-business-administration-accounting',
    source_as_of = date '2026-08-08',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'Sheridan official Bachelor of Accounting page checked 2026-08-08: September 2026 is available only through Degree Completion, so standard-entry publication remains held.')
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'Sheridan College'
  and c.title = 'Bachelor of Accounting'
  and c.official_program_url = 'https://www.sheridancollege.ca/programs/bachelor-of-business-administration-accounting';

update public.program_catalog_ca_staging
set source_status = 'official_program_page_verified_standard_entry_current_closed_2026',
    source_as_of = date '2026-08-08'
where institution_name = 'Sheridan College'
  and title = 'Bachelor of Accounting'
  and official_program_url = 'https://www.sheridancollege.ca/programs/bachelor-of-business-administration-accounting';

with decisions(canonical_career_id, title, relation_type, reviewer_note) as (
  values
    ('accountant', 'Bachelor of Accounting', 'direct', 'Direct accounting degree pathway; current standard-entry intake is separately held.'),
    ('animal-science-technician', 'Veterinary Technician', 'direct', 'Direct veterinary technician pathway.'),
    ('animator', 'Computer Animation', 'direct', 'Direct computer animation pathway.'),
    ('animator', 'Digital Creature Animation - Technical Direction', 'direct', 'Direct advanced animation pathway.'),
    ('business-analyst', 'Business Analysis and Process Management', 'direct', 'Direct business-analysis pathway; current applications are separately held.'),
    ('cybersecurity-analyst', 'Computer Systems Technician - Cyber Security', 'direct', 'Direct cybersecurity technician pathway.'),
    ('early-childhood-teacher', 'Early Childhood Education - Intensive', 'direct', 'Direct ECE pathway; current international intake is separately closed.'),
    ('engineering-technician', 'Computer Engineering Technology', 'direct', 'Direct engineering-technologist/technician pathway; current applications are separately held.'),
    ('engineering-technician', 'Construction Engineering Technician - Sustainability', 'direct', 'Direct engineering-technician pathway.'),
    ('ict-support-technician', 'Computer Systems Technician - Cyber Security', 'related', 'Computer systems technician training is relevant to ICT support, but the program specialization is cybersecurity.'),
    ('marketing-specialist', 'Business Administration - Marketing', 'direct', 'Direct marketing pathway.'),
    ('marketing-specialist', 'Marketing Management - Digital Strategies', 'direct', 'Direct digital-marketing pathway.'),
    ('multimedia-designer', 'Interactive Media Management - Digital Design', 'direct', 'Direct interactive digital-design pathway.'),
    ('pharmacist', 'Pharmacy Technician', 'related', 'Pharmacy Technician is a distinct regulated occupation from Pharmacist.'),
    ('software-developer', 'Computer Science - Mobile Computing', 'direct', 'Direct software-development degree pathway; international intake status remains separately unverified.'),
    ('sustainability-specialist', 'Construction Engineering Technician - Sustainability', 'related', 'Sustainability is a major program focus but the credential is primarily construction engineering technology.'),
    ('youth-worker', 'Child and Youth Care', 'direct', 'Direct child and youth care pathway.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,d.relation_type,d.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join decisions d on d.canonical_career_id=l.canonical_career_id and d.title=c.title
  where c.institution_name='Sheridan College'
    and l.review_status='candidate'
    and c.official_program_url is not null
)
update public.program_occupation_ca_staging l
set review_status='approved',
    relation_type=r.relation_type,
    source_checked_at=date '2026-08-08',
    reviewer_note=r.reviewer_note,
    reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id
  and l.canonical_career_id=r.canonical_career_id;;
