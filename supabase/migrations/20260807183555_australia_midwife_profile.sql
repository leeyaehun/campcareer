-- Australia Midwife profile for the shared country occupation foundation.
-- Canonical occupation: OSCA 265131 Midwife. Dated labour-market series remain
-- published on legacy ANZSCO 2541 Midwives / 254111 Midwife and are labelled
-- explicitly rather than relying on the stale correspondence in occupations_au.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:midwife', 'AU', 'midwife', 'Midwife',
  'OSCA', '2024 v1.0', '2651', 'AUD', true,
  'Nursing and Midwifery Board of Australia',
  'https://www.nursingmidwiferyboard.gov.au/Registration-Standards.aspx',
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
  'AU:midwife', '2026-05-01', 19400, 2114, 56, 109928,
  1852, 57, 100, 38, 41, 197.33333, '2026-05-01', 9.23,
  13.91, 26.74, 20, 13, 5, 7, 13, 7, 10, 10, 2, 87,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'labour_market_scope', 'CampCareer maps Midwife exactly to OSCA 265131. JSA employment, earnings, vacancy and projection series are currently published on legacy ANZSCO 2541 Midwives; the corresponding legacy six-digit occupation is 254111 Midwife.',
    'vacancy_intensity_pct', 1.02,
    'salary_premium_pct', 14.15,
    'vacancy_yoy_basis', 'May 2026 three-month-average national vacancies of 197.33333 compared with 180.66667 in May 2025.',
    'shortage_note', 'The 2025 Occupation Shortage List records Midwife in shortage nationally and in all eight states and territories.',
    'visa_basis', 'Home Affairs Core Skills Occupation List includes legacy ANZSCO 254111 Midwife. Visa-list inclusion does not determine individual eligibility.',
    'employer_diversity_basis', 'Curated public maternity-system coverage across NSW, Queensland and Western Australia; replace with posting-level unique-employer data when available.',
    'entry_level_basis', 'NMBA-approved Bachelor of Midwifery programs provide direct entry. Graduate recruitment programs support newly registered midwives, while registered nurses may use approved postgraduate midwifery pathways such as NSW Health MidStart.',
    'entry_burden_basis', 'An NMBA-approved entry-to-practice qualification, clinical training and NMBA registration standards apply. Registered-nurse postgraduate pathways have separate prerequisite registration requirements.',
    'score_note', 'Provisional until posting-level entry experience and unique-employer counts are ingested; all national labour-market, shortage and projection inputs used here are directly sourced.'
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
  ('AU:midwife', '265131', 'Midwife', 'ANZSCO', '2013 v1.3', '254111', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2651/265131', '2026-08-07')
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
  ('AU:midwife', 'ACT', '2026-05-01', 3, 9, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:midwife', 'NSW', '2026-05-01', 3, 53, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:midwife', 'NT', '2026-05-01', 3, 4.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:midwife', 'QLD', '2026-05-01', 3, 38, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:midwife', 'SA', '2026-05-01', 3, 25, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:midwife', 'TAS', '2026-05-01', 3, 4.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:midwife', 'VIC', '2026-05-01', 3, 45.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:midwife', 'WA', '2026-05-01', 3, 17.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:midwife', 'job_search', 'SEEK — Midwife jobs', 'https://www.seek.com.au/midwife-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:midwife', 'job_search', 'Workforce Australia — Midwife search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=midwife', 'government_job_board', null, 2, '2026-08-07'),
  ('AU:midwife', 'employer', 'NSW Health — Careers in midwifery', 'https://www.health.nsw.gov.au/nursing/careers/Pages/midwifery.aspx', 'public_health_system', 'NSW', 1, '2026-08-07'),
  ('AU:midwife', 'employer', 'Queensland Health — Nursing and midwifery careers', 'https://www.careers.health.qld.gov.au/nursing-and-midwifery-careers', 'public_health_system', 'QLD', 2, '2026-08-07'),
  ('AU:midwife', 'employer', 'WA Health — Nursing and midwifery careers', 'https://www.health.wa.gov.au/Careers/Occupations/Nursing-and-midwifery', 'public_health_system', 'WA', 3, '2026-08-07'),
  ('AU:midwife', 'entry_program', 'NMBA — Approved programs of study', 'https://www.nursingmidwiferyboard.gov.au/Accreditation/Approved-Programs-of-Study.aspx', 'official_regulator', null, 1, '2026-08-07'),
  ('AU:midwife', 'entry_program', 'NSW Health — MidStart', 'https://www.health.nsw.gov.au/nursing/employment/midstart/Pages/default.aspx', 'public_transition_pathway', 'NSW', 2, '2026-08-07'),
  ('AU:midwife', 'graduate_program', 'NSW Health — GradStart', 'https://www.health.nsw.gov.au/nursing/employment/gradstart/Pages/default.aspx', 'public_graduate_program', 'NSW', 1, '2026-08-07'),
  ('AU:midwife', 'source', 'ABS — OSCA 265131 Midwife', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2651/265131', 'official_classification', null, 1, '2026-08-07'),
  ('AU:midwife', 'source', 'JSA — Midwives occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2541-midwives', 'official_labour_market', null, 2, '2026-08-07'),
  ('AU:midwife', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:midwife', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:midwife', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:midwife', 'source', 'NMBA — Registration standards', 'https://www.nursingmidwiferyboard.gov.au/Registration-Standards.aspx', 'official_regulator', null, 6, '2026-08-07'),
  ('AU:midwife', 'source', 'NMBA — Approved programs of study', 'https://www.nursingmidwiferyboard.gov.au/Accreditation/Approved-Programs-of-Study.aspx', 'official_regulator', null, 7, '2026-08-07'),
  ('AU:midwife', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_visa', null, 8, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;;
