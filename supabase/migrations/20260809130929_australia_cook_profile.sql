-- Australia Cook profile.
-- Current OSCA 322331 Cook is exact; Chef, Fast Food Cook and Kitchenhand remain separate.
-- Broader ANZSCO 3514 vacancy/projection data are contextual.

insert into public.country_occupation_profiles (
 profile_key,country_code,canonical_career_id,official_title,official_code_system,official_code_version,
 official_unit_group_code,currency,registration_required,registration_authority,registration_url,
 publication_status,source_checked_at,updated_at
) values (
 'AU:cook','AU','cook','Cook','OSCA','2024 v1.0','3223','AUD',false,
 'No universal statutory registration; Trades Recognition Australia assesses legacy ANZSCO 351411 Cook for migration',
 'https://www.tradesrecognitionaustralia.gov.au/',
 'profile_ready','2026-08-09',now()
)
on conflict (profile_key) do update set official_title=excluded.official_title,official_code_system=excluded.official_code_system,
 official_code_version=excluded.official_code_version,official_unit_group_code=excluded.official_unit_group_code,currency=excluded.currency,
 registration_required=excluded.registration_required,registration_authority=excluded.registration_authority,
 registration_url=excluded.registration_url,publication_status=excluded.publication_status,
 source_checked_at=excluded.source_checked_at,updated_at=now();

insert into public.country_occupation_metric_snapshots (
 profile_key,as_of_date,employment_total,median_weekly_earnings,median_hourly_earnings,annualised_median_salary,
 all_occupations_median_weekly,part_time_share_pct,female_share_pct,median_age,average_full_time_hours,
 vacancies_three_month_avg,vacancy_period,vacancy_yoy_pct,employment_growth_5y_pct,employment_growth_10y_pct,
 shortage_component,vacancy_intensity_component,employer_diversity_component,vacancy_trend_component,
 entry_level_component,salary_component,growth_component,visa_component,entry_burden_component,
 opportunity_score,score_methodology_version,score_status,score_evidence,source_checked_at
) values (
 'AU:cook','2026-05-01',null,null,null,null,1852,null,null,null,null,
 1055.33333,'2026-05-01',-3.42,5.97,12.54,20,0,5,0,15,0,5,10,5,60,
 'career-opportunity-v1','provisional',
 jsonb_build_object(
  'classification_scope','Current OSCA 322331 Cook is exact. Chef 321131, Fast Food Cook 851131 and Kitchenhand 851231 are explicitly separate occupations.',
  'labour_scope','Primary employment, demographics and earnings remain null because the reviewed ingest does not contain a clean exact six-digit profile for current OSCA 322331.',
  'vacancy_scope','Broader ANZSCO 3514 vacancies were 1055.33333 in May 2026 versus 1092.66667 in May 2025, about -3.42% year on year. Vacancy intensity and trend receive zero credit.',
  'projection_scope','Broader ANZSCO 3514 projections are +5.97% to 2030 and +12.54% to 2035; partial growth credit only.',
  'shortage_note','JSA 2025 OSL records current OSCA 322331 Cook as a national Shortage occupation.',
  'visa_basis','The current skilled occupation instrument includes legacy ANZSCO 351411 Cook with Trades Recognition Australia as assessing authority.',
  'entry_level_basis','TAFE NSW Certificate III in Commercial Cookery 109770H is a direct route; Certificate IV in Kitchen Management 109633F is a related higher-level commercial-kitchen route.',
  'entry_burden_basis','No universal occupational licence applies, but practical kitchen competence and migration trade assessment can require substantial evidence.',
  'score_note','National shortage, direct training and current migration evidence receive credit while broader vacancy data and unavailable exact earnings remain unscored.'
 ),'2026-08-09'
)
on conflict (profile_key,as_of_date) do update set employment_total=excluded.employment_total,
 median_weekly_earnings=excluded.median_weekly_earnings,median_hourly_earnings=excluded.median_hourly_earnings,
 annualised_median_salary=excluded.annualised_median_salary,all_occupations_median_weekly=excluded.all_occupations_median_weekly,
 part_time_share_pct=excluded.part_time_share_pct,female_share_pct=excluded.female_share_pct,median_age=excluded.median_age,
 average_full_time_hours=excluded.average_full_time_hours,vacancies_three_month_avg=excluded.vacancies_three_month_avg,
 vacancy_period=excluded.vacancy_period,vacancy_yoy_pct=excluded.vacancy_yoy_pct,
 employment_growth_5y_pct=excluded.employment_growth_5y_pct,employment_growth_10y_pct=excluded.employment_growth_10y_pct,
 shortage_component=excluded.shortage_component,vacancy_intensity_component=excluded.vacancy_intensity_component,
 employer_diversity_component=excluded.employer_diversity_component,vacancy_trend_component=excluded.vacancy_trend_component,
 entry_level_component=excluded.entry_level_component,salary_component=excluded.salary_component,growth_component=excluded.growth_component,
 visa_component=excluded.visa_component,entry_burden_component=excluded.entry_burden_component,opportunity_score=excluded.opportunity_score,
 score_methodology_version=excluded.score_methodology_version,score_status=excluded.score_status,score_evidence=excluded.score_evidence,
 source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_specialisations (
 profile_key,official_code,official_title,legacy_code_system,legacy_code_version,legacy_code,shortage_rating,visa_eligible,
 included_in_rollup,sort_order,source_url,source_checked_at
) values (
 'AU:cook','322331','Cook','ANZSCO','2022','351411',null,true,true,1,
 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/32/322/3223/322331','2026-08-09'
)
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,
 legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,legacy_code=excluded.legacy_code,
 shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,included_in_rollup=excluded.included_in_rollup,
 sort_order=excluded.sort_order,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
 ('AU:cook','ACT','2026-05-01',null,19.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:cook','NSW','2026-05-01',null,312,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:cook','NT','2026-05-01',null,19.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:cook','QLD','2026-05-01',null,262.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:cook','SA','2026-05-01',null,83.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:cook','TAS','2026-05-01',null,10,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:cook','VIC','2026-05-01',null,231.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:cook','WA','2026-05-01',null,116.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,
 vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
 ('AU:cook','job_search','SEEK — Cook jobs','https://www.seek.com.au/cook-jobs','private_job_board',null,1,'2026-08-09'),
 ('AU:cook','job_search','Workforce Australia — Cook search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=cook','government_job_board',null,2,'2026-08-09'),
 ('AU:cook','employer','Accor Careers','https://careers.accor.com/','hotel_hospitality',null,1,'2026-08-09'),
 ('AU:cook','employer','Marriott Careers','https://careers.marriott.com/','hotel_hospitality',null,2,'2026-08-09'),
 ('AU:cook','employer','Hilton Careers','https://jobs.hilton.com/','hotel_hospitality',null,3,'2026-08-09'),
 ('AU:cook','employer','Crown Careers','https://www.crownresorts.com.au/careers','integrated_resort',null,4,'2026-08-09'),
 ('AU:cook','employer','Compass Group Australia Careers','https://www.compass-group.com.au/careers/','contract_catering',null,5,'2026-08-09'),
 ('AU:cook','entry_program','TAFE NSW — Certificate III in Commercial Cookery','https://www.tafensw.edu.au/international/courses/certificate-iii-in-commercial-cookery--SIT30821','tafe',null,1,'2026-08-09'),
 ('AU:cook','entry_program','TAFE NSW — Certificate IV in Kitchen Management','https://www.tafensw.edu.au/international/courses/Certificate-IV-in-Kitchen-Management--SIT40521','tafe',null,2,'2026-08-09'),
 ('AU:cook','source','ABS — OSCA 322331 Cook','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/32/322/3223/322331','official_classification',null,1,'2026-08-09'),
 ('AU:cook','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,2,'2026-08-09'),
 ('AU:cook','source','JSA — Employment Projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,3,'2026-08-09'),
 ('AU:cook','source','JSA — 2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage-analysis/occupation-shortage-list','official_shortage',null,4,'2026-08-09'),
 ('AU:cook','source','Federal Register — current skilled occupation instrument','https://www.legislation.gov.au/F2024L01618/latest/text','official_migration',null,5,'2026-08-09'),
 ('AU:cook','source','Trades Recognition Australia — RTO Finder','https://www.tradesrecognitionaustralia.gov.au/rto-finder','official_skills_assessment',null,6,'2026-08-09')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,
 region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:cook','au-program:'||id::text,
 case when course_code='109770H' then 'direct' else 'related' end,'2026-08-09'
from public.courses_au
where institution_id='tafe-nsw' and course_code in ('109770H','109633F')
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
