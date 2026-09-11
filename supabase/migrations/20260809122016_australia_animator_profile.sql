-- Australia Animator profile.
-- Current OSCA 242331 Animator or Visual Effects Artist is exact.
-- Current ANZSCO 2022 correspondence is partial across 232411 Graphic Designer, 232412 Illustrator and 232413 Multimedia Designer.

update public.courses_au set
 official_course_url='https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/bachelor-degrees/bachelor-of-design-animation-and-interactive-media-bp203',
 official_url_status='verified',official_url_checked_at=now(),official_url_source='RMIT current Bachelor of Design (Animation and Interactive Media) page, CRICOS 079976B, verified 2026-08-09'
where institution_id='rmit-university' and course_code='079976B';

update public.courses_au set
 official_course_url='https://www.swinburne.edu.au/course/undergraduate/bachelor-of-animation/',
 official_url_status='verified',official_url_checked_at=now(),official_url_source='Swinburne current Bachelor of Animation page, CRICOS 092511D, verified 2026-08-09'
where institution_id='swinburne-university-of-technology' and course_code='092511D';

insert into public.country_occupation_profiles (
 profile_key,country_code,canonical_career_id,official_title,official_code_system,official_code_version,
 official_unit_group_code,currency,registration_required,registration_authority,registration_url,
 publication_status,source_checked_at,updated_at
) values (
 'AU:animator','AU','animator','Animator or Visual Effects Artist','OSCA','2024 v1.0','2423','AUD',false,
 'No statutory registration; VETASSESS Illustrator 232412 migration assessment may recognise Animator as a suitable occupation',
 'https://www.vetassess.com.au/check-my-occupation/professional-occupations/illustrator',
 'profile_ready','2026-08-09',now()
)
on conflict (profile_key) do update set official_title=excluded.official_title,official_code_system=excluded.official_code_system,
 official_code_version=excluded.official_code_version,official_unit_group_code=excluded.official_unit_group_code,currency=excluded.currency,
 registration_required=excluded.registration_required,registration_authority=excluded.registration_authority,
 registration_url=excluded.registration_url,publication_status=excluded.publication_status,
 source_checked_at=excluded.source_checked_at,updated_at=now();

insert into public.country_occupation_metric_snapshots (
 profile_key,as_of_date,employment_total,median_weekly_earnings,median_hourly_earnings,annualised_median_salary,
 all_occupations_median_weekly,part_time_share_pct,female_share_pct,median_age,average_full_time_hours,
 vacancies_three_month_avg,vacancy_period,vacancy_yoy_pct,employment_growth_5y_pct,employment_growth_10y_pct,
 shortage_component,vacancy_intensity_component,employer_diversity_component,vacancy_trend_component,
 entry_level_component,salary_component,growth_component,visa_component,entry_burden_component,
 opportunity_score,score_methodology_version,score_status,score_evidence,source_checked_at
) values (
 'AU:animator','2026-05-01',null,null,null,null,1852,null,null,null,null,
 441,'2026-05-01',-7.68,9.86,18.96,0,0,5,0,13,0,5,5,5,33,
 'career-opportunity-v1','provisional',
 jsonb_build_object(
  'classification_scope','Current OSCA 242331 Animator or Visual Effects Artist is an exact canonical occupation. ABS current correspondence distributes it partially across ANZSCO 2022 232411 Graphic Designer, 232412 Illustrator and 232413 Multimedia Designer.',
  'labour_scope','Primary employment, demographics and earnings remain null because no single six-digit ANZSCO labour profile represents the current OSCA 242331 scope.',
  'legacy_232412_context',jsonb_build_object('employment_total',3400,'part_time_share_pct',30,'female_share_pct',36,'median_age',34,'average_full_time_hours',43,'median_weekly_earnings_aud',null,'scope','Legacy JSA ANZSCO 232412 Illustrator context only'),
  'vacancy_scope','Broader ANZSCO 2324 vacancies were 441 in May 2026 versus 477.66667 in May 2025, about -7.68% year on year; no exact vacancy intensity or trend credit.',
  'projection_scope','Broader ANZSCO 2324 projections are +9.86% to 2030 and +18.96% to 2035; partial growth credit only.',
  'shortage_note','JSA 2025 OSL records current OSCA 242331 Animator or Visual Effects Artist as No Shortage nationally.',
  'visa_basis','The current Core Skills Occupation List includes ANZSCO 232412 Illustrator with VETASSESS. VETASSESS lists Animator as a suitable occupation under Illustrator, but ABS current correspondence from OSCA 242331 to 232412 is partial, so visa credit is reduced to partial.',
  'entry_level_basis','RMIT Bachelor of Design (Animation and Interactive Media) 079976B and Swinburne Bachelor of Animation 092511D are current three-year on-campus international study routes with direct animation and visual-effects preparation.',
  'score_note','The profile keeps the exact current OSCA title while refusing to convert a partial ANZSCO correspondence into exact labour, salary or full migration evidence.'
 ),'2026-08-09'
)
on conflict (profile_key,as_of_date) do update set employment_total=excluded.employment_total,
 median_weekly_earnings=excluded.median_weekly_earnings,median_hourly_earnings=excluded.median_hourly_earnings,
 annualised_median_salary=excluded.annualised_median_salary,all_occupations_median_weekly=excluded.all_occupations_median_weekly,
 part_time_share_pct=excluded.part_time_share_pct,female_share_pct=excluded.female_share_pct,median_age=excluded.median_age,
 average_full_time_hours=excluded.average_full_time_hours,vacancies_three_month_avg=excluded.vacancies_three_month_avg,
 vacancy_period=excluded.vacancy_period,vacancy_yoy_pct=excluded.vacancy_yoy_pct,
 employment_growth_5y_pct=excluded.employment_growth_5y_pct,employment_growth_10y_pct=excluded.employment_growth_10y_pct,
 shortage_component=excluded.shortage_component,vacancy_intensity_component=excluded.vacancy_intensity_component,
 employer_diversity_component=excluded.employer_diversity_component,vacancy_trend_component=excluded.vacancy_trend_component,
 entry_level_component=excluded.entry_level_component,salary_component=excluded.salary_component,growth_component=excluded.growth_component,
 visa_component=excluded.visa_component,entry_burden_component=excluded.entry_burden_component,opportunity_score=excluded.opportunity_score,
 score_methodology_version=excluded.score_methodology_version,score_status=excluded.score_status,score_evidence=excluded.score_evidence,
 source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_specialisations (
 profile_key,official_code,official_title,legacy_code_system,legacy_code_version,legacy_code,shortage_rating,visa_eligible,
 included_in_rollup,sort_order,source_url,source_checked_at
) values (
 'AU:animator','242331','Animator or Visual Effects Artist','ANZSCO','2022','232412',null,true,true,1,
 'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/242/2423/242331','2026-08-09'
)
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,
 legacy_code_system=excluded.legacy_code_system,legacy_code_version=excluded.legacy_code_version,legacy_code=excluded.legacy_code,
 shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,included_in_rollup=excluded.included_in_rollup,
 sort_order=excluded.sort_order,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_region_metrics (profile_key,region_code,as_of_date,shortage_rating,vacancy_count,source_url) values
 ('AU:animator','ACT','2026-05-01',null,11.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:animator','NSW','2026-05-01',null,160,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:animator','NT','2026-05-01',null,2.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:animator','QLD','2026-05-01',null,89.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:animator','SA','2026-05-01',null,14.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:animator','TAS','2026-05-01',null,2.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:animator','VIC','2026-05-01',null,135,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
 ('AU:animator','WA','2026-05-01',null,25,'https://www.jobsandskills.gov.au/data/internet-vacancy-index')
on conflict (profile_key,region_code,as_of_date) do update set shortage_rating=excluded.shortage_rating,
 vacancy_count=excluded.vacancy_count,source_url=excluded.source_url;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
 ('AU:animator','job_search','SEEK — Animator jobs','https://www.seek.com.au/animator-jobs','private_job_board',null,1,'2026-08-09'),
 ('AU:animator','job_search','Workforce Australia — Animator search','https://www.workforceaustralia.gov.au/individuals/jobs/search?searchText=animator','government_job_board',null,2,'2026-08-09'),
 ('AU:animator','employer','Rising Sun Pictures Careers','https://www.rsp.com.au/careers/','visual_effects',null,1,'2026-08-09'),
 ('AU:animator','employer','Flying Bark Productions Careers','https://www.flyingbark.com.au/careers','animation',null,2,'2026-08-09'),
 ('AU:animator','employer','Luma Pictures Careers','https://www.lumapictures.com/careers','visual_effects',null,3,'2026-08-09'),
 ('AU:animator','employer','Framestore Careers','https://www.framestore.com/careers','visual_effects',null,4,'2026-08-09'),
 ('AU:animator','employer','DNEG Careers','https://www.dneg.com/careers/','visual_effects',null,5,'2026-08-09'),
 ('AU:animator','entry_program','RMIT — Bachelor of Design (Animation and Interactive Media)','https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/bachelor-degrees/bachelor-of-design-animation-and-interactive-media-bp203','university',null,1,'2026-08-09'),
 ('AU:animator','entry_program','Swinburne — Bachelor of Animation','https://www.swinburne.edu.au/course/undergraduate/bachelor-of-animation/','university',null,2,'2026-08-09'),
 ('AU:animator','source','ABS — OSCA 242331 Animator or Visual Effects Artist','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/24/242/2423/242331','official_classification',null,1,'2026-08-09'),
 ('AU:animator','source','ABS — ANZSCO 2022 2324 Graphic and Web Designers, and Illustrators','https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/2/23/232/2324','official_classification',null,2,'2026-08-09'),
 ('AU:animator','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,3,'2026-08-09'),
 ('AU:animator','source','JSA — Employment Projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,4,'2026-08-09'),
 ('AU:animator','source','JSA — 2025 Occupation Shortage List','https://www.jobsandskills.gov.au/data/occupation-shortage-analysis/occupation-shortage-list','official_shortage',null,5,'2026-08-09'),
 ('AU:animator','source','Federal Register — current Core Skills Occupation List instrument','https://www.legislation.gov.au/F2024L01618/2026-03-28/2026-03-28/text/original/epub/OEBPS/document_1/document_1.html','official_migration',null,6,'2026-08-09'),
 ('AU:animator','source','VETASSESS — Illustrator','https://www.vetassess.com.au/check-my-occupation/professional-occupations/illustrator','official_skills_assessment',null,7,'2026-08-09')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,
 region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'AU:animator','au-program:'||id::text,'direct','2026-08-09'
from public.courses_au
where (institution_id='rmit-university' and course_code='079976B')
   or (institution_id='swinburne-university-of-technology' and course_code='092511D')
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
