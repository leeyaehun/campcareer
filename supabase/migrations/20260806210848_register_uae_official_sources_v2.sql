insert into evidence.sources (
  source_key, organisation_name, source_name, source_type, canonical_url, country_code, active, updated_at
)
values
  ('cc_ae_ilo_lfs_2024_v2', 'International Labour Organization and UAE National Bureau of Statistics', 'United Arab Emirates Labour Force Survey 2024 metadata', 'government_dataset', 'https://webapps.ilo.org/surveyLib/index.php/catalog/8890/study-description', 'AE', true, now()),
  ('cc_ae_wage_policy_benchmarks_2026_v2', 'UAE Government and Ministry of Human Resources and Emiratisation', 'Official salary policy thresholds', 'regulator', 'https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/skill-levels-of-jobs-in-the-uae', 'AE', true, now()),
  ('cc_ae_uagov_minimum_wage_2026_v2', 'UAE Government', 'Payment of salaries or wages', 'regulator', 'https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/payment-of-wages', 'AE', true, now()),
  ('cc_ae_ku_student_budget_2026_v2', 'Khalifa University', 'International student cost of living', 'provider', 'https://www.ku.ac.ae/admissions-old', 'AE', true, now()),
  ('cc_ae_ku_tuition_2026_v2', 'Khalifa University', 'Bachelor of Science tuition estimate', 'provider', 'https://www.ku.ac.ae/fee-and-payment-guidelines', 'AE', true, now()),
  ('cc_ae_aus_tuition_2026_27_v2', 'American University of Sharjah', 'Undergraduate tuition and fees 2026/27', 'provider', 'https://www.aus.edu/node/14616', 'AE', true, now()),
  ('cc_ae_mohre_student_work_2026_v2', 'Ministry of Human Resources and Emiratisation', 'Training and work permit for students', 'regulator', 'https://www.mohre.gov.ae/en/services/training-and-work-permit-for-students-2022', 'AE', true, now()),
  ('cc_ae_icp_student_residence_2026_v2', 'Federal Authority for Identity, Citizenship, Customs and Port Security', 'Issuing residency permit for students', 'regulator', 'https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64', 'AE', true, now())
on conflict (source_key) do update set
  organisation_name = excluded.organisation_name,
  source_name = excluded.source_name,
  source_type = excluded.source_type,
  canonical_url = excluded.canonical_url,
  country_code = excluded.country_code,
  active = true,
  updated_at = now();

with snapshot_data(source_key, source_url, published_at, data_as_of, valid_from, metadata) as (
  values
    ('cc_ae_ilo_lfs_2024_v2', 'https://webapps.ilo.org/surveyLib/index.php/catalog/8890/study-description', date '2026-01-04', date '2024-12-31', date '2024-12-31', '{"survey_reference":"ARE_2024_LFS_v01_M_ILO_VAR","national_coverage":true,"earnings_variable_published_in_catalog_scope":false,"covered_topics":["labour force status","occupation","industry","weekly hours"]}'::jsonb),
    ('cc_ae_wage_policy_benchmarks_2026_v2', 'https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/skill-levels-of-jobs-in-the-uae', date '2026-01-01', date '2026-01-01', date '2026-01-01', '{"skilled_work_monthly_salary_threshold":4000,"emirati_private_sector_monthly_minimum":6000,"secondary_url":"https://www.mohre.gov.ae/en/media-center/news/31/12/2025/mohre-raises-minimum-wage-for-emiratis-in-the-private-sector-to-aed-6000-per-month-effective-1","different_policy_populations":true,"observed_market_distribution":false}'::jsonb),
    ('cc_ae_uagov_minimum_wage_2026_v2', 'https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/payment-of-wages', null::date, date '2026-08-06', date '2026-08-06', '{"general_statutory_minimum_salary":false,"emirati_private_sector_monthly_minimum":6000,"specific_policy_exception":true}'::jsonb),
    ('cc_ae_ku_student_budget_2026_v2', 'https://www.ku.ac.ae/admissions-old', null::date, date '2026-08-06', date '2026-08-06', '{"undergraduate_on_campus_monthly_excluding_tuition":6250,"undergraduate_off_campus_monthly_excluding_tuition":7100,"location":"Abu Dhabi","national_average":false}'::jsonb),
    ('cc_ae_ku_tuition_2026_v2', 'https://www.ku.ac.ae/fee-and-payment-guidelines', null::date, date '2026-08-01', date '2026-08-01', '{"bsc_estimated_annual_tuition":81250,"per_credit_hour":2500,"housing_and_other_fees_excluded":true}'::jsonb),
    ('cc_ae_aus_tuition_2026_27_v2', 'https://www.aus.edu/node/14616', date '2026-03-16', date '2026-08-01', date '2026-08-01', '{"undergraduate_annual_tuition":110876,"academic_year":"2026/27","technology_application_housing_and_insurance_fees_excluded":true}'::jsonb),
    ('cc_ae_mohre_student_work_2026_v2', 'https://www.mohre.gov.ae/en/services/training-and-work-permit-for-students-2022', null::date, date '2026-08-06', date '2026-08-06', '{"student_permit_validity_months":3,"federal_permit_fee":50,"separate_universal_student_weekly_cap_published":false,"general_private_sector_normal_hours_per_week":48,"secondary_url":"https://u.ae/en/information-and-services/jobs/working-hours"}'::jsonb),
    ('cc_ae_icp_student_residence_2026_v2', 'https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64', date '2024-12-11', date '2026-08-06', date '2026-08-06', '{"application_fee":100,"first_year_residence_issuance_fee":100,"smart_service_fee":100,"base_total":300,"medical_emirates_id_insurance_status_adjustment_and_sponsor_fees_excluded":true}'::jsonb)
)
insert into evidence.source_snapshots (
  source_id, source_url, content_sha256, published_at, data_as_of, retrieved_at, valid_from, snapshot_status, metadata
)
select
  s.id,
  d.source_url,
  encode(digest(d.source_key || '|' || d.data_as_of::text || '|' || d.metadata::text, 'sha256'), 'hex'),
  d.published_at,
  d.data_as_of,
  now(),
  d.valid_from,
  'captured',
  d.metadata || jsonb_build_object('captured_for', 'campcareer_batch_3_uae_2026_08_06', 'country_code', 'AE')
from snapshot_data d
join evidence.sources s on s.source_key = d.source_key
on conflict (source_id, content_sha256) where content_sha256 is not null do update set
  source_url = excluded.source_url,
  published_at = excluded.published_at,
  data_as_of = excluded.data_as_of,
  retrieved_at = excluded.retrieved_at,
  valid_from = excluded.valid_from,
  snapshot_status = 'captured',
  metadata = excluded.metadata;;
