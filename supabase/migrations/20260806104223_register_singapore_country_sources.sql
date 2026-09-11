begin;

insert into core.countries (code, name, default_currency, active)
values ('SG', 'Singapore', 'SGD', true)
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
('sg-mom-pme-income-2025', 'Singapore Ministry of Manpower', 'Income of full-time employed resident PMEs, 2025', 'government_dataset', 'https://www.mom.gov.sg/newsroom/parliament-questions-and-replies/2026/0407-oral-answer-to-pq-on-income-of-pme', 'SG', true),
('sg-mom-minimum-wage-status', 'Singapore Ministry of Manpower', 'Employment Act salary FAQ', 'regulator', 'https://www.mom.gov.sg/faq/salary/does-the-employment-act-regulate-the-amount-of-salary-to-be-paid', 'SG', true),
('sg-nus-student-living-2026', 'National University of Singapore', 'Incoming student monthly cost estimates', 'provider', 'https://www.nus.edu.sg/gro/global-programmes/student-exchange/incoming-exchangers', 'SG', true),
('sg-ntu-tuition-2026', 'Nanyang Technological University', 'AY2026 undergraduate tuition fees', 'provider', 'https://www.ntu.edu.sg/admissions/undergraduate/financial-matters/tuition-fees/accepted-programme-offer-in-2026', 'SG', true),
('sg-sutd-tuition-2026', 'Singapore University of Technology and Design', 'AY2026 undergraduate tuition fees', 'provider', 'https://www.sutd.edu.sg/admissions/undergraduate/education-expenses/fees/tuition-fees/', 'SG', true),
('sg-ica-student-pass-fees-2026', 'Immigration & Checkpoints Authority Singapore', 'Student''s Pass fees for Institutes of Higher Learning', 'regulator', 'https://www.ica.gov.sg/reside/STP/apply/ihl', 'SG', true),
('sg-mom-student-work-2026', 'Singapore Ministry of Manpower', 'Work pass exemption for foreign students', 'regulator', 'https://www.mom.gov.sg/passes-and-permits/work-pass-exemption-for-foreign-students', 'SG', true)
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
    when 'sg-mom-pme-income-2025' then date '2026-04-07'
    when 'sg-ntu-tuition-2026' then date '2026-01-01'
    when 'sg-sutd-tuition-2026' then date '2026-01-01'
    else null
  end,
  case source_key
    when 'sg-mom-pme-income-2025' then date '2025-12-31'
    when 'sg-ntu-tuition-2026' then date '2026-08-01'
    when 'sg-sutd-tuition-2026' then date '2026-08-01'
    else date '2026-08-06'
  end,
  case source_key
    when 'sg-ntu-tuition-2026' then date '2026-08-01'
    when 'sg-sutd-tuition-2026' then date '2026-08-01'
    else null
  end,
  'captured',
  case source_key
    when 'sg-ica-student-pass-fees-2026' then jsonb_build_object('supporting_urls', jsonb_build_array('https://www.ica.gov.sg/reside/STP/collect'))
    when 'sg-ntu-tuition-2026' then jsonb_build_object('tuition_grant_reference', 'https://www.moe.gov.sg/financial-matters/tuition-grant-scheme/overview')
    when 'sg-sutd-tuition-2026' then jsonb_build_object('tuition_grant_reference', 'https://www.moe.gov.sg/financial-matters/tuition-grant-scheme/overview')
    else '{}'::jsonb
  end
from evidence.sources
where source_key in (
  'sg-mom-pme-income-2025',
  'sg-mom-minimum-wage-status',
  'sg-nus-student-living-2026',
  'sg-ntu-tuition-2026',
  'sg-sutd-tuition-2026',
  'sg-ica-student-pass-fees-2026',
  'sg-mom-student-work-2026'
);

commit;;
