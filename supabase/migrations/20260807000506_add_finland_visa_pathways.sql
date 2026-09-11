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
  ('FI', 'Finland', 'Residence permit for studies', 'Study', 'Degree, vocational-qualification or exchange study with average weekly work rights.', 'Finnish Immigration Service', 'https://migri.fi/en/residence-permit-application-for-studies', 'Residence permit application for studies', date '2026-08-07', 10, true),
  ('FI', 'Finland', 'Post-study job-search and business permit', 'Temporary', 'Up to two years for eligible graduates and researchers to seek work or start a business.', 'Finnish Immigration Service', 'https://migri.fi/en/application-for-students-and-researchers-residence-permit-to-look-for-work', 'Residence permit to look for work or start a business', date '2026-08-07', 20, true),
  ('FI', 'Finland', 'Residence permit for an employed person', 'Work', 'Employer-backed permit for regular employment, potentially subject to labour-market testing.', 'Finnish Immigration Service', 'https://migri.fi/en/residence-permit-for-an-employed-person', 'Residence permit for an employed person', date '2026-08-07', 30, true),
  ('FI', 'Finland', 'Specialist residence permit', 'Skilled', 'Fast-track eligible permit for highly skilled expert duties meeting the specialist salary threshold.', 'Finnish Immigration Service', 'https://migri.fi/en/specialist', 'Residence permit for a specialist', date '2026-08-07', 40, true),
  ('FI', 'Finland', 'Internship residence permit', 'Work', 'Paid education-related internship for eligible students, recent graduates or exchange participants.', 'Finnish Immigration Service', 'https://migri.fi/en/internship', 'Residence permit for internship', date '2026-08-07', 50, true),
  ('FI', 'Finland', 'Working Holiday', 'Working holiday', 'Holiday-first residence with work rights for eligible Australian, New Zealand, Japanese and Canadian citizens.', 'Finnish Immigration Service', 'https://migri.fi/en/working-holiday/en', 'Residence permit for Working Holiday', date '2026-08-07', 60, true)
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
where country_code = 'FI'
  and visa_name in ('Student visa', 'Work-based residence permit', 'Specialist residence permit');;
