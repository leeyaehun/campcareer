-- Standardize the country metric publication layer and publish verified
-- Canada salary and student living-cost ranges.

do $$
begin
  if to_regclass('public.report_metric_evidence_country') is null
     and to_regclass('public.report_metric_evidence_au') is not null then
    alter table public.report_metric_evidence_au
      rename to report_metric_evidence_country;
  end if;
end
$$;

do $$
declare
  source_id_value uuid;
  snapshot_id_value uuid;
begin
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
    'ca_noc_salary_distribution_2026_07',
    'CampCareer',
    'Canada NOC median salary distribution (514 occupations)',
    'internal',
    'https://www.campcareer.com/methodology/canada',
    'CA',
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
    and source_url = 'https://www.campcareer.com/methodology/canada'
    and data_as_of = date '2026-07-03'
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
      'https://www.campcareer.com/methodology/canada',
      date '2026-07-03',
      now(),
      'captured',
      jsonb_build_object(
        'row_count', 514,
        'calculation', 'p25_p50_p75_of_occupation_median_salary_cad'
      )
    )
    returning id into snapshot_id_value;
  end if;

  delete from evidence.metric_observations
  where scope_type = 'country'
    and scope_id = 'CA'
    and metric_key = 'full_time_annual_earnings_range';

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
    'full_time_annual_earnings_range',
    'country',
    'CA',
    jsonb_build_object(
      'low', 49025,
      'high', 83200,
      'ranking_value', 63000,
      'currency', 'CAD',
      'basis', 'interquartile_range_of_occupation_medians',
      'population', '514 NOC occupations'
    ),
    'CAD/year',
    snapshot_id_value,
    'calculated',
    'medium',
    'First quartile, median and third quartile across 514 occupation-level median annual salary values in public.occupations_ca.',
    jsonb_build_object(
      'not_individual_worker_distribution', true,
      'mixed_official_source_series', true
    ),
    date '2026-07-03',
    'verified',
    now(),
    'Verified for the Canada country dashboard.'
  );
end
$$;

do $$
declare
  source_id_value uuid;
  snapshot_id_value uuid;
begin
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
    'ca_student_living_cost_planning_2025_09',
    'CampCareer',
    'IRCC and EduCanada student living-cost planning range',
    'internal',
    'https://www.campcareer.com/methodology/canada',
    'CA',
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
    and source_url = 'https://www.campcareer.com/methodology/canada'
    and data_as_of = date '2025-09-01'
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
      'https://www.campcareer.com/methodology/canada',
      date '2025-09-01',
      now(),
      'captured',
      jsonb_build_object(
        'ircc_annual_minimum_cad', 22895,
        'scenario', 'one student outside Quebec; tuition and travel excluded'
      )
    )
    returning id into snapshot_id_value;
  end if;

  delete from evidence.metric_observations
  where scope_type = 'country'
    and scope_id = 'CA'
    and metric_key = 'student_living_cost_monthly_range';

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
    'student_living_cost_monthly_range',
    'country',
    'CA',
    jsonb_build_object(
      'low', 1908,
      'high', 3136,
      'ranking_value', 2522,
      'currency', 'CAD',
      'basis', 'official_student_planning_range',
      'scenario', 'one student outside Quebec; tuition and travel excluded'
    ),
    'CAD/month',
    snapshot_id_value,
    'calculated',
    'medium',
    'Lower bound is the IRCC annual living-expense requirement divided by 12. Upper bound combines published EduCanada budget-item upper bounds and stated minimum amounts.',
    jsonb_build_object(
      'market_average', false,
      'quebec_excluded', true,
      'tuition_excluded', true,
      'travel_to_canada_excluded', true
    ),
    date '2025-09-01',
    'verified',
    now(),
    'Verified planning range for the Canada country dashboard.'
  );
end
$$;

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'CA'
  and metric_key in (
    'full_time_annual_earnings_range',
    'student_living_cost_monthly_range'
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
  and observation.scope_id = 'CA'
  and observation.review_status = 'verified'
  and observation.metric_key in (
    'full_time_annual_earnings_range',
    'student_living_cost_monthly_range'
  );;
