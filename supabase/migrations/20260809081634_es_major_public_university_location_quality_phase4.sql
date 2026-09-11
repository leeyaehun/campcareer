with city_rows(name, slug) as (
  values
    ('Madrid', 'madrid'),('Leioa', 'leioa'),('Barcelona', 'barcelona'),('Sevilla', 'sevilla'),('Málaga', 'malaga'),('Cerdanyola del Vallès', 'cerdanyola-del-valles'),('Ciudad Real', 'ciudad-real'),('Cádiz', 'cadiz')
)
insert into core.geographies(id,country_code,geography_type,name,slug,metadata,status)
select md5('es:city:'||slug)::uuid,'ES','city',name,slug,jsonb_build_object('source_tier','institution_official','source_system','UNIVERSITY_OFFICIAL_CONTACT','normalization_batch','es_tier_a_locations_v1'),'active'
from city_rows
on conflict(id) do update set name=excluded.name,slug=excluded.slug,metadata=coalesce(core.geographies.metadata,'{}'::jsonb)||excluded.metadata,status=excluded.status,updated_at=now();

with location_rows(slug, city_name, city_slug, location_name, address_line, postal_code, source_url) as (
  values
    ('universidad-complutense-de-madrid','Madrid','madrid','Rectorado','Avenida de Séneca, 2','28040','https://www.ucm.es/rector'),
    ('euskal-herriko-unibertsitatea','Leioa','leioa','Rectorado','Barrio Sarriena, s/n','48940','https://www.ehu.eus/es/web/idazkaritza-nagusia/rector1'),
    ('universitat-de-barcelona','Barcelona','barcelona','Rectorat','Gran Via de les Corts Catalanes, 585','08007','https://web.ub.edu/es/web/unitats-administratives/w/rectorat'),
    ('universidad-de-sevilla','Sevilla','sevilla','Rectorado','C/ San Fernando, 4','41004','https://www.us.es/trabaja-en-la-us/servicios_centrales/gabinete-sr-rector'),
    ('universidad-de-malaga','Málaga','malaga','Pabellón de Gobierno y Paraninfo','Bulevar Louis Pasteur, 43','29010','https://www.uma.es/gobierno/cms/menu/equipo-de-direccion/'),
    ('universidad-autonoma-de-madrid','Madrid','madrid','Edificio Rectorado','C/ Einstein, 3','28049','https://www.uam.es/uam/organos-gobierno/equipo-gobierno/vicerrectorado-internacionalizacion'),
    ('universitat-autonoma-de-barcelona','Cerdanyola del Vallès','cerdanyola-del-valles','Rectorat','Edifici A, plaça Acadèmica, Bellaterra','08193','https://www.uab.cat/web/la-uab/organs-de-govern-i-de-representacio/equip-de-govern/javier-lafuente-1345935425821.html'),
    ('universidad-de-castilla-la-mancha','Ciudad Real','ciudad-real','Rectorado','C/ Altagracia, 50','13071','https://www.uclm.es/es/misiones/lauclm/consejodedireccion/rector/estructura'),
    ('universidad-de-cadiz','Cádiz','cadiz','Rectorado','Paseo Carlos III, 9','11003','https://rector.uca.es/secretaria/'),
    ('universitat-politecnica-de-catalunya','Barcelona','barcelona','Edifici Rectorat','Jordi Girona, 31','08034','https://www.upc.edu/es/la-upc/gobierno-y-representacion/rector')
), resolved as (
  select i.id institution_id,l.slug,l.city_name,l.city_slug,l.location_name,l.address_line,l.postal_code,l.source_url,g.id geography_id
  from location_rows l
  join catalog.institutions i on i.country_code='ES' and i.slug=l.slug and i.status<>'inactive'
  join core.geographies g on g.country_code='ES' and g.geography_type='city' and g.slug=l.city_slug and g.status='active'
)
insert into catalog.campuses(id,institution_id,name,city,locality,country_code,geography_id,locality_geography_id,address_line,postal_code,official_url,source_url,source_checked_at,metadata,status)
select md5('es:tier-a-admin-location:'||r.slug)::uuid,r.institution_id,r.location_name,r.city_name,r.city_name,'ES',r.geography_id,r.geography_id,r.address_line,r.postal_code,r.source_url,r.source_url,now(),jsonb_build_object('record_scope','primary_administrative_location','location_quality','verified_official','display_policy','preferred','source_tier','institution_official','source_system','UNIVERSITY_OFFICIAL_CONTACT','location_key','primary-administrative-location','coordinate_precision','not_asserted','campus_inventory_complete',false,'programme_assignment_verified',false,'normalization_batch','es_tier_a_locations_v1'),'active'
from resolved r
on conflict(id) do update set name=excluded.name,city=excluded.city,locality=excluded.locality,geography_id=excluded.geography_id,locality_geography_id=excluded.locality_geography_id,address_line=excluded.address_line,postal_code=excluded.postal_code,official_url=excluded.official_url,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at,metadata=excluded.metadata,status=excluded.status,updated_at=now();

create or replace view public.institution_location_es_v1 with (security_invoker = true) as
select c.institution_id,c.id campus_id,c.name,g.name city_name,g.slug city_slug,coalesce(nullif(c.city,''),nullif(c.locality,'')) reported_city,c.region,c.address_line,c.postal_code,c.official_url,c.source_url,c.source_checked_at,c.metadata->>'location_quality' location_quality,c.metadata->>'record_scope' record_scope
from catalog.campuses c
join catalog.institutions i on i.id=c.institution_id and i.country_code='ES'
left join core.geographies g on g.id=coalesce(c.locality_geography_id,c.geography_id) and g.status='active'
where c.status<>'inactive' and c.metadata->>'location_quality'='verified_official';
revoke all on public.institution_location_es_v1 from public,anon,authenticated;
grant select on public.institution_location_es_v1 to service_role;

do $$ declare c integer; begin
 select count(*) into c from public.institution_location_es_v1; if c<>10 then raise exception 'Expected 10 ES Tier A locations, found %',c; end if;
 select count(*) into c from public.institution_location_es_v1 where address_line is null or postal_code !~ '^[0-9]{5}$' or source_url !~ '^https://'; if c>0 then raise exception 'Found % invalid ES location rows',c; end if;
 select count(*) into c from catalog.campuses cp join catalog.institutions i on i.id=cp.institution_id where i.country_code='ES' and cp.status<>'inactive' and cp.metadata->>'location_quality'='verified_official' and (cp.latitude is not null or cp.longitude is not null); if c>0 then raise exception 'ES location rows must not infer coordinates; found %',c; end if;
end $$;;
