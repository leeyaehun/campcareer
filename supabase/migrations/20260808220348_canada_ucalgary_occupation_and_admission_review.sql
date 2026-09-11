-- Canada Programs Phase 3: University of Calgary occupation review, undergraduate application timing,
-- and BN -> BScN current-program canonicalization.
-- Evidence checked 2026-08-08 against current UCalgary Admissions, Nursing and Werklund pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_10_01',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UCalgary undergraduate admissions reviewed 2026-08-08: applications for Fall 2027 undergraduate programs open October 1, 2026. Current publication remains held until that cycle opens and program-specific availability can be confirmed.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Calgary'
  and c.credential_type in ('Bachelor of Science (BSc)','Bachelor of Education (BEd)','Bachelor of Social Work (BSW)')
  and exists (
    select 1 from public.program_occupation_ca_staging o
    where o.program_catalog_id=c.id and o.review_status='candidate'
  );

update public.program_catalog_ca_staging
set official_program_url='https://nursing.ucalgary.ca/future-students/undergraduate/routes/BScN',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_current_bscn_replaces_bn_fall_2026'
where institution_name='University of Calgary'
  and title='Nursing' and credential_type='Bachelor of Science (BSc)';

update public.program_catalog_ca_staging
set source_status='legacy_replaced_by_current_bscn_for_new_entrants',
    source_as_of='2026-08-08'
where institution_name='University of Calgary'
  and title='Nursing' and credential_type='Bachelor of Nursing (BN)';

update public.program_pgwp_ca_staging p
set international_program_admission_status='legacy_bn_replaced_by_current_bscn_for_new_entrants',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' UCalgary Nursing reviewed 2026-08-08: the Bachelor of Science in Nursing replaces the existing Bachelor of Nursing for new entrants beginning with the current curriculum. This BN row is retained only as a legacy/continuing-program record.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='University of Calgary'
  and c.title='Nursing' and c.credential_type='Bachelor of Nursing (BN)';

update public.program_catalog_ca_staging
set official_program_url='https://werklund.ucalgary.ca/undergraduate-programs/future-students/pathways-and-admissions/two-year-campus-bachelor-education-after-degree',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_teacher_certification_path'
where institution_name='University of Calgary'
  and title in ('Elementary Education - After Degree','Secondary Education - After Degree');

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='registered-nurse' and c.credential_type='Bachelor of Nursing (BN)' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='registered-nurse' and c.credential_type='Bachelor of Nursing (BN)' then null
      when o.canonical_career_id in ('data-analyst','data-engineer') and c.title='Data Science' then 'common_pathway'
      when o.canonical_career_id='data-engineer' and c.title='Data Science and Analytics' then 'common_pathway'
      when o.canonical_career_id='environmental-scientist' then 'common_pathway'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='sustainability-specialist' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.credential_type='Bachelor of Nursing (BN)' then 'Rejected legacy BN row for new-program publication because UCalgary explicitly states the current BScN replaces the existing BN; the current BScN row remains the direct RN pathway.'
      when o.canonical_career_id='registered-nurse' then 'Direct RN professional pathway: UCalgary BScN is the current nursing degree replacing the BN for new entrants and prepares graduates to enter registered nursing practice.'
      when o.canonical_career_id in ('primary-school-teacher','secondary-school-teacher') then 'Direct teacher-certification pathway: Werklund BEd programs lead to eligibility for certification through Alberta Education.'
      when o.canonical_career_id in ('data-analyst','data-engineer') and c.title='Data Science' then 'Academic Data Science BSc is a common pathway to analytics and data-engineering roles rather than a single occupational credential.'
      when o.canonical_career_id='data-engineer' and c.title='Data Science and Analytics' then 'Graduate Data Science and Analytics is highly relevant but broader than an explicit data-engineering credential; relation limited to common pathway.'
      when o.canonical_career_id='software-developer' then 'Computer Science and Software Engineering degrees are common academic pathways to software-development roles; relation is not overstated as an occupational licence.'
      else 'Reviewed 2026-08-08 against UCalgary current program title, credential and professional-role level; occupation relevance is separated from current international admission timing.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='University of Calgary'
  and o.review_status='candidate';;
