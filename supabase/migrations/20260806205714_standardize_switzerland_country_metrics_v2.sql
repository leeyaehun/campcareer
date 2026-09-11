do $$
declare
  reviewed_ts timestamptz := now();
begin
  delete from evidence.metric_observations
  where scope_type = 'country'
    and scope_id = 'CH'
    and metric_key in (
      'full_time_annual_earnings_range', 'average_annual_salary',
      'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
      'tuition_annual_low', 'tuition_annual_high',
      'student_work_hours_limit', 'visa_application_fee'
    );

  insert into evidence.metric_observations (
    metric_key, scope_type, scope_id, value, unit, source_snapshot_id,
    evidence_kind, confidence, methodology, assumptions, effective_from,
    review_status, reviewed_at, reviewer_note, updated_at
  )
  select
    v.metric_key, 'country', 'CH', v.value, v.unit, ss.id,
    v.evidence_kind, v.confidence, v.methodology, v.assumptions, v.effective_from,
    'verified', reviewed_ts,
    'CampCareer batch 3 Switzerland official-source review, 6 August 2026', reviewed_ts
  from (
    values
      ('full_time_annual_earnings_range', 'cc_ch_bfs_earnings_2024_v2',
       '{"low":55620,"high":150312,"ranking_value":84288,"currency":"CHF","basis":"national_p10_to_p90_standardised_monthly_gross_wage_annualised","measure_type":"decile_distribution","monthly_p10":4635,"monthly_median":7024,"monthly_p90":12526,"population":"standardised full-time gross wage, private and public sectors, Switzerland"}'::jsonb,
       'CHF/year', 'calculated', 'high',
       'The FSO monthly P10, median and P90 standardised gross wages are multiplied by twelve. The published range is an official P10-P90 distribution and is not labelled as a quartile range.',
       '{"monthly_to_annual_multiplier":12,"not_a_quartile_range":true,"not_a_starting_salary":true}'::jsonb, date '2024-12-31'),
      ('average_annual_salary', 'cc_ch_bfs_earnings_2024_v2',
       '{"amount":84288,"currency":"CHF","monthly_amount":7024,"statistic_type":"median_benchmark","basis":"annualised_national_gross_monthly_median_benchmark","population":"standardised full-time gross wage, private and public sectors, Switzerland"}'::jsonb,
       'CHF/year', 'calculated', 'medium',
       'The shared calculation key stores the annualised FSO national median because the official release identifies the median as the central national salary indicator. No arithmetic mean is inferred or presented.',
       '{"monthly_to_annual_multiplier":12,"legacy_metric_key_name":true,"value_is_median_not_mean":true,"not_a_starting_salary":true}'::jsonb, date '2024-12-31'),
      ('national_minimum_hourly_wage', 'cc_ch_seco_minimum_wage_2026_v2',
       '{"amount":null,"currency":"CHF","not_applicable":true,"basis":"no_statutory_national_minimum_wage","cantonal_and_sectoral_minimums_exist":true}'::jsonb,
       'CHF/hour', 'observed', 'high',
       'Switzerland has no single national statutory minimum wage. Mandatory rates may exist under cantonal law, generally binding collective agreements or standard employment contracts, so no artificial national hourly value is stored.',
       '{"cantonal_rates_may_apply":true,"sector_collective_agreement_rates_may_apply":true,"numeric_value_intentionally_null":true}'::jsonb, date '2026-08-06'),
      ('student_living_cost_monthly_range', 'cc_ch_student_budgets_2026_v2',
       '{"low":1300,"high":2300,"ranking_value":1900,"currency":"CHF","basis":"official_regional_student_budget_range","scenario":"one higher-education student; tuition excluded","usi_lugano_mendrisio_low":1300,"usi_lugano_mendrisio_high":1900,"epfl_lausanne_budget":2300}'::jsonb,
       'CHF/month', 'calculated', 'medium',
       'The national planning range combines USI''s official CHF 1,300-1,900 monthly student budget for Lugano or Mendrisio with EPFL''s approximately CHF 2,300 monthly budget around the Lausanne campus. Tuition is excluded.',
       '{"secondary_official_source":"https://www.epfl.ch/education/studies/en/financing-study/working/","regional_scenarios_not_national_average":true,"tuition_excluded":true,"deposit_and_setup_costs_excluded":true}'::jsonb, date '2026-08-06'),
      ('tuition_annual_low', 'cc_ch_unige_tuition_2026_v2',
       '{"amount":1000,"currency":"CHF","basis":"representative_general_public_university_fee_annualised","institution":"University of Geneva","semester_fee":500,"student_type":"Swiss and foreign bachelor and master students","specialist_private_programmes_excluded":true}'::jsonb,
       'CHF/year', 'calculated', 'high',
       'The lower representative benchmark annualises the University of Geneva''s CHF 500 semester fee over two semesters. It is not presented as an absolute national minimum.',
       '{"semester_to_annual_multiplier":2,"national_minimum_claimed":false,"application_and_optional_costs_excluded":true}'::jsonb, date '2026-08-01'),
      ('tuition_annual_high', 'cc_ch_usi_tuition_2026_v2',
       '{"amount":8000,"currency":"CHF","basis":"representative_general_public_university_fee_annualised","institution":"Università della Svizzera italiana","semester_fee":4000,"student_type":"standard bachelor and master fee","specialist_private_programmes_excluded":true}'::jsonb,
       'CHF/year', 'calculated', 'high',
       'The upper representative benchmark annualises USI''s standard CHF 4,000 semester fee over two semesters. It is not presented as an absolute national maximum.',
       '{"semester_to_annual_multiplier":2,"national_maximum_claimed":false,"scholarships_reduced_rates_and_application_costs_excluded":true}'::jsonb, date '2026-08-01'),
      ('student_work_hours_limit', 'cc_ch_sem_student_work_2026_v2',
       '{"hours":15,"period":"week_during_semester","basis":"maximum_weekly_incidental_employment_outside_holidays","holiday_full_time_possible":true,"non_eu_efta_waiting_months":6,"cantonal_authorisation_required":true}'::jsonb,
       'hours/week', 'observed', 'high',
       'Foreign higher-education students may be authorised for a maximum of 15 hours per week outside university holidays. Non-EU/EFTA students generally may start only after six months and an employer application is required.',
       '{"university_compatibility_confirmation_required":true,"employer_application_required":true,"individual_cantonal_and_permit_conditions_control":true}'::jsonb, date '2026-07-01'),
      ('visa_application_fee', 'cc_ch_eda_student_visa_fee_2026_v2',
       '{"amount":0,"currency":"CHF","basis":"student_national_visa_fee_exemption","visa_type":"national visa for studies","fee_exempt":true,"exceptions_may_apply":true}'::jsonb,
       'CHF', 'observed', 'high',
       'The calculation metric stores CHF 0 because Swiss national visa applications for students studying in Switzerland are fee-exempt. It is not added to the /visas catalogue.',
       '{"cantonal_residence_permit_fees_excluded":true,"document_certification_travel_insurance_and_external_service_costs_excluded":true,"local_representation_procedure_must_be_checked":true}'::jsonb, date '2026-08-06')
  ) as v(metric_key, source_key, value, unit, evidence_kind, confidence, methodology, assumptions, effective_from)
  join evidence.sources s on s.source_key = v.source_key
  join lateral (
    select source_snapshot.*
    from evidence.source_snapshots source_snapshot
    where source_snapshot.source_id = s.id
      and source_snapshot.snapshot_status in ('captured', 'unchanged')
    order by source_snapshot.retrieved_at desc
    limit 1
  ) ss on true;

  if (
    select count(*) from evidence.metric_observations
    where scope_type='country' and scope_id='CH' and review_status='verified'
      and metric_key in (
        'full_time_annual_earnings_range', 'average_annual_salary',
        'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
        'tuition_annual_low', 'tuition_annual_high',
        'student_work_hours_limit', 'visa_application_fee'
      )
  ) <> 8 then
    raise exception 'Expected exactly 8 verified Switzerland metric observations';
  end if;
end $$;

delete from evidence.sources s
where s.country_code = 'CH'
  and s.source_key not in (
    'cc_ch_bfs_earnings_2024_v2',
    'cc_ch_seco_minimum_wage_2026_v2',
    'cc_ch_student_budgets_2026_v2',
    'cc_ch_unige_tuition_2026_v2',
    'cc_ch_usi_tuition_2026_v2',
    'cc_ch_sem_student_work_2026_v2',
    'cc_ch_eda_student_visa_fee_2026_v2'
  )
  and not exists (
    select 1
    from evidence.source_snapshots ss
    join evidence.metric_observations mo on mo.source_snapshot_id = ss.id
    where ss.source_id = s.id
  );;
