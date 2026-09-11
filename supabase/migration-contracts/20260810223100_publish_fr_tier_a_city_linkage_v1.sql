-- France Cities Phase 3: verified teaching-location linkage for the exact seven Tier A destinations.
-- Public destination geography and physical teaching locality remain distinct where required.

with x(id_seed,name,slug,code,region_code,source_url) as (values
 ('fr:locality:orsay','Orsay','orsay','91471','11','https://www.insee.fr/fr/metadonnees/geographie/commune/91471-orsay'),
 ('fr:locality:aix-en-provence','Aix-en-Provence','aix-en-provence','13001','93','https://www.insee.fr/fr/metadonnees/geographie/commune/13001-aix-en-provence'))
insert into core.geographies(id,country_code,geography_type,code,name,region_code,metadata,slug,scope_kind,status)
select md5(id_seed)::uuid,'FR','locality',code,name,region_code,jsonb_build_object('record_scope','official_commune_locality','official_geography_code',code,'official_geography_code_system','INSEE COG commune','scope_source_url',source_url,'fr_city_linkage_v1',true),slug,'locality','active' from x
on conflict(id) do update set code=excluded.code,name=excluded.name,region_code=excluded.region_code,metadata=excluded.metadata,slug=excluded.slug,scope_kind='locality',status='active',updated_at=now();

update core.geographies set code='13055',region_code='93',metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('official_geography_code','13055','official_geography_code_system','INSEE COG commune','record_scope','registered_commune_locality','scope_source_url','https://www.insee.fr/fr/metadonnees/geographie/commune/13055-marseille'),updated_at=now()
where country_code='FR' and slug='marseille';

with x(provider_slug,k,n,destination_slug,city,locality,locality_slug,address_line,postal_code,url,linkage_basis) as (values
 ('sorbonne-universite','pierre-marie-curie','Sorbonne Université Campus Pierre et Marie Curie','paris','Paris','Paris','paris','4 place Jussieu','75005','https://www.sorbonne-universite.fr/en/sorbonne-universite-campus-pierre-et-marie-curie','direct_university_teaching_campus'),
 ('universite-paris-cite','grands-moulins','Université Paris Cité Campus des Grands Moulins','paris','Paris','Paris','paris','5 rue Thomas Mann','75013','https://u-paris.fr/batiment-des-grands-moulins/','direct_university_teaching_campus'),
 ('universite-psl','mines-paris-psl','Mines Paris – PSL Paris Campus','paris','Paris','Paris','paris','60 boulevard Saint-Michel','75006','https://www.minesparis.psl.eu/en/campus-life/campus/paris-campus/','psl_member_teaching_campus'),
 ('universite-paris-saclay','orsay','Université Paris-Saclay Campus d’Orsay','paris-saclay','Orsay','Orsay','orsay','Campus d’Orsay','91400','https://www.universite-paris-saclay.fr/vie-de-campus/culture-arts-sciences-societe/campus-culturel','direct_university_teaching_campus'),
 ('universite-de-bordeaux','talence-peixotto','Université de Bordeaux Campus Talence / Peixotto','bordeaux','Talence','Talence','talence','351 cours de la Libération','33405','https://sciences-et-technologies.u-bordeaux.fr/presentation/nos-campus','direct_university_teaching_campus'),
 ('universite-de-strasbourg','esplanade','Université de Strasbourg Campus Esplanade','strasbourg','Strasbourg','Strasbourg','strasbourg-commune','4 rue Blaise Pascal','67000','https://www.unistra.fr/fr/campus/esplanade','direct_university_teaching_campus'),
 ('universite-grenoble-alpes','saint-martin-dheres','Université Grenoble Alpes Saint-Martin-d’Hères Campus','grenoble','Saint-Martin-d''Hères','Saint-Martin-d''Hères','saint-martin-dheres','621 avenue Centrale','38400','https://www.univ-grenoble-alpes.fr/','direct_university_teaching_campus'),
 ('aix-marseille-universite','aix-schuman','Aix-Marseille Université Site Schuman','aix-marseille','Aix-en-Provence','Aix-en-Provence','aix-en-provence','3 avenue Robert Schuman','13628','https://facdedroit.univ-amu.fr/fr/faculte/sites-geographiques','direct_university_teaching_campus'),
 ('aix-marseille-universite','marseille-saint-charles','Aix-Marseille Université Site Saint-Charles','aix-marseille','Marseille','Marseille','marseille','3 place Victor Hugo','13331','https://sciences.univ-amu.fr/en/sites-campus/marseille-site-saint-charles','direct_university_teaching_campus'),
 ('universite-cote-dazur','valrose','Université Côte d’Azur Campus Valrose','nice','Nice','Nice','nice-commune','28 Avenue Valrose','06108','https://univ-cotedazur.fr/vie-des-campus/visite-des-campus/campus-valrose','direct_university_teaching_campus')),
r as (
 select x.*,i.id institution_id,ii.identifier_value official_identity,ii.source_url identity_source_url,d.id destination_id,d.region_code,l.id locality_id
 from x
 join catalog.institutions i on i.country_code='FR' and i.status='active' and i.slug=x.provider_slug
 join catalog.institution_identifiers ii on ii.institution_id=i.id and ii.identifier_system='FR_UAI'
 join core.geographies d on d.country_code='FR' and d.slug=x.destination_slug and d.status='active' and d.metadata->>'publication_tier'='A'
 join core.geographies l on l.country_code='FR' and l.slug=x.locality_slug and l.status='active')
insert into catalog.campuses(id,institution_id,name,city,locality,region,country_code,geography_id,locality_geography_id,address_line,postal_code,official_url,source_url,source_checked_at,metadata,status)
select md5('fr_city_phase3:'||provider_slug||':'||k)::uuid,institution_id,n,city,locality,region_code,'FR',destination_id,locality_id,address_line,postal_code,url,url,now(),
 jsonb_build_object('record_scope','verified_teaching_campus','location_quality','verified_official','source_tier','institution_official','location_key',k,'official_identity',official_identity,'identity_source_url',identity_source_url,'normalization_batch','fr_city_linkage_v1','programme_assignment_verified',false,'coordinate_precision','not_asserted','campus_inventory_complete',false,'linkage_basis',linkage_basis,'public_destination_slug',destination_slug,'locality_slug',locality_slug), 'active'
from r
on conflict(id) do update set name=excluded.name,city=excluded.city,locality=excluded.locality,region=excluded.region,geography_id=excluded.geography_id,locality_geography_id=excluded.locality_geography_id,address_line=excluded.address_line,postal_code=excluded.postal_code,official_url=excluded.official_url,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at,metadata=excluded.metadata,status='active',updated_at=now();

create or replace view public.city_institution_directory_fr_v1 with (security_invoker=true) as
select g.id city_id,c.id campus_id,i.id institution_id,i.canonical_name institution_name,i.slug institution_slug,
 ii.identifier_value official_identity,ii.source_url identity_source_url,i.website_url,c.name campus_name,c.city campus_city,c.locality,c.region,c.address_line,c.postal_code,c.source_url location_source_url,c.metadata->>'location_quality' location_quality,c.metadata->>'record_scope' record_scope,c.metadata->>'linkage_basis' linkage_basis
from core.geographies g
join catalog.campuses c on c.geography_id=g.id and c.country_code='FR' and c.status='active' and c.metadata->>'normalization_batch'='fr_city_linkage_v1'
join catalog.institutions i on i.id=c.institution_id and i.country_code='FR' and i.status='active'
join catalog.institution_identifiers ii on ii.institution_id=i.id and ii.identifier_system='FR_UAI'
where g.country_code='FR' and g.status='active' and g.metadata->>'publication_tier'='A' and c.metadata->>'location_quality'='verified_official' and c.metadata->>'record_scope'='verified_teaching_campus';
revoke all on public.city_institution_directory_fr_v1 from public,anon,authenticated;
grant select on public.city_institution_directory_fr_v1 to service_role;

create or replace view public.city_programme_directory_fr_v1 with (security_invoker=true) as
select d.city_id,p.id programme_id,p.institution_id,count(distinct po.id)::integer offering_count
from public.city_institution_directory_fr_v1 d
join catalog.campuses c on c.id=d.campus_id
join catalog.programme_offerings po on po.campus_id=c.id and po.verification_status='verified'
join catalog.programmes p on p.id=po.programme_id and p.institution_id=d.institution_id and p.status='active'
where c.metadata->>'programme_assignment_verified'='true'
group by d.city_id,p.id,p.institution_id;
revoke all on public.city_programme_directory_fr_v1 from public,anon,authenticated;
grant select on public.city_programme_directory_fr_v1 to service_role;

create or replace view public.city_directory_fr_v1 with (security_invoker=true) as
select g.id city_id,g.country_code,g.slug,g.name,g.region_code region,g.scope_kind,
 g.metadata->>'study_destination_scope' study_destination_scope,
 g.metadata->>'population_geography_contract' population_geography_contract,
 g.metadata->>'population_geography_label' population_geography_label,
 count(distinct d.campus_id)::integer linked_campus_count,count(distinct d.institution_id)::integer linked_institution_count,count(distinct p.programme_id)::integer linked_program_count,
 'initial_verified_university_set'::text institution_coverage_status,
 case when count(distinct p.programme_id)>0 then 'verified' else 'verification_pending' end::text programme_coverage_status
from core.geographies g
left join public.city_institution_directory_fr_v1 d on d.city_id=g.id
left join public.city_programme_directory_fr_v1 p on p.city_id=g.id
where g.country_code='FR' and g.geography_type='city' and g.status='active' and g.canonical_geography_id is null and g.metadata->>'publication_tier'='A'
group by g.id,g.country_code,g.slug,g.name,g.region_code,g.scope_kind,g.metadata;
revoke all on public.city_directory_fr_v1 from public,anon,authenticated;
grant select on public.city_directory_fr_v1 to service_role;

do $$ begin
 if (select count(*) from public.city_directory_fr_v1)<>7 then raise exception 'FR city directory expected 7'; end if;
 if (select count(*) from public.city_institution_directory_fr_v1)<>10 then raise exception 'FR institution directory expected 10 teaching locations'; end if;
 if exists(select 1 from public.city_directory_fr_v1 where linked_campus_count=0 or linked_institution_count=0) then raise exception 'FR Tier A destination missing linkage'; end if;
 if exists(select 1 from public.city_programme_directory_fr_v1) then raise exception 'FR programme directory must remain empty until explicit teaching-location assignment evidence exists'; end if;
end $$;