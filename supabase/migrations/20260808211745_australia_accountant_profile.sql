-- Australia Accountant profile.
-- Exact current occupation: OSCA 211131 Accountant (General).
-- Legacy ANZSCO 221111 is not one-to-one because current OSCA 211133 Forensic Accountant also maps to 221111.
-- JSA 221111 employment/demographics and broader 2211 earnings, vacancies and projections are therefore contextual rather than exact current Accountant (General) observations.

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + current skilled occupation list',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2111/211131',
    last_verified = '2026-08-08',
    anzsco_v13 = '221111'
where anzsco_code = '211131'
  and occupation_en = 'Accountant (General)';

update ingest.visa_occupation_status_au
set reviewed_at = now(),
    reviewer_note = 'Reviewed OSCA 211131 Accountant (General) correspondence to legacy ANZSCO 221111. The current skilled occupation list includes 221111. CPA Australia, Chartered Accountants Australia and New Zealand (CA ANZ), and the Institute of Public Accountants (IPA) provide approved migration skills assessments. Legacy 221111 also corresponds to current OSCA 211133 Forensic Accountant, so its labour-market profile is not treated as exact for current 211131.'
where osca_code = '211131'
  and anzsco_v13_code = '221111'
  and list_name = 'Core Skills Occupation List (CSOL)'
  and status = 'eligible';

update public.courses_au
set official_course_url = 'https://coursehandbook.mq.edu.au/2026/courses/c000014',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider 2026 course handbook, manually verified'
where institution_id = 'macquarie-university'
  and course_code = '099149E';

update public.courses_au
set official_course_url = 'https://coursehandbook.mq.edu.au/2026/courses/c000083',
    official_url_status = 'verified',
    official_url_checked_at = now(),
    official_url_source = 'Provider 2026 course handbook, manually verified'
where institution_id = 'macquarie-university'
  and course_code = '099183C';

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:accountant', 'AU', 'accountant', 'Accountant (General)',
  'OSCA', '2024 v1.0', '2111', 'AUD', true,
  'Licensing or registration may apply to specific services; CPA Australia, CA ANZ and IPA are migration skills assessing authorities for legacy ANZSCO 221111',
  'https://www.cpaaustralia.com.au/migration-services/migration-to-australia',
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
  'AU:accountant', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 3522.33333, '2026-05-01', -4.46,
  8.44, 16.63, 0, 0, 5, 0, 13, 0, 5, 10, 3, 36,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'Current OSCA 211131 Accountant (General) provides services relating to compliance-based financial, non-financial and sustainability-related reporting, auditing, insolvency and accounting information systems, and advises on associated record-keeping requirements. ABS assigns Skill Level 1 and notes registration or licensing may be required for certain services such as auditing.',
    'legacy_mapping', 'Legacy ANZSCO 221111 Accountant (General) is not a one-to-one current mapping because both OSCA 211131 Accountant (General) and OSCA 211133 Forensic Accountant correspond to 221111. Legacy six-digit labour-market observations are therefore contextual rather than exact current 211131 values.',
    'legacy_221111_context', jsonb_build_object(
      'employment_total', 139100,
      'part_time_share_pct', 22,
      'female_share_pct', 54,
      'median_age', 40,
      'average_full_time_hours', 43,
      'data_as_at', '2026-02-01',
      'scope', 'JSA six-digit legacy ANZSCO 221111 Accountant (General); broader than current OSCA 211131 because current Forensic Accountant also maps to 221111'
    ),
    'broader_anzsco_2211_context', jsonb_build_object(
      'employment_total', 215500,
      'median_weekly_earnings_aud', 2003,
      'median_hourly_earnings_aud', 53,
      'part_time_share_pct', 16,
      'female_share_pct', 54,
      'median_age', 42,
      'average_full_time_hours', 43,
      'scope', 'ANZSCO 2211 Accountants; includes General, Management and Taxation Accountants'
    ),
    'earnings_scope', 'No exact current OSCA 211131 earnings series is stored. Broader ANZSCO 2211 median earnings of A$2,003 per week and A$53 per hour are retained as context only, so the salary component remains zero.',
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 3,522.33333 and state vacancy values are published at broader ANZSCO 2211. May 2025 was 3,686.66667, giving about -4.46% year on year. Vacancy intensity is not scored because the vacancy numerator is broader than current Accountant (General), and the negative broader trend receives no vacancy-trend credit.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2211 are +8.44% from May 2025 to May 2030 and +16.63% to May 2035. These receive partial growth credit because the group includes multiple accountant occupations.',
    'shortage_note', 'The reviewed JSA 2025 Occupation Shortage List records current OSCA 211131 Accountant (General) as No Shortage nationally and in all eight states and territories. The national shortage component is therefore zero.',
    'visa_basis', 'Legacy ANZSCO 221111 Accountant (General) is on the current skilled occupation list, including current employer-sponsored CSOL coverage. CPA Australia, CA ANZ and IPA are approved accounting migration skills assessing authorities. Occupation-list inclusion does not determine individual visa eligibility.',
    'registration_basis', 'There is no single universal licence for all employee accountants. ABS notes registration or licensing may be required for particular services such as auditing, while tax-agent, registered company auditor and public-practice activities can carry separate statutory or professional requirements.',
    'entry_level_basis', 'Macquarie University offers a three-year Bachelor of Professional Accounting, CRICOS 099149E, accredited by CPA Australia, CA ANZ, IPA and ACCA. Its Master of Professional Accounting, CRICOS 099183C, provides a two-year postgraduate pathway and is accredited by CA ANZ, CPA Australia and ACCA. These are direct professional-accounting study routes.',
    'entry_burden_basis', 'OSCA assigns Skill Level 1. A bachelor degree or higher qualification is the standard study route, and professional membership or statutory registration can add further requirements for specific accounting services.',
    'employer_diversity_basis', 'Curated coverage spans Big Four professional services, mid-tier accounting and advisory firms, and corporate finance teams; replace with posting-level unique-employer counts when available.',
    'score_note', 'Accountant receives verified skilled-occupation-list and direct-study credit but no 2025 national shortage credit. Exact current employment and salary are not inferred from the split legacy mapping. Broader 2211 vacancies declined year on year and receive no trend credit, while long-run projections receive partial growth credit.'
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
  'AU:accountant', '211131', 'Accountant (General)', 'ANZSCO', '2022', '221111',
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
  ('AU:accountant', 'ACT', '2026-05-01', null, 61.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:accountant', 'NSW', '2026-05-01', null, 1179.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:accountant', 'NT', '2026-05-01', null, 15.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:accountant', 'QLD', '2026-05-01', null, 846.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:accountant', 'SA', '2026-05-01', null, 175.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:accountant', 'TAS', '2026-05-01', null, 29.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:accountant', 'VIC', '2026-05-01', null, 843.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:accountant', 'WA', '2026-05-01', null, 370.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:accountant', 'job_search', 'SEEK — Accountant jobs', 'https://www.seek.com.au/accountant-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:accountant', 'job_search', 'Workforce Australia — Accountant search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=accountant', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:accountant', 'employer', 'Deloitte Australia — Careers', 'https://www.deloitte.com/au/en/careers.html', 'professional_services', null, 1, '2026-08-08'),
  ('AU:accountant', 'employer', 'PwC Australia — Careers', 'https://www.pwc.com.au/careers.html', 'professional_services', null, 2, '2026-08-08'),
  ('AU:accountant', 'employer', 'EY Australia — Careers', 'https://www.ey.com/en_au/careers', 'professional_services', null, 3, '2026-08-08'),
  ('AU:accountant', 'employer', 'KPMG Australia — Careers', 'https://kpmg.com/au/en/home/careers.html', 'professional_services', null, 4, '2026-08-08'),
  ('AU:accountant', 'employer', 'BDO Australia — Careers', 'https://www.bdo.com.au/en-au/careers', 'professional_services', null, 5, '2026-08-08'),
  ('AU:accountant', 'entry_program', 'CPA Australia — Migration skills assessment', 'https://www.cpaaustralia.com.au/migration-services/migration-to-australia', 'official_skills_assessment', null, 1, '2026-08-08'),
  ('AU:accountant', 'entry_program', 'CA ANZ — Migration skills assessment', 'https://www.charteredaccountantsanz.com/become-a-member/migration-assessment', 'official_skills_assessment', null, 2, '2026-08-08'),
  ('AU:accountant', 'entry_program', 'Macquarie — Bachelor of Professional Accounting', 'https://coursehandbook.mq.edu.au/2026/courses/c000014', 'university_program', null, 3, '2026-08-08'),
  ('AU:accountant', 'entry_program', 'Macquarie — Master of Professional Accounting', 'https://coursehandbook.mq.edu.au/2026/courses/c000083', 'university_program', null, 4, '2026-08-08'),
  ('AU:accountant', 'source', 'ABS — OSCA 211131 Accountant (General)', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2111/211131', 'official_statistics', null, 1, '2026-08-08'),
  ('AU:accountant', 'source', 'JSA — Accountants (General) ANZSCO 221111 profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/221111-accountants-general', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:accountant', 'source', 'JSA — Accountants ANZSCO 2211 profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2211-accountants', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:accountant', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:accountant', 'source', 'JSA — Employment Projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 5, '2026-08-08'),
  ('AU:accountant', 'source', 'JSA — 2025 Occupation Shortage List', 'https://www.jobsandskills.gov.au/data/occupation-shortages-analysis/occupation-shortage-list', 'official_labour_market', null, 6, '2026-08-08'),
  ('AU:accountant', 'source', 'Home Affairs — Skilled occupation list', 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list', 'official_migration', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
)
select 'AU:accountant', 'au-program:' || id::text, relation_type, '2026-08-08'::date
from (
  select id, 'direct'::text as relation_type
  from public.courses_au
  where institution_id = 'macquarie-university' and course_code = '099149E'
  union all
  select id, 'graduate_entry'::text as relation_type
  from public.courses_au
  where institution_id = 'macquarie-university' and course_code = '099183C'
) programs
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;
;
