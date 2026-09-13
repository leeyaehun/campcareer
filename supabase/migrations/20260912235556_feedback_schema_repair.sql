begin;

-- Production recorded the original feedback migrations, but the table itself
-- is absent. Recreate the complete current contract rather than replaying an
-- older partial migration out of order.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  type text not null,
  category text,
  description text not null,
  email_consent boolean not null default false,
  contact_email text,
  system_info_consent boolean not null default false,
  screenshot_url text,
  screenshot_bucket text,
  screenshot_path text,
  screenshot_content_type text,
  screenshot_size_bytes integer,
  page_path text,
  entity_type text,
  entity_id text,
  status text not null default 'new',
  status_updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '180 days')
);

alter table public.feedback
  add column if not exists category text,
  add column if not exists email_consent boolean default false,
  add column if not exists contact_email text,
  add column if not exists system_info_consent boolean not null default false,
  add column if not exists screenshot_url text,
  add column if not exists screenshot_bucket text,
  add column if not exists screenshot_path text,
  add column if not exists screenshot_content_type text,
  add column if not exists screenshot_size_bytes integer,
  add column if not exists page_path text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists status text not null default 'new',
  add column if not exists status_updated_at timestamptz not null default now(),
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists expires_at timestamptz not null default (now() + interval '180 days');

alter table public.feedback
  drop constraint if exists feedback_type_check,
  add constraint feedback_type_check
    check (type in ('issue', 'suggestion')),
  drop constraint if exists feedback_contact_requires_consent,
  add constraint feedback_contact_requires_consent
    check (contact_email is null or coalesce(email_consent, false)),
  drop constraint if exists feedback_screenshot_reference_check,
  add constraint feedback_screenshot_reference_check
    check (
      (screenshot_bucket is null and screenshot_path is null)
      or (screenshot_bucket = 'feedback-screenshots' and screenshot_path is not null)
    ),
  drop constraint if exists feedback_screenshot_size_check,
  add constraint feedback_screenshot_size_check
    check (screenshot_size_bytes is null or screenshot_size_bytes between 1 and 5242880),
  drop constraint if exists feedback_status_check,
  add constraint feedback_status_check
    check (status in ('new', 'reviewing', 'resolved', 'ignored')),
  drop constraint if exists feedback_page_path_check,
  add constraint feedback_page_path_check
    check (page_path is null or page_path like '/%');

create index if not exists feedback_expires_at_idx on public.feedback (expires_at);
create index if not exists feedback_status_created_at_idx on public.feedback (status, created_at desc);

alter table public.feedback enable row level security;
drop policy if exists "Anyone can insert feedback" on public.feedback;
drop policy if exists "Only service role can read feedback" on public.feedback;
drop policy if exists "Feedback is server managed" on public.feedback;
revoke all privileges on table public.feedback from anon, authenticated;
grant select, insert, update, delete on table public.feedback to service_role;
create policy "Feedback is server managed"
  on public.feedback
  for all
  to service_role
  using (true)
  with check (true);

do $$
declare
  feedback_sequence text;
begin
  select pg_get_serial_sequence('public.feedback', 'id') into feedback_sequence;
  if feedback_sequence is not null then
    execute format('revoke all privileges on sequence %s from anon, authenticated', feedback_sequence);
    execute format('grant usage, select on sequence %s to service_role', feedback_sequence);
  end if;
end
$$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'feedback-screenshots',
  'feedback-screenshots',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Feedback screenshots are server managed" on storage.objects;
create policy "Feedback screenshots are server managed"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'feedback-screenshots')
  with check (bucket_id = 'feedback-screenshots');

commit;
