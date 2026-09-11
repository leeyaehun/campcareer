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
  ('AE', 'United Arab Emirates', 'Student residence visa', 'Study', 'University- or parent-sponsored residence for study at an accredited UAE institution.', 'Federal Authority for Identity, Citizenship, Customs & Port Security', 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-studying-in-the-uae', 'Residence visa for studying in the UAE', date '2026-08-07', 10, true),
  ('AE', 'United Arab Emirates', 'Jobseeker visit visa', 'Temporary', 'Sponsor-free single-entry visit of 60, 90 or 120 days for eligible graduates and skilled professionals to explore jobs.', 'Federal Authority for Identity, Citizenship, Customs & Port Security', 'https://u.ae/en/information-and-services/visa-and-emirates-id/visit-visas/jobseeker-visit-visa', 'Jobseeker visit visa', date '2026-08-07', 20, true),
  ('AE', 'United Arab Emirates', 'Standard employer-sponsored work residence', 'Work', 'Two-year renewable employment residence initiated by a qualifying UAE employer.', 'Ministry of Human Resources and Emiratisation', 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-working-in-the-uae', 'Residence visa for working in the UAE', date '2026-08-07', 30, true),
  ('AE', 'United Arab Emirates', 'Green Residence for skilled employees', 'Skilled', 'Renewable five-year self-sponsored residence for eligible skill-level 1–3 employees.', 'Federal Authority for Identity, Citizenship, Customs & Port Security', 'https://icp.gov.ae/en/uae-green-residency/', 'Green Residence', date '2026-08-07', 40, true),
  ('AE', 'United Arab Emirates', 'Golden Residence for outstanding students and graduates', 'Skilled', 'Five- or ten-year self-sponsored residence for qualifying high-achieving school and university students or recent graduates.', 'Federal Authority for Identity, Citizenship, Customs & Port Security', 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa', 'Golden visa', date '2026-08-07', 50, true),
  ('AE', 'United Arab Emirates', 'Student training and employment permit', 'Work', 'Three-month training or holiday-employment permit for eligible students already holding UAE residence.', 'Ministry of Human Resources and Emiratisation', 'https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/work-permits', 'Work permits', date '2026-08-07', 60, true)
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
where country_code = 'AE'
  and visa_name in ('Student visa', 'Employment visa', 'Green Visa');;
