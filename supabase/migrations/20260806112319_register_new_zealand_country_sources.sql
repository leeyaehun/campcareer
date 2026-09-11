begin;

insert into core.countries (code, name, default_currency, active)
values ('NZ', 'New Zealand', 'NZD', true)
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
('nz-parliament-stats-earnings-june-2025', 'Stats NZ / New Zealand Parliament', 'June 2025 labour-market earnings benchmarks', 'government_dataset', 'https://www3.parliament.nz/mi/pb/library-research-papers/monthly-economic-review/monthly-economic-review-october-2025/', 'NZ', true),
('nz-employment-minimum-wage-2026', 'Employment New Zealand', 'Adult minimum wage from 1 April 2026', 'regulator', 'https://www.employment.govt.nz/pay-and-hours/pay-and-wages/minimum-wage/minimum-wage-rates-and-types', 'NZ', true),
('nz-inz-enz-student-living-2026', 'Immigration New Zealand / Education New Zealand', 'Student fund requirement and official living-cost guidance', 'government_dataset', 'https://www.immigration.govt.nz/process-to-apply/applying-for-a-visa/providing-evidence-and-documents-to-support-your-visa-application/student-fund-requirements/', 'NZ', true),
('nz-enz-applied-science-fees-2026', 'Education New Zealand', 'Bachelor of Applied Science international fee, 2026', 'government_dataset', 'https://www.studywithnewzealand.govt.nz/en/study-options/course/24550-course', 'NZ', true),
('nz-enz-nursing-fees-2026', 'Education New Zealand', 'Bachelor of Nursing international fee, 2026', 'government_dataset', 'https://www.studywithnewzealand.govt.nz/en/study-options/course/24522-course', 'NZ', true),
('nz-inz-student-work-2026', 'Immigration New Zealand', 'Working on a student visa', 'regulator', 'https://www.immigration.govt.nz/study/once-you-have-a-student-visa/working-on-a-student-visa/', 'NZ', true),
('nz-inz-fee-paying-student-visa-2026', 'Immigration New Zealand', 'Fee Paying Student Visa', 'regulator', 'https://www.immigration.govt.nz/visas/fee-paying-student-visa/', 'NZ', true)
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
    when 'nz-parliament-stats-earnings-june-2025' then date '2025-10-01'
    when 'nz-employment-minimum-wage-2026' then date '2026-02-01'
    when 'nz-inz-student-work-2026' then date '2025-11-03'
    else null
  end,
  case source_key
    when 'nz-parliament-stats-earnings-june-2025' then date '2025-06-30'
    when 'nz-employment-minimum-wage-2026' then date '2026-04-01'
    when 'nz-enz-applied-science-fees-2026' then date '2026-02-23'
    when 'nz-enz-nursing-fees-2026' then date '2026-02-23'
    when 'nz-inz-student-work-2026' then date '2025-11-03'
    else date '2026-08-06'
  end,
  case source_key
    when 'nz-employment-minimum-wage-2026' then date '2026-04-01'
    when 'nz-inz-student-work-2026' then date '2025-11-03'
    else null
  end,
  'captured',
  case source_key
    when 'nz-inz-enz-student-living-2026' then jsonb_build_object('secondary_url','https://www.studywithnewzealand.govt.nz/en/plan-with-new-zealand/cost-of-living')
    when 'nz-parliament-stats-earnings-june-2025' then jsonb_build_object('secondary_url','https://www3.parliament.nz/en/pb/library-research-papers/monthly-economic-review/monthly-economic-review-september-2025/','underlying_source','Stats NZ')
    else '{}'::jsonb
  end
from evidence.sources
where source_key in (
  'nz-parliament-stats-earnings-june-2025',
  'nz-employment-minimum-wage-2026',
  'nz-inz-enz-student-living-2026',
  'nz-enz-applied-science-fees-2026',
  'nz-enz-nursing-fees-2026',
  'nz-inz-student-work-2026',
  'nz-inz-fee-paying-student-visa-2026'
);

commit;;
