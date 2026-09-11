-- Australia Chef profile.
-- Current OSCA 321131 Chef is exact; Senior Chef 161631 remains separate.
-- Legacy ANZSCO 3513 vacancy/projection data are broader context and are not used for vacancy intensity or trend scoring.

update public.courses_au set
 official_course_url='https://www.tafensw.edu.au/international/courses/certificate-iii-in-commercial-cookery--SIT30821',
 official_url_status='verified',official_url_checked_at=now(),official_url_source='TAFE NSW International Certificate III in Commercial Cookery page, CRICOS 109770H, verified 2026-08-09'
where institution_id='tafe-nsw' and course_code='109770H';

update public.courses_au set
 official_course_url='https://www.tafensw.edu.au/international/courses/Certificate-IV-in-Kitchen-Management--SIT40521',
 official_url_status='verified',official_url_checked_at=now(),official_url_source='TAFE NSW International Certificate IV in Kitchen Management page, CRICOS 109633F, verified 2026-08-09'
where institution_id='tafe-nsw' and course_code='109633F';

insert into public.country_occupation_profiles (
 profile_key,country_code,canonical_career_id,official_title,official_code_system,official_code_version,
 official_unit_group_code,currency,registration_required,registration_authority,registration_url,
 publication_status,source_checked_at,updated_at
) values (
 'AU:chef','AU','chef','Chef','OSCA','2024 v1.0','3211','AUD',false,
 'No universal statutory registration; Trades Recognition Australia assesses legacy ANZSCO 351311 Chef for migration',
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
 'AU:chef','2026-05-01',null,null,null,null,1852,null,null,null,null,
 2708.33333,'2026-05-01',-6.34,5.76,12.47,15,0,5,0,15,0,5,10,5,55,
 'career-opportunity-v1','provisional',
 jsonb_build_object(
  'classification_scope','Current OSCA 321131 Chef is an exact canonical occupation. Senior Chef 161631, including Executive Chef, Head Chef and Sous Chef specialisations, is explicitly separate.',
  'labour_scope','Primary employment, demographics and earnings remain null because the reviewed ingest does not contain a clean six-digit labour profile restricted to current OSCA 321131.',
  'vacancy_scope','Broader ANZSCO 3513 vacancies were 2708.33333 in May 2026 versus 2891.66667 in May 2025, about -6.34% year on year. Vacancy intensity and trend receive zero credit because the series is broader than the exact current OSCA scope.',
  'projection_scope','Broader ANZSCO 3513 projections are +5.76% to 2030 and +12.47% to 2035; partial growth credit only.',
  'shortage_note','JSA 2025 OSL records current OSCA 321131 Chef as a Regional shortage nationally rather than a full national Shortage, so shortage credit is partial.',
  'visa_basis','The current skilled occupation instrument includes legacy ANZSCO 351311 Chef with Trades Recognition Australia as assessing authority. Visa-list inclusion does not determine individual eligibility.',
  'entry_level_basis','TAFE NSW Certificate III in Commercial Cookery 109770H and Certificate IV in Kitchen Management 109633F provide direct international VET routes into commercial cooking and chef capability.',
  'entry_burden_basis','No universal occupational licence applies, but commercial-kitchen competence and migration trade assessment can require substantial practical evidence and pathway-specific assessment.',
  'score_note','Regional shortage receives partial credit; current migration and direct VET routes receive credit while broader vacancy and unavailable exact earnings remain unscored.'
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
 'AU:chef','321131','Chef','ANZSCO','2022','351311',null,true,true,1,
 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/32/321/3211/321131','2026-08-09'
)
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,
 legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,legacy_code=excluded.legacy_code,
 shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,included_in_rollup=excluded.included_in_rollup,
 sort_order=excluded.sort_order,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
 ('AU:chef','ACT','2026-05-01',null,51.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:chef','NSW','2026-05-01',null,843,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:chef','NT','2026-05-01',null,34.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:chef','QLD','2026-05-01',null,621,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:chef','SA','2026-05-01',null,209.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:chef','TAS','2026-05-01',null,41,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:chef','VIC','2026-05-01',null,606,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:chef','WA','2026-05-01',null,301.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,
 vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
 ('AU:chef','job_search','SEEK — Chef jobs','https://www.seek.com.au/chef-jobs','private_job_board',null,1,'2026-08-09'),
 ('AU:chef','job_search','Workforce Australia — Chef search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=chef','government_job_board',null,2,'2026-08-09'),
 ('AU:chef','employer','Accor Careers','https://careers.accor.com/','hotel_hospitality',null,1,'2026-08-09'),
 ('AU:chef','employer','Marriott Careers','https://careers.marriott.com/','hotel_hospitality',null,2,'2026-08-09'),
 ('AU:chef','employer','Hilton Careers','https://jobs.hilton.com/','hotel_hospitality',null,3,'2026-08-09'),
 ('AU:chef','employer','Crown Careers','https://www.crownresorts.com.au/careers','integrated_resort',null,4,'2026-08-09'),
 ('AU:chef','employer','Compass Group Australia Careers','https://www.compass-group.com.au/careers/','contract_catering',null,5,'2026-08-09'),
 ('AU:chef','entry_program','TAFE NSW — Certificate III in Commercial Cookery','https://www.tafensw.edu.au/international/courses/certificate-iii-in-commercial-cookery--SIT30821','tafe',null,1,'2026-08-09'),
 ('AU:chef','entry_program','TAFE NSW — Certificate IV in Kitchen Management','https://www.tafensw.edu.au/international/courses/Certificate-IV-in-Kitchen-Management--SIT40521','tafe',null,2,'2026-08-09'),
 ('AU:chef','source','ABS — OSCA 321131 Chef','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/32/321/3211/321131','official_classification',null,1,'2026-08-09'),
 ('AU:chef','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,2,'2026-08-09'),
 ('AU:chef','source','JSA — Employment Projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,3,'2026-08-09'),
 ('AU:chef','source','JSA — 2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage-analysis/occupation-shortage-list','official_shortage',null,4,'2026-08-09'),
 ('AU:chef','source','Federal Register — current skilled occupation instrument','https://www.legislation.gov.au/F2024L01618/latest/text','official_migration',null,5,'2026-08-09'),
 ('AU:chef','source','Trades Recognition Australia — RTO Finder','https://www.tradesrecognitionaustralia.gov.au/rto-finder','official_skills_assessment',null,6,'2026-08-09')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,
 region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:chef','au-program:'||id::text,'direct','2026-08-09'
from public.courses_au
where institution_id='tafe-nsw' and course_code in ('109770H','109633F')
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
