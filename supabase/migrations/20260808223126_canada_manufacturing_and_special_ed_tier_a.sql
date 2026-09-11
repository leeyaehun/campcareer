-- Canada Programs Phase 3: add current Tier A pathways for manufacturing-engineer and special-education-teacher.
-- Evidence checked 2026-08-08 against current Concordia Industrial Engineering and University of Regina Secondary Teacher Education pages.

update public.program_catalog_ca_staging
set official_program_url='https://www.concordia.ca/academics/undergraduate/industrial-engineering.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_winter_2027_international_open'
where institution_name='Concordia University'
  and title='Industrial Engineering'
  and credential_type='BEng';

update public.program_pgwp_ca_staging p
set source_url='https://www.concordia.ca/academics/undergraduate/industrial-engineering.html',
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Concordia Industrial Engineering BEng page reviewed 2026-08-08: Engineers Canada accredited; curriculum explicitly covers manufacturing and industrial systems, manufacturing processes, plant layout, productivity and quality. Winter 2027 international application availability was already verified Open.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Concordia University'
  and c.title='Industrial Engineering'
  and c.credential_type='BEng';

insert into public.program_occupation_ca_staging (
  program_catalog_id,canonical_career_id,rule_version,match_basis,match_pattern,
  review_status,relation_type,source_checked_at,reviewer_note,matched_at,reviewed_at
)
select c.id,'manufacturing-engineer','ca-phase3-tier-a-2026-08-08','manual','concordia_industrial_engineering_manufacturing_path',
       'approved','common_pathway','2026-08-08',
       'Concordia Industrial Engineering BEng is an accredited professional engineering degree whose curriculum explicitly includes manufacturing and industrial systems, manufacturing processes, productivity, quality and plant layout. It is a strong common pathway to manufacturing-engineer roles; Winter 2027 international applications are currently Open.',now(),now()
from public.program_catalog_ca_staging c
where c.institution_name='Concordia University'
  and c.title='Industrial Engineering'
  and c.credential_type='BEng'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='common_pathway',source_checked_at='2026-08-08',reviewer_note=excluded.reviewer_note,reviewed_at=now();

insert into public.program_occupation_ca_staging (
  program_catalog_id,canonical_career_id,rule_version,match_basis,match_pattern,
  review_status,relation_type,source_checked_at,reviewer_note,matched_at,reviewed_at
)
select c.id,'special-education-teacher','ca-phase3-tier-a-2026-08-08','manual','regina_secondary_bed_inclusive_education_minor',
       'approved','common_pathway','2026-08-08',
       'University of Regina Secondary Teacher Education BEd After Degree is a Saskatchewan teacher-certification program and explicitly offers Inclusive Education as a teachable minor. This makes it a current common pathway to special/inclusive-education teaching while preserving the distinction from a dedicated special-education qualification. Fall 2026 international Education applications remain within the published August 15 deadline, subject to capacity.',now(),now()
from public.program_catalog_ca_staging c
where c.institution_name='University of Regina'
  and c.title='Secondary Teacher Education'
  and c.credential_type='After Degree'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved',relation_type='common_pathway',source_checked_at='2026-08-08',reviewer_note=excluded.reviewer_note,reviewed_at=now();;
