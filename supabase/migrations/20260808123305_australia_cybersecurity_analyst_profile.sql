update ingest.occupations_au
set anzsco_v13 = '262116',
    on_csol = true,
    confidence = 'official-profile-osl-csol',
    source_name = 'ABS OSCA 2024 v1.0 + JSA 2025 OSL + LIN 24/093 CSOL',
    source_url = 'https://www.legislation.gov.au/F2024L01618/latest/text',
    last_verified = '2026-08-08'
where anzsco_code = '271133'
  and occupation_en = 'Cyber Security Analyst';

insert into ingest.visa_occupation_status_au (
  osca_code, anzsco_v13_code, list_name, visa_stream, status,
  effective_from, effective_to, source_url, retrieved_at, reviewed_at, reviewer_note
)
select
  '271133', '262116', 'Core Skills Occupation List (CSOL)',
  'Check current Home Affairs visa instrument', 'eligible',
  '2024-12-07', null,
  'https://www.legislation.gov.au/F2024L01618/latest/text',
  now(), now(),
  'Current CSOL lists Cyber Security Analyst ANZSCO 262116 with ACS as assessing authority; mapped to OSCA 271133.'
where not exists (
  select 1 from ingest.visa_occupation_status_au
  where osca_code = '271133' and anzsco_v13_code = '262116'
    and list_name = 'Core Skills Occupation List (CSOL)' and status = 'eligible'
);

insert into public.country_occupation_profiles (
  profile_key, country_code, canonical_career_id, official_title,
  official_code_system, official_code_version, official_unit_group_code,
  currency, registration_required, registration_authority, registration_url,
  publication_status, source_checked_at, updated_at
) values (
  'AU:cybersecurity-analyst', 'AU', 'cybersecurity-analyst', 'Cyber Security Analyst',
  'OSCA', '2024 v1.0', '2711', 'AUD', false,
  'Australian Computer Society (ACS) — migration skills assessment only; no statutory national occupational registration',
  'https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/cyber-security-occupations.html',
  'profile_ready', '2026-08-08', now()
)
on conflict (profile_key) do update set
  official_title = excluded.official_title,
  official_code_system = excluded.official_code_system,
  official_code_version = excluded.official_code_version,
  official_unit_group_code = excluded.official_unit_group_code,
  currency = excluded.currency,
  registration_required = excluded.registration_required,
  registration_authority = excluded.registration_authority,
  registration_url = excluded.registration_url,
  publication_status = excluded.publication_status,
  source_checked_at = excluded.source_checked_at,
  updated_at = now();

insert into public.country_occupation_metric_snapshots (
  profile_key, as_of_date, employment_total, median_weekly_earnings,
  median_hourly_earnings, annualised_median_salary,
  all_occupations_median_weekly, part_time_share_pct, female_share_pct,
  median_age, average_full_time_hours, vacancies_three_month_avg,
  vacancy_period, vacancy_yoy_pct, employment_growth_5y_pct,
  employment_growth_10y_pct, shortage_component,
  vacancy_intensity_component, employer_diversity_component,
  vacancy_trend_component, entry_level_component, salary_component,
  growth_component, visa_component, entry_burden_component,
  opportunity_score, score_methodology_version, score_status,
  score_evidence, source_checked_at
) values (
  'AU:cybersecurity-analyst', '2026-05-01', null, null, null, null,
  1852, null, null, null, null, 570, '2026-05-01', -6.56,
  14.01, 24.04, 0, 0, 5, 0, 10, 0, 5, 10, 4, 34,
  'career-opportunity-v1', 'provisional',
  jsonb_build_object(
    'current_classification_scope', 'CampCareer maps Cybersecurity Analyst exactly to OSCA 271133 Cyber Security Analyst. ABS lists ICT Security Analyst and Information Security Analyst as alternative titles and identifies cyber threat analysis, vulnerability assessment, incident analysis and malware analysis within the occupation scope.',
    'migration_mapping', 'ACS currently assesses ANZSCO 262116 Cyber Security Analyst and explicitly states that its occupation description is derived from OSCA 271133 Cyber Security Analyst. This replaces the older 262112 ICT Security Specialist crosswalk previously retained in CampCareer ingestion.',
    'broader_anzsco_2621_context', jsonb_build_object('employment_total',72600,'median_weekly_earnings_aud',2461,'median_hourly_earnings_aud',66,'part_time_share_pct',8,'female_share_pct',24,'median_age',41,'average_full_time_hours',41,'scope','ANZSCO 2621 Database and Systems Administrators and ICT Security Specialists; includes several database, systems administration and cyber security occupations beyond Cyber Security Analyst'),
    'vacancy_scope', 'The May 2026 IVI three-month-average value of 570 and state vacancy values are published on broader ANZSCO 2621. May 2025 was 610, giving -6.56% year-on-year. Vacancy intensity is not scored because an exact Cyber Security Analyst employment denominator is unavailable, and the negative broader vacancy trend scores zero.',
    'projection_scope', 'JSA Employment Projections for broader ANZSCO 2621 are +14.01% from May 2025 to May 2030 and +24.04% to May 2035. These values receive only partial growth credit because the series covers database, systems administration and multiple cyber security occupations.',
    'shortage_note', 'JSA reports Cyber Security Analyst ANZSCO 262116 as not in national shortage in the 2025 Occupation Shortage List. The ingested 2025 state results identify shortage in ACT, Queensland and South Australia, while NSW, Victoria, Western Australia, Tasmania and the Northern Territory are not recorded as shortage jurisdictions. National shortage therefore scores zero.',
    'visa_basis', 'The current LIN 24/093 Core Skills Occupation List includes Cyber Security Analyst ANZSCO 262116 with ACS as the relevant assessing authority. Occupation-list inclusion does not determine an individual visa outcome.',
    'registration_basis', 'There is no single statutory national occupational registration or licence to work as a Cyber Security Analyst in Australia. ACS migration skills assessment is an immigration and professional-assessment process rather than a domestic licence to practise.',
    'entry_level_basis', 'OSCA assigns Skill Level 1. Australia has multiple ACS-accredited Bachelor and postgraduate cyber security programs, and structured entry programs exist through employers such as ASD, CommBank and CyberCX. Entry remains more selective than general graduate ICT because many analyst positions require hands-on networking, systems, security operations, incident response or clearance-ready experience.',
    'entry_burden_basis', 'OSCA Skill Level 1 corresponds to a Bachelor degree or higher qualification, or at least five years of relevant experience. No additional statutory occupational licence applies, although some government roles require Australian citizenship and security clearance.',
    'employer_diversity_basis', 'Curated current coverage across national security, specialist cyber consulting, banking, telecommunications and professional services; replace with posting-level unique-employer counts when available.',
    'score_note', 'Conservative provisional score. Exact Cyber Security Analyst employment, earnings and vacancy intensity are not inferred from broader ANZSCO 2621. The 2025 national shortage result is No Shortage despite shortage in three jurisdictions, broader vacancies declined year on year, broader long-term growth receives partial credit, and the verified CSOL signal is retained.'
  ), '2026-08-08'
)
on conflict (profile_key, as_of_date) do update set
  employment_total=excluded.employment_total, median_weekly_earnings=excluded.median_weekly_earnings,
  median_hourly_earnings=excluded.median_hourly_earnings, annualised_median_salary=excluded.annualised_median_salary,
  all_occupations_median_weekly=excluded.all_occupations_median_weekly, part_time_share_pct=excluded.part_time_share_pct,
  female_share_pct=excluded.female_share_pct, median_age=excluded.median_age, average_full_time_hours=excluded.average_full_time_hours,
  vacancies_three_month_avg=excluded.vacancies_three_month_avg, vacancy_period=excluded.vacancy_period,
  vacancy_yoy_pct=excluded.vacancy_yoy_pct, employment_growth_5y_pct=excluded.employment_growth_5y_pct,
  employment_growth_10y_pct=excluded.employment_growth_10y_pct, shortage_component=excluded.shortage_component,
  vacancy_intensity_component=excluded.vacancy_intensity_component, employer_diversity_component=excluded.employer_diversity_component,
  vacancy_trend_component=excluded.vacancy_trend_component, entry_level_component=excluded.entry_level_component,
  salary_component=excluded.salary_component, growth_component=excluded.growth_component, visa_component=excluded.visa_component,
  entry_burden_component=excluded.entry_burden_component, opportunity_score=excluded.opportunity_score,
  score_methodology_version=excluded.score_methodology_version, score_status=excluded.score_status,
  score_evidence=excluded.score_evidence, source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_specialisations (
  profile_key, official_code, official_title, legacy_code_system,
  legacy_code_version, legacy_code, shortage_rating, visa_eligible,
  included_in_rollup, sort_order, source_url, source_checked_at
) values ('AU:cybersecurity-analyst','271133','Cyber Security Analyst','ANZSCO','2022','262116',3,true,true,1,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/271/2711/271133','2026-08-08')
on conflict (profile_key, official_code) do update set official_title=excluded.official_title,legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,legacy_code=excluded.legacy_code,shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,included_in_rollup=excluded.included_in_rollup,sort_order=excluded.sort_order,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
('AU:cybersecurity-analyst','ACT','2026-05-01',3,59.66667,'https://www.jobsandskills.gov.au/data/occupation-shortage'),
('AU:cybersecurity-analyst','NSW','2026-05-01',null,168,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:cybersecurity-analyst','NT','2026-05-01',null,5.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:cybersecurity-analyst','QLD','2026-05-01',3,109.33333,'https://www.jobsandskills.gov.au/data/occupation-shortage'),
('AU:cybersecurity-analyst','SA','2026-05-01',3,38.66667,'https://www.jobsandskills.gov.au/data/occupation-shortage'),
('AU:cybersecurity-analyst','TAS','2026-05-01',null,5.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:cybersecurity-analyst','VIC','2026-05-01',null,130,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:cybersecurity-analyst','WA','2026-05-01',null,53,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
('AU:cybersecurity-analyst','job_search','SEEK — Cyber Security Analyst jobs','https://www.seek.com.au/cyber-security-analyst-jobs','private_job_board',null,1,'2026-08-08'),
('AU:cybersecurity-analyst','job_search','Workforce Australia — Cyber Security Analyst search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=cyber%20security%20analyst','government_job_board',null,2,'2026-08-08'),
('AU:cybersecurity-analyst','employer','Australian Signals Directorate — Cyber security careers','https://www.asd.gov.au/careers/im-changing-my-career/cyber-security','government_national_security',null,1,'2026-08-08'),
('AU:cybersecurity-analyst','employer','CyberCX — Careers','https://cybercx.com.au/careers/','cyber_security_company',null,2,'2026-08-08'),
('AU:cybersecurity-analyst','employer','CommBank — Cyber & Security careers','https://www.commbank.com.au/about-us/careers/cyber.html','bank',null,3,'2026-08-08'),
('AU:cybersecurity-analyst','employer','Telstra — Careers','https://www.telstra.com.au/careers/our-teams','telecommunications',null,4,'2026-08-08'),
('AU:cybersecurity-analyst','employer','Deloitte Australia — Careers','https://jobs.deloitte.com.au/','professional_services',null,5,'2026-08-08'),
('AU:cybersecurity-analyst','entry_program','ACS — Cyber Security occupations and ANZSCO codes','https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/cyber-security-occupations.html','official_skills_assessment',null,1,'2026-08-08'),
('AU:cybersecurity-analyst','entry_program','ACS — Accredited courses','https://www.acs.org.au/cpd-education/accredited-courses.html','official_professional_body',null,2,'2026-08-08'),
('AU:cybersecurity-analyst','entry_program','ASD — Entry-level programs','https://www.asd.gov.au/careers/im-starting-my-career','government_national_security',null,3,'2026-08-08'),
('AU:cybersecurity-analyst','source','ABS — OSCA 271133 Cyber Security Analyst','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/27/271/2711/271133','official_classification',null,1,'2026-08-08'),
('AU:cybersecurity-analyst','source','ACS — Cyber Security occupations','https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/cyber-security-occupations.html','official_skills_assessment',null,2,'2026-08-08'),
('AU:cybersecurity-analyst','source','JSA — Occupation profiles','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupation-profiles','official_labour_market',null,3,'2026-08-08'),
('AU:cybersecurity-analyst','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,4,'2026-08-08'),
('AU:cybersecurity-analyst','source','JSA — Employment projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,5,'2026-08-08'),
('AU:cybersecurity-analyst','source','JSA — Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage','official_labour_market',null,6,'2026-08-08'),
('AU:cybersecurity-analyst','source','JSA — Australian Labour Market for Migrants October 2025','https://www.jobsandskills.gov.au/download/19864/australian-labour-market-migrants-october-2025/3543/australian-labour-market-migrants-october-2025/pdf','official_labour_market',null,7,'2026-08-08'),
('AU:cybersecurity-analyst','source','LIN 24/093 — current CSOL','https://www.legislation.gov.au/F2024L01618/latest/text','official_visa',null,8,'2026-08-08')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at) values
('AU:cybersecurity-analyst','au-program:3927','direct','2026-08-08'),
('AU:cybersecurity-analyst','au-program:7293','direct','2026-08-08'),
('AU:cybersecurity-analyst','au-program:3131','graduate_entry','2026-08-08')
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
