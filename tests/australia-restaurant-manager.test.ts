import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809131902_australia_restaurant_manager_profile.sql", import.meta.url), "utf8")

test("Australia Restaurant Manager uses exact OSCA 161231 scope", () => {
  const career = getCanonicalCareer("restaurant-manager")
  const editorial = getOccupationEditorial("restaurant-manager")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /OSCA 161231 Cafe or Restaurant Manager is exact/i)
})

test("Australia Restaurant Manager keeps broader vacancy data contextual", () => {
  assert.match(migration, /597\.66667,'2026-05-01',-7\.77,1\.75,7\.17/)
  assert.match(migration, /vacancy intensity and trend receive zero credit/i)
})

test("Australia Restaurant Manager has NS shortage and no current CSOL credit", () => {
  const australia = getOccupationEditorial("restaurant-manager")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /not on the current Core Skills Occupation List/i)
  assert.match(migration, /No Shortage nationally/i)
  assert.match(migration, /0,0,5,0,13,0,5,0,5,28/)
})

test("Australia Restaurant Manager links two current hospitality routes", () => {
  assert.match(migration, /course_code='112061M'/)
  assert.match(migration, /course_code='103168H'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
})
