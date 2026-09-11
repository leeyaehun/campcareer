-- Official institution logo/brand-mark sources for the AU/CA Institutions MVP.
--
-- Keep presentation metadata on the canonical institution row so better official
-- SVG/PNG assets can replace the initial official-site icon without changing UI
-- code. The first backfill intentionally uses only each institution's own HTTPS
-- website origin. Browser roles do not receive direct access to the read view.

alter table catalog.institutions
  add column if not exists logo_url text,
  add column if not exists logo_source_url text,
  add column if not exists logo_asset_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'catalog.institutions'::regclass
      and conname = 'institutions_logo_url_https_chk'
  ) then
    alter table catalog.institutions
      add constraint institutions_logo_url_https_chk
      check (logo_url is null or logo_url ~ '^https://');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'catalog.institutions'::regclass
      and conname = 'institutions_logo_source_url_https_chk'
  ) then
    alter table catalog.institutions
      add constraint institutions_logo_source_url_https_chk
      check (logo_source_url is null or logo_source_url ~ '^https://');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'catalog.institutions'::regclass
      and conname = 'institutions_logo_asset_type_chk'
  ) then
    alter table catalog.institutions
      add constraint institutions_logo_asset_type_chk
      check (
        logo_asset_type is null
        or logo_asset_type in ('official_logo', 'official_site_icon')
      );
  end if;
end $$;

update catalog.institutions
set
  logo_url = regexp_replace(
    website_url,
    '^(https://[^/]+).*$','\1/favicon.ico'
  ),
  logo_source_url = website_url,
  logo_asset_type = 'official_site_icon'
where country_code in ('AU', 'CA')
  and status <> 'inactive'
  and website_url ~ '^https://'
  and (logo_url is null or btrim(logo_url) = '');

comment on column catalog.institutions.logo_url is
  'HTTPS URL for a verified institution-owned logo or site brand mark. UI must fall back safely when the asset is unavailable.';
comment on column catalog.institutions.logo_source_url is
  'Official institution page used to verify the provenance of logo_url.';
comment on column catalog.institutions.logo_asset_type is
  'Whether logo_url is a dedicated official logo asset or an official website icon.';

create or replace view public.institution_logo_v1
with (security_invoker = true) as
select
  i.id as institution_id,
  i.country_code,
  i.slug,
  i.logo_url,
  i.logo_source_url,
  i.logo_asset_type
from catalog.institutions i
where i.status <> 'inactive'
  and i.slug is not null
  and i.country_code in ('AU', 'CA')
  and i.logo_url is not null;

comment on view public.institution_logo_v1 is
  'Service-role institution logo provenance read model. Initial AU/CA assets come only from each institution official HTTPS website origin.';

revoke all on public.institution_logo_v1 from public, anon, authenticated;
grant select on public.institution_logo_v1 to service_role;

do $$
declare
  third_party_logo_count integer;
  missing_logo_count integer;
begin
  select count(*)
  into third_party_logo_count
  from catalog.institutions i
  where i.country_code in ('AU', 'CA')
    and i.logo_url is not null
    and i.website_url is not null
    and regexp_replace(i.logo_url, '^(https://[^/]+).*$','\1')
      <> regexp_replace(i.website_url, '^(https://[^/]+).*$','\1');

  if third_party_logo_count > 0 then
    raise exception
      'Institution logo backfill produced % third-party logo hosts',
      third_party_logo_count;
  end if;

  select count(*)
  into missing_logo_count
  from catalog.institutions i
  where i.country_code in ('AU', 'CA')
    and i.status <> 'inactive'
    and i.website_url ~ '^https://'
    and i.logo_url is null;

  if missing_logo_count > 0 then
    raise exception
      'Institution logo backfill skipped % current AU/CA institutions with official HTTPS websites',
      missing_logo_count;
  end if;
end $$;
;
