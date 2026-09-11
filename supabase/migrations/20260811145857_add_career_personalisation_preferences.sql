-- Private facts used only to tailor a signed-in user's career-market view.
-- The existing owner-only RLS policy on public.user_preferences continues to
-- apply to these columns; no public select policy is introduced.
alter table public.user_preferences
  add column if not exists citizenship_country text,
  add column if not exists target_country text,
  add column if not exists target_occupation text,
  add column if not exists relevant_experience_years smallint,
  add column if not exists degree_level text,
  add column if not exists english_level text,
  add column if not exists study_path_available boolean,
  add column if not exists career_personalisation_completed_at timestamptz;

alter table public.user_preferences
  drop constraint if exists user_preferences_relevant_experience_years_check;

alter table public.user_preferences
  add constraint user_preferences_relevant_experience_years_check
  check (relevant_experience_years is null or relevant_experience_years between 0 and 60);

alter table public.user_preferences
  drop constraint if exists user_preferences_citizenship_country_check;

alter table public.user_preferences
  add constraint user_preferences_citizenship_country_check
  check (citizenship_country is null or citizenship_country ~ '^[A-Z]{2}$');

alter table public.user_preferences
  drop constraint if exists user_preferences_target_country_check;

alter table public.user_preferences
  add constraint user_preferences_target_country_check
  check (target_country is null or target_country ~ '^[A-Z]{2}$');

comment on column public.user_preferences.citizenship_country is
  'User supplied citizenship country code for career-market personalisation.';
comment on column public.user_preferences.target_country is
  'Latest selected work destination, if the user chose a country.';
comment on column public.user_preferences.target_occupation is
  'Latest selected canonical career id.';;
