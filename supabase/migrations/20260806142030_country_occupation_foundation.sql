create table if not exists public.country_occupation_profiles (
  profile_key text primary key,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  canonical_career_id text not null,
  official_title text not null,
  official_code_system text not null,
  official_code_version text not null,
  official_unit_group_code text,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  registration_required boolean not null default false,
  registration_authority text,
  registration_url text,
  publication_status text not null default 'review_required' check (publication_status in ('review_required', 'profile_ready', 'decision_ready')),
  source_checked_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, canonical_career_id)
);
create table if not exists public.country_occupation_metric_snapshots (
  id bigint generated always as identity primary key,
  profile_key text not null references public.country_occupation_profiles(profile_key) on delete cascade,
  as_of_date date not null,
  employment_total integer,
  median_weekly_earnings numeric,
  median_hourly_earnings numeric,
  annualised_median_salary numeric,
  all_occupations_median_weekly numeric,
  part_time_share_pct numeric,
  female_share_pct numeric,
  median_age numeric,
  average_full_time_hours numeric,
  vacancies_three_month_avg numeric,
  vacancy_period date,
  vacancy_yoy_pct numeric,
  employment_growth_5y_pct numeric,
  employment_growth_10y_pct numeric,
  shortage_component smallint not null check (shortage_component between 0 and 20),
  vacancy_intensity_component smallint not null check (vacancy_intensity_component between 0 and 15),
  employer_diversity_component smallint not null check (employer_diversity_component between 0 and 5),
  vacancy_trend_component smallint not null check (vacancy_trend_component between 0 and 10),
  entry_level_component smallint not null check (entry_level_component between 0 and 15),
  salary_component smallint not null check (salary_component between 0 and 10),
  growth_component smallint not null check (growth_component between 0 and 10),
  visa_component smallint not null check (visa_component between 0 and 10),
  entry_burden_component smallint not null check (entry_burden_component between 0 and 5),
  opportunity_score smallint not null check (opportunity_score between 0 and 100),
  score_methodology_version text not null,
  score_status text not null default 'provisional' check (score_status in ('provisional', 'reviewed', 'published')),
  score_evidence jsonb not null default '{}'::jsonb,
  source_checked_at date,
  created_at timestamptz not null default now(),
  unique (profile_key, as_of_date)
);
create table if not exists public.country_occupation_specialisations (
  profile_key text not null references public.country_occupation_profiles(profile_key) on delete cascade,
  official_code text not null,
  official_title text not null,
  legacy_code_system text,
  legacy_code_version text,
  legacy_code text,
  shortage_rating smallint,
  visa_eligible boolean,
  included_in_rollup boolean not null default true,
  sort_order smallint not null default 0,
  source_url text,
  source_checked_at date,
  primary key (profile_key, official_code)
);
create table if not exists public.country_occupation_region_metrics (
  profile_key text not null references public.country_occupation_profiles(profile_key) on delete cascade,
  region_code text not null,
  as_of_date date not null,
  shortage_rating smallint,
  vacancy_count numeric,
  source_url text,
  primary key (profile_key, region_code, as_of_date)
);
create table if not exists public.country_occupation_links (
  id bigint generated always as identity primary key,
  profile_key text not null references public.country_occupation_profiles(profile_key) on delete cascade,
  link_type text not null check (link_type in ('job_search', 'employer', 'graduate_program', 'source')),
  label text not null,
  url text not null,
  provider_type text,
  region_code text,
  sort_order smallint not null default 0,
  source_checked_at date,
  unique (profile_key, link_type, url)
);
create table if not exists public.country_occupation_program_links (
  profile_key text not null references public.country_occupation_profiles(profile_key) on delete cascade,
  program_ref text not null,
  relation_type text not null default 'direct' check (relation_type in ('direct', 'graduate_entry', 'progression', 'related')),
  source_checked_at date,
  primary key (profile_key, program_ref)
);
create index if not exists country_occupation_metric_profile_date_idx on public.country_occupation_metric_snapshots (profile_key, as_of_date desc);
create index if not exists country_occupation_profile_country_idx on public.country_occupation_profiles (country_code, canonical_career_id);
create index if not exists country_occupation_region_profile_idx on public.country_occupation_region_metrics (profile_key, as_of_date desc);
create index if not exists country_occupation_links_profile_idx on public.country_occupation_links (profile_key, link_type, sort_order);
alter table public.country_occupation_profiles enable row level security;
alter table public.country_occupation_metric_snapshots enable row level security;
alter table public.country_occupation_specialisations enable row level security;
alter table public.country_occupation_region_metrics enable row level security;
alter table public.country_occupation_links enable row level security;
alter table public.country_occupation_program_links enable row level security;
drop policy if exists "country occupation profiles public read" on public.country_occupation_profiles;
create policy "country occupation profiles public read" on public.country_occupation_profiles for select to anon, authenticated using (true);
drop policy if exists "country occupation metrics public read" on public.country_occupation_metric_snapshots;
create policy "country occupation metrics public read" on public.country_occupation_metric_snapshots for select to anon, authenticated using (true);
drop policy if exists "country occupation specialisations public read" on public.country_occupation_specialisations;
create policy "country occupation specialisations public read" on public.country_occupation_specialisations for select to anon, authenticated using (true);
drop policy if exists "country occupation regions public read" on public.country_occupation_region_metrics;
create policy "country occupation regions public read" on public.country_occupation_region_metrics for select to anon, authenticated using (true);
drop policy if exists "country occupation links public read" on public.country_occupation_links;
create policy "country occupation links public read" on public.country_occupation_links for select to anon, authenticated using (true);
drop policy if exists "country occupation program links public read" on public.country_occupation_program_links;
create policy "country occupation program links public read" on public.country_occupation_program_links for select to anon, authenticated using (true);
grant select on public.country_occupation_profiles to anon, authenticated;
grant select on public.country_occupation_metric_snapshots to anon, authenticated;
grant select on public.country_occupation_specialisations to anon, authenticated;
grant select on public.country_occupation_region_metrics to anon, authenticated;
grant select on public.country_occupation_links to anon, authenticated;
grant select on public.country_occupation_program_links to anon, authenticated;
insert into public.country_occupation_profiles (profile_key, country_code, canonical_career_id, official_title, official_code_system, official_code_version, official_unit_group_code, currency, registration_required, registration_authority, registration_url, publication_status, source_checked_at, updated_at) values ('AU:registered-nurse', 'AU', 'registered-nurse', 'Registered Nurse', 'OSCA', '2024 v1.0', '2654', 'AUD', true, 'Nursing and Midwifery Board of Australia', 'https://www.nursingmidwiferyboard.gov.au/Registration-Standards.aspx', 'decision_ready', '2026-08-06', now()) on conflict (profile_key) do update set official_title=excluded.official_title, official_code_system=excluded.official_code_system, official_code_version=excluded.official_code_version, official_unit_group_code=excluded.official_unit_group_code, currency=excluded.currency, registration_required=excluded.registration_required, registration_authority=excluded.registration_authority, registration_url=excluded.registration_url, publication_status=excluded.publication_status, source_checked_at=excluded.source_checked_at, updated_at=now();
insert into public.country_occupation_metric_snapshots (profile_key, as_of_date, employment_total, median_weekly_earnings, median_hourly_earnings, annualised_median_salary, all_occupations_median_weekly, part_time_share_pct, female_share_pct, median_age, average_full_time_hours, vacancies_three_month_avg, vacancy_period, vacancy_yoy_pct, employment_growth_5y_pct, employment_growth_10y_pct, shortage_component, vacancy_intensity_component, employer_diversity_component, vacancy_trend_component, entry_level_component, salary_component, growth_component, visa_component, entry_burden_component, opportunity_score, score_methodology_version, score_status, score_evidence, source_checked_at) values ('AU:registered-nurse', '2026-05-01', 366200, 2192, 57, 113984, 1852, 44, 86, 38, 41, 7287.66667, '2026-05-01', 21.99, 13.67, 26.08, 20, 15, 5, 10, 13, 8, 10, 10, 2, 93, 'career-opportunity-v1', 'provisional', jsonb_build_object('vacancy_intensity_pct',1.99,'salary_premium_pct',18.36,'employer_diversity_basis','Curated public, private hospital and aged-care employer coverage; replace with posting-level unique-employer data when available.','entry_level_basis','Statewide and private graduate nurse programs are available, but no standardised national graduate-posting share is published.','entry_burden_basis','Bachelor-level education, NMBA registration, clinical placement and English-language requirements apply.','score_note','Provisional until posting-level entry experience and employer counts are ingested.'), '2026-08-06') on conflict (profile_key, as_of_date) do update set employment_total=excluded.employment_total, median_weekly_earnings=excluded.median_weekly_earnings, median_hourly_earnings=excluded.median_hourly_earnings, annualised_median_salary=excluded.annualised_median_salary, all_occupations_median_weekly=excluded.all_occupations_median_weekly, part_time_share_pct=excluded.part_time_share_pct, female_share_pct=excluded.female_share_pct, median_age=excluded.median_age, average_full_time_hours=excluded.average_full_time_hours, vacancies_three_month_avg=excluded.vacancies_three_month_avg, vacancy_period=excluded.vacancy_period, vacancy_yoy_pct=excluded.vacancy_yoy_pct, employment_growth_5y_pct=excluded.employment_growth_5y_pct, employment_growth_10y_pct=excluded.employment_growth_10y_pct, shortage_component=excluded.shortage_component, vacancy_intensity_component=excluded.vacancy_intensity_component, employer_diversity_component=excluded.employer_diversity_component, vacancy_trend_component=excluded.vacancy_trend_component, entry_level_component=excluded.entry_level_component, salary_component=excluded.salary_component, growth_component=excluded.growth_component, visa_component=excluded.visa_component, entry_burden_component=excluded.entry_burden_component, opportunity_score=excluded.opportunity_score, score_methodology_version=excluded.score_methodology_version, score_status=excluded.score_status, score_evidence=excluded.score_evidence, source_checked_at=excluded.source_checked_at;
insert into public.country_occupation_specialisations (profile_key, official_code, official_title, legacy_code_system, legacy_code_version, legacy_code, shortage_rating, visa_eligible, included_in_rollup, sort_order, source_url, source_checked_at) values
('AU:registered-nurse','265432','Registered Nurse (Acute Care)','ANZSCO','2013 v1.3','254415',5,true,true,1,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2654','2026-08-06'),
('AU:registered-nurse','265433','Registered Nurse (Aged Care)','ANZSCO','2013 v1.3','254412',5,true,true,2,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2654','2026-08-06'),
('AU:registered-nurse','265434','Registered Nurse (Mental Health)','ANZSCO','2013 v1.3','254422',5,true,true,3,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2654','2026-08-06'),
('AU:registered-nurse','265435','Registered Nurse (Primary Health Care)','ANZSCO','2013 v1.3','254413',5,true,true,4,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2654','2026-08-06'),
('AU:registered-nurse','265499','Registered Nurses nec','ANZSCO','2013 v1.3','254499',null,true,true,5,'https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2654','2026-08-06') on conflict (profile_key, official_code) do update set official_title=excluded.official_title, legacy_code_system=excluded.legacy_code_system, legacy_code_version=excluded.legacy_code_version, legacy_code=excluded.legacy_code, shortage_rating=excluded.shortage_rating, visa_eligible=excluded.visa_eligible, included_in_rollup=excluded.included_in_rollup, sort_order=excluded.sort_order, source_url=excluded.source_url, source_checked_at=excluded.source_checked_at;
insert into public.country_occupation_region_metrics (profile_key, region_code, as_of_date, shortage_rating, vacancy_count, source_url) values
('AU:registered-nurse','NSW','2026-05-01',3,2535.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:registered-nurse','VIC','2026-05-01',3,1619.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:registered-nurse','QLD','2026-05-01',3,1449.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:registered-nurse','SA','2026-05-01',3,692,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:registered-nurse','WA','2026-05-01',3,544.33333,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:registered-nurse','TAS','2026-05-01',3,170.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:registered-nurse','NT','2026-05-01',3,138.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index'),
('AU:registered-nurse','ACT','2026-05-01',3,137.66667,'https://www.jobsandskills.gov.au/data/internet-vacancy-index') on conflict (profile_key, region_code, as_of_date) do update set shortage_rating=excluded.shortage_rating, vacancy_count=excluded.vacancy_count, source_url=excluded.source_url;
insert into public.country_occupation_links (profile_key, link_type, label, url, provider_type, region_code, sort_order, source_checked_at) values
('AU:registered-nurse','job_search','SEEK — Registered Nurse jobs','https://www.seek.com.au/registered-nurse-jobs','private_job_board',null,1,'2026-08-06'),
('AU:registered-nurse','employer','NSW Health — Registered Nurse careers','https://www.health.nsw.gov.au/nursing/careers/Pages/registered-nurse.aspx','public_health_system','NSW',1,'2026-08-06'),
('AU:registered-nurse','employer','Queensland Health — Nursing careers','https://www.careers.health.qld.gov.au/nursing-and-midwifery-careers','public_health_system','QLD',2,'2026-08-06'),
('AU:registered-nurse','employer','Ramsay Health Care — Careers','https://www.ramsayhealth.com.au/en/ramsay-careers/','private_hospital_group',null,3,'2026-08-06'),
('AU:registered-nurse','employer','Healthscope — Careers','https://careers.healthscope.com.au/','private_hospital_group',null,4,'2026-08-06'),
('AU:registered-nurse','employer','Calvary — Careers','https://careers.calvarycare.org.au/','hospital_and_aged_care',null,5,'2026-08-06'),
('AU:registered-nurse','graduate_program','NSW Health GradStart','https://www.health.nsw.gov.au/nursing/employment/Pages/recruit.aspx','public_graduate_program','NSW',1,'2026-08-06'),
('AU:registered-nurse','graduate_program','Queensland Health graduate nursing pathway','https://www.careers.health.qld.gov.au/students-and-graduates','public_graduate_program','QLD',2,'2026-08-06'),
('AU:registered-nurse','source','ABS — OSCA 2654 Registered Nurses','https://www.abs.gov.au/statistics/classifications/osca-occupation-standard-classification-australia/2024-version-1-0/browse-classification/2/26/265/2654','official_classification',null,1,'2026-08-06'),
('AU:registered-nurse','source','JSA — Registered Nurses profile','https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations-anzsco/2544-registered-nurses','official_labour_market',null,2,'2026-08-06'),
('AU:registered-nurse','source','JSA — Employment projections','https://www.jobsandskills.gov.au/data/employment-projections','official_labour_market',null,3,'2026-08-06'),
('AU:registered-nurse','source','JSA — Internet Vacancy Index','https://www.jobsandskills.gov.au/data/internet-vacancy-index','official_labour_market',null,4,'2026-08-06'),
('AU:registered-nurse','source','NMBA — Registration standards','https://www.nursingmidwiferyboard.gov.au/Registration-Standards.aspx','official_regulator',null,5,'2026-08-06'),
('AU:registered-nurse','source','Home Affairs — Skilled occupation list','https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list','official_visa',null,6,'2026-08-06') on conflict (profile_key, link_type, url) do update set label=excluded.label, provider_type=excluded.provider_type, region_code=excluded.region_code, sort_order=excluded.sort_order, source_checked_at=excluded.source_checked_at;
insert into public.country_occupation_program_links (profile_key, program_ref, relation_type, source_checked_at) values
('AU:registered-nurse','qut-bachelor-nursing','direct','2026-08-06'),
('AU:registered-nurse','unisc-bachelor-nursing-science','direct','2026-08-06'),
('AU:registered-nurse','unisc-graduate-entry-nursing-science','graduate_entry','2026-08-06') on conflict (profile_key, program_ref) do update set relation_type=excluded.relation_type, source_checked_at=excluded.source_checked_at;;
