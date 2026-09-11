import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809131320_australia_hotel_manager_profile.sql", import.meta.url), "utf8")

test("Australia Hotel Manager uses exact OSCA 161431 scope", () => {
  const career = getCanonicalCareer("hotel-manager")
  const editorial = getOccupationEditorial("hotel-manager")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /OSCA 161431 Hotel or Motel Manager is exact/i)
})

test("Australia Hotel Manager handles broader vacancy data conservatively", () => {
  assert.match(migration, /572,'2026-05-01',-2\.39,0\.94,7\.40/)
  assert.match(migration, /vacancy intensity and trend receive zero credit/i)
})

test("Australia Hotel Manager has NS shortage and current VETASSESS credit", () => {
  const australia = getOccupationEditorial("hotel-manager")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /Group C/i)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /0,0,5,0,13,0,5,10,5,38/)
})

test("Australia Hotel Manager links two verified management routes dynamically", () => {
  assert.match(migration, /course_code='103168H'/)
  assert.match(migration, /course_code='112061M'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
})
