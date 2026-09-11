begin;

delete from evidence.metric_observations
where scope_type = 'country'
  and scope_id = 'ES'
  and metric_key in (
    'average_annual_salary',
    'full_time_annual_earnings_range',
    'national_minimum_hourly_wage',
    'student_living_cost_monthly_range',
    'student_work_hours_limit',
    'tuition_annual_low',
    'tuition_annual_high',
    'visa_application_fee'
  );

insert into evidence.metric_observations (
  metric_key, scope_type, scope_id, value, unit, source_snapshot_id,
  evidence_kind, confidence, methodology, assumptions, effective_from,
  review_status, reviewed_at, reviewer_note
)
values
(
  'average_annual_salary', 'country', 'ES',
  jsonb_build_object('amount', 29540.26, 'currency', 'EUR', 'basis', 'average_annual_gross_salary_per_worker', 'statistic_type', 'mean', 'population', 'employees covered by the INE Annual Wage Structure Survey'),
  'EUR/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-ine-eaes-2024' order by ss.created_at desc limit 1),
  'observed', 'high', 'Official 2024 annual gross mean.', '{}'::jsonb, date '2024-12-31', 'verified', now(),
  'National employee mean; not graduate starting salary.'
),
(
  'full_time_annual_earnings_range', 'country', 'ES',
  jsonb_build_object('low', 24497.17, 'high', 29540.26, 'ranking_value', 24497.17, 'currency', 'EUR', 'basis', 'annual_gross_median_to_mean_benchmark', 'measure_type', 'median_to_mean_not_percentile_range', 'population', 'employees covered by the INE Annual Wage Structure Survey'),
  'EUR/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-ine-eaes-2024' order by ss.created_at desc limit 1),
  'observed', 'medium', 'Uses the official annual gross median as the lower benchmark and official mean as the upper benchmark.', '{}'::jsonb, date '2024-12-31', 'verified', now(),
  'Not a P25–P75 or P10–P90 distribution; includes stated survey population and work patterns.'
),
(
  'national_minimum_hourly_wage', 'country', 'ES',
  jsonb_build_object('amount', 8.22, 'currency', 'EUR', 'basis', 'annual_smi_divided_by_2080_hours', 'monthly_amount_14_payments', 1221, 'annual_amount', 17094, 'weekly_hours_assumption', 40),
  'EUR/hour',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-boe-smi-2026' order by ss.created_at desc limit 1),
  'calculated', 'medium', 'EUR 1,221 multiplied by fourteen payments and divided by 2,080 hours.', jsonb_build_object('hours_per_week', 40, 'weeks_per_year', 52), date '2026-01-01', 'verified', now(),
  'Comparison conversion only; Spain legislates monthly and daily SMI rather than one universal hourly rate.'
),
(
  'student_living_cost_monthly_range', 'country', 'ES',
  jsonb_build_object('low', 600, 'high', 1100, 'ranking_value', 850, 'currency', 'EUR', 'basis', 'visa_iprem_floor_to_sepie_student_budget_guidance', 'scenario', 'one higher-education student; tuition excluded', 'measure_type', 'official_requirement_to_guidance_range'),
  'EUR/month',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-student-finance-2026' order by ss.created_at desc limit 1),
  'calculated', 'medium', 'Combines the 100% monthly IPREM finance requirement with SEPIE national student-cost guidance.', jsonb_build_object('lower_bound_is_immigration_floor', true), date '2026-08-06', 'verified', now(),
  'The EUR 600 lower bound is a financial-evidence floor, not a realistic spending forecast in all cities.'
),
(
  'student_work_hours_limit', 'country', 'ES',
  jsonb_build_object('hours', 30, 'period', 'week', 'visa_type', 'long-duration study authorisation', 'work_must_be_compatible_with_studies', true),
  'hours/week',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-student-work-2025' order by ss.created_at desc limit 1),
  'observed', 'high', 'Stores the current maximum compatible work duration.', '{}'::jsonb, date '2025-05-01', 'verified', now(),
  'Intensive vocational training follows sector-specific rules.'
),
(
  'tuition_annual_low', 'country', 'ES',
  jsonb_build_object('amount', 700, 'currency', 'EUR', 'basis', 'approximate_public_undergraduate_tuition_range', 'institution_type', 'public', 'study_level', 'undergraduate', 'non_eu_surcharges_possible', true),
  'EUR/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-sepie-public-tuition' order by ss.created_at desc limit 1),
  'observed', 'medium', 'Lower bound of SEPIE public undergraduate tuition guidance.', '{}'::jsonb, date '2026-08-06', 'verified', now(),
  'Regional, programme, repeat-enrolment and non-resident rules can change the actual fee.'
),
(
  'tuition_annual_high', 'country', 'ES',
  jsonb_build_object('amount', 1800, 'currency', 'EUR', 'basis', 'approximate_public_undergraduate_tuition_range', 'institution_type', 'public', 'study_level', 'undergraduate', 'non_eu_surcharges_possible', true),
  'EUR/year',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-sepie-public-tuition' order by ss.created_at desc limit 1),
  'observed', 'medium', 'Upper bound of SEPIE public undergraduate tuition guidance.', '{}'::jsonb, date '2026-08-06', 'verified', now(),
  'Private institutions and some non-EU or non-resident fee regimes can be substantially higher.'
),
(
  'visa_application_fee', 'country', 'ES',
  jsonb_build_object('amount', 90, 'currency', 'EUR', 'fee_type', 'basic_national_study_visa_processing_fee', 'visa_type', 'national study visa', 'local_currency_and_reciprocity_variation_possible', true),
  'EUR',
  (select ss.id from evidence.source_snapshots ss join evidence.sources s on s.id=ss.source_id where s.source_key='es-national-visa-fee-2026' order by ss.created_at desc limit 1),
  'observed', 'high', 'Stores the standard basic national-visa consular fee.', '{}'::jsonb, date '2026-01-01', 'verified', now(),
  'Local currency, reciprocity, exemptions and external service charges can alter the payable amount.'
);

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'ES'
  and metric_key in (
    'average_annual_salary',
    'full_time_annual_earnings_range',
    'national_minimum_hourly_wage',
    'student_living_cost_monthly_range',
    'student_work_hours_limit',
    'tuition_annual_low',
    'tuition_annual_high',
    'visa_application_fee'
  );

insert into public.report_metric_evidence_country (
  scope_type, scope_id, metric_key, value, source_name, source_url,
  data_as_of, last_verified_at, confidence, evidence_kind, review_status
)
values
('country','ES','average_annual_salary',jsonb_build_object('amount',29540.26,'currency','EUR','basis','average_annual_gross_salary_per_worker','statistic_type','mean','population','employees covered by the INE Annual Wage Structure Survey'),'Annual Wage Structure Survey 2024','https://www.ine.es/dyngs/Prensa/es/EAES2024.htm',date '2024-12-31',now(),'high','observed','verified'),
('country','ES','full_time_annual_earnings_range',jsonb_build_object('low',24497.17,'high',29540.26,'ranking_value',24497.17,'currency','EUR','basis','annual_gross_median_to_mean_benchmark','measure_type','median_to_mean_not_percentile_range','population','employees covered by the INE Annual Wage Structure Survey'),'Annual Wage Structure Survey 2024','https://www.ine.es/dyngs/Prensa/es/EAES2024.htm',date '2024-12-31',now(),'medium','observed','verified'),
('country','ES','national_minimum_hourly_wage',jsonb_build_object('amount',8.22,'currency','EUR','basis','annual_smi_divided_by_2080_hours','monthly_amount_14_payments',1221,'annual_amount',17094,'weekly_hours_assumption',40),'Royal Decree 126/2026 — Minimum wage','https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815',date '2026-01-01',now(),'medium','calculated','verified'),
('country','ES','student_living_cost_monthly_range',jsonb_build_object('low',600,'high',1100,'ranking_value',850,'currency','EUR','basis','visa_iprem_floor_to_sepie_student_budget_guidance','scenario','one higher-education student; tuition excluded','measure_type','official_requirement_to_guidance_range'),'Student finance requirement and living-cost guidance','https://ciudadaniaexterior.inclusion.gob.es/es/web/migraciones/w/estancia-por-estudios',date '2026-08-06',now(),'medium','calculated','verified'),
('country','ES','student_work_hours_limit',jsonb_build_object('hours',30,'period','week','visa_type','long-duration study authorisation','work_must_be_compatible_with_studies',true),'Student work permission','https://ciudadaniaexterior.inclusion.gob.es/web/migraciones/w/hoja-4-bis-acceso-al-empleo-de-las-personas-titulares-de-una-autorizacion-de-estancia-de-larga-duracion-por-estudios-movilidad-de-alumnos-servicios-de-voluntariado-o-actividades-formativas',date '2025-05-01',now(),'high','observed','verified'),
('country','ES','tuition_annual_low',jsonb_build_object('amount',700,'currency','EUR','basis','approximate_public_undergraduate_tuition_range','institution_type','public','study_level','undergraduate','non_eu_surcharges_possible',true),'Public undergraduate tuition guidance','https://sepie.es/internacionalizacion/estudiar.html',date '2026-08-06',now(),'medium','observed','verified'),
('country','ES','tuition_annual_high',jsonb_build_object('amount',1800,'currency','EUR','basis','approximate_public_undergraduate_tuition_range','institution_type','public','study_level','undergraduate','non_eu_surcharges_possible',true),'Public undergraduate tuition guidance','https://sepie.es/internacionalizacion/estudiar.html',date '2026-08-06',now(),'medium','observed','verified'),
('country','ES','visa_application_fee',jsonb_build_object('amount',90,'currency','EUR','fee_type','basic_national_study_visa_processing_fee','visa_type','national study visa','local_currency_and_reciprocity_variation_possible',true),'National study-visa fee','https://www.exteriores.gob.es/Embajadas/pretoria/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Sud%C3%A1frica&scd=230&scs=Visados+Nacionales+-+Visado+de+estudios',date '2026-01-01',now(),'high','observed','verified');

commit;;
