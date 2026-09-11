-- Australia Data Analyst profile.
-- Current exact mapping: OSCA 223231 Data Analyst.
-- Legacy ANZSCO 224114 Data Analyst has the same occupation title and closely aligned task scope.
-- JSA labour-market, vacancy and projection series are published at broader ANZSCO 2241,
-- so exact current-occupation employment and earnings are not reconstructed from group data.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:data-analyst', 'AU', 'data-analyst', 'Data Analyst',
  'OSCA', '2024 v1.0', '2232', 'AUD', false,
  'Australian Computer Society (ACS) — migration skills assessment only; no statutory national occupational registration',
  'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/data-science.html',
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
  'AU:data-analyst', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 148.66667, '2026-05-01', -22.03,
  16.08, 27.51, 0, 0, 5, 0, 13, 0, 5, 10, 4, 37,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'CampCareer maps Data Analyst exactly to OSCA 223231 Data Analyst. OSCA defines the role around collecting, processing, analysing and interpreting data and communicating findings through reports and visualisations.',
    'legacy_mapping', 'Legacy ANZSCO 2022 occupation 224114 Data Analyst is the direct predecessor used by current migration instruments and ACS. The title and core duty scope align closely with current OSCA 223231.',
    'broader_anzsco_2241_context', jsonb_build_object(
      'employment_total', 12600,
      'median_weekly_earnings_aud', 2072,
      'median_hourly_earnings_aud', 56,
      'part_time_share_pct', 17,
      'female_share_pct', 49,
      'median_age', 38,
      'average_full_time_hours', 42,
      'scope', 'ANZSCO 2241 Mathematical Science Professionals; includes Actuary, Mathematician, Data Analyst, Data Scientist and Statistician'
    ),
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 148.66667 and state vacancy values are published on broader ANZSCO 2241. May 2025 was 190.66667, giving -22.03% year-on-year. Vacancy intensity is not scored because an exact Data Analyst employment denominator is unavailable; the negative broader vacancy trend scores zero.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2241 are +16.08% from May 2025 to May 2030 and +27.51% to May 2035. These are retained with partial growth credit because the series includes several mathematical-science occupations beyond Data Analyst.',
    'shortage_note', 'Published 2025 Occupation Shortage List tables record legacy ANZSCO 224114 Data Analyst as No Shortage nationally and in all eight states and territories. CampCareer has not yet ingested the exact 224114 shortage row into occupation_state_au, so specialisation and regional shortage_rating fields remain null while the shortage score component is zero.',
    'visa_basis', 'Current Core Skills Occupation List instruments include ANZSCO 224114 Data Analyst with the Australian Computer Society as assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'There is no single statutory national occupational registration or licence to work as a Data Analyst in Australia. ACS migration skills assessment is an immigration/professional assessment process, not a domestic licence to practise.',
    'entry_level_basis', 'OSCA assigns Skill Level 1 and Australian universities offer Bachelor and postgraduate analytics pathways. Graduate-entry opportunities also exist through employers and the APS Data Stream, but entry-level analytics recruitment is competitive and practical SQL, statistics, visualisation, communication and project evidence remain important.',
    'entry_burden_basis', 'OSCA Skill Level 1 corresponds to a Bachelor degree or higher qualification, or at least five years of relevant experience. No additional statutory occupational licence applies.',
    'employer_diversity_basis', 'Curated current coverage across banking, technology, retail, telecommunications and the Australian Public Service; replace with posting-level unique-employer counts when available.',
    'score_note', 'Conservative provisional score. Exact Data Analyst employment and earnings are not inferred from broader ANZSCO 2241, vacancy intensity and salary therefore score zero, the broader vacancy trend is negative, broader growth receives only partial credit, 2025 is not a shortage occupation, and the verified CSOL signal is retained.'
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
  ('AU:data-analyst', '223231', 'Data Analyst', 'ANZSCO', '2022', '224114', null, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2232/223231', '2026-08-08')
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
  ('AU:data-analyst', 'ACT', '2026-05-01', null, 2.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-analyst', 'NSW', '2026-05-01', null, 66.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-analyst', 'NT', '2026-05-01', null, 0, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-analyst', 'QLD', '2026-05-01', null, 16.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-analyst', 'SA', '2026-05-01', null, 5.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-analyst', 'TAS', '2026-05-01', null, 0.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-analyst', 'VIC', '2026-05-01', null, 50, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-analyst', 'WA', '2026-05-01', null, 7.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:data-analyst', 'job_search', 'SEEK — Data Analyst jobs', 'https://www.seek.com.au/data-analyst-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:data-analyst', 'job_search', 'Workforce Australia — Data Analyst search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=data%20analyst', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:data-analyst', 'employer', 'CommBank — Data & AI careers', 'https://www.commbank.com.au/about-us/careers/data-and-analytics.html', 'bank', null, 1, '2026-08-08'),
  ('AU:data-analyst', 'employer', 'Atlassian — Analytics & Data Science teams', 'https://www.atlassian.com/company/careers/teams', 'technology_company', null, 2, '2026-08-08'),
  ('AU:data-analyst', 'employer', 'Woolworths Group — Careers', 'https://careers.woolworthsgroup.com.au/', 'retail_group', null, 3, '2026-08-08'),
  ('AU:data-analyst', 'employer', 'Telstra — Careers', 'https://www.telstra.com.au/careers/our-teams', 'telecommunications', null, 4, '2026-08-08'),
  ('AU:data-analyst', 'employer', 'Australian Public Service — Data Stream', 'https://content.apsjobs.gov.au/career-pathways/graduate-programs/data-stream', 'government', null, 5, '2026-08-08'),
  ('AU:data-analyst', 'entry_program', 'ACS — Data Science occupations and ANZSCO codes', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/data-science.html', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:data-analyst', 'entry_program', 'ACS — Accredited courses', 'https://www.acs.org.au/cpd-education/accredited-courses.html', 'official_professional_body', null, 2, '2026-08-08'),
  ('AU:data-analyst', 'source', 'ABS — OSCA 223231 Data Analyst', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2232/223231', 'official_classification', null, 1, '2026-08-08'),
  ('AU:data-analyst', 'source', 'ABS — ANZSCO 2241 Mathematical Science Professionals', 'https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/2/22/224/2241', 'official_classification', null, 2, '2026-08-08'),
  ('AU:data-analyst', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:data-analyst', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:data-analyst', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:data-analyst', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:data-analyst', 'source', 'ACS — Data Analyst occupation', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/data-science.html', 'official_skills_assessment', null, 7, '2026-08-08'),
  ('AU:data-analyst', 'source', 'Home Affairs — Core Skills Occupation List', 'https://immi.homeaffairs.gov.au/Documents/core-sol.pdf', 'official_visa', null, 8, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:data-analyst', 'au-program:5332', 'direct', '2026-08-08'),
  ('AU:data-analyst', 'au-program:93', 'direct', '2026-08-08'),
  ('AU:data-analyst', 'au-program:6748', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
