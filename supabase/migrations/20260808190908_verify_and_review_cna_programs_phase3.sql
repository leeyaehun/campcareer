update public.program_pgwp_ca_staging p
set international_program_admission_status='international_fall_2026_applications_closed_after_2026_04_30_valid_study_permit_exception',source_url='https://www.cna.nl.ca/Admissions/International-Students.aspx',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'Official CNA international admissions guidance checked 2026-08-08: Fall 2026 international applications closed April 30, 2026. Applicants after the deadline may only be considered when they already hold a current and valid permit to study at CNA. Keep current publication held until a later intake opens or newer official evidence is verified.')
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='College of the North Atlantic' and p.international_students_eligible is true;

update public.program_pgwp_ca_staging p
set international_students_eligible=false,international_program_admission_status='international_not_available_program_level_current_2026',source_url='https://www.cna.nl.ca/programs-courses/program-guide',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'Current CNA program guide explicitly states that applications are closed to international applicants for this program.')
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='College of the North Atlantic' and c.id in (3860,3926);

update public.program_occupation_ca_staging o
set review_status='rejected',relation_type=null,match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note=case when c.id=3892 then 'Rejected in Phase 3: Heating Systems Technician is a building/heating trade program and is not an ICT support technician pathway.' when c.id=3926 then 'Rejected in Phase 3: Practical Nursing is a distinct practical-nurse pathway and does not qualify a graduate for the registered-nurse target.' else 'Rejected in Phase 3 after manual occupation review.' end,reviewed_at=now()
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and o.review_status='candidate' and c.institution_name='College of the North Atlantic' and ((c.id=3892 and o.canonical_career_id='ict-support-technician') or (c.id=3926 and o.canonical_career_id='registered-nurse'));

update public.program_occupation_ca_staging o
set review_status='approved',relation_type=case
  when o.canonical_career_id in ('civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer','industrial-engineer') then 'related'
  when o.canonical_career_id='engineering-technician' then 'direct'
  when o.canonical_career_id='chef' then 'common_pathway'
  when o.canonical_career_id='data-analyst' and lower(c.title) like '%marketing management%' then 'related'
  when o.canonical_career_id='early-childhood-teacher' and lower(c.title) like '%administrative leadership%' then 'related'
  when o.canonical_career_id='early-childhood-teacher' and lower(c.title) like '%advanced studies%' then 'related'
  when o.canonical_career_id='financial-analyst' then 'common_pathway'
  when o.canonical_career_id in ('hospitality-supervisor','hotel-manager','restaurant-manager') then 'common_pathway'
  when o.canonical_career_id='medical-laboratory-technician' and lower(c.title) like '%assistant%' then 'related'
  when o.canonical_career_id='medical-laboratory-technician' and lower(c.title) like '%x-ray skills%' then 'related'
  when o.canonical_career_id='pharmacist' then 'related'
  when o.canonical_career_id='plumber' and lower(c.title) like '%steamfitter%' then 'related'
  when o.canonical_career_id='project-manager' then 'common_pathway'
  when o.canonical_career_id='registered-nurse' and lower(c.title) like '%critical care transport nursing%' then 'related'
  when o.canonical_career_id='welder' and lower(c.title) like '%engineering technician%' then 'related'
  else 'direct' end,
  match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note=case
    when o.canonical_career_id in ('civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer','industrial-engineer') then 'Reviewed as related engineering-technology education; the diploma/technology credential does not itself confer the target regulated professional engineer title.'
    when o.canonical_career_id='pharmacist' then 'Reviewed as related pharmacy-sector education; Pharmacy Technician does not qualify a graduate as a pharmacist.'
    when o.canonical_career_id='registered-nurse' then 'Reviewed as post-licensure specialty nursing education rather than an entry-to-practice registered-nurse qualifying degree.'
    when o.canonical_career_id='medical-laboratory-technician' and lower(c.title) like '%assistant%' then 'Reviewed as related laboratory-support education; Medical Laboratory Assistant is distinct from the broader laboratory technician/technology pathway.'
    when o.canonical_career_id='medical-laboratory-technician' and lower(c.title) like '%x-ray skills%' then 'Reviewed as related post-diploma upskilling rather than entry-to-practice medical laboratory technician education.'
    when o.canonical_career_id='data-analyst' and lower(c.title) like '%marketing management%' then 'Reviewed as related analytics study with a marketing-domain focus rather than general data-analyst preparation.'
    else 'Reviewed against the current CNA program title, credential scope and target occupation. Current international publication status remains separately controlled by the admission gate.' end,
  reviewed_at=now()
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id and o.review_status='candidate' and c.institution_name='College of the North Atlantic';;
