-- Australia Network Administrator profile.
-- Exact current mapping: OSCA 272132 Network Administrator.
-- Legacy ANZSCO 263112 Network Administrator remains the migration occupation assessed by ACS.
-- JSA labour-market series are published at broader ANZSCO 2631, so group observations are contextual only.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:network-administrator', 'AU', 'network-administrator', 'Network Administrator',
  'OSCA', '2024 v1.0', '2721', 'AUD', false,
  'Australian Computer Society (ACS) — migration skills assessment only; no statutory national occupational registration',
  'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html',
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
  'AU:network-administrator', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 371.66667, '2026-05-01', -14.89,
  14.77, 25.16, 0, 0, 5, 0, 10, 0, 5, 10, 4, 34,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'CampCareer maps Network Administrator exactly to OSCA 272132 Network Administrator. ABS defines the occupation around installing and maintaining hardware and software, monitoring and optimising network environments and infrastructure, managing network security, troubleshooting incidents and maintaining network documentation.',
    'legacy_mapping', 'Legacy ANZSCO 263112 Network Administrator is the current migration occupation used by the Core Skills Occupation List and ACS. The title and core duties align directly with current OSCA 272132.',
    'broader_anzsco_2631_context', jsonb_build_object(
      'employment_total', 48600,
      'median_weekly_earnings_aud', 2309,
      'median_hourly_earnings_aud', 60,
      'part_time_share_pct', 7,
      'female_share_pct', 19,
      'median_age', 42,
      'average_full_time_hours', 41,
      'scope', 'ANZSCO 2631 Computer Network Professionals; includes Computer Network and Systems Engineer, Network Administrator and Network Analyst'
    ),
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 371.66667 and state vacancy values are published at broader ANZSCO 2631. May 2025 was 436.66667, giving -14.89% year-on-year. Vacancy intensity is not scored because an exact Network Administrator employment denominator is unavailable; the negative broader vacancy trend scores zero.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2631 are +14.77% from May 2025 to May 2030 and +25.16% to May 2035. These values receive only partial growth credit because the group contains multiple network occupations.',
    'shortage_note', 'The JSA 2025 Occupation Shortage List records current OSCA 272132 Network Administrator as No Shortage nationally and in all eight states and territories. The shortage score component is therefore zero.',
    'visa_basis', 'Current Core Skills Occupation List instruments include ANZSCO 263112 Network Administrator with the Australian Computer Society as assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'There is no single statutory national occupational registration or licence to work as a Network Administrator in Australia. ACS migration skills assessment is an immigration and professional-assessment process rather than a domestic licence to practise.',
    'entry_level_basis', 'OSCA assigns Skill Level 1. Direct Bachelor-level networking programs exist, but many Network Administrator roles are reached after help-desk, systems support or junior infrastructure experience and employers commonly value vendor networking certifications and hands-on troubleshooting. Entry-level credit is therefore moderated.',
    'entry_burden_basis', 'OSCA Skill Level 1 corresponds to a Bachelor degree or higher qualification, or at least five years of relevant experience. No additional statutory occupational licence applies.',
    'employer_diversity_basis', 'Curated coverage across telecommunications, banking, government technology, managed services and defence technology; replace with posting-level unique-employer counts when available.',
    'score_note', 'Conservative provisional score. Exact occupation employment, earnings and vacancy intensity are not inferred from broader ANZSCO 2631. The exact 2025 shortage rating is No Shortage, broader vacancies fell year on year, broader long-term growth receives partial credit, and the verified CSOL signal is retained.'
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
  ('AU:network-administrator', '272132', 'Network Administrator', 'ANZSCO', '2022', '263112', null, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/272/2721/272132', '2026-08-08')
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
  ('AU:network-administrator', 'ACT', '2026-05-01', null, 43.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:network-administrator', 'NSW', '2026-05-01', null, 136.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:network-administrator', 'NT', '2026-05-01', null, 3.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:network-administrator', 'QLD', '2026-05-01', null, 50.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:network-administrator', 'SA', '2026-05-01', null, 21, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:network-administrator', 'TAS', '2026-05-01', null, 1.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:network-administrator', 'VIC', '2026-05-01', null, 88, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:network-administrator', 'WA', '2026-05-01', null, 27.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:network-administrator', 'job_search', 'SEEK — Network Administrator jobs', 'https://www.seek.com.au/network-administrator-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:network-administrator', 'job_search', 'Workforce Australia — Network Administrator search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=network%20administrator', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:network-administrator', 'employer', 'Telstra — Careers', 'https://www.telstra.com.au/careers', 'telecommunications', null, 1, '2026-08-08'),
  ('AU:network-administrator', 'employer', 'nbn — Careers', 'https://www.nbnco.com.au/corporate-information/careers', 'telecommunications', null, 2, '2026-08-08'),
  ('AU:network-administrator', 'employer', 'Leidos Australia — Careers', 'https://auscareers.leidos.com/', 'technology_defence', null, 3, '2026-08-08'),
  ('AU:network-administrator', 'employer', 'Datacom — Careers', 'https://careers.datacom.com/', 'technology_services', null, 4, '2026-08-08'),
  ('AU:network-administrator', 'employer', 'Commonwealth Bank — Technology careers', 'https://www.commbank.com.au/about-us/careers/technology.html', 'bank', null, 5, '2026-08-08'),
  ('AU:network-administrator', 'entry_program', 'ACS — IT occupations and ANZSCO codes', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:network-administrator', 'entry_program', 'ACS — Accredited courses', 'https://www.acs.org.au/cpd-education/accredited-courses.html', 'official_professional_body', null, 2, '2026-08-08'),
  ('AU:network-administrator', 'source', 'ABS — OSCA 272132 Network Administrator', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/272/2721/272132', 'official_classification', null, 1, '2026-08-08'),
  ('AU:network-administrator', 'source', 'ACS — Network Administrator ANZSCO 263112', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:network-administrator', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:network-administrator', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:network-administrator', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:network-administrator', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:network-administrator', 'source', 'Home Affairs / legislation — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:network-administrator', 'au-program:7600', 'direct', '2026-08-08'),
  ('AU:network-administrator', 'au-program:18391', 'direct', '2026-08-08'),
  ('AU:network-administrator', 'au-program:4024', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
