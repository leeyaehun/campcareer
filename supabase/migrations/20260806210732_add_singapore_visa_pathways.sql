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
  ('SG', 'Singapore', 'Student''s Pass', 'Study', 'Study at an eligible Singapore education institution with an ICA-issued Student''s Pass.', 'Immigration & Checkpoints Authority', 'https://www.ica.gov.sg/reside/STP/apply/ihl', 'Student''s Pass for Institutes of Higher Learning', date '2026-08-06', 10, true),
  ('SG', 'Singapore', 'Graduate employment-search LTVP', 'Temporary', 'Long-Term Visit Pass for eligible graduates of listed Singapore institutes of higher learning who are seeking employment.', 'Immigration & Checkpoints Authority', 'https://www.ica.gov.sg/reside/LTVP/apply', 'Becoming a Long-Term Visit Pass Holder', date '2026-08-06', 20, true),
  ('SG', 'Singapore', 'Employment Pass', 'Skilled', 'Employer-sponsored pass for qualifying professionals, managers and executives who meet salary and COMPASS requirements.', 'Ministry of Manpower', 'https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility', 'Eligibility for Employment Pass', date '2026-08-06', 30, true),
  ('SG', 'Singapore', 'S Pass', 'Work', 'Employer-sponsored pass for qualifying associate professionals and technicians, subject to salary, quota and levy rules.', 'Ministry of Manpower', 'https://www.mom.gov.sg/passes-and-permits/s-pass/eligibility', 'Eligibility for S Pass', date '2026-08-06', 40, true),
  ('SG', 'Singapore', 'Training Employment Pass', 'Work', 'Short, non-renewable professional training attachment for eligible foreign students or overseas-company trainees.', 'Ministry of Manpower', 'https://www.mom.gov.sg/passes-and-permits/training-employment-pass/eligibility', 'Eligibility for Training Employment Pass', date '2026-08-06', 50, true),
  ('SG', 'Singapore', 'Work Holiday Pass', 'Working holiday', 'Six- or twelve-month work-and-holiday route for eligible young students and graduates, depending on nationality and programme.', 'Ministry of Manpower', 'https://www.mom.gov.sg/passes-and-permits/work-holiday-programme/eligibility', 'Eligibility for Work Holiday Programme', date '2026-08-06', 60, true)
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
  updated_at = now();;
