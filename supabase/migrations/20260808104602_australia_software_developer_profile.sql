-- Australia Software Developer / Software Engineer profile.
-- Current exact career mapping: OSCA 273333 Software Engineer.
-- JSA still publishes labour-market, vacancy and projection series on legacy ANZSCO.
-- Those legacy series are retained only as explicitly broader context because the
-- ANZSCO-to-OSCA correspondence is not one-to-one for the current Software Engineer scope.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:software-developer', 'AU', 'software-developer', 'Software Engineer',
  'OSCA', '2024 v1.0', '2733', 'AUD', false,
  'Australian Computer Society (ACS) — migration skills assessment only; no statutory national occupational registration',
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
  'AU:software-developer', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 3392, '2026-05-01', -9.86,
  15.69, 26.67, 0, 0, 5, 0, 13, 0, 5, 10, 4, 37,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'CampCareer maps Software Developer exactly to OSCA 273333 Software Engineer. ABS lists Analyst Programmer, Developer Programmer and Software Developer as alternative titles and places Cloud Engineer and DevOps Engineer in separate OSCA occupations 273331 and 273332.',
    'legacy_correspondence_caveat', 'Legacy ANZSCO is not treated as a one-to-one current mapping. Current OSCA 273333 consolidates titles that previously appeared under multiple ANZSCO occupations, while legacy Software Engineer work also intersects with newly separated cloud, DevOps, data and cyber occupations. Exact current-OSCA employment and earnings are therefore left null rather than reconstructed from legacy rows.',
    'broader_anzsco_2613_context', jsonb_build_object(
      'employment_total', 203200,
      'median_weekly_earnings_aud', 2537,
      'median_hourly_earnings_aud', 67,
      'part_time_share_pct', 6,
      'female_share_pct', 21,
      'median_age', 38,
      'average_full_time_hours', 41,
      'scope', 'ANZSCO 2613 Software and Applications Programmers; broader legacy labour-market context only'
    ),
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 3392 and state vacancy values are published on broader legacy ANZSCO 2613. May 2025 was 3763, giving -9.86% year-on-year. Vacancy intensity is not scored because an exact current-OSCA employment denominator is unavailable; the negative broader vacancy trend scores zero.',
    'projection_scope', 'JSA Employment Projections for legacy ANZSCO 2613 are +15.69% from May 2025 to May 2030 and +26.67% to May 2035. These are retained with partial growth credit only because the series is broader than current OSCA 273333.',
    'shortage_note', 'The 2025 Skills in Demand report records legacy ANZSCO 261313 Software Engineer as S, S, NS across the 2023, 2024 and 2025 national Occupation Shortage List ratings. The current national shortage component is therefore zero, and no exact OSCA 273333 state shortage rating is inferred.',
    'visa_basis', 'Software Engineer remains represented on the Home Affairs Core Skills Occupation List through the current migration classification framework, with ACS as the ICT assessing authority. Occupation-list inclusion does not determine an individual visa outcome.',
    'registration_basis', 'Software engineering is not subject to a single statutory national occupational registration or licence in Australia. ACS migration skills assessment is an immigration/professional assessment process, not permission to practise domestically.',
    'entry_level_basis', 'Current ACS-accredited Bachelor and postgraduate software-engineering pathways exist, and major technology and telecommunications employers operate graduate or early-career pathways. The occupation nevertheless remains Skill Level 1 and employers commonly assess programming fundamentals, projects, internships and practical engineering skills.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1: a Bachelor degree or higher qualification, or at least five years of relevant experience. There is no additional statutory occupational licence.',
    'employer_diversity_basis', 'Curated current coverage across product technology, banking, telecommunications and digital property employers; replace with posting-level unique-employer counts when available.',
    'score_note', 'Conservative provisional score. Exact current OSCA employment, earnings and vacancy intensity are deliberately not fabricated from legacy ANZSCO data. Broader 2613 vacancy and growth series are shown with provenance, 2025 is not a national shortage for legacy Software Engineer, and the verified CSOL signal is retained.'
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
  ('AU:software-developer', '273333', 'Software Engineer', null, null, null, null, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/273/2733/273333', '2026-08-08')
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
  ('AU:software-developer', 'ACT', '2026-05-01', null, 312, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:software-developer', 'NSW', '2026-05-01', null, 1196.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:software-developer', 'NT', '2026-05-01', null, 15.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:software-developer', 'QLD', '2026-05-01', null, 507, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:software-developer', 'SA', '2026-05-01', null, 195.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:software-developer', 'TAS', '2026-05-01', null, 24, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:software-developer', 'VIC', '2026-05-01', null, 910.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:software-developer', 'WA', '2026-05-01', null, 231.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:software-developer', 'job_search', 'SEEK — Software Engineer jobs', 'https://www.seek.com.au/software-engineer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:software-developer', 'job_search', 'Workforce Australia — Software Engineer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=software%20engineer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:software-developer', 'employer', 'Atlassian — Careers', 'https://www.atlassian.com/company/careers', 'technology_product_company', null, 1, '2026-08-08'),
  ('AU:software-developer', 'employer', 'Canva — Careers', 'https://www.lifeatcanva.com/en/', 'technology_product_company', null, 2, '2026-08-08'),
  ('AU:software-developer', 'employer', 'Commonwealth Bank — Engineering careers', 'https://www.commbank.com.au/about-us/careers/engineering.html', 'bank_technology', null, 3, '2026-08-08'),
  ('AU:software-developer', 'employer', 'Telstra — Graduate and intern pathways', 'https://www.telstra.com.au/careers/students-and-graduates/telstra-graduate-program/graduate-and-intern-pathways', 'telecommunications', null, 4, '2026-08-08'),
  ('AU:software-developer', 'employer', 'REA Group — Technology careers', 'https://www.rea-group.com/careers/teams/technology/', 'digital_product_company', null, 5, '2026-08-08'),
  ('AU:software-developer', 'entry_program', 'ACS — Accredited courses', 'https://www.acs.org.au/cpd-education/accredited-courses.html', 'professional_accreditation', null, 1, '2026-08-08'),
  ('AU:software-developer', 'entry_program', 'ACS — Migration skills assessment', 'https://www.acs.org.au/msa.html', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:software-developer', 'source', 'ABS — OSCA 273333 Software Engineer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/273/2733/273333', 'official_classification', null, 1, '2026-08-08'),
  ('AU:software-developer', 'source', 'JSA — Software and Applications Programmers profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2613-software-and-applications-programmers', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:software-developer', 'source', 'JSA — Legacy Software Engineers profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/261313-software-engineers', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:software-developer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:software-developer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:software-developer', 'source', 'JSA — Occupation Shortage', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:software-developer', 'source', 'ACS — IT occupations and ANZSCO codes', 'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html', 'official_skills_assessment', null, 7, '2026-08-08'),
  ('AU:software-developer', 'source', 'ACS — Accredited courses', 'https://www.acs.org.au/cpd-education/accredited-courses.html', 'professional_accreditation', null, 8, '2026-08-08'),
  ('AU:software-developer', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_visa', null, 9, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:software-developer', 'au-program:7132', 'direct', '2026-08-08'),
  ('AU:software-developer', 'au-program:5838', 'direct', '2026-08-08'),
  ('AU:software-developer', 'au-program:4972', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
