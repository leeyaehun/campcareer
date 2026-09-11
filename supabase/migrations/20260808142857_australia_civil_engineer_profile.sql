-- Australia Civil Engineer profile.
-- Exact current occupation: OSCA 243231 Civil Engineer.
-- Legacy ANZSCO 233211 Civil Engineer remains the migration occupation assessed by Engineers Australia,
-- but the legacy code also corresponds to current OSCA 243236 Water Engineer, so legacy labour-market
-- observations are contextual rather than exact current Civil Engineer observations.

update ingest.occupations_au
set shortage_rating = 5,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + current CSOL instrument',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2432/243231',
    last_verified = '2026-08-08',
    anzsco_v13 = '233211'
where anzsco_code = '243231'
  and occupation_en = 'Civil Engineer';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed OSCA 243231 Civil Engineer correspondence to ANZSCO 233211 Civil Engineer. The current CSOL includes 233211 and Engineers Australia (EA) is the assessing authority. Legacy 233211 also corresponds to current OSCA 243236 Water Engineer, so occupation-list correspondence does not make legacy labour-market observations exact for current Civil Engineer.'
where osca_code = '243231'
  and anzsco_v13_code = '233211'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:civil-engineer', 'AU', 'civil-engineer', 'Civil Engineer',
  'OSCA', '2024 v1.0', '2432', 'AUD', true,
  'State or territory professional-engineer registration may apply; Engineers Australia (EA) is the migration skills assessing authority',
  'https://www.engineersaustralia.org.au/migrants/migration-skills-assessment',
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
  'AU:civil-engineer', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 2235, '2026-05-01', 3.94,
  11.58, 20.99, 20, 0, 5, 5, 13, 0, 5, 10, 3, 61,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 243231 Civil Engineer plans, designs, organises and oversees construction and operation of civil engineering projects. ABS explicitly excludes Rail Engineer and Water Engineer from this occupation and assigns Skill Level 1.',
    'legacy_mapping', 'ANZSCO 233211 Civil Engineer remains the current migration occupation and is assessed by Engineers Australia. The correspondence is not one-to-one because current OSCA 243236 Water Engineer also maps to legacy 233211, so legacy labour-market observations are not treated as exact current Civil Engineer values.',
    'legacy_233211_context', jsonb_build_object(
      'employment_total', 29400,
      'part_time_share_pct', 11,
      'female_share_pct', 15,
      'median_age', 34,
      'average_full_time_hours', 45,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit legacy ANZSCO 233211 Civil Engineer; not exact current OSCA 243231 because the current correspondence also includes Water Engineer'
    ),
    'broader_anzsco_2332_context', jsonb_build_object(
      'employment_total', 76800,
      'median_weekly_earnings_aud', 2217,
      'median_hourly_earnings_aud', 59,
      'part_time_share_pct', 7,
      'female_share_pct', 13,
      'median_age', 35,
      'average_full_time_hours', 44,
      'scope', 'ANZSCO 2332 Civil Engineering Professionals; broader than current OSCA 243231 Civil Engineer'
    ),
    'earnings_scope', 'No exact current OSCA 243231 earnings series is stored in CampCareer. The previous estimated salary is removed and broader ANZSCO 2332 earnings are retained only as context, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 2235 and state vacancy values are published at broader ANZSCO 2332. May 2025 was 2150.33333, giving about +3.94% year-on-year. Vacancy intensity is not scored because the vacancy numerator is broader than the exact current occupation; the positive broader trend receives partial credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2332 are +11.58% from May 2025 to May 2030 and +20.99% to May 2035. These values receive partial growth credit because the group includes multiple civil-engineering occupations.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records current OSCA 243231 Civil Engineer as Shortage nationally and in all eight states and territories. The shortage score therefore receives full credit.',
    'visa_basis', 'The current Core Skills Occupation List includes legacy ANZSCO 233211 Civil Engineer with Engineers Australia as the relevant assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'Australia has no single national licence that applies identically to every Civil Engineer role, but ABS notes registration or licensing may be required and professional-engineer registration requirements vary by state, territory and type of engineering service. Engineers Australia migration skills assessment is separate from domestic registration.',
    'entry_level_basis', 'Civil Engineering has clear graduate-entry pathways through four-year professional engineering degrees and structured graduate engineering recruitment. Entry-level credit is strong, although employers still value accredited study, practical placements and project experience.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. Professional engineering practice generally requires a four-year professional engineering qualification or equivalent competency, and state or territory registration can add an additional requirement depending on where and what work is performed.',
    'employer_diversity_basis', 'Curated coverage across engineering consultancies, infrastructure contractors and public-sector infrastructure employers; replace with posting-level unique-employer counts when available.',
    'score_note', 'Civil Engineer receives full exact-current shortage credit and verified CSOL credit. Exact current employment and salary are not inferred from legacy or broader groups. Broader 2332 vacancy growth and long-run projections receive partial credit, and direct accredited study routes support a strong entry-level score.'
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
  ('AU:civil-engineer', '243231', 'Civil Engineer', 'ANZSCO', '2022', '233211', 5, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2432/243231', '2026-08-08')
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
  ('AU:civil-engineer', 'ACT', '2026-05-01', 3, 36.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:civil-engineer', 'NSW', '2026-05-01', 3, 642.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:civil-engineer', 'NT', '2026-05-01', 3, 28.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:civil-engineer', 'QLD', '2026-05-01', 3, 621.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:civil-engineer', 'SA', '2026-05-01', 3, 148, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:civil-engineer', 'TAS', '2026-05-01', 3, 17.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:civil-engineer', 'VIC', '2026-05-01', 3, 357.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:civil-engineer', 'WA', '2026-05-01', 3, 383, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:civil-engineer', 'job_search', 'SEEK — Civil Engineer jobs', 'https://www.seek.com.au/civil-engineer-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:civil-engineer', 'job_search', 'Workforce Australia — Civil Engineer search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=civil%20engineer', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:civil-engineer', 'employer', 'Aurecon — Careers', 'https://www.aurecongroup.com/careers', 'engineering_consulting', null, 1, '2026-08-08'),
  ('AU:civil-engineer', 'employer', 'WSP Australia — Careers', 'https://www.wsp.com/en-au/careers', 'engineering_consulting', null, 2, '2026-08-08'),
  ('AU:civil-engineer', 'employer', 'Arup Australia — Careers', 'https://www.arup.com/careers/', 'engineering_consulting', null, 3, '2026-08-08'),
  ('AU:civil-engineer', 'employer', 'Jacobs — Careers', 'https://careers.jacobs.com/', 'engineering_consulting', null, 4, '2026-08-08'),
  ('AU:civil-engineer', 'employer', 'CPB Contractors — Careers', 'https://www.cpbcon.com.au/en/our-people-and-careers', 'infrastructure_construction', null, 5, '2026-08-08'),
  ('AU:civil-engineer', 'entry_program', 'Engineers Australia — Migration skills assessment', 'https://www.engineersaustralia.org.au/migrants/migration-skills-assessment', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:civil-engineer', 'entry_program', 'RMIT — Bachelor of Engineering (Civil and Infrastructure) (Honours)', 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/honours-degrees/bh077', 'university_program', null, 2, '2026-08-08'),
  ('AU:civil-engineer', 'entry_program', 'University of Queensland — Master of Civil Engineering (Professional)', 'https://study.uq.edu.au/study-options/programs/master-civil-engineering-professional-5743?year=2026', 'university_program', null, 3, '2026-08-08'),
  ('AU:civil-engineer', 'source', 'ABS — OSCA 243231 Civil Engineer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/243/2432/243231', 'official_classification', null, 1, '2026-08-08'),
  ('AU:civil-engineer', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:civil-engineer', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:civil-engineer', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:civil-engineer', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:civil-engineer', 'source', 'Engineers Australia — Migration skills assessment', 'https://www.engineersaustralia.org.au/migrants/migration-skills-assessment', 'official_skills_assessment', null, 6, '2026-08-08'),
  ('AU:civil-engineer', 'source', 'Federal Register — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:civil-engineer', 'au-program:5789', 'direct', '2026-08-08'),
  ('AU:civil-engineer', 'au-program:1609', 'graduate_entry', '2026-08-08'),
  ('AU:civil-engineer', 'au-program:4967', 'graduate_entry', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
