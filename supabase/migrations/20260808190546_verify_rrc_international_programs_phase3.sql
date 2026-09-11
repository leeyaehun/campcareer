with current_pgwp(id, cip_code) as (
  values
    (3429,'47.0607'),(3432,'11.0205'),(3438,'30.7101'),(3441,'15.0201'),(3461,'48.0701'),(3462,'46.0201'),(3464,'15.0201'),(3469,'46.0412'),(3474,'11.1003'),(3480,'11.0801'),(3481,'11.0801'),(3482,'11.0801'),(3483,'19.0710'),(3484,'19.0709'),(3488,'15.0303'),(3490,'15.0303'),(3494,'15.0201'),(3497,'11.0204'),(3499,'50.0409'),(3503,'51.2601'),(6640,'11.1003'),(3525,'52.0203'),(3530,'15.0805'),(3536,'15.0201'),(3540,'51.3801'),(3546,'51.0805'),(3547,'46.0503'),(3558,'47.0201'),(3560,'41.0000'),(3561,'41.0000'),(3562,'41.0000'),(3563,'41.0000'),(3564,'44.0201'),(3565,'15.0201'),(3569,'52.0203'),(3572,'48.0508')
)
update public.program_pgwp_ca_staging p
set international_students_eligible=true,cip_code=v.cip_code,field_of_study_eligible=true,ircc_program_eligible=true,
    pgwp_program_status='rrc_current_international_table_pgwp_eligible_2026',
    international_program_admission_status='rrc_current_international_program_next_intake_open_2026_2027',
    source_url='https://www.rrc.ca/international/study-at-rrc/',source_as_of=date '2026-08-08',verified_at=now(),
    rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'RRC International Education current program table checked 2026-08-08: program is listed in the PGWP-eligible international section and has an open current or future intake.')
from public.program_catalog_ca_staging c join current_pgwp v on v.id=c.id
where p.program_catalog_id=c.id and c.institution_name='Red River College Polytechnic';

update public.program_catalog_ca_staging set source_status='suspended_no_new_admissions_2026',source_as_of=date '2026-08-08' where id=3498 and institution_name='Red River College Polytechnic';
update public.program_pgwp_ca_staging p
set international_students_eligible=false,cip_code='11.1004',ircc_program_eligible=true,pgwp_program_status='rrc_program_pgwp_eligible_but_suspended_2026',
    international_program_admission_status='international_suspended_no_new_admissions_2026',source_url='https://www.rrc.ca/international/study-at-rrc/',source_as_of=date '2026-08-08',verified_at=now(),
    rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'RRC official notice/current international table checked 2026-08-08: Full Stack Web Development is suspended and is not accepting new admissions.')
from public.program_catalog_ca_staging c where p.program_catalog_id=c.id and c.id=3498;

update public.program_catalog_ca_staging set source_status='legacy_renamed_to_applied_data_science_and_artificial_intelligence_2026',source_as_of=date '2026-08-08' where id=3475 and institution_name='Red River College Polytechnic';
update public.program_pgwp_ca_staging p set international_program_admission_status='legacy_program_renamed_current_offering_id_3438',source_url='https://catalogue.rrc.ca/Programs/WPG/Fulltime/DATSF-DP',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'Official RRC catalogue states this program was updated and renamed Applied Data Science and Artificial Intelligence; current offering is represented by program_catalog_id 3438.') where p.program_catalog_id=3475;
update public.program_occupation_ca_staging set review_status='rejected',relation_type=null,match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note='Rejected as a legacy duplicate shadow: the official RRC catalogue states this program was renamed to Applied Data Science and Artificial Intelligence, represented by program_catalog_id 3438.',reviewed_at=now() where program_catalog_id=3475 and review_status='candidate';

update public.program_pgwp_ca_staging p
set international_students_eligible=false,ircc_program_eligible=false,pgwp_program_status='rrc_non_pgwp_business_administration_domestic_variant_2026',international_program_admission_status='domestic_business_administration_major_international_offering_is_program_catalog_id_3525',source_url='https://www.rrc.ca/international/study-at-rrc/',source_as_of=date '2026-08-08',verified_at=now(),rule_notes=concat_ws(' ',nullif(p.rule_notes,''),'RRC current catalogue separates the domestic Business Administration logistics major from the international-only Logistics and Supply Chain Management - Business Administration offering.')
from public.program_catalog_ca_staging c where p.program_catalog_id=c.id and c.id=3455;

update public.program_catalog_ca_staging set source_status=case id when 3548 then 'legacy_replaced_by_piping_trades_2026' when 3557 then 'legacy_replaced_by_refrigeration_mechanical_trades_2026' else source_status end,source_as_of=date '2026-08-08' where id in (3548,3557);
update public.program_pgwp_ca_staging p set international_program_admission_status=case p.program_catalog_id when 3548 then 'legacy_program_replaced_by_current_program_id_3547' when 3557 then 'legacy_program_replaced_by_current_program_id_3558' else p.international_program_admission_status end,source_as_of=date '2026-08-08',verified_at=now() where p.program_catalog_id in (3548,3557);
update public.program_occupation_ca_staging set review_status='rejected',relation_type=null,match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note=case program_catalog_id when 3548 then 'Rejected as legacy program shadow: current RRC program is Piping Trades (program_catalog_id 3547).' when 3557 then 'Rejected as legacy program shadow: current RRC program is Refrigeration Mechanical Trades (program_catalog_id 3558).' else reviewer_note end,reviewed_at=now() where program_catalog_id in (3548,3557) and review_status='candidate';

insert into public.program_occupation_ca_staging (program_catalog_id,canonical_career_id,relation_type,match_basis,match_pattern,rule_version,review_status,source_checked_at,reviewer_note,reviewed_at) values
(3547,'plumber','direct','manual','(plumb|pipefitt|gas technician)','v1','approved',date '2026-08-08','Current RRC Piping Trades program provides direct foundational preparation for plumbing and piping trade pathways.',now()),
(3558,'hvac-technician','direct','manual','(hvac|heating.*refrigeration|refrigeration.*air conditioning|air conditioning|heating ventilation)','v1','approved',date '2026-08-08','Current RRC Refrigeration Mechanical Trades program provides direct preparation for refrigeration/HVAC trade pathways.',now())
on conflict (program_catalog_id,canonical_career_id) do update set relation_type=excluded.relation_type,match_basis=excluded.match_basis,match_pattern=excluded.match_pattern,rule_version=excluded.rule_version,review_status=excluded.review_status,source_checked_at=excluded.source_checked_at,reviewer_note=excluded.reviewer_note,reviewed_at=excluded.reviewed_at;

with reviewed_ids(id) as (values (3429),(3432),(3438),(3441),(3461),(3462),(3464),(3469),(3474),(3480),(3481),(3482),(3483),(3484),(3488),(3490),(3494),(3497),(3498),(3499),(3503),(6640),(3525),(3530),(3536),(3540),(3546),(3560),(3561),(3562),(3563),(3564),(3565),(3569),(3572))
update public.program_occupation_ca_staging o
set review_status='approved',relation_type=case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer') then 'related'
      when o.canonical_career_id='engineering-technician' then 'direct'
      when o.canonical_career_id='pharmacist' then 'related'
      when o.canonical_career_id='medical-laboratory-technician' then 'related'
      when o.canonical_career_id in ('logistics-coordinator','supply-chain-analyst','warehouse-manager') then 'common_pathway'
      when o.canonical_career_id='registered-nurse' then 'direct'
      when o.canonical_career_id='carpenter' and lower(c.title) like '%cabinetry%' then 'related'
      else 'direct' end,
    match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note=case
      when o.canonical_career_id in ('civil-engineer','electrical-engineer','environmental-engineer','mechanical-engineer') then 'Reviewed as related engineering-technology education; the diploma/technology credential does not itself confer a regulated professional engineer title.'
      when o.canonical_career_id='pharmacist' then 'Reviewed as related pharmacy-sector education; Pharmacy Technician does not qualify a graduate as a pharmacist.'
      when o.canonical_career_id='medical-laboratory-technician' then 'Reviewed as related general science-laboratory education; this is not a clinical medical laboratory technologist/technician qualifying program.'
      when o.canonical_career_id='registered-nurse' then 'RRC International Pathway to Nursing plus Nursing Degree is direct preparation for the registered-nurse pathway.'
      when o.canonical_career_id='carpenter' and lower(c.title) like '%cabinetry%' then 'Cabinetry and Woodworking is related woodworking education rather than a one-to-one carpentry credential.'
      else 'Reviewed against the current RRC program title, credential scope and target occupation; publication status is controlled separately.' end,
    reviewed_at=now()
from public.program_catalog_ca_staging c join reviewed_ids r on r.id=c.id where o.program_catalog_id=c.id and o.review_status='candidate';

update public.program_occupation_ca_staging o set review_status='approved',relation_type='common_pathway',match_basis='manual',source_checked_at=date '2026-08-08',reviewer_note='Business Administration logistics major is occupationally relevant; this domestic variant is held from international publication because RRC provides a separate international-only offering.',reviewed_at=now() where program_catalog_id=3455 and review_status='candidate';;
