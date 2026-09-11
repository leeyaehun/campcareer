-- Australia Financial Analyst profile.
-- Current OSCA does not define a standalone six-digit Financial Analyst occupation.
-- Financial Analyst is an official specialisation of OSCA 211131 Accountant (General).
-- Legacy ANZSCO 221111 and broader ANZSCO 2211 labour-market data are contextual only and are not treated as exact Financial Analyst observations.

update public.courses_au
set official_course_url = 'https://www.mq.edu.au/study/find-a-course/courses/bachelor-of-applied-finance',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where institution_id = 'macquarie-university'
  and course_code = '027342M';

update public.courses_au
set official_course_url = 'https://coursehandbook.mq.edu.au/2025/courses/c000120',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course handbook, manually verified; 2026 handbook continues the same C000120 Master of Applied Finance pathway'
where institution_id = 'macquarie-university'
  and course_code = '083777G';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:financial-analyst', 'AU', 'financial-analyst', 'Financial Analyst (specialisation of Accountant (General))',
  'OSCA', '2024 v1.0', '2111', 'AUD', false,
  'No universal registration for ordinary Financial Analyst roles; regulated accounting or financial-advice services may have separate requirements',
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2111/211131',
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
  'AU:financial-analyst', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 3522.33333, '2026-05-01', -4.46,
  8.44, 16.63, 0, 0, 5, 0, 13, 0, 5, 5, 3, 31,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Financial Analyst is explicitly listed by ABS as a specialisation of current OSCA 211131 Accountant (General), not as a separate six-digit occupation. The parent occupation is Skill Level 1.',
    'legacy_mapping', 'Legacy ANZSCO 221111 Accountant (General) cannot be treated as an exact Financial Analyst series. Current OSCA 211131 contains Financial Analyst as one specialisation, and legacy 221111 also corresponds to current OSCA 211133 Forensic Accountant. CampCareer therefore leaves current Financial Analyst employment and demographic fields null.',
    'legacy_221111_context', jsonb_build_object(
      'employment_total', 139100,
      'part_time_share_pct', 22,
      'female_share_pct', 54,
      'median_age', 40,
      'average_full_time_hours', 43,
      'data_as_at', '2026-02-01',
      'scope', 'JSA legacy ANZSCO 221111 Accountant (General); contextual only for the current Financial Analyst specialisation'
    ),
    'broader_anzsco_2211_context', jsonb_build_object(
      'employment_total', 215500,
      'median_weekly_earnings_aud', 2003,
      'median_hourly_earnings_aud', 53,
      'part_time_share_pct', 16,
      'female_share_pct', 54,
      'median_age', 42,
      'average_full_time_hours', 43,
      'scope', 'ANZSCO 2211 Accountants; broader than the Financial Analyst specialisation'
    ),
    'earnings_scope', 'No exact Financial Analyst earnings series is available from the reviewed occupation sources. Broader ANZSCO 2211 median earnings of A$2,003 per week and A$53 per hour are retained as context only, so the salary component is zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 3,522.33333 is for broader ANZSCO 2211 Accountants. May 2025 was 3,686.66667, giving about -4.46% year on year. Vacancy intensity and vacancy-trend credits are therefore zero for the Financial Analyst specialisation.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2211 are +8.44% from May 2025 to May 2030 and +16.63% to May 2035. These receive partial growth credit only.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records parent current OSCA 211131 Accountant (General) as No Shortage nationally and in all eight states and territories. No separate Financial Analyst shortage series exists, so the shortage component is zero.',
    'visa_basis', 'The current Home Affairs skilled occupation list includes legacy ANZSCO 221111 Accountant (General), and CPA Australia, CA ANZ and IPA are relevant assessing authorities. Financial Analyst receives only partial visa credit because the skilled lists do not name Financial Analyst separately: a person must satisfy the nominated 221111 duties and accounting education/skills-assessment requirements, not merely hold a Financial Analyst job title.',
    'registration_basis', 'Ordinary employee Financial Analyst roles do not have one universal Australian registration requirement. Separate licensing or registration can apply if the work moves into regulated financial advice, audit, tax or other regulated services.',
    'entry_level_basis', 'Macquarie University Bachelor of Applied Finance, CRICOS 027342M, is a three-year direct finance degree covering financial-data analysis, financial modelling, markets, investments, corporate finance and risk. The Master of Applied Finance, CRICOS 083777G, provides advanced work in financial strategy, markets and instruments, valuation, pricing and risk for graduates and finance professionals.',
    'entry_burden_basis', 'The parent OSCA occupation is Skill Level 1. A bachelor degree is the normal entry foundation for analyst roles, while specialist investment, banking or accounting pathways may prefer additional credentials or experience.',
    'employer_diversity_basis', 'Curated employer coverage spans banking, investment management, diversified financial services, corporate finance and professional services; replace with posting-level unique-employer counts when available.',
    'score_note', 'Financial Analyst receives direct-study and employer-diversity credit, partial skilled-occupation-list credit and partial broader growth credit. It receives no shortage, salary, vacancy-intensity or vacancy-trend credit because the occupation is a current specialisation without exact standalone labour-market series.'
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
  'AU:financial-analyst', '211131', 'Financial Analyst (specialisation of Accountant (General))', 'ANZSCO', '2022', '221111',
  null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2111/211131',
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
  ('AU:financial-analyst', 'ACT', '2026-05-01', null, 61.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:financial-analyst', 'NSW', '2026-05-01', null, 1179.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:financial-analyst', 'NT', '2026-05-01', null, 15.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:financial-analyst', 'QLD', '2026-05-01', null, 846.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:financial-analyst', 'SA', '2026-05-01', null, 175.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:financial-analyst', 'TAS', '2026-05-01', null, 29.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:financial-analyst', 'VIC', '2026-05-01', null, 843.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:financial-analyst', 'WA', '2026-05-01', null, 370.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:financial-analyst', 'job_search', 'SEEK — Financial Analyst jobs', 'https://www.seek.com.au/financial-analyst-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:financial-analyst', 'job_search', 'Workforce Australia — Financial Analyst search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=financial%20analyst', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:financial-analyst', 'employer', 'Macquarie Group — Careers', 'https://www.macquarie.com/au/en/careers.html', 'financial_services', null, 1, '2026-08-08'),
  ('AU:financial-analyst', 'employer', 'Commonwealth Bank — Careers', 'https://www.commbank.com.au/about-us/careers.html', 'banking', null, 2, '2026-08-08'),
  ('AU:financial-analyst', 'employer', 'Westpac — Careers', 'https://www.westpac.com.au/about-westpac/careers/', 'banking', null, 3, '2026-08-08'),
  ('AU:financial-analyst', 'employer', 'NAB — Careers', 'https://www.nab.com.au/about-us/careers', 'banking', null, 4, '2026-08-08'),
  ('AU:financial-analyst', 'employer', 'Deloitte Australia — Careers', 'https://www.deloitte.com/au/en/careers.html', 'professional_services', null, 5, '2026-08-08'),
  ('AU:financial-analyst', 'entry_program', 'Macquarie — Bachelor of Applied Finance', 'https://www.mq.edu.au/study/find-a-course/courses/bachelor-of-applied-finance', 'university_program', null, 1, '2026-08-08'),
  ('AU:financial-analyst', 'entry_program', 'Macquarie — Master of Applied Finance', 'https://coursehandbook.mq.edu.au/2025/courses/c000120', 'university_program', null, 2, '2026-08-08'),
  ('AU:financial-analyst', 'entry_program', 'CPA Australia — Accountant migration skills assessment', 'https://www.cpaaustralia.com.au/migration-services/migration-to-australia', 'official_skills_assessment', null, 3, '2026-08-08'),
  ('AU:financial-analyst', 'source', 'ABS — OSCA 211131 Accountant (General), including Financial Analyst specialisation', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2111/211131', 'official_classification', null, 1, '2026-08-08'),
  ('AU:financial-analyst', 'source', 'Jobs and Skills Australia — Accountants (General) ANZSCO 221111', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/221111-accountants-general', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:financial-analyst', 'source', 'Jobs and Skills Australia — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:financial-analyst', 'source', 'Jobs and Skills Australia — Employment Projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:financial-analyst', 'source', 'Jobs and Skills Australia — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortages-analysis/occupation-shortage-list', 'official_shortage', null, 5, '2026-08-08'),
  ('AU:financial-analyst', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_migration', null, 6, '2026-08-08'),
  ('AU:financial-analyst', 'source', 'CPA Australia — Migration skills assessment', 'https://www.cpaaustralia.com.au/migration-services/migration-to-australia', 'official_skills_assessment', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

with matched_programs as (
  select
    case
      when institution_id = 'macquarie-university' and course_code = '027342M' then 'direct'
      when institution_id = 'macquarie-university' and course_code = '083777G' then 'graduate_entry'
    end as relation_type,
    'au-program:' || id::text as program_ref
  from public.courses_au
  where (institution_id = 'macquarie-university' and course_code = '027342M')
     or (institution_id = 'macquarie-university' and course_code = '083777G')
)
insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:financial-analyst', program_ref, relation_type, '2026-08-08'::date
from matched_programs
where relation_type is not null
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
