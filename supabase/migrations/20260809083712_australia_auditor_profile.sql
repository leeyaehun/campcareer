-- Australia Auditor profile.
-- Canonical scope is an umbrella across current OSCA 211231 External Auditor and 211232 Internal Auditor.
-- Legacy JSA six-digit profiles 221213 and 221214 are combined only where aggregation is valid.
-- Broader ANZSCO 2212 earnings, vacancy and projections remain contextual because the unit group also includes Company Secretaries and Corporate Treasurers.

update ingest.occupations_au
set shortage_rating = 5,
    on_csol = true,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA occupation profile/2025 OSL + current skilled occupation instruments',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2112/211231',
    last_verified = '2026-08-09',
    anzsco_v13 = '221213'
where anzsco_code = '211231' and occupation_en = 'External Auditor';

update ingest.occupations_au
set shortage_rating = null,
    on_csol = true,
    median_salary_aud = null,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA occupation profile/2025 OSL + current skilled occupation instruments',
    source_url = 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2112/211232',
    last_verified = '2026-08-09',
    anzsco_v13 = '221214'
where anzsco_code = '211232' and occupation_en = 'Internal Auditor';

update ingest.visa_occupation_status_au
set reviewed_at = now(), reviewer_note = 'Reviewed current OSCA 211231 External Auditor correspondence to ANZSCO 221213. Current migration instruments identify CPA Australia, CA ANZ or IPA as relevant assessing authorities for External Auditor.'
where osca_code = '211231' and anzsco_v13_code = '221213' and list_name = 'Core Skills Occupation List (CSOL)' and status = 'eligible';

update ingest.visa_occupation_status_au
set reviewed_at = now(), reviewer_note = 'Reviewed current OSCA 211232 Internal Auditor correspondence to ANZSCO 221214. Current migration instruments identify VETASSESS as the assessing authority; VETASSESS classifies Internal Auditor as Group A.'
where osca_code = '211232' and anzsco_v13_code = '221214' and list_name = 'Core Skills Occupation List (CSOL)' and status = 'eligible';

update public.courses_au set official_course_url = 'https://coursehandbook.mq.edu.au/2026/courses/c000014', official_url_status = 'verified', official_url_checked_at = now(), official_url_source = 'Provider 2026 course handbook, verified 2026-08-09' where institution_id = 'macquarie-university' and course_code = '099149E';
update public.courses_au set official_course_url = 'https://coursehandbook.mq.edu.au/2026/courses/c000083', official_url_status = 'verified', official_url_checked_at = now(), official_url_source = 'Provider 2026 course handbook, verified 2026-08-09' where institution_id = 'macquarie-university' and course_code = '099183C';

insert into public.country_occupation_profiles (profile_key,country_code,canonical_career_id,official_title,official_code_system,official_code_version,official_unit_group_code,currency,registration_required,registration_authority,registration_url,publication_status,source_checked_at,updated_at)
values ('AU:auditor','AU','auditor','Auditor (External and Internal)','OSCA','2024 v1.0','2112','AUD',true,'ASIC registration is required for certain statutory external company audits; migration skills assessment uses CPA Australia/CA ANZ/IPA for External Auditor 221213 and VETASSESS for Internal Auditor 221214','https://www.asic.gov.au/for-finance-professionals/company-auditors/','profile_ready','2026-08-09',now())
on conflict (profile_key) do update set official_title=excluded.official_title,official_code_system=excluded.official_code_system,official_code_version=excluded.official_code_version,official_unit_group_code=excluded.official_unit_group_code,currency=excluded.currency,registration_required=excluded.registration_required,registration_authority=excluded.registration_authority,registration_url=excluded.registration_url,publication_status=excluded.publication_status,source_checked_at=excluded.source_checked_at,updated_at=now();

insert into public.country_occupation_metric_snapshots (profile_key,as_of_date,employment_total,median_weekly_earnings,median_hourly_earnings,annualised_median_salary,all_occupations_median_weekly,part_time_share_pct,female_share_pct,median_age,average_full_time_hours,vacancies_three_month_avg,vacancy_period,vacancy_yoy_pct,employment_growth_5y_pct,employment_growth_10y_pct,shortage_component,vacancy_intensity_component,employer_diversity_component,vacancy_trend_component,entry_level_component,salary_component,growth_component,visa_component,entry_burden_component,opportunity_score,score_methodology_version,score_status,score_evidence,source_checked_at)
values ('AU:auditor','2026-05-01',18500,null,null,null,1852,14.32,51.59,null,42.35,689.33333,'2026-05-01',8.44,8.03,15.89,15,0,5,5,13,0,5,10,2,55,'career-opportunity-v1','provisional',jsonb_build_object(
'current_classification_scope','Current OSCA has no single six-digit Auditor occupation. CampCareer models the neutral canonical Auditor as the umbrella of OSCA 211231 External Auditor and 211232 Internal Auditor, both Skill Level 1 occupations in unit group 2112 Auditors.',
'exact_employment_aggregation',jsonb_build_object('external_auditor_221213',12500,'internal_auditor_221214',6000,'combined_employment_total',18500,'combined_part_time_share_pct_weighted',14.32,'combined_female_share_pct_weighted',51.59,'combined_average_full_time_hours_weighted',42.35,'data_as_at','2026-02-01','note','Employment totals and arithmetic-share/average fields can be aggregated from the two aligned six-digit JSA profiles. Median age is intentionally null because occupation medians cannot be validly combined into an umbrella median.'),
'broader_anzsco_2212_context',jsonb_build_object('employment_total',33100,'median_weekly_earnings_aud',2104,'median_hourly_earnings_aud',56,'part_time_share_pct',12,'female_share_pct',50,'median_age',40,'average_full_time_hours',43,'scope','ANZSCO 2212 Company Secretaries, Corporate Treasurers and Auditors; broader than the Auditor umbrella'),
'earnings_scope','JSA does not publish six-digit median earnings for 221213 External Auditor or 221214 Internal Auditor. Broader 2212 median earnings of A$2,104 per week and A$56 per hour are retained as context only, so salary receives zero points.',
'vacancy_scope','May 2026 IVI three-month-average vacancies are 689.33333 at broader ANZSCO 2212, compared with 635.66667 in May 2025, about +8.44% year on year. The unit group also contains Company Secretaries and Corporate Treasurers, so vacancy intensity is not scored and trend receives only partial credit.',
'projection_scope','JSA broader ANZSCO 2212 projections are +8.03% from May 2025 to May 2030 and +15.89% to May 2035. These receive partial growth credit because the unit group is broader than the two Auditor occupations.',
'shortage_note','The reviewed JSA 2025 OSL records External Auditor 211231 as a national shortage occupation and Internal Auditor 211232 as No Shortage nationally. The umbrella receives partial shortage credit rather than the maximum single-occupation shortage score. Region-level shortage is left null to avoid hiding the specialisation split.',
'visa_basis','Both audit branches have verified skilled-migration pathways. External Auditor 221213 is assessed by CPA Australia, CA ANZ or IPA; Internal Auditor 221214 is assessed by VETASSESS. Occupation-list inclusion and a positive skills assessment do not guarantee an individual visa outcome.',
'registration_basis','ASIC registration as a registered company auditor is required for certain statutory company audit work. Internal audit does not carry an equivalent universal statutory registration requirement. Because the canonical umbrella includes external audit, registration_required is true with this scope caveat.',
'entry_level_basis','Macquarie University Bachelor of Professional Accounting, CRICOS 099149E, is a three-year AQF Level 7 accounting degree. The Master of Professional Accounting, CRICOS 099183C, is an AQF Level 9 postgraduate route. Both provide professional accounting foundations relevant to audit work.',
'entry_burden_basis','Both OSCA audit occupations are Skill Level 1. External statutory practice can add ASIC registration and practical experience requirements; migration assessment also depends on nominated occupation and assessing authority. The umbrella therefore receives a relatively low entry-burden bonus.',
'employer_diversity_basis','Curated employer coverage spans Big Four professional services and large corporate internal-audit environments; replace with posting-level unique-employer counts when available.',
'score_note','Auditor receives partial shortage, vacancy-trend and growth credit because evidence is mixed or broader. Exact employment can be aggregated across the two six-digit audit occupations, but six-digit salary is unavailable. Both audit branches have verified migration assessment pathways.'),'2026-08-09')
on conflict (profile_key,as_of_date) do update set employment_total=excluded.employment_total,median_weekly_earnings=excluded.median_weekly_earnings,median_hourly_earnings=excluded.median_hourly_earnings,annualised_median_salary=excluded.annualised_median_salary,all_occupations_median_weekly=excluded.all_occupations_median_weekly,part_time_share_pct=excluded.part_time_share_pct,female_share_pct=excluded.female_share_pct,median_age=excluded.median_age,average_full_time_hours=excluded.average_full_time_hours,vacancies_three_month_avg=excluded.vacancies_three_month_avg,vacancy_period=excluded.vacancy_period,vacancy_yoy_pct=excluded.vacancy_yoy_pct,employment_growth_5y_pct=excluded.employment_growth_5y_pct,employment_growth_10y_pct=excluded.employment_growth_10y_pct,shortage_component=excluded.shortage_component,vacancy_intensity_component=excluded.vacancy_intensity_component,employer_diversity_component=excluded.employer_diversity_component,vacancy_trend_component=excluded.vacancy_trend_component,entry_level_component=excluded.entry_level_component,salary_component=excluded.salary_component,growth_component=excluded.growth_component,visa_component=excluded.visa_component,entry_burden_component=excluded.entry_burden_component,opportunity_score=excluded.opportunity_score,score_methodology_version=excluded.score_methodology_version,score_status=excluded.score_status,score_evidence=excluded.score_evidence,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_specialisations (profile_key,official_code,official_title,legacy_code_system,legacy_code_version,legacy_code,shortage_rating,visa_eligible,included_in_rollup,sort_order,source_url,source_checked_at) values
('AU:auditor','211231','External Auditor','ANZSCO','2013 v1.3','221213',5,true,true,1,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2112/211231','2026-08-09'),
('AU:auditor','211232','Internal Auditor','ANZSCO','2013 v1.3','221214',null,true,true,2,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2112/211232','2026-08-09')
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,legacy_code=excluded.legacy_code,shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,included_in_rollup=excluded.included_in_rollup,sort_order=excluded.sort_order,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
('AU:auditor','ACT','2026-05-01',null,21.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),('AU:auditor','NSW','2026-05-01',null,239.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),('AU:auditor','NT','2026-05-01',null,12,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),('AU:auditor','QLD','2026-05-01',null,137.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),('AU:auditor','SA','2026-05-01',null,46,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),('AU:auditor','TAS','2026-05-01',null,12,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),('AU:auditor','VIC','2026-05-01',null,152.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),('AU:auditor','WA','2026-05-01',null,68.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
('AU:auditor','job_search','SEEK — Auditor jobs','https://www.seek.com.au/auditor-jobs','private_job_board',null,1,'2026-08-09'),
('AU:auditor','job_search','Workforce Australia — Auditor search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=auditor','government_job_board',null,2,'2026-08-09'),
('AU:auditor','employer','Deloitte Australia — Careers','https://www.deloitte.com/au/en/careers.html','professional_services',null,1,'2026-08-09'),
('AU:auditor','employer','EY Australia — Careers','https://www.ey.com/en_au/careers','professional_services',null,2,'2026-08-09'),
('AU:auditor','employer','KPMG Australia — Careers','https://kpmg.com/au/en/home/careers.html','professional_services',null,3,'2026-08-09'),
('AU:auditor','employer','PwC Australia — Careers','https://www.pwc.com.au/careers.html','professional_services',null,4,'2026-08-09'),
('AU:auditor','employer','Commonwealth Bank — Careers','https://www.commbank.com.au/about-us/careers.html','financial_services',null,5,'2026-08-09'),
('AU:auditor','entry_program','ASIC — Company auditor registration','https://www.asic.gov.au/for-finance-professionals/company-auditors/','official_regulator',null,1,'2026-08-09'),
('AU:auditor','entry_program','VETASSESS — Internal Auditor skills assessment','https://www.vetassess.com.au/check-my-occupation/professional-occupations/internal-auditor','official_skills_assessment',null,2,'2026-08-09'),
('AU:auditor','entry_program','Macquarie — Bachelor of Professional Accounting','https://coursehandbook.mq.edu.au/2026/courses/c000014','university_program',null,3,'2026-08-09'),
('AU:auditor','entry_program','Macquarie — Master of Professional Accounting','https://coursehandbook.mq.edu.au/2026/courses/c000083','university_program',null,4,'2026-08-09'),
('AU:auditor','source','ABS OSCA — External Auditor 211231','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2112/211231','official_classification',null,1,'2026-08-09'),
('AU:auditor','source','ABS OSCA — Internal Auditor 211232','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/21/211/2112/211232','official_classification',null,2,'2026-08-09'),
('AU:auditor','source','JSA — External Auditors 221213','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/221213-external-auditors','official_labour_market',null,3,'2026-08-09'),
('AU:auditor','source','JSA — Internal Auditors 221214','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/221214-internal-auditors','official_labour_market',null,4,'2026-08-09'),
('AU:auditor','source','JSA — ANZSCO 2212 broader profile','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations/2212-company-secretaries-corporate-treasurers-and-auditors','official_labour_market',null,5,'2026-08-09'),
('AU:auditor','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,6,'2026-08-09'),
('AU:auditor','source','JSA — Employment Projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,7,'2026-08-09'),
('AU:auditor','source','JSA — 2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage','official_shortage',null,8,'2026-08-09'),
('AU:auditor','source','ASIC — Company auditors','https://www.asic.gov.au/for-finance-professionals/company-auditors/','official_regulator',null,9,'2026-08-09')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:auditor',concat('au-program:',id),'direct','2026-08-09' from public.courses_au where institution_id='macquarie-university' and course_code='099149E'
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;
insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:auditor',concat('au-program:',id),'graduate_entry','2026-08-09' from public.courses_au where institution_id='macquarie-university' and course_code='099183C'
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
