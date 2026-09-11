do $$
begin
  if exists(select 1 from public.program_catalog_kr_staging where institution_id is null) then
    raise exception 'KR program canonicalization blocked: staged program missing institution_id';
  end if;
  if (select count(*) from public.program_catalog_kr_staging) <> (select count(*) from public.program_international_kr_staging) then
    raise exception 'KR program canonicalization blocked: international evidence not 1:1';
  end if;
end $$;

insert into catalog.programmes(id,institution_id,canonical_title,qualification_level_id,programme_type,field_code,field_name,default_duration_months,status,created_at,updated_at)
select md5('KR|PROGRAM|'||p.source_program_key)::uuid,p.institution_id,p.title,null,p.degree_level,null,p.field_category,case when p.duration_years is null then null else greatest(1,round(p.duration_years*12)::int) end,'active',now(),now()
from public.program_catalog_kr_staging p where p.verification_tier in ('A','B')
on conflict(id) do update set institution_id=excluded.institution_id,canonical_title=excluded.canonical_title,programme_type=excluded.programme_type,field_name=excluded.field_name,default_duration_months=excluded.default_duration_months,status='active',updated_at=now();

insert into catalog.programme_identifiers(programme_id,identifier_system,identifier_value,source_url,valid_from,valid_to)
select md5('KR|PROGRAM|'||p.source_program_key)::uuid,'KR_STUDYINKOREA_PROGRAM_KEY',p.source_program_key,p.studyinkorea_url,p.source_as_of,null
from public.program_catalog_kr_staging p where p.verification_tier in ('A','B')
on conflict(identifier_system,identifier_value) do update set programme_id=excluded.programme_id,source_url=excluded.source_url,valid_from=excluded.valid_from,valid_to=null;

insert into catalog.programme_offerings(id,programme_id,campus_id,market,delivery_mode,intake_label,intake_start_date,application_deadline,duration_months,enrolment_status,source_url,valid_from,valid_to,created_at,updated_at,source_system,source_record_key,verification_status,source_checked_at)
select md5('KR|OFFERING|'||p.source_program_key)::uuid,md5('KR|PROGRAM|'||p.source_program_key)::uuid,c.id,'international','on_campus',coalesce(x.intake_label,x.enrollment_period),x.intake_start_date,x.application_deadline,case when p.duration_years is null then null else greatest(1,round(p.duration_years*12)::int) end,case x.international_admission_status when 'open' then 'open' when 'closed' then 'closed' when 'not_yet_open' then 'planned' else 'unknown' end,coalesce(x.admission_source_url,p.official_program_url,p.studyinkorea_url),coalesce(x.source_as_of,p.source_as_of),null,now(),now(),'KR_STUDYINKOREA',p.source_program_key,case when x.verification_status in ('verified_general','verified_program') then 'verified' when x.verification_status='stale' then 'stale' when x.verification_status='rejected' then 'rejected' else 'unverified' end,coalesce(x.verified_at,p.collected_at)
from public.program_catalog_kr_staging p join public.program_international_kr_staging x on x.program_catalog_id=p.id
left join lateral (select cc.id from catalog.campuses cc where cc.institution_id=p.institution_id and cc.status='active' order by cc.created_at,cc.id limit 1) c on true
where p.verification_tier in ('A','B')
on conflict(id) do update set campus_id=excluded.campus_id,market=excluded.market,delivery_mode=excluded.delivery_mode,intake_label=excluded.intake_label,intake_start_date=excluded.intake_start_date,application_deadline=excluded.application_deadline,duration_months=excluded.duration_months,enrolment_status=excluded.enrolment_status,source_url=excluded.source_url,valid_from=excluded.valid_from,valid_to=null,source_system=excluded.source_system,source_record_key=excluded.source_record_key,verification_status=excluded.verification_status,source_checked_at=excluded.source_checked_at,updated_at=now();

create or replace view public.program_occupation_kr_v1 with (security_invoker=true) as
select md5('KR|PROGRAM|'||p.source_program_key)::uuid as programme_id,p.source_program_key,o.canonical_career_id,o.relation_type,o.source_checked_at,o.reviewer_note
from public.program_catalog_kr_staging p join public.program_occupation_kr_staging o on o.program_catalog_id=p.id and o.review_status='approved' where p.verification_tier in ('A','B');

create or replace view public.program_explorer_kr_v1 with (security_invoker=true) as
select pr.id as programme_id,regexp_replace(trim(both '-' from lower(i.slug||'-'||split_part(p.source_program_key,':',4))),'-+','-','g') as program_slug,pr.canonical_title as title,p.source_department_name,p.degree_level,p.affiliation,p.field_category,p.english_course_ratio,p.english_proficiency,p.verification_tier,i.id as institution_id,i.canonical_name as institution_name,i.slug as institution_slug,p.city,pr.default_duration_months,p.tuition_fee_krw,p.official_program_url,p.studyinkorea_url,x.international_students_eligible,x.international_admission_status,x.visa_context,x.enrollment_period,x.application_period,x.intake_label,x.intake_start_date,x.application_deadline,x.admission_source_url,x.admission_guide_url,x.verification_status as admission_verification_status,coalesce(array_agg(distinct o.canonical_career_id order by o.canonical_career_id) filter(where o.canonical_career_id is not null),array[]::text[]) as occupation_ids
from public.program_catalog_kr_staging p join catalog.programmes pr on pr.id=md5('KR|PROGRAM|'||p.source_program_key)::uuid join catalog.institutions i on i.id=pr.institution_id join public.program_international_kr_staging x on x.program_catalog_id=p.id left join public.program_occupation_kr_staging o on o.program_catalog_id=p.id and o.review_status='approved'
where pr.status='active' and p.verification_tier in ('A','B')
group by pr.id,p.source_program_key,pr.canonical_title,p.source_department_name,p.degree_level,p.affiliation,p.field_category,p.english_course_ratio,p.english_proficiency,p.verification_tier,i.id,i.canonical_name,i.slug,p.city,pr.default_duration_months,p.tuition_fee_krw,p.official_program_url,p.studyinkorea_url,x.international_students_eligible,x.international_admission_status,x.visa_context,x.enrollment_period,x.application_period,x.intake_label,x.intake_start_date,x.application_deadline,x.admission_source_url,x.admission_guide_url,x.verification_status;

create or replace view public.program_detail_kr_v1 with (security_invoker=true) as
select e.*,'Study in Korea / NIIED international degree-seeking source'::text as source_verification_label,false as has_programme_accreditation_claim from public.program_explorer_kr_v1 e;

revoke all on public.program_occupation_kr_v1 from public,anon,authenticated;
revoke all on public.program_explorer_kr_v1 from public,anon,authenticated;
revoke all on public.program_detail_kr_v1 from public,anon,authenticated;
grant select on public.program_occupation_kr_v1 to service_role;
grant select on public.program_explorer_kr_v1 to service_role;
grant select on public.program_detail_kr_v1 to service_role;
;
