-- Switzerland Cities Phase 4: exactly five verified decision-context metrics for each Tier A municipality.

with t as (select id,slug,name,code from core.geographies where country_code='CH' and metadata->>'publication_tier'='A'),
v(slug,amount) as (values
  ('zurich',427721::numeric),('lausanne',141418),('basel',173552),('lugano',62464),('fribourg',37653),('geneva',203840)
)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('ch_city_phase4:'||t.id||':city_population')::uuid,t.id,'city',t.id::text,'city_population',
 jsonb_build_object('amount',v.amount,'geography',t.name||' municipality','geography_kind','fso_bfs_municipality','municipality_code',t.code,'estimate_kind','permanent_resident_population','estimate_date','2022-12-31'),
 'Swiss Federal Statistical Office — Statistical cities 2020 / STATPOP 2022','https://www.swissstats.bfs.admin.ch/data/webviewer/appId/ch.admin.bfs.swissstat/article/issue242122972000-04/package','2022-12-31',now(),'high','observed','verified',now(),now()
from t join v using(slug)
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id,slug from core.geographies where country_code='CH' and metadata->>'publication_tier'='A'),
v(slug,low,high,kind,student_specific,note,source,url) as (values
  ('zurich',2430::numeric,2430::numeric,'eth_single_person_monthly_guide',false,'ETH Welcome Center single-person guide; indicative local planning reference, not a measured student-city index.','ETH Zurich — Cost of living','https://ethz.ch/en/the-eth-zurich/working-teaching-and-research/welcome-center/services-and-downloads/cost-of-living.html'),
  ('lausanne',2107,2107,'epfl_foreign_student_budget',true,'EPFL approximate foreign-student monthly budget excluding tuition. Used only as Lausanne-area student planning context; it does not alter the municipality campus-linkage gate.','EPFL — Financing your studies','https://www.epfl.ch/education/studies/en/financing-study/'),
  ('basel',2000,2500,'unibas_recommended_monthly_minimum',false,'University of Basel Faculty of Law guest-research guidance recommends roughly CHF 2,000–2,500 per month excluding insurance; indicative planning context.','University of Basel — Guest research finances','https://ius.unibas.ch/en/research/research-with-us/guest-research/'),
  ('lugano',1300,1900,'usi_student_monthly_range',true,'USI student guidance for living in Lugano or Mendrisio; source-native range, not a city ranking.','USI — Cost of living in Switzerland','https://www.arc.usi.ch/en/study-architecture/organising-your-studies'),
  ('fribourg',1600,1900,'unifr_student_monthly_range',true,'University of Fribourg incoming-student planning range; insurance treatment varies by page and student situation.','University of Fribourg — Budget','https://www.unifr.ch/studies/en/mobility/incoming/practical-information/preparer-sejour/budget.html'),
  ('geneva',1800,1900,'unige_exchange_student_monthly_range',true,'University of Geneva academic-exchange monthly budget estimate.','University of Geneva — Academic Exchange budget','https://www.unige.ch/exchange/en/incoming/why-geneva/students/international-non-erasmus-students/4-preparing-your-exchange/budget')
)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('ch_city_phase4:'||t.id||':student_living_cost_monthly_range')::uuid,t.id,'city',t.id::text,'student_living_cost_monthly_range',
 jsonb_build_object('low',v.low,'high',v.high,'currency','CHF','period','month','reference_kind',v.kind,'city_specific',true,'student_specific',v.student_specific,'indicative',true,'harmonised_index',false,'note',v.note),
 v.source,v.url,'2026-08-11',now(),'medium','observed','verified',now(),now()
from t join v using(slug)
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id,slug from core.geographies where country_code='CH' and metadata->>'publication_tier'='A'),
v(slug,amount,low,high,period,kind,student_specific,note,source,url) as (values
  ('zurich',64::numeric,null::numeric,null::numeric,'month','zvv_young_adult_1_2_zone_networkpass',false,'ZVV personal NetworkPass for ages 6–24.99, 1–2 zones; Zurich city zone 110 counts as two zones. Age eligibility applies.','ZVV — NetworkPass','https://www.zvv.ch/en/travelcards-and-tickets/travelcards/network-pass.html'),
  ('lausanne',60,null,null,'month','epfl_student_budget_transport',true,'EPFL foreign-student budget transport line, monthly subscription. Source-native planning reference.','EPFL — Financing your studies','https://www.epfl.ch/education/studies/en/financing-study/'),
  ('basel',57,null,null,'month','tnw_young_adult_u_abo',false,'TNW monthly U-Abo for people up to age 24.99 domiciled in the TNW area. Eligibility/residence conditions apply.','TNW — U-Abo Subscription','https://www.tnw.ch/en/tickets-preise/abonnemente/das-u-abo'),
  ('lugano',null,50,100,'month','usi_student_transport_budget_range',true,'USI student budget gives CHF 50–100 per month for public transportation. The range is preserved instead of inventing a midpoint.','USI — Cost of living in Switzerland','https://www.arc.usi.ch/en/study-architecture/organising-your-studies'),
  ('fribourg',60,null,null,'month','unifr_tpf_greater_fribourg_budget',true,'University of Fribourg incoming-student budget reference for a TPF season pass in Greater Fribourg.','University of Fribourg — Budget','https://www.unifr.ch/studies/en/mobility/incoming/practical-information/preparer-sejour/budget.html'),
  ('geneva',45,null,70,'month','unige_exchange_transport_age_reference',true,'UNIGE exchange budget: CHF 45 monthly transport reference, CHF 70 from age 25. Age rules apply.','University of Geneva — Academic Exchange budget','https://www.unige.ch/exchange/en/incoming/why-geneva/students/international-non-erasmus-students/4-preparing-your-exchange/budget')
)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('ch_city_phase4:'||t.id||':student_transport_reference')::uuid,t.id,'city',t.id::text,'student_transport_reference',
 jsonb_strip_nulls(jsonb_build_object('amount',v.amount,'low',v.low,'high',v.high,'currency','CHF','period',v.period,'reference_kind',v.kind,'student_specific',v.student_specific,'source_native_period',true,'note',v.note)),
 v.source,v.url,'2026-08-11',now(),'high','observed','verified',now(),now()
from t join v using(slug)
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id from core.geographies where country_code='CH' and metadata->>'publication_tier'='A')
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('ch_city_phase4:'||t.id||':student_work_hours_week')::uuid,t.id,'city',t.id::text,'student_work_hours_week',
 jsonb_build_object('hours_normal_period',15,'period','week','national_rule',true,'applies_to','third_country_students_subject_to_authorisation','earliest_start_after_study_months',6,'full_time_holidays',true,'city_specific',false,'note','SEM states that supplementary employment for third-country students may be authorised no sooner than six months after studies begin and is limited to 15 hours per week outside holidays. University confirmation, employer application and permit conditions apply. EU/EFTA cases can differ.'),
 'State Secretariat for Migration — Working while studying','https://www.sem.admin.ch/sem/en/home/themen/arbeit/faq.0021.html','2026-08-11',now(),'high','observed','verified',now(),now()
from t
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id,slug from core.geographies where country_code='CH' and metadata->>'publication_tier'='A'),
v(slug,basis,sectors,scope,source,url) as (values
  ('zurich','City of Zürich current cluster/economic-location context','["Finance","ICT","Life sciences","Cleantech","Creative economy"]'::jsonb,'city','City of Zürich — Economy','https://www.stadt-zuerich.ch/economy'),
  ('lausanne','Canton of Vaud key-sector context for the Lausanne study destination','["Life sciences and health","Digital and ICT","Precision industries","Energy and environment","Nutrition and food technology"]'::jsonb,'canton','Canton of Vaud — Key sectors','https://www.vaud-economie.ch/secteurs-cles'),
  ('basel','Basel Area growth-sector context','["Life sciences","ICT","Knowledge-intensive services"]'::jsonb,'regional','Basel Area Business & Innovation — Life sciences growth','https://baselarea.swiss/insights/life-sciences-are-increasingly-expanding-throughout-the-entire-basel-area-economic-region/'),
  ('lugano','City of Lugano living/working and digital-innovation context','["Finance","Pharmaceuticals and life sciences","Commodity trading","Fashion and lifestyle tech","AI and digital innovation"]'::jsonb,'city','City of Lugano — Living and working in Lugano','https://www.lugano.ch/en/temi-servizi/lavoro-e-impresa/imprese/vivere-lavorare-lugano.html'),
  ('fribourg','Canton of Fribourg promotion and 2026 bioeconomy context','["Bioeconomy","Agri-food","Sustainable production","Innovation and digitalisation"]'::jsonb,'canton','State of Fribourg — Economic promotion','https://www.fr.ch/deef/promfr'),
  ('geneva','Canton of Geneva official key-sector context','["Life sciences","Banking and finance","Trading and shipping","Digital economy","Watchmaking and luxury"]'::jsonb,'canton','Canton of Geneva — Key sectors','https://www.ge.ch/en/teaser/entreprendre-geneve/key-sectors')
)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('ch_city_phase4:'||t.id||':employment_focus_sectors')::uuid,t.id,'city',t.id::text,'employment_focus_sectors',
 jsonb_build_object('basis',v.basis,'sectors',v.sectors,'context_scope',v.scope,'city_specific',v.scope='city','indicative',true,'not_shortage_ranking',true,'note','Economic-development context only; not a shortage ranking, occupation-demand score or employment guarantee.'),
 v.source,v.url,'2026-08-11',now(),'medium','observed','verified',now(),now()
from t join v using(slug)
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

do $$
declare n integer; bad integer; excluded integer;
begin
  select count(*) into n from public.report_metric_evidence_city r join core.geographies g on g.id=r.geography_id
  where g.country_code='CH' and g.metadata->>'publication_tier'='A' and r.review_status='verified'
    and r.metric_key in ('city_population','student_living_cost_monthly_range','student_transport_reference','student_work_hours_week','employment_focus_sectors');
  if n<>30 then raise exception 'CH Tier A metrics expected 30, found %',n; end if;

  select count(*) into bad from (
    select g.id from core.geographies g left join public.report_metric_evidence_city r
      on r.geography_id=g.id and r.review_status='verified' and r.metric_key in ('city_population','student_living_cost_monthly_range','student_transport_reference','student_work_hours_week','employment_focus_sectors')
    where g.country_code='CH' and g.metadata->>'publication_tier'='A' group by g.id having count(r.metric_key)<>5
  ) q;
  if bad<>0 then raise exception 'Each CH Tier A city must have exactly five verified metrics'; end if;

  select count(*) into excluded from public.report_metric_evidence_city r join core.geographies g on g.id=r.geography_id
  where g.country_code='CH' and g.slug in ('neuchatel','bern','st-gallen','lucerne')
    and r.metric_key in ('city_population','student_living_cost_monthly_range','student_transport_reference','student_work_hours_week','employment_focus_sectors')
    and r.id=md5('ch_city_phase4:'||g.id||':'||r.metric_key)::uuid;
  if excluded<>0 then raise exception 'Deferred Switzerland city received Phase 4 metrics'; end if;
end $$;;
