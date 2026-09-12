-- Ireland Golden Slice: canonical Career <-> Degree graph.
--
-- This is a relationship layer, not a Programme publication path. It records
-- source-backed degree directions independently of Ireland's Tier A programme
-- gate; no programme, offering, institution or city public read model is
-- created here.

begin;

create table if not exists taxonomy.career_degree_relations (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references core.countries(code),
  canonical_career_id text not null check (canonical_career_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  degree_concept_id uuid not null references taxonomy.study_concepts(id) on delete restrict,
  relation_type text not null check (relation_type in ('direct','common_pathway','related')),
  directness text not null check (directness in ('direct','adjacent')),
  relationship_strength text not null check (relationship_strength in ('primary','strong','supporting')),
  rationale text not null check (btrim(rationale) <> ''),
  source_authority text not null check (btrim(source_authority) <> ''),
  source_title text not null check (btrim(source_title) <> ''),
  source_url text not null check (source_url ~ '^https?://'),
  reference_period text not null check (btrim(reference_period) <> ''),
  source_checked_at date not null,
  review_status text not null default 'reviewed' check (review_status in ('reviewed','review_required','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, canonical_career_id, degree_concept_id),
  check (
    (relation_type = 'direct' and directness = 'direct')
    or (relation_type in ('common_pathway','related') and directness in ('direct','adjacent'))
  )
);

create index if not exists career_degree_relations_career_idx
  on taxonomy.career_degree_relations(country_code, canonical_career_id, review_status);
create index if not exists career_degree_relations_degree_idx
  on taxonomy.career_degree_relations(degree_concept_id, country_code, review_status);

alter table taxonomy.career_degree_relations enable row level security;
revoke all on taxonomy.career_degree_relations from public, anon, authenticated;
grant usage on schema taxonomy to service_role;
grant select, insert, update, delete on taxonomy.career_degree_relations to service_role;

insert into taxonomy.study_concepts (
  concept_key, slug, concept_type, canonical_name, description, status, metadata
)
values
  ('computer-science','computer-science','study_field','Computer Science','A canonical degree field for computing foundations, software development and related technical study.','active','{"degree_taxonomy_version":"ie-degree-v1"}'::jsonb),
  ('cybersecurity','cybersecurity','study_field','Cybersecurity','A canonical degree field for cyber-security, information-security and digital-forensics study.','active','{"degree_taxonomy_version":"ie-degree-v1"}'::jsonb),
  ('data-science','data-science','study_field','Data Science','A canonical degree field for data science, analytics, artificial intelligence and data-platform preparation.','active','{"degree_taxonomy_version":"ie-degree-v1"}'::jsonb),
  ('civil-engineering','civil-engineering','study_field','Civil Engineering','A canonical degree field for civil-engineering professional preparation.','active','{"degree_taxonomy_version":"ie-degree-v1"}'::jsonb),
  ('construction-management','construction-management','study_field','Construction Management','A canonical degree field for construction-management and construction-management-and-engineering study.','active','{"degree_taxonomy_version":"ie-degree-v1"}'::jsonb),
  ('diagnostic-radiography','diagnostic-radiography','study_field','Diagnostic Radiography','A canonical degree field for diagnostic-radiography professional preparation.','active','{"degree_taxonomy_version":"ie-degree-v1"}'::jsonb)
on conflict (concept_key) do update set
  slug=excluded.slug,
  concept_type=excluded.concept_type,
  canonical_name=excluded.canonical_name,
  description=excluded.description,
  status=excluded.status,
  metadata=excluded.metadata,
  updated_at=now();

with relation_seed(
  canonical_career_id,
  degree_concept_key,
  relation_type,
  directness,
  relationship_strength,
  rationale,
  source_authority,
  source_title,
  source_url,
  reference_period,
  source_checked_at
) as (
  values
    (
      'software-developer','computer-science','direct','direct','primary',
      'Computer Science is a reviewed direct study pathway to software-development work; practical experience and employer requirements remain separate.',
      'Dublin City University','DCU BSc in Computer Science','https://www.dcu.ie/courses/undergraduate/school-computing/computer-science',
      'Current provider programme page reviewed for the Ireland programme cohort','2026-08-10'::date
    ),
    (
      'cybersecurity-analyst','cybersecurity','direct','direct','primary',
      'Cybersecurity is a reviewed direct study pathway to cyber-security analyst work; a degree does not establish clearance, work-right or employment eligibility.',
      'Technological University Dublin','TU Dublin BSc (Hons) in Computing in Digital Forensics and Cyber Security','https://www.tudublin.ie/study/undergraduate/courses/computing-dig-forensics-and-cyber-sec-tu863/',
      'Current provider programme page reviewed for the Ireland programme cohort','2026-08-10'::date
    ),
    (
      'data-engineer','data-science','related','adjacent','supporting',
      'Data Science is a reviewed adjacent pathway to data engineering; data-pipeline, platform and infrastructure requirements remain role-specific.',
      'Dublin City University','DCU BSc in Data Science and Artificial Intelligence','https://www.dcu.ie/courses/undergraduate/school-computing/data-science-and-artificial-intelligence',
      'Current provider programme page reviewed for the Ireland programme cohort','2026-08-10'::date
    ),
    (
      'civil-engineer','civil-engineering','direct','direct','primary',
      'Civil Engineering is a reviewed direct study pathway to civil-engineering work; professional recognition and employer requirements remain separate.',
      'University of Galway','University of Galway BE (Hons) Engineering - Civil Engineering','https://www.universityofgalway.ie/courses/undergraduate-courses/civil-engineering.html',
      'Current provider programme page reviewed for the Ireland programme cohort','2026-08-10'::date
    ),
    (
      'construction-manager','construction-management','direct','direct','primary',
      'Construction Management is a reviewed direct study pathway to construction-management work; senior project responsibility normally requires additional experience.',
      'Technological University Dublin','TU Dublin BSc (Hons) Construction Management','https://www.tudublin.ie/study/undergraduate/courses/construction-management-tu833/',
      'Current provider programme page reviewed for the Ireland programme cohort','2026-08-10'::date
    ),
    (
      'radiographer','diagnostic-radiography','direct','direct','primary',
      'Diagnostic Radiography is a reviewed direct study pathway to radiography; CORU registration and protected-title requirements remain separate from study admission.',
      'Trinity College Dublin','Trinity MSc Diagnostic Radiography','https://www.tcd.ie/courses/postgraduate/courses/diagnostic-radiography-msc/',
      'Current provider programme page reviewed for the Ireland programme cohort','2026-08-10'::date
    )
)
insert into taxonomy.career_degree_relations (
  country_code, canonical_career_id, degree_concept_id, relation_type, directness,
  relationship_strength, rationale, source_authority, source_title, source_url,
  reference_period, source_checked_at, review_status
)
select
  'IE', seed.canonical_career_id, concept.id, seed.relation_type, seed.directness,
  seed.relationship_strength, seed.rationale, seed.source_authority, seed.source_title,
  seed.source_url, seed.reference_period, seed.source_checked_at, 'reviewed'
from relation_seed seed
join taxonomy.study_concepts concept on concept.concept_key=seed.degree_concept_key
on conflict (country_code, canonical_career_id, degree_concept_id) do update set
  relation_type=excluded.relation_type,
  directness=excluded.directness,
  relationship_strength=excluded.relationship_strength,
  rationale=excluded.rationale,
  source_authority=excluded.source_authority,
  source_title=excluded.source_title,
  source_url=excluded.source_url,
  reference_period=excluded.reference_period,
  source_checked_at=excluded.source_checked_at,
  review_status='reviewed',
  updated_at=now();

create or replace view public.career_degree_relation_read_v1
with (security_invoker=true) as
select
  relation.country_code,
  relation.canonical_career_id,
  relation.degree_concept_id as degree_id,
  degree.concept_key as degree_key,
  degree.slug as degree_slug,
  degree.canonical_name as degree_name,
  degree.description as degree_description,
  relation.relation_type,
  relation.directness,
  relation.relationship_strength,
  relation.rationale,
  relation.source_authority,
  relation.source_title,
  relation.source_url,
  relation.reference_period,
  relation.source_checked_at
from taxonomy.career_degree_relations relation
join taxonomy.study_concepts degree on degree.id=relation.degree_concept_id
where relation.review_status='reviewed'
  and degree.status='active';

revoke all on public.career_degree_relation_read_v1 from public, anon, authenticated;
grant select on public.career_degree_relation_read_v1 to service_role;

do $$
declare
  degree_count integer;
  relation_count integer;
  invalid_relation_count integer;
begin
  select count(*) into degree_count
  from taxonomy.study_concepts
  where concept_key in (
    'computer-science','cybersecurity','data-science','civil-engineering',
    'construction-management','diagnostic-radiography'
  ) and status='active';

  select count(*) into relation_count
  from taxonomy.career_degree_relations
  where country_code='IE'
    and canonical_career_id in (
      'software-developer','cybersecurity-analyst','data-engineer',
      'civil-engineer','construction-manager','radiographer'
    )
    and review_status='reviewed';

  select count(*) into invalid_relation_count
  from taxonomy.career_degree_relations
  where country_code='IE'
    and canonical_career_id in (
      'software-developer','cybersecurity-analyst','data-engineer',
      'civil-engineer','construction-manager','radiographer'
    )
    and (
      source_url is null
      or source_checked_at is null
      or btrim(reference_period)=''
      or btrim(rationale)=''
    );

  if degree_count<>6 or relation_count<>6 or invalid_relation_count<>0 then
    raise exception 'IE Career-Degree graph invariant failed: degrees %, relations %, invalid %',
      degree_count, relation_count, invalid_relation_count;
  end if;
end $$;

commit;
