begin;

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'KR'
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
('country','KR','average_annual_salary',jsonb_build_object('amount',50460000,'currency','KRW','basis','annualised_average_monthly_total_wage','monthly_amount',4205000,'statistic_type','mean','population','workers at establishments with at least one regular employee'),'2025 annual average monthly total wage','https://laborstat.moel.go.kr/',date '2025-12-31',now(),'high','calculated','verified'),
('country','KR','full_time_annual_earnings_range',jsonb_build_object('low',42228000,'high',50460000,'ranking_value',42228000,'currency','KRW','basis','full_time_regular_worker_median_to_all_worker_annual_average','measure_type','median_to_mean_not_percentile_range','median_monthly_amount',3519000,'average_monthly_amount',4205000),'2025 Survey on Labor Conditions by Employment Type','https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19337',date '2025-06-30',now(),'medium','calculated','verified'),
('country','KR','national_minimum_hourly_wage',jsonb_build_object('amount',10320,'currency','KRW','basis','national_statutory_minimum_wage','monthly_amount_209_hours',2156880),'2026 minimum wage','https://www.minimumwage.go.kr/english/introduce/minWage.do',date '2026-01-01',now(),'high','observed','verified'),
('country','KR','student_living_cost_monthly_range',jsonb_build_object('low',750000,'high',1000000,'ranking_value',875000,'currency','KRW','basis','official_international_student_monthly_planning_range','scenario','one higher-education student; tuition excluded'),'Study and living expenses in Korea','https://studyinkorea.go.kr/ko/life/livingExpense.do',date '2026-08-06',now(),'medium','observed','verified'),
('country','KR','student_work_hours_limit',jsonb_build_object('hours',30,'period','week','basis','common_qualified_undergraduate_maximum','permission_required',true,'korean_proficiency_and_institution_conditions_apply',true,'graduate_maximum_hours',35),'Part-time work for international students','https://studyinkorea.go.kr/ko/work/aboutForeignerEmploymentSystem.do',date '2026-08-06',now(),'medium','observed','verified'),
('country','KR','tuition_annual_low',jsonb_build_object('amount',4265841.8,'currency','KRW','basis','national_public_undergraduate_average','institution_type','national and public university','study_level','undergraduate'),'Study expenses in Korea','https://studyinkorea.go.kr/ko/plan/abroadExpenses.do',date '2026-08-06',now(),'medium','observed','verified'),
('country','KR','tuition_annual_high',jsonb_build_object('amount',7625335.6,'currency','KRW','basis','private_undergraduate_average','institution_type','private university','study_level','undergraduate'),'Study expenses in Korea','https://studyinkorea.go.kr/ko/plan/abroadExpenses.do',date '2026-08-06',now(),'medium','observed','verified'),
('country','KR','visa_application_fee',jsonb_build_object('amount',60,'currency','USD','basis','basic_single_entry_visa_91_days_or_longer','visa_type','long-stay student visa benchmark','nationality_adjustments_and_exemptions_apply',true),'Visa application fees by visa type','https://overseas.mofa.go.kr/us-en/brd/m_4502/view.do?page=1&seq=715889',date '2026-08-06',now(),'high','observed','verified');

commit;;
