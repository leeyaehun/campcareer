-- Canada Programs Phase 3: review Seneca occupation links where current 2026 international availability or application status has already been verified.
with reviewed(program_code, canonical_career_id, relation_type, reviewer_note) as (
  values
    ('CVL','civil-engineer','related','Civil Engineering Technician is relevant preparation but does not itself confer the regulated professional engineer title.'),
    ('CVL','engineering-technician','direct','Civil Engineering Technician is direct technician-level occupational preparation.'),
    ('CSN','ict-support-technician','direct','Computer Systems Technician is direct preparation for ICT systems and support technician roles.'),
    ('MRK','marketing-specialist','direct','Digital Marketing Communications & Analytics is direct marketing-specialist preparation.'),
    ('CPP','software-developer','direct','Computer Programming is direct preparation for software-development and programming roles.'),
    ('CPA','software-developer','direct','Computer Programming & Analysis is direct preparation for software-development and programming roles.'),
    ('UBS','sustainability-specialist','common_pathway','Sustainable Urban & Transportation Planning is a common education pathway to sustainability-specialist roles.')
)
update public.program_occupation_ca_staging o
set review_status = 'approved', relation_type = r.relation_type, match_basis = 'manual', source_checked_at = date '2026-08-08', reviewer_note = r.reviewer_note, reviewed_at = now()
from reviewed r
join public.program_catalog_ca_staging c on c.institution_name='Seneca Polytechnic' and c.program_code=r.program_code
left join public.program_pgwp_ca_staging p on p.program_catalog_id=c.id
where o.program_catalog_id=c.id and o.canonical_career_id=r.canonical_career_id and o.review_status='candidate'
  and (p.international_program_admission_status='seneca_2026_program_page_international_status_verified_or_current_listed'
       or (c.source_status='official_program_page_verified_international_open_2026_27' and p.international_program_admission_status='official_program_page_international_open_or_apply_2026_27'));;
