-- Australia Social Worker profile.
-- Exact current occupation: OSCA 261331 Social Worker.
-- Current/legacy migration occupation: ANZSCO 272511 Social Worker, assessed by AASW.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA occupation profile/2025 OSL + reviewed CSOL snapshot',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/261/2613/261331',
    last_verified = '2026-08-09',
    anzsco_v13 = '272511'
where anzsco_code = '261331'
  and occupation_en = 'Social Worker';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed current OSCA 261331 correspondence to ANZSCO 272511 Social Worker. The reviewed CSOL snapshot is eligible; AASW is the migration skills assessing authority.'
where osca_code = '261331'
  and anzsco_v13_code = '272511'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

update public.courses_au
set official_course_url = 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/honours-degrees/bachelor-of-social-work-honours-bh105',
    official_url_status = 'verified', official_url_checked_at = now(),
    official_url_source = 'Provider current course page, verified 2026-08-09'
where institution_id = 'rmit-university' and course_code = '079596C';

update public.courses_au
set official_course_url = 'https://study.unimelb.edu.au/find/courses/graduate/master-of-social-work/',
    official_url_status = 'verified', official_url_checked_at = now(),
    official_url_source = 'Provider current course page, verified 2026-08-09'
where institution_id = 'the-university-of-melbourne' and course_code = '061212E';

insert into public.country_occupation_profiles (
  profile_key,country_code,canonical_career_id,official_title,official_code_system,
  official_code_version,official_unit_group_code,currency,registration_required,
  registration_authority,registration_url,publication_status,source_checked_at,updated_at
) values (
  'AU:social-worker','AU','social-worker','Social Worker','OSCA','2024 v1.0','2613','AUD',false,
  'Australian Association of Social Workers (AASW) — program accreditation and migration skills assessment; no universal national statutory registration',
  'https://www.aasw.asn.au/education-employment/migration-eligibility-assessment/',
  'profile_ready','2026-08-09',now()
)
on conflict (profile_key) do update set official_title=excluded.official_title,
  official_code_system=excluded.official_code_system,official_code_version=excluded.official_code_version,
  official_unit_group_code=excluded.official_unit_group_code,currency=excluded.currency,
  registration_required=excluded.registration_required,registration_authority=excluded.registration_authority,
  registration_url=excluded.registration_url,publication_status=excluded.publication_status,
  source_checked_at=excluded.source_checked_at,updated_at=now();

insert into public.country_occupation_metric_snapshots (
  profile_key,as_of_date,employment_total,median_weekly_earnings,median_hourly_earnings,
  annualised_median_salary,all_occupations_median_weekly,part_time_share_pct,female_share_pct,
  median_age,average_full_time_hours,vacancies_three_month_avg,vacancy_period,vacancy_yoy_pct,
  employment_growth_5y_pct,employment_growth_10y_pct,shortage_component,vacancy_intensity_component,
  employer_diversity_component,vacancy_trend_component,entry_level_component,salary_component,
  growth_component,visa_component,entry_burden_component,opportunity_score,score_methodology_version,
  score_status,score_evidence,source_checked_at
) values (
  'AU:social-worker','2026-05-01',47400,2172,57,112944,1852,32,84,38,40,
  1177.66667,'2026-05-01',-8.21,14.60,25.31,0,15,5,0,13,8,10,10,2,63,
  'career-opportunity-v1','provisional',
  jsonb_build_object(
    'current_classification_scope','Current OSCA 261331 Social Worker is a standalone Skill Level 1 occupation.',
    'legacy_mapping','ANZSCO 272511 Social Worker is the aligned migration occupation. JSA legacy unit group 2725 Social Workers is tightly aligned and is used for labour-market metrics with its ANZSCO vintage disclosed.',
    'employment_basis','JSA reports 47,400 workers in legacy ANZSCO 2725 Social Workers, with 32% part-time, 84% female, median age 38 and 40 average full-time hours.',
    'earnings_basis','JSA reports median full-time earnings of A$2,172 per week and A$57 per hour for legacy ANZSCO 2725 Social Workers, about 17.28% above the A$1,852 all-occupations weekly median used by the methodology.',
    'vacancy_basis','May 2026 IVI three-month-average vacancies were 1,177.66667 versus 1,283 in May 2025, about -8.21% year on year. Vacancy intensity is about 2.49% of aligned employment.',
    'projection_basis','JSA projects legacy ANZSCO 2725 from 49,846 workers in May 2025 to 57,122 in May 2030 (+14.60%) and 62,460 in May 2035 (+25.31%).',
    'shortage_note','The reviewed JSA 2025 OSL records OSCA 261331 as No Shortage nationally. ACT, NT and SA are Shortage; Victoria is Regional shortage; NSW, QLD, TAS and WA are No Shortage.',
    'visa_basis','The reviewed CSOL correspondence includes OSCA 261331 via ANZSCO 272511. AASW is the migration skills assessing authority; list inclusion does not determine individual visa eligibility.',
    'registration_basis','There is no universal national statutory Social Worker registration scheme. AASW accreditation/eligibility and setting-specific screening may be required by employers.',
    'entry_level_basis','RMIT Bachelor of Social Work (Honours) 079596C provides a direct four-year professional route; University of Melbourne Master of Social Work 061212E provides a qualifying graduate-entry route.',
    'score_note','National shortage is zero, while aligned vacancy intensity, earnings, long-run growth and current migration evidence receive credit. The score remains provisional because the labour series uses legacy ANZSCO publication structures.'
  ),'2026-08-09'
)
on conflict (profile_key,as_of_date) do update set employment_total=excluded.employment_total,
  median_weekly_earnings=excluded.median_weekly_earnings,median_hourly_earnings=excluded.median_hourly_earnings,
  annualised_median_salary=excluded.annualised_median_salary,all_occupations_median_weekly=excluded.all_occupations_median_weekly,
  part_time_share_pct=excluded.part_time_share_pct,female_share_pct=excluded.female_share_pct,
  median_age=excluded.median_age,average_full_time_hours=excluded.average_full_time_hours,
  vacancies_three_month_avg=excluded.vacancies_three_month_avg,vacancy_period=excluded.vacancy_period,
  vacancy_yoy_pct=excluded.vacancy_yoy_pct,employment_growth_5y_pct=excluded.employment_growth_5y_pct,
  employment_growth_10y_pct=excluded.employment_growth_10y_pct,shortage_component=excluded.shortage_component,
  vacancy_intensity_component=excluded.vacancy_intensity_component,employer_diversity_component=excluded.employer_diversity_component,
  vacancy_trend_component=excluded.vacancy_trend_component,entry_level_component=excluded.entry_level_component,
  salary_component=excluded.salary_component,growth_component=excluded.growth_component,visa_component=excluded.visa_component,
  entry_burden_component=excluded.entry_burden_component,opportunity_score=excluded.opportunity_score,
  score_methodology_version=excluded.score_methodology_version,score_status=excluded.score_status,
  score_evidence=excluded.score_evidence,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_specialisations (
  profile_key,official_code,official_title,legacy_code_system,legacy_code_version,legacy_code,
  shortage_rating,visa_eligible,included_in_rollup,sort_order,source_url,source_checked_at
) values (
  'AU:social-worker','261331','Social Worker','ANZSCO','2022','272511',null,true,true,1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/261/2613/261331','2026-08-09'
)
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,
  legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,
  legacy_code=excluded.legacy_code,shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,
  included_in_rollup=excluded.included_in_rollup,sort_order=excluded.sort_order,source_url=excluded.source_url,
  source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
  ('AU:social-worker','ACT','2026-05-01',3,36.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:social-worker','NSW','2026-05-01',null,273,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:social-worker','NT','2026-05-01',3,35,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:social-worker','QLD','2026-05-01',null,267,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:social-worker','SA','2026-05-01',3,100.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:social-worker','TAS','2026-05-01',null,33.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:social-worker','VIC','2026-05-01',2,305,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:social-worker','WA','2026-05-01',null,127.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
  ('AU:social-worker','job_search','SEEK — Social Worker jobs','https://www.seek.com.au/social-worker-jobs','private_job_board',null,1,'2026-08-09'),
  ('AU:social-worker','job_search','Workforce Australia — Social Worker search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=social%20worker','government_job_board',null,2,'2026-08-09'),
  ('AU:social-worker','employer','NSW Health — Careers','https://www.health.nsw.gov.au/careers/Pages/default.aspx','public_health',null,1,'2026-08-09'),
  ('AU:social-worker','employer','Victorian Department of Families, Fairness and Housing — Careers','https://www.dffh.vic.gov.au/careers','state_government',null,2,'2026-08-09'),
  ('AU:social-worker','employer','Queensland Health — Careers','https://www.health.qld.gov.au/employment','public_health',null,3,'2026-08-09'),
  ('AU:social-worker','employer','Anglicare Australia','https://www.anglicare.asn.au/','community_services',null,4,'2026-08-09'),
  ('AU:social-worker','employer','UnitingCare Australia','https://unitingcare.org.au/','community_services',null,5,'2026-08-09'),
  ('AU:social-worker','entry_program','AASW — migration eligibility assessment','https://www.aasw.asn.au/education-employment/migration-eligibility-assessment/','official_skills_assessment',null,1,'2026-08-09'),
  ('AU:social-worker','entry_program','RMIT — Bachelor of Social Work (Honours)','https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/honours-degrees/bachelor-of-social-work-honours-bh105','university',null,2,'2026-08-09'),
  ('AU:social-worker','entry_program','University of Melbourne — Master of Social Work','https://study.unimelb.edu.au/find/courses/graduate/master-of-social-work/','university',null,3,'2026-08-09'),
  ('AU:social-worker','source','ABS — OSCA 261331 Social Worker','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/261/2613/261331','official_classification',null,1,'2026-08-09'),
  ('AU:social-worker','source','JSA — Social Workers occupation profile','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2725-social-workers','official_labour_market',null,2,'2026-08-09'),
  ('AU:social-worker','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,3,'2026-08-09'),
  ('AU:social-worker','source','JSA — Employment Projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,4,'2026-08-09'),
  ('AU:social-worker','source','JSA — 2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage-analysis/occupation-shortage-list','official_shortage',null,5,'2026-08-09'),
  ('AU:social-worker','source','Federal Register — current skilled occupation instrument','https://www.legislation.gov.au/F2024L01618/2026-03-28/2026-03-28/text/original/epub/OEBPS/document_1/document_1.html','official_migration',null,6,'2026-08-09'),
  ('AU:social-worker','source','AASW — migration eligibility assessment','https://www.aasw.asn.au/education-employment/migration-eligibility-assessment/','official_skills_assessment',null,7,'2026-08-09'),
  ('AU:social-worker','source','AASW — accredited social work courses','https://www.aasw.asn.au/education-employment/higher-education-providers/accredited-courses/','official_accreditation',null,8,'2026-08-09')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:social-worker','au-program:'||id::text,'direct','2026-08-09'
from public.courses_au where institution_id='rmit-university' and course_code='079596C'
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:social-worker','au-program:'||id::text,'graduate_entry','2026-08-09'
from public.courses_au where institution_id='the-university-of-melbourne' and course_code='061212E'
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
