-- Australia × Electrician (General) Career Data Foundation.
-- Reuses the frozen 100-point Opportunity Score v1 / v4 formula.
-- Evidence is independently sourced for Electrician; AU Carpenter is structural reference only.

insert into public.career_foundation_profiles
(profile_key,country_code,canonical_occupation_id,currency,decision_ready,decision_readiness_reason,source_checked_on)
values
('AU:electrician','AU','electrician','AUD',true,
 'All 9 Opportunity Score components are evaluated under CampCareer methodology v1. OSCA 381231 / ANZSCO 341111 are exact Electrician (General) mappings; ANZSCO 3411 Electricians is an explicit broader proxy only where official wage, historical employment, vacancy, industry or projection statistics are not published at exact six-digit level.',
 '2026-08-14')
on conflict (profile_key) do update set
 country_code=excluded.country_code,canonical_occupation_id=excluded.canonical_occupation_id,currency=excluded.currency,
 decision_ready=excluded.decision_ready,decision_readiness_reason=excluded.decision_readiness_reason,
 source_checked_on=excluded.source_checked_on,updated_at=now();

insert into public.career_official_sources
(source_key,authority,title,url,source_type,last_verified_on,notes)
values
('au-abs-osca-electrician-2024','Australian Bureau of Statistics','OSCA 2024 v1 - Electrician (General) 381231','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/381/3812/381231','official_primary','2026-08-14','Primary current Australian occupation mapping; ABS states registration or licensing is required.'),
('au-abs-anzsco-2022','Australian Bureau of Statistics','ANZSCO latest release','https://www.abs.gov.au/statistics/classifications/australian-and-new-zealand-standard-classification-occupations/latest-release','official_primary','2026-08-14','Companion classification retained because current labour-market and migration series still publish ANZSCO occupation statistics.'),
('au-jsa-occupation-341111','Jobs and Skills Australia','Occupation profile - Electricians (General) 341111','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/341111-electricians-general','government_aggregator','2026-08-14','Exact six-digit companion profile; exact median earnings are not published.'),
('au-jsa-occupation-3411','Jobs and Skills Australia','Occupation profile - Electricians 3411','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3411-electricians','government_aggregator','2026-08-14','Broader official unit group used only where exact Electrician (General) metrics are unavailable.'),
('au-jsa-osl-2025','Jobs and Skills Australia','2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage','government_aggregator','2026-08-14','Official six-digit shortage assessment; Electrician (General) is Shortage nationally and in every state/territory row.'),
('au-jsa-ivi-2026','Jobs and Skills Australia','Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','government_aggregator','2026-08-14','Official monthly online job-ad series. ANZSCO 3411 is broader than exact Electrician (General), and the series is not a deduplicated 90-day vacancy numerator.'),
('au-yourcareer-matrix-2025','Australian Government Your Career','Australian Jobs 2025 Occupation Matrix','https://www.yourcareer.gov.au/resources/australian-jobs-report/occupation-matrix-tables','government_aggregator','2026-08-14','Official five-year historical occupation employment change used for momentum.'),
('au-abs-lfs-detailed','Australian Bureau of Statistics','Labour Force, Australia, Detailed','https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia-detailed/latest-release','official_primary','2026-08-14','Official national employment benchmark for actual momentum.'),
('au-jsa-projections-2025-2035','Jobs and Skills Australia','Employment Projections - May 2025 to May 2035','https://www.jobsandskills.gov.au/data/employment-projections','government_aggregator','2026-08-14','Official occupation and national employment projections.'),
('au-training-uee30820','Australian Government National Training Register','UEE30820 Certificate III in Electrotechnology Electrician','https://training.gov.au/training/details/UEE30820','official_primary','2026-08-14','Current national qualification mapped to Electrician (General); no formal qualification entry requirements.'),
('au-australian-apprenticeships','Australian Government','Australian Apprenticeships','https://www.apprenticeships.gov.au/','official_primary','2026-08-14','Government apprenticeship pathway; employment-linked training supports earn-while-you-learn treatment.'),
('au-homeaffairs-skilled-occupation-341111','Australian Government Department of Home Affairs','Skilled occupation list - Electrician (General) 341111','https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list?srckeyword=341111','official_primary','2026-08-14','Lists Electrician (General) for multiple skilled migration routes and TRA as assessing authority.'),
('au-homeaffairs-189','Australian Government Department of Home Affairs','Skilled Independent visa (subclass 189)','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189','official_primary','2026-08-14','Permanent points-tested skilled route without employer sponsorship.'),
('au-homeaffairs-skillselect-2026','Australian Government Department of Home Affairs','SkillSelect invitation rounds','https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds','official_primary','2026-08-14','Electrician (General) appeared in the 4 June 2026 subclass 189 invitation round at 65 points.'),
('au-homeaffairs-482','Australian Government Department of Home Affairs','Skills in Demand visa (subclass 482)','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482','official_primary','2026-08-14','Employer-sponsored secondary skilled-work pathway.'),
('au-tra-osap-electrician','Trades Recognition Australia','OSAP nominated occupations - Electrician (General)','https://www.tradesrecognitionaustralia.gov.au/osap-nominated-occupations-countries-and-sars','official_primary','2026-08-14','Electrician (General) 341111 is subject to OSAP for applicants from all countries, subject to published pathway exceptions.'),
('au-tra-electrician-licensing','Trades Recognition Australia','Licensing for licensed trades','https://www.tradesrecognitionaustralia.gov.au/licensing','official_primary','2026-08-14','Official overseas trade recognition and licensing pathway evidence.'),
('au-training-11297nat','Australian Government National Training Register','11297NAT Course in Electrician - Minimum Australian Context Gap','https://training.gov.au/training/details/11297NAT','official_primary','2026-08-14','Current Australian context gap course for eligible overseas-trained electricians.'),
('au-nsw-electrical-licensing','NSW Government','Electrical licences and certificates','https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/electrical','official_primary','2026-08-14','NSW requires an electrical licence or certificate before electrical wiring work.'),
('au-vic-international-electrician','Energy Safe Victoria','International electrical workers','https://www.energysafe.vic.gov.au/licensing/electrical-licences/interstate-and-international-workers/international-electrical-workers','official_primary','2026-08-14','Jurisdictional example of supervised work, gap training and assessment before a full electrician licence.'),
('au-workforce-australia-electrician','Australian Government Workforce Australia','Find a job - Electrician','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=electrician','official_service','2026-08-14','Government live job-search entry point; individual listings are not Vacancy Score observations.')
on conflict (source_key) do update set
 authority=excluded.authority,title=excluded.title,url=excluded.url,source_type=excluded.source_type,
 last_verified_on=excluded.last_verified_on,notes=excluded.notes;

insert into public.career_occupation_mappings
(mapping_key,profile_key,canonical_occupation_id,country_code,official_taxonomy,official_taxonomy_version,official_code,official_title,mapping_relation,mapping_quality,rationale,source_key,source_url,verified_on,is_primary)
values
('AU:electrician:OSCA:381231','AU:electrician','electrician','AU','OSCA','2024 v1','381231','Electrician (General)','exact','high','Current ABS OSCA exact occupation.','au-abs-osca-electrician-2024','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/3/38/381/3812/381231','2026-08-14',true),
('AU:electrician:ANZSCO:341111','AU:electrician','electrician','AU','ANZSCO','2022','341111','Electrician (General)','exact','high','Exact companion ANZSCO occupation used by JSA and skilled-migration sources.','au-jsa-occupation-341111','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/341111-electricians-general','2026-08-14',false),
('AU:electrician:ANZSCO:3411','AU:electrician','electrician','AU','ANZSCO','2022','3411','Electricians','broader','medium','Used only when the required official labour-market statistic is not published separately for Electrician (General) 341111.','au-jsa-occupation-3411','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/3411-electricians','2026-08-14',false)
on conflict (mapping_key) do update set
 profile_key=excluded.profile_key,canonical_occupation_id=excluded.canonical_occupation_id,country_code=excluded.country_code,
 official_taxonomy=excluded.official_taxonomy,official_taxonomy_version=excluded.official_taxonomy_version,
 official_code=excluded.official_code,official_title=excluded.official_title,mapping_relation=excluded.mapping_relation,
 mapping_quality=excluded.mapping_quality,rationale=excluded.rationale,source_key=excluded.source_key,
 source_url=excluded.source_url,verified_on=excluded.verified_on,is_primary=excluded.is_primary;

insert into public.career_raw_observations
(observation_key,profile_key,mapping_key,source_key,metric_key,reference_period,as_of_date,raw_value,unit,availability,reason,directness,mapping_quality,proxy_reason,source_type,quality,confidence,last_verified_on,explanation)
values
('au-electrician-shortage-2025','AU:electrician','AU:electrician:ANZSCO:341111','au-jsa-osl-2025','national_shortage_signal','2025 OSL','2025-10-01',jsonb_build_object('Australia','S','ACT','S','NSW','S','NT','S','QLD','S','SA','S','TAS','S','VIC','S','WA','S','normalized_severity','shortage','scope','national'),'status','available',null,'direct','high',null,'government_aggregator','high',0.94,'2026-08-14','Exact 341111 row is Shortage nationally; national shortage maps to 12 points.'),
('au-electricians-employment-2026','AU:electrician','AU:electrician:ANZSCO:3411','au-jsa-occupation-3411','proxy_employment_total','February 2026 JSA trend','2026-02-01',to_jsonb(197300),'persons','available',null,'proxy','medium','Current Labour Force Survey employment stock is published at broader ANZSCO 3411.','government_aggregator','high',0.90,'2026-08-14','Broader 3411 employment stock used only as vacancy context and labour-market baseline.'),
('au-electricians-ivi-june-2026','AU:electrician','AU:electrician:ANZSCO:3411','au-jsa-ivi-2026','national_vacancy_intensity','June 2026 IVI occupation series','2026-06-30',jsonb_build_object('occupation_series','3411','clean_distinct_90_day_numerator',false,'persistence_supported',false,'source_quality','official_partial'),'online_job_advertisement_evidence','available','The IVI is monthly online-ad activity, not a deduplicated distinct 90-day vacancy numerator.','proxy','medium','Public occupation detail is ANZSCO four-digit 3411, broader than exact 341111.','government_aggregator','medium',0.74,'2026-08-14','Conservative vacancy fallback uses low intensity 3 and no persistence bonus.'),
('au-electricians-industry-2025','AU:electrician','AU:electrician:ANZSCO:3411','au-jsa-occupation-3411','industry_employment_distribution','2025 four-quarter average','2025-12-31',jsonb_build_object('published_industries',jsonb_build_array('Construction','Mining','Electricity, Gas, Water and Waste Services'),'shares_available',false,'suppression_rule','industries below 5 percent are suppressed'),'industries','available','Occupation-by-industry employment shares needed for HHI are not published.','proxy','medium','The official broader profile ranks industries but does not publish usable shares.','government_aggregator','medium',0.74,'2026-08-14','No industry shares are invented; insufficient coverage maps conservatively to 0.'),
('au-electricians-growth-2019-2024','AU:electrician','AU:electrician:ANZSCO:3411','au-yourcareer-matrix-2025','actual_employment_growth_5y','November 2019 to November 2024','2024-11-30',jsonb_build_object('end_employment',185200,'change',30400,'change_pct',19.6,'years',5),'persons','available',null,'proxy','medium','Five-year history is published at broader ANZSCO 3411.','government_aggregator','high',0.90,'2026-08-14','Australian Jobs 2025 reports 185.2k employed and +19.6% five-year change.'),
('au-all-employment-nov-2019-electrician','AU:electrician',null,'au-abs-lfs-detailed','actual_all_employment','November 2019 trend','2019-11-30',to_jsonb(12898900),'persons','available',null,'direct','not_applicable',null,'official_primary','high',0.97,'2026-08-14','National employment start benchmark.'),
('au-all-employment-nov-2024-electrician','AU:electrician',null,'au-abs-lfs-detailed','actual_all_employment','November 2024 trend','2024-11-30',to_jsonb(14495900),'persons','available',null,'direct','not_applicable',null,'official_primary','high',0.97,'2026-08-14','National employment end benchmark.'),
('au-electrician-qualification-entry','AU:electrician','AU:electrician:ANZSCO:341111','au-training-uee30820','entry_education_training','Current UEE30820','2026-08-14',jsonb_build_object('qualification','UEE30820 Certificate III in Electrotechnology Electrician','entry_requirements','none','apprenticeship_pathway',true),'qualification','available',null,'proxy','high','CampCareer converts official qualification-entry evidence into the frozen Entry Accessibility rubric.','official_primary','high',0.94,'2026-08-14','UEE30820 has no formal qualification entry requirements and supports the unrestricted-licence training pathway.'),
('au-electrician-paid-apprenticeship','AU:electrician','AU:electrician:ANZSCO:341111','au-australian-apprenticeships','paid_training_structure','Current Australian Apprenticeships structure','2026-08-14',jsonb_build_object('employment_linked',true,'paid_on_the_job_training',true,'formal_study',true),'apprenticeship','available',null,'proxy','high','Government apprenticeship structure supports earn-while-you-learn scoring rather than treating the full training duration as unpaid pre-entry study.','official_primary','high',0.90,'2026-08-14','Paid employment-linked structured training supports 4/5 training points.'),
('au-electricians-hourly-wage-2025','AU:electrician','AU:electrician:ANZSCO:3411','au-jsa-occupation-3411','median_hourly_wage','May 2025','2025-05-01',to_jsonb(55),'AUD_per_hour','available',null,'proxy','medium','Exact 341111 median earnings are not published; 3411 official median is used.','government_aggregator','high',0.90,'2026-08-14','Median hourly earnings for broader Electricians.'),
('au-all-hourly-wage-2025-electrician','AU:electrician',null,'au-jsa-occupation-3411','all_occupations_median_hourly_wage','May 2025','2025-05-01',to_jsonb(47),'AUD_per_hour','available',null,'direct','not_applicable',null,'government_aggregator','high',0.97,'2026-08-14','Same-source all-occupations hourly median.'),
('au-electricians-projection-2025-2035','AU:electrician','AU:electrician:ANZSCO:3411','au-jsa-projections-2025-2035','projected_occupation_employment_levels','May 2025 to May 2035','2025-05-01',jsonb_build_object('employment_2025',194917,'employment_2035',218278,'years',10),'persons','available',null,'proxy','medium','Official projection is at broader ANZSCO 3411.','government_aggregator','medium',0.85,'2026-08-14','JSA projection: 194,917 to 218,278.'),
('au-all-projection-2025-2035-electrician','AU:electrician',null,'au-jsa-projections-2025-2035','projected_all_employment_levels','May 2025 to May 2035','2025-05-01',jsonb_build_object('employment_2025',14701000,'employment_2035',16655500,'years',10),'persons','available',null,'direct','not_applicable',null,'government_aggregator','high',0.98,'2026-08-14','JSA national projection benchmark.'),
('au-electrician-visa-189','AU:electrician','AU:electrician:ANZSCO:341111','au-homeaffairs-skillselect-2026','visa_accessibility','4 June 2026 SkillSelect round','2026-06-04',jsonb_build_object('route','subclass 189','occupation_code','341111','minimum_points',65,'employer_sponsorship_required',false,'permanent',true),'visa_pathway','available',null,'proxy','high','Occupation-level route evidence is converted into the frozen visa rubric; personal eligibility is separate.','official_primary','high',0.92,'2026-08-14','Electrician (General) was invited for subclass 189 at 65 points.'),
('au-electrician-tra-osap','AU:electrician','AU:electrician:ANZSCO:341111','au-tra-osap-electrician','skills_assessment_requirement','Current OSAP occupation list','2026-08-14',jsonb_build_object('occupation_code','341111','assessment_authority','TRA','osap_all_countries',true,'published_exceptions','482/485 pathway caveats'),'skills_assessment','available',null,'direct','high',null,'official_primary','high',0.95,'2026-08-14','Material skills-assessment burden retained in Visa Accessibility and licensing evidence.'),
('au-electrician-licensing-general','AU:electrician','AU:electrician:OSCA:381231','au-abs-osca-electrician-2024','occupational_licensing_requirement','OSCA 2024 v1','2026-08-14',jsonb_build_object('registration_or_licensing_required',true,'licence_issue_level','state_or_territory'),'regulatory_evidence','available',null,'direct','high',null,'official_primary','high',0.98,'2026-08-14','ABS classification states registration or licensing is required; it does not imply one national licence.'),
('au-electrician-overseas-licensing-path','AU:electrician','AU:electrician:ANZSCO:341111','au-tra-electrician-licensing','overseas_licensing_pathway','Current TRA licensed-trade pathway','2026-08-14',jsonb_build_object('steps',jsonb_build_array('OSAP/OTSR','provisional or supervised licence','Australian context gap training','Australian VET qualification','full occupational licence'),'immediate_full_licence',false),'regulatory_evidence','available',null,'proxy','high','TRA pathway applies to overseas-trained licensed-trade applicants and is mapped to acquisition-difficulty burden.','official_primary','high',0.94,'2026-08-14','Overseas-trained applicants do not generally move directly from overseas qualification to unrestricted practice.')
on conflict (observation_key) do update set
 profile_key=excluded.profile_key,mapping_key=excluded.mapping_key,source_key=excluded.source_key,metric_key=excluded.metric_key,
 reference_period=excluded.reference_period,as_of_date=excluded.as_of_date,raw_value=excluded.raw_value,unit=excluded.unit,
 availability=excluded.availability,reason=excluded.reason,directness=excluded.directness,mapping_quality=excluded.mapping_quality,
 proxy_reason=excluded.proxy_reason,source_type=excluded.source_type,quality=excluded.quality,confidence=excluded.confidence,
 last_verified_on=excluded.last_verified_on,explanation=excluded.explanation;

insert into public.career_normalized_metrics
(normalized_metric_key,profile_key,metric_key,input_observation_refs,normalized_value,normalized_unit,formula_version,availability,reason,directness,mapping_quality,proxy_reason,source_type,quality,confidence,explanation)
values
('AU:electrician:shortage_points_v1','AU:electrician','shortage_points',array['au-electrician-shortage-2025'],12,'points','normalize-shortage-v1','available',null,'direct','high',null,'government_aggregator','high',0.94,'Shortage severity 12 × national scope 1.00 = 12.'),
('AU:electrician:vacancy_fallback_points_v1','AU:electrician','vacancy_fallback_points',array['au-electricians-ivi-june-2026','au-electricians-employment-2026'],3,'points','normalize-vacancy-90d-v1','available','No clean distinct 90-day numerator or directly captured occupation persistence comparator exists.','proxy','medium','3411 is broader and IVI monthly activity is not a distinct 90-day numerator.','government_aggregator','medium',0.72,'Low fallback intensity 3 + persistence 0 = 3.'),
('AU:electrician:industry_diversity_points_v1','AU:electrician','industry_diversity_points',array['au-electricians-industry-2025'],0,'points','normalize-industry-diversity-v1','available','Comparable broad-sector occupation employment shares are not published.','proxy','medium','Official profile ranks industries but does not publish usable shares for HHI.','government_aggregator','medium',0.72,'Conservative 0 with insufficient_industry_coverage; not a claim of maximum concentration.'),
('AU:electrician:employment_momentum_excess_cagr_pp_v1','AU:electrician','employment_momentum_excess_cagr_pp',array['au-electricians-growth-2019-2024','au-all-employment-nov-2019-electrician','au-all-employment-nov-2024-electrician'],1.282555604065072,'percentage_points_per_year','normalize-employment-momentum-v1','available',null,'proxy','medium','Occupation history is available at broader ANZSCO 3411.','government_aggregator','high',0.86,'19.6% five-year occupation growth implies about 3.6445%/yr versus national 2.3619%/yr; excess about +1.2826pp/yr.'),
('AU:electrician:entry_accessibility_points_v1','AU:electrician','entry_accessibility_points',array['au-electrician-qualification-entry','au-electrician-paid-apprenticeship'],14,'points','normalize-entry-accessibility-v1','available',null,'proxy','high','CampCareer rubric built from official qualification-entry and apprenticeship evidence.','official_primary','high',0.90,'Education 7 + no prior related experience required 3 + paid employment-linked structured training 4 = 14.'),
('AU:electrician:relative_salary_ratio_v1','AU:electrician','relative_salary_ratio',array['au-electricians-hourly-wage-2025','au-all-hourly-wage-2025-electrician'],1.1702127659574468,'ratio','normalize-relative-salary-v1','available',null,'proxy','medium','Exact 341111 median earnings are unavailable; 3411 official median is the broader proxy.','government_aggregator','high',0.90,'AUD55 / AUD47 = 1.1702127659574468.'),
('AU:electrician:projected_growth_excess_cagr_pp_v1','AU:electrician','projected_growth_excess_cagr_pp',array['au-electricians-projection-2025-2035','au-all-projection-2025-2035-electrician'],-0.11768549129480554,'percentage_points_per_year','normalize-projected-growth-v1','available',null,'proxy','medium','Official occupation projection is available at broader ANZSCO 3411.','government_aggregator','medium',0.84,'Occupation projected CAGR about 1.1384%/yr versus national 1.2561%/yr; excess about -0.1177pp/yr.'),
('AU:electrician:visa_accessibility_points_v1','AU:electrician','visa_accessibility_points',array['au-electrician-visa-189','au-electrician-tra-osap'],9,'points','normalize-visa-accessibility-v1','available',null,'proxy','high','Official skilled migration and skills-assessment evidence are converted into the frozen occupation-level rubric; not personal visa advice.','official_primary','high',0.90,'Subclass 189: applicability 3 + employer independence 3 + eligibility burden 1 + permanent pathway 2 = 9.'),
('AU:electrician:entry_burden_points_v1','AU:electrician','entry_burden_points',array['au-electrician-licensing-general','au-electrician-overseas-licensing-path'],0,'points','normalize-entry-burden-v1','available',null,'proxy','high','Occupational licensing is broadly required and overseas acquisition requires multiple recognition/training/licensing steps.','official_primary','high',0.91,'5 - geographic scope burden 2 - legal requirement burden 1.5 - acquisition difficulty burden 1.5 = 0.')
on conflict (normalized_metric_key) do update set
 profile_key=excluded.profile_key,metric_key=excluded.metric_key,input_observation_refs=excluded.input_observation_refs,
 normalized_value=excluded.normalized_value,normalized_unit=excluded.normalized_unit,formula_version=excluded.formula_version,
 availability=excluded.availability,reason=excluded.reason,directness=excluded.directness,mapping_quality=excluded.mapping_quality,
 proxy_reason=excluded.proxy_reason,source_type=excluded.source_type,quality=excluded.quality,confidence=excluded.confidence,
 explanation=excluded.explanation,calculated_at=now();

insert into public.career_normalized_metric_inputs
(normalized_metric_key,observation_key,input_role,usage_type)
values
('AU:electrician:shortage_points_v1','au-electrician-shortage-2025','official_shortage_assessment','policy_evidence'),
('AU:electrician:vacancy_fallback_points_v1','au-electricians-ivi-june-2026','fallback_market_evidence','fallback_evidence'),
('AU:electrician:vacancy_fallback_points_v1','au-electricians-employment-2026','employment_denominator_context','benchmark'),
('AU:electrician:industry_diversity_points_v1','au-electricians-industry-2025','industry_coverage_evidence','input'),
('AU:electrician:employment_momentum_excess_cagr_pp_v1','au-electricians-growth-2019-2024','occupation_growth','input'),
('AU:electrician:employment_momentum_excess_cagr_pp_v1','au-all-employment-nov-2019-electrician','country_start_employment','benchmark'),
('AU:electrician:employment_momentum_excess_cagr_pp_v1','au-all-employment-nov-2024-electrician','country_end_employment','benchmark'),
('AU:electrician:entry_accessibility_points_v1','au-electrician-qualification-entry','entry_education','input'),
('AU:electrician:entry_accessibility_points_v1','au-electrician-paid-apprenticeship','earning_structure','input'),
('AU:electrician:relative_salary_ratio_v1','au-electricians-hourly-wage-2025','occupation_value','input'),
('AU:electrician:relative_salary_ratio_v1','au-all-hourly-wage-2025-electrician','country_benchmark','benchmark'),
('AU:electrician:projected_growth_excess_cagr_pp_v1','au-electricians-projection-2025-2035','occupation_projection','input'),
('AU:electrician:projected_growth_excess_cagr_pp_v1','au-all-projection-2025-2035-electrician','country_projection_benchmark','benchmark'),
('AU:electrician:visa_accessibility_points_v1','au-electrician-visa-189','primary_pathway','policy_evidence'),
('AU:electrician:visa_accessibility_points_v1','au-electrician-tra-osap','skills_assessment','policy_evidence'),
('AU:electrician:entry_burden_points_v1','au-electrician-licensing-general','occupational_license_requirement','policy_evidence'),
('AU:electrician:entry_burden_points_v1','au-electrician-overseas-licensing-path','acquisition_pathway','policy_evidence')
on conflict do nothing;

insert into public.career_opportunity_score_snapshots
(snapshot_key,profile_key,as_of_date,formula_version,required_component_keys,explanation)
values
('AU:electrician:2026-08-14:v1','AU:electrician','2026-08-14','career-opportunity-v4-foundation',
 array['shortage_signal','vacancy_intensity','industry_diversity','employment_momentum','entry_accessibility','relative_salary','projected_growth','visa_accessibility','entry_burden'],
 'Australia Electrician (General) under frozen methodology v1; broader ANZSCO 3411 proxy use is explicit and licensing burden is independently modelled.')
on conflict (snapshot_key) do update set
 formula_version=excluded.formula_version,required_component_keys=excluded.required_component_keys,explanation=excluded.explanation;

insert into public.career_score_components
(snapshot_key,profile_key,component_key,raw_input_refs,normalized_metric_refs,normalized_value,formula_version,availability,directness,mapping_quality,proxy_reason,source_type,quality,confidence,explanation,reason,evidence_status)
values
('AU:electrician:2026-08-14:v1','AU:electrician','shortage_signal',array['au-electrician-shortage-2025'],array['AU:electrician:shortage_points_v1'],12,'career-opportunity-v4-foundation','available','direct','high',null,'government_aggregator','high',0.94,'Official national Shortage maps to 12.',null,'direct_verified'),
('AU:electrician:2026-08-14:v1','AU:electrician','vacancy_intensity',array['au-electricians-ivi-june-2026','au-electricians-employment-2026'],array['AU:electrician:vacancy_fallback_points_v1'],3,'career-opportunity-v4-foundation','available','proxy','medium','Official 3411 IVI evidence is broader and not a clean distinct 90-day numerator.','government_aggregator','medium',0.72,'Conservative vacancy fallback = 3.','No clean distinct 90-day Electrician (General) numerator or captured persistence comparator is published.','fallback'),
('AU:electrician:2026-08-14:v1','AU:electrician','industry_diversity',array['au-electricians-industry-2025'],array['AU:electrician:industry_diversity_points_v1'],0,'career-opportunity-v4-foundation','available','proxy','medium','Official 3411 profile lacks comparable occupation employment shares for HHI.','government_aggregator','medium',0.72,'Conservative zero preserves insufficient-coverage semantics.','Comparable broad-sector employment shares are unavailable.','insufficient_industry_coverage'),
('AU:electrician:2026-08-14:v1','AU:electrician','employment_momentum',array['au-electricians-growth-2019-2024','au-all-employment-nov-2019-electrician','au-all-employment-nov-2024-electrician'],array['AU:electrician:employment_momentum_excess_cagr_pp_v1'],1.282555604065072,'career-opportunity-v4-foundation','available','proxy','medium','Five-year occupation history is published at broader ANZSCO 3411.','government_aggregator','high',0.86,'Actual excess CAGR score = 8.21.',null,'derived'),
('AU:electrician:2026-08-14:v1','AU:electrician','entry_accessibility',array['au-electrician-qualification-entry','au-electrician-paid-apprenticeship'],array['AU:electrician:entry_accessibility_points_v1'],14,'career-opportunity-v4-foundation','available','proxy','high','CampCareer rubric from official entry/training evidence; licensing is scored separately in Entry Burden.','official_primary','high',0.90,'7 + 3 + 4 = 14.',null,'proxy'),
('AU:electrician:2026-08-14:v1','AU:electrician','relative_salary',array['au-electricians-hourly-wage-2025','au-all-hourly-wage-2025-electrician'],array['AU:electrician:relative_salary_ratio_v1'],1.1702127659574468,'career-opportunity-v4-foundation','available','proxy','medium','Exact 341111 wage is unavailable; 3411 is the official broader proxy.','government_aggregator','high',0.90,'AUD55 / AUD47; score = 6.70.',null,'derived'),
('AU:electrician:2026-08-14:v1','AU:electrician','projected_growth',array['au-electricians-projection-2025-2035','au-all-projection-2025-2035-electrician'],array['AU:electrician:projected_growth_excess_cagr_pp_v1'],-0.11768549129480554,'career-opportunity-v4-foundation','available','proxy','medium','Official projection is at broader ANZSCO 3411.','government_aggregator','medium',0.84,'Projected excess CAGR score = 4.71.',null,'derived'),
('AU:electrician:2026-08-14:v1','AU:electrician','visa_accessibility',array['au-electrician-visa-189','au-electrician-tra-osap'],array['AU:electrician:visa_accessibility_points_v1'],9,'career-opportunity-v4-foundation','available','proxy','high','Occupation-level CampCareer visa rubric; personal eligibility is separate.','official_primary','high',0.90,'Subclass 189 = 9/10.',null,'proxy'),
('AU:electrician:2026-08-14:v1','AU:electrician','entry_burden',array['au-electrician-licensing-general','au-electrician-overseas-licensing-path'],array['AU:electrician:entry_burden_points_v1'],0,'career-opportunity-v4-foundation','available','proxy','high','Electrician occupational licensing and overseas recognition/training burden are material and broadly applicable.','official_primary','high',0.91,'5 - 2 - 1.5 - 1.5 = 0.',null,'proxy')
on conflict (snapshot_key,component_key) do update set
 raw_input_refs=excluded.raw_input_refs,normalized_metric_refs=excluded.normalized_metric_refs,normalized_value=excluded.normalized_value,
 formula_version=excluded.formula_version,availability=excluded.availability,directness=excluded.directness,mapping_quality=excluded.mapping_quality,
 proxy_reason=excluded.proxy_reason,source_type=excluded.source_type,quality=excluded.quality,confidence=excluded.confidence,
 explanation=excluded.explanation,reason=excluded.reason,evidence_status=excluded.evidence_status,calculated_at=now();

insert into public.career_score_component_metric_inputs
(snapshot_key,component_key,normalized_metric_key,input_role)
values
('AU:electrician:2026-08-14:v1','shortage_signal','AU:electrician:shortage_points_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','vacancy_intensity','AU:electrician:vacancy_fallback_points_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','industry_diversity','AU:electrician:industry_diversity_points_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','employment_momentum','AU:electrician:employment_momentum_excess_cagr_pp_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','entry_accessibility','AU:electrician:entry_accessibility_points_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','relative_salary','AU:electrician:relative_salary_ratio_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','projected_growth','AU:electrician:projected_growth_excess_cagr_pp_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','visa_accessibility','AU:electrician:visa_accessibility_points_v1','scored_metric'),
('AU:electrician:2026-08-14:v1','entry_burden','AU:electrician:entry_burden_points_v1','scored_metric')
on conflict do nothing;

insert into public.career_score_component_raw_inputs
(snapshot_key,component_key,observation_key,input_role)
select 'AU:electrician:2026-08-14:v1',m.component_key,n.observation_key,n.input_role
from public.career_score_component_metric_inputs m
join public.career_normalized_metric_inputs n on n.normalized_metric_key=m.normalized_metric_key
where m.snapshot_key='AU:electrician:2026-08-14:v1'
on conflict do nothing;

insert into public.career_foundation_visa_pathways
(pathway_key,profile_key,route_role,pathway_name,source_key,official_source_url,occupation_applicability_points,employer_dependency_points,eligibility_burden_points,long_term_pathway_points,used_for_primary_score,applicability_scope,last_verified_on,notes)
values
('AU:electrician:189','AU:electrician','primary','Skilled Independent visa (subclass 189)','au-homeaffairs-189','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189',3,3,1,2,true,'General skilled migration; invitation, points and TRA skills-assessment requirements remain individual.','2026-08-14','Permanent, non-employer-sponsored representative pathway; Electrician (General) appeared in the 4 June 2026 invitation round.'),
('AU:electrician:482','AU:electrician','secondary','Skills in Demand visa (subclass 482)','au-homeaffairs-482','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482',2,1,1,1,false,'Employer-sponsored secondary pathway; nomination and stream eligibility must be checked.','2026-08-14','Secondary route-breadth evidence only; not added to the primary pathway score.')
on conflict (pathway_key) do update set
 route_role=excluded.route_role,pathway_name=excluded.pathway_name,source_key=excluded.source_key,official_source_url=excluded.official_source_url,
 occupation_applicability_points=excluded.occupation_applicability_points,employer_dependency_points=excluded.employer_dependency_points,
 eligibility_burden_points=excluded.eligibility_burden_points,long_term_pathway_points=excluded.long_term_pathway_points,
 used_for_primary_score=excluded.used_for_primary_score,applicability_scope=excluded.applicability_scope,
 last_verified_on=excluded.last_verified_on,notes=excluded.notes;

insert into public.career_foundation_licensing_evidence
(evidence_key,profile_key,mapping_key,jurisdiction_code,jurisdiction_name,jurisdiction_level,requirement_type,mandatory,applies_to,authority,source_key,official_source_url,verified_on,cost_amount,cost_currency,expected_duration_days,exceptions,evidence_quality,notes)
values
('AU:electrician:NSW:occupational','AU:electrician','AU:electrician:OSCA:381231','NSW','New South Wales','state','occupational_license',true,'employee','NSW Government / Fair Trading','au-nsw-electrical-licensing','https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/electrical','2026-08-14',null,null,null,'Licence class/pathway depends on qualification and applicant status.','high','Electrical wiring work requires a licence or certificate; this is employee occupational regulation, not merely contractor licensing.'),
('AU:electrician:VIC:international','AU:electrician','AU:electrician:OSCA:381231','VIC','Victoria','state','occupational_license',true,'employee','Energy Safe Victoria','au-vic-international-electrician','https://www.energysafe.vic.gov.au/licensing/electrical-licences/interstate-and-international-workers/international-electrical-workers','2026-08-14',null,null,null,'International pathway includes supervised work, gap training and licensing assessment; exact requirements are jurisdiction-specific.','high','Concrete jurisdictional evidence of substantial acquisition burden for overseas-trained electricians.')
on conflict (evidence_key) do update set
 mapping_key=excluded.mapping_key,jurisdiction_code=excluded.jurisdiction_code,jurisdiction_name=excluded.jurisdiction_name,
 jurisdiction_level=excluded.jurisdiction_level,requirement_type=excluded.requirement_type,mandatory=excluded.mandatory,
 applies_to=excluded.applies_to,authority=excluded.authority,source_key=excluded.source_key,official_source_url=excluded.official_source_url,
 verified_on=excluded.verified_on,cost_amount=excluded.cost_amount,cost_currency=excluded.cost_currency,
 expected_duration_days=excluded.expected_duration_days,exceptions=excluded.exceptions,evidence_quality=excluded.evidence_quality,notes=excluded.notes;

insert into public.career_foundation_blockers
(blocker_key,profile_key,blocker_type,severity,reason,source_key,official_source_url,applicability_scope,last_verified_on,active)
values
('AU:electrician:work-rights','AU:electrician','work_rights','conditional','Australian work rights or an appropriate visa are required; the occupation-level score does not confirm personal eligibility.','au-homeaffairs-189','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189','Individual applicant','2026-08-14',true),
('AU:electrician:skills-assessment','AU:electrician','visa','conditional','Applicable skilled migration requires a suitable TRA skills assessment plus invitation/points criteria.','au-tra-osap-electrician','https://www.tradesrecognitionaustralia.gov.au/osap-nominated-occupations-countries-and-sars','Overseas-skilled applicants','2026-08-14',true),
('AU:electrician:licensing','AU:electrician','licensing','hard','Electrician work is occupationally licensed; the applicable state or territory licence must be obtained before unrestricted practice.','au-tra-electrician-licensing','https://www.tradesrecognitionaustralia.gov.au/licensing','State/territory and applicant pathway specific','2026-08-14',true),
('AU:electrician:gap-training','AU:electrician','licensing','conditional','Overseas-trained licensed-trade applicants may need Australian context gap training and supervised practice before a full licence.','au-training-11297nat','https://training.gov.au/training/details/11297NAT','Overseas-trained applicants following the OTSR/ATCS pathway','2026-08-14',true)
on conflict (blocker_key) do update set
 blocker_type=excluded.blocker_type,severity=excluded.severity,reason=excluded.reason,source_key=excluded.source_key,
 official_source_url=excluded.official_source_url,applicability_scope=excluded.applicability_scope,
 last_verified_on=excluded.last_verified_on,active=excluded.active;

insert into public.career_foundation_entry_points
(entry_point_key,profile_key,entry_type,label,provider,url,source_key,applicability_scope,last_verified_on,notes,sort_order)
values
('AU:electrician:jobs','AU:electrician','job_search','Search current Electrician jobs','Workforce Australia','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=electrician','au-workforce-australia-electrician','Australia','2026-08-14','Government live search; individual listings are examples only and not Vacancy Score observations.',10),
('AU:electrician:training','AU:electrician','apprenticeship','Certificate III in Electrotechnology Electrician / apprenticeship pathway','National Training Register','https://training.gov.au/training/details/UEE30820','au-training-uee30820','Australia','2026-08-14','Current national qualification and apprenticeship-linked pathway.',20),
('AU:electrician:skills-assessment-entry','AU:electrician','source','Check Electrician OSAP skills assessment','Trades Recognition Australia','https://www.tradesrecognitionaustralia.gov.au/osap-nominated-occupations-countries-and-sars','au-tra-osap-electrician','Overseas-skilled applicants','2026-08-14','Verify current assessing pathway and published exceptions before migration application.',30),
('AU:electrician:visa-189-entry','AU:electrician','visa','Skilled Independent visa (subclass 189)','Department of Home Affairs','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189','au-homeaffairs-189','Potential skilled-migration applicants','2026-08-14','Personal eligibility and invitation requirements are separate.',40),
('AU:electrician:licensing-check','AU:electrician','licensing_check','Check Electrician licensing pathway','Trades Recognition Australia / state regulators','https://www.tradesrecognitionaustralia.gov.au/licensing','au-tra-electrician-licensing','Target state/territory and applicant pathway','2026-08-14','State/territory licensing and overseas recognition steps must be checked before unrestricted practice.',50)
on conflict (entry_point_key) do update set
 entry_type=excluded.entry_type,label=excluded.label,provider=excluded.provider,url=excluded.url,source_key=excluded.source_key,
 applicability_scope=excluded.applicability_scope,last_verified_on=excluded.last_verified_on,notes=excluded.notes,sort_order=excluded.sort_order;;
