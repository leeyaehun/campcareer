-- Australia Mechanical Engineer profile.
-- Exact current occupation: OSCA 243532 Mechanical Engineer.
-- Legacy ANZSCO 233512 Mechanical Engineer is directly title- and scope-aligned and remains the migration occupation assessed by Engineers Australia.
-- JSA provides exact six-digit employment/demographic context for 233512, while earnings, vacancies and projections remain at broader ANZSCO 2335.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + current CSOL instrument',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2435/243532',
    last_verified = '2026-08-08',
    anzsco_v13 = '233512'
where anzsco_code = '243532'
  and occupation_en = 'Mechanical Engineer';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed OSCA 243532 Mechanical Engineer correspondence to ANZSCO 233512 Mechanical Engineer. The current CSOL includes 233512 and Engineers Australia (EA) is the assessing authority.'
where osca_code = '243532'
  and anzsco_v13_code = '233512'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:mechanical-engineer', 'AU', 'mechanical-engineer', 'Mechanical Engineer',
  'OSCA', '2024 v1.0', '2435', 'AUD', true,
  'State or territory professional-engineer registration may apply; Engineers Australia (EA) is the migration skills assessing authority',
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
  'AU:mechanical-engineer', '2026-05-01', 22900, null, null, null,
  1852, 10, 7, 38, 43, 871.33333, '2026-05-01', 7.00,
  12.71, 23.07, 0, 0, 5, 5, 13, 0, 5, 10, 3, 41,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 243532 Mechanical Engineer plans, designs, develops, tests and oversees the manufacture, operation, maintenance and installation of mechanical systems. ABS assigns Skill Level 1 and lists building services, HVAC and hydraulic mechanical engineering as specialisations.',
    'legacy_mapping', 'ANZSCO 233512 Mechanical Engineer retains the same title and materially aligned professional scope and remains the Engineers Australia migration occupation. This supports use of the JSA six-digit employment and demographic profile as occupation-specific context.',
    'exact_legacy_233512_context', jsonb_build_object(
      'employment_total', 22900,
      'part_time_share_pct', 10,
      'female_share_pct', 7,
      'median_age', 38,
      'average_full_time_hours', 43,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit ANZSCO 233512 Mechanical Engineer; directly title- and scope-aligned with current OSCA 243532'
    ),
    'broader_anzsco_2335_context', jsonb_build_object(
      'employment_total', 42500,
      'median_weekly_earnings_aud', 2614,
      'median_hourly_earnings_aud', 67,
      'part_time_share_pct', 8,
      'female_share_pct', 10,
      'median_age', 38,
      'average_full_time_hours', 43,
      'scope', 'ANZSCO 2335 Industrial, Mechanical and Production Engineers; broader than Mechanical Engineer'
    ),
    'earnings_scope', 'JSA does not provide six-digit earnings for ANZSCO 233512 in the current CampCareer source snapshot. The previous estimated salary is removed and broader ANZSCO 2335 earnings are retained only as context, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 871.33333 and state vacancy values are published at broader ANZSCO 2335. May 2025 was 814.33333, giving about +7.00% year-on-year. Vacancy intensity is not scored because the vacancy numerator is broader than the exact occupation; the positive broader trend receives partial credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2335 are +12.71% from May 2025 to May 2030 and +23.07% to May 2035. These values receive partial growth credit because the group also includes Industrial Engineer and Production or Plant Engineer.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records Mechanical Engineer as No Shortage nationally. NT, South Australia and Western Australia are rated Shortage, while ACT, NSW, Queensland, Tasmania and Victoria are No Shortage. The national shortage component is therefore zero and regional signals are stored separately.',
    'visa_basis', 'The current Core Skills Occupation List includes ANZSCO 233512 Mechanical Engineer with Engineers Australia as the relevant assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'ABS notes registration or licensing may be required. Professional-engineer registration requirements vary by state, territory and engineering service. Engineers Australia migration skills assessment is separate from domestic professional registration.',
    'entry_level_basis', 'Mechanical Engineering has clear professional-degree and graduate-engineer pathways. Four-year accredited bachelor programs and professional postgraduate programs provide direct entry foundations, while placements, design projects, CAD, thermofluids, mechanics and manufacturing experience improve graduate competitiveness.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. Professional engineering practice generally requires a four-year professional engineering qualification or equivalent competency, and state or territory registration can add an additional requirement depending on the role and jurisdiction.',
    'employer_diversity_basis', 'Curated coverage spans engineering consulting, mining and resources, manufacturing, energy and major industrial employers; replace with posting-level unique-employer counts when available.',
    'score_note', 'Mechanical Engineer keeps verified CSOL credit and strong entry-pathway credit but receives no national shortage points in 2025. Exact employment is retained, exact earnings remain unavailable, broader 2335 vacancy growth and long-run projections receive partial credit, and regional shortage signals are displayed separately.'
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
  'AU:mechanical-engineer', '243532', 'Mechanical Engineer', 'ANZSCO', '2022', '233512',
  null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2435/243532',
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
  ('AU:mechanical-engineer', 'ACT', '2026-05-01', null, 14.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:mechanical-engineer', 'NSW', '2026-05-01', null, 232.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:mechanical-engineer', 'NT', '2026-05-01', 3, 7.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:mechanical-engineer', 'QLD', '2026-05-01', null, 194, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:mechanical-engineer', 'SA', '2026-05-01', 3, 66.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:mechanical-engineer', 'TAS', '2026-05-01', null, 12.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:mechanical-engineer', 'VIC', '2026-05-01', null, 177.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:mechanical-engineer', 'WA', '2026-05-01', 3, 166, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:mechanical-engineer', 'job_search', 'SEEK — Mechanical Engineer jobs', 'https://www.seek.com.au/mechanical-engineer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:mechanical-engineer', 'job_search', 'Workforce Australia — Mechanical Engineer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=mechanical%20engineer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:mechanical-engineer', 'employer', 'Worley — Careers', 'https://www.worley.com/careers/', 'engineering_energy', null, 1, '2026-08-08'),
  ('AU:mechanical-engineer', 'employer', 'GHD — Careers', 'https://www.ghd.com/en/careers', 'engineering_consulting', null, 2, '2026-08-08'),
  ('AU:mechanical-engineer', 'employer', 'BHP — Careers', 'https://www.bhp.com/careers', 'mining_resources', null, 3, '2026-08-08'),
  ('AU:mechanical-engineer', 'employer', 'Rio Tinto — Careers', 'https://www.riotinto.com/careers', 'mining_resources', null, 4, '2026-08-08'),
  ('AU:mechanical-engineer', 'employer', 'Aurecon — Careers', 'https://www.aurecongroup.com/careers', 'engineering_consulting', null, 5, '2026-08-08'),
  ('AU:mechanical-engineer', 'entry_program', 'Engineers Australia — Migration pathways', 'https://www.engineersaustralia.org.au/migrants', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:mechanical-engineer', 'entry_program', 'RMIT — Bachelor of Engineering (Mechanical Engineering) (Honours)', 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/honours-degrees/bh070', 'university_program', null, 2, '2026-08-08'),
  ('AU:mechanical-engineer', 'entry_program', 'University of Queensland — Master of Mechanical Engineering (Professional)', 'https://study.uq.edu.au/study-options/programs/master-mechanical-engineering-professional-5746?year=2026', 'university_program', null, 3, '2026-08-08'),
  ('AU:mechanical-engineer', 'source', 'ABS — OSCA 243532 Mechanical Engineer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2435/243532', 'official_classification', null, 1, '2026-08-08'),
  ('AU:mechanical-engineer', 'source', 'Engineers Australia — Migration pathways', 'https://www.engineersaustralia.org.au/migrants', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:mechanical-engineer', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:mechanical-engineer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:mechanical-engineer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:mechanical-engineer', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:mechanical-engineer', 'source', 'Federal Register — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:mechanical-engineer', 'au-program:5785', 'direct', '2026-08-08'),
  ('AU:mechanical-engineer', 'au-program:1612', 'graduate_entry', '2026-08-08'),
  ('AU:mechanical-engineer', 'au-program:4970', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
