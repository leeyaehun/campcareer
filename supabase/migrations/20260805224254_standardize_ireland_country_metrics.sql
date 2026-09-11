-- Publish verified Ireland country metrics through the shared evidence layer.

do $$
declare
  source_row record;
  source_id_value uuid;
  snapshot_id_value uuid;
begin
  for source_row in
    select *
    from (
      values
        ('ie_cso_earnings_q1_2026','Central Statistics Office Ireland','Earnings and Labour Costs Q1 2026 preliminary estimates','government_dataset','https://www.cso.ie/en/releasesandpublications/ep/p-elcq/earningsandlabourcostsq42025finalq12026preliminaryestimates/',date '2026-03-31',jsonb_build_object('revision_date','2026-07-06','sector_count',13,'all_sector_average_weekly_eur',1075.58)),
        ('ie_student_finance_2025','Immigration Service Delivery','Information on Student Finances','regulator','https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/a-fee-paying-private-primary-or-secondary-school/information-on-student-finances/',date '2025-06-30',jsonb_build_object('annual_requirement_eur',10000,'short_course_monthly_requirement_eur',833)),
        ('ie_hea_eurostudent_8_2023','Higher Education Authority','Eurostudent 8 Report findings','government_dataset','https://hea.ie/statistics/data-for-download-and-visualisations/institutes-performance/eurostudent-survey/',date '2023-12-31',jsonb_build_object('average_monthly_expenditure_eur',1340,'survey_responses',21000,'student_population','all higher-education students')),
        ('ie_education_tuition_2025_26','Education in Ireland','Undergraduate tuition fees 2025/26','provider','https://www.educationinireland.com/en/plan-your-study-abroad/undergraduate-tuition-fees',date '2025-09-01',jsonb_build_object('student_type','non-EU international','study_level','undergraduate','medicine_health_max_eur',62500)),
        ('ie_minimum_wage_2026','Department of Enterprise, Tourism and Employment','National Minimum Wage increase on 1 January 2026','regulator','https://www.gov.ie/en/publication/1786c-national-minimum-wage-increase-1-january/',date '2026-01-01',jsonb_build_object('age_basis','20 and over')),
        ('ie_student_visa_fee_2026','Immigration Service Delivery','Preclearance and entry visas fees','regulator','https://www.irishimmigration.ie/preclearance-and-entry-visas-fees/',date '2026-08-05',jsonb_build_object('single_entry_fee_eur',60,'multiple_entry_fee_eur',100,'stamp_2_registration_fee_eur',300)),
        ('ie_student_work_limit_2026','Immigration Service Delivery','Immigration permission stamps — Stamp 2','regulator','https://www.irishimmigration.ie/registering-your-immigration-permission/information-on-registering/immigration-permission-stamps/',date '2026-08-05',jsonb_build_object('permission','Stamp 2','term_time_hours_per_week',20,'holiday_hours_per_week',40))
    ) as sources_to_publish(source_key,organisation_name,source_name,source_type,source_url,data_as_of,metadata)
  loop
    insert into evidence.sources (source_key,organisation_name,source_name,source_type,canonical_url,country_code,active,updated_at)
    values (source_row.source_key,source_row.organisation_name,source_row.source_name,source_row.source_type,source_row.source_url,'IE',true,now())
    on conflict (source_key) do update
    set organisation_name=excluded.organisation_name,
        source_name=excluded.source_name,
        source_type=excluded.source_type,
        canonical_url=excluded.canonical_url,
        country_code=excluded.country_code,
        active=true,
        updated_at=now()
    returning id into source_id_value;

    select id into snapshot_id_value
    from evidence.source_snapshots
    where source_id=source_id_value and source_url=source_row.source_url and data_as_of=source_row.data_as_of
    order by retrieved_at desc limit 1;

    if snapshot_id_value is null then
      insert into evidence.source_snapshots (source_id,source_url,data_as_of,retrieved_at,snapshot_status,metadata)
      values (source_id_value,source_row.source_url,source_row.data_as_of,now(),'captured',source_row.metadata)
      returning id into snapshot_id_value;
    end if;
  end loop;
end
$$;

do $$
declare
  metric_row record;
  snapshot_id_value uuid;
begin
  delete from evidence.metric_observations
  where scope_type='country' and scope_id='IE'
    and metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');

  for metric_row in
    select * from (
      values
        ('full_time_annual_earnings_range','ie_cso_earnings_q1_2026',jsonb_build_object('low',44130,'high',66381,'ranking_value',53427,'currency','EUR','basis','interquartile_range_of_annualised_sector_average_weekly_earnings','population','13 NACE economic sectors','measure_type','sector_average_distribution'),'EUR/year','calculated','medium','The Q1 2026 average weekly earnings for 13 CSO sectors are annualised using 52 weeks. The first quartile, median and third quartile are rounded to the nearest euro.',jsonb_build_object('not_worker_level_percentiles',true,'all_employee_sector_averages',true,'preliminary_estimates',true),date '2026-03-31','Verified as a transparent national sector benchmark for the Ireland dashboard.'),
        ('average_annual_salary','ie_cso_earnings_q1_2026',jsonb_build_object('amount',55930,'currency','EUR','basis','annualised_all_sector_average_weekly_earnings','weekly_amount',1075.58,'statistic_type','mean','population','all employees represented by EHECS'),'EUR/year','calculated','high','The all-sector Q1 2026 average weekly earnings of EUR 1,075.58 are multiplied by 52 and rounded to the nearest euro.',jsonb_build_object('not_full_time_only',true,'preliminary_estimates',true),date '2026-03-31','Verified annualised national earnings benchmark.'),
        ('student_living_cost_monthly_range','ie_student_finance_2025',jsonb_build_object('low',833,'high',1340,'ranking_value',1340,'currency','EUR','basis','immigration_finance_minimum_to_hea_average_student_expenditure','scenario','one higher-education student; tuition excluded','measure_type','official_minimum_to_observed_average','high_source_key','ie_hea_eurostudent_8_2023'),'EUR/month','calculated','medium','The lower bound is the EUR 10,000 annual immigration finance requirement divided by 12 and rounded. The upper and ranking value is the HEA Eurostudent 8 average monthly expenditure for all students.',jsonb_build_object('legal_minimum_is_not_market_budget',true,'hea_average_report_year',2023,'not_international_students_only',true,'tuition_excluded',true),date '2025-06-30','Verified for planning use with explicit mixed-period limitations.'),
        ('tuition_annual_low','ie_education_tuition_2025_26',jsonb_build_object('amount',10300,'currency','EUR','basis','mainstream_non_eu_undergraduate_published_range','study_level','undergraduate','student_type','non-EU international','medicine_health_excluded',true),'EUR/year','observed','medium','Lowest published 2025/26 non-EU undergraduate fee across business, engineering, science and technology, and arts and humanities.',jsonb_build_object('course_specific_fee_required_for_decision',true),date '2025-09-01','Verified national planning lower bound.'),
        ('tuition_annual_high','ie_education_tuition_2025_26',jsonb_build_object('amount',29000,'currency','EUR','basis','mainstream_non_eu_undergraduate_published_range','study_level','undergraduate','student_type','non-EU international','medicine_health_excluded',true,'medicine_health_published_maximum',62500),'EUR/year','observed','medium','Highest published 2025/26 non-EU undergraduate fee across mainstream non-medical fields. Medicine and health sciences are stored separately in metadata.',jsonb_build_object('course_specific_fee_required_for_decision',true),date '2025-09-01','Verified national planning upper bound excluding medicine and health sciences.'),
        ('national_minimum_hourly_wage','ie_minimum_wage_2026',jsonb_build_object('amount',14.15,'currency','EUR','employee_basis','national_minimum_wage_age_20_and_over'),'EUR/hour','observed','high','National Minimum Wage rate for workers aged 20 and over from 1 January 2026.',jsonb_build_object('younger_worker_rates_differ',true,'limited_exclusions_apply',true),date '2026-01-01','Verified current adult statutory hourly floor.'),
        ('visa_application_fee','ie_student_visa_fee_2026',jsonb_build_object('amount',60,'currency','EUR','fee_type','single_entry_visa_application_processing_fee','visa_type','long_stay_study_entry','stamp_2_registration_fee_excluded',300),'EUR','observed','high','Standard single-entry visa processing fee. Some applicants are visa-exempt or fee-exempt, and the post-arrival immigration registration fee is separate.',jsonb_build_object('nationality_exemptions_apply',true,'local_submission_charges_may_apply',true,'registration_fee_excluded',true),date '2026-08-05','Verified current standard entry visa processing fee.'),
        ('student_work_hours_limit','ie_student_work_limit_2026',jsonb_build_object('hours',20,'period','week','visa_type','Stamp 2','applies_during','term_time','holiday_hours',40),'hours/week','observed','high','Eligible students holding valid Stamp 2 permission may work up to 20 hours per week during term time and up to 40 hours during designated holiday periods.',jsonb_build_object('stamp_2a_cannot_work',true,'self_employment_not_permitted',true,'permission_conditions_control',true),date '2026-08-05','Verified current Stamp 2 term-time work limit.')
    ) as metrics_to_publish(metric_key,source_key,value,unit,evidence_kind,confidence,methodology,assumptions,effective_from,reviewer_note)
  loop
    select snapshot.id into snapshot_id_value
    from evidence.sources source
    join evidence.source_snapshots snapshot on snapshot.source_id=source.id
    where source.source_key=metric_row.source_key
    order by snapshot.retrieved_at desc limit 1;

    if snapshot_id_value is null then
      raise exception 'Missing source snapshot for %',metric_row.source_key;
    end if;

    insert into evidence.metric_observations (metric_key,scope_type,scope_id,value,unit,source_snapshot_id,evidence_kind,confidence,methodology,assumptions,effective_from,review_status,reviewed_at,reviewer_note)
    values (metric_row.metric_key,'country','IE',metric_row.value,metric_row.unit,snapshot_id_value,metric_row.evidence_kind,metric_row.confidence,metric_row.methodology,metric_row.assumptions,metric_row.effective_from,'verified',now(),metric_row.reviewer_note);
  end loop;
end
$$;

delete from public.report_metric_evidence_country
where scope_type='country' and scope_id='IE'
  and metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');

insert into public.report_metric_evidence_country (scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select observation.scope_type,observation.scope_id,observation.metric_key,observation.value,source.source_name,snapshot.source_url,
       coalesce(snapshot.data_as_of,observation.effective_from,current_date),
       coalesce(observation.reviewed_at,observation.updated_at,now()),
       observation.confidence,observation.evidence_kind,observation.review_status,observation.created_at,observation.updated_at
from evidence.metric_observations observation
join evidence.source_snapshots snapshot on snapshot.id=observation.source_snapshot_id
join evidence.sources source on source.id=snapshot.source_id
where observation.scope_type='country' and observation.scope_id='IE' and observation.review_status='verified'
  and observation.metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');;
