insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:wall-floor-tiler', 'AU', 'wall-floor-tiler', 'Wall and Floor Tiler',
  'OSCA', '2024 v1.0', '3624', 'AUD', false,
  'State and territory building and trade licensing regulators',
  'https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/wall-and-floor-tiling-work',
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
  'AU:wall-floor-tiler', '2026-05-01', 21800, null, null, null,
  1852, 17, 7, 39, 42, 98, '2026-05-01', -5.0,
  3.0, 6.4, 20, 8, 5, 3, 13, 0, 5, 10, 3, 67,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'vacancy_intensity_pct', 0.45,
    'salary_data_status', 'Jobs and Skills Australia publishes median weekly and hourly earnings as N/A for Wall and Floor Tilers because the estimate has a high standard error. No salary estimate is substituted and the salary component is zero.',
    'employer_diversity_basis', 'Curated coverage of apprenticeship networks, training-and-employer matching organisations and major Australian tile-sector employers; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'A paid apprenticeship and CPC31320 provide a structured entry route. The qualification is formally identified as suitable for an Australian apprenticeship pathway.',
    'entry_burden_basis', 'A multi-year apprenticeship, Certificate III trade training and general construction induction normally apply; licensing, contracting and waterproofing requirements vary by jurisdiction.',
    'scope_note', 'Exact mapping from OSCA 362431 Wall and Floor Tiler to legacy ANZSCO 333411, with labour-market series published at ANZSCO unit group 3334.',
    'shortage_note', 'The 2025 Occupation Shortage List records Wall and Floor Tiler in shortage nationally and in all eight states and territories.',
    'vacancy_data_provenance', 'May 2026 JSA Internet Vacancy Index values were captured from an indexed current representation tied to the official JSA series because the source workbook row was not machine-readable through the available tools.',
    'projection_data_provenance', 'May 2025 to May 2035 JSA employment projection values were captured from an indexed current representation tied to the official JSA projection series because the source workbook was not machine-readable through the available tools.',
    'indexed_extraction_reference', 'https://nwivisas.com/australia/occupations/wall-and-floor-tiler-333411',
    'score_note', 'Provisional because official occupation earnings are suppressed and vacancy/projection workbook rows have not yet been directly machine-ingested.'
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
  ('AU:wall-floor-tiler', '362431', 'Wall and Floor Tiler', 'ANZSCO', '2013 v1.3', '333411', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/362/3624/362431', '2026-08-07')
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
  ('AU:wall-floor-tiler', 'QLD', '2026-05-01', 3, 30, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:wall-floor-tiler', 'NSW', '2026-05-01', 3, 23, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:wall-floor-tiler', 'WA', '2026-05-01', 3, 18, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:wall-floor-tiler', 'VIC', '2026-05-01', 3, 17, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:wall-floor-tiler', 'SA', '2026-05-01', 3, 7, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:wall-floor-tiler', 'TAS', '2026-05-01', 3, 2, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:wall-floor-tiler', 'ACT', '2026-05-01', 3, 2, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:wall-floor-tiler', 'NT', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:wall-floor-tiler', 'job_search', 'SEEK — Wall and Floor Tiler jobs', 'https://www.seek.com.au/wall-and-floor-tiler-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:wall-floor-tiler', 'job_search', 'Workforce Australia — Tiler search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=tiler', 'government_job_board', null, 2, '2026-08-07'),
  ('AU:wall-floor-tiler', 'employer', 'Apprenticeship Careers Australia — Wall and Floor Tiling', 'https://www.apprenticeshipcareers.com.au/job-seekers/career-profiles/wall-and-floor-tiling-apprenticeship', 'apprenticeship_network', null, 1, '2026-08-07'),
  ('AU:wall-floor-tiler', 'employer', 'Everthought Education — Tiling Apprenticeship', 'https://everthought.edu.au/tiling-apprenticeship/', 'training_employer_network', null, 2, '2026-08-07'),
  ('AU:wall-floor-tiler', 'employer', 'HIA Apprentices', 'https://hia.com.au/careers-and-learning/become-an-hia-apprentice/why-become-an-hia-apprentice', 'apprenticeship_network', null, 3, '2026-08-07'),
  ('AU:wall-floor-tiler', 'employer', 'Beaumont Tiles careers', 'https://www.beaumont-tiles.com.au/careers', 'tile_sector_employer', null, 4, '2026-08-07'),
  ('AU:wall-floor-tiler', 'employer', 'National Tiles careers', 'https://www.nationaltiles.com.au/careers', 'tile_sector_employer', null, 5, '2026-08-07'),
  ('AU:wall-floor-tiler', 'entry_program', 'Australian Apprenticeships — Become an apprentice', 'https://www.apprenticeships.gov.au/apprentices', 'government_apprenticeship', null, 1, '2026-08-07'),
  ('AU:wall-floor-tiler', 'entry_program', 'Apprenticeship Careers Australia — Wall and Floor Tiling', 'https://www.apprenticeshipcareers.com.au/job-seekers/career-profiles/wall-and-floor-tiling-apprenticeship', 'apprenticeship_network', null, 2, '2026-08-07'),
  ('AU:wall-floor-tiler', 'entry_program', 'Everthought Education — CPC31320 apprenticeship', 'https://everthought.edu.au/tiling-apprenticeship/', 'training_provider', null, 3, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'ABS OSCA 362431 Wall and Floor Tiler', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/36/362/3624/362431', 'official_classification', null, 1, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'Jobs and Skills Australia — Wall and Floor Tilers profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3334-wall-and-floor-tilers', 'official_labour_market', null, 2, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'Jobs and Skills Australia — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'Jobs and Skills Australia — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'National Training Register — CPC31320', 'https://training.gov.au/Training/Details/CPC31320', 'official_training', null, 6, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'NSW Government — Wall and floor tiling work', 'https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/wall-and-floor-tiling-work', 'official_licensing', 'NSW', 7, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'Safe Work Australia — Working on a construction site', 'https://www.safeworkaustralia.gov.au/safety-topic/industry-and-business/construction/working-construction-site', 'official_safety', null, 8, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'Trades Recognition Australia — Occupations assessed by TRA', 'https://www.tradesrecognitionaustralia.gov.au/occupations-assessed-trades-recognition-australia', 'official_skills_assessment', null, 9, '2026-08-07'),
  ('AU:wall-floor-tiler', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_visa', null, 10, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:wall-floor-tiler', 'au-vet:tafe-nsw:CPC31320', 'direct', '2026-08-07')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
