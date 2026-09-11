-- Canada Programs Phase 3: Vancouver Island University occupation review and targeted international-admission verification.
-- Evidence checked 2026-08-08 against current VIU program and admissions pages.

update public.program_catalog_ca_staging
set official_program_url=case title
      when 'Accounting (BBA)' then 'https://www.viu.ca/programs/business-management/accounting-bba'
      when 'Human Resources Management (BBA)' then 'https://www.viu.ca/programs/business-management/human-resources-management-bba'
      when 'Marketing (BBA)' then 'https://www.viu.ca/programs/business-management/marketing-bba'
      else official_program_url end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_jan_2027_international_open'
where institution_name='Vancouver Island University'
  and title in ('Accounting (BBA)','Human Resources Management (BBA)','Marketing (BBA)');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='jan_2027_international_application_open_closes_2026_09_30',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' VIU BBA program page reviewed 2026-08-08: the January 5, 2027 international intake is accepting applications through September 30, 2026.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title in ('Accounting (BBA)','Human Resources Management (BBA)','Marketing (BBA)');

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Bachelor of Hospitality Management' then 'https://www.viu.ca/programs/tourism-recreation-hospitality/bachelor-hospitality-management'
      else 'https://www.viu.ca/programs/tourism-recreation-hospitality/hospitality-management-diploma' end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_jan_2027_international_open'
where institution_name='Vancouver Island University'
  and title in ('Bachelor of Hospitality Management','Hospitality Management Diploma');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='jan_2027_international_application_open_closes_2026_09_30',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' VIU Hospitality Management program page reviewed 2026-08-08: the January 5, 2027 international intake is accepting applications through September 30, 2026; diploma students apply through the Bachelor of Hospitality Management pathway.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title in ('Bachelor of Hospitality Management','Hospitality Management Diploma');

update public.program_catalog_ca_staging
set official_program_url='https://www.viu.ca/programs/art-design-performing-arts/bachelor-interior-design',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_international_late_applications_accepted'
where institution_name='Vancouver Island University'
  and title='Bachelor of Interior Design';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2026_international_late_applications_accepted',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' VIU Bachelor of Interior Design program page reviewed 2026-08-08: Fall 2026 international applicants are still shown as Accepting Late Applications, subject to portfolio review and available space.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title='Bachelor of Interior Design';

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Bachelor of Science in Nursing' then 'https://www.viu.ca/programs/health/bachelor-science-nursing'
      else 'https://www.viu.ca/programs/health/practical-nursing' end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_international_ineligible'
where institution_name='Vancouver Island University'
  and title in ('Bachelor of Science in Nursing','Practical Nursing');

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_program_not_available_to_international_students',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' VIU Nursing program page reviewed 2026-08-08: this nursing program is explicitly not currently available to international students.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title in ('Bachelor of Science in Nursing','Practical Nursing');

update public.program_catalog_ca_staging
set official_program_url='https://pdt.viu.ca/nursing-unit-assistant',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_nonclinical_next_cycle_not_yet_open'
where institution_name='Vancouver Island University'
  and title='Nursing Unit Assistant';

update public.program_pgwp_ca_staging p
set international_program_admission_status='fall_2027_application_not_yet_open_opens_2026_10_01',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' VIU Nursing Unit Assistant page reviewed 2026-08-08: Fall 2026 applications are closed and Fall 2027 applications open October 1, 2026; the program prepares non-clinical unit assistants, not registered nurses.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title='Nursing Unit Assistant';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_trades_admission_canadian_citizen_or_pr_only',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' VIU general admission requirements reviewed 2026-08-08: Trades and Applied Technology admission eligibility is stated for Canadian citizens and permanent residents; no international pathway is published for these trade foundation/certificate rows.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and c.title in ('Automotive Service Technician','Carpentry','Electrician','Welding');

update public.program_catalog_ca_staging
set official_program_url='https://hshs.viu.ca/pharmacy-technician',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_pharmacy_technician_occupation'
where institution_name='Vancouver Island University'
  and title='Pharmacy Technician';

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='registered-nurse' and c.title in ('Nursing Unit Assistant','Practical Nursing') then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='registered-nurse' and c.title in ('Nursing Unit Assistant','Practical Nursing') then null
      when o.canonical_career_id='chef' then 'common_pathway'
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy Technician' then 'related'
      when o.canonical_career_id='software-developer' and c.credential_type='Bachelor Degree' then 'common_pathway'
      when o.canonical_career_id='special-education-teacher' then 'related'
      when o.canonical_career_id='hospitality-supervisor' and c.title='Bachelor of Hospitality Management' then 'common_pathway'
      when o.canonical_career_id='hotel-manager' and c.title='Bachelor of Hospitality Management' then 'common_pathway'
      when o.canonical_career_id='restaurant-manager' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.title='Nursing Unit Assistant' then 'Rejected: VIU Nursing Unit Assistant is explicitly a non-clinical hospital/unit coordination occupation, not registered-nurse education.'
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing' then 'Rejected: Practical Nursing prepares Licensed Practical Nurses, a distinct regulated nursing occupation, not Registered Nurses.'
      when o.canonical_career_id='pharmacist' and c.title='Pharmacy Technician' then 'Pharmacy Technician is an accredited regulated-technician pathway with separate PEBC/licensure requirements; it is related to pharmacy work but is not pharmacist qualification.'
      when o.canonical_career_id='special-education-teacher' then 'Master of Education in Special Education is advanced specialization and is not treated as a first teacher-certification credential.'
      else 'Reviewed 2026-08-08 against VIU current program title, credential and regulated-role level; occupation relevance is separated from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Vancouver Island University'
  and o.review_status='candidate';;
