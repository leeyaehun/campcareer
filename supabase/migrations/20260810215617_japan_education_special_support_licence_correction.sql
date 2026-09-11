update public.country_occupation_profiles
set registration_authority='都道府県教育委員会 — 基礎教員免許状 / 特別支援学校教諭免許状',
    registration_url='https://www.mext.go.jp/a_menu/shotou/kyoin/main13_a2.htm',
    updated_at=now()
where profile_key='JP:special-education-teacher';

update public.country_occupation_metric_snapshots
set score_evidence = score_evidence || jsonb_build_object(
  'qualification_note',
  'A foundational kindergarten, elementary, middle or high-school teacher licence is required. MEXT describes the 特別支援学校教諭免許状 as the principle specialist licence, but Education Personnel Certification Act Supplementary Provision 16 currently permits appointment to a special-support school without that specialist licence in the transitional exception; CampCareer therefore does not describe the specialist licence itself as universally mandatory.'
)
where profile_key='JP:special-education-teacher' and as_of_date='2026-08-10';;
