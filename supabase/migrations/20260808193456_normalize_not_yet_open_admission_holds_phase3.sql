update public.program_pgwp_ca_staging
set international_program_admission_status='current_closed_' || international_program_admission_status,
    verified_at=now(),
    rule_notes=concat_ws(' ',nullif(rule_notes,''),'Phase 3 normalization: a not-yet-open future application cycle is explicitly marked current_closed so it remains Tier C until a newer official source confirms that applications have opened.')
where lower(coalesce(international_program_admission_status,'')) like '%not_yet_open%'
  and lower(coalesce(international_program_admission_status,'')) not like '%closed%';;
