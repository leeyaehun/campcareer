alter table public.country_occupation_links
  drop constraint if exists country_occupation_links_link_type_check;

alter table public.country_occupation_links
  add constraint country_occupation_links_link_type_check
  check (link_type in ('job_search', 'employer', 'entry_program', 'graduate_program', 'source'));

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:electrician', 'AU', 'electrician', 'Electrician',
  'OSCA', '2024 v1.0', '3812', 'AUD', true,
  'State and territory electrical licensing regulators',
  'https://www.erac.gov.au/licensing/electrical-licensing/',
  'decision_ready', '2026-08-06', now()
)
on conflict (profile_key) do update set
  official_title = excluded.official_title,
  official_code_system = excluded.official_code_system,
  official_code_version = excluded.official_code_version,
  official_unit_group_code = excluded.official_unit_group_code,
  currency = excluded.currency,
  registration_required = excluded.registration_required,
  registration_authority = excluded.registration_authority,
  registration_url = excluded.registration_url,
  publication_status = excluded.publication_status,
  source_checked_at = excluded.source_checked_at,
  updated_at = now();

insert into public.country_occupation_metric_snapshots (
  profile_key, as_of_date, employment_total, median_weekly_earnings,
  median_hourly_earnings, annualised_median_salary,
  all_occupations_median_weekly, part_time_share_pct, female_share_pct,
  median_age, average_full_time_hours, vacancies_three_month_avg,
  vacancy_period, vacancy_yoy_pct, employment_growth_5y_pct,
  employment_growth_10y_pct, shortage_component,
  vacancy_intensity_component, employer_diversity_component,
  vacancy_trend_component, entry_level_component, salary_component,
  growth_component, visa_component, entry_burden_component,
  opportunity_score, score_methodology_version, score_status,
  score_evidence, source_checked_at
) values (
  'AU:electrician', '2026-05-01', 197300, 2191, 55, 113932,
  1852, 6, 2, 33, 45, 3143.66667, '2026-05-01', 13.89,
  6.68, 11.98, 20, 15, 5, 8, 13, 8, 7, 10, 2, 88,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'vacancy_intensity_pct', 1.59,
    'salary_premium_pct', 18.31,
    'employer_diversity_basis', 'Curated construction, utility, mining and industrial employer coverage; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'Paid apprenticeships and major utility apprentice intakes provide a structured route, but no standardised national apprentice-posting share is published.',
    'entry_burden_basis', 'A multi-year apprenticeship, Certificate III trade training and state or territory electrical licensing requirements apply.',
    'scope_note', 'Rollup includes Electrician (General), Electrical Fitter and Industrial Electrician. Lift Mechanic is excluded as a distinct occupation.',
    'score_note', 'Provisional until posting-level entry experience and employer counts are ingested.'
  ),
  '2026-08-06'
)
on conflict (profile_key, as_of_date) do update set
  employment_total = excluded.employment_total,
  median_weekly_earnings = excluded.median_weekly_earnings,
  median_hourly_earnings = excluded.median_hourly_earnings,
  annualised_median_salary = excluded.annualised_median_salary,
  all_occupations_median_weekly = excluded.all_occupations_median_weekly,
  part_time_share_pct = excluded.part_time_share_pct,
  female_share_pct = excluded.female_share_pct,
  median_age = excluded.median_age,
  average_full_time_hours = excluded.average_full_time_hours,
  vacancies_three_month_avg = excluded.vacancies_three_month_avg,
  vacancy_period = excluded.vacancy_period,
  vacancy_yoy_pct = excluded.vacancy_yoy_pct,
  employment_growth_5y_pct = excluded.employment_growth_5y_pct,
  employment_growth_10y_pct = excluded.employment_growth_10y_pct,
  shortage_component = excluded.shortage_component,
  vacancy_intensity_component = excluded.vacancy_intensity_component,
  employer_diversity_component = excluded.employer_diversity_component,
  vacancy_trend_component = excluded.vacancy_trend_component,
  entry_level_component = excluded.entry_level_component,
  salary_component = excluded.salary_component,
  growth_component = excluded.growth_component,
  visa_component = excluded.visa_component,
  entry_burden_component = excluded.entry_burden_component,
  opportunity_score = excluded.opportunity_score,
  score_methodology_version = excluded.score_methodology_version,
  score_status = excluded.score_status,
  score_evidence = excluded.score_evidence,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_specialisations (
  profile_key, official_code, official_title, legacy_code_system,
  legacy_code_version, legacy_code, shortage_rating, visa_eligible,
  included_in_rollup, sort_order, source_url, source_checked_at
) values
  ('AU:electrician', '381231', 'Electrician (General)', 'ANZSCO', '2013 v1.3', '341111', 5, true, true, 1, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/381/3812/381231', '2026-08-06'),
  ('AU:electrician', '381232', 'Electrical Fitter', 'ANZSCO', '2013 v1.3', '341111', 5, true, true, 2, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/381/3812', '2026-08-06'),
  ('AU:electrician', '381233', 'Industrial Electrician', 'ANZSCO', '2013 v1.3', '341111', 5, true, true, 3, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/381/3812', '2026-08-06')
on conflict (profile_key, official_code) do update set
  official_title = excluded.official_title,
  legacy_code_system = excluded.legacy_code_system,
  legacy_code_version = excluded.legacy_code_version,
  legacy_code = excluded.legacy_code,
  shortage_rating = excluded.shortage_rating,
  visa_eligible = excluded.visa_eligible,
  included_in_rollup = excluded.included_in_rollup,
  sort_order = excluded.sort_order,
  source_url = excluded.source_url,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_region_metrics (
  profile_key, region_code, as_of_date, shortage_rating, vacancy_count, source_url
) values
  ('AU:electrician', 'QLD', '2026-05-01', 3, 805, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:electrician', 'NSW', '2026-05-01', 3, 788.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:electrician', 'WA', '2026-05-01', 3, 765.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:electrician', 'VIC', '2026-05-01', 3, 441.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:electrician', 'SA', '2026-05-01', 3, 226, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:electrician', 'NT', '2026-05-01', 3, 58.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:electrician', 'TAS', '2026-05-01', 3, 29.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:electrician', 'ACT', '2026-05-01', 3, 29, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:electrician', 'job_search', 'SEEK — Electrician jobs', 'https://www.seek.com.au/electrician-jobs', 'private_job_board', null, 1, '2026-08-06'),
  ('AU:electrician', 'job_search', 'Workforce Australia — Electrician search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=electrician', 'government_job_board', null, 2, '2026-08-06'),
  ('AU:electrician', 'employer', 'Ausgrid careers', 'https://www.ausgrid.com.au/about-us/about-ausgrid/careers', 'electricity_network', 'NSW', 1, '2026-08-06'),
  ('AU:electrician', 'employer', 'Energy Queensland careers', 'https://www.energex.com.au/careers', 'electricity_network', 'QLD', 2, '2026-08-06'),
  ('AU:electrician', 'employer', 'Western Power careers', 'https://www.westernpower.com.au/about/careers/', 'electricity_network', 'WA', 3, '2026-08-06'),
  ('AU:electrician', 'employer', 'BHP careers', 'https://www.bhp.com/careers', 'mining', null, 4, '2026-08-06'),
  ('AU:electrician', 'employer', 'Rio Tinto careers', 'https://www.riotinto.com/careers', 'mining', null, 5, '2026-08-06'),
  ('AU:electrician', 'entry_program', 'Australian Apprenticeships — Find and prepare', 'https://www.apprenticeships.gov.au/apprentices/how-find-and-prepare-apprenticeship', 'government_apprenticeship', null, 1, '2026-08-06'),
  ('AU:electrician', 'entry_program', 'Ausgrid Bright Spark Apprentice Program', 'https://www.ausgrid.com.au/about-us/about-ausgrid/careers/apprenticeships', 'employer_apprenticeship', 'NSW', 2, '2026-08-06'),
  ('AU:electrician', 'entry_program', 'Energy Queensland apprenticeships', 'https://www.energex.com.au/careers/apprenticeships', 'employer_apprenticeship', 'QLD', 3, '2026-08-06'),
  ('AU:electrician', 'entry_program', 'Western Power apprenticeships', 'https://www.westernpower.com.au/about/careers/early-careers/apprenticeships/', 'employer_apprenticeship', 'WA', 4, '2026-08-06'),
  ('AU:electrician', 'source', 'ABS OSCA 3812 Electricians', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/381/3812', 'official_classification', null, 1, '2026-08-06'),
  ('AU:electrician', 'source', 'Jobs and Skills Australia — Electricians profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3411-electricians', 'official_labour_market', null, 2, '2026-08-06'),
  ('AU:electrician', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-06'),
  ('AU:electrician', 'source', 'Jobs and Skills Australia — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-06'),
  ('AU:electrician', 'source', 'National Training Register — UEE30820', 'https://training.gov.au/training/details/UEE30820', 'official_training', null, 5, '2026-08-06'),
  ('AU:electrician', 'source', 'ERAC — Electrical licensing', 'https://www.erac.gov.au/licensing/electrical-licensing/', 'official_regulator', null, 6, '2026-08-06'),
  ('AU:electrician', 'source', 'Home Affairs — Core Skills Occupation List', 'https://immi.homeaffairs.gov.au/Documents/core-sol.pdf', 'official_visa', null, 7, '2026-08-06')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:electrician', 'au-vet:tafe-nsw:UEE30820', 'direct', '2026-08-06')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
