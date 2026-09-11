-- Canada Programs Phase 3: close the remaining George Brown occupation queue.
-- Verified against current 2026-27 George Brown program pages on 2026-08-08.

update public.program_catalog_ca_staging
set source_status = case
      when program_code in ('P113','T440') then 'official_program_page_verified_international_open_winter_2027'
      else 'official_program_page_verified_international_open_2026_27'
    end,
    source_as_of = greatest(coalesce(source_as_of, date '1900-01-01'), date '2026-08-08')
where institution_name = 'George Brown Polytechnic'
  and program_code in ('B107','B126','P113','T177','T186','T189','T440');

update public.program_pgwp_ca_staging p
set international_students_eligible = true,
    international_program_admission_status = case
      when c.program_code in ('P113','T440') then 'official_program_page_international_open_winter_2027'
      else 'official_program_page_international_open_2026_27'
    end,
    cip_code = case c.program_code
      when 'B107' then '52.0305'
      when 'B126' then '52.0299'
      when 'P113' then '10.0304'
      when 'T177' then '11.0201'
      when 'T186' then '11.0201'
      when 'T189' then '11.0201'
      when 'T440' then '11.0205'
      else p.cip_code
    end,
    field_of_study_eligible = case
      when c.program_code in ('B107','B126','P113') then false
      else true
    end,
    ircc_program_eligible = case
      when c.program_code in ('B107','B126','P113') then false
      else true
    end,
    pgwp_program_status = case
      when c.program_code in ('B107','B126','P113') then 'school_program_page_explicit_pgwp_no_2026_27'
      else 'school_program_page_pgwp_yes_exact_cip_2026_27'
    end,
    verified_at = now()
from public.program_catalog_ca_staging c
where p.program_catalog_id = c.id
  and c.institution_name = 'George Brown Polytechnic'
  and c.program_code in ('B107','B126','P113','T177','T186','T189','T440');

with reviewed(program_code, canonical_career_id, relation_type, reviewer_note) as (
  values
    ('B107','accountant','direct','Current George Brown B107 page confirms international intake availability; accounting is direct occupational preparation.'),
    ('B126','project-manager','common_pathway','Current George Brown B126 page confirms international intake availability; project management study is a common pathway to project manager roles.'),
    ('P113','animator','direct','Current George Brown P113 page confirms Winter 2027 international intake and direct 3D animation preparation.'),
    ('T177','software-developer','direct','Current George Brown T177 page confirms international intake and software/programming preparation.'),
    ('T186','software-developer','direct','Current George Brown T186 page confirms international intake and explicitly identifies software developer career preparation.'),
    ('T189','software-developer','direct','Current George Brown T189 page confirms international intake and software development preparation.'),
    ('T440','software-developer','direct','Current George Brown T440 page confirms Winter 2027 international intake and PGWP eligibility; mobile application development is direct software-development preparation.')
)
update public.program_occupation_ca_staging o
set review_status = 'approved',
    relation_type = r.relation_type,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = r.reviewer_note,
    reviewed_at = now()
from reviewed r
join public.program_catalog_ca_staging c
  on c.institution_name = 'George Brown Polytechnic'
 and c.program_code = r.program_code
where o.program_catalog_id = c.id
  and o.canonical_career_id = r.canonical_career_id
  and o.review_status = 'candidate';;
