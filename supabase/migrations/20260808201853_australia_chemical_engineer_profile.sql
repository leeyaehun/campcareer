-- Australia Chemical Engineer profile.
-- Exact current occupation: OSCA 243131 Chemical Engineer.
-- Legacy ANZSCO 233111 Chemical Engineer is directly title- and scope-aligned and remains the migration occupation assessed by Engineers Australia.
-- JSA provides exact six-digit employment/demographic context for 233111, while earnings, vacancies and projections remain at broader ANZSCO 2331.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + current CSOL instrument',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2431/243131',
    last_verified = '2026-08-08',
    anzsco_v13 = '233111'
where anzsco_code = '243131'
  and occupation_en = 'Chemical Engineer';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed OSCA 243131 Chemical Engineer correspondence to ANZSCO 233111 Chemical Engineer. The current CSOL includes 233111 and Engineers Australia (EA) is the assessing authority.'
where osca_code = '243131'
  and anzsco_v13_code = '233111'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

update public.courses_au
set official_course_url = 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/honours-degrees/bachelor-of-engineering-chemical-engineering-honours-bh079',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where id = 5791
  and institution_id = 'rmit-university'
  and course_code = '110997A';

update public.courses_au
set official_course_url = 'https://study.uq.edu.au/study-options/programs/master-chemical-engineering-professional-5742?year=2026',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where id = 1608
  and institution_id = 'the-university-of-queensland'
  and course_code = '108878D';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:chemical-engineer', 'AU', 'chemical-engineer', 'Chemical Engineer',
  'OSCA', '2024 v1.0', '2431', 'AUD', true,
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
  'AU:chemical-engineer', '2026-05-01', 3100, null, null, null,
  1852, 13, 23, 38, 43, 37.66667, '2026-05-01', -24.16,
  13.15, 23.18, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 243131 Chemical Engineer designs and develops chemical process systems, equipment and specifications for chemical plants and commercial-scale production, including transportation of chemicals, materials and energy. ABS assigns Skill Level 1 and lists Process Control Engineer and Process Engineer (Chemical) as specialisations.',
    'legacy_mapping', 'ANZSCO 233111 Chemical Engineer retains the same title and materially aligned professional scope and remains the Engineers Australia migration occupation. This supports use of the JSA six-digit employment and demographic profile as occupation-specific context.',
    'exact_legacy_233111_context', jsonb_build_object(
      'employment_total', 3100,
      'part_time_share_pct', 13,
      'female_share_pct', 23,
      'median_age', 38,
      'average_full_time_hours', 43,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit ANZSCO 233111 Chemical Engineer; directly title- and scope-aligned with current OSCA 243131'
    ),
    'broader_anzsco_2331_context', jsonb_build_object(
      'employment_total', 6700,
      'median_weekly_earnings_aud', 2849,
      'median_hourly_earnings_aud', 75,
      'part_time_share_pct', 12,
      'female_share_pct', 37,
      'median_age', 34,
      'average_full_time_hours', 42,
      'scope', 'ANZSCO 2331 Chemical and Materials Engineers; broader than Chemical Engineer'
    ),
    'earnings_scope', 'JSA does not publish six-digit earnings for ANZSCO 233111. The previous estimated Chemical Engineer salary is removed. Broader ANZSCO 2331 earnings are retained only as context, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 37.66667 and state vacancy values are published at broader ANZSCO 2331. May 2025 was 49.66667, giving about -24.16% year-on-year. Vacancy intensity is not scored because the vacancy numerator is broader than the exact occupation, and the negative broader trend receives no vacancy-trend credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2331 are +13.15% from May 2025 to May 2030 and +23.18% to May 2035. These values receive partial growth credit because the group also includes Materials Engineer.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records Chemical Engineer as No Shortage nationally. Northern Territory and Queensland are rated Shortage, while ACT, NSW, Victoria, South Australia, Western Australia and Tasmania are No Shortage. The national shortage component is therefore zero and regional signals are stored separately.',
    'visa_basis', 'The current Core Skills Occupation List includes ANZSCO 233111 Chemical Engineer with Engineers Australia as the relevant assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'ABS notes registration or licensing may be required. Professional-engineer registration requirements vary by state, territory and engineering service. Engineers Australia migration skills assessment is separate from domestic professional registration.',
    'entry_level_basis', 'RMIT offers a four-year Bachelor of Engineering (Chemical Engineering) (Honours) that is fully accredited by Engineers Australia, and UQ offers a two-year Master of Chemical Engineering (Professional) accredited by Engineers Australia for suitable graduates. These provide direct professional-study and postgraduate pathways supported by process design, plant, safety and industry experience.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. Professional engineering practice generally requires a four-year professional engineering qualification or equivalent competency, and state or territory registration can add an additional requirement depending on the role and jurisdiction.',
    'employer_diversity_basis', 'Curated coverage spans chemicals and explosives, engineering and energy consulting, biopharmaceutical manufacturing, mining and resources, and large-scale process operations; replace with posting-level unique-employer counts when available.',
    'score_note', 'Chemical Engineer keeps verified CSOL credit and strong accredited-study credit but receives no national shortage points in 2025. Exact employment is retained, exact earnings remain unavailable, broader 2331 vacancies fell year on year and receive no trend credit, long-run projections receive partial growth credit, and NT and Queensland shortage signals are displayed separately.'
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
  'AU:chemical-engineer', '243131', 'Chemical Engineer', 'ANZSCO', '2022', '233111',
  null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2431/243131',
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
  ('AU:chemical-engineer', 'ACT', '2026-05-01', null, 0.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:chemical-engineer', 'NSW', '2026-05-01', null, 8.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:chemical-engineer', 'NT', '2026-05-01', 3, 1.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:chemical-engineer', 'QLD', '2026-05-01', 3, 4.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:chemical-engineer', 'SA', '2026-05-01', null, 5.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:chemical-engineer', 'TAS', '2026-05-01', null, 0, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:chemical-engineer', 'VIC', '2026-05-01', null, 10, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:chemical-engineer', 'WA', '2026-05-01', null, 7.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:chemical-engineer', 'job_search', 'SEEK — Chemical Engineer jobs', 'https://www.seek.com.au/chemical-engineer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:chemical-engineer', 'job_search', 'Workforce Australia — Chemical Engineer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=chemical%20engineer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:chemical-engineer', 'employer', 'Orica — Careers', 'https://careers.orica.com/', 'chemicals_mining_services', null, 1, '2026-08-08'),
  ('AU:chemical-engineer', 'employer', 'Worley — Careers', 'https://www.worley.com/en/careers/', 'engineering_energy', null, 2, '2026-08-08'),
  ('AU:chemical-engineer', 'employer', 'CSL — Careers', 'https://www.csl.com/careers', 'biopharmaceutical_manufacturing', null, 3, '2026-08-08'),
  ('AU:chemical-engineer', 'employer', 'Rio Tinto — Careers', 'https://www.riotinto.com/careers', 'mining_resources', null, 4, '2026-08-08'),
  ('AU:chemical-engineer', 'employer', 'BHP — Careers', 'https://www.bhp.com/careers', 'mining_resources', null, 5, '2026-08-08'),
  ('AU:chemical-engineer', 'entry_program', 'Engineers Australia — Accredited engineering programs', 'https://www.engineersaustralia.org.au/publications/engineers-australia-accredited-programs', 'official_accreditation', null, 1, '2026-08-08'),
  ('AU:chemical-engineer', 'entry_program', 'RMIT — Bachelor of Engineering (Chemical Engineering) (Honours)', 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/honours-degrees/bachelor-of-engineering-chemical-engineering-honours-bh079', 'university_program', null, 2, '2026-08-08'),
  ('AU:chemical-engineer', 'entry_program', 'UQ — Master of Chemical Engineering (Professional)', 'https://study.uq.edu.au/study-options/programs/master-chemical-engineering-professional-5742?year=2026', 'university_program', null, 3, '2026-08-08'),
  ('AU:chemical-engineer', 'source', 'ABS — OSCA 243131 Chemical Engineer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2431/243131', 'official_classification', null, 1, '2026-08-08'),
  ('AU:chemical-engineer', 'source', 'Engineers Australia — Migration pathways', 'https://www.engineersaustralia.org.au/migrants', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:chemical-engineer', 'source', 'JSA — Chemical Engineers occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/233111-chemical-engineers', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:chemical-engineer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:chemical-engineer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:chemical-engineer', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:chemical-engineer', 'source', 'Federal Register — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:chemical-engineer', 'au-program:5791', 'direct', '2026-08-08'),
  ('AU:chemical-engineer', 'au-program:1608', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;
;
