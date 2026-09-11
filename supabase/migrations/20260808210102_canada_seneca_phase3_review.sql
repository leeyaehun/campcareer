-- Canada Programs Phase 3: Seneca current-program canonicalization, admission verification, and occupation review.

insert into public.program_catalog_ca_staging (
  source_name, source_program_key, institution_name, institution_id,
  title, credential_type, education_level, field_name, language,
  province, city, duration_years, tuition_fee_cad, program_code,
  official_program_url, source_url, source_as_of, source_status, collected_at
)
select
  'Seneca Polytechnic Catalogue', md5('Seneca Polytechnic Catalogue|DAS'),
  'Seneca Polytechnic', 'seneca-polytechnic', 'Data Analytics',
  'Ontario College Graduate Certificate', 'Post-graduate', 'Data analytics', 'English',
  'ON', 'Toronto', 0.67, null, 'DAS',
  'https://www.senecapolytechnic.ca/programs/fulltime/DAS.html',
  'https://www.senecapolytechnic.ca/programs/fulltime/DAS.html',
  '2026-08-08', 'official_program_page_verified_international_open_2026_27', now()
where not exists (
  select 1 from public.program_catalog_ca_staging
  where institution_name='Seneca Polytechnic' and program_code='DAS'
);

insert into public.program_pgwp_ca_staging (
  program_catalog_id, institution_id, source_program_key, credential_type,
  education_level, matched_dli_number, matched_campus,
  institution_offers_pgwp_eligible_programs, international_students_eligible,
  pgwp_rule_category, field_of_study_required, cip_code, field_of_study_eligible,
  ircc_program_eligible, pgwp_program_status, ircc_detail_url, source_url,
  source_as_of, verified_at, collected_at, international_program_admission_status, rule_notes
)
select c.id, c.institution_id, c.source_program_key, c.credential_type, c.education_level,
  'O19395536013', 'Newnham', true, true,
  'college_polytechnic_non_degree_field_of_study_requirement', true,
  '30.7101', true, true, 'official_seneca_pgwp_eligible_cip_verified_2026_07_14', null,
  'https://www.senecapolytechnic.ca/programs/fulltime/DAS.html', '2026-08-08', now(), now(),
  'official_program_page_international_open_sep_2026_jan_2027_may_2027',
  'Seneca current program page lists DAS as PGWP-eligible, CIP 30.7101, with international availability Open for September 2026, January 2027 and May 2027. Online study can affect PGWP eligibility; the campus/hybrid pathway is the publishable international-study route.'
from public.program_catalog_ca_staging c
where c.institution_name='Seneca Polytechnic' and c.program_code='DAS'
on conflict (program_catalog_id) do update set
  matched_dli_number=excluded.matched_dli_number,
  matched_campus=excluded.matched_campus,
  institution_offers_pgwp_eligible_programs=excluded.institution_offers_pgwp_eligible_programs,
  international_students_eligible=excluded.international_students_eligible,
  pgwp_rule_category=excluded.pgwp_rule_category,
  field_of_study_required=excluded.field_of_study_required,
  cip_code=excluded.cip_code,
  field_of_study_eligible=excluded.field_of_study_eligible,
  ircc_program_eligible=excluded.ircc_program_eligible,
  pgwp_program_status=excluded.pgwp_program_status,
  source_url=excluded.source_url,
  source_as_of=excluded.source_as_of,
  verified_at=excluded.verified_at,
  international_program_admission_status=excluded.international_program_admission_status,
  rule_notes=excluded.rule_notes;

update public.program_catalog_ca_staging
set official_program_url='https://www.senecapolytechnic.ca/programs/fulltime/' || program_code || '.html',
    source_as_of='2026-08-08',
    source_status=case
      when program_code='VTE' then 'official_program_page_verified_current_closed_2026'
      when program_code in ('BSNF','BSNB') then 'international_not_available_canadian_only_2026_27'
      else 'official_program_page_verified_current_2026_27'
    end
where institution_name='Seneca Polytechnic'
  and program_code in ('DAN','GAA','ANI','VTE','ECE','INM','GRA','SSW','PSWC','PND','BSN','BSNF','BSNB');

update public.program_catalog_ca_staging
set official_program_url='https://www.senecapolytechnic.ca/programs/fulltime/BBM.html',
    source_as_of='2026-08-08',
    source_status='official_program_page_verified_current_revised_major_structure_2026_27'
where institution_name='Seneca Polytechnic' and program_code='BBM';

update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='current_intake_availability_check_required_international_apply_path_present_bbm_2026_27',
    ircc_program_eligible=true,
    pgwp_program_status='degree_field_exempt_structurally_eligible_general_applicant_checks_apply',
    source_url='https://www.senecapolytechnic.ca/programs/fulltime/BBM.html',
    source_as_of='2026-08-08', verified_at=now(),
    rule_notes='Current BBM page confirms the revised September 2026 structure with Accounting, Business Management, Human Resources Management, Marketing and Supply Chain Management majors and identifies the degree as PGWP-eligible. The international Apply Now path exists, but intake availability is not separately enumerated on the reviewed page, so publication remains held pending program-level availability confirmation.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic' and c.program_code='BBM';

update public.program_pgwp_ca_staging p
set international_students_eligible=case when c.program_code in ('BSNF','BSNB') then false else true end,
    international_program_admission_status=case c.program_code
      when 'DAN' then 'official_program_page_international_open_sep_2026_jan_2027'
      when 'GAA' then 'official_program_page_international_open_jan_2027'
      when 'ANI' then 'official_program_page_international_open_sep_2026'
      when 'VTE' then 'current_closed_international_sep_2026'
      when 'ECE' then 'official_program_page_international_limited_sep_2026_open_jan_2027_may_2027'
      when 'INM' then 'official_program_page_international_open_sep_2026_jan_2027_may_2027'
      when 'GRA' then 'official_program_page_international_open_sep_2026_jan_2027_may_2027'
      when 'SSW' then 'official_program_page_international_open_or_limited_sep_2026_open_jan_2027'
      when 'PSWC' then 'official_program_page_international_open_sep_2026_jan_2027_may_2027'
      when 'PND' then 'official_program_page_international_open_may_2027_sep_2026_jan_2027_closed'
      when 'BSN' then 'official_program_page_international_limited_sep_2026_open_jan_2027'
      when 'BSNF' then 'current_program_canadian_applicants_only_2026_27'
      when 'BSNB' then 'current_program_canadian_applicants_only_2026_27'
      else p.international_program_admission_status end,
    cip_code=case c.program_code
      when 'VTE' then '01.8301' when 'ECE' then '19.0709' when 'INM' then '11.0801'
      when 'GRA' then '50.0409' when 'SSW' then '44.0000' when 'PSWC' then '51.2602'
      when 'PND' then '51.3901' else p.cip_code end,
    field_of_study_eligible=case when c.program_code in ('VTE','ECE','INM','GRA','SSW','PSWC','PND') then true else p.field_of_study_eligible end,
    ircc_program_eligible=case when c.program_code in ('VTE','ECE','INM','GRA','SSW','PSWC','PND','BSN','BSNF','BSNB') then true else p.ircc_program_eligible end,
    pgwp_program_status=case
      when c.program_code in ('VTE','ECE','INM','GRA','SSW','PSWC','PND') then 'official_seneca_pgwp_eligible_cip_verified_2026_07_14'
      when c.program_code in ('BSN','BSNF','BSNB') then 'degree_field_exempt_structurally_eligible_general_applicant_checks_apply'
      else p.pgwp_program_status end,
    source_url='https://www.senecapolytechnic.ca/programs/fulltime/' || c.program_code || '.html',
    source_as_of='2026-08-08', verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Phase 3 Seneca program page reviewed 2026-08-08; admission availability and PGWP/CIP were updated only where explicitly stated on the current provider page.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic'
  and c.program_code in ('DAN','GAA','ANI','VTE','ECE','INM','GRA','SSW','PSWC','PND','BSN','BSNF','BSNB');

insert into public.program_occupation_ca_staging (
  program_catalog_id, canonical_career_id, rule_version, match_basis, match_pattern,
  review_status, relation_type, source_checked_at, reviewer_note, matched_at, reviewed_at
)
select c.id, v.career_id, 'ca-phase3-seneca-2026-08-08', 'manual',
       'seneca_current_replacement_2026', 'approved', v.relation_type, '2026-08-08', v.note, now(), now()
from public.program_catalog_ca_staging c
join (values
  ('DAS','business-analyst','direct','Current Data Analytics (DAS) explicitly lists business analyst / business systems analyst outcomes.'),
  ('DAS','data-analyst','direct','Current Data Analytics (DAS) explicitly lists data analyst and related analytics outcomes.'),
  ('BBM','accountant','common_pathway','Current revised BBM includes an Accounting major; generic parent row is retained as a common pathway rather than a direct major-specific row.'),
  ('BBM','financial-analyst','common_pathway','Current revised BBM includes Accounting and business majors that provide a common pathway to financial analyst roles.'),
  ('BBM','human-resources-specialist','common_pathway','Current revised BBM includes a Human Resources Management major; generic parent row is linked as a common pathway.'),
  ('BBM','marketing-specialist','common_pathway','Current revised BBM includes a Marketing major; generic parent row is linked as a common pathway.')
) as v(program_code,career_id,relation_type,note) on v.program_code=c.program_code
where c.institution_name='Seneca Polytechnic'
on conflict (program_catalog_id,canonical_career_id) do update set
  review_status='approved', relation_type=excluded.relation_type,
  source_checked_at=excluded.source_checked_at, reviewer_note=excluded.reviewer_note, reviewed_at=now();

with decisions(program_code,career_id,review_status,relation_type,note) as (values
  ('FEA','accountant','approved','related','Forensic accounting is relevant specialist accounting education; current program is unavailable, so relationship is retained separately from publishability.'),
  ('BACF','accountant','rejected',null,'Legacy pre-September-2026 degree row; current BBM Accounting major relationship is recorded on the current BBM row.'),
  ('VTE','animal-science-technician','approved','direct','Veterinary Technician is direct technician-level preparation and is professionally accredited.'),
  ('DAN','animator','approved','direct','3D Animation directly prepares digital animators and related production roles.'),
  ('ANI','animator','approved','direct','Animation advanced diploma is direct animator preparation.'),
  ('GAA','animator','approved','direct','Game Art & Animation explicitly includes animator as a career outcome.'),
  ('FEA','auditor','approved','direct','Fraud Examination & Forensic Accounting is direct specialist preparation for forensic audit / examination work.'),
  ('BAN','business-analyst','rejected',null,'Legacy name for existing students; new students use current Data Analytics (DAS) from September 2026.'),
  ('PSWC','care-worker','approved','direct','Personal Support Worker is direct preparation for personal-care and support work.'),
  ('CHY','chemical-engineer','approved','related','Chemical Engineering Technology is relevant technical preparation but does not itself confer the regulated professional engineer title.'),
  ('CVT','civil-engineer','approved','related','Civil Engineering Technology is relevant technical preparation but does not itself confer the regulated professional engineer title.'),
  ('SSW','community-worker','approved','direct','Social Service Worker is direct community/social-service preparation.'),
  ('SSWG','community-worker','approved','direct','Social Service Worker – Gerontology is direct specialized community-service preparation.'),
  ('SSWI','community-worker','approved','direct','Social Service Worker – Immigrants and Refugees is direct specialized community-service preparation.'),
  ('SSIA','community-worker','approved','direct','Accelerated immigrants/refugees SSW remains direct community-service preparation for eligible entrants.'),
  ('SSWA','community-worker','approved','direct','Accelerated Social Service Worker remains direct community-service preparation for eligible entrants.'),
  ('BAN','data-analyst','rejected',null,'Legacy name for existing students; new students use current Data Analytics (DAS) from September 2026.'),
  ('ECE','early-childhood-teacher','approved','direct','ECE diploma meets the educational requirement for Registered Early Childhood Educator membership in Ontario.'),
  ('ECYA','early-childhood-teacher','approved','direct','Accelerated ECE diploma meets the educational requirement for Registered Early Childhood Educator membership.'),
  ('EEN','electrical-engineer','approved','related','Electronics Engineering Technician is technician-level education, related to but distinct from professional electrical engineer qualification.'),
  ('EET','electrical-engineer','approved','related','Electronics Engineering Technology is technologist-level education, related to but distinct from professional electrical engineer qualification.'),
  ('BTS','engineering-technician','approved','direct','Building Systems Engineering Technician is direct technician-level preparation.'),
  ('CHY','engineering-technician','approved','direct','Chemical Engineering Technology is direct engineering technologist/technician preparation.'),
  ('CVT','engineering-technician','approved','direct','Civil Engineering Technology is direct engineering technologist/technician preparation.'),
  ('ECT','engineering-technician','approved','direct','Computer Engineering Technology is direct engineering technologist/technician preparation.'),
  ('EMA','engineering-technician','approved','direct','Electromechanical Engineering Technology – Automation is direct engineering technologist preparation.'),
  ('EEN','engineering-technician','approved','direct','Electronics Engineering Technician is direct technician preparation.'),
  ('EET','engineering-technician','approved','direct','Electronics Engineering Technology is direct engineering technologist preparation.'),
  ('FPN','engineering-technician','approved','direct','Fire Protection Engineering Technician is direct technician preparation.'),
  ('FPT','engineering-technician','approved','direct','Fire Protection Engineering Technology is direct engineering technologist preparation.'),
  ('MATD','engineering-technician','approved','direct','Mechanical Engineering Technician (Tool Design) is direct technician preparation.'),
  ('MBT','engineering-technician','approved','direct','Mechanical Engineering Technology – Building Sciences is direct engineering technologist preparation.'),
  ('MIT','engineering-technician','approved','direct','Mechanical Engineering Technology – Industrial Design is direct engineering technologist preparation.'),
  ('EVC','event-planner','approved','direct','Event Management – Creative Design is direct event-planning education; current program unavailability is handled by the publication hold.'),
  ('BACF','financial-analyst','rejected',null,'Legacy pre-September-2026 degree row; current BBM relationship is recorded on the current program row.'),
  ('GRA','graphic-designer','approved','direct','Graphic Design advanced diploma explicitly prepares graphic and interactive designers.'),
  ('GOM','hospitality-supervisor','approved','direct','Global Hospitality Operations Management is direct hospitality operations/supervisory preparation; current program unavailability remains a publish hold.'),
  ('BHRM','human-resources-specialist','rejected',null,'Legacy pre-September-2026 degree row; current BBM Human Resources major relationship is recorded on the current program row.'),
  ('EMK','marketing-specialist','approved','direct','Esports Marketing Management is direct specialist marketing education; current program unavailability remains a publish hold.'),
  ('BMRK','marketing-specialist','rejected',null,'Legacy pre-September-2026 degree row; current BBM Marketing major relationship is recorded on the current program row.'),
  ('MKM','marketing-specialist','approved','direct','Marketing Management is direct marketing-specialist preparation; current program unavailability remains a publish hold.'),
  ('EMA','mechanical-engineer','approved','related','Electromechanical Engineering Technology is relevant to mechanical engineering work but is not a professional engineering degree.'),
  ('MATD','mechanical-engineer','approved','related','Mechanical Engineering Technician education is relevant but technician-level rather than professional engineer qualification.'),
  ('MBT','mechanical-engineer','approved','related','Mechanical Engineering Technology – Building Sciences is relevant technologist preparation but not a professional engineering degree.'),
  ('MIT','mechanical-engineer','approved','related','Mechanical Engineering Technology – Industrial Design is relevant technologist preparation but not a professional engineering degree.'),
  ('CLT','medical-laboratory-technician','rejected',null,'Chemical Laboratory Technician is a chemical laboratory occupation and is not Medical Laboratory Technician education.'),
  ('CLP','medical-laboratory-technician','rejected',null,'Chemical Laboratory Technology – Pharmaceutical is pharmaceutical/chemical laboratory education, not Medical Laboratory Technician education.'),
  ('BDI','multimedia-designer','approved','direct','Honours Bachelor of Design in Interactive Media is direct interactive/multimedia design preparation.'),
  ('INM','multimedia-designer','approved','direct','Interactive Media Design explicitly covers UX/UI, motion graphics, digital design and multimedia production.'),
  ('OTP','occupational-therapist','approved','related','Occupational Therapist Assistant education is relevant to the field but does not qualify a graduate as an Occupational Therapist.'),
  ('OTP','physiotherapist','approved','related','Physiotherapist Assistant education is relevant to the field but does not qualify a graduate as a Physiotherapist.'),
  ('BSN','registered-nurse','approved','direct','BScN stream meets educational requirements leading to RN registration subject to regulatory examination and requirements.'),
  ('BSNF','registered-nurse','approved','direct','Fast-track BScN stream is direct RN education, but the current program is Canadian-applicants-only.'),
  ('BSNB','registered-nurse','approved','common_pathway','BScN Bridge is a direct RN-upgrading pathway for practicing RPNs; current program is Canadian-applicants-only.'),
  ('MDN','registered-nurse','approved','related','Medical Esthetics Nursing is post-registration nursing specialization, not entry-to-practice RN education.'),
  ('PND','registered-nurse','rejected',null,'Practical Nursing prepares Registered Practical Nurses (RPN), not Registered Nurses (RN).'),
  ('GHL','sustainability-specialist','approved','related','Global Hospitality Sustainable Leadership contains sustainability leadership content but is hospitality-sector specific.'),
  ('SMB','sustainability-specialist','approved','direct','Sustainable Business Management is direct business-sustainability preparation.')
)
update public.program_occupation_ca_staging o
set review_status=d.review_status, relation_type=d.relation_type,
    source_checked_at='2026-08-08', reviewer_note=d.note, reviewed_at=now()
from public.program_catalog_ca_staging c, decisions d
where o.program_catalog_id=c.id and c.institution_name='Seneca Polytechnic'
  and c.program_code=d.program_code and o.canonical_career_id=d.career_id and o.review_status='candidate';;
