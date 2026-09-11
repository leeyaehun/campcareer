begin;

insert into core.countries (code, name, default_currency, active)
values ('ES', 'Spain', 'EUR', true)
on conflict (code) do update
set name = excluded.name,
    default_currency = excluded.default_currency,
    active = excluded.active,
    updated_at = now();

with source_rows(source_key, organisation_name, source_name, source_type, canonical_url) as (
  values
    ('es-ine-eaes-2024', 'Instituto Nacional de Estadística', 'Annual Wage Structure Survey 2024', 'government_dataset', 'https://www.ine.es/dyngs/Prensa/es/EAES2024.htm'),
    ('es-boe-smi-2026', 'Boletín Oficial del Estado', 'Royal Decree 126/2026 — Minimum wage', 'regulator', 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815'),
    ('es-student-finance-2026', 'Spanish Ministry of Inclusion / SEPIE', 'Student finance requirement and living-cost guidance', 'government_dataset', 'https://ciudadaniaexterior.inclusion.gob.es/es/web/migraciones/w/estancia-por-estudios'),
    ('es-sepie-public-tuition', 'SEPIE', 'Public undergraduate tuition guidance', 'government_dataset', 'https://sepie.es/internacionalizacion/estudiar.html'),
    ('es-student-work-2025', 'Spanish Ministry of Inclusion', 'Student work permission', 'regulator', 'https://ciudadaniaexterior.inclusion.gob.es/web/migraciones/w/hoja-4-bis-acceso-al-empleo-de-las-personas-titulares-de-una-autorizacion-de-estancia-de-larga-duracion-por-estudios-movilidad-de-alumnos-servicios-de-voluntariado-o-actividades-formativas'),
    ('es-national-visa-fee-2026', 'Spanish Ministry of Foreign Affairs', 'National study-visa fee', 'regulator', 'https://www.exteriores.gob.es/Embajadas/pretoria/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Sud%C3%A1frica&scd=230&scs=Visados+Nacionales+-+Visado+de+estudios')
), upserted as (
  insert into evidence.sources (source_key, organisation_name, source_name, source_type, canonical_url, country_code, active)
  select source_key, organisation_name, source_name, source_type, canonical_url, 'ES', true
  from source_rows
  on conflict (source_key) do update
  set organisation_name = excluded.organisation_name,
      source_name = excluded.source_name,
      source_type = excluded.source_type,
      canonical_url = excluded.canonical_url,
      country_code = excluded.country_code,
      active = true,
      updated_at = now()
  returning id, source_key
), snapshots as (
  insert into evidence.source_snapshots (source_id, source_url, published_at, data_as_of, valid_from, snapshot_status, metadata)
  select id,
    case source_key
      when 'es-ine-eaes-2024' then 'https://www.ine.es/dyngs/Prensa/es/EAES2024.htm'
      when 'es-boe-smi-2026' then 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815'
      when 'es-student-finance-2026' then 'https://ciudadaniaexterior.inclusion.gob.es/es/web/migraciones/w/estancia-por-estudios'
      when 'es-sepie-public-tuition' then 'https://sepie.es/internacionalizacion/estudiar.html'
      when 'es-student-work-2025' then 'https://ciudadaniaexterior.inclusion.gob.es/web/migraciones/w/hoja-4-bis-acceso-al-empleo-de-las-personas-titulares-de-una-autorizacion-de-estancia-de-larga-duracion-por-estudios-movilidad-de-alumnos-servicios-de-voluntariado-o-actividades-formativas'
      else 'https://www.exteriores.gob.es/Embajadas/pretoria/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Sud%C3%A1frica&scd=230&scs=Visados+Nacionales+-+Visado+de+estudios'
    end,
    case source_key
      when 'es-ine-eaes-2024' then date '2026-05-28'
      when 'es-boe-smi-2026' then date '2026-02-19'
      else null
    end,
    case source_key
      when 'es-ine-eaes-2024' then date '2024-12-31'
      when 'es-boe-smi-2026' then date '2026-01-01'
      when 'es-student-finance-2026' then date '2026-08-06'
      when 'es-sepie-public-tuition' then date '2026-08-06'
      when 'es-student-work-2025' then date '2025-05-01'
      else date '2026-01-01'
    end,
    case source_key
      when 'es-boe-smi-2026' then date '2026-01-01'
      else null
    end,
    'captured',
    case source_key
      when 'es-student-finance-2026' then jsonb_build_object(
        'supporting_urls', jsonb_build_array(
          'https://sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html',
          'https://sepie.es/internacionalizacion/estudiar.html'
        )
      )
      else '{}'::jsonb
    end
  from upserted
  returning id, source_id
), snapshot_keys as (
  select ss.id as snapshot_id, s.source_key
  from snapshots ss
  join evidence.sources s on s.id = ss.source_id
), removed as (
  delete from evidence.metric_observations
  where scope_type = 'country' and scope_id = 'ES'
    and metric_key in (
      'average_annual_salary',
      'full_time_annual_earnings_range',
      'national_minimum_hourly_wage',
      'student_living_cost_monthly_range',
      'student_work_hours_limit',
      'tuition_annual_low',
      'tuition_annual_high',
      'visa_application_fee'
    )
  returning id
)
insert into evidence.metric_observations (
  metric_key, scope_type, scope_id, value, unit, source_snapshot_id, evidence_kind, confidence, methodology, assumptions, effective_from, review_status, reviewed_at, reviewer_note
)
select * from (
  select
    'average_annual_salary', 'country', 'ES',
    jsonb_build_object('amount', 29540.26, 'currency', 'EUR', 'basis', 'average_annual_gross_salary_per_worker', 'statistic_type', 'mean', 'population', 'employees covered by the INE Annual Wage Structure Survey'),
    'EUR/year', snapshot_id, 'observed', 'high',
    'Official 2024 annual gross mean.', '{}'::jsonb, date '2024-12-31', 'verified', now(),
    'National employee mean; not graduate starting salary.'
  from snapshot_keys where source_key = 'es-ine-eaes-2024'

  union all
  select
    'full_time_annual_earnings_range', 'country', 'ES',
    jsonb_build_object('low', 24497.17, 'high', 29540.26, 'ranking_value', 24497.17, 'currency', 'EUR', 'basis', 'annual_gross_median_to_mean_benchmark', 'measure_type', 'median_to_mean_not_percentile_range', 'population', 'employees covered by the INE Annual Wage Structure Survey'),
    'EUR/year', snapshot_id, 'observed', 'medium',
    'Uses the official annual gross median as the lower benchmark and official mean as the upper benchmark.', '{}'::jsonb, date '2024-12-31', 'verified', now(),
    'Not a P25–P75 or P10–P90 distribution; includes stated survey population and work patterns.'
  from snapshot_keys where source_key = 'es-ine-eaes-2024'

  union all
  select
    'national_minimum_hourly_wage', 'country', 'ES',
    jsonb_build_object('amount', 8.22, 'currency', 'EUR', 'basis', 'annual_smi_divided_by_2080_hours', 'monthly_amount_14_payments', 1221, 'annual_amount', 17094, 'weekly_hours_assumption', 40),
    'EUR/hour', snapshot_id, 'calculated', 'medium',
    'EUR 1,221 multiplied by fourteen payments and divided by 2,080 hours.', jsonb_build_object('hours_per_week', 40, 'weeks_per_year', 52), date '2026-01-01', 'verified', now(),
    'Comparison conversion only; Spain legislates monthly and daily SMI rather than one universal hourly rate.'
  from snapshot_keys where source_key = 'es-boe-smi-2026'

  union all
  select
    'student_living_cost_monthly_range', 'country', 'ES',
    jsonb_build_object('low', 600, 'high', 1100, 'ranking_value', 850, 'currency', 'EUR', 'basis', 'visa_iprem_floor_to_sepie_student_budget_guidance', 'scenario', 'one higher-education student; tuition excluded', 'measure_type', 'official_requirement_to_guidance_range'),
    'EUR/month', snapshot_id, 'calculated', 'medium',
    'Combines the 100% monthly IPREM finance requirement with SEPIE national student-cost guidance.', jsonb_build_object('lower_bound_is_immigration_floor', true), date '2026-08-06', 'verified', now(),
    'The EUR 600 lower bound is a financial-evidence floor, not a realistic spending forecast in all cities.'
  from snapshot_keys where source_key = 'es-student-finance-2026'

  union all
  select
    'student_work_hours_limit', 'country', 'ES',
    jsonb_build_object('hours', 30, 'period', 'week', 'visa_type', 'long-duration study authorisation', 'work_must_be_compatible_with_studies', true),
    'hours/week', snapshot_id, 'observed', 'high',
    'Stores the current maximum compatible work duration.', '{}'::jsonb, date '2025-05-01', 'verified', now(),
    'Intensive vocational training follows sector-specific rules.'
  from snapshot_keys where source_key = 'es-student-work-2025'

  union all
  select
    'tuition_annual_low', 'country', 'ES',
    jsonb_build_object('amount', 700, 'currency', 'EUR', 'basis', 'approximate_public_undergraduate_tuition_range', 'institution_type', 'public', 'study_level', 'undergraduate', 'non_eu_surcharges_possible', true),
    'EUR/year', snapshot_id, 'observed', 'medium',
    'Lower bound of SEPIE public undergraduate tuition guidance.', '{}'::jsonb, date '2026-08-06', 'verified', now(),
    'Regional, programme, repeat-enrolment and non-resident rules can change the actual fee.'
  from snapshot_keys where source_key = 'es-sepie-public-tuition'

  union all
  select
    'tuition_annual_high', 'country', 'ES',
    jsonb_build_object('amount', 1800, 'currency', 'EUR', 'basis', 'approximate_public_undergraduate_tuition_range', 'institution_type', 'public', 'study_level', 'undergraduate', 'non_eu_surcharges_possible', true),
    'EUR/year', snapshot_id, 'observed', 'medium',
    'Upper bound of SEPIE public undergraduate tuition guidance.', '{}'::jsonb, date '2026-08-06', 'verified', now(),
    'Private institutions and some non-EU or non-resident fee regimes can be substantially higher.'
  from snapshot_keys where source_key = 'es-sepie-public-tuition'

  union all
  select
    'visa_application_fee', 'country', 'ES',
    jsonb_build_object('amount', 90, 'currency', 'EUR', 'fee_type', 'basic_national_study_visa_processing_fee', 'visa_type', 'national study visa', 'local_currency_and_reciprocity_variation_possible', true),
    'EUR', snapshot_id, 'observed', 'high',
    'Stores the standard basic national-visa consular fee.', '{}'::jsonb, date '2026-01-01', 'verified', now(),
    'Local currency, reciprocity, exemptions and external service charges can alter the payable amount.'
  from snapshot_keys where source_key = 'es-national-visa-fee-2026'
) rows;

commit;;
