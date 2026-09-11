-- Review Nova Scotia Community College occupation relationships.
-- Admission state is intentionally left unchanged: current 2026/27 international admissions are closed.
-- This migration only separates durable occupation relevance from current publishability.

with decisions(canonical_career_id, title, relation_type, review_status, reviewer_note) as (
  values
    ('accountant', 'Business Administration - Accounting', 'direct', 'approved', 'Program is directly aligned to accounting preparation.'),
    ('aircraft-maintenance-technician', 'Aircraft Maintenance Technician - Structures', 'direct', 'approved', 'Direct aircraft maintenance trade pathway.'),
    ('aircraft-maintenance-technician', 'Aircraft Maintenance Technology - Avionics', 'direct', 'approved', 'Direct aircraft maintenance avionics pathway.'),
    ('aircraft-maintenance-technician', 'Aircraft Maintenance Technology - Mechanical', 'direct', 'approved', 'Direct aircraft maintenance mechanical pathway.'),
    ('animator', 'Digital Animation', 'direct', 'approved', 'Direct animation program.'),
    ('animator', 'Digital Animation - 2D', 'direct', 'approved', 'Direct 2D animation program.'),
    ('animator', 'Digital Animation - 3D', 'direct', 'approved', 'Direct 3D animation program.'),
    ('automotive-service-technician', 'Automotive Service and Repair', 'direct', 'approved', 'Direct automotive service pathway.'),
    ('baker', 'Baking and Pastry Arts', 'direct', 'approved', 'Direct baking and pastry pathway.'),
    ('bricklayer', 'Brick and Stone Masonry', 'direct', 'approved', 'Direct masonry pathway.'),
    ('business-analyst', 'Business Analysis', 'direct', 'approved', 'Direct business analysis graduate program.'),
    ('care-worker', 'Disability Support Professional', 'direct', 'approved', 'Direct support-work pathway.'),
    ('carpenter', 'Cabinetmaking and Woodworking Techniques', 'related', 'approved', 'Woodworking is closely related but not the same trade as carpenter.'),
    ('carpenter', 'Carpentry Certificate', 'direct', 'approved', 'Direct carpentry pathway.'),
    ('carpenter', 'Carpentry Certificate - Accelerated', 'direct', 'approved', 'Direct accelerated carpentry pathway.'),
    ('carpenter', 'Carpentry Diploma', 'direct', 'approved', 'Direct carpentry pathway.'),
    ('chef', 'Culinary Management', 'common_pathway', 'approved', 'Common chef pathway with additional management scope.'),
    ('civil-engineer', 'Civil Engineering Technology', 'related', 'approved', 'Engineering-technology diploma is related to, but not a professional-engineer qualifying degree.'),
    ('construction-manager', 'Construction Project Management', 'direct', 'approved', 'Direct construction-management preparation.'),
    ('cybersecurity-analyst', 'Cyber Security', 'direct', 'approved', 'Direct cybersecurity pathway.'),
    ('data-analyst', 'Business Intelligence and Analytics', 'direct', 'approved', 'Direct analytics pathway.'),
    ('data-analyst', 'Geospatial Data Analytics', 'direct', 'approved', 'Direct applied analytics pathway in the geospatial domain.'),
    ('data-analyst', 'IT Data Analytics', 'direct', 'approved', 'Direct data analytics pathway.'),
    ('early-childhood-teacher', 'Early Childhood Education', 'direct', 'approved', 'Direct early-childhood education pathway.'),
    ('early-childhood-teacher', 'Early Childhood Education - Africentric Offering', 'direct', 'approved', 'Direct early-childhood education pathway.'),
    ('electrical-engineer', 'Electrical Engineering Technology', 'related', 'approved', 'Engineering-technology diploma is related to, but not a professional-engineer qualifying degree.'),
    ('electrician', 'Electrical Construction and Industrial', 'direct', 'approved', 'Direct electrical trade pathway.'),
    ('engineering-technician', 'Architectural Engineering Technician', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Civil Engineering Technology', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Electrical Engineering Technology', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Electronic Engineering Technology', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Environmental Engineering Technology – Water Resources', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Geomatics Engineering Technology', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Marine Engineering Technology', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Mechanical Engineering Technology', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('engineering-technician', 'Power Engineering Technology', 'direct', 'approved', 'Direct engineering-technician pathway.'),
    ('environmental-engineer', 'Environmental Engineering Technology – Water Resources', 'related', 'approved', 'Engineering-technology diploma is related to, but not a professional-engineer qualifying degree.'),
    ('graphic-designer', 'Graphic Design', 'direct', 'approved', 'Direct graphic design pathway.'),
    ('human-resources-specialist', 'Human Resource Management', 'direct', 'approved', 'Direct HR pathway.'),
    ('hvac-technician', 'Building Systems Technician (HVAC&R)', 'direct', 'approved', 'Direct HVAC and refrigeration pathway.'),
    ('hvac-technician', 'Building Systems Technician (HVAC&R) - Accelerated', 'direct', 'approved', 'Direct accelerated HVAC and refrigeration pathway.'),
    ('hvac-technician', 'Refrigeration and Air Conditioning', 'direct', 'approved', 'Direct HVAC and refrigeration pathway.'),
    ('hvac-technician', 'Refrigeration and Air Conditioning - Geothermal', 'direct', 'approved', 'Direct HVAC and refrigeration pathway.'),
    ('marketing-specialist', 'Digital Marketing', 'direct', 'approved', 'Direct marketing pathway.'),
    ('mechanical-engineer', 'Mechanical Engineering Technology', 'related', 'approved', 'Engineering-technology diploma is related to, but not a professional-engineer qualifying degree.'),
    ('medical-laboratory-technician', 'Medical Laboratory Technology', 'direct', 'approved', 'Direct medical laboratory technology pathway.'),
    ('occupational-therapist', 'Occupational Therapy / Physiotherapy Assistant', 'related', 'approved', 'Assistant diploma is related to occupational therapy but does not qualify as an occupational therapist.'),
    ('pharmacist', 'Pharmacy Technician', 'related', 'approved', 'Pharmacy technician is a distinct regulated occupation from pharmacist.'),
    ('physiotherapist', 'Occupational Therapy / Physiotherapy Assistant', 'related', 'approved', 'Assistant diploma is related to physiotherapy but does not qualify as a physiotherapist.'),
    ('plumber', 'Gas Technician', 'related', 'approved', 'Gas technician is a related skilled-trades pathway, not the same trade as plumber.'),
    ('plumber', 'Plumbing', 'direct', 'approved', 'Direct plumbing pathway.'),
    ('plumber', 'Steamfitting / Pipefitting', 'related', 'approved', 'Steamfitting/pipefitting is related but is a distinct trade.'),
    ('project-manager', 'Construction Project Management', 'common_pathway', 'approved', 'Common project-management pathway specialized in construction.'),
    ('restaurant-manager', 'Hotel and Restaurant Management', 'direct', 'approved', 'Direct restaurant-management preparation.'),
    ('software-developer', 'Full Stack Application Development', 'direct', 'approved', 'Direct software development pathway.'),
    ('tourism-manager', 'Tourism Management', 'direct', 'approved', 'Direct tourism-management preparation.'),
    ('welder', 'Metal Fabrication', 'related', 'approved', 'Metal fabrication is closely related to welding but broader than the welder trade.'),
    ('welder', 'Welding', 'direct', 'approved', 'Direct welding pathway.'),
    ('youth-worker', 'Child and Youth Care', 'direct', 'approved', 'Direct child and youth care pathway.'),
    ('ict-support-technician', 'Building Systems Technician (HVAC&R)', null, 'rejected', 'False-positive title match: HVAC building systems is not ICT support.'),
    ('ict-support-technician', 'Building Systems Technician (HVAC&R) - Accelerated', null, 'rejected', 'False-positive title match: HVAC building systems is not ICT support.'),
    ('ict-support-technician', 'Electronic Systems Technician', null, 'rejected', 'Electronics systems technician is not an ICT user/network support program.'),
    ('ict-support-technician', 'Geographic Information Systems Technician', null, 'rejected', 'GIS technician is not an ICT support technician pathway.'),
    ('registered-nurse', 'Practical Nursing', null, 'rejected', 'Practical Nursing prepares for the LPN role, not Registered Nurse licensure.')
), resolved as (
  select l.program_catalog_id, l.canonical_career_id, d.relation_type, d.review_status, d.reviewer_note
  from public.program_occupation_ca_staging l
  join public.program_catalog_ca_staging c on c.id = l.program_catalog_id
  join decisions d
    on d.canonical_career_id = l.canonical_career_id
   and d.title = c.title
  where c.institution_name = 'Nova Scotia Community College'
    and l.review_status = 'candidate'
)
update public.program_occupation_ca_staging l
set review_status = r.review_status,
    relation_type = r.relation_type,
    source_checked_at = date '2026-08-08',
    reviewer_note = r.reviewer_note,
    reviewed_at = now()
from resolved r
where l.program_catalog_id = r.program_catalog_id
  and l.canonical_career_id = r.canonical_career_id;;
