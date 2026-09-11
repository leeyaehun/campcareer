do $$
begin
  if exists(select 1 from public.program_catalog_ae_staging where institution_id is null) then
    raise exception 'AE program canonicalization blocked: staged program missing institution_id';
  end if;
  if exists(select 1 from public.program_catalog_ae_staging where accreditation_status <> 'active') then
    raise exception 'AE program canonicalization blocked: non-active staged program present';
  end if;
end $$;

insert into catalog.programmes(id,institution_id,canonical_title,qualification_level_id,programme_type,field_code,field_name,default_duration_months,status,created_at,updated_at)
select md5('AE|PROGRAM|'||p.source_name||'|'||p.source_program_key)::uuid,
       p.institution_id,p.title,null,coalesce(p.credential_type,p.programme_level),null,p.field_name,
       case when p.duration_years is null then null else greatest(1,round(p.duration_years*12)::int) end,
       'active',now(),now()
from public.program_catalog_ae_staging p
where p.accreditation_status='active' and p.verification_tier in ('A','B')
on conflict(id) do update set
  institution_id=excluded.institution_id,
  canonical_title=excluded.canonical_title,
  programme_type=excluded.programme_type,
  field_name=excluded.field_name,
  default_duration_months=excluded.default_duration_months,
  status='active',updated_at=now();

insert into catalog.programme_identifiers(programme_id,identifier_system,identifier_value,source_url,valid_from,valid_to)
select md5('AE|PROGRAM|'||p.source_name||'|'||p.source_program_key)::uuid,
       'AE_PROGRAM_SOURCE_KEY',p.source_name||'|'||p.source_program_key,
       coalesce(p.caa_detail_url,p.official_program_url,p.source_url),p.source_as_of,null
from public.program_catalog_ae_staging p
where p.accreditation_status='active' and p.verification_tier in ('A','B')
on conflict(identifier_system,identifier_value) do update set
  programme_id=excluded.programme_id,source_url=excluded.source_url,valid_from=excluded.valid_from,valid_to=null;

insert into catalog.programme_offerings(id,programme_id,campus_id,market,delivery_mode,intake_label,intake_start_date,application_deadline,duration_months,enrolment_status,source_url,valid_from,valid_to,created_at,updated_at,source_system,source_record_key,verification_status,source_checked_at)
select md5('AE|OFFERING|'||p.source_name||'|'||p.source_program_key)::uuid,
       md5('AE|PROGRAM|'||p.source_name||'|'||p.source_program_key)::uuid,
       c.id,
       case when x.international_students_eligible is true then 'international' when x.international_students_eligible is false then 'domestic' else 'unknown' end,
       'on_campus',x.intake_label,x.intake_start_date,x.application_deadline,
       case when p.duration_years is null then null else greatest(1,round(p.duration_years*12)::int) end,
       case x.international_admission_status when 'open' then 'open' when 'closed' then 'closed' when 'restricted' then 'closed' when 'not_yet_open' then 'planned' else 'unknown' end,
       coalesce(x.admission_source_url,p.official_program_url,p.caa_detail_url,p.source_url),
       coalesce(x.source_as_of,p.source_as_of),null,now(),now(),
       'AE_PROGRAM_STAGING',p.source_program_key,x.verification_status,
       coalesce(x.verified_at,p.collected_at)
from public.program_catalog_ae_staging p
join public.program_international_ae_staging x on x.program_catalog_id=p.id
left join lateral (
  select cc.id from catalog.campuses cc where cc.institution_id=p.institution_id and cc.status='active' order by cc.created_at,cc.id limit 1
) c on true
where p.accreditation_status='active' and p.verification_tier in ('A','B')
on conflict(id) do update set
  campus_id=excluded.campus_id,market=excluded.market,delivery_mode=excluded.delivery_mode,intake_label=excluded.intake_label,
  intake_start_date=excluded.intake_start_date,application_deadline=excluded.application_deadline,duration_months=excluded.duration_months,
  enrolment_status=excluded.enrolment_status,source_url=excluded.source_url,valid_from=excluded.valid_from,valid_to=null,
  source_system=excluded.source_system,source_record_key=excluded.source_record_key,verification_status=excluded.verification_status,
  source_checked_at=excluded.source_checked_at,updated_at=now();

insert into catalog.programme_accreditations(id,programme_id,campus_id,authority_name,authority_url,accreditation_type,status,status_text,evidence_id,effective_from,effective_to,last_checked_at,review_status,created_at,updated_at)
select md5('AE|ACCREDITATION|'||p.source_name||'|'||p.source_program_key)::uuid,
       md5('AE|PROGRAM|'||p.source_name||'|'||p.source_program_key)::uuid,
       c.id,
       case when p.source_name='MOE/DCT' then 'UAE Ministry of Education / National Qualifications Centre'
            when p.source_name='GCAA/EFTA' then 'UAE General Civil Aviation Authority'
            else 'Commission for Academic Accreditation (CAA)' end,
       case when p.source_name='MOE/DCT' then 'https://u.ae/en/information-and-services/education/technical-and-vocational-education'
            when p.source_name='GCAA/EFTA' then 'https://www.gcaa.gov.ae/en/departments/as/licensing'
            else 'https://www.caa.ae/Pages/Programs/All.aspx' end,
       case when p.source_name='MOE/DCT' then 'tvET_program_approval'
            when p.source_name='GCAA/EFTA' then 'aviation_training_approval'
            else 'program_accreditation' end,
       'approved','Active / source-verified',null,p.source_as_of,null,p.collected_at,'verified',now(),now()
from public.program_catalog_ae_staging p
left join lateral (
  select cc.id from catalog.campuses cc where cc.institution_id=p.institution_id and cc.status='active' order by cc.created_at,cc.id limit 1
) c on true
where p.accreditation_status='active' and p.verification_tier in ('A','B')
on conflict(id) do update set
  campus_id=excluded.campus_id,authority_name=excluded.authority_name,authority_url=excluded.authority_url,
  accreditation_type=excluded.accreditation_type,status=excluded.status,status_text=excluded.status_text,effective_from=excluded.effective_from,
  effective_to=null,last_checked_at=excluded.last_checked_at,review_status='verified',updated_at=now();

create or replace view public.program_occupation_ae_v1 with (security_invoker=true) as
select md5('AE|PROGRAM|'||p.source_name||'|'||p.source_program_key)::uuid as programme_id,
       p.source_program_key,
       o.canonical_career_id,
       o.relation_type,
       o.source_checked_at,
       o.reviewer_note
from public.program_catalog_ae_staging p
join public.program_occupation_ae_staging o on o.program_catalog_id=p.id and o.review_status='approved'
where p.accreditation_status='active' and p.verification_tier in ('A','B');

create or replace view public.program_explorer_ae_v1 with (security_invoker=true) as
select pr.id as programme_id,
       regexp_replace(trim(both '-' from regexp_replace(lower(p.source_program_key),'[^a-z0-9]+','-','g')),'-+','-','g') as program_slug,
       pr.canonical_title as title,
       p.programme_level,
       p.credential_type,
       p.field_name,
       p.verification_tier,
       i.id as institution_id,
       i.canonical_name as institution_name,
       i.slug as institution_slug,
       p.city,
       p.emirate,
       pr.default_duration_months,
       p.tuition_fee_aed,
       p.official_program_url,
       p.caa_detail_url,
       p.source_url as registry_source_url,
       x.international_students_eligible,
       x.international_admission_status,
       x.visa_sponsorship_available,
       x.intake_label,
       x.intake_start_date,
       x.application_deadline,
       x.admission_source_url,
       x.visa_source_url,
       x.verification_status as admission_verification_status,
       coalesce(array_agg(distinct o.canonical_career_id order by o.canonical_career_id) filter(where o.canonical_career_id is not null),array[]::text[]) as occupation_ids
from public.program_catalog_ae_staging p
join catalog.programmes pr on pr.id=md5('AE|PROGRAM|'||p.source_name||'|'||p.source_program_key)::uuid
join catalog.institutions i on i.id=pr.institution_id
join public.program_international_ae_staging x on x.program_catalog_id=p.id
left join public.program_occupation_ae_staging o on o.program_catalog_id=p.id and o.review_status='approved'
where pr.status='active' and p.accreditation_status='active' and p.verification_tier in ('A','B')
group by pr.id,p.source_program_key,pr.canonical_title,p.programme_level,p.credential_type,p.field_name,p.verification_tier,
         i.id,i.canonical_name,i.slug,p.city,p.emirate,pr.default_duration_months,p.tuition_fee_aed,p.official_program_url,p.caa_detail_url,p.source_url,
         x.international_students_eligible,x.international_admission_status,x.visa_sponsorship_available,x.intake_label,x.intake_start_date,x.application_deadline,
         x.admission_source_url,x.visa_source_url,x.verification_status;

create or replace view public.program_detail_ae_v1 with (security_invoker=true) as
select e.*,
       a.authority_name as accreditation_authority,
       a.authority_url as accreditation_authority_url,
       a.status as accreditation_status,
       a.review_status as accreditation_review_status
from public.program_explorer_ae_v1 e
left join catalog.programme_accreditations a on a.programme_id=e.programme_id and a.review_status='verified';

revoke all on public.program_occupation_ae_v1 from public,anon,authenticated;
revoke all on public.program_explorer_ae_v1 from public,anon,authenticated;
revoke all on public.program_detail_ae_v1 from public,anon,authenticated;
grant select on public.program_occupation_ae_v1 to service_role;
grant select on public.program_explorer_ae_v1 to service_role;
grant select on public.program_detail_ae_v1 to service_role;
;
