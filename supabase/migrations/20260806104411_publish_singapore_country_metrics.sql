begin;

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'SG'
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
('country','SG','average_annual_salary',jsonb_build_object('amount',100800,'currency','SGD','basis','annualised_median_gross_monthly_income_full_time_resident_pmes','statistic_type','median','population','resident PMEs excluding Associate Professionals and Technicians','employer_cpf_excluded',true),'Income of full-time employed resident PMEs, 2025','https://www.mom.gov.sg/newsroom/parliament-questions-and-replies/2026/0407-oral-answer-to-pq-on-income-of-pme',date '2025-12-31',now(),'high','calculated','verified'),
('country','SG','full_time_annual_earnings_range',jsonb_build_object('low',64800,'high',166800,'ranking_value',100800,'currency','SGD','basis','annualised_p20_to_p80_gross_monthly_income_full_time_resident_pmes','population','resident PMEs excluding Associate Professionals and Technicians','employer_cpf_excluded',true),'Income of full-time employed resident PMEs, 2025','https://www.mom.gov.sg/newsroom/parliament-questions-and-replies/2026/0407-oral-answer-to-pq-on-income-of-pme',date '2025-12-31',now(),'high','calculated','verified'),
('country','SG','national_minimum_hourly_wage',jsonb_build_object('amount',null,'currency','SGD','basis','no_universal_statutory_minimum_wage','not_applicable',true,'sectoral_progressive_wages_exist',true),'Employment Act salary FAQ','https://www.mom.gov.sg/faq/salary/does-the-employment-act-regulate-the-amount-of-salary-to-be-paid',date '2026-08-06',now(),'high','observed','verified'),
('country','SG','student_living_cost_monthly_range',jsonb_build_object('low',1150,'high',3400,'ranking_value',2000,'currency','SGD','basis','nus_on_campus_to_off_campus_monthly_student_budget','scenario','one higher-education student; tuition excluded','accommodation_sensitive',true),'Incoming student monthly cost estimates','https://www.nus.edu.sg/gro/global-programmes/student-exchange/incoming-exchangers',date '2026-08-06',now(),'medium','observed','verified'),
('country','SG','student_work_hours_limit',jsonb_build_object('hours',16,'period','week','applies_during','school_term','eligible_institutions_only',true,'qualifying_industrial_attachment_alternative',true),'Work pass exemption for foreign students','https://www.mom.gov.sg/passes-and-permits/work-pass-exemption-for-foreign-students',date '2026-08-06',now(),'high','observed','verified'),
('country','SG','tuition_annual_low',jsonb_build_object('amount',21400,'currency','SGD','basis','ay2026_mainstream_subsidised_international_undergraduate_range','institution_type','autonomous university','study_level','undergraduate','student_type','non-ASEAN international with MOE Tuition Grant','programme','NTU general programme','three_year_work_obligation',true),'AY2026 undergraduate tuition fees','https://www.ntu.edu.sg/admissions/undergraduate/financial-matters/tuition-fees/accepted-programme-offer-in-2026',date '2026-08-01',now(),'medium','observed','verified'),
('country','SG','tuition_annual_high',jsonb_build_object('amount',31600,'currency','SGD','basis','ay2026_mainstream_subsidised_international_undergraduate_range','institution_type','autonomous university','study_level','undergraduate','student_type','non-ASEAN international with MOE Tuition Grant','programme','SUTD undergraduate programme','three_year_work_obligation',true),'AY2026 undergraduate tuition fees','https://www.sutd.edu.sg/admissions/undergraduate/education-expenses/fees/tuition-fees/',date '2026-08-01',now(),'medium','observed','verified'),
('country','SG','visa_application_fee',jsonb_build_object('amount',45,'currency','SGD','fee_type','student_pass_application_processing_fee','issuance_fee_excluded',60,'multiple_journey_visa_fee_if_applicable_excluded',30),'Student''s Pass fees for Institutes of Higher Learning','https://www.ica.gov.sg/reside/STP/apply/ihl',date '2026-08-06',now(),'high','observed','verified');

commit;;
