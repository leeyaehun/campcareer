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
  ('ES', 'Spain', 'Student visa', 'Study', 'Long-term study authorization for eligible higher education or post-compulsory secondary study.', 'Ministry of Inclusion, Social Security and Migration', 'https://www.inclusion.gob.es/en/web/migraciones/w/estancia-por-estudios', 'Authorization of long-term stay for studies', date '2026-08-06', 10, true),
  ('ES', 'Spain', 'Graduate job-search residence', 'Temporary', 'Non-renewable 24-month residence after eligible Spanish higher education to seek degree-related work or prepare a business project; it does not itself authorise work.', 'Ministry of Inclusion, Social Security and Migration', 'https://www.inclusion.gob.es/web/migraciones/w/20.-autorizacion-de-residencia-para-busqueda-de-empleo-o-inicio-de-proyecto-empresarial', 'Residence authorization for job search or business project', date '2026-08-06', 20, true),
  ('ES', 'Spain', 'Internship residence', 'Work', 'Residence for a qualifying internship agreement or internship employment contract linked to higher education.', 'Ministry of Inclusion, Social Security and Migration', 'https://www.inclusion.gob.es/en/web/migraciones/w/21.-autorizacion-de-residencia-para-practicas', 'Residence authorization for internships', date '2026-08-06', 30, true),
  ('ES', 'Spain', 'Employee work permit', 'Work', 'Employer-led temporary residence and employment authorization for a qualifying job offer.', 'Ministry of Inclusion, Social Security and Migration', 'https://www.inclusion.gob.es/en/web/migraciones/w/autorizacion-inicial-de-residencia-temporal-y-trabajo-por-cuenta-ajena-hi-16-', 'Initial temporary residence and employment authorization', date '2026-08-06', 40, true),
  ('ES', 'Spain', 'Highly Qualified Professional / EU Blue Card', 'Skilled', 'Employer-backed residence for qualifying managerial or highly skilled professional employment.', 'Large Companies and Strategic Groups Unit', 'https://inclusion.gob.es/en/web/unidadgrandesempresas/profesionales-altamente-cualificados', 'Highly qualified professionals', date '2026-08-06', 50, true),
  ('ES', 'Spain', 'Youth Mobility / Working Holiday', 'Working holiday', 'Up to one year of youth mobility under Spain''s bilateral agreements with eligible partner-country nationals.', 'Ministry of Inclusion, Social Security and Migration', 'https://www.inclusion.gob.es/en/web/migraciones/convenios-de-movilidad-de-jovenes', 'Youth mobility agreements', date '2026-08-06', 60, true)
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
where country_code = 'ES'
  and visa_name in ('Employment Permit', 'Working Holiday');;
