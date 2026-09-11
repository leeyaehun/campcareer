begin;

delete from evidence.metric_observations
where scope_type = 'country'
  and scope_id = 'KR'
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
  'average_annual_salary', 'country', 'KR',
  jsonb_build_object('amount',50460000,'currency','KRW','basis','annualised_average_monthly_total_wage','monthly_amount',4205000,'statistic_type','mean','population','workers at establishments with at least one regular employee'),
  'KRW/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-moel-annual-wages-2025' order by ss.created_at desc limit 1),
  'calculated','high','Multiplies the official 2025 annual average monthly total wage of KRW 4.205 million by twelve.','{}'::jsonb,date '2025-12-31','verified',now(),'Gross establishment-based worker average; not graduate starting pay or take-home income.'
),
(
  'full_time_annual_earnings_range', 'country', 'KR',
  jsonb_build_object('low',42228000,'high',50460000,'ranking_value',42228000,'currency','KRW','basis','full_time_regular_worker_median_to_all_worker_annual_average','measure_type','median_to_mean_not_percentile_range','median_monthly_amount',3519000,'average_monthly_amount',4205000),
  'KRW/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-moel-wage-median-2025' order by ss.created_at desc limit 1),
  'calculated','medium','Annualises the June 2025 full-time regular-worker median and compares it with the 2025 annual average monthly total wage.',jsonb_build_object('lower_population','full-time regular workers','upper_population','all workers in covered establishments'),date '2025-06-30','verified',now(),'Comparison range from related but non-identical populations; not an individual wage distribution.'
),
(
  'national_minimum_hourly_wage', 'country', 'KR',
  jsonb_build_object('amount',10320,'currency','KRW','basis','national_statutory_minimum_wage','monthly_amount_209_hours',2156880),
  'KRW/hour',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-minimum-wage-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores the statutory hourly minimum wage applying during 2026.','{}'::jsonb,date '2026-01-01','verified',now(),'Gross statutory floor before deductions.'
),
(
  'student_living_cost_monthly_range', 'country', 'KR',
  jsonb_build_object('low',750000,'high',1000000,'ranking_value',875000,'currency','KRW','basis','official_international_student_monthly_planning_range','scenario','one higher-education student; tuition excluded'),
  'KRW/month',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-study-costs-2026' order by ss.created_at desc limit 1),
  'observed','medium','Uses the government Study in Korea monthly living-expense range.','{}'::jsonb,date '2026-08-06','verified',now(),'Actual housing, food, insurance and city costs vary.'
),
(
  'student_work_hours_limit', 'country', 'KR',
  jsonb_build_object('hours',30,'period','week','basis','common_qualified_undergraduate_maximum','permission_required',true,'korean_proficiency_and_institution_conditions_apply',true,'graduate_maximum_hours',35),
  'hours/week',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-student-work-2026' order by ss.created_at desc limit 1),
  'observed','medium','Stores the common maximum for qualifying undergraduate students shown in the official permission table.','{}'::jsonb,date '2026-08-06','verified',now(),'Lower limits may apply; prior immigration permission and university confirmation are required.'
),
(
  'tuition_annual_low', 'country', 'KR',
  jsonb_build_object('amount',4265841.8,'currency','KRW','basis','national_public_undergraduate_average','institution_type','national and public university','study_level','undergraduate'),
  'KRW/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-study-costs-2026' order by ss.created_at desc limit 1),
  'observed','medium','Uses the official national and public university average undergraduate tuition.','{}'::jsonb,date '2026-08-06','verified',now(),'Institution average, not a guaranteed programme fee.'
),
(
  'tuition_annual_high', 'country', 'KR',
  jsonb_build_object('amount',7625335.6,'currency','KRW','basis','private_undergraduate_average','institution_type','private university','study_level','undergraduate'),
  'KRW/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-study-costs-2026' order by ss.created_at desc limit 1),
  'observed','medium','Uses the official private university average undergraduate tuition.','{}'::jsonb,date '2026-08-06','verified',now(),'Medicine, arts and specialist programmes can exceed this benchmark.'
),
(
  'visa_application_fee', 'country', 'KR',
  jsonb_build_object('amount',60,'currency','USD','basis','basic_single_entry_visa_91_days_or_longer','visa_type','long-stay student visa benchmark','nationality_adjustments_and_exemptions_apply',true),
  'USD',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='kr-mofa-visa-fees-2025' order by ss.created_at desc limit 1),
  'observed','high','Stores the basic single-entry visa fee for a stay of 91 days or longer.','{}'::jsonb,date '2026-08-06','verified',now(),'Nationality reciprocity, exemptions, local conversion and service charges may change the actual fee.'
);

commit;;
