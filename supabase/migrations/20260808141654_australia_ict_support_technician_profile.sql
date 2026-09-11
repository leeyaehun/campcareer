-- Australia ICT Support Technician profile.
-- CampCareer canonical career maps to current OSCA 314231 ICT Customer Support Officer.
-- Legacy ANZSCO 313112 ICT Customer Support Officer remains the migration occupation assessed by TRA.
-- JSA provides six-digit employment/demographic data for 313112, while earnings, vacancies and projections remain broader ANZSCO 3131 context.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + current CSOL instrument',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/314/3142/314231',
    last_verified = '2026-08-08',
    anzsco_v13 = '313112'
where anzsco_code = '314231'
  and occupation_en = 'ICT Customer Support Officer';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed OSCA 314231 ICT Customer Support Officer correspondence to ANZSCO 313112 ICT Customer Support Officer. The current CSOL includes 313112 and Trades Recognition Australia (TRA) is the assessing authority.'
where osca_code = '314231'
  and anzsco_v13_code = '313112'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:ict-support-technician', 'AU', 'ict-support-technician', 'ICT Customer Support Officer',
  'OSCA', '2024 v1.0', '3142', 'AUD', false,
  'Trades Recognition Australia (TRA) — migration skills assessment only; no statutory national occupational registration',
  'https://www.tradesrecognitionaustralia.gov.au/',
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
  'AU:ict-support-technician', '2026-05-01', 46200, null, null, null,
  1852, 17, 21, 38, 40, 895, '2026-05-01', -0.26,
  9.39, 17.44, 0, 0, 5, 0, 15, 0, 3, 10, 5, 38,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'canonical_mapping_note', 'CampCareer uses ICT Support Technician as the user-facing canonical career. The closest exact current OSCA occupation is 314231 ICT Customer Support Officer, which includes ICT Help Desk Officer and ICT Service Desk Analyst as alternative titles and Network Support Technician as a specialisation.',
    'legacy_mapping', 'ANZSCO 313112 ICT Customer Support Officer is directly title- and duty-aligned with current OSCA 314231 and remains the migration occupation on the Core Skills Occupation List.',
    'exact_legacy_313112_context', jsonb_build_object(
      'employment_total', 46200,
      'part_time_share_pct', 17,
      'female_share_pct', 21,
      'median_age', 38,
      'average_full_time_hours', 40,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit ANZSCO 313112 ICT Customer Support Officer; direct current OSCA correspondence to 314231'
    ),
    'earnings_scope', 'JSA does not provide six-digit earnings for ANZSCO 313112 in the current CampCareer source snapshot. Broader ANZSCO 3131 earnings are not presented as ICT Customer Support Officer earnings and salary scores remain zero.',
    'broader_anzsco_3131_context', jsonb_build_object(
      'employment_total', 77900,
      'median_weekly_earnings_aud', 1687,
      'median_hourly_earnings_aud', 45,
      'scope', 'ANZSCO 3131 ICT Support Technicians; includes Hardware Technician, ICT Customer Support Officer, Web Administrator and ICT Support Technicians nec'
    ),
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 895 and state vacancy values are published at broader ANZSCO 3131. May 2025 was 897.33333, giving approximately -0.26% year-on-year. Vacancy intensity is not scored because the vacancy numerator is broader than exact 313112 employment; the slightly negative broader vacancy trend scores zero.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 3131 are +9.39% from May 2025 to May 2030 and +17.44% to May 2035. These receive partial growth credit because the group contains multiple support occupations.',
    'shortage_note', 'The reviewed 2025 Occupation Shortage List records ICT Customer Support Officer 313112 as No Shortage nationally and in every state and territory. The national shortage component is therefore zero.',
    'visa_basis', 'The current Core Skills Occupation List includes ANZSCO 313112 ICT Customer Support Officer with Trades Recognition Australia as assessing authority. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'There is no single statutory national occupational registration or licence to work as an ICT Customer Support Officer or general IT support technician in Australia. TRA skills assessment is a migration assessment rather than a domestic licence to practise.',
    'entry_level_basis', 'OSCA assigns Skill Level 2 and direct vocational pathways exist. TAFE NSW Certificate IV in Information Technology explicitly prepares students for help desk, ICT operations and client-support roles. Support and service-desk work is also a common first ICT role, so full entry-level credit is used.',
    'entry_burden_basis', 'OSCA Skill Level 2 corresponds to an AQF Associate Degree, Advanced Diploma or Diploma, or at least three years of relevant experience. TRA lists Certificate IV in Information Technology ICT40120 as an accepted qualification for ANZSCO 313112. No statutory occupational licence applies, giving the lowest entry-burden setting in the current methodology.',
    'employer_diversity_basis', 'Curated coverage across telecommunications, managed technology services, enterprise IT, banking and government-facing technology; replace with posting-level unique-employer counts when available.',
    'score_note', 'Provisional score. Exact employment and demographics are retained from directly corresponding ANZSCO 313112. Exact earnings are unavailable, shortage is No Shortage, broader vacancies were nearly flat but slightly negative year on year, broader long-run growth receives partial credit, direct CSOL status is retained, and accessible vocational entry routes receive full entry-level credit.'
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
  ('AU:ict-support-technician', '314231', 'ICT Customer Support Officer', 'ANZSCO', '2022', '313112', null, true, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/314/3142/314231', '2026-08-08')
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
  ('AU:ict-support-technician', 'ACT', '2026-05-01', null, 50, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:ict-support-technician', 'NSW', '2026-05-01', null, 299, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:ict-support-technician', 'NT', '2026-05-01', null, 8.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:ict-support-technician', 'QLD', '2026-05-01', null, 171, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:ict-support-technician', 'SA', '2026-05-01', null, 52, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:ict-support-technician', 'TAS', '2026-05-01', null, 8.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:ict-support-technician', 'VIC', '2026-05-01', null, 221.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:ict-support-technician', 'WA', '2026-05-01', null, 85, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:ict-support-technician', 'job_search', 'SEEK — IT Support Technician jobs', 'https://www.seek.com.au/it-support-technician-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:ict-support-technician', 'job_search', 'Workforce Australia — ICT Support search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=ICT%20support', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:ict-support-technician', 'employer', 'Telstra — Careers', 'https://www.telstra.com.au/careers', 'telecommunications', null, 1, '2026-08-08'),
  ('AU:ict-support-technician', 'employer', 'Fujitsu Australia — Careers', 'https://www.fujitsu.com/au/about/careers/', 'technology_services', null, 2, '2026-08-08'),
  ('AU:ict-support-technician', 'employer', 'Datacom — Careers', 'https://careers.datacom.com/', 'technology_services', null, 3, '2026-08-08'),
  ('AU:ict-support-technician', 'employer', 'Leidos Australia — Careers', 'https://auscareers.leidos.com/', 'technology_defence', null, 4, '2026-08-08'),
  ('AU:ict-support-technician', 'employer', 'Commonwealth Bank — Technology careers', 'https://www.commbank.com.au/about-us/careers/technology.html', 'bank', null, 5, '2026-08-08'),
  ('AU:ict-support-technician', 'entry_program', 'TRA — Employment Verification Report: ICT Customer Support Officer', 'https://www.tradesrecognitionaustralia.gov.au/policy-and-forms/employment-verification-report', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:ict-support-technician', 'entry_program', 'TAFE NSW — Certificate IV in Information Technology', 'https://www.tafensw.edu.au/international/courses/certificate-iv-in-information-technology--ICT40120', 'official_training_provider', null, 2, '2026-08-08'),
  ('AU:ict-support-technician', 'entry_program', 'RMIT — Associate Degree in Information Technology', 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/associate-degrees/associate-degree-in-information-technology-ad006', 'official_training_provider', null, 3, '2026-08-08'),
  ('AU:ict-support-technician', 'source', 'ABS — OSCA 314231 ICT Customer Support Officer', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/314/3142/314231', 'official_classification', null, 1, '2026-08-08'),
  ('AU:ict-support-technician', 'source', 'TRA — ICT Customer Support Officer', 'https://www.tradesrecognitionaustralia.gov.au/policy-and-forms/employment-verification-report', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:ict-support-technician', 'source', 'JSA — Occupation profiles', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:ict-support-technician', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:ict-support-technician', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:ict-support-technician', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortage', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:ict-support-technician', 'source', 'Home Affairs / legislation — Core Skills Occupation List', 'https://www.legislation.gov.au/F2024L01618/latest/text', 'official_visa', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:ict-support-technician', 'au-program:18438', 'direct', '2026-08-08'),
  ('AU:ict-support-technician', 'au-program:18532', 'direct', '2026-08-08'),
  ('AU:ict-support-technician', 'au-program:15189', 'direct', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
