-- Australia Human Resources Specialist profile.
-- Canonical scope maps to current OSCA 222131 Human Resources Adviser.
-- Legacy ANZSCO 223111 is the aligned JSA six-digit labour-market profile.
-- Exact six-digit employment/demographics are retained; earnings and vacancy/projection series remain broader where noted.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA occupation profile/2025 OSL + current CSOL',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/222/2221/222131',
    last_verified = '2026-08-09',
    anzsco_v13 = '223111'
where anzsco_code = '222131'
  and occupation_en = 'Human Resources Adviser';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed current OSCA 222131 Human Resources Adviser correspondence to legacy ANZSCO 223111. The current Core Skills Occupation List includes Human Resource Adviser 223111 with VETASSESS as assessing authority. VETASSESS classifies the occupation as Group B and describes HR specialist/generalist employment contexts within the occupation.'
where osca_code = '222131'
  and anzsco_v13_code = '223111'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

update public.courses_au
set official_course_url = 'https://www.deakin.edu.au/course/bachelor-human-resource-management-psychology-international',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider international course page, manually verified 2026-08-09'
where institution_id = 'deakin-university'
  and course_code = '0101801';

update public.courses_au
set official_course_url = 'https://www.rmit.edu.au/study-with-us/levels-of-study/postgraduate-study/masters-by-coursework/master-of-human-resource-management-mc263',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified 2026-08-09'
where institution_id = 'rmit-university'
  and course_code = '088784B';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:human-resources-specialist', 'AU', 'human-resources-specialist', 'Human Resources Adviser',
  'OSCA', '2024 v1.0', '2221', 'AUD', false,
  'No general occupational registration; VETASSESS is the migration skills assessing authority for legacy ANZSCO 223111 Human Resource Adviser',
  'https://www.vetassess.com.au/check-my-occupation/professional-occupations/human-resource-adviser',
  'profile_ready', '2026-08-09', now()
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
  'AU:human-resources-specialist', '2026-05-01', 33500, null, null, null,
  1852, 22, 81, 37, 41, 2355.66667, '2026-05-01', -4.69,
  7.39, 14.77, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 222131 Human Resources Adviser provides staffing and personnel administration services in support of organisational HR policies and programs. ABS lists HR Adviser and Human Resources Consultant as alternative titles and Diversity, Equity and Inclusion Specialist, Personnel Officer and Workforce Planning Analyst as specialisations. VETASSESS further explains that professionals focused in a single HR area are generally referred to as HR specialists, supporting CampCareer''s neutral canonical Human Resources Specialist mapping.',
    'legacy_mapping', 'Current OSCA 222131 corresponds to legacy ANZSCO 223111 Human Resource Adviser in CampCareer''s reviewed correspondence data. JSA continues to publish six-digit ANZSCO 2013 v1.3 occupation-profile observations for 223111, so employment and demographic fields are used as the aligned occupation profile.',
    'legacy_223111_profile', jsonb_build_object(
      'employment_total', 33500,
      'part_time_share_pct', 22,
      'female_share_pct', 81,
      'median_age', 37,
      'average_full_time_hours', 41,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit legacy ANZSCO 223111 Human Resource Advisers'
    ),
    'broader_anzsco_2231_context', jsonb_build_object(
      'employment_total', 84700,
      'median_weekly_earnings_aud', 1970,
      'median_hourly_earnings_aud', 53,
      'part_time_share_pct', 16,
      'female_share_pct', 73,
      'median_age', 38,
      'average_full_time_hours', 41,
      'scope', 'ANZSCO 2231 Human Resource Professionals; includes Human Resource Advisers, Recruitment Consultants and Workplace Relations Advisers'
    ),
    'earnings_scope', 'JSA does not publish six-digit median earnings for ANZSCO 223111. Broader ANZSCO 2231 median earnings of A$1,970 per week and A$53 per hour are retained as context only, so the salary component is zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 2,355.66667 and state vacancy values are published at broader ANZSCO 2231. May 2025 was 2,471.66667, giving about -4.69% year on year. Vacancy intensity is not scored because the series is broader than Human Resource Adviser, and the negative broader trend receives no trend credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2231 are +7.39% from May 2025 to May 2030 and +14.77% to May 2035. These receive partial growth credit because the unit group includes multiple occupations.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records OSCA 222131 Human Resources Adviser as No Shortage nationally. South Australia and the Northern Territory have shortage signals, which are preserved in regional metrics, while the national shortage component remains zero.',
    'visa_basis', 'The current Core Skills Occupation List includes legacy ANZSCO 223111 Human Resource Adviser with VETASSESS as the assessing authority. VETASSESS classifies 223111 as Group B and requires both qualification and employment evidence. Occupation-list inclusion and a positive skills assessment do not guarantee an individual visa outcome.',
    'registration_basis', 'There is no general occupational registration requirement for HR specialists or advisers. AHRI professional membership or certification can support professional development but is not statutory registration. Migration skills assessment through VETASSESS is a separate evidentiary process.',
    'entry_level_basis', 'Deakin University''s three-year Bachelor of Human Resource Management (Psychology), CRICOS 0101801, is AQF Level 7 and AHRI-accredited. RMIT University''s Master of Human Resource Management, CRICOS 088784B, is a two-year international postgraduate route and satisfies AHRI HR professional standards. Both are directly relevant HR study routes.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. VETASSESS Group B requires an AQF bachelor degree or higher and relevant employment evidence under the applicable pathway, so the occupation has moderate entry burden despite no statutory licence.',
    'employer_diversity_basis', 'Curated coverage spans professional services, financial services, mining, retail and large corporate employers; replace with posting-level unique-employer counts when available.',
    'score_note', 'Human Resources Specialist receives no national shortage, salary, vacancy-intensity or vacancy-trend points. Exact six-digit employment and demographics are available, broader long-run growth receives partial credit, direct AHRI-accredited study supports entry credit, and current CSOL/VETASSESS evidence supports visa credit.'
  ),
  '2026-08-09'
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
  'AU:human-resources-specialist', '222131', 'Human Resources Adviser',
  'ANZSCO', '2013 v1.3', '223111', null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/222/2221/222131',
  '2026-08-09'
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
  ('AU:human-resources-specialist', 'ACT', '2026-05-01', null, 49.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:human-resources-specialist', 'NSW', '2026-05-01', null, 703.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:human-resources-specialist', 'NT', '2026-05-01', 3, 26.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:human-resources-specialist', 'QLD', '2026-05-01', null, 514.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:human-resources-specialist', 'SA', '2026-05-01', 3, 161.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:human-resources-specialist', 'TAS', '2026-05-01', null, 29.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:human-resources-specialist', 'VIC', '2026-05-01', null, 528, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:human-resources-specialist', 'WA', '2026-05-01', null, 343.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:human-resources-specialist', 'job_search', 'SEEK — Human Resources jobs', 'https://www.seek.com.au/human-resources-jobs', 'private_job_board', null, 1, '2026-08-09'),
  ('AU:human-resources-specialist', 'job_search', 'Workforce Australia — Human Resources search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=human%20resources', 'government_job_board', null, 2, '2026-08-09'),
  ('AU:human-resources-specialist', 'employer', 'Deloitte Australia — Careers', 'https://www.deloitte.com/au/en/careers.html', 'professional_services', null, 1, '2026-08-09'),
  ('AU:human-resources-specialist', 'employer', 'Commonwealth Bank — Careers', 'https://www.commbank.com.au/about-us/careers.html', 'financial_services', null, 2, '2026-08-09'),
  ('AU:human-resources-specialist', 'employer', 'BHP — Careers', 'https://www.bhp.com/careers', 'mining', null, 3, '2026-08-09'),
  ('AU:human-resources-specialist', 'employer', 'Woolworths Group — Careers', 'https://www.wowcareers.com.au/', 'retail', null, 4, '2026-08-09'),
  ('AU:human-resources-specialist', 'employer', 'Telstra — Careers', 'https://www.telstra.com.au/careers', 'telecommunications', null, 5, '2026-08-09'),
  ('AU:human-resources-specialist', 'entry_program', 'VETASSESS — Human Resource Adviser skills assessment', 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/human-resource-adviser', 'official_skills_assessment', null, 1, '2026-08-09'),
  ('AU:human-resources-specialist', 'entry_program', 'Deakin — Bachelor of Human Resource Management (Psychology)', 'https://www.deakin.edu.au/course/bachelor-human-resource-management-psychology-international', 'university_program', null, 2, '2026-08-09'),
  ('AU:human-resources-specialist', 'entry_program', 'RMIT — Master of Human Resource Management', 'https://www.rmit.edu.au/study-with-us/levels-of-study/postgraduate-study/masters-by-coursework/master-of-human-resource-management-mc263', 'university_program', null, 3, '2026-08-09'),
  ('AU:human-resources-specialist', 'source', 'ABS OSCA — Human Resources Adviser 222131', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/222/2221/222131', 'official_classification', null, 1, '2026-08-09'),
  ('AU:human-resources-specialist', 'source', 'JSA — Human Resource Advisers 223111', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/223111-human-resource-advisers', 'official_labour_market', null, 2, '2026-08-09'),
  ('AU:human-resources-specialist', 'source', 'JSA — Human Resource Professionals 2231', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2231-human-resource-professionals', 'official_labour_market', null, 3, '2026-08-09'),
  ('AU:human-resources-specialist', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-09'),
  ('AU:human-resources-specialist', 'source', 'JSA — Employment Projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-09'),
  ('AU:human-resources-specialist', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/sites/default/files/2025-10/2025%20Occupation%20Shortage%20List%20-%206%20digit%20ANZSCO%20and%20OSCA.xlsx', 'official_shortage_list', null, 6, '2026-08-09'),
  ('AU:human-resources-specialist', 'source', 'Australian Government — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/2024-12-07/2024-12-07/text/original/epub/OEBPS/document_1/document_1.html', 'official_visa_list', null, 7, '2026-08-09')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:human-resources-specialist', 'au-program:' || id::text, relation_type, '2026-08-09'::date
from (
  select id, 'direct'::text as relation_type
  from public.courses_au
  where institution_id = 'deakin-university'
    and course_code = '0101801'
  union all
  select id, 'graduate_entry'::text as relation_type
  from public.courses_au
  where institution_id = 'rmit-university'
    and course_code = '088784B'
) programs
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;
;
