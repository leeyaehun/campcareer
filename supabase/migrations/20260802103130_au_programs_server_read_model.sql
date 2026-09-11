-- AU Nursing server-only read surface.
--
-- The canonical catalog remains private. These views project only the fields
-- needed by the server-side AU Nursing audit repository and are exposed to
-- PostgREST solely for service_role. They deliberately do not replace any
-- user-facing fixture or legacy programme page yet.

create schema if not exists api_private;
revoke all on schema api_private from public, anon, authenticated;
grant usage on schema api_private to service_role;
alter default privileges for role postgres in schema api_private
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema api_private
  revoke execute on functions from public, anon, authenticated;
create or replace view api_private.au_nursing_programme_catalog_v1
with (security_invoker = true) as
select
  pi.programme_id::text as identifier_programme_id,
  pi.identifier_system,
  pi.identifier_value,
  pi.source_url as identifier_source_url,
  p.id::text as programme_id,
  p.institution_id::text as programme_institution_id,
  p.canonical_title,
  p.qualification_level_id::text as qualification_level_id,
  p.programme_type,
  p.field_code,
  p.field_name,
  p.default_duration_months,
  p.status as programme_status,
  i.id::text as institution_id,
  i.country_code as institution_country_code,
  i.canonical_name as institution_name,
  i.website_url as institution_website_url,
  i.status as institution_status,
  ql.id::text as qualification_id,
  ql.label as qualification_label,
  ql.level_code as qualification_level_code,
  o.id::text as offering_id,
  o.programme_id::text as offering_programme_id,
  o.campus_id::text as offering_campus_id,
  o.market as offering_market,
  o.intake_label,
  o.intake_start_date,
  o.duration_months as offering_duration_months,
  o.enrolment_status,
  o.source_url as offering_source_url,
  o.valid_from as offering_valid_from,
  o.valid_to as offering_valid_to,
  c.id::text as campus_id,
  c.institution_id::text as campus_institution_id,
  c.name as campus_name,
  c.city as campus_city,
  c.region as campus_region,
  c.country_code as campus_country_code,
  c.status as campus_status
from catalog.programme_identifiers pi
join catalog.programmes p on p.id = pi.programme_id
join catalog.institutions i on i.id = p.institution_id
left join core.qualification_levels ql on ql.id = p.qualification_level_id
left join catalog.programme_offerings o on o.programme_id = p.id
left join catalog.campuses c on c.id = o.campus_id
where i.country_code = 'AU'
  and p.field_name ilike '%nursing%';
create or replace view api_private.au_nursing_programme_fees_v1
with (security_invoker = true) as
select
  f.id::text as fee_id,
  f.offering_id::text as offering_id,
  f.fee_type,
  f.amount,
  f.currency_code,
  f.billing_basis,
  f.student_market,
  f.evidence_id::text as evidence_id,
  f.effective_from,
  f.effective_to
from catalog.programme_fees f
join catalog.programme_offerings o on o.id = f.offering_id
join catalog.programmes p on p.id = o.programme_id
join catalog.institutions i on i.id = p.institution_id
where i.country_code = 'AU'
  and p.field_name ilike '%nursing%';
create or replace view api_private.au_nursing_programme_requirements_v1
with (security_invoker = true) as
select
  r.id::text as requirement_id,
  r.offering_id::text as offering_id,
  r.requirement_type,
  r.requirement_text,
  r.evidence_id::text as evidence_id,
  r.effective_from,
  r.effective_to,
  r.review_status
from catalog.programme_requirements r
join catalog.programme_offerings o on o.id = r.offering_id
join catalog.programmes p on p.id = o.programme_id
join catalog.institutions i on i.id = p.institution_id
where i.country_code = 'AU'
  and p.field_name ilike '%nursing%';
create or replace view api_private.au_nursing_programme_accreditations_v1
with (security_invoker = true) as
select
  a.id::text as accreditation_id,
  a.programme_id::text as programme_id,
  a.campus_id::text as campus_id,
  a.authority_name,
  a.authority_url,
  a.accreditation_type,
  a.status,
  a.status_text,
  a.evidence_id::text as evidence_id,
  a.effective_from,
  a.effective_to,
  a.last_checked_at,
  a.review_status
from catalog.programme_accreditations a
join catalog.programmes p on p.id = a.programme_id
join catalog.institutions i on i.id = p.institution_id
where i.country_code = 'AU'
  and p.field_name ilike '%nursing%';
create or replace view api_private.au_nursing_programme_evidence_v1
with (security_invoker = true) as
with nursing_evidence as (
  select f.evidence_id
  from catalog.programme_fees f
  join catalog.programme_offerings o on o.id = f.offering_id
  join catalog.programmes p on p.id = o.programme_id
  join catalog.institutions i on i.id = p.institution_id
  where i.country_code = 'AU' and p.field_name ilike '%nursing%' and f.evidence_id is not null
  union
  select r.evidence_id
  from catalog.programme_requirements r
  join catalog.programme_offerings o on o.id = r.offering_id
  join catalog.programmes p on p.id = o.programme_id
  join catalog.institutions i on i.id = p.institution_id
  where i.country_code = 'AU' and p.field_name ilike '%nursing%' and r.evidence_id is not null
  union
  select a.evidence_id
  from catalog.programme_accreditations a
  join catalog.programmes p on p.id = a.programme_id
  join catalog.institutions i on i.id = p.institution_id
  where i.country_code = 'AU' and p.field_name ilike '%nursing%' and a.evidence_id is not null
)
select
  mo.id::text as observation_id,
  mo.metric_key,
  mo.scope_type,
  mo.scope_id,
  mo.value,
  mo.unit,
  mo.source_snapshot_id::text as source_snapshot_id,
  mo.evidence_kind,
  mo.confidence,
  mo.methodology,
  mo.assumptions,
  mo.effective_from,
  mo.effective_to,
  mo.review_status,
  mo.reviewed_at,
  ss.id::text as snapshot_id,
  ss.source_id::text as snapshot_source_id,
  ss.source_url as snapshot_source_url,
  ss.published_at as snapshot_published_at,
  ss.data_as_of as snapshot_data_as_of,
  ss.retrieved_at as snapshot_retrieved_at,
  ss.valid_from as snapshot_valid_from,
  ss.valid_to as snapshot_valid_to,
  ss.snapshot_status,
  s.id::text as source_id,
  s.source_key,
  s.organisation_name,
  s.source_name,
  s.source_type,
  s.canonical_url,
  s.country_code as source_country_code,
  s.active as source_active
from nursing_evidence ne
join evidence.metric_observations mo on mo.id = ne.evidence_id
join evidence.source_snapshots ss on ss.id = mo.source_snapshot_id
join evidence.sources s on s.id = ss.source_id;
revoke all on all tables in schema api_private from public, anon, authenticated;
grant select on table
  api_private.au_nursing_programme_catalog_v1,
  api_private.au_nursing_programme_fees_v1,
  api_private.au_nursing_programme_requirements_v1,
  api_private.au_nursing_programme_accreditations_v1,
  api_private.au_nursing_programme_evidence_v1
to service_role;
-- `authenticator` is the single, repository-controlled PostgREST schema
-- configuration source. The schema ACLs above still deny anon/authenticated.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, api_private';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
-- This View has no runtime reader in this repository. The importer retains
-- only the service-role SELECT/INSERT/UPDATE contract during its ingest move.
alter view public.regulatory_requirements_au set (security_invoker = true);
revoke all on table public.regulatory_requirements_au from public, anon, authenticated, service_role;
grant select, insert, update on table public.regulatory_requirements_au to service_role;
