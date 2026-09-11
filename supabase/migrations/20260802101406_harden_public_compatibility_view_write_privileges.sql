-- 10.4S-1: remove accidental write access from the public compatibility Views.
--
-- This is an emergency privilege-only hardening migration. The legacy Views
-- remain in place, retain their temporary SELECT contract, and retain only
-- the explicitly audited service-role writes used by ingestion scripts.
-- No table, row, RLS, SELECT, or security_invoker state is changed here.

-- Explicit allowlist: all 54 public compatibility Views present at audit time.
revoke all privileges on table
  public.cities_au,
  public.cities_ca,
  public.cities_ie,
  public.cities_uk,
  public.cities_us,
  public.colleges_au,
  public.colleges_ca,
  public.colleges_ie,
  public.colleges_nl,
  public.colleges_uk,
  public.colleges_us,
  public.country_pr_pathways,
  public.courses_au,
  public.courses_ca,
  public.courses_ie,
  public.courses_uk,
  public.data_source_runs,
  public.field_earnings_au,
  public.field_earnings_ca,
  public.field_earnings_ie,
  public.field_earnings_uk,
  public.graduate_outcomes_ie,
  public.language_courses_ie,
  public.language_schools_ie,
  public.majors,
  public.occupation_mobility_flows_au,
  public.occupation_mobility_stocks_au,
  public.occupation_outlook_au,
  public.occupation_pathways_au,
  public.occupation_profiles_au,
  public.occupation_regional_employment_au,
  public.occupation_sa4_au,
  public.occupation_shortage_drivers_au,
  public.occupation_state_au,
  public.occupation_state_ca,
  public.occupation_state_uk,
  public.occupation_vacancies_au,
  public.occupations_au,
  public.occupations_ca,
  public.occupations_uk,
  public.program_page_facts_au,
  public.programs_us,
  public.regulatory_requirements_au,
  public.roi_explorer_au,
  public.roi_explorer_by_field_us,
  public.roi_explorer_ca,
  public.roi_explorer_de,
  public.roi_explorer_ie,
  public.roi_explorer_nl,
  public.roi_explorer_uk,
  public.roi_explorer_us,
  public.shortage_occupations_ie,
  public.state_salary_multiplier,
  public.visa_occupation_status_au
from public, anon, authenticated, service_role;
-- Preserve the existing temporary read contract for the three application
-- roles. PUBLIC receives no implicit access.
grant select on table
  public.cities_au,
  public.cities_ca,
  public.cities_ie,
  public.cities_uk,
  public.cities_us,
  public.colleges_au,
  public.colleges_ca,
  public.colleges_ie,
  public.colleges_nl,
  public.colleges_uk,
  public.colleges_us,
  public.country_pr_pathways,
  public.courses_au,
  public.courses_ca,
  public.courses_ie,
  public.courses_uk,
  public.data_source_runs,
  public.field_earnings_au,
  public.field_earnings_ca,
  public.field_earnings_ie,
  public.field_earnings_uk,
  public.graduate_outcomes_ie,
  public.language_courses_ie,
  public.language_schools_ie,
  public.majors,
  public.occupation_mobility_flows_au,
  public.occupation_mobility_stocks_au,
  public.occupation_outlook_au,
  public.occupation_pathways_au,
  public.occupation_profiles_au,
  public.occupation_regional_employment_au,
  public.occupation_sa4_au,
  public.occupation_shortage_drivers_au,
  public.occupation_state_au,
  public.occupation_state_ca,
  public.occupation_state_uk,
  public.occupation_vacancies_au,
  public.occupations_au,
  public.occupations_ca,
  public.occupations_uk,
  public.program_page_facts_au,
  public.programs_us,
  public.regulatory_requirements_au,
  public.roi_explorer_au,
  public.roi_explorer_by_field_us,
  public.roi_explorer_ca,
  public.roi_explorer_de,
  public.roi_explorer_ie,
  public.roi_explorer_nl,
  public.roi_explorer_uk,
  public.roi_explorer_us,
  public.shortage_occupations_ie,
  public.state_salary_multiplier,
  public.visa_occupation_status_au
to anon, authenticated, service_role;
-- Service-role ingestion callers audited in scripts/. No browser or normal
-- application caller writes these Views. Keep only the DML each importer uses.
grant select, insert on table public.occupations_au, public.data_source_runs, public.visa_occupation_status_au to service_role;
grant select, insert, update on table
  public.occupations_ca,
  public.program_page_facts_au,
  public.colleges_nl,
  public.regulatory_requirements_au,
  public.graduate_outcomes_ie,
  public.shortage_occupations_ie
to service_role;
grant select, insert, update, delete on table public.occupation_state_ca to service_role;
grant select, insert, delete on table public.visa_occupation_status_au to service_role;
-- Stop future public-schema tables from inheriting write privileges for the
-- public roles. Existing user tables and their RLS policies are untouched;
-- SELECT remains the existing default. The linked migration role can alter
-- postgres-owned defaults; supabase_admin-owned defaults require a privileged
-- owner/admin operation and are recorded as a follow-up below.
alter default privileges for role postgres in schema public
  revoke insert, update, delete, truncate, references, trigger, maintain
  on tables from public, anon, authenticated;
-- Sequence UPDATE is not required for public inserts and would allow a role
-- to advance or rewrite sequence state. Keep existing SELECT/USAGE defaults.
alter default privileges for role postgres in schema public
  revoke update on sequences from public, anon, authenticated;
-- Follow-up required with the owner/admin role:
--   alter default privileges for role supabase_admin in schema public
--     revoke insert, update, delete, truncate, references, trigger, maintain
--     on tables from public, anon, authenticated;
--   alter default privileges for role supabase_admin in schema public
--     revoke update on sequences from public, anon, authenticated;;
