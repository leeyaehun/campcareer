import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const migration = fs.readFileSync("supabase/migration-contracts/20260812004800_publish_ae_tier_a_city_metrics_v1.sql", "utf8")

const keys = [
  "city_population",
  "student_living_cost_monthly_range",
  "student_transport_reference",
  "student_work_hours_week",
  "employment_focus_sectors",
] as const

test("UAE Phase 4 locks five source-aware metric families per top-four City", () => {
  assert.match(migration, /metric_n<>20/)
  assert.match(migration, /having count\(\*\)<>5/)
  for (const key of keys) assert.ok(migration.includes(`'${key}'`), `missing ${key}`)
  assert.match(migration, /city_metric_directory_ae_v1 with \(security_invoker=true\)/)
  assert.match(migration, /grant select on public\.city_metric_directory_ae_v1 to service_role/)
})

test("UAE Phase 4 never substitutes emirate population for City population", () => {
  assert.match(migration, /not_published_at_verified_city_scope/)
  assert.match(migration, /emirate_substitution_prohibited',true/)
  assert.match(migration, /must not substitute emirate population as City population/)
})

test("UAE Phase 4 preserves source-native transport, housing and permit semantics", () => {
  assert.match(migration, /'hafilat_student_permit'/)
  assert.match(migration, /'sayer_subscription_card'/)
  assert.match(migration, /'nol_student_30_day_pass'/)
  assert.match(migration, /'permit_duration_months',3/)
  assert.match(migration, /'fixed_weekly_limit_published',false/)
  assert.match(migration, /'source_low',7000,'source_high',15000/)
  assert.match(migration, /'low',2363,'high',3200/)
  assert.match(migration, /'not_shortage_ranking',true/)
})
