import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809132419_australia_tourism_manager_profile.sql", import.meta.url), "utf8")

test("Australia Tourism Manager uses an explicit related OSCA proxy", () => {
  const career = getCanonicalCareer("tourism-manager")
  const editorial = getOccupationEditorial("tourism-manager")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /No exact current principal OSCA title exists/i)
  assert.match(migration, /mapping_relation','related_proxy'/)
})

test("Australia Tourism Manager keeps proxy labour and broader IVI contextual", () => {
  assert.match(migration, /99,'2026-05-01',-1\.33,2\.12,9\.27/)
  assert.match(migration, /Primary employment, demographics and earnings remain null/i)
})

test("Australia Tourism Manager has NS shortage and partial proxy migration credit", () => {
  const australia = getOccupationEditorial("tourism-manager")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /partial migration credit/i)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /0,0,5,0,13,0,5,5,5,33/)
})

test("Australia Tourism Manager links tourism study routes dynamically", () => {
  assert.match(migration, /course_code='112058F'/)
  assert.match(migration, /course_code='103168H'/)
  assert.match(migration, /case when course_code='112058F' then 'direct' else 'related' end/)
})
