-- Australia Construction Manager profile for the shared country occupation foundation.
-- The canonical career is mapped exactly to OSCA 131131 Construction Project Manager.
-- JSA currently publishes the dated labour-market series at legacy ANZSCO 1331
-- Construction Managers, which also includes Project Builder; that broader scope is
-- recorded explicitly in score_evidence and methodology rather than hidden.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:construction-manager', 'AU', 'construction-manager', 'Construction Project Manager',
  'OSCA', '2024 v1.0', '1311', 'AUD', false,
  'State and territory building regulators; VETASSESS for migration skills assessment',
  'https://www.vetassess.com.au/check-my-occupation/professional-occupations/construction-project-manager',
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
  'AU:construction-manager', '2026-05-01', 134300, 3751, 87, 195052,
  1852, 7, 11, 42, 47, null, null, null,
  14.9, null, 20, 0, 5, 0, 3, 10, 10, 10, 0, 58,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'salary_premium_pct', 102.54,
    'labour_market_scope', 'JSA employment and earnings are currently published on legacy ANZSCO 1331 Construction Managers, which includes Construction Project Manager and Project Builder. CampCareer maps the canonical career itself only to OSCA 131131 Construction Project Manager and labels the broader labour-market scope explicitly.',
    'vacancy_data_status', 'The current national and state IVI ANZSCO 1331 row has not yet been directly machine-ingested. National vacancy, intensity, trend and regional vacancy values remain null and their score components remain zero.',
    'projection_data_provenance', 'The five-year +14.9% projection is an indexed current representation tied to the JSA 2025-2030 Employment Projections for Construction Managers. The occupation-level ten-year value is left null until the official workbook row is directly machine-ingested.',
    'indexed_projection_reference', 'https://www.jobsearch.com.au/salary/construction-manager',
    'employer_diversity_basis', 'Curated coverage of major Australian building and infrastructure contractors; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'Construction Project Manager is not normally a direct-entry role. Graduate construction management, project engineering and site-management pathways can lead toward it, but the role itself requires authority over construction delivery and resources.',
    'entry_burden_basis', 'OSCA Skill Level 1 corresponds to a bachelor degree or higher, or substantial relevant experience. For migration, VETASSESS Group A requires an AQF Bachelor-equivalent highly relevant qualification plus qualifying post-qualification employment.',
    'shortage_note', 'The 2025 Occupation Shortage List records Construction Project Manager in shortage nationally and in all eight states and territories.',
    'score_note', 'Provisional because the IVI row and ten-year occupation projection are not directly ingested and the JSA employment/earnings series is broader than the exact OSCA 131131 mapping.'
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
  ('AU:construction-manager', '131131', 'Construction Project Manager', 'ANZSCO', '2022', '133111', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/1/13/131/1311/131131', '2026-08-07')
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
  ('AU:construction-manager', 'ACT', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:construction-manager', 'NSW', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:construction-manager', 'NT', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:construction-manager', 'QLD', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:construction-manager', 'SA', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:construction-manager', 'TAS', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:construction-manager', 'VIC', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:construction-manager', 'WA', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:construction-manager', 'job_search', 'SEEK — Construction Manager jobs', 'https://www.seek.com.au/construction-manager-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:construction-manager', 'job_search', 'Workforce Australia — Construction Manager search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=construction%20manager', 'government_job_board', null, 2, '2026-08-07'),
  ('AU:construction-manager', 'employer', 'CPB Contractors careers', 'https://www.cpbcon.com.au/en/our-people/careers', 'major_contractor', null, 1, '2026-08-07'),
  ('AU:construction-manager', 'employer', 'John Holland careers', 'https://www.johnholland.com.au/careers', 'major_contractor', null, 2, '2026-08-07'),
  ('AU:construction-manager', 'employer', 'Multiplex careers', 'https://www.multiplex.global/careers/', 'major_builder', null, 3, '2026-08-07'),
  ('AU:construction-manager', 'employer', 'Lendlease careers', 'https://www.lendlease.com/au/careers/', 'major_builder', null, 4, '2026-08-07'),
  ('AU:construction-manager', 'employer', 'Hutchinson Builders careers', 'https://www.hutchinsonbuilders.com.au/careers', 'major_builder', null, 5, '2026-08-07'),
  ('AU:construction-manager', 'entry_program', 'VETASSESS — Construction Project Manager criteria', 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/construction-project-manager', 'official_skills_assessment', null, 1, '2026-08-07'),
  ('AU:construction-manager', 'entry_program', 'National Training Register — CPC50320 Diploma of Building and Construction (Management)', 'https://training.gov.au/Training/Details/CPC50320', 'official_training', null, 2, '2026-08-07'),
  ('AU:construction-manager', 'source', 'ABS OSCA 131131 Construction Project Manager', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/1/13/131/1311/131131', 'official_classification', null, 1, '2026-08-07'),
  ('AU:construction-manager', 'source', 'Jobs and Skills Australia — Construction Managers profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/1331-construction-managers', 'official_labour_market', null, 2, '2026-08-07'),
  ('AU:construction-manager', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:construction-manager', 'source', 'Jobs and Skills Australia — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:construction-manager', 'source', 'Jobs and Skills Australia — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:construction-manager', 'source', 'VETASSESS — Construction Project Manager', 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/construction-project-manager', 'official_skills_assessment', null, 6, '2026-08-07'),
  ('AU:construction-manager', 'source', 'National Training Register — CPC50320', 'https://training.gov.au/Training/Details/CPC50320', 'official_training', null, 7, '2026-08-07'),
  ('AU:construction-manager', 'source', 'Safe Work Australia — Working on a construction site', 'https://www.safeworkaustralia.gov.au/safety-topic/industry-and-business/construction/working-construction-site', 'official_safety', null, 8, '2026-08-07'),
  ('AU:construction-manager', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list?srckeyword=13311', 'official_visa', null, 9, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:construction-manager', 'au-vet:training-gov:CPC50320', 'progression', '2026-08-07')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
