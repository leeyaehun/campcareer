with source_rows(legacy_provider_id, brin_code, website_url) as (
  values
    ('nl-01', '21PF', 'https://www.tudelft.nl/'),
    ('nl-02', '21PK', 'https://www.uva.nl/'),
    ('nl-03', '21PD', 'https://www.uu.nl/'),
    ('nl-04', '21PB', 'https://www.universiteitleiden.nl/'),
    ('nl-05', '21PG', 'https://www.tue.nl/'),
    ('nl-06', '21PE', 'https://www.eur.nl/'),
    ('nl-07', '21PC', 'https://www.rug.nl/'),
    ('nl-08', '21PI', 'https://www.wur.nl/'),
    ('nl-09', '21PL', 'https://www.vu.nl/'),
    ('nl-10', '21PH', 'https://www.utwente.nl/'),
    ('nl-11', '21PJ', 'https://www.maastrichtuniversity.nl/'),
    ('nl-12', '21PM', 'https://www.ru.nl/'),
    ('nl-13', '21PN', 'https://www.tilburguniversity.edu/')
), resolved as (
  select s.*, legacy.institution_id
  from source_rows s
  join catalog.institution_identifiers legacy on legacy.identifier_system='NL_PROVIDER_ID' and legacy.identifier_value=s.legacy_provider_id
  join catalog.institutions i on i.id=legacy.institution_id and i.country_code='NL'
)
update catalog.institutions i
set institution_kind='university', ownership_type=null, website_url=r.website_url, updated_at=now()
from resolved r where i.id=r.institution_id;

with identity_rows(legacy_provider_id, brin_code) as (
  values
    ('nl-01','21PF'),('nl-02','21PK'),('nl-03','21PD'),('nl-04','21PB'),('nl-05','21PG'),('nl-06','21PE'),('nl-07','21PC'),('nl-08','21PI'),('nl-09','21PL'),('nl-10','21PH'),('nl-11','21PJ'),('nl-12','21PM'),('nl-13','21PN')
)
insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select legacy.institution_id,'NL_BRIN',source.brin_code,'https://onderwijsdata.duo.nl/datasets/adressen_ho/resources/bf1da9c6-c688-4873-91b1-b12c9ac2c132'
from identity_rows source
join catalog.institution_identifiers legacy on legacy.identifier_system='NL_PROVIDER_ID' and legacy.identifier_value=source.legacy_provider_id
join catalog.institutions i on i.id=legacy.institution_id and i.country_code='NL'
on conflict (identifier_system,identifier_value) do update set institution_id=excluded.institution_id,source_url=excluded.source_url;

create or replace view public.institution_identity_nl_v1 with (security_invoker=true) as
select i.id as institution_id,i.country_code,i.slug,i.canonical_name,official.identifier_value as brin_code,official.source_url as brin_source_url,legacy.identifier_value as legacy_provider_id
from catalog.institutions i
join catalog.institution_identifiers official on official.institution_id=i.id and official.identifier_system='NL_BRIN'
left join catalog.institution_identifiers legacy on legacy.institution_id=i.id and legacy.identifier_system='NL_PROVIDER_ID'
where i.country_code='NL' and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_identity_nl_v1 from public,anon,authenticated;
grant select on public.institution_identity_nl_v1 to service_role;

do $$ declare
 institution_count int; official_count int; legacy_count int; invalid_code_count int; missing_official_count int; duplicate_institution_count int; duplicate_value_count int; wrong_source_count int; bad_kind_count int; missing_website_count int; nonnull_ownership_count int;
begin
 select count(*) into institution_count from catalog.institutions where country_code='NL' and status<>'inactive'; if institution_count<>13 then raise exception 'Expected 13 active NL institutions, found %',institution_count; end if;
 select count(*) into official_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='NL_BRIN' and i.country_code='NL'; if official_count<>13 then raise exception 'Expected 13 NL_BRIN identities, found %',official_count; end if;
 select count(*) into legacy_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='NL_PROVIDER_ID' and i.country_code='NL'; if legacy_count<>13 then raise exception 'Expected 13 legacy NL provider identities, found %',legacy_count; end if;
 select count(*) into invalid_code_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='NL_BRIN' and i.country_code='NL' and ii.identifier_value !~ '^[0-9]{2}[A-Z]{2}$'; if invalid_code_count>0 then raise exception 'Found % invalid NL BRIN codes',invalid_code_count; end if;
 select count(*) into missing_official_count from catalog.institution_identifiers legacy join catalog.institutions i on i.id=legacy.institution_id left join catalog.institution_identifiers official on official.institution_id=i.id and official.identifier_system='NL_BRIN' where legacy.identifier_system='NL_PROVIDER_ID' and i.country_code='NL' and official.id is null; if missing_official_count>0 then raise exception 'Found % legacy NL providers without official BRIN identity',missing_official_count; end if;
 select count(*) into duplicate_institution_count from (select ii.institution_id from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='NL_BRIN' and i.country_code='NL' group by ii.institution_id having count(*)>1) d; if duplicate_institution_count>0 then raise exception 'Found % NL institutions with multiple BRIN identities',duplicate_institution_count; end if;
 select count(*) into duplicate_value_count from (select identifier_value from catalog.institution_identifiers where identifier_system='NL_BRIN' group by identifier_value having count(*)>1) d; if duplicate_value_count>0 then raise exception 'Found % duplicated NL BRIN values',duplicate_value_count; end if;
 select count(*) into wrong_source_count from catalog.institution_identifiers ii join catalog.institutions i on i.id=ii.institution_id where ii.identifier_system='NL_BRIN' and i.country_code='NL' and ii.source_url is distinct from 'https://onderwijsdata.duo.nl/datasets/adressen_ho/resources/bf1da9c6-c688-4873-91b1-b12c9ac2c132'; if wrong_source_count>0 then raise exception 'Found % NL BRIN identities without canonical DUO/RIO provenance',wrong_source_count; end if;
 select count(*) into bad_kind_count from catalog.institutions where country_code='NL' and status<>'inactive' and institution_kind is distinct from 'university'; if bad_kind_count>0 then raise exception 'Found % NL institutions without university kind',bad_kind_count; end if;
 select count(*) into missing_website_count from catalog.institutions where country_code='NL' and status<>'inactive' and (website_url is null or website_url !~ '^https://'); if missing_website_count>0 then raise exception 'Found % NL institutions without HTTPS official website',missing_website_count; end if;
 select count(*) into nonnull_ownership_count from catalog.institutions where country_code='NL' and status<>'inactive' and ownership_type is not null; if nonnull_ownership_count>0 then raise exception 'Found % NL institutions with inferred ownership_type',nonnull_ownership_count; end if;
end $$;;
