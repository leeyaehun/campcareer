insert into public.country_occupation_profiles (
  profile_key,country_code,canonical_career_id,official_title,official_code_system,official_code_version,
  official_unit_group_code,currency,registration_required,registration_authority,registration_url,
  publication_status,source_checked_at,updated_at
) values
  ('US:carpenter','US','carpenter','Carpenters','SOC','SOC 2018','47-2031','USD',false,null,null,'profile_ready','2026-08-11',now()),
  ('US:electrician','US','electrician','Electricians','SOC','SOC 2018','47-2111','USD',false,null,null,'profile_ready','2026-08-11',now()),
  ('US:plumber','US','plumber','Plumbers, pipefitters, and steamfitters — plumber scope','SOC','SOC 2018','47-2152','USD',false,null,null,'profile_ready','2026-08-11',now()),
  ('US:wall-floor-tiler','US','wall-floor-tiler','Tile and stone setters','SOC','SOC 2018','47-2044','USD',false,null,null,'profile_ready','2026-08-11',now()),
  ('US:welder','US','welder','Welders, cutters, solderers, and brazers — welder scope','SOC','SOC 2018','51-4121','USD',false,null,null,'profile_ready','2026-08-11',now()),
  ('US:bricklayer','US','bricklayer','Brickmasons and blockmasons','SOC','SOC 2018','47-2021','USD',false,null,null,'profile_ready','2026-08-11',now()),
  ('US:hvac-technician','US','hvac-technician','Heating, air conditioning, and refrigeration mechanics and installers','SOC','SOC 2018','49-9021','USD',false,null,null,'profile_ready','2026-08-11',now()),
  ('US:construction-manager','US','construction-manager','Construction managers','SOC','SOC 2018','11-9021','USD',false,null,null,'profile_ready','2026-08-11',now())
on conflict (profile_key) do update set
  official_title=excluded.official_title,official_code_system=excluded.official_code_system,official_code_version=excluded.official_code_version,
  official_unit_group_code=excluded.official_unit_group_code,currency=excluded.currency,registration_required=excluded.registration_required,
  registration_authority=excluded.registration_authority,registration_url=excluded.registration_url,publication_status=excluded.publication_status,
  source_checked_at=excluded.source_checked_at,updated_at=now();

insert into public.country_occupation_metric_snapshots (
  profile_key,as_of_date,employment_total,median_hourly_earnings,annualised_median_salary,
  shortage_component,vacancy_intensity_component,employer_diversity_component,vacancy_trend_component,
  entry_level_component,salary_component,growth_component,visa_component,entry_burden_component,
  opportunity_score,score_methodology_version,score_status,score_evidence,source_checked_at
) values
  ('US:carpenter','2026-08-11',959000,28.51,59310,0,0,0,0,12,4,5,4,5,30,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 47-2031 Carpenters.',
    'shortage_note','The U.S. has no national shortage-occupation list used for this cohort. BLS projected growth and openings are demand indicators, not a formal shortage finding; 0/20.',
    'salary_method','BLS May 2024 national median pay is USD 59,310 / USD 28.51 per hour. US v1 salary band USD 50,000–59,999 earns 4/10.',
    'growth_basis','BLS projects 4 percent employment growth from 2024 to 2034. US v1 growth band 4–6 percent earns 5/10.',
    'visa_basis','Employer sponsorship is conditional rather than occupation-targeted: H-2B is limited to temporary nonagricultural need, while PERM can support permanent employer sponsorship after labor certification. 4/10.',
    'entry_basis','BLS says carpenters typically enter with a high school diploma and learn on the job or through apprenticeship; 12/15.',
    'entry_burden_basis','No single nationwide carpenter personal licence is treated as universally required; state/local contractor rules may still apply; 5/5.'
  ),'2026-08-11'),
  ('US:electrician','2026-08-11',818700,null,62350,0,0,0,0,12,6,8,4,2,32,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 47-2111 Electricians.',
    'shortage_note','BLS projects strong demand but does not designate Electricians as a formal national shortage occupation; 0/20.',
    'salary_method','BLS May 2024 national median annual wage is USD 62,350. US v1 salary band USD 60,000–74,999 earns 6/10.',
    'growth_basis','BLS projects 9 percent employment growth from 2024 to 2034. US v1 growth band 7–9 percent earns 8/10.',
    'visa_basis','H-2B is available only for qualifying temporary nonagricultural need and PERM requires employer sponsorship/labor certification; no occupation-specific visa preference is asserted; 4/10.',
    'entry_basis','BLS says most electricians learn through apprenticeship; 12/15.',
    'entry_burden_basis','BLS says most states require electricians to be licensed. Because licensing is state/local rather than one nationwide register, the country profile remains non-universally licensed but receives a high burden; 2/5.'
  ),'2026-08-11'),
  ('US:plumber','2026-08-11',504500,null,62970,0,0,0,0,12,6,5,4,2,29,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 47-2152 Plumbers, pipefitters, and steamfitters, constrained to plumber work.',
    'shortage_note','BLS national projections are not treated as a formal shortage designation; 0/20.',
    'salary_method','BLS May 2024 national median annual wage is USD 62,970. US v1 salary band USD 60,000–74,999 earns 6/10.',
    'growth_basis','BLS projects 4 percent employment growth from 2024 to 2034. US v1 growth band 4–6 percent earns 5/10.',
    'visa_basis','H-2B is limited to qualifying temporary need and PERM is employer/labor-certification based; no occupation-specific visa preference is asserted; 4/10.',
    'entry_basis','BLS says most plumbers, pipefitters, and steamfitters learn through apprenticeship; 12/15.',
    'entry_burden_basis','BLS says most states require plumbers to be licensed. Requirements are state/local, so no single nationwide registration authority is recorded; 2/5.'
  ),'2026-08-11'),
  ('US:wall-floor-tiler','2026-08-11',52600,null,52240,0,0,0,0,15,4,10,4,5,38,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 47-2044 Tile and stone setters; the canonical wall/floor tiler excludes carpet and general floor-layer occupations.',
    'shortage_note','Strong projected growth is not converted into a formal national shortage designation; 0/20.',
    'salary_method','BLS May 2024 median annual wage for Tile and stone setters is USD 52,240. US v1 salary band USD 50,000–59,999 earns 4/10.',
    'growth_basis','BLS projects Tile and stone setters to grow 10 percent from 2024 to 2034. US v1 growth band at least 10 percent earns 10/10.',
    'visa_basis','Any foreign-worker route is employer- and case-dependent: H-2B requires temporary need and PERM requires permanent labor certification; 4/10.',
    'entry_basis','BLS says flooring installers and tile/stone setters typically need no formal educational credential and learn on the job; 15/15.',
    'entry_burden_basis','No single nationwide personal licence is recorded for the broad Tile and stone setter occupation; local contractor rules may apply; 5/5.'
  ),'2026-08-11'),
  ('US:welder','2026-08-11',457300,24.52,51000,0,0,0,0,12,4,2,4,4,26,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 51-4121 Welders, cutters, solderers, and brazers, constrained to welder work.',
    'shortage_note','BLS projects many replacement openings but only 2 percent growth; neither is treated as a formal national shortage designation; 0/20.',
    'salary_method','BLS May 2024 national median pay is USD 51,000 / USD 24.52 per hour. US v1 salary band USD 50,000–59,999 earns 4/10.',
    'growth_basis','BLS projects 2 percent employment growth from 2024 to 2034. US v1 growth band 1–3 percent earns 2/10.',
    'visa_basis','H-2B and PERM can exist only under employer/case-specific requirements; no occupation-targeted visa access is asserted; 4/10.',
    'entry_basis','BLS says high school plus technical and on-the-job training is typical and apprenticeship can be available; 12/15.',
    'entry_burden_basis','BLS notes licensing in some states/localities and job-specific certifications; there is no single nationwide welder licence; 4/5.'
  ),'2026-08-11'),
  ('US:bricklayer','2026-08-11',74100,null,60800,0,0,0,0,12,6,2,4,5,29,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 47-2021 Brickmasons and blockmasons.',
    'shortage_note','BLS projected employment growth is not treated as a formal national shortage designation; 0/20.',
    'salary_method','BLS May 2024 median annual wage for Brickmasons and blockmasons is USD 60,800. US v1 salary band USD 60,000–74,999 earns 6/10.',
    'growth_basis','BLS projects Brickmasons and blockmasons to grow 3 percent from 2024 to 2034. US v1 growth band 1–3 percent earns 2/10.',
    'visa_basis','H-2B requires qualifying temporary need and PERM requires employer-sponsored permanent labor certification; 4/10.',
    'entry_basis','BLS says masonry workers generally need high school and learn through apprenticeship or on the job; 12/15.',
    'entry_burden_basis','No single nationwide personal brickmason licence is recorded; state/local contractor rules can still apply; 5/5.'
  ),'2026-08-11'),
  ('US:hvac-technician','2026-08-11',425200,28.75,59810,0,0,0,0,10,4,8,4,3,29,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 49-9021 Heating, air conditioning, and refrigeration mechanics and installers.',
    'shortage_note','BLS projects strong growth but does not publish a formal national shortage designation for this cohort; 0/20.',
    'salary_method','BLS May 2024 national median pay is USD 59,810 / USD 28.75 per hour. US v1 salary band USD 50,000–59,999 earns 4/10.',
    'growth_basis','BLS projects 8 percent employment growth from 2024 to 2034. US v1 growth band 7–9 percent earns 8/10.',
    'visa_basis','H-2B/PERM routes remain employer- and case-specific rather than occupation-targeted; 4/10.',
    'entry_basis','BLS says a postsecondary nondegree award is typical, followed by lengthy on-the-job training; 10/15.',
    'entry_burden_basis','EPA Section 608 certification is federally required for technicians who service equipment in ways that could release covered refrigerants; state/local licensing may also apply. It is a material but sub-scope credential burden; 3/5.'
  ),'2026-08-11'),
  ('US:construction-manager','2026-08-11',550300,null,106980,0,0,0,0,6,10,8,5,5,34,'career-opportunity-us-v1','provisional',jsonb_build_object(
    'classification_scope','SOC 2018 11-9021 Construction managers.',
    'shortage_note','BLS projects strong national demand but this is not a formal shortage-occupation designation; 0/20.',
    'salary_method','BLS May 2024 national median annual wage is USD 106,980. US v1 salary band at least USD 100,000 earns 10/10.',
    'growth_basis','BLS projects 9 percent employment growth from 2024 to 2034. US v1 growth band 7–9 percent earns 8/10.',
    'visa_basis','PERM can support permanent employer sponsorship. H-1B is only possible where the specific job qualifies as a specialty occupation requiring a bachelor degree or equivalent in a specific specialty; BLS typical bachelor entry does not by itself guarantee H-1B eligibility; 5/10.',
    'entry_basis','BLS says a bachelor degree is typically needed and management techniques are learned through on-the-job training; 6/15.',
    'entry_burden_basis','No single nationwide personal construction-manager licence is treated as universally required, although contractor licensing and project requirements vary by jurisdiction; 5/5.'
  ),'2026-08-11')
on conflict (profile_key,as_of_date) do update set
  employment_total=excluded.employment_total,median_hourly_earnings=excluded.median_hourly_earnings,annualised_median_salary=excluded.annualised_median_salary,
  shortage_component=excluded.shortage_component,vacancy_intensity_component=excluded.vacancy_intensity_component,employer_diversity_component=excluded.employer_diversity_component,vacancy_trend_component=excluded.vacancy_trend_component,
  entry_level_component=excluded.entry_level_component,salary_component=excluded.salary_component,growth_component=excluded.growth_component,visa_component=excluded.visa_component,entry_burden_component=excluded.entry_burden_component,
  opportunity_score=excluded.opportunity_score,score_methodology_version=excluded.score_methodology_version,score_status=excluded.score_status,score_evidence=excluded.score_evidence,source_checked_at=excluded.source_checked_at;

delete from public.country_occupation_specialisations where profile_key in ('US:carpenter','US:electrician','US:plumber','US:wall-floor-tiler','US:welder','US:bricklayer','US:hvac-technician','US:construction-manager');
insert into public.country_occupation_specialisations (profile_key,official_code,official_title,shortage_rating,visa_eligible,included_in_rollup,sort_order,source_url,source_checked_at) values
  ('US:carpenter','47-2031','Carpenters',null,true,true,1,'https://www.bls.gov/ooh/construction-and-extraction/carpenters.htm','2026-08-11'),
  ('US:electrician','47-2111','Electricians',null,true,true,1,'https://www.bls.gov/ooh/construction-and-extraction/electricians.htm','2026-08-11'),
  ('US:plumber','47-2152','Plumbers, pipefitters, and steamfitters — plumber scope',null,true,true,1,'https://www.bls.gov/ooh/construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm','2026-08-11'),
  ('US:wall-floor-tiler','47-2044','Tile and stone setters',null,true,true,1,'https://www.bls.gov/ooh/construction-and-extraction/tile-and-marble-setters.htm','2026-08-11'),
  ('US:welder','51-4121','Welders, cutters, solderers, and brazers — welder scope',null,true,true,1,'https://www.bls.gov/ooh/production/welders-cutters-solderers-and-brazers.htm','2026-08-11'),
  ('US:bricklayer','47-2021','Brickmasons and blockmasons',null,true,true,1,'https://www.bls.gov/ooh/construction-and-extraction/brickmasons-blockmasons-and-stonemasons.htm','2026-08-11'),
  ('US:hvac-technician','49-9021','Heating, air conditioning, and refrigeration mechanics and installers',null,true,true,1,'https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm','2026-08-11'),
  ('US:construction-manager','11-9021','Construction managers',null,true,true,1,'https://www.bls.gov/ooh/management/construction-managers.htm','2026-08-11');

delete from public.country_occupation_links where profile_key in ('US:carpenter','US:electrician','US:plumber','US:wall-floor-tiler','US:welder','US:bricklayer','US:hvac-technician','US:construction-manager');
insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
  ('US:carpenter','source','BLS Occupational Outlook Handbook — Carpenters','https://www.bls.gov/ooh/construction-and-extraction/carpenters.htm','official_labor',null,1,'2026-08-11'),
  ('US:carpenter','entry_program','U.S. Department of Labor — Apprenticeship Job Finder','https://www.apprenticeship.gov/apprenticeship-job-finder','official_training',null,2,'2026-08-11'),
  ('US:carpenter','source','DOL — H-2B Temporary Non-agricultural Program','https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b','official_immigration',null,3,'2026-08-11'),
  ('US:carpenter','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,4,'2026-08-11'),
  ('US:electrician','source','BLS Occupational Outlook Handbook — Electricians','https://www.bls.gov/ooh/construction-and-extraction/electricians.htm','official_labor',null,1,'2026-08-11'),
  ('US:electrician','entry_program','U.S. Department of Labor — Apprenticeship Job Finder','https://www.apprenticeship.gov/apprenticeship-job-finder','official_training',null,2,'2026-08-11'),
  ('US:electrician','source','DOL — H-2B Temporary Non-agricultural Program','https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b','official_immigration',null,3,'2026-08-11'),
  ('US:electrician','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,4,'2026-08-11'),
  ('US:plumber','source','BLS Occupational Outlook Handbook — Plumbers, Pipefitters, and Steamfitters','https://www.bls.gov/ooh/construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm','official_labor',null,1,'2026-08-11'),
  ('US:plumber','entry_program','U.S. Department of Labor — Apprenticeship Job Finder','https://www.apprenticeship.gov/apprenticeship-job-finder','official_training',null,2,'2026-08-11'),
  ('US:plumber','source','DOL — H-2B Temporary Non-agricultural Program','https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b','official_immigration',null,3,'2026-08-11'),
  ('US:plumber','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,4,'2026-08-11'),
  ('US:wall-floor-tiler','source','BLS Occupational Outlook Handbook — Flooring Installers and Tile and Stone Setters','https://www.bls.gov/ooh/construction-and-extraction/tile-and-marble-setters.htm','official_labor',null,1,'2026-08-11'),
  ('US:wall-floor-tiler','source','DOL — H-2B Temporary Non-agricultural Program','https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b','official_immigration',null,2,'2026-08-11'),
  ('US:wall-floor-tiler','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,3,'2026-08-11'),
  ('US:welder','source','BLS Occupational Outlook Handbook — Welders, Cutters, Solderers, and Brazers','https://www.bls.gov/ooh/production/welders-cutters-solderers-and-brazers.htm','official_labor',null,1,'2026-08-11'),
  ('US:welder','entry_program','U.S. Department of Labor — Apprenticeship Job Finder','https://www.apprenticeship.gov/apprenticeship-job-finder','official_training',null,2,'2026-08-11'),
  ('US:welder','source','DOL — H-2B Temporary Non-agricultural Program','https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b','official_immigration',null,3,'2026-08-11'),
  ('US:welder','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,4,'2026-08-11'),
  ('US:bricklayer','source','BLS Occupational Outlook Handbook — Masonry Workers','https://www.bls.gov/ooh/construction-and-extraction/brickmasons-blockmasons-and-stonemasons.htm','official_labor',null,1,'2026-08-11'),
  ('US:bricklayer','entry_program','U.S. Department of Labor — Apprenticeship Job Finder','https://www.apprenticeship.gov/apprenticeship-job-finder','official_training',null,2,'2026-08-11'),
  ('US:bricklayer','source','DOL — H-2B Temporary Non-agricultural Program','https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b','official_immigration',null,3,'2026-08-11'),
  ('US:bricklayer','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,4,'2026-08-11'),
  ('US:hvac-technician','source','BLS Occupational Outlook Handbook — HVACR Mechanics and Installers','https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm','official_labor',null,1,'2026-08-11'),
  ('US:hvac-technician','source','EPA — Section 608 Technician Certification','https://www.epa.gov/section608/section-608-technician-certification','official_regulator',null,2,'2026-08-11'),
  ('US:hvac-technician','source','DOL — H-2B Temporary Non-agricultural Program','https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b','official_immigration',null,3,'2026-08-11'),
  ('US:hvac-technician','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,4,'2026-08-11'),
  ('US:construction-manager','source','BLS Occupational Outlook Handbook — Construction Managers','https://www.bls.gov/ooh/management/construction-managers.htm','official_labor',null,1,'2026-08-11'),
  ('US:construction-manager','source','DOL — H-1B Specialty Occupation LCA','https://flag.dol.gov/programs/LCA','official_immigration',null,2,'2026-08-11'),
  ('US:construction-manager','source','DOL — Permanent Labor Certification (PERM)','https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent','official_immigration',null,3,'2026-08-11');

delete from public.country_occupation_program_links where profile_key in ('US:carpenter','US:electrician','US:plumber','US:wall-floor-tiler','US:welder','US:bricklayer','US:hvac-technician','US:construction-manager');
insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at) values
  ('US:construction-manager','umich-bse-civil-engineering','related','2026-08-11'),
  ('US:construction-manager','uw-bs-civil-engineering','related','2026-08-11'),
  ('US:construction-manager','utaustin-bs-civil-engineering','related','2026-08-11');;
