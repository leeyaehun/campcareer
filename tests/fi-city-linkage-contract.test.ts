import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const locationMigration = fs.readFileSync(
  "supabase/migration-contracts/20260811023200_verify_fi_tier_a_study_locations_v1.sql",
  "utf8",
)
const readModelMigration = fs.readFileSync(
  "supabase/migrations/20260811023312_publish_fi_tier_a_city_read_models_v1.sql",
  "utf8",
)

test("Finland city linkage requires exact FI_OFFICIAL source-city evidence", () => {
  assert.match(readModelMigration, /po\.source_system='FI_OFFICIAL'/)
  assert.match(readModelMigration, /po\.source_record_key=s\.source_name\|\|':'\|\|s\.source_program_key/)
  assert.match(readModelMigration, /lower\(trim\(s\.city\)\)=lower\(trim\(g\.name\)\)/)
  assert.match(readModelMigration, /programme_assignment_verified/)
  assert.match(readModelMigration, /programme_n<>342/)
  assert.match(readModelMigration, /mismatch_n<>0/)
})

test("Finland city linkage keeps provider and identifier gaps explicit", () => {
  assert.match(locationMigration, /campus_inventory_complete',false/)
  assert.match(readModelMigration, /selected_university_core_full_hei_coverage_pending/)
  assert.match(readModelMigration, /provisional_name_identity_studyinfo_oid_pending/)
  assert.match(readModelMigration, /security_invoker=true/)
  assert.match(readModelMigration, /revoke all on public\.city_programme_directory_fi_v1 from public,anon,authenticated/)
})
