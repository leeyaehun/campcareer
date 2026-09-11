insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:hvac-technician', 'AU', 'hvac-technician', 'Air Conditioning and Refrigeration Technician',
  'OSCA', '2024 v1.0', '3821', 'AUD', true,
  'Australian Refrigeration Council and relevant state or territory regulators',
  'https://www.dcceew.gov.au/environment/protection/ozone/rac/technicians',
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
  'AU:hvac-technician', '2026-05-01', 29700, 2100, 51, 109200,
  1852, 9, 1, 31, 43, null, null, null,
  2.3, 6.7, 20, 0, 5, 0, 13, 7, 5, 10, 2, 62,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'salary_premium_pct', 13.39,
    'vacancy_data_status', 'The current JSA IVI ANZSCO4 state and territory workbook is published, but the 3421 row has not yet been directly machine-ingested. National vacancy, intensity, trend and regional vacancy-count fields remain null and their score components remain zero.',
    'employer_diversity_basis', 'Curated coverage of specialist mechanical-services contractors, air-conditioning manufacturers and global building-services employers; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'A paid apprenticeship and UEE32225 provide a structured trade entry route. The current qualification is directly tied to regulated refrigerant-handling competencies.',
    'entry_burden_basis', 'A multi-year apprenticeship and Certificate III trade training normally apply. A Refrigerant Handling Licence is required for regulated refrigerants and state or territory electrical, contractor or other permissions may also apply by scope.',
    'scope_note', 'Exact mapping from OSCA 382131 Air Conditioning and Refrigeration Technician to legacy ANZSCO 342111 Airconditioning and Refrigeration Mechanic, with JSA labour-market metrics published at ANZSCO unit group 3421.',
    'shortage_note', 'The 2025 JSA shortage evidence identifies Airconditioning and Refrigeration Mechanics as a long-training-gap shortage occupation with persistent hiring difficulty.',
    'projection_data_provenance', 'Five-year and ten-year growth values are indexed representations attributed to the JSA May 2025 employment projections because the official projection workbook row was not machine-readable through the available tools.',
    'projection_indexed_references', jsonb_build_array('https://www.jobsearch.com.au/salary/air-conditioning-mechanic', 'https://www.willaitakemyjob.com.au/roadmap?from=vending-machine-attendants&to=airconditioning-and-refrigeration-mechanics'),
    'score_note', 'Provisional because the current IVI row is not directly ingested and projection workbook values currently retain indexed extraction provenance.'
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
  ('AU:hvac-technician', '382131', 'Air Conditioning and Refrigeration Technician', 'ANZSCO', '2013 v1.3', '342111', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/382/3821/382131', '2026-08-07')
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
  ('AU:hvac-technician', 'NSW', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:hvac-technician', 'VIC', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:hvac-technician', 'QLD', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:hvac-technician', 'SA', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:hvac-technician', 'WA', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:hvac-technician', 'TAS', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:hvac-technician', 'NT', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:hvac-technician', 'ACT', '2026-05-01', 3, null, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:hvac-technician', 'job_search', 'SEEK — HVAC Technician jobs', 'https://www.seek.com.au/hvac-technician-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:hvac-technician', 'job_search', 'Workforce Australia — Air conditioning and refrigeration search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=air%20conditioning%20refrigeration', 'government_job_board', null, 2, '2026-08-07'),
  ('AU:hvac-technician', 'employer', 'A.G. Coombs careers', 'https://www.agcoombs.com.au/people-careers/join-our-team/', 'mechanical_services', null, 1, '2026-08-07'),
  ('AU:hvac-technician', 'employer', 'Fredon careers', 'https://www.fredon.com.au/careers/', 'mechanical_services', null, 2, '2026-08-07'),
  ('AU:hvac-technician', 'employer', 'Daikin Australia careers', 'https://www.daikin.com.au/careers', 'hvac_manufacturer_service', null, 3, '2026-08-07'),
  ('AU:hvac-technician', 'employer', 'Johnson Controls careers', 'https://jobs.johnsoncontrols.com/job-search', 'building_services', null, 4, '2026-08-07'),
  ('AU:hvac-technician', 'employer', 'Carrier careers', 'https://jobs.carrier.com/en/search_jobs', 'hvac_manufacturer_service', null, 5, '2026-08-07'),
  ('AU:hvac-technician', 'entry_program', 'Australian Apprenticeships — Become an apprentice', 'https://www.apprenticeships.gov.au/apprentices', 'government_apprenticeship', null, 1, '2026-08-07'),
  ('AU:hvac-technician', 'entry_program', 'A.G. Coombs — Refrigeration and Air Conditioning Apprenticeships', 'https://www.agcoombs.com.au/people-careers/apprenticeship-program/', 'employer_apprenticeship', null, 2, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'ABS OSCA 382131 Air Conditioning and Refrigeration Technician', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/382/3821/382131', 'official_classification', null, 1, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'Jobs and Skills Australia — Airconditioning and Refrigeration Mechanics profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3421-airconditioning-and-refrigeration-mechanics', 'official_labour_market', null, 2, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'Jobs and Skills Australia — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'Jobs and Skills Australia — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'National Training Register — UEE32225', 'https://training.gov.au/Training/Details/UEE32225', 'official_training', null, 6, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'DCCEEW — Refrigeration and air conditioning technicians', 'https://www.dcceew.gov.au/environment/protection/ozone/rac/technicians', 'official_licensing', null, 7, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'Safe Work Australia — Working on a construction site', 'https://www.safeworkaustralia.gov.au/safety-topic/industry-and-business/construction/working-construction-site', 'official_safety', null, 8, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'Trades Recognition Australia — OSAP nominated occupations', 'https://www.tradesrecognitionaustralia.gov.au/osap-nominated-occupations-countries-and-sars', 'official_skills_assessment', null, 9, '2026-08-07'),
  ('AU:hvac-technician', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_visa', null, 10, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:hvac-technician', 'au-vet:training-gov:UEE32225', 'direct', '2026-08-07')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
