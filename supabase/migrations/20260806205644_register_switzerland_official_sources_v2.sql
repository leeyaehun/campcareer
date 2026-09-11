insert into evidence.sources (
  source_key, organisation_name, source_name, source_type, canonical_url, country_code, active, updated_at
)
values
  ('cc_ch_bfs_earnings_2024_v2', 'Swiss Federal Statistical Office', 'Swiss Earnings Structure Survey 2024', 'government_dataset', 'https://dam-api.bfs.admin.ch/hub/api/dam/assets/36195850/master', 'CH', true, now()),
  ('cc_ch_seco_minimum_wage_2026_v2', 'State Secretariat for Economic Affairs', 'Posting and minimum-wage treatment', 'regulator', 'https://www.seco.admin.ch/en/posting-and-minimum-wage-calculator', 'CH', true, now()),
  ('cc_ch_student_budgets_2026_v2', 'Università della Svizzera italiana and EPFL', 'Regional student living-cost budgets', 'provider', 'https://www.usi.ch/en/education/bachelor/organising-your-studies', 'CH', true, now()),
  ('cc_ch_unige_tuition_2026_v2', 'University of Geneva', 'Semester tuition fees', 'provider', 'https://www.unige.ch/immatriculations/en/informations/fees', 'CH', true, now()),
  ('cc_ch_usi_tuition_2026_v2', 'Università della Svizzera italiana', 'Bachelor and master tuition fees', 'provider', 'https://www.usi.ch/en/education/tuition-and-scholarships', 'CH', true, now()),
  ('cc_ch_sem_student_work_2026_v2', 'State Secretariat for Migration', 'Foreign students and employment', 'regulator', 'https://www.sem.admin.ch/sem/en/home/themen/arbeit/faq.0006.html', 'CH', true, now()),
  ('cc_ch_eda_student_visa_fee_2026_v2', 'Federal Department of Foreign Affairs', 'National visa fees for students', 'regulator', 'https://www.eda.admin.ch/countries/usa/en/home/visa/entry-ch/more-90-days/fees-national.html', 'CH', true, now())
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
    ('cc_ch_bfs_earnings_2024_v2', 'https://dam-api.bfs.admin.ch/hub/api/dam/assets/36195850/master', date '2025-11-25', date '2024-12-31', date '2024-12-31', '{"monthly_p10":4635,"monthly_median":7024,"monthly_p90":12526,"population":"standardised full-time gross wage, private and public sectors","distribution":"P10-P90"}'::jsonb),
    ('cc_ch_seco_minimum_wage_2026_v2', 'https://www.seco.admin.ch/en/posting-and-minimum-wage-calculator', null::date, date '2026-08-06', date '2026-08-06', '{"statutory_national_minimum_wage":false,"cantonal_and_sectoral_mandatory_rates_exist":true,"customary_wages_apply_elsewhere":true}'::jsonb),
    ('cc_ch_student_budgets_2026_v2', 'https://www.usi.ch/en/education/bachelor/organising-your-studies', null::date, date '2026-08-06', date '2026-08-06', '{"usi_monthly_low":1300,"usi_monthly_high":1900,"epfl_monthly_budget":2300,"secondary_url":"https://www.epfl.ch/education/studies/en/financing-study/working/","tuition_excluded":true}'::jsonb),
    ('cc_ch_unige_tuition_2026_v2', 'https://www.unige.ch/immatriculations/en/informations/fees', null::date, date '2026-08-01', date '2026-08-01', '{"semester_fee":500,"annual_fee":1000,"student_type":"Swiss and foreign bachelor and master students"}'::jsonb),
    ('cc_ch_usi_tuition_2026_v2', 'https://www.usi.ch/en/education/tuition-and-scholarships', null::date, date '2026-08-01', date '2026-08-01', '{"semester_fee_standard":4000,"annual_fee_standard":8000,"reduced_semester_fee":2000,"student_type":"Bachelor and master students"}'::jsonb),
    ('cc_ch_sem_student_work_2026_v2', 'https://www.sem.admin.ch/sem/en/home/themen/arbeit/faq.0006.html', date '2026-07-01', date '2026-07-01', date '2026-07-01', '{"semester_hours_per_week":15,"holiday_full_time_possible":true,"non_eu_efta_waiting_months":6,"cantonal_authorisation_required":true,"employer_application_required":true}'::jsonb),
    ('cc_ch_eda_student_visa_fee_2026_v2', 'https://www.eda.admin.ch/countries/usa/en/home/visa/entry-ch/more-90-days/fees-national.html', null::date, date '2026-08-06', date '2026-08-06', '{"student_national_visa_fee":0,"fee_exempt":true,"cantonal_residence_permit_fees_excluded":true,"external_service_fees_excluded":true}'::jsonb)
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
  d.metadata || jsonb_build_object('captured_for', 'campcareer_batch_3_switzerland_2026_08_06', 'country_code', 'CH')
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
