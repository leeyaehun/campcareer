-- Canada Programs Phase 3: Sault College occupation review and targeted admission verification.
-- Evidence checked 2026-08-08 against current Sault College program pages.

update public.program_catalog_ca_staging
set official_program_url=case title
      when 'Personal Support Worker' then 'https://www.saultcollege.ca/programs/health-programs/personal-support-worker'
      when 'Computer Networking and Cyber Security' then 'https://www.saultcollege.ca/programs/information-technology-studies/computer-networking-and-cyber-security'
      when 'Bachelor of Science - Nursing (Bridge)' then 'https://www.saultcollege.ca/programs/health-programs/bachelor-science-nursing-bridge'
      when 'Bachelor of Science - Nursing (Honours)' then 'https://www.saultcollege.ca/programs/health-programs/bachelor-science-nursing-honours'
      when 'Practical Nursing' then 'https://www.saultcollege.ca/programs/health-programs/practical-nursing'
      else official_program_url end,
    source_as_of='2026-08-08',
    source_status=case
      when title='Bachelor of Science - Nursing (Bridge)' then 'official_program_page_verified_international_ineligible'
      else 'official_program_page_verified_current_2026_27' end
where institution_name='Sault College'
  and title in ('Personal Support Worker','Computer Networking and Cyber Security','Bachelor of Science - Nursing (Bridge)','Bachelor of Science - Nursing (Honours)','Practical Nursing');

update public.program_pgwp_ca_staging p
set international_students_eligible=false,
    international_program_admission_status='current_bscn_bridge_not_open_to_international_students',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Sault College RPN-to-BScN Bridge page reviewed 2026-08-08: the program leads to RN entry-to-practice competencies and NCLEX eligibility, but is explicitly not open to international students.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Sault College'
  and c.title='Bachelor of Science - Nursing (Bridge)';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='official_program_page_international_apply_path_current_intake_availability_not_verified',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Sault College current program page reviewed 2026-08-08: an International Apply route and international tuition are published. Program-level seat availability is intentionally not inferred from the apply link alone.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Sault College'
  and c.title in ('Personal Support Worker','Computer Networking and Cyber Security','Bachelor of Science - Nursing (Honours)','Practical Nursing');

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing' then null
      when o.canonical_career_id='civil-engineer' then 'related'
      when o.canonical_career_id='early-childhood-teacher' and c.title='Early Childhood Education Resource Consulting' then 'related'
      when o.canonical_career_id='electrical-engineer' then 'related'
      when o.canonical_career_id='engineering-technician' and c.title='Engineering Technology Management' then 'related'
      when o.canonical_career_id='mechanical-engineer' then 'related'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') then 'related'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.title='Practical Nursing' then 'Rejected: Sault Practical Nursing prepares Registered Practical Nurses (RPNs), a distinct regulated occupation from Registered Nurse.'
      when o.canonical_career_id='registered-nurse' and c.title='Bachelor of Science - Nursing (Bridge)' then 'Direct RN completion pathway: the RPN-to-BScN Bridge leads to RN entry-to-practice competencies and NCLEX eligibility, but the provider explicitly states international applicants are not admitted.'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') then 'OTA/PTA diploma prepares assistant roles and is related to, but does not qualify graduates as, occupational therapists or physiotherapists.'
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') then 'Technician/technology credential is relevant technical education but does not itself confer the regulated professional engineer qualification; relation limited to related.'
      else 'Reviewed 2026-08-08 against Sault College current credential scope and regulated-role level; occupation relevance is kept separate from international admission availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Sault College'
  and o.review_status='candidate';;
