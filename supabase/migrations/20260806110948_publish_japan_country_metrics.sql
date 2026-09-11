begin;

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'JP'
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
('country','JP','average_annual_salary',jsonb_build_object('amount',4780000,'currency','JPY','basis','national_private_sector_average_annual_salary','statistic_type','mean','population','employees who worked throughout calendar year 2024'),'2024 Private-Sector Salary Survey','https://www.nta.go.jp/publication/statistics/kokuzeicho/minkan/gaiyou/2024.htm',date '2024-12-31',now(),'high','observed','verified'),
('country','JP','full_time_annual_earnings_range',jsonb_build_object('low',4124520,'high',5628852,'ranking_value',5628852,'currency','JPY','basis','annualised_scheduled_to_total_cash_earnings_general_workers','measure_type','pay_component_range_not_percentile_distribution','scheduled_monthly_amount',343710,'total_monthly_amount',469071),'Monthly Labour Survey FY2025 final results','https://www.mhlw.go.jp/toukei/itiran/roudou/monthly/r07/25fr/mk07fr.html',date '2026-03-31',now(),'high','calculated','verified'),
('country','JP','national_minimum_hourly_wage',jsonb_build_object('amount',1121,'currency','JPY','basis','population_weighted_average_of_prefectural_minimum_wages','uniform_national_rate',false,'fiscal_year',2025),'FY2025 regional minimum wages','https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/index.html',date '2025-12-31',now(),'high','observed','verified'),
('country','JP','student_living_cost_monthly_range',jsonb_build_object('low',80000,'high',130000,'ranking_value',105000,'currency','JPY','basis','jasso_regional_monthly_average_range','scenario','one privately financed international student; study and research costs excluded','low_region','Shikoku','high_region','Tokyo'),'International student living costs','https://www.studyinjapan.go.jp/en/life/cost-of-living/',date '2023-12-31',now(),'medium','observed','verified'),
('country','JP','student_work_hours_limit',jsonb_build_object('hours',28,'period','week','permission_for_activity_outside_status_required',true,'long_school_holiday_daily_limit_hours',8,'adult_entertainment_work_prohibited',true),'Part-time work for international students','https://www.studyinjapan.go.jp/en/work-in-japan/part-time-jobs/',date '2026-08-06',now(),'high','observed','verified'),
('country','JP','tuition_annual_low',jsonb_build_object('amount',820000,'currency','JPY','basis','approximate_first_year_admission_and_tuition','institution_type','national university','study_level','undergraduate','first_year_total',true),'Academic fees','https://www.studyinjapan.go.jp/en/planning/academic-fees/',date '2026-08-06',now(),'medium','observed','verified'),
('country','JP','tuition_annual_high',jsonb_build_object('amount',1300000,'currency','JPY','basis','approximate_first_year_admission_and_tuition','institution_type','private university','study_level','undergraduate','medical_dental_pharmaceutical_excluded',true,'first_year_total',true),'Academic fees','https://www.studyinjapan.go.jp/en/planning/academic-fees/',date '2026-08-06',now(),'medium','observed','verified'),
('country','JP','visa_application_fee',jsonb_build_object('amount',15000,'currency','JPY','basis','single_entry_visa_fee_from_1_july_2026','visa_type','single-entry visa','local_currency_payment',true,'nationality_variation_and_exemptions_apply',true),'Visa fees effective from 1 July 2026','https://www.mofa.go.jp/j_info/visit/visa/procedure/pagewe_000001_00391.html',date '2026-07-01',now(),'high','observed','verified');

commit;;
