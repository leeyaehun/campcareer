create table if not exists public.institution_dli_ca_staging (
  id bigint generated always as identity primary key,
  source_row_key text not null unique,
  institution_id text not null,
  institution_name text not null,
  province text,
  city text,
  campus text,
  dli_number text,
  is_dli boolean not null default true,
  public_private text,
  offers_pgwp_eligible_programs boolean,
  international_students_eligible boolean,
  graduate_degree_pal_tal_exempt boolean,
  ircc_detail_url text,
  source_url text not null,
  source_as_of date,
  source_status text not null default 'ircc_dli_listed',
  collected_at timestamptz not null default now()
);
create index if not exists institution_dli_ca_staging_institution_idx on public.institution_dli_ca_staging(institution_id);
create index if not exists institution_dli_ca_staging_dli_idx on public.institution_dli_ca_staging(dli_number);

create table if not exists public.program_pgwp_ca_staging (
  id bigint generated always as identity primary key,
  program_catalog_id bigint not null unique references public.program_catalog_ca_staging(id) on delete cascade,
  institution_id text not null,
  source_program_key text not null,
  credential_type text,
  education_level text,
  matched_dli_number text,
  matched_campus text,
  institution_offers_pgwp_eligible_programs boolean,
  international_students_eligible boolean,
  pgwp_rule_category text not null,
  field_of_study_required boolean not null,
  cip_code text,
  field_of_study_eligible boolean,
  ircc_program_eligible boolean,
  pgwp_program_status text not null default 'pending_ircc_program_match',
  ircc_detail_url text,
  source_url text not null,
  source_as_of date,
  verified_at timestamptz,
  collected_at timestamptz not null default now()
);
create index if not exists program_pgwp_ca_staging_institution_idx on public.program_pgwp_ca_staging(institution_id);
create index if not exists program_pgwp_ca_staging_status_idx on public.program_pgwp_ca_staging(pgwp_program_status);
create index if not exists program_pgwp_ca_staging_cip_idx on public.program_pgwp_ca_staging(cip_code);;
