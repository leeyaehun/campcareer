-- Australia Marketing Specialist profile.
-- Exact current occupation: OSCA 221534 Marketing Specialist.
-- Current ANZSCO 2022 counterpart: 225113 Marketing Specialist.
-- JSA's February 2026 six-digit profile is still ANZSCO 2013 v1.3; because current OSCA
-- 221531 Content Creator (Marketing) also maps back to legacy 225113, legacy employment
-- and demographics are retained as context rather than exact current 221534 observations.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + ABS ANZSCO 2022 + JSA occupation profile/2025 OSL + current CSOL',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/221/2215/221534',
    last_verified = '2026-08-09',
    anzsco_v13 = '225113'
where anzsco_code = '221534'
  and occupation_en = 'Marketing Specialist';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed current OSCA 221534 Marketing Specialist against ANZSCO 2022 225113 Marketing Specialist. The current Core Skills Occupation List separately lists 225113 Marketing Specialist and 225114 Content Creator (Marketing), with VETASSESS as assessing authority for 225113. JSA February 2026 labour-market profiles remain on ANZSCO 2013 v1.3, so legacy 225113 statistics are not treated as exact current OSCA 221534 observations.'
where osca_code = '221534'
  and anzsco_v13_code = '225113'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

update public.courses_au
set official_course_url = 'https://www.deakin.edu.au/course/bachelor-marketing-psychology-international',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider international course page, manually verified 2026-08-09'
where institution_id = 'deakin-university'
  and course_code = '0100820';

update public.courses_au
set official_course_url = 'https://www.rmit.edu.au/study-with-us/levels-of-study/postgraduate-study/masters-by-coursework/master-of-marketing-mc197',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider international-capable course page, manually verified 2026-08-09'
where institution_id = 'rmit-university'
  and course_code = '077512F';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:marketing-specialist', 'AU', 'marketing-specialist', 'Marketing Specialist',
  'OSCA', '2024 v1.0', '2215', 'AUD', false,
  'No general occupational registration; VETASSESS is the migration skills assessing authority for ANZSCO 225113 Marketing Specialist',
  'https://www.vetassess.com.au/check-my-occupation/professional-occupations/marketing-specialist',
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
  'AU:marketing-specialist', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 1800.33333, '2026-05-01', -10.22,
  12.56, 22.08, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 221534 Marketing Specialist is a standalone Skill Level 1 occupation. ABS defines it as identifying market opportunities and advising on pricing and promotion plans, lists Marketing Consultant, Marketing Coordinator and Marketing Officer as alternative titles, and includes Brand Manager, Category Manager, Pricing Analyst, Product Manager and Sales Analyst as specialisations.',
    'current_anzsco_mapping', 'ANZSCO 2022 retains 225113 Marketing Specialist and separately classifies 225114 Content Creator (Marketing). The current Core Skills Occupation List also lists these as separate occupations. This supports an exact current classification and migration-code mapping for canonical Marketing Specialist.',
    'legacy_split_caveat', 'JSA February 2026 occupation-profile data remain on ANZSCO 2013 v1.3. CampCareer correspondence maps both current OSCA 221531 Content Creator (Marketing) and 221534 Marketing Specialist back to legacy 225113 because Content Creator was not a separate 2013 v1.3 occupation. The legacy 225113 employment and demographic observations therefore cannot be represented as exact current 221534 values.',
    'legacy_225113_context', jsonb_build_object(
      'employment_total', 71700,
      'part_time_share_pct', 24,
      'female_share_pct', 62,
      'median_age', 35,
      'average_full_time_hours', 42,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit ANZSCO 2013 v1.3 Marketing Specialists; contextual for current OSCA 221534 because the current classification split out Content Creator (Marketing)'
    ),
    'broader_anzsco_2251_context', jsonb_build_object(
      'employment_total', 103100,
      'median_weekly_earnings_aud', 1957,
      'median_hourly_earnings_aud', 52,
      'part_time_share_pct', 18,
      'female_share_pct', 63,
      'median_age', 36,
      'average_full_time_hours', 42,
      'scope', 'ANZSCO 2251 Advertising and Marketing Professionals; broader than current Marketing Specialist'
    ),
    'earnings_scope', 'No clean standalone current OSCA 221534 earnings series is available in CampCareer. Broader ANZSCO 2251 median earnings of A$1,957 per week and A$52 per hour are retained as context only, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 1,800.33333 and state vacancy values are published at broader ANZSCO 2251. May 2025 was 2,005.33333, giving about -10.22% year on year. Vacancy intensity is not scored because the series is broader than Marketing Specialist, and the negative broader trend receives no trend credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2251 are +12.56% from May 2025 to May 2030 and +22.08% to May 2035. These receive partial growth credit because the unit group contains multiple occupations.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records OSCA 221534 Marketing Specialist as No Shortage nationally. CampCareer has no state or territory shortage rows for 221534 in the reviewed 2025 data, so no regional shortage signal is fabricated.',
    'visa_basis', 'The current Core Skills Occupation List includes ANZSCO 225113 Marketing Specialist with VETASSESS as the assessing authority and separately lists 225114 Content Creator (Marketing). VETASSESS classifies Marketing Specialist as Group B. This supports full pathway credit for the exact current marketing occupation, subject to qualification, employment and applicable visa circumstances.',
    'registration_basis', 'There is no general occupational registration requirement for Marketing Specialists. Professional marketing memberships may support development but are not statutory licences. Migration skills assessment through VETASSESS is a separate evidentiary process.',
    'entry_level_basis', 'Deakin University''s three-year Bachelor of Marketing (Psychology), CRICOS 0100820, is AQF Level 7 and combines marketing, consumer behaviour, analytics and psychology. RMIT University''s Master of Marketing, CRICOS 077512F, is a two-year international postgraduate route covering marketing strategy, analytics, brand strategy, customer experience and industry projects.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. VETASSESS Group B requires an AQF bachelor degree or higher and relevant employment evidence under the applicable pathway, creating moderate entry burden despite no statutory licence.',
    'employer_diversity_basis', 'Curated employer coverage spans retail, banking, aviation, technology and professional services; replace with posting-level unique-employer counts when available.',
    'score_note', 'Marketing Specialist receives no shortage, salary, vacancy-intensity or vacancy-trend points. Legacy six-digit employment is contextual because of the classification split. Positive broader long-run growth receives partial credit, direct bachelor/postgraduate study supports entry credit, and the exact current 225113 VETASSESS/CSOL pathway supports visa credit.'
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
  'AU:marketing-specialist', '221534', 'Marketing Specialist',
  'ANZSCO', '2022', '225113', null, true, true, 1,
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/221/2215/221534',
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
  ('AU:marketing-specialist', 'ACT', '2026-05-01', null, 24, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:marketing-specialist', 'NSW', '2026-05-01', null, 693, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:marketing-specialist', 'NT', '2026-05-01', null, 3, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:marketing-specialist', 'QLD', '2026-05-01', null, 320, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:marketing-specialist', 'SA', '2026-05-01', null, 74.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:marketing-specialist', 'TAS', '2026-05-01', null, 7.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:marketing-specialist', 'VIC', '2026-05-01', null, 539.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:marketing-specialist', 'WA', '2026-05-01', null, 139.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:marketing-specialist', 'job_search', 'SEEK — Marketing Specialist jobs', 'https://www.seek.com.au/marketing-specialist-jobs', 'private_job_board', null, 1, '2026-08-09'),
  ('AU:marketing-specialist', 'job_search', 'Workforce Australia — Marketing Specialist search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=marketing%20specialist', 'government_job_board', null, 2, '2026-08-09'),
  ('AU:marketing-specialist', 'employer', 'Woolworths Group — Careers', 'https://www.wowcareers.com.au/', 'retail', null, 1, '2026-08-09'),
  ('AU:marketing-specialist', 'employer', 'Commonwealth Bank — Careers', 'https://www.commbank.com.au/about-us/careers.html', 'financial_services', null, 2, '2026-08-09'),
  ('AU:marketing-specialist', 'employer', 'Qantas — Careers', 'https://careers.qantas.com/', 'aviation', null, 3, '2026-08-09'),
  ('AU:marketing-specialist', 'employer', 'Canva — Careers', 'https://www.lifeatcanva.com/', 'technology', null, 4, '2026-08-09'),
  ('AU:marketing-specialist', 'employer', 'Deloitte Australia — Careers', 'https://www.deloitte.com/au/en/careers.html', 'professional_services', null, 5, '2026-08-09'),
  ('AU:marketing-specialist', 'entry_program', 'VETASSESS — Marketing Specialist skills assessment', 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/marketing-specialist', 'official_skills_assessment', null, 1, '2026-08-09'),
  ('AU:marketing-specialist', 'entry_program', 'Deakin — Bachelor of Marketing (Psychology)', 'https://www.deakin.edu.au/course/bachelor-marketing-psychology-international', 'university_program', null, 2, '2026-08-09'),
  ('AU:marketing-specialist', 'entry_program', 'RMIT — Master of Marketing', 'https://www.rmit.edu.au/study-with-us/levels-of-study/postgraduate-study/masters-by-coursework/master-of-marketing-mc197', 'university_program', null, 3, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'ABS OSCA — Marketing Specialist 221534', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/22/221/2215/221534', 'official_classification', null, 1, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'ABS ANZSCO 2022 — Advertising and Marketing Professionals 2251', 'https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/2/22/225/2251', 'official_classification', null, 2, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'JSA — Marketing Specialists 225113', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/225113-marketing-specialists', 'official_labour_market', null, 3, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'JSA — Advertising and Marketing Professionals 2251', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2251-advertising-and-marketing-professionals', 'official_labour_market', null, 4, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 5, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'JSA — Employment Projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 6, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_shortage', null, 7, '2026-08-09'),
  ('AU:marketing-specialist', 'source', 'Australian Government — current CSOL instrument', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 8, '2026-08-09')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

with selected_programs as (
  select 'au-program:' || id::text as program_ref,
         case when institution_id = 'deakin-university' then 'direct' else 'graduate_entry' end as relation_type
  from public.courses_au
  where (institution_id = 'deakin-university' and course_code = '0100820')
     or (institution_id = 'rmit-university' and course_code = '077512F')
)
insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:marketing-specialist', program_ref, relation_type, '2026-08-09'
from selected_programs
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
