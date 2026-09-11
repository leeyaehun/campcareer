-- Remove empty legacy compatibility tables that no longer have application consumers.
-- CASCADE is intentionally omitted so any unexpected dependency fails the migration.

begin;

drop table if exists public.checklist_cache;
drop table if exists public.user_calendar_notes;
drop table if exists public.user_career_paths;
drop table if exists public.user_documents;
drop table if exists public.user_timeline;
drop table if exists public.roi_history;
drop table if exists public.au_major_signals;
drop table if exists public.city_living_cost_profiles_au;
drop table if exists public.occupation_state_nomination;

commit;
;
