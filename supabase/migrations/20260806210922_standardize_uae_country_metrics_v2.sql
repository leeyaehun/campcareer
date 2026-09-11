do $$
declare
  reviewed_ts timestamptz := now();
begin
  delete from evidence.metric_observations
  where scope_type = 'country'
    and scope_id = 'AE'
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
    v.metric_key, 'country', 'AE', v.value, v.unit, ss.id,
    v.evidence_kind, v.confidence, v.methodology, v.assumptions, v.effective_from,
    'verified', reviewed_ts,
    'CampCareer batch 3 United Arab Emirates official-source review, 6 August 2026', reviewed_ts
  from (
    values
      ('full_time_annual_earnings_range', 'cc_ae_wage_policy_benchmarks_2026_v2',
       '{"low":48000,"high":72000,"ranking_value":60000,"currency":"AED","basis":"official_wage_policy_thresholds_annualised","measure_type":"policy_threshold_range","monthly_skilled_classification_threshold":4000,"monthly_emirati_private_sector_minimum":6000,"observed_earnings_distribution":false}'::jsonb,
       'AED/year', 'calculated', 'low',
       'No official national earnings distribution was identified in the reviewed UAE Labour Force Survey metadata. The displayed comparison annualises two official monthly policy thresholds: AED 4,000 for the skilled-work classification and AED 6,000 for the 2026 Emirati private-sector minimum salary. It must not be interpreted as an observed salary distribution.',
       '{"monthly_to_annual_multiplier":12,"different_policy_populations":true,"not_a_market_distribution":true,"not_a_graduate_salary_range":true,"midpoint_is_display_only":true}'::jsonb, date '2026-01-01'),
      ('average_annual_salary', 'cc_ae_ilo_lfs_2024_v2',
       '{"amount":null,"currency":"AED","basis":"official_national_average_not_published_in_reviewed_sources","unavailable":true,"statistic_type":"not_available","survey_reference":"ARE_2024_LFS_v01_M_ILO_VAR"}'::jsonb,
       'AED/year', 'observed', 'high',
       'The 2024 UAE Labour Force Survey metadata reviewed through the ILO catalogue has national coverage and lists labour-force, occupation and working-hours topics but does not publish an earnings variable or national average salary. No numeric average is inferred.',
       '{"numeric_value_intentionally_null":true,"private_salary_surveys_excluded":true,"policy_thresholds_not_substituted_for_average":true}'::jsonb, date '2024-12-31'),
      ('national_minimum_hourly_wage', 'cc_ae_uagov_minimum_wage_2026_v2',
       '{"amount":null,"currency":"AED","not_applicable":true,"basis":"no_general_statutory_national_minimum_wage","emirati_private_sector_monthly_minimum":6000,"specific_policy_exception":true}'::jsonb,
       'AED/hour', 'observed', 'high',
       'UAE Labour Law does not stipulate one general minimum salary. A separate AED 6,000 monthly minimum applies to Emiratis in the private sector from 2026, so no artificial nationwide hourly amount is stored.',
       '{"numeric_value_intentionally_null":true,"specific_nationality_and_sector_rule_retained":true,"contract_and_classification_conditions_may_apply":true}'::jsonb, date '2026-01-01'),
      ('student_living_cost_monthly_range', 'cc_ae_ku_student_budget_2026_v2',
       '{"low":6250,"high":7100,"ranking_value":6675,"currency":"AED","basis":"representative_official_university_on_to_off_campus_budget","scenario":"one undergraduate student in Abu Dhabi; tuition excluded","on_campus_monthly":6250,"off_campus_monthly":7100,"national_average":false}'::jsonb,
       'AED/month', 'observed', 'medium',
       'Khalifa University publishes AED 6,250 per month for an undergraduate on-campus budget and AED 7,100 for off-campus living. Tuition amounts shown separately on the source are excluded.',
       '{"representative_abu_dhabi_scenarios":true,"national_average_claimed":false,"tuition_excluded":true,"deposits_flights_insurance_and_setup_costs_excluded":true}'::jsonb, date '2026-08-06'),
      ('tuition_annual_low', 'cc_ae_ku_tuition_2026_v2',
       '{"amount":81250,"currency":"AED","basis":"representative_mainstream_undergraduate_tuition","institution":"Khalifa University","programme_level":"Bachelor of Science","student_type":"fee-paying student","national_minimum_claimed":false}'::jsonb,
       'AED/year', 'observed', 'high',
       'The lower representative benchmark uses Khalifa University''s estimated annual Bachelor of Science tuition of AED 81,250. It is not presented as an absolute national minimum.',
       '{"housing_transport_deposit_and_other_fees_excluded":true,"scholarships_excluded":true,"national_minimum_claimed":false}'::jsonb, date '2026-08-01'),
      ('tuition_annual_high', 'cc_ae_aus_tuition_2026_27_v2',
       '{"amount":110876,"currency":"AED","basis":"representative_mainstream_undergraduate_tuition","institution":"American University of Sharjah","programme_level":"undergraduate all majors","academic_year":"2026/27","national_maximum_claimed":false}'::jsonb,
       'AED/year', 'observed', 'high',
       'The upper representative benchmark uses American University of Sharjah''s AED 110,876 annual undergraduate tuition for all majors in 2026/27. It is not presented as an absolute national maximum.',
       '{"technology_lab_application_activities_housing_and_insurance_fees_excluded":true,"scholarships_excluded":true,"national_maximum_claimed":false}'::jsonb, date '2026-08-01'),
      ('student_work_hours_limit', 'cc_ae_mohre_student_work_2026_v2',
       '{"hours":48,"period":"week_general_maximum_normal_hours","basis":"general_private_sector_maximum_under_approved_student_work_permit","separate_universal_student_weekly_cap_published":false,"student_permit_validity_months":3,"federal_permit_fee":50}'::jsonb,
       'hours/week', 'calculated', 'medium',
       'The official student permit service does not publish one separate universal weekly student cap. For cross-country comparison the metric stores the private-sector maximum normal working time of 48 hours per week, but actual student work requires an approved permit and contract and may be substantially lower.',
       '{"approved_student_work_permit_required":true,"not_an_automatic_student_entitlement":true,"age_residence_guardian_employer_free_zone_and_contract_conditions_control":true,"actual_schedule_may_be_lower":true}'::jsonb, date '2026-08-06'),
      ('visa_application_fee', 'cc_ae_icp_student_residence_2026_v2',
       '{"amount":300,"currency":"AED","basis":"base_first_year_student_residence_issuance_fees","application_fee":100,"first_year_issuance_fee":100,"smart_service_fee":100,"visa_type":"student residence permit"}'::jsonb,
       'AED', 'calculated', 'high',
       'The calculation adds the ICP AED 100 application fee, AED 100 first-year residence issuance fee and AED 100 smart-service fee. It is a base planning amount and is not added to the /visas catalogue.',
       '{"medical_examination_emirates_id_health_insurance_status_adjustment_deposits_and_sponsor_or_university_fees_excluded":true,"additional_years_excluded":true}'::jsonb, date '2026-08-06')
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
    where scope_type='country' and scope_id='AE' and review_status='verified'
      and metric_key in (
        'full_time_annual_earnings_range', 'average_annual_salary',
        'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
        'tuition_annual_low', 'tuition_annual_high',
        'student_work_hours_limit', 'visa_application_fee'
      )
  ) <> 8 then
    raise exception 'Expected exactly 8 verified UAE metric observations';
  end if;
end $$;

delete from evidence.sources s
where s.country_code = 'AE'
  and s.source_key not in (
    'cc_ae_ilo_lfs_2024_v2',
    'cc_ae_wage_policy_benchmarks_2026_v2',
    'cc_ae_uagov_minimum_wage_2026_v2',
    'cc_ae_ku_student_budget_2026_v2',
    'cc_ae_ku_tuition_2026_v2',
    'cc_ae_aus_tuition_2026_27_v2',
    'cc_ae_mohre_student_work_2026_v2',
    'cc_ae_icp_student_residence_2026_v2'
  )
  and not exists (
    select 1
    from evidence.source_snapshots ss
    join evidence.metric_observations mo on mo.source_snapshot_id = ss.id
    where ss.source_id = s.id
  );;
