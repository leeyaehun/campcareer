insert into public.country_occupation_specialisations (profile_key,official_code,official_title,shortage_rating,visa_eligible,included_in_rollup,sort_order,source_url,source_checked_at) values
('NZ:early-childhood-teacher','241111','Early Childhood (Pre-primary School) Teacher — registered',null,true,true,1,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:primary-school-teacher','241213','Primary School Teacher',null,true,true,1,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:secondary-school-teacher','241411','Secondary School Teacher',null,true,true,1,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:special-education-teacher','241511','Special Needs Teacher',null,true,true,1,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:special-education-teacher','241512','Teacher of the Hearing Impaired',null,true,true,2,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:special-education-teacher','241513','Teacher of the Sight Impaired',null,true,true,3,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:special-education-teacher','241599','Special Education Teachers nec',null,true,true,4,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:social-worker','272511','Social Worker',null,true,true,1,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:youth-worker','411716','Youth Worker',null,true,true,1,'https://www.abs.gov.au/ausstats/abs%40.nsf/Latestproducts/1220.0~2013%2C%2BVersion%2B1.3~Chapter~UNIT%2BGROUP%2B4117%2BWelfare%2BSupport%2BWorkers','2026-08-11'),
('NZ:community-worker','411711','Community Worker',null,true,true,1,'https://www.abs.gov.au/ausstats/abs%40.nsf/Latestproducts/1220.0~2013%2C%2BVersion%2B1.3~Chapter~UNIT%2BGROUP%2B4117%2BWelfare%2BSupport%2BWorkers','2026-08-11'),
('NZ:counsellor','272111','Careers Counsellor',null,true,true,1,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:counsellor','272113','Family and Marriage Counsellor',null,true,true,2,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:counsellor','272114','Rehabilitation Counsellor',null,true,true,3,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:counsellor','272115','Student Counsellor',null,true,true,4,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11'),
('NZ:counsellor','272199','Counsellors nec',null,true,true,5,'https://www.immigration.govt.nz/opsmanual/89117.htm','2026-08-11')
on conflict (profile_key,official_code) do update set official_title=excluded.official_title,shortage_rating=excluded.shortage_rating,visa_eligible=excluded.visa_eligible,included_in_rollup=excluded.included_in_rollup,sort_order=excluded.sort_order,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at;

insert into public.country_occupation_links (profile_key,link_type,label,url,provider_type,region_code,sort_order,source_checked_at) values
('NZ:early-childhood-teacher','entry_program','Tahatū — Early Childhood Teacher','https://tahatu.govt.nz/work/explore-career-ideas/occupation/T00346-early-childhood-teacher','official_training',null,1,'2026-08-11'),
('NZ:early-childhood-teacher','source','Teaching Council — registration and practising certificate','https://teachingcouncil.nz/index.htm/become-a-teacher/based-in-aotearoa-new-zealand/register-to-teach','official_regulator',null,2,'2026-08-11'),
('NZ:early-childhood-teacher','source','Immigration New Zealand — Green List','https://www.immigration.govt.nz/opsmanual/89117.htm','official_immigration',null,3,'2026-08-11'),
('NZ:primary-school-teacher','entry_program','Tahatū — Primary School Teacher','https://tahatu.govt.nz/work/explore-career-ideas/occupation/T00350-primary-school-teacher','official_training',null,1,'2026-08-11'),
('NZ:primary-school-teacher','source','Teaching Council — registration and practising certificate','https://teachingcouncil.nz/index.htm/become-a-teacher/based-in-aotearoa-new-zealand/register-to-teach','official_regulator',null,2,'2026-08-11'),
('NZ:primary-school-teacher','source','Immigration New Zealand — Green List','https://www.immigration.govt.nz/opsmanual/89117.htm','official_immigration',null,3,'2026-08-11'),
('NZ:secondary-school-teacher','entry_program','Tahatū — Secondary School Teacher','https://tahatu.govt.nz/work/explore-career-ideas/occupation/T00353-secondary-school-teacher','official_training',null,1,'2026-08-11'),
('NZ:secondary-school-teacher','source','Teaching Council — registration and practising certificate','https://teachingcouncil.nz/index.htm/become-a-teacher/based-in-aotearoa-new-zealand/register-to-teach','official_regulator',null,2,'2026-08-11'),
('NZ:secondary-school-teacher','source','Immigration New Zealand — Green List','https://www.immigration.govt.nz/opsmanual/89117.htm','official_immigration',null,3,'2026-08-11'),
('NZ:special-education-teacher','entry_program','Teaching Council — approved ITE programmes (registered-teacher foundation)','https://teachingcouncil.nz/index.php/for-teacher-education-providers/your-ite-programme-toolkit/list-of-approved-ite-programmes','official_training',null,1,'2026-08-11'),
('NZ:special-education-teacher','source','Teaching Council — registration and practising certificate','https://teachingcouncil.nz/index.htm/become-a-teacher/based-in-aotearoa-new-zealand/register-to-teach','official_regulator',null,2,'2026-08-11'),
('NZ:special-education-teacher','source','Immigration New Zealand — Green List','https://www.immigration.govt.nz/opsmanual/89117.htm','official_immigration',null,3,'2026-08-11'),
('NZ:social-worker','entry_program','Tahatū — Social Worker','https://tahatu.govt.nz/work/explore-career-ideas/occupation/T00287-social-worker','official_training',null,1,'2026-08-11'),
('NZ:social-worker','source','Social Workers Registration Board — registration','https://swrb.govt.nz/registration/','official_regulator',null,2,'2026-08-11'),
('NZ:social-worker','source','Social Workers Registration Board — practising certificate','https://swrb.govt.nz/practice/practising-certificate/','official_regulator',null,3,'2026-08-11'),
('NZ:social-worker','source','Immigration New Zealand — Green List','https://www.immigration.govt.nz/opsmanual/89117.htm','official_immigration',null,4,'2026-08-11'),
('NZ:youth-worker','entry_program','Tahatū — Youth Worker','https://tahatu.govt.nz/work/explore-career-ideas/occupation/T01069-youth-worker','official_training',null,1,'2026-08-11'),
('NZ:youth-worker','source','ANZSCO 1.3 — Welfare Support Workers','https://www.abs.gov.au/ausstats/abs%40.nsf/Latestproducts/1220.0~2013%2C%2BVersion%2B1.3~Chapter~UNIT%2BGROUP%2B4117%2BWelfare%2BSupport%2BWorkers','official_classification',null,2,'2026-08-11'),
('NZ:community-worker','entry_program','Tahatū — Support Worker (closest community-support route)','https://tahatu.govt.nz/work/explore-career-ideas/occupation/T00528-support-worker','official_training',null,1,'2026-08-11'),
('NZ:community-worker','source','ANZSCO 1.3 — Welfare Support Workers','https://www.abs.gov.au/ausstats/abs%40.nsf/Latestproducts/1220.0~2013%2C%2BVersion%2B1.3~Chapter~UNIT%2BGROUP%2B4117%2BWelfare%2BSupport%2BWorkers','official_classification',null,2,'2026-08-11'),
('NZ:counsellor','entry_program','Tahatū — Counsellor','https://tahatu.govt.nz/work/explore-career-ideas/occupation/T01051-counsellor','official_training',null,1,'2026-08-11'),
('NZ:counsellor','source','Immigration New Zealand — Green List counsellor scope','https://www.immigration.govt.nz/opsmanual/89117.htm','official_immigration',null,2,'2026-08-11')
on conflict (profile_key,link_type,url) do update set label=excluded.label,provider_type=excluded.provider_type,region_code=excluded.region_code,sort_order=excluded.sort_order,source_checked_at=excluded.source_checked_at;

delete from public.country_occupation_program_links where profile_key in ('NZ:early-childhood-teacher','NZ:primary-school-teacher','NZ:secondary-school-teacher','NZ:special-education-teacher','NZ:social-worker','NZ:youth-worker','NZ:community-worker','NZ:counsellor') and program_ref like 'nz-program:%';

insert into public.country_occupation_program_links (profile_key,program_ref,relation_type,source_checked_at)
select 'NZ:' || poc.canonical_career_id,
       'nz-program:' || poc.programme_id::text,
       poc.normalized_relation_type,
       '2026-08-11'::date
from public.program_occupation_canonical_nz_v1 poc
join public.program_catalog_canonical_nz_v1 pc using (programme_id)
where poc.canonical_career_id in ('early-childhood-teacher','primary-school-teacher','secondary-school-teacher','special-education-teacher','social-worker','youth-worker','community-worker','counsellor')
  and pc.verification_tier = 'A'
  and pc.international_students_eligible is true
  and pc.code_signatory_status = 'confirmed'
  and coalesce(pc.canonical_admission_state,'') <> 'closed'
on conflict (profile_key,program_ref) do update set relation_type=excluded.relation_type,source_checked_at=excluded.source_checked_at;;
