update public.program_occupation_ca_staging o set review_status='rejected',relation_type=null,match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note='Rejected in Phase 3: HVAC Sheet Metal Fabrication is a sheet-metal/HVAC trade program and is not a welding occupational pathway.',reviewed_at=now() from public.program_catalog_ca_staging c where o.program_catalog_id=c.id and o.review_status='candidate' and c.institution_name='New Brunswick Community College' and c.id=3798 and o.canonical_career_id='welder';

update public.program_occupation_ca_staging o set review_status='approved',relation_type=case
when o.canonical_career_id='accountant' and lower(c.title) like '%payroll%' then 'related'
when o.canonical_career_id='accountant' then 'common_pathway'
when o.canonical_career_id='chef' and lower(c.title) like '%management%' then 'common_pathway'
when o.canonical_career_id='chef' then 'direct'
when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') then 'related'
when o.canonical_career_id='construction-manager' then 'direct'
when o.canonical_career_id='cook' and lower(c.title) like '%management%' then 'common_pathway'
when o.canonical_career_id='cook' then 'direct'
when o.canonical_career_id='engineering-technician' then 'direct'
when o.canonical_career_id='financial-analyst' then 'common_pathway'
when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
when o.canonical_career_id='medical-laboratory-technician' and lower(c.title) like '%assistant%' then 'related'
when o.canonical_career_id='medical-laboratory-technician' then 'direct'
when o.canonical_career_id='pharmacist' then 'related'
when o.canonical_career_id='plumber' and lower(c.title) like '%steamfitting%' then 'related'
when o.canonical_career_id='restaurant-manager' then 'common_pathway'
when o.canonical_career_id='sustainability-specialist' then 'related'
when o.canonical_career_id='tourism-manager' then 'common_pathway'
when o.canonical_career_id='welder' and lower(c.title) like '%engineering technology%' then 'related'
else 'direct' end,match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note=case
when o.canonical_career_id in ('civil-engineer','electrical-engineer','mechanical-engineer') then 'Reviewed as related engineering-technician/technology education; the credential does not itself confer the target regulated professional engineer title.'
when o.canonical_career_id='pharmacist' then 'Reviewed as related pharmacy-sector education; Pharmacy Assistant/Technician credentials do not qualify a graduate as a pharmacist.'
when o.canonical_career_id='medical-laboratory-technician' and lower(c.title) like '%assistant%' then 'Reviewed as related laboratory-support education; Medical Laboratory Assistant is a distinct support pathway from Medical Laboratory Technology.'
when o.canonical_career_id='sustainability-specialist' then 'Sustainable Agriculture is related sustainability-domain education but is narrower than general sustainability-specialist preparation.'
when o.canonical_career_id='accountant' and lower(c.title) like '%payroll%' then 'Accounting and Payroll Administration is related accounting education but is narrower than full accountant preparation.'
else 'Reviewed against the verified official NBCC program page, credential scope and target occupation. International application availability remains separately portal-gated.' end,reviewed_at=now() from public.program_catalog_ca_staging c where o.program_catalog_id=c.id and o.review_status='candidate' and c.institution_name='New Brunswick Community College';;
