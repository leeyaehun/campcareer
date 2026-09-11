-- Australia Engineering Technician umbrella profile.
-- Current OSCA does not define one six-digit occupation named exactly "Engineering Technician".
-- CampCareer models the canonical career across five current Engineering Technician occupations in OSCA Minor Group 313.
-- Exact employment is summed only across four one-to-one legacy mappings; ANZSCO 312999 is contextual because it maps to multiple current OSCA occupations.

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = case osca_code
      when '313132' then 'Reviewed OSCA 313132 Civil Engineering Technician correspondence to ANZSCO 312212. The current CSOL includes 312212 with VETASSESS as assessing authority.'
      when '313232' then 'Reviewed OSCA 313232 Electrical Engineering Technician correspondence to ANZSCO 312312. The current CSOL includes 312312 with Trades Recognition Australia (TRA) as assessing authority.'
      when '313932' then 'Reviewed OSCA 313932 Electronic Engineering Technician correspondence to ANZSCO 312412. The current CSOL includes 312412 with Trades Recognition Australia (TRA) as assessing authority.'
      when '313934' then 'Reviewed OSCA 313934 Mechanical Engineering Technician correspondence to ANZSCO 312512. The current CSOL includes 312512 with Trades Recognition Australia (TRA) as assessing authority.'
      when '313999' then 'Reviewed OSCA 313999 Engineering Technicians nec correspondence to legacy ANZSCO 312999. The current CSOL includes Building and Engineering Technicians nec 312999 with Engineers Australia and VETASSESS; legacy 312999 also maps to current Architectural Technician and Biomedical Technician, so its labour-market profile is not treated as exact for current 313999.'
      else reviewer_note
    end
where osca_code in ('313132', '313232', '313932', '313934', '313999')
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

update public.courses_au
set official_course_url = 'https://www.swinburne.edu.au/course/undergraduate/associate-degree-of-engineering/',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where institution_id = 'swinburne-university-of-technology'
  and course_code = '108893E';

update public.courses_au
set official_course_url = 'https://www.rmit.edu.au/study-with-us/levels-of-study/vocational-study/advanced-diplomas/advanced-diploma-of-engineering-technology-civil-engineering-design-c6190',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider course page, manually verified'
where institution_id = 'rmit-university'
  and course_code = '119171D';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:engineering-technician', 'AU', 'engineering-technician', 'Engineering Technicians',
  'OSCA', '2024 v1.0', '313', 'AUD', true,
  'Umbrella profile across OSCA Engineering Technician occupations; role-specific licensing may apply and migration assessing authority varies by nominated occupation',
  'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/313',
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
  'AU:engineering-technician', '2026-05-01', 15100, null, null, null,
  1852, 14, 8, 42, 44, 1255.00001, '2026-05-01', 6.51,
  5.90, 11.72, 15, 0, 5, 5, 15, 0, 5, 10, 5, 60,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Engineering Technician is a CampCareer umbrella career over current OSCA Minor Group 313 Engineering Technicians. The tracked core occupations are 313132 Civil Engineering Technician, 313232 Electrical Engineering Technician, 313932 Electronic Engineering Technician, 313934 Mechanical Engineering Technician and 313999 Engineering Technicians nec. OSCA assigns Skill Level 2 to Engineering Technicians, corresponding to an AQF Associate Degree, Advanced Diploma, Diploma or at least three years of relevant experience.',
    'exact_employment_scope', 'The displayed employment total of 15,100 sums only four directly aligned JSA six-digit legacy profiles: ANZSCO 312212 Civil Engineering Technician (3,500), 312312 Electrical Engineering Technician (6,800), 312412 Electronic Engineering Technician (3,600) and 312512 Mechanical Engineering Technician (1,200). Weighted demographics across these four profiles are approximately 14% part time, 8% female, median age 42 and 44 average full-time hours per week.',
    'nec_mapping_caveat', 'Legacy ANZSCO 312999 Building and Engineering Technicians nec reports about 5,600 workers but now corresponds to multiple current OSCA occupations including Architectural Technician, Biomedical Technician and Engineering Technicians nec. It is therefore excluded from the exact employment rollup and retained only as contextual evidence.',
    'earnings_scope', 'The tracked six-digit JSA technician profiles do not publish a common exact earnings series that can be safely aggregated across the canonical umbrella. Existing discipline-specific salary observations are not combined into one Engineering Technician salary, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average aggregate of 1,255.00001 sums broader ANZSCO 3122, 3123, 3124, 3125 and 3129 vacancy groups. May 2025 summed to 1,178.33333, giving about +6.51% year-on-year. These groups also include draftspersons and other technicians, so vacancy intensity is not scored; the positive broader trend receives partial credit.',
    'projection_scope', 'Aggregating JSA Employment Projections across broader ANZSCO 3122, 3123, 3124, 3125 and 3129 gives about +5.90% from May 2025 to May 2030 and +11.72% to May 2035. These values receive partial growth credit because the groups are broader than the five tracked current technician occupations.',
    'shortage_note', 'The reviewed 2025 Occupation Shortage List records current OSCA 313132 Civil Engineering Technician, 313232 Electrical Engineering Technician, 313932 Electronic Engineering Technician and 313934 Mechanical Engineering Technician as national shortage occupations. Engineering Technicians nec does not carry the same exact national shortage signal in the current snapshot. The umbrella therefore receives partial shortage credit rather than the full single-occupation shortage score.',
    'visa_basis', 'The current CSOL includes legacy ANZSCO 312212 Civil Engineering Technician, 312312 Electrical Engineering Technician, 312412 Electronic Engineering Technician, 312512 Mechanical Engineering Technician and 312999 Building and Engineering Technicians nec. Assessing authority varies by occupation: VETASSESS for Civil Engineering Technician, TRA for Electrical, Electronic and Mechanical Engineering Technician, and Engineers Australia or VETASSESS for 312999. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'There is no single national licence for the whole Engineering Technician umbrella. ABS notes that registration or licensing may be required for several technician occupations, and requirements depend on discipline, jurisdiction and the work performed.',
    'entry_level_basis', 'Swinburne offers a two-year Associate Degree of Engineering with Civil, Electrical, Mechanical and Mechatronics majors, professional accreditation by Engineers Australia and associate-engineering career outcomes. RMIT offers a two-year Advanced Diploma of Engineering Technology (Civil Engineering Design), accredited by Engineers Australia at Engineering Associate level and recognised under the Dublin Accord. These are direct lower-duration technical engineering pathways compared with four-year Professional Engineer degrees.',
    'entry_burden_basis', 'OSCA assigns Skill Level 2 rather than Skill Level 1. A two-year Associate Degree or Advanced Diploma can provide a direct entry foundation, although licensing, migration skills assessment or discipline-specific competency requirements may still apply.',
    'employer_diversity_basis', 'Curated employer coverage spans multidisciplinary engineering consulting, infrastructure, resources, industrial operations and technical services; replace with posting-level unique-employer counts when available.',
    'score_note', 'Engineering Technician receives partial shortage credit because four directly aligned discipline technician occupations are nationally shortage-rated while the umbrella also includes Engineering Technicians nec. Exact employment is limited to four one-to-one mappings, salary and vacancy intensity are not inferred, broader vacancy trend and growth receive partial credit, and direct two-year accredited pathways support high entry-level access.'
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
  ('AU:engineering-technician', '313132', 'Civil Engineering Technician', 'ANZSCO', '2022', '312212', 5, true, true, 1, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/313/3131/313132', '2026-08-08'),
  ('AU:engineering-technician', '313232', 'Electrical Engineering Technician', 'ANZSCO', '2022', '312312', 5, true, true, 2, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/313/3132/313232', '2026-08-08'),
  ('AU:engineering-technician', '313932', 'Electronic Engineering Technician', 'ANZSCO', '2022', '312412', 5, true, true, 3, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/313/3139/313932', '2026-08-08'),
  ('AU:engineering-technician', '313934', 'Mechanical Engineering Technician', 'ANZSCO', '2022', '312512', 5, true, true, 4, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/313/3139/313934', '2026-08-08'),
  ('AU:engineering-technician', '313999', 'Engineering Technicians nec', 'ANZSCO', '2022', '312999', null, true, false, 5, 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/313/3139/313999', '2026-08-08')
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
  ('AU:engineering-technician', 'ACT', '2026-05-01', null, 8.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:engineering-technician', 'NSW', '2026-05-01', null, 293, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:engineering-technician', 'NT', '2026-05-01', null, 18.99999, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:engineering-technician', 'QLD', '2026-05-01', null, 337.33332, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:engineering-technician', 'SA', '2026-05-01', null, 77.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:engineering-technician', 'TAS', '2026-05-01', null, 15.99999, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:engineering-technician', 'VIC', '2026-05-01', null, 160.33334, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:engineering-technician', 'WA', '2026-05-01', null, 343.66666, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:engineering-technician', 'job_search', 'SEEK — Engineering Technician jobs', 'https://www.seek.com.au/engineering-technician-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:engineering-technician', 'job_search', 'Workforce Australia — Engineering Technician search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=engineering%20technician', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:engineering-technician', 'employer', 'GHD — Careers', 'https://www.ghd.com/en-au/careers', 'engineering_consulting', null, 1, '2026-08-08'),
  ('AU:engineering-technician', 'employer', 'BHP — Careers in Australia', 'https://www.bhp.com/careers/global-careers/careers-in-australia', 'mining_resources', null, 2, '2026-08-08'),
  ('AU:engineering-technician', 'employer', 'Aurecon — Careers', 'https://www.aurecongroup.com/careers', 'engineering_consulting', null, 3, '2026-08-08'),
  ('AU:engineering-technician', 'employer', 'WSP Australia — Careers', 'https://www.wsp.com/en-au/careers', 'engineering_consulting', null, 4, '2026-08-08'),
  ('AU:engineering-technician', 'employer', 'CPB Contractors — Careers', 'https://www.cpbcon.com.au/en/our-people-and-careers', 'infrastructure_construction', null, 5, '2026-08-08'),
  ('AU:engineering-technician', 'entry_program', 'Engineers Australia — Engineering Associate category', 'https://www.engineersaustralia.org.au/about-engineering/occupational-categories', 'official_accreditation', null, 1, '2026-08-08'),
  ('AU:engineering-technician', 'entry_program', 'Swinburne — Associate Degree of Engineering', 'https://www.swinburne.edu.au/course/undergraduate/associate-degree-of-engineering/', 'university_program', null, 2, '2026-08-08'),
  ('AU:engineering-technician', 'entry_program', 'RMIT — Advanced Diploma of Engineering Technology (Civil Engineering Design)', 'https://www.rmit.edu.au/study-with-us/levels-of-study/vocational-study/advanced-diplomas/advanced-diploma-of-engineering-technology-civil-engineering-design-c6190', 'university_program', null, 3, '2026-08-08'),
  ('AU:engineering-technician', 'source', 'ABS — OSCA Minor Group 313 Engineering Technicians', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/313', 'official_classification', null, 1, '2026-08-08'),
  ('AU:engineering-technician', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:engineering-technician', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:engineering-technician', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:engineering-technician', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:engineering-technician', 'source', 'Federal Register — current Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 6, '2026-08-08'),
  ('AU:engineering-technician', 'source', 'Engineers Australia — Accreditation and Engineering Associate pathways', 'https://www.engineersaustralia.org.au/about-us/accreditation', 'official_accreditation', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:engineering-technician', 'au-program:' || id::text, 'direct', '2026-08-08'::date
from public.courses_au
where (institution_id = 'swinburne-university-of-technology' and course_code = '108893E')
   or (institution_id = 'rmit-university' and course_code = '119171D')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
