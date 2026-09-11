-- Publish verified United States country metrics for display and future
-- tuition, visa-fee and student-work calculations.

do $$
declare
  item jsonb;
  source_id_value uuid;
  snapshot_id_value uuid;
begin
  delete from evidence.metric_observations
  where scope_type = 'country'
    and scope_id = 'US'
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

  for item in
    select value
    from jsonb_array_elements(
      $seed$
      [
        {
          "source_key": "us_bls_oews_2025_05",
          "organisation_name": "U.S. Bureau of Labor Statistics",
          "source_name": "Occupational Employment and Wage Statistics, May 2025",
          "source_type": "government_dataset",
          "source_url": "https://www.bls.gov/news.release/ocwage.t01.htm",
          "data_as_of": "2025-05-01",
          "metric_key": "full_time_annual_earnings_range",
          "value": {
            "low": 50981,
            "high": 69770,
            "ranking_value": 50981,
            "currency": "USD",
            "basis": "national_median_to_mean_annual_wage",
            "population": "all occupations",
            "measure_type": "median_to_mean_benchmark"
          },
          "unit": "USD/year",
          "evidence_kind": "calculated",
          "confidence": "high",
          "methodology": "Annualise the all-occupation median hourly wage of USD 24.51 using 2,080 hours and pair it with the published all-occupation mean annual wage of USD 69,770.",
          "assumptions": {
            "annual_hours": 2080,
            "percentile_range": false,
            "occupation_specific": false
          },
          "effective_from": "2025-05-01",
          "reviewer_note": "Verified national salary benchmark for the United States country dashboard."
        },
        {
          "source_key": "us_bls_oews_2025_05",
          "organisation_name": "U.S. Bureau of Labor Statistics",
          "source_name": "Occupational Employment and Wage Statistics, May 2025",
          "source_type": "government_dataset",
          "source_url": "https://www.bls.gov/news.release/ocwage.t01.htm",
          "data_as_of": "2025-05-01",
          "metric_key": "average_annual_salary",
          "value": {
            "amount": 69770,
            "currency": "USD",
            "basis": "all_occupations_mean_annual_wage",
            "population": "all occupations"
          },
          "unit": "USD/year",
          "evidence_kind": "observed",
          "confidence": "high",
          "methodology": "Use the published all-occupation mean annual wage from the May 2025 OEWS national table.",
          "assumptions": {
            "occupation_specific": false
          },
          "effective_from": "2025-05-01",
          "reviewer_note": "Stored as a calculation input; the dashboard displays the broader salary benchmark."
        },
        {
          "source_key": "us_college_board_living_budget_2025_26",
          "organisation_name": "College Board",
          "source_name": "Twelve-month living expense budgets, 2025-26",
          "source_type": "provider",
          "source_url": "https://highered.collegeboard.org/financial-aid/policies-research/budgets/12-month",
          "data_as_of": "2025-07-01",
          "metric_key": "student_living_cost_monthly_range",
          "value": {
            "low": 2020,
            "high": 3015,
            "ranking_value": 2518,
            "currency": "USD",
            "basis": "college_board_low_to_moderate_12_month_budget",
            "scenario": "independent off-campus student; tuition excluded",
            "measure_type": "planning_range",
            "annual_low": 24240,
            "annual_high": 36180
          },
          "unit": "USD/month",
          "evidence_kind": "calculated",
          "confidence": "medium",
          "methodology": "Divide the College Board national low and moderate twelve-month living expense budgets by 12 and use the midpoint only for country comparison.",
          "assumptions": {
            "independent_student": true,
            "off_campus": true,
            "tuition_excluded": true,
            "market_average": false
          },
          "effective_from": "2025-07-01",
          "reviewer_note": "Verified planning range for the United States country dashboard."
        },
        {
          "source_key": "us_college_board_tuition_2025_26",
          "organisation_name": "College Board",
          "source_name": "Trends in College Pricing 2025 highlights",
          "source_type": "provider",
          "source_url": "https://research.collegeboard.org/trends/college-pricing/highlights",
          "data_as_of": "2025-07-01",
          "metric_key": "tuition_annual_low",
          "value": {
            "amount": 31880,
            "currency": "USD",
            "basis": "average_published_tuition_and_fees",
            "study_level": "undergraduate",
            "provider_type": "public_four_year",
            "student_type": "out_of_state"
          },
          "unit": "USD/year",
          "evidence_kind": "observed",
          "confidence": "medium",
          "methodology": "Use the 2025-26 average published tuition and fees for public four-year out-of-state students as the lower national planning input.",
          "assumptions": {
            "international_student_proxy": "out_of_state",
            "scholarships_excluded": true,
            "living_costs_excluded": true
          },
          "effective_from": "2025-07-01",
          "reviewer_note": "Stored as the lower annual tuition calculation input."
        },
        {
          "source_key": "us_college_board_tuition_2025_26",
          "organisation_name": "College Board",
          "source_name": "Trends in College Pricing 2025 highlights",
          "source_type": "provider",
          "source_url": "https://research.collegeboard.org/trends/college-pricing/highlights",
          "data_as_of": "2025-07-01",
          "metric_key": "tuition_annual_high",
          "value": {
            "amount": 45000,
            "currency": "USD",
            "basis": "average_published_tuition_and_fees",
            "study_level": "undergraduate",
            "provider_type": "private_nonprofit_four_year",
            "student_type": "full_time"
          },
          "unit": "USD/year",
          "evidence_kind": "observed",
          "confidence": "medium",
          "methodology": "Use the 2025-26 average published tuition and fees for private nonprofit four-year students as the upper national planning input.",
          "assumptions": {
            "scholarships_excluded": true,
            "living_costs_excluded": true
          },
          "effective_from": "2025-07-01",
          "reviewer_note": "Stored as the upper annual tuition calculation input."
        },
        {
          "source_key": "us_dol_federal_minimum_wage",
          "organisation_name": "U.S. Department of Labor",
          "source_name": "Federal minimum wage guidance",
          "source_type": "regulator",
          "source_url": "https://www.dol.gov/agencies/whd/minimum-wage/faq",
          "data_as_of": "2009-07-24",
          "metric_key": "national_minimum_hourly_wage",
          "value": {
            "amount": 7.25,
            "currency": "USD",
            "employee_basis": "federal_floor_for_covered_nonexempt_employees",
            "state_or_local_rate_may_be_higher": true
          },
          "unit": "USD/hour",
          "evidence_kind": "observed",
          "confidence": "high",
          "methodology": "Store the federal minimum wage floor. Location-specific calculations must prefer a higher applicable state or local rate.",
          "assumptions": {
            "federal_floor_only": true,
            "exceptions_may_apply": true
          },
          "effective_from": "2009-07-24",
          "reviewer_note": "Verified federal wage floor; not a state-specific wage estimate."
        },
        {
          "source_key": "us_state_department_f_student_visa_fee",
          "organisation_name": "U.S. Department of State",
          "source_name": "Student visa application fee",
          "source_type": "regulator",
          "source_url": "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
          "data_as_of": "2026-08-05",
          "metric_key": "visa_application_fee",
          "value": {
            "amount": 185,
            "currency": "USD",
            "visa_type": "F",
            "fee_type": "nonimmigrant_visa_application_processing_fee"
          },
          "unit": "USD/application",
          "evidence_kind": "observed",
          "confidence": "high",
          "methodology": "Store the current non-refundable application processing fee shown for an F student visa.",
          "assumptions": {
            "issuance_fee_excluded": true,
            "sevis_fee_excluded": true
          },
          "effective_from": "2026-08-05",
          "reviewer_note": "Verified F student-visa application fee for future funding calculations."
        },
        {
          "source_key": "us_dhs_f1_on_campus_work_limit",
          "organisation_name": "U.S. Department of Homeland Security",
          "source_name": "F-1 on-campus employment guidance",
          "source_type": "regulator",
          "source_url": "https://studyinthestates.dhs.gov/students/resources/working",
          "data_as_of": "2026-08-05",
          "metric_key": "student_work_hours_limit",
          "value": {
            "hours": 20,
            "period": "week",
            "applies_during": "school_in_session",
            "visa_type": "F-1",
            "employment_type": "on_campus"
          },
          "unit": "hours/week",
          "evidence_kind": "observed",
          "confidence": "high",
          "methodology": "Store the general F-1 on-campus maximum of 20 hours per week while school is in session.",
          "assumptions": {
            "school_authorisation_required": true,
            "off_campus_rules_differ": true,
            "not_expected_work_hours": true
          },
          "effective_from": "2026-08-05",
          "reviewer_note": "Verified legal ceiling; future income calculations must use expected hours capped by this value."
        }
      ]
      $seed$::jsonb
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
      item->>'source_key',
      item->>'organisation_name',
      item->>'source_name',
      item->>'source_type',
      item->>'source_url',
      'US',
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
      and source_url = item->>'source_url'
      and data_as_of = (item->>'data_as_of')::date
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
        item->>'source_url',
        (item->>'data_as_of')::date,
        now(),
        'captured',
        jsonb_build_object(
          'country_code', 'US',
          'metric_key', item->>'metric_key'
        )
      )
      returning id into snapshot_id_value;
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
      item->>'metric_key',
      'country',
      'US',
      item->'value',
      item->>'unit',
      snapshot_id_value,
      item->>'evidence_kind',
      item->>'confidence',
      item->>'methodology',
      item->'assumptions',
      (item->>'effective_from')::date,
      'verified',
      now(),
      item->>'reviewer_note'
    );
  end loop;
end
$$;

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'US'
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
  and observation.scope_id = 'US'
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
  );
;
