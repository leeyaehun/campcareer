update ingest.visa_pathways
set is_active = true,
    updated_at = now()
where country_code = 'FI'
  and visa_name = 'Specialist residence permit';;
