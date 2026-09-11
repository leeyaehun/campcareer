create temp table ca_new_institutions(program_catalog_id text primary key,canonical_slug text not null,canonical_name text not null,institution_kind text not null,ownership_type text not null,website_url text not null,dli_number text) on commit drop;
insert into ca_new_institutions values
('algonquin-college','algonquin-college','Algonquin College','college','public','https://www.algonquincollege.com/','O19358971022'),
('aurora-college','aurora-college','Aurora College','college','public','https://www.auroracollege.nt.ca/','O19348462392'),
('british-columbia-institute-of-technology','british-columbia-institute-of-technology','British Columbia Institute of Technology','polytechnic','public','https://www.bcit.ca/','O19330128542'),
('camosun-college','camosun-college','Camosun College','college','public','https://camosun.ca/','O19361235542'),
('centennial-college','centennial-college','Centennial College','college','public','https://www.centennialcollege.ca/','O19394700003'),
('college-of-new-caledonia','college-of-new-caledonia','College of New Caledonia','college','public','https://cnc.bc.ca/','O19360977332'),
('college-of-the-north-atlantic','college-of-the-north-atlantic','College of the North Atlantic','college','public','https://www.cna.nl.ca/','O19441088976'),
('conestoga-college','conestoga-college','Conestoga College','college','public','https://www.conestogac.on.ca/','O19376158572'),
('confederation-college','confederation-college','Confederation College','college','public','https://www.confederationcollege.ca/','O19376986752'),
('douglas-college','douglas-college','Douglas College','college','public','https://www.douglascollege.ca/','O19360973702'),
('fanshawe-college','fanshawe-college','Fanshawe College','college','public','https://www.fanshawec.ca/','O19361039982'),
('george-brown-polytechnic','george-brown-polytechnic','George Brown Polytechnic','polytechnic','public','https://www.georgebrown.ca/','O19283850612'),
('holland-college','holland-college','Holland College','college','public','https://hollandcollege.com/','O19220082122'),
('humber-polytechnic','humber-polytechnic','Humber Polytechnic','polytechnic','public','https://humber.ca/','O19376943122'),
('kwantlen-polytechnic-university','kwantlen-polytechnic-university','Kwantlen Polytechnic University','university','public','https://www.kpu.ca/','O19350676872'),
('langara-college','langara-college','Langara College','college','public','https://langara.ca/','O19319074622'),
('lethbridge-polytechnic','lethbridge-polytechnic','Lethbridge Polytechnic','polytechnic','public','https://lethpolytech.ca/','O19391056756'),
('new-brunswick-community-college','new-brunswick-community-college','New Brunswick Community College','college','public','https://nbcc.ca/','O19391556439'),
('northern-alberta-institute-of-technology','northern-alberta-institute-of-technology','Northern Alberta Institute of Technology','polytechnic','public','https://www.nait.ca/','O18713200642'),
('nova-scotia-community-college','nova-scotia-community-college','Nova Scotia Community College','college','public','https://www.nscc.ca/','O19091820452'),
('nunavut-arctic-college','nunavut-arctic-college','Nunavut Arctic College','college','public','https://www.arcticcollege.ca/',null),
('red-river-college-polytechnic','red-river-college-polytechnic','Red River College Polytechnic','polytechnic','public','https://www.rrc.ca/','O19305836302'),
('saskatchewan-polytechnic','saskatchewan-polytechnic','Saskatchewan Polytechnic','polytechnic','public','https://saskpolytech.ca/','O19425521849'),
('sault-college','sault-college','Sault College','college','public','https://www.saultcollege.ca/','O19395677683'),
('selkirk-college','selkirk-college','Selkirk College','college','public','https://selkirk.ca/','O19360990072'),
('seneca-polytechnic','seneca-polytechnic','Seneca Polytechnic','polytechnic','public','https://www.senecapolytechnic.ca/','O19395536013'),
('sheridan-college','sheridan-college','Sheridan College','college','public','https://www.sheridancollege.ca/','O19385946782'),
('southern-alberta-institute-of-technology','southern-alberta-institute-of-technology','Southern Alberta Institute of Technology','polytechnic','public','https://www.sait.ca/','O18761749692'),
('university-of-prince-edward-island','university-of-prince-edward-island','University of Prince Edward Island','university','public','https://www.upei.ca/','O19220071452'),
('university-of-regina','university-of-regina','University of Regina','university','public','https://www.uregina.ca/','O19425660270'),
('vancouver-island-university','vancouver-island-university','Vancouver Island University','university','public','https://www.viu.ca/','O19395299688'),
('yukon-university','yukon-university','Yukon University','university','public','https://www.yukonu.ca/','O19604209351');

do $$ declare collision_count integer; begin
select count(*) into collision_count from ca_new_institutions source join catalog.institutions existing on existing.country_code='CA' and (existing.slug=source.canonical_slug or lower(existing.canonical_name)=lower(source.canonical_name));
if collision_count>0 then raise exception 'Found % unexpected existing Canadian institutions in the 32-row acquisition cohort',collision_count; end if; end $$;

insert into catalog.institutions(country_code,canonical_name,website_url,status,slug,institution_kind,ownership_type)
select 'CA',canonical_name,website_url,'active',canonical_slug,institution_kind,ownership_type from ca_new_institutions;

insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select i.id,'CA_DLI',source.dli_number,'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html'
from ca_new_institutions source join catalog.institutions i on i.country_code='CA' and i.slug=source.canonical_slug
where source.dli_number is not null
on conflict(identifier_system,identifier_value) do update set institution_id=excluded.institution_id,source_url=excluded.source_url;

create temp table ca_program_catalog_map(program_catalog_id text primary key,canonical_slug text not null) on commit drop;
insert into ca_program_catalog_map values
('algonquin-college','algonquin-college'),('aurora-college','aurora-college'),('british-columbia-institute-of-technology','british-columbia-institute-of-technology'),('camosun-college','camosun-college'),('carleton-university','carleton-university'),('centennial-college','centennial-college'),('college-of-new-caledonia','college-of-new-caledonia'),('college-of-the-north-atlantic','college-of-the-north-atlantic'),('concordia-university','concordia-university'),('conestoga-college','conestoga-college'),('confederation-college','confederation-college'),('dalhousie-university','dalhousie-university'),('douglas-college','douglas-college'),('fanshawe-college','fanshawe-college'),('george-brown-polytechnic','george-brown-polytechnic'),('holland-college','holland-college'),('humber-polytechnic','humber-polytechnic'),('kwantlen-polytechnic-university','kwantlen-polytechnic-university'),('langara-college','langara-college'),('lethbridge-polytechnic','lethbridge-polytechnic'),('mcgill-university','mcgill-university'),('memorial-university-of-newfoundland','memorial-university-of-newfoundland'),('new-brunswick-community-college','new-brunswick-community-college'),('northern-alberta-institute-of-technology','northern-alberta-institute-of-technology'),('nova-scotia-community-college','nova-scotia-community-college'),('nunavut-arctic-college','nunavut-arctic-college'),('red-river-college-polytechnic','red-river-college-polytechnic'),('saskatchewan-polytechnic','saskatchewan-polytechnic'),('sault-college','sault-college'),('selkirk-college','selkirk-college'),('seneca-polytechnic','seneca-polytechnic'),('sheridan-college','sheridan-college'),('simon-fraser-university','simon-fraser-university'),('southern-alberta-institute-of-technology','southern-alberta-institute-of-technology'),('universite-laval','universit-laval'),('university-of-alberta','university-of-alberta'),('university-of-british-columbia','university-of-british-columbia'),('university-of-calgary','university-of-calgary'),('university-of-manitoba','university-of-manitoba'),('university-of-new-brunswick','university-of-new-brunswick'),('university-of-ottawa','university-of-ottawa'),('university-of-prince-edward-island','university-of-prince-edward-island'),('university-of-regina','university-of-regina'),('university-of-saskatchewan','university-of-saskatchewan'),('university-of-toronto','university-of-toronto'),('university-of-victoria','university-of-victoria'),('university-of-waterloo','university-of-waterloo'),('vancouver-island-university','vancouver-island-university'),('yukon-university','yukon-university');

insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select i.id,'CA_PROGRAM_CATALOG_ID',source.program_catalog_id,null
from ca_program_catalog_map source join catalog.institutions i on i.country_code='CA' and i.slug=source.canonical_slug and i.status<>'inactive'
on conflict(identifier_system,identifier_value) do update set institution_id=excluded.institution_id;

create or replace view public.institution_program_catalog_identity_ca_v1 with (security_invoker=true) as
select i.id as institution_id,i.country_code,i.slug,i.canonical_name,i.institution_kind,i.ownership_type,i.website_url,staging.identifier_value as program_catalog_id,dli.identifier_value as dli_number,dli.source_url as dli_source_url
from catalog.institutions i join catalog.institution_identifiers staging on staging.institution_id=i.id and staging.identifier_system='CA_PROGRAM_CATALOG_ID'
left join catalog.institution_identifiers dli on dli.institution_id=i.id and dli.identifier_system='CA_DLI'
where i.country_code='CA' and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_program_catalog_identity_ca_v1 from public,anon,authenticated; grant select on public.institution_program_catalog_identity_ca_v1 to service_role;

do $$ declare ca_institution_count integer; catalog_identity_count integer; dli_count integer; acquisition_count integer; public_count integer; website_count integer; duplicate_catalog_target_count integer; nunavut_dli_count integer; begin
select count(*) into ca_institution_count from catalog.institutions where country_code='CA' and status<>'inactive'; if ca_institution_count<>62 then raise exception 'Expected 62 active Canadian institutions after acquisition, found %',ca_institution_count; end if;
select count(*) into catalog_identity_count from public.institution_program_catalog_identity_ca_v1; if catalog_identity_count<>49 then raise exception 'Expected 49 deterministic Canada program-catalog institution identities, found %',catalog_identity_count; end if;
select count(*) into dli_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where i.country_code='CA' and i.status<>'inactive' and ii.identifier_system='CA_DLI'; if dli_count<>61 then raise exception 'Expected 61 Canadian DLI identities after acquisition, found %',dli_count; end if;
select count(*) into acquisition_count from catalog.institutions i join ca_new_institutions source on source.canonical_slug=i.slug where i.country_code='CA' and i.status<>'inactive'; if acquisition_count<>32 then raise exception 'Expected 32 newly acquired Canadian institutions, found %',acquisition_count; end if;
select count(*) into public_count from catalog.institutions i join ca_new_institutions source on source.canonical_slug=i.slug where i.ownership_type='public'; if public_count<>32 then raise exception 'Expected all 32 acquired Canadian institutions to be source-backed public institutions, found %',public_count; end if;
select count(*) into website_count from catalog.institutions i join ca_new_institutions source on source.canonical_slug=i.slug where i.website_url~'^https://'; if website_count<>32 then raise exception 'Expected HTTPS official websites for all 32 acquired Canadian institutions, found %',website_count; end if;
select count(*)-count(distinct institution_id) into duplicate_catalog_target_count from public.institution_program_catalog_identity_ca_v1; if duplicate_catalog_target_count<>0 then raise exception 'Found % duplicate Canadian program-catalog mappings to canonical institutions',duplicate_catalog_target_count; end if;
select count(*) into nunavut_dli_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where i.country_code='CA' and i.slug='nunavut-arctic-college' and ii.identifier_system='CA_DLI'; if nunavut_dli_count<>0 then raise exception 'Nunavut Arctic College must not receive a fabricated CA_DLI identity'; end if;
end $$;;
