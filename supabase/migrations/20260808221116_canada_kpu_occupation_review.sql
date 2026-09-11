-- Canada Programs Phase 3: Kwantlen Polytechnic University occupation review.
-- Current program URLs are normalized for nursing; international seat availability remains conservatively unverified.

update public.program_catalog_ca_staging
set official_program_url=case
      when title='Nursing' then 'https://www.kpu.ca/health/bsn'
      when title='Nursing - Advanced Entry' then 'https://www.kpu.ca/health/bsn-ae'
      else official_program_url end,
    source_as_of='2026-08-08',
    source_status=case
      when title='Nursing' then 'official_program_page_verified_bsn_rn_pathway'
      when title='Nursing - Advanced Entry' then 'official_program_page_verified_bsn_advanced_entry_rn_pathway'
      else source_status end
where institution_name='Kwantlen Polytechnic University'
  and title in ('Nursing','Nursing - Advanced Entry');

update public.program_pgwp_ca_staging p
set international_program_admission_status='official_program_page_verified_current_intake_availability_not_yet_verified',
    source_url=c.official_program_url,
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' KPU Nursing program page reviewed 2026-08-08: the BSN/BSN Advanced Entry program leads to BCCNM registration and NCLEX eligibility. Program-level current international seat availability is not established by the general Apply Online path and remains held.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Kwantlen Polytechnic University'
  and c.title in ('Nursing','Nursing - Advanced Entry');

update public.program_occupation_ca_staging o
set review_status=case
      when o.canonical_career_id='registered-nurse' and c.title='Psychiatric Nursing' then 'rejected'
      else 'approved'
    end,
    relation_type=case
      when o.canonical_career_id='registered-nurse' and c.title='Psychiatric Nursing' then null
      when o.canonical_career_id='accountant' and c.credential_type='Certificate' then 'common_pathway'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id='marketing-specialist' and c.title='Graphic Design for Marketing' then 'related'
      when o.canonical_career_id='sustainability-specialist' and c.title='Sustainable Agriculture' then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id='registered-nurse' and c.title='Psychiatric Nursing' then 'Rejected: KPU Psychiatric Nursing prepares a distinct regulated psychiatric-nursing occupation rather than Registered Nurse.'
      when o.canonical_career_id='registered-nurse' then 'Direct RN pathway: KPU BSN and BSN Advanced Entry graduates are eligible to apply for BCCNM registration and write the NCLEX.'
      when o.canonical_career_id='accountant' and c.credential_type='Certificate' then 'Accounting certificate is a foundational/common pathway rather than a complete accountant professional-education pathway.'
      when o.canonical_career_id='marketing-specialist' and c.title='Graphic Design for Marketing' then 'Graphic Design for Marketing is primarily a design degree with marketing application; relation to marketing-specialist is retained as related rather than direct.'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'Operations and Supply Chain Management is a common pathway across logistics, supply-chain analysis and warehouse-management roles.'
      else 'Reviewed 2026-08-08 against KPU program title, credential and regulated-role level; occupation relevance remains separate from current international admission status.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and c.institution_name='Kwantlen Polytechnic University'
  and o.review_status='candidate';;
