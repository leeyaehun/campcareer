insert into core.countries (code, name, default_currency, active, updated_at)
values ('BE', 'Belgium', 'EUR', true, now())
on conflict (code) do update
set name = excluded.name,
    default_currency = excluded.default_currency,
    active = true,
    updated_at = now();
with incoming(source_key, organisation_name, source_name, source_type, source_url, data_as_of, metadata) as (values
  (
    'be_statbel_wages_2022',
    'Statbel',
    'An overview of Belgian wages and salaries',
    'government_dataset',
    'https://statbel.fgov.be/en/themes/work-training/wages-and-labourcost/overview-belgian-wages-and-salaries',
    date '2022-10-31',
    jsonb_build_object(
      'release_date', '2024-09-25',
      'survey_population', 'more than 184,000 employees',
      'gross_monthly_mean_eur', 4076,
      'gross_monthly_median_eur', 3728,
      'gross_monthly_p10_eur', 2443,
      'gross_monthly_p90_eur', 6305,
      'irregular_annual_payments_excluded', true
    )
  ),
  (
    'be_student_living_2026',
    'Study in Flanders and Wallonie-Bruxelles Campus',
    'Official student cost-of-living guidance',
    'provider',
    'https://www.studyinflanders.be/practical-information/cost-of-living',
    date '2026-08-06',
    jsonb_build_object(
      'flanders_brussels_monthly_low_eur', 800,
      'flanders_brussels_monthly_high_eur', 1000,
      'french_speaking_belgium_monthly_low_eur', 1000,
      'french_speaking_belgium_monthly_high_eur', 1300,
      'secondary_source_url', 'https://www.studyinbelgium.be/fr/quel-est-le-cout-de-la-vie-et-des-etudes-en-belgique-francophone',
      'immigration_2026_2027_monthly_requirement_eur', 1062,
      'immigration_source_url', 'https://dofi.ibz.be/en/themes/ressortissants-dun-pays-tiers/etudes/favoris/sufficient-means-subsistence'
    )
  ),
  (
    'be_tuition_2026_2027',
    'Study in Flanders',
    'Tuition fees for full-time degree programmes',
    'provider',
    'https://www.studyinflanders.be/practical-information/tuition-fees',
    date '2026-09-01',
    jsonb_build_object(
      'academic_year', '2026-2027',
      'student_type', 'non-EU/EEA',
      'study_load_ects', 60,
      'wallonia_brussels_standard_total_eur', 5369,
      'wallonia_brussels_source_url', 'https://www.studyinbelgium.be/fr/etudier-en-belgique-francophone-les-frais-dinscription'
    )
  ),
  (
    'be_minimum_income_july_2026',
    'Belgian Federal Public Service Employment',
    'Guaranteed average minimum monthly income and student hourly reference',
    'regulator',
    'https://employment.belgium.be/en/node/4096',
    date '2026-07-01',
    jsonb_build_object(
      'age_basis', '21 and older',
      'monthly_amount_eur', 2233.61,
      'weekly_hours_basis', 38,
      'hourly_equivalent_eur', 13.5644
    )
  ),
  (
    'be_student_visa_fee_2026',
    'Belgian Immigration Office',
    'Long-stay Visa D fee',
    'regulator',
    'https://dofi.ibz.be/en/themes/faq/visa-fees',
    date '2026-07-01',
    jsonb_build_object(
      'visa_fee_eur', 250,
      'public_higher_education_student_contribution_eur', 251,
      'contribution_source_url', 'https://dofi.ibz.be/en/themes/faq/contribution-fee'
    )
  ),
  (
    'be_student_work_2026',
    'Student At Work',
    'Foreign-student employment rules',
    'regulator',
    'https://www.studentatwork.be/en/for-foreign-students.html',
    date '2026-08-06',
    jsonb_build_object(
      'residence_permit_marking', 'labour market limited',
      'school_year_weekly_hours', 20,
      'school_holidays', 'unlimited subject to student-employment rules'
    )
  )
)
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
select
  source_key,
  organisation_name,
  source_name,
  source_type,
  source_url,
  'BE',
  true,
  now()
from incoming
on conflict (source_key) do update
set organisation_name = excluded.organisation_name,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    canonical_url = excluded.canonical_url,
    country_code = 'BE',
    active = true,
    updated_at = now();
with incoming(source_key, source_url, data_as_of, metadata) as (values
  (
    'be_statbel_wages_2022',
    'https://statbel.fgov.be/en/themes/work-training/wages-and-labourcost/overview-belgian-wages-and-salaries',
    date '2022-10-31',
    jsonb_build_object(
      'release_date', '2024-09-25',
      'survey_population', 'more than 184,000 employees',
      'gross_monthly_mean_eur', 4076,
      'gross_monthly_median_eur', 3728,
      'gross_monthly_p10_eur', 2443,
      'gross_monthly_p90_eur', 6305,
      'irregular_annual_payments_excluded', true
    )
  ),
  (
    'be_student_living_2026',
    'https://www.studyinflanders.be/practical-information/cost-of-living',
    date '2026-08-06',
    jsonb_build_object(
      'flanders_brussels_monthly_low_eur', 800,
      'flanders_brussels_monthly_high_eur', 1000,
      'french_speaking_belgium_monthly_low_eur', 1000,
      'french_speaking_belgium_monthly_high_eur', 1300,
      'secondary_source_url', 'https://www.studyinbelgium.be/fr/quel-est-le-cout-de-la-vie-et-des-etudes-en-belgique-francophone',
      'immigration_2026_2027_monthly_requirement_eur', 1062,
      'immigration_source_url', 'https://dofi.ibz.be/en/themes/ressortissants-dun-pays-tiers/etudes/favoris/sufficient-means-subsistence'
    )
  ),
  (
    'be_tuition_2026_2027',
    'https://www.studyinflanders.be/practical-information/tuition-fees',
    date '2026-09-01',
    jsonb_build_object(
      'academic_year', '2026-2027',
      'student_type', 'non-EU/EEA',
      'study_load_ects', 60,
      'wallonia_brussels_standard_total_eur', 5369,
      'wallonia_brussels_source_url', 'https://www.studyinbelgium.be/fr/etudier-en-belgique-francophone-les-frais-dinscription'
    )
  ),
  (
    'be_minimum_income_july_2026',
    'https://employment.belgium.be/en/node/4096',
    date '2026-07-01',
    jsonb_build_object(
      'age_basis', '21 and older',
      'monthly_amount_eur', 2233.61,
      'weekly_hours_basis', 38,
      'hourly_equivalent_eur', 13.5644
    )
  ),
  (
    'be_student_visa_fee_2026',
    'https://dofi.ibz.be/en/themes/faq/visa-fees',
    date '2026-07-01',
    jsonb_build_object(
      'visa_fee_eur', 250,
      'public_higher_education_student_contribution_eur', 251,
      'contribution_source_url', 'https://dofi.ibz.be/en/themes/faq/contribution-fee'
    )
  ),
  (
    'be_student_work_2026',
    'https://www.studentatwork.be/en/for-foreign-students.html',
    date '2026-08-06',
    jsonb_build_object(
      'residence_permit_marking', 'labour market limited',
      'school_year_weekly_hours', 20,
      'school_holidays', 'unlimited subject to student-employment rules'
    )
  )
)
insert into evidence.source_snapshots (
  source_id,
  source_url,
  data_as_of,
  retrieved_at,
  snapshot_status,
  metadata
)
select
  source.id,
  incoming.source_url,
  incoming.data_as_of,
  now(),
  'captured',
  incoming.metadata
from incoming
join evidence.sources source
  on source.source_key = incoming.source_key
where not exists (
  select 1
  from evidence.source_snapshots snapshot
  where snapshot.source_id = source.id
    and snapshot.source_url = incoming.source_url
    and snapshot.data_as_of = incoming.data_as_of
);
delete from evidence.metric_observations
where scope_type = 'country'
  and scope_id = 'BE'
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
with incoming(metric_key, source_key, value, unit, evidence_kind, confidence, methodology, assumptions, effective_from, reviewer_note) as (values
  (
    'full_time_annual_earnings_range',
    'be_statbel_wages_2022',
    jsonb_build_object(
      'low', 29316,
      'high', 75660,
      'ranking_value', 44736,
      'currency', 'EUR',
      'basis', 'p10_to_p90_full_time_gross_monthly_wage_annualised',
      'population', 'full-time employees in enterprises covered by the Statbel earnings survey',
      'measure_type', 'employee_wage_distribution',
      'monthly_p10', 2443,
      'monthly_median', 3728,
      'monthly_p90', 6305
    ),
    'EUR/year',
    'calculated',
    'high',
    'The official gross monthly P10, median and P90 values are multiplied by twelve. The displayed range is P10 to P90 and the comparison value is the annualised median.',
    jsonb_build_object(
      'gross_not_net', true,
      'irregular_annual_payments_excluded', true,
      'reference_year_is_2022', true
    ),
    date '2022-10-31',
    'Verified official full-time gross salary distribution, annualised for the Belgium dashboard.'
  ),
  (
    'average_annual_salary',
    'be_statbel_wages_2022',
    jsonb_build_object(
      'amount', 48912,
      'currency', 'EUR',
      'basis', 'annualised_average_gross_monthly_salary',
      'statistic_type', 'mean',
      'population', 'full-time employees',
      'monthly_amount', 4076
    ),
    'EUR/year',
    'calculated',
    'high',
    'The official average gross monthly salary of EUR 4,076 is multiplied by twelve.',
    jsonb_build_object(
      'gross_not_net', true,
      'irregular_annual_payments_excluded', true,
      'reference_year_is_2022', true
    ),
    date '2022-10-31',
    'Verified national average annual salary benchmark.'
  ),
  (
    'student_living_cost_monthly_range',
    'be_student_living_2026',
    jsonb_build_object(
      'low', 800,
      'high', 1300,
      'ranking_value', 1062,
      'currency', 'EUR',
      'basis', 'official_regional_student_budget_guidance',
      'scenario', 'one higher-education student; tuition excluded',
      'measure_type', 'national_planning_range',
      'immigration_2026_2027_monthly_requirement', 1062
    ),
    'EUR/month',
    'calculated',
    'medium',
    'The lower bound comes from Study in Flanders guidance and the upper bound from Wallonie-Bruxelles Campus guidance. The comparison value uses the federal 2026–2027 proof-of-funds requirement.',
    jsonb_build_object(
      'tuition_excluded', true,
      'housing_and_city_variation_material', true,
      'immigration_requirement_is_not_spending_forecast', true
    ),
    date '2026-08-06',
    'Verified national student planning range assembled from official regional guidance.'
  ),
  (
    'tuition_annual_low',
    'be_tuition_2026_2027',
    jsonb_build_object(
      'amount', 2300,
      'currency', 'EUR',
      'basis', 'published_non_eu_full_time_degree_range',
      'academic_year', '2026-2027',
      'study_load_ects', 60,
      'student_type', 'non-EU/EEA'
    ),
    'EUR/year',
    'observed',
    'medium',
    'Lower bound of the official Flemish guideline for a full-time non-EU/EEA degree programme in 2026–2027.',
    jsonb_build_object(
      'course_specific_fee_required_for_decision', true,
      'regional_systems_set_fees_separately', true
    ),
    date '2026-09-01',
    'Verified national planning lower bound.'
  ),
  (
    'tuition_annual_high',
    'be_tuition_2026_2027',
    jsonb_build_object(
      'amount', 9500,
      'currency', 'EUR',
      'basis', 'published_non_eu_full_time_degree_range',
      'academic_year', '2026-2027',
      'study_load_ects', 60,
      'student_type', 'non-EU/EEA',
      'wallonia_brussels_standard_total', 5369
    ),
    'EUR/year',
    'observed',
    'medium',
    'Upper bound of the official Flemish guideline. The standard French-speaking Belgium non-EU total of EUR 5,369 is stored as a regional reference within the national range.',
    jsonb_build_object(
      'course_specific_fee_required_for_decision', true,
      'regional_systems_set_fees_separately', true
    ),
    date '2026-09-01',
    'Verified national planning upper bound.'
  ),
  (
    'national_minimum_hourly_wage',
    'be_minimum_income_july_2026',
    jsonb_build_object(
      'amount', 13.5644,
      'currency', 'EUR',
      'employee_basis', 'guaranteed_average_minimum_monthly_income_age_21_plus_38_hour_equivalent',
      'monthly_amount', 2233.61,
      'weekly_hours_basis', 38
    ),
    'EUR/hour',
    'observed',
    'high',
    'Official hourly reference for a 38-hour work week corresponding to the guaranteed average minimum monthly income for workers aged 21 and older from 1 July 2026.',
    jsonb_build_object(
      'not_a_single_universal_statutory_hourly_wage', true,
      'sector_minimums_may_be_higher', true,
      'younger_student_rates_differ', true
    ),
    date '2026-07-01',
    'Verified current interprofessional adult hourly remuneration benchmark.'
  ),
  (
    'visa_application_fee',
    'be_student_visa_fee_2026',
    jsonb_build_object(
      'amount', 250,
      'currency', 'EUR',
      'fee_type', 'long_stay_visa_d_consular_fee',
      'visa_type', 'Visa D for long-term study',
      'public_higher_education_student_contribution_fee', 251,
      'combined_typical_public_institution_fees', 501
    ),
    'EUR',
    'observed',
    'high',
    'The stored headline amount is the Visa D consular fee from 1 July 2026. A separate EUR 251 contribution fee normally applies to a non-exempt student at a public higher-education institution.',
    jsonb_build_object(
      'contribution_fee_excluded_from_headline_amount', true,
      'exemptions_may_apply', true,
      'external_service_provider_fees_excluded', true
    ),
    date '2026-07-01',
    'Verified current long-stay Visa D fee with the separate student contribution recorded.'
  ),
  (
    'student_work_hours_limit',
    'be_student_work_2026',
    jsonb_build_object(
      'hours', 20,
      'period', 'week',
      'visa_type', 'residence permit marked labour market limited',
      'applies_during', 'school_year',
      'school_holiday_hours', 'unlimited subject to student-employment rules'
    ),
    'hours/week',
    'observed',
    'high',
    'A non-EEA student with a residence permit marked labour market limited may work up to 20 hours per week during the school year and without that weekly limit during school holidays.',
    jsonb_build_object(
      'study_must_remain_principal_activity', true,
      'residence_card_wording_controls', true,
      'student_employment_rules_still_apply', true
    ),
    date '2026-08-06',
    'Verified current foreign-student school-year work limit.'
  )
), latest_snapshots as (
  select distinct on (source.source_key)
    source.source_key,
    snapshot.id
  from evidence.sources source
  join evidence.source_snapshots snapshot
    on snapshot.source_id = source.id
  where source.source_key in (select source_key from incoming)
  order by source.source_key, snapshot.retrieved_at desc
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
  reviewer_note
)
select
  incoming.metric_key,
  'country',
  'BE',
  incoming.value,
  incoming.unit,
  latest_snapshots.id,
  incoming.evidence_kind,
  incoming.confidence,
  incoming.methodology,
  incoming.assumptions,
  incoming.effective_from,
  'verified',
  now(),
  incoming.reviewer_note
from incoming
join latest_snapshots
  on latest_snapshots.source_key = incoming.source_key;
delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'BE'
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
  and observation.scope_id = 'BE'
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
