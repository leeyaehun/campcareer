-- Japan Cities Phase 4: five guarded decision-support metrics for exactly seven Tier A destinations.
with t as (
  select id,slug,name,code from core.geographies where country_code='JP' and metadata->>'publication_tier'='A' and canonical_geography_id is null
), v(slug,amount,official_name) as (values
 ('tokyo',9953160::numeric,'東京都区部'),('kyoto',1431713,'京都市'),('nagoya',2345892,'名古屋市'),('sendai',1096951,'仙台市'),('suita',394503,'吹田市'),('tsukuba',268991,'つくば市'),('fukuoka',1663892,'福岡市')
)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('jp_city_phase4:'||t.id||':city_population')::uuid,t.id,'city',t.id::text,'city_population',
 jsonb_build_object('amount',v.amount,'unit','people','geography',v.official_name,'geography_kind','2025_population_census_preliminary_same_area_code','admin_code',t.code,'estimate_kind','official_population_census_preliminary','estimate_date','2025-10-01','preliminary',true),
 'Statistics Bureau of Japan — 2025 Population Census preliminary counts','https://www.stat.go.jp/data/kokusei/2025/kekka.html','2025-10-01',now(),'high','observed','verified',now(),now()
from t join v using(slug)
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id from core.geographies where country_code='JP' and metadata->>'publication_tier'='A' and canonical_geography_id is null)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('jp_city_phase4:'||t.id||':student_living_cost_monthly_range')::uuid,t.id,'city',t.id::text,'student_living_cost_monthly_range',
 jsonb_build_object('low',105000,'high',105000,'currency','JPY','period','month','reference_kind','national_average_single_point','city_specific',false,'full_budget',true,'excludes_study_research_cost',true,'indicative',true,'regional_price_variation',true,'ranking_safe',false,'housing_national_average',41000,'housing_tokyo_reference',57000,'note','JASSO reports a national average monthly living cost of JPY 105,000 excluding study and research costs. It explicitly notes higher costs in Tokyo and other large cities. This is a planning baseline only and cannot support a cheapest-city ranking.'),
 'Study in Japan / JASSO — 2023 Lifestyle Survey of Privately-Financed International Students','https://www.studyinjapan.go.jp/en/life/cost-of-living/','2023-12-31',now(),'medium','observed','verified',now(),now()
from t
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id,slug from core.geographies where country_code='JP' and metadata->>'publication_tier'='A' and canonical_geography_id is null),
v(slug,amount,kind,mode,period,student_specific,data_date,note,source,url) as (values
 ('tokyo',180::numeric,'adult_regular_cash_base_fare_1_to_6km','metro','single_ride',false,'2026-08-12'::date,'Tokyo Metro regular cash fare for 1–6 km; IC reference is JPY 178. Stored source-native, not converted into a monthly student cost.','Tokyo Metro — Regular Tickets','https://www.tokyometro.jp/en/ticket/regular/index.html'),
 ('kyoto',230,'adult_flat_zone_regular_fare','city_bus','single_ride',false,'2026-08-12','Kyoto City Bus adult standard fare in the flat-fare zone. Routes outside the flat zone vary.','Kyoto Municipal Transportation Bureau — City Bus Fare','https://www2.city.kyoto.lg.jp/kotsu/webguide/en/fare/fare_bus.html'),
 ('nagoya',210,'adult_regular_fare','city_bus','single_ride',false,'2026-08-12','Nagoya City Bus adult regular ticket fare. Stored as a single-ride reference.','Transportation Bureau, City of Nagoya — Tickets','https://kotsu.city.nagoya.jp/en/sp/TICKET/TRP0001071.htm'),
 ('sendai',160,'adult_initial_fare','city_bus','single_ride',false,'2026-08-12','Current Sendai City Bus initial fare. The city has announced an increase to JPY 190 effective 2026-10-01; this row stores the fare effective on the verification date.','Sendai City Transportation Bureau — Fares','https://www.kotsu.city.sendai.jp/fare/unchin/'),
 ('suita',250,'adult_flat_fare','community_bus','single_ride',false,'2026-03-25','Suita community bus (SuiSui Bus) adult fare. Stored source-native.','Suita City — Community Bus riding guide','https://www.city.suita.osaka.jp/sangyo/1018186/1018489/1018492/1009853.html'),
 ('tsukuba',500,'adult_weekend_holiday_day_pass','community_bus','weekend_or_holiday_day',false,'2026-04-01','Tsuku-bus one-day pass, available on Saturdays, Sundays and holidays. It is intentionally not normalized to a single ride or monthly value.','Tsukuba City — Tsuku-bus user guide','https://www.city.tsukuba.lg.jp/kurashi/kotsu/bus/1001471.html'),
 ('fukuoka',210,'adult_regular_fare_zone_1_up_to_3km','subway','single_ride',false,'2026-08-12','Fukuoka City Subway adult Zone 1 fare for travel up to 3 km. Stored source-native.','Fukuoka City Subway — Regular Tickets','https://subway.city.fukuoka.lg.jp/fare/futuken/')
)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('jp_city_phase4:'||t.id||':student_transport_reference')::uuid,t.id,'city',t.id::text,'student_transport_reference',
 jsonb_build_object('amount',v.amount,'currency','JPY','period',v.period,'reference_kind',v.kind,'mode',v.mode,'student_specific',v.student_specific,'source_native_period',true,'ranking_safe',false,'future_change',case when t.slug='sendai' then jsonb_build_object('amount',190,'effective_date','2026-10-01') else null end,'note',v.note),
 v.source,v.url,v.data_date,now(),'high','observed','verified',now(),now()
from t join v using(slug)
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id from core.geographies where country_code='JP' and metadata->>'publication_tier'='A' and canonical_geography_id is null)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('jp_city_phase4:'||t.id||':student_work_hours_week')::uuid,t.id,'city',t.id::text,'student_work_hours_week',
 jsonb_build_object('hours_normal_period',28,'period','week','national_rule',true,'city_specific',false,'permission_required',true,'long_school_holiday_hours_per_day',8,'ranking_safe',false,'note','International students need permission for activities outside their status of residence. The blanket-permission reference is up to 28 hours per week and up to 8 hours per day during long school holidays; this is a national immigration rule, not an automatic right or city differentiator.'),
 'Immigration Services Agency of Japan — Permission for activities outside Student status','https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00003.html','2026-08-12',now(),'high','observed','verified',now(),now()
from t
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

with t as (select id,slug from core.geographies where country_code='JP' and metadata->>'publication_tier'='A' and canonical_geography_id is null),
v(slug,basis,sectors,source,url) as (values
 ('tokyo','Tokyo Global Innovation Strategy 2.0 / metropolitan startup and scaleup ecosystem','["Startups and scaleups","Sustainable technology","Digital and AI","Life sciences","Finance and global business"]'::jsonb,'Tokyo Metropolitan Government — Global Innovation Strategy 2.0','https://www.startupandglobalfinancialcity.metro.tokyo.lg.jp/startup/strategy'),
 ('kyoto','Kyoto City startup, university-industry collaboration and deep-tech programmes','["Life sciences","AI and robotics","Deep tech","Advanced manufacturing","Traditional and creative industries"]'::jsonb,'Kyoto City — Startup and University-Industry Collaboration Office','https://www.city.kyoto.lg.jp/sankan/soshiki/7-9-0-0-0.html'),
 ('nagoya','Nagoya City 2026 industrial policy support framework','["Manufacturing and technology development","Design and new products","Startups and new business","Environmental technologies","Traditional industries"]'::jsonb,'Nagoya City — FY2026 Industrial Policy Guide','https://www.city.nagoya.jp/jigyou/sangyou/1026356/1026694.html'),
 ('sendai','Sendai Startup Visa eligible-business categories used as local economic-development context','["Semiconductors, software, content and robotics","Health, medicine, welfare and education","Environment, energy and disaster risk reduction","Trade and tourism"]'::jsonb,'Sendai City — Startup Visa eligible businesses','https://www.city.sendai.jp/startup-sogyo/jigyosha/kezai/jigyosho/joho/startupvisa-kigyo-english.html'),
 ('suita','Suita KENTO health-medical innovation and commercial-promotion context','["Healthcare","Life sciences","Medical research and development","Open innovation","Local commerce and SMEs"]'::jsonb,'Suita City — KENTO health and medical city development','https://www.city.suita.osaka.jp/kenko/1018092/'),
 ('tsukuba','Tsukuba research-city startup ecosystem','["Robotics","Healthcare","Space","Deep tech","Research-driven startups"]'::jsonb,'Tsukuba City — Startup events and ecosystem','https://www.city.tsukuba.lg.jp/jigyosha/shigoto/1005138/28592.html'),
 ('fukuoka','Fukuoka City enterprise-location priority R&D fields','["Software and ICT","Digital content and design","Semiconductors","Health, medical and welfare","Environment and energy"]'::jsonb,'Fukuoka City — R&D office enterprise-location fields','https://www.city.fukuoka.lg.jp/keizai/k-yuchi/business/g01_01.html')
)
insert into public.report_metric_evidence_city(id,geography_id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status,created_at,updated_at)
select md5('jp_city_phase4:'||t.id||':employment_focus_sectors')::uuid,t.id,'city',t.id::text,'employment_focus_sectors',
 jsonb_build_object('basis',v.basis,'sectors',v.sectors,'indicative',true,'ranking_safe',false,'not_shortage_ranking',true,'not_job_guarantee',true,'note','Official local economic-development context only. Sector lists are not directly comparable rankings and do not establish vacancies, shortage status, salary levels or individual employment outcomes.'),
 v.source,v.url,'2026-08-12',now(),'medium','observed','verified',now(),now()
from t join v using(slug)
on conflict(geography_id,metric_key) do update set value=excluded.value,source_name=excluded.source_name,source_url=excluded.source_url,data_as_of=excluded.data_as_of,last_verified_at=now(),confidence=excluded.confidence,evidence_kind=excluded.evidence_kind,review_status='verified',updated_at=now();

create or replace view public.city_metric_directory_jp_v1 with (security_invoker=true) as
select g.id city_id,g.slug city_slug,g.name city_name,r.metric_key,r.value,r.source_name,r.source_url,r.data_as_of,r.confidence,r.evidence_kind
from core.geographies g join public.report_metric_evidence_city r on r.geography_id=g.id and r.scope_type='city' and r.review_status='verified'
where g.country_code='JP' and g.metadata->>'publication_tier'='A' and r.metric_key in ('city_population','student_living_cost_monthly_range','student_transport_reference','student_work_hours_week','employment_focus_sectors');

revoke all on public.city_metric_directory_jp_v1 from public,anon,authenticated;
grant select on public.city_metric_directory_jp_v1 to service_role;

do $$
declare metric_n integer; city_n integer; bad_city integer; bad_living integer; bad_work integer; bad_transport integer; bad_sector integer;
begin
 select count(*) into metric_n from public.city_metric_directory_jp_v1; if metric_n<>35 then raise exception 'JP Phase 4 expected 35 verified metric rows, found %',metric_n; end if;
 select count(distinct city_id) into city_n from public.city_metric_directory_jp_v1; if city_n<>7 then raise exception 'JP Phase 4 expected metrics for seven cities, found %',city_n; end if;
 select count(*) into bad_city from (select city_id,count(*) n from public.city_metric_directory_jp_v1 group by city_id having count(*)<>5) x; if bad_city<>0 then raise exception 'Every JP Tier A city must have exactly five metrics'; end if;
 select count(*) into bad_living from public.city_metric_directory_jp_v1 where metric_key='student_living_cost_monthly_range' and (coalesce((value->>'ranking_safe')::boolean,true) or coalesce((value->>'city_specific')::boolean,true)); if bad_living<>0 then raise exception 'JP living-cost national baseline must remain non-ranking and non-city-specific'; end if;
 select count(*) into bad_work from public.city_metric_directory_jp_v1 where metric_key='student_work_hours_week' and (coalesce((value->>'national_rule')::boolean,false) is false or coalesce((value->>'city_specific')::boolean,true) is true or coalesce((value->>'permission_required')::boolean,false) is false); if bad_work<>0 then raise exception 'JP student-work context must remain national and permission-gated'; end if;
 select count(*) into bad_transport from public.city_metric_directory_jp_v1 where metric_key='student_transport_reference' and coalesce((value->>'source_native_period')::boolean,false) is false; if bad_transport<>0 then raise exception 'JP transport references must remain source-native'; end if;
 select count(*) into bad_sector from public.city_metric_directory_jp_v1 where metric_key='employment_focus_sectors' and (coalesce((value->>'not_shortage_ranking')::boolean,false) is false or coalesce((value->>'not_job_guarantee')::boolean,false) is false); if bad_sector<>0 then raise exception 'JP employment sectors must not become shortage or job-guarantee claims'; end if;
end $$;;
