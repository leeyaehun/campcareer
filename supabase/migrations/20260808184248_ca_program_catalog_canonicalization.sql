create temp table ca_program_source_rows on commit drop as
select s.*,identity.institution_id as canonical_institution_id,identity.slug as canonical_institution_slug,lower(regexp_replace(btrim(s.title),'\s+',' ','g')) as normalized_title,coalesce(lower(btrim(s.credential_type)),'') as normalized_credential,coalesce(lower(btrim(s.program_code)),'') as normalized_program_code,md5(s.source_name||chr(31)||s.source_program_key) as source_hash,
case when s.source_status ~ '^(excluded_|cancelled|suspended|not_accepting|not_currently|one_time_delivery_closed|admissions_suspended|legacy_program_not_accepting)' or s.source_status in ('official_link_verified_no_current_offering','official_program_page_international_ineligible_2026') then 'inactive'
when s.source_status ~ '^pending_review' or s.source_status ~ '^legacy_program_pre_' or s.source_status ~ '^starts_fall_2027' then 'unknown' else 'active' end as row_status
from public.program_catalog_ca_staging s
join public.institution_program_catalog_identity_ca_v1 identity on identity.program_catalog_id=s.institution_id;
alter table ca_program_source_rows add primary key(source_hash);

do $$ declare source_count integer; institution_count integer; missing_title_count integer; begin
select count(*),count(distinct canonical_institution_id),count(*) filter(where title is null or btrim(title)='') into source_count,institution_count,missing_title_count from ca_program_source_rows;
if source_count<>6638 or institution_count<>49 then raise exception 'Expected 6638 Canada source rows across 49 institutions; found % across %',source_count,institution_count; end if;
if missing_title_count>0 then raise exception 'Found % Canada staging rows without canonicalizable title',missing_title_count; end if; end $$;

create temp table ca_program_groups on commit drop as
select gen_random_uuid() as programme_id,canonical_institution_id as institution_id,institution_id as program_catalog_id,institution_id||':'||md5(normalized_title||chr(31)||normalized_credential||chr(31)||normalized_program_code) as canonical_key,min(title) as canonical_title,min(nullif(btrim(credential_type),'')) as programme_type,min(nullif(btrim(field_name),'')) as field_name,
case when max(duration_years) filter(where duration_years>0) is null then null else round(max(duration_years) filter(where duration_years>0)*12)::integer end as default_duration_months,
case when bool_or(row_status='active') then 'active' when bool_or(row_status='unknown') then 'unknown' else 'inactive' end as canonical_status,min(coalesce(official_program_url,source_url)) as representative_source_url,max(source_as_of) as source_as_of,count(*)::integer as source_count
from ca_program_source_rows
group by canonical_institution_id,institution_id,normalized_title,normalized_credential,normalized_program_code;
alter table ca_program_groups add primary key(canonical_key);

insert into catalog.programmes(id,institution_id,canonical_title,qualification_level_id,programme_type,field_code,field_name,default_duration_months,status,created_at,updated_at)
select programme_id,institution_id,canonical_title,null,programme_type,null,field_name,default_duration_months,canonical_status,now(),now() from ca_program_groups;

insert into catalog.programme_identifiers(programme_id,identifier_system,identifier_value,source_url,valid_from)
select programme_id,'CA_PROGRAM_CANONICAL_KEY',canonical_key,representative_source_url,source_as_of from ca_program_groups;

insert into catalog.programme_identifiers(programme_id,identifier_system,identifier_value,source_url,valid_from)
select g.programme_id,'CA_PROGRAM_CATALOG_SOURCE_HASH',s.source_hash,coalesce(s.official_program_url,s.source_url),s.source_as_of
from ca_program_source_rows s join ca_program_groups g on g.institution_id=s.canonical_institution_id and g.program_catalog_id=s.institution_id and g.canonical_key=s.institution_id||':'||md5(s.normalized_title||chr(31)||s.normalized_credential||chr(31)||s.normalized_program_code);

insert into catalog.programme_offerings(programme_id,campus_id,market,delivery_mode,intake_label,intake_start_date,application_deadline,duration_months,enrolment_status,source_url,valid_from,valid_to,source_system,source_record_key,verification_status,source_checked_at,created_at,updated_at)
select g.programme_id,null,'unknown',null,null,null,null,g.default_duration_months,'unknown',g.representative_source_url,g.source_as_of,null,'CA_PROGRAM_CATALOG_CANONICAL',g.canonical_key,'verified',coalesce(g.source_as_of::timestamptz,now()),now(),now() from ca_program_groups g;

update catalog.programmes p set status='inactive',updated_at=now()
where exists(select 1 from catalog.programme_identifiers legacy where legacy.programme_id=p.id and legacy.identifier_system='LEGACY_COURSES_CA_ID')
and exists(select 1 from catalog.institutions i where i.id=p.institution_id and i.country_code='CA');

update catalog.programme_offerings po set verification_status='stale',valid_to=coalesce(po.valid_to,current_date),updated_at=now()
where exists(select 1 from catalog.programme_identifiers legacy join catalog.programmes p on p.id=legacy.programme_id join catalog.institutions i on i.id=p.institution_id where legacy.identifier_system='LEGACY_COURSES_CA_ID' and i.country_code='CA' and po.programme_id=p.id);

create or replace view public.program_catalog_canonical_ca_v1 with (security_invoker=true) as
select p.id as programme_id,p.institution_id,i.slug as institution_slug,i.canonical_name as institution_name,canonical.identifier_value as canonical_key,p.canonical_title,p.programme_type,p.field_name,p.default_duration_months,p.status,count(source.id)::integer as source_count,min(source.valid_from) as earliest_source_as_of,max(source.valid_from) as latest_source_as_of
from catalog.programmes p
join catalog.institutions i on i.id=p.institution_id and i.country_code='CA'
join catalog.programme_identifiers canonical on canonical.programme_id=p.id and canonical.identifier_system='CA_PROGRAM_CANONICAL_KEY'
left join catalog.programme_identifiers source on source.programme_id=p.id and source.identifier_system='CA_PROGRAM_CATALOG_SOURCE_HASH'
group by p.id,p.institution_id,i.slug,i.canonical_name,canonical.identifier_value,p.canonical_title,p.programme_type,p.field_name,p.default_duration_months,p.status;
revoke all on public.program_catalog_canonical_ca_v1 from public,anon,authenticated; grant select on public.program_catalog_canonical_ca_v1 to service_role;

do $$ declare canonical_count integer; source_identity_count integer; source_count_sum integer; active_count integer; inactive_count integer; unknown_count integer; active_institution_count integer; offering_count integer; campus_assigned_count integer; legacy_inactive_count integer; legacy_active_count integer; total_ca_programmes integer; total_active_ca_programmes integer; begin
select count(*),coalesce(sum(source_count),0),count(*) filter(where status='active'),count(*) filter(where status='inactive'),count(*) filter(where status='unknown'),count(distinct institution_id) filter(where status='active') into canonical_count,source_count_sum,active_count,inactive_count,unknown_count,active_institution_count from public.program_catalog_canonical_ca_v1;
if canonical_count<>6634 or source_count_sum<>6638 then raise exception 'Expected 6634 canonical Canada programmes / 6638 source rows; found % / %',canonical_count,source_count_sum; end if;
if active_count<>6454 or inactive_count<>145 or unknown_count<>35 then raise exception 'Unexpected Canada canonical status split: active %, inactive %, unknown %',active_count,inactive_count,unknown_count; end if;
if active_institution_count<>49 then raise exception 'Expected active canonical programmes across all 49 staged institutions, found %',active_institution_count; end if;
select count(*) into source_identity_count from catalog.programme_identifiers pi join catalog.programmes p on p.id=pi.programme_id join catalog.institutions i on i.id=p.institution_id where i.country_code='CA' and pi.identifier_system='CA_PROGRAM_CATALOG_SOURCE_HASH';
if source_identity_count<>6638 then raise exception 'Expected 6638 Canada programme source identities, found %',source_identity_count; end if;
select count(*),count(*) filter(where campus_id is not null) into offering_count,campus_assigned_count from catalog.programme_offerings where source_system='CA_PROGRAM_CATALOG_CANONICAL';
if offering_count<>6634 or campus_assigned_count<>0 then raise exception 'Expected 6634 neutral canonical offerings and zero campus assignments; found % / %',offering_count,campus_assigned_count; end if;
select count(*) filter(where p.status='inactive'),count(*) filter(where p.status='active') into legacy_inactive_count,legacy_active_count from catalog.programmes p join catalog.programme_identifiers legacy on legacy.programme_id=p.id and legacy.identifier_system='LEGACY_COURSES_CA_ID' join catalog.institutions i on i.id=p.institution_id and i.country_code='CA';
if legacy_inactive_count<>165 or legacy_active_count<>0 then raise exception 'Expected all 165 legacy Canadian programmes inactive; inactive %, active %',legacy_inactive_count,legacy_active_count; end if;
select count(*),count(*) filter(where p.status='active') into total_ca_programmes,total_active_ca_programmes from catalog.programmes p join catalog.institutions i on i.id=p.institution_id where i.country_code='CA';
if total_ca_programmes<>6799 or total_active_ca_programmes<>6454 then raise exception 'Expected 6799 total / 6454 active Canadian programmes after canonicalization; found % / %',total_ca_programmes,total_active_ca_programmes; end if;
end $$;;
