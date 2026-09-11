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
  ('JP', 'Japan', 'Student status', 'Study', 'Study at an eligible Japanese university, college, vocational school, Japanese-language school or other recognised institution.', 'Immigration Services Agency of Japan', 'https://www.moj.go.jp/isa/applications/status/student.html', 'Status of residence: Student', date '2026-08-06', 10, true),
  ('JP', 'Japan', 'Post-graduation job hunting', 'Temporary', 'Designated Activities status for eligible graduates continuing a job search started before graduation.', 'Immigration Services Agency of Japan', 'https://www.moj.go.jp/isa/applications/status/designatedactivities14.html', 'Continued job hunting after graduation', date '2026-08-06', 20, true),
  ('JP', 'Japan', 'Engineer / Specialist in Humanities / International Services', 'Skilled', 'Employer-backed professional work requiring technical, humanities or international-services knowledge.', 'Immigration Services Agency of Japan', 'https://www.moj.go.jp/isa/applications/status/gijinkoku.html', 'Engineer, Specialist in Humanities and International Services', date '2026-08-06', 30, true),
  ('JP', 'Japan', 'Specified Skilled Worker (i)', 'Work', 'Employment in an authorised shortage sector after meeting field-skill and Japanese-language requirements.', 'Immigration Services Agency of Japan', 'https://www.moj.go.jp/isa/applications/ssw/index.html', 'Specified Skilled Worker system', date '2026-08-06', 40, true),
  ('JP', 'Japan', 'University internship', 'Work', 'Designated Activities route for a foreign university student completing a curriculum-linked internship in Japan.', 'Immigration Services Agency of Japan', 'https://www.moj.go.jp/isa/applications/status/designatedactivities03.html', 'Designated Activities: internship, summer job and cultural exchange', date '2026-08-06', 50, true),
  ('JP', 'Japan', 'Working Holiday', 'Working holiday', 'Holiday-first youth mobility route with incidental employment for eligible partner-country or region nationals.', 'Ministry of Foreign Affairs of Japan', 'https://www.mofa.go.jp/j_info/visit/w_holiday/', 'The Working Holiday Programmes in Japan', date '2026-08-06', 60, true)
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
where country_code = 'JP'
  and visa_name in ('Student visa', 'Engineer / Specialist in Humanities', 'Technical Intern Training');;
