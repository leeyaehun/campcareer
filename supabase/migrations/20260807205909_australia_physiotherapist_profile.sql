insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:physiotherapist', 'AU', 'physiotherapist', 'Physiotherapist',
  'OSCA', '2024 v1.0', '2624', 'AUD', true,
  'Physiotherapy Board of Australia (Ahpra)',
  'https://www.physiotherapyboard.gov.au/Registration-Standards.aspx',
  'decision_ready', '2026-08-07', now()
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
  'AU:physiotherapist', '2026-05-01', 46600, 1888, 50, 98176,
  1852, 28, 58, 33, 41, 1205.66667, '2026-05-01', 4.42,
  19.69, 35.10, 20, 15, 5, 6, 13, 5, 10, 10, 2, 86,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'labour_market_scope', 'CampCareer maps Physiotherapist exactly to OSCA 262431. JSA employment, earnings, vacancy and projection series are currently published on legacy ANZSCO 2525 Physiotherapists; the corresponding legacy six-digit occupation is 252511 Physiotherapist.',
    'vacancy_intensity_pct', 2.59,
    'salary_premium_pct', 1.94,
    'vacancy_yoy_basis', 'May 2026 three-month-average national vacancies of 1205.66667 compared with 1154.66667 in May 2025.',
    'shortage_note', 'The 2025 Occupation Shortage List records Physiotherapist in shortage nationally and in all eight states and territories.',
    'visa_basis', 'Home Affairs Core Skills Occupation List includes legacy ANZSCO 252511 Physiotherapist. Visa-list inclusion does not determine individual eligibility.',
    'employer_diversity_basis', 'Curated public health-system and private hospital employer coverage; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'Accredited entry-to-practice Bachelor, graduate-entry Master and Doctor of Physiotherapy programs provide structured professional entry routes, followed by Ahpra registration.',
    'entry_burden_basis', 'An approved entry-to-practice physiotherapy qualification, substantial clinical education and Physiotherapy Board registration standards apply before independent practice.',
    'program_data_note', 'Program links point to existing CampCareer Australia program-catalog records. Accreditation and approval must still be checked against the Australian Physiotherapy Council and Physiotherapy Board before treating a specific course as registration-qualifying.',
    'score_note', 'Provisional until posting-level graduate-entry shares and unique-employer counts are ingested; labour-market, shortage, vacancy and projection inputs used here are directly sourced.'
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
  ('AU:physiotherapist', '262431', 'Physiotherapist', 'ANZSCO', '2013 v1.3', '252511', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/262/2624/262431', '2026-08-07')
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
  ('AU:physiotherapist', 'ACT', '2026-05-01', 3, 23.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:physiotherapist', 'NSW', '2026-05-01', 3, 341.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:physiotherapist', 'NT', '2026-05-01', 3, 17, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:physiotherapist', 'QLD', '2026-05-01', 3, 267.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:physiotherapist', 'SA', '2026-05-01', 3, 102.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:physiotherapist', 'TAS', '2026-05-01', 3, 28.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:physiotherapist', 'VIC', '2026-05-01', 3, 322.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:physiotherapist', 'WA', '2026-05-01', 3, 102.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:physiotherapist', 'job_search', 'SEEK — Physiotherapist jobs', 'https://www.seek.com.au/physiotherapist-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:physiotherapist', 'job_search', 'Workforce Australia — Physiotherapist search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=physiotherapist', 'government_job_board', null, 2, '2026-08-07'),
  ('AU:physiotherapist', 'employer', 'NSW Health — Careers', 'https://www.health.nsw.gov.au/careers/Pages/default.aspx', 'public_health_system', 'NSW', 1, '2026-08-07'),
  ('AU:physiotherapist', 'employer', 'Queensland Health — Allied health careers', 'https://www.careers.health.qld.gov.au/allied-health-careers', 'public_health_system', 'QLD', 2, '2026-08-07'),
  ('AU:physiotherapist', 'employer', 'WA Health — Careers', 'https://www.health.wa.gov.au/Careers', 'public_health_system', 'WA', 3, '2026-08-07'),
  ('AU:physiotherapist', 'employer', 'Ramsay Health Care — Careers', 'https://www.ramsayhealth.com.au/en/ramsay-careers/', 'private_hospital_group', null, 4, '2026-08-07'),
  ('AU:physiotherapist', 'employer', 'Healthscope — Careers', 'https://careers.healthscope.com.au/', 'private_hospital_group', null, 5, '2026-08-07'),
  ('AU:physiotherapist', 'entry_program', 'Australian Physiotherapy Council — Education providers and accreditation', 'https://physiocouncil.com.au/accreditation-for-education-providers/', 'official_accreditation_authority', null, 1, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'ABS — OSCA 262431 Physiotherapist', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/262/2624/262431', 'official_classification', null, 1, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'JSA — Physiotherapists occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2525-physiotherapists', 'official_labour_market', null, 2, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'Physiotherapy Board of Australia — Registration standards', 'https://www.physiotherapyboard.gov.au/Registration-Standards.aspx', 'official_regulator', null, 6, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'Australian Physiotherapy Council — Entry-level program accreditation', 'https://physiocouncil.com.au/accreditation-for-education-providers/', 'official_accreditation_authority', null, 7, '2026-08-07'),
  ('AU:physiotherapist', 'source', 'Home Affairs — Core Skills Occupation List', 'https://immi.homeaffairs.gov.au/Documents/core-sol.pdf', 'official_visa', null, 8, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:physiotherapist', 'au-program:804', 'direct', '2026-08-07'),
  ('AU:physiotherapist', 'au-program:19250', 'direct', '2026-08-07'),
  ('AU:physiotherapist', 'au-program:4744', 'graduate_entry', '2026-08-07')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
