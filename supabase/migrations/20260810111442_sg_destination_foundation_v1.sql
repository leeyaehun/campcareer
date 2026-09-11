-- Singapore country-level study-destination foundation v1.
-- Singapore is a city-state: destination evidence is country-scoped and is not
-- duplicated into a synthetic city shortlist.

delete from public.report_metric_evidence_country
where scope_type = 'country'
  and upper(scope_id) = 'SG'
  and metric_key in ('country_population','student_transport_reference','employment_focus_sectors');

insert into public.report_metric_evidence_country (id,scope_type,scope_id,metric_key,value,source_name,source_url,data_as_of,last_verified_at,confidence,evidence_kind,review_status)
values
(md5('sg:country-metric:country_population')::uuid,'country','SG','country_population',jsonb_build_object('amount',6111175,'unit','people','geography','Singapore','geography_kind','country_city_state','reference_period','2025 end-June','resident_population_thousand',4204.5,'population_density_per_sq_km',8300,'definition','total population includes Singapore residents and non-residents'),'Singapore Department of Statistics — Population and Population Structure','https://www.singstat.gov.sg/find-data/search-by-theme/population/population-and-population-structure/latest-data',date '2025-06-30',now(),'high','observed','verified'),
(md5('sg:country-metric:student_transport_reference')::uuid,'country','SG','student_transport_reference',jsonb_build_object('currency','SGD','reference_kind','source_native_distance_fares_and_monthly_passes','adult_basic_card_fare_low',1.28,'adult_basic_card_fare_high',2.57,'adult_monthly_travel_pass',122.00,'university_student_hybrid_monthly_pass',81.00,'student_concession_eligibility_required',true,'distance_based',true,'source_native_period',true,'note','University-student concession products require eligibility; CampCareer does not assume every international student qualifies.'),'Public Transport Council — Public transport fares and passes','https://www.ptc.gov.sg/fares/public-transport-fares-and-passes/',date '2026-01-28',now(),'high','observed','verified'),
(md5('sg:country-metric:employment_focus_sectors')::uuid,'country','SG','employment_focus_sectors',jsonb_build_object('sectors',jsonb_build_array('Aerospace','Biotechnology & Pharmaceuticals','Energy & Chemicals','Logistics & Supply Chain Management','Medical Technology','Professional Services','Semiconductor','Technology Hardware and Equipment','Digital Technology'),'basis','Singapore EDB industry and headquarters opportunity context','national_context',true,'shortage_signal',false,'note','Industry presence is economic context and does not imply an occupation shortage, work-pass outcome or job guarantee.'),'Singapore Economic Development Board — Economic powerhouse / industry opportunities','https://www.edb.gov.sg/en/why-singapore/an-economic-powerhouse.html',date '2026-07-06',now(),'high','observed','verified');

create or replace view public.study_destination_sg_v1 with (security_invoker = true) as
select c.code as country_code,c.name as destination_name,c.default_currency,'country_city_state'::text as scope_kind,'COUNTRY_LEVEL_CITY_STATE_DESTINATION'::text as study_destination_scope,1::integer as destination_count,
(select count(*)::integer from catalog.institutions i where i.country_code='SG' and i.status<>'inactive') as linked_institution_count,
(select count(*)::integer from catalog.campuses cp join catalog.institutions i on i.id=cp.institution_id where i.country_code='SG' and i.status<>'inactive' and cp.status<>'inactive') as linked_campus_count,
(select count(*)::integer from catalog.programmes p join catalog.institutions i on i.id=p.institution_id where i.country_code='SG' and i.status<>'inactive' and p.status='active') as linked_program_count,
case when exists (select 1 from catalog.programme_offerings po join catalog.programmes p on p.id=po.programme_id join catalog.institutions i on i.id=p.institution_id where i.country_code='SG' and po.campus_id is not null and po.verification_status='verified') then 'verified_offerings_available' else 'verification_pending' end::text as programme_coverage_status
from core.countries c where c.code='SG' and c.active=true;
comment on view public.study_destination_sg_v1 is 'Service-role Singapore country-level city-state study destination anchor. Does not create a public city shortlist.';
revoke all on public.study_destination_sg_v1 from public, anon, authenticated;
grant select on public.study_destination_sg_v1 to service_role;

do $$ declare destination_count integer; metric_count integer; programme_count integer; begin
select count(*) into destination_count from public.study_destination_sg_v1; if destination_count<>1 then raise exception 'Expected exactly one Singapore country destination, found %', destination_count; end if;
select count(*) into metric_count from public.report_metric_evidence_country where scope_type='country' and upper(scope_id)='SG' and review_status='verified' and metric_key in ('country_population','student_transport_reference','employment_focus_sectors'); if metric_count<>3 then raise exception 'Expected 3 SG Phase 2 verified destination metrics, found %', metric_count; end if;
select linked_program_count into programme_count from public.study_destination_sg_v1; if programme_count<>0 then raise exception 'SG programme catalogue expected pending at Phase 2; found % canonical programmes', programme_count; end if;
end $$;;
