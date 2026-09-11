insert into supabase_migrations.schema_migrations(version,name,statements)
values
('20260809104500','ae_program_staging_foundation',array['-- canonical replayable UAE program staging foundation']),
('20260809105000','ae_program_collection_snapshot',array['-- canonical replayable UAE program collection snapshot']),
('20260809105500','ae_program_evidence_snapshot',array['-- canonical replayable UAE program occupation and admission evidence snapshot']),
('20260809110000','ae_program_canonicalization_publication',array['-- canonical replayable UAE program canonicalization and publication'])
on conflict(version) do update set name=excluded.name,statements=excluded.statements;;
