-- Preserve the existing "my country is not listed" choice in the new
-- personalisation form without treating it as an ISO country code.
alter table public.user_preferences
  drop constraint if exists user_preferences_citizenship_country_check;

alter table public.user_preferences
  add constraint user_preferences_citizenship_country_check
  check (citizenship_country is null or citizenship_country = 'OTHER' or citizenship_country ~ '^[A-Z]{2}$');;
