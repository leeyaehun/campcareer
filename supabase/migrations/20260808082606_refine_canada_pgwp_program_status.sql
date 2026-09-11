alter table public.program_pgwp_ca_staging alter column field_of_study_required drop not null;
alter table public.program_pgwp_ca_staging add column if not exists international_program_admission_status text;
alter table public.program_pgwp_ca_staging add column if not exists rule_notes text;;
