-- Canada Programs Phase 2/3: add missing current McGill professional programs, canonicalize preparatory/aggregate rows,
-- verify Fall 2027 application timing, and review the remaining occupation queue.
-- Evidence checked 2026-08-08 against current McGill Undergraduate Admissions, Graduate Admissions,
-- Architecture, and School of Physical & Occupational Therapy pages.

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_10_01',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' McGill Undergraduate Admissions reviewed 2026-08-08: Fall undergraduate applications open October 1; Fall 2027 international/overseas applicants have program-specific deadlines including January 15, 2027 for the faculties represented in this candidate cohort.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='McGill University'
  and p.international_program_admission_status='institution_dli_confirmed_program_level_admission_not_yet_verified'
  and c.credential_type not in ('MArch / PhD','MEng / PhD','MEng / MSc / PhD','MScA / PhD','MSW / PhD','MSc / PhD','Master of Science');

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='fall_2027_international_application_not_yet_open_opens_2026_09_15_program_specific_deadline_applies',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' McGill Graduate and Postdoctoral Studies reviewed 2026-08-08: the Fall 2027 online application opens September 15, 2026 for all graduate programs; international deadlines are program-specific and may be earlier than the university default.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='McGill University'
  and p.international_program_admission_status='institution_dli_confirmed_program_level_admission_not_yet_verified'
  and c.credential_type in ('MArch / PhD','MEng / PhD','MEng / MSc / PhD','MScA / PhD','MSW / PhD','MSc / PhD','Master of Science');

update public.program_catalog_ca_staging
set official_program_url='https://www.mcgill.ca/architecture/programs/bachelor-science-architecture',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_preprofessional_nonprofessional_degree'
where institution_name='McGill University'
  and title='Architecture' and credential_type='BSc Architecture';

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Occupational Therapy' then 'https://www.mcgill.ca/undergraduate-admissions/program/occupational-therapy'
      else 'https://www.mcgill.ca/undergraduate-admissions/program/physical-therapy' end,
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_preprofessional_bsc_to_msca_path'
where institution_name='McGill University'
  and title in ('Occupational Therapy','Physical Therapy')
  and credential_type='BSc Rehabilitation Science';

insert into public.program_catalog_ca_staging (
  source_name, source_program_key, institution_name, institution_id, title, credential_type,
  education_level, field_name, language, province, city, duration_years, tuition_fee_cad,
  program_code, official_program_url, source_url, source_as_of, source_status, collected_at
)
select
  'McGill Course Catalogue', md5('McGill Course Catalogue|Architecture - Professional|Master of Architecture'),
  'McGill University','mcgill-university','Architecture - Professional','Master of Architecture',
  'Master','Architecture','English/French','QC','Montreal',2.0,null,null,
  'https://www.mcgill.ca/gradapplicants/program/architecture-professional-march-non-thesis',
  'https://www.mcgill.ca/gradapplicants/program/architecture-professional-march-non-thesis',
  '2026-08-08','official_program_page_verified_cacb_accredited_professional_degree',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='McGill University' and title='Architecture - Professional' and credential_type='Master of Architecture'
);

insert into public.program_catalog_ca_staging (
  source_name, source_program_key, institution_name, institution_id, title, credential_type,
  education_level, field_name, language, province, city, duration_years, tuition_fee_cad,
  program_code, official_program_url, source_url, source_as_of, source_status, collected_at
)
select
  'McGill Course Catalogue', md5('McGill Course Catalogue|Occupational Therapy|Master of Science Applied'),
  'McGill University','mcgill-university','Occupational Therapy','Master of Science (Applied)',
  'Master','Occupational Therapy','English/French','QC','Montreal',1.5,null,null,
  'https://www.mcgill.ca/gradapplicants/program/occupational-therapy-mscaot-non-thesis',
  'https://www.mcgill.ca/gradapplicants/program/occupational-therapy-mscaot-non-thesis',
  '2026-08-08','official_program_page_verified_professional_licensure_degree',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='McGill University' and title='Occupational Therapy' and credential_type='Master of Science (Applied)'
);

insert into public.program_catalog_ca_staging (
  source_name, source_program_key, institution_name, institution_id, title, credential_type,
  education_level, field_name, language, province, city, duration_years, tuition_fee_cad,
  program_code, official_program_url, source_url, source_as_of, source_status, collected_at
)
select
  'McGill Course Catalogue', md5('McGill Course Catalogue|Physical Therapy|Master of Science Applied'),
  'McGill University','mcgill-university','Physical Therapy','Master of Science (Applied)',
  'Master','Physical Therapy','English/French','QC','Montreal',1.5,null,null,
  'https://www.mcgill.ca/gradapplicants/program/physical-therapy-mscapt-non-thesis',
  'https://www.mcgill.ca/gradapplicants/program/physical-therapy-mscapt-non-thesis',
  '2026-08-08','official_program_page_verified_professional_licensure_degree',now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='McGill University' and title='Physical Therapy' and credential_type='Master of Science (Applied)'
);

insert into public.program_pgwp_ca_staging (
  program_catalog_id,institution_id,source_program_key,credential_type,education_level,matched_dli_number,matched_campus,
  institution_offers_pgwp_eligible_programs,international_students_eligible,pgwp_rule_category,field_of_study_required,
  cip_code,field_of_study_eligible,ircc_program_eligible,pgwp_program_status,ircc_detail_url,source_url,source_as_of,
  verified_at,collected_at,international_program_admission_status,rule_notes
)
select c.id,c.institution_id,c.source_program_key,c.credential_type,c.education_level,'O19359011033',null,
       true,true,'degree_no_field_of_study_requirement',false,null,null,true,
       'degree_field_exempt_structurally_eligible_general_applicant_checks_apply',null,
       'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility.html',
       '2026-08-08',now(),now(),
       case
         when c.title='Architecture - Professional' then 'fall_2027_international_application_not_yet_open_opens_2026_09_15_program_specific_deadline_applies'
         else 'current_restricted_not_open_to_external_applicants_professional_msca_internal_mcgill_path_only'
       end,
       case
         when c.title='Architecture - Professional' then 'McGill Professional M.Arch is a degree program and structurally PGWP-eligible under the degree rule. Fall 2027 graduate applications open September 15, 2026; applicant-specific IRCC conditions still apply.'
         else 'McGill professional MSc(A) completes the OT/PT licensure pathway. Direct MSc(A) entry is restricted to current McGill BSc Rehabilitation Science or Qualifying Year students; external applicants must first enter the corresponding undergraduate or Qualifying Year pathway. Degree-level PGWP structure is retained separately from this admission-path restriction.'
       end
from public.program_catalog_ca_staging c
where c.institution_name='McGill University'
  and ((c.title='Architecture - Professional' and c.credential_type='Master of Architecture')
    or (c.title in ('Occupational Therapy','Physical Therapy') and c.credential_type='Master of Science (Applied)'))
on conflict (program_catalog_id) do update set
  international_students_eligible=excluded.international_students_eligible,
  pgwp_rule_category=excluded.pgwp_rule_category,
  field_of_study_required=excluded.field_of_study_required,
  ircc_program_eligible=excluded.ircc_program_eligible,
  pgwp_program_status=excluded.pgwp_program_status,
  source_url=excluded.source_url,
  source_as_of=excluded.source_as_of,
  verified_at=excluded.verified_at,
  international_program_admission_status=excluded.international_program_admission_status,
  rule_notes=excluded.rule_notes;

insert into public.program_occupation_ca_staging (
  program_catalog_id,canonical_career_id,rule_version,match_basis,match_pattern,
  review_status,relation_type,source_checked_at,reviewer_note,matched_at,reviewed_at
)
select c.id,v.career_id,'ca-phase3-mcgill-2026-08-08','manual','mcgill_current_professional_program',
       'approved','direct','2026-08-08',v.note,now(),now()
from public.program_catalog_ca_staging c
join (values
  ('Architecture - Professional','Master of Architecture','architect','McGill Professional M.Arch is CACB-accredited and is the professional architecture degree in the licensure pathway.'),
  ('Occupational Therapy','Master of Science (Applied)','occupational-therapist','McGill MSc(A) Occupational Therapy includes 1,000 clinical-practicum hours and leads to eligibility for professional licensure.'),
  ('Physical Therapy','Master of Science (Applied)','physiotherapist','McGill MSc(A) Physical Therapy includes professional clinical training and leads to eligibility for professional licensure.')
) as v(title,credential,career_id,note)
  on c.title=v.title and c.credential_type=v.credential
where c.institution_name='McGill University'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='direct',source_checked_at='2026-08-08',reviewer_note=excluded.reviewer_note,reviewed_at=now();

update public.program_catalog_ca_staging
set source_status='legacy_parent_multiple_credentials_shadow_current_professional_march',
    source_as_of='2026-08-08'
where institution_name='McGill University'
  and title='Architecture' and credential_type='MArch / PhD';

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='architect' and c.credential_type='MArch / PhD' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='architect' and c.credential_type='MArch / PhD' then null
      when o.canonical_career_id='animal-science-technician' then 'related'
      when o.canonical_career_id='architect' and c.credential_type='BSc Architecture' then 'common_pathway'
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','mechanical-engineer') and c.credential_type like '%/%' then 'related'
      when o.canonical_career_id='environmental-scientist' then 'common_pathway'
      when o.canonical_career_id='financial-analyst' then 'common_pathway'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') and c.credential_type='BSc Rehabilitation Science' then 'common_pathway'
      when o.canonical_career_id='registered-nurse' and c.credential_type='MScA / PhD' then 'related'
      when o.canonical_career_id='social-worker' and c.credential_type='MSW / PhD' then 'related'
      when o.canonical_career_id='software-developer' then 'common_pathway'
      when o.canonical_career_id='supply-chain-analyst' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='architect' and c.credential_type='BSc Architecture' then 'McGill explicitly identifies the BSc Architecture as a non-professional pre-professional degree; the separated CACB-accredited Professional M.Arch row is the direct architect pathway.'
      when o.canonical_career_id='architect' and c.credential_type='MArch / PhD' then 'Rejected legacy aggregate after adding the current Professional M.Arch as a separate direct architect row; avoids mixing the accredited professional degree with research PhD study.'
      when o.canonical_career_id in ('occupational-therapist','physiotherapist') and c.credential_type='BSc Rehabilitation Science' then 'McGill explicitly states the BSc Rehabilitation Science provides access to the MSc(A); professional licensure eligibility follows completion of the MSc(A), so the BSc is a common pathway rather than the final professional credential.'
      when o.canonical_career_id='registered-nurse' and c.credential_type='MScA / PhD' then 'Graduate Nursing is advanced/post-licensure study, not the first RN credential; relation limited to related.'
      when o.canonical_career_id='social-worker' and c.credential_type='MSW / PhD' then 'Aggregate graduate Social Work row mixes professional MSW and research PhD credentials; relation retained conservatively as related while the BSW remains a direct social-worker pathway.'
      else 'Reviewed 2026-08-08 against McGill current credential scope and regulated-role level; occupation relevance is separated from application-cycle timing.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='McGill University'
  and o.review_status='candidate';;
