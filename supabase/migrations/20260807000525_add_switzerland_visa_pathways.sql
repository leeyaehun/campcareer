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
  ('CH', 'Switzerland', 'Study residence permit', 'Study', 'Residence for recognised education with canton-led financial, insurance and accommodation checks.', 'State Secretariat for Migration', 'https://www.sem.admin.ch/sem/en/home/themen/fza_schweiz-eu-efta/eu-efta_buerger_schweiz/faq.html', 'FAQ – Free Movement of Persons', date '2026-08-07', 10, true),
  ('CH', 'Switzerland', 'Swiss graduate job-search period', 'Temporary', 'Six months for eligible third-country graduates of recognised Swiss higher education to seek qualification-matched work.', 'State Secretariat for Migration', 'https://www.sem.admin.ch/sem/en/home/themen/arbeit/faq.0006.html', 'FAQ – Working', date '2026-08-07', 20, true),
  ('CH', 'Switzerland', 'Non-EU/EFTA highly qualified worker', 'Skilled', 'Employer-led and quota-limited admission for highly qualified third-country managers, specialists and professionals.', 'State Secretariat for Migration', 'https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta-angehoerige.html', 'Non-EU/EFTA nationals', date '2026-08-07', 30, true),
  ('CH', 'Switzerland', 'EU/EFTA employment mobility', 'Work', 'Free-movement route for EU/EFTA nationals with notification, L-permit or B-permit rules based on contract length.', 'State Secretariat for Migration', 'https://www.sem.admin.ch/sem/en/home/overview-arbeit.html', 'Working in Switzerland', date '2026-08-07', 40, true),
  ('CH', 'Switzerland', 'Young Professionals permit', 'Work', 'Up to 18 months of full-time, field-related professional development for eligible partner-country nationals.', 'State Secretariat for Migration', 'https://www.sem.admin.ch/sem/en/home/themen/arbeit/berufspraktikum.html', 'Young professionals', date '2026-08-07', 50, true),
  ('CH', 'Switzerland', 'Third-country au pair permit', 'Temporary', 'Maximum 12-month language and cultural placement for eligible 18–25-year-olds through a recognised Swiss agency.', 'State Secretariat for Migration', 'https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta-angehoerige/grundlagen_zur_arbeitsmarktzulassung.html', 'Basis for admission to the Swiss employment market', date '2026-08-07', 60, true)
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
where country_code = 'CH'
  and visa_name in (
    'Student visa',
    'Residence Permit B (L) — Worker',
    'EU/EFTA mobility'
  );;
