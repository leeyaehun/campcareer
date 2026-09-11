insert into evidence.sources (
  source_key,
  organisation_name,
  source_name,
  source_type,
  canonical_url,
  country_code,
  active,
  updated_at
)
values
  ('cc_no_ssb_earnings_2025', 'Statistics Norway', '2025 national earnings distribution', 'government_dataset', 'https://www.ssb.no/arbeid-og-lonn/lonn-og-arbeidskraftkostnader/artikler/hva-er-vanlig-lonn-i-norge', 'NO', true, now()),
  ('cc_no_ssb_student_budget_2022', 'Statistics Norway', 'Students budget and 2026/27 finance requirement', 'government_dataset', 'https://www.ssb.no/en/utdanning/hoyere-utdanning/artikler/students-budget', 'NO', true, now()),
  ('cc_no_arbeidstilsynet_minimum_wage_2026', 'Norwegian Labour Inspection Authority', 'Minimum wage coverage', 'regulator', 'https://www.arbeidstilsynet.no/en/pay-and-engagement-of-employees/pay-and-wages/minimum-wage/', 'NO', true, now()),
  ('cc_no_ntnu_tuition_2026', 'Norwegian University of Science and Technology', 'NTNU tuition fees 2026/27', 'provider', 'https://www.ntnu.edu/studies/tuition-fee', 'NO', true, now()),
  ('cc_no_uib_tuition_2026', 'University of Bergen', 'UiB tuition fees 2026/27', 'provider', 'https://www4.uib.no/en/studies/admission-and-application/tuition-fee-for-international-students', 'NO', true, now()),
  ('cc_no_udi_study_permit_2026', 'Norwegian Directorate of Immigration', 'Study permit requirements and fees', 'regulator', 'https://www.udi.no/en/want-to-apply/studies/studietillatelse/', 'NO', true, now())
on conflict (source_key) do update set
  organisation_name = excluded.organisation_name,
  source_name = excluded.source_name,
  source_type = excluded.source_type,
  canonical_url = excluded.canonical_url,
  country_code = excluded.country_code,
  active = true,
  updated_at = now();

with source_rows(source_key, source_url, data_as_of, published_at, metadata) as (
  values
    ('cc_no_ssb_earnings_2025', 'https://www.ssb.no/arbeid-og-lonn/lonn-og-arbeidskraftkostnader/artikler/hva-er-vanlig-lonn-i-norge', date '2025-11-30', date '2026-05-27', '{"secondary_url":"https://www.ssb.no/en/arbeid-og-lonn/lonn-og-arbeidskraftkostnader/statistikk/lonn","reference_period":"November 2025"}'::jsonb),
    ('cc_no_ssb_student_budget_2022', 'https://www.ssb.no/en/utdanning/hoyere-utdanning/artikler/students-budget', date '2026-08-06', date '2025-09-02', '{"survey_year":2022,"secondary_url":"https://studyinnorway.no/cost-and-requirements","finance_requirement_year":"2026/27"}'::jsonb),
    ('cc_no_arbeidstilsynet_minimum_wage_2026', 'https://www.arbeidstilsynet.no/en/pay-and-engagement-of-employees/pay-and-wages/minimum-wage/', date '2026-06-15', null::date, '{"covered_sectors":10,"universal_rate":false}'::jsonb),
    ('cc_no_ntnu_tuition_2026', 'https://www.ntnu.edu/studies/tuition-fee', date '2026-08-01', null::date, '{"academic_year":"2026/27","category":"humanities_social_sciences_business"}'::jsonb),
    ('cc_no_uib_tuition_2026', 'https://www4.uib.no/en/studies/admission-and-application/tuition-fee-for-international-students', date '2026-08-01', date '2026-07-08', '{"academic_year":"2026/27","category":"science_technology_biomedical"}'::jsonb),
    ('cc_no_udi_study_permit_2026', 'https://www.udi.no/en/want-to-apply/studies/studietillatelse/', date '2026-08-06', null::date, '{"fee_url":"https://www.udi.no/en/word-definitions/fees/","adult_study_permit_fee_nok":5400}'::jsonb)
)
insert into evidence.source_snapshots (
  source_id,
  source_url,
  content_sha256,
  published_at,
  data_as_of,
  retrieved_at,
  valid_from,
  snapshot_status,
  metadata
)
select
  s.id,
  r.source_url,
  encode(digest(r.source_key || '|' || r.data_as_of::text, 'sha256'), 'hex'),
  r.published_at,
  r.data_as_of,
  now(),
  r.data_as_of,
  'captured',
  r.metadata
from source_rows r
join evidence.sources s on s.source_key = r.source_key
on conflict (source_id, content_sha256) where content_sha256 is not null do update set
  source_url = excluded.source_url,
  published_at = excluded.published_at,
  data_as_of = excluded.data_as_of,
  retrieved_at = now(),
  valid_from = excluded.valid_from,
  snapshot_status = 'captured',
  metadata = excluded.metadata;;
