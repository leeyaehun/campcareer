insert into supabase_migrations.schema_migrations(version,name,statements)
values
('20260809113000','kr_program_staging_foundation',array['-- canonical replayable South Korea program staging foundation']),
('20260809113500','kr_program_canonicalization_publication',array['-- canonical replayable South Korea program canonicalization and publication'])
on conflict(version) do update set name=excluded.name,statements=excluded.statements;;
