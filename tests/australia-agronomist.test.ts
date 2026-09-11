import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getCanonicalCareer } from "../src/data/career-comparison-catalog"
import { getOccupationEditorial } from "../src/data/occupation-editorial"

const migration = readFileSync(new URL("../supabase/migrations/20260809102450_australia_agronomist_profile.sql", import.meta.url), "utf8")

test("Australia Agronomist maps to current OSCA 244133 and ANZSCO 2022 234115", () => {
  const career = getCanonicalCareer("agronomist")
  const editorial = getOccupationEditorial("agronomist")
  assert.ok(career)
  assert.equal(career.categoryId, "environment")
  assert.ok(editorial)
  assert.match(migration, /OSCA 244133 Agronomist/)
  assert.match(migration, /'ANZSCO','2022','234115'/)
  assert.match(editorial.overview, /Research Scientist is separate/i)
})

test("Australia Agronomist preserves classification-vintage boundaries", () => {
  assert.match(migration, /anzsco_v13 field is a historical correspondence field/i)
  assert.doesNotMatch(migration, /anzsco_v13\s*=\s*'234115'/)
  assert.match(migration, /exact employment, demographics and earnings remain null/i)
})

test("Australia Agronomist scores national shortage and current migration evidence", () => {
  const australia = getOccupationEditorial("agronomist")?.countries.AU
  assert.ok(australia)
  assert.match(migration, /32\.66667,'2026-05-01',-12\.50,8\.76,17\.48,20,0,5,0,13,0,5,10,3,56/)
  assert.match(australia.scoreCaveat, /current skilled occupation instrument lists 234115/i)
})

test("Australia Agronomist links current UQ routes dynamically", () => {
  assert.match(migration, /course_code in \('0100492','079381G'\)/)
  assert.match(migration, /'au-program:'\|\|id::text/)
  assert.doesNotMatch(migration, /'au-program:1570'/)
})
