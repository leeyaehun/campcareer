-- Australia Medical Laboratory Technician profile.
-- Current mapping: OSCA 311233 Medical Laboratory Technician.
-- Exact six-digit legacy employment/demographics use ANZSCO 311213.
-- JSA vacancies and projections remain available only at broader legacy ANZSCO 3112 Medical Technicians,
-- so they are stored with explicit provenance and are not used for vacancy-intensity scoring.

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:medical-laboratory-technician', 'AU', 'medical-laboratory-technician', 'Medical Laboratory Technician',
  'OSCA', '2024 v1.0', '3112', 'AUD', false,
  null, null,
  'decision_ready', '2026-08-08', now()
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
  'AU:medical-laboratory-technician', '2026-05-01', 7600, null, null, null,
  1852, 38, 73, 36, 41, 468.66667, '2026-05-01', -14.16,
  7.97, 17.42, 0, 0, 5, 0, 10, 0, 3, 0, 4, 22,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'labour_market_scope', 'CampCareer maps the career exactly to OSCA 311233 and legacy ANZSCO 311213. The 7,600 employment count and six-digit demographics come from the 2021 Census-based JSA occupation page. JSA earnings are not published at six digits. IVI vacancies and employment projections are only available for broader legacy ANZSCO 3112 Medical Technicians, which includes multiple technician occupations.',
    'earnings_note', 'JSA publishes no median weekly or hourly earnings for ANZSCO 311213. CampCareer therefore leaves earnings and annualised salary NULL rather than substituting the broader ANZSCO 3112 earnings series.',
    'vacancy_scope', 'May 2026 national vacancies 468.66667 and May 2025 546.0 are for broader ANZSCO 3112 Medical Technicians, not Medical Laboratory Technicians alone.',
    'vacancy_yoy_basis', 'Broader ANZSCO 3112 May 2026 three-month-average vacancies compared with May 2025: -14.16%.',
    'vacancy_intensity_basis', 'Not scored because the vacancy numerator is ANZSCO 3112 while employment_total is exact ANZSCO 311213; combining them would create a misleading intensity ratio.',
    'growth_scope', 'The +7.97% 2025-2030 and +17.42% 2025-2035 projections are broader ANZSCO 3112 Medical Technicians. Growth receives only a conservative partial component.',
    'shortage_note', 'No occupation_state_au shortage rows were verified for OSCA 311233, so no shortage claim or shortage component is made.',
    'visa_basis', 'No verified current CSOL record is present in CampCareer visa_occupation_status_au for OSCA 311233 / ANZSCO 311213. CampCareer makes no visa-eligibility claim and assigns no visa component.',
    'registration_basis', 'ABS says registration or licensing may be required, but AIMS guidance states there is no statutory national registration or licensing scheme for Australian Medical Laboratory Scientists or Technicians. Employer or laboratory accreditation requirements may still apply.',
    'entry_level_basis', 'Training.gov.au lists MSL40122 Certificate IV in Laboratory Techniques with nil entry requirements. MSL50122 Diploma of Laboratory Technology can be packaged for Pathology and requires a Certificate IV in Laboratory Techniques, another Certificate IV or higher STEM qualification, or evidence of technical laboratory skills and experience.',
    'entry_burden_basis', 'A vocational pathway is available and there is no statutory national occupational registration, but the pathology Diploma has formal entry requirements and employers may set additional competency requirements.',
    'employer_diversity_basis', 'Curated public pathology and private pathology employer coverage; replace with posting-level unique-employer data when available.',
    'score_note', 'Deliberately conservative because shortage, visa status, exact occupation earnings and occupation-specific vacancy intensity are not verified.'
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
  ('AU:medical-laboratory-technician', '311233', 'Medical Laboratory Technician', 'ANZSCO', '2013 v1.3', '311213', null, null, true, 1,
   'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/311/3112/311233', '2026-08-08')
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
  ('AU:medical-laboratory-technician', 'ACT', '2026-05-01', null, 10.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:medical-laboratory-technician', 'NSW', '2026-05-01', null, 119, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:medical-laboratory-technician', 'NT', '2026-05-01', null, 9.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:medical-laboratory-technician', 'QLD', '2026-05-01', null, 88.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:medical-laboratory-technician', 'SA', '2026-05-01', null, 41.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:medical-laboratory-technician', 'TAS', '2026-05-01', null, 6.66667, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:medical-laboratory-technician', 'VIC', '2026-05-01', null, 139, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
  ('AU:medical-laboratory-technician', 'WA', '2026-05-01', null, 54.33333, 'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key, region_code, as_of_date) do update set
  shortage_rating = excluded.shortage_rating,
  vacancy_count = excluded.vacancy_count,
  source_url = excluded.source_url;

insert into public.country_occupation_links (
  profile_key, link_type, label, url, provider_type,
  region_code, sort_order, source_checked_at
) values
  ('AU:medical-laboratory-technician', 'job_search', 'SEEK — Medical Laboratory Technician jobs', 'https://www.seek.com.au/medical-laboratory-technician-jobs', 'private_job_board', null, 1, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'job_search', 'Workforce Australia — Medical Laboratory Technician search', 'https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=medical%20laboratory%20technician', 'government_job_board', null, 2, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'employer', 'NSW Health Pathology — Careers', 'https://pathology.health.nsw.gov.au/careers/', 'public_pathology_service', 'NSW', 1, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'employer', 'Pathology Queensland — Careers', 'https://www.careers.health.qld.gov.au/other-careers/pathology-queensland', 'public_pathology_service', 'QLD', 2, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'employer', 'WA Health — Careers', 'https://www.health.wa.gov.au/Careers', 'public_health_system', 'WA', 3, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'employer', 'Sullivan Nicolaides Pathology — Careers', 'https://sullivan.applynow.net.au/', 'private_pathology_service', null, 4, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'employer', 'SA Health — Careers', 'https://www.sahealth.sa.gov.au/wps/wcm/connect/public+content/sa+health+internet/careers', 'public_health_system', 'SA', 5, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'entry_program', 'training.gov.au — MSL40122 Certificate IV in Laboratory Techniques', 'https://training.gov.au/training/details/MSL40122', 'official_training_register', null, 1, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'entry_program', 'training.gov.au — MSL50122 Diploma of Laboratory Technology', 'https://training.gov.au/training/details/MSL50122', 'official_training_register', null, 2, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'source', 'ABS — OSCA 311233 Medical Laboratory Technician', 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/31/311/3112/311233', 'official_classification', null, 1, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'source', 'JSA — Medical Laboratory Technicians occupation profile', 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/311213-medical-laboratory-technicians', 'official_labour_market', null, 2, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'source', 'JSA — Internet Vacancy Index', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'official_labour_market', null, 3, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'source', 'JSA — Employment projections', 'https://www.jobsandskills.gov.au/data/employment-projections', 'official_labour_market', null, 4, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'source', 'AIMS — Medical Laboratory Technician skills assessment', 'https://aims.org.au/Web/Web/Services/Medical-Laboratory-Technician.aspx', 'official_professional_body', null, 5, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'source', 'training.gov.au — MSL40122 Certificate IV in Laboratory Techniques', 'https://training.gov.au/training/details/MSL40122', 'official_training_register', null, 6, '2026-08-08'),
  ('AU:medical-laboratory-technician', 'source', 'training.gov.au — MSL50122 Diploma of Laboratory Technology', 'https://training.gov.au/training/details/MSL50122', 'official_training_register', null, 7, '2026-08-08')
on conflict (profile_key, link_type, url) do update set
  label = excluded.label,
  provider_type = excluded.provider_type,
  region_code = excluded.region_code,
  sort_order = excluded.sort_order,
  source_checked_at = excluded.source_checked_at;

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:medical-laboratory-technician', 'au-program:18365', 'related', '2026-08-08'),
  ('AU:medical-laboratory-technician', 'au-program:18366', 'direct', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
