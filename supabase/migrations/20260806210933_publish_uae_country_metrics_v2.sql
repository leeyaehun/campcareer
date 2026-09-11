delete from public.report_metric_evidence_country
where scope_type = 'country'
  and scope_id = 'AE'
  and metric_key in (
    'full_time_annual_earnings_range', 'average_annual_salary',
    'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
    'tuition_annual_low', 'tuition_annual_high',
    'student_work_hours_limit', 'visa_application_fee'
  );

insert into public.report_metric_evidence_country (
  id, scope_type, scope_id, metric_key, value, source_name, source_url,
  data_as_of, last_verified_at, confidence, evidence_kind, review_status,
  created_at, updated_at
)
select
  mo.id, mo.scope_type, mo.scope_id, mo.metric_key, mo.value,
  s.source_name, ss.source_url,
  coalesce(ss.data_as_of, mo.effective_from, current_date),
  coalesce(mo.reviewed_at, now()), mo.confidence, mo.evidence_kind,
  mo.review_status, mo.created_at, now()
from evidence.metric_observations mo
join evidence.source_snapshots ss on ss.id = mo.source_snapshot_id
join evidence.sources s on s.id = ss.source_id
where mo.scope_type = 'country'
  and mo.scope_id = 'AE'
  and mo.review_status = 'verified'
  and mo.metric_key in (
    'full_time_annual_earnings_range', 'average_annual_salary',
    'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
    'tuition_annual_low', 'tuition_annual_high',
    'student_work_hours_limit', 'visa_application_fee'
  );

do $$
begin
  if (
    select count(*) from public.report_metric_evidence_country
    where scope_type='country' and scope_id='AE' and review_status='verified'
      and metric_key in (
        'full_time_annual_earnings_range', 'average_annual_salary',
        'national_minimum_hourly_wage', 'student_living_cost_monthly_range',
        'tuition_annual_low', 'tuition_annual_high',
        'student_work_hours_limit', 'visa_application_fee'
      )
  ) <> 8 then
    raise exception 'Expected exactly 8 published verified UAE country metrics';
  end if;
end $$;;
