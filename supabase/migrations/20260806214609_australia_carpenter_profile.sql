-- Australia Carpenter profile for the shared country occupation foundation.
-- OSCA 3721 is the current official classification. Current labour-market
-- snapshots remain aligned to the legacy ANZSCO 3312 series published by JSA.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:carpenter', 'AU', 'carpenter', 'Carpenter',
  'OSCA', '2024 v1.0', '3721', 'AUD', false,
  'State and territory building and work health and safety regulators',
  'https://www.safeworkaustralia.gov.au/safety-topic/industry-and-business/construction/working-construction-site',
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
  'AU:carpenter', '2026-05-01', 149600, 1760, 45, 91520,
  1852, 11, 3, 30, 43, 1002, '2026-05-01', 1.0,
  6.4, 10.9, 20, 11, 5, 5, 13, 5, 7, 10, 3, 79,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'vacancy_intensity_pct', 0.67,
    'salary_premium_pct', -4.97,
    'employer_diversity_basis', 'Curated coverage of national builders, contractors and apprenticeship networks; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'A paid apprenticeship and CPC30220 provide a structured entry route, but no standardised national apprentice-posting share is published.',
    'entry_burden_basis', 'A multi-year apprenticeship, Certificate III trade training and construction induction are normally required; contractor or builder licensing varies by jurisdiction.',
    'scope_note', 'Rollup includes Carpenter and Joiner, Carpenter, and Joiner under OSCA 3721 and legacy ANZSCO 3312.',
    'data_note', 'Vacancy and projection values are stored against the current dated JSA series while the occupation profile remains on the legacy ANZSCO basis.',
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
  ('AU:carpenter', '372131', 'Carpenter and Joiner', 'ANZSCO', '2013 v1.3', '331211', 5, true, true, 1, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/37/372/3721/372131', '2026-08-06'),
  ('AU:carpenter', '372132', 'Carpenter', 'ANZSCO', '2013 v1.3', '331212', 5, true, true, 2, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/37/372/3721/372132', '2026-08-06'),
  ('AU:carpenter', '372133', 'Joiner', 'ANZSCO', '2013 v1.3', '331213', 5, true, true, 3, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/37/372/3721/372133', '2026-08-06')
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
  ('AU:carpenter', 'QLD', '2026-05-01', 3, 295, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:carpenter', 'NSW', '2026-05-01', 3, 257, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:carpenter', 'VIC', '2026-05-01', 3, 166, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:carpenter', 'WA', '2026-05-01', 3, 138, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:carpenter', 'SA', '2026-05-01', 3, 79, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:carpenter', 'ACT', '2026-05-01', 3, 25, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:carpenter', 'TAS', '2026-05-01', 3, 23, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:carpenter', 'NT', '2026-05-01', 3, 19, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:carpenter', 'job_search', 'SEEK — Carpenter jobs', 'https://www.seek.com.au/carpenter-jobs', 'private_job_board', null, 1, '2026-08-06'),
  ('AU:carpenter', 'job_search', 'Workforce Australia — Carpenter search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=carpenter', 'government_job_board', null, 2, '2026-08-06'),
  ('AU:carpenter', 'employer', 'HIA Apprentices', 'https://hia.com.au/careers-and-learning/become-an-hia-apprentice/why-become-an-hia-apprentice', 'apprenticeship_network', null, 1, '2026-08-06'),
  ('AU:carpenter', 'employer', 'Hutchinson Builders careers', 'https://www.hutchinsonbuilders.com.au/careers/', 'commercial_builder', null, 2, '2026-08-06'),
  ('AU:carpenter', 'employer', 'CPB Contractors careers', 'https://www.cpbcon.com.au/join-us', 'infrastructure_contractor', null, 3, '2026-08-06'),
  ('AU:carpenter', 'employer', 'John Holland careers', 'https://johnholland.com.au/join-us', 'infrastructure_contractor', null, 4, '2026-08-06'),
  ('AU:carpenter', 'employer', 'Multiplex job opportunities', 'https://www.multiplex.global/careers/job-opportunities/', 'commercial_builder', null, 5, '2026-08-06'),
  ('AU:carpenter', 'entry_program', 'Australian Apprenticeships — Become an apprentice', 'https://www.apprenticeships.gov.au/apprentices', 'government_apprenticeship', null, 1, '2026-08-06'),
  ('AU:carpenter', 'entry_program', 'Key Apprenticeship Program', 'https://www.apprenticeships.gov.au/key-apprenticeship-program', 'government_apprenticeship', null, 2, '2026-08-06'),
  ('AU:carpenter', 'entry_program', 'HIA Apprentices — How to apply', 'https://hia.com.au/careers-and-learning/become-an-hia-apprentice/how-do-i-apply', 'apprenticeship_network', null, 3, '2026-08-06'),
  ('AU:carpenter', 'source', 'ABS OSCA 3721 Carpenters and Joiners', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/37/372/3721', 'official_classification', null, 1, '2026-08-06'),
  ('AU:carpenter', 'source', 'Jobs and Skills Australia — Carpenters and Joiners profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3312-carpenters-and-joiners', 'official_labour_market', null, 2, '2026-08-06'),
  ('AU:carpenter', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-06'),
  ('AU:carpenter', 'source', 'Jobs and Skills Australia — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-06'),
  ('AU:carpenter', 'source', 'Jobs and Skills Australia — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-06'),
  ('AU:carpenter', 'source', 'National Training Register — CPC30220', 'https://training.gov.au/Training/Details/CPC30220', 'official_training', null, 6, '2026-08-06'),
  ('AU:carpenter', 'source', 'Safe Work Australia — Working on a construction site', 'https://www.safeworkaustralia.gov.au/safety-topic/industry-and-business/construction/working-construction-site', 'official_safety', null, 7, '2026-08-06'),
  ('AU:carpenter', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_visa', null, 8, '2026-08-06')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:carpenter', 'au-vet:tafe-nsw:CPC30220', 'direct', '2026-08-06')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
