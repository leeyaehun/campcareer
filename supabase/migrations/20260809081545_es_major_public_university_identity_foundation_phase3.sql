-- Spain Tier A major public-university identity foundation.
with source_rows(official_name, slug, canonical_name, website_url, source_url) as (
  values
    ('Universidad Complutense de Madrid', 'universidad-complutense-de-madrid', 'Universidad Complutense de Madrid', 'https://www.ucm.es/', 'https://www.ucm.es/'),
    ('Euskal Herriko Unibertsitatea (EHU)', 'euskal-herriko-unibertsitatea', 'Euskal Herriko Unibertsitatea (EHU)', 'https://www.ehu.eus/', 'https://www.ehu.eus/es/web/campusa/-/ehuk-aldeko-s-7rekin-onartu-ditu-estatutu-berriak'),
    ('Universitat de Barcelona', 'universitat-de-barcelona', 'Universitat de Barcelona', 'https://web.ub.edu/', 'https://web.ub.edu/es/contacto'),
    ('Universidad de Sevilla', 'universidad-de-sevilla', 'Universidad de Sevilla', 'https://www.us.es/', 'https://www.us.es/'),
    ('Universidad de Málaga', 'universidad-de-malaga', 'Universidad de Málaga', 'https://www.uma.es/', 'https://www.uma.es/'),
    ('Universidad Autónoma de Madrid', 'universidad-autonoma-de-madrid', 'Universidad Autónoma de Madrid', 'https://www.uam.es/', 'https://www.uam.es/uam/inicio'),
    ('Universitat Autònoma de Barcelona', 'universitat-autonoma-de-barcelona', 'Universitat Autònoma de Barcelona', 'https://www.uab.cat/', 'https://www.uab.cat/'),
    ('Universidad de Castilla-La Mancha', 'universidad-de-castilla-la-mancha', 'Universidad de Castilla-La Mancha', 'https://www.uclm.es/', 'https://www.uclm.es/'),
    ('Universidad de Cádiz', 'universidad-de-cadiz', 'Universidad de Cádiz', 'https://www.uca.es/', 'https://www.uca.es/'),
    ('Universitat Politècnica de Catalunya', 'universitat-politecnica-de-catalunya', 'Universitat Politècnica de Catalunya', 'https://www.upc.edu/', 'https://www.upc.edu/')
)
insert into catalog.institutions(id,country_code,canonical_name,institution_type,website_url,status,slug,institution_kind,ownership_type)
select md5('es:official-name:' || official_name)::uuid,'ES',canonical_name,'university',website_url,'active',slug,'university','public'
from source_rows
on conflict (country_code, slug) where slug is not null
do update set canonical_name=excluded.canonical_name,institution_type=excluded.institution_type,website_url=excluded.website_url,status=excluded.status,institution_kind=excluded.institution_kind,ownership_type=excluded.ownership_type,updated_at=now();

with source_rows(official_name, slug, source_url) as (
  values
    ('Universidad Complutense de Madrid', 'universidad-complutense-de-madrid', 'https://www.ucm.es/'),
    ('Euskal Herriko Unibertsitatea (EHU)', 'euskal-herriko-unibertsitatea', 'https://www.ehu.eus/es/web/campusa/-/ehuk-aldeko-s-7rekin-onartu-ditu-estatutu-berriak'),
    ('Universitat de Barcelona', 'universitat-de-barcelona', 'https://web.ub.edu/es/contacto'),
    ('Universidad de Sevilla', 'universidad-de-sevilla', 'https://www.us.es/'),
    ('Universidad de Málaga', 'universidad-de-malaga', 'https://www.uma.es/'),
    ('Universidad Autónoma de Madrid', 'universidad-autonoma-de-madrid', 'https://www.uam.es/uam/inicio'),
    ('Universitat Autònoma de Barcelona', 'universitat-autonoma-de-barcelona', 'https://www.uab.cat/'),
    ('Universidad de Castilla-La Mancha', 'universidad-de-castilla-la-mancha', 'https://www.uclm.es/'),
    ('Universidad de Cádiz', 'universidad-de-cadiz', 'https://www.uca.es/'),
    ('Universitat Politècnica de Catalunya', 'universitat-politecnica-de-catalunya', 'https://www.upc.edu/')
)
insert into catalog.institution_identifiers(institution_id,identifier_system,identifier_value,source_url)
select i.id,'ES_OFFICIAL_UNIVERSITY_NAME',s.official_name,s.source_url
from source_rows s join catalog.institutions i on i.country_code='ES' and i.slug=s.slug
on conflict (identifier_system, identifier_value)
do update set institution_id=excluded.institution_id,source_url=excluded.source_url;

create or replace view public.institution_identity_es_v1 with (security_invoker = true) as
select i.id institution_id,i.country_code,i.slug,i.canonical_name,
  official.identifier_value official_name,official.source_url official_name_source_url,
  'https://www.ciencia.gob.es/Universidades/RUCT.html'::text registry_reference_url
from catalog.institutions i
join catalog.institution_identifiers official on official.institution_id=i.id and official.identifier_system='ES_OFFICIAL_UNIVERSITY_NAME'
where i.country_code='ES' and i.status<>'inactive' and i.slug is not null;
revoke all on public.institution_identity_es_v1 from public,anon,authenticated;
grant select on public.institution_identity_es_v1 to service_role;

do $$ declare c integer; begin
 select count(*) into c from public.institution_identity_es_v1; if c<>10 then raise exception 'Expected 10 ES Tier A identities, found %',c; end if;
 select count(*) into c from public.institution_identity_es_v1 where official_name is null or official_name_source_url !~ '^https://' or registry_reference_url !~ '^https://'; if c>0 then raise exception 'Found % invalid ES identity rows',c; end if;
 select count(*) into c from catalog.institutions where country_code='ES' and status<>'inactive' and (institution_kind is distinct from 'university' or ownership_type is distinct from 'public' or website_url !~ '^https://'); if c>0 then raise exception 'Found % invalid ES Tier A institution rows',c; end if;
end $$;;
