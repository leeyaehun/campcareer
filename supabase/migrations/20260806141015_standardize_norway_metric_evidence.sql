delete from evidence.metric_observations
where scope_type = 'country'
  and scope_id = 'NO'
  and metric_key in (
    'full_time_annual_earnings_range',
    'average_annual_salary',
    'student_living_cost_monthly_range',
    'national_minimum_hourly_wage',
    'tuition_annual_low',
    'tuition_annual_high',
    'visa_application_fee',
    'student_work_hours_limit'
  );

with snapshots as (
  select distinct on (s.source_key)
    s.source_key,
    ss.id as snapshot_id
  from evidence.sources s
  join evidence.source_snapshots ss on ss.source_id = s.id
  where s.source_key in (
    'cc_no_ssb_earnings_2025',
    'cc_no_ssb_student_budget_2022',
    'cc_no_arbeidstilsynet_minimum_wage_2026',
    'cc_no_ntnu_tuition_2026',
    'cc_no_uib_tuition_2026',
    'cc_no_udi_study_permit_2026'
  )
  order by s.source_key, ss.retrieved_at desc, ss.created_at desc
), rows_to_insert as (
  select
    'full_time_annual_earnings_range'::text as metric_key,
    jsonb_build_object(
      'low', 545640,
      'high', 833880,
      'ranking_value', 669600,
      'currency', 'NOK',
      'basis', 'national_lower_to_upper_quartile_monthly_earnings_annualised',
      'measure_type', 'quartile_distribution',
      'population', 'jobs measured as full-time equivalents',
      'monthly_lower_quartile', 45470,
      'monthly_median', 55800,
      'monthly_upper_quartile', 69490
    ) as value,
    'NOK/year'::text as unit,
    'cc_no_ssb_earnings_2025'::text as source_key,
    'calculated'::text as evidence_kind,
    'high'::text as confidence,
    'Monthly lower quartile, median and upper quartile are multiplied by twelve.'::text as methodology,
    '{}'::jsonb as assumptions,
    date '2025-11-30' as effective_from
  union all
  select
    'average_annual_salary',
    jsonb_build_object(
      'amount', 744840,
      'currency', 'NOK',
      'basis', 'annualised_average_monthly_earnings_all_sectors',
      'monthly_amount', 62070,
      'statistic_type', 'mean',
      'population', 'jobs measured as full-time equivalents'
    ),
    'NOK/year',
    'cc_no_ssb_earnings_2025',
    'calculated',
    'high',
    'The official average monthly earnings figure is multiplied by twelve.',
    '{}'::jsonb,
    date '2025-11-30'
  union all
  select
    'student_living_cost_monthly_range',
    jsonb_build_object(
      'low', 14700,
      'high', 15488,
      'ranking_value', 15488,
      'currency', 'NOK',
      'basis', 'observed_student_average_to_2026_27_official_finance_requirement',
      'scenario', 'one higher-education student; tuition excluded',
      'survey_year', 2022,
      'annual_finance_requirement', 170368,
      'finance_requirement_source', 'https://studyinnorway.no/cost-and-requirements'
    ),
    'NOK/month',
    'cc_no_ssb_student_budget_2022',
    'calculated',
    'medium',
    'The range combines the SSB observed average with the current official monthly student-finance requirement.',
    jsonb_build_object('observed_average_is_historical', true),
    date '2026-08-06'
  union all
  select
    'national_minimum_hourly_wage',
    jsonb_build_object(
      'amount', null,
      'currency', 'NOK',
      'basis', 'no_universal_statutory_minimum_wage',
      'not_applicable', true,
      'covered_sector_count', 10,
      'sectoral_minimum_rates_exist', true
    ),
    'NOK/hour',
    'cc_no_arbeidstilsynet_minimum_wage_2026',
    'observed',
    'high',
    'Norway has statutory minimum rates only in covered sectors; no national numeric rate is inferred.',
    '{}'::jsonb,
    date '2026-06-15'
  union all
  select
    'tuition_annual_low',
    jsonb_build_object(
      'amount', 176300,
      'currency', 'NOK',
      'basis', 'representative_2026_27_mainstream_public_university_fee',
      'institution', 'Norwegian University of Science and Technology',
      'category', 'humanities social sciences economy business and management',
      'student_type', 'non-EU/EEA/Swiss degree student',
      'specialist_programmes_excluded', true
    ),
    'NOK/year',
    'cc_no_ntnu_tuition_2026',
    'observed',
    'medium',
    'Published 60-ECTS annual tuition category used as a representative lower mainstream benchmark.',
    '{}'::jsonb,
    date '2026-08-01'
  union all
  select
    'tuition_annual_high',
    jsonb_build_object(
      'amount', 226000,
      'currency', 'NOK',
      'basis', 'representative_2026_27_mainstream_public_university_fee',
      'institution', 'University of Bergen',
      'category', 'science technology and biomedical programmes',
      'student_type', 'non-EU/EEA/Swiss degree student',
      'medicine_fine_art_and_other_specialist_programmes_excluded', true
    ),
    'NOK/year',
    'cc_no_uib_tuition_2026',
    'observed',
    'medium',
    'Published annual programme fees used as a representative upper mainstream benchmark.',
    '{}'::jsonb,
    date '2026-08-01'
  union all
  select
    'visa_application_fee',
    jsonb_build_object(
      'amount', 5400,
      'currency', 'NOK',
      'basis', 'adult_study_permit_application_fee',
      'visa_type', 'study permit',
      'under_18_fee', 2700,
      'external_service_costs_excluded', true
    ),
    'NOK',
    'cc_no_udi_study_permit_2026',
    'observed',
    'high',
    'The standard UDI adult study-permit fee is stored as the calculation benchmark.',
    '{}'::jsonb,
    date '2026-08-06'
  union all
  select
    'student_work_hours_limit',
    jsonb_build_object(
      'hours', 20,
      'period', 'week',
      'full_time_holiday_work', true,
      'remote_work_included', true,
      'self_employment_prohibited', true,
      'permit_conditions_control', true
    ),
    'hours/week',
    'cc_no_udi_study_permit_2026',
    'observed',
    'high',
    'The study-period maximum is stored; full-time work is normally allowed during holidays.',
    '{}'::jsonb,
    date '2026-08-06'
)
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
  reviewer_note,
  updated_at
)
select
  r.metric_key,
  'country',
  'NO',
  r.value,
  r.unit,
  s.snapshot_id,
  r.evidence_kind,
  r.confidence,
  r.methodology,
  r.assumptions,
  r.effective_from,
  'verified',
  now(),
  'Official Norway country metric standardisation for CampCareer batch 3.',
  now()
from rows_to_insert r
join snapshots s on s.source_key = r.source_key;;
