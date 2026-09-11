-- Publish verified Germany country metrics through the shared evidence layer.

insert into core.countries (code, name, default_currency, active, updated_at)
values ('DE', 'Germany', 'EUR', true, now())
on conflict (code) do update set name=excluded.name, default_currency=excluded.default_currency, active=true, updated_at=now();

with incoming(source_key, organisation_name, source_name, source_type, source_url, data_as_of, metadata) as (values
('de_destatis_earnings_2025','Federal Statistical Office','Earnings Survey 2025','government_dataset','https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html',date '2025-12-31','{"median_annual_eur":54066,"mean_annual_eur":64441}'::jsonb),
('de_student_finance_2026','Federal Government','Student finance and living-cost guidance','regulator','https://www.make-it-in-germany.com/en/visa-residence/types/studying',date '2026-01-01','{"annual_funding_requirement_eur":11904,"daad_planning_upper_eur":1200,"secondary_url":"https://www.daad.de/en/studying-in-germany/living-in-germany/finances/"}'::jsonb),
('de_daad_tuition_2026','DAAD','Costs of education and living','provider','https://www.daad.de/en/studying-in-germany/living-in-germany/finances/',date '2026-08-05','{"baden_wuerttemberg_non_eu_semester_eur":1500}'::jsonb),
('de_minimum_wage_2026','Federal Ministry of Labour','Statutory minimum wage','regulator','https://www.bmas.de/EN/Labour/Minimum-Wage/the-minimum-wage-questions-and-answers.html',date '2026-01-01','{}'::jsonb),
('de_visa_fee_2026','Federal Foreign Office','Visa fees for long-term stays','regulator','https://www.auswaertiges-amt.de/en/visa-service/215870-215870',date '2026-08-05','{"adult_national_visa_eur":75}'::jsonb),
('de_student_work_2026','Federal Government','Study and work rules for international students','regulator','https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/work',date '2026-08-05','{"annual_full_days":140,"annual_half_days":280}'::jsonb)
)
insert into evidence.sources (source_key, organisation_name, source_name, source_type, canonical_url, country_code, active, updated_at)
select source_key, organisation_name, source_name, source_type, source_url, 'DE', true, now() from incoming
on conflict (source_key) do update set organisation_name=excluded.organisation_name, source_name=excluded.source_name, source_type=excluded.source_type, canonical_url=excluded.canonical_url, country_code='DE', active=true, updated_at=now();

with incoming(source_key, organisation_name, source_name, source_type, source_url, data_as_of, metadata) as (values
('de_destatis_earnings_2025','Federal Statistical Office','Earnings Survey 2025','government_dataset','https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html',date '2025-12-31','{"median_annual_eur":54066,"mean_annual_eur":64441}'::jsonb),
('de_student_finance_2026','Federal Government','Student finance and living-cost guidance','regulator','https://www.make-it-in-germany.com/en/visa-residence/types/studying',date '2026-01-01','{"annual_funding_requirement_eur":11904,"daad_planning_upper_eur":1200,"secondary_url":"https://www.daad.de/en/studying-in-germany/living-in-germany/finances/"}'::jsonb),
('de_daad_tuition_2026','DAAD','Costs of education and living','provider','https://www.daad.de/en/studying-in-germany/living-in-germany/finances/',date '2026-08-05','{"baden_wuerttemberg_non_eu_semester_eur":1500}'::jsonb),
('de_minimum_wage_2026','Federal Ministry of Labour','Statutory minimum wage','regulator','https://www.bmas.de/EN/Labour/Minimum-Wage/the-minimum-wage-questions-and-answers.html',date '2026-01-01','{}'::jsonb),
('de_visa_fee_2026','Federal Foreign Office','Visa fees for long-term stays','regulator','https://www.auswaertiges-amt.de/en/visa-service/215870-215870',date '2026-08-05','{"adult_national_visa_eur":75}'::jsonb),
('de_student_work_2026','Federal Government','Study and work rules for international students','regulator','https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/work',date '2026-08-05','{"annual_full_days":140,"annual_half_days":280}'::jsonb)
)
insert into evidence.source_snapshots (source_id, source_url, data_as_of, retrieved_at, snapshot_status, metadata)
select s.id, i.source_url, i.data_as_of, now(), 'captured', i.metadata
from incoming i join evidence.sources s on s.source_key=i.source_key
where not exists (select 1 from evidence.source_snapshots x where x.source_id=s.id and x.source_url=i.source_url and x.data_as_of=i.data_as_of);

delete from evidence.metric_observations where scope_type='country' and scope_id='DE' and metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');

with incoming(metric_key, source_key, value, unit, evidence_kind, confidence, methodology, assumptions, effective_from, reviewer_note) as (values
('full_time_annual_earnings_range','de_destatis_earnings_2025','{"low":54066,"high":64441,"ranking_value":54066,"currency":"EUR","basis":"national_median_to_arithmetic_mean_gross_annual_earnings"}'::jsonb,'EUR/year','observed','high','Compare the national full-time median with the arithmetic mean reported in the Earnings Survey.','{"not_quartile_range":true}'::jsonb,date '2025-12-31','Verified median-to-mean earnings benchmark.'),
('average_annual_salary','de_destatis_earnings_2025','{"amount":64441,"currency":"EUR","basis":"national_arithmetic_mean_gross_annual_earnings","statistic_type":"mean"}'::jsonb,'EUR/year','observed','high','Store the national arithmetic mean gross annual earnings.','{}'::jsonb,date '2025-12-31','Verified national mean annual earnings benchmark.'),
('student_living_cost_monthly_range','de_student_finance_2026','{"low":992,"high":1200,"ranking_value":1096,"currency":"EUR","basis":"student_visa_funding_requirement_to_daad_planning_upper_bound","scenario":"one higher-education student; tuition excluded","annual_funding_requirement":11904}'::jsonb,'EUR/month','calculated','medium','Convert the annual visa funding requirement to EUR 992 per month and compare it with the DAAD planning upper benchmark.','{"tuition_excluded":true,"mixed_requirement_and_guidance":true}'::jsonb,date '2026-01-01','Verified student planning range.'),
('tuition_annual_low','de_daad_tuition_2026','{"amount":0,"currency":"EUR","basis":"standard_public_university_tuition","institution_type":"public"}'::jsonb,'EUR/year','observed','medium','Store the standard public-university tuition floor.','{"semester_contribution_excluded":true,"private_universities_excluded":true}'::jsonb,date '2026-08-05','Verified public-university tuition floor.'),
('tuition_annual_high','de_daad_tuition_2026','{"amount":3000,"currency":"EUR","basis":"baden_wuerttemberg_non_eu_public_tuition_annualised","institution_type":"public"}'::jsonb,'EUR/year','calculated','medium','Annualise the Baden-Württemberg EUR 1,500 per-semester non-EU charge.','{"semester_contribution_excluded":true,"other_state_and_programme_fees_may_differ":true}'::jsonb,date '2026-08-05','Verified public-university planning upper bound.'),
('national_minimum_hourly_wage','de_minimum_wage_2026','{"amount":13.9,"currency":"EUR","basis":"general_statutory_minimum_wage"}'::jsonb,'EUR/hour','observed','high','Store the general statutory hourly minimum effective January 2026.','{"sector_rules_and_exceptions_may_differ":true}'::jsonb,date '2026-01-01','Verified current statutory minimum wage.'),
('visa_application_fee','de_visa_fee_2026','{"amount":75,"currency":"EUR","basis":"adult_national_visa_processing_fee"}'::jsonb,'EUR','observed','high','Store the adult national-visa processing fee for long-term stays.','{"other_application_costs_excluded":true}'::jsonb,date '2026-08-05','Verified national study visa fee.'),
('student_work_hours_limit','de_student_work_2026','{"hours":20,"period":"week","annual_full_day_alternative":140,"annual_half_day_alternative":280}'::jsonb,'hours/week','observed','high','Store the weekly lecture-period benchmark and annual full-day/half-day alternatives.','{"residence_conditions_control":true}'::jsonb,date '2026-08-05','Verified current international-student work allowance.')
), latest_snapshots as (
  select distinct on (s.source_key) s.source_key, ss.id
  from evidence.sources s join evidence.source_snapshots ss on ss.source_id=s.id
  where s.source_key in ('de_destatis_earnings_2025','de_student_finance_2026','de_daad_tuition_2026','de_minimum_wage_2026','de_visa_fee_2026','de_student_work_2026')
  order by s.source_key, ss.retrieved_at desc
)
insert into evidence.metric_observations (metric_key, scope_type, scope_id, value, unit, source_snapshot_id, evidence_kind, confidence, methodology, assumptions, effective_from, review_status, reviewed_at, reviewer_note)
select i.metric_key, 'country', 'DE', i.value, i.unit, l.id, i.evidence_kind, i.confidence, i.methodology, i.assumptions, i.effective_from, 'verified', now(), i.reviewer_note
from incoming i join latest_snapshots l on l.source_key=i.source_key;

delete from public.report_metric_evidence_country where scope_type='country' and scope_id='DE' and metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');

insert into public.report_metric_evidence_country (scope_type, scope_id, metric_key, value, source_name, source_url, data_as_of, last_verified_at, confidence, evidence_kind, review_status, created_at, updated_at)
select o.scope_type, o.scope_id, o.metric_key, o.value, s.source_name, ss.source_url, coalesce(ss.data_as_of,o.effective_from,current_date), coalesce(o.reviewed_at,o.updated_at,now()), o.confidence, o.evidence_kind, o.review_status, o.created_at, o.updated_at
from evidence.metric_observations o
join evidence.source_snapshots ss on ss.id=o.source_snapshot_id
join evidence.sources s on s.id=ss.source_id
where o.scope_type='country' and o.scope_id='DE' and o.review_status='verified' and o.metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');;
