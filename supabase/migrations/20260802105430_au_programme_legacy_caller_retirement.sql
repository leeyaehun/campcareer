-- AU programme compatibility-view retirement.
--
-- These projections retain the current ingest-backed value contract for
-- server code while catalogue canonicalisation remains incomplete. They are
-- deliberately separated by product purpose and are never granted to browser
-- roles.

create or replace view api_private.au_program_catalog_v1
with (security_invoker = true) as
select
  c.id,
  c.institution_id,
  c.course_code,
  c.title,
  c.field_name,
  c.broad_field,
  c.aqf_level,
  c.course_type,
  c.duration_years,
  c.tuition_fee_aud,
  c.employment_rate,
  c.qualifax_url,
  c.cricos_url,
  c.official_course_url,
  c.official_url_status,
  c.official_url_checked_at,
  c.cricos_status,
  c.cricos_last_seen_at,
  c.synced_at
from ingest.courses_au c;
create or replace view api_private.au_program_route_options_v1
with (security_invoker = true) as
select
  c.id,
  c.institution_id,
  c.course_code,
  c.title,
  c.aqf_level,
  c.course_type,
  c.duration_years,
  c.tuition_fee_aud,
  c.official_course_url,
  c.official_url_status,
  c.official_url_checked_at,
  c.cricos_status
from ingest.courses_au c;
create or replace view api_private.au_program_page_facts_v1
with (security_invoker = true) as
select
  f.id,
  f.course_id,
  f.field_key,
  f.value,
  f.source_url,
  f.extracted_at,
  f.review_status,
  f.reviewed_at
from ingest.program_page_facts_au f;
create or replace view api_private.au_program_institution_directory_v1
with (security_invoker = true) as
select
  i.id,
  i.institution_id,
  i.name,
  i.state,
  i.city,
  i.school_type,
  i.enrollment,
  i.graduation_rate,
  i.avg_net_price,
  i.median_earnings,
  i.website_url,
  i.synced_at
from ingest.colleges_au i;
create or replace view api_private.au_program_map_summary_v1
with (security_invoker = true) as
select
  c.id,
  c.title,
  c.institution_id,
  c.broad_field,
  c.aqf_level,
  c.duration_years,
  c.tuition_fee_aud,
  c.cricos_url,
  i.name as institution_name,
  i.state,
  i.website_url
from ingest.courses_au c
join ingest.colleges_au i on i.institution_id = c.institution_id;
create or replace view api_private.au_program_occupation_courses_v1
with (security_invoker = true) as
select
  c.id,
  c.title,
  c.broad_field,
  c.course_type,
  c.aqf_level,
  c.duration_years,
  c.tuition_fee_aud,
  c.employment_rate,
  c.official_course_url,
  c.official_url_status,
  c.official_url_checked_at,
  c.cricos_url,
  c.qualifax_url
from ingest.courses_au c;
revoke all on table
  api_private.au_program_catalog_v1,
  api_private.au_program_route_options_v1,
  api_private.au_program_page_facts_v1,
  api_private.au_program_institution_directory_v1,
  api_private.au_program_map_summary_v1,
  api_private.au_program_occupation_courses_v1
from public, anon, authenticated;
grant select on table
  api_private.au_program_catalog_v1,
  api_private.au_program_route_options_v1,
  api_private.au_program_page_facts_v1,
  api_private.au_program_institution_directory_v1,
  api_private.au_program_map_summary_v1,
  api_private.au_program_occupation_courses_v1
to service_role;
-- Runtime readers have moved to api_private. Retain compatibility Views only
-- for the documented service-role import/maintenance contract.
alter view public.courses_au set (security_invoker = true);
alter view public.colleges_au set (security_invoker = true);
alter view public.program_page_facts_au set (security_invoker = true);
revoke all on table public.courses_au from public, anon, authenticated, service_role;
revoke all on table public.colleges_au from public, anon, authenticated, service_role;
revoke all on table public.program_page_facts_au from public, anon, authenticated, service_role;
grant select, insert, update on table public.courses_au to service_role;
grant select, insert, update on table public.colleges_au to service_role;
grant select, insert, update on table public.program_page_facts_au to service_role;
