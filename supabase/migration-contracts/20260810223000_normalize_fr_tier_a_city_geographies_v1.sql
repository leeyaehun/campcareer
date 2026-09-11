-- France Cities Phase 2: public study destinations are distinct from registered teaching localities.
-- Keep the pre-existing Talence, Saint-Martin-d'Hères, Saint-Aubin and Marseille rows as locality evidence.

update core.geographies
set code='75056', region_code='11', scope_kind='city', status='active',
    metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object(
      'fr_city_normalization_v1',true,'publication_tier','A','public_slug','paris',
      'region_name','Île-de-France','study_destination_scope','paris_commune',
      'population_geography_contract','insee_commune','population_geography_label','Paris commune',
      'official_geography_code','75056','official_geography_code_system','INSEE COG commune',
      'scope_standard','INSEE geography at 2026-01-01',
      'scope_source_url','https://www.insee.fr/fr/statistiques/1405599?geo=COM-75056',
      'campus_membership_contract','phase_3_explicit_location_evidence_required',
      'public_destination_not_commune',false), updated_at=now()
where country_code='FR' and geography_type='city' and slug='paris' and canonical_geography_id is null;

update core.geographies
set code=case slug when 'strasbourg' then '246700488' else '200030195' end,
    region_code=case slug when 'strasbourg' then '44' else '93' end,
    scope_kind='city', status='active',
    metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object(
      'fr_city_normalization_v1',true,'publication_tier','A','public_slug',slug,
      'region_name',case slug when 'strasbourg' then 'Grand Est' else 'Provence-Alpes-Côte d''Azur' end,
      'study_destination_scope',case slug when 'strasbourg' then 'eurometropole_de_strasbourg' else 'metropole_nice_cote_dazur' end,
      'population_geography_contract','insee_epci',
      'population_geography_label',case slug when 'strasbourg' then 'Eurométropole de Strasbourg' else 'Métropole Nice Côte d''Azur' end,
      'official_geography_code',case slug when 'strasbourg' then '246700488' else '200030195' end,
      'official_geography_code_system','INSEE EPCI','scope_standard','INSEE geography at 2026-01-01',
      'scope_source_url',case slug when 'strasbourg' then 'https://www.insee.fr/fr/statistiques/1405599?geo=EPCI-246700488' else 'https://www.insee.fr/fr/statistiques/1405599?geo=EPCI-200030195' end,
      'campus_membership_contract','phase_3_explicit_location_evidence_required','public_destination_not_commune',true), updated_at=now()
where country_code='FR' and geography_type='city' and slug in ('strasbourg','nice') and canonical_geography_id is null;

with x(id_seed,name,slug,code,region_code,source_url) as (values
 ('fr:locality:strasbourg-commune','Strasbourg commune','strasbourg-commune','67482','44','https://www.insee.fr/fr/statistiques/1405599?geo=COM-67482'),
 ('fr:locality:nice-commune','Nice commune','nice-commune','06088','93','https://www.insee.fr/fr/statistiques/1405599?geo=COM-06088'))
insert into core.geographies(id,country_code,geography_type,code,name,region_code,metadata,slug,scope_kind,status)
select md5(id_seed)::uuid,'FR','locality',code,name,region_code,
 jsonb_build_object('fr_city_normalization_v1',true,'record_scope','official_commune_locality','official_geography_code',code,'official_geography_code_system','INSEE COG commune','scope_source_url',source_url,'publication_tier','LOCALITY_ONLY'),
 slug,'locality','active' from x
on conflict(id) do update set code=excluded.code,name=excluded.name,region_code=excluded.region_code,metadata=excluded.metadata,slug=excluded.slug,scope_kind='locality',status='active',updated_at=now();

update catalog.campuses c set locality_geography_id=l.id,updated_at=now()
from core.geographies l
where c.country_code='FR' and c.status<>'inactive' and c.metadata->>'normalization_batch'='fr_idex_locations_v1'
 and ((c.city='Strasbourg' and l.country_code='FR' and l.slug='strasbourg-commune') or (c.city='Nice' and l.country_code='FR' and l.slug='nice-commune'));

with x(id_seed,name,slug,code,region_code,region_name,scope_label,scope_key,source_url) as (values
 ('fr:city:paris-saclay','Paris-Saclay','paris-saclay','200056232','11','Île-de-France','Communauté Paris-Saclay','communaute_paris_saclay','https://www.insee.fr/fr/statistiques/1405599?geo=EPCI-200056232'),
 ('fr:city:bordeaux','Bordeaux','bordeaux','243300316','75','Nouvelle-Aquitaine','Bordeaux Métropole','bordeaux_metropole','https://www.insee.fr/fr/statistiques/1405599?geo=EPCI-243300316'),
 ('fr:city:grenoble','Grenoble','grenoble','200040715','84','Auvergne-Rhône-Alpes','Grenoble-Alpes-Métropole','grenoble_alpes_metropole','https://www.insee.fr/fr/statistiques/1405599?geo=EPCI-200040715'),
 ('fr:city:aix-marseille','Aix-Marseille','aix-marseille','200054807','93','Provence-Alpes-Côte d''Azur','Métropole d''Aix-Marseille-Provence','aix_marseille_provence_metropole','https://www.insee.fr/fr/statistiques/1405599?geo=EPCI-200054807'))
insert into core.geographies(id,country_code,geography_type,code,name,region_code,metadata,slug,scope_kind,status)
select md5(id_seed)::uuid,'FR','city',code,name,region_code,
 jsonb_build_object('fr_city_normalization_v1',true,'publication_tier','A','public_slug',slug,'region_name',region_name,'study_destination_scope',scope_key,'population_geography_contract','insee_epci','population_geography_label',scope_label,'official_geography_code',code,'official_geography_code_system','INSEE EPCI','scope_standard','INSEE geography at 2026-01-01','scope_source_url',source_url,'campus_membership_contract','phase_3_explicit_location_evidence_required','public_destination_not_commune',true),
 slug,'city','active' from x
on conflict(id) do update set code=excluded.code,name=excluded.name,region_code=excluded.region_code,metadata=excluded.metadata,slug=excluded.slug,scope_kind='city',status='active',updated_at=now();

insert into core.geography_aliases(geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select g.id,'FR',g.name,lower(regexp_replace(trim(g.name),'\s+',' ','g')),g.region_code,'canonical_name','core.geographies',g.metadata->>'scope_source_url'
from core.geographies g where g.country_code='FR' and g.status='active' and g.metadata->>'publication_tier'='A'
 and not exists(select 1 from core.geography_aliases ga where ga.geography_id=g.id and ga.alias_type='canonical_name' and ga.alias_normalized=lower(regexp_replace(trim(g.name),'\s+',' ','g')));
insert into core.geography_aliases(geography_id,country_code,alias,alias_normalized,region_code,alias_type,source_system,source_url)
select g.id,'FR',g.slug,lower(g.slug),g.region_code,'slug','core.geographies',g.metadata->>'scope_source_url'
from core.geographies g where g.country_code='FR' and g.status='active' and g.metadata->>'publication_tier'='A'
 and not exists(select 1 from core.geography_aliases ga where ga.geography_id=g.id and ga.alias_type='slug' and ga.alias_normalized=lower(g.slug));

do $$ begin
 if (select count(*) from core.geographies where country_code='FR' and status='active' and metadata->>'publication_tier'='A')<>7 then raise exception 'FR Phase 2 expected exactly 7 Tier A destinations'; end if;
 if exists(select 1 from core.geographies where country_code='FR' and metadata->>'publication_tier'='A' and (code is null or region_code is null or metadata->>'population_geography_contract' is null)) then raise exception 'FR Phase 2 geography contract incomplete'; end if;
end $$;