-- United Kingdom × Carpenter Career Data Foundation.
-- Uses the frozen career-opportunity-v4-foundation methodology.
-- Legacy UK Carpenter rows remain regression/reference only.

insert into public.career_foundation_profiles
(profile_key,country_code,canonical_occupation_id,currency,decision_ready,decision_readiness_reason,source_checked_on)
values
('UK:carpenter','UK','carpenter','GBP',true,
 'All 9 Opportunity Score components are evaluated under methodology v1. Current SOC 2020 evidence is used where available; the 2020 employment start uses the official SOC 2010 predecessor and policy-to-rubric conversions remain explicit.',
 '2026-08-13')
on conflict (profile_key) do update set
 country_code=excluded.country_code,canonical_occupation_id=excluded.canonical_occupation_id,currency=excluded.currency,
 decision_ready=excluded.decision_ready,decision_readiness_reason=excluded.decision_readiness_reason,
 source_checked_on=excluded.source_checked_on,updated_at=now();

insert into public.career_official_sources
(source_key,authority,title,url,source_type,last_verified_on,notes)
values
('uk-ons-soc2020','Office for National Statistics','SOC 2020','https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020','official_primary','2026-08-13','Primary current occupation taxonomy.'),
('uk-mac-construction-shortage-2023','Migration Advisory Committee','Review of the Shortage Occupation List 2023','https://assets.publishing.service.gov.uk/media/65157a3f7c2c4a000d95e2da/Review_of_the_Shortage_Occupation_List_2023.pdf','official_primary','2026-08-13','APS-based historical employee evidence for the SOC 2010 predecessor.'),
('uk-mac-tsl-stage2-2026','Migration Advisory Committee','Temporary Shortage List: Stage 2','https://www.gov.uk/government/publications/temporary-shortage-list-stage-2','official_primary','2026-08-13','Current shortage-policy and 2025 employee evidence for SOC 5316.'),
('uk-dfe-occupations-demand-2025','Department for Education / Skills England','Occupations in demand: 2025','https://explore-education-statistics.service.gov.uk/find-statistics/occupations-in-demand/2025','official_primary','2026-08-13','Demand publication and SOC-to-industry supporting data.'),
('uk-ons-lfs-employees-mgrn','Office for National Statistics','Employees: UK: annual four-quarter average','https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/timeseries/mgrn/lms','official_primary','2026-08-13','National employee benchmark series.'),
('uk-ons-ashe-table14-2025','Office for National Statistics','ASHE 2025 provisional Table 14.7a','https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14/2025provisional','official_primary','2026-08-13','Exact SOC 5316 Full-Time annual gross pay row.'),
('uk-ons-ashe-bulletin-2025','Office for National Statistics','Employee earnings in the UK: 2025','https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025','official_primary','2026-08-13','All full-time employee annual median benchmark.'),
('uk-dfe-skills-imperative-2035','Department for Education','The UK Skills Imperative 2035','https://explore-education-statistics.service.gov.uk/find-statistics/the-uk-skills-imperative-2035','official_primary','2026-08-13','Current revised Working Futures projection data.'),
('uk-skillsengland-carpentry-st0264','Skills England','Carpentry and Joinery apprenticeship ST0264','https://skillsengland.education.gov.uk/apprenticeships/st0264-v1-4','official_primary','2026-08-13','Current Level 2 apprenticeship route.'),
('uk-gov-apprentice-pay','UK Government','Become an apprentice: What you will get','https://www.gov.uk/become-apprentice/pay-and-conditions','official_primary','2026-08-13','Apprentices are paid employees with employee rights.'),
('uk-immigration-salary-list','UK Government','Immigration Salary List','https://www.gov.uk/government/publications/skilled-worker-visa-immigration-salary-list','official_primary','2026-08-13','SOC 5316 is listed for all jobs across the UK.'),
('uk-skilled-worker-rules','UK Government','Skilled Worker visa','https://www.gov.uk/skilled-worker-visa','official_primary','2026-08-13','Representative employer-sponsored route.'),
('uk-skillsengland-carpentry-occ','Skills England','Occupation finder: Carpentry and joinery','https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC0160','official_primary','2026-08-13','Occupation is not classified as regulated.'),
('uk-hse-construction-worker','Health and Safety Executive','Assessing competence in the construction industry','https://www.hse.gov.uk/construction/areyou/worker.htm','official_primary','2026-08-13','Competence/card guidance; not a nationwide Carpenter licence.')
on conflict (source_key) do update set
 authority=excluded.authority,title=excluded.title,url=excluded.url,source_type=excluded.source_type,
 last_verified_on=excluded.last_verified_on,notes=excluded.notes;

insert into public.career_occupation_mappings
(mapping_key,profile_key,canonical_occupation_id,country_code,official_taxonomy,official_taxonomy_version,official_code,official_title,mapping_relation,mapping_quality,rationale,source_key,source_url,verified_on,is_primary)
values
('UK:carpenter:SOC2020:5316','UK:carpenter','carpenter','UK','SOC','2020','5316','Carpenters and joiners','exact','high','Primary current UK occupation mapping.','uk-ons-soc2020','https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020','2026-08-13',true),
('UK:carpenter:SOC2010:5315','UK:carpenter','carpenter','UK','SOC','2010','5315','Carpenters and joiners','exact','medium','Historical predecessor used only for the 2020 APS-based employment start point.','uk-mac-construction-shortage-2023','https://assets.publishing.service.gov.uk/media/65157a3f7c2c4a000d95e2da/Review_of_the_Shortage_Occupation_List_2023.pdf','2026-08-13',false)
on conflict (mapping_key) do update set
 profile_key=excluded.profile_key,canonical_occupation_id=excluded.canonical_occupation_id,country_code=excluded.country_code,
 official_taxonomy=excluded.official_taxonomy,official_taxonomy_version=excluded.official_taxonomy_version,
 official_code=excluded.official_code,official_title=excluded.official_title,mapping_relation=excluded.mapping_relation,
 mapping_quality=excluded.mapping_quality,rationale=excluded.rationale,source_key=excluded.source_key,
 source_url=excluded.source_url,verified_on=excluded.verified_on,is_primary=excluded.is_primary;

insert into public.career_raw_observations
(observation_key,profile_key,mapping_key,source_key,metric_key,reference_period,as_of_date,raw_value,unit,availability,reason,directness,mapping_quality,proxy_reason,source_type,quality,confidence,last_verified_on,explanation)
values
('uk-carpenter-mac-stage2-2026','UK:carpenter','UK:carpenter:SOC2020:5316','uk-mac-tsl-stage2-2026','national_shortage_signal','MAC TSL Stage 2','2026-07-21',jsonb_build_object('historical_shortage_evidence','limited_or_mixed','future_demand_evidence','strong','recommended_tsl_months',18,'normalized_severity','shortage','scope','national'),'status','available',null,'direct','high',null,'official_primary','medium',0.90,'2026-08-13','National shortage candidate without elevating mixed historical evidence to severe/critical.'),
('uk-carpenter-demand-2025','UK:carpenter','UK:carpenter:SOC2020:5316','uk-dfe-occupations-demand-2025','vacancy_fallback_evidence','Occupations in demand 2025','2025-12-31',jsonb_build_object('high_demand',false,'clean_distinct_90_day_numerator',false,'fallback_intensity','low','persistence_bonus',0),'demand evidence','available','No clean distinct 90-day posting numerator is published.','direct','high',null,'official_primary','medium',0.82,'2026-08-13','Used only for the conservative vacancy fallback.'),
('uk-carpenter-industry-2025','UK:carpenter','UK:carpenter:SOC2020:5316','uk-dfe-occupations-demand-2025','industry_employment_distribution','2025 supporting data','2025-12-31',jsonb_build_object('occupation_workers',180400,'covered_workers',180200,'coverage_pct',99.88913525498891,'hhi',0.6247843227442887,'hhi_renormalized',0.6261719379056493,'top_industry','Construction','top_industry_workers',140000,'top_industry_share_pct',77.60532150776054),'persons','available',null,'direct','high',null,'official_primary','high',0.94,'2026-08-13','99.89% coverage; HHI 0.6248 and Construction share 77.61%.'),
('uk-carpenter-employees-2020','UK:carpenter','UK:carpenter:SOC2010:5315','uk-mac-construction-shortage-2023','actual_employment','APS January-December 2020','2020-12-31',to_jsonb(79400),'employees','available',null,'proxy','medium','Historical start is the SOC 2010 predecessor rather than SOC 2020 5316.','official_primary','medium',0.82,'2026-08-13','Official MAC review reports 79,400 employees in 2020.'),
('uk-carpenter-employees-2025','UK:carpenter','UK:carpenter:SOC2020:5316','uk-mac-tsl-stage2-2026','actual_employment','2025 Stage 2 evidence','2025-12-31',to_jsonb(69000),'employees','available',null,'direct','high',null,'official_primary','medium',0.88,'2026-08-13','MAC Stage 2 reports 69,000 employees in 2025.'),
('uk-all-employees-2020','UK:carpenter',null,'uk-ons-lfs-employees-mgrn','actual_all_employment','2020 annual four-quarter average','2020-12-31',to_jsonb(27841000),'employees','available',null,'direct','not_applicable',null,'official_primary','high',0.98,'2026-08-13','ONS LFS: 27.841 million UK employees.'),
('uk-all-employees-2025','UK:carpenter',null,'uk-ons-lfs-employees-mgrn','actual_all_employment','2025 annual four-quarter average','2025-12-31',to_jsonb(29584000),'employees','available',null,'direct','not_applicable',null,'official_primary','high',0.98,'2026-08-13','ONS LFS: 29.584 million UK employees.'),
('uk-carpentry-apprenticeship-2025','UK:carpenter','UK:carpenter:SOC2020:5316','uk-skillsengland-carpentry-st0264','entry_education_training','ST0264 v1.4','2026-08-13',jsonb_build_object('level',2,'options',jsonb_build_array('Site Carpenter','Architectural Joiner'),'typical_duration_months',24,'employment_linked',true),'apprenticeship','available',null,'proxy','high','Official apprenticeship route is mapped to the frozen entry rubric.','official_primary','high',0.93,'2026-08-13','Representative current Level 2 route in England.'),
('uk-apprenticeship-paid-employment-2026','UK:carpenter','UK:carpenter:SOC2020:5316','uk-gov-apprentice-pay','paid_training_structure','Current apprenticeship conditions','2026-08-13',jsonb_build_object('paid',true,'employee_rights',true,'minimum_wage_applies',true),'employment structure','available',null,'proxy','high','Generic apprenticeship pay rules applied to the representative route.','official_primary','high',0.95,'2026-08-13','Apprentices are paid employees.'),
('uk-carpenter-ashe-fulltime-annual-2025','UK:carpenter','UK:carpenter:SOC2020:5316','uk-ons-ashe-table14-2025','median_fulltime_gross_annual_pay','ASHE 2025 provisional Table 14.7a, Full-Time','2025-04-01',jsonb_build_object('soc_code','5316','occupation','Carpenters and joiners','sheet','Full-Time','workbook_table','14.7a Annual pay - Gross 2025','row_index_1based',361,'median_gbp',34014,'provisional',true),'GBP_per_year','available',null,'direct','high',null,'official_primary','high',0.96,'2026-08-13','Exact ONS SOC 5316 Full-Time row: median gross annual pay GBP 34,014.'),
('uk-all-ashe-fulltime-annual-2025','UK:carpenter',null,'uk-ons-ashe-bulletin-2025','all_occupations_median_fulltime_gross_annual_pay','ASHE 2025 provisional','2025-04-01',to_jsonb(39039),'GBP_per_year','available',null,'direct','not_applicable',null,'official_primary','high',0.98,'2026-08-13','ONS all full-time employee median GBP 39,039.'),
('uk-carpenter-projection-2021','UK:carpenter','UK:carpenter:SOC2020:5316','uk-dfe-skills-imperative-2035','projected_occupation_employment','2021 revised baseline','2021-12-31',to_jsonb(203247.3719),'jobs','available',null,'proxy','high','Four-digit Working Futures values inherit broader occupational growth assumptions.','official_primary','medium',0.86,'2026-08-13','Current revised DfE value: 203,247.3719 jobs.'),
('uk-carpenter-projection-2035','UK:carpenter','UK:carpenter:SOC2020:5316','uk-dfe-skills-imperative-2035','projected_occupation_employment','2035 revised projection','2035-12-31',to_jsonb(188293.6923),'jobs','available',null,'proxy','high','Four-digit Working Futures values inherit broader occupational growth assumptions.','official_primary','medium',0.86,'2026-08-13','Current revised DfE value: 188,293.6923 jobs.'),
('uk-all-projection-2021','UK:carpenter',null,'uk-dfe-skills-imperative-2035','projected_all_employment','2021 revised baseline','2021-12-31',to_jsonb(35139637.999037),'jobs','available',null,'direct','not_applicable',null,'official_primary','high',0.96,'2026-08-13','Sum of current revised DfE all-occupation rows.'),
('uk-all-projection-2035','UK:carpenter',null,'uk-dfe-skills-imperative-2035','projected_all_employment','2035 revised projection','2035-12-31',to_jsonb(37567871.999864),'jobs','available',null,'direct','not_applicable',null,'official_primary','high',0.96,'2026-08-13','Sum of current revised DfE all-occupation rows.'),
('uk-carpenter-skilled-worker-2026','UK:carpenter','UK:carpenter:SOC2020:5316','uk-immigration-salary-list','visa_route_applicability','Current Skilled Worker route','2026-08-13',jsonb_build_object('route','Skilled Worker','soc_code','5316','uk_wide',true,'approved_sponsor_required',true,'certificate_of_sponsorship_required',true,'settlement_capable',true),'policy evidence','available',null,'proxy','high','Immigration rules are mapped to the frozen occupation-level rubric.','official_primary','high',0.91,'2026-08-13','SOC 5316 is on the Immigration Salary List UK-wide.'),
('uk-carpenter-regulation-2026','UK:carpenter','UK:carpenter:SOC2020:5316','uk-skillsengland-carpentry-occ','employee_occupational_regulation','Current occupation record','2026-08-13',jsonb_build_object('regulated_occupation',false,'statutory_personal_occupational_licence_identified',false),'regulatory evidence','available',null,'direct','high',null,'official_primary','high',0.96,'2026-08-13','Skills England identifies Carpentry and Joinery as not regulated.'),
('uk-carpenter-certification-card-2026','UK:carpenter','UK:carpenter:SOC2020:5316','uk-hse-construction-worker','industry_competence_card','Current HSE guidance','2026-08-13',jsonb_build_object('universal_statutory_carpenter_card',false,'practical_site_requirements_possible',true),'regulatory evidence','available',null,'proxy','high','HSE guidance distinguishes practical competence/card expectations from a statutory licence.','official_primary','high',0.90,'2026-08-13','Practical card requirements may exist but are not a nationwide Carpenter licence.')
on conflict (observation_key) do update set
 profile_key=excluded.profile_key,mapping_key=excluded.mapping_key,source_key=excluded.source_key,metric_key=excluded.metric_key,
 reference_period=excluded.reference_period,as_of_date=excluded.as_of_date,raw_value=excluded.raw_value,unit=excluded.unit,
 availability=excluded.availability,reason=excluded.reason,directness=excluded.directness,mapping_quality=excluded.mapping_quality,
 proxy_reason=excluded.proxy_reason,source_type=excluded.source_type,quality=excluded.quality,confidence=excluded.confidence,
 last_verified_on=excluded.last_verified_on,explanation=excluded.explanation;

insert into public.career_normalized_metrics
(normalized_metric_key,profile_key,metric_key,input_observation_refs,normalized_value,normalized_unit,formula_version,availability,reason,directness,mapping_quality,proxy_reason,source_type,quality,confidence,explanation)
values
('UK:carpenter:shortage_points_v1','UK:carpenter','shortage_points',array['uk-carpenter-mac-stage2-2026'],12,'points','normalize-shortage-v1','available',null,'proxy','high','Official MAC narrative mapped to the frozen severity/scope rubric.','official_primary','medium',0.88,'National shortage = 12.'),
('UK:carpenter:vacancy_fallback_points_v1','UK:carpenter','vacancy_fallback_points',array['uk-carpenter-demand-2025'],3,'points','normalize-vacancy-90d-v1','available','No clean distinct 90-day national posting numerator.','proxy','high','Official demand evidence is a conservative fallback, not the primary vacancy numerator.','official_primary','medium',0.78,'Low intensity 3 + persistence 0 = 3.'),
('UK:carpenter:industry_diversity_points_v1','UK:carpenter','industry_diversity_points',array['uk-carpenter-industry-2025'],0,'points','normalize-industry-diversity-v1','available',null,'direct','high',null,'official_primary','high',0.94,'HHI 0.6248 and top share 77.61% map to 0/5; coverage 99.89%.'),
('UK:carpenter:employment_momentum_excess_cagr_pp_v1','UK:carpenter','employment_momentum_excess_cagr_pp',array['uk-carpenter-employees-2020','uk-carpenter-employees-2025','uk-all-employees-2020','uk-all-employees-2025'],-3.9906670350519535,'percentage_points_per_year','normalize-employment-momentum-v1','available',null,'proxy','medium','SOC 2010→2020 bridge and APS occupation evidence versus LFS national employees.','official_primary','medium',0.80,'Occupation CAGR -2.7688% versus UK +1.2219%; excess -3.9907pp/year.'),
('UK:carpenter:entry_accessibility_points_v1','UK:carpenter','entry_accessibility_points',array['uk-carpentry-apprenticeship-2025','uk-apprenticeship-paid-employment-2026'],14,'points','normalize-entry-accessibility-v1','available',null,'proxy','high','Official apprenticeship evidence mapped to the frozen entry rubric.','official_primary','high',0.91,'Education 7 + experience 3 + paid training 4 = 14.'),
('UK:carpenter:relative_salary_ratio_v1','UK:carpenter','relative_salary_ratio',array['uk-carpenter-ashe-fulltime-annual-2025','uk-all-ashe-fulltime-annual-2025'],0.8712825635902559,'ratio','normalize-relative-salary-v1','available',null,'direct','high',null,'official_primary','high',0.96,'GBP34,014 / GBP39,039 = 0.8712826.'),
('UK:carpenter:projected_growth_excess_cagr_pp_v1','UK:carpenter','projected_growth_excess_cagr_pp',array['uk-carpenter-projection-2021','uk-carpenter-projection-2035','uk-all-projection-2021','uk-all-projection-2035'],-1.0227987974763764,'percentage_points_per_year','normalize-projected-growth-v1','available',null,'proxy','high','Four-digit Working Futures values inherit broader occupational growth assumptions.','official_primary','medium',0.85,'SOC 5316 CAGR -0.5444% versus all occupations +0.4784%; excess -1.0228pp/year.'),
('UK:carpenter:visa_accessibility_points_v1','UK:carpenter','visa_accessibility_points',array['uk-carpenter-skilled-worker-2026'],7,'points','normalize-visa-accessibility-v1','available',null,'proxy','high','Official policy mapped to the frozen occupation-level rubric.','official_primary','high',0.90,'Applicability 3 + employer dependency 1 + eligibility burden 1 + long-term pathway 2 = 7.'),
('UK:carpenter:entry_burden_points_v1','UK:carpenter','entry_burden_points',array['uk-carpenter-regulation-2026','uk-carpenter-certification-card-2026'],5,'points','normalize-entry-burden-v1','available',null,'proxy','high','Official regulation/HSE evidence mapped to the general employee rubric.','official_primary','high',0.91,'No nationwide statutory personal licence/universal card: 5/5.')
on conflict (normalized_metric_key) do update set
 profile_key=excluded.profile_key,metric_key=excluded.metric_key,input_observation_refs=excluded.input_observation_refs,
 normalized_value=excluded.normalized_value,normalized_unit=excluded.normalized_unit,formula_version=excluded.formula_version,
 availability=excluded.availability,reason=excluded.reason,directness=excluded.directness,mapping_quality=excluded.mapping_quality,
 proxy_reason=excluded.proxy_reason,source_type=excluded.source_type,quality=excluded.quality,confidence=excluded.confidence,
 explanation=excluded.explanation,calculated_at=now();

insert into public.career_normalized_metric_inputs
(normalized_metric_key,observation_key,input_role,usage_type)
values
('UK:carpenter:shortage_points_v1','uk-carpenter-mac-stage2-2026','official_shortage_assessment','policy_evidence'),
('UK:carpenter:vacancy_fallback_points_v1','uk-carpenter-demand-2025','fallback_market_evidence','fallback_evidence'),
('UK:carpenter:industry_diversity_points_v1','uk-carpenter-industry-2025','industry_distribution','input'),
('UK:carpenter:employment_momentum_excess_cagr_pp_v1','uk-carpenter-employees-2020','occupation_start_employment','input'),
('UK:carpenter:employment_momentum_excess_cagr_pp_v1','uk-carpenter-employees-2025','occupation_end_employment','input'),
('UK:carpenter:employment_momentum_excess_cagr_pp_v1','uk-all-employees-2020','country_start_employment','benchmark'),
('UK:carpenter:employment_momentum_excess_cagr_pp_v1','uk-all-employees-2025','country_end_employment','benchmark'),
('UK:carpenter:entry_accessibility_points_v1','uk-carpentry-apprenticeship-2025','entry_education','input'),
('UK:carpenter:entry_accessibility_points_v1','uk-apprenticeship-paid-employment-2026','earning_structure','input'),
('UK:carpenter:relative_salary_ratio_v1','uk-carpenter-ashe-fulltime-annual-2025','occupation_value','input'),
('UK:carpenter:relative_salary_ratio_v1','uk-all-ashe-fulltime-annual-2025','country_benchmark','benchmark'),
('UK:carpenter:projected_growth_excess_cagr_pp_v1','uk-carpenter-projection-2021','occupation_projection_start','input'),
('UK:carpenter:projected_growth_excess_cagr_pp_v1','uk-carpenter-projection-2035','occupation_projection_end','input'),
('UK:carpenter:projected_growth_excess_cagr_pp_v1','uk-all-projection-2021','country_projection_start','benchmark'),
('UK:carpenter:projected_growth_excess_cagr_pp_v1','uk-all-projection-2035','country_projection_end','benchmark'),
('UK:carpenter:visa_accessibility_points_v1','uk-carpenter-skilled-worker-2026','primary_pathway','policy_evidence'),
('UK:carpenter:entry_burden_points_v1','uk-carpenter-regulation-2026','employee_regulatory_status','policy_evidence'),
('UK:carpenter:entry_burden_points_v1','uk-carpenter-certification-card-2026','site_requirement_context','policy_evidence')
on conflict do nothing;

insert into public.career_opportunity_score_snapshots
(snapshot_key,profile_key,as_of_date,formula_version,required_component_keys,explanation)
values
('UK:carpenter:2026-08-13:v1','UK:carpenter','2026-08-13','career-opportunity-v4-foundation',
 array['shortage_signal','vacancy_intensity','industry_diversity','employment_momentum','entry_accessibility','relative_salary','projected_growth','visa_accessibility','entry_burden'],
 'UK Carpenter under frozen methodology v1. Exact SOC 5316 salary and industry rows are ingested; proxy caveats remain for the historic classification bridge, Working Futures detailed projection method, policy-to-rubric conversions and vacancy fallback.')
on conflict (snapshot_key) do update set
 formula_version=excluded.formula_version,required_component_keys=excluded.required_component_keys,explanation=excluded.explanation;

insert into public.career_score_components
(snapshot_key,profile_key,component_key,raw_input_refs,normalized_metric_refs,normalized_value,formula_version,availability,directness,mapping_quality,proxy_reason,source_type,quality,confidence,explanation,reason,evidence_status)
values
('UK:carpenter:2026-08-13:v1','UK:carpenter','shortage_signal',array['uk-carpenter-mac-stage2-2026'],array['UK:carpenter:shortage_points_v1'],12,'career-opportunity-v4-foundation','available','proxy','high','MAC narrative mapped to severity/scope rubric.','official_primary','medium',0.88,'National shortage = 12/20.',null,'proxy'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','vacancy_intensity',array['uk-carpenter-demand-2025'],array['UK:carpenter:vacancy_fallback_points_v1'],3,'career-opportunity-v4-foundation','available','proxy','high','No clean distinct 90-day numerator.','official_primary','medium',0.78,'Conservative vacancy fallback = 3/15.','No clean distinct 90-day national Carpenter posting numerator.','fallback'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','industry_diversity',array['uk-carpenter-industry-2025'],array['UK:carpenter:industry_diversity_points_v1'],0,'career-opportunity-v4-foundation','available','direct','high',null,'official_primary','high',0.94,'HHI 0.6248; top share 77.61%; coverage 99.89%.',null,'derived'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','employment_momentum',array['uk-carpenter-employees-2020','uk-carpenter-employees-2025','uk-all-employees-2020','uk-all-employees-2025'],array['UK:carpenter:employment_momentum_excess_cagr_pp_v1'],-3.9906670350519535,'career-opportunity-v4-foundation','available','proxy','medium','SOC vintage bridge and APS/LFS comparison.','official_primary','medium',0.80,'Excess CAGR -3.9907pp/year; score clamps to 0/10.',null,'derived'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','entry_accessibility',array['uk-carpentry-apprenticeship-2025','uk-apprenticeship-paid-employment-2026'],array['UK:carpenter:entry_accessibility_points_v1'],14,'career-opportunity-v4-foundation','available','proxy','high','Official apprenticeship evidence mapped to rubric.','official_primary','high',0.91,'Representative paid Level 2 route = 14/15.',null,'proxy'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','relative_salary',array['uk-carpenter-ashe-fulltime-annual-2025','uk-all-ashe-fulltime-annual-2025'],array['UK:carpenter:relative_salary_ratio_v1'],0.8712825635902559,'career-opportunity-v4-foundation','available','direct','high',null,'official_primary','high',0.96,'Exact ONS medians GBP34,014 / GBP39,039 = 0.8712826; score 3.71/10.',null,'derived'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','projected_growth',array['uk-carpenter-projection-2021','uk-carpenter-projection-2035','uk-all-projection-2021','uk-all-projection-2035'],array['UK:carpenter:projected_growth_excess_cagr_pp_v1'],-1.0227987974763764,'career-opportunity-v4-foundation','available','proxy','high','Four-digit values inherit broader Working Futures assumptions.','official_primary','medium',0.85,'Revised excess projected CAGR -1.0228pp/year; score 2.44/10.',null,'derived'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','visa_accessibility',array['uk-carpenter-skilled-worker-2026'],array['UK:carpenter:visa_accessibility_points_v1'],7,'career-opportunity-v4-foundation','available','proxy','high','Official immigration policy mapped to rubric.','official_primary','high',0.90,'Skilled Worker representative route = 7/10.',null,'proxy'),
('UK:carpenter:2026-08-13:v1','UK:carpenter','entry_burden',array['uk-carpenter-regulation-2026','uk-carpenter-certification-card-2026'],array['UK:carpenter:entry_burden_points_v1'],5,'career-opportunity-v4-foundation','available','proxy','high','Official regulation/HSE evidence mapped to employee rubric.','official_primary','high',0.91,'No nationwide statutory personal licence/universal card = 5/5.',null,'proxy')
on conflict (snapshot_key,component_key) do update set
 raw_input_refs=excluded.raw_input_refs,normalized_metric_refs=excluded.normalized_metric_refs,normalized_value=excluded.normalized_value,
 formula_version=excluded.formula_version,availability=excluded.availability,directness=excluded.directness,
 mapping_quality=excluded.mapping_quality,proxy_reason=excluded.proxy_reason,source_type=excluded.source_type,
 quality=excluded.quality,confidence=excluded.confidence,explanation=excluded.explanation,reason=excluded.reason,
 evidence_status=excluded.evidence_status,calculated_at=now();

insert into public.career_score_component_metric_inputs(snapshot_key,component_key,normalized_metric_key,input_role)
values
('UK:carpenter:2026-08-13:v1','shortage_signal','UK:carpenter:shortage_points_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','vacancy_intensity','UK:carpenter:vacancy_fallback_points_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','industry_diversity','UK:carpenter:industry_diversity_points_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','employment_momentum','UK:carpenter:employment_momentum_excess_cagr_pp_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','entry_accessibility','UK:carpenter:entry_accessibility_points_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','relative_salary','UK:carpenter:relative_salary_ratio_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','projected_growth','UK:carpenter:projected_growth_excess_cagr_pp_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','visa_accessibility','UK:carpenter:visa_accessibility_points_v1','scored_metric'),
('UK:carpenter:2026-08-13:v1','entry_burden','UK:carpenter:entry_burden_points_v1','scored_metric')
on conflict do nothing;

insert into public.career_score_component_raw_inputs(snapshot_key,component_key,observation_key,input_role)
values
('UK:carpenter:2026-08-13:v1','shortage_signal','uk-carpenter-mac-stage2-2026','official_shortage_assessment'),
('UK:carpenter:2026-08-13:v1','vacancy_intensity','uk-carpenter-demand-2025','fallback_market_evidence'),
('UK:carpenter:2026-08-13:v1','industry_diversity','uk-carpenter-industry-2025','industry_distribution'),
('UK:carpenter:2026-08-13:v1','employment_momentum','uk-carpenter-employees-2020','occupation_start_employment'),
('UK:carpenter:2026-08-13:v1','employment_momentum','uk-carpenter-employees-2025','occupation_end_employment'),
('UK:carpenter:2026-08-13:v1','employment_momentum','uk-all-employees-2020','country_start_employment'),
('UK:carpenter:2026-08-13:v1','employment_momentum','uk-all-employees-2025','country_end_employment'),
('UK:carpenter:2026-08-13:v1','entry_accessibility','uk-carpentry-apprenticeship-2025','entry_education'),
('UK:carpenter:2026-08-13:v1','entry_accessibility','uk-apprenticeship-paid-employment-2026','earning_structure'),
('UK:carpenter:2026-08-13:v1','relative_salary','uk-carpenter-ashe-fulltime-annual-2025','occupation_value'),
('UK:carpenter:2026-08-13:v1','relative_salary','uk-all-ashe-fulltime-annual-2025','country_benchmark'),
('UK:carpenter:2026-08-13:v1','projected_growth','uk-carpenter-projection-2021','occupation_projection_start'),
('UK:carpenter:2026-08-13:v1','projected_growth','uk-carpenter-projection-2035','occupation_projection_end'),
('UK:carpenter:2026-08-13:v1','projected_growth','uk-all-projection-2021','country_projection_start'),
('UK:carpenter:2026-08-13:v1','projected_growth','uk-all-projection-2035','country_projection_end'),
('UK:carpenter:2026-08-13:v1','visa_accessibility','uk-carpenter-skilled-worker-2026','primary_pathway'),
('UK:carpenter:2026-08-13:v1','entry_burden','uk-carpenter-regulation-2026','employee_regulatory_status'),
('UK:carpenter:2026-08-13:v1','entry_burden','uk-carpenter-certification-card-2026','site_requirement_context')
on conflict do nothing;

insert into public.career_foundation_visa_pathways
(pathway_key,profile_key,route_role,pathway_name,source_key,official_source_url,occupation_applicability_points,employer_dependency_points,eligibility_burden_points,long_term_pathway_points,used_for_primary_score,applicability_scope,last_verified_on,notes)
values
('UK:carpenter:skilled-worker','UK:carpenter','primary','Skilled Worker visa','uk-skilled-worker-rules','https://www.gov.uk/skilled-worker-visa',3,1,1,2,true,'SOC 5316 current UK-wide route; personal sponsorship, salary and other conditions must be checked.','2026-08-13','Employer-sponsored and settlement-capable subject to qualifying conditions.')
on conflict (pathway_key) do update set
 route_role=excluded.route_role,pathway_name=excluded.pathway_name,source_key=excluded.source_key,official_source_url=excluded.official_source_url,
 occupation_applicability_points=excluded.occupation_applicability_points,employer_dependency_points=excluded.employer_dependency_points,
 eligibility_burden_points=excluded.eligibility_burden_points,long_term_pathway_points=excluded.long_term_pathway_points,
 used_for_primary_score=excluded.used_for_primary_score,applicability_scope=excluded.applicability_scope,last_verified_on=excluded.last_verified_on,notes=excluded.notes;

insert into public.career_foundation_licensing_evidence
(evidence_key,profile_key,mapping_key,jurisdiction_code,jurisdiction_name,jurisdiction_level,requirement_type,mandatory,applies_to,authority,source_key,official_source_url,verified_on,cost_amount,cost_currency,expected_duration_days,exceptions,evidence_quality,notes)
values
('UK:carpenter:occupational-license','UK:carpenter','UK:carpenter:SOC2020:5316','UK','United Kingdom','national','occupational_license',false,'employee','Skills England','uk-skillsengland-carpentry-occ','https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC0160','2026-08-13',null,null,null,'Sites/employers may still require competence evidence.','high','No UK-wide statutory personal Carpenter occupational licence validated.'),
('UK:carpenter:industry-card','UK:carpenter','UK:carpenter:SOC2020:5316','GB','Great Britain','national','certification',false,'employee','Health and Safety Executive','uk-hse-construction-worker','https://www.hse.gov.uk/construction/areyou/worker.htm','2026-08-13',null,null,null,'Sites/employers may impose card requirements.','medium','Practical cards are not represented as a universal statutory licence.')
on conflict (evidence_key) do update set
 jurisdiction_code=excluded.jurisdiction_code,jurisdiction_name=excluded.jurisdiction_name,jurisdiction_level=excluded.jurisdiction_level,
 requirement_type=excluded.requirement_type,mandatory=excluded.mandatory,applies_to=excluded.applies_to,authority=excluded.authority,
 source_key=excluded.source_key,official_source_url=excluded.official_source_url,verified_on=excluded.verified_on,
 cost_amount=excluded.cost_amount,cost_currency=excluded.cost_currency,expected_duration_days=excluded.expected_duration_days,
 exceptions=excluded.exceptions,evidence_quality=excluded.evidence_quality,notes=excluded.notes;

insert into public.career_foundation_blockers
(blocker_key,profile_key,blocker_type,severity,reason,source_key,official_source_url,applicability_scope,last_verified_on,active)
values
('UK:carpenter:work-rights','UK:carpenter','work_rights','conditional','UK work rights or an appropriate visa are required; the occupation-level score does not confirm personal eligibility.','uk-skilled-worker-rules','https://www.gov.uk/skilled-worker-visa','Individual applicant','2026-08-13',true),
('UK:carpenter:sponsorship','UK:carpenter','visa','conditional','The representative Skilled Worker route requires an approved sponsor and Certificate of Sponsorship plus other conditions.','uk-skilled-worker-rules','https://www.gov.uk/skilled-worker-visa','Applicants relying on sponsorship','2026-08-13',true),
('UK:carpenter:site-competence','UK:carpenter','safety_training','conditional','Sites and employers may require competence, qualifications, induction or a relevant industry card.','uk-hse-construction-worker','https://www.hse.gov.uk/construction/areyou/worker.htm','Site-based employment','2026-08-13',true)
on conflict (blocker_key) do update set
 blocker_type=excluded.blocker_type,severity=excluded.severity,reason=excluded.reason,source_key=excluded.source_key,
 official_source_url=excluded.official_source_url,applicability_scope=excluded.applicability_scope,last_verified_on=excluded.last_verified_on,active=excluded.active;

insert into public.career_foundation_entry_points
(entry_point_key,profile_key,entry_type,label,provider,url,source_key,applicability_scope,last_verified_on,notes,sort_order)
values
('UK:carpenter:apprenticeship','UK:carpenter','apprenticeship','Level 2 Carpentry and Joinery apprenticeship','Skills England','https://skillsengland.education.gov.uk/apprenticeships/st0264-v1-4','uk-skillsengland-carpentry-st0264','England representative route','2026-08-13','Paid employment-linked route.',10),
('UK:carpenter:visa-check','UK:carpenter','visa','Check Skilled Worker route','UK Government','https://www.gov.uk/skilled-worker-visa','uk-skilled-worker-rules','Applicants requiring sponsored work rights','2026-08-13','Check personal sponsorship and eligibility.',20),
('UK:carpenter:regulation-check','UK:carpenter','licensing_check','Check site competence and card requirements','Health and Safety Executive','https://www.hse.gov.uk/construction/areyou/worker.htm','uk-hse-construction-worker','Site-based employment','2026-08-13','Practical site requirements can differ.',30)
on conflict (entry_point_key) do update set
 entry_type=excluded.entry_type,label=excluded.label,provider=excluded.provider,url=excluded.url,source_key=excluded.source_key,
 applicability_scope=excluded.applicability_scope,last_verified_on=excluded.last_verified_on,notes=excluded.notes,sort_order=excluded.sort_order;;
