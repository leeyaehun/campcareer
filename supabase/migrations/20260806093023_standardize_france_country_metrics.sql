-- Publish verified France country metrics through the shared evidence layer.

insert into core.countries (code, name, default_currency, active, updated_at)
values ('FR', 'France', 'EUR', true, now())
on conflict (code) do update
set name = excluded.name,
    default_currency = excluded.default_currency,
    active = true,
    updated_at = now();

with incoming(source_key, organisation_name, source_name, source_type, source_url, data_as_of, metadata) as (values
  ('fr_insee_private_salary_2024','INSEE','Private-sector salaries in 2024','government_dataset','https://www.insee.fr/fr/statistiques/8657156',date '2024-12-31',jsonb_build_object('release_date','2025-10-23','population','private-sector full-time-equivalent jobs','monthly_net_d1_eur',1492,'monthly_net_median_eur',2190,'monthly_net_d9_eur',4334,'monthly_net_mean_eur',2733,'monthly_gross_mean_eur',3602,'coverage_expanded_to_mayotte_apprentices_and_paid_trainees',true)),
  ('fr_student_living_2026','France-Visas and Campus France','2026 student resource requirement and budget guidance','regulator','https://france-visas.gouv.fr/fr/web/france-visas',date '2026-08-01',jsonb_build_object('visa_resource_requirement_monthly_eur',877.50,'effective_for_applications_from','2026-08-01','paris_planning_monthly_eur',1000,'secondary_source_url','https://www.campusfrance.org/fr/preparer-budget-etudiant-France')),
  ('fr_public_tuition_2026_2027','Campus France','Cost of higher education in France','provider','https://www.campusfrance.org/en/tuition-fees-France',date '2026-09-01',jsonb_build_object('academic_year','2026-2027','student_type','non-EU','public_licence_eur',2902,'public_master_eur',3950,'public_doctorate_eur',398)),
  ('fr_smic_2026','French Ministry of Labour','Annual SMIC adjustment for 1 January 2026','regulator','https://travail-emploi.gouv.fr/revalorisation-annuelle-du-smic-au-1er-janvier-2026',date '2026-01-01',jsonb_build_object('metropolitan_gross_hourly_eur',12.02,'metropolitan_gross_monthly_eur',1823.03,'metropolitan_net_monthly_eur',1443.11,'mayotte_rate_differs',true)),
  ('fr_student_visa_fee_2026','France-Visas','Student visa guidance','regulator','https://www.france-visas.gouv.fr/web/france-visas/etudiant',date '2026-08-06',jsonb_build_object('standard_long_stay_student_visa_fee_eur',99,'etudes_en_france_fee_eur',50,'service_provider_charges_may_apply',true)),
  ('fr_student_work_2026','France-Visas','Student work permission','regulator','https://www.france-visas.gouv.fr/web/france-visas/etudiant',date '2026-08-06',jsonb_build_object('annual_hours',964,'share_of_normal_working_time_percent',60,'algerian_nationals_percent',50))
)
insert into evidence.sources (source_key, organisation_name, source_name, source_type, canonical_url, country_code, active, updated_at)
select source_key, organisation_name, source_name, source_type, source_url, 'FR', true, now()
from incoming
on conflict (source_key) do update
set organisation_name=excluded.organisation_name,
    source_name=excluded.source_name,
    source_type=excluded.source_type,
    canonical_url=excluded.canonical_url,
    country_code='FR',
    active=true,
    updated_at=now();

with incoming(source_key, source_url, data_as_of, metadata) as (values
  ('fr_insee_private_salary_2024','https://www.insee.fr/fr/statistiques/8657156',date '2024-12-31',jsonb_build_object('release_date','2025-10-23','population','private-sector full-time-equivalent jobs','monthly_net_d1_eur',1492,'monthly_net_median_eur',2190,'monthly_net_d9_eur',4334,'monthly_net_mean_eur',2733,'monthly_gross_mean_eur',3602,'coverage_expanded_to_mayotte_apprentices_and_paid_trainees',true)),
  ('fr_student_living_2026','https://france-visas.gouv.fr/fr/web/france-visas',date '2026-08-01',jsonb_build_object('visa_resource_requirement_monthly_eur',877.50,'effective_for_applications_from','2026-08-01','paris_planning_monthly_eur',1000,'secondary_source_url','https://www.campusfrance.org/fr/preparer-budget-etudiant-France')),
  ('fr_public_tuition_2026_2027','https://www.campusfrance.org/en/tuition-fees-France',date '2026-09-01',jsonb_build_object('academic_year','2026-2027','student_type','non-EU','public_licence_eur',2902,'public_master_eur',3950,'public_doctorate_eur',398)),
  ('fr_smic_2026','https://travail-emploi.gouv.fr/revalorisation-annuelle-du-smic-au-1er-janvier-2026',date '2026-01-01',jsonb_build_object('metropolitan_gross_hourly_eur',12.02,'metropolitan_gross_monthly_eur',1823.03,'metropolitan_net_monthly_eur',1443.11,'mayotte_rate_differs',true)),
  ('fr_student_visa_fee_2026','https://www.france-visas.gouv.fr/web/france-visas/etudiant',date '2026-08-06',jsonb_build_object('standard_long_stay_student_visa_fee_eur',99,'etudes_en_france_fee_eur',50,'service_provider_charges_may_apply',true)),
  ('fr_student_work_2026','https://www.france-visas.gouv.fr/web/france-visas/etudiant',date '2026-08-06',jsonb_build_object('annual_hours',964,'share_of_normal_working_time_percent',60,'algerian_nationals_percent',50))
)
insert into evidence.source_snapshots (source_id, source_url, data_as_of, retrieved_at, snapshot_status, metadata)
select s.id, i.source_url, i.data_as_of, now(), 'captured', i.metadata
from incoming i
join evidence.sources s on s.source_key=i.source_key
where not exists (
  select 1 from evidence.source_snapshots x
  where x.source_id=s.id and x.source_url=i.source_url and x.data_as_of=i.data_as_of
);

delete from evidence.metric_observations
where scope_type='country' and scope_id='FR'
  and metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');

with incoming(metric_key, source_key, value, unit, evidence_kind, confidence, methodology, assumptions, effective_from, reviewer_note) as (values
  ('full_time_annual_earnings_range','fr_insee_private_salary_2024',jsonb_build_object('low',17904,'high',52008,'ranking_value',26280,'currency','EUR','basis','annualised_private_sector_net_eqtp_d1_to_d9','population','private-sector full-time-equivalent jobs','measure_type','employee_net_salary_distribution','monthly_d1',1492,'monthly_median',2190,'monthly_d9',4334),'EUR/year','calculated','high','The official monthly net first decile, median and ninth decile are multiplied by twelve. The displayed range is D1 to D9 and the comparison value is the annualised median.',jsonb_build_object('net_not_gross',true,'full_time_equivalent_measure',true,'private_sector_only',true,'coverage_break_with_previous_editions',true),date '2024-12-31','Verified official private-sector net salary distribution, annualised for the France dashboard.'),
  ('average_annual_salary','fr_insee_private_salary_2024',jsonb_build_object('amount',32796,'currency','EUR','basis','annualised_private_sector_average_net_monthly_salary','statistic_type','mean','population','private-sector full-time-equivalent jobs','monthly_amount',2733),'EUR/year','calculated','high','The official average net full-time-equivalent monthly salary of EUR 2,733 is multiplied by twelve.',jsonb_build_object('net_not_gross',true,'private_sector_only',true,'income_tax_not_deducted',true),date '2024-12-31','Verified national private-sector annual net salary benchmark.'),
  ('student_living_cost_monthly_range','fr_student_living_2026',jsonb_build_object('low',877.50,'high',1000,'ranking_value',938.75,'currency','EUR','basis','visa_resource_floor_to_paris_student_planning_value','scenario','one higher-education student; tuition excluded','measure_type','official_requirement_to_guidance_range','visa_resource_requirement_effective_from','2026-08-01'),'EUR/month','calculated','medium','The lower bound is the long-stay study-visa resource requirement applying from 1 August 2026. The upper value is the Campus France monthly planning benchmark for Paris.',jsonb_build_object('tuition_excluded',true,'visa_requirement_is_not_spending_forecast',true,'city_and_housing_variation_material',true),date '2026-08-01','Verified current student planning range using the new August 2026 financial threshold.'),
  ('tuition_annual_low','fr_public_tuition_2026_2027',jsonb_build_object('amount',2902,'currency','EUR','basis','differentiated_public_institution_fee','academic_year','2026-2027','study_level','Licence','student_type','non-EU'),'EUR/year','observed','high','Official differentiated public-institution Licence fee for non-EU students in 2026–2027.',jsonb_build_object('institution_exemptions_may_apply',true,'private_and_specialist_programmes_can_cost_more',true,'course_specific_fee_required_for_decision',true),date '2026-09-01','Verified public-institution Licence planning value.'),
  ('tuition_annual_high','fr_public_tuition_2026_2027',jsonb_build_object('amount',3950,'currency','EUR','basis','differentiated_public_institution_fee','academic_year','2026-2027','study_level','Master','student_type','non-EU'),'EUR/year','observed','high','Official differentiated public-institution Master fee for non-EU students in 2026–2027.',jsonb_build_object('institution_exemptions_may_apply',true,'private_and_specialist_programmes_can_cost_more',true,'course_specific_fee_required_for_decision',true),date '2026-09-01','Verified public-institution Master planning value.'),
  ('national_minimum_hourly_wage','fr_smic_2026',jsonb_build_object('amount',12.02,'currency','EUR','employee_basis','metropolitan_gross_smic'),'EUR/hour','observed','high','Metropolitan gross statutory minimum hourly wage from 1 January 2026.',jsonb_build_object('gross_not_net',true,'mayotte_rate_differs',true),date '2026-01-01','Verified current metropolitan statutory hourly floor.'),
  ('visa_application_fee','fr_student_visa_fee_2026',jsonb_build_object('amount',99,'currency','EUR','fee_type','standard_long_stay_student_visa_processing_fee','visa_type','long-stay student','etudes_en_france_reduced_fee',50),'EUR','observed','high','Standard long-stay student visa processing fee. Applicants from Études en France countries and territories normally pay a reduced EUR 50 fee.',jsonb_build_object('service_provider_charges_excluded',true,'special_cases_may_differ',true),date '2026-08-06','Verified current standard and reduced student visa fees.'),
  ('student_work_hours_limit','fr_student_work_2026',jsonb_build_object('hours',964,'period','year','visa_type','student','normal_working_time_share_percent',60,'algerian_nationals_share_percent',50),'hours/year','observed','high','Foreign students are authorised to work up to 964 hours per year, equal to 60% of normal working time. Algerian nationals are generally limited to 50%.',jsonb_build_object('work_is_supplementary_income',true,'algerian_rules_differ',true,'visa_conditions_control',true),date '2026-08-06','Verified current annual student work allowance.')
), latest_snapshots as (
  select distinct on (s.source_key) s.source_key, ss.id
  from evidence.sources s
  join evidence.source_snapshots ss on ss.source_id=s.id
  where s.source_key in (select source_key from incoming)
  order by s.source_key, ss.retrieved_at desc
)
insert into evidence.metric_observations (metric_key, scope_type, scope_id, value, unit, source_snapshot_id, evidence_kind, confidence, methodology, assumptions, effective_from, review_status, reviewed_at, reviewer_note)
select i.metric_key, 'country', 'FR', i.value, i.unit, l.id, i.evidence_kind, i.confidence, i.methodology, i.assumptions, i.effective_from, 'verified', now(), i.reviewer_note
from incoming i join latest_snapshots l on l.source_key=i.source_key;

delete from public.report_metric_evidence_country
where scope_type='country' and scope_id='FR'
  and metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');

insert into public.report_metric_evidence_country (scope_type, scope_id, metric_key, value, source_name, source_url, data_as_of, last_verified_at, confidence, evidence_kind, review_status, created_at, updated_at)
select o.scope_type, o.scope_id, o.metric_key, o.value, s.source_name, ss.source_url,
       coalesce(ss.data_as_of,o.effective_from,current_date),
       coalesce(o.reviewed_at,o.updated_at,now()),
       o.confidence, o.evidence_kind, o.review_status, o.created_at, o.updated_at
from evidence.metric_observations o
join evidence.source_snapshots ss on ss.id=o.source_snapshot_id
join evidence.sources s on s.id=ss.source_id
where o.scope_type='country' and o.scope_id='FR' and o.review_status='verified'
  and o.metric_key in ('full_time_annual_earnings_range','average_annual_salary','student_living_cost_monthly_range','tuition_annual_low','tuition_annual_high','national_minimum_hourly_wage','visa_application_fee','student_work_hours_limit');;
