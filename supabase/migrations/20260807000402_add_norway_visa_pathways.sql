insert into ingest.visa_pathways (
  country_code,
  country_name,
  visa_name,
  kind,
  note,
  authority,
  source_url,
  source_title,
  last_verified_on,
  display_order,
  is_active
)
values
  ('NO', 'Norway', 'University and vocational study permit', 'Study', 'Full-time higher education or approved vocational study with part-time work rights.', 'Norwegian Directorate of Immigration', 'https://www.udi.no/en/want-to-apply/studies/studietillatelse/', 'Study permit', date '2026-08-06', 10, true),
  ('NO', 'Norway', 'Post-study job seeker permit', 'Temporary', 'Up to one year for eligible graduates and researchers to seek skilled employment in Norway.', 'Norwegian Directorate of Immigration', 'https://www.udi.no/en/want-to-apply/work-immigration/job-seekers/', 'Job seekers', date '2026-08-06', 20, true),
  ('NO', 'Norway', 'Skilled worker with employer', 'Skilled', 'Employer-backed residence for qualifying higher-education, vocational or specially qualified workers.', 'Norwegian Directorate of Immigration', 'https://www.udi.no/en/want-to-apply/work-immigration/skilled-workers/', 'Skilled workers', date '2026-08-06', 30, true),
  ('NO', 'Norway', 'Seasonal worker', 'Work', 'Full-time seasonal employment or holiday cover for a limited period.', 'Norwegian Directorate of Immigration', 'https://www.udi.no/en/want-to-apply/work-immigration/seasonal-workers/', 'Seasonal workers', date '2026-08-06', 40, true),
  ('NO', 'Norway', 'Trainee permit', 'Work', 'Curriculum-linked practical training for eligible students enrolled at a foreign higher-education institution.', 'Norwegian Directorate of Immigration', 'https://www.udi.no/en/want-to-apply/work-immigration/vocational-training-and-research/', 'Vocational training and research', date '2026-08-06', 50, true),
  ('NO', 'Norway', 'Working holiday for young adults', 'Working holiday', 'Holiday-first residence with work rights for eligible young citizens of partner countries.', 'Norwegian Directorate of Immigration', 'https://www.udi.no/en/want-to-apply/work-immigration/exchange-programmes-culture-and-organisational-work/', 'Exchange programmes, culture and organisational work', date '2026-08-06', 60, true)
on conflict (country_code, visa_name) do update
set
  country_name = excluded.country_name,
  kind = excluded.kind,
  note = excluded.note,
  authority = excluded.authority,
  source_url = excluded.source_url,
  source_title = excluded.source_title,
  last_verified_on = excluded.last_verified_on,
  display_order = excluded.display_order,
  is_active = excluded.is_active,
  updated_at = now();

update ingest.visa_pathways
set is_active = false,
    updated_at = now()
where country_code = 'NO'
  and visa_name in ('Student visa', 'Skilled Worker', 'Job Seeker');;
