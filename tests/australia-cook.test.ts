import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809130929_australia_cook_profile.sql", import.meta.url), "utf8")

test("Australia Cook uses exact OSCA 322331 scope", () => {
  const career = getCanonicalCareer("cook")
  const editorial = getOccupationEditorial("cook")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /OSCA 322331 Cook is exact/i)
  assert.match(editorial.overview, /Fast Food Cooks and Kitchenhands/i)
})

test("Australia Cook keeps broader labour signals contextual", () => {
  assert.match(migration, /1055\.33333,'2026-05-01',-3\.42,5\.97,12\.54/)
  assert.match(migration, /Primary employment, demographics and earnings remain null/i)
})

test("Australia Cook has national shortage and current TRA credit", () => {
  const australia = getOccupationEditorial("cook")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /Trades Recognition Australia/i)
  assert.match(migration, /national Shortage occupation/i)
  assert.match(migration, /20,0,5,0,15,0,5,10,5,60/)
})

test("Australia Cook links direct and related training routes dynamically", () => {
  assert.match(migration, /course_code in \('109770H','109633F'\)/)
  assert.match(migration, /case when course_code='109770H' then 'direct' else 'related' end/)
})
