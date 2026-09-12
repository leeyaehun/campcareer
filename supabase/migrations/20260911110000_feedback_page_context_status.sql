begin;

-- Phase 6 reuses the service-managed feedback table. Context is bounded in the
-- server contract and status is never accepted from a browser request.
alter table public.feedback
  add column if not exists page_path text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists status text not null default 'new',
  add column if not exists status_updated_at timestamptz not null default now();

alter table public.feedback
  drop constraint if exists feedback_status_check,
  add constraint feedback_status_check
    check (status in ('new', 'reviewing', 'resolved', 'ignored')),
  drop constraint if exists feedback_page_path_check,
  add constraint feedback_page_path_check
    check (page_path is null or page_path like '/%');

create index if not exists feedback_status_created_at_idx on public.feedback (status, created_at desc);

comment on column public.feedback.page_path is
  'Query-free public path captured for a feedback report.';
comment on column public.feedback.entity_type is
  'Optional bounded product entity family captured by the server contract.';
comment on column public.feedback.entity_id is
  'Optional bounded public entity identifier captured by the server contract.';
comment on column public.feedback.status is
  'Internal review state. Browser submissions always start as new.';

commit;
