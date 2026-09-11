update public.program_pgwp_ca_staging p set international_students_eligible=true,international_program_admission_status='international_eligible_bsn_fall_2026_applications_closed_2026_04_30',source_url='https://admissions.usask.ca/nursing.php',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'USask 2026-27 nursing admissions checked 2026-08-08: BSN applications are accepted from residents of Canadian provinces and international countries, but the Fall 2026 application deadline was April 30, 2026.') where p.program_catalog_id=5506;
update public.program_catalog_ca_staging set source_status='official_current_program_admissions_on_hold_winter_2027',source_as_of=date '2026-08-08' where id=5507 and institution_name='University of Saskatchewan';
update public.program_pgwp_ca_staging p set international_program_admission_status='international_admissions_on_hold_winter_2027',source_url='https://admissions.usask.ca/nursing-post-degree.php',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'USask College of Nursing checked 2026-08-08: the Winter 2027 Post-Degree BSN intake is on hold.') where p.program_catalog_id=5507;
update public.program_pgwp_ca_staging p set international_students_eligible=true,international_program_admission_status='international_eligible_2027_application_cycle_opens_november_2026',source_url='https://admissions.usask.ca/pharmacy.php',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'USask 2026-27 admission requirements permit up to 9 of 90 PharmD seats for non-Saskatchewan Canadian and international applicants. The next application cycle opens November 2026 and closes March 15, 2027.') where p.program_catalog_id=5503;
update public.program_occupation_ca_staging o set review_status='rejected',relation_type=null,match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note='Rejected in Phase 3: Leadership in Post-Secondary Education is higher-education leadership training and is not secondary-school teacher preparation.',reviewed_at=now() where o.program_catalog_id=5463 and o.canonical_career_id='secondary-school-teacher' and o.review_status='candidate';
update public.program_occupation_ca_staging o set review_status='approved',relation_type=case
when o.canonical_career_id='accountant' and lower(c.credential_type) like '%master of professional accounting%' then 'direct'
when o.canonical_career_id='accountant' and lower(c.credential_type) like '%bachelor of commerce%' then 'common_pathway'
when o.canonical_career_id='accountant' then 'related'
when o.canonical_career_id='agronomist' and lower(c.title)='agronomy' then 'direct'
when o.canonical_career_id='agronomist' then 'related'
when o.canonical_career_id='animal-science-technician' then 'related'
when o.canonical_career_id in ('chemical-engineer','civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer') and lower(c.credential_type) like '%bachelor%engineering%' then 'direct'
when o.canonical_career_id in ('chemical-engineer','civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer') then 'common_pathway'
when o.canonical_career_id='data-analyst' then 'direct'
when o.canonical_career_id='early-childhood-teacher' then 'direct'
when o.canonical_career_id='farm-manager' then 'common_pathway'
when o.canonical_career_id='financial-analyst' and lower(c.title) like '%community energy%' then 'related'
when o.canonical_career_id='financial-analyst' then 'common_pathway'
when o.canonical_career_id='horticulturist' then 'direct'
when o.canonical_career_id='human-resources-specialist' then 'common_pathway'
when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
when o.canonical_career_id='marketing-specialist' then 'common_pathway'
when o.canonical_career_id='pharmacist' then 'direct'
when o.canonical_career_id='registered-nurse' and lower(c.credential_type) like '%bachelor of science in nursing%' then 'direct'
when o.canonical_career_id='registered-nurse' then 'related'
when o.canonical_career_id='software-developer' then 'common_pathway'
when o.canonical_career_id='special-education-teacher' then 'common_pathway'
when o.canonical_career_id='sustainability-specialist' then 'direct'
else 'related' end,match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note=case
when o.canonical_career_id='animal-science-technician' then 'Animal Science degree/graduate study is related animal-science education but is not a technician-specific credential.'
when o.canonical_career_id in ('chemical-engineer','civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer') and lower(c.credential_type) not like '%bachelor%engineering%' then 'Reviewed as advanced/related engineering education. Professional engineer licensure is not inferred from a graduate credential alone.'
when o.canonical_career_id='registered-nurse' and lower(c.credential_type) not like '%bachelor of science in nursing%' then 'Reviewed as advanced nursing education rather than an entry-to-practice registered-nurse qualifying degree.'
when o.canonical_career_id='special-education-teacher' then 'Post-degree Special Education study is a professional specialization pathway for educators rather than a standalone initial teacher credential.'
when o.canonical_career_id='farm-manager' then 'Agribusiness is a common education pathway to farm and agricultural management roles.'
else 'Reviewed against the official USask 2026-27 program title, credential scope and target occupation. Program-level international admission remains separately gated unless explicitly verified above.' end,reviewed_at=now() from public.program_catalog_ca_staging c where o.program_catalog_id=c.id and o.review_status='candidate' and c.institution_name='University of Saskatchewan';;
