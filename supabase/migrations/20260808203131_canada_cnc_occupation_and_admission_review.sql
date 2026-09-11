-- College of New Caledonia Phase 3 review.
-- Occupation relationships are reviewed independently from international publishability.
-- Only admission states explicitly supported by current CNC program pages are changed here.

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'current_closed_fall_2026_fall_2027_opens_october_2026',
    source_url = 'https://cnc.bc.ca/programs-courses/programs/detail/medical-radiography-technology-diploma',
    source_as_of = date '2026-08-08',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'CNC official Medical Radiography page checked 2026-08-08: Fall 2026 applications closed; Fall 2027 applications open in October 2026.')
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='College of New Caledonia'
  and c.title='Medical Radiography Technology Diploma';

update public.program_catalog_ca_staging
set source_status='official_program_page_verified_current_closed_fall_2026',
    source_as_of=date '2026-08-08'
where institution_name='College of New Caledonia'
  and title='Medical Radiography Technology Diploma';

update public.program_pgwp_ca_staging p
set international_program_admission_status = 'current_restricted_hcap_employment_pathway_not_general_international_entry',
    source_url = 'https://cnc.bc.ca/programs-courses/programs/detail/health-care-assistant-certificate',
    source_as_of = date '2026-08-08',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''), 'CNC official Health Care Assistant page checked 2026-08-08: current HCAP delivery is work-study and requires the applicant to be hired as a Health Care Support Worker by an approved employer; not treated as a general international-entry program.')
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='College of New Caledonia'
  and c.title='Health Care Assistant Certificate';

update public.program_catalog_ca_staging
set source_status='official_program_page_verified_restricted_hcap_employment_pathway',
    source_as_of=date '2026-08-08'
where institution_name='College of New Caledonia'
  and title='Health Care Assistant Certificate';

with decisions(canonical_career_id,title,relation_type,review_status,reviewer_note) as (
  values
    ('accountant','Post Baccalaureate in Accounting Diploma','direct','approved','Direct post-baccalaureate accounting pathway.'),
    ('automotive-service-technician','Automotive Service Technician Foundation','direct','approved','Direct automotive-service technician foundation pathway.'),
    ('care-worker','Health Care Assistant Certificate','direct','approved','Direct health-care assistant/care-worker pathway; current HCAP employment restriction is a separate publication hold.'),
    ('carpenter','Carpenter Foundation','direct','approved','Direct carpenter foundation pathway.'),
    ('community-worker','Social Service Worker Certificate','direct','approved','Direct social-service/community-work pathway; current offering status is a separate publication hold.'),
    ('cook','Professional Cook','direct','approved','Direct professional cook pathway.'),
    ('electrician','Electrician Foundation','direct','approved','Direct electrician foundation pathway.'),
    ('forestry-technician','Natural Resources and Forest Technology','direct','approved','Direct forestry/natural-resources technology pathway.'),
    ('graphic-designer','Web and Graphic Design Certificate','direct','approved','Direct web and graphic design pathway.'),
    ('graphic-designer','Web and Graphic Design Diploma','direct','approved','Direct web and graphic design pathway.'),
    ('medical-laboratory-technician','Medical Laboratory Technology Science Diploma','direct','approved','Direct accredited medical laboratory technology pathway.'),
    ('network-administrator','Information Technology and Networking Certificate','direct','approved','Direct information-technology/networking pathway.'),
    ('pharmacist','Medical Sciences Diploma - Pharmacy Pathway','common_pathway','approved','Pre-pharmacy academic pathway; it supports progression toward pharmacy education but is not itself a pharmacist-qualifying credential.'),
    ('physiotherapist','Physical Therapy Bridging Certificate','common_pathway','approved','Prerequisite bridging pathway toward a Master of Physical Therapy; not itself a physiotherapist-qualifying credential.'),
    ('radiographer','Medical Radiography Technology Diploma','direct','approved','Direct medical radiography technology pathway; current Fall 2026 application closure is separate.'),
    ('registered-nurse','Nursing Baccalaureate','direct','approved','Direct collaborative baccalaureate nursing pathway to registered-nurse qualification.'),
    ('registered-nurse','Nursing Pathway Certificate','common_pathway','approved','Pre-nursing academic pathway intended to support entry to a nursing degree; not itself an RN-qualifying credential.'),
    ('registered-nurse','Nursing Unit Assistant Certificate',null,'rejected','Nursing Unit Assistant is a distinct support occupation and does not qualify graduates as Registered Nurses.'),
    ('welder','Welder Foundation','direct','approved','Direct welder foundation pathway.')
), resolved as (
  select l.program_catalog_id,l.canonical_career_id,d.relation_type,d.review_status,d.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id=l.program_catalog_id
  join decisions d on d.canonical_career_id=l.canonical_career_id and d.title=c.title
  where c.institution_name='College of New Caledonia'
    and l.review_status='candidate'
)
update public.program_occupation_ca_staging l
set review_status=r.review_status,
    relation_type=r.relation_type,
    source_checked_at=date '2026-08-08',
    reviewer_note=r.reviewer_note,
    reviewed_at=now()
from resolved r
where l.program_catalog_id=r.program_catalog_id
  and l.canonical_career_id=r.canonical_career_id;;
