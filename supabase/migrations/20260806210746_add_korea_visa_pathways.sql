insert into ingest.visa_pathways (
  country_code,
  country_name,
  visa_name,
  kind,
  note,
  authority,
  source_url,
  source_title,
  last_verified_on,
  display_order,
  is_active
)
values
  ('KR', 'South Korea', 'D-2 Academic Study', 'Study', 'Degree, exchange or eligible research study at a Korean higher-education institution.', 'Korea Immigration Service', 'https://studyinkorea.go.kr/ko/plan/visaAndStay.do', 'Student visa and stay status', date '2026-08-06', 10, true),
  ('KR', 'South Korea', 'D-4-1 Korean Language Training', 'Study', 'Non-degree Korean-language training with an eligible education institution.', 'Korea Immigration Service', 'https://studyinkorea.go.kr/ko/plan/visaAndStay.do', 'Student visa and stay status', date '2026-08-06', 20, true),
  ('KR', 'South Korea', 'D-10-1 Job Seeker', 'Temporary', 'Post-study professional job search and qualifying internship activity before changing to an employment status.', 'Korea Immigration Service', 'https://www.studyinkorea.go.kr/cmm/life/residenceAndStayInfo.do?tab=job-seeker-visa', 'Job-seeking visa change and duration', date '2026-08-06', 30, true),
  ('KR', 'South Korea', 'E-7-1 Specific Activities', 'Skilled', 'Employer-backed professional employment in an occupation permitted under the Specific Activities framework.', 'Korea Immigration Service', 'https://studyinkorea.go.kr/ko/work/aboutForeignerEmploymentSystem.do', 'Employment system for foreigners', date '2026-08-06', 40, true),
  ('KR', 'South Korea', 'H-1 Working Holiday', 'Working holiday', 'Holiday-first youth mobility route with limited short-term work for eligible partner-country nationals.', 'Working Holiday Info Center', 'https://whic.mofa.go.kr/contents.do?contentsNo=38', 'Korea Working Holiday general information', date '2026-08-06', 50, true)
on conflict (country_code, visa_name) do update
set
  country_name = excluded.country_name,
  kind = excluded.kind,
  note = excluded.note,
  authority = excluded.authority,
  source_url = excluded.source_url,
  source_title = excluded.source_title,
  last_verified_on = excluded.last_verified_on,
  display_order = excluded.display_order,
  is_active = excluded.is_active,
  updated_at = now();

update ingest.visa_pathways
set is_active = false,
    updated_at = now()
where country_code = 'KR'
  and visa_name in ('D-2 Student visa', 'D-4 Language Training', 'E-7 Work visa');;
