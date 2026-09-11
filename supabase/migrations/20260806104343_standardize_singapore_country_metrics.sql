begin;

delete from evidence.metric_observations
where scope_type = 'country'
  and scope_id = 'SG'
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
  'average_annual_salary', 'country', 'SG',
  jsonb_build_object('amount',100800,'currency','SGD','basis','annualised_median_gross_monthly_income_full_time_resident_pmes','statistic_type','median','population','resident PMEs excluding Associate Professionals and Technicians','employer_cpf_excluded',true),
  'SGD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-mom-pme-income-2025' order by ss.created_at desc limit 1),
  'calculated','high','Annualises the official 2025 monthly median of S$8,400 by multiplying by twelve.','{}'::jsonb,date '2025-12-31','verified',now(),'Professional resident benchmark, not a national mean or graduate starting salary.'
),
(
  'full_time_annual_earnings_range', 'country', 'SG',
  jsonb_build_object('low',64800,'high',166800,'ranking_value',100800,'currency','SGD','basis','annualised_p20_to_p80_gross_monthly_income_full_time_resident_pmes','population','resident PMEs excluding Associate Professionals and Technicians','employer_cpf_excluded',true),
  'SGD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-mom-pme-income-2025' order by ss.created_at desc limit 1),
  'calculated','high','Annualises the official P20, median and P80 monthly PME income values.','{}'::jsonb,date '2025-12-31','verified',now(),'Resident PME distribution only; employer CPF excluded.'
),
(
  'national_minimum_hourly_wage', 'country', 'SG',
  jsonb_build_object('amount',null,'currency','SGD','basis','no_universal_statutory_minimum_wage','not_applicable',true,'sectoral_progressive_wages_exist',true),
  'SGD/hour',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-mom-minimum-wage-status' order by ss.created_at desc limit 1),
  'observed','high','Stores a qualitative not-applicable status because Singapore has no universal statutory minimum wage.','{}'::jsonb,date '2026-08-06','verified',now(),'PWM and LQS amounts apply only in defined circumstances and are not substituted here.'
),
(
  'student_living_cost_monthly_range', 'country', 'SG',
  jsonb_build_object('low',1150,'high',3400,'ranking_value',2000,'currency','SGD','basis','nus_on_campus_to_off_campus_monthly_student_budget','scenario','one higher-education student; tuition excluded','accommodation_sensitive',true),
  'SGD/month',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-nus-student-living-2026' order by ss.created_at desc limit 1),
  'observed','medium','Uses NUS monthly total estimates spanning on-campus and off-campus accommodation scenarios.',jsonb_build_object('lower_bound','on-campus estimate','upper_bound','off-campus estimate'),date '2026-08-06','verified',now(),'Housing and lifestyle can materially change actual spending.'
),
(
  'student_work_hours_limit', 'country', 'SG',
  jsonb_build_object('hours',16,'period','week','applies_during','school_term','eligible_institutions_only',true,'qualifying_industrial_attachment_alternative',true),
  'hours/week',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-mom-student-work-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores the term-time work-pass exemption limit for eligible full-time Student''s Pass holders.','{}'::jsonb,date '2026-08-06','verified',now(),'Institution eligibility and Student''s Pass conditions must be checked.'
),
(
  'tuition_annual_low', 'country', 'SG',
  jsonb_build_object('amount',21400,'currency','SGD','basis','ay2026_mainstream_subsidised_international_undergraduate_range','institution_type','autonomous university','study_level','undergraduate','student_type','non-ASEAN international with MOE Tuition Grant','programme','NTU general programme','three_year_work_obligation',true),
  'SGD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-ntu-tuition-2026' order by ss.created_at desc limit 1),
  'observed','medium','Lower planning bound from NTU AY2026 general undergraduate subsidised fees.','{}'::jsonb,date '2026-08-01','verified',now(),'Specialised and non-subsidised fees may be higher.'
),
(
  'tuition_annual_high', 'country', 'SG',
  jsonb_build_object('amount',31600,'currency','SGD','basis','ay2026_mainstream_subsidised_international_undergraduate_range','institution_type','autonomous university','study_level','undergraduate','student_type','non-ASEAN international with MOE Tuition Grant','programme','SUTD undergraduate programme','three_year_work_obligation',true),
  'SGD/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-sutd-tuition-2026' order by ss.created_at desc limit 1),
  'observed','medium','Upper planning bound from SUTD AY2026 subsidised fees.','{}'::jsonb,date '2026-08-01','verified',now(),'Students without the Tuition Grant can pay substantially more.'
),
(
  'visa_application_fee', 'country', 'SG',
  jsonb_build_object('amount',45,'currency','SGD','fee_type','student_pass_application_processing_fee','issuance_fee_excluded',60,'multiple_journey_visa_fee_if_applicable_excluded',30),
  'SGD',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='sg-ica-student-pass-fees-2026' order by ss.created_at desc limit 1),
  'observed','high','Stores only the non-refundable Student''s Pass application processing fee.','{}'::jsonb,date '2026-08-06','verified',now(),'Issuance and Multiple Journey Visa fees are separate.'
);

commit;;
