-- Australia Pharmacist profile.
-- Current OSCA roll-up deliberately includes 263431 Community Pharmacist and 263432 Hospital Pharmacist only.
-- Legacy JSA labour-market series 2515 Pharmacists also includes Industrial Pharmacists, so group vacancy/projection
-- signals are retained with explicit scope caveats and are not used for vacancy-intensity or salary scoring.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:pharmacist', 'AU', 'pharmacist', 'Pharmacist',
  'OSCA', '2024 v1.0', '2634', 'AUD', true,
  'Pharmacy Board of Australia (Ahpra)',
  'https://www.pharmacyboard.gov.au/Registration.aspx',
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
  'AU:pharmacist', '2026-05-01', 27100, null, null, null,
  1852, null, null, null, null, 480.33333, '2026-05-01', -22.15,
  10.89, 19.96, 15, 0, 5, 0, 12, 0, 5, 10, 1, 48,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_scope', 'Current OSCA 2634 Pharmacists contains Community Pharmacist 263431 and Hospital Pharmacist 263432. CampCareer intentionally rolls up only these two current occupations.',
    'legacy_mapping', 'Community Pharmacist maps to legacy ANZSCO 251513 Retail Pharmacist and Hospital Pharmacist maps to legacy ANZSCO 251511 Hospital Pharmacist. Legacy ANZSCO 2515 also contains 251512 Industrial Pharmacist, which is not part of the current OSCA 2634 roll-up.',
    'employment_basis', 'Employment_total is the sum of JSA six-digit 2021 Census-based counts for included legacy occupations only: 21,700 Retail Pharmacists plus 5,400 Hospital Pharmacists = 27,100. CampCareer does not substitute the broader 2515 employment total of 46,300.',
    'demographic_note', 'Part-time share, female share, median age and full-time hours are left NULL because JSA does not publish a current aggregate restricted to only the two included current OSCA occupations.',
    'earnings_note', 'JSA publishes median earnings at broader ANZSCO 2515, which includes Industrial Pharmacists. CampCareer therefore leaves canonical roll-up earnings NULL and assigns no salary component.',
    'vacancy_scope', 'May 2026 national vacancies 480.33333 and May 2025 617.0 are broader ANZSCO 2515 Pharmacists, including Industrial Pharmacists.',
    'vacancy_yoy_basis', 'Broader ANZSCO 2515 May 2026 three-month-average vacancies compared with May 2025: -22.15%.',
    'vacancy_intensity_basis', 'Not scored because the vacancy numerator covers broader ANZSCO 2515 while employment_total excludes Industrial Pharmacists.',
    'growth_scope', 'The +10.89% 2025-2030 and +19.96% 2025-2035 projections are broader ANZSCO 2515 Pharmacists. A conservative partial growth component is used.',
    'shortage_note', 'Community Pharmacist is in shortage in all eight jurisdictions. Hospital Pharmacist is in shortage in ACT and rated no shortage in the other seven jurisdictions in the current CampCareer OSL data. The roll-up therefore receives a partial rather than maximum shortage component; region-level roll-up shortage is left NULL to avoid hiding the distinction.',
    'visa_basis', 'Home Affairs CSOL eligibility is verified for legacy ANZSCO 251513 Retail Pharmacist and 251511 Hospital Pharmacist corresponding to both included current OSCA occupations. Visa-list inclusion does not determine individual eligibility.',
    'registration_basis', 'Pharmacy practice is regulated by the Pharmacy Board of Australia through Ahpra. Graduates of approved Australian pharmacy degree programs apply for provisional registration, complete the Board-required supervised practice and accredited intern training, and pass required written and oral examinations before general registration.',
    'entry_level_basis', 'Australian Pharmacy Council-accredited and Pharmacy Board-approved Bachelor, Master and Doctor of Pharmacy programs provide structured entry-to-practice education routes before internship requirements.',
    'entry_burden_basis', 'A registration-qualifying degree is followed by provisional registration, supervised practice, an accredited intern training program and registration examinations before unsupervised practice.',
    'employer_diversity_basis', 'Curated public hospital and community-pharmacy employer coverage; replace with posting-level unique-employer data when available.',
    'score_note', 'Provisional and conservative because the current OSCA roll-up excludes Industrial Pharmacists while JSA vacancy, salary and projection series remain broader legacy ANZSCO 2515.'
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
  ('AU:pharmacist', '263431', 'Community Pharmacist', 'ANZSCO', '2013 v1.3', '251513', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/263/2634/263431', '2026-08-08'),
  ('AU:pharmacist', '263432', 'Hospital Pharmacist', 'ANZSCO', '2013 v1.3', '251511', 4, true, true, 2,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/263/2634/263432', '2026-08-08')
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
  ('AU:pharmacist', 'ACT', '2026-05-01', null, 17, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:pharmacist', 'NSW', '2026-05-01', null, 105, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:pharmacist', 'NT', '2026-05-01', null, 11.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:pharmacist', 'QLD', '2026-05-01', null, 140.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:pharmacist', 'SA', '2026-05-01', null, 46, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:pharmacist', 'TAS', '2026-05-01', null, 11.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:pharmacist', 'VIC', '2026-05-01', null, 122.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:pharmacist', 'WA', '2026-05-01', null, 26, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:pharmacist', 'job_search', 'SEEK — Pharmacist jobs', 'https://www.seek.com.au/pharmacist-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:pharmacist', 'job_search', 'Workforce Australia — Pharmacist search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=pharmacist', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:pharmacist', 'employer', 'NSW Health — Careers', 'https://www.health.nsw.gov.au/careers/Pages/default.aspx', 'public_health_system', 'NSW', 1, '2026-08-08'),
  ('AU:pharmacist', 'employer', 'Queensland Health — Careers', 'https://www.careers.health.qld.gov.au/', 'public_health_system', 'QLD', 2, '2026-08-08'),
  ('AU:pharmacist', 'employer', 'WA Health — Careers', 'https://www.health.wa.gov.au/Careers', 'public_health_system', 'WA', 3, '2026-08-08'),
  ('AU:pharmacist', 'employer', 'Chemist Warehouse — Careers', 'https://careers.chemistwarehouse.com/', 'community_pharmacy', null, 4, '2026-08-08'),
  ('AU:pharmacist', 'employer', 'Ramsay Health Care — Careers', 'https://www.ramsayhealth.com.au/en/ramsay-careers/', 'private_hospital_group', null, 5, '2026-08-08'),
  ('AU:pharmacist', 'entry_program', 'Australian Pharmacy Council — Accredited Australian pharmacy programs', 'https://www.pharmacycouncil.org.au/education-provider/accreditation/pharmacy-degree-programs-australia/accredited-pharmacy-degree-programs/', 'official_accreditation_authority', null, 1, '2026-08-08'),
  ('AU:pharmacist', 'source', 'ABS — OSCA 2634 Pharmacists', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/263/2634', 'official_classification', null, 1, '2026-08-08'),
  ('AU:pharmacist', 'source', 'JSA — Pharmacists occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2515-pharmacists', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:pharmacist', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:pharmacist', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:pharmacist', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:pharmacist', 'source', 'Pharmacy Board of Australia — Registration', 'https://www.pharmacyboard.gov.au/Registration.aspx', 'official_regulator', null, 6, '2026-08-08'),
  ('AU:pharmacist', 'source', 'Australian Pharmacy Council — Accredited Australian pharmacy degree programs', 'https://www.pharmacycouncil.org.au/education-provider/accreditation/pharmacy-degree-programs-australia/accredited-pharmacy-degree-programs/', 'official_accreditation_authority', null, 7, '2026-08-08'),
  ('AU:pharmacist', 'source', 'Pharmacy Board of Australia — Provisional to general registration', 'https://www.pharmacyboard.gov.au/Registration/Provisional-to-General-Registration.aspx', 'official_regulator', null, 8, '2026-08-08'),
  ('AU:pharmacist', 'source', 'Home Affairs — Core Skills Occupation List', 'https://immi.homeaffairs.gov.au/Documents/core-sol.pdf', 'official_visa', null, 9, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:pharmacist', 'au-program:886', 'direct', '2026-08-08'),
  ('AU:pharmacist', 'au-program:1483', 'direct', '2026-08-08'),
  ('AU:pharmacist', 'au-program:19666', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
