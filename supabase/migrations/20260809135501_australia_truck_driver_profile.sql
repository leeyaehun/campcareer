-- Australia Truck Driver profile.
-- Canonical Truck Driver is a current OSCA umbrella across 713131, 713231 and 713232.
-- Legacy ANZSCO 733111 labour data are used; broader 7331 vacancy/projection data remain contextual.

insert into public.country_occupation_profiles (
 profile_key,country_code,canonical_career_id,official_title,official_code_system,official_code_version,
 official_unit_group_code,currency,registration_required,registration_authority,registration_url,
 publication_status,source_checked_at,updated_at
) values (
 'AU:truck-driver','AU','truck-driver','Truck Driver','OSCA','2024 v1.0','7131/7132','AUD',true,
 'State or territory road authority — appropriate heavy-vehicle driver licence required',
 'https://www.service.nsw.gov.au/services/heavy-vehicle-licence',
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
 'AU:truck-driver','2026-05-01',148400,null,null,null,1852,16,4,48,50,
 2724.33333,'2026-05-01',-0.07,0.61,4.04,15,0,5,0,15,0,0,0,5,40,
 'career-opportunity-v1','provisional',
 jsonb_build_object(
  'classification_scope','Canonical Truck Driver is an umbrella across current OSCA 713131 Truck Driver (General), 713231 Articulated Truck Driver and 713232 Tanker Truck Driver; no single six-digit current code is invented.',
  'labour_scope','Legacy ANZSCO 733111 provides 148,400 workers, 16% part-time share, 4% female share, median age 48 and 50 average full-time hours. Reviewed exact earnings remain unavailable.',
  'vacancy_scope','Broader ANZSCO 7331 vacancies were 2,724.33 in May 2026 versus 2,726.33 in May 2025, about -0.07% year on year; intensity and trend receive no credit because the series is broader than the current split occupations.',
  'projection_scope','Broader ANZSCO 7331 projections are +0.61% to 2030 and +4.04% to 2035; the low broader growth signal receives no growth credit.',
  'shortage_note','JSA 2025 OSL rates OSCA 713131 and 713231 as Shortage nationally, while 713232 is No Shortage; the mixed umbrella receives partial shortage credit.',
  'visa_basis','The reviewed current Core Skills Occupation List does not include the legacy Truck Driver (General) 733111 pathway.',
  'entry_level_basis','Entry is licence-led through state or territory heavy-vehicle licence classes and competency assessment rather than a required university degree.',
  'entry_burden_basis','Heavy-vehicle licence class progression, knowledge/eyesight tests and practical competency assessment create a meaningful but accessible entry burden.',
  'score_note','Salary remains null and broader vacancy data remain contextual.'
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
) values
 ('AU:truck-driver','713131','Truck Driver (General)','ANZSCO','2022','733111',null,false,true,1,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/7/71/713/7131/713131','2026-08-09'),
 ('AU:truck-driver','713231','Articulated Truck Driver','ANZSCO','2022','733111',null,false,true,2,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0','2026-08-09'),
 ('AU:truck-driver','713232','Tanker Truck Driver','ANZSCO','2022','733114',null,false,true,3,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0','2026-08-09')
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,
 legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,legacy_code=excluded.legacy_code,
 shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,included_in_rollup=excluded.included_in_rollup,
 sort_order=excluded.sort_order,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
 ('AU:truck-driver','ACT','2026-05-01',null,31.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:truck-driver','NSW','2026-05-01',null,687.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:truck-driver','NT','2026-05-01',null,39.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:truck-driver','QLD','2026-05-01',null,785.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:truck-driver','SA','2026-05-01',null,209,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:truck-driver','TAS','2026-05-01',null,51.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:truck-driver','VIC','2026-05-01',null,400.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:truck-driver','WA','2026-05-01',null,519.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
 ('AU:truck-driver','job_search','SEEK — Truck Driver jobs','https://www.seek.com.au/truck-driver-jobs','private_job_board',null,1,'2026-08-09'),
 ('AU:truck-driver','job_search','Workforce Australia — Truck Driver search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=truck%20driver','government_job_board',null,2,'2026-08-09'),
 ('AU:truck-driver','employer','Linfox Careers','https://www.linfox.com/careers/','transport_logistics',null,1,'2026-08-09'),
 ('AU:truck-driver','employer','Toll Group Careers','https://www.tollgroup.com/careers','transport_logistics',null,2,'2026-08-09'),
 ('AU:truck-driver','employer','Team Global Express Careers','https://teamglobalexp.com/careers','transport_logistics',null,3,'2026-08-09'),
 ('AU:truck-driver','employer','Qube Careers','https://qube.com.au/careers/','transport_logistics',null,4,'2026-08-09'),
 ('AU:truck-driver','employer','Australia Post Careers','https://auspost.com.au/jobs','postal_logistics',null,5,'2026-08-09'),
 ('AU:truck-driver','entry_program','Service NSW — Heavy vehicle licence','https://www.service.nsw.gov.au/services/heavy-vehicle-licence','government_licensing',null,1,'2026-08-09'),
 ('AU:truck-driver','source','JSA — 2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage-analysis/occupation-shortage-list','official_shortage',null,1,'2026-08-09'),
 ('AU:truck-driver','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,2,'2026-08-09')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;;
