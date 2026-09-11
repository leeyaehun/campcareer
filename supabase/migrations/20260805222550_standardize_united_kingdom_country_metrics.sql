-- Publish verified United Kingdom country metrics through the shared evidence layer.

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
        (
          'uk_ons_ashe_2025',
          'Office for National Statistics',
          'Annual Survey of Hours and Earnings, 2025 provisional',
          'government_dataset',
          'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025',
          date '2025-04-30',
          jsonb_build_object('release_date', '2025-10-23', 'occupation_rows', 363)
        ),
        (
          'uk_student_maintenance_2026',
          'UK Home Office',
          'Student visa financial requirement',
          'regulator',
          'https://www.gov.uk/student-visa/money',
          date '2026-08-05',
          jsonb_build_object('outside_london_monthly_gbp', 1171, 'london_monthly_gbp', 1529)
        ),
        (
          'uk_study_uk_tuition_2026',
          'British Council',
          'Cost of studying in the UK',
          'provider',
          'https://study-uk.britishcouncil.org/moving-uk/cost-studying',
          date '2026-08-05',
          jsonb_build_object('student_type', 'international', 'study_level', 'undergraduate')
        ),
        (
          'uk_minimum_wage_2026',
          'UK Government and Low Pay Commission',
          'National Minimum Wage and National Living Wage rates',
          'regulator',
          'https://www.gov.uk/national-minimum-wage-rates',
          date '2026-04-01',
          jsonb_build_object('age_basis', '21 and over')
        ),
        (
          'uk_student_visa_fee_2026',
          'UK Home Office',
          'Home Office immigration and nationality fees, 8 April 2026',
          'regulator',
          'https://www.gov.uk/government/publications/visa-regulations-revised-table/home-office-immigration-and-nationality-fees-8-april-2026',
          date '2026-04-08',
          jsonb_build_object('application_type', 'Student visa')
        ),
        (
          'uk_student_work_limit_2026',
          'UK Home Office',
          'Immigration Rules Appendix Student',
          'regulator',
          'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-student',
          date '2026-08-05',
          jsonb_build_object('course_level', 'degree level or above', 'period', 'term time')
        )
    ) as sources_to_publish(
      source_key,
      organisation_name,
      source_name,
      source_type,
      source_url,
      data_as_of,
      metadata
    )
  loop
    insert into evidence.sources (
      source_key,
      organisation_name,
      source_name,
      source_type,
      canonical_url,
      country_code,
      active,
      updated_at
    )
    values (
      source_row.source_key,
      source_row.organisation_name,
      source_row.source_name,
      source_row.source_type,
      source_row.source_url,
      'UK',
      true,
      now()
    )
    on conflict (source_key) do update
    set organisation_name = excluded.organisation_name,
        source_name = excluded.source_name,
        source_type = excluded.source_type,
        canonical_url = excluded.canonical_url,
        country_code = excluded.country_code,
        active = true,
        updated_at = now()
    returning id into source_id_value;

    select id
      into snapshot_id_value
    from evidence.source_snapshots
    where source_id = source_id_value
      and source_url = source_row.source_url
      and data_as_of = source_row.data_as_of
    order by retrieved_at desc
    limit 1;

    if snapshot_id_value is null then
      insert into evidence.source_snapshots (
        source_id,
        source_url,
        data_as_of,
        retrieved_at,
        snapshot_status,
        metadata
      )
      values (
        source_id_value,
        source_row.source_url,
        source_row.data_as_of,
        now(),
        'captured',
        source_row.metadata
      )
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
  where scope_type = 'country'
    and scope_id = 'UK'
    and metric_key in (
      'full_time_annual_earnings_range',
      'average_annual_salary',
      'student_living_cost_monthly_range',
      'tuition_annual_low',
      'tuition_annual_high',
      'national_minimum_hourly_wage',
      'visa_application_fee',
      'student_work_hours_limit'
    );

  for metric_row in
    select *
    from (
      values
        (
          'full_time_annual_earnings_range',
          'uk_ons_ashe_2025',
          jsonb_build_object(
            'low', 27609,
            'high', 41869,
            'ranking_value', 34250,
            'currency', 'GBP',
            'basis', 'interquartile_range_of_occupation_medians',
            'population', '363 occupations with median annual pay',
            'measure_type', 'occupation_median_distribution'
          ),
          'GBP/year',
          'calculated',
          'medium',
          'First quartile, median and third quartile across 363 occupation-level median annual pay values in public.occupations_uk.',
          jsonb_build_object(
            'not_individual_worker_distribution', true,
            'source_estimates_provisional', true
          ),
          date '2025-04-30',
          'Verified for the United Kingdom country dashboard.'
        ),
        (
          'average_annual_salary',
          'uk_ons_ashe_2025',
          jsonb_build_object(
            'amount', 39039,
            'currency', 'GBP',
            'basis', 'national_median_full_time_gross_annual_earnings',
            'statistic_type', 'median',
            'population', 'full-time employees in job for at least one year'
          ),
          'GBP/year',
          'observed',
          'high',
          'ONS national median gross annual earnings for full-time employees who had been in their jobs for at least one year.',
          jsonb_build_object('mean_salary', false, 'source_estimates_provisional', true),
          date '2025-04-30',
          'Verified national annual earnings benchmark.'
        ),
        (
          'student_living_cost_monthly_range',
          'uk_student_maintenance_2026',
          jsonb_build_object(
            'low', 1171,
            'high', 1529,
            'ranking_value', 1350,
            'currency', 'GBP',
            'basis', 'student_visa_financial_requirement',
            'scenario', 'one student; outside London to London; tuition excluded',
            'months_required', 9,
            'measure_type', 'official_requirement_range'
          ),
          'GBP/month',
          'observed',
          'high',
          'The lower and upper bounds are the current monthly UKVI maintenance requirements outside London and in London.',
          jsonb_build_object(
            'market_average', false,
            'tuition_excluded', true,
            'maximum_required_months', 9
          ),
          date '2026-08-05',
          'Verified current Student visa maintenance requirement.'
        ),
        (
          'tuition_annual_low',
          'uk_study_uk_tuition_2026',
          jsonb_build_object(
            'amount', 11400,
            'currency', 'GBP',
            'basis', 'published_international_undergraduate_range',
            'study_level', 'undergraduate',
            'student_type', 'international'
          ),
          'GBP/year',
          'observed',
          'medium',
          'Lower bound of the British Council Study UK international undergraduate tuition range.',
          jsonb_build_object('course_specific_fee_required_for_decision', true),
          date '2026-08-05',
          'Verified national planning lower bound.'
        ),
        (
          'tuition_annual_high',
          'uk_study_uk_tuition_2026',
          jsonb_build_object(
            'amount', 38000,
            'currency', 'GBP',
            'basis', 'published_international_undergraduate_range',
            'study_level', 'undergraduate',
            'student_type', 'international'
          ),
          'GBP/year',
          'observed',
          'medium',
          'Upper bound of the British Council Study UK international undergraduate tuition range.',
          jsonb_build_object('course_specific_fee_required_for_decision', true),
          date '2026-08-05',
          'Verified national planning upper bound.'
        ),
        (
          'national_minimum_hourly_wage',
          'uk_minimum_wage_2026',
          jsonb_build_object(
            'amount', 12.71,
            'currency', 'GBP',
            'employee_basis', 'national_living_wage_age_21_and_over'
          ),
          'GBP/hour',
          'observed',
          'high',
          'National Living Wage rate for workers aged 21 and over from 1 April 2026.',
          jsonb_build_object('younger_worker_rates_differ', true),
          date '2026-04-01',
          'Verified current adult statutory hourly floor.'
        ),
        (
          'visa_application_fee',
          'uk_student_visa_fee_2026',
          jsonb_build_object(
            'amount', 558,
            'currency', 'GBP',
            'fee_type', 'student_visa_application_fee',
            'visa_type', 'Student'
          ),
          'GBP',
          'observed',
          'high',
          'Student visa application fee applying from 8 April 2026.',
          jsonb_build_object('healthcare_surcharge_excluded', true),
          date '2026-04-08',
          'Verified current Student visa application fee.'
        ),
        (
          'student_work_hours_limit',
          'uk_student_work_limit_2026',
          jsonb_build_object(
            'hours', 20,
            'period', 'week',
            'visa_type', 'Student',
            'applies_during', 'term_time',
            'study_level', 'degree_level_or_above'
          ),
          'hours/week',
          'observed',
          'high',
          'Term-time work limit for eligible full-time degree-level students sponsored by qualifying higher education providers.',
          jsonb_build_object(
            'full_time_work_may_be_allowed_outside_term_time', true,
            'below_degree_limit_may_be_lower', true,
            'visa_conditions_control', true
          ),
          date '2026-08-05',
          'Verified current degree-level Student route work limit.'
        )
    ) as metrics_to_publish(
      metric_key,
      source_key,
      value,
      unit,
      evidence_kind,
      confidence,
      methodology,
      assumptions,
      effective_from,
      reviewer_note
    )
  loop
    select snapshot.id
      into snapshot_id_value
    from evidence.sources source
    join evidence.source_snapshots snapshot
      on snapshot.source_id = source.id
    where source.source_key = metric_row.source_key
    order by snapshot.retrieved_at desc
    limit 1;

    if snapshot_id_value is null then
      raise exception 'Missing source snapshot for %', metric_row.source_key;
    end if;

    insert into evidence.metric_observations (
      metric_key,
      scope_type,
      scope_id,
      value,
      unit,
      source_snapshot_id,
      evidence_kind,
      confidence,
      methodology,
      assumptions,
      effective_from,
      review_status,
      reviewed_at,
      reviewer_note
    )
    values (
      metric_row.metric_key,
      'country',
      'UK',
      metric_row.value,
      metric_row.unit,
      snapshot_id_value,
      metric_row.evidence_kind,
      metric_row.confidence,
      metric_row.methodology,
      metric_row.assumptions,
      metric_row.effective_from,
      'verified',
      now(),
      metric_row.reviewer_note
    );
  end loop;
end
$$;

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'UK'
  and metric_key in (
    'full_time_annual_earnings_range',
    'average_annual_salary',
    'student_living_cost_monthly_range',
    'tuition_annual_low',
    'tuition_annual_high',
    'national_minimum_hourly_wage',
    'visa_application_fee',
    'student_work_hours_limit'
  );

insert into public.report_metric_evidence_country (
  scope_type,
  scope_id,
  metric_key,
  value,
  source_name,
  source_url,
  data_as_of,
  last_verified_at,
  confidence,
  evidence_kind,
  review_status,
  created_at,
  updated_at
)
select
  observation.scope_type,
  observation.scope_id,
  observation.metric_key,
  observation.value,
  source.source_name,
  snapshot.source_url,
  coalesce(snapshot.data_as_of, observation.effective_from, current_date),
  coalesce(observation.reviewed_at, observation.updated_at, now()),
  observation.confidence,
  observation.evidence_kind,
  observation.review_status,
  observation.created_at,
  observation.updated_at
from evidence.metric_observations observation
join evidence.source_snapshots snapshot
  on snapshot.id = observation.source_snapshot_id
join evidence.sources source
  on source.id = snapshot.source_id
where observation.scope_type = 'country'
  and observation.scope_id = 'UK'
  and observation.review_status = 'verified'
  and observation.metric_key in (
    'full_time_annual_earnings_range',
    'average_annual_salary',
    'student_living_cost_monthly_range',
    'tuition_annual_low',
    'tuition_annual_high',
    'national_minimum_hourly_wage',
    'visa_application_fee',
    'student_work_hours_limit'
  );;
