begin;

delete from evidence.metric_observations
where scope_type = 'country'
  and scope_id = 'NZ'
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
  'average_annual_salary', 'country', 'NZ',
  jsonb_build_object('amount',85941.44,'currency','NZD','basis','annualised_average_ordinary_time_weekly_earnings_fte','statistic_type','mean','weekly_amount',1652.72,'population','full-time-equivalent employees','pre_tax',true),
  'NZD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-parliament-stats-earnings-june-2025' order by ss.created_at desc limit 1),
  'calculated','high','Multiplies official average ordinary-time weekly earnings for full-time-equivalent employees by 52.',jsonb_build_object('weeks_per_year',52),date '2025-06-30','verified',now(),'Annualised benchmark rather than observed annual income; overtime and irregular work are excluded from the weekly measure.'
),
(
  'full_time_annual_earnings_range', 'country', 'NZ',
  jsonb_build_object('low',75982.40,'high',85941.44,'ranking_value',75982.40,'currency','NZD','basis','annualised_full_time_median_hourly_to_average_ordinary_time_weekly_fte','measure_type','median_to_mean_not_percentile_range','median_hourly_amount',36.53,'average_weekly_amount',1652.72),
  'NZD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-parliament-stats-earnings-june-2025' order by ss.created_at desc limit 1),
  'calculated','medium','Annualises the full-time median hourly wage at 40 hours for 52 weeks and compares it with annualised average ordinary-time weekly FTE earnings.',jsonb_build_object('hours_per_week',40,'weeks_per_year',52),date '2025-06-30','verified',now(),'Median and average use different official earnings concepts; this is a planning comparison, not a percentile distribution.'
),
(
  'national_minimum_hourly_wage', 'country', 'NZ',
  jsonb_build_object('amount',23.95,'currency','NZD','basis','adult_national_minimum_wage','daily_amount_8_hours',191.60,'weekly_amount_40_hours',958.00),
  'NZD/hour',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-employment-minimum-wage-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores the national adult minimum wage effective from 1 April 2026.','{}'::jsonb,date '2026-04-01','verified',now(),'Starting-out and training minimum rates are separate; employment agreements may set higher pay.'
),
(
  'student_living_cost_monthly_range', 'country', 'NZ',
  jsonb_build_object('low',1667,'high',1900,'ranking_value',1783.5,'currency','NZD','basis','visa_fund_floor_to_official_shared_house_budget_components','scenario','one tertiary student; tuition excluded','annual_fund_requirement',20000),
  'NZD/month',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-inz-enz-student-living-2026' order by ss.created_at desc limit 1),
  'calculated','medium','Uses the official NZD 1,667 monthly visa-fund floor and rounds a composite of official shared-room, food, entertainment, transport, phone, power and internet examples to NZD 1,900.',jsonb_build_object('weekly_components_annualised',true,'utilities','published monthly examples'),date '2026-08-06','verified',now(),'The lower amount is a visa evidence threshold and the upper amount is a calculated scenario; accommodation and utility sharing can move actual costs outside the range.'
),
(
  'student_work_hours_limit', 'country', 'NZ',
  jsonb_build_object('hours',25,'period','week','effective_change_date','2025-11-03','full_time_holiday_work_subject_to_conditions',true,'visa_conditions_control',true),
  'hours/week',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-inz-student-work-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores the standard maximum study-time work allowance for eligible student visas after the November 2025 change.','{}'::jsonb,date '2025-11-03','verified',now(),'Actual work rights must be printed on the visa; course level, age and scheduled-holiday conditions apply.'
),
(
  'tuition_annual_low', 'country', 'NZ',
  jsonb_build_object('amount',26415,'currency','NZD','basis','representative_official_2026_bachelor_programme_fee','programme','Bachelor of Applied Science (Animal Behaviour and Welfare)','study_level','undergraduate','institution','Unitec Institute of Technology','credits',120),
  'NZD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-enz-applied-science-fees-2026' order by ss.created_at desc limit 1),
  'observed','medium','Stores the approximate published international fee for 120 credits in a representative 2026 applied-science bachelor programme.','{}'::jsonb,date '2026-02-23','verified',now(),'Representative verified listing, not the nationwide minimum; levies, materials and course selection can change final fees.'
),
(
  'tuition_annual_high', 'country', 'NZ',
  jsonb_build_object('amount',30185,'currency','NZD','basis','representative_official_2026_bachelor_programme_fee','programme','Bachelor of Nursing','study_level','undergraduate','institution','Unitec Institute of Technology','credits',120),
  'NZD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-enz-nursing-fees-2026' order by ss.created_at desc limit 1),
  'observed','medium','Stores the approximate published international fee for 120 credits in a representative 2026 nursing bachelor programme.','{}'::jsonb,date '2026-02-23','verified',now(),'Representative verified listing, not the nationwide maximum; medicine, postgraduate study, placements and provider levies may be higher.'
),
(
  'visa_application_fee', 'country', 'NZ',
  jsonb_build_object('amount',850,'currency','NZD','basis','fee_paying_student_visa_online_cost_from','visa_type','Fee Paying Student Visa','starting_price',true),
  'NZD',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='nz-inz-fee-paying-student-visa-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores the official Fee Paying Student Visa application cost shown as starting from NZD 850.','{}'::jsonb,date '2026-08-06','verified',now(),'A starting amount; application location, levy, service channel or individual circumstances can affect total cost.'
);

commit;;
