import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const locations = fs.readFileSync("supabase/migration-contracts/20260812004600_verify_ae_tier_a_study_locations_v1.sql", "utf8")
const models = fs.readFileSync("supabase/migration-contracts/20260812004700_publish_ae_tier_a_city_read_models_v1.sql", "utf8")

test("UAE Phase 3 requires verified provider identity, location and accreditation provenance", () => {
  assert.match(locations, /AE_PROVIDER_OFFICIAL_TEACHING_LOCATION/)
  assert.match(locations, /campus_inventory_complete',false/)
  assert.match(locations, /programme_assignment_verified/)
  assert.match(locations, /AE_PROGRAM_STAGING/)
  assert.match(locations, /programme_accreditations pa on pa\.programme_id=pr\.id and pa\.review_status='verified' and pa\.status='approved'/)
  assert.match(models, /with \(security_invoker=true\)/)
  assert.match(models, /grant select on public\.city_programme_directory_ae_v1 to service_role/)
})

test("UAE Phase 3 publishes 98 strict City-linked programmes with exact distribution", () => {
  assert.match(models, /programme_n<>98/)
  assert.match(models, /slug='abu-dhabi'\)<>39/)
  assert.match(models, /slug='sharjah'\)<>26/)
  assert.match(models, /slug='al-ain'\)<>18/)
  assert.match(models, /slug='dubai'\)<>15/)
  assert.match(models, /lower\(trim\(s\.city\)\)=lower\(trim\(g\.name\)\)/)
})

test("UAE Phase 3 keeps ECAE programme assignment gated and Fakeeh outside City linkage", () => {
  assert.match(locations, /'emirates-college-for-advanced-education','abu-dhabi'.*false/)
  assert.match(locations, /Fakeeh Dubai location must remain unverified/)
  assert.doesNotMatch(locations, /\('fakeeh-college-medical-sciences-dubai','dubai'.*true/)
  assert.match(models, /deferred City leaked into programme directory/)
})
