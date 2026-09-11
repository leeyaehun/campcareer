import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809130516_australia_chef_profile.sql", import.meta.url), "utf8")

test("Australia Chef uses exact OSCA 321131 scope", () => {
  const career = getCanonicalCareer("chef")
  const editorial = getOccupationEditorial("chef")
  assert.ok(career)
  assert.equal(career.categoryId, "hospitality")
  assert.ok(editorial)
  assert.match(migration, /OSCA 321131 Chef is exact/i)
  assert.match(editorial.overview, /Senior Chef roles.*161631/i)
})

test("Australia Chef keeps broader labour signals contextual", () => {
  assert.match(migration, /2708\.33333,'2026-05-01',-6\.34,5\.76,12\.47/)
  assert.match(migration, /Primary employment, demographics and earnings remain null/i)
  assert.match(migration, /Vacancy intensity and trend receive zero credit/i)
})

test("Australia Chef scores regional shortage and current TRA pathway conservatively", () => {
  const australia = getOccupationEditorial("chef")?.countries.AU
  assert.ok(australia)
  assert.match(australia.registration, /Trades Recognition Australia/i)
  assert.match(migration, /Regional shortage nationally/i)
  assert.match(migration, /15,0,5,0,15,0,5,10,5,55/)
})

test("Australia Chef links two verified direct VET routes dynamically", () => {
  assert.match(migration, /course_code='109770H'/)
  assert.match(migration, /course_code='109633F'/)
  assert.match(migration, /'au-program:'\|\|id::text/)
})
