with source_rows(legacy_provider_id, canonical_name, slug, website_url, ukprn) as (
  values
    ('aston-university', 'Aston University', 'aston-university', 'https://www.aston.ac.uk/', '10007759'),
    ('brunel-university-london', 'Brunel University of London', 'brunel-university-of-london', 'https://www.brunel.ac.uk/', '10000961'),
    ('cardiff-university', 'Cardiff University', 'cardiff-university', 'https://www.cardiff.ac.uk/', '10007814'),
    ('city-university-of-london', 'City St George''s, University of London', 'city-st-georges-university-of-london', 'https://www.citystgeorges.ac.uk/', '10001478'),
    ('coventry-university', 'Coventry University', 'coventry-university', 'https://www.coventry.ac.uk/', '10001726'),
    ('durham-university', 'Durham University', 'durham-university', 'https://www.durham.ac.uk/', '10007143'),
    ('heriot-watt-university', 'Heriot-Watt University', 'heriot-watt-university', 'https://www.hw.ac.uk/', '10007764'),
    ('imperial-college-london', 'Imperial College London', 'imperial-college-london', 'https://www.imperial.ac.uk/', '10003270'),
    ('king-s-college-london', 'King''s College London', 'king-s-college-london', 'https://www.kcl.ac.uk/', '10003645'),
    ('lancaster-university', 'Lancaster University', 'lancaster-university', 'https://www.lancaster.ac.uk/', '10007768'),
    ('london-school-of-economics-and-political-science', 'London School of Economics and Political Science', 'london-school-of-economics-and-political-science', 'https://www.lse.ac.uk/', '10004063'),
    ('loughborough-university', 'Loughborough University', 'loughborough-university', 'https://www.lboro.ac.uk/', '10004113'),
    ('newcastle-university', 'Newcastle University', 'newcastle-university', 'https://www.ncl.ac.uk/', '10007799'),
    ('nottingham-trent-university', 'Nottingham Trent University', 'nottingham-trent-university', 'https://www.ntu.ac.uk/', '10004797'),
    ('queen-mary-university-of-london', 'Queen Mary University of London', 'queen-mary-university-of-london', 'https://www.qmul.ac.uk/', '10007775'),
    ('queen-s-university-belfast', 'Queen''s University Belfast', 'queen-s-university-belfast', 'https://www.qub.ac.uk/', '10005343'),
    ('royal-holloway-university-of-london', 'Royal Holloway, University of London', 'royal-holloway-university-of-london', 'https://www.royalholloway.ac.uk/', '10005553'),
    ('swansea-university', 'Swansea University', 'swansea-university', 'https://www.swansea.ac.uk/', '10007855'),
    ('ulster-university', 'Ulster University', 'ulster-university', 'https://www.ulster.ac.uk/', '10007807'),
    ('university-college-london', 'University College London', 'university-college-london', 'https://www.ucl.ac.uk/', '10007784'),
    ('university-of-aberdeen', 'University of Aberdeen', 'university-of-aberdeen', 'https://www.abdn.ac.uk/', '10007783'),
    ('university-of-bath', 'University of Bath', 'university-of-bath', 'https://www.bath.ac.uk/', '10007850'),
    ('university-of-birmingham', 'University of Birmingham', 'university-of-birmingham', 'https://www.birmingham.ac.uk/', '10006840'),
    ('university-of-bradford', 'University of Bradford', 'university-of-bradford', 'https://www.bradford.ac.uk/', '10007785'),
    ('university-of-bristol', 'University of Bristol', 'university-of-bristol', 'https://www.bristol.ac.uk/', '10007786'),
    ('university-of-cambridge', 'University of Cambridge', 'university-of-cambridge', 'https://www.cam.ac.uk/', '10007788'),
    ('university-of-east-anglia', 'University of East Anglia', 'university-of-east-anglia', 'https://www.uea.ac.uk/', '10007789'),
    ('university-of-edinburgh', 'University of Edinburgh', 'university-of-edinburgh', 'https://www.ed.ac.uk/', '10007790'),
    ('university-of-essex', 'University of Essex', 'university-of-essex', 'https://www.essex.ac.uk/', '10007791'),
    ('university-of-exeter', 'University of Exeter', 'university-of-exeter', 'https://www.exeter.ac.uk/', '10007792'),
    ('university-of-glasgow', 'University of Glasgow', 'university-of-glasgow', 'https://www.gla.ac.uk/', '10007794'),
    ('university-of-hertfordshire', 'University of Hertfordshire', 'university-of-hertfordshire', 'https://www.herts.ac.uk/', '10007147'),
    ('university-of-kent', 'University of Kent', 'university-of-kent', 'https://www.kent.ac.uk/', '10007150'),
    ('university-of-leeds', 'University of Leeds', 'university-of-leeds', 'https://www.leeds.ac.uk/', '10007795'),
    ('university-of-leicester', 'University of Leicester', 'university-of-leicester', 'https://le.ac.uk/', '10007796'),
    ('university-of-liverpool', 'University of Liverpool', 'university-of-liverpool', 'https://www.liverpool.ac.uk/', '10006842'),
    ('university-of-manchester', 'University of Manchester', 'university-of-manchester', 'https://www.manchester.ac.uk/', '10007798'),
    ('university-of-nottingham', 'University of Nottingham', 'university-of-nottingham', 'https://www.nottingham.ac.uk/', '10007154'),
    ('university-of-oxford', 'University of Oxford', 'university-of-oxford', 'https://www.ox.ac.uk/', '10007774'),
    ('university-of-plymouth', 'University of Plymouth', 'university-of-plymouth', 'https://www.plymouth.ac.uk/', '10007801'),
    ('university-of-reading', 'University of Reading', 'university-of-reading', 'https://www.reading.ac.uk/', '10007802'),
    ('university-of-salford', 'University of Salford', 'university-of-salford', 'https://www.salford.ac.uk/', '10007156'),
    ('university-of-sheffield', 'University of Sheffield', 'university-of-sheffield', 'https://www.sheffield.ac.uk/', '10007157'),
    ('university-of-southampton', 'University of Southampton', 'university-of-southampton', 'https://www.southampton.ac.uk/', '10007158'),
    ('university-of-st-andrews', 'University of St Andrews', 'university-of-st-andrews', 'https://www.st-andrews.ac.uk/', '10007803'),
    ('university-of-strathclyde', 'University of Strathclyde', 'university-of-strathclyde', 'https://www.strath.ac.uk/', '10007805'),
    ('university-of-surrey', 'University of Surrey', 'university-of-surrey', 'https://www.surrey.ac.uk/', '10007160'),
    ('university-of-sussex', 'University of Sussex', 'university-of-sussex', 'https://www.sussex.ac.uk/', '10007806'),
    ('university-of-warwick', 'University of Warwick', 'university-of-warwick', 'https://warwick.ac.uk/', '10007163'),
    ('university-of-york', 'University of York', 'university-of-york', 'https://www.york.ac.uk/', '10007167')
), updated as (
  update catalog.institutions i
  set
    canonical_name = s.canonical_name,
    slug = s.slug,
    website_url = s.website_url,
    institution_kind = 'university',
    ownership_type = null,
    updated_at = now()
  from source_rows s
  join catalog.institution_identifiers legacy
    on legacy.identifier_system = 'UK_PROVIDER_ID'
   and legacy.identifier_value = s.legacy_provider_id
  where i.id = legacy.institution_id
    and i.country_code = 'UK'
  returning i.id
)
insert into catalog.institution_identifiers(
  institution_id,
  identifier_system,
  identifier_value,
  source_url
)
select
  legacy.institution_id,
  'UK_UKPRN',
  s.ukprn,
  'https://discoveruni.gov.uk/institution-details/' || s.ukprn || '/'
from source_rows s
join catalog.institution_identifiers legacy
  on legacy.identifier_system = 'UK_PROVIDER_ID'
 and legacy.identifier_value = s.legacy_provider_id
join catalog.institutions i
  on i.id = legacy.institution_id
 and i.country_code = 'UK'
on conflict (identifier_system, identifier_value)
do update set
  institution_id = excluded.institution_id,
  source_url = excluded.source_url;

create or replace view public.institution_identity_uk_v1
with (security_invoker = true) as
select
  i.id as institution_id,
  i.country_code,
  i.slug,
  i.canonical_name,
  official.identifier_value as ukprn,
  official.source_url as ukprn_source_url,
  legacy.identifier_value as legacy_provider_id
from catalog.institutions i
join catalog.institution_identifiers official
  on official.institution_id = i.id
 and official.identifier_system = 'UK_UKPRN'
left join catalog.institution_identifiers legacy
  on legacy.institution_id = i.id
 and legacy.identifier_system = 'UK_PROVIDER_ID'
where i.country_code = 'UK'
  and i.status <> 'inactive'
  and i.slug is not null;

comment on view public.institution_identity_uk_v1 is
  'Service-role UK institution identity read model. UK_UKPRN is the official 8-digit UKRLP provider identifier; legacy_provider_id is retained only for deterministic historical import joins.';

revoke all on public.institution_identity_uk_v1 from public, anon, authenticated;
grant select on public.institution_identity_uk_v1 to service_role;

do $$
declare
  provider_count integer;
  official_count integer;
  normalized_count integer;
  invalid_ukprn_count integer;
  duplicate_slug_count integer;
  active_program_count integer;
  active_program_institution_count integer;
begin
  select count(*) into provider_count
  from catalog.institution_identifiers ii
  join catalog.institutions i on i.id = ii.institution_id
  where ii.identifier_system = 'UK_PROVIDER_ID' and i.country_code = 'UK';

  select count(*) into official_count
  from catalog.institution_identifiers ii
  join catalog.institutions i on i.id = ii.institution_id
  where ii.identifier_system = 'UK_UKPRN' and i.country_code = 'UK';

  select count(*) into normalized_count
  from catalog.institutions i
  where i.country_code = 'UK'
    and i.status <> 'inactive'
    and i.institution_kind = 'university'
    and i.ownership_type is null
    and i.website_url ~ '^https://';

  select count(*) into invalid_ukprn_count
  from catalog.institution_identifiers ii
  join catalog.institutions i on i.id = ii.institution_id
  where ii.identifier_system = 'UK_UKPRN'
    and i.country_code = 'UK'
    and ii.identifier_value !~ '^[0-9]{8}$';

  select count(*) into duplicate_slug_count
  from (
    select slug from catalog.institutions
    where country_code = 'UK' and status <> 'inactive'
    group by slug having count(*) > 1
  ) d;

  select count(*), count(distinct p.institution_id)
  into active_program_count, active_program_institution_count
  from catalog.programmes p
  join catalog.institutions i on i.id = p.institution_id
  where i.country_code = 'UK' and p.status = 'active';

  if provider_count <> 50 then raise exception 'Expected 50 UK provider IDs, found %', provider_count; end if;
  if official_count <> 50 then raise exception 'Expected 50 UKPRNs, found %', official_count; end if;
  if normalized_count <> 50 then raise exception 'Expected 50 normalized UK institutions, found %', normalized_count; end if;
  if invalid_ukprn_count <> 0 then raise exception 'Found % invalid UKPRNs', invalid_ukprn_count; end if;
  if duplicate_slug_count <> 0 then raise exception 'Found % duplicate UK slugs', duplicate_slug_count; end if;
  if active_program_count <> 185 or active_program_institution_count <> 50 then
    raise exception 'Expected 185 active programmes across 50 UK institutions, found % across %', active_program_count, active_program_institution_count;
  end if;

  if not exists (
    select 1 from public.institution_identity_uk_v1
    where ukprn = '10001478'
      and slug = 'city-st-georges-university-of-london'
      and legacy_provider_id = 'city-university-of-london'
  ) then
    raise exception 'City St George''s successor identity mismatch';
  end if;
end $$;;
