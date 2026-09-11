-- Australia Database Administrator profile.
-- Exact current occupation: OSCA 271231 Database Administrator.
-- Legacy ANZSCO 262111 Database Administrator remains the migration occupation assessed by ACS.
-- JSA provides a six-digit employment profile for 262111, whose scope aligns directly with current OSCA 271231,
-- but earnings, vacancies and projections remain available only at broader ANZSCO 2621 and are treated accordingly.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + reviewed CSOL correspondence',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/271/2712/271231',
    last_verified = '2026-08-08',
    anzsco_v13 = '262111'
where anzsco_code = '271231'
  and occupation_en = 'Database Administrator';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed OSCA 271231 Database Administrator correspondence to ANZSCO 262111 Database Administrator. The current CSOL includes 262111 and ACS is the assessing authority.'
where osca_code = '271231'
  and anzsco_v13_code = '262111'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:database-administrator', 'AU', 'database-administrator', 'Database Administrator',
  'OSCA', '2024 v1.0', '2712', 'AUD', false,
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
  'AU:database-administrator', '2026-05-01', 5900, null, null, null,
  1852, 18, 39, 44, 40, 570, '2026-05-01', -6.56,
  14.01, 24.04, 0, 0, 5, 0, 10, 0, 5, 10, 4, 34,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 271231 Database Administrator plans, designs, configures, maintains and supports database management systems, with responsibility for integrity, security, backup, reliability and performance. Database developers are explicitly excluded and sit under Software Engineer.',
    'legacy_mapping', 'ANZSCO 262111 Database Administrator has the same title and materially aligned scope and remains the ACS migration occupation. This direct correspondence supports use of the JSA six-digit employment and demographic profile as occupation-specific context.',
    'exact_legacy_262111_context', jsonb_build_object(
      'employment_total', 5900,
      'part_time_share_pct', 18,
      'female_share_pct', 39,
      'median_age', 44,
      'average_full_time_hours', 40,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit ANZSCO 262111 Database Administrator; current OSCA correspondence is direct and title-aligned'
    ),
    'earnings_scope', 'JSA does not provide six-digit earnings for ANZSCO 262111 in the current CampCareer source snapshot. Broader ANZSCO 2621 earnings are therefore not presented as Database Administrator earnings and the salary component remains zero.',
    'broader_anzsco_2621_context', jsonb_build_object(
      'employment_total', 72600,
      'median_weekly_earnings_aud', 2461,
      'median_hourly_earnings_aud', 66,
      'scope', 'ANZSCO 2621 Database and Systems Administrators and ICT Security Specialists; substantially broader than Database Administrator'
    ),
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 570 and state vacancy values are published at broader ANZSCO 2621. May 2025 was 610, giving -6.56% year-on-year. Vacancy intensity is not scored because the vacancy numerator is broader than the exact 262111 employment denominator; the negative broader vacancy trend scores zero.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2621 are +14.01% from May 2025 to May 2030 and +24.04% to May 2035. These values receive only partial growth credit because the group contains database, systems-administration and ICT-security occupations.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records current OSCA 271231 Database Administrator as No Shortage nationally. The national shortage score component is therefore zero.',
    'visa_basis', 'Current Core Skills Occupation List data includes ANZSCO 262111 Database Administrator with the Australian Computer Society as assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'There is no single statutory national occupational registration or licence to work as a Database Administrator in Australia. ACS migration skills assessment is an immigration and professional-assessment process rather than a domestic licence to practise.',
    'entry_level_basis', 'OSCA assigns Skill Level 1. Bachelor-level IT, computer science and information-systems programs provide entry foundations, but employers often value practical SQL, database design, backup and recovery, Linux or Windows administration, cloud database services and platform-specific database experience. Entry-level credit is therefore moderated.',
    'entry_burden_basis', 'OSCA Skill Level 1 corresponds to a Bachelor degree or higher qualification, or at least five years of relevant experience. No additional statutory occupational licence applies.',
    'employer_diversity_basis', 'Curated coverage across banking, telecommunications, managed technology services, consulting and government-facing technology; replace with posting-level unique-employer counts when available.',
    'score_note', 'Conservative provisional score. Exact six-digit employment can be retained because the legacy/current scope aligns, but exact earnings are unavailable and broader 2621 vacancies and projections are not treated as exact Database Administrator observations. The 2025 national shortage result is No Shortage and the verified CSOL signal is retained.'
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
  ('AU:database-administrator', '271231', 'Database Administrator', 'ANZSCO', '2022', '262111', null, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/271/2712/271231', '2026-08-08')
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
  ('AU:database-administrator', 'ACT', '2026-05-01', null, 59.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:database-administrator', 'NSW', '2026-05-01', null, 168, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:database-administrator', 'NT', '2026-05-01', null, 5.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:database-administrator', 'QLD', '2026-05-01', null, 109.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:database-administrator', 'SA', '2026-05-01', null, 38.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:database-administrator', 'TAS', '2026-05-01', null, 5.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:database-administrator', 'VIC', '2026-05-01', null, 130, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:database-administrator', 'WA', '2026-05-01', null, 53, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:database-administrator', 'job_search', 'SEEK — Database Administrator jobs', 'https://www.seek.com.au/database-administrator-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:database-administrator', 'job_search', 'Workforce Australia — Database Administrator search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=database%20administrator', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:database-administrator', 'employer', 'Commonwealth Bank — Technology careers', 'https://www.commbank.com.au/about-us/careers/technology.html', 'bank', null, 1, '2026-08-08'),
  ('AU:database-administrator', 'employer', 'Telstra — Careers', 'https://www.telstra.com.au/careers', 'telecommunications', null, 2, '2026-08-08'),
  ('AU:database-administrator', 'employer', 'Datacom — Careers', 'https://careers.datacom.com/', 'technology_services', null, 3, '2026-08-08'),
  ('AU:database-administrator', 'employer', 'DXC Technology Australia — Careers', 'https://careers.dxc.com/', 'technology_services', null, 4, '2026-08-08'),
  ('AU:database-administrator', 'employer', 'Accenture Australia — Careers', 'https://www.accenture.com/au-en/careers', 'consulting', null, 5, '2026-08-08'),
  ('AU:database-administrator', 'entry_program', 'ACS — IT occupations and ANZSCO codes', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:database-administrator', 'entry_program', 'ACS — Accredited courses', 'https://www.acs.org.au/cpd-education/accredited-courses.html', 'official_professional_body', null, 2, '2026-08-08'),
  ('AU:database-administrator', 'source', 'ABS — OSCA 271231 Database Administrator', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/271/2712/271231', 'official_classification', null, 1, '2026-08-08'),
  ('AU:database-administrator', 'source', 'ACS — Database Administrator ANZSCO 262111', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:database-administrator', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:database-administrator', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:database-administrator', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:database-administrator', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:database-administrator', 'source', 'Home Affairs / legislation — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:database-administrator', 'au-program:3843', 'direct', '2026-08-08'),
  ('AU:database-administrator', 'au-program:257', 'graduate_entry', '2026-08-08'),
  ('AU:database-administrator', 'au-program:4678', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
