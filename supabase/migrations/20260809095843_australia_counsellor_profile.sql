-- Australia Counsellor profile.
-- Exact current occupation: OSCA 261131 Counsellor (General), Skill Level 1.
-- Legacy ANZSCO 272199 Counsellors nec is useful context and has a VETASSESS assessment pathway,
-- but generic current Counsellor (General) is not present in the reviewed current CSOL snapshot.

update public.courses_au
set official_course_url = 'https://www.ecu.edu.au/degrees/courses/bachelor-of-counselling',
    official_url_status = 'verified', official_url_checked_at = now(),
    official_url_source = 'Provider current international course page, CRICOS 083640C, verified 2026-08-09'
where institution_id = 'edith-cowan-university' and course_code = '083640C';

update public.courses_au
set official_course_url = 'https://www.deakin.edu.au/course/master-counselling',
    official_url_status = 'verified', official_url_checked_at = now(),
    official_url_source = 'Provider 2026 course page/handbook, CRICOS 112781A, verified 2026-08-09'
where institution_id = 'deakin-university' and course_code = '112781A';

insert into public.country_occupation_profiles (
  profile_key,country_code,canonical_career_id,official_title,official_code_system,
  official_code_version,official_unit_group_code,currency,registration_required,
  registration_authority,registration_url,publication_status,source_checked_at,updated_at
) values (
  'AU:counsellor','AU','counsellor','Counsellor (General)','OSCA','2024 v1.0','2611','AUD',false,
  null,null,'profile_ready','2026-08-09',now()
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
  'AU:counsellor','2026-05-01',null,null,null,null,1852,null,null,null,null,
  434.66667,'2026-05-01',-14.15,12.98,23.36,0,0,5,0,13,0,5,0,4,27,
  'career-opportunity-v1','provisional',
  jsonb_build_object(
    'current_classification_scope','Current OSCA 261131 Counsellor (General) is a standalone Skill Level 1 occupation. Family and Relationship Counsellor 261133 and other named counselling occupations are separate.',
    'legacy_mapping','Legacy ANZSCO 272199 Counsellors nec overlaps substantially with current Counsellor (General), but also includes Life Coach and excludes several separately classified counsellor occupations. Its six-digit profile is retained as context rather than treated as exact current employment.',
    'legacy_272199_context',jsonb_build_object('employment_total',5800,'part_time_share_pct',55,'female_share_pct',79,'median_age',42,'average_full_time_hours',41,'median_weekly_earnings_aud',null,'median_hourly_earnings_aud',null,'data_as_at','2026-02-01'),
    'broader_2721_context',jsonb_build_object('median_weekly_earnings_aud',2154,'median_hourly_earnings_aud',54,'scope','ANZSCO 2721 Counsellors; broader than current OSCA 261131'),
    'vacancy_scope','May 2026 IVI three-month-average vacancies are 434.66667 at broader ANZSCO 2721, compared with 506.33333 in May 2025, about -14.15% year on year. They receive no vacancy intensity or trend credit because they are broader than generic current Counsellor.',
    'projection_scope','Broader ANZSCO 2721 projections are +12.98% from May 2025 to May 2030 and +23.36% to May 2035, receiving partial growth credit.',
    'shortage_note','The reviewed JSA 2025 Occupation Shortage List records OSCA 261131 Counsellor (General) as No Shortage nationally. Regional shortage is not inferred into the profile where no aligned staging row is available.',
    'visa_basis','VETASSESS assesses ANZSCO 272199 Counsellors nec as Group A, but the reviewed current CSOL/ABS correspondence snapshot does not include generic OSCA 261131 Counsellor (General). A skills-assessment pathway alone is not treated as current occupation-list eligibility, so the visa component is zero.',
    'registration_basis','There is no universal statutory licensing or registration requirement for Counsellors in Australia. Professional association membership or employer-specific requirements can apply.',
    'entry_level_basis','ECU Bachelor of Counselling 083640C is a three-year AQF Level 7 international route. Deakin Master of Counselling 112781A is a two-year AQF Level 9 route with supervised placement experience.',
    'score_note','National shortage, exact salary, exact vacancy intensity and visa components are zero. Clear study routes, employer diversity and strong broader long-run growth support a conservative provisional score.'
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
  'AU:counsellor','261131','Counsellor (General)','ANZSCO','2013 v1.3','272199',null,false,true,1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/261/2611/261131','2026-08-09'
)
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,
  legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,
  legacy_code=excluded.legacy_code,shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,
  included_in_rollup=excluded.included_in_rollup,sort_order=excluded.sort_order,source_url=excluded.source_url,
  source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
  ('AU:counsellor','ACT','2026-05-01',null,16.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:counsellor','NSW','2026-05-01',null,126,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:counsellor','NT','2026-05-01',null,14,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:counsellor','QLD','2026-05-01',null,110,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:counsellor','SA','2026-05-01',null,26.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:counsellor','TAS','2026-05-01',null,9.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:counsellor','VIC','2026-05-01',null,76.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:counsellor','WA','2026-05-01',null,55.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
  ('AU:counsellor','job_search','SEEK — Counsellor jobs','https://www.seek.com.au/counsellor-jobs','private_job_board',null,1,'2026-08-09'),
  ('AU:counsellor','job_search','Workforce Australia — Counsellor search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=counsellor','government_job_board',null,2,'2026-08-09'),
  ('AU:counsellor','employer','Relationships Australia','https://relationships.org.au/','community_services',null,1,'2026-08-09'),
  ('AU:counsellor','employer','Lifeline Australia','https://www.lifeline.org.au/','mental_health_services',null,2,'2026-08-09'),
  ('AU:counsellor','employer','UnitingCare Australia','https://unitingcare.org.au/','community_services',null,3,'2026-08-09'),
  ('AU:counsellor','employer','Anglicare Australia','https://www.anglicare.asn.au/','community_services',null,4,'2026-08-09'),
  ('AU:counsellor','employer','The Salvation Army Australia','https://www.salvationarmy.org.au/about-us/careers/','community_services',null,5,'2026-08-09'),
  ('AU:counsellor','entry_program','ECU — Bachelor of Counselling','https://www.ecu.edu.au/degrees/courses/bachelor-of-counselling','university',null,1,'2026-08-09'),
  ('AU:counsellor','entry_program','Deakin — Master of Counselling','https://www.deakin.edu.au/course/master-counselling','university',null,2,'2026-08-09'),
  ('AU:counsellor','entry_program','VETASSESS — Counsellors nec skills assessment','https://www.vetassess.com.au/check-my-occupation/professional-occupations/counsellors-nec','official_skills_assessment',null,3,'2026-08-09'),
  ('AU:counsellor','source','ABS — OSCA 261131 Counsellor (General)','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/261/2611/261131','official_classification',null,1,'2026-08-09'),
  ('AU:counsellor','source','JSA — Counsellors nec legacy profile','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/272199-counsellors-nec','official_labour_market',null,2,'2026-08-09'),
  ('AU:counsellor','source','JSA — Counsellors unit group','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2721-counsellors','official_labour_market',null,3,'2026-08-09'),
  ('AU:counsellor','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,4,'2026-08-09'),
  ('AU:counsellor','source','JSA — Employment Projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,5,'2026-08-09'),
  ('AU:counsellor','source','JSA — 2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage-analysis/occupation-shortage-list','official_shortage',null,6,'2026-08-09'),
  ('AU:counsellor','source','Home Affairs — Core Skills Occupation List','https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list','official_migration',null,7,'2026-08-09'),
  ('AU:counsellor','source','VETASSESS — Counsellors nec','https://www.vetassess.com.au/check-my-occupation/professional-occupations/counsellors-nec','official_skills_assessment',null,8,'2026-08-09')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:counsellor','au-program:'||id::text,'direct','2026-08-09'
from public.courses_au where institution_id='edith-cowan-university' and course_code='083640C'
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:counsellor','au-program:'||id::text,'graduate_entry','2026-08-09'
from public.courses_au where institution_id='deakin-university' and course_code='112781A'
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
