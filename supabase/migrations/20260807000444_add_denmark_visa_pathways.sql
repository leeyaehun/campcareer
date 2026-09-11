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
  ('DK', 'Denmark', 'Higher education study permit', 'Study', 'Full-time higher education with limited monthly work rights and full-time summer work.', 'Danish Agency for International Recruitment and Integration', 'https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study/Higher-education', 'Higher educational programmes', date '2026-08-06', 10, true),
  ('DK', 'Denmark', 'Three-year post-study job-seeking permit', 'Temporary', 'Up to three years for eligible graduates of state-approved Danish professional bachelor, bachelor, master or PhD programmes.', 'Danish Agency for International Recruitment and Integration', 'https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study/Study---job-seeking/Study---3-years-job-seeking', 'Job seeking residence permit for 3 years', date '2026-08-06', 20, true),
  ('DK', 'Denmark', 'Positive List for People with Higher Education', 'Skilled', 'Employer-backed permit for a current shortage occupation requiring the listed higher-education level.', 'Danish Agency for International Recruitment and Integration', 'https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Positive-List-Higher-Education', 'Positive List for People with Higher Education', date '2026-08-06', 30, true),
  ('DK', 'Denmark', 'Pay Limit Scheme', 'Work', 'Employer-backed work permit for a Danish job meeting the annual high-salary threshold.', 'Danish Agency for International Recruitment and Integration', 'https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Pay-limit-scheme', 'The Pay Limit Scheme', date '2026-08-06', 40, true),
  ('DK', 'Denmark', 'Internship permit', 'Work', 'Educationally justified internship in an eligible professional field with a qualifying Danish host.', 'Danish Agency for International Recruitment and Integration', 'https://www.nyidanmark.dk/en-GB/You-want-to-apply/Interns', 'Internship', date '2026-08-06', 50, true),
  ('DK', 'Denmark', 'Working Holiday', 'Working holiday', 'Holiday-first youth mobility route with limited salaried work for eligible partner-country citizens.', 'Danish Agency for International Recruitment and Integration', 'https://www.nyidanmark.dk/en-GB/You-want-to-apply/Working-Holiday/Working-Holiday', 'Working Holiday', date '2026-08-06', 60, true)
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
where country_code = 'DK'
  and visa_name in ('Student visa', 'Positive List');;
