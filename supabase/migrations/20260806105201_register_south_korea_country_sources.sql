begin;

insert into core.countries (code, name, default_currency, active)
values ('KR', 'South Korea', 'KRW', true)
on conflict (code) do update
set name = excluded.name,
    default_currency = excluded.default_currency,
    active = excluded.active,
    updated_at = now();

insert into evidence.sources (
  source_key, organisation_name, source_name, source_type,
  canonical_url, country_code, active
)
values
('kr-moel-annual-wages-2025', 'Korean Ministry of Employment and Labor', '2025 annual average monthly total wage', 'government_dataset', 'https://laborstat.moel.go.kr/', 'KR', true),
('kr-moel-wage-median-2025', 'Korean Ministry of Employment and Labor', '2025 Survey on Labor Conditions by Employment Type', 'government_dataset', 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19337', 'KR', true),
('kr-minimum-wage-2026', 'Korean Minimum Wage Council', '2026 minimum wage', 'regulator', 'https://www.minimumwage.go.kr/english/introduce/minWage.do', 'KR', true),
('kr-study-costs-2026', 'National Institute for International Education', 'Study and living expenses in Korea', 'government_dataset', 'https://studyinkorea.go.kr/ko/plan/abroadExpenses.do', 'KR', true),
('kr-student-work-2026', 'National Institute for International Education', 'Part-time work for international students', 'regulator', 'https://studyinkorea.go.kr/ko/work/aboutForeignerEmploymentSystem.do', 'KR', true),
('kr-mofa-visa-fees-2025', 'Korean Ministry of Foreign Affairs', 'Visa application fees by visa type', 'regulator', 'https://overseas.mofa.go.kr/us-en/brd/m_4502/view.do?page=1&seq=715889', 'KR', true)
on conflict (source_key) do update
set organisation_name = excluded.organisation_name,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    canonical_url = excluded.canonical_url,
    country_code = excluded.country_code,
    active = true,
    updated_at = now();

insert into evidence.source_snapshots (
  source_id, source_url, published_at, data_as_of, valid_from,
  snapshot_status, metadata
)
select
  id,
  canonical_url,
  case source_key
    when 'kr-moel-wage-median-2025' then date '2026-04-30'
    when 'kr-minimum-wage-2026' then date '2025-11-07'
    when 'kr-mofa-visa-fees-2025' then date '2025-07-30'
    else null
  end,
  case source_key
    when 'kr-moel-annual-wages-2025' then date '2025-12-31'
    when 'kr-moel-wage-median-2025' then date '2025-06-30'
    when 'kr-minimum-wage-2026' then date '2026-01-01'
    else date '2026-08-06'
  end,
  case source_key
    when 'kr-minimum-wage-2026' then date '2026-01-01'
    else null
  end,
  'captured',
  case source_key
    when 'kr-moel-wage-median-2025' then jsonb_build_object('supporting_url','https://www.korea.kr/news/policyNewsView.do?newsId=156759413')
    when 'kr-study-costs-2026' then jsonb_build_object('living_cost_url','https://studyinkorea.go.kr/ko/life/livingExpense.do')
    else '{}'::jsonb
  end
from evidence.sources
where source_key in (
  'kr-moel-annual-wages-2025',
  'kr-moel-wage-median-2025',
  'kr-minimum-wage-2026',
  'kr-study-costs-2026',
  'kr-student-work-2026',
  'kr-mofa-visa-fees-2025'
);

commit;;
