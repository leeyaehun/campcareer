-- Replace the Griffith representative route with the University of Newcastle
-- Bachelor of Software Engineering (Honours), whose current CRICOS title matches
-- the ACS accredited-course listing directly.

delete from public.country_occupation_program_links
where profile_key = 'AU:software-developer'
  and program_ref = 'au-program:7132';

insert into public.country_occupation_program_links (
  profile_key, program_ref, relation_type, source_checked_at
) values
  ('AU:software-developer', 'au-program:3384', 'direct', '2026-08-08')
on conflict (profile_key, program_ref) do update set
  relation_type = excluded.relation_type,
  source_checked_at = excluded.source_checked_at;;
