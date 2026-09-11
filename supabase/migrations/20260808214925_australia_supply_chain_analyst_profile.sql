-- Australia Supply Chain Analyst profile.
-- Exact current occupation: OSCA 223434 Supply Chain Analyst.
-- Current ANZSCO 2022 correspondence: 224714 Supply Chain Analyst.
-- JSA labour-market observations available to CampCareer remain at broader ANZSCO 2247, so exact employment and earnings stay null.

update public.courses_au
set official_course_url = 'https://www.utas.edu.au/courses/sci-eng/courses/p3e-bachelor-of-global-logistics-and-maritime-management?year=2026',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider 2026 course page, manually verified'
where institution_id = 'university-of-tasmania'
  and course_code = '095526F';

update public.courses_au
set official_course_url = 'https://www.rmit.edu.au/study-with-us/levels-of-study/postgraduate-study/masters-by-coursework/master-of-supply-chain-and-logistics-management-mc198',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where institution_id = 'rmit-university'
  and course_code = '077513E';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:supply-chain-analyst', 'AU', 'supply-chain-analyst', 'Supply Chain Analyst',
  'OSCA', '2024 v1.0', '2234', 'AUD', false,
  'No general occupational registration; VETASSESS is the migration skills assessing authority for ANZSCO 224714 Supply Chain Analyst',
  'https://www.vetassess.com.au/check-my-occupation/professional-occupations/supply-chain-analyst',
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
  'AU:supply-chain-analyst', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 779.66667, '2026-05-01', -1.56,
  16.15, 27.31, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 223434 Supply Chain Analyst is a standalone Skill Level 1 occupation. ABS defines it as analysing product delivery or supply chain processes to identify or recommend changes, lists Logistics Analyst as an alternative title, and explicitly excludes Logistics Officers.',
    'current_anzsco_mapping', 'ANZSCO 2022 Unit Group 2247 contains 224714 Supply Chain Analyst with materially aligned title and scope. This is the current migration occupation used by VETASSESS.',
    'exact_labour_market_scope', 'CampCareer does not have a standalone JSA six-digit labour-market profile for ANZSCO 224714. Exact Supply Chain Analyst employment, demographics and earnings are therefore left null rather than inferred from the broader unit group.',
    'broader_anzsco_2247_context', jsonb_build_object(
      'employment_total', 105800,
      'median_weekly_earnings_aud', 2444,
      'median_hourly_earnings_aud', 63,
      'part_time_share_pct', 17,
      'female_share_pct', 48,
      'median_age', 43,
      'average_full_time_hours', 43,
      'data_as_at', '2026-02-01',
      'scope', 'ANZSCO 2247 Management and Organisation Analysts; broader than Supply Chain Analyst'
    ),
    'earnings_scope', 'Broader ANZSCO 2247 median earnings of A$2,444 per week and A$63 per hour are retained only as context. No standalone Supply Chain Analyst salary is scored.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 779.66667 and state vacancy values are published at broader ANZSCO 2247. May 2025 was 792, giving about -1.56% year on year. Vacancy intensity is not scored and the negative broader trend receives no trend credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2247 are +16.15% from May 2025 to May 2030 and +27.31% to May 2035. These receive partial growth credit because the unit group contains multiple occupations.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records OSCA 223434 Supply Chain Analyst as No Shortage nationally and in all eight states and territories. The shortage component is therefore zero.',
    'visa_basis', 'VETASSESS currently assesses ANZSCO 224714 Supply Chain Analyst as a Group B occupation and identifies it among occupations assessed for the Core Skills stream of subclass 482 and Direct Entry stream of subclass 186. Occupation-list inclusion and a positive skills assessment do not guarantee an individual visa outcome.',
    'registration_basis', 'There is no general occupational registration requirement for Supply Chain Analysts. Migration skills assessment through VETASSESS is a separate evidentiary process.',
    'entry_level_basis', 'The University of Tasmania Bachelor of Global Logistics and Maritime Management, CRICOS 095526F, is a three-year AQF level 7 degree with a Logistics and Supply Chain Management major and analytical logistics learning outcomes. RMIT Master of Supply Chain and Logistics Management, CRICOS 077513E, is a two-year postgraduate route covering supply chain modelling, sourcing and procurement, logistics, risk and project management.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1 and VETASSESS Group B requires an AQF bachelor degree or higher plus relevant employment evidence under the applicable pathway, creating moderate entry burden.',
    'employer_diversity_basis', 'Curated employer coverage spans third-party logistics, transport, retail and large-scale distribution networks; replace with posting-level unique-employer counts when available.',
    'score_note', 'Supply Chain Analyst receives no shortage, salary, vacancy-intensity or vacancy-trend points. Strong broader long-run growth receives partial credit, direct bachelor and postgraduate study routes support entry credit, and the verified VETASSESS/CSOL pathway supports visa credit.'
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
  'AU:supply-chain-analyst', '223434', 'Supply Chain Analyst',
  'ANZSCO', '2022', '224714', null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2234/223434',
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
  ('AU:supply-chain-analyst', 'ACT', '2026-05-01', null, 31.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:supply-chain-analyst', 'NSW', '2026-05-01', null, 269.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:supply-chain-analyst', 'NT', '2026-05-01', null, 10.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:supply-chain-analyst', 'QLD', '2026-05-01', null, 152.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:supply-chain-analyst', 'SA', '2026-05-01', null, 39, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:supply-chain-analyst', 'TAS', '2026-05-01', null, 5.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:supply-chain-analyst', 'VIC', '2026-05-01', null, 198, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:supply-chain-analyst', 'WA', '2026-05-01', null, 73.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:supply-chain-analyst', 'job_search', 'SEEK — Supply Chain Analyst jobs', 'https://www.seek.com.au/supply-chain-analyst-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:supply-chain-analyst', 'job_search', 'Workforce Australia — Supply Chain Analyst search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=supply%20chain%20analyst', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:supply-chain-analyst', 'employer', 'DHL — Careers', 'https://careers.dhl.com/', 'logistics', null, 1, '2026-08-08'),
  ('AU:supply-chain-analyst', 'employer', 'Linfox — Careers', 'https://www.linfox.com/careers/', 'logistics', null, 2, '2026-08-08'),
  ('AU:supply-chain-analyst', 'employer', 'Toll Group — Careers', 'https://www.tollgroup.com/careers', 'logistics', null, 3, '2026-08-08'),
  ('AU:supply-chain-analyst', 'employer', 'Woolworths Group — Careers', 'https://www.wowcareers.com.au/', 'retail_distribution', null, 4, '2026-08-08'),
  ('AU:supply-chain-analyst', 'employer', 'Coles Group — Careers', 'https://colescareers.com.au/', 'retail_distribution', null, 5, '2026-08-08'),
  ('AU:supply-chain-analyst', 'entry_program', 'VETASSESS — Supply Chain Analyst skills assessment', 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/supply-chain-analyst', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:supply-chain-analyst', 'entry_program', 'University of Tasmania — Bachelor of Global Logistics and Maritime Management', 'https://www.utas.edu.au/courses/sci-eng/courses/p3e-bachelor-of-global-logistics-and-maritime-management?year=2026', 'university_program', null, 2, '2026-08-08'),
  ('AU:supply-chain-analyst', 'entry_program', 'RMIT — Master of Supply Chain and Logistics Management', 'https://www.rmit.edu.au/study-with-us/levels-of-study/postgraduate-study/masters-by-coursework/master-of-supply-chain-and-logistics-management-mc198', 'university_program', null, 3, '2026-08-08'),
  ('AU:supply-chain-analyst', 'source', 'ABS OSCA — Supply Chain Analyst 223434', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2234/223434', 'official_classification', null, 1, '2026-08-08'),
  ('AU:supply-chain-analyst', 'source', 'ABS ANZSCO 2022 — Management and Organisation Analysts 2247', 'https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/2/22/224/2247', 'official_classification', null, 2, '2026-08-08'),
  ('AU:supply-chain-analyst', 'source', 'JSA — Management and Organisation Analysts 2247', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2247-management-and-organisation-analysts', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:supply-chain-analyst', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:supply-chain-analyst', 'source', 'JSA — Employment Projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:supply-chain-analyst', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/sites/default/files/2025-10/2025%20Occupation%20Shortage%20List%20-%206%20digit%20ANZSCO%20and%20OSCA.xlsx', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:supply-chain-analyst', 'source', 'VETASSESS — Supply Chain Analyst 224714', 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/supply-chain-analyst', 'official_skills_assessment', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:supply-chain-analyst', 'au-program:' || id::text, 'direct', '2026-08-08'::date
from public.courses_au
where institution_id = 'university-of-tasmania' and course_code = '095526F'
union all
select 'AU:supply-chain-analyst', 'au-program:' || id::text, 'graduate_entry', '2026-08-08'::date
from public.courses_au
where institution_id = 'rmit-university' and course_code = '077513E'
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
