-- Australia Occupational Therapist profile.
-- Current exact mapping: OSCA 262331 Occupational Therapist.
-- Legacy JSA labour-market series 2524 Occupational Therapists maps directly to the same career scope.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:occupational-therapist', 'AU', 'occupational-therapist', 'Occupational Therapist',
  'OSCA', '2024 v1.0', '2623', 'AUD', true,
  'Occupational Therapy Board of Australia (Ahpra)',
  'https://www.occupationaltherapyboard.gov.au/Registration.aspx',
  'decision_ready', '2026-08-08', now()
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
  'AU:occupational-therapist', '2026-05-01', 35600, 1913, 50, 99476,
  1852, 37, 92, 33, 40, 1436.66667, '2026-05-01', -10.19,
  18.75, 33.10, 20, 15, 5, 0, 13, 5, 10, 10, 2, 80,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'labour_market_scope', 'CampCareer maps Occupational Therapist exactly to OSCA 262331 and legacy ANZSCO 252411. JSA employment, earnings, vacancy and projection data are published on ANZSCO 2524 Occupational Therapists, whose unit-group scope is Occupational Therapist.',
    'vacancy_intensity_pct', 4.04,
    'salary_premium_pct', 3.29,
    'vacancy_yoy_basis', 'May 2026 three-month-average national vacancies of 1436.66667 compared with 1599.66667 in May 2025: -10.19%. The vacancy-trend component is therefore zero despite high vacancy intensity.',
    'shortage_note', 'The 2025 Occupation Shortage List data in CampCareer records OSCA 262331 in shortage nationally and in all eight states and territories.',
    'visa_basis', 'Home Affairs Core Skills Occupation List eligibility is verified for legacy ANZSCO 252411 Occupational Therapist corresponding to OSCA 262331. Visa-list inclusion does not determine individual eligibility.',
    'registration_basis', 'Occupational therapists must be registered with the Occupational Therapy Board of Australia through Ahpra. The Occupational Therapy Council accredits entry-to-practice programs and the Board approves programs for registration purposes.',
    'entry_level_basis', 'Approved Bachelor and graduate-entry Master of Occupational Therapy programs provide structured entry-to-practice routes before Ahpra registration.',
    'entry_burden_basis', 'A registration-qualifying higher education program, professional practice education and Occupational Therapy Board registration are required before practising as an occupational therapist.',
    'employer_diversity_basis', 'Curated public health-system and private hospital employer coverage; replace with posting-level unique-employer data when available.',
    'score_note', 'Provisional until posting-level graduate-entry shares and unique-employer counts are ingested. The negative vacancy trend is scored at zero rather than overridden by the strong shortage, vacancy-intensity and growth signals.'
  ),
  '2026-08-08'
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
  ('AU:occupational-therapist', '262331', 'Occupational Therapist', 'ANZSCO', '2013 v1.3', '252411', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/262/2623/262331', '2026-08-08')
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
  ('AU:occupational-therapist', 'ACT', '2026-05-01', 3, 47, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:occupational-therapist', 'NSW', '2026-05-01', 3, 404.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:occupational-therapist', 'NT', '2026-05-01', 3, 37, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:occupational-therapist', 'QLD', '2026-05-01', 3, 285, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:occupational-therapist', 'SA', '2026-05-01', 3, 124.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:occupational-therapist', 'TAS', '2026-05-01', 3, 37, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:occupational-therapist', 'VIC', '2026-05-01', 3, 351.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:occupational-therapist', 'WA', '2026-05-01', 3, 150, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:occupational-therapist', 'job_search', 'SEEK — Occupational Therapist jobs', 'https://www.seek.com.au/occupational-therapist-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:occupational-therapist', 'job_search', 'Workforce Australia — Occupational Therapist search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=occupational%20therapist', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:occupational-therapist', 'employer', 'NSW Health — Careers', 'https://www.health.nsw.gov.au/careers/Pages/default.aspx', 'public_health_system', 'NSW', 1, '2026-08-08'),
  ('AU:occupational-therapist', 'employer', 'Queensland Health — Allied health careers', 'https://www.careers.health.qld.gov.au/allied-health-careers', 'public_health_system', 'QLD', 2, '2026-08-08'),
  ('AU:occupational-therapist', 'employer', 'WA Health — Careers', 'https://www.health.wa.gov.au/Careers', 'public_health_system', 'WA', 3, '2026-08-08'),
  ('AU:occupational-therapist', 'employer', 'Monash Health — Occupational Therapy careers', 'https://monashhealth.org/careers/allied-health/occupational-therapy/', 'public_health_service', 'VIC', 4, '2026-08-08'),
  ('AU:occupational-therapist', 'employer', 'Ramsay Health Care — Careers', 'https://www.ramsayhealth.com.au/en/ramsay-careers/', 'private_hospital_group', null, 5, '2026-08-08'),
  ('AU:occupational-therapist', 'entry_program', 'Occupational Therapy Council — Accredited programs', 'https://www.otcouncil.com.au/accreditation-introduction/accredited-programs/', 'official_accreditation_authority', null, 1, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'ABS — OSCA 262331 Occupational Therapist', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/262/2623/262331', 'official_classification', null, 1, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'JSA — Occupational Therapists occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2524-occupational-therapists', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'Occupational Therapy Board of Australia — Registration', 'https://www.occupationaltherapyboard.gov.au/Registration.aspx', 'official_regulator', null, 6, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'Occupational Therapy Council — Accredited programs', 'https://www.otcouncil.com.au/accreditation-introduction/accredited-programs/', 'official_accreditation_authority', null, 7, '2026-08-08'),
  ('AU:occupational-therapist', 'source', 'Home Affairs — Core Skills Occupation List', 'https://immi.homeaffairs.gov.au/Documents/core-sol.pdf', 'official_visa', null, 8, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:occupational-therapist', 'au-program:888', 'direct', '2026-08-08'),
  ('AU:occupational-therapist', 'au-program:1478', 'direct', '2026-08-08'),
  ('AU:occupational-therapist', 'au-program:855', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
