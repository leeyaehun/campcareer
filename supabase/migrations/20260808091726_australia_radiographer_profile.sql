-- Australia Radiographer profile.
-- Current mapping: OSCA 263133 Radiographer.
-- Exact employment/demographics use legacy ANZSCO 251211 Medical Diagnostic Radiographer.
-- JSA vacancy, earnings and projection series are published at broader ANZSCO 2512 Medical Imaging Professionals;
-- CampCareer stores group vacancy/projection signals with explicit scope provenance and leaves exact earnings NULL.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:radiographer', 'AU', 'radiographer', 'Radiographer',
  'OSCA', '2024 v1.0', '2631', 'AUD', true,
  'Medical Radiation Practice Board of Australia (Ahpra)',
  'https://www.medicalradiationpracticeboard.gov.au/Registration.aspx',
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
  'AU:radiographer', '2026-05-01', 10200, null, null, null,
  1852, 33, 68, 35, 40, 737.66667, '2026-05-01', 4.73,
  18.11, 33.13, 20, 0, 5, 5, 13, 0, 6, 10, 2, 61,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'labour_market_scope', 'CampCareer maps the career exactly to OSCA 263133 Radiographer and legacy ANZSCO 251211 Medical Diagnostic Radiographer. Exact six-digit employment and demographics come from the 2021 Census-based JSA page. JSA current earnings, IVI vacancies and employment projections are published for broader legacy ANZSCO 2512 Medical Imaging Professionals, which also includes radiation therapists, nuclear medicine technologists and sonographers.',
    'earnings_note', 'JSA does not publish six-digit earnings for ANZSCO 251211. CampCareer leaves radiographer earnings NULL rather than presenting the broader ANZSCO 2512 median as radiographer-specific pay.',
    'vacancy_scope', 'May 2026 national vacancies 737.66667 and May 2025 704.33333 are for broader ANZSCO 2512 Medical Imaging Professionals.',
    'vacancy_yoy_basis', 'Broader ANZSCO 2512 May 2026 three-month-average vacancies compared with May 2025: +4.73%.',
    'vacancy_intensity_basis', 'Not scored because the vacancy numerator is ANZSCO 2512 while employment_total is exact ANZSCO 251211; the group includes occupations outside the Radiographer OSCA scope.',
    'growth_scope', 'The +18.11% 2025-2030 and +33.13% 2025-2035 projections are broader ANZSCO 2512 Medical Imaging Professionals. A conservative partial growth component is used.',
    'shortage_note', 'The 2025 Occupation Shortage List data in CampCareer records OSCA 263133 in shortage nationally and in all eight states and territories.',
    'visa_basis', 'Home Affairs Core Skills Occupation List eligibility is verified for legacy ANZSCO 251211 Medical Diagnostic Radiographer corresponding to OSCA 263133. Visa-list inclusion does not determine individual eligibility.',
    'registration_basis', 'Radiographers are registered medical radiation practitioners. The Medical Radiation Practice Board of Australia and Ahpra regulate registration; approved diagnostic radiography programs qualify graduates to apply for registration.',
    'entry_level_basis', 'Approved Bachelor and graduate-entry diagnostic radiography programs provide structured entry-to-practice routes before Ahpra registration.',
    'entry_burden_basis', 'A registration-qualifying higher education program, clinical education and Medical Radiation Practice Board registration are required.',
    'employer_diversity_basis', 'Curated public health-system and private medical-imaging employer coverage; replace with posting-level unique-employer data when available.',
    'score_note', 'Provisional and intentionally conservative because vacancy intensity and salary are not scored from the broader ANZSCO 2512 series.'
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
  ('AU:radiographer', '263133', 'Radiographer', 'ANZSCO', '2013 v1.3', '251211', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/263/2631/263133', '2026-08-08')
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
  ('AU:radiographer', 'ACT', '2026-05-01', 3, 16, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:radiographer', 'NSW', '2026-05-01', 3, 202.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:radiographer', 'NT', '2026-05-01', 3, 8.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:radiographer', 'QLD', '2026-05-01', 3, 177.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:radiographer', 'SA', '2026-05-01', 3, 52.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:radiographer', 'TAS', '2026-05-01', 3, 22.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:radiographer', 'VIC', '2026-05-01', 3, 198.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:radiographer', 'WA', '2026-05-01', 3, 60.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:radiographer', 'job_search', 'SEEK — Radiographer jobs', 'https://www.seek.com.au/radiographer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:radiographer', 'job_search', 'Workforce Australia — Radiographer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=radiographer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:radiographer', 'employer', 'NSW Health — Careers', 'https://www.health.nsw.gov.au/careers/Pages/default.aspx', 'public_health_system', 'NSW', 1, '2026-08-08'),
  ('AU:radiographer', 'employer', 'Queensland Health — Allied health careers', 'https://www.careers.health.qld.gov.au/allied-health-careers', 'public_health_system', 'QLD', 2, '2026-08-08'),
  ('AU:radiographer', 'employer', 'WA Health — Careers', 'https://www.health.wa.gov.au/Careers', 'public_health_system', 'WA', 3, '2026-08-08'),
  ('AU:radiographer', 'employer', 'Lumus Imaging — Careers', 'https://www.lumusimaging.com.au/careers', 'private_imaging_network', null, 4, '2026-08-08'),
  ('AU:radiographer', 'employer', 'Ramsay Health Care — Careers', 'https://www.ramsayhealth.com.au/en/ramsay-careers/', 'private_hospital_group', null, 5, '2026-08-08'),
  ('AU:radiographer', 'entry_program', 'Ahpra — Approved programs of study for Medical Radiation Practice', 'https://www.ahpra.gov.au/Accreditation/Approved-Programs-of-Study.aspx', 'official_regulator', null, 1, '2026-08-08'),
  ('AU:radiographer', 'source', 'ABS — OSCA 263133 Radiographer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/263/2631/263133', 'official_classification', null, 1, '2026-08-08'),
  ('AU:radiographer', 'source', 'JSA — Medical Diagnostic Radiographers occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/251211-medical-diagnostic-radiographers', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:radiographer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:radiographer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:radiographer', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:radiographer', 'source', 'Medical Radiation Practice Board of Australia — Registration', 'https://www.medicalradiationpracticeboard.gov.au/Registration.aspx', 'official_regulator', null, 6, '2026-08-08'),
  ('AU:radiographer', 'source', 'Ahpra — Approved programs of study', 'https://www.ahpra.gov.au/Accreditation/Approved-Programs-of-Study.aspx', 'official_regulator', null, 7, '2026-08-08'),
  ('AU:radiographer', 'source', 'Home Affairs — Core Skills Occupation List', 'https://immi.homeaffairs.gov.au/Documents/core-sol.pdf', 'official_visa', null, 8, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:radiographer', 'au-program:19563', 'direct', '2026-08-08'),
  ('AU:radiographer', 'au-program:865', 'direct', '2026-08-08'),
  ('AU:radiographer', 'au-program:19533', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
