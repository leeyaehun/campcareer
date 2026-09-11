begin;

delete from evidence.metric_observations
where scope_type = 'country'
  and scope_id = 'JP'
  and metric_key in (
    'average_annual_salary', 'full_time_annual_earnings_range',
    'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
    'student_work_hours_limit', 'tuition_annual_low',
    'tuition_annual_high', 'visa_application_fee'
  );

insert into evidence.metric_observations (
  metric_key, scope_type, scope_id, value, unit, source_snapshot_id,
  evidence_kind, confidence, methodology, assumptions, effective_from,
  review_status, reviewed_at, reviewer_note
)
values
(
  'average_annual_salary', 'country', 'JP',
  jsonb_build_object('amount',4780000,'currency','JPY','basis','national_private_sector_average_annual_salary','statistic_type','mean','population','employees who worked throughout calendar year 2024'),
  'JPY/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-nta-private-salary-2024' order by ss.created_at desc limit 1),
  'observed','high','Stores the official 2024 average annual private-sector salary for year-round employees.','{}'::jsonb,date '2024-12-31','verified',now(),'Private-sector mean across regular and non-regular employees; not graduate starting pay or take-home income.'
),
(
  'full_time_annual_earnings_range', 'country', 'JP',
  jsonb_build_object('low',4124520,'high',5628852,'ranking_value',5628852,'currency','JPY','basis','annualised_scheduled_to_total_cash_earnings_general_workers','measure_type','pay_component_range_not_percentile_distribution','scheduled_monthly_amount',343710,'total_monthly_amount',469071),
  'JPY/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-mhlw-monthly-labour-fy2025' order by ss.created_at desc limit 1),
  'calculated','high','Multiplies FY2025 general-worker scheduled cash earnings and total cash earnings by twelve.',jsonb_build_object('population','general workers at establishments with at least five employees'),date '2026-03-31','verified',now(),'Same worker population but different pay components; not a worker percentile range.'
),
(
  'national_minimum_hourly_wage', 'country', 'JP',
  jsonb_build_object('amount',1121,'currency','JPY','basis','population_weighted_average_of_prefectural_minimum_wages','uniform_national_rate',false,'fiscal_year',2025),
  'JPY/hour',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-mhlw-minimum-wage-fy2025' order by ss.created_at desc limit 1),
  'observed','high','Stores the official population-weighted national average of prefectural minimum wages for FY2025.','{}'::jsonb,date '2025-12-31','verified',now(),'Japan has prefecture-specific and some industry-specific legal rates; JPY 1,121 is a comparison benchmark.'
),
(
  'student_living_cost_monthly_range', 'country', 'JP',
  jsonb_build_object('low',80000,'high',130000,'ranking_value',105000,'currency','JPY','basis','jasso_regional_monthly_average_range','scenario','one privately financed international student; study and research costs excluded','low_region','Shikoku','high_region','Tokyo'),
  'JPY/month',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-jasso-living-costs-2023' order by ss.created_at desc limit 1),
  'observed','medium','Uses the lowest and highest official regional monthly averages and the national average from the 2023 JASSO lifestyle survey.','{}'::jsonb,date '2023-12-31','verified',now(),'Regional student averages; rent, initial housing costs and lifestyle can move actual spending outside the range.'
),
(
  'student_work_hours_limit', 'country', 'JP',
  jsonb_build_object('hours',28,'period','week','permission_for_activity_outside_status_required',true,'long_school_holiday_daily_limit_hours',8,'adult_entertainment_work_prohibited',true),
  'hours/week',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-jasso-student-work-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores the standard weekly limit after receiving permission for activity outside the Student residence status.','{}'::jsonb,date '2026-08-06','verified',now(),'Study must remain the primary purpose; long school holidays use an eight-hour daily limit.'
),
(
  'tuition_annual_low', 'country', 'JP',
  jsonb_build_object('amount',820000,'currency','JPY','basis','approximate_first_year_admission_and_tuition','institution_type','national university','study_level','undergraduate','first_year_total',true),
  'JPY/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-jasso-academic-fees-2026' order by ss.created_at desc limit 1),
  'observed','medium','Uses the official approximate first-year admission and tuition total for national universities.','{}'::jsonb,date '2026-08-06','verified',now(),'First-year academic charges rather than recurring tuition alone; examination and materials fees can be additional.'
),
(
  'tuition_annual_high', 'country', 'JP',
  jsonb_build_object('amount',1300000,'currency','JPY','basis','approximate_first_year_admission_and_tuition','institution_type','private university','study_level','undergraduate','medical_dental_pharmaceutical_excluded',true,'first_year_total',true),
  'JPY/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-jasso-academic-fees-2026' order by ss.created_at desc limit 1),
  'observed','medium','Uses the official approximate first-year admission and tuition total for private non-medical undergraduate programmes.','{}'::jsonb,date '2026-08-06','verified',now(),'Private medical, dental and pharmaceutical programmes are much higher; additional course fees may apply.'
),
(
  'visa_application_fee', 'country', 'JP',
  jsonb_build_object('amount',15000,'currency','JPY','basis','single_entry_visa_fee_from_1_july_2026','visa_type','single-entry visa','local_currency_payment',true,'nationality_variation_and_exemptions_apply',true),
  'JPY',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='jp-mofa-visa-fees-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores the approximate single-entry visa fee for applications accepted on or after 1 July 2026.','{}'::jsonb,date '2026-07-01','verified',now(),'Nationality, purpose, exemption and local-currency conversion can change the amount; approved-agency fees may be additional.'
);

commit;;
