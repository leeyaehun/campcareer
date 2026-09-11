import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809135937_australia_logistics_coordinator_profile.sql", import.meta.url), "utf8")

test("Australia Logistics Coordinator uses exact OSCA 571131 alternative title", () => {
  const career = getCanonicalCareer("logistics-coordinator")
  const editorial = getOccupationEditorial("logistics-coordinator")
  assert.ok(career)
  assert.equal(career.categoryId, "transport")
  assert.ok(editorial)
  assert.match(editorial.overview, /571131 Logistics Officer explicitly lists Logistics Coordinator as an alternative title/i)
})

test("Australia Logistics Coordinator uses exact legacy labour and contextual vacancy data", () => {
  assert.match(migration, /25900,null,null,null,1852,14,34,42,44/)
  assert.match(migration, /939,'2026-05-01',13\.36,4\.97,10\.73/)
  assert.match(migration, /0,0,5,0,15,0,5,0,5,30/)
})

test("Australia Logistics Coordinator links verified logistics study routes", () => {
  assert.match(migration, /095526F/)
  assert.match(migration, /077513E/)
  assert.match(migration, /'direct','2026-08-09'/)
})
