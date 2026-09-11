-- Australia Business Analyst profile.
-- Canonical scope: non-ICT Business Analyst, an official specialisation of current OSCA 223432 Management Consultant.
-- Current ANZSCO 2022 migration code is 224713 Management Consultant; JSA's legacy labour-market profile remains ANZSCO 2013 v1.3 code 224711.
-- ICT Business Analyst is a separate occupation and is intentionally excluded.

update public.courses_au
set official_course_url = 'https://coursehandbook.mq.edu.au/2026/courses/C000016?year=2026',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider 2026 course handbook, manually verified'
where institution_id = 'macquarie-university'
  and course_code = '079306G';

update public.courses_au
set official_course_url = 'https://coursehandbook.mq.edu.au/2026/courses/C000180?year=2026',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider 2026 course handbook, manually verified'
where institution_id = 'macquarie-university'
  and course_code = '0100139';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:business-analyst', 'AU', 'business-analyst',
  'Business Analyst (non-ICT) — specialisation of Management Consultant',
  'OSCA', '2024 v1.0', '2234', 'AUD', false,
  'No general occupational registration; VETASSESS is the migration assessing authority for current ANZSCO 2022 Management Consultant 224713',
  'https://www.vetassess.com.au/check-my-occupation/professional-occupations/management-consultant',
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
  'AU:business-analyst', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 779.66667, '2026-05-01', -1.56,
  16.15, 27.31, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 223432 Management Consultant explicitly lists Business Analyst (non-ICT) as a specialisation and excludes ICT Business Analysts, which are classified separately under OSCA 273232. CampCareer therefore models canonical Business Analyst as this non-ICT specialisation rather than mixing the two labour markets.',
    'code_version_mapping', 'The current ANZSCO 2022 occupation corresponding to Management Consultant is 224713. JSA occupation-profile data are still published on the older ANZSCO 2013 v1.3 basis, where Management Consultant is 224711. The migration code and labour-market code are kept distinct in evidence.',
    'legacy_224711_context', jsonb_build_object(
      'employment_total', 64900,
      'part_time_share_pct', 21,
      'female_share_pct', 41,
      'median_age', 42,
      'average_full_time_hours', 43,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit legacy ANZSCO 224711 Management Consultants; broader than the Business Analyst specialisation'
    ),
    'broader_anzsco_2247_context', jsonb_build_object(
      'employment_total', 105800,
      'median_weekly_earnings_aud', 2444,
      'median_hourly_earnings_aud', 63,
      'part_time_share_pct', 17,
      'female_share_pct', 48,
      'median_age', 43,
      'average_full_time_hours', 43,
      'scope', 'ANZSCO 2247 Management and Organisation Analysts; includes Management Consultants and Organisation and Methods Analysts'
    ),
    'earnings_scope', 'No standalone Business Analyst earnings series is available for the non-ICT specialisation. Broader ANZSCO 2247 earnings of A$2,444 per week and A$63 per hour are retained as context only, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 779.66667 and state vacancy values are published at broader ANZSCO 2247. May 2025 was 792, giving about -1.56% year on year. Vacancy intensity is not scored because the vacancy numerator is broader than Business Analyst, and the negative broader trend receives no trend credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2247 are +16.15% from May 2025 to May 2030 and +27.31% to May 2035. These receive partial growth credit because the group is broader than the Business Analyst specialisation.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records current Management Consultant as No Shortage nationally and in all eight states and territories. No shortage points are assigned to the Business Analyst specialisation.',
    'visa_basis', 'The current Core Skills Occupation List includes ANZSCO 2022 224713 Management Consultant with VETASSESS as the assessing authority. VETASSESS explicitly lists Business Analyst as an occupation considered suitable under Management Consultant. Full visa credit reflects a verified pathway, not automatic eligibility: duties, qualification and employment evidence must satisfy the nominated occupation and visa requirements.',
    'registration_basis', 'There is no general occupational registration requirement for non-ICT Business Analysts. Migration skills assessment is a separate process through VETASSESS when Management Consultant is the nominated occupation.',
    'entry_level_basis', 'Macquarie University offers a three-year Bachelor of Business Analytics, CRICOS 079306G, combining business, statistics and analytical problem solving and offering Information Systems and Business Analysis study options. Its Master of Business Analytics, CRICOS 0100139, provides a postgraduate route focused on solving complex business problems. These are relevant career-entry study routes but do not by themselves guarantee a VETASSESS Management Consultant assessment.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. Bachelor-level study is the standard foundation, and a migration skills assessment can require highly relevant employment and evidence of consulting work, adding moderate entry burden.',
    'employer_diversity_basis', 'Curated employer coverage spans management consulting, professional services, banking and large corporate transformation teams; replace with posting-level unique-employer counts when available.',
    'score_note', 'Business Analyst receives no shortage, salary, vacancy-intensity or vacancy-trend points because the relevant observations are parent or broader group data. Strong broader long-run growth receives partial credit, direct bachelor/postgraduate study supports entry credit, and the current Management Consultant CSOL plus explicit VETASSESS recognition supports visa credit.'
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
  'AU:business-analyst', '223432', 'Business Analyst (non-ICT) — Management Consultant specialisation',
  'ANZSCO', '2022', '224713', null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2234/223432',
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
  ('AU:business-analyst', 'ACT', '2026-05-01', null, 31.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:business-analyst', 'NSW', '2026-05-01', null, 269.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:business-analyst', 'NT', '2026-05-01', null, 10.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:business-analyst', 'QLD', '2026-05-01', null, 152.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:business-analyst', 'SA', '2026-05-01', null, 39, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:business-analyst', 'TAS', '2026-05-01', null, 5.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:business-analyst', 'VIC', '2026-05-01', null, 198, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:business-analyst', 'WA', '2026-05-01', null, 73.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:business-analyst', 'job_search', 'SEEK — Business Analyst jobs', 'https://www.seek.com.au/business-analyst-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:business-analyst', 'job_search', 'Workforce Australia — Business Analyst search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=business%20analyst', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:business-analyst', 'employer', 'Deloitte Australia — Careers', 'https://www.deloitte.com/au/en/careers.html', 'professional_services', null, 1, '2026-08-08'),
  ('AU:business-analyst', 'employer', 'Accenture Australia — Careers', 'https://www.accenture.com/au-en/careers', 'professional_services', null, 2, '2026-08-08'),
  ('AU:business-analyst', 'employer', 'PwC Australia — Careers', 'https://www.pwc.com.au/careers.html', 'professional_services', null, 3, '2026-08-08'),
  ('AU:business-analyst', 'employer', 'KPMG Australia — Careers', 'https://kpmg.com/au/en/home/careers.html', 'professional_services', null, 4, '2026-08-08'),
  ('AU:business-analyst', 'employer', 'Commonwealth Bank — Careers', 'https://www.commbank.com.au/about-us/careers.html', 'financial_services', null, 5, '2026-08-08'),
  ('AU:business-analyst', 'entry_program', 'VETASSESS — Management Consultant skills assessment', 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/management-consultant', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:business-analyst', 'entry_program', 'Macquarie — Bachelor of Business Analytics', 'https://coursehandbook.mq.edu.au/2026/courses/C000016?year=2026', 'university_program', null, 2, '2026-08-08'),
  ('AU:business-analyst', 'entry_program', 'Macquarie — Master of Business Analytics', 'https://coursehandbook.mq.edu.au/2026/courses/C000180?year=2026', 'university_program', null, 3, '2026-08-08'),
  ('AU:business-analyst', 'source', 'ABS OSCA — Management Consultant 223432', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/223/2234/223432', 'official_classification', null, 1, '2026-08-08'),
  ('AU:business-analyst', 'source', 'JSA — Management Consultants 224711', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/224711-management-consultants', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:business-analyst', 'source', 'JSA — Management and Organisation Analysts 2247', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2247-management-and-organisation-analysts', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:business-analyst', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:business-analyst', 'source', 'JSA — Employment Projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:business-analyst', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/sites/default/files/2025-10/2025%20Occupation%20Shortage%20List%20-%206%20digit%20ANZSCO%20and%20OSCA.xlsx', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:business-analyst', 'source', 'Federal Register — current Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_migration', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:business-analyst', 'au-program:' || id::text, 'direct', '2026-08-08'::date
from public.courses_au
where institution_id = 'macquarie-university'
  and course_code = '079306G'
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:business-analyst', 'au-program:' || id::text, 'graduate_entry', '2026-08-08'::date
from public.courses_au
where institution_id = 'macquarie-university'
  and course_code = '0100139'
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
