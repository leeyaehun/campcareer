-- Australia Plumber profile for the shared country occupation foundation.
-- OSCA Minor Group 363 is the current official classification. Employment,
-- earnings and outlook snapshots remain aligned to the legacy ANZSCO 3341
-- series published by Jobs and Skills Australia.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:plumber', 'AU', 'plumber', 'Plumber',
  'OSCA', '2024 v1.0', '363', 'AUD', true,
  'State and territory plumbing regulators',
  'https://www.abcb.gov.au/support/state-and-territory-building-and-plumbing-administrations',
  'profile_ready', '2026-08-07', now()
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
  'AU:plumber', '2026-05-01', 107600, 1990, 47, 103480,
  1852, 7, 3, 34, 44, null, null, null,
  5.2, 10.6, 20, 0, 5, 0, 13, 6, 7, 10, 2, 63,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'salary_premium_pct', 7.45,
    'vacancy_data_status', 'The current national and all-state IVI workbook row has not yet been directly ingested. National vacancy, intensity and trend fields remain null and their score components remain zero.',
    'verified_regional_vacancy', jsonb_build_object('region', 'WA', 'period', '2026-05-01', 'value', 236),
    'employer_diversity_basis', 'Curated coverage of facilities services, water utilities and infrastructure employers; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'A paid apprenticeship and CPC32420 provide a structured entry route, but no standardised national apprentice-posting share is published.',
    'entry_burden_basis', 'A multi-year apprenticeship, Certificate III trade training, jurisdictional plumbing registration or licensing and construction induction normally apply.',
    'scope_note', 'Rollup includes Plumber (General), Gasfitter, Roof Plumber, Drainer, Fire Protection Plumber and Mechanical Services Plumber under OSCA Minor Group 363.',
    'score_note', 'Provisional and not directly comparable with profiles whose national IVI vacancy series is complete.'
  ),
  '2026-08-07'
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
  ('AU:plumber', '363131', 'Plumber (General)', 'ANZSCO', '2013 v1.3', '334111', 5, true, true, 1, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/363', '2026-08-07'),
  ('AU:plumber', '363231', 'Gasfitter', 'ANZSCO', '2013 v1.3', '334114', 5, true, true, 2, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/363', '2026-08-07'),
  ('AU:plumber', '363331', 'Roof Plumber', 'ANZSCO', '2013 v1.3', '334115', 5, true, true, 3, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/363', '2026-08-07'),
  ('AU:plumber', '363931', 'Drainer', 'ANZSCO', '2013 v1.3', '334113', 5, true, true, 4, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/363', '2026-08-07'),
  ('AU:plumber', '363932', 'Fire Protection Plumber', null, null, null, null, null, true, 5, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/363', '2026-08-07'),
  ('AU:plumber', '363933', 'Mechanical Services Plumber', 'ANZSCO', '2013 v1.3', '334112', 5, true, true, 6, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/363', '2026-08-07')
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
  ('AU:plumber', 'WA', '2026-05-01', 3, 236, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:plumber', 'job_search', 'SEEK — Plumber jobs', 'https://www.seek.com.au/plumber-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:plumber', 'job_search', 'Workforce Australia — Plumber search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=plumber', 'government_job_board', null, 2, '2026-08-07'),
  ('AU:plumber', 'employer', 'Ventia careers', 'https://www.ventia.com/work-with-us/careers', 'facilities_and_infrastructure', null, 1, '2026-08-07'),
  ('AU:plumber', 'employer', 'Downer careers', 'https://downergroup.com/life-at-downer/', 'facilities_and_infrastructure', null, 2, '2026-08-07'),
  ('AU:plumber', 'employer', 'Sydney Water careers', 'https://www.sydneywater.com.au/about-us/our-people/careers.html', 'water_utility', 'NSW', 3, '2026-08-07'),
  ('AU:plumber', 'employer', 'Water Corporation careers', 'https://www.watercorporation.com.au/About-us/Careers', 'water_utility', 'WA', 4, '2026-08-07'),
  ('AU:plumber', 'employer', 'BGIS careers', 'https://apac.bgis.com/careers/', 'facilities_management', null, 5, '2026-08-07'),
  ('AU:plumber', 'entry_program', 'Australian Apprenticeships — Become an apprentice', 'https://www.apprenticeships.gov.au/apprentices', 'government_apprenticeship', null, 1, '2026-08-07'),
  ('AU:plumber', 'source', 'ABS OSCA Minor Group 363 Plumbers', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/363', 'official_classification', null, 1, '2026-08-07'),
  ('AU:plumber', 'source', 'Jobs and Skills Australia — Plumbers profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3341-plumbers', 'official_labour_market', null, 2, '2026-08-07'),
  ('AU:plumber', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:plumber', 'source', 'Jobs and Skills Australia — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:plumber', 'source', 'Jobs and Skills Australia — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:plumber', 'source', 'National Training Register — CPC32420', 'https://training.gov.au/Training/Details/CPC32420', 'official_training', null, 6, '2026-08-07'),
  ('AU:plumber', 'source', 'ABCB — Plumbing administrations', 'https://www.abcb.gov.au/support/state-and-territory-building-and-plumbing-administrations', 'official_regulator', null, 7, '2026-08-07'),
  ('AU:plumber', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_visa', null, 8, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:plumber', 'au-vet:tafe-nsw:CPC32420', 'direct', '2026-08-07')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
