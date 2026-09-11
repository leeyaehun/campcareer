begin;

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'NZ'
  and metric_key in (
    'average_annual_salary', 'full_time_annual_earnings_range',
    'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
    'student_work_hours_limit', 'tuition_annual_low',
    'tuition_annual_high', 'visa_application_fee'
  );

insert into public.report_metric_evidence_country (
  scope_type, scope_id, metric_key, value, source_name, source_url,
  data_as_of, last_verified_at, confidence, evidence_kind, review_status
)
values
('country','NZ','average_annual_salary',jsonb_build_object('amount',85941.44,'currency','NZD','basis','annualised_average_ordinary_time_weekly_earnings_fte','statistic_type','mean','weekly_amount',1652.72,'population','full-time-equivalent employees','pre_tax',true),'June 2025 labour-market earnings benchmarks','https://www3.parliament.nz/mi/pb/library-research-papers/monthly-economic-review/monthly-economic-review-october-2025/',date '2025-06-30',now(),'high','calculated','verified'),
('country','NZ','full_time_annual_earnings_range',jsonb_build_object('low',75982.40,'high',85941.44,'ranking_value',75982.40,'currency','NZD','basis','annualised_full_time_median_hourly_to_average_ordinary_time_weekly_fte','measure_type','median_to_mean_not_percentile_range','median_hourly_amount',36.53,'average_weekly_amount',1652.72),'June 2025 labour-market earnings benchmarks','https://www3.parliament.nz/mi/pb/library-research-papers/monthly-economic-review/monthly-economic-review-october-2025/',date '2025-06-30',now(),'medium','calculated','verified'),
('country','NZ','national_minimum_hourly_wage',jsonb_build_object('amount',23.95,'currency','NZD','basis','adult_national_minimum_wage','daily_amount_8_hours',191.60,'weekly_amount_40_hours',958.00),'Adult minimum wage from 1 April 2026','https://www.employment.govt.nz/pay-and-hours/pay-and-wages/minimum-wage/minimum-wage-rates-and-types',date '2026-04-01',now(),'high','observed','verified'),
('country','NZ','student_living_cost_monthly_range',jsonb_build_object('low',1667,'high',1900,'ranking_value',1783.5,'currency','NZD','basis','visa_fund_floor_to_official_shared_house_budget_components','scenario','one tertiary student; tuition excluded','annual_fund_requirement',20000),'Student fund requirement and official living-cost guidance','https://www.immigration.govt.nz/process-to-apply/applying-for-a-visa/providing-evidence-and-documents-to-support-your-visa-application/student-fund-requirements/',date '2026-08-06',now(),'medium','calculated','verified'),
('country','NZ','student_work_hours_limit',jsonb_build_object('hours',25,'period','week','effective_change_date','2025-11-03','full_time_holiday_work_subject_to_conditions',true,'visa_conditions_control',true),'Working on a student visa','https://www.immigration.govt.nz/study/once-you-have-a-student-visa/working-on-a-student-visa/',date '2025-11-03',now(),'high','observed','verified'),
('country','NZ','tuition_annual_low',jsonb_build_object('amount',26415,'currency','NZD','basis','representative_official_2026_bachelor_programme_fee','programme','Bachelor of Applied Science (Animal Behaviour and Welfare)','study_level','undergraduate','institution','Unitec Institute of Technology','credits',120),'Bachelor of Applied Science international fee, 2026','https://www.studywithnewzealand.govt.nz/en/study-options/course/24550-course',date '2026-02-23',now(),'medium','observed','verified'),
('country','NZ','tuition_annual_high',jsonb_build_object('amount',30185,'currency','NZD','basis','representative_official_2026_bachelor_programme_fee','programme','Bachelor of Nursing','study_level','undergraduate','institution','Unitec Institute of Technology','credits',120),'Bachelor of Nursing international fee, 2026','https://www.studywithnewzealand.govt.nz/en/study-options/course/24522-course',date '2026-02-23',now(),'medium','observed','verified'),
('country','NZ','visa_application_fee',jsonb_build_object('amount',850,'currency','NZD','basis','fee_paying_student_visa_online_cost_from','visa_type','Fee Paying Student Visa','starting_price',true),'Fee Paying Student Visa','https://www.immigration.govt.nz/visas/fee-paying-student-visa/',date '2026-08-06',now(),'high','observed','verified');

commit;;
