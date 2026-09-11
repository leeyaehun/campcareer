-- Canada Programs Phase 3: NAIT occupation review and current provider-page verification.
-- Evidence checked 2026-08-08 against current NAIT program pages.
-- Occupation relevance is reviewed separately from current international admission availability.

-- Normalize a small set of provider pages whose current URLs / credentials were directly verified.
update public.program_catalog_ca_staging
set official_program_url = case title
      when 'Veterinary Technology' then 'https://www.nait.ca/programs/veterinary-technology'
      when 'Civil Engineering Technology' then 'https://www.nait.ca/programs/civil-engineering-technology'
      when 'Power Engineering Technology' then 'https://www.nait.ca/programs/power-engineering-technology'
      when 'Cybersecurity Immersive Industry Education' then 'https://www.nait.ca/programs/cybersecurity-iie'
      when 'IT Systems Administration' then 'https://www.nait.ca/programs/it-systems-administration'
      when 'Network Engineering Technology' then 'https://www.nait.ca/programs/network-engineering-technology'
      else official_program_url end,
    credential_type = case title
      when 'Veterinary Technology' then 'Diploma'
      when 'Civil Engineering Technology' then 'Diploma'
      when 'Power Engineering Technology' then 'Diploma'
      when 'Cybersecurity Immersive Industry Education' then 'Post-Diploma Certificate'
      when 'IT Systems Administration' then 'Diploma'
      when 'Network Engineering Technology' then 'Diploma'
      else credential_type end,
    source_as_of='2026-08-08',
    source_status = case title
      when 'Veterinary Technology' then 'official_program_page_verified_current_international_accepting_2026_27'
      when 'Civil Engineering Technology' then 'official_program_page_verified_current_international_accepting_2026_27'
      when 'Power Engineering Technology' then 'official_program_page_verified_current_international_accepting_2026_27'
      when 'Cybersecurity Immersive Industry Education' then 'official_program_page_verified_current_not_accepting_2026_27'
      when 'IT Systems Administration' then 'official_program_page_verified_current_accepting_general_2026_27'
      when 'Network Engineering Technology' then 'official_program_page_verified_current_2026_27'
      else source_status end
where institution_name='Northern Alberta Institute of Technology'
  and title in (
    'Veterinary Technology','Civil Engineering Technology','Power Engineering Technology',
    'Cybersecurity Immersive Industry Education','IT Systems Administration','Network Engineering Technology'
  );

-- Current admission availability is only changed when the current NAIT page explicitly distinguishes it.
update public.program_pgwp_ca_staging p
set international_students_eligible=true,
    international_program_admission_status='official_program_page_currently_accepting_international_applications_2026_27',
    source_url=c.official_program_url,
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Phase 3 NAIT provider page explicitly states that the program is currently accepting international applications.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Northern Alberta Institute of Technology'
  and c.title in ('Veterinary Technology','Civil Engineering Technology','Power Engineering Technology');

update public.program_pgwp_ca_staging p
set international_program_admission_status='current_closed_program_not_accepting_applications_2026_27',
    source_url=c.official_program_url,
    source_as_of='2026-08-08',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Phase 3 NAIT provider page explicitly states that the program is not currently accepting applications.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Northern Alberta Institute of Technology'
  and c.title in ('Computer Engineering Technology','Cybersecurity Immersive Industry Education');

-- Two generalized catalogue rows duplicate stronger current provider-page rows.
update public.program_catalog_ca_staging
set source_status='legacy_duplicate_shadow_current_verified_program',
    source_as_of='2026-08-08'
where institution_name='Northern Alberta Institute of Technology'
  and title in ('Cybersecurity','Software Development')
  and official_program_url is null
  and source_status like '%generalized_stage1%';

update public.program_pgwp_ca_staging p
set international_program_admission_status='duplicate_shadow_of_current_provider_page_program',
    verified_at=now(),
    rule_notes=coalesce(p.rule_notes,'') || ' Phase 3 duplicate canonicalization: this generalized catalogue row is retained only as a legacy shadow of the stronger current provider-page row.'
from public.program_catalog_ca_staging c
where p.program_catalog_id=c.id
  and c.institution_name='Northern Alberta Institute of Technology'
  and c.source_status='legacy_duplicate_shadow_current_verified_program';

update public.program_occupation_ca_staging o
set review_status='rejected',
    relation_type=null,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note='Rejected as a legacy generalized shadow; the same NAIT program has a stronger current provider-page canonical row.'
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Northern Alberta Institute of Technology'
  and c.source_status='legacy_duplicate_shadow_current_verified_program';

-- Review all remaining NAIT candidate relationships. Current admission status remains independent.
update public.program_occupation_ca_staging o
set review_status='approved',
    relation_type=case
      when o.canonical_career_id in (
        'chemical-engineer','civil-engineer','electrical-engineer','mechanical-engineer'
      ) then 'related'
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Medical Laboratory Assisting' then 'related'
      when o.canonical_career_id in ('chef','hotel-manager','restaurant-manager','multimedia-designer') then 'common_pathway'
      else 'direct'
    end,
    source_checked_at='2026-08-08',
    reviewed_at=now(),
    reviewer_note=case
      when o.canonical_career_id in ('chemical-engineer','civil-engineer','electrical-engineer','mechanical-engineer')
        then 'NAIT engineering technology education is occupationally relevant technical preparation but does not itself confer the regulated professional engineer title.'
      when o.canonical_career_id='medical-laboratory-technician' and c.title='Medical Laboratory Assisting'
        then 'Medical Laboratory Assisting is related laboratory education but is distinct from the technologist-level pathway.'
      when o.canonical_career_id='chef'
        then 'Culinary Arts is a common pathway toward chef roles; cook-level preparation is the more direct initial occupational match.'
      when o.canonical_career_id in ('hotel-manager','restaurant-manager')
        then 'Hospitality Management is a common pathway to management roles rather than an immediate regulated or single-title qualification.'
      when o.canonical_career_id='multimedia-designer'
        then 'Digital Media and IT is a broad common pathway that can support multimedia design roles depending on specialization.'
      else 'Reviewed against NAIT program title, provider catalogue scope, and occupational level. Relationship is valid independently of current international admission availability.'
    end
from public.program_catalog_ca_staging c
where o.program_catalog_id=c.id
  and o.review_status='candidate'
  and c.institution_name='Northern Alberta Institute of Technology'
  and c.source_status <> 'legacy_duplicate_shadow_current_verified_program';;
