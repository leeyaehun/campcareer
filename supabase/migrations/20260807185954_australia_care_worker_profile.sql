-- Australia Care Worker profile for the shared country occupation foundation.
-- CampCareer scope includes OSCA 421231 Community Aged Care Support Worker and
-- OSCA 422231 Disability Support Worker. Residential Aged Care Worker is excluded.
-- JSA labour-market series are currently published on the broader legacy ANZSCO
-- 4231 Aged and Disabled Carers series and this scope difference is explicit.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:care-worker', 'AU', 'care-worker', 'Care Worker',
  'OSCA', '2024 v1.0', '4212 + 4222', 'AUD', false,
  'Aged care and NDIS worker-screening requirements vary by role and provider',
  'https://www.health.gov.au/topics/aged-care-workforce/screening-requirements',
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
  'AU:care-worker', '2026-05-01', 376300, 1761, 46, 91572,
  1852, 60, 73, 41, 43, 3520.33333, '2026-05-01', -0.19,
  10.75, 18.12, 20, 11, 5, 5, 15, 5, 10, 5, 4, 80,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'labour_market_scope', 'CampCareer includes OSCA 421231 Community Aged Care Support Worker and OSCA 422231 Disability Support Worker. JSA employment, earnings, vacancy and projection series are published on legacy ANZSCO 4231 Aged and Disabled Carers, which is broader than this exact two-occupation scope.',
    'vacancy_intensity_pct', 0.94,
    'salary_premium_pct', -4.91,
    'vacancy_yoy_basis', 'May 2026 three-month-average national vacancies of 3520.33333 compared with 3527 in May 2025.',
    'shortage_note', 'The 2025 Occupation Shortage List records both Community Aged Care Support Worker and Disability Support Worker in shortage nationally and in all eight states and territories.',
    'visa_basis', 'The Aged Care Industry Labour Agreement can cover legacy ANZSCO 423111 Aged or Disabled Carer for eligible aged-care employers. Home Affairs explicitly states disability-sector employers cannot use that agreement, so visa coverage is partial and employer/sector dependent.',
    'employer_diversity_basis', 'Curated aged-care and disability-provider coverage; replace with posting-level unique-employer counts when available.',
    'entry_level_basis', 'CHC33021 Certificate III in Individual Support is a current qualification for community, home and residential support roles and includes Ageing and Disability specialisation options. Employers may also recruit entrants while they complete required training and screening.',
    'entry_burden_basis', 'There is no single national occupational licence. Aged-care workers need an accepted screening clearance, and workers in risk-assessed roles for registered NDIS providers need an NDIS Worker Screening Clearance. Employer-specific training, first aid, vaccination or driving requirements can also apply.',
    'score_note', 'Provisional because JSA labour-market metrics remain on the broader legacy ANZSCO 4231 scope and the visa pathway applies only to eligible aged-care employers, not the disability sector.'
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
  ('AU:care-worker', '421231', 'Community Aged Care Support Worker', 'ANZSCO', '2013 v1.3', '423111', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/4/42/421/4212/421231', '2026-08-07'),
  ('AU:care-worker', '422231', 'Disability Support Worker', 'ANZSCO', '2013 v1.3', '423111', 5, false, true, 2,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/4/42/422/4222/422231', '2026-08-07')
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
  ('AU:care-worker', 'ACT', '2026-05-01', 3, 46.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:care-worker', 'NSW', '2026-05-01', 3, 1155, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:care-worker', 'NT', '2026-05-01', 3, 38, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:care-worker', 'QLD', '2026-05-01', 3, 868.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:care-worker', 'SA', '2026-05-01', 3, 295.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:care-worker', 'TAS', '2026-05-01', 3, 74.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:care-worker', 'VIC', '2026-05-01', 3, 819.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:care-worker', 'WA', '2026-05-01', 3, 223, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:care-worker', 'job_search', 'SEEK — Aged Care Worker jobs', 'https://www.seek.com.au/aged-care-worker-jobs', 'private_job_board', null, 1, '2026-08-07'),
  ('AU:care-worker', 'job_search', 'SEEK — Disability Support Worker jobs', 'https://www.seek.com.au/disability-support-worker-jobs', 'private_job_board', null, 2, '2026-08-07'),
  ('AU:care-worker', 'employer', 'Bolton Clarke careers', 'https://www.boltonclarke.com.au/careers/', 'aged_care_provider', null, 1, '2026-08-07'),
  ('AU:care-worker', 'employer', 'Australian Unity careers', 'https://www.australianunity.com.au/careers', 'care_provider', null, 2, '2026-08-07'),
  ('AU:care-worker', 'employer', 'Life Without Barriers careers', 'https://www.lwb.org.au/careers/', 'disability_and_community_provider', null, 3, '2026-08-07'),
  ('AU:care-worker', 'employer', 'Aruma careers', 'https://www.aruma.com.au/careers/', 'disability_provider', null, 4, '2026-08-07'),
  ('AU:care-worker', 'employer', 'Bupa Aged Care careers', 'https://careers.bupa.com.au/', 'aged_care_provider', null, 5, '2026-08-07'),
  ('AU:care-worker', 'entry_program', 'National Training Register — CHC33021 Certificate III in Individual Support', 'https://training.gov.au/training/details/CHC33021', 'official_training', null, 1, '2026-08-07'),
  ('AU:care-worker', 'entry_program', 'TAFE NSW — Certificate IV in Ageing Support', 'https://www.tafensw.edu.au/international/courses/certificate-iv-in-ageing-support--CHC43015', 'public_vet_provider', null, 2, '2026-08-07'),
  ('AU:care-worker', 'source', 'ABS — OSCA 421231 Community Aged Care Support Worker', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/4/42/421/4212/421231', 'official_classification', null, 1, '2026-08-07'),
  ('AU:care-worker', 'source', 'ABS — OSCA 422231 Disability Support Worker', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/4/42/422/4222/422231', 'official_classification', null, 2, '2026-08-07'),
  ('AU:care-worker', 'source', 'JSA — Aged and Disabled Carers profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/4231-aged-and-disabled-carers', 'official_labour_market', null, 3, '2026-08-07'),
  ('AU:care-worker', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-07'),
  ('AU:care-worker', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-07'),
  ('AU:care-worker', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-07'),
  ('AU:care-worker', 'source', 'Department of Health — Aged care workforce screening requirements', 'https://www.health.gov.au/topics/aged-care-workforce/screening-requirements', 'official_screening', null, 7, '2026-08-07'),
  ('AU:care-worker', 'source', 'NDIS Commission — Worker screening', 'https://www.ndiscommission.gov.au/workforce/worker-screening', 'official_screening', null, 8, '2026-08-07'),
  ('AU:care-worker', 'source', 'Home Affairs — Aged Care Industry Labour Agreement', 'https://immi.homeaffairs.gov.au/visas/employing-and-sponsoring-someone/labour-agreements/types-of-labour-agreements/industry-labour-agreements', 'official_visa', null, 9, '2026-08-07')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:care-worker', 'au-vet:training-gov:CHC33021', 'direct', '2026-08-07'),
  ('AU:care-worker', 'au-vet:tafe-nsw:CHC43015', 'progression', '2026-08-07')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
