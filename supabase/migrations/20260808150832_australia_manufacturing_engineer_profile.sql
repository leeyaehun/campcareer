-- Australia Manufacturing Engineer profile.
-- Manufacturing Engineer is an official specialisation of current OSCA 243531 Industrial Engineer, not a standalone six-digit OSCA occupation.
-- Legacy ANZSCO 233511 Industrial Engineer remains the migration occupation assessed by Engineers Australia.
-- JSA six-digit employment for 233511 covers the whole Industrial Engineer occupation, so it is contextual rather than exact for the Manufacturing Engineer specialisation.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + current CSOL instrument',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2435/243531',
    last_verified = '2026-08-08',
    anzsco_v13 = '233511'
where anzsco_code = '243531'
  and occupation_en = 'Industrial Engineer';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Manufacturing Engineer is an official specialisation of OSCA 243531 Industrial Engineer. The corresponding migration occupation is ANZSCO 233511 Industrial Engineer, which is on the current CSOL with Engineers Australia (EA) as assessing authority. Actual duties must align with the nominated Industrial Engineer occupation; the Manufacturing Engineer title is not separately listed on the CSOL.'
where osca_code = '243531'
  and anzsco_v13_code = '233511'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:manufacturing-engineer', 'AU', 'manufacturing-engineer', 'Manufacturing Engineer',
  'OSCA', '2024 v1.0', '2435', 'AUD', true,
  'Manufacturing Engineer is an OSCA 243531 Industrial Engineer specialisation; state or territory professional-engineer registration may apply and Engineers Australia (EA) assesses ANZSCO 233511 for migration',
  'https://www.engineersaustralia.org.au/migrants',
  'profile_ready', '2026-08-08', now()
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
  'AU:manufacturing-engineer', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 871.33333, '2026-05-01', 7.00,
  12.71, 23.07, 0, 0, 5, 5, 13, 0, 5, 10, 3, 41,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Manufacturing Engineer is an official specialisation within current OSCA 243531 Industrial Engineer rather than a standalone six-digit occupation. The parent occupation plans, investigates and improves the use of personnel, facilities, equipment, materials and production processes, including production sequencing, cost and risk analysis, quality control, process optimisation and industrial safety. OSCA assigns Skill Level 1.',
    'legacy_mapping', 'ANZSCO 233511 Industrial Engineer is the corresponding migration occupation and is assessed by Engineers Australia. Because Manufacturing Engineer is one specialisation within the broader Industrial Engineer occupation, JSA 233511 labour-market observations are not treated as exact Manufacturing Engineer values.',
    'parent_legacy_233511_context', jsonb_build_object(
      'employment_total', 4700,
      'part_time_share_pct', 11,
      'female_share_pct', 18,
      'median_age', 39,
      'average_full_time_hours', 42,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit ANZSCO 233511 Industrial Engineer; includes Manufacturing Engineer and other industrial-engineering work and is therefore broader than the canonical Manufacturing Engineer specialisation'
    ),
    'broader_anzsco_2335_context', jsonb_build_object(
      'employment_total', 42500,
      'median_weekly_earnings_aud', 2614,
      'median_hourly_earnings_aud', 67,
      'part_time_share_pct', 8,
      'female_share_pct', 10,
      'median_age', 38,
      'average_full_time_hours', 43,
      'scope', 'ANZSCO 2335 Industrial, Mechanical and Production Engineers; substantially broader than Manufacturing Engineer'
    ),
    'earnings_scope', 'No exact Manufacturing Engineer earnings series is available in the current CampCareer official source snapshot. The previous estimated 243531 salary is removed and broader ANZSCO 2335 earnings are retained only as context, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 871.33333 and state vacancy values are published at broader ANZSCO 2335. May 2025 was 814.33333, giving about +7.00% year-on-year. Vacancy intensity is not scored because neither the vacancy numerator nor the parent 233511 employment denominator is exact to the Manufacturing Engineer specialisation; the positive broader trend receives partial credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2335 are +12.71% from May 2025 to May 2030 and +23.07% to May 2035. These values receive partial growth credit because the group also includes Industrial, Mechanical and Production or Plant Engineers.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records parent OSCA 243531 Industrial Engineer as No Shortage nationally. ACT, Northern Territory, Queensland and South Australia are rated Shortage, while NSW, Victoria, Western Australia and Tasmania are No Shortage. As Manufacturing Engineer is an official specialisation of 243531, the parent occupation shortage classification is used; the national shortage component is zero and regional signals are stored separately.',
    'visa_basis', 'The current Core Skills Occupation List includes ANZSCO 233511 Industrial Engineer with Engineers Australia as assessing authority. Manufacturing Engineer is not separately named on the CSOL, so migration relevance depends on the applicant duties and nominated occupation satisfying the Industrial Engineer assessment criteria. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'ABS notes registration or licensing may be required for the parent Industrial Engineer occupation. Professional-engineer registration requirements vary by state, territory and engineering service. Engineers Australia migration skills assessment is separate from domestic professional registration.',
    'entry_level_basis', 'Manufacturing Engineering has direct professional-study pathways through advanced manufacturing, manufacturing engineering, mechatronics and industrial engineering degrees, plus graduate engineering programs in manufacturing and operations. Employers value CAD and design-for-manufacture, automation and robotics, lean and process improvement, quality systems, materials and production experience.',
    'entry_burden_basis', 'The parent OSCA occupation is Skill Level 1. Professional engineering pathways generally require a four-year professional engineering qualification or equivalent competency, and state or territory registration can add requirements depending on the role and jurisdiction.',
    'employer_diversity_basis', 'Curated coverage spans aerospace and defence manufacturing, steel, medical devices, pharmaceuticals and advanced industrial production; replace with posting-level unique-employer counts when available.',
    'score_note', 'Manufacturing Engineer receives no national shortage points in 2025 but retains verified parent Industrial Engineer CSOL credit. Parent 233511 employment and broader 2335 earnings are not presented as exact specialisation values. Positive broader vacancy growth and long-run projections receive partial credit, while direct advanced-manufacturing study pathways support strong entry-level credit.'
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
) values (
  'AU:manufacturing-engineer', '243531', 'Manufacturing Engineer', 'ANZSCO', '2022', '233511',
  null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2435/243531',
  '2026-08-08'
)
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
  ('AU:manufacturing-engineer', 'ACT', '2026-05-01', 3, 14.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:manufacturing-engineer', 'NSW', '2026-05-01', null, 232.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:manufacturing-engineer', 'NT', '2026-05-01', 3, 7.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:manufacturing-engineer', 'QLD', '2026-05-01', 3, 194, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:manufacturing-engineer', 'SA', '2026-05-01', 3, 66.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:manufacturing-engineer', 'TAS', '2026-05-01', null, 12.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:manufacturing-engineer', 'VIC', '2026-05-01', null, 177.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:manufacturing-engineer', 'WA', '2026-05-01', null, 166, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:manufacturing-engineer', 'job_search', 'SEEK — Manufacturing Engineer jobs', 'https://www.seek.com.au/manufacturing-engineer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:manufacturing-engineer', 'job_search', 'Workforce Australia — Manufacturing Engineer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=manufacturing%20engineer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:manufacturing-engineer', 'employer', 'Boeing Australia — Careers', 'https://www.boeing.com.au/career', 'aerospace_manufacturing', null, 1, '2026-08-08'),
  ('AU:manufacturing-engineer', 'employer', 'BlueScope — Careers', 'https://www.bluescope.com/careers', 'steel_manufacturing', null, 2, '2026-08-08'),
  ('AU:manufacturing-engineer', 'employer', 'Cochlear — Careers', 'https://www.cochlear.com/au/en/corporate/careers', 'medical_device_manufacturing', null, 3, '2026-08-08'),
  ('AU:manufacturing-engineer', 'employer', 'BAE Systems Australia — Careers', 'https://www.baesystems.com/en-aus/careers', 'defence_manufacturing', null, 4, '2026-08-08'),
  ('AU:manufacturing-engineer', 'employer', 'CSL — Careers', 'https://www.csl.com/careers', 'biopharmaceutical_manufacturing', null, 5, '2026-08-08'),
  ('AU:manufacturing-engineer', 'entry_program', 'Engineers Australia — Migration pathways', 'https://www.engineersaustralia.org.au/migrants', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:manufacturing-engineer', 'entry_program', 'RMIT — Bachelor of Engineering (Advanced Manufacturing and Mechatronics) (Honours)', 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/honours-degrees/bh068', 'university_program', null, 2, '2026-08-08'),
  ('AU:manufacturing-engineer', 'entry_program', 'La Trobe — Master of Manufacturing Engineering', 'https://www.latrobe.edu.au/courses/master-of-manufacturing-engineering', 'university_program', null, 3, '2026-08-08'),
  ('AU:manufacturing-engineer', 'source', 'ABS — OSCA 243531 Industrial Engineer / Manufacturing Engineer specialisation', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2435/243531', 'official_classification', null, 1, '2026-08-08'),
  ('AU:manufacturing-engineer', 'source', 'Engineers Australia — Migration pathways', 'https://www.engineersaustralia.org.au/migrants', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:manufacturing-engineer', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:manufacturing-engineer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:manufacturing-engineer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:manufacturing-engineer', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:manufacturing-engineer', 'source', 'Home Affairs / legislation — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:manufacturing-engineer', 'au-program:5783', 'direct', '2026-08-08'),
  ('AU:manufacturing-engineer', 'au-program:4587', 'graduate_entry', '2026-08-08'),
  ('AU:manufacturing-engineer', 'au-program:6784', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
