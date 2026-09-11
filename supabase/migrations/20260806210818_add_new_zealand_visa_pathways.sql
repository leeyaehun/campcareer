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
  ('NZ', 'New Zealand', 'Fee Paying Student Visa', 'Study', 'Full-time study with an approved New Zealand education provider while paying international tuition fees.', 'Immigration New Zealand', 'https://www.immigration.govt.nz/visas/fee-paying-student-visa/', 'Fee Paying Student Visa', date '2026-08-06', 10, true),
  ('NZ', 'New Zealand', 'English Language Student Visa', 'Study', 'Full-time English-language study with an approved New Zealand education provider.', 'Immigration New Zealand', 'https://www.immigration.govt.nz/visas/english-language-student-visa/', 'English Language Student Visa', date '2026-08-06', 20, true),
  ('NZ', 'New Zealand', 'Post Study Work Visa', 'Work', 'Post-study work rights for eligible graduates of approved New Zealand qualifications.', 'Immigration New Zealand', 'https://www.immigration.govt.nz/visas/post-study-work-visa/', 'Post Study Work Visa', date '2026-08-06', 30, true),
  ('NZ', 'New Zealand', 'Student and Trainee Work Visa', 'Work', 'Practical work experience linked to eligible study, professional training or a recognised traineeship.', 'Immigration New Zealand', 'https://www.immigration.govt.nz/visas/student-and-trainee-work-visa/', 'Student and Trainee Work Visa', date '2026-08-06', 40, true),
  ('NZ', 'New Zealand', 'Accredited Employer Work Visa', 'Work', 'Employer-specific work visa for a qualifying full-time job offered by an accredited New Zealand employer.', 'Immigration New Zealand', 'https://www.immigration.govt.nz/visas/accredited-employer-work-visa/', 'Accredited Employer Work Visa', date '2026-08-06', 50, true),
  ('NZ', 'New Zealand', 'Skilled Migrant Category Resident Visa', 'Skilled', 'Points-based residence pathway for people with qualifying skilled work or a skilled job offer from an accredited employer.', 'Immigration New Zealand', 'https://www.immigration.govt.nz/visas/skilled-migrant-category-resident-visa/', 'Skilled Migrant Category Resident Visa', date '2026-08-06', 60, true),
  ('NZ', 'New Zealand', 'Working Holiday', 'Working holiday', 'Holiday-first youth mobility route with temporary work and short study for eligible partner-country citizens.', 'Immigration New Zealand', 'https://www.immigration.govt.nz/work/working-holiday-visas/who-can-apply-for-a-working-holiday-visa/', 'Who can apply for a working holiday visa', date '2026-08-06', 70, true)
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
where country_code = 'NZ'
  and visa_name in ('Student visa', 'Post-Study Work visa', 'Skilled Migrant Category');;
