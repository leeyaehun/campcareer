alter table public.program_catalog_kr_staging add column if not exists source_department_name text;
comment on column public.program_catalog_kr_staging.source_department_name is 'Department/Major label as displayed by Study in Korea or the source university; canonical title may be normalized for CampCareer display.';;
