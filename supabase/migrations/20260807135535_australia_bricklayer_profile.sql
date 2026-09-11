-- Australia Bricklayer profile for the shared country occupation foundation.
-- CampCareer rolls the canonical bricklayer intent to OSCA 3711 Bricklayers and Stonemasons
-- so dated employment, earnings and projection metrics align with JSA's published ANZSCO 3311 series.
-- Current IVI occupation-row values are intentionally left null until the official workbook row is directly ingested.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:bricklayer', 'AU', 'bricklayer', 'Bricklayer',
  'OSCA', '2024 v1.0', '3711', 'AUD', false,
  'State and territory building and trade licensing regulators',
  'https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/bricklaying-work',
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
  'AU:bricklayer', '2026-05-01', 25800, 2317, 53, 120484,
  1852, 16, 1, 39, 42, null, null, null,
  5.2, 9.8, 20, 0, 5, 0, 13, 10, 7, 10, 3, 68,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'salary_premium_pct', 25.11,
    'vacancy_data_status', 'The current JSA ANZSCO4 IVI workbook is available, but the Bricklayers and Stonemasons row has not yet been directly machine-ingested through the available tooling. National and regional vacancy values, vacancy intensity and vacancy trend therefore remain null/zero rather than being inferred.',
    'employer_diversity_basis', 'Curated coverage of brick-and-block apprenticeship networks, building employers and major masonry-material organisations; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'A paid apprenticeship and CPC33020 provide a structured Bricklayer entry route. Brick & Block Careers also operates apprenticeship placement support.',
    'entry_burden_basis', 'A multi-year apprenticeship, Certificate III trade training and general construction induction normally apply. Contractor, supervisor and trade licensing requirements vary by jurisdiction.',
    'scope_note', 'CampCareer bricklayer rolls up OSCA 371131 Bricklayer and 371132 Stonemason, aligned to JSA ANZSCO 3311 Bricklayers and Stonemasons for dated labour-market metrics.',
    'shortage_note', 'The 2025 Occupation Shortage List records Bricklayer in shortage nationally and in all eight states and territories. The rollup remains provisional where jurisdiction-level Stonemason ratings differ or require separate review.',
    'projection_data_provenance', 'The JSA May 2025 to May 2035 employment projection series is used at ANZSCO 3311 level. Five-year growth is 5.2%; the 10-year figure is retained with indexed extraction provenance until direct workbook ingestion is available.',
    'indexed_projection_reference', 'https://www.willaitakemyjob.com.au/occupation/bricklayers-and-stonemasons',
    'score_note', 'Provisional and not directly comparable with profiles whose national IVI vacancy series is complete; vacancy-intensity and vacancy-trend components are zero until direct workbook ingestion.'
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
  ('AU:bricklayer', '371131', 'Bricklayer', 'ANZSCO', '2013 v1.3', '331111', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/37/371/3711/371131', '2026-08-07'),
  ('AU:bricklayer', '371132', 'Stonemason', 'ANZSCO', '2013 v1.3', '331112', 5, true, true, 2,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/37/371/3711/371132', '2026-08-07')
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
  ('AU:bricklayer', 'ACT', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:bricklayer', 'NSW', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:bricklayer', 'NT', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:bricklayer', 'QLD', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:bricklayer', 'SA', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:bricklayer', 'TAS', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:bricklayer', 'VIC', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage'),
  ('AU:bricklayer', 'WA', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/occupation-shortage')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:bricklayer', 'job_search', 'SEEK — Bricklayer jobs', 'https://www.seek.com.au/bricklayer-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:bricklayer', 'job_search', 'Workforce Australia — Bricklayer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=bricklayer', 'government_job_board', null, 2, '2026-08-07'),
  ('AU:bricklayer', 'employer', 'Brick & Block Careers', 'https://www.brickandblockcareers.org.au/', 'apprenticeship_network', null, 1, '2026-08-07'),
  ('AU:bricklayer', 'employer', 'HIA Apprentices', 'https://hia.com.au/careers-and-learning/become-an-hia-apprentice/why-become-an-hia-apprentice', 'apprenticeship_network', null, 2, '2026-08-07'),
  ('AU:bricklayer', 'employer', 'Brickworks careers', 'https://www.brickworks.com.au/careers/', 'masonry_materials', null, 3, '2026-08-07'),
  ('AU:bricklayer', 'employer', 'Adbri careers', 'https://www.adbri.com.au/careers/', 'construction_materials', null, 4, '2026-08-07'),
  ('AU:bricklayer', 'employer', 'BGC careers', 'https://www.bgc.com.au/careers/', 'building_group', 'WA', 5, '2026-08-07'),
  ('AU:bricklayer', 'entry_program', 'Australian Apprenticeships — Become an apprentice', 'https://www.apprenticeships.gov.au/apprentices', 'government_apprenticeship', null, 1, '2026-08-07'),
  ('AU:bricklayer', 'entry_program', 'Brick & Block Careers — Apprenticeships', 'https://www.brickandblockcareers.org.au/', 'apprenticeship_network', null, 2, '2026-08-07'),
  ('AU:bricklayer', 'entry_program', 'TAFE NSW — CPC33020 Certificate III', 'https://www.tafensw.edu.au/course-areas/building-and-construction-trades/courses/environment-and-sustainability--CPC33020-01', 'training_provider', 'NSW', 3, '2026-08-07'),
  ('AU:bricklayer', 'source', 'ABS OSCA 3711 Bricklayers and Stonemasons', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/37/371/3711', 'official_classification', null, 1, '2026-08-07'),
  ('AU:bricklayer', 'source', 'Jobs and Skills Australia — Bricklayers and Stonemasons profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3311-bricklayers-and-stonemasons', 'official_labour_market', null, 2, '2026-08-07'),
  ('AU:bricklayer', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:bricklayer', 'source', 'Jobs and Skills Australia — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:bricklayer', 'source', 'Jobs and Skills Australia — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:bricklayer', 'source', 'National Training Register — CPC33020', 'https://training.gov.au/Training/Details/CPC33020', 'official_training', null, 6, '2026-08-07'),
  ('AU:bricklayer', 'source', 'NSW Government — Bricklaying work', 'https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/bricklaying-work', 'official_licensing', 'NSW', 7, '2026-08-07'),
  ('AU:bricklayer', 'source', 'Safe Work Australia — Working on a construction site', 'https://www.safeworkaustralia.gov.au/safety-topic/industry-and-business/construction/working-construction-site', 'official_safety', null, 8, '2026-08-07'),
  ('AU:bricklayer', 'source', 'Trades Recognition Australia — occupations assessed', 'https://www.tradesrecognitionaustralia.gov.au/occupations-assessed-trades-recognition-australia', 'official_skills_assessment', null, 9, '2026-08-07'),
  ('AU:bricklayer', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_visa', null, 10, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:bricklayer', 'au-vet:tafe-nsw:CPC33020', 'direct', '2026-08-07')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;
;
