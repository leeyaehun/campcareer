do $$
begin
  if exists(select 1 from public.program_catalog_fi_staging where institution_id is null) then raise exception 'FI program canonicalization blocked: staged program missing institution_id'; end if;
  if (select count(*) from public.program_catalog_fi_staging) <> (select count(*) from public.program_international_fi_staging) then raise exception 'FI program canonicalization blocked: international evidence not 1:1'; end if;
end $$;

insert into catalog.programmes(id,institution_id,canonical_title,programme_type,field_name,default_duration_months,status,updated_at)
select md5('FI|PROGRAM|'||p.source_program_key)::uuid,p.institution_id,p.title,p.degree_level,p.field_category,case when p.duration_years is null then null else greatest(1,round(p.duration_years*12)::int) end,'active',now()
from public.program_catalog_fi_staging p where p.verification_tier in ('A','B')
on conflict(id) do update set institution_id=excluded.institution_id,canonical_title=excluded.canonical_title,programme_type=excluded.programme_type,field_name=excluded.field_name,default_duration_months=excluded.default_duration_months,status='active',updated_at=now();

insert into catalog.programme_identifiers(programme_id,identifier_system,identifier_value,source_url,valid_from,valid_to)
select md5('FI|PROGRAM|'||p.source_program_key)::uuid,'FI_OFFICIAL_PROGRAM_KEY',p.source_name||':'||p.source_program_key,p.official_program_url,p.source_as_of,null
from public.program_catalog_fi_staging p where p.verification_tier in ('A','B')
on conflict(identifier_system,identifier_value) do update set programme_id=excluded.programme_id,source_url=excluded.source_url,valid_from=excluded.valid_from,valid_to=null;

insert into catalog.programme_offerings(id,programme_id,campus_id,market,delivery_mode,intake_label,intake_start_date,application_deadline,duration_months,enrolment_status,source_url,valid_from,valid_to,created_at,updated_at,source_system,source_record_key,verification_status,source_checked_at)
select md5('FI|OFFERING|'||p.source_program_key)::uuid,md5('FI|PROGRAM|'||p.source_program_key)::uuid,
  (select c.id from catalog.campuses c where c.institution_id=p.institution_id and c.status='active' order by case when lower(coalesce(c.city,''))=lower(coalesce(p.city,'')) then 0 else 1 end,c.created_at,c.id limit 1),
  'international','on_campus',x.intake_label,x.intake_start_date,x.application_deadline,case when p.duration_years is null then null else greatest(1,round(p.duration_years*12)::int) end,
  case x.international_admission_status when 'open' then 'open' when 'closed' then 'closed' when 'not_yet_open' then 'planned' when 'restricted' then 'closed' else 'unknown' end,
  coalesce(x.admission_source_url,p.international_source_url,p.official_program_url),coalesce(x.source_as_of,p.source_as_of),null,now(),now(),'FI_OFFICIAL',p.source_name||':'||p.source_program_key,
  case when x.verification_status in ('verified_general','verified_program') then 'verified' when x.verification_status='stale' then 'stale' when x.verification_status='rejected' then 'rejected' else 'unverified' end,coalesce(x.verified_at,p.collected_at)
from public.program_catalog_fi_staging p join public.program_international_fi_staging x on x.program_catalog_id=p.id
where p.verification_tier in ('A','B')
on conflict(id) do update set campus_id=excluded.campus_id,market=excluded.market,delivery_mode=excluded.delivery_mode,intake_label=excluded.intake_label,intake_start_date=excluded.intake_start_date,application_deadline=excluded.application_deadline,duration_months=excluded.duration_months,enrolment_status=excluded.enrolment_status,source_url=excluded.source_url,valid_from=excluded.valid_from,valid_to=null,source_system=excluded.source_system,source_record_key=excluded.source_record_key,verification_status=excluded.verification_status,source_checked_at=excluded.source_checked_at,updated_at=now();

create or replace view public.program_explorer_fi_v1 with (security_invoker=true) as
select pr.id as programme_id,trim(both '-' from regexp_replace(lower(i.slug||'-'||p.title||'-'||lower(p.degree_level)),'[^a-z0-9]+','-','g')) as program_slug,pr.canonical_title as title,p.source_program_name,p.degree_level,p.school_faculty,p.field_category,p.language_context,p.verification_tier,p.collection_status,i.id as institution_id,i.canonical_name as institution_name,i.slug as institution_slug,p.city,pr.default_duration_months,p.official_program_url,p.international_source_url,x.international_students_eligible,x.international_admission_status,x.language_requirement_context,x.visa_context,x.intake_label,x.intake_start_date,x.application_deadline,x.admission_source_url,x.verification_status as admission_verification_status,coalesce(array_agg(distinct o.canonical_career_id order by o.canonical_career_id) filter(where o.canonical_career_id is not null),array[]::text[]) as occupation_ids
from public.program_catalog_fi_staging p join catalog.programmes pr on pr.id=md5('FI|PROGRAM|'||p.source_program_key)::uuid join catalog.institutions i on i.id=pr.institution_id join public.program_international_fi_staging x on x.program_catalog_id=p.id left join public.program_occupation_fi_staging o on o.program_catalog_id=p.id and o.review_status='approved'
where pr.status='active' and p.verification_tier in ('A','B')
group by pr.id,p.title,p.source_program_name,p.degree_level,p.school_faculty,p.field_category,p.language_context,p.verification_tier,p.collection_status,i.id,i.canonical_name,i.slug,p.city,pr.default_duration_months,p.official_program_url,p.international_source_url,x.international_students_eligible,x.international_admission_status,x.language_requirement_context,x.visa_context,x.intake_label,x.intake_start_date,x.application_deadline,x.admission_source_url,x.verification_status;

create or replace view public.program_detail_fi_v1 with (security_invoker=true) as
select e.*,'Official Finnish university programme listing with current institutional/Studyinfo application context; institutional quality assurance is not represented as programme-level accreditation.'::text as source_verification_label,false as has_programme_accreditation_claim
from public.program_explorer_fi_v1 e;

revoke all on public.program_explorer_fi_v1 from public,anon,authenticated;
revoke all on public.program_detail_fi_v1 from public,anon,authenticated;
grant select on public.program_explorer_fi_v1 to service_role;
grant select on public.program_detail_fi_v1 to service_role;
