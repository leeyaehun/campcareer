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
  ('SE', 'Sweden', 'Higher education study permit', 'Study', 'Full-time first- or second-cycle higher education with limited semester-time work rights.', 'Swedish Migration Agency', 'https://www.migrationsverket.se/en/you-want-to-apply/study/higher-education.html', 'Higher education residence permit', date '2026-08-06', 10, true),
  ('SE', 'Sweden', 'Post-study job-search permit', 'Temporary', 'Residence after completed Swedish higher education to seek work or explore starting a business.', 'Swedish Migration Agency', 'https://www.migrationsverket.se/en/you-want-to-extend/study/look-for-work-after-completing-your-studies-in-sweden.html', 'Look for work after completed studies', date '2026-08-06', 20, true),
  ('SE', 'Sweden', 'Employee work permit', 'Work', 'Employer-led work permit for employment meeting salary, insurance and Swedish labour-condition rules.', 'Swedish Migration Agency', 'https://www.migrationsverket.se/en/you-want-to-apply/work/employee-or-self-employed/employees.html', 'Work permit for employees', date '2026-08-06', 30, true),
  ('SE', 'Sweden', 'Highly qualified job-seeker permit', 'Temporary', 'Up to nine months for eligible second-cycle graduates outside Sweden to seek work or explore a business.', 'Swedish Migration Agency', 'https://www.migrationsverket.se/en/you-want-to-apply/work/look-for-work/look-for-work-or-start-a-business.html', 'Look for work or start a business', date '2026-08-06', 40, true),
  ('SE', 'Sweden', 'Higher-education traineeship permit', 'Work', 'Paid internship related to ongoing higher education or a recently completed higher-education qualification.', 'Swedish Migration Agency', 'https://www.migrationsverket.se/en/you-want-to-apply/work/temporary-work-in-sweden/traineeships-internships/traineeships-internships-within-the-context-of-higher-education.html', 'Higher-education traineeship or internship', date '2026-08-06', 50, true),
  ('SE', 'Sweden', 'Working Holiday', 'Working holiday', 'Up to one year to experience Swedish life and culture with incidental work for eligible young citizens.', 'Swedish Migration Agency', 'https://www.migrationsverket.se/en/you-want-to-apply/work/temporary-work-in-sweden/working-holiday-visa-for-young-people.html', 'Working holiday visa for young people', date '2026-08-06', 60, true)
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
where country_code = 'SE'
  and visa_name in ('Student visa', 'Work permit', 'Job Seeker visa');;
