with verified_ids(id, list_type) as (
  values
    (18,'full_time'),
    (100,'flexible'),(221,'flexible'),(126,'flexible'),(147,'flexible'),
    (253,'flexible'),(303,'flexible'),(304,'flexible'),
    (68,'flexible'),(172,'flexible'),(229,'flexible'),(239,'flexible'),
    (159,'flexible'),(200,'flexible'),(90,'flexible'),(286,'flexible'),
    (287,'flexible'),(250,'flexible'),(275,'flexible'),(198,'flexible'),
    (257,'flexible'),(195,'flexible'),(255,'flexible'),(265,'flexible'),
    (282,'flexible'),(227,'flexible'),(296,'flexible'),(272,'flexible'),
    (300,'flexible'),(285,'flexible'),(268,'flexible'),(267,'flexible'),
    (27,'full_time'),(251,'flexible'),(211,'flexible'),(201,'flexible'),
    (270,'flexible'),(277,'flexible'),(263,'flexible'),(279,'flexible'),
    (235,'flexible'),(71,'flexible'),(168,'flexible'),(154,'flexible'),
    (104,'flexible'),(205,'flexible'),(213,'flexible'),(138,'flexible'),
    (234,'flexible'),(246,'flexible'),(84,'flexible'),(238,'flexible')
), pgwp_yes(id) as (
  values
    (18),(100),(221),(126),(147),(239),(198),(251),(277),(263),(279),(27)
)
update public.program_pgwp_ca_staging p
set international_students_eligible = true,
    international_program_admission_status = case
      when c.id = 27 then 'international_program_confirmed_current_but_september_2026_new_applications_closed_2027_opens_october_2026'
      else 'bcit_current_official_international_program_list_2026'
    end,
    ircc_program_eligible = case when y.id is not null then true else p.ircc_program_eligible end,
    pgwp_program_status = case when y.id is not null then 'bcit_current_official_program_list_pgwp_yes_2026' else p.pgwp_program_status end,
    source_url = case when v.list_type = 'flexible' then 'https://www.bcit.ca/international-applicants/flexible-credential-programs/' else 'https://www.bcit.ca/international-applicants/regular-credential-programs/' end,
    source_as_of = date '2026-08-08',
    verified_at = now(),
    rule_notes = concat_ws(' ', nullif(p.rule_notes,''),
      case
        when c.id = 27 then 'Official BCIT engineering/program page confirms Mechanical Engineering BEng is available to international students and PGWP-eligible, but the September 2026 intake is closed for new applications; September 2027 applications open October 1, 2026.'
        when y.id is not null then 'Current BCIT international program list explicitly marks this program international and PGWP eligible.'
        else 'Current BCIT international program list explicitly marks this program available to international students. PGWP is not inferred unless separately marked by BCIT.'
      end)
from public.program_catalog_ca_staging c
join verified_ids v on v.id = c.id
left join pgwp_yes y on y.id = c.id
where p.program_catalog_id = c.id
  and c.institution_name = 'British Columbia Institute of Technology';

with verified_ids(id) as (
  values
    (18),(100),(221),(126),(147),(253),(303),(304),(68),(172),(229),(239),(159),(200),(90),(286),(287),(250),(275),(198),(257),(195),(255),(265),(282),(227),(296),(272),(300),(285),(268),(267),(27),(251),(211),(201),(270),(277),(263),(279),(235),(71),(168),(154),(104),(205),(213),(138),(234),(246),(84),(238)
)
update public.program_occupation_ca_staging o
set review_status = 'approved',
    relation_type = case
      when o.canonical_career_id = 'registered-nurse' then 'related'
      when o.canonical_career_id = 'industrial-engineer' then 'related'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id = 'financial-analyst' then 'common_pathway'
      when o.canonical_career_id = 'project-manager' then 'common_pathway'
      when o.canonical_career_id = 'tourism-manager' then 'common_pathway'
      when o.canonical_career_id = 'software-developer' then 'common_pathway'
      when o.canonical_career_id = 'accountant' and lower(c.title) like '%computerized accounting%' then 'related'
      when o.canonical_career_id = 'accountant' and lower(c.title) like '%professional accounting option%' then 'common_pathway'
      when o.canonical_career_id = 'graphic-designer' and lower(c.title) like '%foundations%' then 'common_pathway'
      when o.canonical_career_id = 'multimedia-designer' then 'direct'
      when o.canonical_career_id = 'mechanical-engineer' and lower(c.credential_type) like '%bachelor of engineering%' then 'direct'
      else 'direct'
    end,
    match_basis = 'manual',
    source_checked_at = date '2026-08-08',
    reviewer_note = case
      when o.canonical_career_id = 'registered-nurse' then 'Reviewed as related post-licensure/specialty nursing education; this is not a basic registered-nurse qualifying degree.'
      when o.canonical_career_id = 'industrial-engineer' then 'Reviewed as related operations/industrial-engineering education; the certificate does not itself establish a regulated professional engineer credential.'
      when o.canonical_career_id = 'software-developer' then 'Applied Computer Science is a broad/common education pathway to software-development roles.'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'International trade, logistics and operations study is a common pathway to this occupation.'
      when o.canonical_career_id = 'mechanical-engineer' then 'BCIT Mechanical Engineering BEng is direct professional engineering preparation; current intake status is separately held by admission policy.'
      else 'Reviewed against current BCIT program title, credential scope and target occupation; international publication status is controlled separately.'
    end,
    reviewed_at = now()
from public.program_catalog_ca_staging c
join verified_ids v on v.id = c.id
where o.program_catalog_id = c.id
  and o.review_status = 'candidate'
  and c.institution_name = 'British Columbia Institute of Technology';;
