-- Australia Industrial Engineer profile.
-- Exact current occupation: OSCA 243531 Industrial Engineer.
-- Legacy ANZSCO 233511 Industrial Engineer is directly title- and scope-aligned and remains the migration occupation assessed by Engineers Australia.
-- JSA provides exact six-digit employment/demographic context for 233511, while earnings, vacancies and projections remain at broader ANZSCO 2335.

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
    reviewer_note = 'Reviewed OSCA 243531 Industrial Engineer correspondence to ANZSCO 233511 Industrial Engineer. The current CSOL includes 233511 and Engineers Australia (EA) is the assessing authority. Manufacturing Engineer remains an official OSCA specialisation rather than a separate migration occupation.'
where osca_code = '243531'
  and anzsco_v13_code = '233511'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

update public.courses_au
set official_course_url = 'https://www.curtin.edu.au/study/offering/course-ug-bachelor-of-engineering-honours--bh-engr/',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where id = 7664
  and institution_id = 'curtin-university'
  and course_code = '072467B';

update public.courses_au
set official_course_url = 'https://www.curtin.edu.au/study/offering/course-pg-master-of-science-industrial-engineering--mc-indeng/',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where id = 7752
  and institution_id = 'curtin-university'
  and course_code = '107627J';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:industrial-engineer', 'AU', 'industrial-engineer', 'Industrial Engineer',
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
  'AU:industrial-engineer', '2026-05-01', 4700, null, null, null,
  1852, 11, 18, 39, 42, 871.33333, '2026-05-01', 7.00,
  12.71, 23.07, 0, 0, 5, 5, 13, 0, 5, 10, 3, 41,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 243531 Industrial Engineer plans, investigates and reviews the logistics and utilisation of personnel, facilities, equipment and materials, operational processes and practices to improve quality, safety and efficiency. ABS assigns Skill Level 1 and lists Integrated Logistics Support Engineer, Manufacturing Engineer, Process Engineer (Industrial), Quality Assurance Engineer (Industrial) and Systems Engineer (Industrial) as specialisations.',
    'legacy_mapping', 'ANZSCO 233511 Industrial Engineer retains the same title and materially aligned professional scope and remains the Engineers Australia migration occupation. This supports use of the JSA six-digit employment and demographic profile as occupation-specific context.',
    'exact_legacy_233511_context', jsonb_build_object(
      'employment_total', 4700,
      'part_time_share_pct', 11,
      'female_share_pct', 18,
      'median_age', 39,
      'average_full_time_hours', 42,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit ANZSCO 233511 Industrial Engineer; directly title- and scope-aligned with current OSCA 243531'
    ),
    'broader_anzsco_2335_context', jsonb_build_object(
      'employment_total', 42500,
      'median_weekly_earnings_aud', 2614,
      'median_hourly_earnings_aud', 67,
      'part_time_share_pct', 8,
      'female_share_pct', 10,
      'median_age', 38,
      'average_full_time_hours', 43,
      'scope', 'ANZSCO 2335 Industrial, Mechanical and Production Engineers; broader than Industrial Engineer'
    ),
    'earnings_scope', 'JSA does not publish six-digit earnings for ANZSCO 233511. Broader ANZSCO 2335 earnings are retained only as context, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 871.33333 and state vacancy values are published at broader ANZSCO 2335. May 2025 was 814.33333, giving about +7.00% year-on-year. Vacancy intensity is not scored because the vacancy numerator is broader than the exact occupation; the positive broader trend receives partial credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2335 are +12.71% from May 2025 to May 2030 and +23.07% to May 2035. These values receive partial growth credit because the group also includes Mechanical Engineer and Production or Plant Engineer.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records Industrial Engineer as No Shortage nationally. ACT, Northern Territory, Queensland and South Australia are rated Shortage, while NSW, Victoria, Western Australia and Tasmania are No Shortage. The national shortage component is therefore zero and regional signals are stored separately.',
    'visa_basis', 'The current Core Skills Occupation List includes ANZSCO 233511 Industrial Engineer with Engineers Australia as the relevant assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'ABS notes registration or licensing may be required. Professional-engineer registration requirements vary by state, territory and engineering service. Engineers Australia migration skills assessment is separate from domestic professional registration.',
    'entry_level_basis', 'Curtin offers a four-year Bachelor of Engineering (Honours) with an Industrial and Systems Engineering major and a two-year Master of Science (Industrial Engineering). The undergraduate major covers manufacturing, quality, systems engineering, operations research, modelling, simulation and optimisation and provides a direct professional-study route.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. Professional engineering practice generally requires a four-year professional engineering qualification or equivalent competency, and state or territory registration can add an additional requirement depending on the role and jurisdiction.',
    'employer_diversity_basis', 'Curated coverage spans engineering consulting, mining and resources, steel and advanced manufacturing, aerospace and defence, and complex operations; replace with posting-level unique-employer counts when available.',
    'score_note', 'Industrial Engineer keeps verified CSOL credit and strong direct-study credit but receives no national shortage points in 2025. Exact employment is retained, exact earnings remain unavailable, broader 2335 vacancy growth and long-run projections receive partial credit, and regional shortage signals are displayed separately.'
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
  'AU:industrial-engineer', '243531', 'Industrial Engineer', 'ANZSCO', '2022', '233511',
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
  ('AU:industrial-engineer', 'ACT', '2026-05-01', 3, 14.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:industrial-engineer', 'NSW', '2026-05-01', null, 232.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:industrial-engineer', 'NT', '2026-05-01', 3, 7.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:industrial-engineer', 'QLD', '2026-05-01', 3, 194, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:industrial-engineer', 'SA', '2026-05-01', 3, 66.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:industrial-engineer', 'TAS', '2026-05-01', null, 12.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:industrial-engineer', 'VIC', '2026-05-01', null, 177.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:industrial-engineer', 'WA', '2026-05-01', null, 166, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:industrial-engineer', 'job_search', 'SEEK — Industrial Engineer jobs', 'https://www.seek.com.au/industrial-engineer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:industrial-engineer', 'job_search', 'Workforce Australia — Industrial Engineer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=industrial%20engineer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:industrial-engineer', 'employer', 'Worley — Careers', 'https://www.worley.com/careers/', 'engineering_energy', null, 1, '2026-08-08'),
  ('AU:industrial-engineer', 'employer', 'BHP — Careers', 'https://www.bhp.com/careers', 'mining_resources', null, 2, '2026-08-08'),
  ('AU:industrial-engineer', 'employer', 'Rio Tinto — Careers', 'https://www.riotinto.com/careers', 'mining_resources', null, 3, '2026-08-08'),
  ('AU:industrial-engineer', 'employer', 'BlueScope — Careers', 'https://www.bluescope.com/careers', 'steel_manufacturing', null, 4, '2026-08-08'),
  ('AU:industrial-engineer', 'employer', 'Boeing Australia — Careers', 'https://www.boeing.com.au/career', 'aerospace_manufacturing', null, 5, '2026-08-08'),
  ('AU:industrial-engineer', 'entry_program', 'Engineers Australia — Accredited engineering programs', 'https://www.engineersaustralia.org.au/publications/engineers-australia-accredited-programs', 'official_accreditation', null, 1, '2026-08-08'),
  ('AU:industrial-engineer', 'entry_program', 'Curtin — Industrial and Systems Engineering Major (BEng Hons)', 'https://www.curtin.edu.au/study/offering/course-ug-industrial-and-systems-engineering-major-beng-hons--mjrh-indenv1/', 'university_program', null, 2, '2026-08-08'),
  ('AU:industrial-engineer', 'entry_program', 'Curtin — Master of Science (Industrial Engineering)', 'https://www.curtin.edu.au/study/offering/course-pg-master-of-science-industrial-engineering--mc-indeng/', 'university_program', null, 3, '2026-08-08'),
  ('AU:industrial-engineer', 'source', 'ABS — OSCA 243531 Industrial Engineer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2435/243531', 'official_classification', null, 1, '2026-08-08'),
  ('AU:industrial-engineer', 'source', 'JSA — Industrial Engineers occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/233511-industrial-engineers', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:industrial-engineer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:industrial-engineer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:industrial-engineer', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:industrial-engineer', 'source', 'Engineers Australia — Accredited engineering programs', 'https://www.engineersaustralia.org.au/publications/engineers-australia-accredited-programs', 'official_accreditation', null, 6, '2026-08-08'),
  ('AU:industrial-engineer', 'source', 'Federal Register — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:industrial-engineer', 'au-program:7664', 'direct', '2026-08-08'),
  ('AU:industrial-engineer', 'au-program:7752', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
