import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const migration = fs.readFileSync("supabase/migration-contracts/20260812004500_normalize_ae_tier_a_city_geographies_v1.sql", "utf8")
const scope = fs.readFileSync("docs/data-foundation/ae-city-scope-v1.md", "utf8")

const expected = ["abu-dhabi", "sharjah", "al-ain", "dubai"] as const

test("UAE City Phase 1 and Phase 2 lock exactly the top four rollout destinations", () => {
  assert.match(scope, /Cities: 4/)
  assert.match(scope, /source programmes: 102/)
  assert.match(scope, /active provider institutions: 12/)
  assert.match(migration, /publication_tier','A'/)
  assert.match(migration, /study_destination_scope','official_city_locality'/)
  assert.match(migration, /population_geography_contract','city_scope_only_no_emirate_substitution'/)
  assert.match(migration, /city_identifier_status','no_verified_federal_city_code'/)

  for (const slug of expected) assert.ok(migration.includes(`'${slug}'`), `missing ${slug}`)
})

test("UAE City Phase 2 preserves existing UUIDs and guards against deferred promotion", () => {
  for (const id of [
    "3e96ce30-2c4a-d479-0483-40ea660d332a",
    "7e6c2892-818d-e872-ec51-54e402b6b0f9",
    "df9fa6b0-51ec-4966-64e0-f3c3a20422fd",
    "c88fd374-09e4-0c70-9411-ba3e365e07ea",
  ]) assert.ok(migration.includes(id), `missing preserved UUID ${id}`)

  assert.match(migration, /alias_n<8/)
  assert.match(migration, /deferred City was promoted/)
})
