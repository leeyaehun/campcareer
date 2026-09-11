-- Institutions identity foundation.
--
-- Keep the existing canonical UUIDs in catalog.institutions as the source of
-- truth, persist stable URL slugs, separate provider kind from ownership, and
-- expose narrow service-role-only bridges for the legacy Australian Programs
-- surfaces. Existing provider/program IDs remain unchanged for backwards
-- compatibility.

alter table catalog.institutions
  add column if not exists slug text,
  add column if not exists institution_kind text,
  add column if not exists ownership_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'catalog.institutions'::regclass
      and conname = 'institutions_slug_format_chk'
  ) then
    alter table catalog.institutions
      add constraint institutions_slug_format_chk
      check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'catalog.institutions'::regclass
      and conname = 'institutions_kind_chk'
  ) then
    alter table catalog.institutions
      add constraint institutions_kind_chk
      check (
        institution_kind is null
        or institution_kind in ('university', 'college', 'polytechnic', 'tafe_vet', 'other')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'catalog.institutions'::regclass
      and conname = 'institutions_ownership_type_chk'
  ) then
    alter table catalog.institutions
      add constraint institutions_ownership_type_chk
      check (
        ownership_type is null
        or ownership_type in ('public', 'private', 'private_nonprofit', 'private_forprofit')
      );
  end if;
end $$;

update catalog.institutions
set institution_kind = case lower(btrim(institution_type))
  when 'university' then 'university'
  when 'college' then 'college'
  when 'polytechnic' then 'polytechnic'
  when 'tafe' then 'tafe_vet'
  when 'tafe/vet' then 'tafe_vet'
  when 'vet' then 'tafe_vet'
  else institution_kind
end
where institution_kind is null
  and lower(btrim(coalesce(institution_type, ''))) in (
    'university', 'college', 'polytechnic', 'tafe', 'tafe/vet', 'vet'
  );

update catalog.institutions
set ownership_type = case lower(btrim(institution_type))
  when 'public' then 'public'
  when 'private' then 'private'
  when 'private_nonprofit' then 'private_nonprofit'
  when 'private_forprofit' then 'private_forprofit'
  else ownership_type
end
where ownership_type is null
  and lower(btrim(coalesce(institution_type, ''))) in (
    'public', 'private', 'private_nonprofit', 'private_forprofit'
  );

with slug_candidates as (
  select
    i.id,
    i.country_code,
    regexp_replace(
      left(
        trim(
          both '-'
          from lower(
            regexp_replace(
              replace(i.canonical_name, '&', ' and '),
              '[^A-Za-z0-9]+',
              '-',
              'g'
            )
          )
        ),
        100
      ),
      '^the-',
      ''
    ) as slug_base,
    (
      select ii.identifier_value
      from catalog.institution_identifiers ii
      where ii.institution_id = i.id
      order by
        case ii.identifier_system
          when 'AU_PROVIDER_ID' then 1
          when 'CA_PROVIDER_ID' then 1
          when 'IE_PROVIDER_ID' then 1
          when 'UK_PROVIDER_ID' then 1
          when 'NL_PROVIDER_ID' then 1
          when 'US_UNIT_ID' then 1
          else 20
        end,
        ii.identifier_system,
        ii.identifier_value
      limit 1
    ) as preferred_identifier
  from catalog.institutions i
), ranked as (
  select
    sc.*,
    count(*) over (partition by sc.country_code, sc.slug_base) as slug_count
  from slug_candidates sc
), resolved as (
  select
    id,
    case
      when slug_count = 1 then slug_base
      else slug_base || '-' || coalesce(
        nullif(
          trim(
            both '-'
            from lower(
              regexp_replace(preferred_identifier, '[^A-Za-z0-9]+', '-', 'g')
            )
          ),
          ''
        ),
        left(id::text, 8)
      )
    end as resolved_slug
  from ranked
)
update catalog.institutions i
set slug = r.resolved_slug
from resolved r
where i.id = r.id
  and (i.slug is null or btrim(i.slug) = '');

create unique index if not exists institutions_country_slug_uidx
  on catalog.institutions (country_code, slug)
  where slug is not null;

create index if not exists institutions_kind_idx
  on catalog.institutions (country_code, institution_kind)
  where institution_kind is not null;

comment on column catalog.institutions.slug is
  'Stable user-facing route slug. Set once for published institutions; do not regenerate on name changes.';
comment on column catalog.institutions.institution_kind is
  'Normalized provider kind for user-facing filtering. NULL means not yet source-verified.';
comment on column catalog.institutions.ownership_type is
  'Normalized ownership/control classification, kept separate from institution_kind.';

create or replace view public.au_institution_identity_v1
with (security_invoker = true) as
select
  ii.identifier_value as legacy_provider_id,
  i.id as institution_id,
  i.slug as institution_slug,
  i.canonical_name as institution_name,
  i.institution_kind,
  i.ownership_type
from catalog.institutions i
join catalog.institution_identifiers ii
  on ii.institution_id = i.id
 and ii.identifier_system = 'AU_PROVIDER_ID'
where i.country_code = 'AU';

create or replace view public.au_program_identity_v1
with (security_invoker = true) as
select
  c.id as legacy_program_id,
  c.institution_id as legacy_provider_id,
  p.id as programme_id,
  p.institution_id,
  i.slug as institution_slug
from ingest.courses_au c
join catalog.institution_identifiers provider_identifier
  on provider_identifier.identifier_system = 'AU_PROVIDER_ID'
 and provider_identifier.identifier_value = c.institution_id
join catalog.programme_identifiers programme_identifier
  on programme_identifier.identifier_system = 'LEGACY_COURSES_AU_ID'
 and programme_identifier.identifier_value = c.id::text
join catalog.programmes p
  on p.id = programme_identifier.programme_id
join catalog.institutions i
  on i.id = p.institution_id
where provider_identifier.institution_id = p.institution_id;

revoke all on public.au_institution_identity_v1 from public, anon, authenticated;
revoke all on public.au_program_identity_v1 from public, anon, authenticated;
grant select on public.au_institution_identity_v1 to service_role;
grant select on public.au_program_identity_v1 to service_role;

do $$
declare
  duplicate_slug_count integer;
  unresolved_provider_count integer;
  identity_mismatch_count integer;
begin
  select count(*)
  into duplicate_slug_count
  from (
    select country_code, slug
    from catalog.institutions
    where slug is not null
    group by country_code, slug
    having count(*) > 1
  ) duplicates;

  if duplicate_slug_count > 0 then
    raise exception
      'Institution slug backfill produced % duplicate country/slug pairs',
      duplicate_slug_count;
  end if;

  select count(*)
  into unresolved_provider_count
  from ingest.courses_au c
  left join catalog.institution_identifiers ii
    on ii.identifier_system = 'AU_PROVIDER_ID'
   and ii.identifier_value = c.institution_id
  where ii.institution_id is null;

  if unresolved_provider_count > 0 then
    raise exception
      'AU provider identity bridge has % unresolved course rows',
      unresolved_provider_count;
  end if;

  select count(*)
  into identity_mismatch_count
  from ingest.courses_au c
  join catalog.institution_identifiers provider_identifier
    on provider_identifier.identifier_system = 'AU_PROVIDER_ID'
   and provider_identifier.identifier_value = c.institution_id
  join catalog.programme_identifiers programme_identifier
    on programme_identifier.identifier_system = 'LEGACY_COURSES_AU_ID'
   and programme_identifier.identifier_value = c.id::text
  join catalog.programmes p
    on p.id = programme_identifier.programme_id
  where provider_identifier.institution_id <> p.institution_id;

  if identity_mismatch_count > 0 then
    raise exception
      'AU programme/provider identity paths disagree for % rows',
      identity_mismatch_count;
  end if;
end $$;;
