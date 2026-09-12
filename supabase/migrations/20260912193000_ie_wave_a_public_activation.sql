-- Ireland Wave A public activation.
-- Requires the non-activating Wave A foundation backfill to be present first.
begin;

do $$
declare
  v_backfilled integer;
  v_strict_ready integer;
begin
  select count(*)
  into v_backfilled
  from public.career_foundation_result_v1
  where country_code='IE'
    and canonical_occupation_id in (
      'software-developer',
      'cybersecurity-analyst',
      'data-engineer',
      'civil-engineer',
      'construction-manager',
      'accountant',
      'architect',
      'radiographer'
    );

  if v_backfilled <> 8 then
    raise exception 'Ireland Wave A activation requires 8 backfilled profiles, got %', v_backfilled;
  end if;

  select count(*)
  into v_strict_ready
  from public.career_foundation_result_v1 r
  where r.country_code='IE'
    and r.canonical_occupation_id in (
      'software-developer',
      'cybersecurity-analyst',
      'data-engineer',
      'civil-engineer',
      'construction-manager',
      'radiographer'
    )
    and r.score_ready=true
    and not exists (
      select 1
      from unnest(array[
        'shortage_signal',
        'vacancy_intensity',
        'industry_diversity',
        'employment_momentum',
        'projected_growth',
        'relative_salary',
        'entry_accessibility',
        'entry_burden'
      ]::text[]) required(component_key)
      left join public.career_score_components c
        on c.snapshot_key=r.snapshot_key
       and c.component_key=required.component_key
      where c.component_key is null
         or c.availability <> 'available'
         or c.score_value is null
         or c.evidence_status in ('no_evidence_found','insufficient_industry_coverage')
    );

  if v_strict_ready <> 6 then
    raise exception 'Ireland Wave A activation requires 6 strict public-score profiles, got %', v_strict_ready;
  end if;
end
$$;

update public.career_foundation_profiles
set decision_ready=true,
    decision_readiness_reason='Ireland Wave A evidence review passed on 2026-09-12. Public activation is limited to Careers with complete strict public-score evidence.',
    updated_at=now()
where country_code='IE'
  and canonical_occupation_id in (
    'software-developer',
    'cybersecurity-analyst',
    'data-engineer',
    'civil-engineer',
    'construction-manager',
    'radiographer'
  );

update public.career_foundation_profiles
set decision_ready=false,
    decision_readiness_reason=case canonical_occupation_id
      when 'accountant' then 'Ireland Wave A remains incomplete: industry-diversity evidence is below the usable coverage gate.'
      when 'architect' then 'Ireland Wave A remains incomplete: shortage and vacancy-intensity evidence are insufficient; Quantity Surveyor evidence is not borrowed.'
      else decision_readiness_reason
    end,
    updated_at=now()
where country_code='IE'
  and canonical_occupation_id in ('accountant','architect');

do $$
declare
  v_publish_ready integer;
  v_incomplete_published integer;
begin
  select count(*)
  into v_publish_ready
  from public.career_foundation_result_v1
  where country_code='IE'
    and canonical_occupation_id in (
      'software-developer',
      'cybersecurity-analyst',
      'data-engineer',
      'civil-engineer',
      'construction-manager',
      'radiographer'
    )
    and publish_ready=true;

  if v_publish_ready <> 6 then
    raise exception 'Ireland Wave A activation expected 6 publish-ready profiles, got %', v_publish_ready;
  end if;

  select count(*)
  into v_incomplete_published
  from public.career_foundation_result_v1
  where country_code='IE'
    and canonical_occupation_id in ('accountant','architect')
    and publish_ready=true;

  if v_incomplete_published <> 0 then
    raise exception 'Ireland Wave A activation unexpectedly published % incomplete profiles', v_incomplete_published;
  end if;
end
$$;

commit;
