-- Canada Programs Phase 3: normalize newly-added admission-unverified tokens to the publish-policy/audit vocabulary.
-- This is a semantic no-op: it preserves the hold while ensuring readiness audit v2 recognizes it consistently.

update public.program_pgwp_ca_staging
set international_program_admission_status='spring_2027_general_application_open_program_specific_availability_not_yet_verified',
    verified_at=now()
where international_program_admission_status='spring_2027_general_application_open_program_specific_availability_not_verified';

update public.program_pgwp_ca_staging
set international_program_admission_status='official_program_page_international_apply_path_current_intake_availability_not_yet_verified',
    verified_at=now()
where international_program_admission_status='official_program_page_international_apply_path_current_intake_availability_not_verified';;
