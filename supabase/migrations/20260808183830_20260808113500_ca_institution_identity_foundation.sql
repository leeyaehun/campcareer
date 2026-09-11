-- Canada institution identity foundation.
with identity_rows(legacy_provider_id, dli_number) as (
  values
    ('brock-university', 'O19394569014'),
    ('carleton-university', 'O19332687812'),
    ('concordia-university', 'O19359011007'),
    ('dalhousie-university', 'O19209939282'),
    ('macewan-university', 'O19092022262'),
    ('mcgill-university', 'O19359011033'),
    ('mcmaster-university', 'O19395535729'),
    ('memorial-university-of-newfoundland', 'O19440995346'),
    ('ontario-tech-university', 'O19315945002'),
    ('queen-s-university', 'O19376023352'),
    ('simon-fraser-university', 'O18781994282'),
    ('toronto-metropolitan-university', 'O19395677651'),
    ('universit-de-montr-al', 'O19359011045'),
    ('universit-du-qu-bec-montr-al', 'O19359011134'),
    ('universit-laval', 'O19359011020'),
    ('university-of-alberta', 'O19257171832'),
    ('university-of-british-columbia', 'O19330231062'),
    ('university-of-calgary', 'O18886830282'),
    ('university-of-guelph', 'O19305391192'),
    ('university-of-manitoba', 'O19091528512'),
    ('university-of-new-brunswick', 'O19348802512'),
    ('university-of-northern-british-columbia', 'O19283889692'),
    ('university-of-ottawa', 'O19397188593'),
    ('university-of-saskatchewan', 'O19425660421'),
    ('university-of-toronto', 'O19332746152'),
    ('university-of-victoria', 'O19280533442'),
    ('university-of-waterloo', 'O19305471522'),
    ('western-university', 'O19375892122'),
    ('wilfrid-laurier-university', 'O19395164307'),
    ('york-university', 'O19361109242')
), matched as (
  select source.legacy_provider_id, source.dli_number, legacy.institution_id
  from identity_rows source
  join catalog.institution_identifiers legacy
    on legacy.identifier_system = 'CA_PROVIDER_ID'
   and legacy.identifier_value = source.legacy_provider_id
  join catalog.institutions i
    on i.id = legacy.institution_id
   and i.country_code = 'CA'
)
update catalog.institutions i
set institution_kind = 'university', ownership_type = 'public'
from matched source
where i.id = source.institution_id;

with identity_rows(legacy_provider_id, dli_number) as (
  values
    ('brock-university', 'O19394569014'),
    ('carleton-university', 'O19332687812'),
    ('concordia-university', 'O19359011007'),
    ('dalhousie-university', 'O19209939282'),
    ('macewan-university', 'O19092022262'),
    ('mcgill-university', 'O19359011033'),
    ('mcmaster-university', 'O19395535729'),
    ('memorial-university-of-newfoundland', 'O19440995346'),
    ('ontario-tech-university', 'O19315945002'),
    ('queen-s-university', 'O19376023352'),
    ('simon-fraser-university', 'O18781994282'),
    ('toronto-metropolitan-university', 'O19395677651'),
    ('universit-de-montr-al', 'O19359011045'),
    ('universit-du-qu-bec-montr-al', 'O19359011134'),
    ('universit-laval', 'O19359011020'),
    ('university-of-alberta', 'O19257171832'),
    ('university-of-british-columbia', 'O19330231062'),
    ('university-of-calgary', 'O18886830282'),
    ('university-of-guelph', 'O19305391192'),
    ('university-of-manitoba', 'O19091528512'),
    ('university-of-new-brunswick', 'O19348802512'),
    ('university-of-northern-british-columbia', 'O19283889692'),
    ('university-of-ottawa', 'O19397188593'),
    ('university-of-saskatchewan', 'O19425660421'),
    ('university-of-toronto', 'O19332746152'),
    ('university-of-victoria', 'O19280533442'),
    ('university-of-waterloo', 'O19305471522'),
    ('western-university', 'O19375892122'),
    ('wilfrid-laurier-university', 'O19395164307'),
    ('york-university', 'O19361109242')
)
insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select legacy.institution_id,'CA_DLI',source.dli_number,
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html'
from identity_rows source
join catalog.institution_identifiers legacy
  on legacy.identifier_system = 'CA_PROVIDER_ID'
 and legacy.identifier_value = source.legacy_provider_id
join catalog.institutions i
  on i.id = legacy.institution_id
 and i.country_code = 'CA'
on conflict (identifier_system, identifier_value)
do update set institution_id=excluded.institution_id, source_url=excluded.source_url;

create or replace view public.institution_identity_ca_v1
with (security_invoker = true) as
select i.id as institution_id,i.country_code,i.slug,i.canonical_name,
  official.identifier_value as dli_number,official.source_url as dli_source_url,
  legacy.identifier_value as legacy_provider_id
from catalog.institutions i
join catalog.institution_identifiers official
  on official.institution_id=i.id and official.identifier_system='CA_DLI'
left join catalog.institution_identifiers legacy
  on legacy.institution_id=i.id and legacy.identifier_system='CA_PROVIDER_ID'
where i.country_code='CA' and i.status<>'inactive' and i.slug is not null;

comment on view public.institution_identity_ca_v1 is
  'Service-role Canadian institution identity read model. CA_DLI is the official IRCC Designated Learning Institution number; legacy_provider_id is retained only for deterministic historical import joins.';
revoke all on public.institution_identity_ca_v1 from public, anon, authenticated;
grant select on public.institution_identity_ca_v1 to service_role;

do $$
declare
  official_count integer; legacy_count integer; invalid_dli_count integer;
  missing_official_count integer; orphan_official_count integer;
  duplicate_institution_count integer; duplicate_value_count integer;
  wrong_source_count integer; university_count integer; public_count integer;
  active_program_count integer; toronto_ok boolean; ubc_ok boolean; mcgill_ok boolean;
begin
  select count(*) into official_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='CA_DLI' and i.country_code='CA';
  if official_count<>30 then raise exception 'Expected 30 CA_DLI identities, found %',official_count; end if;
  select count(*) into legacy_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='CA_PROVIDER_ID' and i.country_code='CA';
  if legacy_count<>30 then raise exception 'Expected 30 legacy Canadian provider identities, found %',legacy_count; end if;
  select count(*) into invalid_dli_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='CA_DLI' and i.country_code='CA' and ii.identifier_value !~ '^O[0-9]{11}$';
  if invalid_dli_count>0 then raise exception 'Found % invalid Canadian DLI numbers',invalid_dli_count; end if;
  select count(*) into missing_official_count from catalog.institution_identifiers legacy join catalog.institutions i on i.id=legacy.institution_id left join catalog.institution_identifiers official on official.institution_id=i.id and official.identifier_system='CA_DLI' where legacy.identifier_system='CA_PROVIDER_ID' and i.country_code='CA' and official.id is null;
  if missing_official_count>0 then raise exception 'Found % Canadian legacy providers without official DLI identity',missing_official_count; end if;
  select count(*) into orphan_official_count from catalog.institution_identifiers official join catalog.institutions i on i.id=official.institution_id left join catalog.institution_identifiers legacy on legacy.institution_id=i.id and legacy.identifier_system='CA_PROVIDER_ID' where official.identifier_system='CA_DLI' and i.country_code='CA' and legacy.id is null;
  if orphan_official_count>0 then raise exception 'Found % Canadian DLI identities without legacy provider identity',orphan_official_count; end if;
  select count(*)-count(distinct ii.institution_id) into duplicate_institution_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='CA_DLI' and i.country_code='CA';
  if duplicate_institution_count>0 then raise exception 'Found % duplicate Canadian DLI assignments by institution',duplicate_institution_count; end if;
  select count(*)-count(distinct ii.identifier_value) into duplicate_value_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='CA_DLI' and i.country_code='CA';
  if duplicate_value_count>0 then raise exception 'Found % duplicated Canadian DLI values',duplicate_value_count; end if;
  select count(*) into wrong_source_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='CA_DLI' and i.country_code='CA' and ii.source_url is distinct from 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html';
  if wrong_source_count>0 then raise exception 'Found % Canadian DLI identities without the canonical IRCC source URL',wrong_source_count; end if;
  select count(*) into university_count from catalog.institutions i join catalog.institution_identifiers official on official.institution_id=i.id and official.identifier_system='CA_DLI' where i.country_code='CA' and i.institution_kind='university';
  if university_count<>30 then raise exception 'Expected all 30 Canadian DLI-mapped institutions to be universities, found %',university_count; end if;
  select count(*) into public_count from catalog.institutions i join catalog.institution_identifiers official on official.institution_id=i.id and official.identifier_system='CA_DLI' where i.country_code='CA' and i.ownership_type='public';
  if public_count<>30 then raise exception 'Expected all 30 Canadian DLI-mapped institutions to be public, found %',public_count; end if;
  select count(*) into active_program_count from catalog.programmes p join catalog.institutions i on i.id=p.institution_id join catalog.institution_identifiers official on official.institution_id=i.id and official.identifier_system='CA_DLI' where i.country_code='CA' and p.status='active';
  if active_program_count<>165 then raise exception 'Expected 165 active programmes across Canadian DLI-mapped institutions, found %',active_program_count; end if;
  select exists(select 1 from public.institution_identity_ca_v1 v where v.slug='university-of-toronto' and v.dli_number='O19332746152' and v.legacy_provider_id='university-of-toronto') into toronto_ok;
  if not toronto_ok then raise exception 'University of Toronto DLI identity did not preserve the legacy provider join'; end if;
  select exists(select 1 from public.institution_identity_ca_v1 v where v.slug='university-of-british-columbia' and v.dli_number='O19330231062' and v.legacy_provider_id='university-of-british-columbia') into ubc_ok;
  if not ubc_ok then raise exception 'University of British Columbia DLI identity did not preserve the legacy provider join'; end if;
  select exists(select 1 from public.institution_identity_ca_v1 v where v.slug='mcgill-university' and v.dli_number='O19359011033' and v.legacy_provider_id='mcgill-university') into mcgill_ok;
  if not mcgill_ok then raise exception 'McGill University DLI identity did not preserve the legacy provider join'; end if;
end $$;;
