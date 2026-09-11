-- Australia Data Engineer profile.
-- Current exact mapping: OSCA 223233 Data Engineer.
-- Data Engineer did not have its own legacy ANZSCO 2022 occupation code.
-- CampCareer's reviewed migration crosswalk associates OSCA 223233 with legacy ANZSCO 261313,
-- while JSA labour-market, vacancy and projection data remain published at broader ANZSCO 2613.
-- Those broader values are retained as context only and are not presented as exact Data Engineer metrics.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:data-engineer', 'AU', 'data-engineer', 'Data Engineer',
  'OSCA', '2024 v1.0', '2232', 'AUD', false,
  'Australian Computer Society (ACS) — migration skills assessment under the applicable ANZSCO occupation; no statutory national Data Engineer registration',
  'https://www.acs.org.au/msa.html',
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
  'AU:data-engineer', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 3392, '2026-05-01', -9.86,
  15.69, 26.67, 0, 0, 5, 0, 10, 0, 5, 10, 4, 34,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'CampCareer maps Data Engineer exactly to OSCA 223233 Data Engineer. ABS defines the occupation around designing, building, operationalising and maintaining systems and processes for storing, transforming and analysing datasets, including data pipelines, ETL processes, scalability and secure data handling.',
    'legacy_mapping', 'Data Engineer did not have a dedicated ANZSCO 2022 six-digit occupation. CampCareer uses the reviewed ABS OSCA correspondence already stored in the Australian occupation model, which associates OSCA 223233 with legacy ANZSCO 261313 Software Engineer for migration-list continuity. This correspondence is not treated as proof that all legacy 261313 labour-market observations describe Data Engineers.',
    'broader_anzsco_2613_context', jsonb_build_object(
      'employment_total', 203200,
      'median_weekly_earnings_aud', 2537,
      'median_hourly_earnings_aud', 67,
      'part_time_share_pct', 6,
      'female_share_pct', 21,
      'median_age', 38,
      'average_full_time_hours', 41,
      'scope', 'ANZSCO 2613 Software and Applications Programmers; broad legacy context only and not an exact Data Engineer series'
    ),
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 3392 and state vacancy values are published on broader legacy ANZSCO 2613. May 2025 was 3763, giving -9.86% year-on-year. Vacancy intensity is not scored because an exact current-OSCA Data Engineer employment denominator is unavailable, and the negative broader vacancy trend scores zero.',
    'projection_scope', 'JSA Employment Projections for broader legacy ANZSCO 2613 are +15.69% from May 2025 to May 2030 and +26.67% to May 2035. These values receive only partial growth credit because ANZSCO 2613 contains several software occupations and is not an exact Data Engineer series.',
    'shortage_note', 'No exact current OSCA 223233 national or state shortage rating has been verified in CampCareer production. The legacy ANZSCO 261313 Software Engineer shortage history is not copied onto Data Engineer because one legacy occupation corresponds to several newly separated OSCA occupations. Shortage rating remains null and the shortage component is zero.',
    'visa_basis', 'CampCareer production contains a reviewed Home Affairs CSOL correspondence from OSCA 223233 to legacy ANZSCO 261313 Software Engineer. The current legal CSOL instrument lists ANZSCO 261313 rather than Data Engineer by title. Visa scoring therefore reflects the reviewed correspondence only and does not imply that a Data Engineer job title automatically satisfies migration requirements; actual duties and the nominated ANZSCO occupation must meet current Home Affairs and ACS requirements.',
    'registration_basis', 'There is no single statutory national occupational registration or licence to work as a Data Engineer in Australia. ACS skills assessment is relevant to migration under applicable ICT occupations but is not a domestic licence to practise.',
    'entry_level_basis', 'OSCA assigns Skill Level 1. Australia has direct Bachelor-level Data Engineering study and postgraduate Data Engineering pathways, but many employers recruit Data Engineers after experience in software, analytics, databases, cloud or platform engineering. Entry-level credit is therefore lower than for broader graduate software or analyst roles.',
    'entry_burden_basis', 'OSCA Skill Level 1 corresponds to a Bachelor degree or higher qualification, or at least five years of relevant experience. No additional statutory occupational licence applies.',
    'employer_diversity_basis', 'Curated coverage across banking, product technology, telecommunications, government and digital platforms; replace with posting-level unique-employer counts when available.',
    'score_note', 'Conservative provisional score. Exact Data Engineer employment, earnings, shortage and vacancy intensity are not inferred from legacy ANZSCO 2613 or 261313. Broader vacancy trend is negative, broader long-term growth receives partial credit, entry-level access is recognised but moderated, and visa credit is based only on CampCareer''s reviewed OSCA-to-CSOL correspondence.'
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
  ('AU:data-engineer', '223233', 'Data Engineer', 'ANZSCO', '2022', '261313', null, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2232/223233', '2026-08-08')
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
  ('AU:data-engineer', 'ACT', '2026-05-01', null, 312, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-engineer', 'NSW', '2026-05-01', null, 1196.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-engineer', 'NT', '2026-05-01', null, 15.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-engineer', 'QLD', '2026-05-01', null, 507, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-engineer', 'SA', '2026-05-01', null, 195.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-engineer', 'TAS', '2026-05-01', null, 24, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-engineer', 'VIC', '2026-05-01', null, 910.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:data-engineer', 'WA', '2026-05-01', null, 231.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:data-engineer', 'job_search', 'SEEK — Data Engineer jobs', 'https://www.seek.com.au/data-engineer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:data-engineer', 'job_search', 'Workforce Australia — Data Engineer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=data%20engineer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:data-engineer', 'employer', 'CommBank — Data & AI careers', 'https://www.commbank.com.au/about-us/careers/data-and-analytics.html', 'bank', null, 1, '2026-08-08'),
  ('AU:data-engineer', 'employer', 'Atlassian — Careers', 'https://www.atlassian.com/company/careers', 'technology_company', null, 2, '2026-08-08'),
  ('AU:data-engineer', 'employer', 'Canva — Careers', 'https://www.lifeatcanva.com/en/jobs/', 'technology_company', null, 3, '2026-08-08'),
  ('AU:data-engineer', 'employer', 'Telstra — Careers', 'https://www.telstra.com.au/careers', 'telecommunications', null, 4, '2026-08-08'),
  ('AU:data-engineer', 'employer', 'Australian Public Service — Data Stream', 'https://content.apsjobs.gov.au/career-pathways/graduate-programs/data-stream', 'government', null, 5, '2026-08-08'),
  ('AU:data-engineer', 'entry_program', 'TAFE NSW — Bachelor of Information Technology (Data Engineering)', 'https://www.tafensw.edu.au/course-areas/information-and-communication-technology/courses/bachelor-of-information-technology-data-engineering--HE20625', 'official_education_provider', null, 1, '2026-08-08'),
  ('AU:data-engineer', 'entry_program', 'ACS — Migration skills assessment', 'https://www.acs.org.au/msa.html', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:data-engineer', 'source', 'ABS — OSCA 223233 Data Engineer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2232/223233', 'official_classification', null, 1, '2026-08-08'),
  ('AU:data-engineer', 'source', 'ABS — OSCA 2232 Data Professionals', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2232', 'official_classification', null, 2, '2026-08-08'),
  ('AU:data-engineer', 'source', 'JSA — ANZSCO 2613 Software and Applications Programmers', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2613-software-and-applications-programmers', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:data-engineer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:data-engineer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:data-engineer', 'source', 'JSA — Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:data-engineer', 'source', 'ACS — IT occupations and ANZSCO codes', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html', 'official_skills_assessment', null, 7, '2026-08-08'),
  ('AU:data-engineer', 'source', 'Home Affairs — Core Skills Occupation List', 'https://immi.homeaffairs.gov.au/Documents/core-sol.pdf', 'official_visa', null, 8, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:data-engineer', 'au-program:18429', 'direct', '2026-08-08'),
  ('AU:data-engineer', 'au-program:8247', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
