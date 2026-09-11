insert into evidence.sources (source_key, organisation_name, source_name, source_type, canonical_url, country_code, active, updated_at)
values
  ('cc_se_scb_salary_2025', 'Statistics Sweden', 'Salary dispersion by sector and sex 2025', 'government_dataset', 'https://www.scb.se/en/finding-statistics/statistics-by-subject-area/labour-market/wages-salaries-and-labour-costs/salary-structures-whole-economy/pong/tables-and-graphs/salary-dispersion-by-sector-and-sex-2025/', 'SE', true, now()),
  ('cc_se_migration_study_2026', 'Swedish Migration Agency', 'Higher-education residence permit 2026', 'regulator', 'https://www.migrationsverket.se/en/you-want-to-apply/study/higher-education.html', 'SE', true, now()),
  ('cc_se_study_sweden_fees_2026', 'Swedish Institute', 'Study in Sweden fees and costs', 'provider', 'https://studyinsweden.se/plan-your-studies/fees-costs/', 'SE', true, now()),
  ('cc_se_employment_minimum_wage', 'Swedish Public Employment Service', 'Sweden wage-setting and minimum-wage treatment', 'regulator', 'https://arbetsformedlingen.se/other-languages/english-engelska/find-your-new-job-in-sweden', 'SE', true, now())
on conflict (source_key) do update set organisation_name=excluded.organisation_name, source_name=excluded.source_name, source_type=excluded.source_type, canonical_url=excluded.canonical_url, country_code=excluded.country_code, active=true, updated_at=now();

with source_rows(source_key, source_url, data_as_of, published_at, metadata) as (
  values
    ('cc_se_scb_salary_2025', 'https://www.scb.se/en/finding-statistics/statistics-by-subject-area/labour-market/wages-salaries-and-labour-costs/salary-structures-whole-economy/pong/tables-and-graphs/salary-dispersion-by-sector-and-sex-2025/', date '2025-12-31', date '2026-06-16', '{"monthly_q1":32000,"monthly_median":38300,"monthly_q3":48000,"monthly_mean":42900}'::jsonb),
    ('cc_se_migration_study_2026', 'https://www.migrationsverket.se/en/you-want-to-apply/study/higher-education.html', date '2026-06-11', date '2026-05-25', '{"maintenance_requirement_monthly":10656,"living_cost_secondary_url":"https://www.su.se/english/education/new-in-sweden/living-costs","stockholm_budget_monthly":12000,"adult_fee":1500}'::jsonb),
    ('cc_se_study_sweden_fees_2026', 'https://studyinsweden.se/plan-your-studies/fees-costs/', date '2026-08-06', null::date, '{"annual_low":80000,"annual_high":295000,"annual_average":129000}'::jsonb),
    ('cc_se_employment_minimum_wage', 'https://arbetsformedlingen.se/other-languages/english-engelska/find-your-new-job-in-sweden', date '2026-08-06', null::date, '{"statutory_national_minimum":false,"collective_bargaining":true}'::jsonb)
)
insert into evidence.source_snapshots (source_id, source_url, content_sha256, published_at, data_as_of, retrieved_at, valid_from, snapshot_status, metadata)
select s.id, r.source_url, encode(digest(r.source_key || '|' || r.data_as_of::text, 'sha256'), 'hex'), r.published_at, r.data_as_of, now(), r.data_as_of, 'captured', r.metadata
from source_rows r join evidence.sources s on s.source_key=r.source_key
on conflict (source_id, content_sha256) where content_sha256 is not null do update set source_url=excluded.source_url, published_at=excluded.published_at, data_as_of=excluded.data_as_of, retrieved_at=now(), valid_from=excluded.valid_from, snapshot_status='captured', metadata=excluded.metadata;;
