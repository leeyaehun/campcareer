begin;

insert into core.countries (code, name, default_currency, active)
values ('JP', 'Japan', 'JPY', true)
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
('jp-mhlw-monthly-labour-fy2025', 'Japan Ministry of Health, Labour and Welfare', 'Monthly Labour Survey FY2025 final results', 'government_dataset', 'https://www.mhlw.go.jp/toukei/itiran/roudou/monthly/r07/25fr/mk07fr.html', 'JP', true),
('jp-nta-private-salary-2024', 'Japan National Tax Agency', '2024 Private-Sector Salary Survey', 'government_dataset', 'https://www.nta.go.jp/publication/statistics/kokuzeicho/minkan/gaiyou/2024.htm', 'JP', true),
('jp-mhlw-minimum-wage-fy2025', 'Japan Ministry of Health, Labour and Welfare', 'FY2025 regional minimum wages', 'regulator', 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/index.html', 'JP', true),
('jp-jasso-living-costs-2023', 'Japan Student Services Organization', 'International student living costs', 'government_dataset', 'https://www.studyinjapan.go.jp/en/life/cost-of-living/', 'JP', true),
('jp-jasso-academic-fees-2026', 'Japan Student Services Organization', 'Academic fees', 'government_dataset', 'https://www.studyinjapan.go.jp/en/planning/academic-fees/', 'JP', true),
('jp-jasso-student-work-2026', 'Japan Student Services Organization', 'Part-time work for international students', 'regulator', 'https://www.studyinjapan.go.jp/en/work-in-japan/part-time-jobs/', 'JP', true),
('jp-mofa-visa-fees-2026', 'Japan Ministry of Foreign Affairs', 'Visa fees effective from 1 July 2026', 'regulator', 'https://www.mofa.go.jp/j_info/visit/visa/procedure/pagewe_000001_00391.html', 'JP', true)
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
    when 'jp-mhlw-monthly-labour-fy2025' then date '2026-05-22'
    when 'jp-nta-private-salary-2024' then date '2025-09-26'
    when 'jp-mhlw-minimum-wage-fy2025' then date '2025-09-05'
    when 'jp-mofa-visa-fees-2026' then date '2026-06-24'
    else null
  end,
  case source_key
    when 'jp-mhlw-monthly-labour-fy2025' then date '2026-03-31'
    when 'jp-nta-private-salary-2024' then date '2024-12-31'
    when 'jp-mhlw-minimum-wage-fy2025' then date '2025-12-31'
    when 'jp-jasso-living-costs-2023' then date '2023-12-31'
    when 'jp-mofa-visa-fees-2026' then date '2026-07-01'
    else date '2026-08-06'
  end,
  case source_key
    when 'jp-mofa-visa-fees-2026' then date '2026-07-01'
    else null
  end,
  'captured',
  case source_key
    when 'jp-jasso-living-costs-2023' then jsonb_build_object('regional_chart_url','https://www.studyinjapan.go.jp/en/entry-img/living_cost1.png')
    when 'jp-mhlw-monthly-labour-fy2025' then jsonb_build_object('pdf_url','https://www.mhlw.go.jp/toukei/itiran/roudou/monthly/r07/25fr/dl/pdf25fr.pdf')
    else '{}'::jsonb
  end
from evidence.sources
where source_key in (
  'jp-mhlw-monthly-labour-fy2025',
  'jp-nta-private-salary-2024',
  'jp-mhlw-minimum-wage-fy2025',
  'jp-jasso-living-costs-2023',
  'jp-jasso-academic-fees-2026',
  'jp-jasso-student-work-2026',
  'jp-mofa-visa-fees-2026'
);

commit;;
