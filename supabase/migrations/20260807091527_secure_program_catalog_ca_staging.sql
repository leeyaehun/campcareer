alter table public.program_catalog_ca_staging enable row level security;
create index program_catalog_ca_staging_institution_idx on public.program_catalog_ca_staging (institution_name);
create index program_catalog_ca_staging_province_idx on public.program_catalog_ca_staging (province);
create index program_catalog_ca_staging_title_idx on public.program_catalog_ca_staging (title);;
